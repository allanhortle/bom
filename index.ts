#!/usr/bin/env node
import {program} from 'commander';
import pkg from './package.json';
import weather from './src/weather';

program
    .version(pkg.version)
    .option('-d, --debug', 'output extra debugging')
    .option('-s, --station <value>', 'bom station id')
    .arguments('[cmd]')
    .action((cmd, env) => {
        try {
            weather(env);
        } catch (e) {
            console.error(e);
        }
    });

program.parse(process.argv);
