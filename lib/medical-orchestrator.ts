import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import axios from "axios";

/**
 * Medical Orchestrator - Core RAG Pipeline Engine
 * Implements multi-step reasoning chains for complex pediatric diagnostics
 */

interface MedicalQuery {
  query: string;
  sessionId: string;
  ageGroup?: string;
  symptoms?: string[];
  medicalHistory?: Record<string, any>;
}

interface DiagnosticResult {
  classification: string;
  confidence: number;
  primaryDiagnosis?: string;
  differentialDiagnoses: Array<{
    diagnosis: string;
    probability: number;
    reasoning: string;
  }>;
  redFlags: string[];
  investigations: string[];
  treatment: TreatmentPlan;
  sources: Array<{
    title: string;
    page: number;
    confidence: number;
  }>;
  reasoningSteps: string[];
}

interface TreatmentPlan {
  firstLine: string;
  alternatives: string[];
  dosing: Record<string, string>;
  monitoring: string[];
  escalationCriteria: string[];
  parentalEducation: string[];
}

// Initialize Mistral LLM with medical-specific configuration
const mistralMedical = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  modelName: "mistral-large-latest",
  temperature: 0.2, // Lower temperature for medical accuracy
  maxTokens: 2048,
  topP: 0.9,
});

/**
 * Step 1: Query Classification and Routing
 */
async function classifyAndRouteQuery(query: string): Promise<{
  category: string;
  confidence: number;
  urgency: "routine" | "urgent" | "emergency";
  specialty: string;
}> {
  const classificationPrompt = PromptTemplate.fromTemplate(`
You are a medical query classifier for Nelson-GPT, a pediatric diagnostic assistant.

Analyze this query and classify it:
Query: "{query}"

Classify into ONE category:
- SYMPTOM_ASSESSMENT: Patient describing symptoms
- DIAGNOSIS_REQUEST: Asking for diagnosis
- TREATMENT_PLAN: Asking for treatment
- MEDICATION_QUERY: Questions about medications
- GUIDELINE_REFERENCE: Asking for clinical guidelines
- GENERAL_EDUCATION: General medical education

Also determine:
- Urgency: routine, urgent, or emergency
- Specialty: pediatrics, neonatology, infectious_disease, etc.

Respond in JSON format:
{
  "category": "CATEGORY_NAME",
  "confidence": 0.95,
  "urgency": "routine",
  "specialty": "pediatrics"
}
`);

  const chain = RunnableSequence.from([
    classificationPrompt,
    mistralMedical,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({ query });
  return JSON.parse(result);
}

/**
 * Step 2: Medical Context Extraction
 */
async function extractMedicalContext(query: string): Promise<{
  symptoms: string[];
  ageGroup: string;
  severity: string;
  contraindications: string[];
  relevantHistory: string[];
}> {
  const extractionPrompt = PromptTemplate.fromTemplate(`
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
`);

  const chain = RunnableSequence.from([
    extractionPrompt,
    mistralMedical,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({ query });
  return JSON.parse(result);
}

/**
 * Step 3: Vector Search for Medical Literature
 */
async function searchMedicalLiterature(
  query: string,
  context: any
): Promise<
  Array<{
    title: string;
    page: number;
    content: string;
    confidence: number;
  }>
> {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_VECTOR_SEARCH!,
      {
        query,
        context,
        limit: 5,
        threshold: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error("Vector search error:", error);
    return [];
  }
}

/**
 * Step 4: Differential Diagnosis Generation
 */
async function generateDifferentialDiagnosis(
  symptoms: string[],
  ageGroup: string,
  medicalContext: string,
  literature: any[]
): Promise<{
  primaryDiagnosis: string;
  alternatives: Array<{
    diagnosis: string;
    probability: number;
    reasoning: string;
  }>;
  redFlags: string[];
  investigations: string[];
}> {
  const diagnosisPrompt = PromptTemplate.fromTemplate(`
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
`);

  const chain = RunnableSequence.from([
    diagnosisPrompt,
    mistralMedical,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    symptoms: symptoms.join(", "),
    ageGroup,
    medicalContext,
    literature: literature.map((l) => `- ${l.title} (p.${l.page})`).join("\n"),
  });

  return JSON.parse(result);
}

/**
 * Step 5: Treatment Plan Generation
 */
async function generateTreatmentPlan(
  diagnosis: string,
  ageGroup: string,
  medicalContext: string,
  literature: any[]
): Promise<TreatmentPlan> {
  const treatmentPrompt = PromptTemplate.fromTemplate(`
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
`);

  const chain = RunnableSequence.from([
    treatmentPrompt,
    mistralMedical,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    diagnosis,
    ageGroup,
    medicalContext,
    literature: literature.map((l) => `- ${l.title} (p.${l.page})`).join("\n"),
  });

  return JSON.parse(result);
}

/**
 * Step 6: Safety Validation
 */
async function validateSafety(
  query: string,
  diagnosis: string,
  treatment: TreatmentPlan
): Promise<{
  isSafe: boolean;
  warnings: string[];
  requiresEscalation: boolean;
}> {
  const safetyPrompt = PromptTemplate.fromTemplate(`
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
`);

  const chain = RunnableSequence.from([
    safetyPrompt,
    mistralMedical,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    query,
    diagnosis,
    treatment: JSON.stringify(treatment),
  });

  return JSON.parse(result);
}

/**
 * Main Orchestration Function
 * Executes the complete RAG pipeline
 */
export async function orchestrateMedicalQuery(
  medicalQuery: MedicalQuery
): Promise<DiagnosticResult> {
  const reasoningSteps: string[] = [];

  try {
    // Step 1: Classify and route
    reasoningSteps.push("Classifying query...");
    const classification = await classifyAndRouteQuery(medicalQuery.query);

    // Step 2: Extract context
    reasoningSteps.push("Extracting medical context...");
    const context = await extractMedicalContext(medicalQuery.query);

    // Step 3: Search literature
    reasoningSteps.push("Searching medical literature...");
    const literature = await searchMedicalLiterature(
      medicalQuery.query,
      context
    );

    // Step 4: Generate differential diagnosis
    reasoningSteps.push("Generating differential diagnosis...");
    const diagnosis = await generateDifferentialDiagnosis(
      context.symptoms,
      context.ageGroup,
      JSON.stringify(context),
      literature
    );

    // Step 5: Generate treatment plan
    reasoningSteps.push("Generating treatment plan...");
    const treatment = await generateTreatmentPlan(
      diagnosis.primaryDiagnosis,
      context.ageGroup,
      JSON.stringify(context),
      literature
    );

    // Step 6: Validate safety
    reasoningSteps.push("Validating safety...");
    const safety = await validateSafety(
      medicalQuery.query,
      diagnosis.primaryDiagnosis,
      treatment
    );

    if (!safety.isSafe) {
      reasoningSteps.push(`⚠️ Safety warnings: ${safety.warnings.join(", ")}`);
    }

    return {
      classification: classification.category,
      confidence: classification.confidence,
      primaryDiagnosis: diagnosis.primaryDiagnosis,
      differentialDiagnoses: diagnosis.alternatives,
      redFlags: diagnosis.redFlags,
      investigations: diagnosis.investigations,
      treatment,
      sources: literature.map((l) => ({
        title: l.title,
        page: l.page,
        confidence: l.confidence,
      })),
      reasoningSteps,
    };
  } catch (error) {
    console.error("Orchestration error:", error);
    throw error;
  }
}

/**
 * Fallback mechanism for API failures
 */
export async function getFallbackResponse(query: string): Promise<string> {
  return `I'm currently unable to process your query due to a temporary issue. 
  
Please try again in a moment. If the issue persists, please contact support.

Your query: "${query}"`;
}
