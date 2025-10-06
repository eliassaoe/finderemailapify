# Email Validator Actor

Validate email addresses instantly with professional-grade validation powered by API.

## Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emails | Array | Yes | List of email addresses to validate (one per line) |
| delayBetweenRequests | Integer | No | Delay between requests in milliseconds (default: 1000ms) |

### Example Input:

```json
{
  "emails": [
    "john.doe@example.com",
    "jane.smith@company.com",
    "info@business.org"
  ],
  "delayBetweenRequests": 1000
}
```

## Output Format

```json
{
  "email": "john.doe@example.com",
  "valid": true,
  "status": "VALID",
  "score": 98,
  "reason": "Valid email format and deliverable domain",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Example

You can integrate this Actor into your own product by adding just a few lines of code:

```javascript
const run = await client.actor('username/email-validator').call({
  "emails": [
    "john.doe@example.com",
    "jane.smith@company.com",
    "info@business.org"
  ],
  "delayBetweenRequests": 1000
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items);
```

## Features

- **Bulk Validation**: Validate multiple email addresses in one run
- **Sequential Processing**: Validates emails one by one to respect API limits
- **Configurable Delays**: Control the delay between validation requests
- **Detailed Results**: Comprehensive validation with reason codes for each email
- **Format Checking**: Validates email syntax and structure
- **Domain Verification**: Checks if the domain exists and accepts mail
- **Deliverability Check**: Verifies if the email can receive messages
- **Error Handling**: Comprehensive error handling with detailed status reporting
- **Real-time Progress**: Live updates on processing status
- **Statistics Summary**: Final report of valid, invalid, and error counts

## Configuration Options

- **Delay Between Requests**: Time to wait between each validation call (100-10000ms, default: 1000ms)
- **Batch Size**: Process multiple emails sequentially in one run

- `VALID`: Email is valid and deliverable
- `INVALID`: Email has issues (format, domain, or deliverability)
- `ERROR`: Validation failed (includes error details)

## Validation Checks

The actor performs multiple validation checks:

1. **Syntax Validation**: Checks email format against RFC standards
2. **Domain Validation**: Verifies the domain exists
3. **MX Record Check**: Confirms the domain can receive emails
4. **Disposable Email Detection**: Identifies temporary email addresses
5. **Role Account Detection**: Flags generic addresses (info@, admin@, etc.)

## Technical Details

### Processing Flow

1. Actor receives array of email addresses
2. Each email is validated **one by one** with a separate API call
3. Configurable delay between each request to respect rate limits
4. Results are saved individually as they're processed
5. Final statistics summary at the end

### Limitations

- Sequential processing (one email at a time)
- Processing time depends on number of emails and delay settings
- Timeout set to 5 minutes per run
- Recommended batch size: up to 100 emails per run

### Error Handling

The Actor handles various error cases:
- Invalid email format
- Missing required fields
- API connection errors
- Network timeouts
- Webhook failures

### API Integration

This actor integrates via webhook:
- **Endpoint**: `https://eliasse-n8n.onrender.com/webhook/7cedef2b-7921-476c-a1d9-b62adaf12522`
- **Method**: POST
- **Content-Type**: application/json
- **Timeout**: 30 seconds per request

## Output Fields

Each validated email produces a separate output record:

- `email`: The validated email address
- `valid`: Boolean indicating if email is valid
- `status`: Status code (VALID, INVALID, ERROR)
- `score`: Validation confidence score (0-100)
- `reason`: Detailed explanation of the validation result
- `timestamp`: When the validation was performed

## Use Cases

- **Lead Validation**: Clean your lead lists before outreach
- **Form Validation**: Verify emails during user registration
- **Database Cleaning**: Remove invalid emails from your database
- **Email Marketing**: Ensure high deliverability rates
- **CRM Integration**: Validate contacts before adding to your CRM

## Support

For any issues or questions:
- Create an issue in the actor repository
- Contact support

## License

This Actor is provided as-is. Usage is subject to the validation service's Terms of Service.
