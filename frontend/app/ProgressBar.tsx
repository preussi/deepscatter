import React from 'react';

// Progress Bar component
const ProgressBar = ({ score }) => {
  // Convert score to a percentage
  const percentage = Math.round(score * 100);

  // Define the gradient colors based on score
  const getGradient = (score) => {
    if (score < 0.5) {
      return `linear-gradient(to right, #ff4757, #ff6b81)`;
    } else {
      return `linear-gradient(to right, #7bed9f, #2ed573)`;
    }
  };

  const progressBarStyle = {
    background: getGradient(score),
    width: '0%',
    height: '20px',
    borderRadius: '10px',
    transition: 'width 2s ease-in-out',
    animation: 'fillBar 2s forwards' // Animation to fill the bar
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#ddd', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={progressBarStyle} />
      {/* Animation keyframes */}
      <style>
        {`
          @keyframes fillBar {
            from { width: 0%; }
            to { width: ${percentage}%; }
          }
        `}
      </style>
    </div>
  );
};

export default ProgressBar;
