const { Actor } = require('apify');
const axios = require('axios');

// Helper function to delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Actor.main(async () => {
    console.log('🚀 Email Validator Starting...');
    
    // Get input
    const input = await Actor.getInput();
    
    if (!input || !input.emails || input.emails.length === 0) {
        console.log('ℹ️ No emails provided. Please provide email addresses to validate.');
        await Actor.pushData([{
            message: 'Please provide email addresses to validate',
            example: {
                emails: ['john.doe@example.com', 'jane.smith@company.com']
            }
        }]);
        return;
    }
    
    const { 
        emails,
        delayBetweenRequests = 1000
    } = input;
    
    console.log('🎯 Validation Details:');
    console.log(`📧 Total emails to validate: ${emails.length}`);
    console.log(`⏱️ Delay between requests: ${delayBetweenRequests}ms`);
    
    // Email validation webhook
    const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/7cedef2b-7921-476c-a1d9-b62adaf12522';
    
    // Statistics
    const stats = {
        total: emails.length,
        valid: 0,
        invalid: 0,
        errors: 0
    };
    
    // Process each email one by one
    for (let i = 0; i < emails.length; i++) {
        const email = emails[i].trim();
        
        console.log(`\n📧 [${i + 1}/${emails.length}] Validating: ${email}`);
        
        try {
            // Prepare payload
            const payload = {
                email: email,
                source: 'email-validator',
                timestamp: new Date().toISOString()
            };
            
            // Send validation request
            const response = await axios.post(WEBHOOK_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Email-Validator/1.0'
                },
                timeout: 30000
            });
            
            console.log('✅ Response received');
            
            const result = {
                email: email,
                ...response.data,
                timestamp: new Date().toISOString()
            };
            
            // Save result
            await Actor.pushData([result]);
            
            // Update statistics
            if (result.valid === true || result.isValid === true || result.status === 'VALID') {
                stats.valid++;
                console.log(`✅ Email is VALID: ${email}`);
                if (result.score) {
                    console.log(`📊 Validation Score: ${result.score}%`);
                }
            } else if (result.valid === false || result.isValid === false || result.status === 'INVALID') {
                stats.invalid++;
                console.log(`❌ Email is INVALID: ${email}`);
                if (result.reason) {
                    console.log(`ℹ️ Reason: ${result.reason}`);
                }
            }
            
        } catch (error) {
            stats.errors++;
            console.error(`❌ Error validating email: ${error.message}`);
            
            const errorResult = {
                email: email,
                valid: false,
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            await Actor.pushData([errorResult]);
        }
        
        // Add delay between requests (except after the last one)
        if (i < emails.length - 1) {
            console.log(`⏳ Waiting ${delayBetweenRequests}ms before next request...`);
            await delay(delayBetweenRequests);
        }
    }
    
    // Log final statistics
    console.log('\n📊 Final Statistics:');
    console.log(`✅ Valid: ${stats.valid}`);
    console.log(`❌ Invalid: ${stats.invalid}`);
    console.log(`⚠️ Errors: ${stats.errors}`);
    console.log(`📧 Total: ${stats.total}`);
    
    console.log('\n🏁 Email Validator Finished');
});
