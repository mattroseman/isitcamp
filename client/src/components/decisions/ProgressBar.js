import React from 'react';

import './ProgressBar.scss';


export default function ProgressBar(props) {
  return (
    <div className='progress-bar'>
      <div
        className={`progress-bar__complete ${props.progress === 1 ? 'progress-bar__complete--full' : ''}`}
        style={{width: `${props.progress * 100}%`}}
      >
      </div>
    </div>
  );
}
