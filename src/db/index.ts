import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined!');
} else {
    const masked = connectionString.replace(/:([^@]+)@/, ':****@');
    console.log(`🛢️ Connecting to database: ${masked}`);
}

// For server-side operations
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export { schema };
