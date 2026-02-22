export const env = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL!,

    // Supabase
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,

    // AI - Support for multiple API keys (comma-separated) or single key
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_API_KEYS: process.env.GEMINI_API_KEYS || '',

    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Helpers
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};
