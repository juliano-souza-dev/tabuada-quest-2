# Direção de experiência mobile da V1

**Status:** referência oficial aprovada pelo usuário  
**Data:** 2026-09-19  
**Uso:** UX/layout/composição, não identidade visual

## Princípio

As telas da versão anterior fornecidas pelo usuário são a **referência de direção da V1 para densidade e organização mobile**.

Elas não devem ser copiadas visualmente.

O Tabuada Quest 2.0 deve preservar apenas os princípios de experiência que funcionam bem em celular e reinterpretá-los integralmente dentro da nova identidade pirata mágica.

## O que deve ser preservado como direção

- experiência pensada primeiro para celular;
- telas com alta densidade útil, sem parecer uma página web;
- aproveitamento quase integral do viewport;
- hierarquia visual forte;
- ação principal evidente;
- leitura rápida;
- poucos níveis de rolagem quando a tela pode caber inteira;
- menus e recompensas compactos;
- mapa como experiência visual dominante;
- cada tipo de tela pode possuir composição própria;
- interface de gameplay pode usar orientação diferente quando isso beneficiar legibilidade e interação;
- perfil, loja, mapa e desafio não precisam compartilhar a mesma malha de layout.

## O que NÃO deve ser herdado

Não copiar:

- tema joaninha;
- castelos/reinos antigos;
- iconografia de franquias;
- cores/ornamentos ligados ao universo anterior;
- "Portais" e "Mundos" como nomenclatura;
- associação de mapa a uma tabuada exclusiva;
- elementos visuais fora da nova direção pirata/marítima.

## Adaptação obrigatória ao Tabuada Quest 2.0

A experiência deve ser reinterpretada como:

```text
Portais antigos → Regiões marítimas
Mundos antigos  → Ilhas
Mapa antigo     → Jornada entre Regiões/Ilhas
Baús            → Tesouros da campanha
PETs            → Companheiros/criaturas resgatadas
Mapas especiais → Missões de viagem
```

Direção artística obrigatória:

> Jogo infantil de aventura pirata mágica, ilustração 3D de livro infantil premium, formas arredondadas, leitura fácil em tela pequena, cores turquesa, azul-marinho, coral, dourado e lilás mágico. Personagens amigáveis, expressões acolhedoras, luz de amanhecer, brilho suave, acabamento de game mobile. Criar identidade própria: sem personagens, símbolos, logotipos ou elementos reconhecíveis de franquias existentes; sem texto, sem marca-d'água, sem armas realistas, sem caveiras assustadoras.

## Leitura das telas de referência

### Home

A home deve funcionar como uma tela de jogo, não como landing page.

Características desejadas:

- estado do jogador compacto no topo;
- personagem/ambiente como foco visual;
- ação principal "Jogar" muito evidente;
- atalhos de sistemas secundários compactos;
- progresso/recompensa visíveis sem rolagem excessiva;
- identidade pirata aplicada integralmente.

### Mapa

O mapa deve:

- ocupar praticamente toda a tela;
- apresentar a progressão de forma espacial;
- mostrar claramente o próximo destino;
- diferenciar concluído, disponível e bloqueado;
- usar Regiões e Ilhas, não Portais/Mundos;
- evitar texto longo;
- manter navegação rápida.

### Desafio

A tela de desafio deve:

- priorizar a operação matemática;
- ter respostas grandes e fáceis de tocar;
- mostrar progresso sem competir com a questão;
- reduzir elementos decorativos que prejudiquem leitura;
- poder usar landscape quando a experiência justificar;
- manter fundo temático da Ilha/missão.

### Perfil

O perfil deve:

- concentrar identidade do jogador, progresso e ações relacionadas;
- evitar navegação profunda desnecessária;
- separar claramente ações como moda/equipamento;
- usar os avatares-base canônicos do 2.0.

### Loja / coleção

A loja deve:

- manter grande densidade visual sem perder legibilidade;
- usar categorias compactas;
- mostrar moeda/recompensa no contexto;
- priorizar cards grandes o suficiente para toque;
- futuramente contemplar a Loja Especial de Diamantes como sistema distinto.

## Regra mobile-first

Antes de aprovar uma tela:

1. validar primeiro em viewport de celular;
2. confirmar que a ação principal está imediatamente identificável;
3. reduzir texto antes de aumentar a altura da tela;
4. evitar empilhar grandes blocos verticais que transformem o jogo em uma página web;
5. priorizar composição de jogo em tela cheia;
6. usar scroll apenas quando o conteúdo realmente exigir.

## Relação com desktop

Desktop é adaptação da experiência mobile, não a fonte da composição.

Não projetar desktop e depois apenas empilhar elementos via media query.

## Relação com arquitetura

A arquitetura da V1 deve permitir:

- layouts específicos por tela;
- orientação específica quando necessária;
- componentes compartilhados sem obrigar todas as telas à mesma estrutura;
- responsividade sem transformar a UI em landing page;
- mesma fonte `web/` em navegador e Android WebView.

## Fonte visual

As imagens fornecidas pelo usuário em 2026-09-19 são referência de UX/densidade/composição.

Elas não são assets de produção e não devem ser copiadas para `web/assets/`.
