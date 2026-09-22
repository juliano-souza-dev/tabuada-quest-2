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
→ Resultado
→ PET/Baú/Mapa ao sair do Resultado, quando aplicável
```

Contrato técnico:

- `web/js/content/game-content.js` mantém valores rebalanceáveis, recompensas configuradas e kits de Baú;
- `web/js/domain/player-state.js` calcula/aplica recompensa e garante idempotência dos marcos únicos;
- XP de partida é repetível; recompensa estrutural da Ilha é first-completion;
- `ruby` é convertido para `wallet.gems` enquanto Produto não separar moedas;
- kits de Baú são estruturas extensíveis com `items`, mesmo quando vazias;
- `web/js/screens/chest-screen.js`, `web/js/screens/pet-screen.js` e `web/js/screens/map-reward-screen.js` apresentam recompensas especiais depois do Resultado;
- `web/js/screens/result-screen.js` decide somente se deve inserir o interlúdio de PET/Baú/fragmento de Mapa antes do destino escolhido pela criança;
- o destino pós-recompensa é transitório de navegação e não altera a concessão já persistida;
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
→ abre result-screen
→ ao sair do resultado, abre chest-screen
→ segue ao destino escolhido
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


## Loja Rubi

Implementação inicial:

```text
web/js/content/game-content.js      → catálogo local e Regiões habilitadas
web/js/domain/player-state.js       → compra atômica + pedidos persistidos
web/js/screens/ruby-shop-screen.js  → experiência da Loja Rubi
web/css/screens/ruby-shop.css       → apresentação
web/js/screens/islands-screen.js    → gatilho regional reutilizável
```

Estado persistente:

```text
rubyShop.orders[]
```

Cada pedido local armazena snapshot mínimo do item comprado:

```text
id
itemId
label
priceRubies
status = local_pending
createdAt
```

A compra:

1. valida item e preço;
2. valida saldo em `wallet.gems`;
3. rejeita ID de pedido duplicado;
4. debita Rubis e grava pedido na mesma transição de estado.

O domínio não usa DOM, rede, e-mail ou PHP.

A entrada regional consulta uma configuração compartilhada de Regiões habilitadas. Não duplicar renderer por Região.

A futura API PHP deve entrar atrás de uma camada de serviço/adapter. A tela não deve depender de formato HTTP específico.


### Periodicidade e desbloqueio da Loja Rubi

Configuração canônica:

```text
enabledRegionIds = [1, 5, 9, 13, 17, 21]
```

A embarcação pode ser renderizada durante toda a permanência na Região elegível, porém a navegação para `ruby-shop` só é permitida quando:

```text
campaign.regionProgress[regionId].islandsCompleted === 5
```

A regra de desbloqueio pertence ao domínio em `player-state.js` e deve ser reutilizada pela UI. Não implementar a autorização apenas por CSS, `disabled` ou coordenada de hitbox.


## Tela de conclusão visual

Implementação:

```text
web/js/screens/result-screen.js
web/css/screens/vertical-slice.css
web/js/content/game-content.js → assets.global.victoryScreen
```

Asset canônico:

```text
web/assets/global/gb_win.webp
```

Contrato técnico:

- o asset é somente a composição visual;
- região, estatísticas, XP, Ouro, Rubis, fragmentos de mapa e ações continuam dinâmicos;
- PET, Baú e fragmentos de Mapa não entram no painel de premiação do Resultado; possuem telas dedicadas após a ação de saída;
- overlays e hitboxes usam o mesmo stage proporcional do asset;
- a tela mantém fallback textual se o asset não estiver disponível;
- Missão Especial continua funcional como ação dinâmica e não é incorporada ao bitmap;
- alterações de coordenadas do overlay devem preservar alinhamento responsivo e ser cobertas por teste automatizado.


## Sistema técnico de Efeitos de desafio

Implementação compartilhada:

```text
web/js/content/challenge-effects.js
web/js/core/challenge-effect-renderer.js
web/js/screens/challenge-screen.js
web/js/screens/special-mission-screen.js
```

Contrato:

- catálogo de Efeitos é independente das telas;
- o renderer recebe o Efeito resolvido e não decide acerto/erro;
- resolução consulta, quando existir, `inventory.equipped.correctEffectId` e `inventory.equipped.wrongEffectId`;
- enquanto o Baú de Itens não implementar persistência, IDs padrão funcionam como fallback;
- Efeito de acerto dispara avanço ao terminar a animação, com fallback temporal para evitar deadlock;
- Efeito de erro nunca avança automaticamente;
- a resposta correta é fornecida pela sessão, não pelo catálogo de Efeitos;
- `prefers-reduced-motion` reduz a animação sem bloquear o fluxo;
- Missões Especiais reutilizam o mesmo renderer e resolver.


### Integração comercial dos Efeitos

Fonte comercial:

```text
web/js/content/challenge-effects.js → TQ.effects.shopCatalog
web/js/content/game-content.js      → shopCatalog.effects / getShopItem(...)
web/js/screens/shop-screen.js       → aba Efeitos
```

Contrato técnico:

- Efeitos comerciais usam `category = effect`, `effectType`, `name`, `price`, `renderer` e `asset`;
- nesta etapa `asset = null` e o renderer textual continua sendo a implementação executável;
- a Loja reutiliza `purchaseShopItem(...)` e persiste somente o ID em `shop.purchasedItemIds`;
- propriedade é derivada de `shop.purchasedItemIds`; não duplicar `owned` como estado persistido;
- a compra não cria nem altera `inventory.equipped`;
- não há alteração de schema somente para vender Efeitos;
- o Baú de Itens será responsável por inventário/equipamento em etapa própria;
- o desafio permanece desacoplado da compra e continua consumindo apenas o resolvedor de Efeitos.

## Continuidade pelo botão Jogar

Fonte de decisão:

```text
web/js/domain/player-state.js
TQ.domain.playerState.getPlayRegionId(state)
```

Consumo:

```text
web/js/screens/home-screen.js
```

Contrato:

- sessão ativa válida tem prioridade;
- Região atual incompleta permanece como destino;
- Região concluída nunca é reaberta pelo botão Jogar se existir outra Região desbloqueada e não concluída;
- se não houver Região jogável, a Home cai para a tela de Regiões;
- o botão Regiões continua independente deste atalho.

## Regra técnica — overlays pixel-perfect por Região + Ilha

A lógica e os renderers de atividade continuam compartilhados, mas **coordenadas pixel-perfect pertencem à configuração local da arte específica**.

Contrato:

```text
renderer compartilhado
+
layout/config por Região + Ilha
```

Antes de ajustar coordenadas:

1. identificar `regionId` e `islandId` exatos;
2. abrir a arte usada por essa atividade;
3. usar o print de validação correspondente à mesma Região + Ilha;
4. medir caixas e trilhos nessa referência;
5. alterar apenas a entrada local dessa combinação;
6. cobrir a geometria relevante com teste de regressão;
7. validar novamente na mesma Região + Ilha.

É proibido:

- corrigir R1/I1 alterando coordenadas genéricas para todas as Ilhas;
- extrapolar medidas de uma arte para outra;
- usar fallback global como substituto de um layout local já conhecido;
- considerar uma tela aprovada apenas porque outra Ilha visualmente semelhante passou.

CSS compartilhado deve conter apenas comportamento realmente global. Posições, dimensões ou offsets dependentes da composição da arte devem vir de configuração local como `CHALLENGE_ART_LAYOUTS[regionId][islandId]` ou estrutura equivalente.

Quando um elemento compartilhado precisar de parâmetros adicionais para encaixar em artes diferentes, preferir variáveis/configuração por Região + Ilha em vez de hardcode global.


## BIRADES / Região 2

Assets canônicos:

```text
web/assets/regions/region-2/background.webp
web/assets/regions/region-2/*_unlocked.webp
web/assets/regions/region-2/*_locked.webp
```

Integração:

```text
web/js/content/game-content.js → assets.region2Modular
web/js/screens/islands-screen.js → REGION_VISUAL_CONFIG[2]
```

Regras técnicas:

- PNGs enviados pelo líder são entrada temporária e não permanecem na pasta de produção;
- conversão de BIRADES usa WebP lossless para preservar pixels, transparência e dimensões;
- `REGION_VISUAL_CONFIG[2]` utiliza `slotLayout` próprio aprovado pela Direção Visual;
- o botão Mapa Mundo de BIRADES usa `worldMapEmbedded=true`, aproveitando o elemento incorporado ao background;
- locked/unlocked são pares explícitos por Ilha;
- os nomes canônicos pertencem a `canonicalIslandNameOverrides["2"]`;
- a Região 2 entra automaticamente no preview implementado via `REGION_VISUAL_CONFIG`.


### Telas jogáveis de BIRADES

Assets:

```text
web/assets/regions/region-2/challenges/island-01-challenge.webp
...
web/assets/regions/region-2/challenges/island-05-challenge.webp
```

Catálogo:

```text
web/js/content/game-content.js → assets.region2ChallengeArt
```

Renderer/layout:

```text
web/js/screens/challenge-screen.js
CHALLENGE_ART_LAYOUTS[2][islandId]
```

Contrato técnico:

- os 5 assets são 941×1672 em WebP otimizado;
- cada Ilha possui coordenadas próprias para progresso, operação e respostas;
- a arte não contém valores dinâmicos;
- progresso, questão, respostas e feedback são injetados pelo renderer compartilhado;
- o resolvedor de arte usa o padrão `assets.region{regionId}ChallengeArt`;
- teste de regressão verifica existência física e limite de peso abaixo de 500 KB por arte.


## Retorno global para Home

Implementação atual:

```text
web/js/screens/world-map-screen.js
web/js/screens/islands-screen.js
web/css/app.css
```

Contrato técnico:

- ação uniforme: `data-action="home"`;
- destino: `onNavigate("home")`;
- classe visual compartilhada: `.global-home-button`;
- o botão é renderizado fora do stage escalável das artes para manter posição e tamanho estáveis;
- o botão atual é textual e não referencia asset;
- escopo atual: Mapa Mundo e telas de Ilhas, incluindo fallback textual;
- não inserir automaticamente o botão em desafios, resultados ou telas comerciais.


## DEV Regiões — rota de navegação

Implementação:

```text
web/js/screens/home-screen.js
web/js/screens/development-regions-screen.js
web/js/app.js
web/js/domain/player-state.js
```

Contrato:

- o atalho `DEV · REGIÕES` navega para `development-regions`;
- `development-regions` deve constar entre os destinos válidos de `playerState.withLastScreen(...)`;
- a tela DEV não altera progresso real da campanha;
- a Região selecionada em DEV usa `previewRegionId` em memória e abre `islands` em modo de inspeção;
- regressões de rota devem testar o estado real, não apenas buscar strings nos arquivos.


### DEV Regiões em modo jogável

O preview de desenvolvimento permite abrir qualquer Ilha para validar a atividade, mesmo quando a campanha real ainda não desbloqueou essa Região/Ilha.

Contrato:

- clique em uma Ilha DEV cria sessão de desafio diretamente, sem exigir unlock da campanha;
- viagem é ignorada no DEV para acelerar validação;
- sessão, respostas, resultado e recompensas de teste vivem em `developmentState`, mantido apenas em memória;
- `developmentState` nunca é salvo no `localStorage`;
- progresso, carteira, PETs, Baús, mapas e conclusão reais do jogador não podem ser alterados por uma partida DEV;
- voltar para Ilhas mantém a Região DEV selecionada;
- voltar para Home encerra o modo DEV e descarta completamente o estado temporário.
