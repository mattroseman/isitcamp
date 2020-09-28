import React from 'react';

import './MovieTitle.css';


export default function MovieTitle(props) {
  return (
    <h1 id="movie-title">
      {props.title}
    </h1>
  );
}
