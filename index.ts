#!/usr/bin/env node
import {program} from 'commander';
import pkg from './package.json';
import weather from './src/weather';
import forecast from './src/forecast';
import print from './src/print';
import {search} from './src/data/bom';

program
    .version(pkg.version)
    .description('Get current the current weather and forecast from the BOM')
    .option('-p, --print <value>', 'use escape characters to print specific metrics')
    .option('-f, --forecast', 'use escape characters to print specific metrics')
    .option('-i, --id <value>', 'use a BOM station id')
    .arguments('<search>')
    .action(async (city, env) => {
        let id;
        let command = 'today';
        try {
            if (env.print) command = 'print';
            if (env.forecast) command = 'forecast';
            if (env.id) id = env.id;
            if (search) {
                let results = await search(city);
                id = results[0]?.geohash?.slice(0, -1);
            }

            switch (command) {
                case 'forecast':
                    return await forecast(id);

                case 'print':
                    return await print(id, env.print);

                case 'today':
                default:
                    return await weather(id);
            }
        } catch (e) {
            if (e?.response?.status === 400) {
                return console.log(`Error: Weather station ${id} not found`);
            }
            return console.log(`Error: ${e.message}`);
        }
    });

program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ bom melbourne');
    console.log('  $ bom 3121');
    console.log('  $ bom --print "%t"');
    console.log('');
    console.log('Print escape character reference:');

    console.log(`
  Observations
    %t Temperature
    %y Temperature feels like
    %r Rain since 9
    %h Humidity
    %w Wind speed
    %d Wind direction

  Forecast
    %f Forecast text
    %F Forecast extended text
    %u UV category
    %U UV index
    %x Fire Danger
    %s Sunrise
    %S Sunset
    %- Min
    %+ Max
    %c Rain Chance
    %a Rain Amount

  Meta
    %i Issued at
`);
});

program.parse(process.argv);
