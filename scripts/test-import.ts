/**
 * Test import API
 */
import 'dotenv/config';

async function testImport() {
    const testData = [
        {
            'title': 'Test Workshop 1',
            'address': '123 Main St',
            'phone': '555-1234',
            'rating': '4.5',
        },
        {
            'title': 'Test Workshop 2',
            'address': '456 Oak Ave',
            'phone': '555-5678',
            'rating': '5.0',
        }
    ];

    const columnMapping = {
        'name': 'title',
        'address': 'address',
        'phone': 'phone',
        'rating': 'rating',
    };

    console.log('Testing import API...\n');

    try {
        const response = await fetch('http://localhost:3000/api/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                csvData: testData,
                columnMapping: columnMapping,
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Import failed:', error);
            return;
        }

        const result = await response.json();
        console.log('✅ Import successful!');
        console.log('Job ID:', result.jobId);
        console.log('Total rows:', result.totalRows);
        console.log('Imported workshops:', result.importedWorkshops);

    } catch (error) {
        console.error('❌ Error:', (error as Error).message);
    }
}

testImport();
