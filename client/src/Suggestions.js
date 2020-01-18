import React from 'react';

import './Suggestions.css';

export default class Suggestions extends React.Component {
  componentDidUpdate() {
    const inputElementContainer = document.getElementById('movie-title-input-container');
    const suggestionMenuElement = document.getElementById('suggestion-menu');

    const styleTop = `${inputElementContainer.getBoundingClientRect().top + inputElementContainer.getBoundingClientRect().height}px`;
    const styleLeft = `${inputElementContainer.getBoundingClientRect().left}px`;
    const styleWidth = `${inputElementContainer.getBoundingClientRect().width}px`;

    suggestionMenuElement.style.top = styleTop;
    suggestionMenuElement.style.left = styleLeft;
    suggestionMenuElement.style.maxWidth = styleWidth;
    suggestionMenuElement.style.minWidth = styleWidth;
  }

  render() {
    const suggestionMenuElement = document.getElementById('suggestion-menu');
    // if the show prop changed to show the suggesiton menu
    if (suggestionMenuElement && suggestionMenuElement.classList.contains('hidden') && this.props.show) {
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
      <div id="suggestion-menu" className={this.props.show ? '' : 'hidden'}>
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
    );
  }
}
