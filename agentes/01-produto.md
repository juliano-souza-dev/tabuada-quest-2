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


### Ilhas canônicas do CORSÁRIO

A Região 1 usa exatamente esta sequência:

```text
01 Enseada da Bandeira
02 Baía do Saque Perdido
03 Farol da Rota Corsária
04 Porto do Capitão
05 Rochedo da Âncora Dourada
```

Nesta etapa visual, somente a Ilha 1 está publicada. As Ilhas 2–5 preservam seus nomes canônicos e aguardam suas artes aprovadas.

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

### Ilhas canônicas da ZONA RUBI

A Região 14 usa exatamente esta sequência:

```text
01 Carmesim
02 Coroa Rubi
03 Pedras Rosada
04 Pedras Rubras
05 Rubi do Rei
```

A ZONA RUBI publica as cinco Ilhas como composição visual completa.

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

### Comportamento do botão Jogar

O botão principal **Jogar** é um atalho de continuidade da campanha, não um atalho para a lista de Regiões.

Regra:

```text
Região atual ainda possui Ilha jogável
→ Jogar abre diretamente essa Região

Região atual concluída e próxima Região desbloqueada
→ Jogar abre diretamente a próxima Região desbloqueada

nenhuma Região jogável disponível por gate/progressão
→ Jogar abre a tela de Regiões para orientar o próximo passo
```

O atalho **Regiões** continua existindo separadamente para abrir o seletor completo.

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
- a tela de resultado é sempre exibida primeiro;
- PET, Baú e fragmento de Mapa não são anunciados dentro do painel de premiação da tela de resultado;
- quando a primeira conclusão conceder PET, Baú ou fragmento de Mapa, ao escolher `Voltar às Ilhas` ou `Ver Regiões`, o jogo abre antes uma tela dedicada à recompensa correspondente;
- a tela de fragmento mostra qual Mapa recebeu a peça e o progresso atual de 0/4 a 4/4;
- ao completar 4/4, a apresentação informa que a Missão Especial daquele Mapa foi liberada;
- depois dessa apresentação, o fluxo continua para o destino que a criança havia escolhido;
- as telas especiais podem ser funcionais e simples nesta etapa; arte final específica será tratada futuramente pela Direção Visual;
- abrir/receber um Baú não deve duplicar o mesmo Baú nem seus itens em replay.

Produto determina se novos tipos de recompensa pertencem ao escopo. Game Design define distribuição e balanceamento. Desenvolvimento mantém o catálogo extensível e a persistência idempotente.

### Colecionáveis

Existe uma nova categoria permanente chamada **Colecionáveis**.

Colecionáveis são itens de coleção com temática pirata/marítima, como bússolas, pedras, relíquias e artigos de exploração. Eles são obtidos dentro de Baús e não são consumíveis.

Contrato aprovado:

- cada Baú normal nasce com 3 Colecionáveis-base exclusivos;
- um Baú pode conter mais de 3 itens quando recebe Colecionáveis redistribuídos;
- uma partida sem erros concede todos os Colecionáveis disponíveis naquele Baú;
- a faixa operacional inicial para 2 itens é erro maior que 0% e menor ou igual a 20%;
- acima de 20% de erros, o Baú concede 1 item;
- o corte de 20% é parâmetro de balanceamento centralizado e pode ser ajustado sem mudar a mecânica;
- Colecionáveis que não forem conquistados não desaparecem;
- itens não conquistados são redistribuídos para Baús seguintes, um pendente por Baú normal;
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


## Tela de Colecionáveis

A Home possui acesso funcional para **Colecionáveis**.

A tela inicial de Colecionáveis lista o catálogo completo e, nesta etapa, exibe somente:

```text
nome
status
bônus
```

Estados:

```text
não coletado → apresentação sombreada
coletado     → apresentação ativa
```

A versão artística dos dois estados pertence à Direção Visual e não deve ser improvisada pelo código.

O catálogo inicial possui 90 Colecionáveis temáticos, coerente com 30 Baús × 3 itens-base. Cada entrada informa que contribui para bônus de XP, Ouro e Rubi. O percentual individual não deve ser exibido enquanto a curva econômica da coleção não estiver fechada.


## Economia por partida

Toda partida concluída concede Ouro conforme desempenho:

```text
Ouro-base = max(0, 10 × acertos - 2 × erros)
```

A regra vale também para replay.

Tripulação e Colecionáveis aplicam bônus sobre a recompensa-base de XP, Ouro e Rubi, sempre em paralelo, sem composição de bônus sobre bônus.

O Baú Final contém **5.000 Rubis-base**.

Enquanto a lista definitiva de PETs não for entregue, o catálogo usa nomes provisórios `Pet 01` até `Pet 30`, preservando os IDs persistidos.


## Missões Especiais dos Mapas

Ao completar os 4 fragmentos de um Mapa Especial, a missão desse mapa é liberada.

A missão contém exatamente 20 questões de multiplicação escolhidas somente entre operações já apresentadas à criança antes daquele gate.

Cada questão possui uma única chance. Não existe recovery dentro da Missão Especial.

Fluxo:

```text
4º fragmento
→ missão pendente
→ 20 questões
→ uma resposta por questão
→ conclusão
→ recompensa em Rubis
→ próximo bloco de Regiões liberado
```

A Missão Especial usa o mesmo sistema visual de feedback de acerto/erro das demais atividades.


## Loja

A Loja é exclusivamente um ponto de **compra**.

Ela possui três abas:

```text
Molduras
Fundos
Estaleiro
```

A Loja nunca equipa itens. Cada categoria terá seu próprio local de personalização/equipamento definido separadamente.

Estados comerciais:

```text
não comprado → mostra preço + ação Comprar
comprado     → mostra apenas “Comprado”
```

Não existe botão Equipar na Loja.

### Estaleiro inicial

```text
Colombo        → 1.000 Ouro
Rosa Intenso   → 3.000 Ouro
Cristal Queen  → 9.000 Ouro
```

Nesta etapa, os navios possuem apenas nome e preço. Arte e vídeo próprio entram depois.

Molduras e Fundos já possuem abas na Loja, porém o catálogo comercial e os preços ainda não foram definidos.


### Catálogo inicial de Molduras

A aba Molduras possui cinco itens comerciais cadastrados somente por nome:

```text
Âncora Dourada
Coroa Corsária
Maré de Safira
Rubi do Capitão
Lenda do Kraken
```

Nesta etapa:

- `asset = null`;
- `price = null`;
- itens sem preço não podem ser comprados;
- a Loja mostra “Preço a definir” / “Em breve”;
- nenhuma Moldura é equipada pela Loja.


### Preços de Molduras e Fundos

Referência de balanceamento inicial:

```text
10 Ilhas até o fim da Região 2
× 20 acertos por Ilha
× 10 Ouro por acerto
= 2.000 Ouro-base
```

Sem considerar bônus nem gastos intermediários.

Molduras:

```text
Âncora Dourada   250 Ouro
Coroa Corsária   450 Ouro
Maré de Safira   700 Ouro
Rubi do Capitão  1.000 Ouro
Lenda do Kraken  1.400 Ouro
```

Fundos:

```text
Enseada Dourada    400 Ouro
Porto Esmeralda    650 Ouro
Mar Rubi           900 Ouro
Noite do Kraken  1.300 Ouro
Horizonte Celeste 1.800 Ouro
```

Todos continuam sem asset até a etapa visual.


## Personalização na Home

A Home é o ponto de equipamento/personalização dos itens cosméticos comprados na Loja.

Fluxo:

```text
Loja → compra
Home → equipa/personaliza
```

Na Home:

- Molduras compradas aparecem no seletor de Molduras existente;
- Fundos comprados aparecem no seletor de Fundos existente;
- Estaleiro é um novo menu de personalização;
- somente navios comprados aparecem no Estaleiro;
- selecionar um navio no Estaleiro o torna o navio equipado;
- comprar um navio na Loja nunca o equipa automaticamente.

Enquanto assets comerciais estiverem `null`, a seleção persiste, mas a Home mantém fallback visual seguro.

O navio equipado define a animação/vídeo de viagem quando `travelVideo` existir. Enquanto for `null`, usa-se o vídeo de viagem padrão.


## Loja Rubi regional

A **Loja Rubi** é um sistema separado da Loja comum.

Contrato:

```text
Loja comum → Ouro → itens digitais do jogo
Loja Rubi  → Rubis → recompensas físicas
```

A Loja Rubi aparece somente em Regiões explicitamente configuradas e seu acesso visual final será uma embarcação mercante integrada ao mapa da Região.

Regiões habilitadas:

```text
01 CORSÁRIO
05 ZONA SAFIRA
09 TEMPESTÁRIA
13 OBSIDIANA
17 TERRAS DO TITÃ
21 ZONA FÊNIX
```

Regra de disponibilidade:

- a embarcação fica visível assim que a criança entra em uma Região habilitada;
- por padrão, o clique é liberado após concluir a **Ilha 1** da própria Região;
- essa condição **não é fixa globalmente**: cada Região com Loja Rubi pode sobrescrever sua própria regra de desbloqueio;
- exceções podem exigir outra Ilha específica, uma quantidade mínima de Ilhas concluídas ou a Região completa;
- quando não houver exceção cadastrada, vale sempre o padrão "após Ilha 1";
- a periodicidade de presença continua sendo Região 1 e, depois dela, a cada 4 Regiões;
- a presença da embarcação não cria uma sexta Ilha e não participa da progressão pedagógica.

Configuração de Produto:

```text
rubyShopCatalog.defaultUnlockRule
rubyShopCatalog.unlockRulesByRegion
```

`unlockRulesByRegion` deve conter somente exceções explicitamente aprovadas para uma Região. Não inventar exceções por conveniência técnica.

### Etapa local inicial

Nesta etapa:

- catálogo é fixo e local;
- compra usa a carteira de Rubis já existente;
- a criança vê preço e saldo antes de confirmar;
- Rubis são debitados somente após confirmação;
- cada compra cria um pedido local persistente;
- pedido local usa status `local_pending`;
- não existe envio de e-mail;
- não existe integração PHP;
- não existe coleta de nome, endereço, telefone, e-mail ou qualquer dado de entrega;
- nenhuma entrega física é disparada nesta versão.

Os produtos do catálogo inicial são **itens temporários de desenvolvimento**, não mercadoria oficial.

### Evolução futura

A futura integração PHP deve substituir:

```text
catálogo local → catálogo da API
pedido local   → criação de pedido na API
```

sem alterar o fluxo principal da tela.

O backend futuro será responsável por persistência remota, catálogo/preço vigente, notificação do pedido e fluxo operacional de entrega. Dados pessoais e confirmação por responsável exigem desenho específico antes da ativação real.


## Sistema de Efeitos de feedback

O feedback após responder uma questão é tratado como um **Efeito** independente da tela e do asset da Ilha.

Contrato de Produto:

```text
acerto
→ executar Efeito de acerto
→ não mostrar botão
→ ao fim do Efeito, avançar automaticamente

erro
→ executar Efeito de erro
→ mostrar a resposta correta
→ exigir ação manual para continuar
```

Regras:

- Efeito não pertence ao bitmap da Ilha;
- a primeira versão usa renderer textual animado;
- Efeitos possuem identidade própria e podem futuramente usar assets animados;
- o desafio resolve o Efeito equipado e usa um fallback padrão quando não houver personalização válida;
- propriedade e compra de Efeitos pertencem à Loja;
- equipar/trocar Efeitos pertence ao Baú de Itens;
- a lógica pedagógica da resposta não depende do renderer visual do Efeito.
