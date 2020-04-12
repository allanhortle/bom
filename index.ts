#!/usr/bin/env node
import {program} from 'commander';
import pkg from './package.json';
import weather from './src/weather';
import {search} from './src/data/bom';

program
    .version(pkg.version)
    .option('-s, --search <value>', 'search')
    .option('-i, --id <value>', 'bom station id')
    .arguments('[cmd]')
    .action(async (cmd, env) => {
        let id;
        if(cmd) {
            let results = await search(cmd);
            id = results[0].geohash.slice(0, -1);
        }
        if(env.id) id = env.id;


        try {
            weather(id);
        } catch (e) {
            console.error(e);
        }
    });

program.parse(process.argv);
