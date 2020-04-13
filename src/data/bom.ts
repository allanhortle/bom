import axios from 'axios';

const requestHandler = async (request: Promise<any>) => {
    return request
        .then(ii => ii.data.data)
        .catch(e => console.error(e.message));
}

export async function observations(id: string): Promise<any> {
    const response = await axios.get(`https://api.weather.bom.gov.au/v1/locations/${id}/observations`);
    return {
        ...response.data.data,
        metadata: response.data.metadata
    };
}

export function forecast(id: string, type: 'daily' | '3-hourly' = 'daily'): Promise<any> {
    const location = `https://api.weather.bom.gov.au/v1/locations/${id}/forecasts/${type}`;
    return requestHandler(axios.get(location));
}

export function search(search: string): Promise<any> {
    return requestHandler(axios.get(`https://api.weather.bom.gov.au/v1/locations?search=${search}`));
}
