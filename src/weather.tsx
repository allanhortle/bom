import {observations, forecastDaily, forecastHourly} from './data/bom';
import scale from './data/scale';
import {format} from 'stringdate';
import React, {useState, useRef, useEffect} from 'react';
import {render, Text, Box, measureElement} from 'ink';

type Args = {
    station: string;
};

const tempColor = (num?: number) => {
    let color = 'green';
    if (num == null) return 'white';
    if (num <= 12) color = 'blue';
    if (num > 20) color = 'yellow';
    if (num > 30) color = 'red';
    if (num > 36) color = 'magenta';
    return color;
};

function Wind(props) {
    const {speed_kilometre, direction} = props.data;
    return (
        <Text color={speed_kilometre >= 50 ? 'red' : 'white'}>
            {speed_kilometre != null ? `${speed_kilometre}km/h ` : ''}
            {direction}
        </Text>
    );
}

function Rain(props) {
    const {
        chance,
        amount: {min, max}
    } = props.data;
    let value = `${min}-${max}mm`;
    if (!max) value = `${min}mm`;
    if (!min) value = `${max}mm`;
    if (!max && !min) value = '';
    return (
        <Text color={chance >= 25 ? 'cyan' : 'white'}>
            {chance}% {value}
        </Text>
    );
}

function Celcius(props) {
    const num = props.children;
    return <Text color={tempColor(num)}>{num}°C</Text>;
}

function Temp(props) {
    const num = props.children;
    return <Text color={tempColor(num)}>{num || '-'}</Text>;
}

function Weather(props) {
    const {metadata, observations, daily, hourly} = props;
    const {station, wind, temp, temp_feels_like, rain_since_9am, humidity} = observations;
    return (
        <Box paddingX={2} paddingY={1} flexDirection="column">
            <Box marginBottom={1}>
                <Text bold underline>
                    {station.name} {format('h:mma')(metadata.issue_time)}
                </Text>
            </Box>
            <Box marginBottom={1} flexDirection="column">
                {daily[0].extended_text.split('. ').map((ii: string, key: number) => (
                    <Text key={key}>* {ii}</Text>
                ))}
            </Box>
            <Box flexDirection="column" width={24} marginBottom={1}>
                <KeyValueTable
                    data={[
                        ['Temp', <Celcius>{temp}</Celcius>],
                        ['Feels like', <Celcius>{temp_feels_like}</Celcius>],
                        ['Wind', <Wind data={wind} />],
                        ['Humidity', <Text>{humidity || 0}%</Text>],
                        ['Rain', <Text>{rain_since_9am || 0}mm</Text>]
                    ]}
                />
            </Box>
            <Box marginBottom={2} flexDirection="column">
                <Text bold underline children="Today" />
                <Box marginTop={1}>
                    <TodayTable hourly={hourly} />
                </Box>
            </Box>
            <Box flexDirection="column">
                <Text bold underline children="Forecast" />
                <Box marginTop={1}>
                    <ForecastTable daily={daily} />
                </Box>
            </Box>
        </Box>
    );
}

function KeyValueTable(props) {
    return (
        <Box flexDirection="column">
            {props.data.map(([key, value]) => (
                <Box key={key} justifyContent="space-between">
                    <Text>{key}:</Text>
                    {value}
                </Box>
            ))}
        </Box>
    );
}

function ForecastTable(props) {
    const daily = props.daily.slice(0);
    const max = Math.max(...daily.map((ii) => ii.temp_max).filter(Boolean));
    const min = Math.min(...daily.map((ii) => ii.temp_min).filter(Boolean));
    const bar = Array.from(Array(max - min + 1));
    return (
        <Box>
            <Column title="Date">
                {daily.map(({date}, key: number) => (
                    <Text key={key}>{key === 0 ? 'Today' : format('EEE do')(date)}</Text>
                ))}
            </Column>
            <Column title="Forecast">
                {daily.map(({short_text}, key: number) => (
                    <Text key={key}>{short_text}</Text>
                ))}
            </Column>
            <Column title="Min">
                {daily.map(({temp_min}, key: number) => (
                    <Temp key={key} children={temp_min} />
                ))}
            </Column>
            <Column title=" ">
                {daily.map(({temp_min, temp_max}, key: number) => (
                    <Box key={key}>
                        {bar.map((_, index) => {
                            const offset = index + min;
                            return (
                                <Text key={index} color={tempColor(offset)}>
                                    {offset >= temp_min && offset <= temp_max ? '=' : ' '}
                                </Text>
                            );
                        })}
                    </Box>
                ))}
            </Column>
            <Column title="Max">
                {daily.map(({temp_max}, key: number) => (
                    <Temp key={key} children={temp_max} />
                ))}
            </Column>
            <Column title="Rain">
                {daily.map(({rain}, key: number) => (
                    <Rain key={key} data={rain} />
                ))}
            </Column>
        </Box>
    );
}

function TodayTable(props) {
    const {hourly} = props;
    const max = Math.max(...hourly.map((_) => _.temp));
    const min = Math.min(...hourly.map((_) => _.temp));
    const bar = Array.from(Array(12));
    const scaleBar = scale([min, max], [0, 11]);
    return (
        <Box>
            <Column title="Time">
                {hourly.map(({time}, key: number) => (
                    <Text key={key}>
                        {format('EEE')(time)} {format('ha')(time).toLowerCase()}
                    </Text>
                ))}
            </Column>
            <Column title=" ">
                {hourly.map(({icon_descriptor}, key: number) => (
                    <Text key={key}>{icon_descriptor.replace(/_/g, ' ')}</Text>
                ))}
            </Column>
            <Column title="Temp">
                {hourly.map(({temp}, key: number) => (
                    <Box key={key}>
                        {bar.map((_, index) => (
                            <Text key={index} color={tempColor(temp)}>
                                {index <= scaleBar(temp) ? '=' : ''}
                            </Text>
                        ))}
                    </Box>
                ))}
            </Column>
            <Column title=" ">
                {hourly.map(({temp}, key: number) => (
                    <Temp key={key}>{temp}</Temp>
                ))}
            </Column>
            <Column title="Rain">
                {hourly.map(({rain}, key: number) => (
                    <Rain key={key} data={rain} />
                ))}
            </Column>
            <Column title="Wind">
                {hourly.map(({wind}, key: number) => (
                    <Wind key={key} data={wind} />
                ))}
            </Column>
        </Box>
    );
}

function Column(props) {
    const ref = useRef();
    const [width, setWidth] = useState(props.title.length);

    useEffect(() => {
        const measurement = measureElement(ref.current);
        setWidth(measurement.width);
    }, []);

    return (
        <Box marginRight={1}>
            <Box ref={ref} flexDirection="column">
                <Text>{props.title}</Text>
                <Text>{'-'.repeat(width)}</Text>
                {props.children}
            </Box>
        </Box>
    );
}

export default async function weather(id) {
    const {data: oo, metadata} = await observations(id);
    const {data: ff} = await forecastDaily(id);
    const {data: tt} = await forecastHourly(id);
    render(<Weather metadata={metadata} observations={oo} daily={ff} hourly={tt} />);
}
