import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

    if (window.innerWidth <= 575) {
      const inputElementContainer = document.getElementById('movie-title-input-container');
      const inputElement = document.getElementById('movie-title-input');

      inputElementContainer.style.top = `${inputElementContainer.getBoundingClientRect().top}px`;
      inputElementContainer.style.left = `${inputElementContainer.getBoundingClientRect().left}px`;
      inputElement.blur();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate() {
    const inputElementContainer = document.getElementById('movie-title-input-container');
    const inputElement = document.getElementById('movie-title-input');
    const inputElementClear = document.getElementById('movie-title-input-clear');

    // if the input element is focused, and there are suggestions showing
    if (this.state.showSuggestions && this.props.movieTitleSuggestions.length > 0) {
      inputElementContainer.style.borderBottomLeftRadius = '0px';
      inputElement.style.borderBottomLeftRadius = '0px';

      inputElementContainer.style.borderBottomRightRadius = '0px';
      if (window.innerWidth <= 575) {
        inputElementClear.style.borderBottomRightRadius = '0px';
      } else {
        inputElement.style.borderBottomRightRadius = '0px';
      }
    } else {
      inputElementContainer.style.borderBottomLeftRadius = '.4rem';
      inputElement.style.borderBottomLeftRadius = '.4rem';

      inputElementContainer.style.borderBottomRightRadius = '.4rem';
      if (window.innerWidth <= 575) {
        inputElementClear.style.borderBottomRightRadius = '.4rem';
      } else {
        inputElement.style.borderBottomRightRadius = '.4rem';
      }
    }
  }

  /*
   * handleWindowResize is fired whenever the size of the window is changed.
   * If the height shrinks over 150px, then the movie-title-input field is blured
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
    // if this is a mobile screen, change input element to a fixed position,
    // but don't move it's actual position yet
    const inputElementContainer = document.getElementById('movie-title-input-container');
    const backgroundFilter = document.getElementById('movie-title-input-background-filter');
    if (window.innerWidth <= 575) {
      inputElementContainer.style.top = `${inputElementContainer.getBoundingClientRect().top}px`;
      inputElementContainer.style.left = `${inputElementContainer.getBoundingClientRect().left}px`;
      inputElementContainer.style.width = `${inputElementContainer.getBoundingClientRect().width}px`;
      inputElementContainer.style.position = 'fixed';

      inputElementContainer.classList.add('focused');
      inputElementContainer.classList.add('floating');
      inputElementContainer.style.top = '5%';
      inputElementContainer.style.left = '5%';
      inputElementContainer.style.zIndex = '2';
      inputElementContainer.style.width = '90%';
      inputElementContainer.style.boxShadow = '-4px 4px 4px #000000;';

      backgroundFilter.classList.add('active');

      // wait for animations to complete
      setTimeout(() => {
        if (inputElementContainer.classList.contains('floating')) {
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

    const placeholderInputElement = document.getElementById('movie-title-input-container-placeholder');
    const inputElementContainer = document.getElementById('movie-title-input-container');
    const backgroundFilter = document.getElementById('movie-title-input-background-filter');

    if (window.innerWidth <= 575) {
      inputElementContainer.style.top = `${placeholderInputElement.getBoundingClientRect().top}px`;
      inputElementContainer.style.left = `${placeholderInputElement.getBoundingClientRect().left}px`;
      inputElementContainer.style.width = `${placeholderInputElement.getBoundingClientRect().width}px`;
      inputElementContainer.style.zIndex = '0';
      inputElementContainer.classList.remove('floating');

      backgroundFilter.classList.remove('active');

      // wait for animations to complete
      setTimeout(() => {
        inputElementContainer.classList.remove('focused');
        inputElementContainer.style.position = 'static';
        inputElementContainer.style.top = null;
        inputElementContainer.style.left = null;
        inputElementContainer.style.width = null;
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

        <form id="movie-title-field" onSubmit={() => this.props.onStartSurvey()}>
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
            {window.innerWidth <= 575 &&
            <button
              id="movie-title-input-clear"
              onMouseDown={() => {
                this.props.onMovieTitleChange('');
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            }
          </div>
          <div id="movie-title-input-container-placeholder" disabled={true}></div>

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
        </form>
      </div>
    );
  }
}
