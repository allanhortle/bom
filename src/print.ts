import {observations, forecast} from './data/bom';
import {format} from 'stringdate';

export default async function weather(id: string, print: string) {
    const oo = await observations(id);
    const ff = await forecast(id);
    const {metadata, station, wind, temp, temp_feels_like, rain_since9am, humidity} = oo;

    const matches = new Map();
    matches.set('%t', temp);
    matches.set('%y', temp_feels_like);
    matches.set('%r', rain_since9am || 0);
    matches.set('%w', wind.speed_kilometre);
    matches.set('%d', wind.direction);
    matches.set('%h', humidity);

    const {uv, astronomical, temp_min, temp_max, extended_text, short_text, fire_danger, rain} = ff[0];
    matches.set('%f', short_text);
    matches.set('%F', extended_text);
    matches.set('%u', uv.category);
    matches.set('%U', uv.max_index);
    matches.set('%x', fire_danger);
    matches.set('%s', format('HH:mm')(astronomical.sunrise_time));
    matches.set('%S', format('HH:mm')(astronomical.sunset_time));
    matches.set('%-', temp_min);
    matches.set('%+', temp_max);
    matches.set('%c', rain.chance);
    matches.set('%a', rain.amount.max || 0);

    matches.set('%i', format('yyyy-MM-dd HH:mm')(metadata.issue_time));

    (print.match(/%[a-zA-Z]/g) || [])
        .forEach((key) => {
            if(!matches.has(key)) throw `${key} is not a valid escape character`;
            print = print.replace(key, matches.get(key));
        });

    console.log(print);
}

