import React, { Component} from 'react';
import { hot } from 'react-hot-loader/root';

import DecisionTree from './DecisionTree';

import './App.css';


class App extends Component{
  render(){
    return(
      <DecisionTree />
    );
  }
}

export default hot(App);
