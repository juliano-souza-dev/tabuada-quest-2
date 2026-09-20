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
AVAILABLE  → JOGAR
LOCKED     → BLOQUEADA
REVIEW     → REVISAR
COMPLETED  → CONCLUÍDA
```

### REVIEW

`REVISAR` aparece na próxima Ilha disponível quando a Região possui `recoveryAttempt` pendente.

Isso comunica que existe conteúdo a recuperar sem expor internamente:

- `recoveryQueue`;
- `correctStreak`;
- `plannedExposure`;
- nomes de tabuadas do mix.

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

## Contrato para assets futuros

Quando os assets forem produzidos:

- o `sceneKey` identifica a composição visual da Ilha;
- o nome da Ilha permanece texto dinâmico;
- estados e CTAs permanecem camada dinâmica;
- o asset não deve embutir nome, tabuada, progresso ou estado;
- botões/hitboxes devem preservar `data-island-id`;
- trocar arte não altera scheduler, gameplay-session ou player-state.

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
