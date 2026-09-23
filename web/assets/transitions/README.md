# Transições de navegação

Assets usados para transições visuais da campanha.

## Viagem entre Ilhas

A viagem usa animações associadas ao navio equipado. O **El Colombo** possui implementação em Lottie.

Arquivos canônicos do El Colombo:

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
- navio equipado pode fornecer `travelAnimation`;
- se o Lottie falhar, usar fallback animado construído com o asset do próprio navio;
- **não existe fallback em MP4**;
- se não houver animação nem asset de viagem utilizável, seguir ao desafio sem inventar outro navio.

O antigo `island-travel.mp4` foi removido do repositório e não faz parte do produto.

O estado persistente responsável por impedir repetição é:

```text
campaign.travelPlayedIslandIds
```
