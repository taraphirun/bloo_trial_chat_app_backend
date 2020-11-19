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
            createdAt: new Date(),
            updatedAt: new Date(),
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
        if (!user) return {} as User;
        const is_valid = await bcrypt.compare(password, user.password);
        if (!is_valid) return {} as User;
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
        const accessToken = jwt.sign(
          { userID: user.id, username: user.username },
          jwt_access_token_secret,
          {
            expiresIn: "20min",
          }
        );
        res.cookie("access-token", accessToken, {
          maxAge: 1000 * 60 * 15,
          httpOnly: false,
        });
        await pubsub.publish(EVENTS.MESSAGE.USER_LOGGED_IN, {
          userLoggedIn: user,
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
          const user = prisma.users.findOne({
            where: { id: me.userID },
          });
          await prisma.blacklist.create({
            data: {
              token: authToken,
            },
          });
          await pubsub.publish(EVENTS.MESSAGE.USER_LOGGED_OUT, {
            userLoggedOut: user,
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
              updatedAt: new Date(),
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
  },
  Subscription: {
    userLoggedIn: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.USER_LOGGED_IN),
    },
    userLoggedOut: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.USER_LOGGED_OUT),
    },
  },
};
