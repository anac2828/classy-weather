import React from 'react'

// Old way of creating a component using ES6 class syntax
class Counter extends React.Component {
  // The constructor initializes state and binds methods
  constructor(props) {
    super(props)
    this.state = { count: 5 }
    // Binding methods to the class instance to ensure correct 'this' context
    this.handleDecrement = this.handleDecrement.bind(this)
    this.handleIncrement = this.handleIncrement.bind(this)
  }

  handleDecrement() {
    this.setState((curState) => {
      return { count: curState.count - 1 }
    })
  }

  handleIncrement() {
    this.setState((curState) => {
      return { count: curState.count + 1 }
    })
  }

  // The render method is required in class components to describe what to display
  render() {
    const date = new Date('June 21 2027')
    // Changes the date based on the current count in state
    date.setDate(date.getDate() + this.state.count)

    return (
      <div>
        {/* updates the count in the state */}
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()} [{this.state.count}]
        </span>
        <button onClick={this.handleIncrement.bind(this)}>+</button>
      </div>
    )
  }
}

export default Counter
