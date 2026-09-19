# Issue #5 — Verificação da matriz do scheduler

## Objetivo

Validar matematicamente a DEC-004 antes do handoff para Desenvolvimento.

## Medição da referência

```text
10 operações por tabuada
2 acertos consecutivos por operação
10 Regiões equivalentes aos 10 Portais
```

Logo:

```text
20 plannedExposure / tabuada / Região
200 plannedExposure / tabuada / campanha
```

## Verificação da matriz

Foi verificado para os valores:

```text
K ∈ {2,3,4,5,10}
```

e para todas as combinações:

```text
10 Regiões × 10 Ilhas
```

Resultados:

```text
cada Ilha                  = 20 plannedExposure
cada Ilha                  = K tabuadas distintas
cada Região                = 200 plannedExposure
cada tabuada por Região    = 20 plannedExposure
cada operação por Região   = 2 plannedExposure
cada tabuada na campanha   = 200 plannedExposure
cada operação na campanha  = 20 plannedExposure
campanha inteira           = 2.000 plannedExposure
```

Nenhuma operação é duplicada dentro do plano base de uma mesma Ilha.

## Recuperação

A regra foi analisada separadamente da matriz curricular:

- erro cria recoveryAttempt;
- recoveryAttempt não consome cota base;
- plannedExposure permanece fixo;
- fila pode atravessar Ilhas;
- Região só conclui sem dívida de recuperação;
- redução terminal de gap evita deadlock sem criar exposição planejada.

## Invariantes entregues à Issue #6

1. `plannedExposure(table) === 200` ao fim da campanha;
2. `plannedExposure(operation) === 20` ao fim da campanha;
3. `plannedExposure(operation, region) === 2`;
4. `plannedExposure(island) === 20`;
5. erro nunca incrementa contador de plannedExposure;
6. ordem pode variar sem alterar o multiconjunto;
7. toda recuperação possui `exposureType = RECOVERY`;
8. a geração do plano independe da interface.

## Qualidade e Build

```text
RESULTADO = APROVADO
```

Não há inconsistência aritmética ou quebra de cota na matriz definida pela DEC-004.
