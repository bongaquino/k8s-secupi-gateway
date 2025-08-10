export const formatStorage = (value: number): string => {
  if (value < 0.001) {
    const kb = value * 1024 * 1024;
    return `${Math.round(kb)} KB`;
  }
  if (value < 1) {
    return `${(value * 1024).toFixed(1)} MB`;
  }
  return `${value.toFixed(1)} GB`;
};
