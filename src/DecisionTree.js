import React from 'react';

export default class DecisionTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDecision: 0,
      madeDecisions: [],
    }
  }

  handleOptionClick(option) {
    const madeDecisions = this.state.madeDecisions;

    this.setState({
      madeDecisions: this.state.madeDecisions.concat([{
        question: decisions[this.state.currentDecision].question,
        option: option,
      }]),
      currentDecision: Math.min(decisions.length - 1, this.state.currentDecision + 1),
    });
  }

  render() {
    return (
      <Decision
        question={decisions[this.state.currentDecision].question}
        options={decisions[this.state.currentDecision].options}
        onOptionClick={(option) => this.handleOptionClick(option)}
      />
    );
  }
}

function Decision(props) {
  const options = props.options;
  const optionsList = options.map((option) =>
    <li key={option}>
      <DecisionOption option={option} onClick={() => props.onOptionClick(option)} />
    </li>
  );

  return (
    <div className="decision">
      <div className="decision-question">
        {props.question}
      </div>
      <div className="decision-options">
        <ul>{optionsList}</ul>
      </div>
    </div>
  );
}

function DecisionOption(props) {
  return (
    <button className="decision-option" onClick={props.onClick}>
      {props.option}
    </button>
  );
}

const decisions = [
  {
    'question': 'Is this film camp?',
    'options': [
      'yes',
      'no',
    ],
  },
  {
    'question': 'Is this another question?',
    'options': [
      'yes',
      'no',
    ],
  },
]
