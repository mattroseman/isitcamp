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

    this.handleClickOnPage = this.handleClickOnPage.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOnPage);

    // set initial height/width of screen
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;
    // blur the input field if window is resized (like virtual keyboard closing)
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOnPage);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleClickOnPage(event) {
    // if there is a click outside the input element or suggestion menu
    if (!document.getElementById('movie-title-field').contains(event.target)) {
      // hide the suggestion menu
      this.setState({
        showSuggestions: false
      });
    }
  }

  handleWindowResize() {
    // No orientation change, keyboard closing
    if ((window.innerHeight - window.lastInnerHeight > 150 ) && window.innerWidth == window.lastInnerWidth) {
      // on keyboard close, hide the suggestion menu and blur the movie title input field
      document.getElementById('movie-title-input').blur();
      this.setState({
        showSuggestions: false
      });
    }

    // update the last height/width variables
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;
  }

  handleMovieTitleFocus() {
    // only show suggestions if there are characters in the movie title
    this.setState({
      showSuggestions: true
    });
  }

  handleSuggestionClick(event, suggestion) {
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
            onMouseDown={() => {this.props.onStartSurvey()}}
          >
            {this.props.surveyInProgress ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    );
  }
}
