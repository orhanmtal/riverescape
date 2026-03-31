document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const heroImg = document.querySelector('#main-hero-img');

    // Sticky Header effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.9)';
            header.style.padding = '0.5rem 0';
        } else {
            header.style.background = 'rgba(30, 41, 59, 0.7)';
            header.style.padding = '0';
        }
    });

    // Tilt effect on hero image (parallax-ish)
    window.addEventListener('mousemove', (e) => {
        if (!heroImg) return;
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        heroImg.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
    });

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .gameplay-text, .gameplay-img').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});
