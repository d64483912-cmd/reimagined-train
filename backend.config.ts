/**
 * Backend Configuration for Nelson-GPT RAG Pipeline
 * Production-ready settings for medical AI system
 */

export const RAG_CONFIG = {
  // Mistral AI Configuration
  mistral: {
    modelName: "mistral-large-latest",
    temperature: 0.2, // Low temperature for medical accuracy
    maxTokens: 2048,
    topP: 0.9,
    timeout: 30000, // 30 seconds
  },

  // Vector Search Configuration
  vectorSearch: {
    threshold: 0.7, // Confidence threshold
    limit: 5, // Number of results
    timeout: 10000,
  },

  // Query Classification
  classification: {
    categories: [
      "SYMPTOM_ASSESSMENT",
      "DIAGNOSIS_REQUEST",
      "TREATMENT_PLAN",
      "MEDICATION_QUERY",
      "GUIDELINE_REFERENCE",
      "GENERAL_EDUCATION",
    ],
    urgencyLevels: ["routine", "urgent", "emergency"],
    specialties: [
      "pediatrics",
      "neonatology",
      "infectious_disease",
      "cardiology",
      "neurology",
      "gastroenterology",
      "pulmonology",
      "nephrology",
      "endocrinology",
      "hematology",
    ],
  },

  // Age Groups
  ageGroups: {
    "0-1 months": "newborn",
    "1-6 months": "infant",
    "6-12 months": "infant",
    "1-2 years": "toddler",
    "2-5 years": "preschool",
    "5-12 years": "school-age",
    "12-18 years": "adolescent",
  },

  // Severity Levels
  severityLevels: ["mild", "moderate", "severe"],

  // Database Configuration
  database: {
    maxConnections: 20,
    timeout: 5000,
    retries: 3,
  },

  // API Rate Limiting
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstLimit: 10,
  },

  // Caching Configuration
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 1000, // Max cached items
  },

  // Logging Configuration
  logging: {
    level: "info", // debug, info, warn, error
    format: "json",
    destination: "console", // console, file, cloud
  },

  // Safety Configuration
  safety: {
    enableSafetyValidation: true,
    enableDrugInteractionCheck: true,
    enableContraindicationCheck: true,
    enableAgeAppropriatenessCheck: true,
  },

  // Fallback Configuration
  fallback: {
    enabled: true,
    timeout: 5000,
    retryAttempts: 2,
  },

  // Monitoring Configuration
  monitoring: {
    enableMetrics: true,
    enableTracing: true,
    enableErrorReporting: true,
    metricsInterval: 60000, // 1 minute
  },
};

/**
 * Prompt Templates for Medical Queries
 */
export const PROMPT_TEMPLATES = {
  classification: `
You are a medical query classifier for Nelson-GPT, a pediatric diagnostic assistant.
Analyze the following query and classify it into one of these categories:
- SYMPTOM_ASSESSMENT: Patient describing symptoms
- DIAGNOSIS_REQUEST: Asking for diagnosis
- TREATMENT_PLAN: Asking for treatment options
- MEDICATION_QUERY: Questions about medications
- GUIDELINE_REFERENCE: Asking for clinical guidelines
- GENERAL_EDUCATION: General medical education

Query: "{query}"

Respond with ONLY the category name and a confidence score (0-1).
Format: CATEGORY|confidence_score
`,

  contextExtraction: `
Extract medical information from this query:
Query: "{query}"

Extract:
1. Symptoms mentioned
2. Age group (newborn, infant, toddler, preschool, school-age, adolescent)
3. Severity (mild, moderate, severe)
4. Any contraindications mentioned
5. Relevant medical history

Respond in JSON format:
{
  "symptoms": ["symptom1", "symptom2"],
  "ageGroup": "age_group",
  "severity": "mild|moderate|severe",
  "contraindications": ["contraindication1"],
  "relevantHistory": ["history1"]
}
`,

  diagnosis: `
You are an expert pediatric diagnostician using Nelson Textbook of Pediatrics.

Patient Information:
- Age Group: {ageGroup}
- Symptoms: {symptoms}
- Medical Context: {medicalContext}

Medical Literature References:
{literature}

Generate a differential diagnosis with:
1. Most likely diagnosis (primary)
2. Alternative diagnoses ranked by probability
3. Red flags requiring immediate attention
4. Recommended investigations

Respond in JSON format:
{
  "primaryDiagnosis": "diagnosis_name",
  "alternatives": [
    {
      "diagnosis": "name",
      "probability": 0.85,
      "reasoning": "why this is likely"
    }
  ],
  "redFlags": ["flag1", "flag2"],
  "investigations": ["test1", "test2"]
}
`,

  treatment: `
You are a pediatric treatment specialist using Nelson Textbook of Pediatrics.

Diagnosis: {diagnosis}
Age Group: {ageGroup}
Patient Context: {medicalContext}

Medical Literature References:
{literature}

Generate a comprehensive treatment plan:
1. First-line treatment with age-appropriate dosing
2. Alternative treatments
3. Monitoring parameters
4. Escalation criteria
5. Parental education points

Respond in JSON format:
{
  "firstLine": "treatment description with dosing",
  "alternatives": ["alt1", "alt2"],
  "dosing": {
    "medication": "dose per kg or age-based"
  },
  "monitoring": ["parameter1", "parameter2"],
  "escalationCriteria": ["criterion1"],
  "parentalEducation": ["point1"]
}
`,

  safety: `
Validate the safety of this medical response:

Query: {query}
Diagnosis: {diagnosis}
Treatment: {treatment}

Check for:
1. Contraindications
2. Drug interactions
3. Age-appropriateness
4. Dosing errors
5. Missing safety considerations

Respond in JSON format:
{
  "isSafe": true,
  "warnings": ["warning1"],
  "requiresEscalation": false
}
`,
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  QUERY_CLASSIFICATION_FAILED: "Failed to classify query",
  CONTEXT_EXTRACTION_FAILED: "Failed to extract medical context",
  VECTOR_SEARCH_FAILED: "Failed to search medical literature",
  DIAGNOSIS_GENERATION_FAILED: "Failed to generate differential diagnosis",
  TREATMENT_GENERATION_FAILED: "Failed to generate treatment plan",
  SAFETY_VALIDATION_FAILED: "Failed to validate safety",
  DATABASE_ERROR: "Database operation failed",
  API_ERROR: "API request failed",
  TIMEOUT_ERROR: "Request timeout",
  INVALID_INPUT: "Invalid input provided",
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  QUERY_PROCESSED: "Query processed successfully",
  DIAGNOSIS_GENERATED: "Differential diagnosis generated",
  TREATMENT_GENERATED: "Treatment plan generated",
  SAFETY_VALIDATED: "Safety validation passed",
};

/**
 * Utility Functions
 */
export function getAgeGroupCategory(ageString: string): string {
  const lowerAge = ageString.toLowerCase();
  for (const [key, value] of Object.entries(RAG_CONFIG.ageGroups)) {
    if (lowerAge.includes(key) || lowerAge.includes(value)) {
      return value;
    }
  }
  return "general";
}

export function getSeverityLevel(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("severe") || lower.includes("critical")) return "severe";
  if (lower.includes("moderate")) return "moderate";
  return "mild";
}

export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function isUrgent(urgencyLevel: string): boolean {
  return urgencyLevel === "urgent" || urgencyLevel === "emergency";
}
