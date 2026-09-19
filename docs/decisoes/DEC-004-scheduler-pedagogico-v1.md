# DEC-004 — Scheduler pedagógico V1 e carga equivalente ao jogo de referência

**Status:** Aprovado para implementação  
**Data:** 2026-09-19  
**Responsáveis principais:** Produto + Game Design e Aprendizagem  
**Origem:** Issue #5  
**Impacta:** scheduler, geração de desafios, recuperação após erro, testes de invariantes e progressão pedagógica

## 1. Medição da referência

No jogo de referência:

- existem 10 Portais;
- cada Portal possui 10 Mundos;
- cada Mundo corresponde a uma tabuada;
- o Mundo inicia com as operações `n×1` até `n×10`;
- cada operação precisa de 2 acertos consecutivos para ser dominada;
- um erro zera a sequência daquela operação e a recoloca na fila;
- repetições causadas por erro aumentam o número real de tentativas, mas não fazem parte da carga curricular planejada.

No 2.0:

```text
Portal → Região
Mundo  → Ilha
```

## 2. Valor de X

Cada tabuada possui, por Região, 10 operações e 2 exposições planejadas por operação:

```text
10 operações × 2 exposições = 20 plannedExposure por tabuada / Região
```

Como existem 10 Regiões:

```text
X = 20 × 10 = 200 plannedExposure por tabuada na campanha
```

Logo:

```text
plannedExposure(T1)  = 200
plannedExposure(T2)  = 200
...
plannedExposure(T10) = 200
```

Carga planejada global:

```text
10 tabuadas × 200 = 2.000 plannedExposure
```

Cada operação individual, por exemplo `7×8`, possui:

```text
2 plannedExposure / Região × 10 Regiões = 20 plannedExposure
```

### Distinção importante

Existem 100 identidades de operação:

```text
10 tabuadas × 10 multiplicadores = 100 operações
```

Mas a carga de exposição não é 100 por tabuada. Cada operação precisa de duas oportunidades planejadas em cada Região, preservando a regra de dois acertos consecutivos da referência.

## 3. Unidade fixa de uma Ilha

Cada Região possui:

```text
10 Ilhas
```

Cada Região precisa distribuir:

```text
10 tabuadas × 20 exposições = 200 plannedExposure
```

Portanto cada Ilha recebe exatamente:

```text
200 / 10 = 20 plannedExposure
```

A quantidade de tentativas reais pode ser maior que 20 quando existirem erros.

## 4. Progressão de interleaving por Região

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

O interleaving aumenta por estágios:

```text
2 → 3 → 4 → 5 → 10 tabuadas por Ilha
```

As duas Regiões finais trabalham com mistura completa.

## 5. Algoritmo determinístico de composição

Considere:

```text
island = 1..10
role   = 0..K-1
```

A tabuada associada a um papel dentro da Ilha é:

```text
table = 1 + ((island - 1 + role) mod 10)
```

Assim:

- cada Ilha contém exatamente K tabuadas distintas;
- cada tabuada ocupa cada papel exatamente uma vez ao longo das 10 Ilhas;
- a soma das cotas de cada papel é sempre 20;
- cada tabuada recebe exatamente 20 plannedExposure por Região.

## 6. Multiplicadores por papel

Os conjuntos abaixo são a fonte de verdade da matriz V1.

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

As duas exposições da mesma operação ficam separadas por dois papéis.

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

Cada multiplicador aparece duas vezes, com separação de dois papéis.

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

As duas exposições da mesma operação ficam separadas por cinco papéis.

## 7. Exemplo

### Região 5, Ilha 1

A Região 5 usa K=4.

Aplicando a fórmula:

```text
role 0 → tabuada 1 → ×1, ×2, ×3, ×4, ×5
role 1 → tabuada 2 → ×6, ×7, ×8, ×9, ×10
role 2 → tabuada 3 → ×1, ×2, ×3, ×4, ×5
role 3 → tabuada 4 → ×6, ×7, ×8, ×9, ×10
```

Total:

```text
20 plannedExposure
4 tabuadas distintas
nenhuma operação duplicada dentro da mesma Ilha
```

Nas Ilhas seguintes os papéis avançam ciclicamente. Ao fim da Região, cada uma das 10 tabuadas terá exatamente 20 exposições e cada operação terá aparecido exatamente duas vezes.

## 8. Ordem de apresentação

A matriz define o multiconjunto obrigatório.

A ordem das 20 exposições dentro da Ilha pode variar, mas deve respeitar:

1. não alterar quantidades;
2. não remover nem duplicar plannedExposure;
3. não apresentar a mesma operação duas vezes seguidas;
4. evitar mais de duas questões consecutivas da mesma tabuada;
5. usar ordem reproduzível em testes quando uma seed for fornecida.

A aleatoriedade, quando existir, altera apenas a ordem, nunca a matriz.

## 9. plannedExposure e recoveryAttempt

### plannedExposure

Uma entrada da matriz curricular base.

Regras:

- existe independentemente do desempenho do jogador;
- é contabilizada exatamente uma vez quando apresentada;
- nunca é criada por erro;
- nunca é removida porque houve uma recuperação.

### recoveryAttempt

Uma tentativa criada por erro.

Regras:

- não incrementa a cota curricular;
- não substitui plannedExposure;
- não altera X;
- pode existir várias vezes para a mesma operação;
- desaparece quando a condição de recuperação é satisfeita.

Contadores independentes:

```text
plannedExposureCount
recoveryAttemptCount
```

## 10. Regra de dois acertos consecutivos

A regra da referência é preservada no estado pedagógico da operação dentro da Região.

Para cada operação:

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

Tanto plannedExposure quanto recoveryAttempt podem contribuir para o correctStreak.

O tipo da tentativa e o estado de domínio são conceitos diferentes.

## 11. Recuperação após erro

Ao errar:

1. a tentativa atual mantém seu tipo original;
2. `correctStreak` da operação volta para 0;
3. uma recuperação é agendada;
4. ela só fica elegível depois de `recoveryGap` outras tentativas;
5. se a recuperação também for errada, uma nova recoveryAttempt é agendada;
6. enquanto a operação não atingir `correctStreak = 2`, ela pode continuar retornando por recuperação;
7. atingir streak 2 cancela qualquer recuperação pendente da mesma operação.

`recoveryGap` é definido pela tabela da seção 4.

### Fronteira entre Ilhas

A fila de recuperação pertence à Região, não exclusivamente à Ilha.

Uma recuperação ainda não elegível ao final de uma Ilha pode atravessar para a Ilha seguinte.

A Região só é considerada pedagogicamente concluída quando:

```text
todos os 200 plannedExposure foram apresentados
AND
não existem recoveryAttempt pendentes
AND
todas as 100 operações estão com correctStreak = 2
```

### Caso terminal

Depois da última plannedExposure da Região, o scheduler continua consumindo a fila de recuperação.

Se não houver tentativas distintas suficientes para satisfazer integralmente o gap alvo, o gap pode ser reduzido progressivamente até evitar deadlock.

Essa redução terminal:

- não cria plannedExposure;
- não muda cotas;
- só afeta a distância da recuperação.

## 12. Invariantes obrigatórios

Para cada Região:

```text
islands = 10
plannedExposure por Ilha = 20
plannedExposure total = 200
plannedExposure por tabuada = 20
plannedExposure por operação = 2
```

Para a campanha:

```text
Regiões = 10
Ilhas = 100
plannedExposure total = 2.000
plannedExposure por tabuada = 200
plannedExposure por operação = 20
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
```

## 13. Contrato para Desenvolvimento

A Issue #6 deve implementar no domínio, sem dependência da UI:

```text
RegionPlan
IslandPlan
ChallengeSlot
ExposureType = PLANNED | RECOVERY
RecoveryQueue
OperationMasteryState
```

A implementação deve ser capaz de provar os invariantes acima com testes automatizados.

## 14. Impacto de Produto

Nenhum total estrutural é alterado:

```text
10 Regiões
10 Ilhas por Região
100 Ilhas
10 tabuadas
10 operações por tabuada
```

A mudança reorganiza a prática. Não aumenta a carga curricular planejada em relação à referência.

A duração real de uma Região pode crescer em caso de erros, assim como ocorria no jogo de referência.

## 15. Decisão final

```text
X = 200 plannedExposure por tabuada
```

A matriz e as regras desta decisão fecham os pontos pedagógicos deixados em aberto pela DEC-001 para a V1.
