// ════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════

export const emotionGroups = {
    joy: ["Happiness", "Excitement", "Contentment", "Bliss", "Elation", "Euphoria", "Delight"],
    sadness: ["Melancholy", "Grief", "Sorrow", "Despair", "Gloom", "Dejection", "Heartbreak"],
    anger: ["Frustration", "Rage", "Irritation", "Fury", "Resentment", "Indignation", "Annoyance"],
    fear: ["Anxiety", "Worry", "Panic", "Dread", "Terror", "Nervousness", "Apprehension"],
    love: ["Affection", "Compassion", "Tenderness", "Adoration", "Devotion", "Warmth", "Care"],
    surprise: ["Wonder", "Amazement", "Astonishment", "Curiosity", "Awe", "Bewilderment", "Shock"],
    disgust: ["Aversion", "Revulsion", "Contempt", "Loathing", "Distaste", "Repulsion", "Scorn"],
    calm: ["Peace", "Serenity", "Tranquility", "Relaxation", "Stillness", "Composure", "Balance"]
};

export const wellnessTips = [
    "Take three deep breaths before starting your day",
    "Gratitude can shift your perspective in moments",
    "Your feelings are valid and temporary",
    "Small steps lead to meaningful change",
    "Self-compassion is a form of strength",
    "Every emotion has something to teach you",
    "Progress isn't always linear, and that's okay",
    "Mindful moments can happen anywhere, anytime",
    "Your mental health matters as much as your physical health",
    "Reflection helps transform experience into wisdom"
];

export const journalPrompts = [
    "What emotions am I experiencing right now, and what might have triggered them?",
    "How did my body feel throughout the day, and what does it need?",
    "What am I grateful for in this moment?",
    "What patterns am I noticing in my thoughts and feelings?",
    "How can I show myself compassion today?",
    "What would I tell a friend experiencing what I'm going through?",
    "What do I need to let go of to move forward?",
    "How did I grow or learn something new today?"
];

export const chartColors = ['#7C6F9B', '#F4C95D', '#E8889B', '#87CEAB', '#6B9BD2', '#D4726A', '#F4A460', '#9B8EC4', '#8FBC8F', '#B8A9D6'];

// ════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════

export function calculateStreak(entries) {
    if (entries.length === 0) return 0;
    let streak = 0, checkDate = new Date();
    for (let i = 0; i < entries.length; i++) {
        const d = entries[i].createdAt;
        if (!d) continue;
        const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const checkDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        if (entryDay.getTime() === checkDay.getTime()) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
        else if (entryDay.getTime() < checkDay.getTime()) break;
    }
    return streak;
}

export function calculateAverageMood(entries) {
    if (entries.length === 0) return '—';
    const scores = { positive: 1, neutral: 0, negative: -1 };
    const avg = entries.reduce((s, e) => s + (scores[e.sentiment] || 0), 0) / entries.length;
    if (avg > 0.3) return '😊';
    if (avg < -0.3) return '😔';
    return '😐';
}

export function analyzeSentiment(text) {
    const positive = ['happy', 'joy', 'love', 'excited', 'grateful', 'peaceful', 'content', 'amazing', 'wonderful', 'great'];
    const negative = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'terrible', 'awful', 'hate', 'depressed'];
    const words = text.toLowerCase().split(/\s+/);
    let pos = 0, neg = 0;
    words.forEach(w => { if (positive.includes(w)) pos++; if (negative.includes(w)) neg++; });
    if (pos > neg) return 'positive';
    if (neg > pos) return 'negative';
    return 'neutral';
}
