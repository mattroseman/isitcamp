import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';

import './RestartSurveyButton.css';

export default function RestartSurveyButton(props) {
  return (
    <button id="restart-btn" onClick={props.onRestartSurvey}>
      <FontAwesomeIcon id="restart-btn-icon" icon={faRedoAlt} />
      <div id="restart-btn-text">
        Start New Movie
      </div>
    </button>
  );
}
