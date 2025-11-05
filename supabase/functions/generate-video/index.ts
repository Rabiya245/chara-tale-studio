import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyId, storyTitle, storyDescription, characters, backgroundUrl } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating 4 slides for story: ${storyTitle}`);

    // Generate 4 slides with AI
    const slides = [];
    
    for (let i = 1; i <= 4; i++) {
      console.log(`Generating slide ${i}...`);
      
      // Generate script for this slide
      const scriptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a creative storyteller. Generate detailed, engaging narrative scripts for animated story slides.'
            },
            {
              role: 'user',
              content: `Create a detailed narrative script for slide ${i} of 4 for the story:
Title: ${storyTitle}
Description: ${storyDescription}
Characters: ${characters.map((c: any) => `${c.name} (${c.role})`).join(', ')}

The script should be 3-4 paragraphs describing the scene, character actions, dialogue, and emotions. Make it cinematic and engaging.`
            }
          ]
        })
      });

      if (!scriptResponse.ok) {
        throw new Error(`Failed to generate script for slide ${i}`);
      }

      const scriptData = await scriptResponse.json();
      const script = scriptData.choices[0].message.content;

      // Generate image prompt based on script and characters
      const imagePromptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: `Create a detailed image generation prompt for an animated story scene. Include:
Script: ${script}
Characters: ${characters.map((c: any) => `${c.name} - ${c.role} (${c.gender})`).join(', ')}

Generate a single detailed prompt (max 100 words) for an AI image generator that creates a cinematic animated scene with these characters in the scene described by the script. Include style: "cinematic animation, vibrant colors, detailed background".`
            }
          ]
        })
      });

      const imagePromptData = await imagePromptResponse.json();
      const imagePrompt = imagePromptData.choices[0].message.content;

      // Generate the animated scene image
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            {
              role: 'user',
              content: imagePrompt
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Failed to generate image for slide ${i}`);
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        throw new Error(`No image URL returned for slide ${i}`);
      }

      slides.push({
        slide_number: i,
        image_url: imageUrl,
        script: script
      });

      console.log(`Slide ${i} generated successfully`);
    }

    // Save slides to database
    const slidesToInsert = slides.map(slide => ({
      story_id: storyId,
      slide_number: slide.slide_number,
      image_url: slide.image_url,
      script: slide.script
    }));

    const { error: insertError } = await supabase
      .from('slides')
      .insert(slidesToInsert);

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('All slides saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        slides: slides
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-video function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
