import React from 'react';

import './Suggestions.css';

export default class Suggestions extends React.Component {
  componentDidUpdate() {
    const inputElement = document.getElementById('movie-title-input');
    const suggestionMenuElement = document.getElementById('suggestion-menu');

    const styleTop = `${inputElement.getBoundingClientRect().top + inputElement.getBoundingClientRect().height}px`;
    const styleLeft = `${inputElement.getBoundingClientRect().left}px`;
    const styleWidth = `${inputElement.getBoundingClientRect().width}px`;

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
        suggestionMenuElement.style.maxHeight = null;
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
