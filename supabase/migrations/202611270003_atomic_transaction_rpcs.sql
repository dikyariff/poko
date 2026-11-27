-- Poko Phase 2 Task 8: Atomic PostgreSQL RPCs (create_transaction & delete_transaction)
-- Uses security invoker + FOR UPDATE row locking (ordered by UUID) to eliminate race conditions & deadlocks.

create or replace function public.create_transaction(
  p_type text,
  p_amount bigint,
  p_wallet_id uuid,
  p_destination_wallet_id uuid default null,
  p_category text default 'Lainnya',
  p_note text default '',
  p_merchant text default null,
  p_occurred_at timestamptz default timezone('utc', now()),
  p_source text default 'manual',
  p_metadata jsonb default '{}'::jsonb
)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id text;
  v_source_wallet public.wallets%rowtype;
  v_dest_wallet public.wallets%rowtype;
  v_tx public.transactions%rowtype;
  v_first_id uuid;
  v_second_id uuid;
  v_month_key text;
  v_budget_limit bigint;
begin
  v_user_id := nullif((select auth.jwt()) ->> 'sub', '');
  if v_user_id is null then
    raise exception 'Unauthorized: sesi Clerk tidak ditemukan.' using errcode = '42501';
  end if;

  if p_type not in ('income', 'expense', 'transfer') then
    raise exception 'Tipe transaksi tidak valid: %', p_type using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Nominal transaksi harus lebih dari 0.' using errcode = '22023';
  end if;

  if p_source not in ('manual', 'receipt_ai', 'savings_sync', 'dream_execution') then
    raise exception 'Sumber transaksi tidak valid: %', p_source using errcode = '22023';
  end if;

  if p_type = 'transfer' then
    if p_destination_wallet_id is null then
      raise exception 'Dompet tujuan wajib diisi untuk transaksi transfer.' using errcode = '22023';
    end if;
    if p_destination_wallet_id = p_wallet_id then
      raise exception 'Dompet asal dan tujuan tidak boleh sama.' using errcode = '22023';
    end if;

    -- Lock both wallets in deterministic UUID order to prevent deadlocks
    if p_wallet_id < p_destination_wallet_id then
      v_first_id := p_wallet_id;
      v_second_id := p_destination_wallet_id;
    else
      v_first_id := p_destination_wallet_id;
      v_second_id := p_wallet_id;
    end if;

    perform 1 from public.wallets
      where id = v_first_id and user_id = v_user_id and is_archived = false
      for update;
    perform 1 from public.wallets
      where id = v_second_id and user_id = v_user_id and is_archived = false
      for update;

    select * into v_source_wallet from public.wallets
      where id = p_wallet_id and user_id = v_user_id and is_archived = false;
    if not found then
      raise exception 'Dompet asal tidak ditemukan atau sudah diarsipkan.' using errcode = 'P0002';
    end if;

    select * into v_dest_wallet from public.wallets
      where id = p_destination_wallet_id and user_id = v_user_id and is_archived = false;
    if not found then
      raise exception 'Dompet tujuan tidak ditemukan atau sudah diarsipkan.' using errcode = 'P0002';
    end if;

    if v_source_wallet.balance < p_amount then
      raise exception 'Saldo dompet asal (%) tidak mencukupi.', v_source_wallet.name using errcode = 'P0001';
    end if;

    update public.wallets
      set balance = balance - p_amount
      where id = p_wallet_id and user_id = v_user_id;

    update public.wallets
      set balance = balance + p_amount
      where id = p_destination_wallet_id and user_id = v_user_id;
  else
    select * into v_source_wallet from public.wallets
      where id = p_wallet_id and user_id = v_user_id and is_archived = false
      for update;
    if not found then
      raise exception 'Dompet tidak ditemukan atau sudah diarsipkan.' using errcode = 'P0002';
    end if;

    if p_type = 'expense' then
      if v_source_wallet.balance < p_amount then
        raise exception 'Saldo dompet (%) tidak mencukupi.', v_source_wallet.name using errcode = 'P0001';
      end if;
      update public.wallets
        set balance = balance - p_amount
        where id = p_wallet_id and user_id = v_user_id;
    else
      -- income
      update public.wallets
        set balance = balance + p_amount
        where id = p_wallet_id and user_id = v_user_id;
    end if;
  end if;

  insert into public.transactions (
    user_id,
    type,
    amount,
    wallet_id,
    destination_wallet_id,
    category,
    note,
    merchant,
    occurred_at,
    source,
    metadata
  )
  values (
    v_user_id,
    p_type,
    p_amount,
    p_wallet_id,
    case when p_type = 'transfer' then p_destination_wallet_id else null end,
    coalesce(nullif(btrim(p_category), ''), 'Lainnya'),
    coalesce(p_note, ''),
    nullif(btrim(coalesce(p_merchant, '')), ''),
    coalesce(p_occurred_at, timezone('utc', now())),
    p_source,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_tx;

  -- Keep monthly_budget_logs in sync for expense transactions (Asia/Jakarta month)
  if p_type = 'expense' then
    v_month_key := to_char(v_tx.occurred_at at time zone 'Asia/Jakarta', 'YYYY-MM');
    select coalesce(monthly_budget_limit, 3000000) into v_budget_limit
      from public.profiles
      where id = v_user_id;
    v_budget_limit := coalesce(v_budget_limit, 3000000);

    insert into public.monthly_budget_logs (user_id, month_key, budget_limit, total_expense)
    values (v_user_id, v_month_key, v_budget_limit, p_amount)
    on conflict (user_id, month_key)
    do update set total_expense = public.monthly_budget_logs.total_expense + excluded.total_expense;
  end if;

  return v_tx;
end;
$$;

create or replace function public.delete_transaction(
  p_transaction_id uuid
)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id text;
  v_tx public.transactions%rowtype;
  v_source_wallet public.wallets%rowtype;
  v_dest_wallet public.wallets%rowtype;
  v_first_id uuid;
  v_second_id uuid;
  v_month_key text;
begin
  v_user_id := nullif((select auth.jwt()) ->> 'sub', '');
  if v_user_id is null then
    raise exception 'Unauthorized: sesi Clerk tidak ditemukan.' using errcode = '42501';
  end if;

  select * into v_tx from public.transactions
    where id = p_transaction_id and user_id = v_user_id
    for update;
  if not found then
    raise exception 'Transaksi tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_tx.type in ('transfer', 'savings_deposit', 'savings_withdraw') and v_tx.destination_wallet_id is not null then
    -- Lock both wallets in deterministic UUID order
    if v_tx.wallet_id < v_tx.destination_wallet_id then
      v_first_id := v_tx.wallet_id;
      v_second_id := v_tx.destination_wallet_id;
    else
      v_first_id := v_tx.destination_wallet_id;
      v_second_id := v_tx.wallet_id;
    end if;

    perform 1 from public.wallets where id = v_first_id and user_id = v_user_id for update;
    perform 1 from public.wallets where id = v_second_id and user_id = v_user_id for update;

    select * into v_dest_wallet from public.wallets
      where id = v_tx.destination_wallet_id and user_id = v_user_id;
    if not found then
      raise exception 'Dompet tujuan terkait tidak ditemukan.' using errcode = 'P0002';
    end if;

    if v_dest_wallet.balance < v_tx.amount then
      raise exception 'Saldo dompet tujuan (%) tidak cukup untuk membatalkan transaksi ini.', v_dest_wallet.name using errcode = 'P0001';
    end if;

    update public.wallets
      set balance = balance + v_tx.amount
      where id = v_tx.wallet_id and user_id = v_user_id;

    update public.wallets
      set balance = balance - v_tx.amount
      where id = v_tx.destination_wallet_id and user_id = v_user_id;
  elsif v_tx.type = 'income' then
    select * into v_source_wallet from public.wallets
      where id = v_tx.wallet_id and user_id = v_user_id
      for update;
    if not found then
      raise exception 'Dompet terkait tidak ditemukan.' using errcode = 'P0002';
    end if;

    if v_source_wallet.balance < v_tx.amount then
      raise exception 'Saldo dompet (%) tidak cukup untuk membatalkan pemasukan ini.', v_source_wallet.name using errcode = 'P0001';
    end if;

    update public.wallets
      set balance = balance - v_tx.amount
      where id = v_tx.wallet_id and user_id = v_user_id;
  else
    -- expense or single-wallet savings_withdraw
    select * into v_source_wallet from public.wallets
      where id = v_tx.wallet_id and user_id = v_user_id
      for update;
    if not found then
      raise exception 'Dompet terkait tidak ditemukan.' using errcode = 'P0002';
    end if;

    update public.wallets
      set balance = balance + v_tx.amount
      where id = v_tx.wallet_id and user_id = v_user_id;

    if v_tx.type = 'expense' then
      v_month_key := to_char(v_tx.occurred_at at time zone 'Asia/Jakarta', 'YYYY-MM');
      update public.monthly_budget_logs
        set total_expense = greatest(0, total_expense - v_tx.amount)
        where user_id = v_user_id and month_key = v_month_key;
    end if;
  end if;

  delete from public.transactions
    where id = p_transaction_id and user_id = v_user_id;

  return v_tx;
end;
$$;

revoke all on function public.create_transaction(text, bigint, uuid, uuid, text, text, text, timestamptz, text, jsonb) from public, anon;
grant execute on function public.create_transaction(text, bigint, uuid, uuid, text, text, text, timestamptz, text, jsonb) to authenticated;

revoke all on function public.delete_transaction(uuid) from public, anon;
grant execute on function public.delete_transaction(uuid) to authenticated;
