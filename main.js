// main.js - Unlimited Leads Email Finder Actor
import { Actor } from 'apify';
import axios from 'axios';

// Initialize the actor
await Actor.init();

// Get input from the actor
const input = await Actor.getInput();
console.log('Input:', input);

// Validate input
if (!input || !input.people || !Array.isArray(input.people)) {
    throw new Error('Input must contain a "people" array');
}

const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582';

// Function to parse a single person entry
function parsePerson(personString) {
    // Support multiple formats: CSV, TSV, semicolon-separated
    let parts;
    if (personString.includes('\t')) {
        parts = personString.split('\t');
    } else if (personString.includes(';')) {
        parts = personString.split(';');
    } else {
        parts = personString.split(',');
    }
    
    // Clean up parts (trim whitespace)
    parts = parts.map(part => part.trim());
    
    // Handle different formats
    if (parts.length >= 3) {
        return {
            firstName: parts[0] || '',
            lastName: parts[1] || '',
            domain: parts[2] || ''
        };
    } else if (parts.length === 2) {
        // Assume it's name and domain
        const nameParts = parts[0].split(' ');
        return {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            domain: parts[1] || ''
        };
    }
    
    throw new Error(`Invalid person format: ${personString}`);
}

// Function to make API call to webhook
async function findEmail(person) {
    try {
        console.log(`Searching email for: ${person.firstName} ${person.lastName} at ${person.domain}`);
        
        const response = await axios.post(WEBHOOK_URL, {
            firstName: person.firstName,
            lastName: person.lastName,
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

// Process all people
const results = [];
const batchSize = 10; // Process in batches to avoid overwhelming the webhook
const delay = 1000; // 1 second delay between requests

console.log(`Processing ${input.people.length} entries in batches of ${batchSize}`);

for (let i = 0; i < input.people.length; i += batchSize) {
    const batch = input.people.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(input.people.length / batchSize)}`);
    
    // Parse people in current batch
    const parsedBatch = [];
    for (const personString of batch) {
        try {
            const person = parsePerson(personString);
            
            // Validate required fields
            if (!person.domain) {
                throw new Error('Domain is required');
            }
            if (!person.firstName && !person.lastName) {
                throw new Error('At least firstName or lastName must be provided');
            }
            
            parsedBatch.push(person);
        } catch (error) {
            console.error(`Error parsing person "${personString}":`, error.message);
            results.push({
                originalInput: personString,
                status: 'ERROR',
                error: `Parse error: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Process parsed batch
    const batchPromises = parsedBatch.map(async (person, index) => {
        // Add delay to avoid rate limiting
        if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return findEmail(person);
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Save intermediate results
    await Actor.pushData(batchResults);
    
    console.log(`Batch completed. Total processed: ${results.length}/${input.people.length}`);
}

// Final statistics
const stats = {
    total: results.length,
    found: results.filter(r => r.status === 'FOUND').length,
    notFound: results.filter(r => r.status === 'NOT_FOUND').length,
    errors: results.filter(r => r.status === 'ERROR').length
};

console.log('Final Statistics:', stats);

// Save final statistics
await Actor.pushData([{
    type: 'STATISTICS',
    ...stats,
    timestamp: new Date().toISOString()
}]);

// Finish the actor
await Actor.exit();
