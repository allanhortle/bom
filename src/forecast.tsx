import {forecastDaily} from './data/bom';
import {format} from 'stringdate';
import React from 'react';
import {render, Text, Box, Spacer} from 'ink';

type Args = {
    station: string;
};

export default async function forecast(id) {
    const {data, metadata} = await forecastDaily(id);
    return render(<Forecast data={data} metadata={metadata} />);
}

function Forecast(props) {
    return (
        <Box flexDirection="column" paddingX={2} paddingY={1}>
            <Box marginBottom={1} width={60}>
                <Text bold>{props.metadata.forecast_region} region forecast</Text>
                <Spacer />
                <Text color="grey">{format('h:mma')(props.metadata.issue_time)}</Text>
            </Box>
            {props.data.map((ii, key) => (
                <Box key={key} flexDirection="column" marginBottom={1} width={60}>
                    <Text color="grey">{format('EEE do MMM')(ii.date)}</Text>
                    <Text>{ii.extended_text}</Text>
                </Box>
            ))}
        </Box>
    );
}
