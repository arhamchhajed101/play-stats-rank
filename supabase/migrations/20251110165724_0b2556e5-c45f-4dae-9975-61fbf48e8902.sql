-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT
  USING (true);

-- Create user_games table (which games users are tracking)
CREATE TABLE public.user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracked games"
  ON public.user_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add games to track"
  ON public.user_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove tracked games"
  ON public.user_games FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_stats table (daily stats)
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  hours_played DECIMAL(4,2) DEFAULT 0,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id, date)
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert some sample games
INSERT INTO public.games (name, category, image_url) VALUES
  ('Valorant', 'FPS', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'),
  ('League of Legends', 'MOBA', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'),
  ('Counter-Strike 2', 'FPS', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'),
  ('Fortnite', 'Battle Royale', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400'),
  ('Apex Legends', 'Battle Royale', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400'),
  ('Overwatch 2', 'FPS', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400');

-- Create function to update profile points
CREATE OR REPLACE FUNCTION public.update_profile_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM public.user_stats
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update profile points
CREATE TRIGGER update_profile_points_trigger
  AFTER INSERT OR UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_points();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();