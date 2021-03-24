import axios from "axios";

type Rain = {
  chance: number;
  amount: { min: number; max: number | null; units: string };
};
type Wind = { speed_kilometre: number; direction: string };
type Station = { bom_id: string; name: string; distance: number };
type UV = {
  category: string;
  end_time: string;
  max_index: number;
  start_time: string;
};
type Astronomical = { sunset_time: string; sunrise_time: string };

type Response<T> = Promise<{
  metadata: { response_timestamp: string; issue_time: string };
  data: T;
}>;

type Observation = {
  temp: number;
  temp_feels_like: number;
  wind: Wind;
  rain_since_9am: number;
  humidity: number;
  station: Station;
};
export async function observations(id: string): Response<Observation> {
  const { data } = await axios.get(
    `https://api.weather.bom.gov.au/v1/locations/${id}/observations`
  );
  return data;
}

export type ForecastDaily = {
  rain: Rain;
  date: string;
  temp_min: number;
  temp_max: number;
  short_text: string;
  extended_text: string;
  fire_danger: string | null;
  uv: UV;
  astronomical: Astronomical;
  now: {
    is_night: boolean;
    now_label: string;
    later_label: string;
    temp_now: number;
    temp_later: number;
  };
};
export async function forecastDaily(
  id: string
): Response<Array<ForecastDaily>> {
  const { data } = await axios.get(
    `https://api.weather.bom.gov.au/v1/locations/${id}/forecasts/daily`
  );
  return data;
}

type ForecastHourly = {
  rain: Rain;
  temp: number;
  wind: Wind;
  time: string;
  icon_descriptor: string;
  is_night: boolean;
};
export async function forecastHourly(id: string): Response<ForecastHourly> {
  const { data } = await axios.get(
    `https://api.weather.bom.gov.au/v1/locations/${id}/forecasts/3-hourly`
  );
  return data;
}

type SearchResult = {
  geohash: string;
  id: string;
  name: string;
  postcode: string;
  state: string;
};
export async function search(search: string): Promise<SearchResult[]> {
  const { data } = await axios.get(
    `https://api.weather.bom.gov.au/v1/locations?search=${search}`
  );
  return data.data;
}
