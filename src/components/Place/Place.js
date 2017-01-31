import React, { Component } from 'react';
import { ListItem } from 'react-toolbox/lib/list';
import { Card, CardMedia, CardTitle, CardText } from 'react-toolbox/lib/card';
import styles from './Place.css';

class Place extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	expanded: false
    }
  }

  render() {
  	return (
  		<section>
  		{this.props.tweets.map(t => {
	  		const media = t.entities.media[0];
	  		const title = <span><a href={media.url} target='_blank'>
	  			{t.user.name}</a></span>
	  		const image = <img src={media.media_url} alt='' 
	  			className={styles.image} />
		  	//TODO: render links in CardText properly
		  	const card = (
			    <Card className={styles.card}>
			    <CardMedia children={image} />
			    <CardTitle children={title} className={styles.title}/>
			    <CardText className={styles.text}>{t.text}</CardText>
				  </Card>
				 )
		     return <ListItem key={t.id} itemContent={card} ripple={false}/>
    	})}
    	</section>
	  )
  }
}

export default Place;