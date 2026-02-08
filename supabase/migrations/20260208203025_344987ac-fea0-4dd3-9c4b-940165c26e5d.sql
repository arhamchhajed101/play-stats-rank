
ALTER TABLE public.user_games ADD COLUMN IF NOT EXISTS ingame_id TEXT;

INSERT INTO public.games (name, category, image_url)
SELECT 'Valorant', 'FPS', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Valorant');
