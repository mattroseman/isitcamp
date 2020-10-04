import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import StartSurveyButton from './StartSurveyButton.js';
import Suggestions from './Suggestions.js';

import './MovieTitleForm.scss';

const TRANSITION_TIME = 400;
const BORDER_RADIUS = '.4rem';

export default function MovieTitleForm(props) {
  const movieTitleFieldRef = useRef(null);
  const movieTitleFieldPlaceholderRef = useRef(null);
  const movieTitleInputRef = useRef(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    // change the border radius of the movieTitleField depending on if the Suggestions element
    // is showing (showSuggestions is true, and there are actually suggestions to show)
    if (showSuggestions && props.movieTitleSuggestions.length > 0) {
      movieTitleFieldRef.current.style.borderBottomLeftRadius = '0rem';
      movieTitleFieldRef.current.style.borderBottomRightRadius = '0rem';
    } else {
      movieTitleFieldRef.current.style.borderBottomLeftRadius = BORDER_RADIUS;
      movieTitleFieldRef.current.style.borderBottomRightRadius = BORDER_RADIUS;
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
        movieTitleInputRef.current.blur();
      }

      // update the last height/width variables
      window.lastInnerHeight = window.innerHeight;
      window.lastInnerWidth = window.innerWidth;
    }

    // initialize the window's lastInnerHeight and lastInnerWidth to their initial values
    window.lastInnerHeight = window.innerHeight;
    window.lastInnerWidth = window.innerWidth;

    // also blur the movieTitleInput element when the component firsts mounts
    movieTitleInputRef.current.blur();

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
    movieTitleFieldRef.current.style.top = `${movieTitleFieldRef.current.getBoundingClientRect().top}px`;
    movieTitleFieldRef.current.style.left = `${movieTitleFieldRef.current.getBoundingClientRect().left}px`;
    movieTitleFieldRef.current.style.width = `${movieTitleFieldRef.current.getBoundingClientRect().width}px`;
    movieTitleFieldRef.current.style.position = 'fixed';

    // animate the movieTitle field to the top of the screen
    movieTitleFieldRef.current.style.top = '5%';
    movieTitleFieldRef.current.style.left = '5%';
    movieTitleFieldRef.current.style.width = '90%';
    movieTitleFieldRef.current.style.zIndex = '2';
    movieTitleFieldRef.current.classList.add('floating');
    movieTitleFieldRef.current.classList.add('focused');

    // show the background filter
    props.setBackgroundBlur(true);

    // wait for the animations to complete
    setTimeout(() => {
      // make sure the movie title wasn't unfocused before animation timeout finishes
      if (movieTitleFieldRef.current.classList.contains('focused')) {
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

    movieTitleFieldRef.current.style.top = `${movieTitleFieldPlaceholderRef.current.getBoundingClientRect().top}px`;
    movieTitleFieldRef.current.style.left = `${movieTitleFieldPlaceholderRef.current.getBoundingClientRect().left}px`;
    movieTitleFieldRef.current.style.width = `${movieTitleFieldPlaceholderRef.current.getBoundingClientRect().width}px`;
    movieTitleFieldRef.current.style.zIndex = '0';
    movieTitleFieldRef.current.classList.remove('focused');

    props.setBackgroundBlur(false);

    // wait for the animations to complete
    setTimeout(() => {
      movieTitleFieldRef.current.style.position = 'static';
      movieTitleFieldRef.current.style.top = null;
      movieTitleFieldRef.current.style.left = null;
      movieTitleFieldRef.current.style.width = null;

      movieTitleFieldRef.current.classList.remove('floating');
    }, TRANSITION_TIME);
  }

  /*
   * resets the value of the movie title field, and blurs it
   */
  function handleMovieTitleClearMouseDown(event) {
    event.preventDefault();

    props.onMovieTitleChange('');
    movieTitleInputRef.current.blur();
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
      onSubmit={() => {
        props.setBackgroundBlur(false);

        if (props.surveyInProgress) {
          props.onContinueSurvey();
        } else {
          props.onStartSurvey();
        }
      }}
    >
      <div id="movie-title-field" ref={movieTitleFieldRef}>
        <div id="movie-title-input-container">
          <input
            id="movie-title-input"
            ref={movieTitleInputRef}
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

      <div id="movie-title-field-placeholder" ref={movieTitleFieldPlaceholderRef} disabled={true}></div>

      <StartSurveyButton
        onStartSurvey={props.onStartSurvey}
        onContinueSurvey={props.onContinueSurvey}
        surveyInProgress={props.surveyInProgress}
      />
    </form>
  );
}
