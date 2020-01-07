import React from 'react';

import './Suggestions.css';

export default function Suggestions(props) {
  return (
    <div id="suggestion-menu">
      {props.suggestions.map((suggestion) => {
        return (
          <div
            key={suggestion}
            className='suggestion'
            onMouseDown={(event) => props.onSuggestionClick(event, suggestion)}
          >
            {suggestion}
          </div>
        );
      })}
    </div>
  );
}
