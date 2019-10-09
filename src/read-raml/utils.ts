import { parse } from 'url';

export const setProps = (obj, property, value) => {
  if (value) { obj[property] = value; }
};

export const getPathname = (url) => {
  return parse(url).pathname;
};
