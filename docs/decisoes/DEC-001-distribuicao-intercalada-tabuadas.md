# DEC-001 — Distribuição intercalada das tabuadas por mundo

**Status:** Aprovado para o Tabuada Quest 2.0  
**Data:** 2026-09-19  
**Responsáveis principais:** Produto + Game Design e Aprendizagem  
**Impacta:** progressão, geração de desafios, domínio, revisão, métricas e testes

## Contexto

No jogo de referência, cada portal contém 10 mundos e cada mundo representa exclusivamente uma tabuada:

- Mundo 1 → tabuada 1
- Mundo 2 → tabuada 2
- ...
- Mundo 10 → tabuada 10

Ao concluir todos os mundos previstos, a criança pratica cada tabuada uma quantidade total definida pelo modelo atual.

No Tabuada Quest 2.0, a estrutura de **10 portais** e **10 mundos por portal** será preservada, mas a associação rígida entre mundo e tabuada deixa de existir.


## Atualização de nomenclatura — DEC-002

A partir da DEC-002, a nomenclatura oficial do Tabuada Quest 2.0 passa a ser:

```text
Portal → Região
Mundo  → Ilha
```

Todas as regras pedagógicas desta decisão permanecem válidas. Onde este documento mencionar Portal ou Mundo em contexto do 2.0, deve-se ler Região ou Ilha, respectivamente. A alteração não muda, por si só, quantidades, cotas, cobertura de operações ou invariantes do scheduler.

## Decisão

Cada mundo passa a apresentar uma **combinação planejada de operações de diferentes tabuadas**.

Exemplo conceitual:

```text
Portal 1
├── Mundo 1 → mix de tabuadas
├── Mundo 2 → mix de tabuadas
├── Mundo 3 → mix de tabuadas
...
└── Mundo 10 → mix de tabuadas
```

O objetivo é substituir prática em blocos por **prática intercalada**, combinada com **recuperação espaçada**, sem alterar a carga curricular total existente.

## Invariante principal

A mudança altera a **distribuição**, não a **quantidade final de prática**.

Se, no modelo de referência, cada tabuada é praticada exatamente **X vezes** ao atravessar todos os mundos considerados, o novo sistema deve garantir:

```text
exposição planejada(T1)  = X
exposição planejada(T2)  = X
exposição planejada(T3)  = X
...
exposição planejada(T10) = X
```

Nenhuma tabuada pode terminar o ciclo com carga curricular planejada maior ou menor que a do modelo de referência.

## Cobertura no nível da operação

A garantia não deve existir apenas no nível da tabuada.

O sistema precisa preservar também a cobertura das operações individuais.

Exemplo:

```text
7×1
7×2
7×3
...
7×10
```

Essas operações podem aparecer em mundos diferentes, mas o conjunto previsto pelo currículo deve continuar sendo coberto integralmente.

Exemplo de distribuição:

```text
Mundo 1 → 7×2, 7×5
Mundo 4 → 7×1, 7×8, 7×3
Mundo 6 → 7×10, 7×6
Mundo 9 → 7×4, 7×7, 7×9
```

Ao final, a criança praticou a tabuada completa sem enfrentar um bloco inteiro dedicado exclusivamente ao 7.

## O sistema não será aleatório

A seleção de operações não deve ser baseada em sorteio irrestrito.

O jogo deverá usar um **scheduler pedagógico com cotas**, responsável por:

1. preservar a carga total de cada tabuada;
2. preservar a cobertura das operações;
3. distribuir exposições ao longo dos mundos;
4. evitar concentração excessiva de uma mesma tabuada;
5. criar intervalos entre exposições para favorecer recuperação;
6. respeitar progressão de dificuldade entre portais.

Aleatoriedade poderá ser utilizada apenas dentro dos limites definidos pelo plano, por exemplo para variar ordem de apresentação, sem quebrar as cotas pedagógicas.

## Prática intercalada

Um mundo poderá conter operações de várias tabuadas.

Exemplo ilustrativo com 10 questões:

```text
Mundo N
- 3 operações da tabuada 2
- 2 operações da tabuada 4
- 3 operações da tabuada 7
- 2 operações da tabuada 9
```

Essa composição é apenas ilustrativa. A matriz definitiva será responsabilidade de Game Design e Aprendizagem.

O requisito fixo é que a soma global continue respeitando as cotas de cada tabuada e operação.

## Recuperação espaçada

As exposições de uma mesma tabuada devem ser distribuídas em momentos diferentes.

Exemplo conceitual:

```text
Tabuada 4
Mundo 1 → primeiro contato
Mundo 3 → recuperação curta
Mundo 5 → reforço
Mundo 8 → recuperação mais espaçada
```

O objetivo é evitar que o contexto do mundo entregue implicitamente qual tabuada está sendo praticada e exigir recuperação real da resposta.

## Erros e recuperação

Repetições causadas por erro não alteram a cota curricular planejada.

Devem existir duas contagens separadas:

```text
plannedExposure
recoveryAttempt
```

Exemplo:

```text
7×8 aparece como exposição planejada.
A criança erra.
7×8 retorna mais tarde como tentativa de recuperação.
```

A segunda aparição não deve ser contabilizada como uma nova unidade da carga curricular originalmente planejada.

Isso permite adaptar a sessão ao desempenho sem distorcer a distribuição base entre tabuadas.

## Progressão entre portais

Os portais podem aumentar gradualmente o grau de interleaving.

Direção de design a ser refinada:

- portais iniciais: menor quantidade de tabuadas simultâneas e intervalos de recuperação menores;
- portais intermediários: maior mistura e maior distância entre recuperações;
- portais finais: mistura mais ampla, menos pistas implícitas e recuperação após intervalos maiores.

Mesmo com essa progressão, a carga total definida pelo currículo permanece invariável.

## Nova identidade dos mundos

Um mundo deixa de significar "tabuada N".

A identidade do mundo passa a ser visual, narrativa e de progressão.

Conceitualmente:

```text
World
├── id
├── theme
├── challengePlan
└── rewards
```

O plano pedagógico fica separado:

```text
ChallengePlan
├── multiplicationTable
├── multiplier
├── exposureType
└── masteryState
```

Essa separação é requisito arquitetural: a regra pedagógica não deve depender da tela ou do tema visual do mundo.

## Responsabilidades dos agentes

### Produto

- garante que a quantidade total de prática do modelo de referência seja preservada;
- aprova mudanças que alterem escopo, duração ou progressão.

### Game Design e Aprendizagem

- define a matriz/scheduler de distribuição;
- define espaçamento;
- define progressão de mistura entre portais;
- valida cobertura de todas as operações;
- define comportamento de recuperação após erro.

### Desenvolvimento

- implementa o scheduler como regra de domínio, separado da interface;
- garante cotas e invariantes por testes automatizados;
- não inventa distribuição pedagógica.

### Qualidade

Deve verificar, no mínimo:

- nenhuma tabuada fica acima ou abaixo da carga planejada;
- todas as operações previstas são cobertas;
- repetições por erro não alteram a cota base;
- a ordem pode variar sem quebrar os invariantes;
- concluir os 10 mundos mantém a equivalência curricular com o modelo de referência.

## Critérios de aceite

A funcionalidade só poderá ser considerada correta quando:

1. os 10 mundos de cada portal puderem conter múltiplas tabuadas;
2. nenhum mundo for obrigado a representar exclusivamente uma única tabuada;
3. ao final do ciclo, cada tabuada tiver exatamente a carga total definida pelo modelo de referência;
4. a cobertura das operações individuais estiver garantida;
5. repetições por erro estiverem separadas da carga planejada;
6. a distribuição obedecer a uma lógica de espaçamento, não a sorteio irrestrito;
7. a mecânica puder ser testada independentemente da interface.

## Pontos ainda a definir

Esta decisão não fixa ainda:

- o valor numérico de **X**;
- quantas tabuadas coexistem em cada mundo;
- a matriz exata de distribuição;
- os intervalos ideais entre exposições;
- como o scheduler reage a diferentes níveis de desempenho além da recuperação por erro;
- se a progressão de interleaving será idêntica ou diferente entre todos os portais.

Esses pontos deverão ser fechados por Produto e Game Design antes da implementação da mecânica.


## Fechamento dos pontos abertos — Issue #5

Os pontos numéricos e operacionais desta decisão foram fechados em:

```text
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
```

Valores aprovados para a V1:

```text
X = 200 plannedExposure por tabuada
20 plannedExposure por tabuada / Região
2 plannedExposure por operação / Região
20 plannedExposure por operação / campanha
20 plannedExposure por Ilha
2.000 plannedExposure na campanha
```

Progressão de mistura:

```text
Regiões 1-2  → 2 tabuadas por Ilha
Regiões 3-4  → 3 tabuadas por Ilha
Regiões 5-6  → 4 tabuadas por Ilha
Regiões 7-8  → 5 tabuadas por Ilha
Regiões 9-10 → 10 tabuadas por Ilha
```

A DEC-004 passa a ser a especificação executável para a Issue #6.
