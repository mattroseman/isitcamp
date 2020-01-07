import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';

import Decision from './Decision';
import Results from './Results';
import Home from './Home';
import { questions, firstQuestion, maxPossiblePoints } from './isitcamp_questions';

import './App.css';

const PAGES = Object.freeze({
  'home': 1,
  'survey': 2,
  'results': 3
});


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      movieTitle: '',
      movieTitleSuggestions: [],
      page: PAGES.home,
      surveyInProgress: false,
      question: questions[firstQuestion],
      points: 0
    };
  }

  componentDidMount() {
    let snapshot = sessionStorage.getItem('isitcampSnapshot');

    // if there was a snapshot in sessionStorage
    if (snapshot !== null) {
      snapshot = JSON.parse(snapshot);
      this.setState(snapshot);
    }

    history.replaceState({
      page: this.state.page
    }, '', '/');

    window.addEventListener('popstate', (event) => {
      this.setState({
        page: event.state.page
      });
    });
  }

  componentDidUpdate() {
    sessionStorage.setItem('isitcampSnapshot', JSON.stringify(this.state));
  }

  handleMovieTitleChange(event) {
    const newMovieTitle = typeof event == 'string' ? event : event.target.value;

    this.setState({
      movieTitle: newMovieTitle
    });

    if (newMovieTitle !== '') {
      let url = '/movies?prefix=' + newMovieTitle;
      if (window.location.hostname === 'localhost') {
        url = 'http://localhost:5000' + url;
      }

      fetch(url)
        .then((response) => response.json())
        .then((responseJSON) => {
          this.setState({
            movieTitleSuggestions: responseJSON.movieTitles
          });
        });
    } else {
      this.setState({
        movieTitleSuggestions: []
      });
    }
  }

  handleStartSurvey() {
    this.setState({
      page: PAGES.survey,
      surveyInProgress: true
    });

    history.pushState({
      page: PAGES.survey
    }, '', '/');
  }

  handleOptionClick(option) {
    let newPoints = this.state.points;
    let newQuestion = this.state.question;
    let newPage = this.state.page;

    // add the points this options has to the points in state
    newPoints = this.state.points + this.state.question['options'][option]['points'];
    this.setState({
      points: newPoints
    });

    // calculate the next question, or go to the results page if there isn't one
    if ('next_question' in this.state.question['options'][option]) {
      // update the question value in state to whatever this options next_question is
      newQuestion = questions[this.state.question['options'][option]['next_question']];
      this.setState({
        question: newQuestion,
      });
    } else {
      // if there is no next question go to the results page
      newPage = PAGES.results;
      this.setState({
        page: newPage
      });

      history.pushState({
        page: newPage
      }, '', '/');
    }
  }

  handleRestart() {
    this.setState({
      movieTitle: '',
      page: PAGES.home,
      surveyInProgress: false,
      question: questions[firstQuestion],
      points: 0
    });

    history.pushState({
      page: PAGES.home
    }, '', '/');
  }

  render() {
    if (this.state.page === PAGES.home) {
      return (
        <Home
          movieTitle={this.state.movieTitle}
          movieTitleSuggestions={this.state.movieTitleSuggestions}
          onMovieTitleChange={(event) => {this.handleMovieTitleChange(event)}}
          surveyInProgress = {this.state.surveyInProgress}
          onStartSurvey={() => {this.handleStartSurvey()}}
        />
      );
    }

    if (this.state.page === PAGES.survey) {
      return(
        <Decision
          movieTitle={this.state.movieTitle}
          question={this.state.question['question']}
          onOptionClick={(option) => this.handleOptionClick(option)}
        />
      );
    }

    if (this.state.page === PAGES.results) {
      return (
        <Results
          points={this.state.points}
          maxPossiblePoints={maxPossiblePoints}
          onRestart={() => this.handleRestart()}
        />
      );
    }
  }
}

export default hot(App);
