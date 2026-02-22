
import 'dotenv/config';
import { auth } from '../src/lib/auth';
import { db } from '../src/db';
import { users } from '../src/db/schema/users';
import { eq } from 'drizzle-orm';

async function main() {
    console.log("Starting create-admin script...");
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set!");
        process.exit(1);
    }
    console.log("DB URL found (length):", process.env.DATABASE_URL.length);

    console.log("Creating admin user...");
    const email = "admin@autorepara.net";
    const password = "admin1234";
    const name = "Admin User";

    // Check if user exists and DELETE them to reset everything (including password)
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
        console.log("User already exists. Deleting to ensure clean state and correct password...");
        await db.delete(users).where(eq(users.email, email));
        console.log("🗑️ Existing user deleted.");
    }

    try {
        // 1. Create the user using Better Auth API
        // Note: 'role' is set to input: false in auth.ts, so we can't pass it here.
        // It will default to 'viewer'.
        // We need to pass a mock request object if the API requires headers/context, 
        // but often the server API allows internal calls.
        // However, better-auth v1.1+ signUpEmail return structure might deny if no request context?
        // Let's attempt the call. If it fails, we might need a request context.
        console.log("Creating new user via Auth API...");
        const signUpRes = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });

        if (!signUpRes) {
            console.error("Failed to create user: No response from signUpEmail");
            return;
        }

        console.log("User created via Auth API.");

        // 2. Update the role to 'admin' directly in the database
        console.log("Updating user role to 'admin'...");

        // We need to find the user we just created.
        // signUpRes usually returns the user or session, let's assume we can fetch by email.

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            console.error("User not found in database after signup!");
            process.exit(1);
        }

        await db.update(users)
            .set({ role: 'admin' })
            .where(eq(users.id, user.id));

        console.log(`✅ Admin user created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (e: any) {
        console.error("❌ Error creating admin user:", e);
        // Log full error for debugging
        if (e.stack) console.error(e.stack);
    }

    process.exit(0);
}

main();
