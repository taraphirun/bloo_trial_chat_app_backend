import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { corsUrl, environment } from "./config";
import { ApolloServer, gql } from "apollo-server-express";

const app = express();
const data = {
  me: {
    username: "Robin Wieruch",
  },
};
const schema = gql`
  type Query {
    me: User
  }
  type User {
    username: String!
  }
`;
const resolvers = {
  Query: {
    me: () => {
      return {
        username: "Robin Wieruch",
      };
    },
  },
};
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});
server.applyMiddleware({ app, path: "/graphql" });
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
// Routes
// app.use("/", (req: Request, res: Response) => {
//   res.send("Hello World!");
// });
process.on("uncaughtException", (e) => {
  console.error(e);
});

export default app;
