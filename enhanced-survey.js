// enhanced-survey.js - Enhanced journaling survey with emotions wheel, sliders, and therapeutic questions
(function(global) {
    'use strict';

    // Enhanced journaling questions based on research
    const JOURNALING_QUESTIONS = [
        {
            id: 'current_thoughts',
            question: 'What thoughts are occupying your mind right now?',
            placeholder: 'Share whatever comes to mind, without judgment...',
            type: 'textarea',
            category: 'present_moment'
        },
        {
            id: 'energy_levels',
            question: 'What has been giving you energy today? What has been draining it?',
            placeholder: 'Reflect on the activities, people, or situations that affected your energy...',
            type: 'textarea',
            category: 'self_awareness'
        },
        {
            id: 'gratitude',
            question: 'List three things you are grateful for today, and why.',
            placeholder: 'Even small things count - a good cup of coffee, a kind gesture, a moment of peace...',
            type: 'textarea',
            category: 'gratitude'
        },
        {
            id: 'challenges',
            question: 'What challenges are you facing right now? How are you coping?',
            placeholder: 'Describe any difficulties and the strategies you are using to manage them...',
            type: 'textarea',
            category: 'coping'
        },
        {
            id: 'self_care',
            question: 'What does your body and mind need right now for self-care?',
            placeholder: 'Consider what would make you feel more balanced, peaceful, or energized...',
            type: 'textarea',
            category: 'self_care'
        },
        {
            id: 'growth_moment',
            question: 'Describe a moment today when you felt proud of yourself or overcame something difficult.',
            placeholder: 'Celebrate your wins, no matter how small...',
            type: 'textarea',
            category: 'growth'
        },
        {
            id: 'relationships',
            question: 'How are your relationships affecting your mood? Who brings you joy?',
            placeholder: 'Reflect on your connections with others and their impact on your wellbeing...',
            type: 'textarea',
            category: 'relationships'
        },
        {
            id: 'future_hopes',
            question: 'What are you looking forward to? What gives you hope?',
            placeholder: 'Think about upcoming events, goals, or possibilities that excite you...',
            type: 'textarea',
            category: 'future'
        }
    ];

    // Stress and anxiety questions with context
    const WELLNESS_METRICS = [
        {
            id: 'stress_level',
            question: 'Current stress level',
            description: 'How stressed do you feel right now?',
            min: 1,
            max: 10,
            labels: ['Very relaxed', 'Somewhat stressed', 'Very stressed'],
            color: '#FF6B6B'
        },
        {
            id: 'anxiety_level',
            question: 'Anxiety level',
            description: 'How anxious or worried are you feeling?',
            min: 1,
            max: 10,
            labels: ['Very calm', 'Somewhat anxious', 'Very anxious'],
            color: '#4ECDC4'
        },
        {
            id: 'energy_level',
            question: 'Energy level',
            description: 'How energetic do you feel?',
            min: 1,
            max: 10,
            labels: ['Very tired', 'Moderate energy', 'Very energetic'],
            color: '#45B7D1'
        },
        {
            id: 'motivation_level',
            question: 'Motivation level',
            description: 'How motivated do you feel to tackle your day?',
            min: 1,
            max: 10,
            labels: ['Not motivated', 'Moderately motivated', 'Very motivated'],
            color: '#96CEB4'
        },
        {
            id: 'social_connection',
            question: 'Social connection',
            description: 'How connected do you feel to others?',
            min: 1,
            max: 10,
            labels: ['Very isolated', 'Somewhat connected', 'Very connected'],
            color: '#FFEAA7'
        }
    ];

    // Slider component for wellness metrics
    function WellnessSlider({ metric, value, onChange }) {
        return React.createElement(
            'div',
            { className: 'wellness-slider' },
            React.createElement(
                'div',
                { className: 'slider-header' },
                React.createElement(
                    'h4',
                    { className: 'slider-title' },
                    metric.question
                ),
                React.createElement(
                    'p',
                    { className: 'slider-description' },
                    metric.description
                )
            ),
            React.createElement(
                'div',
                { className: 'slider-container' },
                React.createElement(
                    'div',
                    { className: 'slider-labels' },
                    React.createElement(
                        'span',
                        { className: 'slider-label-left' },
                        metric.labels[0]
                    ),
                    React.createElement(
                        'span',
                        { className: 'slider-label-right' },
                        metric.labels[2]
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'slider-input-container' },
                    React.createElement(
                        'input',
                        {
                            type: 'range',
                            min: metric.min,
                            max: metric.max,
                            value: value || 5,
                            onChange: (e) => onChange(metric.id, parseInt(e.target.value)),
                            className: 'wellness-range-input',
                            style: {
                                '--slider-color': metric.color
                            }
                        }
                    ),
                    React.createElement(
                        'div',
                        { 
                            className: 'slider-value',
                            style: { color: metric.color }
                        },
                        value || 5
                    )
                )
            )
        );
    }

    // Enhanced Survey Component
    function EnhancedSurvey({ onComplete, onBack }) {
        const [currentStep, setCurrentStep] = React.useState(0);
        const [selectedEmotion, setSelectedEmotion] = React.useState(null);
        const [wellnessMetrics, setWellnessMetrics] = React.useState({});
        const [journalResponses, setJournalResponses] = React.useState({});
        const [selectedQuestions, setSelectedQuestions] = React.useState([]);

        // Initialize with 3 random questions from different categories
        React.useEffect(() => {
            const categories = ['gratitude', 'self_awareness', 'present_moment'];
            const selected = [];
            
            categories.forEach(category => {
                const categoryQuestions = JOURNALING_QUESTIONS.filter(q => q.category === category);
                if (categoryQuestions.length > 0) {
                    const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
                    selected.push(randomQuestion);
                }
            });
            
            // Add 2 more random questions from any category
            const remaining = JOURNALING_QUESTIONS.filter(q => !selected.includes(q));
            for (let i = 0; i < 2 && remaining.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * remaining.length);
                selected.push(remaining.splice(randomIndex, 1)[0]);
            }
            
            setSelectedQuestions(selected);
        }, []);

        const handleEmotionSelect = (emotion) => {
            setSelectedEmotion(emotion);
        };

        const handleWellnessChange = (metricId, value) => {
            setWellnessMetrics(prev => ({
                ...prev,
                [metricId]: value
            }));
        };

        const handleJournalResponse = (questionId, response) => {
            setJournalResponses(prev => ({
                ...prev,
                [questionId]: response
            }));
        };

        const handleNext = () => {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            } else {
                handleComplete();
            }
        };

        const handlePrevious = () => {
            if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
            } else {
                onBack();
            }
        };

        const handleComplete = () => {
            const surveyData = {
                emotion: selectedEmotion,
                wellness: wellnessMetrics,
                journalResponses: journalResponses,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            };

            // Calculate overall mood score
            const moodScore = selectedEmotion ? selectedEmotion.value : 5;
            const wellnessAvg = Object.values(wellnessMetrics).reduce((a, b) => a + b, 0) / Object.values(wellnessMetrics).length || 5;
            const overallScore = Math.round((moodScore + wellnessAvg) / 2);

            const entry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                mood: selectedEmotion?.primary || 'neutral',
                moodName: selectedEmotion?.specific || 'neutral',
                moodValue: overallScore,
                emotion: selectedEmotion,
                responses: {
                    wellness: wellnessMetrics,
                    journal: journalResponses
                },
                timestamp: new Date().toISOString()
            };

            onComplete(entry);
        };

        const canProceed = () => {
            switch (currentStep) {
                case 0:
                    return selectedEmotion !== null;
                case 1:
                    return Object.keys(wellnessMetrics).length >= 3;
                case 2:
                    return Object.keys(journalResponses).length >= 2;
                case 3:
                    return Object.keys(journalResponses).length >= 3;
                default:
                    return false;
            }
        };

        const renderStep = () => {
            switch (currentStep) {
                case 0:
                    return React.createElement(
                        'div',
                        { className: 'survey-step' },
                        React.createElement(
                            'div',
                            { className: 'step-header' },
                            React.createElement(
                                'h2',
                                null,
                                'How are you feeling?'
                            ),
                            React.createElement(
                                'p',
                                null,
                                'Select the emotion that best describes your current state'
                            )
                        ),
                        React.createElement(global.EmotionsWheel, {
                            onEmotionSelect: handleEmotionSelect,
                            selectedEmotion: selectedEmotion
                        }),
                        React.createElement(global.EmotionSearch, {
                            onEmotionSelect: handleEmotionSelect,
                            selectedEmotion: selectedEmotion
                        })
                    );

                case 1:
                    return React.createElement(
                        'div',
                        { className: 'survey-step' },
                        React.createElement(
                            'div',
                            { className: 'step-header' },
                            React.createElement(
                                'h2',
                                null,
                                'Wellness Check-in'
                            ),
                            React.createElement(
                                'p',
                                null,
                                'Rate your current levels on these important wellness metrics'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'wellness-sliders' },
                            WELLNESS_METRICS.map(metric =>
                                React.createElement(WellnessSlider, {
                                    key: metric.id,
                                    metric: metric,
                                    value: wellnessMetrics[metric.id],
                                    onChange: handleWellnessChange
                                })
                            )
                        )
                    );

                case 2:
                    return React.createElement(
                        'div',
                        { className: 'survey-step' },
                        React.createElement(
                            'div',
                            { className: 'step-header' },
                            React.createElement(
                                'h2',
                                null,
                                'Reflection Questions'
                            ),
                            React.createElement(
                                'p',
                                null,
                                'Take a moment to reflect on these questions. Answer at least 2 that resonate with you.'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'journal-questions' },
                            selectedQuestions.slice(0, 3).map(question =>
                                React.createElement(
                                    'div',
                                    { key: question.id, className: 'journal-question' },
                                    React.createElement(
                                        'h4',
                                        { className: 'question-title' },
                                        question.question
                                    ),
                                    React.createElement(
                                        'textarea',
                                        {
                                            placeholder: question.placeholder,
                                            value: journalResponses[question.id] || '',
                                            onChange: (e) => handleJournalResponse(question.id, e.target.value),
                                            className: 'journal-textarea',
                                            rows: 4
                                        }
                                    )
                                )
                            )
                        )
                    );

                case 3:
                    return React.createElement(
                        'div',
                        { className: 'survey-step' },
                        React.createElement(
                            'div',
                            { className: 'step-header' },
                            React.createElement(
                                'h2',
                                null,
                                'Additional Reflections'
                            ),
                            React.createElement(
                                'p',
                                null,
                                'Optional: Share more about your thoughts and feelings'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'journal-questions' },
                            selectedQuestions.slice(3).map(question =>
                                React.createElement(
                                    'div',
                                    { key: question.id, className: 'journal-question' },
                                    React.createElement(
                                        'h4',
                                        { className: 'question-title' },
                                        question.question
                                    ),
                                    React.createElement(
                                        'textarea',
                                        {
                                            placeholder: question.placeholder,
                                            value: journalResponses[question.id] || '',
                                            onChange: (e) => handleJournalResponse(question.id, e.target.value),
                                            className: 'journal-textarea',
                                            rows: 4
                                        }
                                    )
                                )
                            )
                        )
                    );

                default:
                    return null;
            }
        };

        return React.createElement(
            'div',
            { className: 'enhanced-survey' },
            React.createElement(
                'div',
                { className: 'survey-progress' },
                React.createElement(
                    'div',
                    { className: 'progress-bar' },
                    React.createElement(
                        'div',
                        { 
                            className: 'progress-fill',
                            style: { width: `${((currentStep + 1) / 4) * 100}%` }
                        }
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'progress-text' },
                    `Step ${currentStep + 1} of 4`
                )
            ),
            renderStep(),
            React.createElement(
                'div',
                { className: 'survey-navigation' },
                React.createElement(
                    'button',
                    {
                        onClick: handlePrevious,
                        className: 'nav-button secondary'
                    },
                    currentStep === 0 ? 'Back' : 'Previous'
                ),
                React.createElement(
                    'button',
                    {
                        onClick: handleNext,
                        className: `nav-button primary ${canProceed() ? '' : 'disabled'}`,
                        disabled: !canProceed()
                    },
                    currentStep === 3 ? 'Complete' : 'Next'
                )
            )
        );
    }

    // Export to global scope
    global.EnhancedSurvey = EnhancedSurvey;
    global.JOURNALING_QUESTIONS = JOURNALING_QUESTIONS;
    global.WELLNESS_METRICS = WELLNESS_METRICS;

})(typeof window !== 'undefined' ? window : this);