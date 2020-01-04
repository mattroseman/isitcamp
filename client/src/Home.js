import React from 'react';

import './Home.css';

export default function Home(props) {
  return (
    <div id="home">
      <h1 id="title">
        Is It Camp?
      </h1>
      <h3 id="subtitle">
        according to Susan Sontag
      </h3>

      <div id="movie-title-field">
        <input
          id="movie-title-input"
          type="text"
          placeholder="Enter movie title"
          value={props.movieTitle}
          onChange={(event) => {props.onMovieTitleChange(event)}}
        />
        <button id="start-survey-button" onClick={() => {props.onStartSurvey()}}>Start</button>
      </div>
    </div>
  );
}
