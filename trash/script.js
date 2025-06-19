// Раскладка клавиатуры
const layout = [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '', 'Print Screen', 'Scroll Lock', 'Pause'],
    ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'Shift'],
    ['Ctrl', 'Fn', 'Alt', 'Space', 'Alt', 'Ctrl', '←', '↑', '→']
];

const keyboardContainer = document.getElementById('keyboard');

function createKeyboard() {
    keyboardContainer.innerHTML = '';
    let currentRow = 0;

    layout.forEach(row => {
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');

            // Добавляем классы для больших клавиш
            if (key === 'Space') {
                keyElement.classList.add('extra-large');
            } else if (key.length > 1 && !['Enter', 'Backspace'].includes(key)) {
                keyElement.classList.add('large');
            }

            // Добавляем текст на клавишу
            const keyText = document.createElement('span');
            keyText.textContent = key;

            // Добавляем вторую строку для русских символов
            const secondaryText = document.createElement('span');
            secondaryText.style.fontSize = '10px';
            secondaryText.textContent = getSecondarySymbol(key);

            keyElement.appendChild(keyText);
            keyElement.appendChild(secondaryText);

            keyboardContainer.appendChild(keyElement);
        });

        // Добавляем пустые ячейки для правильного расположения
        if (currentRow === 1) {
            for (let i = 0; i < 6; i++) {
                const emptyKey = document.createElement('div');
                emptyKey.classList.add('key');
                keyboardContainer.appendChild(emptyKey);
            }
        }

        currentRow++;
    });
}

// Функция для получения второго символа (русский)
function getSecondarySymbol(key) {
    const secondarySymbols = {
        '`': 'ё',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '0': '0',
        '-': '-',
        '=': '=',
        'Backspace': '',
        'Tab': 'Tab',
        'Q': 'й',
        'W': 'ц',
        'E': 'у',
        'R': 'к',
        'T': 'е',
        'Y': 'н',
        'U': 'г',
        'I': 'ш',
        'O': 'щ',
        'P': 'з',
        '[': 'х',
        ']': 'ъ',
        '\\': '\\',
        'Caps Lock': 'Caps Lock',
        'A': 'ф',
        'S': 'ы',
        'D': 'в',
        'F': 'а',
        'G': 'п',
        'H': 'р',
        'J': 'о',
        'K': 'л',
        'L': 'д',
        ';': 'ж',
        '"': 'э',
        'Enter': 'Enter',
        'Shift': 'Shift',
        'Z': 'я',
        'X': 'ч',
        'C': 'с',
        'V': 'м',
        'B': 'и',
        'N': 'т',
        'M': 'ь',
        ',': 'б',
        '.': 'ю',
        '/': '.',
        'Ctrl': 'Ctrl',
        'Fn': 'Fn',
        'Alt': 'Alt',
        'Space': 'Space',
        '←': '←',
        '↑': '↑',
        '→': '→'
    };

    return secondarySymbols[key] || '';
}

createKeyboard();

document.addEventListener('keydown', function(event) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        let keyText = key.querySelector('span').textContent.trim();
        if (keyText === event.code) {
            key.classList.add('pressed');
        }
    });
});

document.addEventListener('keyup', function(event) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        let keyText = key.querySelector('span').textContent.trim();
        if (keyText === event.code) {
            key.classList.remove('pressed');
        }
    });
});