export const Pid = 0;
export const contractAddress = '0xAC4f14a033E81c5EA704daAf7d0153A102b63af8';
export const address0 = '0x0000000000000000000000000000000000000000';
export function formatUnits(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith('-');
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  // eslint-disable-next-line prefer-const
  let [integer, fraction] = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];
  fraction = fraction.replace(/(0+)$/, '');
  return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
}
