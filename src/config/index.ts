import dotenv from "dotenv";
dotenv.config();
export const database_url = process.env.DATABASE_URL;
export const jwt_secret = process.env.JWT_SECRET;
export const port = process.env.PORT;
export const corsUrl = process.env.CORS_URL;
export const environment = process.env.NODE_ENV;
