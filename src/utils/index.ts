export * from './readline';

const parseJson = (json: string): object | Array<any> | null => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export { parseJson };
