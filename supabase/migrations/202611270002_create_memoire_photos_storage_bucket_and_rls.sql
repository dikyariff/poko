-- =============================================================================
-- Poko Planner — Phase 1
-- Migration 0002: Private Storage Bucket `memoire-photos` & Per-User RLS
-- =============================================================================
-- Path convention: {clerk_user_id}/{dream_id}/{timestamp}.{ext}
-- Bucket rules: private (`public = false`), max 2 MB, webp/jpeg/png only.
-- =============================================================================

-- 1. Create or update private bucket `memoire-photos`
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'memoire-photos',
  'memoire-photos',
  false,
  2097152,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Per-user storage RLS policies on storage.objects (4 policies)
drop policy if exists "memoire_photos_select_own" on storage.objects;
create policy "memoire_photos_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'memoire-photos'
    and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

drop policy if exists "memoire_photos_insert_own" on storage.objects;
create policy "memoire_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'memoire-photos'
    and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

drop policy if exists "memoire_photos_update_own" on storage.objects;
create policy "memoire_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'memoire-photos'
    and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  )
  with check (
    bucket_id = 'memoire-photos'
    and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

drop policy if exists "memoire_photos_delete_own" on storage.objects;
create policy "memoire_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'memoire-photos'
    and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );
