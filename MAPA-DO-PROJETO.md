# MAPA-DO-PROJETO — Tabuada Quest 2.0

## Função

Este arquivo é o **índice físico e de acesso ao conhecimento** do projeto.

Ele responde:

- quem detém cada tipo de conhecimento;
- onde está a implementação;
- onde ficam assets, testes, workflows e builds;
- qual arquivo deve ser consultado antes de alterar um domínio.

Ele **não é um histórico de issues**.

## Ordem de leitura

Toda IA/agente deve ler:

```text
1. ORQUESTRADOR.md
2. MAPA-DO-PROJETO.md
3. persona dona do domínio
4. issue ativa, se houver
5. implementação física necessária
```

## Fonte de verdade por domínio

| Domínio | Fonte canônica |
|---|---|
| Produto / escopo / comportamento global | `agentes/01-produto.md` |
| Game Design / aprendizagem / scheduler / recompensas pedagógicas | `agentes/02-game-design-aprendizagem.md` |
| Arte / composição / assets / identidade / pixel-map visual | `agentes/03-direcao-visual.md` |
| Arquitetura / código / persistência / integração | `agentes/04-desenvolvimento.md` |
| Testes / build / regressão / release | `agentes/05-qualidade-build.md` |
| UX infantil / legibilidade / clareza | `agentes/06-experience-validator.md` |
| Ordem de trabalho / dependências / handoff | `ORQUESTRADOR.md` |

### Regra

```text
ISSUE != fonte de verdade
```

Issues representam somente tarefas concretas de implementação ou correção.

Coordenação, dependências conceituais, handoffs e definição de qual persona deve atuar pertencem ao `ORQUESTRADOR.md`.

Se uma issue contiver detalhe de produto, arte, código ou UX que não esteja na persona responsável, retirar esse conteúdo da issue e migrá-lo para a persona antes de prosseguir.

## Branches

### main

Fonte canônica do 2.0.

### apoio

Material histórico/referência. Nada da `apoio` entra automaticamente na `main`.

## Aplicação Web

Entrada:

```text
web/index.html
web/js/app.js
```

Arquitetura:

```text
web/js/content/      → catálogos/configuração
web/js/domain/       → regras puras
web/js/persistence/  → armazenamento/migrações
web/js/core/         → infraestrutura compartilhada
web/js/screens/      → telas
web/css/             → estilos
```

Fonte executável canônica:

```text
web/
```

## Android

Projeto:

```text
app/
build.gradle.kts
settings.gradle.kts
gradle.properties
```

Modelo:

```text
Java + WebView
→ consome a aplicação de web/
```

A regra técnica completa pertence a `agentes/04-desenvolvimento.md`.

APK debug esperado:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Workflows

```text
.github/workflows/web-unit-tests.yml
.github/workflows/web-preview-pages.yml
.github/workflows/android-debug.yml
```

Preview:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

## Testes Web

Diretório:

```text
tests/web/
```

Suítes atuais:

```text
gameplay-session.test.cjs
local-storage.test.cjs
player-state.test.cjs
region-1-map-layout.test.cjs
region-1-rewards.test.cjs
region-identities.test.cjs
regions-content.test.cjs
regions-layout.test.cjs
scheduler.test.cjs
world-map.test.cjs
```

## Assets

Raiz:

```text
web/assets/
```

Estrutura:

```text
avatars/
backgrounds/
frames/
global/
pets/
regions/
transitions/
ui/
MANIFESTO.md
README.md
```

Somente assets promovidos para `web/assets/` são canônicos de produção.

Arquivos soltos na raiz do repositório não devem ser tratados automaticamente como assets de produção.

## Avatares-base

```text
web/assets/avatars/avatar-luna-visual-base.webp
web/assets/avatars/avatar-maya-visual-base.webp
web/assets/avatars/avatar-sofia-visual-base.webp
```

Regras de preservação: `agentes/03-direcao-visual.md`.

## Telas de Região

Implementação atual:

```text
web/js/screens/islands-screen.js
web/css/screens/vertical-slice.css
web/js/content/game-content.js
```

Padrão visual e coordenadas: `agentes/03-direcao-visual.md`.

Regra técnica de compartilhamento: `agentes/04-desenvolvimento.md`.

### CORSÁRIO

Assets:

```text
web/assets/regions/region-1/
```

Background canônico atual:

```text
web/assets/regions/region-1/mapa_marítimo_do_corsário.png
```

Ilhas visíveis atuais:

```text
island-01-unlocked.png / island-01-locked.png
...
island-05-unlocked.png / island-05-locked.png
```

Assets 06–10 existentes pertencem à implementação de **CORSÁRIO 2** e devem ser reutilizados nos cinco slots da malha compartilhada.

```text
CORSÁRIO 1 → assets 01–05
CORSÁRIO 2 → assets 06–10
```

A implementação continua em `web/js/screens/islands-screen.js` e usa a infraestrutura compartilhada registrada em `agentes/04-desenvolvimento.md`.

## Mapa mundo

Asset:

```text
web/assets/global/mapa-mundo.png
```

Catálogo:

```text
TQ.content.assets.global.worldMap
```

Controlador:

```text
web/js/core/world-map.js
TQ.core.worldMap.open({ onNavigate })
```

Destino futuro reservado:

```text
world-map
```

Regra funcional: `agentes/01-produto.md`.

Regra visual: `agentes/03-direcao-visual.md`.

Regra técnica: `agentes/04-desenvolvimento.md`.

## Scheduler e aprendizagem

Implementação:

```text
web/js/domain/scheduler.js
web/js/domain/gameplay-session.js
```

Contrato pedagógico: `agentes/02-game-design-aprendizagem.md`.

## Estado e persistência

```text
web/js/domain/player-state.js
web/js/persistence/
```

Contrato técnico: `agentes/04-desenvolvimento.md`.

O schema vigente deve ser lido do código. Não usar números copiados de documentação histórica sem verificar.

## Viagem entre Ilhas

```text
web/js/screens/travel-screen.js
web/assets/transitions/island-travel.mp4
```

Comportamento de produto: `agentes/01-produto.md`.

Implementação/persistência: `agentes/04-desenvolvimento.md`.

Validação infantil: `agentes/06-experience-validator.md`.

## Home / Moda / Provador

Tela:

```text
web/js/screens/home-screen.js
web/css/screens/home.css
```

Catálogos/estado:

```text
web/js/content/game-content.js
web/js/domain/player-state.js
```

Regra de produto `selecionar != equipar`: `agentes/01-produto.md`.

Implementação de prévia: `agentes/04-desenvolvimento.md`.

Validação de clareza: `agentes/06-experience-validator.md`.

## Documentos em docs/

`docs/` permanece disponível como:

- histórico;
- evidência;
- auditoria;
- referência de decisões anteriores.

Ele **não supera as personas canônicas**.

Em conflito:

```text
decisão mais recente do líder
→ persona responsável
→ MAPA-DO-PROJETO
→ código vigente
→ docs históricos
```

## Issues

Issues servem somente para execução concreta.

Formato esperado:

```text
TAREFA
PRONTO
```

O Orquestrador, e não a issue, controla dependências, personas, handoffs e ordem.

Não colocar em issue:

- direção de arte detalhada;
- arquitetura completa;
- regras permanentes de produto;
- contratos pedagógicos;
- manuais de implementação;
- histórico de commits;
- logs extensos.

Essas informações pertencem às personas e a este mapa de acesso.

## Regra para novos caminhos

Se um trabalho criar/mover:

- pasta;
- asset canônico;
- workflow;
- build;
- tela;
- controlador;
- teste;
- artefato;

atualizar este MAPA no mesmo trabalho.

Nunca adivinhar caminhos.
