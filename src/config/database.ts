import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export let prisma: PrismaClient;
export const redis = createClient({
  url: process.env.REDIS_URL
});

export function connectDb(): void {
  prisma = new PrismaClient();
  redis.connect();
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
  await redis?.disconnect();
}
