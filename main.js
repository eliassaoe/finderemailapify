import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
console.log('Input received:', input);

const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582';

try {
    console.log('Making request to webhook...');
    
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: input?.firstName || '',
            lastName: input?.lastName || '',
            domain: input?.companyWebsite || '',
            source: 'unlimited-leads'
        })
    });
    
    const data = await response.json();
    console.log('Webhook response:', data);
    
    const result = {
        firstName: input?.firstName,
        lastName: input?.lastName,
        companyWebsite: input?.companyWebsite,
        email: data.email || null,
        status: data.email ? 'FOUND' : 'NOT_FOUND',
        certainty: data.certainty || 0
    };
    
    await Actor.pushData([result]);
    console.log('Result saved:', result);
    
} catch (error) {
    console.error('Error:', error);
    
    const errorResult = {
        firstName: input?.firstName,
        lastName: input?.lastName,
        companyWebsite: input?.companyWebsite,
        status: 'ERROR',
        error: error.message
    };
    
    await Actor.pushData([errorResult]);
}

await Actor.exit();
