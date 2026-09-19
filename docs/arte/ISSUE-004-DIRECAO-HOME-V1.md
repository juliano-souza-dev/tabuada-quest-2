# Direção Visual — Home V1 do Tabuada Quest 2.0

**Issue:** #4  
**Status:** DIREÇÃO VISUAL OBRIGATÓRIA  
**Data:** 2026-09-19  
**Liderança:** Direção Visual  
**Referência de UX:** telas da versão 1 fornecidas pelo usuário  
**Tema:** aventura pirata mágica infantil

## Diagnóstico da versão reprovada

A Home publicada anteriormente falhou porque:

- parecia uma composição web estilizada, não uma tela de jogo;
- o cenário era tratado como background genérico, sem direção de cena;
- personagem, HUD e CTA não formavam uma composição única;
- havia excesso de blocos/cardização;
- os atalhos pareciam cards de dashboard;
- o título ocupava espaço sem funcionar como marca de jogo;
- a hierarquia não reproduzia a força visual da versão de referência;
- a adaptação pirata ficou aplicada nos elementos, mas não na composição.

A correção deve atacar **composição**, não apenas CSS.

## Princípio central

A Home deve parecer uma **capa jogável de aventura**, não um painel.

A criança deve bater o olho e perceber nesta ordem:

1. quem sou / meu estado;
2. onde estou;
3. personagem principal;
4. botão JOGAR;
5. progressão/recompensas secundárias.

## Composição obrigatória no celular

```text
┌──────────────────────────────┐
│ HUD compacto                 │
│ avatar + nome/progresso      │
│ moedas/diamantes             │
├──────────────────────────────┤
│                              │
│ marca TABUADA QUEST          │
│                              │
│ cenário pirata               │
│      personagem              │
│    ocupando o centro         │
│                              │
│         [ JOGAR ]            │
│                              │
├──────────────────────────────┤
│ mapa/progresso especial      │
├──────────────────────────────┤
│ atalhos compactos            │
│ mapa | baú | companheiros    │
└──────────────────────────────┘
```

A tela deve caber no viewport sem parecer espremida.

## HUD

O HUD deve parecer elemento de jogo.

### Lado esquerdo

- avatar-base do jogador;
- nome curto;
- progresso atual em formato compacto;
- Região / Ilha, sem texto explicativo longo.

### Lado direito

Exibir somente moedas relevantes já aprovadas.

Na V1 atual:

- Diamantes podem aparecer;
- outras moedas só entram se Produto já tiver aprovado seu uso.

Evitar caixas largas ou painéis com aparência de dashboard.

## Marca do jogo

"Tabuada Quest" deve funcionar como marca compacta.

Não usar headline promocional como:

> Uma nova aventura está começando

A Home não vende o jogo. Ela **é o jogo**.

A marca pode ter:

- lettering curto;
- bússola;
- mapa;
- moldura náutica leve;
- brilho dourado;
- elementos de corda/madeira somente se mantiverem leitura limpa.

Sem texto narrativo abaixo da marca.

## Cenário

O cenário deve ser a base da composição.

Direção:

- mar turquesa;
- ilha/porto/baía como destino;
- navio ou elementos náuticos ao fundo;
- luz de amanhecer;
- leitura clara em tela pequena;
- profundidade simples;
- evitar excesso de partículas e microdetalhes.

O fundo não deve parecer apenas um banner ampliado.

Se o asset atual não permitir boa composição, Direção Visual deve marcar necessidade de novo asset em vez de forçar CSS sobre arte inadequada.

## Personagem

O avatar escolhido é o principal elemento humano da Home.

Regras:

- personagem entre 32% e 45% da altura útil;
- corpo visível o suficiente para leitura;
- não cortar rosto/cabelo;
- posição central ou levemente deslocada conforme cenário;
- deve parecer inserido no mundo, não card flutuante;
- sombra/luz devem integrar personagem e cenário.

Usar sempre avatar-base canônico.

## Botão JOGAR

É o foco interativo principal.

Requisitos:

- grande;
- central;
- visualmente separado do fundo;
- altura confortável para toque;
- nenhuma outra ação deve competir com ele;
- integrado à linguagem de tesouro/mapa/navegação;
- texto simples: **JOGAR**.

O botão pode usar madeira/dourado/turquesa, desde que mantenha contraste alto e leitura imediata.

## Progresso de mapa especial

O progresso 0/4 deve aparecer como faixa curta abaixo do CTA ou integrado à área inferior.

Mostrar:

- ícone de mapa/bússola;
- 4 estados de fragmento;
- contador simples.

Evitar frase longa.

Preferência:

```text
🧭 MAPA   ◻ ◻ ◻ ◻   0/4
```

Quando completo, essa área deve poder se transformar futuramente no gatilho visual da missão especial.

## Atalhos inferiores

No máximo 3 ou 4 atalhos primários por tela.

Para este corte:

- Regiões;
- Baús;
- Companheiros/PETs.

A Loja Especial de Diamantes não entra visualmente como destaque enquanto não estiver especificada.

Regras:

- usar ícones;
- rótulos curtos;
- sem parágrafo;
- sem subtítulo explicativo;
- visual de botão de jogo, não card informativo.

## O que remover da versão reprovada

Remover:

- cards descritivos;
- textos explicativos;
- "Tripulação" como seção;
- "Elementos do novo mundo";
- blocos editoriais;
- campanhas/estatísticas em faixas textuais;
- qualquer sensação de página rolável;
- hierarquia de landing page.

## Tema

Direção obrigatória:

> Jogo infantil de aventura pirata mágica, ilustração 3D de livro infantil premium, formas arredondadas, leitura fácil em tela pequena, cores turquesa, azul-marinho, coral, dourado e lilás mágico. Personagens amigáveis, expressões acolhedoras, luz de amanhecer, brilho suave, acabamento de game mobile. Criar identidade própria: sem personagens, símbolos, logotipos ou elementos reconhecíveis de franquias existentes; sem texto, sem marca-d'água, sem armas realistas, sem caveiras assustadoras.

## Paleta funcional

- fundo/base: azul-marinho;
- mar/ação: turquesa;
- CTA/recompensa: dourado;
- destaque secundário: coral;
- magia/evento especial: lilás.

A paleta não deve ser usada como gradiente decorativo em todos os blocos.

## Regra de profundidade

Preferir 3 planos:

1. cenário distante;
2. personagem;
3. HUD/CTA.

Evitar excesso de cartões sobre cartões.

## Desktop

Desktop não ganha uma landing page.

Mostrar a experiência mobile em moldura/viewport maior ou adaptar espacialmente sem mudar a hierarquia principal.

## Critérios da Direção Visual

A Home só pode ir para Desenvolvimento quando:

- parecer jogo em primeiro olhar;
- personagem dominar a composição;
- CTA JOGAR dominar a interação;
- cenário e personagem formarem uma cena única;
- HUD estiver compacto;
- atalhos não parecerem dashboard;
- não houver texto promocional;
- tema pirata estiver perceptível sem depender de legenda;
- a referência de densidade da V1 estiver preservada.

## Handoff

Depois desta direção:

```text
Direção Visual → Experience Validator
```

Experience Validator verifica:

- leitura imediata;
- ação principal;
- tamanho de toque;
- densidade;
- ausência de scroll inicial;
- clareza de HUD;
- excesso de estímulo.

Somente após aprovação:

```text
Experience Validator → Desenvolvimento
```

Desenvolvimento implementa sem redesenhar a composição.
