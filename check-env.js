// Quick debug script to check environment variables
console.log('=== GEMINI API KEY CONFIGURATION ===');
console.log('GEMINI_API_KEY (single):', process.env.GEMINI_API_KEY ? `***${process.env.GEMINI_API_KEY.slice(-8)}` : 'NOT SET');
console.log('GEMINI_API_KEYS (multiple):', process.env.GEMINI_API_KEYS ? `${process.env.GEMINI_API_KEYS.split(',').length} keys found` : 'NOT SET');
console.log('===================================');
