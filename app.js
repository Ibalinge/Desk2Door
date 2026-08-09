(function () {
  "use strict";

  const SVG_NS =
    "http://www.w3.org/2000/svg";

  const floor =
    window.FLOOR_DATA;

  if (!floor) {
    throw new Error(
      "FLOOR_DATA was not loaded."
    );
  }

  function required(id) {
    const element =
      document.getElementById(id);

    if (!element) {
      throw new Error(
        "Missing HTML element: #" +
        id
      );
    }

    return element;
  }

  const startInput =
    required("startInput");

  const startSelect =
    required("startSelect");

  const startMatch =
    required("startMatch");

  const destinationInput =
    required(
      "destinationInput"
    );

  const destinationSelect =
    required(
      "destinationSelect"
    );

  const showRouteButton =
    required("showRouteBtn");

  const clearRouteButton =
    required("clearRouteBtn");

  const toggleDeskButton =
    required("toggleDeskBtn");

  const networkCheckbox =
    required(
      "showNetworkCheckbox"
    );

  const routePanel =
    required("routePanel");

  const routeDetails =
    required("routeDetails");

  const emptyState =
    required("emptyState");

  const mapSection =
    required("mapSection");

  const mapContainer =
    required("mapContainer");

  const mapRouteTitle =
    required("mapRouteTitle");

  const fitMapButton =
    required("fitMapBtn");

  const svg =
    required("floorMap");

  let selectedStart = null;
  let selectedDestination = null;

  let desksVisible = true;
  let networkVisible = false;
  let fitted = true;
  let animationTimer = null;

  /*
   * ============================================================
   * GRAPH
   * ============================================================
   */

  function distance(a, b) {
    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );
  }

  function buildGraph() {
    const nodes = {};
    const adjacency = {};

    function addGraphNode(
      id,
      x,
      y,
      type,
      metadata
    ) {
      nodes[id] = {
        id: id,
        x: Number(x),
        y: Number(y),
        type: type,
        metadata:
          metadata || null
      };

      if (!adjacency[id]) {
        adjacency[id] = [];
      }
    }

    function addGraphEdge(
      from,
      to
    ) {
      if (
        !nodes[from] ||
        !nodes[to]
      ) {
        return;
      }

      const weight =
        distance(
          nodes[from],
          nodes[to]
        );

      adjacency[from].push({
        to: to,
        weight: weight
      });

      adjacency[to].push({
        to: from,
        weight: weight
      });
    }

    Object.keys(
      floor.walkingNodes
    ).forEach(function (id) {
      const point =
        floor.walkingNodes[id];

      addGraphNode(
        id,
        point[0],
        point[1],
        "walkway"
      );
    });

    floor.walkingEdges.forEach(
      function (item) {
        addGraphEdge(
          item[0],
          item[1]
        );
      }
    );

    Object.values(
      floor.workstations
    ).forEach(function (desk) {
      addGraphNode(
        desk.id,
        desk.x,
        desk.y,
        "workstation",
        desk
      );

      let previous =
        desk.id;

      const egressPoints =
        Array.isArray(
          desk.egressPoints
        )
          ? desk.egressPoints
          : [];

      egressPoints.forEach(
        function (
          point,
          index
        ) {
          const localId =
            "LOCAL_" +
            desk.name
              .replace(".", "_") +
            "_" +
            index;

          addGraphNode(
            localId,
            point[0],
            point[1],
            "desk-aisle"
          );

          addGraphEdge(
            previous,
            localId
          );

          previous =
            localId;
        }
      );

      addGraphEdge(
        previous,
        desk.accessNode
      );
    });

    Object.values(
      floor.destinations
    ).forEach(
      function (destination) {
        addGraphNode(
          destination.id,
          destination.x,
          destination.y,
          "destination",
          destination
        );

        addGraphEdge(
          destination.id,
          destination.accessNode
        );
      }
    );

    function shortestPath(
      startId,
      endId
    ) {
      if (
        !nodes[startId] ||
        !nodes[endId]
      ) {
        return null;
      }

      const distances = {};
      const previous = {};
      const visited = new Set();

      Object.keys(nodes).forEach(
        function (id) {
          distances[id] =
            Infinity;
        }
      );

      distances[startId] = 0;

      while (true) {
        let current = null;
        let smallest =
          Infinity;

        Object.keys(nodes).forEach(
          function (id) {
            if (
              !visited.has(id) &&
              distances[id] <
                smallest
            ) {
              current = id;
              smallest =
                distances[id];
            }
          }
        );

        if (
          current === null ||
          current === endId
        ) {
          break;
        }

        visited.add(current);

        adjacency[current].forEach(
          function (edge) {
            const candidate =
              distances[current] +
              edge.weight;

            if (
              candidate <
              distances[edge.to]
            ) {
              distances[edge.to] =
                candidate;

              previous[edge.to] =
                current;
            }
          }
        );
      }

      if (
        !Number.isFinite(
          distances[endId]
        )
      ) {
        return null;
      }

      const fullPath = [];
      let current =
        endId;

      while (
        current !== undefined
      ) {
        fullPath.unshift(
          nodes[current]
        );

        current =
          previous[current];
      }

      const path = [];

      fullPath.forEach(
        function (
          point,
          index
        ) {
          if (
            index === 0 ||
            index ===
              fullPath.length - 1
          ) {
            path.push(point);
            return;
          }

          const before =
            fullPath[index - 1];

          const after =
            fullPath[index + 1];

          const horizontal =
            before.y === point.y &&
            point.y === after.y;

          const vertical =
            before.x === point.x &&
            point.x === after.x;

          if (
            !horizontal &&
            !vertical
          ) {
            path.push(point);
          }
        }
      );

      return {
        path: path,
        distance:
          distances[endId]
      };
    }

    return {
      nodes: nodes,
      shortestPath:
        shortestPath
    };
  }

  const graph =
    buildGraph();

  /*
   * ============================================================
   * STARTING LOCATIONS
   * ============================================================
   */

  function isPhoneSpace(item) {
    return (
      item &&
      (
        item.type ===
          "Phone Room" ||
        item.type ===
          "Phone Booth"
      )
    );
  }

  const starts = [];

  Object.values(
    floor.workstations
  ).forEach(function (desk) {
    starts.push({
      id: desk.id,
      name: desk.name,
      type: "Workstation",
      group: "Workstations",
      original: desk
    });
  });

  Object.values(
    floor.destinations
  ).forEach(function (item) {
    if (
      isPhoneSpace(item)
    ) {
      starts.push({
        id: item.id,
        name: item.name,
        type: item.type,
        group:
          "Phone Rooms and Booths",
        original: item
      });
    }
  });

  starts.sort(function (a, b) {
    if (a.group !== b.group) {
      return a.group ===
        "Workstations"
        ? -1
        : 1;
    }

    return a.name.localeCompare(
      b.name,
      undefined,
      {
        numeric: true
      }
    );
  });

  function findStart(id) {
    return (
      starts.find(
        function (item) {
          return item.id === id;
        }
      ) || null
    );
  }

  function populateStarts(
    query
  ) {
    const search =
      String(query || "")
        .trim()
        .toLowerCase();

    startSelect.innerHTML = "";

    const groups = {};

    starts.forEach(
      function (item) {
        const searchable = [
          item.name,
          item.type
        ]
          .join(" ")
          .toLowerCase();

        if (
          search &&
          !searchable.includes(
            search
          )
        ) {
          return;
        }

        if (!groups[item.group]) {
          groups[item.group] =
            document.createElement(
              "optgroup"
            );

          groups[item.group].label =
            item.group;

          startSelect.appendChild(
            groups[item.group]
          );
        }

        const option =
          document.createElement(
            "option"
          );

        option.value =
          item.id;

        option.textContent =
          item.name +
          " — " +
          item.type;

        groups[item.group]
          .appendChild(option);
      }
    );

    if (
      startSelect.options.length
    ) {
      startSelect.selectedIndex =
        0;

      selectedStart =
        findStart(
          startSelect.value
        );
    } else {
      selectedStart =
        null;
    }

    updateButtonState();
  }

  /*
   * ============================================================
   * DESTINATIONS
   * ============================================================
   */

  const destinationTypes = [
    "Huddle Room",
    "Large Conference Room",
    "Medium Conference Room",
    "Small Conference Room",
    "Interview Room",
    "Multipurpose Room",
    "Open Collaboration",
    "Reception"
  ];

  const destinations =
    Object.values(
      floor.destinations
    )
      .filter(function (item) {
        return destinationTypes.includes(
          item.type
        );
      })
      .sort(function (a, b) {
        return a.name.localeCompare(
          b.name,
          undefined,
          {
            numeric: true
          }
        );
      });

  function findDestination(id) {
    return (
      destinations.find(
        function (item) {
          return item.id === id;
        }
      ) || null
    );
  }

  function populateDestinations(
    query
  ) {
    const search =
      String(query || "")
        .trim()
        .toLowerCase();

    destinationSelect.innerHTML =
      "";

    const groups = {};

    destinations.forEach(
      function (item) {
        const searchable = [
          item.name,
          item.type,
          item.capacity
        ]
          .join(" ")
          .toLowerCase();

        if (
          search &&
          !searchable.includes(
            search
          )
        ) {
          return;
        }

        if (!groups[item.type]) {
          groups[item.type] =
            document.createElement(
              "optgroup"
            );

          groups[item.type].label =
            item.type;

          destinationSelect
            .appendChild(
              groups[item.type]
            );
        }

        const option =
          document.createElement(
            "option"
          );

        option.value =
          item.id;

        option.textContent =
          item.name +
          " — " +
          item.type +
          (
            item.capacity
              ? " (" +
                item.capacity +
                ")"
              : ""
          );

        groups[item.type]
          .appendChild(option);
      }
    );

    if (
      destinationSelect.options
        .length
    ) {
      destinationSelect
        .selectedIndex = 0;

      selectedDestination =
        findDestination(
          destinationSelect.value
        );
    } else {
      selectedDestination =
        null;
    }

    updateButtonState();
  }

  /*
   * ============================================================
   * RENDERER
   * ============================================================
   */

  function createSvg(
    tag,
    attributes
  ) {
    const element =
      document.createElementNS(
        SVG_NS,
        tag
      );

    Object.keys(
      attributes || {}
    ).forEach(function (key) {
      element.setAttribute(
        key,
        attributes[key]
      );
    });

    return element;
  }

  const areaStyles = {
    Building: {
      fill: "#f8fafc",
      stroke: "#111827"
    },

    Corridor: {
      fill: "#fff",
      stroke: "#cbd5e1"
    },

    Staircase: {
      fill: "#f3f4f6",
      stroke: "#374151"
    },

    "Huddle Room": {
      fill: "#d6fff4",
      stroke: "#10b981"
    },

    "Large Conference Room": {
      fill: "#d9f4ff",
      stroke: "#0284c7"
    },

    "Medium Conference Room": {
      fill: "#d9f4ff",
      stroke: "#0284c7"
    },

    "Small Conference Room": {
      fill: "#d9f4ff",
      stroke: "#0284c7"
    },

    "Interview Room": {
      fill: "#ffe0f4",
      stroke: "#db2777"
    },

    "Multipurpose Room": {
      fill: "#e4ffd9",
      stroke: "#65a30d"
    },

    "Open Collaboration": {
      fill: "#e4e9ff",
      stroke: "#4f46e5"
    },

    "Phone Room": {
      fill: "#fff0df",
      stroke: "#ea580c"
    },

    "Phone Booth": {
      fill: "#ffe4e6",
      stroke: "#e11d48"
    },

    Reception: {
      fill: "#dcfce7",
      stroke: "#16a34a"
    },

    Wellbeing: {
      fill: "#dcfce7",
      stroke: "#15803d"
    }
  };

  function addText(
    parent,
    x,
    y,
    value,
    className
  ) {
    const text =
      createSvg("text", {
        x: x,
        y: y,
        class: className
      });

    text.textContent =
      value;

    parent.appendChild(
      text
    );
  }

  function drawBase() {
    if (animationTimer) {
      clearInterval(
        animationTimer
      );

      animationTimer =
        null;
    }

    svg.innerHTML = "";

    svg.setAttribute(
      "viewBox",
      "0 0 " +
        floor.width +
        " " +
        floor.height
    );

    if (desksVisible) {
      svg.classList.remove(
        "desks-hidden"
      );
    } else {
      svg.classList.add(
        "desks-hidden"
      );
    }

    floor.areas.forEach(
      function (area) {
        const style =
          areaStyles[
            area.type
          ] ||
          {
            fill: "#e5e7eb",
            stroke: "#4b5563"
          };

        const className =
          area.type ===
          "Building"
            ? "floor-outline"
            : area.type ===
              "Corridor"
            ? "corridor-area"
            : "room-block";

        const group =
          createSvg("g", {});

        group.appendChild(
          createSvg("rect", {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
            rx: 5,
            class: className,
            fill: style.fill,
            stroke: style.stroke
          })
        );

        if (area.label) {
          addText(
            group,
            area.x +
              area.width / 2,
            area.y +
              area.height / 2 -
              4,
            area.label,
            "room-label"
          );

          addText(
            group,
            area.x +
              area.width / 2,
            area.y +
              area.height / 2 +
              18,
            area.type +
              (
                area.capacity
                  ? " (" +
                    area.capacity +
                    ")"
                  : ""
              ),
            "room-subtitle"
          );
        }

        svg.appendChild(group);
      }
    );

    floor.workstationZones
      .forEach(function (zone) {
        svg.appendChild(
          createSvg("rect", {
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height,
            rx: 5,
            class:
              "workstation-zone"
          })
        );

        addText(
          svg,
          zone.x +
            zone.width / 2,
          zone.y + 20,
          zone.prefix +
            " Workstations",
          "zone-label"
        );
      });

    Object.values(
      floor.workstations
    ).forEach(function (desk) {
      const marker =
        createSvg("circle", {
          cx: desk.x,
          cy: desk.y,
          r: 4,
          class:
            "workstation-marker"
        });

      const title =
        createSvg("title", {});

      title.textContent =
        desk.name;

      marker.appendChild(title);

      svg.appendChild(marker);
    });

    if (networkVisible) {
      floor.walkingEdges
        .forEach(function (item) {
          const from =
            floor.walkingNodes[
              item[0]
            ];

          const to =
            floor.walkingNodes[
              item[1]
            ];

          if (!from || !to) {
            return;
          }

          svg.appendChild(
            createSvg("line", {
              x1: from[0],
              y1: from[1],
              x2: to[0],
              y2: to[1],
              class:
                "walking-edge"
            })
          );
        });
    }
  }

  function drawRoute(result) {
    drawBase();

    const defs =
      createSvg("defs", {});

    const marker =
      createSvg("marker", {
        id: "routeArrow",
        markerWidth: 10,
        markerHeight: 10,
        refX: 8,
        refY: 5,
        orient: "auto",
        markerUnits:
          "userSpaceOnUse"
      });

    marker.appendChild(
      createSvg("path", {
        d:
          "M0,0 L0,10 L9,5 z",
        fill: "#ffb000"
      })
    );

    defs.appendChild(marker);

    svg.insertBefore(
      defs,
      svg.firstChild
    );

    const points =
      result.path
        .map(function (point) {
          return (
            point.x +
            "," +
            point.y
          );
        })
        .join(" ");

    const line =
      createSvg("polyline", {
        points: points,
        class: "route-path",
        "marker-mid":
          "url(#routeArrow)",
        "marker-end":
          "url(#routeArrow)"
      });

    svg.appendChild(line);

    const start =
      result.path[0];

    const end =
      result.path[
        result.path.length -
        1
      ];

    svg.appendChild(
      createSvg("circle", {
        cx: start.x,
        cy: start.y,
        r: 11,
        class:
          "selected-start"
      })
    );

    svg.appendChild(
      createSvg("circle", {
        cx: end.x,
        cy: end.y,
        r: 11,
        class:
          "selected-destination"
      })
    );
  }

  /*
   * ============================================================
   * EVENTS
   * ============================================================
   */

  function updateButtonState() {
    showRouteButton.disabled =
      !selectedStart ||
      !selectedDestination;
  }

  startInput.addEventListener(
    "input",
    function () {
      startMatch.hidden =
        true;

      populateStarts(
        startInput.value
      );
    }
  );

  startSelect.addEventListener(
    "change",
    function () {
      selectedStart =
        findStart(
          startSelect.value
        );

      if (selectedStart) {
        startInput.value =
          selectedStart.name;

        startMatch.hidden =
          false;

        startMatch.textContent =
          "Starting at: " +
          selectedStart.name +
          " — " +
          selectedStart.type;
      }

      updateButtonState();
    }
  );

  destinationInput
    .addEventListener(
      "input",
      function () {
        populateDestinations(
          destinationInput.value
        );
      }
    );

  destinationSelect
    .addEventListener(
      "change",
      function () {
        selectedDestination =
          findDestination(
            destinationSelect
              .value
          );

        if (
          selectedDestination
        ) {
          destinationInput.value =
            selectedDestination
              .name;
        }

        updateButtonState();
      }
    );

  showRouteButton
    .addEventListener(
      "click",
      function () {
        if (
          !selectedStart ||
          !selectedDestination
        ) {
          return;
        }

        const result =
          graph.shortestPath(
            selectedStart.id,
            selectedDestination
              .id
          );

        if (!result) {
          routePanel.hidden =
            false;

          routeDetails
            .textContent =
            "No connected route was found.";

          return;
        }

        drawRoute(result);

        emptyState.hidden =
          true;

        mapSection.hidden =
          false;

        routePanel.hidden =
          false;

        fitMapButton.hidden =
          false;

        const metres =
          Math.max(
            1,
            Math.round(
              result.distance *
              floor
                .metresPerUnit
            )
          );

        const seconds =
          Math.max(
            1,
            Math.round(
              metres / 1.3
            )
          );

        routeDetails.innerHTML =
          '<div class="route-summary">' +
          metres +
          " m · approximately " +
          seconds +
          " seconds</div>" +

          '<div class="route-line">' +
          "<strong>From:</strong> " +
          selectedStart.name +
          " — " +
          selectedStart.type +
          "</div>" +

          '<div class="route-line">' +
          "<strong>To:</strong> " +
          selectedDestination
            .name +
          "</div>" +

          '<div class="route-line">' +
          "Follow the highlighted walking path." +
          "</div>";

        mapRouteTitle
          .textContent =
          selectedStart.name +
          " → " +
          selectedDestination.name;

        const mobile =
          window.matchMedia(
            "(max-width: 760px)"
          ).matches;

        if (mobile) {
          fitted = true;

          svg.classList.add(
            "fit-mode"
          );

          fitMapButton
            .textContent =
            "Actual size";

          mapSection
            .scrollIntoView({
              behavior:
                "smooth",
              block:
                "start"
            });
        } else {
          fitted = false;

          svg.classList.remove(
            "fit-mode"
          );

          fitMapButton
            .textContent =
            "Fit map";

          const point =
            selectedStart
              .original;

          mapContainer.scrollTo({
            left: Math.max(
              0,
              point.x -
              mapContainer
                .clientWidth /
                2
            ),

            top: Math.max(
              0,
              point.y -
              mapContainer
                .clientHeight /
                2
            ),

            behavior: "smooth"
          });
        }
      }
    );

  clearRouteButton
    .addEventListener(
      "click",
      function () {
        selectedStart =
          null;

        selectedDestination =
          null;

        startInput.value = "";
        destinationInput.value =
          "";

        startMatch.hidden =
          true;

        routePanel.hidden =
          true;

        mapSection.hidden =
          true;

        emptyState.hidden =
          false;

        fitMapButton.hidden =
          true;

        populateStarts("");
        populateDestinations("");

        startSelect.selectedIndex =
          -1;

        selectedStart = null;

        updateButtonState();
        drawBase();
      }
    );

  toggleDeskButton
    .addEventListener(
      "click",
      function () {
        desksVisible =
          !desksVisible;

        toggleDeskButton
          .textContent =
          desksVisible
            ? "Hide desks"
            : "Show desks";

        drawBase();
      }
    );

  networkCheckbox
    .addEventListener(
      "change",
      function () {
        networkVisible =
          networkCheckbox
            .checked;

        drawBase();
      }
    );

  fitMapButton
    .addEventListener(
      "click",
      function () {
        fitted = !fitted;

        if (fitted) {
          svg.classList.add(
            "fit-mode"
          );

          fitMapButton
            .textContent =
            "Actual size";
        } else {
          svg.classList.remove(
            "fit-mode"
          );

          fitMapButton
            .textContent =
            "Fit map";
        }
      }
    );

  /*
   * Initial state.
   */
  populateStarts("");
  populateDestinations("");

  startSelect.selectedIndex =
    -1;

  selectedStart = null;

  updateButtonState();
  drawBase();

  console.log(
    "Waylo loaded",
    {
      workstations:
        Object.keys(
          floor.workstations
        ).length,

      startingLocations:
        starts.length,

      destinations:
        destinations.length,

      areas:
        floor.areas.length
    }
  );
})();
