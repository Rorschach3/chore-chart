
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache responses for frequently asked questions
const responseCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    // Check if we have a cached response
    const cacheKey = prompt.trim().toLowerCase();
    const cachedResponse = responseCache.get(cacheKey);
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
      console.log("Using cached response");
      return new Response(
        JSON.stringify({ generatedText: cachedResponse.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OPENAI_API_KEY is not set in the environment variables'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Add a fallback response in case the API fails
    let generatedText = "I'm sorry, but I'm currently unable to connect to my knowledge base. " +
      "This could be due to high demand or a temporary service limitation. " +
      "Please try again in a few minutes or contact support if the issue persists.";

    try {
      const startTime = Date.now();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are ChoreChart Assistant, a helpful AI that specializes in household management, chore organization, and roommate dynamics. You provide practical advice about cleaning, maintenance, chore scheduling, and maintaining positive relationships among housemates. Your responses should be friendly, practical, and focused on creating harmonious living spaces.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7, // Add some variability to make responses more engaging
        }),
      });

      const requestTime = Date.now() - startTime;
      console.log(`OpenAI request took ${requestTime}ms`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        // Handle quota exceeded error specifically
        if (errorData.error?.code === 'insufficient_quota') {
          return new Response(
            JSON.stringify({ 
              generatedText: "I apologize, but the ChoreChart Assistant is currently unavailable due to service limits. " +
                "The system administrator needs to check the OpenAI account billing status or upgrade the plan. " +
                "Please try again later or contact support."
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      generatedText = data.choices[0].message.content;
      
      // Cache the response
      responseCache.set(cacheKey, {
        text: generatedText,
        timestamp: Date.now()
      });
      
      // Clean old cache entries occasionally
      if (Math.random() < 0.05) { // 5% chance to clean on each request
        const now = Date.now();
        for (const [key, value] of responseCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            responseCache.delete(key);
          }
        }
      }
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      // We'll use the fallback message defined above
    }

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-with-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        generatedText: "I'm sorry, but I encountered an error while processing your request. Please try again later."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
