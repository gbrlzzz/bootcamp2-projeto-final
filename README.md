# Pokédex do Time — Bootcamp II · Projeto Final

Aplicação web colaborativa construída na Etapa 03, evoluindo a Pokédex das Etapas 01 e 02.

## Integrantes

| Nome | Matrícula | GitHub | Funcionalidade | Principal PR |
|------|-----------|--------|----------------|--------------|
| Gabriel Soares Gomes de Souza | 22553852 | [@gbrlzzz](https://github.com/gbrlzzz) | Todas (grupo de 1 integrante) | _a definir_ |

## Divisão de funcionalidades

| Funcionalidade | Responsável | Branch |
|----------------|-------------|--------|
| Testes + GitHub Actions | Gabriel | `feature/testes-ci` |
| Avaliações com Supabase | Gabriel | `feature/avaliacoes-supabase` |
| Docker / Docker Hub | Gabriel | `feature/docker` |
| Ranking do time | Gabriel | `feature/ranking` |

Ponto de partida: código da Etapa 02 na pasta [`app/`](app/).

## Como executar

1. Clone: `git clone https://github.com/gbrlzzz/bootcamp2-projeto-final.git`
2. Sirva a pasta `app/` (ex.: `python3 -m http.server 5500 -d app`) e abra http://localhost:5500
3. O `app/config.js` já aponta para o Supabase do time; para usar outro banco, rode `docs/setup_supabase.sql` no seu projeto e troque a URL e a chave.
