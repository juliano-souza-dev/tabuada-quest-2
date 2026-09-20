# DEC-004 — Scheduler pedagógico V2 para campanha de 11 Regiões

**Status:** Aprovado para implementação  
**Data:** 2026-09-20  
**Responsáveis principais:** Produto + Game Design e Aprendizagem  
**Origem:** Issue #5  
**Impacta:** scheduler, geração de desafios, recuperação após erro, testes de invariantes e progressão pedagógica

## 1. Decisão de Produto que altera a V1

A campanha passou de:

```text
10 Regiões
100 Ilhas
```

para:

```text
11 Regiões
110 Ilhas
```

A expansão é intencional e acrescenta uma Região completa ao arco pedagógico.

Por isso, a equivalência com a referência passa a ser preservada na **densidade por Região e por Ilha**, e não mais no total absoluto da campanha.

A densidade aprovada continua sendo:

```text
20 plannedExposure por Ilha
200 plannedExposure por Região
20 plannedExposure por tabuada / Região
2 plannedExposure por operação / Região
```

Como a campanha ganhou 10% mais Ilhas, a carga planejada total também cresce 10%.

## 2. Totais oficiais da campanha

```text
11 Regiões × 10 Ilhas = 110 Ilhas

110 Ilhas × 20 plannedExposure
= 2.200 plannedExposure na campanha
```

Para cada tabuada:

```text
20 plannedExposure / Região × 11 Regiões
= X = 220 plannedExposure por tabuada
```

Para cada operação individual, por exemplo `7×8`:

```text
2 plannedExposure / Região × 11 Regiões
= 22 plannedExposure por operação na campanha
```

Conferências equivalentes:

```text
10 tabuadas × 220 = 2.200
100 operações × 22 = 2.200
11 Regiões × 200 = 2.200
110 Ilhas × 20 = 2.200
```

## 3. Unidade fixa da Ilha

Toda Ilha comum, inclusive as 10 Ilhas da Região 11, contém exatamente:

```text
20 plannedExposure
```

Tentativas criadas por erro não entram nessa conta.

Logo:

```text
plannedExposure(island) = 20
```

para todas as 110 Ilhas.

## 4. Progressão de interleaving

Quantidade de tabuadas distintas que coexistem em cada Ilha:

| Região | Tabuadas por Ilha (K) | recoveryGap alvo |
|---|---:|---:|
| 1 | 2 | 2 |
| 2 | 2 | 2 |
| 3 | 3 | 3 |
| 4 | 3 | 3 |
| 5 | 4 | 4 |
| 6 | 4 | 4 |
| 7 | 5 | 5 |
| 8 | 5 | 5 |
| 9 | 10 | 6 |
| 10 | 10 | 6 |
| 11 | 10 | 6 |

Progressão:

```text
2 → 3 → 4 → 5 → 10 → 10 → 10
```

A Região 11 mantém mistura completa. Ela é o fechamento do percurso, não uma volta a blocos de tabuada.

## 5. Algoritmo determinístico de composição

Considere:

```text
island = 1..10
role   = 0..K-1
```

A tabuada associada ao papel dentro da Ilha é:

```text
table = 1 + ((island - 1 + role) mod 10)
```

Consequências:

- cada Ilha contém exatamente K tabuadas distintas;
- cada tabuada ocupa cada papel exatamente uma vez ao longo das 10 Ilhas;
- cada tabuada recebe exatamente 20 plannedExposure por Região;
- cada operação recebe exatamente 2 plannedExposure por Região.

## 6. Multiplicadores por papel

Os conjuntos permanecem os mesmos da matriz V1.

### K = 2

```text
role 0 → {1,2,3,4,5,6,7,8,9,10}
role 1 → {1,2,3,4,5,6,7,8,9,10}
```

Cotas:

```text
10 + 10 = 20
```

### K = 3

```text
role 0 → {1,2,3,4,5,6,7}
role 1 → {4,5,6,7,8,9,10}
role 2 → {1,2,3,8,9,10}
```

Cotas:

```text
7 + 7 + 6 = 20
```

Cada multiplicador aparece em exatamente dois papéis.

### K = 4

```text
role 0 → {1,2,3,4,5}
role 1 → {6,7,8,9,10}
role 2 → {1,2,3,4,5}
role 3 → {6,7,8,9,10}
```

Cotas:

```text
5 + 5 + 5 + 5 = 20
```

### K = 5

```text
role 0 → {1,4,6,9}
role 1 → {2,5,7,10}
role 2 → {1,3,6,8}
role 3 → {2,4,7,9}
role 4 → {3,5,8,10}
```

Cotas:

```text
4 + 4 + 4 + 4 + 4 = 20
```

Cada multiplicador aparece exatamente duas vezes.

### K = 10

```text
role 0 → {1,6}
role 1 → {2,7}
role 2 → {3,8}
role 3 → {4,9}
role 4 → {5,10}
role 5 → {1,6}
role 6 → {2,7}
role 7 → {3,8}
role 8 → {4,9}
role 9 → {5,10}
```

Cotas:

```text
2 × 10 papéis = 20
```

Esse conjunto é usado nas Regiões 9, 10 e 11.

## 7. Ordem de apresentação

A matriz define o multiconjunto obrigatório de cada Ilha.

A ordem pode variar desde que:

1. as 20 plannedExposure sejam preservadas;
2. nenhuma operação seja adicionada ou removida;
3. a mesma operação não apareça duas vezes seguidas;
4. sejam evitadas mais de duas questões consecutivas da mesma tabuada;
5. uma seed produza ordem reproduzível em testes.

Aleatoriedade altera ordem, nunca cota.

## 8. plannedExposure e recoveryAttempt

### plannedExposure

É uma entrada da matriz curricular base.

- existe independentemente do desempenho;
- é contabilizada uma única vez quando apresentada;
- não é criada por erro;
- não desaparece por causa de recuperação.

### recoveryAttempt

É uma tentativa criada por erro.

- não incrementa plannedExposure;
- não substitui uma exposição planejada;
- não altera X;
- pode ocorrer várias vezes para a mesma operação;
- deixa de existir quando a condição de recuperação é satisfeita.

Contadores:

```text
plannedExposureCount
recoveryAttemptCount
```

## 9. Regra de dois acertos consecutivos

Para cada operação dentro da Região:

```text
correctStreak = 0..2
```

Resposta correta:

```text
correctStreak = min(2, correctStreak + 1)
```

Resposta errada:

```text
correctStreak = 0
scheduleRecovery(operation)
```

Como toda operação possui exatamente duas plannedExposure por Região, a matriz continua compatível com a regra de dois acertos consecutivos sem criar uma categoria extra de tentativa.

## 10. Recuperação após erro

Ao errar:

1. a tentativa mantém seu tipo original;
2. `correctStreak` volta a 0;
3. uma recoveryAttempt é agendada;
4. ela fica elegível após `recoveryGap` outras tentativas;
5. erro em recuperação gera nova recoveryAttempt;
6. atingir `correctStreak = 2` cancela recuperação pendente da mesma operação.

A fila de recuperação pertence à Região e pode atravessar Ilhas.

A Região só é pedagogicamente concluída quando:

```text
200 plannedExposure apresentados
AND
nenhuma recoveryAttempt pendente
AND
100 operações com correctStreak = 2
```

No fim da Região, se o gap integral não puder ser satisfeito sem deadlock, ele pode ser reduzido progressivamente. Essa redução não cria plannedExposure.

## 11. Região 11

A Região 11 participa integralmente do scheduler.

Ela usa:

```text
K = 10
20 plannedExposure por Ilha
200 plannedExposure na Região
20 plannedExposure por tabuada
2 plannedExposure por operação
recoveryGap = 6
```

As Ilhas 1..9 continuam entregando os nove fragmentos do Mapa Final conforme DEC-005.

A Ilha 10 continua sendo o fechamento do arco final.

O significado narrativo dos fragmentos e do Grande Baú não altera as cotas pedagógicas da Região.

## 12. Invariantes obrigatórios

Por Ilha:

```text
plannedExposure = 20
tabuadas distintas = K da Região
```

Por Região:

```text
Ilhas = 10
plannedExposure = 200
plannedExposure por tabuada = 20
plannedExposure por operação = 2
```

Por campanha:

```text
Regiões = 11
Ilhas = 110
plannedExposure total = 2.200
plannedExposure por tabuada = 220
plannedExposure por operação = 22
```

Erros:

```text
recoveryAttempt >= 0
recoveryAttempt NÃO altera plannedExposure
```

Cobertura:

```text
para toda tabuada n ∈ [1,10]
para todo multiplicador m ∈ [1,10]
plannedExposure(n,m,Região) = 2
plannedExposure(n,m,campanha) = 22
```

## 13. Contrato para Desenvolvimento

A implementação de domínio deve representar, no mínimo:

```text
RegionPlan
IslandPlan
ChallengeSlot
ExposureType = PLANNED | RECOVERY
RecoveryQueue
OperationMasteryState
```

A geração deve ser independente da UI e demonstrável por testes automatizados.

## 14. Impacto de Produto

A expansão de 100 para 110 Ilhas aumenta a carga planejada da campanha de:

```text
2.000 → 2.200 plannedExposure
```

Aumento:

```text
+200 plannedExposure
+10%
```

Esse aumento é proporcional ao crescimento estrutural de 10%.

A densidade pedagógica não muda:

```text
20 plannedExposure por Ilha
200 por Região
```

## 15. Decisão final

```text
X = 220 plannedExposure por tabuada
plannedExposure total = 2.200
plannedExposure por operação = 22
```

Esta versão substitui os totais da primeira versão da DEC-004 e é a fonte de verdade para a campanha de 11 Regiões.
