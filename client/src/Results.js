import React from 'react';

export default function Results(props) {
  const campPercentage = Math.round((props.points / props.maxPossiblePoints) * 100);

  return (
    <div>
      <div>this film is {campPercentage}% camp</div>
      <button onClick={() => props.onRestart()}>Start Another Film</button>
    </div>
  );

}
