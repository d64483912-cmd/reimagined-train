# Nelson-GPT: Production-Ready RAG Pipeline Architecture

## Overview

Nelson-GPT implements a sophisticated Retrieval-Augmented Generation (RAG) pipeline for pediatric medical diagnostics, powered by LangChain, Mistral AI, and Supabase.

## Architecture Components

### 1. Core Orchestration Engine (`lib/medical-orchestrator.ts`)

The orchestrator implements a 6-step reasoning chain for complex pediatric diagnostics:

#### Step 1: Query Classification & Routing
- **Function:** `classifyAndRouteQuery()`
- **Purpose:** Categorizes incoming queries into diagnostic categories
- **Categories:**
  - SYMPTOM_ASSESSMENT
  - DIAGNOSIS_REQUEST
  - TREATMENT_PLAN
  - MEDICATION_QUERY
  - GUIDELINE_REFERENCE
  - GENERAL_EDUCATION
- **Output:** Category, confidence score, urgency level, medical specialty

#### Step 2: Medical Context Extraction
- **Function:** `extractMedicalContext()`
- **Purpose:** Extracts structured medical information from queries
- **Extracts:**
  - Symptoms mentioned
  - Age group (newborn, infant, toddler, preschool, school-age, adolescent)
  - Severity level (mild, moderate, severe)
  - Contraindications
  - Relevant medical history

#### Step 3: Vector Search for Medical Literature
- **Function:** `searchMedicalLiterature()`
- **Purpose:** Retrieves relevant medical chunks from Supabase vector database
- **Data Source:** Nelson Textbook of Pediatrics (godzilla_medical_dataset)
- **Search Parameters:**
  - Query embedding similarity
  - Confidence threshold: 0.7
  - Limit: 5 results
- **Returns:** Ranked medical references with page numbers and confidence scores

#### Step 4: Differential Diagnosis Generation
- **Function:** `generateDifferentialDiagnosis()`
- **Purpose:** Generates evidence-based differential diagnoses
- **Outputs:**
  - Primary diagnosis
  - Alternative diagnoses (ranked by probability)
  - Red flags requiring immediate attention
  - Recommended investigations

#### Step 5: Treatment Plan Generation
- **Function:** `generateTreatmentPlan()`
- **Purpose:** Creates comprehensive, age-appropriate treatment plans
- **Includes:**
  - First-line treatment with dosing
  - Alternative treatments
  - Monitoring parameters
  - Escalation criteria
  - Parental education points

#### Step 6: Safety Validation
- **Function:** `validateSafety()`
- **Purpose:** Validates medical safety of recommendations
- **Checks:**
  - Contraindications
  - Drug interactions
  - Age-appropriateness
  - Dosing accuracy
  - Missing safety considerations

### 2. RAG Pipeline (`lib/rag-pipeline.ts`)

Implements the core RAG functionality with fallback mechanisms:

- **Query Classification:** Routes queries to appropriate workflows
- **Vector Search:** Retrieves medical context from Supabase
- **Context Management:** Maintains conversation context across turns
- **Differential Diagnosis:** Generates diagnosis options
- **Treatment Recommendations:** Creates treatment plans
- **Database Persistence:** Saves all queries and responses

### 3. Chat Service (`lib/chat-service.ts`)

Frontend-facing service for chat operations:

```typescript
// Send message to RAG pipeline
sendMessage(message, sessionId, conversationId)

// Get conversation history
getConversationHistory(conversationId)

// Create new conversation
createConversation(userId)

// Manage user preferences
getUserPreferences(userId)
updateUserPreferences(userId, preferences)

// Medical context management
saveMedicalContext(sessionId, context)
getMedicalContext(sessionId)
```

### 4. API Routes

#### `/api/chat` - Basic Chat Endpoint
- Processes user messages
- Executes RAG pipeline
- Saves to database
- Returns formatted response

#### `/api/chat/orchestrated` - Advanced Orchestrated Endpoint
- Uses full medical orchestrator
- Implements 6-step reasoning chain
- Provides detailed diagnostic information
- Includes treatment plans and safety validation

## Data Flow

```
User Query
    ↓
[Classification & Routing]
    ↓
[Medical Context Extraction]
    ↓
[Vector Search] → Supabase Medical Database
    ↓
[Differential Diagnosis Generation]
    ↓
[Treatment Plan Generation]
    ↓
[Safety Validation]
    ↓
[Response Formatting]
    ↓
[Database Persistence]
    ↓
User Response
```

## Supabase Integration

### Tables Used

1. **messages** - Conversation history
2. **queries** - Query records with metadata
3. **diagnostic_workflows** - Workflow execution tracking
4. **medical_context_summary** - Session context
5. **user_sessions** - User session management
6. **user_preferences** - User settings
7. **godzilla_medical_dataset** - Medical literature embeddings
8. **medical_chunks** - Chunked medical content
9. **safety_alerts** - Safety warnings

### Edge Functions Called

- `medical-orchestrator` - Main orchestration
- `medical-vector-search` - Vector similarity search
- `medical-context-manager` - Context management
- `differential-diagnosis-generator` - Diagnosis generation
- `enhanced-medical-orchestrator` - Advanced orchestration

## Mistral AI Integration

### Model Configuration

```typescript
const mistralMedical = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  modelName: "mistral-large-latest",
  temperature: 0.2,        // Low for medical accuracy
  maxTokens: 2048,
  topP: 0.9,
});
```

### Prompting Strategy

- **Medical-Specific Prompts:** Tailored for pediatric diagnostics
- **Structured Output:** JSON responses for programmatic processing
- **Context Preservation:** Maintains medical history across turns
- **Fallback Mechanism:** Graceful degradation on API failures

## Error Handling & Fallbacks

### Fallback Mechanism

If orchestration fails:
1. Log error details
2. Return fallback response
3. Notify user of temporary issue
4. Suggest retry

```typescript
export async function getFallbackResponse(query: string): Promise<string> {
  return `I'm currently unable to process your query due to a temporary issue. 
  
Please try again in a moment. If the issue persists, please contact support.

Your query: "${query}"`;
}
```

## Security & Privacy

### API Key Management
- Supabase keys stored in environment variables
- Mistral API key secured
- Service role key for backend operations only

### Data Protection
- All queries logged with session IDs
- Medical context encrypted in transit
- User preferences isolated per user
- Audit logs for compliance

## Performance Optimization

### Caching Strategy
- Vector search results cached
- Medical context cached per session
- User preferences cached client-side

### Latency Tracking
- All queries tracked for latency
- Average response time: ~2-3 seconds
- Timeout: 30 seconds per request

## Monitoring & Analytics

### Tracked Metrics
- Query classification accuracy
- Diagnosis confidence scores
- Treatment plan generation time
- Safety validation results
- User engagement metrics

### Logging
- All queries logged to `queries` table
- Diagnostic workflows tracked
- Safety alerts recorded
- Error logs for debugging

## Deployment

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://bnjthwrpigvchbhsmfec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MISTRAL_API_KEY=...
DATABASE_URL=postgresql://...
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy with one click
5. Monitor logs in Vercel dashboard

## Testing

### Unit Tests
- Query classification accuracy
- Context extraction
- Response formatting

### Integration Tests
- End-to-end chat flow
- Database persistence
- API endpoint responses

### Load Testing
- Concurrent user handling
- Vector search performance
- API rate limiting

## Future Enhancements

1. **Multi-Language Support:** Translate responses to local languages
2. **Real-Time Collaboration:** Multiple users per session
3. **Advanced Analytics:** ML-based query optimization
4. **Custom Models:** Fine-tuned models for specific specialties
5. **Mobile Optimization:** Native mobile app
6. **Voice Input:** Speech-to-text integration
7. **Citation Management:** Automated citation generation
8. **Evidence Grading:** Automatic evidence level assignment

## Support & Maintenance

### Regular Updates
- Update medical literature quarterly
- Refresh embeddings monthly
- Monitor API performance daily

### Troubleshooting
- Check Supabase connection
- Verify Mistral API key
- Review error logs
- Test vector search functionality

## References

- LangChain Documentation: https://js.langchain.com/
- Mistral AI API: https://docs.mistral.ai/
- Supabase Documentation: https://supabase.com/docs
- Nelson Textbook of Pediatrics: https://www.elsevier.com/products/nelson-textbook-of-pediatrics
