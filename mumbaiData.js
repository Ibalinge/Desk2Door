/*
 * Mumbai · Floor 4 — digital floor plan data.
 *
 * Coordinates are plan units read off the Floor 4 overview (1024-unit-wide preview), scaled by S.
 * Hatched areas on the reference plan (other tenants, building core) are outside the outline.
 */
(function () {
  "use strict";

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  if (!g.DeskFloor) return;

  var S = 2;
  function R(id, x0, y0, x1, y1, door) { return [id, x0 * S, y0 * S, x1 * S, y1 * S, door]; }
  function F(type, x0, y0, x1, y1, label) { return [type, x0 * S, y0 * S, x1 * S, y1 * S, label || ""]; }
  function Z(points, label, walk) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var f = F("zone", Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), label);
    f[7] = points.map(function (p) { return [p[0] * S, p[1] * S]; });
    f[8] = walk ? [walk[0] * S, walk[1] * S] : [];
    if (walk) f[9] = "walk";
    return f;
  }
  /* groups: desk-column centres per bench; columns of one bench share edges, benches keep their aisles. */
  function bench(series, wing, groups, rows, table) {
    var cols = [];
    groups.forEach(function (grp) {
      grp.forEach(function (c, i) {
        var x0 = i ? (grp[i - 1] + c) / 2 : c - 15;
        var x1 = i < grp.length - 1 ? (c + grp[i + 1]) / 2 : c + 15;
        cols.push([x0, x1]);
      });
    });
    var centres = [].concat.apply([], groups);
    return {
      series: series, wing: wing, accent: "#16a34a",
      cols: cols.map(function (c) { return [c[0] * S, c[1] * S]; }),
      rows: rows.map(function (r) { return [r[0] * S, r[1] * S]; }),
      ids: centres.map(function (_, c) { return table.map(function (row) { return row[c] == null ? null : row[c]; }); })
    };
  }

  var NORTH = [[45, 77], [77, 110], [110, 142]];
  var SOUTH = [[173, 205], [205, 237]];

  var PODS = [
    bench("409", "left", [[79, 109], [146, 175], [212, 244], [279, 310], [345, 376]], NORTH, [
      ["409.41", "409.36", "409.35", null, null, "409.26", "409.25", "409.20", "409.19", "409.15"],
      ["409.40", "409.37", "409.34", "409.31", "409.30", "409.27", "409.24", "409.21", "409.18", null],
      ["409.39", "409.38", "409.33", "409.32", "409.29", "409.28", "409.23", "409.22", "409.17", "409.16"]
    ]),
    bench("409", "left", [[419, 449], [485, 515], [554]], NORTH, [
      ["409.14", "409.09", "409.08", "409.03", "409.02"],
      ["409.13", "409.10", "409.07", "409.04", null],
      ["409.12", "409.11", "409.06", "409.05", "409.01"]
    ]),
    bench("405", "right", [[677], [712, 743], [784, 815], [851, 881]], NORTH, [
      ["405.18", "405.17", "405.13", "405.12", "405.07", "405.06", "405.01"],
      ["405.19", "405.16", null, "405.11", "405.08", "405.05", "405.02"],
      ["405.20", "405.15", "405.14", "405.10", "405.09", "405.04", "405.03"]
    ]),
    bench("410", "left", [[79, 109], [146, 175], [212]], SOUTH, [
      ["410.02", "410.03", "410.06", "410.07", "410.10"],
      ["410.01", "410.04", "410.05", "410.08", "410.09"]
    ]),
    bench("410", "left", [[310], [345, 376]], SOUTH, [
      ["410.11", "410.14", "410.15"],
      ["410.12", "410.13", "410.16"]
    ]),
    bench("406", "right", [[677, 712], [784, 815]], SOUTH, [
      ["406.08", "406.05", "406.03", "406.02"],
      ["406.07", "406.06", "406.04", "406.01"]
    ])
  ];

  var ROOMS = [
    R("405A", 577, 45, 655, 142, "N:0.5|S:0.5"),
    R("411A", 547, 186, 575, 200, "N"),
    R("413", 547, 200, 603, 235, "E:0.4"),
    R("414", 547, 235, 603, 260, "E:0.5"),
    R("415", 547, 260, 603, 345, "E:0.15"),
    R("412", 388, 240, 545, 345, "N:0.92|W:0.9"),
    R("408", 636, 240, 684, 320, "E:0.15"),
    R("407", 771, 240, 856, 300, "W:0.12"),
    R("401", 806, 302, 856, 352, "E:0.2"),
    R("404", 905, 28, 1005, 200, "W:0.9"),
    R("403", 905, 200, 1005, 285, "W:0.15"),
    R("Victoria", 905, 285, 1005, 405, "W:0.1"),
    R("F04-GTOI-01", 815, 458, 885, 545, "W:0.2"),
    R("F04-LTOI-01", 815, 548, 885, 650, "W:0.2")
  ];

  var FIXTURES = [
    F("stair", 385, 350, 500, 447, "Stairs"),
    F("other", 705, 262, 765, 302, "Reception desk"),
    // Solid wall between the 406 desks and 408 / 407; the lobby entrance sits between them
    F("wall", 636, 237, 727, 240), F("wall", 771, 237, 856, 240),
    // Entry vestibule under 408 and the main lobby, each with its own door to the lift corridor
    F("wall", 632, 322, 635, 386), F("wall", 682, 322, 686, 386), F("wall", 713, 384, 806, 388),
    F("wall", 803, 352, 807, 400),
    F("wall", 805, 400, 905, 404),
    F("wall", 600, 345, 604, 386),
    Z([[415, 180], [505, 180], [505, 230], [415, 230]], "411"),
    Z([[230, 170], [292, 170], [292, 236], [230, 236]], "410A", [262, 200]),
    Z([[812, 360], [900, 360], [900, 398], [812, 398]], "400"),
    // Desk area / cafeteria partition, door at x 264–284; stair core walls with its two doors
    F("wall", 35, 237, 264, 241), F("wall", 284, 237, 388, 241),
    F("wall", 376, 347, 380, 447),
    F("wall", 380, 447, 534, 451), F("wall", 556, 447, 576, 451),
    // Cafeteria tables and planters
    F("other", 59, 272, 109, 322),
    F("other", 51, 340, 115, 404), F("other", 51, 409, 115, 461), F("other", 51, 475, 115, 530),
    F("other", 51, 540, 115, 593), F("other", 51, 606, 115, 633),
    F("other", 146, 301, 238, 330), F("other", 146, 340, 238, 404), F("other", 146, 409, 238, 461),
    F("other", 146, 475, 238, 530), F("other", 146, 540, 238, 593), F("other", 146, 606, 238, 633),
    F("wall", 40, 634, 120, 642), F("wall", 140, 634, 240, 642),
    F("other", 300, 262, 345, 312),
    // Service rooms west of the stair core
    F("room", 286, 348, 351, 390), F("room", 291, 392, 370, 464), F("room", 286, 469, 372, 564),
    // Core: restrooms, pantry and stores, shaft
    F("wc", 391, 454, 536, 562, "Restrooms"), F("wc", 564, 452, 654, 562, "Restrooms"),
    F("room", 378, 595, 421, 650), F("room", 437, 595, 564, 650, "Pantry"), F("room", 566, 595, 605, 650),
    F("void", 703, 452, 776, 655, "Shaft"),
    Z([[40, 245], [270, 245], [270, 640], [40, 640]], "Cafeteria", [130, 468])
  ];

  var OUTLINE = [
    [35, 28], [1005, 28], [1005, 405], [840, 405], [840, 453], [890, 453], [890, 655],
    [800, 655], [800, 453], [776, 453], [776, 655], [35, 655]
  ];

  var CONF = {
    "405A": "Conference", "412": "Large Conf", "Victoria": "Conference", "404": "Collaboration",
    "403": "Small Conf", "407": "Small Conf", "408": "Small Conf"
  };
  var TYPES = {
    "413": "phone", "414": "phone", "415": "phone", "401": "phone", "411A": "service",
    "F04-GTOI-01": "service", "F04-LTOI-01": "service"
  };
  var LABELS = {
    "F04-GTOI-01": "Gents Restroom", "F04-LTOI-01": "Ladies Restroom",
    "411": "411 · Lounge", "400": "400 · Reception", "Cafeteria": "Cafeteria", "410A": "410A · Collaboration"
  };
  Object.keys(CONF).forEach(function (id) { LABELS[id] = id + " · " + CONF[id]; });

  var floor4 = g.DeskFloor.buildFloor({
    level: 4, cityName: "Mumbai",
    building: {
      x: 30 * S, y: 20 * S, w: (1010 - 30) * S, h: (660 - 20) * S,
      outline: OUTLINE.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS, rooms: ROOMS, fixtures: FIXTURES, openGaps: [], midBand: null, solidZones: true,
    meetings: Object.keys(CONF), types: TYPES, labels: LABELS, leftRooms: null, wingSplit: 560 * S,
    regions: {
      left: { id: "left", label: "West side", x: 35 * S, y: 28 * S, w: 345 * S, h: 627 * S },
      core: { id: "core", label: "Centre", x: 380 * S, y: 28 * S, w: 255 * S, h: 425 * S },
      right: { id: "right", label: "East side", x: 635 * S, y: 28 * S, w: 370 * S, h: 627 * S }
    },
    inventory: null, youAreHere: null
  });

  g.CITIES = g.CITIES || {};
  g.CITIES.mumbai = {
    id: "mumbai", name: "Mumbai", note: "Floor 4",
    floors: { 4: floor4 }, defaultFloor: 4,
    testPairs: {
      4: [["409.41", "Victoria"], ["410.16", "405A"], ["410.05", "Cafeteria"], ["406.01", "412"], ["405.03", "F04-LTOI-01"], ["413", "404"]]
    }
  };
})();
