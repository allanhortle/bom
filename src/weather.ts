import axios from 'axios';
import {observations, forecast} from './data/bom';
import {underline, bold, blue, green, yellow, red} from 'chalk';
import List from 'list-it';
import {format} from 'stringdate';

type Args = {
    station: string
};
export default async function weather(args: Args) {
    const oo = await observations(args.station);
    const ff = await forecast(args.station);
    const {station, wind, temp, temp_feels_like, rain_since9am, humidity} = oo;

    const max = Math.max(...ff.map(ii => ii.temp_max).filter(Boolean));
    const min = Math.min(...ff.map(ii => ii.temp_min).filter(Boolean));
    const today = ff[0];

    const tempColor = (num, other) => {
        let color = green;
        if(num <= 12) color = blue;
        if(num > 20) color = yellow;
        if(num > 30) color = red;
        if(num > 36) color = magenta;
        return color(other || num)
    }
    const celcius = (ii) => tempColor(ii, `${ii}°C`);

    const stats = new List({
        autoAlign: true
    }).d([
        [`${today.now.now_label}:`, `${celcius(today.now.temp_now)}`],
        [`${today.now.later_label}:`, `${celcius(today.now.temp_later)}`],
        [`Temperature:`, `${celcius(temp)} (${celcius(temp_feels_like)})`],
        [`Humidity:`, `${humidity}%`],
        [`Rain:`, `${rain_since9am || 0}mm`],
        [`Wind:`, `${wind.speed_kilometre}km/h ${wind.direction}`],
    ]).toString();

    const forecastTable = new List({
            autoAlign : true,
            headerUnderline: true,
        })
        .setHeaderRow(['Date', 'Forecast', 'Low', '', 'High', 'Rain', ''])
        .d(ff.slice(1).map(ii => {
            const bar = Array.from(Array(max - min + 1));

            const {rain, date = '', short_text = '', temp_min = '', temp_max = ''} = ii;
            return [
                format('MMM dd')(date), 
                short_text, 
                tempColor(temp_min || ''),
                bar.map((_, index) => {
                    const offset = index + min;
                    return offset >= temp_min && offset <= temp_max ? tempColor(offset, '=') : ' '
                }).join(''),
                tempColor(temp_max),
                `${rain.chance}%`,
                `${rain.amount.min}-${rain.amount.max || 0}mm`
            ];
        })).toString();


    const print = [
        '',
        underline(station.name),
        '',
        today.extended_text.split('. ').map(ii => '* ' + ii).join('\n'),
        '',
        stats,
        '',
        forecastTable
    ].join('\n')
        .split('\n').map(ii => '  ' + ii).join('\n')
        

    console.log(print);

}
