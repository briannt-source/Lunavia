import { PrismaNotificationRepo } from './prismaNotificationRepo';
import { InMemoryNotificationRepo } from './inMemoryNotificationRepo';

// This selector allows switching between persistence layers via an environment variable.
// Default is in-memory to prevent breaking changes.
export const notificationRepo = process.env.USE_DB === 'true' ? PrismaNotificationRepo : InMemoryNotificationRepo;
