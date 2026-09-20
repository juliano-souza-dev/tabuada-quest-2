# Issue #5 — Verificação da matriz do scheduler para 11 Regiões

## Objetivo

Validar matematicamente a DEC-004 atualizada para a campanha de:

```text
11 Regiões
10 Ilhas por Região
110 Ilhas
```

## Totais estruturais

A densidade escolhida permanece:

```text
20 plannedExposure por Ilha
```

Logo:

```text
110 × 20 = 2.200 plannedExposure
```

Validações equivalentes:

```text
11 Regiões × 200 = 2.200
10 tabuadas × 220 = 2.200
100 operações × 22 = 2.200
```

Todos os totais convergem.

## Verificação por Região

Para cada uma das 11 Regiões:

```text
10 Ilhas
20 plannedExposure por Ilha
200 plannedExposure na Região
20 plannedExposure por tabuada
2 plannedExposure por operação
```

A matriz foi verificada para:

```text
K ∈ {2,3,4,5,10}
```

Distribuição:

```text
R1-R2   K=2
R3-R4   K=3
R5-R6   K=4
R7-R8   K=5
R9-R11  K=10
```

Em todos os casos:

- cada Ilha contém exatamente K tabuadas distintas;
- cada Ilha contém exatamente 20 plannedExposure;
- cada tabuada recebe 20 plannedExposure por Região;
- cada operação recebe exatamente 2 plannedExposure por Região;
- nenhuma operação é duplicada dentro do plano base da mesma Ilha.

## Região 11

A Região 11 usa K=10.

Resultado:

```text
10 Ilhas × 20 = 200 plannedExposure
20 por tabuada
2 por operação
```

A Região 11 é pedagogicamente completa e não funciona apenas como camada narrativa.

## Totais de campanha

Para cada tabuada:

```text
20 por Região × 11 = 220
```

Para cada operação:

```text
2 por Região × 11 = 22
```

Portanto:

```text
plannedExposure(table) = 220
plannedExposure(operation) = 22
plannedExposure(campaign) = 2.200
```

## Variação em relação à referência

A campanha passou de 100 para 110 Ilhas:

```text
+10% de Ilhas
```

A carga planejada passou de 2.000 para 2.200:

```text
+10% de plannedExposure
```

A densidade permanece invariável:

```text
20 plannedExposure por Ilha
200 por Região
```

## Recuperação

A recuperação permanece fora da cota curricular.

- erro cria recoveryAttempt;
- recoveryAttempt não incrementa plannedExposure;
- plannedExposure permanece fixo;
- a fila pode atravessar Ilhas;
- a Região só conclui sem dívida de recuperação;
- redução terminal de gap evita deadlock sem criar exposição planejada.

## Invariantes entregues ao Desenvolvimento

1. `plannedExposure(island) === 20`;
2. `plannedExposure(region) === 200`;
3. `plannedExposure(table, region) === 20`;
4. `plannedExposure(operation, region) === 2`;
5. `plannedExposure(table, campaign) === 220`;
6. `plannedExposure(operation, campaign) === 22`;
7. `plannedExposure(campaign) === 2200`;
8. erro nunca incrementa plannedExposure;
9. toda recuperação possui `exposureType = RECOVERY`;
10. ordem pode variar sem alterar o multiconjunto;
11. a geração do plano independe da interface;
12. R11 usa K=10 e mantém os mesmos invariantes das demais Regiões.

## Qualidade e Build

```text
RESULTADO = APROVADO
INCONSISTÊNCIAS ARITMÉTICAS = 0
```

A matriz de 11 Regiões é matematicamente fechada e pronta para implementação no domínio.
