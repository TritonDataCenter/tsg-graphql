'use strict';

exports.toNameValues = (obj) => {
  if (!obj) {
    return [];
  }

  return Object.keys(obj).map((name) => {
    const value = obj[name];
    return { name, value };
  });
};

exports.fromNameValues = (nameValues = []) => {
  const obj = {};
  nameValues.forEach(({ name, value }) => {
    obj[name] = value;
  });

  return obj;
};
