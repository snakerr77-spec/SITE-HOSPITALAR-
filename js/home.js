const counters = document.querySelectorAll('[data-count]');
const runCounter = (el) => {
  const target = Number(el.dataset.count);
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 65));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString('pt-BR');
  }, 18);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-count]').forEach(runCounter);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.35 });

document.querySelectorAll('.stats').forEach((section) => observer.observe(section));

document.querySelectorAll('.module-card').forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, #fff4f5, #fff 42%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '#fff';
  });
});
