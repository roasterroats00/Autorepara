/**
 * Test single workshop enrichment
 */
import 'dotenv/config';

async function testSingleEnrichment() {
    const jobId = '6f48cbbc-297f-44a2-b928-6fe72c5c5e26'; // From latest import

    try {
        console.log(`\nTesting enrichment for job: ${jobId}\n`);

        // Process one workshop
        const response = await fetch(`http://localhost:3000/api/import/enrich/${jobId}/process-next`, {
            method: 'POST',
        });

        const result = await response.json();

        console.log('=== Enrichment Test Result ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('==============================\n');

        if (!result.success) {
            console.error('\n❌ Error:', result.error);
            if (result.errorDetails) {
                console.error('Details:', result.errorDetails);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', (error as Error).message);
    }
}

testSingleEnrichment();
