import React from 'react';

import './StartSurveyButton.css';

export default function StartSurveyButton(props) {
  return (
    <button
      id="start-survey-button"
      onMouseDown={props.onStartSurvey}
    >
      {props.surveyInProgress ? 'Start New' : 'Start'}
    </button>
  );
}
