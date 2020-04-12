import axios from 'axios';
import {observations, forecast} from './data/bom';
import scale from './data/scale';
import {underline, bold, blue, green, yellow, red, bgWhite, magenta} from 'chalk';
import List from 'list-it';
import {format, isSame, now} from 'stringdate';
import get from 'unmutable/get';
import pipe from 'unmutable/pipe';

type Args = {
    station: string
};

type Rain = {chance: number, amount: {min: number, max: number | null, units: string}};

type HourlyForecast = {
    rain: Rain,
    temp: number,
    wind: {speed_kilometre: number, direction: string},
    time: string,
    icon_descriptor: string,
    is_night: boolean,
};

type DailyForecast = {
    rain: Rain,
    date: string,
    temp_min: number,
    temp_max: number,
    short_text: string,
    extended_text: string,
    now: {is_night: boolean, now_label: string, later_label: string, temp_now: number, temp_later: number}
};

const celcius = (ii: number) => tempColor(ii, `${ii}°C`);
const tempColor = (num: number, other?: any) => {
    let color = green;
    if(num <= 12) color = blue;
    if(num > 20) color = yellow;
    if(num > 30) color = red;
    if(num > 36) color = magenta;
    return color(other || num);
}
const rainAmount = ({amount}: Rain) => {
    const {min, max} = amount;
    if(!max) return `${min}mm`;
    if(!min) return `${max}mm`;
    return `${min}-${max}mm`;
}
const icon = (ii: string): string => {
    if(ii === 'sunny') return 'Sunny';
    if(ii === 'mostly_sunny') return 'Mostly Sunny';
    if(ii === 'cloudy') return 'Cloudy';
    if(ii === 'shower') return 'Shower';
    return ii;
}

function todayTable(data: Array<HourlyForecast>): string {
    const max = Math.max(...data.map(_ => _.temp));
    const min = Math.min(...data.map(_ => _.temp));
    const bar = Array.from(Array(12));
    const scaleBar = scale([min, max], [0, 11]);

    return new List({autoAlign : true, headerUnderline: true})
        .setHeaderRow(['Time', '', 'Temp', '', 'Rain', 'Wind'])
        .d(data
            .filter(pipe(get('time'), isSame(now(), 'day')))
            .map(({rain, time, temp, icon_descriptor, wind}) => [
                `${format('EEE')(time)} ${format('ha')(time).toLowerCase()}`,
                icon(icon_descriptor),
                bar.map((_, index) => index <= scaleBar(temp) ? tempColor(temp, '=') : ' ').join(''),
                tempColor(temp),
                `${rain.chance}% ${rainAmount(rain)}`,
                `${wind.speed_kilometre}km/h ${wind.direction}`
            ])
        )
       .toString();
}

function forecastTable(data: Array<DailyForecast>): string {
    const max = Math.max(...data.map(ii => ii.temp_max).filter(Boolean));
    const min = Math.min(...data.map(ii => ii.temp_min).filter(Boolean));
    return new List({autoAlign : true, headerUnderline: true})
        .setHeaderRow(['Date', 'Forecast', 'Low', '', 'High', 'Rain'])
        .d(data.slice(1).map(ii => {
            const bar = Array.from(Array(max - min + 1));
            const {rain, date = '', short_text = '', temp_min, temp_max} = ii;
            return [
                format('EEE do')(date), 
                short_text, 
                tempColor(temp_min),
                bar.map((_, index) => {
                    const offset = index + min;
                    return offset >= temp_min && offset <= temp_max ? tempColor(offset, '=') : ' '
                }).join(''),
                tempColor(temp_max),
                `${rain.chance}% ${rainAmount(rain)}`
            ];
        }))
        .toString();

}

export default async function weather(args: Args) {
    const oo = await observations(args.station);
    const ff: Array<DailyForecast> = await forecast(args.station);
    const tt: Array<HourlyForecast> = await forecast(args.station, '3-hourly');
    const {station, wind, temp, temp_feels_like, rain_since9am, humidity} = oo;
    const today = ff[0];

    const stats = new List({autoAlign: true}).d([
        [`${today.now.now_label}:`, `${celcius(today.now.temp_now)}`],
        [`${today.now.later_label}:`, `${celcius(today.now.temp_later)}`],
        [`Temperature:`, `${celcius(temp)} (${celcius(temp_feels_like)})`],
        [`Humidity:`, `${humidity}%`],
        [`Rain:`, `${rain_since9am || 0}mm`],
        [`Wind:`, `${wind.speed_kilometre}km/h ${wind.direction}`],
    ]).toString();

    console.log([
        '',
        underline.bold(station.name),
        '',
        today.extended_text.split('. ').map((ii: string) => '* ' + ii).join('\n'),
        '',
        stats,
        '',
        '',
        underline.bold('Today'),
        '',
        todayTable(tt),
        '',
        '',
        underline.bold('Forecast'),
        '',
        forecastTable(ff),
        ''
    ].join('\n').split('\n').map(ii => '  ' + ii).join('\n'));
}
