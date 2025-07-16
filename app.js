// app.js - Mood Journal PWA (vanilla React with no build step)

(function () {

  // Alias React & ReactDOM from global scope
  const { useState, useEffect, useCallback } = React;
  
  /**************************** DATA *********************************/
  
  const moodOptions = [
    { emoji: "😊", name: "Happy", value: "happy" },
    { emoji: "😐", name: "Neutral", value: "neutral" },
    { emoji: "😢", name: "Sad", value: "sad" },
    { emoji: "😡", name: "Angry", value: "angry" },
    { emoji: "😴", name: "Tired", value: "tired" },
    { emoji: "😅", name: "Anxious", value: "anxious" },
    { emoji: "😰", name: "Stressed", value: "stressed" },
    { emoji: "😍", name: "Excited", value: "excited" },
  ];
  
  const prompts = [
    {
      id: "mood",
      question: "How are you feeling today?",
      title: "How are you feeling today?",
      subtitle: "Select the emoji that best represents your current mood",
      type: "mood",
      required: true,
    },
    {
      id: "recent",
      question: "What happened recently that influenced your mood?",
      title: "What happened recently?",
      subtitle: "Share something that influenced your mood today",
      type: "text",
      placeholder: "Tell me about your day...",
    },
    {
      id: "gratitude",
      question: "What's one thing you're grateful for?",
      title: "What are you grateful for?",
      subtitle: "Name one thing you appreciate today",
      type: "text",
      placeholder: "I'm grateful for...",
    },
    {
      id: "reflection",
      question: "Do you want to reflect on something?",
      title: "Want to reflect?",
      subtitle: "Any additional thoughts or feelings to explore? (Optional)",
      type: "text",
      placeholder: "Share your thoughts...",
      optional: true,
    },
  ];
  
  const sampleEntries = [
    {
      id: "1",
      date: "2025-07-12",
      mood: "😊",
      moodName: "Happy",
      responses: {
        recent: "Had a great meeting with my team today and we made significant progress on our project.",
        gratitude: "I'm grateful for my supportive colleagues and the opportunity to work on meaningful projects.",
        reflection: "I notice I feel most energized when I'm collaborating with others and solving complex problems.",
      },
      aiInsights: {
        summary: "Your entry shows high energy and satisfaction from teamwork and problem-solving.",
        mood: "Positive and collaborative",
        suggestions: [
          "Consider scheduling regular collaboration sessions",
          "Reflect on what specific aspects of problem-solving energize you most",
        ],
        affirmation: "You thrive in collaborative environments and your contributions make a real difference.",
      },
    },
    {
      id: "2",
      date: "2025-07-11",
      mood: "😐",
      moodName: "Neutral",
      responses: {
        recent: "Normal day at work, nothing particularly exciting or challenging.",
        gratitude: "I'm grateful for the stability and routine in my life.",
        reflection: "Sometimes I wish I had more variety in my daily routine.",
      },
      aiInsights: {
        summary: "A balanced day with appreciation for stability while seeking more variety.",
        mood: "Content but seeking stimulation",
        suggestions: [
          "Try adding one small new activity to your routine",
          "Consider what kind of variety would bring you joy",
        ],
        affirmation: "Stability is valuable, and it's natural to desire growth and new experiences.",
      },
    },
    {
      id: "3",
      date: "2025-07-10",
      mood: "😢",
      moodName: "Sad",
      responses: {
        recent: "Received some disappointing news about a project I was really looking forward to.",
        gratitude: "I'm grateful for the support of my friends during tough times.",
        reflection: "Disappointment is hard, but I know I'll bounce back stronger.",
      },
      aiInsights: {
        summary: "You're processing disappointment while maintaining perspective and gratitude.",
        mood: "Resilient despite setbacks",
        suggestions: [
          "Allow yourself to feel disappointed - it's a natural response",
          "Focus on the lessons learned and new opportunities ahead",
        ],
        affirmation: "Your resilience and positive outlook will help you navigate through this challenge.",
      },
    },
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
  
    if (prompt.type === "mood") {
      content = React.createElement(
        "div",
        { className: "mood-grid" }, // ✅ Updated class name
        moodOptions.map((m) =>
          React.createElement(
            "button", // ✅ Changed from div to button for better accessibility
            {
              key: m.value,
              className: `mood-emoji ${value === m.value ? "selected" : ""}`, // ✅ Updated class names
              onClick: () => onChange(m.value),
              "aria-label": m.name,
              tabIndex: 0,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(m.value);
                }
              },
            },
            m.emoji // ✅ Simplified to show only emoji (matches design)
          )
        )
      );
    } else {
      content = React.createElement("textarea", {
        className: "text-input", // ✅ Updated class name to match CSS
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
  
  // Updated Survey component with new components
  function JournalSurvey({ onSubmit, onCancel }) {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState({});
  
    const currentPrompt = prompts[step];
    const totalSteps = prompts.length;
    const isLastStep = step === totalSteps - 1;
  
    const handleChange = (value) => {
      setResponses((prev) => ({ ...prev, [currentPrompt.id]: value }));
    };
  
    const canProceed = () => {
      if (currentPrompt.required) {
        return Boolean(responses[currentPrompt.id]);
      }
      return true;
    };
  
    const handleNext = () => {
      if (isLastStep) {
        // Prepare entry
        const moodValue = responses.mood || "neutral";
        const moodObj = moodOptions.find((m) => m.value === moodValue) || {
          emoji: "😐",
          name: "Neutral",
        };
  
        const newEntry = {
          id: generateId(),
          date: getTodayISO(),
          mood: moodObj.emoji,
          moodName: moodObj.name,
          responses: {
            recent: responses.recent || "",
            gratitude: responses.gratitude || "",
            reflection: responses.reflection || "",
          },
          aiInsights: null, // to be filled later when AI enabled
        };
  
        onSubmit(newEntry);
      } else {
        setStep(step + 1);
      }
    };
  
    const handleSkip = () => {
      if (currentPrompt.optional) {
        setResponses(prev => ({ ...prev, [currentPrompt.id]: '' }));
        handleNext();
      }
    };
  
    const prev = () => {
      if (step === 0) {
        onCancel();
      } else {
        setStep(step - 1);
      }
    };
  
    return React.createElement(
      "div",
      { className: "survey-container" },
      React.createElement(ProgressBar, {
        current: step + 1,
        total: totalSteps
      }),
      React.createElement(Flashcard, {
        key: currentPrompt.id,
        prompt: currentPrompt,
        value: responses[currentPrompt.id] || "",
        onChange: handleChange,
        onNext: handleNext,
        onSkip: handleSkip,
        canSkip: currentPrompt.optional,
        isLast: isLastStep
      }),
      React.createElement(BottomActionBar, {
        onNext: handleNext,
        disabled: !canProceed(),
        isLast: isLastStep
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

    const [view, setView] = useState('welcome');
    const [entries, setEntries] = useState([]);
    const [prefs, setPrefs] = useState({ ai: true, notify: true });
    const [selectedEntry, setSelectedEntry] = useState(null);

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
      await storageService.updateEntryInsights(entryWithInsights.id, entryWithInsights.aiInsights);
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
  