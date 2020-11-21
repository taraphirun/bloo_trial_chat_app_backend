import { jwt_access_token_secret } from "../config";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const get_user_from_token = async (token: string) => {
  try {
    const data = await verify(token, jwt_access_token_secret);
    const isValidToken = await prisma.blacklist.findOne({
      where: { token: token },
    });
    if (isValidToken === null) return data;
    else {
      console.log("null", data);
      return null;
    }
  } catch (err) {
    console.log("get_user_from_token token error", err);
    if (err.name === "TokenExpiredError") {
      return null;
    }
  }
};
