'use server';

import { env } from '@/lib/env';

// Types for enrichment
export interface WorkshopInputData {
    name: string;
    category?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    website?: string;
    existingDescription?: string;
    rating?: number;
    reviewCount?: number; // Real review count from CSV
    services?: string[];
    businessHours?: Record<string, any>; // Real business hours from CSV
    attributes?: { accessibility?: string[]; payments?: string[] }; // Features
}

export interface EnrichmentResult {
    descriptionEn: string;
    descriptionEs: string;
    metaTitleEn: string;
    metaTitleEs: string;
    metaDescriptionEn: string;
    metaDescriptionEs: string;
    faqEn: Array<{ question: string; answer: string }>;
    faqEs: Array<{ question: string; answer: string }>;
    slug: string;
    slugEs: string;
}

// Gemini API response types
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

// ========== API KEY ROTATION SYSTEM ==========
// Parse API keys from environment (supports single or multiple keys)
const apiKeys: string[] = (() => {
    // Prefer GEMINI_API_KEYS (comma-separated) over single GEMINI_API_KEY
    if (env.GEMINI_API_KEYS && env.GEMINI_API_KEYS.trim().length > 0) {
        const keys = env.GEMINI_API_KEYS.split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);

        console.log(`[Gemini] Loaded ${keys.length} API keys for rotation`);
        return keys;
    }

    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
        console.log('[Gemini] Using single API key (no rotation)');
        return [env.GEMINI_API_KEY];
    }

    throw new Error('No Gemini API keys found. Set GEMINI_API_KEY or GEMINI_API_KEYS in .env');
})();

// Round-robin key selection
let currentKeyIndex = 0;

/**
 * Get next API key in rotation (round-robin)
 */
function getNextApiKey(): string {
    const key = apiKeys[currentKeyIndex];
    const keyNumber = currentKeyIndex + 1;
    const totalKeys = apiKeys.length;

    // Log key rotation (only if multiple keys)
    if (apiKeys.length > 1) {
        console.log(`[Gemini] Using API key #${keyNumber}/${totalKeys}`);
    }

    // Move to next key for next request
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    return key;
}
// ========== END API KEY ROTATION ==========

// Rate limiting configuration - 5 seconds between requests for Gemini free tier
const RATE_LIMIT_DELAY_MS = 5000; // 5 seconds between requests
let lastRequestTime = 0;

/**
 * Wait for rate limit if needed
 */
async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
        const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();
}

/**
 * Create a URL-friendly slug from text
 */
function createSlug(text: string, isSpanish: boolean = false): string {
    let slug = text
        .toLowerCase()
        .trim()
        // Remove special characters but keep spaces
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '');

    if (isSpanish) {
        slug = slug + '-taller';
    }

    return slug.substring(0, 100); // Limit length
}

/**
 * Build the prompt for Gemini AI - Enhanced for high-value content generation
 */
function buildEnrichmentPrompt(data: WorkshopInputData): string {
    const locationInfo = [data.city, data.state].filter(Boolean).join(', ');
    const hasExistingDescription = data.existingDescription && data.existingDescription.trim().length > 20;
    const categorySpecific = data.category || 'Auto Repair Service';

    // Build rating text with real data
    let ratingText = 'Highly rated by customers';
    if (data.rating && data.reviewCount) {
        ratingText = `${data.rating}/5.0 stars based on ${data.reviewCount} customer reviews`;
    } else if (data.rating) {
        ratingText = `${data.rating}/5.0 stars`;
    }

    // Build hours text from real business hours
    let hoursText = 'Regular business hours';
    if (data.businessHours) {
        const days = Object.entries(data.businessHours).map(([day, hours]: [string, any]) => {
            if (hours === 'closed') return `${day}: Closed`;
            if (hours && hours.open && hours.close) return `${day}: ${hours.open}-${hours.close}`;
            return null;
        }).filter(Boolean);
        if (days.length > 0) hoursText = days.join(', ');
    }

    // Build features text from attributes
    let featuresText = '';
    if (data.attributes) {
        const features: string[] = [];
        if (data.attributes.accessibility?.length) {
            features.push(...data.attributes.accessibility.map(a => a.replace(/_/g, ' ').replace('has ', '')));
        }
        if (data.attributes.payments?.length) {
            features.push(...data.attributes.payments.map(p => p.replace(/_/g, ' ').replace('pay ', 'accepts ')));
        }
        if (features.length > 0) featuresText = `Features: ${features.join(', ')}`;
    }

    return `You are an expert automotive content writer and SEO specialist creating premium directory listings. Your goal is to create EXCEPTIONALLY HIGH-VALUE, COMPREHENSIVE, and UNIQUE content that helps customers make informed decisions and ranks well in search engines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKSHOP INFORMATION (REAL DATA - MUST INCORPORATE NATURALLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business Name: ${data.name}
Specialization: ${categorySpecific}
Full Address: ${data.address || 'Location information will be provided'}${locationInfo ? ` (${locationInfo})` : ''}
Contact: ${data.phone || 'Contact information available on request'}
Website: ${data.website || 'Visit for more information'}

★ CUSTOMER RATING (REAL DATA - MUST MENTION PROMINENTLY): ${ratingText}
★ BUSINESS HOURS (REAL DATA - INTEGRATE NATURALLY): ${hoursText}
${featuresText ? `★ FEATURES (REAL DATA - HIGHLIGHT IN CONTENT): ${featuresText}` : ''}

Services Offered: ${data.services?.join(', ') || 'Comprehensive automotive repair and maintenance services'}
${hasExistingDescription ? `Current Description (DO NOT COPY - use only as reference for context): ${data.existingDescription}` : 'Note: No existing description - create comprehensive content from scratch'}

CRITICAL: You MUST naturally incorporate the REAL rating, review count, business hours, and features throughout your descriptions. Make them feel organic, not forced. Examples:
- "Proudly maintaining a ${data.rating || 5}-star rating from ${data.reviewCount || 'numerous'} satisfied customers..."
- "Open ${hoursText.includes('Monday') ? 'Monday through Friday' : 'during convenient hours'} to serve your automotive needs..."
- "Customers consistently praise our ${featuresText ? 'accessible facilities and flexible payment options' : 'commitment to quality service'}..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT GENERATION REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
1. **UNIQUENESS**: Every piece of content must be 100% original and unique - NO generic templates
2. **LENGTH**: Descriptions must be COMPREHENSIVE and DETAILED (600-1000 words)
3. **DEPTH**: Provide genuine value with specific details, not vague statements
4. **EMPTY FIELDS**: If any field is empty/missing, CREATE compelling, realistic content
5. **LOCAL SEO**: Naturally weave in location-specific keywords multiple times
6. **STORYTELLING**: Use engaging narrative that builds trust and credibility
7. **ACTIONABLE**: Include clear, compelling calls-to-action
8. **PROFESSIONAL**: Maintain expert tone while being approachable and customer-focused

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATE THE FOLLOWING (respond ONLY in valid JSON format):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "descriptionEn": "Write a compelling, comprehensive 5-6 paragraph description (600-1000 words total) in English that follows this EXACT structure:
  
   PARAGRAPH 1 - POWERFUL INTRODUCTION & E-E-A-T (100-150 words):
  • Start with a compelling hook that immediately addresses customer pain points.
  • Introduce ${data.name} as a premier, certified solution in ${locationInfo || 'the area'}.
  • Establish EXPERTISE: Mention their specific specialization (${categorySpecific}) and why they are local authorities.
  • REFERENCE REAL DATA: Incorporate the ${data.rating}-star rating and ${data.reviewCount} reviews as definitive social proof.
  • ENTITY SEO: Mention 2-3 major car brands they service (e.g., BMW, Ford, Toyota) to build topical relevance.
  
  PARAGRAPH 2 - CORE SERVICES & TECHNICAL AUTHORITY (150-200 words - USE SEMANTIC HEADERS):
  • Describe their primary services with technical depth.
  • Mention specific diagnostic tools or proprietary methods used.
  • Explain the 'how' behind their repairs to demonstrate 'Experience' and 'Expertise'.
  • Include latent semantic keywords related to ${categorySpecific} (e.g., OEM parts, computer diagnostics, precision alignment).
  
  PARAGRAPH 3 - CUSTOMER-CENTRIC VALUE & CONVENIENCE (120-180 words):
  • Detail the 'Trust' factor: warranties, transparent estimates, and ethical practices.
  • Mention convenient business hours (${hoursText}) and features (${featuresText || 'premium facilities'}).
  • Address common barriers to entry (e.g., waiting room, towing, financing).
  
  PARAGRAPH 4 - LOCAL IMPACT & COMMUNITY TRUST (100-150 words):
  • Connect the business to ${locationInfo || 'the community'}. 
  • Mention nearby landmarks or well-known streets naturally to anchor the business geographically for AI search engines.
  • Emphasize their role as a long-standing partner for local drivers.
  
  PARAGRAPH 5 - COMPREHENSIVE CARE & FUTURE-PROOFING (80-120 words):
  • Discuss their ability to handle modern vehicle technologies (EVs, hybrids, advanced safety systems).
  • Reiterate their commitment to staying ahead of industry trends.
  
  PARAGRAPH 6 - CONVERSION-OPTIMIZED CALL TO ACTION (50-100 words):
  • Final persuasive nudge.
  • Clear steps: Call ${data.phone || 'now'}, visit ${data.website || 'website'}, or drop by their location in ${data.city}.
  
  AI SEO & WRITING REQUIREMENTS:
  - HEADERS: Use markdown style headers (## and ###) within the text to create a semantic hierarchy.
  - ENTITIES: Identify and naturally include 5-10 related entities (brands, parts, local neighborhoods).
  - E-E-A-T: Content must sound like it was written by a certified automotive expert with years of on-the-ground experience.
  - TONE: Professional, authoritative, and helpful (designed to answer "what is the best mechanic for..." queries).
  - FLOW: Use transitional phrases that signal logical progression to AI parsers.",

  "descriptionEs": "Translate the English description to natural, fluent, professional Spanish. This is NOT a literal translation - adapt it for Spanish-speaking customers while maintaining the same comprehensive structure, depth, and quality. 
  
  REQUIREMENTS:
  - Use proper Spanish business and automotive terminology
  - Maintain all 5-6 paragraphs with the same depth and detail
  - Keep the same word count (600-1000 words)
  - Sound native and professional, not machine-translated
  - Preserve all specific details, ratings, hours, and contact information
  - Use appropriate formal 'usted' form for professional tone
  - Ensure cultural appropriateness for Spanish-speaking markets",

  "metaTitleEn": "Create a compelling SEO meta title (55-60 characters) with this EXACT format:
  [Business Name] - [Top Service] in [City/Area]
  
  Example formats based on specialization:
  • If radiator shop: '${data.name} - Expert Radiator Repair in ${data.city || 'Your Area'}'
  • If general repair: '${data.name} - Trusted Auto Repair in ${data.city || 'Town'}'
  • If specialty: '${data.name} - Professional [Specialty] in ${data.city || 'City'}'
  
  STRICT RULES:
  - EXACTLY 55-60 characters total (count carefully!)
  - Include business name exactly as given
  - Match their primary specialization
  - Include location for local SEO
  - Use power words: Expert, Trusted, Professional, Certified",

  "metaTitleEs": "Spanish version of meta title following the same rules. Natural Spanish phrasing, same character limit (55-60). Use appropriate service terms: 'Servicio de,' 'Reparación de,' 'Taller de,' etc. Must sound professional and native.",

  "metaDescriptionEn": "Create a compelling SEO meta description (150-160 characters) that drives clicks:
  
  STRUCTURE: [Unique Value Prop] + [Key Services] + [Location] + [Social Proof] + [CTA]
  
  REQUIREMENTS:
  • Start with a unique benefit or differentiator
  • Include location: ${locationInfo || data.city || 'local area'} (for SEO)
  • Mention 2-3 specific key services
  • Reference rating/reviews: ${ratingText}
  • End with strong call-to-action (Call Today, Book Now, Visit Us, etc.)
  • Use power words: Expert, Certified, Trusted, Professional, Fast, Quality, Affordable
  • Create urgency or highlight special value
  
  Example structure: 'Expert ${categorySpecific} in ${data.city || 'your area'}. ${data.rating || 5}-star rated. [Service 1], [Service 2], [Service 3]. Call today!'
  
  Must be EXACTLY 150-160 characters including spaces. Count carefully!",

  "metaDescriptionEs": "Spanish meta description following the same requirements. Natural Spanish, not literal translation. EXACTLY 150-160 characters. Must be compelling and professional with proper Spanish business terminology.",

  "faqEn": [
    {
      "question": "What are your hours of operation?",
      "answer": "Provide detailed, realistic business hours based on ${categorySpecific} type. Include specific days and times. Mention if they offer emergency services, weekend availability, or after-hours appointments. Reference seasonal variations if applicable. Suggest calling for holiday hours. Make it helpful and specific. (60-100 words)"
    },
    {
      "question": "What services do you specialize in?",
      "answer": "List 5-8 specific services related to ${categorySpecific} with brief explanations. Be detailed and professional. Include both common services (oil changes, brake repair) and specialized services unique to their expertise. Mention any manufacturer-specific certifications or specialized equipment. Explain their diagnostic capabilities. Reference their experience with different vehicle types. (80-120 words)"
    },
    {
      "question": "Do you offer warranties on your work?",
      "answer": "Explain comprehensive warranty practices for ${categorySpecific} shops. Detail parts warranties (typically manufacturer warranties) and labor warranties (shop-specific). Mention typical coverage periods. Explain what's covered and any conditions. Emphasize their commitment to quality and standing behind their work. Reference their policy on warranty claims and customer satisfaction. If specific warranty unknown, describe industry-standard best practices. (70-100 words)"
    },
    {
      "question": "Are you certified and licensed?",
      "answer": "Describe relevant certifications for ${categorySpecific}: ASE (Automotive Service Excellence) certifications, manufacturer-specific training, state licenses, EPA certifications for AC work, etc. Mention technician experience levels and ongoing education requirements. Explain what these certifications mean for customers (expertise, up-to-date knowledge, quality assurance). Reference any specialized training or advanced certifications. (80-110 words)"
    },
    {
      "question": "What makes you different from other ${categorySpecific.toLowerCase()} shops in ${data.city || 'the area'}?",
      "answer": "Highlight 4-6 unique selling points with specific details: specialized expertise in certain repairs, investment in latest diagnostic equipment, transparent pricing with detailed estimates, exceptional customer service with regular updates, convenient location and hours, family-owned vs. corporate chain benefits, community involvement, or unique specializations. Make it compelling and specific to this business. Reference their ${ratingText} as proof of quality. (90-130 words)"
    },
    {
      "question": "Do you provide free estimates or diagnostics?",
      "answer": "Explain their estimate and diagnostic policy clearly. Mention if initial consultations are free, diagnostic fee structure, whether diagnostic fees apply to repairs, and how they provide estimates (written, detailed, transparent). Discuss their commitment to no surprises and upfront pricing. Explain how they communicate costs before proceeding with work. Reference their policy on estimate accuracy and price matching if applicable. (70-100 words)"
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "List accepted payment methods: cash, all major credit cards (Visa, MasterCard, Discover, Amex), debit cards, checks, digital payments (Apple Pay, Google Pay), financing options if available. Mention if they work with insurance companies for covered repairs. Explain any special payment plans or financing for major repairs. Reference their transparent billing and detailed invoices. (60-90 words)"
    }
  ],

  "faqEs": [
    {
      "question": "Spanish translation of question 1 - natural, professional phrasing",
      "answer": "Spanish translation of answer 1 - maintain same detail level and word count (60-100 words)"
    },
    {
      "question": "Spanish translation of question 2",
      "answer": "Spanish translation of answer 2 - maintain detail (80-120 words)"
    },
    {
      "question": "Spanish translation of question 3",
      "answer": "Spanish translation of answer 3 - maintain detail (70-100 words)"
    },
    {
      "question": "Spanish translation of question 4",
      "answer": "Spanish translation of answer 4 - maintain detail (80-110 words)"
    },
    {
      "question": "Spanish translation of question 5 - use proper Spanish business terms",
      "answer": "Spanish translation of answer 5 - maintain detail (90-130 words)"
    },
    {
      "question": "Spanish translation of question 6",
      "answer": "Spanish translation of answer 6 - maintain detail (70-100 words)"
    },
    {
      "question": "Spanish translation of question 7",
      "answer": "Spanish translation of answer 7 - maintain detail (60-90 words)"
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL FINAL REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Return ONLY the JSON - NO markdown code blocks, NO explanations, NO preamble
✓ Descriptions must be 600-1000 words with 5-6 detailed paragraphs
✓ Every field must be filled with EXCEPTIONAL, HIGH-VALUE content
✓ All content must be 100% UNIQUE - absolutely no templates or generic phrases
✓ Spanish must be NATURAL and PROFESSIONAL - not literal translation
✓ Include local SEO keywords naturally throughout: ${locationInfo || data.city || 'local'}
✓ Make descriptions HIGHLY SPECIFIC to ${categorySpecific}
✓ Character limits are STRICT - count carefully before responding
✓ FAQs must be genuinely helpful with detailed answers (7 questions minimum)
✓ Naturally incorporate REAL data: ${ratingText}, ${hoursText}, ${featuresText}
✓ Create content that builds TRUST and drives CONVERSIONS
✓ Write as if you're their expert marketing consultant who knows their business intimately`;
}

/**
 * Parse Gemini response and extract content - Enhanced validation
 */
function parseGeminiResponse(response: GeminiResponse): EnrichmentResult | null {
    try {
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('No text in Gemini response');
            console.error('Full response:', JSON.stringify(response, null, 2));
            return null;
        }

        console.log('[Gemini Parser] Raw text length:', text.length);
        console.log('[Gemini Parser] Raw text preview:', text.substring(0, 200));

        // Clean the response (remove markdown code blocks if present)
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();

        const parsed = JSON.parse(cleanedText);

        console.log('[Gemini Parser] Parsed keys:', Object.keys(parsed));
        console.log('[Gemini Parser] descriptionEn length:', parsed.descriptionEn?.length);
        console.log('[Gemini Parser] descriptionEs length:', parsed.descriptionEs?.length);

        // Validate required fields with minimum quality standards for comprehensive content
        if (!parsed.descriptionEn || parsed.descriptionEn.length < 400) {
            console.error(`Description EN missing or too short: ${parsed.descriptionEn?.length || 0} chars (min 400 for quality content)`);
            return null;
        }

        if (!parsed.descriptionEs || parsed.descriptionEs.length < 400) {
            console.error(`Description ES missing or too short: ${parsed.descriptionEs?.length || 0} chars (min 400 for quality content)`);
            return null;
        }

        // Validate meta titles
        if (!parsed.metaTitleEn || parsed.metaTitleEn.length < 30 || parsed.metaTitleEn.length > 65) {
            console.warn('Meta title EN length issue:', parsed.metaTitleEn?.length);
        }

        if (!parsed.metaTitleEs || parsed.metaTitleEs.length < 30 || parsed.metaTitleEs.length > 65) {
            console.warn('Meta title ES length issue:', parsed.metaTitleEs?.length);
        }

        // Validate meta descriptions
        if (!parsed.metaDescriptionEn || parsed.metaDescriptionEn.length < 120 || parsed.metaDescriptionEn.length > 165) {
            console.warn('Meta description EN length issue:', parsed.metaDescriptionEn?.length);
        }

        // Validate FAQs - expect 7 items for comprehensive content
        const faqEn = Array.isArray(parsed.faqEn) ? parsed.faqEn : [];
        const faqEs = Array.isArray(parsed.faqEs) ? parsed.faqEs : [];

        if (faqEn.length < 5) {
            console.warn(`FAQ EN has less than 5 items (got ${faqEn.length})`);
        }

        if (faqEs.length < 5) {
            console.warn(`FAQ ES has less than 5 items (got ${faqEs.length})`);
        }

        // Validate FAQ structure
        const validateFAQ = (faq: any[]) => {
            return faq.filter(item =>
                item &&
                typeof item === 'object' &&
                item.question &&
                item.answer &&
                item.question.length > 10 &&
                item.answer.length > 20
            );
        };

        const validatedFaqEn = validateFAQ(faqEn);
        const validatedFaqEs = validateFAQ(faqEs);

        return {
            descriptionEn: parsed.descriptionEn.trim(),
            descriptionEs: parsed.descriptionEs.trim(),
            metaTitleEn: parsed.metaTitleEn?.trim() || '',
            metaTitleEs: parsed.metaTitleEs?.trim() || '',
            metaDescriptionEn: parsed.metaDescriptionEn?.trim() || '',
            metaDescriptionEs: parsed.metaDescriptionEs?.trim() || '',
            faqEn: validatedFaqEn,
            faqEs: validatedFaqEs,
            slug: '', // Will be set by caller
            slugEs: '', // Will be set by caller
        };
    } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        console.error('Raw response:', response);
        return null;
    }
}

/**
 * Call Gemini API with retry logic
 */
async function callGeminiAPI(prompt: string, maxRetries: number = 3): Promise<GeminiResponse> {
    // Get next API key in rotation (round-robin across multiple keys)
    const apiKey = getNextApiKey();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Wait for rate limit
            await waitForRateLimit();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 8192, // Increased for Gemini 2.5 Flash thinking model
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_ONLY_HIGH'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_ONLY_HIGH'
                        },
                        {
                            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            threshold: 'BLOCK_ONLY_HIGH'
                        },
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_ONLY_HIGH'
                        }
                    ]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Check for rate limit error
                if (response.status === 429) {
                    const waitTime = attempt * 10; // 10, 20, 30 seconds
                    console.log(`[Gemini] Rate limited (429). Waiting ${waitTime} seconds before retry ${attempt}...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    continue;
                }

                // Check for quota exceeded
                if (response.status === 403) {
                    console.error('[Gemini] Quota exceeded or API key invalid (403)');
                    throw new Error(`Gemini API quota exceeded or invalid key: ${response.status}`);
                }

                throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            return await response.json();

        } catch (error) {
            lastError = error as Error;
            console.error(`Gemini API attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                // Exponential backoff
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError || new Error('Gemini API call failed after all retries');
}

/**
 * Main function to enrich workshop content using Gemini AI
 */
export async function enrichWorkshopContent(data: WorkshopInputData): Promise<EnrichmentResult> {
    const prompt = buildEnrichmentPrompt(data);

    const response = await callGeminiAPI(prompt);

    if (response.error) {
        throw new Error(`Gemini API error: ${response.error.message}`);
    }

    const result = parseGeminiResponse(response);

    if (!result) {
        throw new Error('Failed to parse enrichment response from Gemini');
    }

    // Generate slugs
    result.slug = createSlug(data.name);
    result.slugEs = createSlug(data.name, true);

    return result;
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return { success: false, message: 'GEMINI_API_KEY is not configured' };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

        const data = await response.json();
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
