CREATE POLICY "Users can delete own stats for game removal"
  ON public.user_stats FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT DELETE ON public.user_stats TO authenticated;

CREATE OR REPLACE FUNCTION public.remove_tracked_game(p_game_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to remove a tracked game.' USING ERRCODE = '28000';
  END IF;

  DELETE FROM public.user_stats
  WHERE user_id = current_user_id AND game_id = p_game_id;

  DELETE FROM public.user_games
  WHERE user_id = current_user_id AND game_id = p_game_id;

  UPDATE public.profiles
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM public.user_stats
    WHERE user_id = current_user_id
  )
  WHERE id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.remove_tracked_game(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_tracked_game(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_tracked_game(uuid) TO service_role;