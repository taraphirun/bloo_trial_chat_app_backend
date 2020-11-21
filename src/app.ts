import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { ApolloServer, ApolloError } from "apollo-server-express";
import schema from "./schema";
import resolvers from "./resolvers";
import { get_user_from_token } from "./utils/auth-helper";
import http from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

// app.use(
//   cors({
//     origin: "http://localhost:8080",
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//   })
// );
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req, res, connection }) => {
    if (req) {
      let authToken = null;
      let me = null;
      try {
        authToken = req.cookies["access-token"];
        if (authToken) {
          me = await get_user_from_token(authToken.toString());
        }
      } catch (e) {
        console.log("errrr", e);
        throw new ApolloError(e);
      }
      return { authToken, me, res };
    }
  },
  subscriptions: {
    ///==> Attempting to update online user list when socket connect or disconnect
    // onConnect: async (connectionParams, webSocket, context) => {
    //   try {
    //     console.log("connected", context.request);
    //     let me = null;
    //     if (context.request.headers.cookie) {
    //       const me = decode(
    //         context.request.headers.cookie.replace("access-token=", "")
    //       );
    //       console.log("user connected ", me);
    //     }
    //
    //     const currentUsersLoggedIn = await prisma.user_online.findMany();
    //     await pubsub.publish(EVENTS.MESSAGE.USER_ONLINE, {
    //       userOnline: currentUsersLoggedIn,
    //     });
    //   } catch (e) {
    //     console.log("onConnect error", e);
    //   }
    // },
    // onDisconnect: async (webSocket, context) => {
    //   let me = null;
    //   if (context.request.headers.cookie)
    //     if (context.request.headers.cookie) {
    //       me = decode(
    //         context.request.headers.cookie.replace("access-token=", "")
    //       );
    //     }
    //   console.log("user disconnect ", me);
    //   const currentUsersLoggedIn = await prisma.user_online.findMany();
    //   await pubsub.publish(EVENTS.MESSAGE.USER_ONLINE, {
    //     userOnline: currentUsersLoggedIn,
    //   });
    // },
  },
});
process.on("uncaughtException", (e) => {
  console.error(e);
});
server.applyMiddleware({ app, path: "/graphql", cors: false });
app.use(allowCrossDomain);
const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

export default httpServer;
