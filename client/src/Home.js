import React from 'react';

import Title from './Title.js';
import Suggestions from './Suggestions.js';

import './Home.css';

const transitionTime = 400;

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSuggestions: false
    };

    this.handleWindowResize = this.handleWindowResize.bind(this);
  }

  componentDidMount() {
    // set initial height/width of screen
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;
    // blur the input field if window is resized (like virtual keyboard closing)
    window.addEventListener('resize', this.handleWindowResize);

    const inputElement = document.getElementById('movie-title-input');
    inputElement.style.width = '277px';
    inputElement.style.top = `${inputElement.getBoundingClientRect().top}px`;
    inputElement.style.left = `${inputElement.getBoundingClientRect().left}px`;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  /*
   * handleWindowResize is fired whenever the size of the window is changed.
   * If the height shrinks over 150px, then the movie-title-input field is blured
   */
  handleWindowResize() {
    // No orientation change, keyboard closing
    if ((window.innerHeight - window.lastInnerHeight > 150 ) && window.innerWidth == window.lastInnerWidth) {
      // on keyboard close, blur the movie title input field
      document.getElementById('movie-title-input').blur();
    }

    // update the last height/width variables
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;
  }

  /*
   * handleMovieTitleFocus is fired when a user clicks on the movie title field.
   * When that happens the showSuggestions state is set to true to show the suggestion dropdown
   */
  handleMovieTitleFocus() {
    // if this is a mobile screen, change input element to a fixed position,
    // but don't move it's actual position yet
    const inputElement = document.getElementById('movie-title-input');
    const backgroundFilter = document.getElementById('movie-title-input-background-filter');
    if (window.innerWidth <= 575) {
      inputElement.style.top = `${inputElement.getBoundingClientRect().top}px`;
      inputElement.style.left = `${inputElement.getBoundingClientRect().left}px`;
      inputElement.style.position = 'fixed';
      inputElement.classList.add('focused');
      inputElement.style.top = '5%';
      inputElement.style.left = '5%';
      inputElement.style.zIndex = '2';
      inputElement.style.width = '85%';
      inputElement.classList.add('floating');

      backgroundFilter.classList.add('active');

      // wait for animations to complete
      setTimeout(() => {
        const suggestionMenu = document.getElementById('suggestion-menu');
        suggestionMenu.style.top = `${inputElement.getBoundingClientRect().top + inputElement.getBoundingClientRect().height + 3}px`;

        this.setState({
          showSuggestions: true
        });
      }, transitionTime);
    } else {
      this.setState({
        showSuggestions: true
      });
    }

  }

  /*
   * handleMovieTitleBlur is fired when a user clicks outside the movie title field.
   * When that happens the showSuggestions state is set to false to hide the suggestion dropdown
   */
  handleMovieTitleBlur() {
    // only show suggestions if there are characters in the movie title
    this.setState({
      showSuggestions: false
    });

    const placeholderInputElement = document.getElementById('movie-title-input-placeholder');
    const inputElement = document.getElementById('movie-title-input');
    const backgroundFilter = document.getElementById('movie-title-input-background-filter');
    if (window.innerWidth <= 575) {
      inputElement.style.top = `${placeholderInputElement.getBoundingClientRect().top}px`;
      inputElement.style.left = `${placeholderInputElement.getBoundingClientRect().left}px`;
      inputElement.style.zIndex = '0';
      inputElement.style.width = `${placeholderInputElement.style.width}`;
      inputElement.style.width = '277px';
      inputElement.classList.remove('floating');

      backgroundFilter.classList.remove('active');

      // wait for animations to complete
      setTimeout(() => {
        inputElement.classList.remove('focused');
        inputElement.style.position = 'static';
        delete inputElement.style.top;
        delete inputElement.style.left;
      }, transitionTime);
    }
  }

  /*
   * handleSuggestionClick is fired when a user clicks on a suggestion.
   */
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
            onBlur={() => this.handleMovieTitleBlur()}
          />
          <input id="movie-title-input-placeholder" disabled={true}></input>

          <div id="movie-title-input-background-filter"></div>

          <Suggestions
            suggestions={this.props.movieTitleSuggestions}
            onSuggestionClick={(event, suggestion) => this.handleSuggestionClick(event, suggestion)}
          show={this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0}
          />

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
