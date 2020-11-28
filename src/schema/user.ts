import { gql } from "apollo-server-express";
export default gql`
  type User {
    id: ID!
    first_name: String
    last_name: String
    nickname: String!
    username: String!
    messages: [Message]
    created_at: String!
    updated_at: String!
  }
  extend type Query {
    me: User
    user(id: String!): User
    users: [User]
    user_online: [User]
    user_typing: [User]
  }
  type Token {
    token: String!
  }
  extend type Mutation {
    signUpUser(
      nickname: String!
      username: String!
      password: String!
      first_name: String
      last_name: String
    ): User!
    loginUser(username: String!): User!
    logoutUser: Boolean!
    updateUser(
      id: ID!
      first_name: String
      last_name: String
      nickname: String
      username: String
      password: String
    ): User!
    deleteUser(id: ID!): User!
    updateUserTyping: Boolean!
    updateUserOnline: Boolean!
  }
  extend type Subscription {
    userOnline(id: ID!): [User]
    userTyping(id: ID!): User
  }
`;
