import { gql } from "apollo-server-express";
export default gql`
  type User {
    id: ID!
    first_name: String
    last_name: String
    nickname: String!
    username: String!
    messages: [Message]
    createdAt: String!
    updatedAt: String!
  }
  extend type Query {
    me: User
    user(id: String!): User
    users: [User]
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
    loginUser(username: String!, password: String!): User!
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
  }
  extend type Subscription {
    userLoggedIn: User!
    userLoggedOut: User!
    userTyping: User!
  }
`;
