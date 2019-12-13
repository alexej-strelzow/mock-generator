import getConfig from 'config';

export type ConfigName = 'endpoints';

export function config<T>(name: ConfigName): T {
  return getConfig.get(name) as T;
}
