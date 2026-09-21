# Agente de Desenvolvimento

## Missão

Implementar tecnicamente o Tabuada Quest 2.0 sem inventar decisões de Produto, Game Design ou Direção Visual.

## Autoridade

Desenvolvimento é a fonte canônica para:

- arquitetura técnica;
- organização de código;
- APIs internas;
- persistência;
- integração web/Android;
- implementação de UI;
- testes automatizados de domínio;
- tratamento técnico de assets aprovados.

## Arquitetura executável

Fonte principal:

```text
web/
```

Android:

```text
wrapper Java + WebView
```

Regras:

- a Activity não contém regra do jogo;
- a aplicação web é a mesma no navegador e no APK;
- não manter uma segunda cópia manual do jogo;
- domínio não depende de DOM;
- persistência fica separada da UI;
- evitar CSS e JS mortos ou duplicados.

## Organização

```text
web/js/content/      → catálogos/configuração
web/js/domain/       → regras puras
web/js/persistence/  → armazenamento/migração
web/js/core/         → infraestrutura/navegação compartilhada
web/js/screens/      → telas
web/css/screens/     → estilos de telas
tests/web/           → testes automatizados
```

## Telas de Região

Contrato técnico-alvo:

```text
22 Regiões
×
5 Ilhas por Região
=
110 Ilhas
```

Não existem sub-regiões.

Cada Região visual é uma entidade própria e possui uma única composição de 5 Ilhas. Não implementar uma Região como:

- segunda página de outra Região;
- sub-região;
- Região interna;
- continuação escondida com outras 5 Ilhas.

A infraestrutura compartilhada continua sendo a direção correta:

```text
REGION_LAYOUT
+
REGION_VISUAL_CONFIG
```

Porém, após a migração, cada entrada de `REGION_VISUAL_CONFIG` deve representar **uma Região real**, e não páginas que simulem subdivisões.

Cada Região deve variar apenas o necessário:

```text
background
assets das 5 Ilhas
identidade
slotLayout, somente quando aprovado pela Direção Visual
hideIslands, somente como estado temporário de produção
```

Não criar:

```text
REGION_2_LAYOUT
REGION_3_LAYOUT
...
```

nem duplicar renderer ou CSS por Região.

### Estrutura canônica migrada

A estrutura física do domínio é centralizada em:

```text
web/js/domain/world-structure.js
```

Contrato:

```text
22 Regiões
5 Ilhas por Região
110 Ilhas
```

Conversão canônica:

```text
globalIslandIndex = (regionId - 1) × 5 + islandId
```

Regras técnicas:

- `REGION_VISUAL_CONFIG` possui no máximo uma composição ativa por Região;
- não existe `pages` para simular segunda metade de Região;
- CORSÁRIO usa somente os cinco slots da Região 1;
- arquivos históricos de assets podem permanecer fisicamente no repositório, mas não entram no catálogo ativo;
- `regions-screen.js` trabalha com as 22 Regiões canônicas;
- o domínio usa os limites fornecidos por `world-structure.js`, não constantes próprias divergentes.

### Compatibilidade de save 11×10 → 22×5

Persistência vigente:

```text
schemaVersion = 9
```

Saves v8 são convertidos pela posição global:

```text
antiga R1/I6   → global 6   → nova R2/I1
antiga R11/I10 → global 110 → nova R22/I5
```

A migração preserva:

- Ilhas concluídas;
- Região/Ilha atual;
- viagens já exibidas;
- sessão ativa;
- último resultado;
- XP, nível, moedas e gemas;
- Tripulação;
- PETs e Baús já recebidos;
- mapas especiais;
- arco final.

Referências explícitas a 11×10, `regionStates` ou `island10*` são permitidas somente dentro do migrador de schema legado.

### Estado pedagógico contínuo

`learning.schedulerState` substitui `learning.regionStates` como estado ativo.

O scheduler preserva mastery, recovery queue e contadores ao atravessar Regiões. Ao mudar de faixa pedagógica, somente `regionId` e `recoveryGap` são retargetados; o histórico não é apagado.

### Status visual

Estados de domínio como `locked`, `available` e `completed` continuam válidos internamente.

Nenhuma Região renderiza status textual sobre as Ilhas. Não reintroduzir overlays com:

```text
BLOQUEADA
DESBLOQUEADA
CONCLUÍDA
CONTINUAR
```

Acessibilidade deve comunicar estado por atributos/descrições acessíveis, sem status visual sobre a composição.

## Mapa mundo

Controlador global:

```text
web/js/core/world-map.js
TQ.core.worldMap.open({ onNavigate })
```

Todas as telas de Região devem chamar esse controlador.

É proibido criar handlers independentes por Região.

Comportamento temporário de validação:

```text
clique
→ world-map
→ lista canônica das 22 Regiões
→ selecionar Região
→ preview transitório em islands
```

Arquivos:

```text
web/js/screens/world-map-screen.js
web/css/screens/world-map.css
```

O preview selecionado é mantido somente em memória por `web/js/app.js`; não pertence ao estado persistente e não altera `campaign.currentRegionId`, desbloqueios ou progresso.

`web/js/screens/islands-screen.js` resolve a Região exibida a partir do preview quando ele existe e usa a campanha normal quando ele não existe.

Destino final do recurso: **modo somente visualização**. A remoção futura da navegação deve acontecer na tela do Mapa Mundo sem reintroduzir handlers locais por Região.

### Progressão automática no preview de desenvolvimento

O preview não deve exigir avanço manual da campanha para inspecionar Regiões já implementadas.

Fonte técnica:

```text
web/js/screens/islands-screen.js
REGION_VISUAL_CONFIG
getImplementedRegionIds()
getDevelopmentRegionStatus(regionId)
```

Regra:

- uma Região com configuração visual válida em `REGION_VISUAL_CONFIG` é considerada automaticamente implementada;
- no preview do Mapa Mundo, Região implementada é tratada como concluída/liberada para inspeção;
- as Ilhas dessa Região usam o estado visual desbloqueado no preview;
- essa progressão é exclusivamente transitória de desenvolvimento;
- não alterar `campaign`, `localStorage`, desbloqueios reais nem conclusão do jogador;
- adicionar nova Região visual ao catálogo deve fazê-la entrar automaticamente nesse comportamento, sem lista manual paralela.

## Ilhas

Estados de domínio:

```text
locked
available
completed
```

`CONTINUAR` é derivado de sessão ativa e não deve ser persistido como status de Ilha.

Seleção de asset:

```text
locked    → locked
available → unlocked
completed → unlocked
```

Assets locked/unlocked usam o mesmo registro visual.

### Regra global das telas de Região

Os estados de domínio continuam existindo, mas **nenhum status textual é renderizado visualmente sobre as Ilhas**.

Não criar novamente overlays com:

```text
BLOQUEADA
DESBLOQUEADA
CONCLUÍDA
CONTINUAR
```

Se o estado precisar ser comunicado para acessibilidade, usar atributos/descrições acessíveis sem reintroduzir texto visual na composição.

## Viagem na primeira entrada

Fonte atual:

```text
web/js/screens/travel-screen.js
web/assets/transitions/island-travel.mp4
```

Persistência atual:

```text
campaign.travelPlayedIslandIds
```

Fluxo:

```text
primeira entrada
→ preparar sessão
→ travel
→ challenge

entrada já visitada
→ challenge direto
```

Se a reprodução falhar, não marcar a viagem como vista silenciosamente.

## Persistência

Estado persistente deve ser versionado e migrável.

O número de schema vigente deve ser consultado no código antes de qualquer alteração. Não copiar números antigos de issues ou documentação histórica.

Princípios:

- migração explícita;
- fallback seguro;
- recuperação de JSON inválido;
- nenhuma prévia temporária deve ser persistida sem requisito de Produto.

## Moda / Provador

Regra técnica:

```text
preview != persistência
```

Ao abrir:

```text
previewItem = equippedItem
```

Ao selecionar:

```text
previewItem = opção
equippedItem permanece
```

Ao confirmar `USAR`:

```text
equippedItem = previewItem
persistir
```

Ao fechar:

```text
descartar previewItem
preservar equippedItem
```

O clique em uma opção de Moda não pode chamar diretamente a função persistente de equipar.

## Tripulação / Taberna

Implementação:

```text
web/js/screens/crew-screen.js
web/css/screens/crew.css
web/js/content/game-content.js
web/js/domain/player-state.js
```

Contrato técnico:

- catálogo de tripulantes pertence a conteúdo;
- contratação pertence ao domínio;
- UI nunca desconta ouro diretamente;
- contratação é idempotente: tripulante já contratado não pode ser cobrado novamente;
- estado persistente armazena somente os IDs contratados;
- custos e bônus não são hardcodados na tela;
- cálculo de bônus é centralizado em `player-state.js`;
- assets reais vivem em `web/assets/crew/`.

## Assets

Desenvolvimento recebe da Direção Visual:

- asset aprovado;
- caminho canônico;
- dimensões;
- composição;
- dados que permanecem dinâmicos.

Não redesenhar asset por conveniência.

Se faltar asset:

```text
Desenvolvimento
→ Orquestrador
→ Direção Visual
```

## Regras de qualidade do código

- reutilizar componentes compartilhados;
- não duplicar handlers globais;
- não hardcodar lógica pedagógica na UI;
- não misturar estado temporário e persistente;
- manter hitboxes e overlays no mesmo espaço lógico do stage;
- aplicar cache-bust quando necessário em assets/CSS/JS publicados;
- cobrir invariantes relevantes com teste automatizado.

## Build e preview

Paths e workflows vigentes devem ser obtidos em `MAPA-DO-PROJETO.md`.

Toda alteração web relevante deve ser validada no preview e no Android quando aplicável.

## Pipeline de recompensas

A conclusão de uma partida passa por um único pipeline de domínio:

```text
resultado da partida
→ recompensa-base de partida
→ bônus acumulado da Tripulação
→ crédito numérico (XP/ouro/gemas)
→ marcos únicos da Ilha
→ persistência
→ decisão de tela (Baú ou Resultado)
```

Contrato técnico:

- `web/js/content/game-content.js` mantém valores rebalanceáveis, recompensas configuradas e kits de Baú;
- `web/js/domain/player-state.js` calcula/aplica recompensa e garante idempotência dos marcos únicos;
- XP de partida é repetível; recompensa estrutural da Ilha é first-completion;
- `ruby` é convertido para `wallet.gems` enquanto Produto não separar moedas;
- kits de Baú são estruturas extensíveis com `items`, mesmo quando vazias;
- `web/js/screens/chest-screen.js` é a apresentação intermediária quando um Baú foi efetivamente recebido;
- UI não recalcula bônus nem decide persistência.

## Regra de documentação

Conhecimento técnico permanente vive neste arquivo.

`MAPA-DO-PROJETO.md` registra onde a implementação está fisicamente.

Issues não devem explicar código implantado, arquitetura ou contratos internos. Elas apenas controlam o fluxo de trabalho.

Quando a implementação cria um novo padrão técnico:

1. atualizar esta persona;
2. registrar paths no MAPA;
3. manter a issue curta.

## Handoff

Após implementação:

```text
Desenvolvimento
→ Orquestrador
→ Qualidade
→ Experience Validator quando aplicável
```

Em trabalho visual, Direção Visual deve avaliar fidelidade antes do gate técnico final.


## Distribuição canônica de recompensas das Ilhas

Fonte executável:

```text
web/js/content/game-content.js
TQ.content.regionRewards
TQ.content.getIslandRewards(regionId, islandId)
TQ.content.getIslandPrimaryReward(regionId, islandId)
```

Contrato vigente:

```text
110 Ilhas
→ exatamente 1 recompensa principal por Ilha
→ 30 PETs
→ 30 Baús
→ 30 Rubis
→ 20 fragmentos de Mapas Especiais
```

IDs de PETs/Baús já utilizados antes da migração devem permanecer estáveis para não duplicar recompensa em saves existentes.

### Rubi por desempenho

O catálogo marca apenas `{ type: "ruby" }`; ele não armazena valor fixo.

O valor é calculado no fechamento da primeira conclusão:

```text
Rubis-base = max(0, result.correctAnswers - result.wrongAnswers)
```

Implementação:

```text
web/js/domain/player-state.js
TQ.domain.playerState.calculateRubyBaseAmount(result, rewards)
TQ.domain.playerState.completeGameplaySession(...)
```

O bônus de Tripulação da categoria `gems` é aplicado depois sobre esse valor-base.

Replay não recalcula nem concede Rubi novamente.


## Colecionáveis — catálogo, estado e tela

Catálogo:

```text
web/js/content/game-content.js
TQ.content.collectibles
TQ.content.getCollectible(id)
```

Estado persistente:

```text
campaign.collectibles.collectedIds
campaign.collectibles.pendingIds
```

Schema vigente após esta implementação:

```text
schemaVersion = 10
```

A migração v9 → v10 cria o estado de Colecionáveis sem alterar progresso anterior.

Tela:

```text
web/js/screens/collectibles-screen.js
web/css/screens/collectibles.css
```

A Home navega para `collectibles` pelo hotspot já existente de coleção.

Nesta etapa, a UI não calcula nem exibe percentuais individuais. Cada item apenas declara as categorias beneficiadas: XP, Ouro e Rubi. A curva econômica será ligada depois, sem alterar a identidade do catálogo.


## Baús ligados aos Colecionáveis

Cada um dos 30 Baús recebe exatamente 3 Colecionáveis-base únicos no catálogo:

```text
30 Baús × 3 itens-base = 90 Colecionáveis
```

A associação é estável e determinística em `TQ.content.chestKits`.

Parâmetros de balanceamento:

```text
gameplayRewards.collectibles.twoItemMaxErrorPercent = 20
gameplayRewards.collectibles.pendingPerNormalChest = 1
```

Fluxo de fechamento de Baú:

```text
resultado da partida
→ resolve kit do Baú
→ acrescenta até 1 pendência
→ calcula quantidade conquistada
→ persiste collectedIds/pendingIds
→ grava outcome em learning.lastResult.reward.collectibles
→ abre chest-screen
```

O resultado fica persistido antes da tela para impedir rerrolagem por navegação.

Ordem de seleção: itens-base do Baú aparecem antes do item redistribuído. Assim uma pendência não vira prêmio garantido nas faixas de 1 ou 2 itens.

O Baú Final recebe todos os itens pendentes além de seus 3 itens-base e entrega todos.


## Economia de partida

Implementação:

```text
calculateGoldBaseAmount(...)
getCollectibleBonusPercent(...)
calculateRewardBonuses(...)
completeGameplaySession(...)
```

Ouro é recorrente e também existe em replay. Recompensas estruturais continuam idempotentes.

O Baú Final injeta 5.000 Rubis na recompensa-base antes dos bônus aplicáveis.

PETs provisórios são derivados dos IDs reais de `regionRewards`, evitando quebrar saves quando os nomes finais forem substituídos.


## Missão Especial

Domínio puro:

```text
web/js/domain/special-mission.js
```

Responsabilidades:

- derivar operações já introduzidas usando o scheduler canônico;
- gerar 20 questões pseudoaleatórias/determinísticas;
- garantir uma única chance por questão;
- não tocar no recovery normal;
- produzir resultado final.

Persistência e economia:

```text
web/js/domain/player-state.js
startSpecialMapMission(...)
updateSpecialMapMission(...)
completeSpecialMapMission(...)
```

Sessão ativa vive em `campaign.specialMaps[mapId].mission`.

Tela:

```text
web/js/screens/special-mission-screen.js
```

Entrada disponível tanto no resultado que completa o mapa quanto na tela de Regiões enquanto a missão estiver pendente/em andamento.


### Recompensas gerais na Missão Especial

Missão Especial também é uma partida para fins econômicos:

```text
XP-base = 20
Ouro-base = max(0, 10 × acertos - 2 × erros)
Rubi-base = acertos × 2
```

O mesmo `calculateRewardBonuses(...)` aplica Tripulação e Colecionáveis às três categorias.


## Loja

Catálogo:

```text
TQ.content.shopCatalog
TQ.content.getShopItem(id)
```

Estado persistente:

```text
shop.purchasedItemIds
```

Schema vigente:

```text
schemaVersion = 11
```

Migração v10 → v11 cria o estado da Loja preservando Ouro e progresso.

Compra:

```text
purchaseShopItem(state, item)
```

A compra:

1. valida ID e preço;
2. impede recompra;
3. exige Ouro suficiente;
4. desconta Ouro;
5. persiste o ID comprado;
6. não altera nenhum estado de equipamento.

Tela:

```text
web/js/screens/shop-screen.js
web/css/screens/shop.css
```

A Home reutiliza o hotspot já existente de Loja.


### Catálogo de Molduras

`shopCatalog.frames` contém 5 registros estáveis.

Preço nulo é estado válido de catálogo e significa item visível, porém ainda não comprável. A UI deve tratar `price = null` sem converter para zero.


### Loja: preços iniciais

`shopCatalog.frames` e `shopCatalog.backgrounds` agora possuem preços inteiros em Ouro e usam a mesma função `purchaseShopItem(...)`.

Nenhuma compra altera `homeBackgroundId`, `profileFrameId` ou qualquer futuro campo de navio equipado.


## Home + itens comprados

Schema vigente:

```text
schemaVersion = 12
```

Estado:

```text
shop.purchasedItemIds
shop.equippedShipId
```

Migração v11 → v12 preserva todas as compras e inicia `equippedShipId = null`.

Regra de equipamento do navio:

```text
withEquippedShip(state, shipId, allowedIds)
```

A função exige:

- ID permitido;
- navio previamente comprado.

A Home monta os seletores de Molduras e Fundos combinando os itens-base com os itens comerciais efetivamente comprados.

Viagem:

```text
equippedShip.travelVideo ?? assets.islandTravel
```

Assim o código já está ligado aos futuros vídeos sem depender deles nesta etapa.
