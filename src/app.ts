import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsUrl } from "./config";
import { ApolloServer, ApolloError } from "apollo-server-express";
import schema from "./schema";
import resolvers from "./resolvers";
import { get_user_from_token } from "./utils/auth-helper";
import { visitInParallel } from "graphql";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cookieParser());
const allowCrossDomain: express.RequestHandler = (req, res, next) => {
  // @ts-ignore
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  // }
  res.header("Access-Control-Allow-Headers", "Content-Type,Access-Token");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};
app.use(allowCrossDomain);
// app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req, res }) => {
    if (req) {
      let authToken = null;
      let me = null;
      try {
        authToken = req.cookies["access-token"];
        if (authToken) me = await get_user_from_token(authToken.toString());
      } catch (e) {
        throw new ApolloError(e);
      }
      return { authToken, me, res };
    }
  },
});
process.on("uncaughtException", (e) => {
  console.error(e);
});
server.applyMiddleware({ app, path: "/graphql" });

export default app;
