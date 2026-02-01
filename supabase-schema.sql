-- SystemA Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- STEP 1: Create all tables first
-- =============================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Architectures table
create table public.architectures (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  data jsonb not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  version integer default 1 not null,
  is_public boolean default false not null,
  public_link text unique
);

-- Architecture collaborators table
create table public.architecture_collaborators (
  id uuid default uuid_generate_v4() primary key,
  architecture_id uuid references public.architectures(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('Owner', 'Editor', 'Commenter', 'Viewer')),
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(architecture_id, user_id)
);

-- Architecture snapshots table
create table public.architecture_snapshots (
  id uuid default uuid_generate_v4() primary key,
  architecture_id uuid references public.architectures(id) on delete cascade not null,
  name text not null,
  description text,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete cascade not null
);

-- Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  architecture_id uuid references public.architectures(id) on delete cascade not null,
  component_id text,
  connection_id text,
  content text not null,
  author uuid references public.profiles(id) on delete cascade not null,
  author_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved boolean default false not null,
  position jsonb
);

-- Change log table
create table public.change_log (
  id uuid default uuid_generate_v4() primary key,
  architecture_id uuid references public.architectures(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_email text not null,
  action text not null,
  changes jsonb not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- STEP 2: Enable Row Level Security on all tables
-- =============================================

alter table public.profiles enable row level security;
alter table public.architectures enable row level security;
alter table public.architecture_collaborators enable row level security;
alter table public.architecture_snapshots enable row level security;
alter table public.comments enable row level security;
alter table public.change_log enable row level security;

-- =============================================
-- STEP 3: Create all policies (after all tables exist)
-- =============================================

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Architectures policies (simplified to avoid recursion)
create policy "Architectures are viewable by creator or public"
  on architectures for select
  using (
    auth.uid() = created_by
    or is_public = true
  );

create policy "Users can insert their own architectures"
  on architectures for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own architectures or as collaborator"
  on architectures for update
  using (auth.uid() = created_by);

create policy "Users can delete their own architectures"
  on architectures for delete
  using (auth.uid() = created_by);

-- Collaborators policies (simplified)
create policy "Collaborators can view their own collaborations"
  on architecture_collaborators for select
  using (user_id = auth.uid());

create policy "Architecture owners can view all collaborators"
  on architecture_collaborators for select
  using (
    exists (
      select 1 from architectures
      where architectures.id = architecture_collaborators.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "Architecture owners can insert collaborators"
  on architecture_collaborators for insert
  with check (
    exists (
      select 1 from architectures
      where architectures.id = architecture_collaborators.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "Architecture owners can update collaborators"
  on architecture_collaborators for update
  using (
    exists (
      select 1 from architectures
      where architectures.id = architecture_collaborators.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "Architecture owners can delete collaborators"
  on architecture_collaborators for delete
  using (
    exists (
      select 1 from architectures
      where architectures.id = architecture_collaborators.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

-- Snapshots policies
create policy "Snapshots are viewable by architecture owner"
  on architecture_snapshots for select
  using (
    exists (
      select 1 from architectures
      where architectures.id = architecture_snapshots.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "Architecture owner can create snapshots"
  on architecture_snapshots for insert
  with check (
    exists (
      select 1 from architectures
      where architectures.id = architecture_snapshots.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

-- Comments policies
create policy "Comments are viewable by architecture owner"
  on comments for select
  using (
    exists (
      select 1 from architectures
      where architectures.id = comments.architecture_id
      and (architectures.created_by = auth.uid() or architectures.is_public = true)
    )
  );

create policy "Users can add comments to their architectures"
  on comments for insert
  with check (
    exists (
      select 1 from architectures
      where architectures.id = comments.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "Comment authors can update their comments"
  on comments for update
  using (auth.uid() = author);

-- Change log policies
create policy "Change logs are viewable by architecture owner"
  on change_log for select
  using (
    exists (
      select 1 from architectures
      where architectures.id = change_log.architecture_id
      and architectures.created_by = auth.uid()
    )
  );

create policy "System can insert change logs"
  on change_log for insert
  with check (true);

-- =============================================
-- STEP 4: Create functions and triggers
-- =============================================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists on_architecture_updated on public.architectures;
create trigger on_architecture_updated
  before update on public.architectures
  for each row execute procedure public.handle_updated_at();
