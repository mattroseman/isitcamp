import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import StartSurveyButton from './StartSurveyButton.js';
import ContinueSurveyButton from './ContinueSurveyButton.js';
import Suggestions from './Suggestions.js';

import './MovieTitleForm.css';

const transitionTime = 400;

export default class MovieTitleForm extends React.Component {
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

    window.addEventListener('resize', this.handleWindowResize);

    if (window.innerWidth <= 575) {
      // on mobile, blur the input element when component firsts mounts
      const inputElement = document.getElementById('movie-title-input');
      inputElement.blur();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate() {
    const movieTitleField = document.getElementById('movie-title-field');

    if (this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0) {
      movieTitleField.style.borderBottomLeftRadius = '0rem';
      movieTitleField.style.borderBottomRightRadius = '0rem';
    } else {
      movieTitleField.style.borderBottomLeftRadius = '.4rem';
      movieTitleField.style.borderBottomRightRadius = '.4rem';
    }
  }

  /*
   * handleWindowResize is fired whenever the size of the window is changed.
   * If the height shrinks over a certain amount, then the movie-title-input field is blured
   */
  handleWindowResize() {
    // No orientation change, keyboard closing
    if ((window.innerHeight - window.lastInnerHeight > 150 ) && window.innerWidth === window.lastInnerWidth) {
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
    if (window.innerWidth <= 575) {
      // if this is a mobile screen, change the movie title field to a fixed position, and move to top of the screen
      const movieTitleField = document.getElementById('movie-title-field');

      // convert the movieTitleField to a fixed position, but keep it in the same spot
      movieTitleField.style.top = `${movieTitleField.getBoundingClientRect().top}px`;
      movieTitleField.style.left = `${movieTitleField.getBoundingClientRect().left}px`;
      movieTitleField.style.width = `${movieTitleField.getBoundingClientRect().width}px`;
      movieTitleField.style.position = 'fixed';

      // move the movieTitle field to top of the screen
      movieTitleField.style.top = '5%';
      movieTitleField.style.left = '5%';
      movieTitleField.style.width = '90%';
      movieTitleField.style.zIndex = '2';
      movieTitleField.classList.add('floating');
      movieTitleField.classList.add('focused');

      // show the background filter
      document.getElementById('background-filter').classList.add('active');

      // wait for the animations to complete
      setTimeout(() => {
        // make sure the movie title wasn't unfocused before animation timeout finishes
        if (movieTitleField.classList.contains('focused')) {
          this.setState({
            showSuggestions: true
          });
        }
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

    if (window.innerWidth <= 575) {
      const movieTitleField = document.getElementById('movie-title-field');
      const movieTitleFieldPlaceholder = document.getElementById('movie-title-field-placeholder');
      movieTitleField.style.top = `${movieTitleFieldPlaceholder.getBoundingClientRect().top}px`;
      movieTitleField.style.left = `${movieTitleFieldPlaceholder.getBoundingClientRect().left}px`;
      movieTitleField.style.width = `${movieTitleFieldPlaceholder.getBoundingClientRect().width}px`;
      movieTitleField.style.zIndex = '0';
      movieTitleField.classList.remove('focused');

      document.getElementById('background-filter').classList.remove('active');

      // wait for the animations to complete
      setTimeout(() => {
        movieTitleField.style.position = 'static';
        movieTitleField.style.top = null;
        movieTitleField.style.left = null;
        movieTitleField.style.width = null;

        movieTitleField.classList.remove('floating');
      }, transitionTime);
    }
  }

  /*
   * handleMovieTitleClearMouseDown is fired when a user clicks on the X in the movie title input field.
   */
  handleMovieTitleClearMouseDown(event) {
    event.preventDefault();

    this.props.onMovieTitleChange('');
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
    return(
      <form
        id="movie-title-form"
        className={this.props.surveyInProgress ? 'continue-showing' : ''}
        onSubmit={this.props.surveyInProgress ? this.props.onContinueSurvey : this.props.onStartSurvey}
      >
        <div id="movie-title-field">
          <div id="movie-title-input-container">
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
          </div>
          {window.innerWidth <= 575 &&
          <button
            id="movie-title-input-clear"
            type="button"
            onMouseDown={(event) => this.handleMovieTitleClearMouseDown(event)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          }

          <Suggestions
            suggestions={this.props.movieTitleSuggestions}
            onSuggestionClick={(event, suggestion) => this.handleSuggestionClick(event, suggestion)}
            show={this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0}
          />
        </div>

        <div id="movie-title-field-placeholder" disabled={true}></div>
        <div id="background-filter"></div>

        <div id="movie-title-submit-container">
          {this.props.surveyInProgress &&
          <ContinueSurveyButton
            onContinueSurvey={this.props.onContinueSurvey}
          />
          }
          <StartSurveyButton
            onStartSurvey={this.props.onStartSurvey}
            surveyInProgress={this.props.surveyInProgress}
          />
        </div>
      </form>
    );
  }
}
