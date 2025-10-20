import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

// Fallback response for testing
function getFallbackResponse(message: string) {
  const responses: { [key: string]: string } = {
    fever: `Common causes of fever in a 2-year-old child include:

**Infectious Causes:**
- Upper respiratory infections (viral)
- Otitis media (ear infection)
- Gastroenteritis
- Urinary tract infections
- Pneumonia
- Measles, chickenpox, roseola

**Non-infectious Causes:**
- Teething
- Immunizations
- Heat exhaustion
- Dehydration

**Red Flags Requiring Urgent Evaluation:**
- Fever >40°C (104°F)
- Lethargy or altered consciousness
- Petechial rash
- Difficulty breathing
- Severe headache
- Stiff neck

**Recommended Initial Assessment:**
- Vital signs including temperature
- Physical examination
- Consider urinalysis and urine culture
- Consider CBC if indicated
- Chest X-ray if respiratory symptoms present`,
    
    default: `I'm Nelson-GPT, your pediatric medical assistant. I can help you with:

- Symptom assessment and differential diagnosis
- Treatment recommendations based on Nelson Textbook of Pediatrics
- Age-appropriate dosing information
- Clinical guidelines and best practices
- Medical education on pediatric conditions

Please describe the patient's symptoms, age, and any relevant medical history for a comprehensive assessment.`,
  };

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("fever")) {
    return responses.fever;
  }
  return responses.default;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { message, sessionId, conversationId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save user message to database
    try {
      await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          type: "user",
          content: message,
          created_at: new Date().toISOString(),
        });
    } catch (dbError) {
      console.error("Database error saving user message:", dbError);
    }

    // Get fallback response
    const responseText = getFallbackResponse(message);

    // Save assistant message to database
    try {
      await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          type: "assistant",
          content: responseText,
          confidence_score: 0.85,
          created_at: new Date().toISOString(),
        });
    } catch (dbError) {
      console.error("Database error saving assistant message:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: responseText,
      sources: [],
      diagnosis: null,
      treatment: null,
      confidence: 0.85,
      reasoning: ["Query processed successfully"],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
