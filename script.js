// Importar el módulo de layout desde JointJS
const { shapes: defaultShapes, dia, util, linkTools, layout } = joint;

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
      // El movimiento de los casos de uso está restringido al área del padre
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

class Include extends shapes.standard.Link {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Include",
        attrs: {
          line: lineAttrs
        }
        // Eliminamos labels por defecto
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
        }
        // Eliminamos labels por defecto
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

function createActor(name, color) {
  return new Actor({
    size: {
      width: 40,
      height: 80
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

function createUseCase(useCase) {
  return new UseCase({
    size: {
      width: 125,
      height: 75
    },
    attrs: {
      label: {
        text: useCase
      }
    }
  });
}

function createUse(source, target, isDashed = false, label = null) {
  const link = new Use({
    source: {
      id: source.id,
      connectionPoint: {
        name: "rectangle",
        args: {
          offset: 5
        }
      }
    },
    target: { id: target.id },
    attrs: {
      line: {
        strokeDasharray: isDashed ? "6,2" : ""
      }
    }
  });
  if (label) {
    link.labels([
      {
        position: 0.5,
        attrs: {
          text: {
            text: label,
            fill: COLORS[7],
            fontSize: 12,
            fontFamily: "sans-serif",
            textAnchor: "middle",
            textVerticalAnchor: "middle"
          },
          rect: {
            fill: COLORS[5],
            ref: "text",
            x: "calc(x - 2)",
            y: "calc(y - 2)",
            width: "calc(w + 4)",
            height: "calc(h + 4)"
          }
        },
        markup: util.svg`
          <rect @selector="rect" />
          <text @selector="text" />
        `
      }
    ]);
  }
  return link;
}

function createInclude(source, target, isDashed = true, label = null) {
  let labelText = "<<include>>";
  if (label) {
    labelText += "\n" + label;
  }

  const link = new Include({
    source: { id: source.id },
    target: { id: target.id },
    attrs: {
      line: {
        strokeDasharray: isDashed ? "6,2" : ""
      }
    }
  });

  link.labels([
    {
      position: 0.5,
      attrs: {
        text: {
          text: labelText,
          fill: COLORS[7],
          fontSize: 12,
          fontFamily: "sans-serif",
          textAnchor: "middle",
          textVerticalAnchor: "middle"
        },
        rect: {
          fill: COLORS[5],
          ref: "text",
          x: "calc(x - 2)",
          y: "calc(y - 2)",
          width: "calc(w + 4)",
          height: "calc(h + 4)"
        }
      },
      markup: util.svg`
        <rect @selector="rect" />
        <text @selector="text" />
      `
    }
  ]);

  return link;
}

function createExtend(source, target, isDashed = true, label = null) {
  let labelText = "<<extend>>";
  if (label) {
    labelText += "\n" + label;
  }

  const link = new Extend({
    source: { id: source.id },
    target: { id: target.id },
    attrs: {
      line: {
        strokeDasharray: isDashed ? "6,2" : ""
      }
    }
  });

  link.labels([
    {
      position: 0.5,
      attrs: {
        text: {
          text: labelText,
          fill: COLORS[7],
          fontSize: 12,
          fontFamily: "sans-serif",
          textAnchor: "middle",
          textVerticalAnchor: "middle"
        },
        rect: {
          fill: COLORS[5],
          ref: "text",
          x: "calc(x - 2)",
          y: "calc(y - 2)",
          width: "calc(w + 4)",
          height: "calc(h + 4)"
        }
      },
      markup: util.svg`
        <rect @selector="rect" />
        <text @selector="text" />
      `
    }
  ]);

  return link;
}

// Variables globales para boundaries y aliases
const boundaries = {};
const aliases = {}; // Mapeo de alias a elementos

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

function adjustBoundarySizes() {
  Object.values(boundaries).forEach((boundary) => {
    const boundaryElements = boundary.getEmbeddedCells();
    if (boundaryElements.length === 0) return;

    const elementsBBox = dia.BBox.union(
      boundaryElements.map((el) => el.getBBox())
    );
    const padding = 20;

    boundary.position(elementsBBox.x - padding, elementsBBox.y - padding);
    boundary.resize(
      elementsBBox.width + 2 * padding,
      elementsBBox.height + 2 * padding
    );
  });
}

document.getElementById("generate-diagram").addEventListener("click", () => {
  const input = document.getElementById("diagram-input").value;
  const lines = input.split("\n");
  const elements = [];
  const links = [];
  // Reiniciar boundaries y aliases
  Object.keys(boundaries).forEach((key) => delete boundaries[key]);
  Object.keys(aliases).forEach((key) => delete aliases[key]);
  let currentBoundary = null;

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
          height: 200
        },
        attrs: {
          label: {
            text: boundaryName
          }
        }
      });
      elements.push(boundary);
      boundaries[boundaryName] = boundary;
      currentBoundary = boundary;
    } else if (trimmedLine === "}") {
      // Fin del boundary actual
      currentBoundary = null;
    } else if (
      (match = trimmedLine.match(
        /^actor\s+(".*?"|\S+)(?:\s+as\s+(\S+))?$/i
      ))
    ) {
      // Definición de un actor con alias opcional
      const actorName = match[1].replace(/"/g, "");
      const alias = match[2] || actorName;
      const actor = createActor(
        actorName,
        COLORS[Math.floor(Math.random() * COLORS.length)]
      );
      elements.push(actor);
      aliases[alias] = actor; // Guardar el actor en los alias
      if (currentBoundary) {
        currentBoundary.embed(actor);
      }
    } else if (
      (match = trimmedLine.match(
        /^usecase\s+(".*?"|\S+)(?:\s+as\s+(\S+))?$/i
      ))
    ) {
      // Definición de un caso de uso
      const useCaseName = match[1].replace(/"/g, "");
      const alias = match[2] || useCaseName;
      const useCase = createUseCase(useCaseName);
      elements.push(useCase);
      aliases[alias] = useCase; // Guardar el caso de uso con su alias
      if (currentBoundary) {
        currentBoundary.embed(useCase);
      }
    } else if (
      (match = trimmedLine.match(
        /^(".*?"|\S+)\s*(-->|\.{2}>)\s*(".*?"|\S+)(?:\s*:\s*(.*))?$/i
      ))
    ) {
      // Definición de un enlace
      const sourceName = match[1].replace(/"/g, "");
      const operator = match[2];
      const targetName = match[3].replace(/"/g, "");
      let linkLabel = match[4] ? match[4].trim() : null;

      // Determinar linkType y label
      let linkType = null;
      let additionalLabel = null;
      if (linkLabel) {
        const matchType = linkLabel.match(/^<<\s*(\w+)\s*>>/);
        if (matchType) {
          linkType = matchType[1].trim().toLowerCase();
          additionalLabel = linkLabel.substring(matchType[0].length).trim();
        } else {
          linkType = null;
          additionalLabel = linkLabel;
        }
      }

      const source =
        aliases[sourceName] ||
        elements.find((el) => el.attr("label/text") === sourceName);
      const target =
        aliases[targetName] ||
        elements.find((el) => el.attr("label/text") === targetName);

      if (source && target) {
        let link;
        const isDashed = operator === "..>";
        if (linkType === "include") {
          link = createInclude(source, target, isDashed, additionalLabel);
        } else if (linkType === "extend") {
          link = createExtend(source, target, isDashed, additionalLabel);
        } else {
          link = createUse(source, target, isDashed, linkLabel);
        }
        links.push(link);
      } else {
        console.error(
          `No se encontraron elementos para el enlace: ${sourceName} ${operator} ${targetName}`
        );
      }
    } else {
      console.error("Comando o sintaxis desconocida:", trimmedLine);
    }
  });

  graph.resetCells([...elements, ...links]);

  // Aplicar el Directed Graph Layout al grafo
  layout.DirectedGraph.layout(graph, {
    setLinkVertices: false,
    rankDir: "TB", // Dirección del layout: Top to Bottom
    rankSep: 100,
    nodeSep: 50,
    marginX: 50,
    marginY: 50
  });

  // Ajustar el tamaño de los boundaries después del layout
  adjustBoundarySizes();

  fillUseCaseColors();
  scaleToFit();
});

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

window.addEventListener("resize", () => scaleToFit());
