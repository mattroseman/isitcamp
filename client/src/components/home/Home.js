import React from 'react';

import RestartSurveyButton from '../RestartSurveyButton.js';
import MovieTitleForm from './MovieTitleForm.js';
import About from './About.js';

import './Home.scss';

export default function Home(props) {
  return (
    <div id="home">
      {props.surveyInProgress &&
      <RestartSurveyButton onRestartSurvey={props.onRestartSurvey} />
      }

      <h1 id="site-title">
        Is It Camp?
      </h1>

      <MovieTitleForm
        movieTitle={props.movieTitle}
        movieTitleSuggestions={props.movieTitleSuggestions}
        onMovieTitleChange={props.onMovieTitleChange}
        surveyInProgress={props.surveyInProgress}
        onStartSurvey={props.onStartSurvey}
        onContinueSurvey={props.onContinueSurvey}
        setBackgroundBlur={props.setBackgroundBlur}
      />

      <About />
    </div>
  );
}
