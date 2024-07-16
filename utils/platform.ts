import {Platform} from 'react-native';

export function android<T>(value: T): T | undefined {
  return Platform.OS === 'android' ? value : undefined;
}
