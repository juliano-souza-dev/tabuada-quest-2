# Validação da Issue #4 — Arquitetura Web V1 e Core Mobile

**Data:** 2026-09-19  
**Issue:** #4 — Definir arquitetura web, domínio, persistência e estratégia de testes  
**Personas:** Produto, Direção Visual, Desenvolvimento, Experience Validator, Qualidade e Build

## Resultado

**INVALIDADO POR REPROVAÇÃO VISUAL DO USUÁRIO**

A Issue #4 estabelece tanto a arquitetura técnica quanto a estrutura visual/mobile da V1 como parte do core.

## Arquitetura validada

- `web/` permanece fonte única para navegador e Android WebView;
- UI, conteúdo, domínio, persistência e bootstrap foram separados;
- scripts clássicos mantêm compatibilidade com `file:///android_asset/index.html`;
- nenhuma regra pedagógica da #5/#6 foi antecipada;
- domínio/persistência são testáveis sem DOM;
- estado persistente possui `schemaVersion = 1`;
- recuperação segura não concede recompensas em dados inválidos.

Documento:

```text
docs/arquitetura/WEB-V1.md
```

## Estrutura mobile validada

A antiga composição de landing page foi removida.

A Home atual:

- usa o viewport como tela de jogo;
- não depende de rolagem inicial;
- coloca estado do jogador no topo;
- deixa a ação `JOGAR` como foco primário;
- apresenta progresso de mapa e atalhos em densidade compacta;
- usa Regiões, mapas, baús e missão no vocabulário atual;
- usa identidade pirata/marítima;
- adapta desktop a partir da composição mobile;
- possui modo compacto para telas de baixa altura.

### Experience Validator

Critérios avaliados:

- **A criança sabe onde tocar?** Sim, `JOGAR` domina a hierarquia.
- **Entende o estado principal?** Sim, Região/Ilha e Diamantes estão no topo.
- **Sabe o próximo passo?** Sim, ação principal e mapa especial ficam visíveis sem rolagem.
- **Carga cognitiva excessiva?** Não no corte atual; detalhes secundários são reduzidos em baixa altura.
- **Controles adequados?** Sim, alvos principais respeitam mínimo de toque e cards compactos.
- **Comportamento de site/landing page?** Removido.
- **Tema coerente?** Sim, estrutura usa o recorte pirata canônico.

**Experience Validator: APROVADO.**

## Testes automatizados

Workflow:

```text
.github/workflows/web-unit-tests.yml
```

Run:

```text
35461810852
```

Resultado:

```text
success
```

Cobertura inicial:

- estado inicial;
- normalização de estado inválido;
- persistência;
- recuperação de JSON corrompido.

## Preview público

Workflow:

```text
.github/workflows/web-preview-pages.yml
```

Run final:

```text
35461886529
```

Resultado:

```text
success
```

URL:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

## Android Debug

Workflow:

```text
.github/workflows/android-debug.yml
```

Run final:

```text
35461886489
```

Resultado:

```text
success
```

Isso confirma que a mesma `web/` continua empacotável no wrapper Android após a modularização.

## Correção incorporada durante QA

Foi removido `min-height: 620px` do viewport mobile porque poderia cortar a interface em aparelhos de baixa altura.

Também foi criado um modo compacto para `max-height: 640px`, reduzindo elementos secundários sem esconder a ação principal.

## Pendências

Nenhuma pendência bloqueadora da Issue #4.

A definição do scheduler pedagógico permanece corretamente na Issue #5.

## Decisão

A Issue #4 pode ser encerrada como **completed**.

A Issue #5 só pode ser liberada após o fechamento formal da #4.


## Revisão posterior — 2026-09-19

A validação visual registrada neste documento foi invalidada após reprovação explícita do usuário.

A arquitetura técnica, testes e build continuam válidos.

A aprovação da **camada visual/mobile** não continua válida.

A Issue #4 foi reaberta e deve passar novamente por:

1. Direção Visual;
2. Experience Validator;
3. Desenvolvimento;
4. Qualidade + preview público.

Não usar este documento como evidência de aprovação visual até nova validação.
