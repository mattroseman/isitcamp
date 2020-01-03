import React from 'react';

export default class DecisionTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentQuestion: props.questions[props.firstQuestion],
    };
  }

  handleOptionClick(option) {
    const points = this.state.currentQuestion['options'][option]['points'];
    this.props.onNewPoints(points);

    // if there is no next question trigger the onSurveyEnd function
    if ('next_question' in this.state.currentQuestion['options'][option]) {
      const newQuestion = this.props.questions[this.state.currentQuestion['options'][option]['next_question']];
      this.setState({
        currentQuestion: newQuestion,
      });
    } else {
      this.props.onSurveyEnd();
    }
  }

  render() {
    return (
      <Decision
        question={this.state.currentQuestion['question']}
        onOptionClick={(option) => this.handleOptionClick(option)}
      />
    );
  }
}

function Decision(props) {
  return (
    <div className="decision">
      <div className="decision-question">
        {props.question}
      </div>
      <div className="decision-options">
        <button className='yes-option' onClick={() => props.onOptionClick('yes')}>
          Yes
        </button>
        <button className="no-option" onClick={() => props.onOptionClick('no')}>
          No
        </button>
      </div>
    </div>
  );
}

function Score(props) {
  return (
    <div className="current-points">
      {props.points} / {props.totalPoints}
    </div>
  );
}
