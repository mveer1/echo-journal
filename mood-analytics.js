// mood-analytics.js - Mood analytics and insights component
(function(global) {
    'use strict';

    const { Chart, registerables } = window;
    Chart.register(...registerables);
    const CHART_CACHE = {};               // {canvasId: ChartInstance}
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

    // Mood Summary Card Component - Enhanced with Doughnut Chart
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
        joy: '😊',
        trust: '😌',
        fear: '😰',
        surprise: '😲',
        sadness: '😢',
        disgust: '🤢',
        anger: '😡',
        anticipation: '😤',
        happy: '😊',
        excited: '😍',
        neutral: '😐',
        tired: '😴',
        sad: '😢',
        angry: '😡',
        anxious: '😅',
        stressed: '😰'
        };
    
        // Create Chart after render
        React.useEffect(() => {
        const ctx = document.getElementById('summaryPie');
        if (!ctx) return;
    
        const labels = Object.keys(data.moodCounts);
        const values = Object.values(data.moodCounts);
        const colors = labels.map(mood => 
            global.EMOTIONS_DATA && global.EMOTIONS_DATA[mood] 
            ? global.EMOTIONS_DATA[mood].color 
            : '#999'
        );
    
        buildChart(ctx, {
            type: 'doughnut',
            data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                    size: 12
                    }
                }
                },
                tooltip: {
                callbacks: {
                    label: function(context) {
                    const percentage = ((context.parsed / data.totalEntries) * 100).toFixed(1);
                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
                }
            },
            cutout: '55%'
            }
        });
        }, [data]);
    
        return React.createElement(
        'div',
        { className: 'analytics-card mood-summary-card' },
        React.createElement('h3', { className: 'card-title' }, 'Weekly Mood Summary'),
        React.createElement(
            'div',
            { className: 'summary-content' },
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
            { className: 'chart-wrapper' },
            React.createElement('canvas', { 
                id: 'summaryPie', 
                className: 'summary-chart'
            })
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

    // Create Chart after render
    React.useEffect(() => {
        const ctx = document.getElementById('trendLine');
        if (!ctx || !dayPatterns.length) return;

        // Prepare data for chart
        const labels = dayPatterns.map(p => p.label || p.day);
        const values = dayPatterns.map(p => p.score || p.value);

        buildChart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Pattern',
                    data: values,
                    borderColor: '#32808d',
                    backgroundColor: 'rgba(50, 128, 141, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Mood Patterns'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }, [dayPatterns]);

    return React.createElement(
        'div',
        { className: 'analytics-card patterns-card' },
        React.createElement('h3', { className: 'card-title' }, 'Mood Patterns'),
        React.createElement('canvas', { 
            id: 'trendLine', 
            height: '200',
            style: { maxHeight: '200px' }
        })
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
    // ---------- helper to create/destroy charts ----------
    function buildChart(canvas, config) {
        const id = canvas.id;
        if (CHART_CACHE[id]) {
            CHART_CACHE[id].destroy();
        }
        CHART_CACHE[id] = new Chart(canvas, config);
    }

    // Export to global scope
    global.MoodAnalytics = MoodAnalytics;
    global.MoodSummaryCard = MoodSummaryCard;
    global.MoodPatternsCard = MoodPatternsCard;
    global.ConsistencyCard = ConsistencyCard;
    global.InsightsCard = InsightsCard;

})(typeof window !== 'undefined' ? window : this);