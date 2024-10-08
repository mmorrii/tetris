import {
    moveTetrominoDown,
    moveTetrominoRight,
    moveTetrominoLeft,
    rotateTetromino,
    isGameOver,
    playField,
    tetromino
} from "./src/tetris.js";

import { convertPositionToIndex, PLAYFIELD_COLUMNS, PLAYFIELD_ROWS } from "./src/utilities.js";


let requestId;
let timeoutId;
const cells = document.querySelectorAll('.grid>div');
const start = document.querySelector('#start');
const ghost = document.querySelector('#ghost');
const grid = document.querySelector('.grid');

initKeydown();

startGame();

//--------------------------------------------------------------------------------
let allowMoveLeft = true;
let allowMoveRight = true;
let allowMoveRotate = true;
let allowMoveDown = true;
let stateGame = false;

function startGame () {
    start.addEventListener('click', () => {
        if (!stateGame) {
            stateStartGame();
            moveDown();
        } else {
            stateStopGame();
            stopLoop();
        }
    })
}

function stateStartGame() {
    allowMoveDown = true;
    allowMoveLeft = true;
    allowMoveRight = true;
    allowMoveRotate = true;
    stateGame = true;
    start.innerHTML = 'STOP';
}

function stateStopGame() {
    allowMoveDown = false;
    allowMoveLeft = false;
    allowMoveRight = false;
    allowMoveRotate = false;
    stateGame = false;
    start.innerHTML = 'START';
}

//-------уровень--------------------------------------------------------------------------------
let levelElement = document.getElementById('level');
let count = 0;
let level = 1;
let baseDelay = 700;

export function updateLevel () {
    count++;

    if (count === 10) {
        level++;
        count = 0;
        if (baseDelay > 300) baseDelay -= 50;
    }

    levelElement.innerHTML = String(level);
}

//-------счет--------------------------------------------------------------------------------
const scoreElement = document.getElementById('score');
const addedPointsSpan = document.getElementById('addedPoints');
let score = 0;
let addedPoints = 0;

export function updateScore(completedRows) {
    switch (completedRows) {
        case 1:
            score += 100;
            addedPoints = 100;
            addedPointsHTML();
            addedPointsStyle();
            break;
        case 2:
            score += 300;
            addedPoints = 300;
            addedPointsHTML();
            addedPointsStyle();
            break;
        case 3:
            score += 700;
            addedPoints = 700;
            addedPointsHTML();
            addedPointsStyle();
            break;
        case 4:
            score += 1500;
            addedPoints = 1500;
            addedPointsHTML();
            addedPointsStyle();
            break;
    }
    scoreElement.innerHTML = score;
}

function addedPointsHTML () {
    addedPointsSpan.innerHTML = '+' + addedPoints;
}

function addedPointsStyle () {
    addedPointsSpan.style.opacity = 1;
    setTimeout(() => addedPointsSpan.style.opacity = 0, 1000);
}

//--управление------------------------------------------------------------------------------------
function initKeydown() {
    document.addEventListener('keydown', onKeydown);
    // onPointer();
}

function onKeydown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            rotate();
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveDown();
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight();
            break;
    }
}


// function onPointer () {
//     document.ondragstart = () => false;
//
//     // let currentLocationTetromino = tetromino.column;
//     //
//     // document.onpointermove = () => {
//     //     if (currentLocationTetromino > tetromino.column) moveLeft();
//     //     if (currentLocationTetromino < tetromino.column) moveRight();
//     // }
//
//     let startingX = null; // Начальная позиция свайпа
//
//     document.addEventListener('touchstart', (e) => {
//         startingX = e.touches[0].clientX; // Запоминаем начальную позицию свайпа
//     });
//
//     document.onpointermove = (e) => {
//         if (startingX === null) return; // Не выполняем ничего, если начальная позиция не установлена
//
//         const currentX = e.touches[0].clientX;
//         const deltaX = currentX - startingX;
//
//         if (deltaX > 10) { // Здесь вы можете настроить чувствительность свайпа
//             moveRight();
//         } else if (deltaX < -10) {
//             moveLeft();
//         }
//
//         startingX = null; // Сбрасываем начальную позицию после выполнения действия
//     }
//
//
//     document.onpointerdown = () => {
//         rotate();
//     }
// }


function moveDown() {
    if (!allowMoveDown) return;
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();

    if (isGameOver) gameOver();
}

function moveLeft() {
    if (!allowMoveLeft) return;
    moveTetrominoLeft();
    draw();
}

function moveRight() {
    if (!allowMoveRight) return;
    moveTetrominoRight();
    draw();
}

function rotate() {
    if (!allowMoveRotate) return;
    rotateTetromino();
    draw();
}

function startLoop() { //---------------------падение фигур с задержкой 0,7с
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), baseDelay);
}

function stopLoop() { //----------------------остановка цикла падения фигур
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

//--прорисовка фигур-------------------------------------------------------------------------------
function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
    drawGhostTetromino();
}

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!playField[row][column]) continue;

            const name = playField[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {

            if (!tetromino.matrix[row][column]) continue;
            if (tetromino.row + row < 0) continue;

            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

//-----------тень---------------------------------------------------------------------------------------------------------
function drawGhostTetromino() { //----------------------------тень
    const tetrominoMatrixSize = tetromino.matrix.length;

    for ( let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (tetromino.ghostRow + row < 0) continue;

            const cellIndex = convertPositionToIndex(tetromino.ghostRow + row, tetromino.ghostColumn + column);

            if (grid.classList.contains('shadow-on')) cells[cellIndex].classList.add('ghost');
        }
    }
}

ghost.addEventListener('click', () => {
    grid.classList.toggle('shadow-on');
    ghost.classList.toggle('shadow-on');

    const shadowOnState = grid.classList.contains('shadow-on');
    localStorage.setItem('shadowOnState', shadowOnState);
})

document.addEventListener('DOMContentLoaded', () => {
    const shadowOnState = localStorage.getItem('shadowOnState');
    if (shadowOnState === 'true') {
        grid.classList.add('shadow-on');
        ghost.classList.add('shadow-on');
    }
});

//-----------------------------------------------------------------------------------
function gameOver () {
    stopLoop();
    stateGame = false;
    start.innerHTML = 'START';
    document.removeEventListener('keydown', onKeydown);
    document.querySelector('.grid').classList.add('game-over');
    start.classList.add('game-over');
}

//-------------------------------------------------------------------------
const restart = document.getElementById('restart');

restart.onclick = () => {
    window.location.reload();
}

//-------functions for mobile version------------------------------------------------
const menuButton = document.querySelector('.menu-button');
const backgroundMenu = document.querySelector('.background-menu');
const buttons = document.querySelector('.buttons');
const startNewGame = document.querySelector('.new-start');

if (window.innerWidth <= 600) {
    menuButton.onclick = () => {
        menuButton.classList.toggle('open');
        backgroundMenu.classList.toggle('open');
        buttons.classList.toggle('open');

        if (menuButton.classList.contains('open')) {
            stateStopGame();
            stopLoop();
        } else {
            stateStartGame();
            moveDown();
        }
    }

    start.onclick = () => {
        menuButton.classList.remove('open');
        backgroundMenu.classList.remove('open');
        buttons.classList.remove('open');
    }

    grid.classList.add('start-new-game');

    startNewGame.onclick = () => {
        grid.classList.remove('start-new-game');
        stateStartGame();
        moveDown();
    }
}
