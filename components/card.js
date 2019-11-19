import styled from 'styled-components'

const Tab = styled.div`
    position: absolute;
    width: 100%;
    height: 50%;
    box-shadow: 0 1px 25px 3px rgba(0,0,0,0.35);
    transition: all 0.75s;
    &.morning {
        background: #f3904f;
        background: linear-gradient(to top, #f3904f, #3b4371);
        bottom: 50%;
        z-index: 996;
    }
    &.day {
        background: #83a4d4;
        background: linear-gradient(to bottom, #83a4d4, #54f6ff);
        bottom: 0;
        z-index: 997;
        bottom: ${props => props.active ? '33.333%' : ''}
    }
    &.evening {
        background: #2c3e50;
        background: linear-gradient(to top, #2c3e50, #fd746c);
        bottom: -16.666%;
        z-index: 998;
        bottom: ${props => props.active ? '16.666%' : ''}
    }
    &.night {
        background: #141e30;
        background: linear-gradient(to top, #141e30, #243b55);
        bottom: -33.333%;
        z-index: 999;
        bottom: ${props => props.active ? '0' : ''}
    }
`

const Header = styled.header`
    display: flex;
    flex-flow: column;
    justify-content: space-around;
    box-sizing: border-box;
    width: 100%;
    height: 33.333%;
    text-align: right;
    & h3, h5{
        display: block;
        margin-right: 20px;
    }
    & h3 {
        color: #e4e4e4;
        font-size: 1em;
        margin-bottom: -15px;
    }
    & h5 {
        color: #fff;
        font-size: 2.5em;
    }
`

const Info = styled.div`
    display: grid;
    grid-template-columns: 40% 60%;
    color: #fff;
    padding: 1em;
    > .forecast {
        width: 100%;
        text-align: left;
        margin-right: 4%;
    }
    > .svgWrapper {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    & img {
        width: 75%;
        height: auto;
    }
`

const weatherType = (str) => {
    let type = 'Clear'
    if(str.includes('pcloudy')){type = 'Partially Cloudy'}
    if(str.includes('mcloudy')){type = 'Cloudy'}
    if(str.includes('cloudy')){type = 'Very Cloudy'}
    if(str.includes('humid')){type = 'Humid'}
    if(str.includes('lightrain') || str.includes('shower')){type = 'Light rain'}
    if(str.includes('rain')){type = 'Rainy'}
    if(str.includes('snow')){type = 'Snow'}
    return type
}

const Card = ({active, timeOfDay, info, click}) => (
    <Tab class={timeOfDay} onClick={click} active={active}>
        <Header>
            <h3>{timeOfDay.toUpperCase()}</h3>
            <h5>{info.temp}&#176;</h5>
        </Header>
        <Info>
            <div class='forecast'>
                <h2>{weatherType(info.weather)}</h2>
                <p>{`Humidity: ${info.humidity}%`}</p>
                <p>{`Wind: ${info.wind}m/s ${info.windDirection}`}</p>
            </div>
            <div class='svgWrapper'>
                <img src={require(`../assets/icons/${info.weather}.svg`)} alt=''/>
            </div>
        </Info>
    </Tab>
)

export default Card