import { User, UserResolvers } from "../generated/graphql";
import {
  ApolloError,
  ValidationError,
  IResolverObject,
} from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwt_access_token_secret, jwt_refresh_token_secret } from "../config";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isAuthorizedUserOwner } from "./auth";
import pubsub, { EVENTS } from "../subscription";

const prisma = new PrismaClient();
const saltRounds = 10;
export default {
  User: {
    messages: async (user: User) => {
      try {
        return await prisma.messages.findMany({
          where: { user_id: user.id },
        });
      } catch (e) {
        throw new ApolloError(e);
      }
    },
  },

  Query: {
    me: combineResolvers(
      isAuthenticated,
      async (_: any, args: any, { me }: any) => {
        return await prisma.users.findOne({ where: { id: me.userID } });
      }
    ) as UserResolvers,

    user: combineResolvers(isAuthenticated, async (_: any, args: any) => {
      try {
        const userInfo = await prisma.users.findOne({
          where: { id: args.id },
        });
        return (
          userInfo || new ValidationError("User with this ID does not exist.")
        );
      } catch (e) {
        throw new ApolloError(e);
      }
    }) as UserResolvers,
    users: combineResolvers(isAuthenticated, async () => {
      try {
        return await prisma.users.findMany();
      } catch (e) {
        throw new ApolloError(e);
      }
    }) as UserResolvers,
    user_online: combineResolvers(isAuthenticated, async () => {
      return await prisma.user_online.findMany();
    }) as UserResolvers,
    user_typing: combineResolvers(isAuthenticated, async () => {
      return await prisma.user_typing.findMany();
    }) as UserResolvers,
  },
  Mutation: {
    signUpUser: async (
      _: any,
      { nickname, username, password, first_name, last_name }: any
    ) => {
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const createdUser = await prisma.users.create({
          data: {
            id: uuidv4(),
            nickname: nickname,
            username: username,
            password: hashedPassword,
            first_name: first_name,
            last_name: last_name,
            created_at: new Date(),
            updated_at: new Date(),
            last_typed: new Date(),
            last_seen: new Date(),
          },
        });
        // const refreshToken = jwt.sign(
        //   {
        //     userID: createdUser.id,
        //     username: createdUser.username,
        //   },
        //   jwt_access_token_secret,
        //   {
        //     expiresIn: "7d",
        //   }
        // );
        const accessToken = jwt.sign(
          { userID: createdUser.id, username: createdUser.username },
          jwt_refresh_token_secret,
          {
            expiresIn: "20min",
          }
        );
        return { token: accessToken };
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    loginUser: async (_: any, { username, password }: any, { res }: any) => {
      try {
        const user = await prisma.users.findOne({
          where: { username: username },
        });
        if (!user) throw new ApolloError("Provided credential is not correct");
        const is_valid = await bcrypt.compare(password, user.password);
        if (!is_valid)
          throw new ApolloError("Provided credential is not correct");
        // const refreshToken = jwt.sign(
        //   {
        //     userID: user.id,
        //     username: user.username,
        //     uuid: uuidv4(),
        //   },
        //   jwt_refresh_token_secret,
        //   {
        //     expiresIn: "7d",
        //   }
        // );
        await prisma.users.update({
          data: {
            last_seen: new Date(),
          },
          where: {
            username: username,
          },
        });
        const accessToken = jwt.sign(
          { userID: user.id, username: user.username },
          jwt_access_token_secret,
          {
            expiresIn: "20min",
          }
        );
        res.cookie("access-token", accessToken, {
          maxAge: 900000000,
          httpOnly: false,
        });
        return user;
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    logoutUser: combineResolvers(
      isAuthenticated,
      async (_: any, args: any, { authToken, me }: any) => {
        try {
          await prisma.users.findOne({
            where: { id: me.userID },
          });
          await prisma.blacklist.create({
            data: {
              token: authToken,
            },
          });
          return true;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as UserResolvers,
    updateUser: combineResolvers(
      isAuthenticated,
      isAuthorizedUserOwner,
      async (
        _: any,
        { id, first_name, last_name, nickname, username, password }: any
      ) => {
        try {
          const hashedPassword = password
            ? await bcrypt.hash(password, saltRounds)
            : password;
          return await prisma.users.update({
            data: {
              first_name,
              last_name,
              nickname,
              username,
              password: hashedPassword,
              updated_at: new Date(),
            },
            where: { id: id },
          });
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as UserResolvers,
    deleteUser: combineResolvers(
      isAuthenticated,
      isAuthorizedUserOwner,
      async (_: any, { id }: any) => {
        try {
          return await prisma.users.delete({
            where: { id: id },
          });
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as UserResolvers,
    updateUserTyping: combineResolvers(
      isAuthenticated,
      async (_: any, args: any, { me }: any) => {
        try {
          const user = await prisma.users.update({
            data: { last_typed: new Date() },
            where: { id: me.userID },
          });
          console.log("username", user.username);
          console.log("me.username", me.username);
          console.log("compare", user.id == me.userID);

          // const users_typing = await prisma.user_typing.findFirst({
          //   where: {
          //     id: {
          //       not: me.userID,
          //     },
          //   },
          // });
          const users_typing = await prisma.$queryRaw<
            User
          >`SELECT * FROM user_typing where id != ${me.userID}`;
          // const result   = await prisma.$queryRaw<asset>`SELECT * FROM asset WHERE id IN (${join(ids)})`;
          // const users_typing = await prisma.user_typing.findMany({
          //   where: {
          //     id: {
          //       not: me.userID,
          //     },
          //   },
          // });
          console.log("users_typing", users_typing);
          await pubsub.publish(EVENTS.MESSAGE.USER_TYPINGS, {
            userTyping: users_typing,
          });
          return true;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as UserResolvers,
    updateUserOnline: combineResolvers(
      isAuthenticated,
      async (_: any, args: any, { me }: any) => {
        try {
          await prisma.users.update({
            data: { last_seen: new Date() },
            where: { id: me.userID },
          });
          const currentUsersLoggedIn = await prisma.user_online.findMany({
            where: {
              id: {
                not: me.userID,
              },
            },
          });
          await pubsub.publish(EVENTS.MESSAGE.USER_ONLINE, {
            userOnline: currentUsersLoggedIn,
          });
          return true;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as UserResolvers,
  },
  Subscription: {
    userOnline: {
      subscribe: () => {
        console.log("subscribe disconnect");
        return pubsub.asyncIterator(EVENTS.MESSAGE.USER_ONLINE);
      },
    },
    userTyping: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.USER_TYPINGS),
    },
  },
};
