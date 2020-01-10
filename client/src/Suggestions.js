import React from 'react';

import './Suggestions.css';

export default class Suggestions extends React.Component {
  render() {
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
