import axios from 'axios';

const requestHandler = (request: Promise<any>) => {
    return request
        .then(ii => Promise.resolve({
            ...ii.data.data,
            metadata: ii.data.metadata
        }))
        .catch(e => console.error(e.message));
}

export function observations(id: string): Promise<any> {
    return requestHandler(axios.get(`https://api.weather.bom.gov.au/v1/locations/${id}/observations`));
}

export function forecast(id: string, type: 'daily' | '3-hourly' = 'daily'): Promise<any> {
    const location = `https://api.weather.bom.gov.au/v1/locations/${id}/forecasts/${type}`;
    return requestHandler(axios.get(location));
}

export function search(search: string): Promise<any> {
    return requestHandler(axios.get(`https://api.weather.bom.gov.au/v1/locations?search=${search}`));
}
