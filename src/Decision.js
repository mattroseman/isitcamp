import React from 'react';

export default function Decision(props) {
  return (
    <div className="decision">
      <div className="decision-question">
        {props.question}
      </div>
      <div className="decision-options">
        <button className='yes-option' onClick={() => props.onOptionClick('yes')}>
          Yes
        </button>
        <button className="no-option" onClick={() => props.onOptionClick('no')}>
          No
        </button>
      </div>
    </div>
  );
}
