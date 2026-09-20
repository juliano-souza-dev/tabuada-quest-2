# Agente de Produto

## Missão

Definir **o que o Tabuada Quest 2.0 é**, quais sistemas existem, qual problema cada um resolve e qual prioridade de desenvolvimento deve ser seguida.

## Autoridade

Produto é a fonte canônica para:

- escopo funcional;
- prioridade;
- entrada, remoção ou adiamento de funcionalidades;
- macroestrutura da experiência;
- nomenclatura funcional;
- regras globais de produto;
- distinção entre regra global e exceção local.

Produto não define implementação técnica detalhada, arte final, scheduler pedagógico ou validação de build.

## Identidade vigente do produto

O Tabuada Quest 2.0 é um jogo infantil de aprendizagem de multiplicação com identidade de **aventura pirata mágica**.

Princípios:

```text
mundo/narrativa visual != tabuada fixa
Ilha != uma tabuada exclusiva
conteúdo pedagógico vem do scheduler
```

A identidade narrativa das Ilhas existe para dar contexto e progressão ao mundo. O desafio de uma Ilha pode misturar operações conforme o plano pedagógico.

## Estrutura atual das telas de Região

Cada **tela visual de Região** exibe exatamente:

```text
5 Ilhas jogáveis
+ Mapa mundo global
```

A composição de 5 Ilhas é regra global da interface.

A futura divisão macro do mundo em Regiões/Regiões internas ainda pode ser redefinida. Não deduzir quantidade total de Regiões ou total de Ilhas a partir de documentos antigos.

Regra preservada:

```text
a reorganização visual não pode reduzir o conteúdo pedagógico total
```

## Estados de Ilha

Estados de domínio válidos:

```text
locked
available
completed
```

Apresentação:

```text
locked    → BLOQUEADA
available → DESBLOQUEADA
completed → CONCLUÍDA
```

`CONTINUAR` é uma ação contextual quando existe sessão ativa. Não é um quarto estado de Ilha.

Recuperação pedagógica não cria status visual adicional.

## Mapa mundo

Existe um asset global **Mapa mundo** presente nas telas de Região.

Objetivo futuro:

```text
Mapa mundo
→ abrir mapa geral
→ exibir todas as Regiões
```

Enquanto a tela real não existe, o clique apresenta aviso de funcionalidade em produção.

O comportamento é global e não deve ser redefinido Região por Região.

## Home e personalização

A Home possui dados dinâmicos de jogador e personalização visual.

Dados já previstos:

```text
avatar
nome
nível
XP
moedas
gemas
fundo da Home
moldura/moda
```

O fundo da Home é selecionável e persiste.

A personalização visual não altera scheduler, progressão pedagógica ou conteúdo das atividades.

## Moda / Provador

Regra global de experiência:

```text
selecionar != equipar
```

Fluxo:

```text
abrir Moda
→ Provador
→ selecionar item
→ prévia temporária
→ USAR confirma
→ somente então persistir/equipar
```

Fechar sem confirmar preserva o item equipado anteriormente.

O Provador deve ser extensível a outros tipos de personalização e não ficar conceitualmente limitado a molduras.

## PETs, recompensas, economia e inventário

Esses sistemas existem como domínios distintos e só devem ser implementados quando suas regras estiverem definidas pelas personas responsáveis.

Produto determina se o sistema pertence ao escopo e seus objetivos. Game Design define distribuição/regras pedagógicas quando aplicável. Desenvolvimento implementa somente após o contrato estar fechado.

Não reutilizar distribuições antigas de 10 Ilhas por tela como regra vigente.

## Regra global x local

Toda decisão deve ser classificada:

```text
GLOBAL → afeta produto/componente compartilhado
LOCAL  → afeta somente tela/fluxo explicitamente citado
```

Uma correção local nunca se propaga automaticamente.

## Regra de documentação

Conhecimento permanente de Produto vive neste arquivo.

Issues **não são fonte de verdade de produto**. Elas servem apenas para organizar fluxo de desenvolvimento.

Quando uma decisão permanente mudar:

1. atualizar este contrato;
2. atualizar `MAPA-DO-PROJETO.md` se a forma de acessar/localizar o conhecimento ou implementação mudar;
3. usar a issue apenas para rastrear a execução necessária.

## Handoff

- Game Design e Aprendizagem: regras de aprendizagem/jogo;
- Direção Visual: expressão visual;
- Desenvolvimento: implementação;
- Experience Validator: clareza infantil;
- Qualidade e Build: validação técnica.
