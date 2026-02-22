/**
 * Test script for Gemini AI connection
 * Run with: npx tsx scripts/test-gemini.ts
 */

import 'dotenv/config'; // Load .env file

// Inline test without importing from src (to avoid Next.js dependencies)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        message: string;
        code: number;
    };
}

async function testConnection(): Promise<{ success: boolean; message: string }> {
    try {
        if (!GEMINI_API_KEY) {
            return { success: false, message: 'GEMINI_API_KEY is not configured in .env' };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Say "Hello, connection successful!" in one sentence.' }]
                }],
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return {
                success: false,
                message: `API error: ${response.status} - ${JSON.stringify(error)}`
            };
        }

        const data: GeminiResponse = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            success: true,
            message: `Connection successful! Response: ${text.substring(0, 100)}`
        };

    } catch (error) {
        return {
            success: false,
            message: `Connection failed: ${(error as Error).message}`
        };
    }
}

async function testEnrichment(): Promise<void> {
    const testWorkshop = {
        name: "Henderson's Radiator Services",
        category: 'Auto Radiator Repair Service',
        address: '112 SW M St, Grants Pass, OR 97526',
        city: 'Grants Pass',
        state: 'Oregon',
        phone: '+15414766463',
        rating: 5,
        existingDescription: 'Complete Radiator Service for AUTO, MOTORCYCLE, TRUCK, INDUSTRIAL, AGRICULTURAL.',
    };

    const prompt = `You are a content writer for an automotive repair directory. Generate unique, SEO-optimized content for this workshop listing.

WORKSHOP INFORMATION:
- Name: ${testWorkshop.name}
- Category: ${testWorkshop.category}
- Location: ${testWorkshop.address}, ${testWorkshop.city}, ${testWorkshop.state}
- Phone: ${testWorkshop.phone}
- Rating: ${testWorkshop.rating}/5

Generate a SHORT test response (2-3 sentences only) as JSON:
{
  "descriptionEn": "Brief description in English",
  "metaTitleEn": "SEO title",
  "success": true
}

Return ONLY valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log(`Enriching: ${testWorkshop.name}`);
    console.log('This may take a few seconds...\n');

    const startTime = Date.now();

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        }),
    });

    const endTime = Date.now();

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ Enrichment test successful!');
    console.log(`Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s\n`);
    console.log('--- Generated Content ---');
    console.log(text);
}

async function main() {
    console.log('🔧 Testing Gemini AI Connection...\n');

    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    console.log('------------------------');
    const connectionResult = await testConnection();
    console.log(`Status: ${connectionResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Message: ${connectionResult.message}\n`);

    if (!connectionResult.success) {
        console.log('\n❌ Cannot proceed with enrichment test - connection failed');
        console.log('\nPlease check:');
        console.log('1. GEMINI_API_KEY is set in .env file');
        console.log('2. The API key is valid (get one from https://aistudio.google.com/app/apikey)');
        process.exit(1);
    }

    // Test 2: Workshop enrichment
    console.log('Test 2: Workshop Content Enrichment');
    console.log('------------------------------------');
    try {
        await testEnrichment();
        console.log('\n✅ All tests passed!');
    } catch (error) {
        console.log('❌ Enrichment failed:', (error as Error).message);
        process.exit(1);
    }
}

main();
