window.addEventListener("load", () => {
  const codeContainer = document.querySelector(".code-container");

  // create Blockly workspace
  const workspace = Blockly.inject("blocklyDiv", {
    comments: true,
    disable: false,
    collapse: false,
    media: "./media/",
    readOnly: false,
    rtl: false,
    scrollbars: true,
    toolbox: document.getElementById("toolbox"),
    toolboxPosition: "start",
    horizontalLayout: false,
    sounds: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.675,
      maxScale: 4,
      minScale: 0.25,
      scaleSpeed: 1.1,
    },
    colours: {
      fieldShadow: "rgba(255, 255, 255, 0.3)",
      dragShadowOpacity: 0.6,
    },
  });

  function showXmlStructure() {
    const xml = Blockly.Xml.workspaceToDom(workspace);

    codeContainer.innerText = handleTranspilation(parseHTMLUnknownElement(xml));
  }

  // insert the start code into Blockly workspace area (optional)
  Blockly.Xml.domToWorkspace(document.getElementById("startBlocks"), workspace);

  // keep track of every workspace change and update the XML representation
  workspace.addChangeListener(showXmlStructure);
  showXmlStructure();
});

/* PARSE HTML object to known javascript structure */

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

/* TRANSPILE xml structured to code */

const operationHandlers = {
  motion_movesteps: ([value, ...next]) =>
    `movement(${value});\n${next.join("")}`,

  motion_turnright: ([value, ...next]) =>
    `turnRight(${value});\n${next.join("")}`,

  operator_gt: (values) => values.join(" > "),

  operator_and: (values) => values.join(" && "),

  operator_or: (values) => values.join(" || "),

  operator_not: (values) => `!(${values.join("")})`,

  control_if: (args) => {
    const condition = args.find((e) => !e.startsWith(" ")) || "";
    const statement = args.find((e) => e.startsWith("  ")) || "\n";
    const next =
      args.find((e) => e.startsWith(" ") && !e.startsWith("  ")) || "";

    return `if(${condition}) {\n${statement}}\n${next}`;
  },

  control_repeat: ([condition, statement, ...next]) =>
    `while(${condition || ""}) {\n${statement || "\n"}}\n${next.join("")}`,

  event_whenflagclicked: (values) =>
    `void whenFlagIsClicked() {\n${values.join("")}}\n`,
};

const transpilationHandlers = {
  field: ({ value }) => value,

  block: ({ attributes, children }) => {
    const handler = operationHandlers[attributes.type];
    if (!handler) return children?.map((i) => String(i)).join("") || "";

    return handler(children);
  },

  statement: ({ children }) => `  ${children?.join("")}`, // starts with 2 spaces = statement
  next: ({ children }) => ` ${children?.join("")}`, // starts with 1 space = next
};

const handleTranspilation = (e) => {
  const handler = transpilationHandlers[e.name];

  const children = e.children?.map((c) => handleTranspilation(c)) || [];

  if (!handler) return children.join("") || "";

  return handler({ ...e, children });
};
