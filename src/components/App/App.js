import React, { Component } from 'react';
import { Button, IconButton } from 'react-toolbox/lib/button';
import { Layout, Panel } from 'react-toolbox/lib/layout';
import { AppBar } from 'react-toolbox/lib/app_bar';
import { Input } from 'react-toolbox/lib/input';
import { Snackbar } from 'react-toolbox/lib/snackbar';
import { token, radius } from '../../config';
import Tooltip from 'react-toolbox/lib/tooltip';
import Codebird from 'codebird';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import Places from '../Places';
import styles from './App.css';


const TooltipIconButton = Tooltip(IconButton);
const TooltipButton = Tooltip(Button);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
      lat: null,
      lng: null,
      inputError: '',
      tweets: null,
      places: null,
      msg: '',
      msgActive: false
    }
    if ('serviceWorker' in navigator) {
      runtime.register();
    }
    this.cb = new Codebird();
    this.cb.setBearerToken(token);
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLocation = this.handleLocation.bind(this);
    this.clear = this.clear.bind(this);
    this.dismissMessage = this.dismissMessage.bind(this);
    this.locationSearch = this.locationSearch.bind(this);
    addEventListener('offline', e => {
      this.setState({
        msg: 'Offline',
        msgActive: true
      })
    });
  }

  searchLocations(lat, lng) {
    const params = {
      geocode: `${lat},${lng},${radius}`,
      filter: 'twimg',
      include_entities: true,
      count: 100
    }
    this.cb.__call(
      'search_tweets',
      params,
      this.searchCallback.bind(this),
      true)
  }

  searchCallback(reply) {
    if (!reply) return;
    const tweets = reply.statuses.filter(t => t.place && t.entities.media && t.place.place_type === 'poi');
    const places = new Set(tweets.map(t => t.place.full_name));
    let tweetsMap = {};
    places.forEach(place => {
      tweetsMap[place] = tweets.filter(t => t.place.full_name === place)
    })
    this.setState({
      tweets: tweetsMap,
      places: Array.from(places)
    })
  }

  clear() {
    this.setState({
      tweets: null,
      places: null
    })
  }

  dismissMessage() {
    this.setState({
      msgActive: false
    })
  }

  locationSearch(event) {
    this.handleLocation(event);
    this.handleClick(event);
  }

  handleClick(event) {
    let [lat, lng] = this.state.location.split(',');
    lat = Number(lat);
    lng = Number(lng);
    if (isNaN(lat) || isNaN(lng)) {
      this.setState({inputError: 'Input does not look like "latitude, longitude'});
      return;
    }
    this.setState({
      lat: lat,
      lng: lng
    })
    this.searchLocations(lat, lng);
  }

  handleLocation(event) {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(pos => {
      this.setState({
        location: `${pos.coords.latitude},${pos.coords.longitude}`
      })
    },
    err => {
      this.setState({
        msg: 'Location service not available',
        msgActive: true
      })
    },
    options);
  }

  handleEnter(event) {
    if (event.key === 'Enter') this.handleClick();
  }

  handleInput(value) {
    this.setState({location: value});
    if (this.state.inputError) { this.setState({inputError: ''}); }
  }

  render() {
    return (
      <div>
      {!this.state.tweets 
        ? <AppBar title='Neighbor View' />
        : <AppBar title='Neighbor View' leftIcon='arrow_back' onLeftIconClick={this.clear}/>
      }
        {!this.state.tweets ? 
          <main className={styles.main}>
          <div className={styles.center}>
          <div className='centerWrapper'>
          <h1>Explore neighbor places of interest with Twitter images</h1>
          <div className={styles.inputGroup}>
          <Input type='text' className={styles.locationInput}
            label='Input latitude and longitude'
            aria-label='Input latitude and longitude'
            hint='32.7882275,-96.7905067' value={this.state.location}
            error={this.state.inputError}
            onChange={this.handleInput}
            onKeyPress={this.handleEnter}
          />
          <div className='buttonWrapper'>
          <TooltipIconButton icon='location_searching' label='location service'
            className={styles.location}
            aria-label='Use device geolocation service'
            accent tooltip='Use geolocation service' tooltipDelay={500}
            onMouseUp={this.handleLocation}
          />
          <Button icon='search' label='Explore' className={styles.search}
            aria-label='Search nearby Twitter images'
            raised primary 
            onMouseUp={this.handleClick}
          />
          </div></div></div></div>
          </main>
        :
          <main>
          <Places tweets={this.state.tweets} places={this.state.places} />
          <TooltipButton icon='location_searching' onMouseUp={this.locationSearch}
            aria-label='Search with current device geolocation'
            tooltip='Search with current location'
            className={styles.float} floating accent mini />
          </main>
        }
      <Snackbar
        action='Dismiss'
        active={this.state.msgActive}
        label={this.state.msg}
        timeout={2000}
        onClick={this.dismissMessage}
        onTimeout={this.dismissMessage}
        type='cancel'
      />
      </div>
    );
  }
}

export default App;
