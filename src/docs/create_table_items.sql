-- Corrected Items table and supporting objects
CREATE SCHEMA IF NOT EXISTS extensions;

CREATE TABLE IF NOT EXISTS public.items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uuid uuid NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  type item_type NOT NULL,
  status item_status NOT NULL,
  category item_category NOT NULL,
  project_id uuid,
  calendar text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  tz_offset integer NOT NULL,
  tz_iana text NOT NULL,
  due_type item_due_type,
  duration integer NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  parent uuid REFERENCES public.items(uuid) ON DELETE SET NULL,
  ordering jsonb,
  notification jsonb,
  meta jsonb,
  recurrence jsonb,
  iv text,
  is_encrypted boolean NOT NULL DEFAULT false,
  ciphertext text,
  key_version bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  modified_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  synced_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  modified_by text NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_parent ON public.items(parent);
CREATE INDEX IF NOT EXISTS idx_items_project_id ON public.items(project_id);
CREATE INDEX IF NOT EXISTS idx_items_synced_at ON public.items(synced_at);
CREATE INDEX IF NOT EXISTS idx_items_user_synced ON public.items(user_id, synced_at);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items select own" ON public.items FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Items insert own" ON public.items FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Items update own" ON public.items FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Items delete own" ON public.items FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.set_synced_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('search_path', '', true);
  NEW.synced_at = (clock_timestamp() AT TIME ZONE 'utc')::timestamptz;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_synced_at_trigger
BEFORE INSERT OR UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.set_synced_at();
