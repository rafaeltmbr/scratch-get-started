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

    window.xxml = xml;
    console.log(xml);

    codeContainer.innerText = handleTranspilation(parseHTMLUnknownElement(xml));
  }

  // insert the start code into Blockly workspace area (optional)
  Blockly.Xml.domToWorkspace(document.getElementById("startBlocks"), workspace);

  // keep track of every workspace change and update the XML representation
  workspace.addChangeListener(showXmlStructure);
  showXmlStructure();
});
