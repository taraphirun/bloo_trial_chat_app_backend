import { ForbiddenError } from "apollo-server";
import { skip } from "graphql-resolvers";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const isAuthenticated = (parent: any, { id }: any, { me }: any) => {
  return me ? skip : new ForbiddenError("User is not logged in");
};

export const isAuthorizedMessageOwner = async (
  parent: any,
  { id }: any,
  { me }: any
) => {
  const message = await prisma.messages.findOne({ where: { id: id } });
  let isOwner = false;
  if (message && message.user_id === me.userID) isOwner = true;
  return isOwner
    ? skip
    : new ForbiddenError(
        "Users are not allowed to modify other users' messages."
      );
};
export const isAuthorizedUserOwner = async (
  parent: any,
  { id }: any,
  { me }: any
) => {
  const user = await prisma.users.findOne({ where: { id: id } });
  let isOwner = false;
  if (user && user.id === me.userID) isOwner = true;
  return isOwner
    ? skip
    : new ForbiddenError(
        "Users are not allow to modify another users' profile."
      );
};
