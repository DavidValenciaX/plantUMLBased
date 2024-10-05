const { shapes: defaultShapes, dia, util, linkTools } = joint;

const paperContainer = document.getElementById("paper-container");

const COLORS = [
  "#3f84e5",
  "#49306B",
  "#fe7f2d",
  "#ad343e",
  "#899e8b",
  "#ede9e9",
  "#b2a29f",
  "#392F2D"
];

const shapes = { ...defaultShapes };
const graph = new dia.Graph({}, { cellNamespace: shapes });
const paper = new dia.Paper({
  el: document.getElementById("paper"),
  width: "100%",
  height: "100%",
  model: graph,
  async: true,
  multiLinks: false,
  linkPinning: false,
  cellViewNamespace: shapes,
  sorting: dia.Paper.sorting.APPROX,
  defaultConnectionPoint: {
    name: "boundary",
    args: {
      offset: 5
    }
  },
  defaultConnector: {
    name: "jumpover"
  },
  background: {
    color: "#f6f4f4"
  },
  highlighting: {
    connecting: {
      name: "mask",
      options: {
        attrs: {
          stroke: "#0A100D",
          "stroke-width": 3
        }
      }
    }
  },
  restrictTranslate: function (elementView) {
    const parent = elementView.model.getParentCell();
    if (parent) {
      // use cases movement is constrained by the parent area
      return parent.getBBox().inflate(-6);
    }
    return null;
  },
  validateConnection: function (cellViewS, _, cellViewT) {
    if (cellViewT.model instanceof UseCase) return true;
    return false;
  }
});

class Boundary extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "Boundary",
      attrs: {
        body: {
          width: "calc(w)",
          height: "calc(h)",
          fill: COLORS[5],
          stroke: COLORS[6],
          strokeWidth: 1,
          rx: 20,
          ry: 20
        },
        label: {
          y: 10,
          x: "calc(w / 2)",
          textAnchor: "middle",
          textVerticalAnchor: "top",
          fontSize: 18,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: COLORS[7]
        }
      }
    };
  }

  preinitialize(...args) {
    super.preinitialize(...args);
    this.markup = util.svg`
            <rect @selector="body" />
            <text @selector="label" />
        `;
  }
}

const legsY = 0.7;
const bodyY = 0.3;
const headY = 0.15;

class Actor extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "Actor",
      attrs: {
        background: {
          width: "calc(w)",
          height: "calc(h)",
          fill: "transparent"
        },
        body: {
          d: `M 0 calc(0.4 * h) h calc(w) M 0 calc(h) calc(0.5 * w) calc(${legsY} * h) calc(w) calc(h) M calc(0.5 * w) calc(${legsY} * h) V calc(${bodyY} * h)`,
          fill: "none",
          stroke: COLORS[7],
          strokeWidth: 2
        },
        head: {
          cx: "calc(0.5 * w)",
          cy: `calc(${headY} * h)`,
          r: `calc(${headY} * h)`,
          stroke: COLORS[7],
          strokeWidth: 2,
          fill: "#ffffff"
        },
        label: {
          y: "calc(h + 10)",
          x: "calc(0.5 * w)",
          textAnchor: "middle",
          textVerticalAnchor: "top",
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: COLORS[7],
          textWrap: {
            width: "calc(3 * w)",
            height: null
          }
        }
      }
    };
  }

  preinitialize(...args) {
    super.preinitialize(...args);
    this.markup = util.svg`
            <rect @selector="background" />
            <path @selector="body" />
            <circle @selector="head" />
            <text @selector="label" />
        `;
  }
}

class UseCase extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "UseCase",
      attrs: {
        root: {
          highlighterSelector: "body"
        },
        body: {
          cx: "calc(0.5 * w)",
          cy: "calc(0.5 * h)",
          rx: "calc(0.5 * w)",
          ry: "calc(0.5 * h)",
          stroke: COLORS[7],
          strokeWidth: 2
        },
        label: {
          x: "calc(0.5 * w)",
          y: "calc(0.5 * h)",
          textVerticalAnchor: "middle",
          textAnchor: "middle",
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#ffffff",
          textWrap: {
            width: "calc(w - 30)",
            height: "calc(h - 10)",
            ellipsis: true
          }
        }
      }
    };
  }

  preinitialize(...args) {
    super.preinitialize(...args);
    this.markup = util.svg`
            <ellipse @selector="body" />
            <text @selector="label" />
        `;
  }
}

class Use extends shapes.standard.Link {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Use",
        attrs: {
          line: {
            stroke: COLORS[7],
            strokeWidth: 2,
            targetMarker: null
          }
        }
      },
      super.defaults
    );
  }
}

const lineAttrs = {
  stroke: COLORS[7],
  strokeWidth: 2,
  strokeDasharray: "6,2",
  targetMarker: {
    type: "path",
    fill: "none",
    stroke: COLORS[7],
    "stroke-width": 2,
    d: "M 10 -5 0 0 10 5"
  }
};

const defaultLabel = {
  position: 0.5,
  markup: util.svg`
        <rect @selector="labelBody" />
        <text @selector="labelText" />
    `,
  attrs: {
    labelText: {
      fill: COLORS[7],
      fontSize: 12,
      fontFamily: "sans-serif",
      fontWeight: "bold",
      textAnchor: "middle",
      textVerticalAnchor: "middle"
    },
    labelBody: {
      ref: "labelText",
      x: "calc(x - 2)",
      y: "calc(y - 2)",
      width: "calc(w + 4)",
      height: "calc(h + 4)",
      fill: COLORS[5]
    }
  }
};

class Include extends shapes.standard.Link {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Include",
        attrs: {
          line: lineAttrs
        },
        defaultLabel,
        labels: [
          {
            attrs: {
              labelText: {
                text: "<<include>>",
                annotations: [
                  {
                    start: 0,
                    end: 2,
                    attrs: {
                      fill: COLORS[6]
                    }
                  },
                  {
                    start: 9,
                    end: 11,
                    attrs: {
                      fill: COLORS[6]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      super.defaults
    );
  }
}

class Extend extends shapes.standard.Link {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Extend",
        attrs: {
          line: lineAttrs
        },
        defaultLabel,
        labels: [
          {
            attrs: {
              labelText: {
                text: "<<extend>>",
                annotations: [
                  {
                    start: 0,
                    end: 2,
                    attrs: {
                      fill: COLORS[6]
                    }
                  },
                  {
                    start: 8,
                    end: 10,
                    attrs: {
                      fill: COLORS[6]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      super.defaults
    );
  }
}

Object.assign(shapes, {
  Boundary,
  Actor,
  UseCase,
  Use,
  Include,
  Extend
});

function createActor(name, x, y, color) {
  return new Actor({
    size: {
      width: 40,
      height: 80
    },
    position: {
      x,
      y
    },
    attrs: {
      head: {
        fill: color
      },
      label: {
        text: name
      }
    }
  });
}

function createUseCase(useCase, x, y) {
  return new UseCase({
    size: {
      width: 125,
      height: 75
    },
    position: {
      x,
      y
    },
    attrs: {
      label: {
        text: useCase
      }
    }
  });
}

function createUse(source, target) {
  return new Use({
    source: {
      id: source.id,
      connectionPoint: {
        name: "rectangle",
        args: {
          offset: 5
        }
      }
    },
    target: { id: target.id }
  });
}

function createInclude(source, target) {
  return new Include({
    source: { id: source.id },
    target: { id: target.id }
  });
}

function createExtend(source, target) {
  return new Extend({
    source: { id: source.id },
    target: { id: target.id }
  });
}

const boundary = new Boundary({
  size: {
    width: 800,
    height: 1000
  },
  position: {
    x: 200,
    y: 100
  },
  attrs: {
    label: {
      text: "JointJS Support System"
    }
  }
});

const packageHolder = createActor(
  "JointJS+ Support Package Subscriber",
  100,
  400,
  COLORS[0]
);
const jointJSPlusUser = createActor(
  "JointJS+ User\n(Commercial)",
  100,
  700,
  COLORS[1]
);
const jointJSUser = createActor(
  "JointJS User\n(Open Source)",
  100,
  930,
  COLORS[2]
);
const techSupport = createActor(
  "JointJS Technical Support",
  1075,
  550,
  COLORS[3]
);
const community = createActor("Community", 1075, 930, COLORS[4]);

const requestCodeReview = createUseCase("Request Code Review", 400, 150);
const reviewCode = createUseCase("Review Code", 700, 150);
const giveFeedback = createUseCase("Give Feedback", 700, 290);
const proposeChanges = createUseCase("Propose Changes", 700, 425);
const requestConferenceCall = createUseCase(
  "Request Conference Call",
  400,
  350
);
const proposeTimeAndDateOfCall = createUseCase(
  "Propose Time and Date of Call",
  400,
  525
);
const attendConferenceCall = createUseCase("Attend Conference Call", 400, 700);
const contactViaTicketingSystem = createUseCase(
  "Contact via Ticketing System",
  400,
  825
);
const respondToTicket = createUseCase("Respond to Ticket", 700, 825);
const askGithubDiscussion = createUseCase("Ask on GitHub Discussion", 400, 950);
const respondToDiscussion = createUseCase("Respond to Discussion", 700, 950);

boundary.embed([
  requestCodeReview,
  reviewCode,
  giveFeedback,
  proposeChanges,
  requestConferenceCall,
  proposeTimeAndDateOfCall,
  attendConferenceCall,
  contactViaTicketingSystem,
  respondToTicket,
  askGithubDiscussion,
  respondToDiscussion
]);

graph.addCells([
  boundary,
  packageHolder,
  jointJSPlusUser,
  jointJSUser,
  techSupport,
  community,
  requestCodeReview,
  reviewCode,
  giveFeedback,
  proposeChanges,
  requestConferenceCall,
  proposeTimeAndDateOfCall,
  attendConferenceCall,
  contactViaTicketingSystem,
  respondToTicket,
  askGithubDiscussion,
  respondToDiscussion,
  createUse(packageHolder, requestCodeReview),
  createUse(packageHolder, requestConferenceCall),
  createUse(packageHolder, attendConferenceCall),
  createUse(packageHolder, contactViaTicketingSystem),
  createUse(packageHolder, askGithubDiscussion),
  createUse(jointJSPlusUser, contactViaTicketingSystem),
  createUse(jointJSPlusUser, askGithubDiscussion),
  createUse(jointJSUser, askGithubDiscussion),
  createUse(techSupport, reviewCode),
  createUse(techSupport, giveFeedback),
  createUse(techSupport, proposeChanges),
  createUse(techSupport, proposeTimeAndDateOfCall),
  createUse(techSupport, attendConferenceCall),
  createUse(techSupport, respondToTicket),
  createUse(techSupport, respondToDiscussion),
  createUse(community, respondToDiscussion),
  createExtend(proposeChanges, giveFeedback),
  createInclude(reviewCode, requestCodeReview),
  createInclude(giveFeedback, reviewCode),
  createInclude(proposeTimeAndDateOfCall, requestConferenceCall),
  createInclude(attendConferenceCall, proposeTimeAndDateOfCall),
  createInclude(respondToTicket, contactViaTicketingSystem),
  createInclude(respondToDiscussion, askGithubDiscussion)
]);

function getFillColor(colors) {
  if (colors.length === 0) return COLORS[7];
  if (colors.length === 1) return colors[0];

  let step = 1 / colors.length;

  const stops = colors.reduce((acc, color, index) => {
    const offset = index * step;
    acc.push({ color, offset });
    acc.push({ color, offset: offset + step });
    return acc;
  }, []);

  return {
    type: "linearGradient",
    stops,
    attrs: {
      x1: 0.15,
      gradientTransform: "rotate(10)"
    }
  };
}

function fillUseCaseColors() {
  graph.getElements().forEach((element) => {
    if (!(element instanceof UseCase)) return;
    const useCaseActors = graph
      .getNeighbors(element, { inbound: true })
      .filter((el) => el instanceof Actor);
    const colors = useCaseActors.map((actor) => actor.attr("head/fill"));
    element.attr("body/fill", getFillColor(colors), { rewrite: true });
  });
}

fillUseCaseColors();

paper.on("link:connect", () => fillUseCaseColors());
graph.on("remove", () => fillUseCaseColors());

paper.on("link:mouseenter", (linkView) => {
  if (!(linkView.model instanceof Use)) return;
  const toolsView = new dia.ToolsView({
    tools: [
      new linkTools.TargetArrowhead({ scale: 1.2 }),
      new linkTools.Remove({ scale: 1.2 })
    ]
  });
  linkView.addTools(toolsView);
});

paper.on("link:mouseleave", (linkView) => {
  linkView.removeTools();
});

function scaleToFit() {
  const graphBBox = graph.getBBox();
  paper.scaleContentToFit({
    padding: 50,
    contentArea: graphBBox
  });
  const { sy } = paper.scale();
  const area = paper.getArea();
  const yTop = area.height / 2 - graphBBox.y - graphBBox.height / 2;
  const xLeft = area.width / 2 - graphBBox.x - graphBBox.width / 2;
  paper.translate(xLeft * sy, yTop * sy);
}

window.addEventListener("resize", () => scaleToFit());
scaleToFit();

// Helper function to position elements inside or outside boundaries
function getElementPosition(boundary, boundaryElementsPosition, globalX, globalY, globalOffsetX, globalOffsetY, boundaryPadding) {
  let posX, posY;
  if (boundary) {
    // Position element within the current boundary
    const boundaryBBox = boundary.getBBox();
    const boundaryPos = boundaryElementsPosition[boundary.attr("label/text")];
    posX = boundaryPos.x;
    posY = boundaryPos.y;
    // Update the position for the next element within the boundary
    boundaryElementsPosition[boundary.attr("label/text")].x += globalOffsetX;
    if (boundaryElementsPosition[boundary.attr("label/text")].x > boundaryBBox.x + boundaryBBox.width - boundaryPadding) {
      // Move to the next row if the current row is full
      boundaryElementsPosition[boundary.attr("label/text")].x = boundaryBBox.x + boundaryPadding;
      boundaryElementsPosition[boundary.attr("label/text")].y += globalOffsetY;
    }
  } else {
    // Position element globally
    posX = globalX;
    posY = globalY;
    globalX += globalOffsetX;
    if (globalX > 800) {
      // Move to the next row if the current row is full
      globalX = 50;
      globalY += globalOffsetY;
    }
  }
  return { x: posX, y: posY, globalX, globalY };
}

// Helper function to calculate boundary size based on the number of elements inside it
function calculateBoundarySize(boundaryElements, boundaryPadding, globalOffsetX, globalOffsetY) {
  if (boundaryElements.length === 0) {
    return { width: 300, height: 200 }; // Default size if no elements
  }

  let maxX = 0;
  let maxY = 0;

  boundaryElements.forEach((element) => {
    const bbox = element.getBBox();
    const elementRight = bbox.x + bbox.width;
    const elementBottom = bbox.y + bbox.height;

    if (elementRight > maxX) {
      maxX = elementRight;
    }
    if (elementBottom > maxY) {
      maxY = elementBottom;
    }
  });

  return {
    width: maxX - boundaryElements[0].position().x + boundaryPadding + globalOffsetX,
    height: maxY - boundaryElements[0].position().y + boundaryPadding + globalOffsetY,
  };
}

document.getElementById("generate-diagram").addEventListener("click", () => {
  const input = document.getElementById("diagram-input").value;
  const lines = input.split("\n");
  const elements = [];
  const links = [];
  const boundaries = {};
  const aliases = {}; // Mapeo de alias a elementos
  let currentBoundary = null;
  let globalX = 50;
  let globalY = 50;
  const globalOffsetX = 150;
  const globalOffsetY = 150;
  const boundaryPadding = 20;
  const boundaryElementsPosition = {};
  const boundaryElements = {};

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("//")) return; // Saltar líneas vacías o comentarios

    let match;
    if ((match = trimmedLine.match(/^rectangle\s+(".*?"|\S+)\s*\{$/i))) {
      // Inicio de un boundary
      const boundaryName = match[1].replace(/"/g, "");
      const boundary = new Boundary({
        size: {
          width: 300,
          height: 200,
        },
        position: {
          x: globalX,
          y: globalY,
        },
        attrs: {
          label: {
            text: boundaryName,
          },
        },
      });
      elements.push(boundary);
      boundaries[boundaryName] = boundary;
      boundaryElementsPosition[boundaryName] = {
        x: boundary.position().x + boundaryPadding,
        y: boundary.position().y + boundaryPadding,
      };
      boundaryElements[boundaryName] = [];
      currentBoundary = boundary;
    } else if (trimmedLine === "}") {
      // Fin del boundary actual
      if (currentBoundary) {
        const boundaryName = currentBoundary.attr("label/text");
        const size = calculateBoundarySize(
          boundaryElements[boundaryName],
          boundaryPadding,
          globalOffsetX,
          globalOffsetY
        );
        currentBoundary.resize(size.width, size.height);
        globalY =
          currentBoundary.position().y +
          currentBoundary.size().height +
          globalOffsetY;
      }
      currentBoundary = null;
    } else if (
      (match = trimmedLine.match(
        /^actor\s+(".*?"|\S+)(?:\s+as\s+(\S+))?$/i
      ))
    ) {
      // Definición de un actor con alias opcional
      const actorName = match[1].replace(/"/g, "");
      const alias = match[2] || actorName;
      const actorPositionData = getElementPosition(
        currentBoundary,
        boundaryElementsPosition,
        globalX,
        globalY,
        globalOffsetX,
        globalOffsetY,
        boundaryPadding
      );
      globalX = actorPositionData.globalX;
      globalY = actorPositionData.globalY;
      const actor = createActor(
        actorName,
        actorPositionData.x,
        actorPositionData.y,
        COLORS[Math.floor(Math.random() * COLORS.length)]
      );
      elements.push(actor);
      aliases[alias] = actor; // Guardar el actor en los alias
      if (currentBoundary) {
        currentBoundary.embed(actor);
        boundaryElements[currentBoundary.attr("label/text")].push(actor);
      }
    } else if (
      (match = trimmedLine.match(
        /^usecase\s+(".*?"|\S+)(?:\s+as\s+(\S+))?$/i
      ))
    ) {
      // Definición de un caso de uso
      const useCaseName = match[1].replace(/"/g, "");
      const alias = match[2] || useCaseName;
      const useCasePositionData = getElementPosition(
        currentBoundary,
        boundaryElementsPosition,
        globalX,
        globalY,
        globalOffsetX,
        globalOffsetY,
        boundaryPadding
      );
      globalX = useCasePositionData.globalX;
      globalY = useCasePositionData.globalY;
      const useCase = createUseCase(
        useCaseName,
        useCasePositionData.x,
        useCasePositionData.y
      );
      elements.push(useCase);
      aliases[alias] = useCase; // Guardar el caso de uso con su alias
      if (currentBoundary) {
        currentBoundary.embed(useCase);
        boundaryElements[currentBoundary.attr("label/text")].push(useCase);
      }
    } else if (
      (match = trimmedLine.match(
        /^(".*?"|\S+)\s*-->\s*(".*?"|\S+)(?:\s*:\s*(.*))?$/i
      ))
    ) {
      // Definición de un enlace
      const sourceName = match[1].replace(/"/g, "");
      const targetName = match[2].replace(/"/g, "");
      let linkType = match[3] ? match[3].toLowerCase() : null;

      // Limpiar linkType para admitir <<include>> y <<extend>>
      if (linkType) {
        linkType = linkType.replace(/<<|>>/g, "").trim();
      }

      const source =
        aliases[sourceName] ||
        elements.find((el) => el.attr("label/text") === sourceName);
      const target =
        aliases[targetName] ||
        elements.find((el) => el.attr("label/text") === targetName);

      if (source && target) {
        let link;
        if (linkType === "include") {
          link = createInclude(source, target);
        } else if (linkType === "extend") {
          link = createExtend(source, target);
        } else {
          link = createUse(source, target);
        }
        links.push(link);
      } else {
        console.error(
          `No se encontraron elementos para el enlace: ${sourceName} --> ${targetName}`
        );
      }
    } else {
      console.error("Comando o sintaxis desconocida:", trimmedLine);
    }
  });

  graph.clear();
  graph.addCells([...elements, ...links]);
  fillUseCaseColors();
  scaleToFit();
});
