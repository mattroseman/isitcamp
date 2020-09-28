import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';

import Decision from './decisions/Decision';
import Results from './results/Result';
import Home from './home/Home';
import { questions, firstQuestion, maxPossiblePoints } from './isitcamp_questions';
import RestartConfirmModal from './RestartConfirmModal';

import './App.css';

const PAGES = Object.freeze({
  'home': 1,
  'survey': 2,
  'results': 3
});

let controller;
let signal;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      movieTitle: '',
      movieTitleSuggestions: [],
      page: PAGES.home,
      surveyInProgress: false,
      question: questions[firstQuestion],
      points: 0,
      showRestartConfirmModal: false
    };

    this.handleMovieTitleChange = this.handleMovieTitleChange.bind(this);
    this.handleStartSurvey = this.handleStartSurvey.bind(this);
    this.handleContinueSurvey = this.handleContinueSurvey.bind(this);
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.handleRestartSurvey = this.handleRestartSurvey.bind(this);
    this.handleShowRestartConfirmModal = this.handleShowRestartConfirmModal.bind(this);
    this.handleCloseRestartConfirmModal = this.handleCloseRestartConfirmModal.bind(this);
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
    // persistentState are items that are retained on reload
    const persistentState = {
      movieTitle: this.state.movieTitle,
      page: this.state.page,
      surveyInProgress: this.state.surveyInProgress,
      question: this.state.question,
      point: this.state.points
    };
    sessionStorage.setItem('isitcampSnapshot', JSON.stringify(persistentState));
  }

  handleMovieTitleChange(event) {
    const newMovieTitle = typeof event === 'string' ? event : event.target.value;

    this.setState({
      movieTitle: newMovieTitle
    });

    if (newMovieTitle.length === 0) {
      if (controller !== undefined) {
        // cancel the previous request
        controller.abort();
      }

      this.setState({
        movieTitleSuggestions: []
      });

      return;
    }

    let url = '/movies?prefix=' + newMovieTitle;
    if (window.location.hostname === 'localhost') {
      url = 'http://localhost:5000' + url;
    } else if (window.location.hostname.indexOf('ngrok') !== -1) {
      // This is test data when using ngrok since it can't reach the backend server
      this.setState({
        movieTitleSuggestions: [
          'Dr. Strangelove',
          'Eraserhead',
          'Trainspotting',
          'In The Mood For Love',
          'The Wizard of Oz',
          'Pink Flamingos',
          'The Italian Job',
          'Blue Velvet',
          'Chungking Express',
          'The Truman Show'
        ]
      });
      return;
    }

    if (controller !== undefined) {
      // cancel the previous request
      controller.abort();
    }
    if('AbortController' in window) {
      controller = new AbortController;
      signal = controller.signal;
    }

    fetch(url, {signal})
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({
          movieTitleSuggestions: Array.from(new Set(responseJSON.movieTitles))
        });
      })
      .catch((err) => {
        // AbortError's are expected
        if (err.name === 'AbortError') {
          return;
        }

        console.error(err);
      });
  }

  handleStartSurvey() {
    this.setState({
      page: PAGES.survey,
      surveyInProgress: true,
      question: questions[firstQuestion],
      points: 0
    });

    history.pushState({
      page: PAGES.survey
    }, '', '/');
  }

  handleContinueSurvey() {
    this.setState({
      page: PAGES.survey,
      surveyInProgress: true
    });

    history.pushState({
      page: PAGES.survey
    }, '', '/');
  }

  handleShowRestartConfirmModal() {
    document.getElementById('background-filter').classList.add('active');

    this.setState({
      showRestartConfirmModal: true
    });
  }

  handleCloseRestartConfirmModal() {
    document.getElementById('background-filter').classList.remove('active');

    this.setState({
      showRestartConfirmModal: false
    });
  }

  handleRestartSurvey() {
    this.handleCloseRestartConfirmModal();

    this.setState({
      movieTitle: '',
      page: PAGES.home,
      surveyInProgress: false,
      question: questions[firstQuestion],
      points: 0,
      showRestartConfirmModal: false
    });

    history.pushState({
      page: PAGES.home
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

  render() {
    let page;
    if (this.state.page === PAGES.home) {
      page = (
        <Home
          movieTitle={this.state.movieTitle}
          movieTitleSuggestions={this.state.movieTitleSuggestions}
          onMovieTitleChange={(event) => {this.handleMovieTitleChange(event)}}
          surveyInProgress = {this.state.surveyInProgress}
          onStartSurvey={this.handleStartSurvey}
          onContinueSurvey={this.handleContinueSurvey}
          onRestartSurvey={this.handleShowRestartConfirmModal}
        />
      );
    }

    if (this.state.page === PAGES.survey) {
      page = (
        <Decision
          movieTitle={this.state.movieTitle}
          question={this.state.question['question']}
          onOptionClick={(option) => this.handleOptionClick(option)}
          onRestartSurvey={this.handleShowRestartConfirmModal}
        />
      );
    }

    if (this.state.page === PAGES.results) {
      page = (
        <Results
          movieTitle={this.state.movieTitle}
          points={this.state.points}
          maxPossiblePoints={maxPossiblePoints}
          onRestart={this.handleRestartSurvey}
        />
      );
    }

    return (
      <div id="app-container">
        {page}

        <div id="background-filter"></div>

        {this.state.showRestartConfirmModal &&
        <RestartConfirmModal
          onRestartSurvey={this.handleRestartSurvey}
          onCloseRestartConfirmModal={this.handleCloseRestartConfirmModal}
        />
        }
      </div>
    );
  }
}

export default hot(App);
