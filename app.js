let currentQuote = "";
let currentAuthorId = 0;
let currentWorkId = 0;
let currentWorkTitle = "";
let currentAuthorName = "";
let startTime;
let history = [];
let updateInterval;
let erroneousPositions = new Set();
let totalIncorrectChars = 0;
let maxTypedLengthReached = 0;

$(document).ready(() => {
    // Отключение контекстного меню на всей странице
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
   
    });

// Обработчик нажатия клавиш
document.addEventListener('keydown', function(e) {
    const keyElement = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
    
    // Обработка специальных клавиш
    if (e.key === 'Backspace') {
        document.querySelector('.key-backspace').classList.add('active');
    } else if (e.key === 'Tab') {
        document.querySelector('.key-tab').classList.add('active');
    } else if (e.key === 'CapsLock') {
        document.querySelector('.key-caps').classList.add('active');
    } else if (e.key === 'Enter') {
        document.querySelector('.key-enter').classList.add('active');
    } else if (e.key === 'Shift') {
        document.querySelectorAll('.key-shift-left, .key-shift-right').forEach(el => {
            el.classList.add('active');
        });
    } else if (e.key === ' ') {
        document.querySelector('.key-space').classList.add('active');
    }
});

// Обработчик отпускания клавиш
document.addEventListener('keyup', function(e) {
    const keyElement = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
    if (keyElement) {
        keyElement.classList.remove('active');
    }
    
    // Обработка специальных клавиш
    if (e.key === 'Backspace') {
        document.querySelector('.key-backspace').classList.remove('active');
    } else if (e.key === 'Tab') {
        document.querySelector('.key-tab').classList.remove('active');
    } else if (e.key === 'CapsLock') {
        document.querySelector('.key-caps').classList.remove('active');
    } else if (e.key === 'Enter') {
        document.querySelector('.key-enter').classList.remove('active');
    } else if (e.key === 'Shift') {
        document.querySelectorAll('.key-shift-left, .key-shift-right').forEach(el => {
            el.classList.remove('active');
        });
    } else if (e.key === ' ') {
        document.querySelector('.key-space').classList.remove('active');
    }
});



    // Защита от копирования
    document.addEventListener('keydown', function(e) {
        // Блокировка Ctrl+C, Cmd+C, Ctrl+Insert
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'Insert')) {
            e.preventDefault();
            return false;
        }
    });

$("#intext").on("keydown", function(e) {
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М')) {
        e.preventDefault(); // Отменяем стандартное действие Ctrl+V
    }
});

    // Инициализация приложения
    const savedHistory = localStorage.getItem("typingHistory");
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    } else {
        history = [];
    }

    initFilters();
    loadQuote();
    
    // Обработчик ввода
    $("#intext").on("input", handleInput)
               .on("paste", function(e) {
                   // Задержка для обработки вставленного текста
                   setTimeout(() => {
                       const typedText = $(this).val();
                       if (typedText.length > currentQuote.length) {
                           $(this).val(typedText.substring(0, currentQuote.length));
                       }
                   }, 10);
               });
    
    $("#clearHistoryBtn").on("click", clearHistory);
    $("#refreshQuote").on("click", loadQuote);
    
    updateHistoryTable();
});

// Остальные функции остаются без изменений
function initFilters() {
    fetch("quotes.php?action=get_authors")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(authors => {
            const authorSelect = $("#authorSelect");
            authorSelect.empty().append('<option value="0">Все авторы</option>');
            
            if (authors && authors.length > 0) {
                authors.forEach(author => {
                    authorSelect.append(`<option value="${author.id}">${author.name}</option>`);
                });
            } else {
                throw new Error("No authors found");
            }
        })
        .catch(error => {
            console.error("Error loading authors:", error);
            $("#authorSelect").empty().append('<option value="0">Ошибка загрузки авторов</option>');
        });

    $("#authorSelect").on("change", function() {
        currentAuthorId = $(this).val();
        const workSelect = $("#workSelect");
        
        if (currentAuthorId == 0) {
            workSelect.prop("disabled", true).empty().append('<option value="0">Выберите автора сначала</option>');
            currentWorkId = 0;
            return;
        }
        
        fetch(`quotes.php?action=get_works&author_id=${currentAuthorId}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(works => {
                workSelect.empty().append('<option value="0">Все произведения</option>');
                
                if (works && works.length > 0) {
                    works.forEach(work => {
                        workSelect.append(`<option value="${work.id}">${work.title}</option>`);
                    });
                    workSelect.prop("disabled", false);
                } else {
                    workSelect.append('<option value="0">Нет произведений</option>');
                }
            })
            .catch(error => {
                console.error("Error loading works:", error);
                workSelect.empty().append('<option value="0">Ошибка загрузки</option>');
            });
    });

    $("#workSelect").on("change", function() {
        currentWorkId = $(this).val();
        loadQuote();
    });
}

function loadQuote() {
    let apiUrl = "quotes.php?action=get_quote";
    
    if (currentWorkId > 0) {
        apiUrl += `&work_id=${currentWorkId}`;
    } else if (currentAuthorId > 0) {
        apiUrl += `&author_id=${currentAuthorId}`;
    }
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data || !data.text) {
                throw new Error("Invalid quote data");
            }
            
            currentQuote = data.text;
            currentWorkTitle = data.title || "Не указано";
            currentAuthorName = data.author_name || "Не указан";
            $("#quote").text(currentQuote);
            $("#author-info").html(`${currentAuthorName} <span class="work-title">(${currentWorkTitle})</span>`);
            $("#intext").val("").prop("disabled", false).focus();
            resetStats();
        })
        .catch(error => {
            console.error("Error loading quote:", error);
            currentQuote = "Ошибка загрузки цитаты";
            currentWorkTitle = "Не указано";
            currentAuthorName = "Не указан";
            $("#quote").text(currentQuote);
            $("#author-info").text("");
            
            const backupQuotes = [
                "Нет ничего дороже родной земли",
                "Где тонко - там и рвётся",
                "Берегите честь смолоду"
            ];
            currentQuote = backupQuotes[Math.floor(Math.random() * backupQuotes.length)];
            $("#quote").text(currentQuote);
            $("#intext").val("").prop("disabled", false).focus();
        });
}

function resetStats() {
    startTime = new Date().getTime();
    erroneousPositions.clear();
    totalIncorrectChars = 0;
    maxTypedLengthReached = 0;
    $("#speed").text("0");
    $("#accuracy").text("0");
    startRealtimeUpdates();
}

function updateStats() {
    const typedText = $("#intext").val();

    if (typedText.length > maxTypedLengthReached) {
        maxTypedLengthReached = typedText.length;
    }

    for (let i = 0; i < typedText.length; i++) {
        if ((i < currentQuote.length && typedText[i] !== currentQuote[i]) || (i >= currentQuote.length && !erroneousPositions.has(i))) {
            if (!erroneousPositions.has(i)) {
                 totalIncorrectChars++;
            }
            erroneousPositions.add(i);
        }
    }

    const elapsed = (new Date().getTime() - startTime) / 1000 / 60;
    const speed = Math.round((typedText.length / (elapsed || 0.0001)));

    let accuracyPercentage = 100;
    if (maxTypedLengthReached > 0) {
        accuracyPercentage = Math.round((1 - (totalIncorrectChars / maxTypedLengthReached)) * 100);
        
        if (accuracyPercentage < 0) {
            accuracyPercentage = 0;
        }
    }
    
    $("#speed").text(speed);
    $("#accuracy").text(accuracyPercentage);
}

function startRealtimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(updateStats, 100);
}

function handleInput() {
    const typedText = $(this).val();
    
    if (typedText.length > currentQuote.length) {
        $(this).val(typedText.substring(0, currentQuote.length));
        return;
    }

    if (typedText === currentQuote) {
        clearInterval(updateInterval);
        
        const elapsed = (new Date().getTime() - startTime) / 1000 / 60;
        const speed = Math.round((typedText.length / elapsed) || 0);

        let finalAccuracyPercentage = 100;
        if (maxTypedLengthReached > 0) {
            finalAccuracyPercentage = Math.round((1 - (totalIncorrectChars / maxTypedLengthReached)) * 100);
            if (finalAccuracyPercentage < 0) {
                finalAccuracyPercentage = 0;
            }
        }

        addToHistory(speed, finalAccuracyPercentage);
        setTimeout(loadQuote, 1000);
    }
}

function addToHistory(speed, accuracy) {
    history.unshift({
        speed: speed,
        accuracy: accuracy,
        timestamp: new Date().toISOString(),
        quote: currentQuote,
        author: currentAuthorName,
        work: currentWorkTitle
    });
    
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem("typingHistory", JSON.stringify(history));
    updateHistoryTable();
}

function updateHistoryTable() {
    const tbody = $("#history tbody");
    tbody.empty();
    
    history.forEach((item, index) => {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleTimeString();
        
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.speed}</td>
                <td>${item.accuracy}%</td>
                <td>${timeString}</td>
                <td>${item.author}</td>
                <td>${item.work}</td>
            </tr>
        `;
        tbody.append(row);
    });
}

function clearHistory() {
    if (confirm("Вы уверены, что хотите очистить историю?")) {
        history = [];
        localStorage.removeItem("typingHistory");
        updateHistoryTable();
    }
}

