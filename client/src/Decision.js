import React from 'react';

import './Decision.css';

export default function Decision(props) {
  const movieTitle = props.movieTitle.length > 37 ? props.movieTitle.substr(0, 37).trim() + '...' : props.movieTitle;

  return (
    <div id="decision">
      <h1 id="movie-title">
        {movieTitle}
      </h1>

      <div id="question-container">
        <div id="question">
          {props.question}
        </div>
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
