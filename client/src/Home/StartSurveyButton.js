import React from 'react';

import './StartSurveyButton.css';

export default function StartSurveyButton(props) {
  return (
    <button
      id="start-survey-button"
      onMouseDown={props.surveyInProgress ? props.onContinueSurvey : props.onStartSurvey}
    >
      {props.surveyInProgress ? 'Continue' : 'Start'}
    </button>
  );
}
