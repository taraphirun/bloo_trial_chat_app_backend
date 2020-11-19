import { Message, MessageResolvers } from "../generated/graphql";
import {
  ApolloError,
  ValidationError,
  IResolverObject,
} from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isAuthorizedMessageOwner } from "./auth";

export default {
  Message: {
    user: async (message: Message) => {
      try {
        return await prisma.users.findOne({
          where: { id: message.user_id },
        });
      } catch (e) {
        throw new ApolloError(e);
      }
    },
  },
  Query: {
    messages: combineResolvers(isAuthenticated, async () => {
      try {
        return await prisma.messages.findMany();
      } catch (e) {
        throw new ApolloError(e);
      }
    }) as MessageResolvers,
    message: combineResolvers(isAuthenticated, async (_: any, args: any) => {
      try {
        const message = await prisma.messages.findOne({
          where: { id: args.id },
        });
        return (
          message || new ValidationError("Message with this ID does not exist.")
        );
      } catch (e) {
        throw new ApolloError(e);
      }
    }) as MessageResolvers,
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (_: any, { content }: any, { me }: any) => {
        try {
          return await prisma.messages.create({
            data: {
              id: uuidv4(),
              content: content,
              users: {
                connect: { id: me.userID },
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as MessageResolvers,
    updateMessage: (combineResolvers(
      isAuthenticated,
      isAuthorizedMessageOwner,
      async (_: any, { id, content }: any) => {
        try {
          return await prisma.messages.update({
            data: { content: content, updatedAt: new Date() },
            where: { id: id },
          });
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as unknown) as IResolverObject,
    deleteMessage: combineResolvers(
      isAuthenticated,
      isAuthorizedMessageOwner,
      async (_: any, { id }: any) => {
        try {
          return await prisma.messages.delete({
            where: { id: id },
          });
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as MessageResolvers,
  },
};
