import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyTitle, storyDescription, characters } = await req.json();
    
    console.log('Generating video for:', storyTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate scene descriptions using AI
    const scenePrompt = `Based on this story:
Title: ${storyTitle}
Description: ${storyDescription}
Characters: ${characters.map((c: any) => `${c.name} (${c.role})`).join(', ')}

Create a detailed scene-by-scene breakdown for a 30-second animated video. Include 5-7 scenes with specific actions, camera angles, and character positions. Format as JSON array with: scene number, description, duration, characters involved.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional animation director. Generate detailed scene breakdowns in valid JSON format only.' },
          { role: 'user', content: scenePrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const scenesText = aiData.choices[0].message.content;
    
    console.log('AI generated scenes:', scenesText);

    // Generate video metadata
    const videoData = {
      id: crypto.randomUUID(),
      title: storyTitle,
      description: storyDescription,
      characters: characters,
      scenes: scenesText,
      duration: 30,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        video: videoData,
        message: 'Video generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating video:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Video generation failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
