// src/shared/config/prisma.client.ts
import { PrismaClient } from '@prisma/client';

class PrismaSingleton {
    private static instance: PrismaClient;
    public static getInstance(): PrismaClient {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient({ log: ['error', 'warn'] });
        }
        return PrismaSingleton.instance;
    }
}
export const prisma = PrismaSingleton.getInstance();