import React from 'react';

import './Suggestions.css';

export default class Suggestions extends React.Component {
  componentDidUpdate() {
    const movieTitleField = document.getElementById('movie-title-field');
    const suggestionMenuElement = document.getElementById('suggestion-menu-container');

    const styleTop = `${movieTitleField.getBoundingClientRect().height}px`;
    const styleLeft = '0px';
    const styleWidth = `${movieTitleField.getBoundingClientRect().width}px`;

    suggestionMenuElement.style.top = styleTop;
    suggestionMenuElement.style.left = styleLeft;
    suggestionMenuElement.style.maxWidth = styleWidth;
    suggestionMenuElement.style.minWidth = styleWidth;
  }

  render() {
    const suggestionMenuElement = document.getElementById('suggestion-menu-container');
    if (suggestionMenuElement && suggestionMenuElement.classList.contains('hidden') && this.props.show) {
      // if the show prop changed to show, animate the suggestion menu dropping down
      suggestionMenuElement.style.maxHeight = '0px';
      suggestionMenuElement.style.padding = '0px';
      setTimeout(() => {
        if (window.innerWidth <= 575) {
          suggestionMenuElement.style.maxHeight = `${window.innerHeight - suggestionMenuElement.getBoundingClientRect().top - 20}px`;
        } else {
          suggestionMenuElement.style.maxHeight = null;
        }
        suggestionMenuElement.style.padding = null;
      }, 10);
    }

    return (
      <div
        id="suggestion-menu-container"
        className={this.props.show ? '' : 'hidden'}
      >
        <div id="suggestion-menu">
          {this.props.suggestions.map((suggestion) => {
            return (
              <div
                key={suggestion}
                className='suggestion'
                onMouseDown={(event) => this.props.onSuggestionClick(event, suggestion)}
              >
                {suggestion}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
