let currentQuote = "";
let startTime;
let history = [];

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
    $("#intext").on("input", handleInput);
    updateHistoryTable(); // Обновляем таблицу при загрузке
});

function loadQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[index];
    $("#quote").text(currentQuote);
    $("#intext").val("");
    $("#intext").focus();
    startTime = new Date().getTime();
}

function handleInput() {
    const typedText = $(this).val();
    const correctLength = Math.min(typedText.length, currentQuote.length);
    let errors = 0;

    for (let i = 0; i < correctLength; i++) {
        if (typedText[i] !== currentQuote[i]) errors++;
    }

    const elapsed = (new Date().getTime() - startTime) / 1000 / 60; // in minutes
    const speed = Math.round((typedText.length / elapsed) || 0);
    const errorRate = Math.round((errors / correctLength) * 100 || 0);

    $("#speed").text(speed);
    $("#errors").text(errorRate);

    if (typedText === currentQuote) {
        addToHistory(speed, errorRate);
        setTimeout(loadQuote, 1000);
    }
}

function addToHistory(speed, errorRate) {
    history.unshift({ speed, errorRate });

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
                <td>${item.errorRate}%</td>
            </tr>
        `;
        tbody.append(row);
    });
}