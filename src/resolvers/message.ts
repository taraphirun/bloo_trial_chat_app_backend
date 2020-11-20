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
import pubsub, { EVENTS } from "../subscription";

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
    messages: combineResolvers(
      isAuthenticated,
      async (_: any, { created_at }: any) => {
        try {
          const messages = await prisma.$queryRaw<Message[]>(
            `SELECT * from messages where cast(extract(epoch from created_at) as integer) <= ${created_at}`
          );
          console.log(messages);
          return messages;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as MessageResolvers,
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
          const message = await prisma.messages.create({
            data: {
              id: uuidv4(),
              content: content,
              users: {
                connect: { id: me.userID },
              },
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          await pubsub.publish(EVENTS.MESSAGE.MESSAGE_CREATED, {
            messageCreated: message,
          });
          return message;
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
          const message = await prisma.messages.update({
            data: { content: content, updated_at: new Date() },
            where: { id: id },
          });
          await pubsub.publish(EVENTS.MESSAGE.MESSAGE_UPDATED, {
            messageCreated: message,
          });
          return message;
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
          const message = await prisma.messages.delete({
            where: { id: id },
          });
          await pubsub.publish(EVENTS.MESSAGE.MESSAGE_DELETED, {
            messageCreated: message,
          });
          return message;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    ) as MessageResolvers,
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.MESSAGE_CREATED),
    },
    messageDeleted: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.MESSAGE_DELETED),
    },
    messageUpdated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.MESSAGE_UPDATED),
    },
  },
};
