
(function(global) {
    'use strict';
  
    // Initialize Chart.js and cache system
    const { Chart, registerables } = window;
    if (Chart && registerables) {
      Chart.register(...registerables);
    }
    const CHART_CACHE = {};
    console.log('Chart.js initialized:', !!Chart);
    // Helper to create/destroy charts safely
    function buildChart(canvas, config) {
      const id = canvas.id;
      if (CHART_CACHE[id]) {
        CHART_CACHE[id].destroy();
        delete CHART_CACHE[id];
      }
      CHART_CACHE[id] = new Chart(canvas, config);
      return CHART_CACHE[id];
    }
    console.log('Chart cache initialized:', CHART_CACHE);
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
  
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= now;
      });
  
      filteredEntries.forEach(entry => {
        // Support new emotion structure and legacy mood
        const mood = entry.emotion?.primary || entry.moodName || entry.mood || 'neutral';
        summary[mood] = (summary[mood] || 0) + 1;
      });
  
      return { counts: summary, filteredEntries };
    }
  
    // Enhanced component for multiple chart types
    function MoodChart({ data, title, type = 'bar' }) {
      const chartRef = React.useRef(null);
      const [isLoading, setIsLoading] = React.useState(true);
  
      React.useEffect(() => {
        console.log('MoodChart useEffect triggered');
        console.log('Chart ref:', chartRef.current);
        console.log('Data passed:', data);
        if (!chartRef.current || !data || Object.keys(data).length === 0) {
          setIsLoading(false);
          return;
        }
  
        const ctx = chartRef.current;
        console.log('Canvas context:', ctx);
        const labels = Object.keys(data);
        const values = Object.values(data);
        
        // Get colors from emotions data or use defaults
        const colors = labels.map(label => {
          if (global.EMOTIONS_DATA && global.EMOTIONS_DATA[label]) {
            return global.EMOTIONS_DATA[label].color;
          }
          // Fallback colors for legacy moods
          const colorMap = {
            happy: '#FFD700',
            sad: '#4682B4',
            angry: '#DC143C',
            anxious: '#9370DB',
            neutral: '#808080',
            excited: '#FF6347',
            tired: '#8B4513',
            stressed: '#FF4500'
          };
          return colorMap[label] || '#999999';
        });
  
        const chartConfig = {
          type: type,
          data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
              label: 'Count',
              data: values,
              backgroundColor: colors,
              borderColor: colors.map(color => color + '80'),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: type === 'pie' || type === 'doughnut',
                position: 'right'
              },
              title: {
                display: true,
                text: title,
                font: { size: 16, weight: 'bold' }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                  }
                }
              }
            },
            scales: type === 'bar' ? {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  font: { size: 11 }
                }
              }
            } : {}
          }
        };
  
        // Add doughnut-specific options
        if (type === 'doughnut') {
          chartConfig.options.cutout = '60%';
        }
  
        buildChart(ctx, chartConfig);
        setIsLoading(false);
      }, [data, type, title]);
  
      if (isLoading) {
        return React.createElement(
          'div',
          { className: 'chart-loading' },
          React.createElement('div', { className: 'spinner' })
        );
      }
  
      if (!data || Object.keys(data).length === 0) {
        return React.createElement(
          'div',
          { className: 'chart-empty' },
          React.createElement('p', null, 'No data available for this period')
        );
      }
  
      return React.createElement('canvas', { 
        ref: chartRef, 
        className: 'mood-chart',
        id: `chart-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  
    // Mood trend line chart
    function MoodTrendChart({ entries, period }) {
      const chartRef = React.useRef(null);
  
      React.useEffect(() => {
        if (!chartRef.current || !entries.length) return;
  
        const now = new Date();
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        const dates = [];
        const scores = [];
  
        // Generate date range
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
          
          // Find entries for this date and calculate average mood score
          const dayEntries = entries.filter(entry => entry.date === date.toISOString().split('T')[0]);
          if (dayEntries.length > 0) {
            const avgScore = dayEntries.reduce((sum, entry) => {
              return sum + (entry.emotion?.value || entry.moodValue || 5);
            }, 0) / dayEntries.length;
            scores.push(avgScore);
          } else {
            scores.push(null);
          }
        }
  
        buildChart(chartRef.current, {
          type: 'line',
          data: {
            labels: dates.map(date => new Date(date).toLocaleDateString('en', { 
              month: 'short', 
              day: 'numeric' 
            })),
            datasets: [{
              label: 'Mood Trend',
              data: scores,
              borderColor: '#32808d',
              backgroundColor: 'rgba(50, 128, 141, 0.1)',
              tension: 0.3,
              fill: true,
              spanGaps: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Mood Trend - Last ${period}`,
                font: { size: 16, weight: 'bold' }
              }
            },
            scales: {
              y: {
                min: 1,
                max: 10,
                title: {
                  display: true,
                  text: 'Mood Score'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              }
            }
          }
        });
      }, [entries, period]);
  
      return React.createElement('canvas', { 
        ref: chartRef, 
        className: 'trend-chart',
        id: `trend-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  
    // Main statistics dashboard component
    function StatisticsDashboard({ entries = [] }) {
      console.log('StatisticsDashboard entries:', entries);
      console.log('Entries length:', entries.length);
      const [period, setPeriod] = React.useState('week');
      const [chartType, setChartType] = React.useState('bar');
  
      const { counts: summary, filteredEntries } = computeMoodSummary(entries, period);
      const totalEntries = entries.length;
      const periodEntries = filteredEntries.length;
      console.log('Computed summary:', summary);
      console.log('Filtered entries:', filteredEntries);
      // Calculate additional stats
      const avgEntriesPerDay = period === 'week' ? (periodEntries / 7).toFixed(1) :
                             period === 'month' ? (periodEntries / 30).toFixed(1) :
                             (periodEntries / 365).toFixed(1);
  
      const mostCommonMood = Object.keys(summary).reduce((a, b) => 
        summary[a] > summary[b] ? a : b, Object.keys(summary)[0] || 'none'
      );
      

      return React.createElement(
        'div',
        { className: 'statistics-dashboard' },
        
        // Header with controls
        React.createElement(
          'div',
          { className: 'stats-header' },
          React.createElement('h2', { className: 'dashboard-title' }, 'Mood Insights Dashboard'),
          React.createElement(
            'div',
            { className: 'dashboard-controls' },
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
            ),
            React.createElement(
              'div',
              { className: 'chart-type-selector' },
              ['bar', 'pie', 'doughnut'].map(t =>
                React.createElement(
                  'button',
                  {
                    key: t,
                    className: `chart-type-button ${chartType === t ? 'active' : ''}`,
                    onClick: () => setChartType(t)
                  },
                  t.toUpperCase()
                )
              )
            )
          )
        ),
  
        // Stats summary
        React.createElement(
          'div',
          { className: 'stats-summary' },
          React.createElement(
            'div',
            { className: 'stat-card' },
            React.createElement('h3', null, periodEntries),
            React.createElement('p', null, `Entries this ${period}`)
          ),
          React.createElement(
            'div',
            { className: 'stat-card' },
            React.createElement('h3', null, avgEntriesPerDay),
            React.createElement('p', null, 'Avg per day')
          ),
          React.createElement(
            'div',
            { className: 'stat-card' },
            React.createElement('h3', null, mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1)),
            React.createElement('p', null, 'Most common mood')
          )
        ),
  
        // Main chart
        React.createElement(
          'div',
          { className: 'chart-container' },
          React.createElement(MoodChart, { 
            data: summary, 
            title: `Mood Distribution - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
            type: chartType
          })
        ),
  
        // Trend chart
        React.createElement(
          'div',
          { className: 'trend-container' },
          React.createElement(MoodTrendChart, { 
            entries: filteredEntries, 
            period: period
          })
        ),
  
        // Footer
        React.createElement(
          'div',
          { className: 'stats-footer' },
          React.createElement(
            'div',
            { className: 'footer-stats' },
            React.createElement('p', null, `Total lifetime entries: ${totalEntries}`),
            React.createElement('p', null, `Data range: ${period === 'week' ? 'Last 7 days' : 
              period === 'month' ? 'Last 30 days' : 'Last 365 days'}`)
          )
        )
      );
    }
  
    // Export components
    global.StatisticsDashboard = StatisticsDashboard;
    global.MoodChart = MoodChart;
    global.MoodTrendChart = MoodTrendChart;
    global.buildChart = buildChart; // Export helper for other components
  
  })(typeof window !== 'undefined' ? window : this);
  