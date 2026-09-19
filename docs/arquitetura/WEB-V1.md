# Arquitetura Web V1 — Tabuada Quest 2.0

**Issue:** #4  
**Status:** vigente  
**Data:** 2026-09-19

## Objetivo

Organizar a V1 de forma que:

- a mesma fonte `web/` rode no navegador e no Android WebView;
- UI, domínio, estado, conteúdo e persistência permaneçam separados;
- regras de domínio sejam testáveis sem DOM;
- a experiência nasça mobile-first;
- cada tela possa ter composição própria;
- o jogo não dependa de framework ou etapa de bundle para executar.

## Restrições

- Java no wrapper Android.
- HTML/CSS/JavaScript na experiência web.
- Nenhuma duplicação manual de `web/` em `app/src/main/assets/`.
- Nenhuma regra de gameplay dentro de `MainActivity.java`.
- Nenhum scheduler pedagógico implementado nesta issue.
- Nenhuma decisão de economia antiga é reintroduzida silenciosamente.

## Estrutura

```text
web/
├── index.html
├── assets/
├── css/
│   ├── app.css
│   ├── tokens.css
│   ├── base.css
│   └── screens/
│       └── home.css
└── js/
    ├── app.js
    ├── core/
    │   └── screen-manager.js
    ├── content/
    │   └── game-content.js
    ├── domain/
    │   └── player-state.js
    ├── persistence/
    │   └── local-storage.js
    └── screens/
        └── home-screen.js

tests/
└── web/
    ├── player-state.test.cjs
    └── local-storage.test.cjs
```

## Estratégia de JavaScript

A V1 não exige bundler.

Os arquivos são carregados como scripts clássicos em ordem explícita e compartilham apenas o namespace:

```text
globalThis.TabuadaQuest
```

Motivos:

- funciona diretamente no GitHub Pages;
- funciona em `file:///android_asset/index.html`;
- evita dependência de import ES module em origem `file://`;
- mantém arquivos físicos separados;
- permite testes de domínio via Node sem abrir UI.

Cada módulo deve expor apenas sua API pública no namespace.

## Camadas

### content

Somente conteúdo estático e referências aprovadas:

- nomes de Regiões quando existirem;
- caminhos canônicos de assets;
- totais globais aprovados;
- textos curtos da UI.

Não contém estado mutável.

### domain

Regras puras e estruturas de estado.

Não usa:

- DOM;
- localStorage diretamente;
- WebView;
- APIs de navegador.

Pode ser testado isoladamente.

### persistence

Responsável por:

- serialização;
- leitura;
- gravação;
- versionamento;
- migração;
- recuperação segura.

Recebe um adaptador de storage. Não depende do DOM.

### screens

Renderização e interação de uma tela específica.

Cada tela pode possuir:

- HTML próprio;
- CSS próprio;
- orientação/composição própria.

Não deve conter regra pedagógica.

### core

Coordenação de telas e infraestrutura transversal.

### app.js

Bootstrap mínimo:

1. carrega estado;
2. escolhe tela inicial;
3. renderiza;
4. conecta eventos essenciais.

## Direção mobile obrigatória

Referência:

```text
docs/referencias/V1-DIRECAO-MOBILE.md
```

A origem da composição é celular.

Regras:

- tela principal usa `100dvh`;
- ação principal deve ser identificável sem rolagem inicial;
- Home não é landing page;
- desktop adapta a experiência mobile;
- telas diferentes podem usar malhas diferentes;
- gameplay pode usar landscape quando explicitamente aprovado;
- scroll é usado apenas quando o conteúdo realmente exigir.

## Estado persistente V1

Chave:

```text
tabuadaQuest.playerState
```

Versão inicial:

```text
schemaVersion = 2
```

Estrutura mínima:

```text
{
  schemaVersion,
  player: {
    id,
    displayName,
    avatarId
  },
  campaign: {
    currentRegionId,
    currentIslandId,
    unlockedRegionIds,
    completedIslandIds,
    petsRescuedIds,
    claimedChestIds,
    specialMaps,
    diamonds
  },
  ui: {
    lastScreen,
    homeBackgroundId
  }
}
```

### specialMaps

Existem 5 mapas aprovados.

Cada um possui:

```text
{
  fragments,
  missionStatus,
  rewardClaimed
}
```

Estados previstos:

- `collecting`
- `mission-pending`
- `mission-in-progress`
- `completed`

A transição pedagógica completa será definida nas issues próprias. Esta issue apenas prepara o contrato persistente.

## Migração

Toda leitura:

1. parseia;
2. valida forma mínima;
3. migra versões antigas conhecidas;
4. em dado inválido, preserva segurança e volta ao estado inicial;
5. nunca concede recompensa durante migração.

## Testes

Testes vivem fora de `web/` para não serem publicados no Pages.

Runner:

```text
node --test tests/web/*.test.cjs
```

Workflow:

```text
.github/workflows/web-unit-tests.yml
```

O domínio é carregado sem DOM e sem navegador.

## Preview

URL oficial:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Workflow:

```text
.github/workflows/web-preview-pages.yml
```

Toda issue que alterar `web/` deve validar o preview antes do fechamento.

## Android

O source set Android continua apontando para:

```text
../web
```

Entrada:

```text
file:///android_asset/index.html
```

Nenhuma cópia paralela é permitida.


### Personalização do fundo da Home

O fundo da Home é uma preferência visual persistente do jogador.

Catálogo:

```text
TQ.content.homeBackgrounds
```

Preferência:

```text
state.ui.homeBackgroundId
```

Padrão inicial:

```text
pirate-main
→ ./assets/ui/home-pirata-fundo-principal.webp
```

Regras:

- apenas fundos aprovados/promovidos entram no catálogo;
- id desconhecido deve cair no fundo padrão;
- seleção de fundo não altera gameplay/progressão;
- estado v1 migra automaticamente para schema v2 com `pirate-main`;
- novos fundos podem ser adicionados sem duplicar a tela Home.
