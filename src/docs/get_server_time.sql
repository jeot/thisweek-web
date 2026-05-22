-- 1) Create/replace function (unchanged logic)
create or replace function public.get_server_time()
returns timestamptz
language sql
stable
as $$
  select now() at time zone 'utc';
$$;

-- 2) Revoke execute from public/anon (fixing typo)
revoke execute on function public.get_server_time() from public;
revoke execute on function public.get_server_time() from anon;

-- 3) Grant execute only to authenticated role
grant execute on function public.get_server_time() to authenticated;
