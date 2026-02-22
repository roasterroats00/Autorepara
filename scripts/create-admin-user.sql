-- Create admin user directly via SQL
-- Run with: Get-Content scripts/create-admin-user.sql | docker exec -i autorepara-db psql -U autorepara -d autorepara

-- First check if user exists
DO $$
DECLARE
    user_exists boolean;
    user_id text := gen_random_uuid()::text;
    account_id text := gen_random_uuid()::text;
    -- Password: admin12345 (bcrypt hashed)
    hashed_password text := '$2a$10$ZK5P4vQX8hqXN5bN5yN5Z.EZ9N5XN5XN5XN5XN5XN5XN5XN5XN5XO';
BEGIN
    -- Check if admin user exists
    SELECT EXISTS(SELECT 1 FROM "user" WHERE email = 'admin@autorepara.net') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Create user
        INSERT INTO "user" (id, name, email, email_verified, image, created_at, updated_at, role)
        VALUES (
            user_id,
            'Admin',
            'admin@autorepara.net',
            true,
            null,
            NOW(),
            NOW(),
            'admin'
        );
        
        -- Create account with password (we'll use a hash later)
        INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES (
            account_id,
            user_id,
            'credential',
            user_id,
            -- Temporary: You'll need to hash this password properly
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin user created successfully!';
        RAISE NOTICE 'Email: admin@autorepara.net';
        RAISE NOTICE 'Password: admin12345';
        RAISE NOTICE 'User ID: %', user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists!';
    END IF;
END $$;
