// statistics-dashboard.js - Displays weekly, monthly, and yearly stats with charts
(function(global) {
    'use strict';

    // Utility to compute mood counts per period
    function computeMoodSummary(entries, period) {
        const summary = {};
        const now = new Date();
        const start = new Date(now);

        if (period === 'week') {
            start.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            start.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
            start.setFullYear(now.getFullYear() - 1);
        }

        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= start && entryDate <= now) {
                const mood = entry.moodName || entry.mood || 'neutral';
                summary[mood] = (summary[mood] || 0) + 1;
            }
        });

        return summary;
    }

    // Component for a simple bar chart using Chart.js (loaded via CDN)
    function MoodBarChart({ data, title }) {
        const chartRef = React.useRef(null);

        React.useEffect(() => {
            if (!chartRef.current) return;
            const ctx = chartRef.current.getContext('2d');
            const labels = Object.keys(data);
            const values = Object.values(data);
            const colors = labels.map(label => {
                // match primary emotion color where possible
                return global.EMOTIONS_DATA[label]?.color || '#888';
            });

            // Destroy previous chart if exists
            if (chartRef.current._chart) {
                chartRef.current._chart.destroy();
            }

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Count',
                        data: values,
                        backgroundColor: colors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: title }
                    }
                }
            });

            chartRef.current._chart = chart;
        }, [data]);

        return React.createElement('canvas', { ref: chartRef, className: 'mood-bar-chart' });
    }

    // Statistics dashboard component
    function StatisticsDashboard({ entries }) {
        const [period, setPeriod] = React.useState('week');
        const summary = computeMoodSummary(entries, period);
        const totalEntries = entries.length;

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
                React.createElement(MoodBarChart, { data: summary, title: `Moods this ${period}` })
            ),
            React.createElement(
                'div',
                { className: 'stats-footer' },
                React.createElement('p', null, `Total entries: ${totalEntries}`)
            )
        );
    }

    global.StatisticsDashboard = StatisticsDashboard;

})(typeof window !== 'undefined' ? window : this);