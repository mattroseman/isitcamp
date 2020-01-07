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

  handleMovieTitleFocus() {
    // only show suggestions if there are characters in the movie title
    this.setState({
      showSuggestions: true
    });
  }

  handleMovieTitleBlur() {
    this.setState({
      showSuggestions: false
    });
  }

  handleSuggestionClick(suggestion) {
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
            list="movie-title-suggestions"
            value={this.props.movieTitle}
            onChange={(event) => this.props.onMovieTitleChange(event)}
            onFocus={() => this.handleMovieTitleFocus()}
            onBlur={() => this.handleMovieTitleBlur()}
          />

          {this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0 &&
            <Suggestions
              suggestions={this.props.movieTitleSuggestions}
              onSuggestionClick={() => this.handleSuggestionClick()}
            />
          }


          <button
            id="start-survey-button"
            onClick={() => {this.props.onStartSurvey()}}
          >
            Start
          </button>
        </div>
      </div>
    );
  }
}
