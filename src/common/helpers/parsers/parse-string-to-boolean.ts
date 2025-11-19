import { TransformFnParams } from 'class-transformer';

export function transformStringToBoolean(params: TransformFnParams) {
  const value = params.value;
  if (!value) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
    return false;
  }
  return undefined;
}
