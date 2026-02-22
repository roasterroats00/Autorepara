const workshopId = '9ab32f02-0ba9-442c-9f28-539b5cd22b0a';

fetch(`http://localhost:3000/api/workshops/${workshopId}/enrich`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(res => res.json())
    .then(data => {
        console.log('Success:', JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error);
    });
