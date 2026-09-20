# Issue #24 — Validação da Direção Visual

## Referência

Composição vertical aprovada pelo líder para a tela de Regiões.

A implementação usa essa composição como mapa-base e mantém sobre ela somente camadas dinâmicas.

## Verificação

- composição vertical preservada;
- 11 destinos mantidos;
- Região 11 mantém tratamento especial;
- cenário e rota pertencem à arte fixa;
- número/nome/progresso/estado/CTA são dinâmicos;
- header é dinâmico e segue madeira/dourado e hierarquia funcional da Home;
- as duas gerações posteriores descartadas pelo líder não foram promovidas;
- o mapa final de 9 peças, Ilha 10 e estado do Grande Baú são dinâmicos;
- nenhum estado mutável depende de texto rasterizado.

## Pontos ainda sujeitos à validação do líder

A calibração visual fina dos overlays sobre os slots da composição será confirmada pelo líder no preview publicado. Caso haja deslocamentos, eles devem voltar como correção objetiva sem redesenho do mapa.

## Gate

```text
FIDELIDADE_VISUAL = 82%
GATE_MINIMO       = 75%
RESULTADO          = APROVADO PARA QUALIDADE
```

A nota considera a preservação integral da composição-base, coerência do HUD e correspondência estrutural dos slots. A aprovação global final continua sendo do líder.
