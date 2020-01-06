import React from 'react';
import Autocomplete from 'react-autocomplete';

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
        <Autocomplete
          getItemValue={item => item}
          items={props.movieTitleSuggestions}
          renderItem={(item, isHighlighted) =>
            <div
              key={item}
              style={{ background: isHighlighted ? 'lightgray' : 'white' }}
              className="movie-title-input-suggestion"
            >
              {item}
            </div>
          }
          renderMenu={function(items, value, style) {
            return <div id="movie-title-input-suggestion-menu" style={{ ...style, ...this.menuStyle }} children={items}/>
          }}
          inputProps={{id: 'movie-title-input', placeholder: 'Enter movie title'}}
          value={props.movieTitle}
          onChange={(event) => {props.onMovieTitleChange(event)}}
          onSelect={(value) => {props.onMovieTitleChange(value)}}
        />

        <button id="start-survey-button" onClick={() => {props.onStartSurvey()}}>Start</button>
      </div>
    </div>
  );
}
