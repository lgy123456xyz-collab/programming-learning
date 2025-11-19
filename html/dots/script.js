<canvas id="canvas"></canvas>
<script>
class Particle {
    constructor(x, y, char) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
        this.size = 16;
        this.angle = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.fillStyle = 'black';
        ctx.font = '18px "Times New Roman"';
        ctx.fillText(this.char, this.x, this.y);
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Black hole effect parameters
        const maxDistance = 200;
        const minDistance = 5;
        const gravitationalPull = 2;

        if (distance < maxDistance) {
            // Force as inverse-square law
            let force = gravitationalPull / (distance * distance + 1);

            // Spiral motion
            this.angle += 0.05 * force;

            if (distance > minDistance) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                this.x += forceDirectionX * force * this.density;
                this.y += forceDirectionY * force * this.density;

                this.x += Math.cos(this.angle) * force * 10;
                this.y += Math.sin(this.angle) * force * 10;
            } else {
                this.x += Math.cos(this.angle) * 2;
                this.y += Math.sin(this.angle) * 2;
            }
        } else {
            // Return to base
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
        }
    }
}

const text = `O universo é um vasto oceano de possibilidades infinitas, onde cada estrela cintilante no firmamento
representa uma história não contada, um segredo guardado nos confins do tempo e do espaço. Desde os
primórdios da existência, a humanidade ergueu os olhos para o céu noturno, buscando compreender os
mistérios que habitam além da escuridão. Planetas giram em órbitas invisíveis, galáxias se entrelaçam
em uma dança cósmica eterna, e buracos negros devoram a luz com sua gravidade avassaladora. O tempo,
essa entidade implacável, segue seu curso inexorável, levando consigo civilizações inteiras, apagando
impérios outrora grandiosos e moldando o destino daqueles que ousam desafiar suas leis.

A linguagem, por sua vez, é um reflexo da consciência humana, uma ferramenta que nos permite expressar
pensamentos, emoções e aspirações. As palavras fluem como rios intermináveis, entrelaçando-se em
narrativas complexas que transcendem eras e culturas. Letras se transformam em palavras, palavras em
frases, frases em histórias que ressoam através dos séculos. O poder da comunicação reside na sua
capacidade de conectar mentes distantes, de transmitir conhecimento, de inspirar revoluções e de
preservar a essência da experiência humana.

Nos confins do ciberespaço, códigos binários pulsam como sinapses artificiais, dando vida a realidades
digitais que desafiam a percepção da existência. Algoritmos calculam probabilidades, inteligência
artificial aprende padrões, e redes neurais simulam processos cognitivos outrora exclusivos da mente
humana. Enquanto a tecnologia avança a passos largos, as fronteiras entre o real e o virtual tornam-se
cada vez mais tênues, questionando o próprio significado da consciência e da identidade.

E assim, o ciclo continua, incessante, infinito. O universo se expande, os astros seguem seus cursos,
a humanidade avança rumo ao desconhecido, guiada por sua insaciável curiosidade e desejo de compreender
o inatingível.`;

let particles = [];
let mouse = { x: null, y: null, radius: 100 };
let squareSize = 800;

function drawBlackHoleEffect(ctx, x, y) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 200, 0, Math.PI * 2);
    ctx.fill();

    // 小黑点（黑洞中心）
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
}

function init() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const squareX = canvas.width / 2 - squareSize / 2;
    const squareY = canvas.height / 2 - squareSize / 2;

    ctx.font = '18px "Times New Roman"';
    ctx.textAlign = 'left';

    const textLines = text.split('\n');
    const lineHeight = 32;

    textLines.forEach((line, lineIndex) => {
        let xCursor = squareX + 20;  // 每行起始位置
        const y = squareY + (lineIndex * lineHeight) + 40;

        line.split('').forEach(char => {
            let charWidth = ctx.measureText(char).width;
            if (xCursor + charWidth < squareX + squareSize) {
                particles.push(new Particle(xCursor, y, char));
                xCursor += charWidth;
            }
        });
    });
}

function animate() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const squareX = canvas.width / 2 - squareSize / 2;
    const squareY = canvas.height / 2 - squareSize / 2;

    if (mouse.x !== null && mouse.y !== null) {
        drawBlackHoleEffect(ctx, mouse.x, mouse.y);
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(squareX, squareY, squareSize, squareSize);

    particles.forEach(particle => {
        particle.x = Math.max(squareX, Math.min(squareX + squareSize, particle.x));
        particle.y = Math.max(squareY, Math.min(squareY + squareSize, particle.y));
