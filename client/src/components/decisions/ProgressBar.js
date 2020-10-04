import React from 'react';

import './ProgressBar.scss';


export default function ProgressBar(props) {
  return (
    <div className='progress-bar'>
      <div className='progress-bar__complete' style={{width: `${props.progress * 100}%`}}>
      </div>
    </div>
  );
}
