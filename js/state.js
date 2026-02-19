// ════════════════════════════════════════════
// STATE MANAGEMENT
// ════════════════════════════════════════════

const state = {
    currentUser: null,
    selectedEmotions: [],
    currentStep: 1,
    journalData: {
        emotions: [],
        intensities: { stress: 5, energy: 5, social: 5, physical: 5, clarity: 5 },
        text: ''
    }
};

export const getState = () => state;

export const setCurrentUser = (user) => {
    state.currentUser = user;
};

export const setSelectedEmotions = (emotions) => {
    state.selectedEmotions = emotions;
};

export const setCurrentStep = (step) => {
    state.currentStep = step;
};

export const updateJournalData = (updates) => {
    state.journalData = { ...state.journalData, ...updates };
};

export const resetState = () => {
    state.currentStep = 1;
    state.selectedEmotions = [];
    state.journalData = {
        emotions: [],
        intensities: { stress: 5, energy: 5, social: 5, physical: 5, clarity: 5 },
        text: ''
    };
};

// Export individual getters for convenience if needed, 
// but direct state access via getState() is usually sufficient for this size.
