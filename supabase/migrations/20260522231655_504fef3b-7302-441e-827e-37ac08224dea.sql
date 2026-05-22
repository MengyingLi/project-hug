
-- 1. Lock down SECURITY DEFINER trigger functions (they should only run via triggers)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_issue_identifier() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- 2. Revoke anon SELECT on all app tables (only authenticated users should access)
REVOKE SELECT ON public.issues, public.comments, public.cycles, public.labels,
  public.issue_labels, public.notifications, public.profiles FROM anon;

-- 3. Tighten comments INSERT — author must be the current user
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Users can create comments as themselves"
ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 4. Tighten notifications INSERT — actor must be current user, or self-notification
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications they originate"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = actor_id OR auth.uid() = user_id);
