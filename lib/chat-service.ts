import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: any[];
  confidence?: number;
  created_at: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  sources: any[];
  diagnosis?: any;
  treatment?: any;
  confidence: number;
  reasoning: string[];
}

/**
 * Send message to RAG pipeline
 */
export async function sendMessage(
  message: string,
  sessionId: string,
  conversationId: string
): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Chat service error:", error);
    throw error;
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

/**
 * Create new conversation
 */
export async function createConversation(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .insert({
        user_sub: userId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: any
) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating preferences:", error);
    return null;
  }
}

/**
 * Save medical context for session
 */
export async function saveMedicalContext(
  sessionId: string,
  context: any
) {
  try {
    const { data, error } = await supabase
      .from("medical_context_summary")
      .upsert({
        session_id: sessionId,
        summary_text: context.summary,
        key_symptoms: context.symptoms || [],
        previous_diagnoses: context.diagnoses || [],
        medications_mentioned: context.medications || [],
        allergies_mentioned: context.allergies || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving medical context:", error);
    return null;
  }
}

/**
 * Get medical context for session
 */
export async function getMedicalContext(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("medical_context_summary")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (error) {
    console.error("Error fetching medical context:", error);
    return null;
  }
}
