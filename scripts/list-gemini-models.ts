/**
 * List available Gemini models
 */
import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            console.error('Error:', error);
            return;
        }

        const data = await response.json();

        console.log('\n📋 Available Gemini Models:\n');
        console.log('='.repeat(60));

        if (data.models && Array.isArray(data.models)) {
            data.models.forEach((model: any, index: number) => {
                console.log(`\n${index + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                console.log(`   Description: ${model.description?.substring(0, 80) || 'N/A'}...`);
                console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            });
        } else {
            console.log('No models found or unexpected response format');
            console.log(JSON.stringify(data, null, 2));
        }

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('Failed to list models:', error);
    }
}

listModels();
