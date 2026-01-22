import { useState, useEffect } from 'react'

function getWeatherIcon(weatherCode) {
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

  // Returns the key that includes the weatherCode
  const arr = [...icons.keys()].find((key) => key.includes(weatherCode))
  if (!arr) return 'NOT FOUND'

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

export default function App() {
  const [location, setLocation] = useState(
    () => localStorage.getItem('location') || 'anaheim'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState('')
  const [weather, setWeather] = useState({})

  useEffect(() => {
    const controller = new AbortController()
    async function fectchWeather() {
      try {
        setIsLoading(true)
        // 1) Getting location (geocoding)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        )
        const geoData = await geoRes.json()

        if (!geoData.results) throw new Error('Location not found')

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results.at(0)
        setDisplayLocation(`${name} ${convertToFlag(country_code)}`)

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&temperature_unit=fahrenheit&daily=weathercode,temperature_2m_max,temperature_2m_min`
        )
        const weatherData = await weatherRes.json()

        setWeather(weatherData.daily)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    if (location.length < 2) {
      setWeather({})
      return
    }

    fectchWeather()

    return function () {
      controller.abort()
    }
  }, [location])

  function handleSetLocation(e) {
    setLocation(e.target.value)
    localStorage.setItem('location', e.target.value)
  }

  return (
    <div className='app'>
      <h1>Classy Weather</h1>
      <Input onSetLocation={handleSetLocation} location={location} />
      {/* <button onClick={handleFetchWeather}>Get weather</button> */}

      {isLoading && <p className='loader'>Loading...</p>}

      {weather.weathercode && (
        <Weather location={displayLocation} weather={weather} />
      )}
    </div>
  )
}

// **** INPUT Component *****
function Input({ location, onSetLocation }) {
  return (
    <input
      type='text'
      placeholder='Search from location'
      value={location}
      onChange={onSetLocation}
    />
  )
}

// **** WEATHER ***
function Weather({ weather, location }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather

  return (
    <div>
      <h2>Weather {location}</h2>
      <ul className='weather'>
        {dates.map((date, i) => (
          <Day
            date={date}
            max={max.at(i)}
            min={min.at(i)}
            code={codes.at(i)}
            isToday={i === 0}
            key={Math.random()}
          />
        ))}
      </ul>
    </div>
  )
}

// **** DAY ***
// When there is not a state or a function handler that needs to be bind, you do not need the contructor method.
function Day({ date, max, min, code, isToday }) {
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
