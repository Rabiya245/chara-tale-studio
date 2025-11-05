-- Create slides table to store generated AI content
CREATE TABLE public.slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  script TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slides
CREATE POLICY "Users can view slides of their stories"
ON public.slides
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stories
  WHERE stories.id = slides.story_id
  AND stories.user_id = auth.uid()
));

CREATE POLICY "Users can create slides for their stories"
ON public.slides
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM stories
  WHERE stories.id = slides.story_id
  AND stories.user_id = auth.uid()
));

CREATE POLICY "Users can delete slides of their stories"
ON public.slides
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM stories
  WHERE stories.id = slides.story_id
  AND stories.user_id = auth.uid()
));

-- Add background_url to stories table
ALTER TABLE public.stories ADD COLUMN background_url TEXT;