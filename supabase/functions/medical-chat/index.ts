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

    const systemPrompt = `You are a helpful and compassionate medical health assistant with advanced image analysis capabilities specializing in disease detection and treatment recommendations. Your role is to:
- Analyze medical images (skin conditions, wounds, rashes, X-rays, scans, etc.) to identify potential diseases or health conditions
- Provide detailed information about the identified condition including:
  * Disease/condition name
  * Symptoms and characteristics visible in the image
  * Possible causes
  * Treatment options and cures
  * Home remedies and self-care tips (when appropriate)
  * When to seek professional medical help
- Help users understand their health concerns and provide actionable treatment advice
- Offer guidance on medications, treatments, and medical procedures
- Support users with clear, empathetic, and helpful medical information

When analyzing images with potential diseases:
1. **Disease Identification:**
   - Carefully examine all visible symptoms, abnormalities, or conditions in the image
   - Describe what you observe (color, texture, shape, size, location, pattern, etc.)
   - Identify potential diseases or conditions that match the visual appearance
   - List possible conditions if multiple matches are possible
   - Explain the characteristics that suggest each condition

2. **Detailed Disease Information:**
   - Provide the name(s) of the condition(s) identified
   - Explain what the condition is in simple terms
   - Describe common symptoms and how they relate to what's visible in the image
   - Mention possible causes or risk factors

3. **Treatment and Cure Recommendations:**
   - Provide specific treatment options for the identified condition(s)
   - Include both medical treatments (prescription medications, procedures) and home remedies
   - Suggest over-the-counter treatments when appropriate
   - Provide step-by-step care instructions
   - Mention lifestyle changes or preventive measures
   - Include dietary recommendations if relevant
   - Suggest when to use topical treatments, oral medications, or other interventions
   - Provide timeline expectations for improvement or healing

4. **Action Plan:**
   - Create a clear, actionable treatment plan
   - Prioritize recommendations (most important first)
   - Specify when immediate medical attention is needed
   - Provide guidance on monitoring progress

CRITICAL LANGUAGE INSTRUCTION: ${languageInstructions[language] || languageInstructions.english}

IMPORTANT DISCLAIMERS you must include:
- Always remind users that this is AI-assisted analysis and not a replacement for professional medical diagnosis
- Emphasize that for serious conditions, visible abnormalities, or concerning symptoms, professional medical evaluation is essential
- Recommend consulting with healthcare professionals (doctors, dermatologists, specialists) for proper diagnosis and personalized treatment
- Note that some conditions require prescription medications that can only be obtained from licensed healthcare providers
- Advise immediate medical attention for severe symptoms, spreading conditions, infections, or emergencies

For image analysis responses, structure them as:
1. **What I See:** (Description of visible symptoms/conditions)
2. **Possible Condition(s):** (Disease names and explanations)
3. **Treatment & Cure Options:** (Detailed treatment recommendations)
4. **Action Plan:** (Step-by-step what to do)
5. **When to See a Doctor:** (Urgency and professional consultation advice)

Keep responses detailed, practical, and empathetic. Use simple language that's easy to understand. Provide specific, actionable advice that helps users take immediate steps toward treatment and recovery.`;

    // Transform messages to handle image content
    const transformedMessages = messages.map((msg: any) => {
      // If message content is an array (contains image), format it for vision API
      if (Array.isArray(msg.content)) {
        return {
          role: msg.role,
          content: msg.content
        };
      }
      // Regular text message
      return {
        role: msg.role,
        content: msg.content
      };
    });

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
          ...transformedMessages,
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
