-- Projects table and supporting objects
CREATE SCHEMA IF NOT EXISTS extensions;

CREATE TABLE IF NOT EXISTS public.projects (
  uuid uuid PRIMARY KEY,
  title text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent uuid REFERENCES public.projects(uuid) ON DELETE SET NULL,
  ordering double precision,
  pinned boolean NOT NULL DEFAULT false,
  meta jsonb,
  iv text,
  is_encrypted boolean NOT NULL DEFAULT false,
  ciphertext text,
  key_version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  modified_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  synced_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  modified_by text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent ON public.projects(parent);
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON public.projects(synced_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_synced ON public.projects(user_id, synced_at);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects select own" ON public.projects FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Projects insert own" ON public.projects FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Projects update own" ON public.projects FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Projects delete own" ON public.projects FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER set_projects_synced_at_trigger
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_synced_at();

-- Optional, after existing item data has valid project references:
-- ALTER TABLE public.items
-- ADD CONSTRAINT items_project_id_fkey
-- FOREIGN KEY (project_id) REFERENCES public.projects(uuid) ON DELETE SET NULL;
