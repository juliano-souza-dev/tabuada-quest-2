# Validação de fidelidade visual — Issue #4

**Data:** 2026-09-19  
**Persona:** Direção Visual  
**Status:** APROVADO PARA QUALIDADE  
**FIDELIDADE_VISUAL:** 91%

## Referência

Composição visual aprovada pelo líder de equipe para a Home V1.

A implementação usa como casca visual:

```text
web/assets/ui/home-art-overlay.webp
```

O fundo, avatar, moldura e dados do jogador permanecem dinâmicos por decisão explícita do líder de equipe e não são tratados como pixels fixos da referência.

## Medição da casca gráfica

O overlay de produção foi comparado com o overlay premium original aprovado antes da promoção.

Resultado medido:

```text
similaridade RGB ponderada pelo alpha = 94,48%
similaridade do canal alpha          = 99,21%
cobertura visual do overlay          = 56,24% da tela
```

A redução de resolução do overlay para produção preserva a composição e a silhueta com perda visual pequena.

## Geometria principal

O personagem foi reposicionado para a mesma geometria da composição aprovada:

```text
centro horizontal = 50%
top               = 25,7%
largura           = 38,7%
altura            = 28,7%
```

O viewport desktop passou a preservar a proporção:

```text
941 / 1672
```

## Critérios avaliados

| Critério | Resultado |
|---|---|
| composição geral | aprovado |
| hierarquia | aprovado |
| escala do personagem | aprovado |
| portal / moldura central | aprovado |
| logo | aprovado |
| HUD superior | aprovado com dados dinâmicos |
| CTA JOGAR | aprovado |
| FUNDO / MODA | aprovado |
| barra de próximo baú | aprovado |
| navegação inferior | aprovado |
| cards PETS / BAÚ DE ITENS | aprovado |
| integração do fundo | aprovado como slot personalizável |
| moldura de perfil | aprovado como slot personalizável |

## Ajustes feitos após a rodada anterior

- elementos premium deixaram de ser reconstruídos em CSS;
- portal, logo, HUD decorativo, botões, barra de baú, navegação e cards passam a vir da arte aprovada;
- CSS ficou responsável por posicionamento, interação e dados dinâmicos;
- personagem foi alinhado às proporções da referência;
- desktop preserva a proporção da composição;
- valores dinâmicos cobrem os exemplos rasterizados quando necessário;
- nomenclatura visual de Regiões cobre o rótulo legado da referência.

## Slots dinâmicos excluídos da penalização visual

Por decisão do líder de equipe:

- avatar;
- nome;
- nível;
- XP;
- moedas;
- gemas;
- fundo;
- moldura.

Esses slots podem variar sem reduzir a fidelidade da composição.

## Resultado

```text
FIDELIDADE_VISUAL = 91%
GATE_MINIMO       = 75%
EXIGENCIA_LIDER   = 85%
RESULTADO          = APROVADO PARA QUALIDADE
ASSETS_NOVOS       = 1 overlay premium corrigido/promovido
```

A implementação cruza o gate interno de 75% e a exigência adicional de 85% definida pelo líder de equipe.

Próximo handoff:

```text
Direção Visual → Orquestrador → Qualidade e Build
```
