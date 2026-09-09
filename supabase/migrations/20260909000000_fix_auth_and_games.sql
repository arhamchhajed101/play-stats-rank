-- Ensure the profiles table allows upsert in case of duplicate key on signup retry
-- (The trigger handle_new_user will fire, but if it already exists, we want to ignore the conflict)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the update_profile_points trigger also handles properly
CREATE OR REPLACE FUNCTION public.update_profile_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM public.user_stats
    WHERE user_id = NEW.user_id
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add CS2 game if it doesn't exist already (different spellings may exist)
INSERT INTO public.games (name, category, image_url)
SELECT 'Counter-Strike 2', 'FPS', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name IN ('Counter-Strike 2', 'CS2'));

-- Ensure Overwatch 2 exists
INSERT INTO public.games (name, category, image_url)
SELECT 'Overwatch 2', 'FPS', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Overwatch 2');

-- Ensure Apex Legends exists
INSERT INTO public.games (name, category, image_url)
SELECT 'Apex Legends', 'Battle Royale', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Apex Legends');
