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
          list="movie-title-suggestions"
          value={props.movieTitle}
          onChange={(event) => {props.onMovieTitleChange(event)}}
        />
        <datalist id="movie-title-suggestions">
          {props.movieTitleSuggestions.map((movieTitle) => {
            return <option key={movieTitle} value={movieTitle} />
          })}
        </datalist>

        <button id="start-survey-button" onClick={() => {props.onStartSurvey()}}>Start</button>
      </div>
    </div>
  );
}
