# Prompts de geração IA — Tabuada Quest: Aventura dos Mares

## Direção visual comum

Use esta base em todos os prompts:

> Jogo infantil de aventura pirata mágica, ilustração 3D de livro infantil premium, formas arredondadas, leitura fácil em tela pequena, cores turquesa, azul-marinho, coral, dourado e lilás mágico. Personagens amigáveis, expressões acolhedoras, luz de amanhecer, brilho suave, acabamento de game mobile. Criar identidade própria: sem personagens, símbolos, logotipos ou elementos reconhecíveis de franquias existentes; sem texto, sem marca-d'água, sem armas realistas, sem caveiras assustadoras.

## Contrato obrigatório de otimização

Acrescentar este bloco ao fim de **todo prompt**. Ele é parte da especificação do asset, não uma sugestão:

> **Contrato de otimização:** criar composição limpa, com áreas de cor bem definidas, gradientes suaves e poucos microdetalhes repetidos; evitar ruído, grão, texturas fotográficas, partículas minúsculas e fundos complexos desnecessários. Entrega final em **WebP** (não PNG) com qualidade visual alta e sem alteração de proporção. Fundo opaco para cenários; canal alpha real somente para elementos isolados. Não incluir bordas vazias excessivas. Não embutir textos na arte.  
> **Orçamento máximo:** ícone 512 × 512 até 100 KB; botão com transparência até 1280 px de largura e 160 KB; banner até 1280 × 720 e 220 KB; fundo vertical 1080 × 1920 e 450 KB. Se exceder o orçamento, reduzir detalhes de fundo antes de reduzir a nitidez do objeto principal.

Para Lottie:

> **Contrato Lottie:** entregar somente JSON vetorial compactado, sem imagens base64, sem camadas invisíveis, sem filtros caros e sem efeitos de desfoque. Reutilizar formas e gradientes; limitar a 40 camadas, 2 segundos, 24 fps e até 80 KB por animação. Se forem indispensáveis imagens de apoio, elas devem ser WebP externas, otimizadas e referenciadas por caminho relativo.

## Regras para pets em Lottie

Cada prompt abaixo deve gerar um arquivo Lottie JSON em loop, com fundo transparente, 512 × 512, duração de 2 segundos, 24 fps e até 40 camadas. Separar em camadas vetoriais: corpo, rosto, olhos, acessórios, brilho e sombra. Animação suave e alegre, com respiração, piscar e um pequeno movimento do acessório. Não rasterizar o personagem dentro do JSON. Aplicar o **Contrato Lottie** acima.

Modelo de complemento para qualquer pet:

> Entregar Lottie JSON vetorial. Fundo transparente. Loop perfeito de 2 segundos a 24 fps. Personagem inteiro e centralizado, margem de segurança de 8%, sombra elíptica discreta, sem texto.

## 30 pets — lista substituída

> A lista válida de pets está em [PROMPTS-PETS-LOTTIE-PIRATAS-MAGICOS.md](PROMPTS-PETS-LOTTIE-PIRATAS-MAGICOS.md). Ela define criaturas originais de um mundo pirata mágico, e não animais comuns fantasiados. Não usar os prompts legados abaixo para gerar novos assets.

## 30 pets — prompts legados (não usar)

1. **Axolote Capitão**
   > Axolote bebê rosado, marinheiro mágico, usando pequeno chapéu de capitão azul e lenço turquesa, boia de estrela dourada. Ele acena com a nadadeira e bolhas brilhantes sobem ao redor.

2. **Coelho Mergulhador**
   > Coelhinho branco de orelhas curtas, máscara de mergulho redonda, mini cilindro de bolhas e nadadeiras corais. Ele flutua suavemente e ajusta a máscara com alegria.

3. **Kirin das Marés**
   > Pequeno kirin azul-pérola com chifres em forma de coral, crina como espuma do mar e medalhão de bússola. Ele balança a crina e deixa rastros de gotículas luminosas.

4. **Manta Celestial**
   > Filhote de arraia-manta lilás, barriga creme, constelações douradas nas asas e pequena âncora de cristal. Ele nada no ar em um movimento ondulante e solta estrelas.

5. **Coruja do Farol**
   > Corujinha marrom-avelã com olhos grandes, lanterninha dourada presa ao peito e capa azul de marinheiro. Ela pisca, abre as asas e a lanterna pulsa.

6. **Koi Fogo de Corais**
   > Peixe koi laranja e vermelho, cauda como chama suave, escamas com detalhes dourados e uma concha azul como coroa. Ele circula em um pequeno arco e deixa faíscas aquáticas.

7. **Camaleão Cartógrafo**
   > Camaleão verde-menta com mochila de mapas, luneta dourada e cauda enrolada. Ele desenrola um pergaminho e muda levemente de cor.

8. **Ouriço dos Recifes**
   > Ouriço azul-turquesa com espinhos de cristal arredondados, pérolas e um pequeno cinto de corda. Ele dá um pulinho e os cristais emitem brilho.

9. **Pangolim do Tesouro**
   > Pangolim dourado-claro com escamas como moedas, mini baú nas costas e olhos gentis. Ele se enrola brevemente e revela uma gema colorida.

10. **Tanuki Navegador**
    > Tanuki marrom e creme com casaco náutico azul, lenço coral e bússola pendurada. Ele consulta a bússola, sorri e a agulha gira.

11. **Tartaruga Samurai do Mar**
    > Tartaruguinha verde com casco azul-marinho em padrão de ondas, faixa dourada e pequena bandeira colorida sem símbolos. Ela caminha devagar e faz uma reverência.

12. **Polvo Alquimista**
    > Polvinho lavanda com óculos redondos, frasco de poção azul e avental de capitão. Ele mistura a poção e pequenas bolhas em forma de estrela sobem.

13. **Arara Oráculo**
    > Ararinha azul e amarela com penas brilhantes, mapa celeste enrolado e medalhão de lua. Ela abre as asas e o mapa exibe um brilho suave.

14. **Cavalinho-Marinho Elétrico**
    > Cavalinho-marinho azul-ciano com barbatanas amarelas, espiral de energia turquesa e mini capacete de explorador. Ele flutua e emite pequenas faíscas arredondadas.

15. **Besouro Guardião**
    > Besouro verde-esmeralda, carapaça dourada, escudo em forma de concha e olhos amigáveis. Ele abre as asas, paira por um instante e pousa.

16. **Alpaca das Nuvens**
    > Alpaca branca fofinha com sela de marinheiro, nuvem azul-clara e pequenas estrelas no pelo. Ela dá um passinho e uma nuvem mágica aparece sob seus pés.

17. **Lontra dos Canais**
    > Lontrinha marrom-clara com colete salva-vidas coral, reminho de brinquedo e flor tropical. Ela gira de costas e bate palminhas.

18. **Tamanduá Xamã das Ilhas**
    > Tamanduá pequeno com capa de folhas, bastão com concha luminosa e pintura facial suave. Ele faz um gesto mágico e folhas douradas giram.

19. **Capivara Lunar**
    > Capivara bebê marrom-clara usando boina azul, capa com luas e uma pérola luminosa. Ela boceja, pisca e a pérola brilha.

20. **Narval Imperial**
    > Narvalzinho azul-royal com chifre espiral dourado, coroa de algas e capa curta turquesa. Ele nada em círculo e cria um arco de água brilhante.

21. **Pavão Astral**
    > Pavão pequeno azul e roxo com cauda de estrelas, bússola no peito e plumas luminosas. Ele abre a cauda e as estrelas pulsarem suavemente.

22. **Preguiça Relíquia**
    > Preguiça fofa bege, pendurada em uma corda de navio, com chapéu de marinheiro e medalhão antigo. Ela balança devagar, pisca e o medalhão reluz.

23. **Quokka do Porto**
    > Quokka sorridente com colete listrado azul e branco, sacolinha de moedas e um peixinho de brinquedo. Ele acena e uma moeda dourada gira.

24. **Louva-a-Deus da Maré**
    > Louva-a-deus verde-claro com armadura de concha, detalhes aqua e uma pequena capa coral. Ele faz pose heroica e ondas luminosas passam atrás.

25. **Caranguejo do Tesouro**
    > Caranguejo vermelho-coral com pinças arredondadas, baú minúsculo nas costas, joia azul e olhos brincalhões. Ele dança de lado e o baú solta brilhos.

26. **Libélula de Cristal**
    > Libélula azul-violeta com asas translúcidas, cristais dourados e uma bússola miniatura. Ela paira, bate as asas e deixa rastros cintilantes.

27. **Foca Aurora**
    > Foca bebê azul-gelo com cachecol turquesa, concha perolada e reflexos coloridos como aurora. Ela bate as nadadeiras e lança bolhas luminosas.

28. **Tatu Solar**
    > Tatu pequeno âmbar, casco com raios de sol, lenço azul e mochila de explorador. Ele se enrola, gira de leve e emerge sorrindo.

29. **Golfinho Mensageiro**
    > Golfinho azul-claro com bolsinha de correio, selo em forma de estrela e chapéu de marinheiro. Ele salta, entrega uma carta brilhante e retorna ao loop.

30. **Gato Pirata da Sorte**
    > Gatinho cinza fofinho com tapa-olho de tecido azul sem emblema, chapéu de capitão dourado e patinha segurando um trevo-marinho. Ele faz um miado silencioso, pisca e o trevo brilha.

## Vilão pirata

> Vilão infantil original chamado **Capitão Neblina**, um polvo humanoide amigavelmente ameaçador, azul-marinho e roxo, casaco longo com detalhes dourados, chapéu de capitão sem emblemas, olhos expressivos e uma nuvem de névoa mágica turquesa. Pose de desafio, sorriso travesso, sem armas e sem aparência assustadora. Ilustração 3D de game mobile, WebP com canal alpha real, personagem inteiro, 1024 × 1024, margem de segurança de 8%, até 180 KB, sem texto, sem logotipos, sem referência a franquias existentes.

Variação Lottie:

> Criar Lottie JSON vetorial do Capitão Neblina: 2 segundos, 24 fps, fundo transparente. Loop em que ele cruza dois tentáculos, ri de forma travessa e a névoa mágica gira atrás dele. Separar corpo, olhos, boca, casaco, chapéu, tentáculos, névoa e sombra em camadas.

## Colecionáveis

Usar cada prompt como arte individual em WebP com canal alpha real, 512 × 512 e até 100 KB:

1. **Bússola da Multiplicação** — bússola dourada com números suaves no aro, gema turquesa central e brilho mágico.
2. **Mapa das Dez Ilhas** — pergaminho enrolado, caminhos pontilhados, ilhas coloridas, estrela dourada indicando o destino.
3. **Pérola dos Números** — pérola lilás sobre concha azul, pequenos símbolos matemáticos luminosos orbitando.
4. **Ampulheta das Marés** — ampulheta de madeira dourada, areia azul brilhante e ondas mágicas internas.
5. **Chave do Porão Secreto** — chave dourada com cabo de concha, fita coral e brilho suave.
6. **Moeda do Capitão** — moeda grande dourada, estrela central, borda de corda e reflexo aqua.
7. **Garrafa de Mensagem** — garrafa transparente com pergaminho enrolado, rolha e vaga-lumes azuis.
8. **Luneta Encantada** — pequena luneta de latão, lente azul brilhante e faixa vermelha.
9. **Concha da Sorte** — concha rosa e aqua, pérolas pequenas e luz interna dourada.
10. **Medalha do Navegador** — medalha de ouro em forma de rosa-dos-ventos, fita listrada azul e coral.
11. **Cristal da Ilha** — cristal turquesa facetado sobre areia dourada e folhas tropicais.
12. **Caderno de Bordo** — livro azul-marinho com cantoneiras douradas, pena mágica e selo de estrela.

Sufixo comum:

> Ícone colecionável 3D infantil premium, centralizado, objeto inteiro, sombra macia, fundo transparente, sem texto, sem marca-d'água.

## Molduras

Criar WebP transparente em 1024 × 1024, com até 180 KB. Centro completamente vazio para receber o avatar; cantos ornamentados sem encobrir o rosto.

1. **Leme Dourado** — madeira polida, leme dourado no canto inferior, cordas e brilho aqua.
2. **Baía de Coral** — corais pastel, conchas, bolhas e estrelas-do-mar amigáveis.
3. **Mapa do Tesouro** — bordas de pergaminho, pequenas ilhas e trilha pontilhada dourada.
4. **Lanternas do Porto** — postes de madeira, lanternas quentes e céu azul-marinho.
5. **Pérolas da Maré** — pérolas grandes, algas suaves, brilho lilás e azul.
6. **Navio dos Sonhos** — velas coloridas nas laterais, cordas, bandeirinhas sem emblemas.
7. **Caverna de Cristal** — pedras azul-violeta, gemas turquesas e faíscas douradas.
8. **Ilha Tropical** — folhas de palmeira, hibiscos corais, areia e mapa enrolado.
9. **Bússola Estelar** — rosa-dos-ventos dourada, constelações infantis e céu noturno suave.
10. **Tesouro da Tripulação** — mini baús, moedas, joias coloridas e fitas azuis nas bordas.

Sufixo comum:

> Moldura de avatar 3D infantil, centro 62% livre e transparente, elementos apenas nas bordas, simétrica, legível em miniatura, sem texto, sem logotipos, sem marca-d'água.

## Fundos

Criar WebP de 1080 × 1920, composição vertical, com até 450 KB. Manter uma área visualmente tranquila no centro para interface; concentrar detalhes nas bordas.

1. **Porto do Amanhecer** — píer de madeira, navio amigável ao fundo, lanternas e oceano dourado.
2. **Baía das Conchas** — praia azul-turquesa, conchas luminosas, palmeiras e ondas calmas.
3. **Ilha do Mapa Perdido** — ilha tropical, pergaminho gigante parcialmente visível e trilhas brilhantes.
4. **Caverna de Gemas** — gruta acolhedora com cristais aqua, baú aberto e reflexos mágicos.
5. **Farol das Estrelas** — farol branco e azul, céu de crepúsculo, estrelas suaves e mar brilhante.
6. **Recife dos Amigos** — recife colorido, peixes arredondados, corais e bolhas mágicas.
7. **Convés do Navio-Escola** — convés de madeira, lousa de pergaminho ao fundo, cordas e bússola.
8. **Cachoeiras da Ilha Azul** — ilhas com quedas-d'água, névoa dourada e flores tropicais.
9. **Mercado do Porto** — bancas coloridas, frutas, conchas, lanternas e moedas, sem pessoas.
10. **Mar de Nuvens** — navio voador infantil sobre nuvens azul-lilás e estrelas douradas.
11. **Lagoa da Lua** — água noturna azul, lua grande, vaga-lumes e conchas peroladas.
12. **Festa da Tripulação** — píer decorado com bandeirinhas coloridas, luzes, baús e confete de estrelas.

Sufixo comum:

> Fundo de jogo mobile vertical, 3D de livro infantil, oceano mágico e pirataria amigável, alta leitura atrás de componentes, sem texto, sem personagens conhecidos, sem logotipos, sem marca-d'água.
