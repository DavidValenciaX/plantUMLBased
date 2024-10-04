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

paperContainer.appendChild(paper.el);

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

document.getElementById("generate-diagram").addEventListener("click", () => {
  const input = document.getElementById("diagram-input").value;
  const lines = input.split("\n"); // Split the input into lines
  const elements = []; // Store all diagram elements here
  const links = []; // Store all links here
  const boundaries = {}; // Store boundary elements by name
  let currentBoundary = null; // Keep track of the current boundary context
  let globalX = 50; // Initial X position for global elements
  let globalY = 50; // Initial Y position for global elements
  const globalOffsetX = 150; // Horizontal spacing between elements
  const globalOffsetY = 150; // Vertical spacing between elements
  const boundaryPadding = 20; // Padding for elements inside boundaries
  const boundaryElementsPosition = {}; // To track positioning within boundaries

  lines.forEach((line) => {
    const trimmedLine = line.trim(); // Remove any extra spaces from the line
    const parts = trimmedLine.split(" "); // Split the line into words
    const command = parts[0].toLowerCase(); // Get the command (e.g., boundary, actor, etc.)

    switch (command) {
      case "boundary":
        // Create a boundary element
        const boundaryName = parts.slice(1).join(" "); // Get the boundary name
        const boundary = new Boundary({
          size: {
            width: 300, // Width of the boundary box
            height: 200, // Height of the boundary box
          },
          position: {
            x: globalX,
            y: globalY,
          },
          attrs: {
            label: {
              text: boundaryName, // Set the label to the boundary name
            },
          },
        });
        elements.push(boundary); // Add the boundary to the elements array
        boundaries[boundaryName] = boundary; // Store the boundary by name
        boundaryElementsPosition[boundaryName] = { x: boundary.position().x + boundaryPadding, y: boundary.position().y + boundaryPadding }; // Initialize position tracking for elements inside the boundary
        currentBoundary = boundary; // Set the current boundary context
        globalY += boundary.size().height + globalOffsetY; // Update global Y position for the next element
        break;
      case "endboundary":
        // End the current boundary context
        currentBoundary = null;
        break;
      case "actor":
        // Create an actor element
        const actorName = parts.slice(1).join(" "); // Get the actor name
        let actorX, actorY;
        if (currentBoundary) {
          // Position actor within the current boundary
          const boundaryBBox = currentBoundary.getBBox();
          const boundaryPos = boundaryElementsPosition[currentBoundary.attr("label/text")];
          actorX = boundaryPos.x;
          actorY = boundaryPos.y;
          // Update the position for the next element within the boundary
          boundaryElementsPosition[currentBoundary.attr("label/text")].x += globalOffsetX;
          if (boundaryElementsPosition[currentBoundary.attr("label/text")].x > boundaryBBox.x + boundaryBBox.width - boundaryPadding) {
            // Move to the next row if the current row is full
            boundaryElementsPosition[currentBoundary.attr("label/text")].x = boundaryBBox.x + boundaryPadding;
            boundaryElementsPosition[currentBoundary.attr("label/text")].y += globalOffsetY;
          }
        } else {
          // Position actor globally
          actorX = globalX;
          actorY = globalY;
          globalX += globalOffsetX;
          if (globalX > 800) {
            // Move to the next row if the current row is full
            globalX = 50;
            globalY += globalOffsetY;
          }
        }
        const actor = createActor(
          actorName,
          actorX,
          actorY,
          COLORS[Math.floor(Math.random() * COLORS.length)] // Random color for the actor
        );
        elements.push(actor); // Add the actor to the elements array
        if (currentBoundary) {
          currentBoundary.embed(actor); // Embed the actor in the current boundary
        }
        break;
      case "usecase":
        // Create a use case element
        const useCaseName = parts.slice(1).join(" "); // Get the use case name
        let useCaseX, useCaseY;
        if (currentBoundary) {
          // Position use case within the current boundary
          const boundaryBBox = currentBoundary.getBBox();
          const boundaryPos = boundaryElementsPosition[currentBoundary.attr("label/text")];
          useCaseX = boundaryPos.x;
          useCaseY = boundaryPos.y;
          // Update the position for the next element within the boundary
          boundaryElementsPosition[currentBoundary.attr("label/text")].x += globalOffsetX;
          if (boundaryElementsPosition[currentBoundary.attr("label/text")].x > boundaryBBox.x + boundaryBBox.width - boundaryPadding) {
            // Move to the next row if the current row is full
            boundaryElementsPosition[currentBoundary.attr("label/text")].x = boundaryBBox.x + boundaryPadding;
            boundaryElementsPosition[currentBoundary.attr("label/text")].y += globalOffsetY;
          }
        } else {
          // Position use case globally
          useCaseX = globalX;
          useCaseY = globalY;
          globalX += globalOffsetX;
          if (globalX > 800) {
            // Move to the next row if the current row is full
            globalX = 50;
            globalY += globalOffsetY;
          }
        }
        const useCase = createUseCase(
          useCaseName,
          useCaseX,
          useCaseY
        );
        elements.push(useCase); // Add the use case to the elements array
        if (currentBoundary) {
          currentBoundary.embed(useCase); // Embed the use case in the current boundary
        }
        break;
      case "link":
        // Create a link between two elements
        const sourceName = parts[1];
        const targetName = parts[2];
        const source = elements.find((el) => el.attr("label/text") === sourceName); // Find the source element by name
        const target = elements.find((el) => el.attr("label/text") === targetName); // Find the target element by name
        if (source && target) {
          const link = createUse(source, target); // Create a link between source and target
          links.push(link); // Add the link to the links array
        }
        break;
      default:
        console.error("Unknown command:", command); // Handle unknown commands
    }
  });

  graph.clear(); // Clear the graph before adding new elements
  graph.addCells([...elements, ...links]); // Add all elements and links to the graph
  fillUseCaseColors(); // Set colors for use cases based on their connections
  scaleToFit(); // Scale the diagram to fit the available space
});