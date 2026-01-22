import React from 'react'

// ***** HELPERS ***** //
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '🌤'],
    [[2], '⛅️'],
    [[3], '☁️'],
    [[45, 48], '🌫'],
    [[51, 56, 61, 66, 80], '🌦'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧'],
    [[71, 73, 75, 77, 85, 86], '🌨'],
    [[95], '🌩'],
    [[96, 99], '⛈'],
  ])

  const arr = [...icons.keys()].find((key) => key.includes(wmoCode))

  if (!arr) return 'NOT FOUND'
  // Returns the icon for the found key
  return icons.get(arr)
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en-us', {
    weekday: 'short',
  }).format(new Date(dateStr + 'T00:00:00'))
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())

  return String.fromCodePoint(...codePoints)
}

// ***** MAIN AP *********///

class App extends React.Component {
  state = {
    location: 'anaheim',
    isLoading: false,
    displayLocation: '',
    weather: {},
  }
  // constructor is not necessary when using an arrow function as the method
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     location: 'anaheim',
  //     isLoading: false,
  //     displayLocation: '',
  //     weather: {},
  //   };
  //   this.fetchWeather = this.fetchWeather.bind(this);
  // }

  // when using a arrow function as a method the 'this' key word does not need to be binded.

  fetchWeather = async () => {
    if (this.state.location.length < 2 || this.state.location === 'null')
      return this.setState({ weather: {} })

    try {
      this.setState({ isLoading: true })
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      )
      const geoData = await geoRes.json()

      // Error handling
      if (!geoData.results) throw new Error('Location not found')

      // Destructuring needed data from geocoding response
      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0)

      // Update display location
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      })

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&temperature_unit=fahrenheit&daily=weathercode,temperature_2m_max,temperature_2m_min`
      )
      const weatherData = await weatherRes.json()

      // Update weather state
      this.setState({ weather: weatherData.daily })
    } catch (err) {
      console.error(err)
    } finally {
      this.setState({ isLoading: false })
    }
  }

  setLocation = (e) => {
    this.setState({ location: e.target.value })
  }

  // Runs once after the initial render
  componentDidMount() {
    const storedLocation = localStorage.getItem('location')

    if (storedLocation && storedLocation !== 'null') {
      this.setState({ location: storedLocation })
    }
    this.fetchWeather()
  }

  //  Gets called after every update (props or state) but not on the initial render
  componentDidUpdate(prevProps, prevState) {
    // Called when location changes
    if (this.state.location !== prevState.location) {
      this.fetchWeather()

      localStorage.setItem('location', this.state.location)
    }
  }

  render() {
    return (
      <div className='app'>
        <h1>Classy Weather</h1>
        <Input
          location={this.state.location}
          onSetLocation={this.setLocation}
        />
        {/* <button onClick={this.fetchWeather}>Get weather</button> */}

        {this.state.isLoading && <p className='loader'>Loading...</p>}

        {this.state.weather.weathercode && (
          <Weather
            location={this.state.displayLocation}
            weather={this.state.weather}
          />
        )}
      </div>
    )
  }
}

export default App

class Input extends React.Component {
  render() {
    return (
      <input
        type='text'
        placeholder='Search from location'
        value={this.props.location}
        onChange={this.props.onSetLocation}
      />
    )
  }
}

class Weather extends React.Component {
  //
  // Similar to clean up function. Will run when the component unmounts. Does not run on initial render or between re-renders.
  // Will run when the component is removed from the DOM and can be used to clean up any side effects
  componentWillUnmount() {
    console.log('Weather will unmount')
  }

  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather
    return (
      <div>
        <h2>Weather {this.props.location}</h2>
        <ul className='weather'>
          {dates.map((date, i) => (
            <Day
              date={date}
              max={max.at(i)}
              min={min.at(i)}
              code={codes.at(i)}
              key={date}
              // isToday={i === 0}
            />
          ))}
        </ul>
      </div>
    )
  }
}
// When there is not a state or a function handler that needs to be bind, you do not need the contructor method.
class Day extends React.Component {
  render() {
    const { date, max, min, code, isToday } = this.props
    return (
      <li className='day'>
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? 'Today' : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    )
  }
}
