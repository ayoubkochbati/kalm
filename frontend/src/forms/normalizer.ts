export const NormalizePort = (value: string, _previousValue?: any, _allValues?: any, _previousAllValues?: any) => {
  const portInteger = parseInt(value, 10);

  if (isNaN(portInteger)) {
    return "";
  }

  if (portInteger < 0) {
    return 0;
  }

  if (portInteger > 65535) {
    return 65535;
  }

  return portInteger;
};

export const NormalizeNumber = (
  value: string,
  _previousValue?: any,
  _allValues?: any,
  _previousAllValues?: any
): number | any => {
  const integerValue = parseInt(value, 10);
  return isNaN(integerValue) ? "" : integerValue;
};

export const NormalizeCPU = (value: string): string | null => {
  if (!value || value === "") {
    return null;
  }

  return value;
};

export const NormalizeMemory = (value: string): string => {
  if (!value || value === "0") {
    return "0";
  }

  while (value.length > 0 && value[0] === "0") {
    value = value.slice(1);
  }

  return value;
};

export const NormalizeBoolean = (value: string): boolean => {
  return !!value;
};

export const NormalizeHosts = (values: string[] | string, previousValue: string[]): string[] => {
  console.log("NormalizeHosts", values, "isArray", Array.isArray(values), previousValue);
  // only if no tags in autocomplete but unsubmit text in input field

  let res;
  if (!Array.isArray(values)) {
    res = previousValue;
  } else {
    res = values;
  }
  // console.log("res", res);
  return res;
};

export const NormalizeNumberOrAlphabet = (value: string): string | number => {
  const portInteger = parseInt(value, 10);
  if (isNaN(portInteger) && portInteger > 0) {
    return portInteger;
  } else {
    if (value.match(/^([a-zA-Z]*)$/)) {
      return value;
    }
  }
  return "";
};
