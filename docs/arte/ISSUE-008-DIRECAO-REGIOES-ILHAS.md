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
- nomes das 10 Ilhas;
- molduras/slots reservados para status;
- molduras/slots reservados para recompensa.

### Dinâmico sobre a arte

- status de cada Ilha;
- estado bloqueada/desbloqueada;
- conclusão;
- continuidade de sessão;
- recompensa associada a cada Ilha;
- hitboxes da seta e das 10 Ilhas;
- estados de acessibilidade.

Contrato:

```text
FIXO
nome da Região
nome das Ilhas
arte
molduras

DINÂMICO
status
recompensa
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
status/recompensas/hitboxes dinâmicos
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

Status, recompensa e hitbox permanecem fora das imagens.

Esta arquitetura substitui a composição monolítica anterior da Região 1.
