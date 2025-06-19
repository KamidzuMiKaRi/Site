let currentQuote = "";
let startTime;
let history = [];
let updateInterval;
let erroneousPositions = new Set(); // Используем Set для хранения индексов позиций с ошибками

// Добавляем новые переменные для накопительного подсчета
let totalIncorrectChars = 0; // Общее количество неправильно введенных символов
let maxTypedLengthReached = 0; // Максимальная длина, которой достигал введенный текст

// Загружаем историю из localStorage при старте
$(document).ready(() => {
    // Загружаем сохранённую историю или создаём пустую
    const savedHistory = localStorage.getItem("typingHistory");
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    } else {
        history = [];
    }

    loadQuote();
    $("#intext").on("input", handleInput); // handleInput будет только проверять завершение
    updateHistoryTable(); // Обновляем таблицу при загрузке
    startRealtimeUpdates(); // Запускаем обновление статистики в реальном времени

    // Новое: Обработчик для кнопки очистки истории
    $("#clearHistoryBtn").on("click", clearHistory);
});

function loadQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[index];
    $("#quote").text(currentQuote);
    $("#intext").val("");
    $("#intext").focus();
    startTime = new Date().getTime();
    erroneousPositions.clear(); // Очищаем список ошибочных позиций для новой цитаты
    totalIncorrectChars = 0; // Сбрасываем накопительные счетчики
    maxTypedLengthReached = 0; // Сбрасываем накопительные счетчики
    startRealtimeUpdates(); // Перезапускаем обновление при загрузке новой цитаты
}

// Новая функция для обновления статистики
function updateStats() {
    const typedText = $("#intext").val(); // Получаем текст из поля ввода

    // Обновляем maxTypedLengthReached - это "Общее кол-во введённых символов"
    if (typedText.length > maxTypedLengthReached) {
        maxTypedLengthReached = typedText.length;
    }

    // Проверяем каждую позицию в текущем введенном тексте на наличие новой ошибки
    // и добавляем её в erroneousPositions, если ошибка есть.
    // Если позиция уже есть в erroneousPositions, это означает, что ошибка уже была зафиксирована.
    for (let i = 0; i < typedText.length; i++) {
        // Если символ не совпадает ИЛИ если пользователь ввел больше символов, чем в цитате
        if ((i < currentQuote.length && typedText[i] !== currentQuote[i]) || (i >= currentQuote.length && !erroneousPositions.has(i))) {
            // Если это новая ошибка (позиция еще не в erroneousPositions), то увеличиваем totalIncorrectChars
            if (!erroneousPositions.has(i)) {
                 totalIncorrectChars++; // Увеличиваем счетчик ошибок, если это новая ошибка
            }
            erroneousPositions.add(i); // Добавляем позицию в Set
        }
    }
    // Важно: если пользователь стирает ошибку, erroneousPositions.has(i) станет false для этой i,
    // но totalIncorrectChars уже увеличился и не уменьшится.
    // Если пользователь стирает символы, которые были правильными,
    // totalIncorrectChars не изменяется, а maxTypedLengthReached сохраняет свое максимальное значение.

    const elapsed = (new Date().getTime() - startTime) / 1000 / 60; // in minutes
    const speed = Math.round((typedText.length / (elapsed || 0.0001))); // Минимальное значение для elapsed, чтобы избежать NaN

    let accuracyPercentage = 100; // По умолчанию 100%

    // Расчет точности на основе накопительных значений
    // "Общее кол-во введённых символов" = maxTypedLengthReached
    // "Кол-во неправильно введённых символов" = totalIncorrectChars
    if (maxTypedLengthReached > 0) { // Избегаем деления на ноль
        accuracyPercentage = Math.round((1 - (totalIncorrectChars / maxTypedLengthReached)) * 100);
        
        if (accuracyPercentage < 0) {
            accuracyPercentage = 0; // Точность не может быть отрицательной
        }
    }
    
    $("#speed").text(speed);
    $("#accuracy").text(accuracyPercentage); // Обновляем #accuracy
}

// Функция для запуска обновления статистики 10 раз в секунду
function startRealtimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval); // Очищаем предыдущий интервал, если он был
    }
    updateInterval = setInterval(updateStats, 100); // 100 мс = 10 раз в секунду
}

// Модифицированная handleInput, которая теперь только проверяет завершение
function handleInput() {
    const typedText = $(this).val();

    if (typedText === currentQuote) {
        clearInterval(updateInterval); // Останавливаем обновление, когда цитата набрана
        
        // Пересчитываем окончательные значения, чтобы они были точными на момент завершения
        const elapsed = (new Date().getTime() - startTime) / 1000 / 60;
        const speed = Math.round((typedText.length / elapsed) || 0);

        // Финальные значения для истории должны быть на основе totalIncorrectChars и maxTypedLengthReached
        // (которые уже актуальны на этот момент).
        let finalAccuracyPercentage = 100;
        if (maxTypedLengthReached > 0) {
            finalAccuracyPercentage = Math.round((1 - (totalIncorrectChars / maxTypedLengthReached)) * 100);
            if (finalAccuracyPercentage < 0) {
                finalAccuracyPercentage = 0;
            }
        }

        addToHistory(speed, finalAccuracyPercentage); // Передаем finalAccuracyPercentage
        setTimeout(loadQuote, 1000);
    }
}

function addToHistory(speed, accuracy) {
    history.unshift({ speed, accuracy });

    if (history.length > 10) {
        history.pop();
    }

    // Сохраняем в localStorage
    localStorage.setItem("typingHistory", JSON.stringify(history));

    updateHistoryTable();
}

function updateHistoryTable() {
    const tbody = $("#history tbody");
    tbody.empty();

    history.forEach((item, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.speed}</td>
                <td>${item.accuracy}%</td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Новая функция для очистки истории
function clearHistory() {
    // Очищаем массив history
    history = [];
    // Удаляем данные из localStorage
    localStorage.removeItem("typingHistory");
    // Обновляем таблицу на странице, чтобы она стала пустой
    updateHistoryTable();
}