// main.js - Unlimited Leads Email Finder Actor
import { Actor } from 'apify';
import axios from 'axios';

// Initialize the actor
await Actor.init();

// Get input from the actor
const input = await Actor.getInput();
console.log('Input:', input);

// Validate input
if (!input || (!input.firstName && !input.lastName) || !input.domain) {
    console.log('Missing required information. Please provide at least first name or last name, and company website.');
    await Actor.pushData([{
        type: 'INFO',
        message: 'Please provide at least first name or last name, and company website domain',
        example: {
            firstName: 'John',
            lastName: 'Doe', 
            domain: 'example.com'
        },
        timestamp: new Date().toISOString()
    }]);
    await Actor.exit();
}

const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582';

// Function to make API call to webhook
async function findEmail(person) {
    try {
        console.log(`Searching email for: ${person.firstName} ${person.lastName} at ${person.domain}`);
        
        const response = await axios.post(WEBHOOK_URL, {
            firstName: person.firstName || '',
            lastName: person.lastName || '',
            domain: person.domain,
            source: 'unlimited-leads'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Unlimited-Leads-Email-Finder/1.0'
            },
            timeout: 30000 // 30 second timeout
        });
        
        // Return the response data with original input
        return {
            ...person,
            ...response.data,
            status: response.data.email ? 'FOUND' : 'NOT_FOUND',
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`Error finding email for ${person.firstName} ${person.lastName}:`, error.message);
        
        return {
            ...person,
            email: null,
            status: 'ERROR',
            error: error.message,
            certainty: 0,
            timestamp: new Date().toISOString()
        };
    }
}

// Clean and prepare input
const person = {
    firstName: input.firstName?.trim() || '',
    lastName: input.lastName?.trim() || '',
    domain: input.domain?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '') || ''
};

console.log(`Processing email search for: ${person.firstName} ${person.lastName} at ${person.domain}`);

// Find the email
const result = await findEmail(person);

// Save result
await Actor.pushData([result]);

// Log result
if (result.status === 'FOUND') {
    console.log(`✅ Email found: ${result.email} (Certainty: ${result.certainty || 'N/A'})`);
} else if (result.status === 'NOT_FOUND') {
    console.log(`❌ No email found for ${person.firstName} ${person.lastName} at ${person.domain}`);
} else {
    console.log(`⚠️ Error occurred: ${result.error}`);
}

// Finish the actor
await Actor.exit();
