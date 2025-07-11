# PersonaCraft API Documentation

## Overview

PersonaCraft provides a comprehensive API for generating marketing personas using AI technologies. The API integrates with Qloo Taste AI and Google Gemini to create detailed, culturally-aware personas.

## Base URL

```
https://personacraft.com/api
```

## Authentication

Currently, the API doesn't require authentication for basic usage. Rate limiting is applied per IP address.

## Endpoints

### 1. Generate Persona

**POST** `/generate-persona`

Generates one or more personas based on a brief description.

#### Request Body

```json
{
  "description": "string (required, min: 10 chars)",
  "ageRange": "string (required, one of: '18-25', '25-35', '35-45', '45-55', '55-65', '65+')",
  "location": "string (optional)",
  "interests": ["string"] (required, min: 1, max: 15),
  "values": ["string"] (required, min: 1, max: 10),
  "generateMultiple": boolean (optional, default: false)
}
```

#### Response

```json
{
  "personas": [
    {
      "id": "uuid",
      "name": "string",
      "age": number,
      "location": "string",
      "bio": "string",
      "quote": "string",
      "values": ["string"],
      "interests": {
        "music": ["string"],
        "brands": ["string"],
        "movies": ["string"],
        "food": ["string"],
        "books": ["string"],
        "lifestyle": ["string"]
      },
      "communication": {
        "preferredChannels": ["string"],
        "tone": "string",
        "contentTypes": ["string"],
        "frequency": "string"
      },
      "marketing": {
        "painPoints": ["string"],
        "motivations": ["string"],
        "buyingBehavior": "string",
        "influences": ["string"]
      },
      "generatedAt": "ISO date string",
      "sources": ["string"],
      "avatar": "string (URL)"
    }
  ],
  "metadata": {
    "generated_count": number,
    "requested_count": number,
    "generation_time": "string",
    "sources_used": ["string"]
  }
}
```

### 2. Qloo Recommendations

**POST** `/qloo`

Get cultural taste recommendations from Qloo API.

#### Request Body

```json
{
  "interests": ["string"],
  "demographics": {
    "age": number,
    "location": "string"
  },
  "categories": ["music", "brands", "movies", "food", "books", "lifestyle"]
}
```

### 3. Gemini Content Generation

**POST** `/gemini`

Generate content using Google Gemini AI.

#### Request Body

```json
{
  "prompt": "string (required)",
  "context": "object (optional)",
  "parameters": {
    "temperature": number (optional, 0-2),
    "maxTokens": number (optional, 100-4000),
    "format": "json|text (optional)"
  }
}
```

### 4. Export Endpoints

#### Export to PDF

**POST** `/export/pdf`

```json
{
  "persona": "Persona object"
}
```

#### Export to CSV

**POST** `/export/csv`

```json
{
  "personas": ["Persona objects array"]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE (optional)",
  "details": "Additional details (optional)"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error
- `503` - Service Unavailable (external API issues)

## Rate Limiting

- **Requests per minute**: 60
- **Requests per hour**: 1000
- **Requests per day**: 10000

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Examples

### Generate a Single Persona

```bash
curl -X POST https://personacraft.com/api/generate-persona \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A mobile app for sustainable fashion enthusiasts",
    "ageRange": "25-35",
    "location": "Paris, France",
    "interests": ["Fashion", "Sustainability", "Technology"],
    "values": ["Authenticity", "Environmental responsibility", "Quality"],
    "generateMultiple": false
  }'
```

### Generate Multiple Personas

```bash
curl -X POST https://personacraft.com/api/generate-persona \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A fitness tracking app for busy professionals",
    "ageRange": "35-45",
    "interests": ["Fitness", "Technology", "Productivity"],
    "values": ["Health", "Efficiency", "Work-life balance"],
    "generateMultiple": true
  }'
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @personacraft/sdk
```

```typescript
import { PersonaCraft } from '@personacraft/sdk';

const client = new PersonaCraft({
  baseUrl: 'https://personacraft.com/api'
});

const personas = await client.generatePersonas({
  description: 'Your project description',
  ageRange: '25-35',
  interests: ['Technology', 'Travel'],
  values: ['Innovation', 'Adventure']
});
```

### Python

```bash
pip install personacraft-python
```

```python
from personacraft import PersonaCraft

client = PersonaCraft(base_url='https://personacraft.com/api')

personas = client.generate_personas(
    description='Your project description',
    age_range='25-35',
    interests=['Technology', 'Travel'],
    values=['Innovation', 'Adventure']
)
```

## Webhooks

PersonaCraft supports webhooks for long-running generation tasks.

### Webhook Events

- `persona.generated` - Fired when persona generation is complete
- `export.completed` - Fired when export is ready
- `error.occurred` - Fired when an error occurs

### Webhook Payload

```json
{
  "event": "persona.generated",
  "timestamp": "ISO date string",
  "data": {
    "request_id": "uuid",
    "personas": ["Persona objects"],
    "metadata": "object"
  }
}
```

## Best Practices

1. **Caching**: Cache responses when possible to reduce API calls
2. **Error Handling**: Always implement proper error handling
3. **Rate Limiting**: Respect rate limits and implement exponential backoff
4. **Validation**: Validate input data before sending requests
5. **Monitoring**: Monitor API usage and performance

## Support

For API support, please contact:
- Email: api-support@personacraft.com
- Documentation: https://docs.personacraft.com
- Status Page: https://status.personacraft.com

## Changelog

### v1.0.0 (2025-01-01)
- Initial API release
- Persona generation endpoint
- Export functionality
- Qloo and Gemini integration