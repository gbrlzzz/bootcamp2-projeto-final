-- ============================================================
-- Pokédex do Time — setup do banco no Supabase
-- Cole no SQL Editor do projeto e clique em Run.
-- ============================================================

create table public.avaliacoes (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  numero     int  not null check (numero between 1 and 1025),
  nome       text not null,
  imagem     text,
  tipos      text[] not null default '{}',
  nota       int  not null check (nota between 1 and 5),
  comentario text check (char_length(comentario) <= 280),
  autor      text not null check (char_length(autor) between 2 and 40)
);

-- RLS ligado + só as operações que a interface usa (sem update)
alter table public.avaliacoes enable row level security;

create policy "leitura publica"  on public.avaliacoes for select to anon using (true);
create policy "insercao publica" on public.avaliacoes for insert to anon with check (true);
create policy "remocao publica"  on public.avaliacoes for delete to anon using (true);
