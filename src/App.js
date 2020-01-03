import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';

import DecisionTree from './DecisionTree';
import Results from './Results';
import { questions, firstQuestion } from './isitcamp_questions';

import './App.css';


class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      surveyStarted: true,
      surveyEnded: false,
      questions: questions,
      firstQuestion: firstQuestion,
      points: 0,
      maxPossiblePoints: getMaxPossiblePoints()
    };
  }

  handleAddPoints(newPoints) {
    this.setState({
      points: this.state.points + newPoints
    });
  }

  handleSurveyEnd() {
    this.setState({
      surveyEnded: true
    });
  }

  render() {
    // if the survey has started, but hasn't ended yet
    if (this.state.surveyStarted && !this.state.surveyEnded) {
      return(
        <DecisionTree
          questions={this.state.questions}
          firstQuestion={this.state.firstQuestion}
          onNewPoints={(newPoints) => {this.handleAddPoints(newPoints)}}
          onSurveyEnd={() => {this.handleSurveyEnd()}}
        />
      );
    }

    // if the survey has ended
    if (this.state.surveyEnded) {
      return (
        <Results
          points={this.state.points}
          maxPossiblePoints={this.state.maxPossiblePoints}
        />
      );
    }
  }
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

export default hot(App);
