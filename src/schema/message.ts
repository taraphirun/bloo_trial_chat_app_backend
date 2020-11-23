import { gql } from "apollo-server-express";
export default gql`
  type Message {
    id: ID
    content: String!
    user_id: String!
    created_at: String!
    updated_at: String!
    is_deleted: Boolean
    user: User
  }
  extend type Query {
    messages(limit: Int!, cursor: Int): [Message]
    message(id: String!): Message
  }
  extend type Mutation {
    createMessage(content: String!): Message!
    updateMessage(id: Int!, content: String!): Message!
    deleteMessage(id: Int!): Boolean!
  }
  extend type Subscription {
    messageCreated: Message!
    messageUpdated: Message!
    messageDeleted: Message!
  }
`;
