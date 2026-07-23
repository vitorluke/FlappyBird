const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

const imgBg = new Image();
imgBg.src = "images/bg.png";

const imgBird = new Image();
imgBird.src = "images/bird.png";

const imgPipeTop = new Image();
imgPipeTop.src = "images/canocima.png";

const imgPipeBottom = new Image();
imgPipeBottom.src = 'images/canobaixo.png';

const imgFloor = new Image();
imgFloor.src = 'images/chao.png';

const jump = new Audio("sounds/fly.mp3");
const point = new Audio("sounds/score.mp3");

let frames = 0;
let score = 0;
let gameOver = false;
let sound = true;

let volume = document.getElementById('volume');
let volume_text = document.getElementById('volume-text');

function not(variable){
    return !variable
}

volume.addEventListener("click", function (){
    sound = not(sound);
    if ( sound == true){
        volume.style.backgroundColor = "green";
        volume_text.textContent = "Volume: On";
    }

    if ( sound == false){
        volume.style.backgroundColor = "red";
        volume_text.textContent = "Volume: Off";
    }
})


const floorHeight = 80;

const bird = {
    x: 50, 
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.25,
    speed: 0,
    jump: 4.6,

    draw() {
        ctx.drawImage(imgBird, this.x, this.y, this.width, this.height);
    },

    update() {
        this.speed += this.gravity;
        this.y += this.speed;

        if(this.y + this.height >= canvas.height - floorHeight) {
            this.y = canvas.height - floorHeight - this.height;
            gameOver = true;
        }

        if(this.y <= 0) {
            this.y = 0;
            this.speed = 0;
        }
    },

    flap(){
        this.speed = -this.jump
    }
};

// --- CANOS ---
const pipes = {
    position: [],
    gap: 110,         // Abertura para o passaroo passar
    width: 52,        // Largura do cano
    dx: 2,

    draw() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            
            // Cano de Cima (canocima.png)
            ctx.drawImage(imgPipeTop, p.x, p.top - 320, this.width, 320);
            
            // Cano de Baixo (canobaixo.png)
            let bottomPipeY = p.top + this.gap;
            ctx.drawImage(imgPipeBottom, p.x, bottomPipeY, this.width, 320);
        }
    },

    update() {
        // Gera novos canos a cada 100 quadros
        if (frames % 100 === 0) {
            // Garante que o cano gere dentro do limite útil (acima do chão)
            let maxTop = canvas.height - floorHeight - this.gap - 40;
            let topHeight = Math.floor(Math.random() * (maxTop - 50)) + 50;
            
            this.position.push({
                x: canvas.width,
                top: topHeight
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx;

            // Checa Colisão do Passarinho com os Canos
            if (
                bird.x + bird.width > p.x && 
                bird.x < p.x + this.width && 
                (bird.y < p.top || bird.y + bird.height > p.top + this.gap)
            ) {
                gameOver = true;
            }

            // Soma pontuação ao passar pelo cano
            if (p.x + this.width === bird.x) {
                if(sound == true){
                    point.play();
                }
                score++;
            }

            // Remove canos que saíram da tela
            if (p.x + this.width < 0) {
                this.position.shift();
                i--;
            }
        }
    }
};

// --- CHÃO (Efeito de Movimento) ---
const floor = {
    x: 0,
    draw() {
        // Desenha duas vezes lado a lado para dar o efeito de rolagem infinita
        ctx.drawImage(imgFloor, this.x, canvas.height - floorHeight, canvas.width, floorHeight);
        ctx.drawImage(imgFloor, this.x + canvas.width, canvas.height - floorHeight, canvas.width, floorHeight);
    },
    update() {
        if (!gameOver) {
            this.x = (this.x - 2) % canvas.width;
        }
    }
};

// --- CONTROLES ---
window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        e.preventDefault();
        if(sound == true){
            jump.play();
        }
        if (gameOver) {
            // Reinicia valores
            bird.y = 150;
            bird.speed = 0;
            pipes.position = [];
            score = 0;
            gameOver = false;
            loop();
        } else {
            bird.flap();
        }
    }
});

// --- PONTUAÇÃO ---
function drawScore() {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(score, canvas.width / 2 - 5, 50);
    ctx.strokeText(score, canvas.width / 2 - 5, 50);
}

// --- LOOP DO JOGO ---
function loop() {
    // 1. Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha o Fundo
    ctx.drawImage(imgBg, 0, 0, canvas.width, canvas.height);

    // 3. Atualiza Posições
    bird.update();
    pipes.update();
    floor.update();

    // 4. Desenha Elementos (na ordem correta de camadas)
    pipes.draw();
    floor.draw();
    bird.draw();
    drawScore();

    frames++;

    if (!gameOver) {
        requestAnimationFrame(loop);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("Game Over!", 70, canvas.height / 2);
        ctx.fillStyle = "#FFF";
        ctx.font = "14px sans-serif";
        ctx.fillText("Pressione Espaço para reiniciar", 60, canvas.height / 2 + 30);
    }
}

// Inicia assim que as imagens forem carregadas
loop();