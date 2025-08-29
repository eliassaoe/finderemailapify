# Unlimited Leads Email Finder Actor

Find professional email addresses in bulk powered by Unlimited Leads API.

## Input Parameters

The input should be a list of people with the following format per line:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | String | No* | First name of the person |
| lastName | String | No* | Last name of the person |
| domain | String | Yes | Company domain |

*At least firstName OR lastName must be provided

### Accepted formats:
- CSV (comma-separated)
- TSV (tab-separated)  
- Semicolon-separated

You can copy and paste your .csv or .xlsx files in the bulk edit.

### Example Input:
```
John,Doe,example.com
Jane,Smith,google.com
Pierre,Dupont,microsoft.com
```

## Output Format

```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "domain": "example.com",
  "email": "john.doe@example.com",
  "status": "FOUND",
  "certainty": 95,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Example

You can integrate this Actor into your own product by adding just a few lines of code:

```javascript
const run = await client.actor('username/unlimited-leads-email-finder').call({
  "people": [
    "John,Doe,example.com",
    "Pierre,Dupont,google.com", 
    "Marie,Bernard,microsoft.com"
  ]
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items);
```

## Features

- **Bulk Processing**: Handle up to 5,000 email searches per batch
- **Multiple Formats**: Support for CSV, TSV, and semicolon-separated data
- **Rate Limiting**: Built-in delays to respect API limits
- **Error Handling**: Comprehensive error handling with detailed status reporting
- **Batch Processing**: Processes requests in configurable batches
- **Real-time Progress**: Live updates on processing status

## Response Status

- `FOUND`: Email found with certainty score
- `NOT_FOUND`: No email found for the given parameters
- `ERROR`: Search failed (includes error details)

## Configuration Options

- **Batch Size**: Number of requests to process in parallel (1-50, default: 10)
- **Request Delay**: Delay between API requests in milliseconds (100-10000ms, default: 1000ms)

## Technical Details

### Limitations
- Maximum 5,000 searches per batch
- Processing time varies based on batch size and API response time
- Timeout set to 1 hour per run

### Error Handling
The Actor handles various error cases:
- Invalid input format
- Missing required fields
- API connection errors
- Rate limit exceeded
- Network timeouts
- Webhook failures

### API Integration
This actor integrates with Unlimited Leads via webhook:
- **Endpoint**: `https://eliasse-n8n.onrender.com/webhook/5025b111-5648-4eac-b813-a78f9662b582`
- **Method**: POST
- **Content-Type**: application/json
- **Timeout**: 30 seconds per request

## Output Statistics

The actor provides comprehensive statistics:
- Total entries processed
- Successfully found emails
- Not found entries  
- Errors encountered

## Support

For any issues or questions:
- Create an issue in the actor repository
- Contact Unlimited Leads support

## License

This Actor is provided by Unlimited Leads. Usage is subject to Unlimited Leads' Terms of Service.
