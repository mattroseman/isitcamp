import React from 'react';

import { questions, firstQuestion } from './isitcamp_questions';

export default class DecisionTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuestion: questions[firstQuestion],
      campPoints: 0
    };
  }

  handleOptionClick(option) {
    const newQuestion = questions[this.state.currentQuestion['options'][option]['next_question']];
    const points = this.state.currentQuestion['options'][option]['points'];

    this.setState({
      currentQuestion: newQuestion,
      campPoints: this.state.campPoints + points
    });
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
