import dotenv from "dotenv";
dotenv.config();
export const database_url = process.env.DATABASE_URL;
export const jwt_refresh_token_secret = process.env.JWT_REFRESH_TOKEN_SECRET!;
export const jwt_access_token_secret = process.env.JWT_ACCESS_TOKEN_SECRET!;
export const port = process.env.PORT;
export const corsUrl = process.env.CORS_URL;
export const environment = process.env.NODE_ENV;
