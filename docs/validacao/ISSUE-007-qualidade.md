# Issue #7 — Qualidade do vertical slice textual

## Escopo validado

Versão funcional temporária sem assets novos.

Fluxo:

```text
Home
→ Regiões
→ Ilhas
→ Desafio
→ Feedback
→ Resultado
→ progresso persistido
```

## Evidências técnicas

Commits principais:

```text
sessão/persistência = 13079cde9fb53cf2f68014c48242ceaf93e1e639
UI textual         = 6102b4d29509515a3c9001dd1c52218e335d7a5c ... 86169d46fdb0f342803bec01811ec11d61baa170
```

Pipelines finais da integração:

```text
Web Unit Tests = 35488302258 → success
Web Preview    = 35488302269 → success
Android Debug  = 35488302274 → success
```

## Casos cobertos

- sessão usa o scheduler real da #6;
- perguntas vêm de `createIslandPlan`;
- 20 plannedExposure encerram a Ilha;
- erro agenda recoveryAttempt;
- recoveryAttempt não aumenta plannedExposure;
- estado pedagógico da Região é preservado entre Ilhas;
- sessão ativa é serializável e persiste em localStorage;
- reload pode retomar a sessão;
- conclusão da Ilha atualiza campaign progress;
- próxima Ilha é liberada sequencialmente;
- resultado permanece disponível após persistência;
- browser e Android usam a mesma fonte `web/`.

## Resultado

```text
QUALIDADE E BUILD = APROVADO
BUG BLOQUEADOR = 0
BUG CRÍTICO = 0
```
