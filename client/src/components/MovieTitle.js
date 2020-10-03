import React from 'react';

import './MovieTitle.scss';


export default function MovieTitle(props) {
  return (
    <h1 id='movie-title' className={props.title.length > 24 ? 'long-title' : ''}>
      {props.title}
    </h1>
  );
}
