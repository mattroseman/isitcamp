import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';

import Decision from './Decision';
import Results from './Results';
import { questions, firstQuestion } from './isitcamp_questions';

import './App.css';

const PAGES = Object.freeze({
  'home': 1,
  'survey': 2,
  'results': 3
});


class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      currentPage: PAGES.survey,
      currentQuestion: questions[firstQuestion],
      questions: questions,
      points: 0,
      maxPossiblePoints: getMaxPossiblePoints()
    };
  }

  componentDidMount() {
    // when the user goes back a question, revert the state to the state in history
    window.addEventListener('popstate', (event) => {
      this.setState(event.state);
    });
  }

  handleOptionClick(option) {
    // add the points this options has to the points in state
    const newPoints = this.state.currentQuestion['options'][option]['points'];
    this.setState({
      points: this.state.points + newPoints
    });

    history.pushState(this.state, '', '/');

    if ('next_question' in this.state.currentQuestion['options'][option]) {
      // update the currentQuestion value in state to whatever this options next_question is
      const newQuestion = this.state.questions[this.state.currentQuestion['options'][option]['next_question']];
      this.setState({
        currentQuestion: newQuestion,
      });
    } else {
      // if there is no next question go to the results page
      this.setState({
        currentPage: PAGES.results
      });
    }
  }

  render() {
    if (this.state.currentPage === PAGES.survey) {
      return(
        <Decision
          question={this.state.currentQuestion['question']}
          onOptionClick={(option) => this.handleOptionClick(option)}
        />
      );
    }

    if (this.state.currentPage === PAGES.results) {
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
