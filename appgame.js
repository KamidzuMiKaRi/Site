// Константы для игры Тетрис
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]]  // Z
];
const COLORS = [
    '#FF0D72', '#0DC2FF', '#0DFF72', 
    '#F538FF', '#FF8E0D', '#FFE138', 
    '#3877FF'
];

// Переменные игры
let tetrisBoard = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let currentRotation = 0;
let tetrisInterval;
let tetrisScore = 0;
let isGameOver = false;
let currentColor = '';

// Инициализация игры
function initTetris() {
    tetrisScore = 0;
    isGameOver = false;
    $("#tetris-score").text("Счет: 0");
    $("#tetris-game").empty();
    
    // Инициализация игрового поля
    tetrisBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    
    // Создание блоков
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            $("#tetris-game").append(`<div class="tetris-block" id="tetris-${r}-${c}"></div>`);
        }
    }
    
    // Создание первой фигуры
    spawnPiece();
    drawTetris();
    
    // Запуск игрового цикла
    clearInterval(tetrisInterval);
    tetrisInterval = setInterval(updateTetris, 1000);
}

// Создание новой фигуры
function spawnPiece() {
    const shapeIdx = Math.floor(Math.random() * SHAPES.length);
    currentPiece = SHAPES[shapeIdx];
    currentColor = COLORS[shapeIdx];
    currentRotation = 0;
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
    currentY = 0;
    
    // Проверка на проигрыш
    if (collision()) {
        isGameOver = true;
        clearInterval(tetrisInterval);
        alert("Игра окончена! Ваш счет: " + tetrisScore);
    }
}

// Проверка столкновений
function collision() {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (!currentPiece[r][c]) continue;
            
            const newX = currentX + c;
            const newY = currentY + r;
            
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
                return true;
            }
            
            if (newY < 0) continue;
            
            if (tetrisBoard[newY][newX]) {
                return true;
            }
        }
    }
    return false;
}

// Поворот фигуры
function rotatePiece() {
    const originalRotation = currentRotation;
    currentRotation = (currentRotation + 1) % 4;
    
    // Транспонирование матрицы для поворота
    const rotated = [];
    for (let c = 0; c < currentPiece[0].length; c++) {
        const newRow = [];
        for (let r = currentPiece.length - 1; r >= 0; r--) {
            newRow.push(currentPiece[r][c]);
        }
        rotated.push(newRow);
    }
    
    const originalPiece = currentPiece;
    currentPiece = rotated;
    
    if (collision()) {
        currentPiece = originalPiece;
        currentRotation = originalRotation;
    }
}

// Основной игровой цикл
function updateTetris() {
    if (isGameOver) return;
    
    currentY++;
    
    if (collision()) {
        currentY--;
        mergePiece();
        clearLines();
        spawnPiece();
    }
    
    drawTetris();
}

// Фиксация фигуры на поле
function mergePiece() {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (!currentPiece[r][c]) continue;
            
            const newY = currentY + r;
            const newX = currentX + c;
            
            if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                tetrisBoard[newY][newX] = currentColor;
            }
        }
    }
}

// Удаление заполненных строк
function clearLines() {
    let linesCleared = 0;
    
    for (let r = ROWS - 1; r >= 0; r--) {
        if (tetrisBoard[r].every(cell => cell)) {
            // Удаляем строку
            tetrisBoard.splice(r, 1);
            // Добавляем новую пустую строку вверху
            tetrisBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            r++; // Проверяем ту же строку снова
        }
    }
    
    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100;
        $("#tetris-score").text("Счет: " + tetrisScore);
    }
}

// Отрисовка игрового поля
function drawTetris() {
    // Очищаем поле
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const block = $(`#tetris-${r}-${c}`);
            block.css({
                top: r * BLOCK_SIZE + "px",
                left: c * BLOCK_SIZE + "px",
                backgroundColor: tetrisBoard[r][c] || "",
                borderColor: tetrisBoard[r][c] ? "#000" : "#ddd"
            });
        }
    }
    
    // Рисуем текущую фигуру
    if (currentPiece) {
        for (let r = 0; r < currentPiece.length; r++) {
            for (let c = 0; c < currentPiece[r].length; c++) {
                if (currentPiece[r][c]) {
                    const y = currentY + r;
                    const x = currentX + c;
                    
                    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                        $(`#tetris-${y}-${x}`).css({
                            backgroundColor: currentColor,
                            borderColor: "#000"
                        });
                    }
                }
            }
        }
    }
}

// Обработка клавиш для управления
function setupTetrisControls() {
    $(document).on("keydown", function(e) {
        if ($("#tetris-window").is(":visible") && !isGameOver) {
            e.preventDefault();
            
            switch (e.key) {
                case "ArrowLeft":
                    currentX--;
                    if (collision()) currentX++;
                    break;
                case "ArrowRight":
                    currentX++;
                    if (collision()) currentX--;
                    break;
                case "ArrowDown":
                    currentY++;
                    if (collision()) currentY--;
                    break;
                case "ArrowUp":
                    rotatePiece();
                    break;
                case " ":
                    // Ускоренное падение
                    while (!collision()) {
                        currentY++;
                    }
                    currentY--;
                    mergePiece();
                    clearLines();
                    spawnPiece();
                    break;
            }
            
            drawTetris();
        }
    });
}

// Инициализация игры при загрузке
$(document).ready(function() {
    // Открытие/закрытие окна
    $("#tetris-icon").on("click", function() {
        $("#tetris-overlay, #tetris-window").fadeIn();
        initTetris();
    });
    
    $("#tetris-close, #tetris-overlay").on("click", function() {
        $("#tetris-overlay, #tetris-window").fadeOut();
        clearInterval(tetrisInterval);
    });
    
    // Настройка управления
    setupTetrisControls();
});