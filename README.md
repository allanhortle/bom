# bom cli

## Install 
```
npm install -g bom-cli
```

```
Usage: bom [options] [search]

Get current the current weather and forecast from the BOM

Options:
  -V, --version        output the version number
  -p, --print <value>  use escape characters to print specific metrics
  -i, --id <value>     use a BOM station id
  -h, --help           display help for command

Examples:
  $ bom melbourne
  $ bom 3121
  $ bom --print "%t"

Print escape character reference:

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
```
