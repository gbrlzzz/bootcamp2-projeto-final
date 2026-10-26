# Pokédex do Time — Bootcamp II · Projeto Final (Etapa 03)

Aplicação web colaborativa em que o time busca Pokémon na **PokeAPI**, dá notas de 1 a 5 com comentário e acompanha um **mural** e um **ranking Top 5** guardados no **Supabase**. É a evolução da Pokédex das Etapas 01 e 02, agora com fluxo profissional: main protegida, tudo por Pull Request, testes no GitHub Actions e imagem no Docker Hub.

- **Repositório:** https://github.com/gbrlzzz/bootcamp2-projeto-final
- **Docker Hub:** https://hub.docker.com/r/gbrzll/pokedex-do-time

## 1. Integrantes

| Nome | Matrícula | GitHub | Funcionalidade de que foi responsável | Principal PR |
|------|-----------|--------|----------------------------------------|--------------|
| Gabriel Soares Gomes de Souza | 22553852 | [@gbrlzzz](https://github.com/gbrlzzz) | Todas (grupo de 1 integrante): testes + CI, avaliações com Supabase, Docker, ranking | [#2 — Mural de avaliações no Supabase](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/2) |

### Divisão de funcionalidades e PRs

| Funcionalidade | Branch | PR |
|----------------|--------|----|
| Funções puras, testes com Vitest e workflow de CI | `feature/testes-ci` | [#1](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/1) |
| Mural de avaliações (criar, listar, filtrar, excluir) no Supabase | `feature/avaliacoes-supabase` | [#2](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/2) |
| Dockerfile + config do Supabase por variáveis de ambiente | `feature/docker` | [#3](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/3) |
| Ranking Top 5 (e teste de fogo do CI) | `feature/ranking` | [#4](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/4) |
| README final da entrega | `feature/readme-final` | [#5](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/5) |

Padrão de nome das branches: `feature/<funcionalidade>`.

### Proteção da main

Ruleset **"Protege a main"** (Settings → Rules), sem ninguém na lista de bypass, nem o dono:

- **Require a pull request before merging**, com todas as conversas de revisão resolvidas antes do merge;
- **Require status checks to pass**: o check `testes` (GitHub Actions) é obrigatório e a branch precisa estar atualizada com a main;
- bloqueio de force-push e de exclusão da main.

> **Sobre o grupo:** não consegui contato com nenhum colega para formar um grupo, então fiz o projeto sozinho, seguindo o mesmo fluxo (branch, PR, revisão e CI) que um time usaria.
>
> **Sobre a aprovação obrigatória:** o grupo tem um integrante só, e o GitHub não deixa o autor aprovar a própria PR. Por isso a regra está com **0 aprovações obrigatórias**. Se fosse 1, nenhuma PR poderia ser mesclada. Toda PR mesmo assim recebeu revisão com comentário no código, e o merge só aconteceu depois de cada conversa ser respondida e resolvida. A PR #4 também recebeu revisão automática do Codex, que encontrou um bug real no ranking, corrigido na própria PR.

## 2. A aplicação

### O que ela faz
- **Busca** por nome ou número (botão, Enter ou 🎲 Aleatório), com validação antes de chamar a API;
- **Cartão** com imagem, número, nome, tipos, altura (m) e peso (kg);
- **Avaliar**: autor, nota de 1 a 5 e comentário opcional (até 280 caracteres) → **Publicar no mural**;
- **Mural de avaliações**: lista tudo do banco, do mais novo ao mais antigo, com filtro por Pokémon ou autor, e ✖ para excluir;
- **🏆 Top 5 do time**: média das notas por Pokémon, com desempate pelo número de votos;
- Mensagens amigáveis para busca sem resultado, API fora do ar, falha do banco e formulário inválido. Comentários passam por escape de HTML antes de aparecer na tela, para evitar XSS.

### API externa consumida
**PokeAPI**: https://pokeapi.co/docs/v2. Endpoint `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-numero}`, sem chave. O JSON alimenta o cartão e também o registro salvo no banco (número, nome, sprite e tipos).

### Banco de dados
**Supabase** (PostgreSQL), projeto `bootcamp2-projeto-final` na região São Paulo. Tabela `avaliacoes`:

| coluna | tipo | regra |
|--------|------|-------|
| id | bigint identity | PK |
| criado_em | timestamptz | default now() |
| numero | int | 1 a 1025 |
| nome | text | obrigatório |
| imagem | text | sprite da PokeAPI |
| tipos | text[] | ex.: `{electric}` |
| nota | int | 1 a 5 |
| comentario | text | até 280 caracteres |
| autor | text | 2 a 40 caracteres |

RLS ligado, com políticas só para `select`, `insert` e `delete` do papel `anon`. Não existe política de update. Script completo: [`docs/setup_supabase.sql`](https://github.com/gbrlzzz/bootcamp2-projeto-final/blob/main/docs/setup_supabase.sql).

**Limitação conhecida** (levantada na revisão da PR #2): sem login, qualquer visitante pode excluir qualquer avaliação. O próximo passo seria Supabase Auth com uma policy `auth.uid() = user_id`.

### Estrutura
```
app/                 aplicação servida (index.html, style.css, script.js, utils.js, config.js)
tests/               testes Vitest das funções de utils.js
docs/                SQL do banco e evidências
docker/              script que gera o config.js na subida do container
.github/workflows/   ci.yml (GitHub Actions)
Dockerfile, docker-compose.yml
```

## 3. Como executar

### Via Docker (recomendado)

Imagem pública: https://hub.docker.com/r/gbrzll/pokedex-do-time (linux/amd64 e linux/arm64)

```bash
docker run -d -p 8080:80 --name pokedex-do-time gbrzll/pokedex-do-time:1.0
```

Depois abra **http://localhost:8080**. A imagem já vem apontando para o Supabase do time, então não precisa de variável nenhuma.

Para usar outro projeto Supabase (depois de rodar o `docs/setup_supabase.sql` nele):

```bash
docker run -d -p 8080:80 -e SUPABASE_URL=https://SEU-PROJETO.supabase.co -e SUPABASE_ANON_KEY=SUA_PUBLISHABLE_KEY gbrzll/pokedex-do-time:1.0
```

Para construir a imagem a partir do código: `docker compose up --build`.

### Localmente a partir do código
1. `git clone https://github.com/gbrlzzz/bootcamp2-projeto-final.git && cd bootcamp2-projeto-final`
2. `python3 -m http.server 5500 -d app` (ou a extensão Live Server do VS Code na pasta `app/`)
3. Abra http://localhost:5500

Como `script.js` é um módulo ES, a página precisa ser servida por HTTP; abrir o `index.html` direto com `file://` não funciona.

## 4. Como rodar os testes

```bash
npm install
npm test
```

São 19 testes com **Vitest** em 3 arquivos:

- `tests/utils.test.js`: normalização e validação da busca (vazio, número fora da Pokédex, caracteres especiais), formatação de nome e número, conversão de unidades;
- `tests/avaliacoes.test.js`: validação de nota e autor, estrelas, escape de HTML e montagem do registro a partir do JSON da PokeAPI;
- `tests/ranking.test.js`: média por Pokémon, desempate, ordenação pela média exata e limite.

O workflow [`.github/workflows/ci.yml`](https://github.com/gbrlzzz/bootcamp2-projeto-final/blob/main/.github/workflows/ci.yml) roda os mesmos comandos (Node 20) em toda PR para a main e em todo push na main.

## 5. Evidências

### PR bloqueada pelo CI (teste de fogo)
Na [PR #4](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/4), o primeiro push trouxe um teste quebrado de propósito: esperava média 5 para um Pokémon com nota 3. O check obrigatório `CI - Testes / testes` ficou vermelho e o botão **Merge pull request** ficou desabilitado:

![PR #4 bloqueada pelo CI](https://raw.githubusercontent.com/gbrlzzz/bootcamp2-projeto-final/main/docs/evidencias/pr4-bloqueada-pelo-ci.jpg)

Logo depois o teste foi corrigido na mesma PR ([execução que falhou](https://github.com/gbrlzzz/bootcamp2-projeto-final/actions/runs/40242319571)), o check ficou verde e o merge foi liberado.

### Conflito de merge resolvido
As PRs [#2](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/2) (Supabase) e [#3](https://github.com/gbrlzzz/bootcamp2-projeto-final/pull/3) (Docker) saíram do mesmo ponto da main, e as duas criaram uma seção **"Como executar"** no fim do README: uma com a execução local, a outra com o Docker. Depois do merge da #2, o GitHub marcou a #3 como *conflicting*.

Resolução:
1. `git checkout feature/docker` e `git merge origin/main`. O Git parou com `CONFLICT (content): Merge conflict in README.md`;
2. O conflito estava entre os marcadores `<<<<<<<` / `=======` / `>>>>>>>`. Nenhum dos dois lados estava errado, então mantive os dois, cada um em uma subseção (**Localmente** e **Com Docker**);
3. Antes de commitar, construí e rodei a imagem com o código já combinado, para confirmar que o Docker servia o mural novo;
4. Commit `Resolve conflito no README: mantem execucao local e via Docker` e push. O CI rodou de novo, ficou verde, e a #3 foi mesclada.

Aprendizado: duas branches que mexem no mesmo trecho de um arquivo compartilhado vão conflitar. Vale combinar antes quem cria cada seção, ou atualizar a branch com a main antes de abrir a PR.

### Outras evidências no GitHub
- Aba [Pull requests (fechadas)](https://github.com/gbrlzzz/bootcamp2-projeto-final/pulls?q=is%3Apr+is%3Aclosed): todas as PRs têm descrição (o que, por que, como testar), revisão com comentário no código e o check `testes` verde no merge;
- [Actions](https://github.com/gbrlzzz/bootcamp2-projeto-final/actions): histórico de execuções do CI, incluindo a falha da PR #4.

## 6. Uso de IA

Usei o **Claude Code** (assistente de IA da Anthropic) como assistente neste projeto: na escrita do código e dos testes, na configuração do GitHub Actions, do Docker e do Supabase, na abertura das PRs e na redação deste README. Por isso alguns commits das PRs aparecem com `Co-Authored-By: Claude`. A revisão automática da PR #4 foi feita pelo Codex, que também é uma ferramenta de IA.
