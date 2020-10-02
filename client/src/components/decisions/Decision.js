import React from 'react';

import MovieTitle from '../MovieTitle.js';

import RestartSurveyButton from '../RestartSurveyButton.js';

import './Decision.css';

export default function Decision(props) {
  return (
    <div id="decision">
      <RestartSurveyButton onRestartSurvey={props.onRestartSurvey} />

      <MovieTitle title={props.movieTitle} />

      <div id="question">
        <p id="prompt">{props.question}</p>
        <div id="options">
          <button
            id="yes-option"
            className="option"
            onClick={() => props.onOptionClick('yes')}
          >
            Yes
          </button>

          <button
            id="idk-option"
            className="option"
            onClick={() => props.onOptionClick('idk')}
          >
            I Don't Know
          </button>

          <button
            id="no-option"
            className="option"
            onClick={() => props.onOptionClick('no')}
          >
            No
          </button>
        </div>
      </div>

    </div>
  );
}
