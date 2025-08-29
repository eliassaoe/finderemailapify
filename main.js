import { Actor } from 'apify';
import axios from 'axios';

await Actor.init();

const input = await Actor.getInput();

const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582';

try {
    const response = await axios.post(WEBHOOK_URL, {
        firstName: input.firstName || '',
        lastName: input.lastName || '',
        domain: input.companyWebsite || '',
        source: 'unlimited-leads'
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 30000
    });
    
    const result = {
        firstName: input.firstName,
        lastName: input.lastName,
        companyWebsite: input.companyWebsite,
        ...response.data,
        status: response.data.email ? 'FOUND' : 'NOT_FOUND'
    };
    
    await Actor.pushData([result]);
    
} catch (error) {
    await Actor.pushData([{
        firstName: input.firstName,
        lastName: input.lastName,
        companyWebsite: input.companyWebsite,
        status: 'ERROR',
        error: error.message
    }]);
}

await Actor.exit();
