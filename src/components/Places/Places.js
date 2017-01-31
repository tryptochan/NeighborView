import React from 'react';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';
import { IconButton } from 'react-toolbox/lib/button';
import Place from '../Place';
import styles from './Places.css';

class Places extends React.Component {
	constructor(props) {
		super(props);
		let openState = {};
		props.places.forEach(place => openState[place] = false);
		this.state = {
			open: openState
		}
		this.toggleExpand = this.toggleExpand.bind(this);
	}

	toggleExpand (event) {
		let place;
		if (event.target.tagName === 'SPAN') {
			place = event.target.innerHTML;
		} else if (event.target.tagName === 'BUTTON') {
			place = event.target.getAttribute('data-place');
		}
		this.setState({
			open: Object.assign(this.state.open, {[place]: !this.state.open[place]})
		})
	}

	render() {
		return (
	  	<List className={styles.list} selectable ripple>
	    <ListSubHeader caption='Places of interest around' />
			{this.props.places.map(place => {
				//workaround as ListItem does not spread tabIndex
				const button = [<IconButton
				  icon={this.state.open[place] ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
				  data-place={place}
				  onClick={this.toggleExpand}
				  aria-label='toggle expansion'
				 />]
				return (
				<section key={place}>
		    <ListItem
			    key={place}
		      caption={place}
		      rightActions={button}
		      onClick={this.toggleExpand}
		      className={styles.text}
		    />
		    {this.state.open[place] && <Place tweets={this.props.tweets[place]} />}
		    <ListDivider />
		    </section>
		  )})
			}
			</List>
		)
	}

}

export default Places;