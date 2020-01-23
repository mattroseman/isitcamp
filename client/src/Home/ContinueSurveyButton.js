import React from 'react';

import './ContinueSurveyButton.css';

export default function ContinueSurveyButton(props) {
  return (
    <button
      id="continue-survey-button"
      onMouseDown={props.onContinueSurvey}
    >
      Continue
    </button>
  );
}
