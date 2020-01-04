import React from 'react';

export default function Home(props) {
  return (
    <div className="home">
      <div className="title-field">
        <label id="movie-title-label" htmlFor="movie-title-input">
          Enter movie title to get started
        </label>
        <input 
          id="movie-title-input"
          type="text"
          value={props.movieTitle}
          onChange={(event) => {props.onMovieTitleChange(event)}}
        />
        <button id="start-survey" onClick={() => {props.onStartSurvey()}}>Start</button>
      </div>
    </div>
  );
}
