import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import StartSurveyButton from './StartSurveyButton.js';
import Suggestions from './Suggestions.js';

import './MovieTitleForm.scss';

const TRANSITION_TIME = 400;
const BORDER_RADIUS = '.4rem';

// element selectors that are used throughout MovieTitleForm
let movieTitleField;
let movieTitleFieldPlaceholder;
let movieTitleInput;
let backgroundFilter;

export default function MovieTitleForm(props) {
  // initialize the element selectors when the component first loads
  useEffect(() => {
    movieTitleField = document.getElementById('movie-title-field');
    movieTitleFieldPlaceholder = document.getElementById('movie-title-field-placeholder');
    movieTitleInput = document.getElementById('movie-title-input');
    backgroundFilter = document.getElementById('background-filter');
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    // change the border radius of the movieTitleField depending on if the Suggestions element
    // is showing (showSuggestions is true, and there are actually suggestions to show)
    if (showSuggestions && props.movieTitleSuggestions.length > 0) {
      movieTitleField.style.borderBottomLeftRadius = '0rem';
      movieTitleField.style.borderBottomRightRadius = '0rem';
    } else {
      movieTitleField.style.borderBottomLeftRadius = BORDER_RADIUS;
      movieTitleField.style.borderBottomRightRadius = BORDER_RADIUS;
    }
  }, [showSuggestions, props.movieTitleSuggestions.length]);

  /*
   * add a listener to window resize, to guess if keyboard was closed.
   * If so, blur movieTitleInput element
   */
  useEffect(() => {
    // if this is desktop don't do any of this (handleWindowResize is only for mobile devices)
    if (window.innerWidth >= 576) {
      return;
    }

    function handleWindowResize() {
      // No orientation change, keyboard closing
      if ((window.innerHeight - window.lastInnerHeight > 150 ) && window.innerWidth === window.lastInnerWidth) {
        // on keyboard close, blur the movie title input field
        movieTitleInput.blur();
      }

      // update the last height/width variables
      window.lastInnerHeight = window.innerHeight;
      window.lastInnerWidth = window.innerWidth;
    }

    // initialize the window's lastInnerHeight and lastInnerWidth to their initial values
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;

    // also blur the movieTitleInput element when the component firsts mounts
    movieTitleInput.blur();

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  /*
   * handleMovieTitleFocus is fired when a user clicks on the movie title field.
   * When that happens the showSuggestions state is set to true to show the suggestion dropdown
   */
  function handleMovieTitleFocus() {
    // on desktop, just show suggestions, don't animate movieTitleField
    if (window.innerWidth >= 576) {
      setShowSuggestions(true);
      return;
    }

    // convert the movie title field to a fixed position, but keep in the same position
    movieTitleField.style.top = `${movieTitleField.getBoundingClientRect().top}px`;
    movieTitleField.style.left = `${movieTitleField.getBoundingClientRect().left}px`;
    movieTitleField.style.width = `${movieTitleField.getBoundingClientRect().width}px`;
    movieTitleField.style.position = 'fixed';

    // animate the movieTitle field to the top of the screen
    movieTitleField.style.top = '5%';
    movieTitleField.style.left = '5%';
    movieTitleField.style.width = '90%';
    movieTitleField.style.zIndex = '2';
    movieTitleField.classList.add('floating');
    movieTitleField.classList.add('focused');

    // show the background filter
    backgroundFilter.classList.add('active');

    // wait for the animations to complete
    setTimeout(() => {
      // make sure the movie title wasn't unfocused before animation timeout finishes
      if (movieTitleField.classList.contains('focused')) {
        setShowSuggestions(true);
      }
    }, TRANSITION_TIME);
  }

  /*
   * handleMovieTitleBlur is fired when a user clicks outside the movie title field.
   * When that happens the showSuggestions state is set to false to hide the suggestion dropdown
   */
  function handleMovieTitleBlur() {
    setShowSuggestions(false);

    if (window.innerWidth >= 576) {
      return;
    }

    movieTitleField.style.top = `${movieTitleFieldPlaceholder.getBoundingClientRect().top}px`;
    movieTitleField.style.left = `${movieTitleFieldPlaceholder.getBoundingClientRect().left}px`;
    movieTitleField.style.width = `${movieTitleFieldPlaceholder.getBoundingClientRect().width}px`;
    movieTitleField.style.zIndex = '0';
    movieTitleField.classList.remove('focused');

    backgroundFilter.classList.remove('active');

    // wait for the animations to complete
    setTimeout(() => {
      movieTitleField.style.position = 'static';
      movieTitleField.style.top = null;
      movieTitleField.style.left = null;
      movieTitleField.style.width = null;

      movieTitleField.classList.remove('floating');
    }, TRANSITION_TIME);
  }

  /*
   * resets the value of the movie title field, and blurs it
   */
  function handleMovieTitleClearMouseDown(event) {
    event.preventDefault();

    props.onMovieTitleChange('');
    movieTitleInput.blur();
  }

  /*
   * triggers the callback to set movie title to the given suggestion, and hides the suggestions.
   */
  function handleSuggestionClick(event, suggestion) {
    props.onMovieTitleChange(suggestion);

    setShowSuggestions(false);
  }

  return(
    <form
      id="movie-title-form"
      onSubmit={props.surveyInProgress ? props.onContinueSurvey : props.onStartSurvey}
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
            value={props.movieTitle}
            onChange={(event) => props.onMovieTitleChange(event)}
            onFocus={handleMovieTitleFocus}
            onBlur={handleMovieTitleBlur}
          />
        </div>
        {window.innerWidth <= 575 &&
        <button
          id="movie-title-input-clear"
          type="button"
          onMouseDown={(event) => handleMovieTitleClearMouseDown(event)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        }

        <Suggestions
          suggestions={props.movieTitleSuggestions}
          onSuggestionClick={(event, suggestion) => handleSuggestionClick(event, suggestion)}
          show={showSuggestions && props.movieTitleSuggestions.length > 0}
        />
      </div>

      <div id="movie-title-field-placeholder" disabled={true}></div>

      <StartSurveyButton
        onStartSurvey={props.onStartSurvey}
        onContinueSurvey={props.onContinueSurvey}
        surveyInProgress={props.surveyInProgress}
      />
    </form>
  );
}
