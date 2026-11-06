## Awesome JSGame Detona Ralph

Jogo do **Detona Ralph** feito com HTML, CSS e JavaScript puro, como parte de um projeto educacional da Digital Innovation One.

### Como jogar

1. Abra o arquivo `index.html` no navegador.
2. Escolha a dificuldade (**Fácil**, **Normal** ou **Difícil**) e clique em **Jogar**.
3. Clique no quadrado onde o Ralph aparecer para marcar pontos.
4. Clicar em um quadrado errado custa uma vida (você começa com 3).
5. O jogo termina quando o tempo ou as vidas acabam.
6. Para pausar, use o botão **Pausar** ou a tecla **P**.

| Dificuldade | Tempo | Vidas | Velocidade inicial |
| ----------- | ----- | ----- | ------------------ |
| Fácil       | 60s   | 5     | mais lenta         |
| Normal      | 60s   | 3     | original           |
| Difícil     | 45s   | 2     | mais rápida        |

### Melhorias nesta versão

- Tela de início e tela de **Game Over** com botão para jogar de novo (sem recarregar a página).
- **Vidas funcionando**: errar o quadrado tira uma vida e o contador é atualizado.
- **Três dificuldades**, cada uma com tempo, vidas e velocidade próprios (ajustáveis em `DIFFICULTIES`, no `engine.js`).
- **Pausa** pelo botão ou pela tecla P; o jogo também pausa sozinho se você trocar de aba.
- **Recorde** guardado no navegador (`localStorage`), um para cada dificuldade.
- **Dificuldade progressiva**: o Ralph fica mais rápido a cada 5 pontos.
- Ralph nunca aparece duas vezes seguidas no mesmo quadrado.
- Feedback visual de acerto (amarelo) e erro (vermelho).
- Funciona com mouse e toque, e o layout se adapta a telas pequenas.
- O cronômetro mostra 60 desde o início; o jogo só começa quando você clica em Jogar.

### Tecnologias

- HTML5 e CSS3 para a estrutura e a aparência.
- JavaScript para a lógica e a interatividade.

### Créditos

Projeto original da [Digital Innovation One](https://github.com/digitalinnovationone/jsgame-detona-ralph).             Vinicius Cruz Dos Santos
