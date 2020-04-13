#!/usr/bin/env node
import {program} from 'commander';
import pkg from './package.json';
import weather from './src/weather';
import print from './src/print';
import {search} from './src/data/bom';

// %t temp
// %y temp feels like
// %r rain since 9
// %h humidity
// %w wind speed
// %d wind direction

// %F forecast
// %f forecast short
// %u uv
// %x fire danger
// %s sunrise
// %S sunset
// %- min
// %+ max
// %R rain 

// %i issued at

program
    .version(pkg.version)
    .description('Get current the current weather and forecast from the BOM')
    .option('-p, --print <value>', 'use escape characters to print specific metrics')
    .option('-i, --id <value>', 'use a BOM station id')
    .arguments('[search]')
    .action(async (query, env) => {
        let id;
        if(query) {
            let results = await search(query);
            id = results[0].geohash.slice(0, -1);
        }
        if(env.id) id = env.id;


        try {
            return (env.print) ? print(id, env.print) : weather(id);
        } catch (e) {
            console.error(e);
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
