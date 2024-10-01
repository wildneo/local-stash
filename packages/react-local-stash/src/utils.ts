export function resolveValue<TData>(value: TData | (() => TData)): TData;
export function resolveValue<TData>(value: TData | ((previousValue: TData) => TData), previousValue: TData): TData;
export function resolveValue<TData>(
  value: TData | ((previousValue?: TData) => TData),
  previousValue?: TData
): TData {
  return value instanceof Function ? value(previousValue) : value;
}
