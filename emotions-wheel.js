// emotions-wheel.js - Fixed Plutchik Emotions Wheel
(function(global) {
    'use strict';
  
    // Plutchik's 8 primary emotions with proper colors and intensities
    const EMOTIONS_DATA = {
      joy: {
        color: '#FFD700',
        name: 'Joy',
        mild: ['contentment', 'pleasure', 'satisfaction'],
        moderate: ['happiness', 'cheerfulness', 'delight'],
        intense: ['ecstasy', 'bliss', 'euphoria']
      },
      trust: {
        color: '#90EE90',
        name: 'Trust',
        mild: ['acceptance', 'tolerance', 'openness'],
        moderate: ['trust', 'confidence', 'faith'],
        intense: ['devotion', 'worship', 'admiration']
      },
      fear: {
        color: '#9370DB',
        name: 'Fear',
        mild: ['concern', 'unease', 'nervousness'],
        moderate: ['fear', 'anxiety', 'worry'],
        intense: ['terror', 'panic', 'dread']
      },
      surprise: {
        color: '#FF6347',
        name: 'Surprise',
        mild: ['uncertainty', 'confusion', 'perplexity'],
        moderate: ['surprise', 'amazement', 'wonder'],
        intense: ['astonishment', 'bewilderment', 'shock']
      },
      sadness: {
        color: '#4682B4',
        name: 'Sadness',
        mild: ['gloominess', 'melancholy', 'pensiveness'],
        moderate: ['sadness', 'sorrow', 'grief'],
        intense: ['anguish', 'despair', 'hopelessness']
      },
      disgust: {
        color: '#8B4513',
        name: 'Disgust',
        mild: ['dislike', 'aversion', 'distaste'],
        moderate: ['disgust', 'revulsion', 'contempt'],
        intense: ['loathing', 'hatred', 'abhorrence']
      },
      anger: {
        color: '#DC143C',
        name: 'Anger',
        mild: ['annoyance', 'irritation', 'agitation'],
        moderate: ['anger', 'frustration', 'resentment'],
        intense: ['rage', 'fury', 'wrath']
      },
      anticipation: {
        color: '#FFA500',
        name: 'Anticipation',
        mild: ['interest', 'expectancy', 'alertness'],
        moderate: ['anticipation', 'eagerness', 'hope'],
        intense: ['vigilance', 'excitement', 'enthusiasm']
      }
    };
  
    // Fixed EmotionsWheel component
    function EmotionsWheel({ onEmotionSelect, selectedEmotion = null }) {
      const [hoveredEmotion, setHoveredEmotion] = React.useState(null);
      const [selectedIntensity, setSelectedIntensity] = React.useState('moderate');
  
      const handleEmotionClick = (emotionKey, specificEmotion, intensity) => {
        const emotionData = {
          primary: emotionKey,
          primaryName: EMOTIONS_DATA[emotionKey].name,
          specific: specificEmotion,
          intensity: intensity,
          color: EMOTIONS_DATA[emotionKey].color,
          value: intensity === 'mild' ? 3 : intensity === 'moderate' ? 6 : 9
        };
        onEmotionSelect(emotionData);
      };
  
      const renderEmotionSegment = (emotionKey, index) => {
        const emotion = EMOTIONS_DATA[emotionKey];
        const angle = index * 45; // 8 emotions, 45 degrees each
        const isSelected = selectedEmotion?.primary === emotionKey;
        const isHovered = hoveredEmotion === emotionKey;
  
        return React.createElement(
          'div',
          {
            key: emotionKey,
            className: `emotion-segment ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`,
            style: {
              '--emotion-color': emotion.color,
              '--angle': `${angle}deg`,
              transform: `rotate(${angle}deg)`
            },
            onMouseEnter: () => setHoveredEmotion(emotionKey),
            onMouseLeave: () => setHoveredEmotion(null)
          },
          React.createElement(
            'div',
            { className: 'emotion-segment-inner' },
            React.createElement(
              'div',
              { className: 'emotion-name' },
              emotion.name
            )
          )
        );
      };
  
      const renderIntensityLevels = () => {
        if (!hoveredEmotion && !selectedEmotion) return null;
  
        const currentEmotion = hoveredEmotion || selectedEmotion?.primary;
        const emotion = EMOTIONS_DATA[currentEmotion];
  
        return React.createElement(
          'div',
          { className: 'intensity-levels' },
          React.createElement(
            'h4',
            { className: 'intensity-title' },
            `${emotion.name} Intensity`
          ),
          ['mild', 'moderate', 'intense'].map(intensity =>
            React.createElement(
              'div',
              {
                key: intensity,
                className: 'intensity-level'
              },
              React.createElement(
                'div',
                { className: 'intensity-header' },
                React.createElement(
                  'span',
                  { className: 'intensity-name' },
                  intensity.charAt(0).toUpperCase() + intensity.slice(1)
                )
              ),
              React.createElement(
                'div',
                { className: 'intensity-emotions' },
                emotion[intensity].map(specificEmotion =>
                  React.createElement(
                    'button',
                    {
                      key: specificEmotion,
                      className: `specific-emotion ${selectedEmotion?.specific === specificEmotion ? 'selected' : ''}`,
                      onClick: () => handleEmotionClick(currentEmotion, specificEmotion, intensity),
                      style: {
                        backgroundColor: emotion.color,
                        opacity: intensity === 'mild' ? 0.6 : intensity === 'moderate' ? 0.8 : 1
                      }
                    },
                    specificEmotion
                  )
                )
              )
            )
          )
        );
      };
  
      return React.createElement(
        'div',
        { className: 'emotions-wheel-container' },
        React.createElement(
          'div',
          { className: 'emotions-wheel-header' },
          React.createElement(
            'h3',
            null,
            'How are you feeling?'
          ),
          React.createElement(
            'p',
            { className: 'emotions-instruction' },
            'Select an emotion section, then choose the specific feeling that matches your current state'
          )
        ),
        React.createElement(
          'div',
          { className: 'emotions-wheel' },
          React.createElement(
            'div',
            { className: 'wheel-center' },
            React.createElement(
              'div',
              { className: 'center-text' },
              selectedEmotion ? selectedEmotion.specific : hoveredEmotion ? EMOTIONS_DATA[hoveredEmotion].name : 'Select Emotion'
            )
          ),
          Object.keys(EMOTIONS_DATA).map((emotionKey, index) =>
            renderEmotionSegment(emotionKey, index)
          )
        ),
        renderIntensityLevels(),
        selectedEmotion && React.createElement(
          'div',
          { className: 'selected-emotion-display' },
          React.createElement(
            'div',
            {
              className: 'emotion-chip',
              style: { backgroundColor: selectedEmotion.color }
            },
            React.createElement(
              'span',
              { className: 'emotion-text' },
              selectedEmotion.specific
            ),
            React.createElement(
              'span',
              { className: 'emotion-intensity' },
              selectedEmotion.intensity
            )
          )
        )
      );
    }
  
    // Export components to global scope
    global.EmotionsWheel = EmotionsWheel;
    global.EMOTIONS_DATA = EMOTIONS_DATA;
  
  })(typeof window !== 'undefined' ? window : this);
  