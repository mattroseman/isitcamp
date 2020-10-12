import React, { useEffect, useRef } from 'react';

import './Suggestions.scss';

export default function Suggestions(props) {
  const suggestionMenuRef = useRef(null);

  // whenever the suggestion menu is shown, make sure it's lined up underneath the movieTitleField
  useEffect(() => {
    const styleTop = `${props.movieTitleFieldRef.current.getBoundingClientRect().height}px`;
    const styleLeft = '0px';
    const styleWidth = `${props.movieTitleFieldRef.current.getBoundingClientRect().width}px`;

    suggestionMenuRef.current.style.top = styleTop;
    suggestionMenuRef.current.style.left = styleLeft;
    suggestionMenuRef.current.style.maxWidth = styleWidth;
    suggestionMenuRef.current.style.minWidth = styleWidth;
  }, [props.show]);

  // when showing the suggestion menu, start it at no height, and then immediately switch to actual
  // height to trigger the opening animation
  useEffect(() => {
    // if the suggestion menu should show, and is currently hidden, animate it dropping down
    if (props.show && suggestionMenuRef.current.classList.contains('hidden')) {
      suggestionMenuRef.current.style.maxHeight = '0px';
      suggestionMenuRef.current.style.padding = '0px';

      setTimeout(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 575) {
          suggestionMenuRef.current.style.maxHeight = `${window.innerHeight - suggestionMenuRef.current.getBoundingClientRect().top - 20}px`;
        } else {
          suggestionMenuRef.current.style.maxHeight = null;
        }

        suggestionMenuRef.current.style.padding = null;
      }, 10);
    }
  }, [props.show]);

  return (
    <div
      id="suggestion-menu-container"
      ref={suggestionMenuRef}
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
