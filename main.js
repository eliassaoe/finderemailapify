const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
    console.log('🚀 Unlimited Leads Email Finder Starting...');
    
    // Get input
    const input = await Actor.getInput();
    
    if (!input) {
        console.log('ℹ️ No input provided. Please provide firstName, lastName, and companyWebsite.');
        await Actor.pushData([{
            message: 'Please provide firstName, lastName, and companyWebsite',
            example: {
                firstName: 'John',
                lastName: 'Doe',
                companyWebsite: 'example.com'
            }
        }]);
        return;
    }
    
    const {
        firstName,
        lastName,
        companyWebsite
    } = input;
    
    console.log('🎯 Search Details:');
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`🏢 Company: ${companyWebsite}`);
    
    // Unlimited Leads email finder webhook
    const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582';
    
    try {
        console.log('🔍 Searching email with Unlimited Leads engine...');
        
        // Prepare payload
        const payload = {
            firstName: firstName || '',
            lastName: lastName || '',
            domain: companyWebsite || '',
            source: 'unlimited-leads'
        };
        
        // Send request
        const response = await axios.post(WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Unlimited-Leads-Email-Finder/1.0'
            },
            timeout: 30000
        });
        
        console.log('✅ Response received from Unlimited Leads backend');
        
        const result = {
            firstName: firstName,
            lastName: lastName,
            companyWebsite: companyWebsite,
            ...response.data,
            status: response.data.email ? 'FOUND' : 'NOT_FOUND',
            timestamp: new Date().toISOString()
        };
        
        // Save result
        await Actor.pushData([result]);
        
        if (result.status === 'FOUND') {
            console.log(`🎉 Email found: ${result.email}`);
            if (result.certainty) {
                console.log(`📊 Certainty: ${result.certainty}%`);
            }
        } else {
            console.log('❌ No email found');
        }
        
    } catch (error) {
        console.error('❌ Error finding email:', error.message);
        
        const errorResult = {
            firstName: firstName,
            lastName: lastName,
            companyWebsite: companyWebsite,
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        await Actor.pushData([errorResult]);
    }
    
    console.log('🏁 Unlimited Leads Email Finder Finished');
});
