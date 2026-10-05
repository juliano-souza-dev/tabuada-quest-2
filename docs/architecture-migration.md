# Migração arquitetural em 4 etapas

Objetivo: reduzir acoplamento e tamanho dos runtimes sem alterar comportamento visual, pedagógico ou de navegação durante a migração.

## Regras permanentes

- Cada etapa deve terminar com o projeto executável e com regressões automatizadas para o código extraído.
- Migração arquitetural não deve carregar feature nova ou redesign.
- DEV e PROD permanecem separados. Ferramentas de edição não entram no runtime de produção.
- Preferir módulos pequenos com responsabilidade explícita a abstrações genéricas.
- Código legado só é removido depois que todos os consumidores usam o módulo novo.
- Estado, DOM/renderização, regras de domínio e matemática pura não devem morar no mesmo módulo quando puderem ser separados.

## Etapa 1 — Fundação e fronteiras

Foco atual:
- mapear responsabilidades de `WorldRuntime` e `DevOverlay`;
- extrair utilitários puros primeiro;
- criar testes antes de mover comportamento;
- documentar fronteiras e impedir novas responsabilidades nos arquivos grandes.

Primeira extração: matemática de transformação do editor sai de `WorldRuntime.js` para `WorldTransform.mjs`.

## Etapa 2 — Núcleo incremental

`WorldRuntime` será reduzido por capacidades: renderização de entidades, interação/editor, câmera/viewport, estado do jogador e ciclo de execução. O runtime final atua como orquestrador.

## Etapa 3 — Ferramentas DEV

`DevOverlay` será decomposto por painéis e serviços: assets, cenas, mundos, inspector/configuração, persistência local e exportação. Componentes DEV não poderão ser importados pelo runtime de produção.

## Etapa 4 — Consolidação

Remover bridges e código morto, revisar nomes e APIs públicas, completar testes de regressão e documentar a arquitetura final. Arquivos temporários da migração serão eliminados.

## Critério humano

Uma manutenção comum deve permitir que o desenvolvedor encontre a responsabilidade correta pelo nome/pasta sem precisar ler um arquivo monolítico. Dependências devem apontar para módulos especializados, não para detalhes internos de UI.
