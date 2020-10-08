import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';
// import { hot } from 'react-hot-loader/root';
// 
// const HotApp = hot(App);

ReactDOM.hydrate(
  <App />,
  document.getElementById('root')
);
