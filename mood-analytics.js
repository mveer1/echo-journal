// mood-analytics.js - Mood analytics and insights component
(function(global) {
    'use strict';

    const { useState, useEffect } = React;

    // Mood Analytics Dashboard Component
    function MoodAnalytics({ userId, storageService }) {
        const [weeklyData, setWeeklyData] = useState(null);
        const [patterns, setPatterns] = useState(null);
        const [loading, setLoading] = useState(true);
        const [selectedPeriod, setSelectedPeriod] = useState('week');

        useEffect(() => {
            if (userId && storageService) {
                loadAnalytics();
            }
        }, [userId, storageService, selectedPeriod]);

        const loadAnalytics = async () => {
            setLoading(true);
            try {
                const [weeklyData, patterns] = await Promise.all([
                    storageService.getWeeklyMoodSummary(userId),
                    storageService.getMoodPatterns(userId, selectedPeriod === 'week' ? 7 : 30)
                ]);

                setWeeklyData(weeklyData);
                setPatterns(patterns);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (loading) {
            return React.createElement(LoadingSpinner);
        }

        return React.createElement(
            'div',
            { className: 'mood-analytics' },
            React.createElement(
                'div',
                { className: 'analytics-header' },
                React.createElement('h2', { className: 'page-title' }, 'Mood Analytics'),
                React.createElement(PeriodSelector, {
                    selected: selectedPeriod,
                    onChange: setSelectedPeriod
                })
            ),
            React.createElement(MoodSummaryCard, { data: weeklyData }),
            React.createElement(MoodPatternsCard, { patterns: patterns }),
            React.createElement(ConsistencyCard, { 
                score: patterns?.consistencyScore || 0,
                totalEntries: weeklyData?.totalEntries || 0 
            }),
            React.createElement(InsightsCard, { insights: patterns?.insights || [] })
        );
    }

    // Period Selector Component
    function PeriodSelector({ selected, onChange }) {
        const periods = [
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' }
        ];

        return React.createElement(
            'div',
            { className: 'period-selector' },
            periods.map(period =>
                React.createElement(
                    'button',
                    {
                        key: period.value,
                        className: `period-button ${selected === period.value ? 'active' : ''}`,
                        onClick: () => onChange(period.value)
                    },
                    period.label
                )
            )
        );
    }

    // Mood Summary Card Component
    function MoodSummaryCard({ data }) {
        if (!data || data.totalEntries === 0) {
            return React.createElement(
                'div',
                { className: 'analytics-card' },
                React.createElement('h3', { className: 'card-title' }, 'Weekly Summary'),
                React.createElement('p', { className: 'empty-state' }, 'No entries yet. Start journaling to see your mood patterns!')
            );
        }

        const moodEmojis = {
            happy: '😊',
            excited: '😍',
            neutral: '😐',
            tired: '😴',
            sad: '😢',
            angry: '😡',
            anxious: '😅',
            stressed: '😰'
        };

        return React.createElement(
            'div',
            { className: 'analytics-card mood-summary-card' },
            React.createElement('h3', { className: 'card-title' }, 'Weekly Mood Summary'),
            React.createElement(
                'div',
                { className: 'mood-stats' },
                React.createElement(
                    'div',
                    { className: 'stat-item' },
                    React.createElement('span', { className: 'stat-number' }, data.totalEntries),
                    React.createElement('span', { className: 'stat-label' }, 'Total Entries')
                ),
                React.createElement(
                    'div',
                    { className: 'stat-item' },
                    React.createElement('span', { className: 'stat-emoji' }, moodEmojis[data.dominantMood] || '😐'),
                    React.createElement('span', { className: 'stat-label' }, 'Dominant Mood')
                )
            ),
            React.createElement(
                'div',
                { className: 'mood-breakdown' },
                React.createElement('h4', { className: 'breakdown-title' }, 'Mood Breakdown'),
                React.createElement(
                    'div',
                    { className: 'mood-bars' },
                    Object.entries(data.moodCounts).map(([mood, count]) =>
                        React.createElement(MoodBar, {
                            key: mood,
                            mood: mood,
                            count: count,
                            total: data.totalEntries,
                            emoji: moodEmojis[mood] || '😐'
                        })
                    )
                )
            )
        );
    }

    // Mood Bar Component
    function MoodBar({ mood, count, total, emoji }) {
        const percentage = (count / total) * 100;
        
        return React.createElement(
            'div',
            { className: 'mood-bar' },
            React.createElement(
                'div',
                { className: 'mood-bar-header' },
                React.createElement('span', { className: 'mood-emoji' }, emoji),
                React.createElement('span', { className: 'mood-name' }, mood.charAt(0).toUpperCase() + mood.slice(1)),
                React.createElement('span', { className: 'mood-count' }, count)
            ),
            React.createElement(
                'div',
                { className: 'mood-bar-track' },
                React.createElement('div', {
                    className: 'mood-bar-fill',
                    style: { width: `${percentage}%` }
                })
            )
        );
    }

    // Mood Patterns Card Component
    function MoodPatternsCard({ patterns }) {
        if (!patterns || patterns.patterns.length === 0) {
            return React.createElement(
                'div',
                { className: 'analytics-card' },
                React.createElement('h3', { className: 'card-title' }, 'Mood Patterns'),
                React.createElement('p', { className: 'empty-state' }, 'Not enough data to show patterns yet.')
            );
        }

        const dayPatterns = patterns.patterns.filter(p => p.type === 'day-of-week');

        return React.createElement(
            'div',
            { className: 'analytics-card patterns-card' },
            React.createElement('h3', { className: 'card-title' }, 'Mood Patterns'),
            React.createElement(
                'div',
                { className: 'patterns-grid' },
                dayPatterns.map(pattern =>
                    React.createElement(
                        'div',
                        { key: pattern.day, className: 'pattern-item' },
                        React.createElement('div', { className: 'pattern-day' }, pattern.day),
                        React.createElement('div', { className: 'pattern-mood' }, pattern.dominantMood),
                        React.createElement('div', { className: 'pattern-count' }, `${pattern.count} entries`)
                    )
                )
            )
        );
    }

    // Consistency Card Component
    function ConsistencyCard({ score, totalEntries }) {
        const getConsistencyMessage = (score) => {
            if (score >= 80) return 'Excellent consistency! Keep it up!';
            if (score >= 60) return 'Good consistency. Try to journal more regularly.';
            if (score >= 40) return 'Moderate consistency. Consider setting a daily reminder.';
            return 'Low consistency. Try to journal more frequently for better insights.';
        };

        const getConsistencyColor = (score) => {
            if (score >= 80) return 'var(--color-success)';
            if (score >= 60) return 'var(--color-warning)';
            return 'var(--color-error)';
        };

        return React.createElement(
            'div',
            { className: 'analytics-card consistency-card' },
            React.createElement('h3', { className: 'card-title' }, 'Journaling Consistency'),
            React.createElement(
                'div',
                { className: 'consistency-score' },
                React.createElement(
                    'div',
                    { className: 'score-circle' },
                    React.createElement('svg', { width: 80, height: 80, viewBox: '0 0 80 80' },
                        React.createElement('circle', {
                            cx: 40,
                            cy: 40,
                            r: 35,
                            fill: 'none',
                            stroke: 'var(--color-secondary)',
                            strokeWidth: 8
                        }),
                        React.createElement('circle', {
                            cx: 40,
                            cy: 40,
                            r: 35,
                            fill: 'none',
                            stroke: getConsistencyColor(score),
                            strokeWidth: 8,
                            strokeDasharray: `${2 * Math.PI * 35}`,
                            strokeDashoffset: `${2 * Math.PI * 35 * (1 - score / 100)}`,
                            style: { transition: 'stroke-dashoffset 0.5s ease' }
                        })
                    ),
                    React.createElement('div', { className: 'score-text' }, `${score}%`)
                ),
                React.createElement(
                    'div',
                    { className: 'consistency-details' },
                    React.createElement('p', { className: 'consistency-message' }, getConsistencyMessage(score)),
                    React.createElement('p', { className: 'consistency-entries' }, `${totalEntries} entries recorded`)
                )
            )
        );
    }

    // Insights Card Component
    function InsightsCard({ insights }) {
        if (!insights || insights.length === 0) {
            return React.createElement(
                'div',
                { className: 'analytics-card' },
                React.createElement('h3', { className: 'card-title' }, 'Insights'),
                React.createElement('p', { className: 'empty-state' }, 'No insights available yet.')
            );
        }

        return React.createElement(
            'div',
            { className: 'analytics-card insights-card' },
            React.createElement('h3', { className: 'card-title' }, 'Personal Insights'),
            React.createElement(
                'div',
                { className: 'insights-list' },
                insights.map((insight, index) =>
                    React.createElement(
                        'div',
                        { key: index, className: 'insight-item' },
                        React.createElement('span', { className: 'insight-icon' }, '💡'),
                        React.createElement('span', { className: 'insight-text' }, insight)
                    )
                )
            )
        );
    }

    // Loading Spinner Component
    function LoadingSpinner() {
        return React.createElement(
            'div',
            { className: 'loading-container' },
            React.createElement('div', { className: 'spinner' })
        );
    }

    // Export to global scope
    global.MoodAnalytics = MoodAnalytics;
    global.MoodSummaryCard = MoodSummaryCard;
    global.MoodPatternsCard = MoodPatternsCard;
    global.ConsistencyCard = ConsistencyCard;
    global.InsightsCard = InsightsCard;

})(typeof window !== 'undefined' ? window : this);