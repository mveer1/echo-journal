// ════════════════════════════════════════════
// CHARTS
// ════════════════════════════════════════════

import { chartColors } from './utils.js';

export function createEmotionChart(entries) {
    const ctx = document.getElementById('emotion-chart');
    if (!ctx) return;
    // Destroy existing chart instance if any to avoid reuse errors (optional but good practice)
    // Since we are using global Chart.js, we don't have easy reference to instances unless we store them.
    // For now, assuming fresh canvas or Chart.js handles replacement if id matches.
    // Actually, Chart.js might overlay if not destroyed. 
    // A simple way is to clone the canvas node to clear it.
    const parent = ctx.parentNode;
    const newCanvas = ctx.cloneNode(true);
    ctx.remove();
    parent.appendChild(newCanvas);

    const counts = {};
    entries.forEach(e => e.emotions?.forEach(em => { counts[em] = (counts[em] || 0) + 1; }));
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#EDEAE5' : '#2D2A26';

    new Chart(newCanvas, {
        type: 'doughnut',
        data: {
            labels: sorted.map(([e]) => e),
            datasets: [{ data: sorted.map(([, c]) => c), backgroundColor: chartColors, borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 16 } } }
        }
    });
}

export function createWeeklyChart(entries) {
    const ctx = document.getElementById('weekly-chart');
    if (!ctx) return;

    const parent = ctx.parentNode;
    const newCanvas = ctx.cloneNode(true);
    ctx.remove();
    parent.appendChild(newCanvas);

    const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const data = last7.map(date => {
        const dayEntries = entries.filter(e => e.createdAt && e.createdAt.toDateString() === date.toDateString());
        return {
            date,
            stress: dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + (e.intensities?.stress || 5), 0) / dayEntries.length : 0,
            energy: dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + (e.intensities?.energy || 5), 0) / dayEntries.length : 0
        };
    });

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#9E99B5' : '#7A746B';
    const gridColor = isDark ? 'rgba(237,234,229,0.08)' : 'rgba(45,42,38,0.08)';

    new Chart(newCanvas, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [
                { label: 'Stress', data: data.map(d => d.stress), borderColor: '#D4726A', backgroundColor: 'rgba(212,114,106,0.1)', tension: 0.4, fill: true },
                { label: 'Energy', data: data.map(d => d.energy), borderColor: '#F4C95D', backgroundColor: 'rgba(244,201,93,0.1)', tension: 0.4, fill: true }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                y: { beginAtZero: true, max: 10, ticks: { color: textColor }, grid: { color: gridColor } },
                x: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        }
    });
}

export function createMoodCalendar(entries) {
    const calendar = document.getElementById('mood-calendar');
    if (!calendar) return;
    calendar.innerHTML = '';
    const today = new Date(), month = today.getMonth(), year = today.getFullYear();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const h = document.createElement('div');
        h.className = 'calendar-header';
        h.textContent = day;
        calendar.appendChild(h);
    });

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = date.getDate();
        if (date.getMonth() !== month) el.style.opacity = '0.3';
        const dayEntries = entries.filter(e => e.createdAt && e.createdAt.toDateString() === date.toDateString());
        if (dayEntries.length > 0) el.classList.add('has-entry');
        calendar.appendChild(el);
    }
}
