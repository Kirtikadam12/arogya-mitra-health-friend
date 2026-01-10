import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "english" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstructions: Record<string, string> = {
      english: "Respond ONLY in English. Do not use any other language.",
      hindi: "Respond ONLY in Hindi (हिंदी). Use Devanagari script. Do not use any other language.",
      marathi: "Respond ONLY in Marathi (मराठी). Use Devanagari script. Do not use any other language.",
      tamil: "Respond ONLY in Tamil (தமிழ்). Use Tamil script. Do not use any other language.",
      telugu: "Respond ONLY in Telugu (తెలుగు). Use Telugu script. Do not use any other language.",
    };

    const systemPrompt = `You are a helpful and compassionate medical health assistant. Your role is to:
- Provide general health information and wellness advice
- Help users understand common symptoms and when to seek medical attention
- Offer guidance on healthy lifestyle choices
- Answer questions about medications, treatments, and medical procedures in general terms
- Support mental health and emotional well-being

CRITICAL LANGUAGE INSTRUCTION: ${languageInstructions[language] || languageInstructions.english}

IMPORTANT DISCLAIMERS you must follow:
- Always remind users that you are an AI assistant and cannot replace professional medical advice
- For serious symptoms or emergencies, always advise seeking immediate medical attention
- Never diagnose conditions or prescribe medications
- Encourage users to consult healthcare professionals for personalized medical advice

Keep responses clear, concise, and empathetic. Use simple language that's easy to understand.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Medical chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
