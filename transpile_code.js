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

  if (!handler) return children.join("");

  return handler({ ...e, children });
};
