import React from 'react';

import './ProgressBar.scss';


export default function ProgressBar(props) {
  const progressPercent = `${Math.floor(props.progress * 100)}%`
  return (
    <div className='progress-bar'>
      <div
        className={`progress-bar__complete ${props.progress === 1 ? 'progress-bar__complete--full' : ''}`}
        style={{width: progressPercent}}
      >
      </div>

      <div className='progress-bar__tooltip'>
        <span>Progress: {progressPercent}</span>
      </div>
    </div>
  );
}
