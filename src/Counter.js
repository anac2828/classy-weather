import React from 'react';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 5 };
    this.handleDecrement = this.handleDecrement.bind(this);
  }

  handleDecrement() {
    this.setState((curState) => {
      return { count: curState.count - 1 };
    });
  }

  handleIncrement() {
    this.setState((curState) => {
      return { count: curState.count + 1 };
    });
  }

  render() {
    const date = new Date('June 21 2027');
    date.setDate(date.getDate() + this.state.count);
    console.log();
    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()} [{this.state.count}]
        </span>
        <button onClick={this.handleIncrement.bind(this)}>+</button>
      </div>
    );
  }
}

export default Counter;
