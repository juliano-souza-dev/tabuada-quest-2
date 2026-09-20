# Issue #24 — Experience Validator

## Fluxo avaliado

```text
Home
→ Regiões
→ Região disponível / em progresso / concluída / bloqueada
→ viagem sequencial
→ Região 11
→ 9 fragmentos
→ Ilha 10
→ Grande Baú Final
```

## Avaliação infantil

### A criança sabe onde tocar?

Sim. Regiões são alvos independentes e a navegação possui retorno explícito para a Home.

### O bloqueio é explicado?

Sim. Tocar em uma Região bloqueada informa que a Região anterior precisa ser concluída.

### O próximo passo é compreensível?

Sim. A progressão usa estados curtos: EXPLORAR, CONTINUAR, CONCLUÍDA e BLOQUEADA.

### O progresso é visível?

Sim. Cada Região mostra `x/10`; a Região 11 também mostra `x/9` do Mapa Final e estados específicos de Ilha 10 e Grande Baú.

### A Região 11 parece uma recompensa/progressão especial?

Sim. Ela recebe maior área visual e concentra a progressão do Mapa Final e do Grande Baú.

## Risco residual

A legibilidade e o encaixe pixel-perfect dos textos sobre o mapa devem ser confirmados pelo líder no dispositivo/preview publicado. Isso não altera a lógica de navegação.

## Decisão

```text
EXPERIENCE_VALIDATOR = APROVADO
```
