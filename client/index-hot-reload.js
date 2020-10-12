import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { loadableReady } from '@loadable/component';

import App from './components/App.js';

const HotApp = hot(App);

loadableReady(() => {
  ReactDOM.render(
    <HotApp />,
    document.getElementById('root')
  );
});
