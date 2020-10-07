import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';

import Decision from './decisions/Decision';
import Results from './results/Result';
import Home from './home/Home';
import { QUESTIONS, FIRST_QUESTION, MAX_POSSIBLE_POINTS, getMaxPossiblePoints } from '../isitcamp_questions';
import RestartConfirmModal from './RestartConfirmModal';

import './App.scss';
import './global.scss';

const PAGES = Object.freeze({
  'home': 1,
  'survey': 2,
  'results': 3
});

let controller;
let signal;

/*
 * calculatePoints takes an object of answers with keys being questin id's and values being the selected options
 */
function calculatePoints(answers) {
  let points = 0;

  for (const question in answers) {
    points += QUESTIONS[question]['options'][answers[question]]['points'];
  }

  return points;
}


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      movieTitle: '',
      movieTitleSuggestions: [],
      page: PAGES.home,
      surveyInProgress: false,
      currentQuestion: FIRST_QUESTION,
      answers: {},
      showRestartConfirmModal: false
    };

    this.backgroundFilterRef = React.createRef();

    this.setBackgroundBlur = this.setBackgroundBlur.bind(this);
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
      currentQuestion: this.state.currentQuestion,
      answers: this.state.answers,
    };
    sessionStorage.setItem('isitcampSnapshot', JSON.stringify(persistentState));
  }

  setBackgroundBlur(blur=true) {
    if (blur) {
      this.backgroundFilterRef.current.classList.add('active');
    } else {
      this.backgroundFilterRef.current.classList.remove('active');
    }
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
      currentQuestion: FIRST_QUESTION,
      answers: {},
    });

    history.pushState({
      page: PAGES.survey
    }, '', '/');

    gtag('event', 'Survey Started', {
      'event_category': 'User Action',
      'event_label': this.state.movieTitle,
    });
  }

  handleContinueSurvey() {
    this.setState({
      page: PAGES.survey,
      surveyInProgress: true
    });

    history.pushState({
      page: PAGES.survey
    }, '', '/');

    gtag('event', 'Survey Continued', {
      'event_category': 'User Action',
      'event_label': this.state.movieTitle,
    });
  }

  handleShowRestartConfirmModal() {
    this.setBackgroundBlur(true);

    this.setState({
      showRestartConfirmModal: true
    });
  }

  handleCloseRestartConfirmModal() {
    this.setBackgroundBlur(false);

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
      currentQuestion: FIRST_QUESTION,
      answers: {},
      showRestartConfirmModal: false
    });

    history.pushState({
      page: PAGES.home
    }, '', '/');

    gtag('event', 'Survey Restarted', {
      'event_category': 'User Action',
    });
  }

  handleOptionClick(option) {
    gtag('event', 'Question Answered', {
      'event_category': 'User Action',
      'event_label': `${this.state.currentQuestion} -> ${option}`,
    });

    // add this answer to answers
    this.setState({
      answers: {
        ...this.state.answers,
        [this.state.currentQuestion]: option
      }
    });

    // calculate the next question, or go to the results page if there isn't one
    if ('next_question' in QUESTIONS[this.state.currentQuestion]['options'][option]) {
      // update the question value in state to whatever this options next_question is
      this.setState({
        currentQuestion: QUESTIONS[this.state.currentQuestion]['options'][option]['next_question'],
      });
    } else {
      // if there is no next question go to the results page
      this.setState({
        page: PAGES.results
      });

      history.pushState({
        page: PAGES.results
      }, '', '/');

      gtag('event', 'Survey Finished', {
        'event_category': 'User Action',
        'event_label': `${this.state.movieTitle}`,
        'value': Math.round(this.state.points / this.state.maxPossiblePoints * 100)
      });
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
          setBackgroundBlur={this.setBackgroundBlur}
        />
      );
    }

    if (this.state.page === PAGES.survey) {
      const progress = (MAX_POSSIBLE_POINTS - getMaxPossiblePoints(this.state.currentQuestion) + 3) / MAX_POSSIBLE_POINTS 
      page = (
        <Decision
          movieTitle={this.state.movieTitle}
          question={QUESTIONS[this.state.currentQuestion]['question']}
          onOptionClick={(option) => this.handleOptionClick(option)}
          onRestartSurvey={this.handleShowRestartConfirmModal}
          progress={progress}
        />
      );
    }

    if (this.state.page === PAGES.results) {
      const points = calculatePoints(this.state.answers);

      page = (
        <Results
          movieTitle={this.state.movieTitle}
          points={points}
          maxPossiblePoints={MAX_POSSIBLE_POINTS}
          onRestart={this.handleRestartSurvey}
        />
      );
    }

    return (
      <div id="app-container">
        {page}

        <div id="background-filter" ref={this.backgroundFilterRef}></div>

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
