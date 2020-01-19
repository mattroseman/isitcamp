import React from 'react';

import './Decision.css';

export default function Decision(props) {
  return (
    <div id="decision-page">
      <h1 id="movie-title">
        {props.movieTitle}
      </h1>

      <div id="question">
        {props.question}
      </div>

      <div id="options">
        <button
          id="yes-option"
          className="option"
          onClick={() => props.onOptionClick('yes')}
        >
          Yes
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
  );
}
