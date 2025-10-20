import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Initialize Supabase client
let supabase: any;
function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Initialize Mistral LLM
let mistral: any;
function getMistralClient() {
  if (!mistral) {
    mistral = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: "mistral-large-latest",
      temperature: 0.3,
      maxTokens: 2048,
    });
  }
  return mistral;
}

/**
 * Medical Query Classification
 * Routes queries to appropriate diagnostic workflows
 */
export async function classifyMedicalQuery(query: string) {
  const classificationPrompt = PromptTemplate.fromTemplate(`
You are a medical query classifier for a pediatric diagnostic system.
Analyze the following query and classify it into one of these categories:
- SYMPTOM_ASSESSMENT: Patient describing symptoms
- DIAGNOSIS_REQUEST: Asking for diagnosis
- TREATMENT_PLAN: Asking for treatment options
- MEDICATION_QUERY: Questions about medications
- GUIDELINE_REFERENCE: Asking for clinical guidelines
- GENERAL_EDUCATION: General medical education

Query: {query}

Respond with ONLY the category name and a confidence score (0-1).
Format: CATEGORY|confidence_score
`);

  const chain = RunnableSequence.from([
    classificationPrompt,
    getMistralClient(),
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({ query });
  const [category, confidence] = result.split("|");

  return {
    category: category.trim(),
    confidence: parseFloat(confidence.trim()),
    timestamp: new Date(),
  };
}

/**
 * Vector Search for Medical Context
 * Retrieves relevant medical chunks from Supabase
 */
export async function vectorSearchMedicalContext(
  query: string,
  limit: number = 5
) {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_VECTOR_SEARCH!,
      {
        query,
        limit,
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
 * Medical Context Manager
 * Maintains conversation context and medical history
 */
export async function manageMedicalContext(
  sessionId: string,
  newQuery: string,
  medicalHistory: Record<string, any>
) {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_CONTEXT_MANAGER!,
      {
        sessionId,
        newQuery,
        medicalHistory,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Context management error:", error);
    return null;
  }
}

/**
 * Differential Diagnosis Generator
 * Generates differential diagnoses based on symptoms
 */
export async function generateDifferentialDiagnosis(
  symptoms: string[],
  ageGroup: string,
  medicalContext: string
) {
  const diagnosisPrompt = PromptTemplate.fromTemplate(`
You are an expert pediatric diagnostician using the Nelson Textbook of Pediatrics.

Patient Age Group: {ageGroup}
Symptoms: {symptoms}
Medical Context: {medicalContext}

Generate a differential diagnosis list with:
1. Most likely diagnosis
2. Alternative diagnoses (ranked by probability)
3. Red flags to watch for
4. Recommended investigations
5. Initial management approach

Format as structured JSON with confidence scores for each diagnosis.
`);

  const chain = RunnableSequence.from([
    diagnosisPrompt,
    getMistralClient(),
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    symptoms: symptoms.join(", "),
    ageGroup,
    medicalContext,
  });

  return JSON.parse(result);
}

/**
 * Treatment Recommendation Engine
 * Generates evidence-based treatment plans
 */
export async function generateTreatmentPlan(
  diagnosis: string,
  ageGroup: string,
  medicalContext: string,
  contraindications: string[] = []
) {
  const treatmentPrompt = PromptTemplate.fromTemplate(`
You are a pediatric treatment specialist using Nelson Textbook of Pediatrics.

Diagnosis: {diagnosis}
Age Group: {ageGroup}
Patient Context: {medicalContext}
Contraindications: {contraindications}

Generate a comprehensive treatment plan including:
1. First-line treatment options with dosing
2. Alternative treatments
3. Monitoring parameters
4. Expected outcomes
5. When to escalate care
6. Patient/parent education points

Ensure all recommendations are age-appropriate and evidence-based.
Format as structured JSON.
`);

  const chain = RunnableSequence.from([
    treatmentPrompt,
    getMistralClient(),
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    diagnosis,
    ageGroup,
    medicalContext,
    contraindications: contraindications.join(", "),
  });

  return JSON.parse(result);
}

/**
 * Multi-Step Reasoning Chain
 * Implements complex diagnostic reasoning
 */
export async function executeReasoningChain(
  query: string,
  sessionId: string
) {
  // Step 1: Classify query
  const classification = await classifyMedicalQuery(query);

  // Step 2: Retrieve medical context
  const medicalContext = await vectorSearchMedicalContext(query);

  // Step 3: Manage session context
  const sessionContext = await manageMedicalContext(
    sessionId,
    query,
    { classification, medicalContext }
  );

  // Step 4: Generate differential diagnosis if applicable
  let diagnosis = null;
  if (
    classification.category === "SYMPTOM_ASSESSMENT" ||
    classification.category === "DIAGNOSIS_REQUEST"
  ) {
    const symptoms = extractSymptoms(query);
    const ageGroup = extractAgeGroup(query);
    diagnosis = await generateDifferentialDiagnosis(
      symptoms,
      ageGroup,
      JSON.stringify(medicalContext)
    );
  }

  // Step 5: Generate treatment plan if diagnosis available
  let treatment = null;
  if (diagnosis) {
    treatment = await generateTreatmentPlan(
      diagnosis.primary_diagnosis,
      extractAgeGroup(query),
      JSON.stringify(sessionContext),
      extractContraindications(query)
    );
  }

  return {
    classification,
    medicalContext,
    diagnosis,
    treatment,
    reasoning_steps: [
      "Query classified",
      "Medical context retrieved",
      "Session context managed",
      diagnosis ? "Differential diagnosis generated" : "N/A",
      treatment ? "Treatment plan generated" : "N/A",
    ],
  };
}

/**
 * Helper: Extract symptoms from query
 */
function extractSymptoms(query: string): string[] {
  const symptomKeywords = [
    "fever",
    "cough",
    "rash",
    "diarrhea",
    "vomiting",
    "headache",
    "pain",
    "difficulty breathing",
    "lethargy",
    "seizure",
  ];

  return symptomKeywords.filter((symptom) =>
    query.toLowerCase().includes(symptom)
  );
}

/**
 * Helper: Extract age group from query
 */
function extractAgeGroup(query: string): string {
  if (query.match(/newborn|0-1 month|infant/i)) return "0-1 months";
  if (query.match(/1-6 month|infant/i)) return "1-6 months";
  if (query.match(/6-12 month|infant/i)) return "6-12 months";
  if (query.match(/1-2 year|toddler/i)) return "1-2 years";
  if (query.match(/2-5 year|preschool/i)) return "2-5 years";
  if (query.match(/5-12 year|school/i)) return "5-12 years";
  if (query.match(/adolescent|12-18 year|teen/i)) return "12-18 years";
  return "general";
}

/**
 * Helper: Extract contraindications from query
 */
function extractContraindications(query: string): string[] {
  const contraindications: string[] = [];
  if (query.match(/allerg/i)) contraindications.push("allergy");
  if (query.match(/asthma/i)) contraindications.push("asthma");
  if (query.match(/kidney|renal/i)) contraindications.push("renal impairment");
  if (query.match(/liver|hepatic/i)) contraindications.push("hepatic impairment");
  return contraindications;
}

/**
 * Save query and response to database
 */
export async function saveQueryToDatabase(
  sessionId: string,
  query: string,
  response: any,
  classification: any
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("queries").insert({
      session_id: sessionId,
      user_question: query,
      answer: JSON.stringify(response),
      confidence: classification.confidence,
      model: "mistral-large-latest",
      diagnostic_stage: classification.category,
      reasoning_steps: response.reasoning_steps,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Database save error:", error);
    return null;
  }
}
