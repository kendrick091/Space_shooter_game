const backgroundTracks = [
    new Audio("sounds/background1.mp3"), 
    new Audio("sounds/background2.mp3"),
    new Audio("sounds/vicMusic4.mp3"),
    new Audio("/sounds/background3.mp3")
];

let currentTrackIndex = 0;
let backgroundMusic = backgroundTracks[currentTrackIndex];
backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// to change background
let backgroundChanged = false;

//Responsive to screen
function resizeCanvas() {
    if (window.innerWidth > window.innerHeight) {
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.8; //% for screen
}else{
    //Portrait mode: force landscape size but keep aspect ratio
    canvas.width = window.innerHeight;
    canvas.height = window.innerWidth * 0.8;
}
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

async function  lockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
        try {
            await screen.orientation.lock("landscape");
        }catch(error){
           console.warn("orientation lock not supported:",
            error);
        }
    }    
}
//Try locking orientation when the user starts the game
document.addEventListener("click", lockOrientation);
// canvas.width = 600;
// canvas.height = 300;

const player = {
    x: canvas.width / 1 - canvas.width,
    y: canvas.height / 2 - 50,
    width: canvas.width * 0.1,
    height: canvas.height * 0.1,
    color: "blue",
    speed: 3.2
};
const bullets = [];
const enemies = [];
let enemySpeed = 3
let score = 0;
let highScore = 
localStorage.getItem("highScore") || 0;
let isGameOver = false;
let isGameStart = false;

//function to change the music
function updateCanvasBackgroundMusic() {
    let newTrackIndex = Math.floor(score / 100); //Get track based on score
    if (newTrackIndex !== currentTrackIndex && newTrackIndex < backgroundTracks.length){
        backgroundMusic.pause(); //stop current music
        backgroundMusic.currentTime = 0;

        currentTrackIndex = newTrackIndex;
        backgroundMusic = backgroundTracks[currentTrackIndex];
        backgroundMusic.loop = true;
        backgroundMusic.play(); //play new music
    }
}


//Event listener for shooting
document.addEventListener("keydown", (e)=>{
    if (e.code === "Space") {
        bullets.push({
            x: player.x + player.width,
            y: player.y + player.height / 2 - 4,
            width: 9,
            height: 3,
            color: "yellow"
        });
    }
});

//Move spawn login
function spawnEnemy() {
    const size = canvas.width * 0.08;
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - size),
        width: size,
        height: size,
        color: "red",
        speed: enemySpeed
    });
}
setInterval(spawnEnemy, 700);

//Touch start( touch control so players ca move on mobile divices);
canvas.addEventListener("touchstart", (e)=>{
    let touchY = e.touches[0].clientY;
    if (touchY < canvas.height / 2){
        player.y -= canvas.height * 0.1; //move up
    }else{
        player.y += canvas.height * 0.1; //move down
    }
})

//Draw player as triangle
function drawTriangle(x, y, size, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y); //top point
    ctx.lineTo(x - size, y + size / 2); //bottom left
    ctx.lineTo(x - size, y - size / 2); //Bottom right
    ctx.closePath();
    ctx.fill()
}

//Update Background
const backgroundColors = ["#111", "#004d00", "#d004d5", "#4d004d",
    "#4d0000"
];

let currentBackgroundIndex = 0;

function updateCanvasBackground() {
    if (score >= 100 && !backgroundChanged) {
        let newIndex = Math.floor(score / 100) % backgroundColors.length;
        //Cycle through colors every 100 points
        
        //Apply new color
        if (newIndex !== currentBackgroundIndex) {
            currentBackgroundIndex = newIndex;
            canvas.style.background = backgroundColors[currentBackgroundIndex];
        }
        
    }
}

//Control codes
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

//variable for mobile movement
let moveUpInterval;
let moveDownInterval;

document.addEventListener("keydown", (e) =>{
    if (isGameOver && e.code === "Enter") {
        restartGame();
    }
})

document.addEventListener("keydown", (e)=>{
    if (!isGameStart && e.code === "Enter"){
        isGameStart = true;
        update(); //Start the game loop
    }
})

window.addEventListener("keydown", (event)=>{
    if (keys.hasOwnProperty(event.key)){
        keys[event.key] = true;
    }
})

window.addEventListener("keyup", (event)=>{
    if (keys.hasOwnProperty(event.key)){
        keys[event.key] = false;
    }
})

//Move up (For mobile)
document.getElementById("upButton").addEventListener("touchstart", ()=>{
    if (!moveUpInterval) {
        moveUpInterval = setInterval(() => {
            if (player.y > 0) player.y -=5;
        }, 40);
    }
});
document.getElementById("upButton").addEventListener("touchend", ()=>{
    clearInterval(moveUpInterval);
    moveUpInterval = null;
});

//Move down (for Mobile)
document.getElementById("downButton").addEventListener("touchstart", ()=>{
    if (!moveDownInterval) {
        moveDownInterval = setInterval(()=>{
            if (player.y < canvas.height - player.height)
                player.y += 5;
        }, 40)
    }
})
document.getElementById("downButton").addEventListener("touchend", ()=>{
    clearInterval(moveDownInterval);
    moveDownInterval = null;
})

//allow shooting by holding the button
let shootingInterval;
document.getElementById("shootButton").addEventListener("touchstart", ()=>{
    if (!shootingInterval) {
        shootingInterval = setInterval(()=>{
            bullets.push({
                x: player.x + player.width,
                y: player.y + player.height / 2 - 5,
                width: 10,
                height: 3,
                color: "yellow"
            });
        }, 300)
    }
})

//Continue shooting and stop shooting when the player lifts their finger
document.getElementById("shootButton").addEventListener("touchend", ()=>{
    clearInterval(shootingInterval);
    shootingInterval = null;
})

//button and key controls
function playerMovement() {
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.height)
        player.y += player.speed;
}

//code above for control

//Restart Game if over
function restartGame() {
    isGameOver = false;
    score = 0;
    enemySpeed = 2;
    bullets.length = 0; //Clear bullets
    enemies.length = 0; //clear enemies
    player.y = canvas.height / 2 - player.height; //Reset position
    player.x = canvas.width / 10 -  player.width

    //Reset background color
    currentBackgroundIndex = 0;
    canvas.style.background = backgroundColors[currentBackgroundIndex];

    //Reset music to first track
    backgroundMusic.pause();
    currentTrackIndex = 0;
    backgroundMusic = backgroundTracks[currentTrackIndex];
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    update() //Restart game loop
}

//gameOver function
function gameOver() {
    isGameOver = true;
    //update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    //Display Game Over message
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 80,
        canvas.height / 2);
        ctx.fillText("Score: " + score,
            canvas.width / 2 - 50,
            canvas.height / 2 + 40);
        ctx.fillText("HIGH SCORE: " + highScore,
            canvas.width / 2 - 70, canvas.height / 2 + 80
            );
        ctx.font = "20px Arial";
        ctx.fillText("Press Enter to Restart",
            canvas.width / 2 - 100,
            canvas.height / 2 + 120);
}

//Enemy and Player collision
function playerCollision(){
    for (let i = enemies.length - 1; i >= 0; i--) {
    if (player.x < enemies[i].x + enemies[i].width &&
        player.x + player.width > enemies[i].x &&
        player.y < enemies[i].y + enemies[i].height &&
        player.y + player.height > enemies[i].y){
            gameOver();
            return;
        }
    }
}

//Show startScreen
function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("SHOOTING GAME", canvas.width / 2 - 120,
        canvas.height / 2 -50);
        ctx.font = "20px Arial";
        ctx.fillText("Press Enter to Start", canvas.width / 2 - 100,
            canvas.height / 2 + 20);
        ctx.fillText("Use Arrow Keys to Move", canvas.width / 2 - 110,
            canvas.height / 2 + 50
        );
        ctx.fillText("Press SPACE to shoot", canvas.width / 2 - 110,
            canvas.height / 2 + 80
        );
}


//Game loop
function update() {
    if (!isGameStart) {
        showStartScreen();
        return;
    }
    if (isGameOver) return; //stop the game if it's game Over
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw player
    drawTriangle(player.x + player.width, player.y +
        player.height / 2, 40, player.color);
    // ctx.fillStyle = player.color;
    // ctx.fillRect(player.x,
    //     player.y,
    //     player.width,
    //     player.height
    // );

    //update player movement
    playerMovement();
    //Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += 5;
        ctx.fillStyle = bullets[i].color;
        ctx.fillRect(bullets[i].x, bullets[i].y,
            bullets[i].width, bullets[i].height);
        
    //Remove bullets that go off screen
    if(bullets[i].x > canvas.width) bullets.splice(i, 1);
    }
    //Update and draw enemies
    for (let i = enemies.length - 1; i > 0; i--){
        enemies[i].x -= enemies[i].speed;
        ctx.fillStyle = enemies[i].color;
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width,
            enemies[i].height
        );
    
    //remove enemies that go off screen
    if (enemies[i].x + enemies[i].width < 0)
        enemies.splice(i, 1);
    }

    //i called player collision function
    playerCollision()

    //Collision detection (bullets vs enemies)
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ){
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                enemySpeed += 0.2;
                updateCanvasBackgroundMusic(); //Change music if needed
                updateCanvasBackground(); //Change background if needed
                break;
            }
        }
    }

    //Display Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    requestAnimationFrame(update);
}

update();