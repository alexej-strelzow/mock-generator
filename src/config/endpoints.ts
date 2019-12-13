import { config } from './config';

export interface Endpoint {
  url: string;
  fixtureFile: string;
  interface?: string;
}

export const endpoints: { [id: string]: Endpoint } = config('endpoints');
