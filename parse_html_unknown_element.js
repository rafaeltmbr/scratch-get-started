const convertNamedNodeMapToSimpleObject = (n) =>
  Object.keys(n).reduce((acc, k) => {
    acc[n[k].name] = n[k].value;
    return acc;
  }, {});

const convertHTMLCollectionToArray = (c) => Object.keys(c).map((k) => c[k]);

const isEmptyOrFalsy = (v) => {
  if (typeof v !== "object") return !v;

  if (Array.isArray(v)) return !v.length;

  return !Object.keys(v).length;
};

const removeEmptyProperties = (o) => {
  const parsed = {};

  Object.keys(o).forEach((k) => {
    if (!isEmptyOrFalsy(o[k])) parsed[k] = o[k];
  });

  return parsed;
};

const parseHTMLUnknownElement = (e) => {
  if (!e.localName) return [];

  const parsed = {
    name: e.localName,
    attributes: convertNamedNodeMapToSimpleObject(e.attributes),
    children: e.children.length
      ? convertHTMLCollectionToArray(e.children).map(parseHTMLUnknownElement)
      : parseHTMLUnknownElement(e.innerText),
    value: e.children.length ? undefined : e.innerText,
  };

  return removeEmptyProperties(parsed);
};
