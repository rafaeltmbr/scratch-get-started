const transpileCode = (e) => {
  const handler = transpilationHandlers[e.name];

  const children = e.children?.map((c) => transpileCode(c)) || [];

  if (!handler) return children.join("");

  return handler({ ...e, children });
};

const transpilationHandlers = {
  xml: ({ children }) => {
    const codeBlocks = children.filter((c) => c?.endsWith("\n"));

    return codeBlocks.map((e) => adjustIndentation(e)).join("\n\n");
  },

  field: ({ value }) => value,

  value: ({ children }) => children.slice(-1).join(""),

  block: ({ attributes, children }) => {
    const handler = blockHandlers[attributes.type];
    if (!handler) return children?.map((i) => String(i)).join("") || "";

    return handler(children);
  },

  statement: ({ attributes, children }) =>
    attributes.name === "SUBSTACK"
      ? `  ${children?.join("")}` // start with 2 spaces = first statement
      : `   ${children?.join("")}`, // start with 3 spaces = second statement

  next: ({ children }) => ` ${children?.join("")}`, // start with 1 space = next
};

const blockHandlers = {
  motion_movesteps: ([value, ...next]) => {
    const instruction = value ? `move(${value});\n` : "";

    return `${instruction}${next.join("")}`;
  },

  motion_turnright: ([value, ...next]) => {
    const instruction = value ? `turn_right(${value});\n` : "";

    return `${instruction}${next.join("")}`;
  },

  motion_turnleft: ([value, ...next]) => {
    const instruction = value ? `turn_left(${value});\n` : "";

    return `${instruction}${next.join("")}`;
  },

  operator_gt: (values) => {
    const [operand1, operand2] = values.map((e) => e.trim()).filter((e) => e);

    const op1 = wrapParenthesisIfNecessary(operand1);
    const op2 = wrapParenthesisIfNecessary(operand2);

    return op1 && op2 ? `${op1} > ${op2}` : operand1;
  },

  operator_and: (values) => {
    const [operand1, operand2] = values.map((e) => e.trim()).filter((e) => e);

    const op1 = wrapParenthesisIfNecessary(operand1);
    const op2 = wrapParenthesisIfNecessary(operand2);

    return op1 && op2 ? `${op1} && ${op2}` : operand1;
  },

  operator_or: (values) => {
    const [operand1, operand2] = values.map((e) => e.trim()).filter((e) => e);

    const op1 = wrapParenthesisIfNecessary(operand1);
    const op2 = wrapParenthesisIfNecessary(operand2);

    return op1 && op2 ? `${op1} || ${op2}` : operand1;
  },

  operator_not: (values) => {
    const [operand1] = values.map((e) => e.trim()).filter((e) => e);

    const op1 = wrapParenthesisIfNecessary(operand1);
    return op1 ? `!${op1}` : "";
  },

  control_if: (args) => {
    const condition = args.find((e) => initialSpaceCount(e) === 0) || "";
    const statement = args.find((e) => initialSpaceCount(e) === 2) || "";
    const next = args.find((e) => initialSpaceCount(e) === 1) || "";

    return `if (${condition}) {\n${statement}}\n${next}`;
  },

  control_if_else: (args) => {
    const condition = args.find((e) => initialSpaceCount(e) === 0) || "";
    const stt1 = args.find((e) => initialSpaceCount(e) === 2) || "";
    const stt2 = args.find((e) => initialSpaceCount(e) === 3) || "";
    const next = args.find((e) => initialSpaceCount(e) === 1) || "";

    return `if (${condition}) {\n${stt1}} else {\n${stt2}}\n${next}`;
  },

  control_repeat: ([condition, statement, ...next]) =>
    `for (int i = 0; i < ${condition || "0"}; i += 1) {\n${
      statement || "\n"
    }}\n${next.join("")}`,

  event_whenflagclicked: (values) =>
    `void when_flag_is_clicked() {\n${values.join("")}}\n`,
};

const initialSpaceCount = (value) => {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charAt(i) !== " ") return i;
  }

  return 0;
};

const wrapParenthesisIfNecessary = (value) => {
  const val = value?.trim() || "";

  return val.split(" ").length > 1 ? `(${val})` : val;
};

const adjustIndentation = (value, spaces = 0, step = 2) => {
  if (!value) return "";

  return value
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e)
    .map((line) => {
      if (line.startsWith("}") || line.endsWith("}"))
        spaces = Math.max(spaces - step, 0);

      const newLine = prefixSpaces(line, spaces);

      if (line.endsWith("{")) spaces += step;

      return newLine;
    })
    .join("\n");
};

const prefixSpaces = (value, spaces) =>
  `${"".padStart(spaces, " ")}${value || ""}`;
