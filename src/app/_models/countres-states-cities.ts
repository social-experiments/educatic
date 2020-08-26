export interface City {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
}

export interface State {
    id: number;
    name: string;
    state_code: string;
    cities: City[];
}

export interface Country {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
    phone_code: string;
    capital: string;
    currency: string;
    states: State[];
}