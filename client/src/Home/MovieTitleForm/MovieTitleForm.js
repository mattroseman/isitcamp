import React from 'react';

import MovieTitleField from './MovieTitleField.js';
import StartSurveyButton from './StartSurveyButton.js';

import './MovieTitleForm.css';

export default function MovieTitleForm(props) {
  return(
    <form id="movie-title-form" onSubmit={() => props.onStartSurvey()}>
      <MovieTitleField 
        movieTitle={props.movieTitle}
        movieTitleSuggestions={props.movieTitleSuggestions}
        onMovieTitleChange={props.onMovieTitleChange}
      />
      <div id="movie-title-field-placeholder" disabled={true}></div>
      <div id="background-filter"></div>

      <StartSurveyButton
        onStartSurvey={props.onStartSurvey}
        surveyInProgress={props.surveyInProgress}
      />
    </form>
  );
}
