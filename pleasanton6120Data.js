/*
 * Pleasanton (USA) · Building 6120 · Floor 1 — digital floor plan data.
 *
 * North wing (Elevate, Innovator rooms, Co-Working Lounge), a long east spine
 * (lifts, 150, 144, 167, restrooms) and the rotated Meeting Center to the south.
 * Positions are measured on the whole-floor overview (1024 px wide) and scaled
 * by S into plan units.
 */
(function () {
  "use strict";

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  if (!g.DeskFloor) return;
  var S = 2;

  function R(id, x0, y0, x1, y1, door) { return [id, x0 * S, y0 * S, x1 * S, y1 * S, door]; }
  function F(type, x0, y0, x1, y1, label, id) { return [type, x0 * S, y0 * S, x1 * S, y1 * S, label || "", id]; }
  function Z(points, label, place, walk) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var f = F("zone", Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), label);
    f[7] = points.map(function (p) { return [p[0] * S, p[1] * S]; });
    if (place) f[8] = place === true ? [] : [place[0] * S, place[1] * S];
    if (walk) f[9] = "walk";
    return f;
  }

  function slant(x0, y0, x1, y1, n) {
    var out = [], t = 2;
    for (var i = 0; i < n; i++) {
      var xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
      var ya = y0 + (y1 - y0) * i / n, yb = y0 + (y1 - y0) * (i + 1) / n;
      out.push(F("partition", Math.min(xa, xb), Math.min(ya, yb), Math.max(xa, xb) + t, Math.min(ya, yb) + t));
      out.push(F("partition", xb, Math.min(ya, yb), xb + t, Math.max(ya, yb) + t));
    }
    return out;
  }
  function at(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  /* Straight wall from a to b with door openings at the given [t0, t1] fractions. */
  function wall(a, b, gaps) {
    var cuts = [0];
    (gaps || []).forEach(function (gp) { cuts.push(gp[0], gp[1]); });
    cuts.push(1);
    var out = [];
    for (var i = 0; i < cuts.length; i += 2) {
      var p = at(a, b, cuts[i]), q = at(a, b, cuts[i + 1]);
      var n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 4));
      out = out.concat(slant(p[0], p[1], q[0], q[1], n));
    }
    return out;
  }

  var ROOMS = [    // North wing
    R("Elevate", 335, 22, 410, 158, "E:0.9"),
    R("114", 424, 38, 440, 50, "W"),
    R("113", 415, 50, 440, 77, "E"), R("116", 415, 77, 440, 92, "E"), R("117", 415, 92, 440, 100, "E"),
    R("Innovator B", 450, 22, 497, 57, "E:0.8"), R("Innovator A", 450, 57, 497, 92, "E:0.8"),
    R("111", 450, 94, 497, 118, "S"),
    R("119", 507, 22, 525, 47, "S"), R("Momentum", 525, 22, 568, 47, "S"),
    R("Summit", 568, 22, 600, 45, "S"), R("Thrive", 600, 22, 635, 45, "S"), R("Visionary", 635, 22, 672, 45, "S:0.3"),
    R("120", 510, 60, 524, 74, "W"), R("105", 510, 74, 524, 90, "W"),
    R("119A", 526, 60, 560, 90, "S"), R("119B", 560, 60, 596, 90, "S"),
    R("125", 615, 62, 640, 90, "E"),
    R("110", 510, 100, 522, 112, "W"), R("109", 510, 112, 522, 124, "W"),
    R("Brilliance", 522, 100, 555, 124, "S"), R("Aspire", 555, 100, 588, 124, "S"), R("102", 588, 100, 600, 124, "E"),
    // East spine
    R("128", 682, 58, 700, 78, "W"),
    R("129", 652, 86, 705, 126, "W:0.8"),
    R("150", 661, 128, 705, 200, "W:0.95"),
    R("133B", 586, 160, 604, 178, "S:0.3>133A"), R("133C", 568, 176, 586, 190, "S:0.7>133A"), R("133A", 565, 191, 590, 205, "E:0.85"),
    R("139", 563, 206, 585, 245, "S:0.85"),
    R("136", 606, 212, 618, 226, "W"), R("137", 606, 226, 618, 239, "W"), R("138", 606, 239, 618, 253, "W"),
    R("145", 640, 212, 655, 227, "N"),
    R("144", 640, 229, 705, 278, "S:0.06"),
    R("141", 590, 291, 605, 308, "W:0.85"), R("170", 623, 287, 646, 306, "E:0.8>167"),
    R("151", 588, 368, 600, 385, "E:0.2"), R("152", 614, 368, 632, 385, "W:0.2"),
    R("167", 649, 286, 705, 385, "S:0.1"),
    // South: Meeting Center
    R("160A", 447, 375, 470, 389, "W"),
    R("158", 585, 400, 622, 425, "N"), R("166", 626, 400, 648, 440, "E"),
    R("Video/Production", 606, 470, 648, 492, "W:0.8"),
    R("Green Room", 618, 525, 660, 555, "N"),
    R("Backstage", 571, 574, 598, 598, "W:0.6")
  ];

  var FIXTURES = [
    F("stair", 415, 100, 440, 118, "Stairs"),
    F("stair", 598, 58, 614, 92, "Stairs"),
    F("lift", 648, 128, 661, 159, "Lifts"),
    F("blocked", 641, 160, 659, 205), F("blocked", 619, 210, 639, 256), F("room", 635, 308, 649, 352), F("blocked", 635, 352, 649, 385),
    F("stair", 605, 282, 622, 305, "Stairs"),
    F("wc", 590, 310, 632, 364, "Restrooms"), F("wall", 586, 364, 588, 385), F("wall", 632, 364, 634, 385)
  ];
  [
    Z([[415, 120], [555, 120], [555, 136], [527, 160], [415, 160]], "Co-Working Lounge", [480, 140], true),
    Z([[605, 96], [640, 96], [640, 126], [605, 126]], "100A", true, true),
    Z([[520, 372], [575, 372], [575, 392], [520, 392]], "Meeting Center Reception", true, true),
    Z([[455, 393], [600, 466], [552, 612], [381, 524]], "Meeting Center A, B, C", [492, 470])
  ].forEach(function (z) { FIXTURES.unshift(z); });

  // Meeting Center A, B, C: closed hall, entered only through its doors.
  var MC = [[455, 393], [600, 466], [552, 612], [381, 524]];
  FIXTURES = FIXTURES.concat(
    wall(MC[0], MC[1], [[0.36, 0.42], [0.69, 0.75]]),
    wall(MC[1], MC[2], [[0.03, 0.09], [0.4, 0.45], [0.82, 0.88]]),
    wall(MC[2], MC[3], [[0.46, 0.51]]),
    wall(MC[3], MC[0], [[0.38, 0.43], [0.85, 0.9]])
  );

  var OUTLINE = [
    [333, 18], [690, 18], [708, 45], [708, 388], [668, 388], [668, 460], [688, 470], [688, 560],
    [650, 560], [560, 640], [540, 640], [365, 520], [370, 505], [440, 318], [475, 335], [515, 352],
    [560, 352], [560, 182], [548, 162], [333, 162]
  ];

  var CONF = {
    "Innovator A": "Conference", "Innovator B": "Conference", "Momentum": "Conference", "Summit": "Conference",
    "Thrive": "Conference", "Visionary": "Conference", "Brilliance": "Conference", "Aspire": "Conference",
    "Meeting Center A, B, C": "Event Space", "Elevate": "Open Workspace"
  };
  var TYPES = {};
  ["114", "120", "105", "110", "109", "102", "128", "133B", "133C", "136", "137", "138", "145", "160A"]
    .forEach(function (id) { TYPES[id] = "phone"; });
  ["119A", "119B", "151", "152", "117", "141", "170", "Video/Production", "Green Room", "Backstage"]
    .forEach(function (id) { TYPES[id] = "service"; });
  var LABELS = {
    "119A": "119A Restroom", "119B": "119B Restroom", "151": "151 Restroom", "152": "152 Restroom",
    "100A": "100A Lobby", "Co-Working Lounge": "Co-Working Lounge",
    "Meeting Center Reception": "Meeting Center Reception"
  };
  Object.keys(CONF).forEach(function (id) { LABELS[id] = id + " · " + CONF[id]; });

  var floor1 = g.DeskFloor.buildFloor({
    level: 11, cityName: "Pleasanton 6120",
    building: {
      x: 328 * S, y: 14 * S, w: (712 - 328) * S, h: (644 - 14) * S,
      outline: OUTLINE.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: [], rooms: ROOMS, fixtures: FIXTURES, openGaps: [], midBand: null,
    meetings: Object.keys(CONF), types: TYPES, labels: LABELS, leftRooms: null, wingSplit: 560 * S,
    regions: {
      left: { id: "left", label: "North wing", x: 333 * S, y: 18 * S, w: 227 * S, h: 145 * S },
      core: { id: "core", label: "East spine", x: 560 * S, y: 18 * S, w: 148 * S, h: 370 * S },
      right: { id: "right", label: "Meeting Center", x: 365 * S, y: 388 * S, w: 323 * S, h: 252 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6120", { 1: floor1 }, {
    1: [["Elevate", "Meeting Center A, B, C"], ["Innovator A", "150"], ["Visionary", "167"], ["139", "Green Room"]]
  });

  /* ---------- Floor 2: north wing (Whiskey Sour, desk rows) and west wing (Wine Cooler) ---------- */
  function pod(series, wing, xs, ys, w, h, table, accent) {
    return {
      series: series, wing: wing, accent: accent,
      cols: xs.map(function (x) { return [x * S, (x + w) * S]; }),
      rows: ys.map(function (y) { return [y * S, (y + h) * S]; }),
      ids: xs.map(function (_, c) { return table.map(function (row) { return row[c] == null ? null : String(row[c]); }); })
    };
  }

  var PODS2 = [
    pod("2040", "core", [601, 620, 639, 658, 677, 696], [40, 56], 18, 16,
      [[2041, 2042, 2045, 2046, 2049, 2050], [2040, 2043, 2044, 2047, 2048, 2051]], "#16a34a"),
    pod("2050", "right", [736, 756], [38, 54, 86, 140, 158, 176], 19, 16,
      [[2052, 2053], [2055, 2056], [2063, 2061], [null, 2071], [2075, 2073], [2077, 2078]], "#16a34a"),
    pod("2080", "core", [600, 614, 630, 645, 660, 675, 690, 708], [202, 216, 230], 13, 13,
      [[2097, 2094, null, 2089, 2088, null, 2083, 2082], [2096, 2095, 2092, 2090, 2087, 2086, 2084, 2081],
        [null, null, null, null, null, null, null, 2080]], "#16a34a"),
    pod("2200", "left", [386, 405], [307], 18, 12, [[2201, 2203]], "#16a34a"),
    pod("2204", "left", [386, 399, 412], [348, 362], 12, 13, [[null, null, 2204], [2208, null, null]], "#16a34a"),
    pod("2210", "left", [386, 399, 412], [404, 418], 12, 13, [[null, null, 2210], [2213, 2214, 2215]], "#16a34a")
  ];

  var ROOMS2 = [
    // North-west
    R("200", 246, 24, 328, 94, "E:0.85"),
    R("204", 331, 22, 350, 45, "E"), R("203", 331, 45, 350, 80, "E"),
    R("Wente", 208, 100, 244, 132, "S:0.8"), R("251", 246, 102, 281, 132, "S"), R("252", 283, 98, 328, 128, "S"),
    R("202", 362, 104, 380, 128, "W"),
    // North wing, top row
    R("Whiskey Sour", 382, 30, 545, 92, "W:0.85|E:0.85"),
    R("206", 548, 32, 565, 52, "W>Whiskey Sour"), R("207", 548, 53, 565, 76, "W>Whiskey Sour"),
    R("210", 567, 30, 590, 52, "E"), R("211", 567, 53, 590, 76, "S"),
    R("229B", 432, 98, 452, 130, "S"), R("229", 503, 98, 520, 130, "S"),
    R("212B", 523, 116, 535, 129, "S"), R("212A", 537, 116, 549, 129, "S"),
    R("Alpha Omega", 566, 94, 609, 132, "S"), R("Arroyo Cellars", 612, 88, 655, 132, "S"),
    R("216", 668, 90, 700, 111, "W"), R("215", 668, 112, 700, 138, "W"), R("220", 668, 146, 690, 166, "S:0.3"),
    R("218A", 738, 106, 782, 137, "W"),
    // North wing, middle row
    R("234", 345, 186, 358, 205, "W"), R("235", 345, 206, 358, 225, "W"),
    R("Project Delivery Room", 360, 182, 438, 230, "N:0.45"),
    R("236", 345, 234, 375, 262, "S:0.2"), R("237", 378, 234, 400, 260, "S:0.8"), R("238", 402, 234, 438, 256, "S:0.15"),
    R("231", 440, 162, 465, 185, "N"), R("Far Niente", 467, 158, 506, 185, "N"),
    R("Ghost Block", 442, 206, 506, 246, "N:0.9"),
    R("228", 516, 160, 529, 178, "E:0.75"), R("227", 516, 180, 531, 198, "E"),
    R("Darioush", 516, 200, 548, 246, "N:0.85"),
    R("225", 548, 150, 590, 182, "W:0.3"),
    R("222", 590, 182, 611, 196, "S"), R("221", 613, 182, 640, 196, "S"),
    R("224", 550, 203, 572, 222, "E"), R("223", 552, 224, 575, 246, "E"),
    R("219", 755, 200, 783, 245, "W"),
    // West wing
    R("249", 291, 240, 322, 290, "N"), R("Wine Cooler", 216, 308, 304, 496, "N:0.55|S:0.15"),
    R("248", 307, 302, 318, 355, "N"), R("Obsidian", 320, 300, 366, 360, "E:0.1"),
    R("247", 307, 365, 320, 389, "E>Opus One"), R("Opus One", 322, 363, 366, 396, "E:0.5"),
    R("246", 307, 392, 320, 415, "S"), R("245", 322, 399, 338, 415, "S"),
    R("244", 307, 432, 338, 476, "N:0.1"),
    R("243", 307, 479, 322, 502, "E>V Sattui"), R("V Sattui", 324, 480, 366, 520, "E:0.1"),
    R("239A", 390, 322, 424, 339, "W"), R("239B", 390, 381, 424, 399, "W"), R("239C", 384, 456, 432, 488, "W")
  ];

  var FIXTURES2 = [
    F("lift", 385, 102, 428, 124, "Lifts"),
    F("wc", 455, 96, 500, 132, "Restrooms"),
    F("lift", 590, 150, 611, 180, "Lifts"), F("stair", 613, 150, 660, 180, "Stairs"),
    F("stair", 268, 160, 320, 185, "Stairs"), F("wc", 268, 188, 320, 235, "Restrooms"),
    F("lift", 340, 398, 366, 415, "Lifts"), F("stair", 340, 431, 366, 477, "Stairs")
  ];
  [
    Z([[340, 128], [362, 128], [362, 142], [340, 142]], "Copy/Print Station", true, true),
    Z([[700, 112], [722, 112], [722, 140], [700, 140]], "Copy/Print Station (East)", true, true),
    Z([[215, 186], [266, 186], [266, 240], [290, 240], [290, 305], [215, 305]], "Lounge", [240, 260], true)
  ].forEach(function (z) { FIXTURES2.unshift(z); });

  var OUTLINE2 = [
    [240, 16], [330, 16], [376, 28], [786, 28], [786, 250], [442, 250], [440, 600], [214, 600],
    [214, 186], [204, 186], [204, 100]
  ];

  var CONF2 = {
    "Whiskey Sour": "Open Workspace", "Wine Cooler": "Open Workspace", "200": "Open Workspace",
    "Alpha Omega": "Conference", "Arroyo Cellars": "Conference", "Project Delivery Room": "Conference",
    "Far Niente": "Conference", "Ghost Block": "Conference", "Darioush": "Conference",
    "Obsidian": "Conference", "Opus One": "Conference", "V Sattui": "Conference", "Wente": "Conference"
  };
  var TYPES2 = {};
  ["204", "203", "251", "252", "206", "207", "210", "211", "212A", "212B", "216", "215", "220", "234", "235",
    "236", "237", "238", "231", "228", "227", "222", "221", "224", "223", "248", "247", "246", "245", "244", "243",
    "239A", "239B", "239C"].forEach(function (id) { TYPES2[id] = "phone"; });
  ["202", "229B", "229", "218A", "225", "219", "249"].forEach(function (id) { TYPES2[id] = "service"; });
  var LABELS2 = {};
  Object.keys(CONF2).forEach(function (id) { LABELS2[id] = id + " · " + CONF2[id]; });

  var floor2 = g.DeskFloor.buildFloor({
    level: 12, cityName: "Pleasanton 6120",
    building: {
      x: 200 * S, y: 12 * S, w: (790 - 200) * S, h: (604 - 12) * S,
      outline: OUTLINE2.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS2, rooms: ROOMS2, fixtures: FIXTURES2, openGaps: [["Far Niente", "228"], ["Far Niente", "227"], ["Ghost Block", "227"]], midBand: null,
    meetings: Object.keys(CONF2), types: TYPES2, labels: LABELS2, leftRooms: null, wingSplit: 445 * S,
    regions: {
      left: { id: "left", label: "West wing", x: 204 * S, y: 16 * S, w: 241 * S, h: 584 * S },
      core: { id: "core", label: "North", x: 445 * S, y: 28 * S, w: 290 * S, h: 222 * S },
      right: { id: "right", label: "East", x: 735 * S, y: 28 * S, w: 51 * S, h: 222 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6120", { 2: floor2 }, {
    2: [["Wente", "219"], ["2041", "V Sattui"], ["Ghost Block", "2080"], ["239C", "Whiskey Sour"]]
  });

  /* ---------- Floor 3: free-address open floor with room blocks ---------- */
  var ROOMS3 = [
    // North-west suite
    R("302", 208, 30, 316, 108, "E:0.95"),
    R("303", 318, 31, 385, 81, "S:0.1"),
    R("Treadmill", 387, 31, 414, 55, "E:0.6"), R("304", 387, 57, 414, 86, "W:0.5>303"),
    R("Lactation Suite", 207, 111, 238, 148, "S:0.5"),
    R("Lactation Room 1", 240, 111, 261, 129, "W>Lactation Suite"), R("Lactation Room 2", 240, 131, 261, 148, "W>Lactation Suite"),
    R("Reflection & Wellbeing", 263, 111, 285, 148, "S:0.2"),
    R("353", 287, 111, 311, 148, "E:0.6"),
    R("301", 340, 103, 383, 138, "S:0.15"),
    // North centre
    R("319", 457, 151, 479, 168, "W"), R("321", 457, 170, 479, 187, "W"),
    R("318", 481, 151, 510, 187, "N"), R("317", 512, 151, 534, 187, "N"),
    R("307", 560, 89, 589, 117, "N"), R("308", 591, 89, 622, 117, "N"),
    R("Billie Jean", 560, 119, 622, 154, "W:0.85"),
    R("Doctor Doctor", 560, 156, 600, 187, "W:0.85"),
    R("311", 640, 92, 679, 124, "W"), R("310", 640, 126, 679, 155, "W"),
    R("Come on Eileen", 681, 92, 722, 187, "E:0.5"),
    // Diamond cluster
    R("325", 366, 156, 394, 177, "N"), R("326", 345, 181, 367, 203, "W"),
    R("324", 396, 172, 418, 196, "N"), R("323", 420, 196, 440, 219, "E"),
    R("Gypsy", 359, 207, 402, 244, "W:0.6"),
    R("Footloose", 442, 222, 476, 254, "E:0.5"),
    R("I Love Rock 'n' Roll", 398, 250, 440, 282, "S:0.8"),
    // West wing columns
    R("350", 265, 195, 283, 214, "W"), R("349", 265, 216, 283, 234, "W"), R("348", 265, 236, 283, 255, "W"),
    R("347", 265, 258, 297, 288, "S"), R("330", 299, 258, 327, 288, "E:0.85"),
    R("345", 297, 312, 325, 347, "W"), R("344", 297, 349, 325, 378, "W"), R("343", 297, 380, 325, 410, "W"),
    R("Jessie's Girl", 327, 320, 371, 410, "E:0.05"),
    R("342", 297, 413, 321, 435, "W:0.2"), R("341", 323, 413, 342, 430, "S:0.7"),
    R("Walk this Way", 295, 452, 343, 489, "W:0.15"),
    R("338", 295, 492, 319, 509, "W"), R("337", 295, 511, 319, 531, "W"),
    R("Let's Dance", 321, 492, 373, 531, "S:0.1")
  ];

  var FIXTURES3 = [
    F("lift", 385, 103, 436, 136, "Lifts"), F("wc", 438, 96, 520, 136, "Restrooms"),
    F("lift", 602, 156, 621, 184, "Lifts"), F("stair", 623, 156, 679, 185, "Stairs"),
    F("stair", 265, 164, 327, 192, "Stairs"), F("wc", 285, 195, 325, 255, "Restrooms"),
    F("lift", 344, 413, 371, 431, "Lifts"), F("stair", 345, 434, 373, 490, "Stairs")
  ];
  [
    Z([[536, 151], [545, 151], [545, 187], [536, 187]], "Copy/Mail (North)", true, true),
    Z([[327, 311], [371, 311], [371, 318], [327, 318]], "Copy/Mail", true, true)
  ].forEach(function (z) { FIXTURES3.unshift(z); });

  var OUTLINE3 = [
    [205, 80], [262, 14], [330, 14], [330, 28], [805, 28], [805, 256], [478, 256], [445, 300],
    [445, 550], [462, 550], [462, 628], [385, 628], [385, 615], [215, 615], [215, 148], [205, 148]
  ];

  var CONF3 = {
    "302": "Open Workspace", "303": "Conference", "Billie Jean": "Conference", "Doctor Doctor": "Conference",
    "Come on Eileen": "Conference", "Gypsy": "Conference", "Footloose": "Conference",
    "I Love Rock 'n' Roll": "Conference", "Jessie's Girl": "Conference", "Walk this Way": "Conference",
    "Let's Dance": "Conference"
  };
  var TYPES3 = {};
  ["304", "353", "319", "321", "318", "317", "307", "308", "311", "310", "325", "326", "324", "323", "350", "349",
    "348", "347", "330", "345", "344", "343", "342", "341", "338", "337"].forEach(function (id) { TYPES3[id] = "phone"; });
  ["Treadmill", "Lactation Suite", "Lactation Room 1", "Lactation Room 2", "Reflection & Wellbeing", "301"]
    .forEach(function (id) { TYPES3[id] = "service"; });
  var LABELS3 = {};
  Object.keys(CONF3).forEach(function (id) { LABELS3[id] = id + " · " + CONF3[id]; });

  var floor3 = g.DeskFloor.buildFloor({
    level: 13, cityName: "Pleasanton 6120",
    building: {
      x: 200 * S, y: 10 * S, w: (810 - 200) * S, h: (632 - 10) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: [], rooms: ROOMS3, fixtures: FIXTURES3, openGaps: [], midBand: null,
    meetings: Object.keys(CONF3), types: TYPES3, labels: LABELS3, leftRooms: null, wingSplit: 445 * S,
    regions: {
      left: { id: "left", label: "West wing", x: 205 * S, y: 14 * S, w: 240 * S, h: 614 * S },
      core: { id: "core", label: "Centre", x: 445 * S, y: 28 * S, w: 195 * S, h: 228 * S },
      right: { id: "right", label: "East", x: 640 * S, y: 28 * S, w: 165 * S, h: 228 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6120", { 3: floor3 }, {
    3: [["302", "Come on Eileen"], ["Let's Dance", "Billie Jean"], ["Gypsy", "Jessie's Girl"], ["Treadmill", "337"]]
  });
})();
