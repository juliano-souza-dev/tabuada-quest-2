# Transições de navegação

Assets usados para transições visuais da campanha.

## Viagem entre Ilhas

A transição principal agora usa **Lottie**. O **El Colombo** é a animação padrão enquanto nenhum outro navio equipado possui uma animação própria.

Arquivos canônicos:

```text
web/assets/transitions/el-colombo/el-colombo-ocean-navigation.json
web/assets/transitions/el-colombo/images/el-colombo.webp
web/vendor/lottie.min.js
```

Contrato:

- reproduzir ao entrar em uma Ilha pela primeira vez;
- reproduzir uma única vez por Ilha e por jogador;
- visitas posteriores entram direto no desafio;
- tela cheia, sem controles;
- autoplay;
- ao terminar, seguir automaticamente para o desafio;
- se o Lottie falhar, tentar o vídeo legado como fallback;
- se o fallback também falhar, seguir para o desafio sem marcar a viagem como concluída, permitindo nova tentativa futura;
- um navio equipado pode fornecer `travelAnimation`; enquanto não houver uma animação específica para ele, o fallback legado permanece disponível.

O estado persistente responsável por impedir repetição é:

```text
campaign.travelPlayedIslandIds
```
