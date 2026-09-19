# DEC-002 — Regiões, ilhas, PETs e baús na progressão

**Status:** Aprovado para o Tabuada Quest 2.0  
**Data:** 2026-09-19  
**Responsáveis principais:** Produto + Game Design e Aprendizagem  
**Impacta:** campanha, navegação, progressão, recompensas, PETs, baús, direção visual e nomenclatura do jogo

## Contexto

A versão de referência organiza a campanha em **Portais** e, dentro deles, **Mundos**.

Com a mudança de direção do Tabuada Quest 2.0 para uma aventura pirata/marítima, essa nomenclatura deixou de representar adequadamente a fantasia principal do jogo.

O novo modelo usa como inspiração estrutural aventuras marítimas por grandes áreas e destinos insulares, sem copiar nomes, personagens, símbolos, logotipos ou elementos reconhecíveis de franquias existentes.

## Decisão de nomenclatura

A estrutura passa oficialmente de:

```text
Portal → Mundo
```

para:

```text
Região → Ilha
```

### Região

Uma **Região** representa um grande trecho da jornada marítima.

Ela substitui funcionalmente o antigo Portal.

A Região pode reunir:

- várias ilhas;
- progressão de campanha;
- PETs/companheiros para salvar;
- baús e tesouros;
- marcos de desbloqueio;
- identidade visual e narrativa própria;
- recompensa por desbloqueio e/ou conclusão, quando definida por Game Design.

### Ilha

Uma **Ilha** representa um destino jogável dentro de uma Região.

Ela substitui funcionalmente o antigo Mundo.

A Ilha:

- possui identidade visual própria;
- contém desafios;
- participa da progressão da Região;
- não representa exclusivamente uma tabuada;
- recebe o mix de operações definido pelo scheduler pedagógico da DEC-001.

## Estrutura conceitual

```text
Jornada marítima
│
├── Região 1
│   ├── Ilha 1
│   ├── Ilha 2
│   ├── Ilha 3
│   └── ...
│
├── Região 2
│   ├── Ilha 1
│   ├── Ilha 2
│   └── ...
│
└── ...
```

A quantidade estrutural já prevista no projeto deve ser preservada enquanto Produto não aprovar outra mudança. A troca de nomenclatura não deve, por si só, alterar a carga pedagógica definida na DEC-001.

## Identidade própria

A estrutura de aventura marítima pode ser inspirada no gênero de jornadas por mares e ilhas, mas o Tabuada Quest 2.0 deve manter identidade própria.

É proibido introduzir:

- nomes de regiões pertencentes a franquias existentes;
- personagens reconhecíveis;
- símbolos, bandeiras, logotipos ou marcas de terceiros;
- mapas ou composições que reproduzam diretamente universos protegidos.

Nomes, regiões, ilhas, personagens e símbolos do Tabuada Quest devem ser originais.

## Progressão global de PETs

O Tabuada Quest 2.0 terá:

```text
TOTAL_PETS = 30
```

Os 30 PETs representam criaturas/companheiros a serem salvos ao longo da campanha.

### Regras

- o total global da campanha é fechado em 30 PETs;
- a distribuição por Região/Ilha ainda será definida;
- PETs resgatados entram para a coleção do jogador;
- cada PET pode possuir condição própria de resgate;
- PETs não são automaticamente vinculados 1:1 aos baús;
- a narrativa final dos PETs/companheiros será refinada posteriormente.

## Progressão global de baús

O Tabuada Quest 2.0 terá:

```text
TOTAL_CHESTS = 30
```

Cada baú pode conter **um ou mais tesouros**.

Baú e tesouro são conceitos distintos:

```text
Baú
└── um ou mais tesouros
```

### Fontes de baús já aprovadas

Os 30 baús poderão ser distribuídos entre diferentes marcos da experiência, incluindo:

- login diário;
- recompensa por etapas;
- desbloqueio de Região;
- outros marcos de campanha que forem aprovados posteriormente.

A distribuição exata entre essas fontes ainda não está fechada.

## Tesouros dentro dos baús

Os tesouros são os conteúdos recebidos ao abrir um baú.

Categorias possíveis ainda dependem das decisões de Produto sobre economia e sistemas legados. Entre os candidatos estão:

- moedas;
- gemas, se mantidas no 2.0;
- modas;
- molduras;
- fundos;
- efeitos;
- colecionáveis;
- itens especiais de progressão.

Nenhuma dessas categorias deve ser considerada obrigatória apenas por existir na versão de referência.

## Baú de campanha x recompensa genérica

Nem toda recompensa consome um dos 30 baús.

Exemplo:

```text
Recompensa simples de 50 moedas
≠
Baú da campanha
```

Os 30 baús devem representar eventos relevantes de recompensa.

O jogo pode conceder recompensas menores diretamente, desde que aprovadas pelo sistema de economia.

## Ledger obrigatório de distribuição

Game Design e Aprendizagem deve manter uma contagem fechada durante a definição da campanha.

```text
Baús planejados:      30
Baús distribuídos:    ?
Baús sem destino:     ?

PETs planejados:      30
PETs distribuídos:    ?
PETs sem destino:     ?
```

Antes de considerar a campanha finalizada:

```text
Baús distribuídos = 30
Baús sem destino = 0

PETs distribuídos = 30
PETs sem destino = 0
```

Nenhum sistema pode criar silenciosamente um 31º PET ou um 31º baú.

Uma alteração desses totais exige nova decisão de Produto.

## Relação entre PETs e baús

PETs e baús são **trilhas de progressão independentes por padrão**.

Portanto:

```text
1 PET ≠ obrigatoriamente 1 baú
```

Uma associação entre ambos só deve existir quando Game Design definir explicitamente aquela relação.


## Mapas fragmentados e missões especiais

A campanha terá **5 mapas especiais**, e cada mapa será dividido em **4 fragmentos**.

```text
TOTAL_SPECIAL_MAPS = 5
FRAGMENTS_PER_MAP = 4
TOTAL_MAP_FRAGMENTS = 20
```

Os 20 fragmentos são distribuídos pelas 10 Regiões.

### Distribuição aprovada

```text
Região 1  → Mapa 1: fragmentos 1, 2, 3 e 4 → MAPA 1 COMPLETO

Região 2  → Mapa 2: fragmentos 1 e 2
Região 3  → Mapa 2: fragmentos 3 e 4       → MAPA 2 COMPLETO

Região 4  → Mapa 3: fragmentos 1 e 2
Região 5  → Mapa 3: fragmentos 3 e 4       → MAPA 3 COMPLETO

Região 6  → Mapa 4: fragmentos 1 e 2
Região 7  → Mapa 4: fragmentos 3 e 4       → MAPA 4 COMPLETO

Região 8  → Mapa 5: fragmentos 1 e 2
Região 9  → Mapa 5: fragmento 3
Região 10 → Mapa 5: fragmento 4            → MAPA 5 COMPLETO
```

Isso cria marcos de mapa completo nas Regiões:

```text
1, 3, 5, 7 e 10
```

### Regra especial da Região 1

A Região 1 entrega um mapa completo.

O objetivo é ensinar cedo ao jogador o ciclo:

```text
encontrar fragmentos
        ↓
completar o mapa
        ↓
viajar em uma missão especial
        ↓
concluir o desafio
        ↓
receber uma recompensa especial
```

## Gate de missão ao completar um mapa

Quando o quarto fragmento de um mapa for obtido, a progressão normal da campanha é **temporariamente bloqueada**.

Nesse estado:

- as Regiões normais ficam indisponíveis;
- o jogador não entra diretamente em uma Ilha comum;
- o jogo apresenta uma tela de missão especial;
- a missão do mapa deve ser concluída antes de a progressão normal ser retomada.

### Tela de missão

A tela deve comunicar de forma infantil, direta e temática que todas as partes do mapa foram encontradas.

Texto-base aprovado:

> Você encontrou todas as partes do mapa. Viaje nessa aventura!

A interface deve possuir um botão principal para iniciar a viagem, por exemplo:

> Ir

A redação visual final pode ser refinada por Produto/Experience Validator, mas não pode remover a informação de que o mapa foi completado e que existe uma nova aventura disponível.

## Viagem especial do mapa

A viagem especial é uma sessão de **tabuada mista** com ambientação própria.

Ela não é uma nova Região nem uma Ilha comum.

Conceitualmente:

```text
Mapa completo
   ↓
Missão especial
   ↓
Tabuada mista
   +
Fundo temático exclusivo
   ↓
Conclusão
   ↓
Recompensa especial
```

### Regras pedagógicas

- a missão utiliza questões de tabuada mista;
- a seleção de operações deve respeitar as regras pedagógicas já aprovadas;
- a missão não altera silenciosamente as cotas curriculares da campanha;
- se suas tentativas contarem para domínio ou revisão, isso deverá ser explicitamente definido pelo Game Design antes da implementação;
- o fundo temático muda a ambientação, não as regras matemáticas fundamentais.

A quantidade de questões, dificuldade e composição exata da mistura ainda serão definidas.

## Recompensa da missão especial

Concluir uma missão de mapa concede:

```text
1.000 diamantes
```

Cada um dos 5 mapas concede essa recompensa **uma única vez**.

Portanto, se todos os mapas forem concluídos:

```text
5 mapas × 1.000 diamantes = 5.000 diamantes
```

Os diamantes são uma moeda especial do Tabuada Quest 2.0.

Seu uso principal será em uma **Loja Especial**, que será especificada posteriormente.

### Regras dos diamantes

- diamantes são persistentes;
- a recompensa de 1.000 diamantes não pode ser coletada duas vezes para o mesmo mapa;
- repetir ou reabrir uma missão concluída, caso essa função exista no futuro, não concede novamente os 1.000 diamantes;
- diamantes não consomem nem substituem os 30 baús;
- diamantes não são automaticamente equivalentes às outras moedas do jogo;
- preços, catálogo e funcionamento da Loja Especial ainda não estão definidos.

## Desbloqueio após a missão

Após a conclusão bem-sucedida da missão:

1. a missão é marcada como concluída;
2. os 1.000 diamantes são creditados uma única vez;
3. o mapa é registrado como completado;
4. o bloqueio temporário é removido;
5. as Regiões normais voltam a ficar disponíveis de acordo com a progressão da campanha.

O estado deve ser persistido de forma que fechar e reabrir o jogo não permita perder a conclusão nem duplicar a recompensa.

## Estado conceitual da missão

Cada mapa deve possuir, no mínimo, estados equivalentes a:

```text
LOCKED
COLLECTING
MAP_COMPLETE_MISSION_PENDING
MISSION_IN_PROGRESS
MISSION_COMPLETED
```

Enquanto estiver em:

```text
MAP_COMPLETE_MISSION_PENDING
```

a progressão normal permanece bloqueada até a missão especial ser concluída.


## Relação com a DEC-001

A DEC-001 continua válida.

A alteração é terminológica e narrativa:

```text
Portal → Região
Mundo  → Ilha
```

A regra pedagógica permanece:

- ilhas apresentam mistura planejada de tabuadas;
- nenhuma ilha representa obrigatoriamente uma única tabuada;
- a carga curricular total continua preservada;
- operações são distribuídas pelo scheduler pedagógico;
- repetições por erro continuam separadas da exposição planejada.

## Responsabilidades

### Produto

- aprova a quantidade e estrutura macro de Regiões e Ilhas;
- define quais sistemas de recompensa permanecem;
- aprova mudanças nos totais globais de PETs e baús.

### Game Design e Aprendizagem

- distribui os 30 PETs e 30 baús pela campanha;
- define gatilhos de resgate e recompensa;
- mantém o ledger global;
- integra a distribuição à progressão sem prejudicar o scheduler pedagógico.

### Direção Visual

- cria identidade original para Regiões e Ilhas;
- mantém coerência com a aventura pirata mágica;
- não copia nomes ou elementos reconhecíveis de franquias existentes.

### Desenvolvimento

- implementa Região e Ilha como conceitos separados de regras pedagógicas;
- não fixa conteúdo de tabuada à identidade de uma Ilha;
- respeita os totais e distribuições aprovados.

### Qualidade

- valida que a campanha não excede ou perde PETs/baús;
- verifica desbloqueios, recompensas e persistência;
- confirma que a nomenclatura antiga não reaparece na UI nova sem motivo.

## Pontos ainda a definir

Esta decisão não fixa ainda:

- quantidade final de Regiões;
- quantidade de Ilhas por Região;
- nomes das Regiões;
- nomes das Ilhas;
- distribuição dos 30 PETs;
- distribuição dos 30 baús;
- quantidade de baús por login diário;
- quais etapas concedem baús;
- quais recompensas existem dentro de cada baú;
- quantidade de questões de cada missão especial de mapa;
- composição exata da tabuada mista nas missões especiais;
- relação das tentativas da missão especial com domínio/revisão;
- identidade temática de cada um dos 5 mapas e suas missões;
- regras, preços e catálogo da Loja Especial de diamantes;
- condição exata de resgate de cada PET;
- recompensa de conclusão de Região.

Esses pontos serão definidos na continuação da Issue #1 e nas issues específicas de progressão.
