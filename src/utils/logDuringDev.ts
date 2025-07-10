function logDuringDev(...data: Array<any>) {
  if (!import.meta.env.DEV) return;
  console.log(...data);
}

export default logDuringDev;
