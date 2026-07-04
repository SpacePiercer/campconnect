-- TrailMates — full schema. Paste into Supabase SQL editor and run once.

-- ============ TABLES ============

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text
);

create table public.hikes (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  date date not null,
  time time not null,
  capacity int not null check (capacity > 0),
  carpool_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.hike_participants (
  hike_id uuid not null references public.hikes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (hike_id, user_id)
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references public.hikes(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  capacity int not null check (capacity >= 1),
  unique (hike_id, driver_id)
);

create table public.car_riders (
  car_id uuid not null references public.cars(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (car_id, user_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references public.hikes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('provision','tool')),
  car_id uuid references public.cars(id) on delete set null
);

-- ============ PROFILE AUTO-CREATION ============

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ RPCs (atomic capacity checks; the ONLY write path for joins) ============

create or replace function public.join_hike(p_hike_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_capacity int;
  v_count int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select capacity into v_capacity from hikes where id = p_hike_id for update;
  if not found then raise exception 'hike_not_found'; end if;
  select count(*) into v_count from hike_participants where hike_id = p_hike_id;
  if v_count >= v_capacity then raise exception 'hike_full'; end if;
  insert into hike_participants (hike_id, user_id) values (p_hike_id, auth.uid())
  on conflict do nothing;
end $$;

create or replace function public.leave_hike(p_hike_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from car_riders cr using cars c
    where cr.car_id = c.id and c.hike_id = p_hike_id and cr.user_id = auth.uid();
  delete from cars where hike_id = p_hike_id and driver_id = auth.uid();
  delete from items where hike_id = p_hike_id and owner_id = auth.uid();
  delete from hike_participants where hike_id = p_hike_id and user_id = auth.uid();
end $$;

create or replace function public.add_car(p_hike_id uuid, p_capacity int)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_car_id uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_capacity < 1 then raise exception 'bad_capacity'; end if;
  if not exists (select 1 from hike_participants where hike_id = p_hike_id and user_id = auth.uid()) then
    raise exception 'not_participant';
  end if;
  -- becoming a driver: vacate any rider seat in this hike
  delete from car_riders cr using cars c
    where cr.car_id = c.id and c.hike_id = p_hike_id and cr.user_id = auth.uid();
  insert into cars (hike_id, driver_id, capacity) values (p_hike_id, auth.uid(), p_capacity)
  returning id into v_car_id;
  return v_car_id;
end $$;

create or replace function public.join_car(p_car_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_hike_id uuid;
  v_capacity int;
  v_occupied int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select hike_id, capacity into v_hike_id, v_capacity from cars where id = p_car_id for update;
  if not found then raise exception 'car_not_found'; end if;
  if not exists (select 1 from hike_participants where hike_id = v_hike_id and user_id = auth.uid()) then
    raise exception 'not_participant';
  end if;
  if exists (select 1 from cars where hike_id = v_hike_id and driver_id = auth.uid()) then
    raise exception 'driver_has_car';
  end if;
  select 1 + count(*) into v_occupied from car_riders where car_id = p_car_id; -- driver takes a seat
  if v_occupied >= v_capacity then raise exception 'car_full'; end if;
  -- switching cars: leave any other car in the same hike
  delete from car_riders cr using cars c
    where cr.car_id = c.id and c.hike_id = v_hike_id and cr.user_id = auth.uid();
  insert into car_riders (car_id, user_id) values (p_car_id, auth.uid());
end $$;

create or replace function public.leave_car(p_car_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from car_riders where car_id = p_car_id and user_id = auth.uid();
end $$;

-- Driver assigns/unassigns items to their car. p_car_id null = unload.
create or replace function public.set_item_car(p_item_id uuid, p_car_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_item_hike uuid;
  v_current_car uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select hike_id, car_id into v_item_hike, v_current_car from items where id = p_item_id;
  if not found then raise exception 'item_not_found'; end if;
  if p_car_id is not null then
    if not exists (select 1 from cars where id = p_car_id and hike_id = v_item_hike and driver_id = auth.uid()) then
      raise exception 'not_your_car';
    end if;
  else
    if not exists (select 1 from cars where id = v_current_car and driver_id = auth.uid()) then
      raise exception 'not_your_car';
    end if;
  end if;
  update items set car_id = p_car_id where id = p_item_id;
end $$;

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.hikes enable row level security;
alter table public.hike_participants enable row level security;
alter table public.cars enable row level security;
alter table public.car_riders enable row level security;
alter table public.items enable row level security;

create policy "profiles readable" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "hikes readable" on public.hikes for select to authenticated using (true);
create policy "host creates hike" on public.hikes for insert to authenticated
  with check (host_id = auth.uid());
create policy "host updates hike" on public.hikes for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "host deletes hike" on public.hikes for delete to authenticated
  using (host_id = auth.uid());

-- joins/leaves go through RPCs only (security definer) — no insert/delete policies
create policy "participants readable" on public.hike_participants for select to authenticated using (true);

create policy "cars readable" on public.cars for select to authenticated using (true);
create policy "driver updates car" on public.cars for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "driver deletes car" on public.cars for delete to authenticated
  using (driver_id = auth.uid());

create policy "riders readable" on public.car_riders for select to authenticated using (true);

create policy "items readable" on public.items for select to authenticated using (true);
create policy "participant adds item" on public.items for insert to authenticated
  with check (
    owner_id = auth.uid()
    and car_id is null
    and exists (select 1 from public.hike_participants hp where hp.hike_id = items.hike_id and hp.user_id = auth.uid())
  );
create policy "owner deletes item" on public.items for delete to authenticated
  using (owner_id = auth.uid());
-- item car assignment goes through set_item_car RPC (driver-only); owner rename not in V1

-- ============ REALTIME ============

alter publication supabase_realtime add table public.hikes;
alter publication supabase_realtime add table public.hike_participants;
alter publication supabase_realtime add table public.cars;
alter publication supabase_realtime add table public.car_riders;
alter publication supabase_realtime add table public.items;
