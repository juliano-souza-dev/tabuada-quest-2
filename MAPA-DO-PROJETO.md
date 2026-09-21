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
development-preview.test.cjs
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

### CORSÁRIO / Região 1

Assets ativos:

```text
web/assets/regions/region-1/mapa_marítimo_do_corsário.png
web/assets/regions/region-1/island-01-unlocked.png
web/assets/regions/region-1/island-01-locked.png
web/assets/regions/region-1/island-02-unlocked.png
web/assets/regions/region-1/island-02-locked.png
web/assets/regions/region-1/island-03-unlocked.png
web/assets/regions/region-1/island-03-locked.png
web/assets/regions/region-1/island-04-unlocked.png
web/assets/regions/region-1/island-04-locked.png
web/assets/regions/region-1/island-05-unlocked.png
web/assets/regions/region-1/island-05-locked.png
```

Configuração ativa:

```text
web/js/screens/islands-screen.js
REGION_VISUAL_CONFIG[1]
```

CORSÁRIO possui uma única composição com as 5 Ilhas renderizadas. Não existe segunda página/sub-região ativa.

Telas de desafio imersivas da Região 1:

```text
web/assets/regions/region-1/challenges/island-01-challenge.webp
web/assets/regions/region-1/challenges/island-02-challenge.webp
web/assets/regions/region-1/challenges/island-03-challenge.webp
web/assets/regions/region-1/challenges/island-04-challenge.webp
web/assets/regions/region-1/challenges/island-05-challenge.webp
```

Associação executável:

```text
web/js/content/game-content.js
TQ.content.assets.region1ChallengeArt
```

Renderer:

```text
web/js/screens/challenge-screen.js
```

A arte contém cenário, placas e estrutura visual. Progresso, operação matemática, respostas e feedback são sempre dados dinâmicos sobrepostos por HTML/CSS/JS.

As coordenadas do conteúdo não são globais. Cada Ilha pode possuir sua própria malha visual em:

```text
web/js/screens/challenge-screen.js
CHALLENGE_ART_LAYOUTS[regionId][islandId]
```

O código deve se adaptar às áreas vazias da arte aprovada.

Arquivos históricos das antigas Ilhas 06–10 ou do segundo background podem permanecer fisicamente em `web/assets/regions/region-1/` até limpeza de assets, mas não pertencem ao catálogo executável.

### Macroestrutura canônica do mundo

Fonte estrutural:

```text
web/js/domain/world-structure.js
```

Contrato:

```text
22 Regiões
5 Ilhas por Região
110 Ilhas
```

APIs:

```text
TQ.domain.worldStructure.toGlobalIslandIndex(regionId, islandId)
TQ.domain.worldStructure.fromGlobalIslandIndex(globalIslandIndex)
```

`fromLegacyLocation(...)` existe exclusivamente para migração de saves anteriores.

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


### ZONA RUBI / Região 14

Assets canônicos de produção:

```text
web/assets/regions/region-14/background.webp
web/assets/regions/region-14/carmesim_unlocked.webp
web/assets/regions/region-14/carmesim_locked.webp
web/assets/regions/region-14/coroa_rubi_unlocked.webp
web/assets/regions/region-14/coroa_rubi_locked.webp
web/assets/regions/region-14/pedras_rosada_unlocked.webp
web/assets/regions/region-14/pedras_rosada_locked.webp
web/assets/regions/region-14/pedras_rubras_unlocked.webp
web/assets/regions/region-14/pedras_rubras_locked.webp
web/assets/regions/region-14/rubi_do_rei_unlocked.webp
web/assets/regions/region-14/rubi_do_rei_locked.webp
```

Ordem canônica:

```text
1 Carmesim
2 Coroa Rubi
3 Pedras Rosada
4 Pedras Rubras
5 Rubi do Rei
```

A composição usa `REGION_VISUAL_CONFIG[14]`. O background permanece separado das Ilhas, e a pasta de produção da Região 14 não mantém duplicatas PNG.

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
web/js/domain/world-structure.js
web/js/domain/scheduler.js
web/js/domain/gameplay-session.js
web/js/domain/player-state.js → learning.schedulerState
```

Invariantes:

```text
20 planned / Ilha
100 planned / Região
2200 planned / campanha
recovery contínuo entre fronteiras de Região
```

Contrato pedagógico: `agentes/02-game-design-aprendizagem.md`.

## Recompensas de partida e de Ilha

Catálogo e kits:

```text
web/js/content/game-content.js
TQ.content.gameplayRewards
TQ.content.regionRewards
TQ.content.getIslandRewards(regionId, islandId)
TQ.content.getIslandPrimaryReward(regionId, islandId)
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
web/js/screens/result-screen.js
web/js/screens/chest-screen.js
web/js/screens/pet-screen.js
web/js/screens/map-reward-screen.js
```

Fluxo vigente:

```text
fim da partida
→ Resultado
→ ao escolher Ilhas/Regiões:
   PET → pet-screen
   Baú → chest-screen
   fragmento de Mapa → map-reward-screen
   demais → destino direto
→ destino originalmente escolhido
```

Testes:

```text
tests/web/rewards.test.cjs
tests/web/crew.test.cjs
tests/web/region-1-rewards.test.cjs
```

Produto: `agentes/01-produto.md`. Distribuição e cálculo de Rubis: `agentes/02-game-design-aprendizagem.md`. Implementação: `agentes/04-desenvolvimento.md`.

A Direção Visual deve consultar a mesma distribuição antes de gerar qualquer Ilha, para definir o badge/medalhão correto. Regra visual: `agentes/03-direcao-visual.md`.

Fechamento da campanha:

```text
global 109 → Rubi
global 110 → Baú Final
```

O Baú Final usa `chestId = "final-grand-chest"`. O valor generoso de Rubis do Baú Final e a implementação completa dos Colecionáveis permanecem pendentes das regras de balanceamento ainda abertas.

Contrato de Rubi:

```text
primeira conclusão de Ilha ruby
→ Rubis-base = max(0, correctAnswers - wrongAnswers)
→ aplicar bônus de gemas da Tripulação
```

## Estado e persistência

```text
web/js/domain/player-state.js
web/js/persistence/local-storage.js
```

Schema vigente:

```text
schemaVersion = 9
```

O migrador v8 → v9 converte coordenadas 11×10 pela posição global, reconstrói `regionProgress` 22×5 e preserva sessão, viagens, recompensas e progresso econômico.

Referências a estruturas 11×10 dentro do migrador são compatibilidade histórica, não arquitetura ativa.

Contrato técnico: `agentes/04-desenvolvimento.md`.

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


## Colecionáveis

Catálogo:

```text
web/js/content/game-content.js
TQ.content.collectibles
TQ.content.getCollectible(id)
```

Tela:

```text
web/js/screens/collectibles-screen.js
web/css/screens/collectibles.css
```

Estado:

```text
web/js/domain/player-state.js
campaign.collectibles
```

Acesso: Home → Colecionáveis.

Contrato de Produto: `agentes/01-produto.md`.
Estados/arte futura: `agentes/03-direcao-visual.md`.
Implementação: `agentes/04-desenvolvimento.md`.
Validação: `agentes/05-qualidade-build.md` e `agentes/06-experience-validator.md`.


### Integração Baú → Colecionáveis

```text
web/js/content/game-content.js
→ chestKits
→ gameplayRewards.collectibles

web/js/domain/player-state.js
→ calculateChestCollectibleOutcome(...)
→ processChestCollectibles(...)

web/js/screens/chest-screen.js
→ apresenta os Colecionáveis efetivamente recebidos
```

Regra de fila: 1 pendência por Baú normal; Baú Final absorve todas.


### Economia de partida

```text
web/js/domain/player-state.js
→ calculateGoldBaseAmount
→ getCollectibleBonusPercent
→ calculateRewardBonuses
```

Parâmetros em `TQ.content.gameplayRewards`.

PETs provisórios:

```text
TQ.content.pets
TQ.content.getPet(petId)
```

Baú Final: 5.000 Rubis-base.


## Missões Especiais

Domínio:

```text
web/js/domain/special-mission.js
```

Tela:

```text
web/js/screens/special-mission-screen.js
```

Estado/economia:

```text
web/js/domain/player-state.js
campaign.specialMaps[mapId].mission
campaign.specialMaps[mapId].lastMissionResult
```

Entradas:

```text
web/js/screens/result-screen.js
web/js/screens/regions-screen.js
```

Feedback compartilhado:

```text
web/css/screens/vertical-slice.css
.feedback-card.is-correct
.feedback-card.is-wrong
```


Missões Especiais usam a economia global de partida:

```text
XP 20
Ouro = max(0, 10×acertos - 2×erros)
Rubi = acertos×2
```


## Loja

```text
web/js/screens/shop-screen.js
web/css/screens/shop.css
web/js/content/game-content.js → shopCatalog
web/js/domain/player-state.js → shop.purchasedItemIds / purchaseShopItem(...)
```

Acesso: Home → Loja.

Abas: Molduras | Fundos | Estaleiro.

Estaleiro atual:

```text
Colombo 1.000
Rosa Intenso 3.000
Cristal Queen 9.000
```

A Loja compra, mas não equipa.


Catálogo inicial de Molduras em:

```text
web/js/content/game-content.js → shopCatalog.frames
```

5 nomes cadastrados; preço e asset ainda pendentes.


Catálogo comercial atual da Loja:

```text
shopCatalog.frames      → 5 Molduras com preço
shopCatalog.backgrounds → 5 Fundos com preço
shopCatalog.ships       → 3 Navios com preço
```

Assets de Molduras/Fundos/Navios permanecem para a etapa visual.


## Personalização da Home

Tela:

```text
web/js/screens/home-screen.js
web/css/screens/home.css
```

Estado:

```text
web/js/domain/player-state.js
shop.purchasedItemIds
shop.equippedShipId
```

Seletores:

```text
Home → Molduras
Home → Fundos
Home → Estaleiro
```

A Loja compra. A Home equipa.

Viagem resolve o vídeo pelo navio equipado em:

```text
web/js/screens/travel-screen.js
```

Fallback: `TQ.content.assets.islandTravel`.


## Loja Rubi

Fonte de Produto:

```text
agentes/01-produto.md → Loja Rubi regional
```

Implementação:

```text
web/js/content/game-content.js
web/js/domain/player-state.js
web/js/screens/ruby-shop-screen.js
web/css/screens/ruby-shop.css
web/js/screens/islands-screen.js
```

Regiões configuradas: `01, 05, 09, 13, 17 e 21`.

A embarcação mercante usa o master global otimizado:

```text
web/assets/global/comercial_ship.webp
```

O master não contém água, espuma ou outro efeito ambiental. Nas telas visuais de Região, a posição da embarcação é resolvida em tempo de execução por `resolveRubyShopShipRect(...)`, evitando colisão com Ilhas, Mapa Mundo e botão de voltar.

No CORSÁRIO, o renderer prioriza a área livre à direita da Ilha 3 e aplica um efeito de contato com água somente pela camada visual da Região.

A versão atual é local e não possui backend, e-mail ou dados de entrega.


## Tela de conclusão de Ilha

Asset global aprovado:

```text
web/assets/global/gb_win.webp
```

Renderer:

```text
web/js/screens/result-screen.js
```

O asset fornece a composição visual de celebração. Região, Ilha, estatísticas, XP, Ouro, recompensas e ações permanecem dinâmicos na aplicação.

Regra visual: `agentes/03-direcao-visual.md`.
Implementação: `agentes/04-desenvolvimento.md`.
