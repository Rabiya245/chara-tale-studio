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
      
      // Generate detailed script for this slide
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
              content: 'You are a master storyteller and screenwriter. Create highly detailed, cinematic narrative scripts that capture every visual and emotional detail of the scene.'
            },
            {
              role: 'user',
              content: `Create an extremely detailed narrative script for slide ${i} of 4 for the story:

Title: ${storyTitle}
Description: ${storyDescription}
Characters: ${characters.map((c: any) => `${c.name} (${c.role}, ${c.gender})`).join(', ')}

Requirements:
- Write 4-5 detailed paragraphs (minimum 200 words)
- Describe the exact scene setting, time of day, lighting, and atmosphere
- Detail each character's precise actions, body language, facial expressions, and positioning
- Include specific dialogue with emotional context
- Describe the mood, camera angles, and cinematic framing
- Make it photo-realistic and highly visual, as if describing a movie scene

Make this slide progress the story naturally from slide ${i === 1 ? 'the beginning' : `slide ${i-1}`}.`
            }
          ]
        })
      });

      if (!scriptResponse.ok) {
        throw new Error(`Failed to generate script for slide ${i}`);
      }

      const scriptData = await scriptResponse.json();
      const script = scriptData.choices[0].message.content;

      // Generate ultra-realistic image using character images as reference
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
              content: [
                {
                  type: 'text',
                  text: `Create an ultra-realistic AI-rendered image for this story scene using the exact uploaded references:

SCENE SCRIPT:
${script}

STORY CONTEXT:
Title: ${storyTitle}
Description: ${storyDescription}

CHARACTERS IN THIS SCENE:
${characters.map((c: any) => `- ${c.name}: ${c.role} (${c.gender})`).join('\n')}

CRITICAL PHOTO-REALISM REQUIREMENTS:
1. EXACT CHARACTER PRESERVATION - Use the uploaded character images as absolute references:
   - Match EVERY facial feature precisely (eyes, nose, mouth, face shape, expressions)
   - Keep hairstyle, hair color, and hair texture IDENTICAL
   - Preserve skin tone and skin texture exactly as shown
   - Replicate outfit, clothing details, and accessories exactly
   - Maintain the same body posture and proportions

2. EXACT BACKGROUND PRESERVATION - Use the uploaded background image as absolute reference:
   - Keep the background environment IDENTICAL (same location, same perspective)
   - Preserve all background details, objects, and elements exactly
   - Maintain the same lighting conditions and light direction
   - Keep the same atmospheric conditions and mood

3. ULTRA-REALISTIC RENDERING REQUIREMENTS:
   - Photo-realistic style - this must look like a real photograph, NOT animated or cartoon-like
   - 8K clarity and ultra-high definition details
   - Natural, professional lighting with accurate shadows and highlights
   - Smooth, lifelike skin textures and fabric details
   - Realistic depth of field and perspective
   - Accurate color balance and color grading
   - Natural expressions and body language matching the script

4. TECHNICAL SPECIFICATIONS:
   - Professional photography quality
   - Cinematic composition and framing
   - Natural bokeh and depth effects where appropriate
   - Realistic ambient occlusion and global illumination
   - Perfect visual cohesion between characters and environment
   - Lifelike materials, textures, and surface properties

5. POSITIONING AND COMPOSITION:
   - Position characters according to the script description
   - Ensure natural interaction between characters and environment
   - Maintain realistic spatial relationships and scale
   - Create dynamic, engaging composition following cinematic rules

FINAL OUTPUT MUST BE: A real-photo quality image, ultra-realistic, 8K clarity, natural lighting, lifelike expressions, professional photography standard - indistinguishable from a real photograph.`
                },
                ...characters.map((c: any) => ({
                  type: 'image_url',
                  image_url: { url: c.imageUrl }
                })),
                ...(backgroundUrl ? [{
                  type: 'image_url',
                  image_url: { url: backgroundUrl }
                }] : [])
              ]
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error(`Image generation error for slide ${i}:`, errorText);
        throw new Error(`Failed to generate image for slide ${i}: ${errorText}`);
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

      console.log(`Slide ${i} generated successfully with detailed script and photo-realistic image`);
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
