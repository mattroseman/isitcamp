import React from 'react';

import MovieTitleField from './MovieTitleField.js';
import StartSurveyButton from './StartSurveyButton.js';
import ContinueSurveyButton from './ContinueSurveyButton.js';

import './MovieTitleForm.css';

export default function MovieTitleForm(props) {
  return(
    <form
      id="movie-title-form"
      className={props.surveyInProgress ? 'continue-showing' : ''}
      onSubmit={() => props.onStartSurvey()}
    >
      <MovieTitleField 
        movieTitle={props.movieTitle}
        movieTitleSuggestions={props.movieTitleSuggestions}
        onMovieTitleChange={props.onMovieTitleChange}
      />
      <div id="movie-title-field-placeholder" disabled={true}></div>
      <div id="background-filter"></div>

      <div id="movie-title-submit-container">
        {props.surveyInProgress &&
        <ContinueSurveyButton
          onContinueSurvey={props.onContinueSurvey}
        />
        }
        <StartSurveyButton
          onStartSurvey={props.onStartSurvey}
          surveyInProgress={props.surveyInProgress}
        />
      </div>
    </form>
  );
}
