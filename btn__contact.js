// Функция для блика внутри кнопки Узнать Сейчас
const button = document.querySelector('.btn__contact');

button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Устанавливаем CSS-переменные для позиции блика
    button.style.setProperty('--x', `${x}px`);
    button.style.setProperty('--y', `${y}px`);
});