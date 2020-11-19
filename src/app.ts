import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsUrl } from "./config";
import { ApolloServer, ApolloError } from "apollo-server-express";
import schema from "./schema";
import resolvers from "./resolvers";
import { get_user_from_token } from "./utils/auth-helper";

const app = express();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req }) => {
    if (req) {
      let authToken = null;
      let me = null;
      try {
        authToken = req.headers["access-token"];
        console.log("authToken", authToken);
        if (authToken) me = await get_user_from_token(authToken.toString());
      } catch (e) {
        throw new ApolloError(e);
      }
      return { authToken, me };
    }
  },
});
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cookieParser());
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
process.on("uncaughtException", (e) => {
  console.error(e);
});
server.applyMiddleware({ app, path: "/graphql" });

export default app;
