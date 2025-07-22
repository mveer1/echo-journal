// app.js - Mood Journal PWA (vanilla React with no build step)

(function () {

  // Alias React & ReactDOM from global scope
  const { useState, useEffect, useCallback } = React;
  
  /**************************** DATA *********************************/
  
  // Replace lines 30-40 with this comprehensive emotions wheel data
const emotionsWheelData = {
  joy: {
    name: 'Joy',
    color: '#FFD700',
    intensities: ['serenity', 'joy', 'ecstasy'],
    specificEmotions: ['contentment', 'pleasure', 'bliss', 'euphoria']
  },
  trust: {
    name: 'Trust',
    color: '#90EE90',
    intensities: ['acceptance', 'trust', 'admiration'],
    specificEmotions: ['confidence', 'faith', 'respect', 'devotion']
  },
  fear: {
    name: 'Fear',
    color: '#9370DB',
    intensities: ['apprehension', 'fear', 'terror'],
    specificEmotions: ['anxiety', 'worry', 'dread', 'panic']
  },
  surprise: {
    name: 'Surprise',
    color: '#87CEEB',
    intensities: ['distraction', 'surprise', 'amazement'],
    specificEmotions: ['confusion', 'wonder', 'bewilderment', 'astonishment']
  },
  sadness: {
    name: 'Sadness',
    color: '#4682B4',
    intensities: ['pensiveness', 'sadness', 'grief'],
    specificEmotions: ['melancholy', 'sorrow', 'despair', 'anguish']
  },
  disgust: {
    name: 'Disgust',
    color: '#DDA0DD',
    intensities: ['boredom', 'disgust', 'loathing'],
    specificEmotions: ['dislike', 'revulsion', 'contempt', 'hatred']
  },
  anger: {
    name: 'Anger',
    color: '#FF6347',
    intensities: ['annoyance', 'anger', 'rage'],
    specificEmotions: ['irritation', 'frustration', 'fury', 'wrath']
  },
  anticipation: {
    name: 'Anticipation',
    color: '#FFA500',
    intensities: ['interest', 'anticipation', 'vigilance'],
    specificEmotions: ['curiosity', 'excitement', 'eagerness', 'alertness']
  }
};

// Add wellness metrics configuration
const wellnessMetrics = [
  { id: 'stress', label: 'Stress Level', color: '#FF6B6B', min: 'Very Relaxed', max: 'Very Stressed' },
  { id: 'anxiety', label: 'Anxiety Level', color: '#4ECDC4', min: 'Very Calm', max: 'Very Anxious' },
  { id: 'energy', label: 'Energy Level', color: '#45B7D1', min: 'Very Low', max: 'Very High' },
  { id: 'motivation', label: 'Motivation Level', color: '#96CEB4', min: 'Very Low', max: 'Very High' },
  { id: 'social', label: 'Social Connection', color: '#FFEAA7', min: 'Very Isolated', max: 'Very Connected' }
];

// Add evidence-based journaling prompts
const journalingPrompts = [
  {
    category: 'gratitude',
    questions: [
      'List three things you\'re grateful for today and why they matter to you.',
      'Describe a person who made a positive impact on your day.',
      'What small moment today brought you joy or peace?'
    ]
  },
  {
    category: 'coping',
    questions: [
      'What challenges are you facing right now and how are you managing them?',
      'Describe a time today when you felt strong or capable.',
      'What coping strategies worked well for you this week?'
    ]
  },
  {
    category: 'growth',
    questions: [
      'What did you learn about yourself today?',
      'Describe a moment when you felt proud of how you handled a situation.',
      'What would you like to improve about how you respond to stress?'
    ]
  },
  {
    category: 'future',
    questions: [
      'What are you looking forward to that brings you hope?',
      'How do you want to feel tomorrow, and what can help you get there?',
      'What positive changes would you like to see in your life this month?'
    ]
  }
];

const prompts = [
  {
    id: "emotions",
    question: "How are you feeling today?",
    title: "Select Your Primary Emotion",
    subtitle: "Choose the emotion that best represents how you're feeling right now",
    type: "emotionsWheel",
    required: true,
  },
  {
    id: "wellness",
    question: "How are your wellness levels today?",
    title: "Wellness Check-in",
    subtitle: "Rate your current levels on these wellness dimensions",
    type: "wellnessSliders",
    required: true,
  },
  {
    id: "journaling",
    question: "Would you like to reflect on your day?",
    title: "Reflection Time",
    subtitle: "Take a moment to write about your thoughts and feelings",
    type: "journaling",
    optional: true,
  }
];

  
  /**************************** UTILITIES *********************************/
  
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  function getTodayISO() {
    return new Date().toISOString().split("T")[0];
  }
  
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**************************** COMPONENTS *********************************/
  
  // Theme Toggle Component - NEW
  function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
  
    useEffect(() => {
      document.body.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);
  
    return React.createElement(
      "button",
      {
        className: "theme-toggle",
        onClick: () => setIsDark(!isDark),
        "aria-label": "Toggle dark mode"
      },
      isDark ? '🌞' : '🌙'
    );
  }
  
  // Progress Bar Component - NEW
  function ProgressBar({ current, total }) {
    const percentage = (current / total) * 100;
    
    return React.createElement(
      "div",
      { className: "progress-bar" },
      React.createElement("div", {
        className: "progress-fill",
        style: { width: `${percentage}%` }
      })
    );
  }
  
  // Bottom Navigation
  function BottomNav({ current, onNavigate }) {
    const navItems = [
      { id: "journal", icon: "📓", label: "Journal" },
      { id: "history", icon: "📅", label: "History" },
      { id: "insights", icon: "📊", label: "Insights" },
      { id: "settings", icon: "⚙️", label: "Settings" },
    ];
    
  
    return React.createElement(
      "nav",
      { className: "bottom-nav" },
      navItems.map((item) =>
        React.createElement(
          "button",
          {
            key: item.id,
            className: `nav-item ${current === item.id ? "active" : ""}`,
            onClick: () => onNavigate(item.id),
            "aria-label": item.label,
          },
          React.createElement("span", { className: "nav-icon" }, item.icon),
          React.createElement("span", { className: "nav-text" }, item.label)
        )
      )
    );
  }

  // Add Emotions Wheel Component
function EmotionsWheel({ value, onChange }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedSpecific, setSelectedSpecific] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEmotionSelect = (emotionKey) => {
    setSelectedEmotion(emotionKey);
    setSelectedSpecific(null);
  };

  const handleSpecificSelect = (specific, intensity) => {
    setSelectedSpecific(specific);
    onChange({
      primary: selectedEmotion,
      specific: specific,
      intensity: intensity,
      value: emotionsWheelData[selectedEmotion].intensities.indexOf(intensity) + 1
    });
  };

  return React.createElement(
    'div',
    { className: 'emotions-wheel-container' },
    React.createElement(
      'div',
      { className: 'emotions-wheel' },
      Object.entries(emotionsWheelData).map(([key, emotion], index) =>
        React.createElement(
          'div',
          {
            key: key,
            className: `emotion-segment ${selectedEmotion === key ? 'selected' : ''}`,
            style: {
              '--emotion-color': emotion.color,
              '--angle': `${index * 45}deg`,
              transform: `rotate(${index * 45}deg)`
            },
            onClick: () => handleEmotionSelect(key)
          },
          React.createElement('div', { className: 'emotion-name' }, emotion.name)
        )
      ),
      React.createElement(
        'div',
        { className: 'wheel-center' },
        selectedEmotion ? emotionsWheelData[selectedEmotion].name : 'Select an emotion'
      )
    ),
    selectedEmotion && React.createElement(
      'div',
      { className: 'intensity-levels' },
      React.createElement('h4', { className: 'intensity-title' }, 'Choose specific feeling:'),
      React.createElement(
        'div',
        { className: 'intensity-emotions' },
        emotionsWheelData[selectedEmotion].specificEmotions.map((specific, index) =>
          React.createElement(
            'button',
            {
              key: specific,
              className: `specific-emotion ${selectedSpecific === specific ? 'selected' : ''}`,
              style: { backgroundColor: emotionsWheelData[selectedEmotion].color },
              onClick: () => handleSpecificSelect(specific, emotionsWheelData[selectedEmotion].intensities[Math.floor(index / 2) + 1])
            },
            specific
          )
        )
      )
    )
  );
}

// Add Wellness Sliders Component
function WellnessSliders({ value, onChange }) {
  const [values, setValues] = useState(value || {});

  const handleSliderChange = (metricId, newValue) => {
    const updated = { ...values, [metricId]: parseInt(newValue) };
    setValues(updated);
    onChange(updated);
  };

  return React.createElement(
    'div',
    { className: 'wellness-sliders' },
    wellnessMetrics.map(metric =>
      React.createElement(
        'div',
        { key: metric.id, className: 'wellness-slider' },
        React.createElement(
          'div',
          { className: 'slider-header' },
          React.createElement('h4', null, metric.label),
          React.createElement('div', { className: 'slider-description' }, `Rate from 1-10`)
        ),
        React.createElement(
          'div',
          { className: 'slider-container' },
          React.createElement(
            'div',
            { className: 'slider-labels' },
            React.createElement('span', null, metric.min),
            React.createElement('span', null, metric.max)
          ),
          React.createElement('input', {
            type: 'range',
            min: 1,
            max: 10,
            value: values[metric.id] || 5,
            onChange: (e) => handleSliderChange(metric.id, e.target.value),
            className: 'wellness-range-input',
            style: { '--slider-color': metric.color }
          }),
          React.createElement('div', { className: 'slider-value' }, values[metric.id] || 5)
        )
      )
    )
  );
}

// Add Enhanced Journaling Component
function EnhancedJournaling({ value, onChange }) {
  const [responses, setResponses] = useState(value || {});
  const [currentPrompts, setCurrentPrompts] = useState([]);

  useEffect(() => {
    // Select random prompts from different categories
    const selected = journalingPrompts.map(category => {
      const randomIndex = Math.floor(Math.random() * category.questions.length);
      return {
        category: category.category,
        question: category.questions[randomIndex]
      };
    });
    setCurrentPrompts(selected.slice(0, 3)); // Show 3 prompts
  }, []);

  const handleResponseChange = (category, response) => {
    const updated = { ...responses, [category]: response };
    setResponses(updated);
    onChange(updated);
  };

  return React.createElement(
    'div',
    { className: 'journal-questions' },
    currentPrompts.map(prompt =>
      React.createElement(
        'div',
        { key: prompt.category, className: 'journal-question' },
        React.createElement('label', { className: 'question-label' }, prompt.question),
        React.createElement('textarea', {
          className: 'journal-textarea',
          value: responses[prompt.category] || '',
          onChange: (e) => handleResponseChange(prompt.category, e.target.value),
          placeholder: 'Write your thoughts here...',
          rows: 4
        })
      )
    )
  );
}

// Add Statistics Dashboard Component
function StatisticsDashboard({ entries }) {
  const [period, setPeriod] = useState('week');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (entries.length > 0) {
      generateChartData();
    }
  }, [entries, period]);

  const generateChartData = () => {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredEntries = entries.filter(entry => 
      new Date(entry.date) >= startDate
    );

    const emotionCounts = {};
    filteredEntries.forEach(entry => {
      const emotion = entry.emotion?.primary || entry.moodName || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(emotionCounts),
      datasets: [{
        label: 'Mood Frequency',
        data: Object.values(emotionCounts),
        backgroundColor: Object.keys(emotionCounts).map(emotion => 
          emotionsWheelData[emotion]?.color || '#gray'
        )
      }]
    });
  };

  useEffect(() => {
    if (chartData && window.Chart) {
      const ctx = document.getElementById('moodChart');
      if (ctx) {
        new window.Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Mood Patterns - Last ${period}`
              }
            }
          }
        });
      }
    }
  }, [chartData]);

  return React.createElement(
    'div',
    { className: 'statistics-dashboard' },
    React.createElement(
      'div',
      { className: 'stats-header' },
      React.createElement('h2', null, 'Mood Insights'),
      React.createElement(
        'div',
        { className: 'period-selector' },
        ['week', 'month', 'year'].map(p =>
          React.createElement(
            'button',
            {
              key: p,
              className: `period-button ${period === p ? 'active' : ''}`,
              onClick: () => setPeriod(p)
            },
            p.charAt(0).toUpperCase() + p.slice(1)
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'chart-container' },
      React.createElement('canvas', { id: 'moodChart', className: 'mood-bar-chart' })
    ),
    React.createElement(
      'div',
      { className: 'stats-footer' },
      `Total entries: ${entries.length}`
    )
  );
}

  
  // Welcome screen
  function Welcome({ onStart, onHistory }) {
    return React.createElement(
      "div",
      { className: "page welcome-screen" },
      React.createElement("div", { className: "welcome-emoji" }, "🌤️"),
      React.createElement(
        "h1",
        { className: "page-title" },
        "Mood Journal"
      ),
      React.createElement(
        "p",
        { className: "page-subtitle" },
        "Capture your feelings, practice gratitude, and grow each day."
      ),
      React.createElement(
        "div",
        { className: "welcome-buttons" },
        React.createElement(
          "button",
          {
            className: "btn btn--primary btn--full-width",
            onClick: onStart,
          },
          "Start Journaling"
        ),
        React.createElement(
          "button",
          {
            className: "btn btn--secondary btn--full-width",
            onClick: onHistory,
          },
          "View History"
        )
      )
    );
  }
  
  // Updated Flashcard component with glass morphism and proper centering
  function Flashcard({ prompt, value, onChange, onNext, onSkip, canSkip = false, isLast = false }) {
    const commonProps = {
      required: prompt.required,
      id: prompt.id,
    };
  
    let content = null;
  
    if (prompt.type === "emotionsWheel") {
      content = React.createElement(EmotionsWheel, {
        value: value,
        onChange: onChange
      });
    } else if (prompt.type === "wellnessSliders") {
      content = React.createElement(WellnessSliders, {
        value: value,
        onChange: onChange
      });
    } else if (prompt.type === "journaling") {
      content = React.createElement(EnhancedJournaling, {
        value: value,
        onChange: onChange
      });
    } else {
      // Keep existing textarea logic
      content = React.createElement("textarea", {
        className: "text-input",
        placeholder: prompt.placeholder || "",
        value: value || "",
        onChange: (e) => onChange(e.target.value),
        rows: 3,
        ...commonProps
      });
    }

  
    return React.createElement(
      "div",
      { className: "fullscreen-center" }, // ✅ Added proper centering wrapper
      React.createElement(
        "div",
        { className: "card-container glass-card fade-in" }, // ✅ Updated with glass morphism classes
        React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            { className: "card-title" }, // ✅ Updated class name
            prompt.title || prompt.question
          ),
          prompt.subtitle && React.createElement(
            "p",
            { className: "card-subtitle" }, // ✅ Added subtitle support
            prompt.subtitle
          ),
          content
        ),
        
        // ✅ Added skip button section
        React.createElement(
          "div",
          { 
            style: { 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '1rem' 
            } 
          },
          canSkip && React.createElement(
            "button",
            { 
              className: "skip-button",
              onClick: onSkip
            },
            "Skip"
          ),
          React.createElement("div", { style: { flex: 1 } })
        ),
        
        // ✅ Added swipe hint
        React.createElement(
          "div",
          { className: "swipe-hint" },
          "Swipe left to continue →"
        )
      )
    );
  }
  
  // Bottom Action Bar Component - NEW
  function BottomActionBar({ onNext, disabled, isLast }) {
    return React.createElement(
      "div",
      { className: "bottom-action-bar" },
      React.createElement(
        "button",
        {
          className: "glass-button",
          onClick: onNext,
          disabled: disabled,
          style: { opacity: disabled ? 0.5 : 1 }
        },
        isLast ? 'Complete' : 'Next'
      )
    );
  }
  
  /* ──────────────────────────────────────────────
   JournalSurvey 2.0
   – Handles wheel ➜ sliders ➜ journaling prompts
   – Produces a single entry object that is
     fully compatible with the Firebase schema
────────────────────────────────────────────── */

function JournalSurvey({ onSubmit, onCancel }) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});

  /* prompts is the new 3-step array you added:
     0 → emotionsWheel   1 → wellnessSliders   2 → journaling         */
  const currentPrompt = prompts[step];
  const totalSteps    = prompts.length;
  const isLastStep    = step === totalSteps - 1;

  /* ----------------------------- helpers ---------------------------- */
  const handleChange = (value) => {
    setResponses((prev) => ({ ...prev, [currentPrompt.id]: value }));
  };

  const canProceed = () =>
    !currentPrompt.required || Boolean(responses[currentPrompt.id]);

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastStep) {
      /* ---------- create entry compatible with Firestore ---------- */
      const newEntry = {
        id:         generateId(),
        date:       getTodayISO(),
        emotion:    responses.emotions  || null,        // wheel payload
        wellness:   responses.wellness  || {},          // sliders object
        journalResponses: responses.journaling || {},   // prompt answers

        /* legacy fields kept for backward-compat graphs & AI */
        mood:     responses.emotions?.primary  || '😐',
        moodName: responses.emotions?.specific || 'neutral',
        responses: responses.journaling || {},
        aiInsights: null
      };

      onSubmit(newEntry);
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    if (currentPrompt.optional) {
      setResponses((prev) => ({ ...prev, [currentPrompt.id]: '' }));
      handleNext();
    }
  };

  const handleBack = () => {
    step === 0 ? onCancel() : setStep(step - 1);
  };

  /* ----------------------------- render ---------------------------- */
  return React.createElement(
    'div',
    { className: 'survey-container' },

    /* progress bar */
    React.createElement(ProgressBar, {
      current: step + 1,
      total:   totalSteps
    }),

    /* card with the active question UI */
    React.createElement(Flashcard, {
      key:       currentPrompt.id,
      prompt:    currentPrompt,
      value:     responses[currentPrompt.id] || '',
      onChange:  handleChange,
      onNext:    handleNext,
      onSkip:    handleSkip,
      canSkip:   currentPrompt.optional,
      isLast:    isLastStep,
      onBack:    handleBack               // enable ⬅ navigation
    }),

    /* bottom “Next / Submit” bar */
    React.createElement(BottomActionBar, {
      onNext:   handleNext,
      disabled: !canProceed(),
      isLast:   isLastStep,
      onBack:   handleBack
    })
  );
}

  
  // AI Insights simulated component
  function AIInsights({ entry, onDone }) {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState(null);
  
    useEffect(() => {
      // Simulate asynchronous AI processing
      const timer = setTimeout(() => {
        const simulatedInsights = {
          summary: `It seems you are feeling ${entry.moodName.toLowerCase()} today. Your journal reflects your thoughts on the recent events and gratitude towards life.`,
          mood: entry.moodName,
          suggestions: [
            "Take a short walk to clear your mind.",
            "Practice 5 minutes of mindfulness meditation.",
          ],
          affirmation: "You are capable of handling everything that comes your way.",
        };
  
        setInsights(simulatedInsights);
        setLoading(false);
      }, 1500);
  
      return () => clearTimeout(timer);
    }, [entry]);
  
    const handleDone = () => {
      // Pass the entry with insights back to parent
      const entryWithInsights = { ...entry, aiInsights: insights };
      onDone(entryWithInsights);
    };
  
    if (loading) {
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement(
          "h2",
          { className: "page-title" },
          "Generating AI Insights..."
        ),
        React.createElement(
          "div",
          { className: "loading" },
          React.createElement("div", { className: "spinner", role: "status" })
        )
      );
    }
  
    return React.createElement(
      "div",
      { className: "page" },
      React.createElement("h2", { className: "page-title" }, "AI Insights"),
      React.createElement(
        "div",
        { className: "ai-insights" },
        React.createElement(InsightCard, {
          title: "Summary",
          icon: "📝",
          content: insights.summary,
        }),
        React.createElement(InsightCard, {
          title: "Mood Analysis",
          icon: "🙂",
          content: insights.mood,
        }),
        React.createElement(InsightCard, {
          title: "Suggestions",
          icon: "💡",
          suggestions: insights.suggestions,
        }),
        React.createElement(InsightCard, {
          title: "Affirmation",
          icon: "✨",
          content: insights.affirmation,
        }),
        React.createElement(
          "button",
          {
            className: "btn btn--primary btn--full-width mt-8",
            onClick: handleDone,
          },
          "Done"
        )
      )
    );
  }
  
  function InsightCard({ title, icon, content, suggestions }) {
    return React.createElement(
      "div",
      { className: "insight-card" },
      React.createElement(
        "div",
        { className: "insight-header" },
        React.createElement("span", { className: "insight-icon" }, icon),
        React.createElement("h3", { className: "insight-title" }, title)
      ),
      content && React.createElement(
        "p",
        { className: "insight-content" },
        content
      ),
      suggestions &&
        React.createElement(
          "ul",
          { className: "insight-suggestions" },
          suggestions.map((s, idx) =>
            React.createElement("li", { key: idx }, s)
          )
        )
    );
  }
  
  // History list view
  function HistoryList({ entries, onEntryClick }) {
    if (entries.length === 0) {
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement("h2", { className: "page-title" }, "No Entries Yet"),
        React.createElement(
          "p",
          { className: "page-subtitle" },
          "Start journaling to see your mood history here."
        )
      );
    }
  
    return React.createElement(
      "div",
      { className: "history-entries" },
      entries.map((e) =>
        React.createElement(
          "div",
          {
            key: e.id,
            className: "history-entry",
            onClick: () => onEntryClick(e),
          },
          React.createElement(
            "div",
            { className: "entry-header" },
            React.createElement(
              "div",
              { className: "entry-mood" },
              React.createElement(
                "span",
                { className: "entry-emoji" },
                e.mood
              ),
              React.createElement(
                "span",
                { className: "entry-mood-name" },
                e.moodName
              )
            ),
            React.createElement(
              "span",
              { className: "entry-date" },
              formatDate(e.date)
            )
          ),
          React.createElement(
            "p",
            { className: "entry-preview" },
            e.responses.recent || e.responses.gratitude || "(No details)"
          )
        )
      )
    );
  }
  
  // Entry detail view
  function EntryDetail({ entry, onBack }) {
    return React.createElement(
      "div",
      { className: "page" },
      React.createElement(
        "button",
        {
          className: "btn btn--secondary mb-8",
          onClick: onBack,
        },
        "← Back"
      ),
      React.createElement(
        "h2",
        { className: "page-title" },
        `${entry.mood} ${entry.moodName}`
      ),
      React.createElement(
        "p",
        { className: "page-subtitle" },
        formatDate(entry.date)
      ),
      React.createElement(
        "div",
        { className: "mt-8" },
        React.createElement(
          "h3",
          { className: "settings-title" },
          "Journal Responses"
        ),
        Object.entries(entry.responses).map(([k, v]) =>
          v
            ? React.createElement(
                "div",
                { key: k, className: "mb-8" },
                React.createElement("strong", null, k.charAt(0).toUpperCase() + k.slice(1) + ": "),
                React.createElement("p", null, v)
              )
            : null
        )
      ),
      entry.aiInsights &&
        React.createElement(
          "div",
          { className: "ai-insights mt-8" },
          React.createElement(
            "h3",
            { className: "settings-title" },
            "AI Insights"
          ),
          React.createElement(InsightCard, {
            title: "Summary",
            icon: "📝",
            content: entry.aiInsights.summary,
          }),
          React.createElement(InsightCard, {
            title: "Mood Analysis",
            icon: "🙂",
            content: entry.aiInsights.mood,
          }),
          React.createElement(InsightCard, {
            title: "Suggestions",
            icon: "💡",
            suggestions: entry.aiInsights.suggestions,
          }),
          React.createElement(InsightCard, {
            title: "Affirmation",
            icon: "✨",
            content: entry.aiInsights.affirmation,
          })
        )
    );
  }
  
  // Settings component
  function Settings({ prefs, onToggle }) {
    return React.createElement(
      "div",
      { className: "page" },
      React.createElement("h2", { className: "page-title" }, "Settings"),
      React.createElement("div", { className: "settings-section" },
        React.createElement("h3", { className: "settings-title" }, "Preferences"),
        React.createElement(SettingToggle, {
          label: "Enable AI Insights",
          description: "Receive AI-generated reflections after each entry.",
          enabled: prefs.ai,
          onToggle: () => onToggle("ai"),
        }),
        React.createElement(SettingToggle, {
          label: "Daily Notifications",
          description: "Get a reminder each evening to journal your mood.",
          enabled: prefs.notify,
          onToggle: () => onToggle("notify"),
        })
      ),
      React.createElement("div", { className: "settings-section" },
        React.createElement("h3", { className: "settings-title" }, "About"),
        React.createElement(
          "p",
          { className: "setting-description" },
          "Mood Journal is a simple, private app to help you track your emotions, practice gratitude, and reflect on your daily experiences."
        )
      )
    );
  }
  
  function SettingToggle({ label, description, enabled, onToggle }) {
    return React.createElement(
      "div",
      { className: "setting-item" },
      React.createElement(
        "div",
        null,
        React.createElement("div", { className: "setting-label" }, label),
        React.createElement(
          "div",
          { className: "setting-description" },
          description
        )
      ),
      React.createElement(
        "div",
        {
          className: `toggle ${enabled ? "active" : ""}`,
          role: "switch",
          "aria-checked": enabled,
          tabIndex: 0,
          onClick: onToggle,
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") onToggle();
          },
        },
        React.createElement("span", { className: "toggle-thumb" })
      )
    );
  }
  
  /**************************** MAIN APP *********************************/
  function App() {
    /* ------------------------- SERVICES ------------------------- */
    // Firebase services (already initialized by firebase-init.js)
    const [authService] = useState(() => new FirebaseAuthService());
    const [storageService] = useState(() => new FirebaseStorageService());
    /* ------------------------- STATE ------------------------- */
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    console.log('App loading state:', loading);
    const [view, setView] = useState('welcome');
    const [entries, setEntries] = useState([]);
    const [prefs, setPrefs] = useState({ ai: true, notify: true });
    const [selectedEntry, setSelectedEntry] = useState(null);
    
    console.log('App initialized with currentUser:', currentUser);
    
    /* -------------------- SERVICE WORKER (unchanged) ------------------- */
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        const swCode = `
          self.addEventListener('install', e => self.skipWaiting());
          self.addEventListener('activate', e => self.clients.claim());
          self.addEventListener('fetch', e => {
            e.respondWith(
              caches.match(e.request).then(r => r || fetch(e.request))
            );
          });
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).catch(() => {});
      }
    }, []);

    /* -------------- AUTH OBSERVER + INITIAL DATA LOAD -------------- */
    useEffect(() => {
      // Subscribe to Firebase auth changes
      const unsub = authService.onAuthStateChanged(async user => {
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          // Load user prefs & entries
          const userPrefs = await authService.getUserPreferences(user.uid);
          setPrefs(userPrefs);
          const userEntries = await storageService.getUserEntries(user.uid);
          setEntries(userEntries);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setEntries([]);
        }
        setLoading(false);
      });
      return () => unsub && unsub();
    }, [authService, storageService]);

    /* -------------------- AUTH HANDLERS -------------------- */
    const handleAuthSuccess = async user => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      const userEntries = await storageService.getUserEntries(user.id);
      setEntries(userEntries);
      setView('welcome');
    };

    const handleLogout = async () => {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEntries([]);
      setView('auth');
    };

    /* -------------------- JOURNAL HANDLERS -------------------- */
    const printCurrentUser = () => {
      if (currentUser) {
        console.log(`Current User: ${currentUser.displayName || 'Anonymous'}`);
        console.log(`User ID: ${currentUser.uid}`);
      } else {
        console.log('No user is currently logged in.');
      }
    };

    printCurrentUser();
    const startJournal = () => setView('journal');

    const handleSurveySubmit = async entry => {
      console.log('Entry object before saving:', entry);
      console.log('MoodValue:', entry.moodValue);
      // Save to Firestore
      const result = await storageService.saveEntry(currentUser.uid, entry);
      if (result.success) {
        entry.id = result.id;
        const newEntries = [entry, ...entries];
        setEntries(newEntries);
        if (prefs.ai) {
          setSelectedEntry(entry);
          setView('ai');
        } else {
          setView('history');
        }
      }
    };

    const handleAIComplete = async entryWithInsights => {
      // Update entry with insights
      await storageService.updateEntryInsights(currentUser.uid, entryWithInsights.id, entryWithInsights.aiInsights);
      const newEntries = [entryWithInsights, ...entries.filter(e => e.id !== entryWithInsights.id)];
      setEntries(newEntries);
      setSelectedEntry(null);
      setView('history');
    };

    const togglePref = key => {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      authService.updateUserPreferences(updated);
    };

    const onNavigate = id => {
      setSelectedEntry(null);
      setView(id);
    };

    const onEntryClick = entry => {
      setSelectedEntry(entry);
      setView('entry-detail');
    };

    /* -------------------- RENDER LOGIC -------------------- */
    if (loading) {
      return React.createElement('div', { className: 'app' }, React.createElement('div', { className: 'loading' }, 'Loading...'));
    }

    if (!isAuthenticated) {
      return React.createElement('div', { className: 'app' }, React.createElement(AuthContainer, {
        authService: authService,
        onAuthSuccess: handleAuthSuccess
      }));
    }

    let pageContent = null;
    switch (view) {
      case 'welcome':
        pageContent = React.createElement(Welcome, { onStart: startJournal, onHistory: () => setView('history') });
        break;
      case 'journal':
        pageContent = React.createElement(JournalSurvey, { onSubmit: handleSurveySubmit, onCancel: () => setView('welcome') });
        break;
      case 'ai':
        pageContent = React.createElement(AIInsights, { entry: selectedEntry, onDone: handleAIComplete });
        break;
      case 'insights':
        pageContent = React.createElement(StatisticsDashboard, { entries: entries });
        break;        
      case 'history':
        pageContent = React.createElement('div', { className: 'page' }, React.createElement('h2', { className: 'page-title' }, 'History'), React.createElement(HistoryList, { entries: entries, onEntryClick: onEntryClick }));
        break;
      case 'entry-detail':
        pageContent = React.createElement(EntryDetail, { entry: selectedEntry, onBack: () => setView('history') });
        break;
      case 'analytics':
        pageContent = React.createElement(MoodAnalytics, { userId: currentUser.uid, storageService: storageService });
        break;
      case 'settings':
        pageContent = React.createElement(Settings, { prefs: prefs, onToggle: togglePref });
        break;
      default:
        pageContent = React.createElement(Welcome, { onStart: startJournal, onHistory: () => setView('history') });
    }

    return React.createElement('div', { className: 'app' }, React.createElement(ThemeToggle), pageContent, view !== 'welcome' && view !== 'journal' && view !== 'ai' && React.createElement(BottomNav, { current: view, onNavigate }));
  }
  
  /**************************** RENDER *********************************/
  
  // Load React from CDN
  if (typeof React === 'undefined') {
    const script1 = document.createElement('script');
    script1.src = 'https://unpkg.com/react@18/umd/react.development.js';
    script1.crossOrigin = 'anonymous';
    document.head.appendChild(script1);
  
    const script2 = document.createElement('script');
    script2.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
    script2.crossOrigin = 'anonymous';
    document.head.appendChild(script2);
  
    script2.onload = () => {
      const root = ReactDOM.createRoot(document.getElementById("app"));
      root.render(React.createElement(App));
    };
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      const root = ReactDOM.createRoot(document.getElementById("app"));
      root.render(React.createElement(App));
    });
  }
  
  })();
  