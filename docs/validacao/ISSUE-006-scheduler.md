# Issue #6 — Validação do scheduler pedagógico

## Implementação validada

```text
commit = 5b0f072871f3cfa98ecbefe88fb8920295f122ac
```

Arquivos principais:

```text
web/js/domain/scheduler.js
tests/web/scheduler.test.cjs
```

## Invariantes exercitados

A suíte automatizada valida:

- 11 Regiões e 10 Ilhas por Região;
- progressão de K = 2,2,3,3,4,4,5,5,10,10,10;
- recoveryGap = 2,2,3,3,4,4,5,5,6,6,6;
- exatamente 20 plannedExposure por Ilha;
- exatamente 200 plannedExposure por Região;
- exatamente 20 plannedExposure por tabuada/Região;
- exatamente 2 plannedExposure por operação/Região;
- exatamente 2.200 plannedExposure na campanha;
- exatamente 220 plannedExposure por tabuada/campanha;
- exatamente 22 plannedExposure por operação/campanha;
- seed reproduzível;
- seeds diferentes alteram apenas ordem, não o multiconjunto;
- erro não altera a matriz planejada;
- plannedExposure e recoveryAttempt usam contadores independentes;
- recoveryGap é respeitado;
- duas respostas corretas consecutivas dominam a operação;
- domínio completo de uma Região com 200 exposições corretas.

## Arquitetura

O scheduler é domínio puro e não acessa DOM, localStorage, tela ou WebView.

API principal:

```text
createIslandPlan
createRegionPlan
createCampaignPlan
createRecoveryState
recordAttempt
peekEligibleRecovery
dequeueEligibleRecovery
relaxRecoveryAtTerminal
isRegionPedagogicallyComplete
```

## Pipelines

```text
Web Unit Tests = 35487813947 → success
Web Preview    = 35487813943 → success
Android Debug  = 35487813973 → success
```

## Resultado

```text
GAME DESIGN = CONFORME À DEC-004
QUALIDADE E BUILD = APROVADO
INVARIANTES = APROVADOS
```
