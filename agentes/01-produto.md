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


### Ilhas canônicas da OBSIDIANA

A Região 13 usa exatamente esta sequência:

```text
01 Rocha Negra
02 Cinzas
03 Fogo Obsidiano
04 Cratera
05 Coração de Obsidiana
```

Esses nomes pertencem às **Ilhas jogáveis da Região** e são independentes do catálogo de mapas textuais temáticos.

### Nomes temporários de Ilha

Enquanto uma Ilha da macroestrutura canônica de 22 Regiões × 5 Ilhas ainda não possuir nome definitivo aprovado, ela recebe um **nome temporário textual**.

Formato:

```text
Ilha <palavra> <número>
```

Exemplos possíveis:

```text
Ilha Bruma 47
Ilha Âncora 62
Ilha Coral 31
```

Regras:

- o placeholder deve ser estável para a mesma combinação de Região + Ilha;
- o nome temporário nunca substitui um nome canônico já existente;
- placeholders devem ser identificáveis no conteúdo como temporários;
- alterar o nome temporário para um nome definitivo não altera o ID da Ilha nem o save;
- placeholders existem para desenvolvimento e preenchimento de interface, não constituem aprovação narrativa definitiva.

### Composição visual de cada Região

Cada Região exibe:

```text
5 Ilhas
+
Mapa mundo global
```

Nenhuma Região exibe status textual sobre as Ilhas. Os estados de domínio continuam existindo para comportamento e progressão, mas não fazem parte da composição visual.

## Mapas textuais por Região

Algumas Regiões possuem um catálogo de **5 mapas temáticos próprios**. Nesta etapa, esses mapas existem somente como conteúdo textual: não possuem arte, thumbnail ou asset visual.

Mapas canônicos já definidos:

### CORSÁRIO

```text
Mapa da Bandeira Corsária
Mapa do Saque Perdido
Mapa da Rota dos Corsários
Mapa do Tesouro do Capitão
Mapa da Âncora Dourada
```

### OBSIDIANA

```text
Mapa da Rocha Negra
Mapa das Cinzas Eternas
Mapa do Fogo Obsidiano
Mapa da Cratera Sombria
Mapa do Coração de Obsidiana
```

### ZONA RUBI

```text
Mapa do Rubi Sangrento
Mapa da Gruta Carmesim
Mapa das Pedras Rubras
Mapa do Coração Rubi
Mapa da Coroa Escarlate
```

### ESCARLATE

```text
Mapa do Mar Escarlate
Mapa das Falésias Vermelhas
Mapa da Lua Carmesim
Mapa da Maré Rubra
Mapa do Horizonte Escarlate
```

Regras atuais:

- cada catálogo acima possui exatamente 5 mapas;
- representação atual é exclusivamente textual;
- nenhum asset deve ser inventado ou gerado para esses mapas sem passar pelo fluxo da Direção Visual;
- estes catálogos não substituem nem alteram automaticamente o sistema legado de mapas especiais/fragmentos;
- integração futura com coleta, fragmentos, missões e recompensas exige tarefa própria de implementação.

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

Estado temporário para validação de desenvolvimento:

```text
Mapa mundo
→ listar as 22 Regiões canônicas
→ clicar em qualquer Região
→ abrir a Região em modo preview
```

O preview ignora bloqueios exclusivamente para navegação entre telas e não altera desbloqueios, conclusão, progresso ou save da campanha.

Quando a fase de validação terminar, o Mapa mundo deve passar para **modo somente visualização**. A lista das 22 Regiões permanece, mas o clique deixa de abrir Regiões.

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

## Tripulação e Taberna

A Home possui um acesso permanente chamado **TRIPULAÇÃO**.

Fluxo:

```text
Home
→ TRIPULAÇÃO
→ TABERNA
→ escolher tripulante
→ pagar custo em ouro
→ tripulante contratado permanentemente
```

Regras:

- cada tripulante possui custo fixo em ouro;
- contratação é única e persistente;
- não existe recontratação do mesmo tripulante;
- contratação só ocorre quando há ouro suficiente;
- o custo é descontado de forma atômica no momento da contratação;
- todos os tripulantes contratados ficam ativos;
- bônus de tripulantes contratados se acumulam;
- bônus não são retroativos;
- cada tripulante concede um bônus de uma das categorias: XP, ouro ou gemas;
- na implementação atual, a categoria citada pelo líder como diamantes/rubis usa o saldo já existente de `wallet.gems`; separar Rubi e Diamante em moedas diferentes exige decisão futura de Produto.

A Taberna é a tela funcional para descoberta e contratação da Tripulação. Arte final específica da Taberna e retratos dos tripulantes dependem de Direção Visual e não devem ser inventados pela implementação.

## PETs, recompensas, economia e inventário

Recompensas configuradas para uma Ilha/partida devem ser entregues pelo domínio, nunca apenas representadas visualmente.

Contrato vigente:

```text
toda partida concluída → concede XP
recompensa da Ilha = o tipo configurado no catálogo
chest → Baú
ruby  → Rubi
pet   → PET
```

Regras:

- XP é recompensa de partida e é concedido a cada conclusão válida, inclusive em replay;
- PET, Baú, Rubi e demais marcos vinculados à Ilha são recompensas únicas da primeira conclusão, salvo decisão futura explícita;
- enquanto Rubi e Diamante não forem separados em moedas distintas, recompensas do tipo `ruby` creditam o saldo já existente de `wallet.gems`;
- cada Baú possui um kit próprio de itens;
- o kit pode existir vazio enquanto seu conteúdo ainda não tiver sido definido;
- ao concluir uma Ilha/partida cuja recompensa efetivamente recebida contenha Baú, o jogo abre uma tela dedicada de Baú antes do resultado;
- a tela de Baú atual pode ser funcional e simples; arte final será tratada futuramente pela Direção Visual;
- abrir/receber um Baú não deve duplicar o mesmo Baú nem seus itens em replay.

Produto determina se novos tipos de recompensa pertencem ao escopo. Game Design define distribuição e balanceamento. Desenvolvimento mantém o catálogo extensível e a persistência idempotente.

### Colecionáveis

Existe uma nova categoria permanente chamada **Colecionáveis**.

Colecionáveis são itens de coleção com temática pirata/marítima, como bússolas, pedras, relíquias e artigos de exploração. Eles são obtidos dentro de Baús e não são consumíveis.

Contrato aprovado:

- Baús podem entregar de 1 a 3 Colecionáveis conforme o desempenho da partida;
- uma partida sem erros concede os 3 Colecionáveis disponíveis naquele Baú;
- as faixas intermediária e mínima de erro ainda precisam de percentual definitivo de Game Design;
- Colecionáveis que não forem conquistados não desaparecem;
- itens não conquistados são redistribuídos para Baús seguintes;
- um item redistribuído continua sujeito ao critério de desempenho do novo Baú, portanto não é entregue automaticamente;
- se continuar não sendo conquistado, volta para a fila de redistribuição;
- o último Baú da campanha é a única exceção: ele entrega todos os Colecionáveis ainda pendentes;
- Colecionáveis concedem bônus permanentes sobre XP, ouro e Rubi;
- com 50% da coleção, o bônus total chega a 10%;
- com 100% da coleção, o bônus total chega a 25%;
- a curva exata entre esses marcos ainda precisa ser fechada por Game Design.

O último Baú da campanha fica na Ilha global 110 e é o **Baú Final**. Além de encerrar a redistribuição dos Colecionáveis pendentes, ele contém uma quantidade generosa de Rubis. O valor numérico desses Rubis permanece pendente de balanceamento e não deve ser inventado pela implementação.

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
