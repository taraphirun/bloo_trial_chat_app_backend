import { gql } from "apollo-server-express";
export default gql`
  type Message {
    id: ID!
    content: String!
    user_id: String!
    created_at: String!
    updated_at: String!
    user: User
  }
  extend type Query {
    messages(created_at: String!): [Message]
    message(id: String!): Message
  }
  extend type Mutation {
    createMessage(content: String!): Message!
    updateMessage(id: ID!, content: String!): Message!
    deleteMessage(id: ID!): Message!
  }
  extend type Subscription {
    messageCreated: Message!
    messageUpdated: Message!
    messageDeleted: Message!
  }
`;
