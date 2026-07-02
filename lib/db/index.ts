import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const rawUrl = process.env.DATABASE_URL;
const isValidUrl = rawUrl && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"));
const connectionString = isValidUrl ? rawUrl : "postgresql://placeholder-user:placeholder-pass@localhost:5432/placeholder-db";

const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema });
export type DbType = typeof db;
