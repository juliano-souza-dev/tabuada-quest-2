# Issue #26 — Qualidade e Build

## Escopo validado

- geometria canônica da tela;
- transformação cover compartilhada por imagem e overlays;
- labels de estado;
- hitbox de voltar;
- estados da Região 11;
- regressão de testes web;
- publicação do preview;
- build Android Debug.

## Evidências

```text
commit          = 2b89c666af08c8686700058c67d89b5fab06c6d3
Web Unit Tests  = 35486161939 → success
Web Preview     = 35486161868 → success
Android Debug   = 35486161865 → success
```

Teste novo:

```text
tests/web/regions-layout.test.cjs
```

Cobre:

- viewport 941 × 1672;
- hitbox do botão voltar;
- coordenadas documentadas;
- fórmula de cover;
- labels LOCKED / AVAILABLE / IN_PROGRESS / COMPLETED;
- estados de Ilha 10 e Grande Baú Final.

## Resultado

```text
QUALIDADE E BUILD = APROVADO
```
