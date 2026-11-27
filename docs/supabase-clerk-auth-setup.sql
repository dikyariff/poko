-- =============================================================================
-- Poko Planner — Phase 1 (Task 4)
-- Helper RPC untuk memverifikasi integrasi Supabase + Clerk Native Third-Party Auth
-- =============================================================================
-- Prasyarat sebelum menjalankan skrip ini:
-- 1. Di Clerk Dashboard -> Integrations -> Supabase: aktifkan integrasi Supabase
--    (tidak perlu membuat JWT Template "supabase" lama).
-- 2. Di Supabase Dashboard -> Authentication -> Third-Party Auth -> Add provider:
--    pilih Clerk lalu masukkan Clerk Domain instance kamu.
-- 3. Jalankan SQL ini sekali di Supabase SQL Editor.
--
-- Catatan:
-- Skrip ini HANYA membuat fungsi diagnostik `public.whoami_clerk_sub()` untuk
-- menguji klaim `auth.jwt() ->> 'sub'` di `/api/supabase-health`.
-- Migrasi 6 tabel utama Poko Planner akan dikerjakan pada Task 5.
-- =============================================================================

create or replace function public.whoami_clerk_sub()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'sub', auth.jwt() ->> 'sub',
    'role', auth.jwt() ->> 'role',
    'iss', auth.jwt() ->> 'iss'
  );
$$;

revoke all on function public.whoami_clerk_sub() from public;
grant execute on function public.whoami_clerk_sub() to authenticated;
