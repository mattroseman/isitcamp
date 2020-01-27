import React from 'react';

import './Result.css';

const transitionTime = 1000;

export default class Results extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shownPercentage: 0
    };
  }

  componentDidMount() {
    const campPercentage = Math.round((this.props.points / this.props.maxPossiblePoints) * 100);

    // starting at 0, increment the shownPercentage by one count, until it matches the given campPercentage
    const tickTime = transitionTime / campPercentage;
    this.setState({
      shownPercentage: 0
    }, () => {
      const animationTickInterval = setInterval(() => {
        if (this.state.shownPercentage === campPercentage) {
          clearInterval(animationTickInterval);
        } else {
          this.setState({
            shownPercentage: this.state.shownPercentage + 1
          });
        }
      }, tickTime); 
    });
  }

  render() {
    return (
      <div id="results">
        <div id="camp-percentage">
          <p>this film is</p>
          <h3>{this.state.shownPercentage}%</h3>
          <p>camp</p>
        </div>

        <button
          id="restart-button"
          onClick={() => this.props.onRestart()}
        >
          Start Another Film
        </button>
      </div>
    );
  }
}
