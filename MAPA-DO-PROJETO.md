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

### CORSÁRIO / legado de transição

Assets físicos atuais:

```text
web/assets/regions/region-1/
```

Backgrounds atuais:

```text
web/assets/regions/region-1/mapa_marítimo_do_corsário.png
web/assets/regions/region-1/corsario-2-background.jpg
```

A implementação corrente ainda contém duas composições históricas sob a mesma Região:

```text
corsario-1
corsario-2
```

Isso é **legado pendente de migração**.

Contrato canônico atual:

```text
22 Regiões
5 Ilhas por Região
sem sub-regiões
uma composição de Região por Região real
```

Enquanto os novos assets das Ilhas são refeitos, as duas composições históricas da CORSÁRIO permanecem limpas, sem arte/hitbox de Ilha e sem status textual.

Implementação física do legado:

```text
web/js/screens/islands-screen.js
web/js/content/game-content.js
web/css/screens/vertical-slice.css
```

Migração estrutural futura deve atuar principalmente em:

```text
web/js/content/game-content.js
web/js/domain/scheduler.js
web/js/domain/player-state.js
web/js/screens/islands-screen.js
tests/web/
```

Regras de Produto: `agentes/01-produto.md`.

Regras pedagógicas: `agentes/02-game-design-aprendizagem.md`.

Contrato técnico-alvo: `agentes/04-desenvolvimento.md`.

Não usar os paths/nomes históricos `corsario-1/corsario-2` como modelo para novas Regiões.

### OBSIDIANA / Região 13

Assets de composição canônicos:

```text
web/assets/regions/region-13/background.png
web/assets/regions/region-13/island-01-unlocked.png
web/assets/regions/region-13/island-01-locked.png
web/assets/regions/region-13/island-02-unlocked.png
web/assets/regions/region-13/island-02-locked.png
web/assets/regions/region-13/island-03-unlocked.png
web/assets/regions/region-13/island-03-locked.png
web/assets/regions/region-13/island-04-unlocked.png
web/assets/regions/region-13/island-04-locked.png
web/assets/regions/region-13/island-05-unlocked.png
web/assets/regions/region-13/island-05-locked.png
```

Ordem canônica:

```text
1 Rocha Negra
2 Cinzas
3 Fogo Obsidiano
4 Cratera
5 Coração de Obsidiana
```

A composição usa `REGION_VISUAL_CONFIG[13]` em `web/js/screens/islands-screen.js`.

As Ilhas permanecem assets dinâmicos sobre o background. O background não deve receber as Ilhas incorporadas. Cada Ilha possui versões normal e bloqueada próprias.


## Nomes temporários de Ilha

Fallback de conteúdo:

```text
web/js/content/game-content.js
TQ.content.createTemporaryIslandIdentity(regionId, islandId)
TQ.content.getIslandIdentity(regionId, islandId)
```

Quando não existe identidade nominal cadastrada para uma Ilha canônica, `getIslandIdentity` fornece um placeholder estável com palavra + número e `isPlaceholder: true`.

Fonte de Produto: `agentes/01-produto.md`.

## Mapas textuais por Região

Catálogo:

```text
web/js/content/game-content.js
TQ.content.regionTextMaps
TQ.content.getRegionTextMaps(regionId)
```

Regiões atualmente definidas:

```text
1  CORSÁRIO
13 OBSIDIANA
14 ZONA RUBI
15 ESCARLATE
```

A representação vigente é somente textual. Não existem assets desses mapas nesta etapa.

Fonte de Produto: `agentes/01-produto.md`.

Este catálogo é independente do legado `campaign.specialMaps` até que uma tarefa de migração/integração seja executada.

## Mapa mundo

Asset de acesso:

```text
web/assets/global/mapa-mundo.png
```

Catálogo canônico das 22 Regiões:

```text
web/js/content/game-content.js
TQ.content.worldRegions
TQ.content.getWorldRegion(regionId)
```

Controlador:

```text
web/js/core/world-map.js
TQ.core.worldMap.open({ onNavigate })
```

Tela temporariamente navegável:

```text
web/js/screens/world-map-screen.js
web/css/screens/world-map.css
```

Testes:

```text
tests/web/world-map.test.cjs
tests/web/world-regions.test.cjs
```

Preview de desenvolvimento:

```text
web/js/app.js
web/js/screens/islands-screen.js
TQ.screens.islands.getImplementedRegionIds()
TQ.screens.islands.getDevelopmentRegionStatus(regionId)
```

Regiões com configuração visual válida em `REGION_VISUAL_CONFIG` entram automaticamente como concluídas/liberadas para inspeção no preview.

A Região escolhida no Mapa Mundo e seu status automático de desenvolvimento são mantidos somente em memória/renderização. Não alteram `campaign.currentRegionId`, desbloqueios, conclusão ou progresso persistente.

Destino final: **modo somente visualização**.

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

## Recompensas de partida e de Ilha

Catálogo e kits:

```text
web/js/content/game-content.js
TQ.content.gameplayRewards
TQ.content.regionRewards
TQ.content.chestKits
TQ.content.getChestKit(chestId)
```

Aplicação/persistência:

```text
web/js/domain/player-state.js
TQ.domain.playerState.completeGameplaySession(...)
TQ.domain.playerState.calculateCrewReward(...)
TQ.domain.playerState.grantXp(...)
```

Apresentação:

```text
web/js/screens/chest-screen.js
web/js/screens/result-screen.js
```

Testes:

```text
tests/web/rewards.test.cjs
tests/web/crew.test.cjs
tests/web/region-1-rewards.test.cjs
```

Produto: `agentes/01-produto.md`. Balanceamento: `agentes/02-game-design-aprendizagem.md`. Implementação: `agentes/04-desenvolvimento.md`.

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

## Tripulação / Taberna

Tela:

```text
web/js/screens/crew-screen.js
web/css/screens/crew.css
```

Catálogo/estado:

```text
web/js/content/game-content.js
web/js/domain/player-state.js
```

Assets:

```text
web/assets/crew/
```

Produto: `agentes/01-produto.md`. Balanceamento: `agentes/02-game-design-aprendizagem.md`. Implementação: `agentes/04-desenvolvimento.md`.

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
