# Issue #3 — Auditoria final de assets

**Data:** 2026-09-19  
**Issue:** #3 — Integrar e validar pacote definitivo de assets renomeados  
**Personas:** Direção Visual + Qualidade e Build  
**Estado:** pronto para validação de preview

## Fontes auditadas

Foram confrontados:

- o pacote completo de referência do jogo;
- o catálogo de renomeação existente;
- a branch `apoio`;
- o contrato atual da Direção Visual em `agentes/03-direcao-visual.md`.

A branch `main` continua sendo a única fonte de produção.

## Resultado

O pacote completo permitiu localizar e confirmar os três avatares-base:

```text
avatar-luna-neutral-base.webp  → avatar-luna-visual-base.webp
avatar-maya-neutral-base.webp  → avatar-maya-visual-base.webp
avatar-sofia-neutral-base.webp → avatar-sofia-visual-base.webp
```

Versões WebP otimizadas foram promovidas para:

```text
web/assets/avatars/
```

A identidade dos personagens foi preservada. Moda futura continua obrigada a comparar lado a lado com estes arquivos-base.

## Assets piratas promovidos

```text
web/assets/ui/home-pirata-banner-aventura.webp
web/assets/ui/home-pirata-botao-aventura.webp
web/assets/ui/icone-mapa-bussola.webp
web/assets/ui/icone-bau-tesouro.webp
web/assets/ui/icone-recompensa-magica.webp
```

Budgets verificados no pacote de referência:

| Asset | Dimensão | Peso | Resultado |
| --- | ---: | ---: | --- |
| Banner | 1280 × 720 | 163 KB | APROVADO |
| Botão | 1280 × 534 | 130 KB | APROVADO |
| Ícone mapa | 512 × 512 | 84 KB | APROVADO |
| Ícone baú | 512 × 512 | 79 KB | APROVADO |
| Ícone recompensa | 512 × 512 | 86 KB | APROVADO |

## Dívida visual registrada

Não foram promovidos:

- fundo principal 1080 × 1918: requer correção para o contrato de 1080 × 1920;
- ícone Axolote Capitão: lista de PETs substituída;
- assets legados de Portal/Mundo;
- assets que reproduzem ou lembram diretamente elementos identificáveis de franquias;
- roupas piratas ainda não validadas individualmente contra os avatares-base;
- catálogo completo de PETs, que será tratado na issue correspondente.

Essas ausências não geram referências quebradas na V1 atual.

## Duplicidades e nomes

O conjunto promovido possui caminhos únicos.

Código novo deve referenciar somente:

```text
web/assets/avatars/
web/assets/ui/
```

Não usar nomes antigos do pacote de referência.

## QA da Issue #3

Validações concluídas:

- [x] fonte canônica única na `main`;
- [x] três avatares-base presentes;
- [x] assets pirate/marítimos aprovados identificados;
- [x] assets promovidos em WebP;
- [x] budgets do conjunto de UI aprovados;
- [x] nomes de produção separados do legado;
- [x] itens reprovados/deferidos documentados;
- [x] preview preparado para mostrar somente assets canônicos.

A última validação da issue é confirmar o deploy público após a alteração em `web/`.
