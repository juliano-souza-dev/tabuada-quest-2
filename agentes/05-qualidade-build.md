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
