import React from 'react';

import Title from './Title.js';
import Suggestions from './Suggestions.js';

import './Home.css';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSuggestions: false
    };
  }

  componentDidMount() {
    document.addEventListener('click', (event) => {
      // if there is a click outside the input element or suggestion menu
      if (!(event.target.matches('#movie-title-input') || event.target.matches('#suggestion-menu'))) {
        // hide the suggestion menu
        this.setState({
          showSuggestions: false
        });
      }
    });
  }

  handleMovieTitleFocus() {
    // only show suggestions if there are characters in the movie title
    this.setState({
      showSuggestions: true
    });
  }

  handleSuggestionClick(event, suggestion) {
    event.preventDefault();

    this.props.onMovieTitleChange(suggestion);

    this.setState({
      showSuggestions: false
    });
  }

  render() {
    return (
      <div id="home">
        <Title />

        <div id="movie-title-field">
          <input
            id="movie-title-input"
            type="text"
            placeholder="Enter movie title"
            spellCheck="false"
            autoComplete="off"
            list="movie-title-suggestions"
            value={this.props.movieTitle}
            onChange={(event) => this.props.onMovieTitleChange(event)}
            onFocus={() => this.handleMovieTitleFocus()}
          />

          {this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0 &&
            <Suggestions
              suggestions={this.props.movieTitleSuggestions}
              onSuggestionClick={(event, suggestion) => this.handleSuggestionClick(event, suggestion)}
            />
          }


          <button
            id="start-survey-button"
            onClick={() => {this.props.onStartSurvey()}}
          >
            {this.props.surveyInProgress ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    );
  }
}
