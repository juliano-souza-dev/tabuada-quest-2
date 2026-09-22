# Agente de Qualidade e Build

## Missão

Validar se a entrega atende comportamento, regressão, persistência, desempenho e empacotamento antes de ser considerada pronta.

## Autoridade

Qualidade pode:

- aprovar ou reprovar tecnicamente;
- bloquear fechamento de trabalho;
- exigir correção;
- validar browser, WebView e APK;
- classificar severidade;
- validar assets e artefatos.

Qualidade não redefine Produto, pedagogia ou Direção Visual.

## Classificação

```text
bloqueador → impede uso ou invalida regra central
crítico    → quebra fluxo principal/dados
alto       → funcionalidade importante incorreta
médio      → degradação sem bloqueio total
baixo      → acabamento/inconsistência menor
```

Bloqueadores e críticos impedem aceite.

## Validações obrigatórias

Quando aplicável:

- unit tests web;
- preview público;
- Android Debug/WebView;
- persistência;
- migrações;
- regressão de navegação;
- toques rápidos/repetidos;
- botão voltar;
- background/foreground;
- áudio/vídeo;
- carregamento/fallback de assets;
- overflow/cortes;
- equivalência funcional browser/WebView.

## Workflows e build

Os caminhos vigentes são registrados em `MAPA-DO-PROJETO.md`.

Padrões atuais:

```text
Web Unit Tests
Web Preview
Android Debug APK
```

Regra de gate:

- alterações em `web/js/**`, `web/css/**`, `web/index.html` ou `tests/web/**` devem executar **Web Unit Tests no pull request antes do merge**;
- o push em `main` continua validando novamente a integração final.

APK debug:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Validação visual técnica

Qualidade não decide gosto visual, mas valida:

- assets carregam;
- alpha/transparência estão corretos;
- não há fundo preto acidental;
- dimensões estão corretas;
- hitboxes correspondem à composição;
- status não corta;
- viewport pequeno permanece utilizável;
- browser e Android não divergem de forma funcional.

Assets transparentes devem ser verificados tecnicamente quando houver risco de canal alpha incorreto.

## Telas de Região

Proteger as invariantes globais:

```text
stage 941×1672
5 slots
coordenadas/tamanhos compartilhados
Mapa mundo 200×200 na posição global
status legível
Ilhas sem colisão visual
```

Teste deve impedir regressão das coordenadas compartilhadas quando o layout for generalizado.

## Mapa mundo

Validar:

```text
botão/hitbox acessível
→ chama TQ.core.worldMap.open(...)
→ comportamento provisório responde
```

Quando a tela `world-map` existir, incluir navegação E2E.

## Viagem entre Ilhas

Validar:

- toca somente na primeira entrada;
- visita posterior pula a animação;
- falha de vídeo não corrompe sessão;
- reprodução funciona no browser e WebView.

## Moda / Provador

Validar obrigatoriamente:

```text
selecionar opção
≠
persistir/equipar
```

Cobrir:

- prévia muda sem persistência;
- USAR persiste;
- fechar cancela prévia;
- reabrir parte do item realmente equipado.

## Gate visual

Para uma tela visual:

```text
Direção Visual
→ fidelidade mínima
→ Qualidade
→ Experience Validator
→ líder
```

Qualidade não substitui o gate de Direção Visual.

## Release

Antes de release candidate:

- regressão E2E completa;
- browser/WebView equivalentes;
- persistência validada;
- performance/asset budget validado;
- processo de assinatura/documentação de release definido;
- nenhum segredo no repositório.

## Invariantes de recompensas

Validar automaticamente:

- toda conclusão válida credita XP exatamente uma vez;
- replay credita XP novamente, mas não duplica PET, Baú, Rubi ou fragmento único;
- bônus de Tripulação soma por categoria e arredonda para baixo;
- Rubi configurado é creditado em `wallet.gems` enquanto esse for o contrato vigente;
- Baú concedido referencia kit válido, inclusive kit vazio;
- tela de Baú só aparece quando um Baú foi efetivamente recebido;
- continuidade para Resultado preserva o resumo da recompensa.

## Regra de documentação

Conhecimento permanente de QA/Build vive nesta persona.

O MAPA registra paths de workflows, builds, testes e artefatos.

Issues não devem acumular logs históricos ou manuais extensos. Devem apenas definir a etapa de fluxo e o critério de pronto.

## Entrega

- cenários executados;
- resultado;
- bugs;
- severidade;
- evidência;
- decisão técnica;
- artefato validado quando houver.


## Invariantes da migração 22×5

Qualidade deve bloquear regressões que reintroduzam a macroestrutura antiga fora do migrador de compatibilidade.

Validar automaticamente:

```text
22 Regiões
5 Ilhas por Região
110 Ilhas
global 1 → R1/I1
global 6 → R2/I1
global 110 → R22/I5
```

Persistência:

- estado novo usa `schemaVersion = 9`;
- save v8 migra sem perder posição global;
- `completedIslandIds` e `travelPlayedIslandIds` são remapeados;
- sessão ativa e último resultado preservam a posição equivalente;
- XP, carteira, Tripulação, PETs, Baús e mapas não são zerados;
- arco final ocupa globais 101–110, com R22/I5 como Ilha final.

Scheduler:

- 20 planned por Ilha;
- 100 planned por Região;
- 2.200 planned na campanha;
- cobertura total de 220 por tabuada e 22 por operação;
- mastery/recovery continuam entre Regiões;
- mudança de Região não cria reset pedagógico silencioso.

Código ativo não pode usar 11 Regiões, 10 Ilhas por Região, `REGION_VISUAL_CONFIG.pages`, `regionStates` ou `island10*` como contrato atual. Esses termos são aceitos somente em migração histórica e testes de compatibilidade.


## Gate da distribuição canônica de recompensas

A suíte deve impedir divergência entre arte, catálogo e economia.

Validar:

- 110 Ilhas com exatamente uma recompensa principal;
- totais exatos: 30 PETs, 30 Baús, 30 Rubis e 20 fragmentos;
- Mapas 1–5 nas posições globais aprovadas;
- `getIslandPrimaryReward(regionId, islandId)` retorna a recompensa usada como badge pela Direção Visual;
- Rubi não possui `amount` fixo no catálogo;
- `Rubis-base = max(0, correctAnswers - wrongAnswers)`;
- bônus de gemas da Tripulação incide sobre Rubis-base;
- replay não duplica Rubi;
- IDs históricos dos primeiros PETs/Baús permanecem compatíveis com saves existentes.


## Gate de Colecionáveis

Validar permanentemente:

- catálogo contém 90 IDs únicos;
- todos possuem nome não vazio;
- todos declaram bônus em XP, Ouro e Rubi;
- assets podem permanecer `null` enquanto a Direção Visual não entregar arte;
- estado inicial possui `collectedIds=[]` e `pendingIds=[]`;
- migração v9 → v10 preserva progresso;
- coleta do mesmo ID é idempotente;
- Home abre a tela Colecionáveis;
- voltar retorna à Home;
- item não coletado aparece sombreado;
- item coletado aparece ativo;
- a tela exibe nome, status e bônus sem inventar percentual individual.


## Gate Baú → Colecionáveis

Validar:

- 30 kits de Baú;
- exatamente 3 itens-base por kit;
- cobertura dos 90 IDs sem repetição;
- 0 erros entrega todos os itens disponíveis;
- até 20% de erros, com pelo menos um erro, entrega 2;
- acima de 20% entrega 1;
- Baú normal recebe no máximo 1 pendência da fila;
- itens não recebidos voltam para o fim da fila;
- pendência não é garantida nas faixas de 1/2 itens;
- Baú perfeito com 1 pendência pode entregar 4 itens;
- Baú Final zera a fila e entrega todos os itens disponíveis;
- replay não concede nem redistribui novamente;
- outcome do Baú é persistido no resultado antes da renderização.


## Gate econômico

Validar:

- 20 acertos/0 erros → 200 Ouro-base;
- 16 acertos/4 erros → 152 Ouro-base;
- Ouro nunca fica negativo;
- replay concede Ouro novamente;
- 50% da coleção → 10% de bônus;
- 100% → 25%;
- bônus de Tripulação e Colecionáveis somam sobre a base;
- Baú Final contém 5.000 Rubis-base;
- existem 30 PETs provisórios com IDs únicos e labels Pet 01–30.


## Gate da Missão Especial

Validar:

- 20 questões por missão;
- todas pertencem ao conjunto introduzido antes do gate;
- resposta errada consome a questão e segue adiante;
- não cria recovery;
- acertos × 2 = Rubis-base;
- bônus de Tripulação/Colecionáveis aplicados apenas sobre Rubi;
- missão concluída marca `mission_completed`;
- próximo bloco de Regiões só libera após a missão;
- sessão pode ser retomada se já estiver `mission_in_progress`;
- feedback visual de acerto/erro não altera estado matemático.


- Missão Especial concede também 20 XP-base;
- Missão Especial usa a fórmula global de Ouro;
- os Rubis próprios da missão permanecem `acertos × 2`;
- os três valores recebem bônus normais de Tripulação/Colecionáveis.


## Gate da Loja

Validar:

- Loja abre pela Home;
- abas: Molduras, Fundos, Estaleiro e Efeitos;
- Colombo = 1.000 Ouro;
- Rosa Intenso = 3.000 Ouro;
- Cristal Queen = 9.000 Ouro;
- compra desconta exatamente o preço;
- compra repetida não desconta novamente;
- Ouro insuficiente não compra;
- comprado mostra apenas “Comprado”;
- Loja não contém ação Equipar;
- compras persistem no save;
- migração v10 → v11 preserva Ouro/progresso;
- navios permanecem sem arte e sem vídeo nesta etapa;
- Molduras/Fundos não inventam catálogo nem preço.


- a aba Molduras lista exatamente 5 itens;
- nomes: Âncora Dourada, Coroa Corsária, Maré de Safira, Rubi do Capitão, Lenda do Kraken;
- todas possuem `asset = null`;
- todas possuem `price = null`;
- preço nulo nunca vira compra de 0 Ouro;
- nenhuma ação Equipar aparece.


- Molduras: preços 250, 450, 700, 1000 e 1400;
- Fundos: preços 400, 650, 900, 1300 e 1800;
- exatamente 5 Molduras e 5 Fundos comerciais;
- todos os 10 itens permanecem com `asset = null`;
- compra usa Ouro e persiste;
- compra não equipa nem troca personalização ativa.


### Gate comercial dos Efeitos

Validar:

- a aba Efeitos lista somente Efeitos comercializáveis, sem incluir fallbacks padrão;
- cada item possui ID único, `category = effect`, tipo, nome, preço e renderer textual;
- todos os Efeitos comerciais permanecem com `asset = null` nesta etapa;
- compra desconta exatamente o preço em Ouro;
- recompra não desconta novamente;
- compra persiste o ID em `shop.purchasedItemIds` após reload;
- compra não cria nem altera estado de equipamento;
- `getShopItem(...)` resolve IDs de Efeitos;
- os fallbacks padrão de acerto/erro continuam funcionando após a integração com a Loja.

## Gate de personalização da Home

Validar:

- Home possui acesso Estaleiro;
- Estaleiro lista somente navios comprados;
- comprar na Loja não equipa automaticamente;
- navio não comprado não pode ser equipado;
- navio equipado persiste em `shop.equippedShipId`;
- migração v11 → v12 preserva `purchasedItemIds`;
- Molduras comerciais só aparecem no seletor após compra;
- Fundos comerciais só aparecem no seletor após compra;
- itens-base continuam disponíveis;
- asset `null` não quebra a Home;
- travel usa vídeo padrão enquanto `travelVideo = null`;
- Loja continua sem ação Equipar.


## Gate dos Efeitos de feedback

Validar automaticamente:

- catálogo possui fallback de acerto e erro;
- acerto não renderiza botão de continuidade;
- acerto avança quando a animação termina e possui fallback temporal;
- erro mostra a operação com resposta correta;
- erro só avança por ação explícita;
- nenhum texto fixo `Acertou`/`Errou` permanece como mecanismo principal fora do sistema de Efeitos;
- desafios normais e Missões Especiais usam o mesmo contrato;
- redução de movimento não cria deadlock;
- progresso continua dinâmico e alinhado à caixa específica da Ilha.
