# Padrão global — telas de Região com 5 Ilhas

## Fonte de verdade

Este documento transforma a composição aprovada na CORSÁRIO em **contrato visual global** para todas as demais telas de Região.

A CORSÁRIO é a referência de composição. As próximas Regiões não devem redesenhar a malha.

## Regra principal

```text
MESMA ESTRUTURA
+
NOVA IDENTIDADE VISUAL
```

O que muda entre Regiões é a arte.  
A geometria permanece igual.

## Stage canônico

```text
width  = 941
height = 1672
```

Toda tela de Região jogável usa esse stage lógico.

A responsividade aplica uma única escala uniforme ao stage inteiro. Não reposicionar Ilhas individualmente por breakpoint.

## Composição obrigatória

```text
background temático da Região
+
header temático
+
5 marcações de água
+
5 assets de Ilha
+
status textual dinâmico
+
hitboxes
+
Mapa mundo global
```

## Marcações do background

Cada background deve reservar exatamente os mesmos cinco pontos de ancoragem usados na CORSÁRIO.

A aparência da água pode variar de acordo com a Região, mas:

- posição das cinco marcações é fixa;
- tamanho visual de cada marcação deve ser compatível com o slot correspondente;
- rota/setas entre as marcações preservam a mesma geometria;
- não adicionar ilhas decorativas grandes nas bordas que disputem espaço com os assets jogáveis;
- manter espaço negativo suficiente entre os cinco slots.

## Slots canônicos das Ilhas

| Ilha | Asset x | Asset y | W | H | Status x | Status y | Status W | Status H | Fonte | Hitbox x | Hitbox y | Hitbox W | Hitbox H |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 01 | 0 | 320 | 380 | 380 | 88 | 626 | 204 | 42 | 28 | 14 | 334 | 352 | 352 |
| 02 | 561 | 360 | 380 | 380 | 649 | 666 | 204 | 42 | 28 | 575 | 374 | 352 | 352 |
| 03 | 270 | 590 | 400 | 400 | 362 | 912 | 216 | 44 | 29 | 285 | 605 | 370 | 370 |
| 04 | 0 | 915 | 395 | 395 | 91 | 1233 | 213 | 44 | 29 | 15 | 930 | 365 | 365 |
| 05 | 541 | 1240 | 400 | 400 | 633 | 1562 | 216 | 44 | 29 | 556 | 1255 | 370 | 370 |

Ordem visual:

```text
01 → topo esquerdo
02 → topo direito
03 → centro
04 → inferior esquerdo
05 → inferior direito
```

As Ilhas podem ter silhuetas internas diferentes, mas o canvas/slot deve obedecer ao tamanho canônico correspondente.

## Mapa mundo global

Asset:

```text
web/assets/global/mapa-mundo.png
TQ.content.assets.global.worldMap
```

Contrato:

```text
x = 98
y = 1405
w = 200
h = 200
```

O Mapa mundo fica sempre no canto inferior esquerdo da composição, abaixo da Ilha 04.

Essa posição é global e não varia entre Regiões.

## Clique global do Mapa mundo

O asset é interativo em todas as telas de Região.

Contrato:

```text
data-action = open-world-map
→ TQ.core.worldMap.open({ onNavigate })
```

Fonte única:

```text
web/js/core/world-map.js
```

Enquanto a tela real não existe:

```text
clique
→ aviso "Mapa mundo ainda está em produção."
```

Quando a tela `world-map` for implementada, o comportamento deve ser alterado somente nesse controlador global.

Não criar handlers diferentes por Região.

## Header e retorno

O header pode mudar de material, ornamentos, iluminação e identidade de acordo com a Região.

A função e a área de retorno devem preservar o mesmo contrato espacial adotado na tela-base.

Referência vigente:

```text
back hitbox
x = 58
y = 18
w = 150
h = 150
```

## Asset de Ilha

Cada Ilha mantém o padrão global já aprovado:

```text
diorama 3D infantil premium
+
placa com nome canônico
+
medalhão(ões) somente das recompensas reais
+
placa inferior reservada ao status
```

Variantes:

```text
unlocked = composição-base
locked   = MESMA composição + corrente/cadeado + leve sombra
```

Locked e unlocked não podem alterar câmera, escala, cenário, vegetação, props, placas ou medalhões.

## Status

O status é dinâmico e não é rasterizado na arte.

Estados visuais:

```text
locked    → BLOQUEADA
available → DESBLOQUEADA
completed → CONCLUÍDA
resume    → CONTINUAR
```

O mesmo tratamento CSS deve ser reutilizado em todas as Regiões:

- fonte forte;
- contorno;
- sombras em camadas;
- contraste sobre a placa;
- tratamento cromático por estado.

Fonte atual:

```text
web/css/screens/vertical-slice.css
.region1-island-status
```

Ao generalizar o componente, o estilo deve virar regra compartilhada, não ser duplicado Região por Região.

## O que muda entre Regiões

Pode mudar:

- background;
- header/nome;
- paleta;
- clima;
- cenário;
- tema;
- visual das Ilhas;
- nome das Ilhas;
- props;
- medalhões conforme as recompensas reais.

## O que não muda

Não pode mudar sem decisão explícita do líder:

- stage 941 × 1672;
- cinco slots;
- coordenadas dos cinco slots;
- tamanho de cada slot;
- statusBox;
- hitboxes;
- posição do Mapa mundo;
- geometria das marcações de água;
- rota visual entre os cinco pontos;
- arquitetura modular;
- regra locked/unlocked;
- CSS funcional do status;
- princípio de respiro entre assets.

## Regra para criação de novos backgrounds

Antes de gerar um novo fundo:

```text
1. copiar a malha da CORSÁRIO;
2. preservar exatamente as cinco marcações;
3. preservar a rota;
4. preservar o espaço do Mapa mundo;
5. aplicar somente a identidade visual da nova Região.
```

O background não deve incluir os assets das Ilhas jogáveis.

## Regra para implementação

A geometria deve ser compartilhada.

Não criar:

```text
REGION_2_LAYOUT
REGION_3_LAYOUT
REGION_4_LAYOUT
...
```

com coordenadas copiadas manualmente.

Ao implementar as próximas Regiões, promover esta malha para configuração compartilhada e fornecer por Região apenas os dados/paths visuais que realmente variam.

## Referência executável atual

```text
web/js/screens/islands-screen.js
REGION_1_LAYOUT
```

A implementação atual ainda possui nome específico de Região 1 porque nasceu na CORSÁRIO. Quando uma segunda Região visual for implementada, esse contrato deve ser promovido para layout global compartilhado sem alterar as coordenadas aprovadas.
