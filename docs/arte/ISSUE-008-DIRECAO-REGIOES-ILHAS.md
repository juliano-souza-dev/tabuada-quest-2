# Issue #8 — Direção de identidade para Regiões e Ilhas

**Status:** contrato de identidade aprovado para implementação textual  
**Escopo visual:** assets finais ainda não produzidos

## Objetivo

Dar identidade pirata/marítima própria às 11 Regiões e às 110 Ilhas sem transformar uma Ilha em sinônimo de uma tabuada.

Regra central:

```text
tema da Ilha != conteúdo pedagógico fixo
```

A identidade narrativa/visual pertence à camada de mundo. O `challengePlan` pertence ao scheduler.

## Regiões

| Região | Identidade visual |
|---|---|
| CORSÁRIO | portos, velas, cordas e madeira |
| NEBLINAS | bruma, lanternas e silhuetas |
| CAVEIRAS | rochedos, cavernas e fósseis |
| NÁUFRAGO | destroços, mastros partidos e botes |
| VULCÂNIA | lava, basalto, cinzas e vapor |
| RELÍQUIA | templos costeiros, inscrições e ouro antigo |
| CORALINA | corais, conchas, recifes e águas claras |
| VENTANIA | velas infladas, nuvens rápidas e rajadas |
| MURALHAS | torres, portões, pontes e muros costeiros |
| ZONA RUBI | cristais rubros, cavernas e reflexos vermelhos |
| FORTALEZA | arquitetura monumental, torres e defesa final |

## Ilhas

Cada Região possui 10 nomes próprios de Ilha no catálogo:

```text
TQ.content.getIslandIdentity(regionId, islandId)
```

Cada Ilha possui:

```text
id
regionId
label
sceneKey
challengeIdentity = "mixed"
```

O campo `challengeIdentity` é deliberadamente `mixed`. Nenhuma Ilha recebe identidade do tipo "tabuada do 7".

## Estados de navegação

A camada de navegação usa quatro estados infantis:

```text
AVAILABLE  → DESBLOQUEADA
LOCKED     → BLOQUEADA
COMPLETED  → CONCLUÍDA
```

### Recuperação pedagógica

A recuperação pedagógica pertence exclusivamente ao scheduler e **não cria um status visual de Ilha**.

Ela não altera o contrato de navegação:

```text
locked
available
completed
```

## ChallengePlan

Ao tocar em uma Ilha:

```text
identidade da Ilha
→ inicia sessão
→ gameplay-session
→ scheduler.createIslandPlan(...)
→ questões mistas
```

A UI pode exibir apenas:

```text
Desafio misto
```

Não exibir a composição de tabuadas como nome, subtítulo ou tema da Ilha.

## Contrato visual dos mapas de Ilhas

Decisão corrigida e aprovada pelo líder durante a produção da Região 1.

### Fixo dentro da arte

- cenário oceânico e composição das Ilhas;
- header temático;
- seta visual de voltar;
- nome da Região;
- placa principal com o nome canônico de cada Ilha;
- medalhão(ões) de recompensa correspondentes somente às recompensas reais daquela Ilha;
- placa inferior de madeira vazia, reservada para o texto dinâmico de status.

### Dinâmico sobre a arte

- texto de status de cada Ilha;
- seleção da variante locked/unlocked;
- continuidade de sessão;
- hitboxes da seta e das 10 Ilhas;
- estados de acessibilidade.

Contrato:

```text
FIXO
nome da Região
nome das Ilhas
arte
medalhões de recompensa corretos
placa inferior vazia

DINÂMICO
texto de status
seleção locked/unlocked
hitboxes
estado do jogador
```

Os nomes fixos continuam também no catálogo de conteúdo para acessibilidade, testes e regras de domínio, mas não são redesenhados em HTML sobre a arte.

Trocar o estado do jogador não exige regenerar o asset. Trocar a arte não altera scheduler, gameplay-session ou player-state.

## Primeiro exemplo executável

Região 1:

```text
Ilha 1  → Porto da Âncora
Ilha 2  → Enseada do Saque
Ilha 3  → Rochedo da Bandeira
Ilha 4  → Cais do Barril
Ilha 5  → Baía do Farol
Ilha 6  → Atol do Timão
Ilha 7  → Ponta da Caravela
Ilha 8  → Praia das Cordas
Ilha 9  → Ilha do Canhão
Ilha 10 → Cabo do Capitão
```

Os marcos de PET, mapa e baú definidos anteriormente continuam independentes dos nomes das Ilhas.


## Região 1 — implementação visual vigente

A composição monolítica anterior foi substituída pela arquitetura modular.

Pasta canônica:

```text
web/assets/regions/region-1/
```

Composição:

```text
background.png
+
10 assets unlocked
+
10 assets locked
+
status/hitboxes dinâmicos
```

Stage lógico:

```text
941 × 1672
```

Implementação:

```text
web/js/screens/islands-screen.js
REGION_1_LAYOUT
```

O estado da Ilha escolhe dinamicamente a variante visual.

## Arquitetura modular aprovada

A tela final das Ilhas será composta, não rasterizada como uma única imagem.

Estrutura:

```text
background.png
+
island-01-unlocked.png
island-01-locked.png
...
island-10-unlocked.png
island-10-locked.png
+
overlays dinâmicos
```

O background contém somente elementos fixos da Região.

Cada Ilha é um asset independente, posicionado em coordenadas canônicas por CSS.

Regra de seleção:

```text
getIslandStatus(...) === "locked"
    ? lockedAsset
    : unlockedAsset
```

O texto de status e as hitboxes permanecem fora das imagens. Os medalhões de recompensa pertencem ao asset específico da Ilha e devem refletir apenas a recompensa realmente atribuída a ela.

Esta arquitetura substitui a composição monolítica anterior da Região 1.


## Contrato visual específico de cada Ilha

A criação de Ilhas segue o padrão global definido em:

```text
agentes/03-direcao-visual.md
→ Padrão global obrigatório para criação de Ilhas
```

### Estrutura invariável

Toda Ilha deve conter:

```text
diorama 3D isolado
+
placa de madeira com nome canônico
+
1..N medalhões apenas das recompensas reais
+
placa inferior de madeira vazia para status
```

A dupla visual deve preservar registro perfeito:

```text
unlocked = composição-base
locked   = mesma composição + leve sombra + corrente/cadeado
```

### Recompensas

```text
PET            → patinha
FRAGMENTO MAPA → pergaminho/mapa rasgado
BAÚ            → baú
```

Não existe slot genérico de recompensa.

Se a Ilha tem apenas PET, exibe apenas a patinha.
Se tem apenas fragmento, exibe apenas o pergaminho.
Se possui duas recompensas, exibe dois medalhões.
Nunca criar medalhão vazio.

### Variação entre Ilhas

O cenário e o marco principal mudam de acordo com o nome/identidade da Ilha.

Exemplo aprovado:

```text
Porto da Âncora
→ porto tropical
→ grande âncora como elemento-herói
→ cais/cordas/barris como apoio
→ recompensa PET = um único medalhão de patinha
```

A recompensa não deve dominar ou substituir o conceito visual da Ilha.


## Transição de viagem ao entrar em uma Ilha

A primeira entrada de cada Ilha possui uma transição visual de viagem.

```text
Ilha ainda não visitada
→ reproduzir island-travel.mp4
→ ao terminar, abrir o desafio

Ilha já visitada
→ abrir o desafio diretamente
```

A animação é compartilhada entre as Ilhas e não altera o conceito visual específico de cada diorama.

O vídeo ocupa a tela durante a transição. Não exibir status, recompensa ou HUD por cima da animação.


## Convenção de nomeação dos assets

O filename é técnico e não altera o nome narrativo da Ilha.

```text
island-01-unlocked
island-01-locked

island-02-unlocked
island-02-locked

...

island-10-unlocked
island-10-locked
```

Somente o número da Ilha varia.

Exemplo atual:

```text
Ilha 02 = Enseada do Saque

arquivo desbloqueado = island-02-unlocked
arquivo bloqueado    = island-02-locked
```

O texto `Enseada do Saque` continua sendo o nome da Ilha e permanece na placa principal da arte.
