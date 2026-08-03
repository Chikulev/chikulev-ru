document.addEventListener('DOMContentLoaded', () => {
    // 1. Плавное появление элементов (работает на всех страницах)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
});

// 2. Лоадер: Эффект диафрагмы (только привязка к портрету)
const hole = document.getElementById('intro-hole');
const photo = document.querySelector('.irl__photo');

if (hole) {
    // Если портрета нет ИЛИ страница уже отскроллена вниз — убиваем лоадер мгновенно
    if (!photo || window.scrollY > 50) {
        hole.remove();
    } else {
        // Мы на самом верху и портрет есть. Блокируем скролл и ждем загрузки фото.
        document.body.style.overflow = 'hidden';

        window.addEventListener('load', () => {
            const rect = photo.getBoundingClientRect();
            
            // Финальная проверка: точно ли фото сейчас на экране?
            const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);

            if (isVisible) {
                // Целимся ровно в центр фотографии
                let x = rect.left + rect.width / 2;
                let y = rect.top + rect.height / 2;

                hole.style.left = `${x}px`;
                hole.style.top = `${y}px`;
                hole.classList.add('open-iris');

                setTimeout(() => {
                    hole.classList.add('expand');
                    document.body.style.overflow = ''; // Возвращаем скролл
                    setTimeout(() => hole.remove(), 500);
                }, 100);
            } else {
                // Если вдруг фото всё-таки не видно — снимаем блокировку и удаляем
                document.body.style.overflow = '';
                hole.remove();
            }
        });
    }
}