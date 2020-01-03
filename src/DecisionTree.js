import React from 'react';

import { questions, firstQuestion } from './isitcamp_questions';

export default class DecisionTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentQuestion: questions[firstQuestion],
      campPoints: 0,
      maxPossiblePoints: getMaxPossiblePoints()
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
      <div>
        <Decision
          question={this.state.currentQuestion['question']}
          onOptionClick={(option) => this.handleOptionClick(option)}
        />
        <Score points={this.state.campPoints} totalPoints={this.state.maxPossiblePoints} />
      </div>
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

/*
 * getMaxPossiblePoints takes a JSON object that is a list of questions with points associated with each possible answer.
 * Each answer points to a next question, using a depth first search, it determines the maximum possible points you can get.
 */
let questionMaxPoints = {}
function getMaxPossiblePoints(startingQuestion='1') {
  const question = questions[startingQuestion]

  let yesPoints = question['options']['yes']['points'];
  // if there is another question following the yes option, recursively calculate it's maximum points
  if ('next_question' in question['options']['yes']) {
    let nextQuestion = question['options']['yes']['next_question'];
    if (nextQuestion in questionMaxPoints) {
      yesPoints += questionMaxPoints[nextQuestion];
    } else {
      yesPoints += getMaxPossiblePoints(question['options']['yes']['next_question'])
    }
  }

  let noPoints = question['options']['no']['points'];
  // if there is another question following the no option, recursively calculate it's maximum points
  if ('next_question' in question['options']['no']) {
    let nextQuestion = question['options']['no']['next_question'];
    if (nextQuestion in questionMaxPoints) {
      noPoints += questionMaxPoints[nextQuestion];
    } else {
      noPoints += getMaxPossiblePoints(question['options']['no']['next_question'])
    }
  }

  const maxPoints = Math.max(yesPoints, noPoints);

  questionMaxPoints[startingQuestion] = maxPoints;

  return maxPoints;
}
