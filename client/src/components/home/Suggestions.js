import React, { useEffect } from 'react';

import './Suggestions.scss';

// element selectors that are used throughout Suggestions
let movieTitleField;
let suggestionMenu;

export default function Suggestions(props) {
  // initialize the element selectors when the componenet first loads
  useEffect(() => {
    movieTitleField = document.getElementById('movie-title-field');
    suggestionMenu = document.getElementById('suggestion-menu-container');
  }, []);

  // whenever the suggestion menu is shown, make sure it's lined up underneath the movieTitleField
  useEffect(() => {
    const styleTop = `${movieTitleField.getBoundingClientRect().height}px`;
    const styleLeft = '0px';
    const styleWidth = `${movieTitleField.getBoundingClientRect().width}px`;

    suggestionMenu.style.top = styleTop;
    suggestionMenu.style.left = styleLeft;
    suggestionMenu.style.maxWidth = styleWidth;
    suggestionMenu.style.minWidth = styleWidth;
  }, [props.show]);

  // when showing the suggestion menu, start it at no height, and then immediately switch to actual
  // height to trigger the opening animation
  useEffect(() => {
    // if the suggestion menu should show, and is currently hidden, animate it dropping down
    if (props.show && suggestionMenu.classList.contains('hidden')) {
      suggestionMenu.style.maxHeight = '0px';
      suggestionMenu.style.padding = '0px';

      setTimeout(() => {
        if (window.innerWidth <= 575) {
          suggestionMenu.style.maxHeight = `${window.innerHeight - suggestionMenu.getBoundingClientRect().top - 20}px`;
        } else {
          suggestionMenu.style.maxHeight = null;
        }

        suggestionMenu.style.padding = null;
      }, 10);
    }
  }, [props.show]);

  return (
    <div
      id="suggestion-menu-container"
      className={props.show ? '' : 'hidden'}
    >
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
    </div>
  );
}
