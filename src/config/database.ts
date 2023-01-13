import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export let prisma: PrismaClient;
export const redis = createClient({
  url: "redis://drivent-cache:6379"
});

export function connectDb(): void {
  prisma = new PrismaClient();
  redis.connect();
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
  await redis?.disconnect();
}
