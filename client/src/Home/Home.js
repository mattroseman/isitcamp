import React from 'react';

import MovieTitleForm from './MovieTitleForm/MovieTitleForm.js';
import About from './About.js';

import './Home.css';

export default function Home(props) {
  return (
    <div id="home">
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
      />

      <About />
    </div>
  );
}
