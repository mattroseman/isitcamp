import React from 'react';

import './Decision.css';

export default function Decision(props) {
  return (
    <div className="decision-page">
      <h1>{props.movieTitle}</h1>
      <div className="decision">
        <div className="decision-question">
          {props.question}
        </div>
        <div className="decision-options">
          <button className='decision-option yes-option' onClick={() => props.onOptionClick('yes')}>
            Yes
          </button>
          <button className="decision-option no-option" onClick={() => props.onOptionClick('no')}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
