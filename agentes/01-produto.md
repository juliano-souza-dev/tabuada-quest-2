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

## Macroestrutura canônica de Regiões

A estrutura do mundo está fechada em:

```text
22 Regiões
×
5 Ilhas por Região
=
110 Ilhas
```

Regras absolutas:

- **não existem sub-regiões**;
- cada Região é uma unidade real e independente do mundo;
- cada Região possui exatamente 5 Ilhas;
- uma tela visual de Região corresponde a **uma única Região**;
- não usar segunda página, subpágina, Região interna ou continuação escondida para acomodar mais 5 Ilhas;
- o Mapa mundo deve tratar as 22 Regiões como entidades próprias;
- a expansão de 11 para 22 Regiões preserva as 110 Ilhas e não reduz o conteúdo pedagógico total.

A antiga estrutura de 11 Regiões com 10 Ilhas por Região está descontinuada.

A antiga solução de dividir CORSÁRIO em `CORSÁRIO 1` e `CORSÁRIO 2` como duas páginas da mesma Região também está descontinuada como arquitetura de Produto. Durante a migração técnica, nomes ou páginas antigas podem continuar existindo no código apenas como legado temporário, mas não devem ser usados como modelo para novas Regiões.

A nomenclatura definitiva das novas Regiões adicionais deve ser definida separadamente. Não inventar nomes para completar as 22 Regiões.

### Regiões definitivas

O líder delegou a curadoria final das 22 Regiões. A seleção e a ordem canônicas passam a ser:

```text
01 CORSÁRIO
02 BIRADES
03 ZONA OURO
04 VALE ESMERALDA
05 ZONA SAFIRA
06 TERRAS GÉLIDAS
07 FANTASMAS
08 MARÉ SOMBRIA
09 TEMPESTÁRIA
10 MAR DE FERRO
11 ZONA KRAKEN
12 TERRAS DE CINZA
13 OBSIDIANA
14 ZONA RUBI
15 ESCARLATE
16 ZONA DO DRAGÃO
17 TERRAS DO TITÃ
18 CRISTÁLIA
19 ILHAS CELESTES
20 COROA DO MAR
21 ZONA FÊNIX
22 REINO DAS MARÉS
```

Essa ordem é parte do contrato de Produto. Cada nome representa uma Região independente de 5 Ilhas; não existem sub-regiões.

A progressão temática foi organizada para começar em aventura pirata mais terrena, atravessar biomas e perigos marítimos cada vez mais fantásticos e terminar em uma escala mítica/regal no `REINO DAS MARÉS`.

Nomes aprovados mantidos em reserva para futuras expansões:

```text
AURORA
TERRAS DO TROVÃO
COSTA ESMERALDA
MAR DOURADO
NEBULÁRIA
MAREMÍSTICA
```

`ARQUIPÉLAGO FANTASMA` permanece descartado e substituído por `FANTASMAS`.

Nenhum nome fora da lista definitiva ou da reserva aprovada deve ser tratado como canônico sem nova validação do líder.


### Composição visual de cada Região

Cada Região exibe:

```text
5 Ilhas
+
Mapa mundo global
```

Nenhuma Região exibe status textual sobre as Ilhas. Os estados de domínio continuam existindo para comportamento e progressão, mas não fazem parte da composição visual.

## Estados de Ilha

Estados de domínio válidos:

```text
locked
available
completed
```

Esses estados não são apresentados como texto nas telas de Região.

`CONTINUAR` pode continuar existindo como conceito de sessão, mas não é exibido como status textual sobre a Ilha.

Recuperação pedagógica também não cria status visual adicional.

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
