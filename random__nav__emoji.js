 // Случайный смайлик при наведении на меню
const emojis = ["😀", "😎", "😼", "😊", "🙀", "😉", "🐒", "🤔", "🐧", "🐺", "😐", "👽", "👾", "👻", "🐅", "🐉", "👀", "💥", "👈", "👍", "🌱", "💎", "💡", "✅", "🚀", "✨", "⚡"];
const links = document.querySelectorAll('.header__nav a');

links.forEach(link => {
  link.addEventListener('mouseenter', () => {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    link.setAttribute('data-emoji', randomEmoji);
  });
});
