import React from 'react';

export default class Results extends React.Component {
  render() {
    const campPercentage = Math.round((this.props.points / this.props.maxPossiblePoints) * 100);
    return (
      <div>this film is {campPercentage}% camp</div>
    );
  }
}
