import './style'
import { Component } from 'preact'
import { Store, set, get } from 'idb-keyval'

import Card from '../components/card'

const H = {
	headers: {
		'Origin': 'https://weather.tvasconcelos.eu',
	  }
}

const weatherData = new Store('weather-db', 'weatherData')
//http://www.7timer.info/bin/api.pl?lon=113.17&lat=23.09&product=astro&output=xml
//http://www.7timer.info/bin/civil.php?lon=-9.2012544&lat=38.739968&ac=0&unit=metric&output=json&tzshift=0
const API = 'https://cors-everywhere.herokuapp.com/www.7timer.info/bin/api.pl?'
const PRODUCT_OUTPUT = '&product=civil&unit=metric&output=json'

export default class App extends Component {

	state = {
		config: null,
		data: null,
		location: false,
		startTime: null,
		activeTabs: [0,0,0],
		dailyData: null
	}

	checkIDB = () => {
		get('data', weatherData)
			.then(res => {
				if(!res){return this.getWeatherData()}
				const time = this.cleanDate(res.init).getTime()
				const diff = (Date.now() - time) / (1000 * 60 * 60)
				if(diff > 24){return this.getWeatherData()}
				console.debug('From idb', diff)
				console.debug(res)
				this.setState({
					data: res,
					startTime: time,
					dailyData: this.dailyData(res)
				})
			})
			.then(() => console.debug(this.state))
			.catch(err => console.error(err))
	}

	cleanDate = (str) => {
		const y = str.substring(0, 4)
		const m = str.substring(4, 6)
		const d = str.substring(6, 8)
		const h = str.substring(8)
		return new Date(''.concat(y, '-', m, '-', d, 'T', h, ':00'))
	}

	getWeatherData = async () => {
		if(!this.state.location){
			const ip = await fetch('https://api.ipify.org/?format=json')
				.then(res => res.json())
			const geo = await fetch(`https://cors-everywhere.herokuapp.com/ip-api.com/json/${ip.ip}?fields=lat,lon`, H)
				.then(res => res.json())
				.then(loc => {
					this.updateLocation({coords: {
						latitude: loc.lat,
						longitude: loc.lon
						}
					})
				})
				.catch(err => console.error(err))
			await this.setState({location: true})
			return this.getWeatherData()
		}
		await fetch(`${API}lon=${this.state.long}&lat=${this.state.lat}${PRODUCT_OUTPUT}`, H)
			.then(res => {
				return res.json()
			})
			.then(data => {
				const time = this.cleanDate(data.init).getTime()
				console.debug('from fetch')
				set('data', data, weatherData)
				this.setState({
					data,
					startTime: time,
					dailyData: this.dailyData(data)
				})
			}).catch(err => console.error(err))	
	}

	handleActive = (t) => {
		let state = [0,0,0]
		if(t === 'day'){state = [1,0,0]}
		if(t === 'evening'){state = [1,1,0]}
		if(t === 'night'){state = [1,1,1]}
		this.setState({activeTabs: state})
	}

	dailyData = (data) => {
		const start = new Date(this.state.startTime)
		const x = data.dataseries.map(c => {
			c.rh2m = c.rh2m.substring(1, -2)
			return c
		})
		return {
			morning: {
				temp: x[0].temp2m,
				humidity: x[0].rh2m,
				precAmount: x[0].prec_amount,
				precType: x[0].prec_type,
				clouds: x[0].cloudcover,
				wind: x[0].wind10m.speed,
				windDirection: x[0].wind10m.direction,
				weather: x[0].weather
			},
			day: {
				temp: this.avg([x[1].temp2m, x[2].temp2m]),
				humidity: this.avg([x[1].rh2m, x[2].rh2m]),
				precAmount: this.avg([x[1].prec_amount, x[2].prec_amount]),
				precType: this.avg([x[1].prec_type, x[2].prec_type]),
				clouds: this.avg([x[1].cloudcover, x[2].cloudcover]),
				wind: this.avg([x[1].wind10m.speed, x[2].wind10m.speed]),
				windDirection: x[1].wind10m.direction,
				weather: x[1].weather
			},
			evening: {
				temp: this.avg([x[3].temp2m, x[4].temp2m]),
				humidity: this.avg([x[3].rh2m, x[4].rh2m]),
				precAmount: this.avg([x[3].prec_amount, x[4].prec_amount]),
				precType: this.avg([x[3].prec_type, x[4].prec_type]),
				clouds: this.avg([x[3].cloudcover, x[4].cloudcover]),
				wind: this.avg([x[3].wind10m.speed, x[4].wind10m.speed]),
				windDirection: x[3].wind10m.direction,
				weather: x[3].weather
			},
			night: {
				temp: this.avg([x[5].temp2m, x[6].temp2m]),
				humidity: this.avg([x[5].rh2m, x[6].rh2m]),
				precAmount: this.avg([x[5].prec_amount, x[6].prec_amount]),
				precType: this.avg([x[5].prec_type, x[6].prec_type]),
				clouds: this.avg([x[5].cloudcover, x[6].cloudcover]),
				wind: this.avg([x[5].wind10m.speed, x[6].wind10m.speed]),
				windDirection: x[5].wind10m.direction,
				weather: x[5].weather
			}
		}
	}

	avg = (arr) => {
		return arr.reduce((p, c) => p + c) / arr.length
	}

	updateLocation = async (location) => {		
		console.debug('location', location)
		this.setState(() => ({lat: +location.coords.latitude, long: +location.coords.longitude}))
	}

	componentDidMount = () => {
		if(typeof window !== "undefined") {navigator.geolocation.getCurrentPosition(this.updateLocation)}
		this.checkIDB()
	}

	render({}, {dailyData, activeTabs}) {
		return (
			<main class='wrapper' >
				{dailyData && <>
					<Card timeOfDay='morning' click={() => this.handleActive('morning')} info={dailyData.morning} />
					<Card timeOfDay='day' click={() => this.handleActive('day')} active={activeTabs[0]} info={dailyData.day} />
					<Card timeOfDay='evening' click={() => this.handleActive('evening')} active={activeTabs[1]} info={dailyData.evening} />
					<Card timeOfDay='night' click={() => this.handleActive('night')} active={activeTabs[2]} info={dailyData.night} />
				</>}
			</main>
		)
	}
}
