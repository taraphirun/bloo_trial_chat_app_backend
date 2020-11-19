import { ForbiddenError } from "apollo-server";
import { skip } from "graphql-resolvers";

export const isAuthenticated = (parent: any, args: any, { me }: any) =>
  me ? skip : new ForbiddenError("User is not logged in");
export const isAuthorizedMessageOwner = (
  parent: any,
  args: any,
  { me }: any
) => {
  return me
    ? skip
    : new ForbiddenError("User is not authorized to perform this action");
};
