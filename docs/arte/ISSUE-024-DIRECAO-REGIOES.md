# Issue #24 — Direção Visual da tela de Regiões

**Status:** handoff aprovado para Desenvolvimento  
**Referência visual:** primeira composição vertical aprovada pelo líder em 2026-09-19.

## Consulta da Direção Visual

```text
REFERENCIA_APROVADA = composição vertical tropical com 11 destinos e Região 11 especial
ALTERACAO_PEDIDA    = implementar a tela; header dinâmico coerente com a Home
DADOS_DINAMICOS     = HUD, números/nomes, progresso, estados, locks, CTAs, 0/9..9/9, Ilha 10, Grande Baú
ASSET_DECISION      = ADAPTAR/PROMOVER a composição aprovada; não redesenhar
```

## Plano de assets

| Slot | Função | Decisão |
|---|---|---|
| map-base | cenário/rota/11 destinos | ADAPTAR e PROMOVER |
| header | HUD compartilhado | UI/CSS dinâmico |
| region-data | status/progresso/CTA | UI/CSS dinâmico |
| final-map | 9 fragmentos | UI/CSS dinâmico sobre slots da arte |
| island-10 | estado final | UI/CSS dinâmico |
| grand-chest | estado da recompensa | UI/CSS dinâmico |

## Regras

- preservar integralmente a composição aprovada;
- não usar as duas gerações posteriores descartadas pelo líder;
- não embutir dados mutáveis em raster;
- manter leitura mobile-first;
- Região 11 recebe maior peso visual sem transformar o Grande Baú em um 31º baú;
- header reaproveita madeira/dourado e hierarquia funcional da Home.

## Handoff

Direção Visual → Orquestrador → Desenvolvimento.
