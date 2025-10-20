import { NextRequest, NextResponse } from "next/server";
import {
  orchestrateMedicalQuery,
  getFallbackResponse,
} from "@/lib/medical-orchestrator";
import { getSupabase } from "@/lib/supabase/server";

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

    // Save user message
    const { data: userMessage } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        type: "user",
        content: message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Execute orchestrated medical query
    const startTime = Date.now();
    let diagnosticResult;

    try {
      diagnosticResult = await orchestrateMedicalQuery({
        query: message,
        sessionId,
      });
    } catch (error) {
      console.error("Orchestration failed, using fallback:", error);
      const fallbackResponse = await getFallbackResponse(message);
      
      // Save fallback response
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        type: "assistant",
        content: fallbackResponse,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: false,
        message: fallbackResponse,
        error: "Fallback response used",
      });
    }

    const latency = Date.now() - startTime;

    // Format response
    const formattedResponse = formatDiagnosticResponse(diagnosticResult);

    // Save diagnostic workflow
    const { data: workflow } = await supabase
      .from("diagnostic_workflows")
      .insert({
        session_id: sessionId,
        workflow_type: "standard",
        step_data: diagnosticResult,
        completed_steps: diagnosticResult.reasoningSteps,
        confidence_scores: {
          classification: diagnosticResult.confidence,
          diagnosis: diagnosticResult.differentialDiagnoses[0]?.probability || 0,
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Save assistant message
    const { data: assistantMessage } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        type: "assistant",
        content: formattedResponse,
        sources: diagnosticResult.sources,
        confidence_score: diagnosticResult.confidence,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Save query record
    await supabase.from("queries").insert({
      session_id: sessionId,
      user_question: message,
      answer: formattedResponse,
      confidence: diagnosticResult.confidence,
      model: "mistral-large-latest",
      latency_ms: latency,
      diagnostic_stage: diagnosticResult.classification,
      reasoning_steps: diagnosticResult.reasoningSteps,
      differential_diagnoses: diagnosticResult.differentialDiagnoses,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: formattedResponse,
      diagnostic: {
        primaryDiagnosis: diagnosticResult.primaryDiagnosis,
        differentialDiagnoses: diagnosticResult.differentialDiagnoses,
        redFlags: diagnosticResult.redFlags,
        investigations: diagnosticResult.investigations,
      },
      treatment: diagnosticResult.treatment,
      sources: diagnosticResult.sources,
      confidence: diagnosticResult.confidence,
      reasoning: diagnosticResult.reasoningSteps,
      latency: latency,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}

/**
 * Format diagnostic result into markdown
 */
function formatDiagnosticResponse(diagnostic: any): string {
  let markdown = "";

  // Header
  markdown += `## Clinical Analysis\n\n`;
  markdown += `**Query Classification:** ${diagnostic.classification}\n`;
  markdown += `**Confidence Level:** ${(diagnostic.confidence * 100).toFixed(1)}%\n\n`;

  // Differential Diagnosis
  if (diagnostic.primaryDiagnosis) {
    markdown += `## Differential Diagnosis\n\n`;
    markdown += `### Primary Diagnosis\n`;
    markdown += `**${diagnostic.primaryDiagnosis}**\n\n`;

    if (diagnostic.differentialDiagnoses.length > 0) {
      markdown += `### Alternative Diagnoses\n`;
      diagnostic.differentialDiagnoses.forEach(
        (alt: any, idx: number) => {
          markdown += `${idx + 1}. **${alt.diagnosis}** (${(alt.probability * 100).toFixed(1)}%)\n`;
          markdown += `   - ${alt.reasoning}\n`;
        }
      );
      markdown += "\n";
    }
  }

  // Red Flags
  if (diagnostic.redFlags && diagnostic.redFlags.length > 0) {
    markdown += `## ⚠️ Red Flags\n\n`;
    diagnostic.redFlags.forEach((flag: string) => {
      markdown += `- **${flag}**\n`;
    });
    markdown += "\n";
  }

  // Investigations
  if (diagnostic.investigations && diagnostic.investigations.length > 0) {
    markdown += `## Recommended Investigations\n\n`;
    diagnostic.investigations.forEach((inv: string) => {
      markdown += `- ${inv}\n`;
    });
    markdown += "\n";
  }

  // Treatment Plan
  if (diagnostic.treatment) {
    markdown += `## Treatment Plan\n\n`;

    if (diagnostic.treatment.firstLine) {
      markdown += `### First-Line Treatment\n`;
      markdown += `${diagnostic.treatment.firstLine}\n\n`;
    }

    if (diagnostic.treatment.dosing && Object.keys(diagnostic.treatment.dosing).length > 0) {
      markdown += `### Dosing\n`;
      Object.entries(diagnostic.treatment.dosing).forEach(([med, dose]) => {
        markdown += `- **${med}:** ${dose}\n`;
      });
      markdown += "\n";
    }

    if (diagnostic.treatment.alternatives && diagnostic.treatment.alternatives.length > 0) {
      markdown += `### Alternative Treatments\n`;
      diagnostic.treatment.alternatives.forEach((alt: string) => {
        markdown += `- ${alt}\n`;
      });
      markdown += "\n";
    }

    if (diagnostic.treatment.monitoring && diagnostic.treatment.monitoring.length > 0) {
      markdown += `### Monitoring Parameters\n`;
      diagnostic.treatment.monitoring.forEach((param: string) => {
        markdown += `- ${param}\n`;
      });
      markdown += "\n";
    }

    if (diagnostic.treatment.escalationCriteria && diagnostic.treatment.escalationCriteria.length > 0) {
      markdown += `### When to Escalate Care\n`;
      diagnostic.treatment.escalationCriteria.forEach((criterion: string) => {
        markdown += `- ${criterion}\n`;
      });
      markdown += "\n";
    }

    if (diagnostic.treatment.parentalEducation && diagnostic.treatment.parentalEducation.length > 0) {
      markdown += `### Parental Education\n`;
      diagnostic.treatment.parentalEducation.forEach((point: string) => {
        markdown += `- ${point}\n`;
      });
      markdown += "\n";
    }
  }

  // Sources
  if (diagnostic.sources && diagnostic.sources.length > 0) {
    markdown += `## 📚 Medical Sources\n\n`;
    diagnostic.sources.forEach((source: any, idx: number) => {
      markdown += `${idx + 1}. **${source.title}** - Page ${source.page}\n`;
      markdown += `   Confidence: ${(source.confidence * 100).toFixed(1)}%\n`;
    });
  }

  return markdown;
}
