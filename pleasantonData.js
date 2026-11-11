/*
 * Pleasanton (USA) · Building 6110 · Floor 1 — digital floor plan data.
 *
 * Pleasanton has several buildings; each building is registered as its own
 * entry ("Pleasanton 6110", later "Pleasanton 6120", ...) so floors never mix.
 * Positions are measured on the whole-floor overview (1024 px wide) and scaled
 * by S into plan units; names come from the close-up sections.
 */
(function () {
  "use strict";

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  if (!g.DeskFloor) return;
  var S = 2;

  function R(id, x0, y0, x1, y1, door) { return [id, x0 * S, y0 * S, x1 * S, y1 * S, door]; }
  function F(type, x0, y0, x1, y1, label, id) { return [type, x0 * S, y0 * S, x1 * S, y1 * S, label || "", id]; }

  function pod(series, wing, xs, ys, w, h, table, accent) {
    return {
      series: series, wing: wing, accent: accent,
      cols: xs.map(function (x) { return [x * S, (x + w) * S]; }),
      rows: ys.map(function (y) { return [y * S, (y + h) * S]; }),
      ids: xs.map(function (_, c) { return table.map(function (row) { return row[c] == null ? null : row[c]; }); })
    };
  }

  function sealSlits(rooms, fixtures) {
    var max = 4 * S;
    rooms.forEach(function (a) {
      rooms.forEach(function (b) {
        var gx = b[1] - a[3];
        var gy = b[2] - a[4];
        var oy0 = Math.max(a[2], b[2]), oy1 = Math.min(a[4], b[4]);
        var ox0 = Math.max(a[1], b[1]), ox1 = Math.min(a[3], b[3]);
        if (gx > 0 && gx <= max && oy1 > oy0) fixtures.push(["wall", a[3], oy0, b[1], oy1, ""]);
        if (gy > 0 && gy <= max && ox1 > ox0) fixtures.push(["wall", ox0, a[4], ox1, b[2], ""]);
      });
    });
    return fixtures;
  }

  var PODS = [
    pod("154", "left", [160, 172], [414, 424.3, 434.6], 11.7, 9.6, [[1, 10], [2, 9], [3, 8]], "#16a34a"),
    pod("154", "left", [148.5, 158.8, 169.1, 179.4], [449.5], 10.2, 9.5, [[4, 5, 6, 7]], "#16a34a")
  ];

  var ROOMS = [
    // North-west: fitness wing and its lobby
    R("Fitness Center", 285, 104, 335, 114, "S"),
    R("Donut Day", 229, 146, 272, 179, "N:0.15"),
    R("Consult Room", 302, 146, 326, 169, "S:0.8"),
    R("All Gender Restroom", 326, 146, 367, 169, "S:0.2"),
    R("Cangineering", 229, 180, 272, 215, "S:0.15"),
    R("111", 274, 180, 338, 196, "S:0.2"),
    R("110", 339, 180, 367, 196, "S:0.85"),
    R("112A", 300, 197, 313, 205, "W"),
    R("111A", 314, 197, 326, 205, "E"),
    R("Badging Office", 300, 207, 334, 226, "E:0.2"),
    R("Badging Lobby", 342, 214, 360, 223, "N"),
    // Locker rooms and phone rooms along the north corridor
    R("Men's Locker Room", 379, 81, 457, 142, "S:0.05"),
    R("1010", 390, 146, 407, 160, "W"),
    R("Women's Locker Room", 379, 162, 457, 210, "N:0.05"),
    R("114", 379, 210, 398, 226, "S:0.8"),
    R("115", 399, 210, 418, 226, "S:0.8"),
    R("116", 419, 210, 438, 226, "S:0.8"),
    R("117", 439, 210, 458, 226, "S:0.8"),
    // Data Diner cafe (walk-in floor with kitchen lines)
    R("Data Diner", 600, 140, 640, 150, "S"),
    R("133", 688, 81, 722, 108, "S:0.9"),
    R("131", 733, 124, 753, 149, "W:0.6"),
    R("132", 757, 124, 776, 142, "N:0.5"),
    R("6110", 851, 81, 884, 113, "W:0.85"),
    R("Dining Area", 905, 150, 935, 158, "S"),
    R("126B", 585, 187, 611, 203, "E"),
    // West lobby reception
    R("100.01", 258, 265, 272, 298, "W"),
    R("Workday Pop-up Store", 280, 252, 303, 274, "E"),
    R("Closet", 280, 275, 299, 283, "E"),
    R("Safety Reception", 280, 284, 299, 298, "E"),
    // Lift core
    R("1025", 332, 347, 373, 373, "E:0.25"),
    R("All Gender Restroom 2", 428, 274, 449, 294, "N"),
    R("Lactation Room", 428, 295, 452, 307, "W:0.8"),
    R("190", 478, 334, 519, 373, "S:0.55"),
    // East: barista, 140, 142 and the interview rooms
    R("Barista", 537, 271, 561, 318, "W"),
    R("140", 590, 286, 616, 294, "W"),
    R("Wolfgang Puck", 537, 348, 559, 389, "N:0.2|N:0.8"),
    R("142", 600, 338, 630, 344, "S"),
    R("Summer Bash", 560, 357, 581, 380, "N:0.15"),
    R("Play to Win", 582, 357, 603, 380, "N:0.15"),
    R("Movember", 604, 357, 625, 380, "N:0.15"),
    R("Mountain Day", 626, 357, 647, 380, "N:0.15"),
    R("CXC Catering", 519, 389, 559, 412, "N:0.1"),
    R("Hack A Thon", 519, 414, 559, 480, "E:0.9"),
    R("Cantina", 560, 381, 647, 435, "S:0.06|S:0.85"),
    R("183A", 572, 435, 588, 440, "S"),
    R("183", 590, 449, 612, 455, "N"),
    R("180", 571, 465, 588, 481, "S"),
    R("182", 616, 465, 633, 481, "S"),
    // South-centre: behind the core
    R("Closet Janitor", 465, 392, 485, 402, "N"),
    R("All Gender Restroom 3", 489, 425, 508, 447, "E"),
    R("WorkClubs", 345, 433, 365, 468, "S:0.85"),
    R("199", 267, 442, 290, 482, "S:0.85"),
    R("Storage Room", 291, 442, 344, 481, "S:0.95"),
    // West wing: workstations 154, reception 150.01, phones
    R("Closet 2", 201, 413, 216, 426, "W:0.15"),
    R("150.01", 222, 412, 245, 443, "E"),
    R("158", 149, 467, 170, 481, "S"),
    R("157", 171, 467, 190, 481, "S"),
    R("150", 190, 520, 225, 527, "N"),
    // South row: 160C is the closet in Workdog's north-west corner
    R("160C", 267, 498, 277, 507, "N"),
    R("Workdog", 278, 498, 326, 565, "E:0.1|E:0.9"),
    R("164", 336, 498, 352, 516, "N"),
    R("165", 353, 498, 369, 516, "N"),
    R("166", 370, 498, 386, 516, "N"),
    R("161", 352, 538, 374, 544, "N"),
    R("Wellbeing", 397, 498, 450, 530, "W:0.75"),
    R("161A", 397, 531, 403, 537, "W"),
    R("Top Ten", 404, 531, 450, 565, "W:0.2"),
    R("Community", 451, 498, 498, 565, "E:0.15|E:0.85"),
    R("171", 506, 540, 520, 546, "N"),
    R("171A", 529, 522, 534, 534, "W"),
    R("VIBE", 535, 498, 580, 565, "W:0.3|W:0.6"),
    R("181", 598, 510, 622, 516, "N")
  ];

  var FIXTURES = [
    // Outline: curved fitness corner, west edge, slanted cafe end, rounded south-east
    F("void", 146, 70, 229, 215),
    F("void", 146, 215, 215, 373),
    F("void", 647, 266, 970, 566),
    F("void", 600, 542, 647, 566), F("void", 625, 515, 647, 542), F("void", 581, 556, 600, 566),
    F("void", 146, 545, 165, 566),
    // Locker-room sinks east of 1010
    F("other", 407, 142, 457, 162),
    // Data Diner back-of-house, servery lines and core
    F("other", 458, 81, 504, 226, "Kitchen"),
    F("other", 504, 196, 525, 226),
    F("other", 532, 92, 632, 106),
    F("other", 504, 111, 645, 122, "Servery"),
    F("other", 552, 168, 611, 185, "Servery"),
    F("other", 504, 81, 532, 111),
    // West entrance from the lobby side
    F("partition", 551, 196, 585, 199),
    F("door", 525, 196, 551, 199),
    // Kitchen back rooms along the north wall, each opening into the food hall
    F("other", 632, 81, 660, 108, "Store"), F("door", 640, 108, 652, 110),
    F("other", 660, 81, 688, 108, "Store"), F("door", 668, 108, 680, 110),
    F("other", 722, 81, 768, 108, "Store"), F("door", 740, 108, 752, 110),
    F("stair", 797, 81, 816, 120, "Stairs"),
    F("other", 819, 81, 849, 102, "Office"), F("door", 821, 102, 831, 104),
    // Food hall counters and the enclosed kitchen line
    F("other", 657, 128, 722, 137, "Servery"),
    F("other", 665, 146, 719, 152),
    F("other", 647, 158, 750, 194, "Kitchen Line"), F("door", 645, 170, 647, 182),
    // Lift and restroom box, entered from the west
    F("partition", 753, 144, 820, 146),
    F("partition", 818, 146, 820, 210),
    F("partition", 753, 208, 820, 210),
    F("partition", 753, 146, 755, 170), F("door", 753, 170, 755, 184), F("partition", 753, 184, 755, 208),
    F("wc", 756, 147, 778, 168, "WC"), F("wc", 790, 147, 817, 168, "WC"),
    F("lift", 758, 186, 782, 207, "Lift"),
    // Dining servery counters and buffet line with pass-throughs
    F("other", 834, 120, 841, 157),
    F("other", 822, 160, 866, 176, "Servery"),
    F("other", 832, 188, 861, 202),
    F("other", 868, 113, 883, 138, "Buffet"), F("door", 868, 138, 883, 148),
    F("other", 868, 148, 883, 166), F("door", 868, 166, 883, 174),
    F("other", 868, 174, 883, 182),
    // South seating: partition along its top with aisle openings
    F("partition", 652, 216, 688, 218), F("door", 688, 216, 700, 218),
    F("partition", 700, 216, 740, 218), F("door", 740, 216, 752, 218),
    F("partition", 752, 216, 770, 218), F("door", 770, 216, 800, 218),
    F("partition", 800, 216, 820, 218),
    F("partition", 650, 216, 652, 266),
    // East vestibule, walled off from the food hall
    F("partition", 611, 228, 650, 230),
    F("door", 613, 257, 643, 259),
    F("stair", 579, 204, 611, 258, "Stairs"),
    // West lobby
    F("wall", 272, 251, 280, 298),
    F("other", 258, 332, 313, 372),
    F("stair", 262, 375, 313, 436, "Stairs"),
    F("wall", 219, 370, 231, 373), F("wall", 244, 370, 258, 373),
    // Lift core
    F("wall", 332, 252, 436, 256), F("wall", 455, 252, 519, 256),
    F("wall", 332, 256, 339, 301), F("wall", 332, 328, 339, 347),
    F("other", 339, 256, 407, 280, "Service lift"),
    F("lift", 339, 280, 407, 301, "Lifts"),
    F("lift", 339, 328, 407, 347, "Lifts"),
    F("wall", 407, 256, 411, 373),
    F("wc", 411, 318, 474, 373, "Restrooms"),
    F("wall", 474, 256, 519, 262),
    F("wc", 478, 262, 519, 330, "Restrooms"),
    F("wall", 474, 262, 478, 373),
    F("wall", 332, 373, 383, 376), F("wall", 399, 373, 478, 376),
    // South-centre
    F("stair", 345, 378, 377, 432, "Stairs / Lift"),
    F("other", 405, 378, 465, 477),
    F("wc", 465, 402, 489, 478, "Restrooms"),
    F("wc", 489, 402, 508, 425), F("wc", 489, 447, 508, 478),
    F("other", 589, 473, 615, 478),
    // South: WorkClubs storage notch, counter under phones 164–166
    F("other", 345, 470, 352, 481),
    F("other", 336, 517, 386, 522),
    // West wing offices and partitions
    F("other", 148, 374, 178, 408, "Office"),
    F("other", 178, 374, 221, 400, "Office"),
    F("wall", 216, 426, 220, 465),
    F("wall", 220, 443, 222, 481),
    F("wall", 190, 473, 220, 477),
    F("wall", 190, 479, 222, 482),
    F("wall", 263, 507, 267, 566),
    // Workdog below its 160C closet
    F("other", 267, 508, 277, 565)
  ];

  function Z(points, label, place) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var f = F("zone", Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), label);
    f[7] = points.map(function (p) { return [p[0] * S, p[1] * S]; });
    if (place) f[8] = place === true ? [] : [place[0] * S, place[1] * S];
    return f;
  }
  [
    // 150 Customer Open Collaboration: below phones 157/158, slanting down to Workdog
    Z([[146, 482], [222, 482], [263, 503], [263, 566], [190, 566], [146, 516]]),
    // 161 Customer Open Collaboration: strip beside Workdog and the area under 164–166
    Z([[326, 498], [336, 498], [336, 517], [397, 517], [397, 566], [326, 566]]),
    // 171 Customer Open Collaboration between Community and VIBE
    Z([[498, 498], [535, 498], [535, 566], [498, 566]]),
    // 181 Customer Open Collaboration in the curved corner
    Z([[580, 498], [645, 498], [643, 502], [633, 523], [616, 541], [593, 554], [580, 558]]),
    // 183 Customer Open Collaboration above phones 180/182
    Z([[570, 440], [633, 440], [633, 465], [570, 465]]),
    // 140 Open Collaboration and 142 Kitchen / Break Area
    Z([[574, 268], [640, 268], [640, 320], [574, 320]]),
    Z([[559, 334], [647, 334], [647, 357], [559, 357]]),
    // Fitness Center gym floor
    Z([[229, 81], [367, 81], [367, 146], [229, 146]]),
    // Badging Lobby & Mail Lockers
    Z([[336, 203], [362, 203], [362, 226], [336, 226]]),
    // Data Diner Cafe sub-sections
    Z([[532, 111], [760, 111], [760, 200], [532, 200]], "Food Hall"),
    Z([[611, 203], [760, 203], [760, 222], [858, 222], [880, 222], [880, 266], [611, 266]], "Cafe Seating"),
    Z([[760, 81], [827, 81], [827, 205], [760, 205]], ""),
    Z([[864, 81], [960, 81], [960, 124], [864, 124]], "Dining"),
    Z([[882, 126], [960, 126], [960, 266], [882, 266]], "Dining Area")
  ].forEach(function (z) { FIXTURES.unshift(z); });

  FIXTURES.push(F("wall", 144, 373, 146, 505));
  sealSlits(ROOMS, FIXTURES);

  var OUTLINE = [
    [215, 373], [35, 373], [25, 383], [33, 395], [146, 505], [146, 516], [190, 566],
    [540, 566], [568, 563], [593, 554], [616, 541], [633, 523], [643, 502], [647, 480],
    [647, 270], [860, 270], [965, 88], [958, 78],
    [300, 78], [278, 82], [257, 94], [240, 114], [226, 139], [218, 168], [215, 200]
  ];

  var CONF = {
    "Donut Day": "Small Conf", "Cangineering": "Small Conf",
    "Summer Bash": "Interview Room", "Play to Win": "Interview Room", "Movember": "Interview Room",
    "Mountain Day": "Interview Room", "199": "Small Conf", "WorkClubs": "Small Conf",
    "Wellbeing": "Large Conf", "Top Ten": "Large Conf", "Community": "Large Conf", "VIBE": "Large Conf",
    "Cantina": "Customer Training", "Workdog": "Customer Training", "Hack A Thon": "Multipurpose",
    "6110": "Private Dining Multipurpose", "Consult Room": "Consult Room"
  };
  var MEETINGS = Object.keys(CONF);
  var PHONES = ["114", "115", "116", "117", "157", "158", "164", "165", "166", "180", "182"];
  var TYPES = {};
  PHONES.forEach(function (id) { TYPES[id] = "phone"; });
  ["112A", "111A", "1010", "126B", "Closet", "Closet 2", "Closet Janitor", "183A", "160C", "161A", "171A",
    "Storage Room", "190"].forEach(function (id) { TYPES[id] = "service"; });

  var LABELS = {
    "111": "111 UIUX Lab", "110": "110 UIUX Lab", "112A": "112A Storage", "111A": "111A Closet",
    "Badging Office": "Badging Office GSOC", "Badging Lobby": "Badging Lobby & Mail Lockers",
    "1010": "1010 Janitor", "133": "133 Shared Office", "131": "131 Locker Room", "132": "132 All Gender Restroom",
    "Data Diner": "Data Diner Cafe", "Dining Area": "Dining Area Cafe", "126B": "126B Closet",
    "100.01": "100.01 Reception", "Closet 2": "Closet",
    "All Gender Restroom 2": "All Gender Restroom", "All Gender Restroom 3": "All Gender Restroom",
    "1025": "1025 BT", "190": "190 Storage Room", "140": "140 Open Collaboration",
    "142": "142 Kitchen / Break Area", "Wolfgang Puck": "Wolfgang Puck · Shared Office",
    "CXC Catering": "CXC Catering · Kitchen / Break Area",
    "183A": "183A Closet", "183": "183 Customer Open Collaboration", "150.01": "150.01 Reception",
    "150": "150 Customer Open Collaboration", "160C": "160C Closet",
    "161": "161 Customer Open Collaboration", "161A": "161A Closet",
    "171": "171 Customer Open Collaboration", "171A": "171A Closet",
    "181": "181 Customer Open Collaboration", "Closet Janitor": "Closet / Janitor"
  };
  MEETINGS.forEach(function (id) {
    LABELS[id] = id === "Consult Room" ? id : id + " · " + CONF[id];
  });
  PHONES.forEach(function (id) { LABELS[id] = id + " Phone Room"; });

  var floor1 = g.DeskFloor.buildFloor({
    level: 1, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 70 * S, w: (970 - 20) * S, h: (566 - 70) * S,
      outline: OUTLINE.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS, rooms: ROOMS, fixtures: FIXTURES, openGaps: [], midBand: null,
    meetings: MEETINGS, types: TYPES, labels: LABELS, leftRooms: null, wingSplit: 460 * S,
    regions: {
      left: { id: "left", label: "West side", x: 146 * S, y: 70 * S, w: 186 * S, h: 496 * S },
      core: { id: "core", label: "Centre", x: 332 * S, y: 70 * S, w: 187 * S, h: 496 * S },
      right: { id: "right", label: "East side", x: 519 * S, y: 70 * S, w: 451 * S, h: 496 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 2 · Building 6110 (internal level 6). Measured on its own overview.
   * ------------------------------------------------------------------------- */

  function desks(series, wing, cols, rows, table, accent) {
    return {
      series: series, wing: wing, accent: accent || "#16a34a",
      cols: cols.map(function (c) { return [c[0] * S, c[1] * S]; }),
      rows: rows.map(function (r) { return [r[0] * S, r[1] * S]; }),
      ids: cols.map(function (_, c) { return table.map(function (row) { return row[c] == null ? null : row[c]; }); })
    };
  }
  function cluster(series, wing, cx, cy, table) {
    var n = table.length, h = 7, w = 10, cols = [], rows = [];
    for (var c = 0; c < table[0].length; c++) cols.push([cx - w + c * w, cx + c * w]);
    for (var r = 0; r < n; r++) rows.push([cy - n * h / 2 + r * h, cy - n * h / 2 + (r + 1) * h]);
    return desks(series, wing, cols, rows, table);
  }

  var N4R = [[87, 100], [100, 113], [113, 126], [126, 139]];
  var N3R = [[91, 104], [104, 117], [117, 130]];
  var S4R = [[512, 526], [526, 539], [539, 552], [552, 565]];
  var S3R = [[525, 539], [539, 552], [552, 565]];

  var PODS2 = [
    // North-west
    desks("2004", "left", [[221, 233], [233, 245], [245, 258], [258, 270]], [[165, 176], [176, 187]], [["2011", "2010", "2009", "2008"], ["2004", "2005", "2006", "2007"]]),
    desks("2001", "left", [[223, 235], [235, 248], [248, 260]], [[194, 206]], [["2003", "2002", "2001"]]),
    // North band
    desks("2020", "left", [[298, 309], [309, 321]], N4R, [["2020", null], ["2021", "2034"], ["2022", "2033"], ["2023", "2032"]]),
    desks("2036", "left", [[328, 340], [340, 351]], N3R, [["2036", "2047"], ["2037", "2046"], ["2038", null]]),
    desks("2050", "left", [[358, 370], [370, 381]], N4R, [[null, "2063"], [null, null], ["2050", null], ["2051", "2060"]]),
    desks("2064", "left", [[388, 401], [401, 414]], N3R, [["2064", "2075"], ["2065", "2074"], ["2066", "2073"]]),
    desks("2076", "left", [[418, 429], [429, 440]], N4R, [["2076", "2091"], ["2077", "2090"], ["2078", "2089"], ["2079", "2088"]]),
    desks("2092", "left", [[447, 457], [457, 467]], N3R, [["2092", "2103"], ["2093", "2102"], ["2094", "2101"]]),
    desks("2104", "right", [[474, 486], [486, 498]], N4R, [["2104", "2119"], ["2105", "2118"], ["2106", "2117"], ["2107", "2116"]]),
    desks("2120", "right", [[507, 518], [518, 529]], N3R, [["2120", "2131"], ["2121", "2130"], ["2122", "2129"]]),
    desks("2132", "right", [[536, 547], [547, 558]], N4R, [["2132", "2139"], ["2133", "2138"], [null, "2137"], ["2135", "2136"]]),
    desks("2140", "right", [[566, 576], [576, 587]], N3R, [["2140", "2145"], ["2141", "2144"], ["2142", "2143"]]),
    desks("2146", "right", [[595, 606], [606, 617]], N4R, [["2146", "2158"], ["2147", "2157"], ["2148", "2156"], ["2149", "2155"]]),
    desks("2160", "right", [[624, 635], [635, 646]], N3R, [[null, "2170"], ["2160", "2169"], ["2161", "2168"]]),
    desks("2172", "right", [[651, 661], [661, 671]], N4R, [["2172", "2187"], ["2173", "2186"], ["2174", "2185"], ["2175", "2184"]]),
    desks("2188", "right", [[680, 691], [691, 702]], N3R, [["2188", "2199"], ["2189", "2198"], ["2190", "2197"]]),
    desks("2200", "right", [[714, 726], [726, 738]], [[86, 98], [98, 110]], [["2200", "2203"], ["2201", "2202"]]),
    desks("2204", "right", [[742, 753], [753, 764]], [[86, 98]], [["2204", "2205"]]),
    desks("2206", "right", [[772, 784], [784, 796]], [[86, 98], [98, 110]], [["2206", "2209"], ["2207", "2208"]]),
    desks("2210", "right", [[800, 811], [811, 822]], [[86, 98]], [["2210", "2211"]]),
    desks("2212", "right", [[828, 839], [839, 850]], [[86, 98], [98, 110]], [["2212", null], ["2213", "2214"]]),
    // Second north row
    desks("2052", "left", [[358, 370], [370, 381]], [[145, 158], [158, 171], [171, 184], [184, 197]], [["2052", "2059"], ["2053", "2058"], [null, null], [null, null]]),
    desks("2068", "left", [[388, 401], [401, 414]], [[145, 162], [162, 179], [179, 196]], [[null, "2072"], ["2068", "2071"], ["2069", "2070"]]),
    desks("2080", "left", [[418, 429], [429, 440]], [[145, 158], [158, 171], [171, 184], [184, 197]], [["2080", "2087"], ["2081", "2086"], ["2082", "2085"], ["2083", "2084"]]),
    desks("2095", "left", [[447, 457], [457, 467]], [[149, 162], [162, 175], [175, 188]], [["2095", "2100"], ["2096", "2099"], ["2097", "2098"]]),
    desks("2108", "right", [[474, 486], [486, 498]], [[145, 158], [158, 171], [171, 184], [184, 197]], [["2108", "2115"], ["2109", "2114"], ["2110", "2113"], ["2111", "2112"]]),
    desks("2123", "right", [[505, 517]], [[149, 162], [162, 175], [175, 188]], [["2123"], ["2124"], ["2125"]]),
    desks("2153", "right", [[606, 617]], [[160, 172], [172, 184]], [["2154"], ["2153"]]),
    desks("2163", "right", [[621, 632], [632, 643]], [[148, 160], [160, 172], [172, 184]], [[null, "2167"], ["2163", "2166"], ["2164", "2165"]]),
    desks("2176", "right", [[651, 661], [661, 671]], [[146, 158], [158, 170], [170, 182], [182, 194]], [["2176", "2183"], ["2177", "2182"], ["2178", "2181"], ["2179", "2180"]]),
    desks("2191", "right", [[680, 691], [691, 702]], [[150, 162], [162, 174], [174, 186]], [["2191", "2196"], ["2192", "2195"], ["2193", "2194"]]),
    // ECOMM wing
    cluster("2224", "right", 958, 114, [["2226", "2225"], ["2227", "2224"], ["2229", null]]),
    cluster("2230", "right", 935, 140, [["2232", "2230"], ["2233", "2235"]]),
    cluster("2238", "right", 920, 160, [["2238"]]),
    cluster("2250", "right", 890, 180, [["2250"]]),
    cluster("2257", "right", 862, 207, [["2257", null], ["2258", "2259"]]),
    cluster("2260", "right", 848, 234, [["2262", null], ["2263", "2261"], ["2264", "2260"], [null, "2265"]]),
    // South-west wing
    cluster("2493", "left", 66, 408, [["2497", "2496"], ["2498", "2495"], ["2493", "2494"]]),
    cluster("2487", "left", 88, 431, [["2492", "2490"], ["2491", "2489"], ["2487", "2488"]]),
    cluster("2481", "left", 110, 454, [["2485", "2484"], ["2486", "2483"], ["2481", "2482"]]),
    cluster("2475", "left", 132, 477, [["2479", "2478"], ["2480", "2477"], ["2475", "2476"]]),
    cluster("2469", "left", 154, 500, [["2472", "2471"], ["2474", "2473"], ["2469", null]]),
    cluster("2463", "left", 176, 523, [["2467", "2466"], ["2468", "2465"], ["2463", "2464"]]),
    // South middle
    desks("2422", "left", [[338, 352]], [[464, 476], [476, 489], [489, 501]], [["2424"], ["2423"], ["2422"]], "#38bdf8"),
    desks("2407", "left", [[358, 370], [370, 383]], [[451, 464], [464, 477], [477, 490], [490, 503]], [["2411", "2410"], ["2412", "2409"], ["2413", "2408"], ["2414", "2407"]], "#38bdf8"),
    desks("2394", "right", [[388, 400], [400, 411]], [[465, 478], [478, 491], [491, 505]], [["2397", "2396"], ["2398", "2395"], ["2399", "2394"]], "#38bdf8"),
    desks("2379", "right", [[418, 430], [430, 443]], [[451, 464], [464, 477], [477, 490], [490, 503]], [["2383", "2382"], ["2384", "2381"], ["2385", "2380"], ["2386", "2379"]], "#38bdf8"),
    desks("2366", "right", [[448, 460], [460, 471]], [[465, 478], [478, 491], [491, 505]], [["2369", "2368"], ["2370", "2367"], ["2371", "2366"]]),
    desks("2351", "right", [[476, 488], [488, 500]], [[452, 465], [465, 478], [478, 491], [491, 505]], [["2355", "2354"], ["2356", "2353"], ["2357", "2352"], ["2358", "2351"]]),
    desks("2341", "right", [[505, 518]], [[465, 478], [478, 491], [491, 505]], [["2341"], ["2342"], ["2343"]]),
    desks("2300", "right", [[589, 604], [604, 620], [620, 635]], [[443, 453]], [["2300", "2301", "2302"]]),
    desks("2303", "right", [[587, 599], [599, 611], [611, 623], [623, 635]], [[463, 474], [474, 485]], [["2306", "2305", "2304", "2303"], ["2307", "2308", "2309", "2310"]]),
    // South band
    desks("2453", "left", [[210, 222], [222, 234]], S3R, [["2456", "2455"], ["2457", "2454"], ["2458", "2453"]]),
    desks("2445", "left", [[245, 256], [256, 268]], S4R, [["2449", "2448"], ["2450", "2447"], ["2451", "2446"], ["2452", "2445"]]),
    desks("2439", "left", [[272, 284], [284, 296]], S3R, [["2442", "2441"], ["2443", "2440"], ["2444", "2439"]]),
    desks("2431", "left", [[300, 311], [311, 322]], S4R, [["2435", "2434"], ["2436", "2433"], ["2437", "2432"], ["2438", "2431"]]),
    desks("2419", "left", [[328, 340], [340, 352]], S3R, [["2428", "2421"], ["2429", "2420"], ["2430", "2419"]]),
    desks("2415", "left", [[356, 368]], S4R, [["2415"], ["2416"], ["2417"], ["2418"]]),
    desks("2363", "right", [[449, 460], [460, 471]], [[523, 537], [537, 551], [551, 565]], [[null, "2365"], [null, "2364"], [null, "2363"]]),
    desks("2347", "right", [[476, 488], [488, 500]], S4R, [["2359", "2350"], ["2360", "2349"], ["2361", "2348"], ["2362", "2347"]]),
    desks("2335", "right", [[506, 518], [518, 530]], S3R, [["2344", "2337"], ["2345", "2336"], ["2346", "2335"]]),
    desks("2319", "right", [[536, 548], [548, 560]], S4R, [["2331", "2322"], ["2332", "2321"], ["2333", "2320"], ["2334", "2319"]])
  ];

  [["Jessica Pulido", 0.28, -1], ["Rich S", 0.28, 1], ["Kiran Bala", 0.45, -1], ["Sarah Kennedy Ellis", 0.45, 1],
    ["Christina Torres", 0.53, -1], ["Rani Johnson", 0.55, 1], ["Kelsey Willes", 0.70, -1], ["Sheri Rhodes", 0.70, 1],
    ["Monica Durbano", 0.76, -1], ["Rob Enslin", 0.80, 1]
  ].forEach(function (o) {
    var cx = 958 - 110 * o[1] + o[2] * 0.737 * 9, cy = 114 + 120 * o[1] + o[2] * 0.676 * 9;
    PODS2.push(desks("ECOMM", "right", [[cx - 3.5, cx + 3.5]], [[cy - 3, cy + 3]], [["ECOMM: " + o[0]]], "#2563eb"));
  });

  var ROOMS2 = [
    // North-west
    R("207c", 226, 150, 234, 158, "E"),
    R("2001a", 262, 199, 269, 206, "E"),
    R("202A", 278, 208, 293, 222, "W"),
    R("202B", 278, 222, 293, 236, "W"),
    R("202C", 278, 236, 293, 250, "W"),
    R("Storage Room", 293, 206, 327, 250, "S:0.9"),
    R("206", 338, 207, 356, 221, "W"),
    R("205", 338, 221, 356, 236, "W"),
    R("204", 338, 236, 356, 250, "W"),
    R("209", 356, 207, 376, 228, "N:0.8"),
    R("212", 356, 228, 376, 250, "S:0.8"),
    R("210", 377, 207, 388, 228, "N"),
    R("211a", 378, 231, 386, 239, "E"),
    R("211b", 378, 241, 386, 249, "E"),
    R("213A", 394, 207, 406, 221, "W"),
    R("213B", 394, 221, 406, 236, "W"),
    R("213C", 394, 236, 406, 250, "W"),
    R("Checkpoint", 406, 207, 447, 229, "N:0.9"),
    R("Storage Room 2", 406, 229, 447, 250, "S:0.9"),
    R("215C", 447, 207, 460, 221, "E"),
    R("215B", 447, 221, 460, 236, "E"),
    R("215A", 447, 236, 460, 250, "E"),
    R("218b", 470, 210, 477, 217, "W"),
    R("218a", 470, 219, 477, 226, "W"),
    R("219", 478, 208, 500, 228, "N:0.1"),
    R("217", 468, 230, 480, 250, "W:0.2"),
    R("223", 480, 230, 500, 250, "S:0.15"),
    R("220", 501, 208, 515, 221, "E:0.8"),
    R("221", 501, 221, 515, 236, "E:0.85"),
    R("222", 501, 236, 515, 250, "E:0.8"),
    // North core
    R("Go Live", 531, 147, 568, 172, "W:0.1"),
    R("226", 568, 147, 590, 172, "E:0.1"),
    R("Discovery", 531, 172, 568, 197, "S:0.1"),
    R("227", 568, 172, 590, 197, "S:0.9"),
    R("Copy/Mail", 567, 205, 601, 212, "N"),
    R("BT Tech Hub", 609, 205, 652, 247, "S:0.1"),
    R("Storage Room 3", 653, 205, 670, 252, "W:0.1>BT Tech Hub"),
    R("246c", 688, 212, 696, 220, "N"),
    R("246B", 672, 222, 704, 252, "N:0.1"),
    R("Workday", 705, 222, 760, 254, "E:0.1"),
    // North-east
    R("234", 722, 123, 734, 136, "W"),
    R("233", 722, 136, 734, 149, "W"),
    R("232", 722, 149, 734, 162, "W"),
    R("231", 722, 162, 734, 176, "W"),
    R("230", 722, 176, 734, 189, "W"),
    R("229", 722, 189, 734, 203, "W"),
    R("235", 735, 123, 759, 139, "N"),
    R("236", 760, 123, 774, 131, "E"),
    R("237", 760, 131, 774, 140, "E"),
    R("237a", 782, 129, 790, 137, "W"),
    R("237b", 782, 138, 790, 146, "W"),
    R("240A", 862, 86, 882, 110, "S"),
    R("240B", 882, 86, 902, 110, "S"),
    R("240C", 902, 86, 922, 110, "S:0.2"),
    R("Jumpstart", 818, 117, 856, 139, "N:0.9"),
    R("239", 856, 117, 878, 139, "N"),
    R("241", 879, 117, 892, 133, "S"),
    R("243", 818, 140, 840, 172, "S:0.6>Kitchen/Break Area 4"),
    R("242", 840, 140, 860, 165, "S:0.3"),
    R("Kitchen/Break Area 4", 818, 173, 836, 205, "E"),
    R("Closet 2", 818, 206, 828, 214, "E"),
    // Centre core
    R("Reflection & Wellbeing", 412, 268, 458, 292, "S:0.15"),
    R("299C", 422, 296, 458, 316, "W:0.15"),
    R("Lactation Room", 422, 331, 458, 345, "S:0.75>Lactation Suite"),
    R("Lactation Suite", 422, 345, 458, 357, "W"),
    R("Lactation Room 2", 422, 357, 458, 370, "N:0.75>Lactation Suite"),
    R("299G", 404, 374, 420, 382, "N:0.5"),
    R("Kitchen/Break Area", 280, 282, 295, 370, "E"),
    R("Kitchen/Break Area 2", 525, 316, 540, 372, "W"),
    // South core row
    R("275", 341, 400, 355, 414, "W:0.4"),
    R("274", 341, 414, 355, 430, "W:0.3"),
    R("273", 341, 430, 355, 445, "W:0.3"),
    R("276", 355, 400, 374, 423, "N:0.85"),
    R("272", 355, 423, 374, 445, "S:0.85"),
    R("270", 374, 400, 386, 423, "W:0.5>276"),
    R("271", 374, 423, 386, 445, "W:0.5>272"),
    R("268A", 395, 400, 406, 415, "W"),
    R("268B", 395, 415, 406, 430, "W"),
    R("268C", 395, 430, 406, 445, "W"),
    R("269", 406, 400, 449, 418, "N"),
    R("Next Level", 406, 418, 449, 445, "S:0.9"),
    R("266C", 449, 400, 460, 415, "E"),
    R("266B", 449, 415, 460, 430, "E"),
    R("266A", 449, 430, 460, 445, "E"),
    R("264", 470, 400, 482, 423, "E:0.5>265"),
    R("263", 470, 423, 482, 445, "E:0.5>262"),
    R("265", 482, 400, 501, 423, "N:0.1"),
    R("262", 482, 423, 501, 445, "S:0.1"),
    R("259", 501, 400, 516, 415, "E:0.4"),
    R("260", 501, 415, 516, 430, "E:0.3"),
    R("261", 501, 430, 516, 445, "E:0.4"),
    R("252", 534, 400, 555, 423, "N:0.1"),
    R("256", 534, 423, 555, 445, "S:0.1"),
    R("253", 555, 400, 576, 423, "N:0.9"),
    R("255", 555, 423, 576, 445, "S:0.9"),
    R("Copy/Mail 2", 576, 400, 582, 445, "E"),
    // West / south-west
    R("Treadmill Room", 159, 389, 185, 403, "W:0.85"),
    R("284", 159, 420, 171, 431, "W"),
    R("285", 159, 431, 171, 442, "W"),
    R("286", 171, 420, 189, 442, "S:0.85"),
    R("Workshop", 189, 420, 224, 442, "S:0.1"),
    R("Game Room", 226, 392, 282, 445, "N:0.3|S:0.9"),
    R("Kitchen/Break Area 3", 172, 452, 198, 462, "N"),
    R("Closet", 198, 452, 208, 462, "N"),
    R("288B", 208, 452, 216, 462, "N"),
    R("288A", 216, 452, 232, 462, "N"),
    R("281", 171, 463, 203, 496, "W"),
    R("280", 203, 463, 220, 496, "S"),
    R("Scorecard", 233, 455, 264, 501, "S:0.9"),
    R("Roadmap", 268, 455, 329, 501, "N:0.1|N:0.9")
  ];

  var FIXTURES2 = [
    F("lift", 341, 268, 408, 318, "Lifts"), F("wc", 465, 268, 518, 318, "Restrooms"),
    F("lift", 341, 331, 400, 382, "Lifts"), F("wc", 465, 331, 518, 382, "Restrooms"),
    F("other", 236, 300, 276, 345, "Open to below"), F("other", 583, 300, 625, 345, "Open to below"),
    F("stair", 284, 382, 322, 445, "Stairs"), F("other", 185, 389, 224, 403), F("other", 159, 404, 224, 419),
    F("stair", 540, 214, 607, 252, "Stairs"),
    F("other", 736, 156, 793, 205), F("stair", 794, 119, 808, 205, "Stairs")
  ];
  [
    Z([[276, 145], [334, 145], [334, 196], [276, 196]], "207", true),
    Z([[224, 92], [296, 92], [296, 145], [224, 145]], "207a", true),
    Z([[526, 453], [569, 453], [569, 503], [526, 503]], "257", true),
    Z([[596, 492], [648, 492], [648, 552], [596, 552]], "257a", true),
    Z([[111, 384], [154, 384], [154, 426], [111, 426]], "282", true),
    Z([[36, 386], [60, 386], [60, 398], [36, 398]], "282a", true),
    Z([[768, 223], [800, 223], [800, 255], [768, 255]], "245a", true),
    Z([[962, 84], [1003, 84], [1013, 98], [1011, 110], [990, 121]], "241a", [995, 98]),
    Z([[228, 222], [276, 222], [276, 290], [228, 290]], "Break Area", true),
    Z([[600, 345], [660, 345], [660, 395], [600, 395]], "Break Area 2", true),
    Z([[160, 270], [215, 270], [215, 380], [160, 380]], "West Balcony", true),
    Z([[640, 270], [690, 270], [690, 440], [640, 440]], "East Balcony", true)
  ].forEach(function (z) { FIXTURES2.unshift(z); });
  sealSlits(ROOMS2, FIXTURES2);

  var OUTLINE2 = [
    [300, 80], [1003, 82], [1014, 96], [1012, 111], [988, 122], [835, 262], [700, 266], [660, 450], [652, 515],
    [630, 550], [595, 566], [150, 566], [130, 552], [25, 398], [30, 384], [148, 382], [195, 258],
    [205, 200], [212, 160], [232, 122], [262, 95]
  ];

  var CONF2 = {
    "Go Live": "Conference", "Discovery": "Conference", "Checkpoint": "Large Conf", "Jumpstart": "Large Conf",
    "Workday": "Large Conf", "Next Level": "Large Conf", "Scorecard": "Large Conf", "Roadmap": "Training",
    "Workshop": "Conference", "Game Room": "Game Room", "226": "Small Conf", "227": "Small Conf",
    "209": "Small Conf", "212": "Small Conf", "219": "Small Conf", "223": "Small Conf", "276": "Small Conf",
    "272": "Small Conf", "265": "Small Conf", "262": "Small Conf", "252": "Small Conf", "253": "Small Conf",
    "255": "Small Conf", "256": "Small Conf", "235": "Small Conf", "239": "Small Conf", "243": "Small Conf",
    "242": "Small Conf", "240A": "Small Conf", "240B": "Small Conf", "240C": "Small Conf", "286": "Small Conf",
    "280": "Small Conf", "281": "Small Conf", "246B": "Small Conf"
  };
  var TYPES2 = {};
  ["207c", "2001a", "211a", "211b", "218a", "218b", "237a", "237b", "246c", "299G"].forEach(function (id) { TYPES2[id] = "phone"; });
  ["Storage Room", "Storage Room 2", "Storage Room 3", "Copy/Mail", "Copy/Mail 2", "Closet", "Closet 2",
    "Treadmill Room", "Lactation Room", "Lactation Suite", "Lactation Room 2", "Reflection & Wellbeing",
    "Kitchen/Break Area", "Kitchen/Break Area 2", "Kitchen/Break Area 3", "Kitchen/Break Area 4", "288A", "288B"
  ].forEach(function (id) { TYPES2[id] = "service"; });
  var LABELS2 = {
    "Storage Room 2": "Storage Room", "Storage Room 3": "Storage Room", "Copy/Mail": "Copy / Mail",
    "Copy/Mail 2": "Copy / Mail", "Closet 2": "Closet", "Lactation Room 2": "Lactation Room",
    "Kitchen/Break Area": "Kitchen / Break Area", "Kitchen/Break Area 2": "Kitchen / Break Area",
    "Kitchen/Break Area 3": "Kitchen / Break Area", "Kitchen/Break Area 4": "Kitchen / Break Area",
    "207": "207 · Open Collaboration", "207a": "207a · Open Collaboration", "257": "257 · Open Collaboration",
    "257a": "257a · Open Collaboration", "282": "282 · Open Collaboration", "282a": "282a · Open Collaboration",
    "245a": "245a · Open Collaboration", "241a": "241a · Free Address", "Break Area 2": "Break Area"
  };
  Object.keys(CONF2).forEach(function (id) { LABELS2[id] = id + " · " + CONF2[id]; });

  var floor2 = g.DeskFloor.buildFloor({
    level: 6, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 72 * S, w: (1018 - 20) * S, h: (572 - 72) * S,
      outline: OUTLINE2.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS2, rooms: ROOMS2, fixtures: FIXTURES2, openGaps: [], midBand: null,
    meetings: Object.keys(CONF2), types: TYPES2, labels: LABELS2, leftRooms: null, wingSplit: 470 * S,
    regions: {
      left: { id: "left", label: "West side", x: 25 * S, y: 80 * S, w: 445 * S, h: 486 * S },
      core: { id: "core", label: "Centre", x: 470 * S, y: 80 * S, w: 190 * S, h: 486 * S },
      right: { id: "right", label: "East side", x: 660 * S, y: 80 * S, w: 330 * S, h: 186 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 3 · Building 6110 (internal level 7). Measured on its own overview.
   * North-wall pods: left column runs down, right column runs back up.
   * South-wall pods: left column runs down from L, right column from L-1 down.
   * ------------------------------------------------------------------------- */
  var R4N = [[82, 93], [93, 105], [105, 116], [116, 128]], R3N = [[85, 96], [96, 107], [107, 118]];
  var R4S = [[507, 518], [518, 529], [529, 540], [540, 551]], R3S = [[518, 529], [529, 540], [540, 551]];
  var E4 = [[212, 224], [224, 236], [236, 248], [248, 260]], E3 = [[219, 231], [231, 243], [243, 255]];
  function npod(L, n, c) {
    var t = [];
    for (var i = 0; i < n; i++) t.push([String(L + i), String(L + 2 * n - 1 - i)]);
    return desks(String(L), c < 520 ? "left" : "right", [[c - 5.5, c + 5.5], [c + 5.5, c + 16.5]], n === 4 ? R4N : R3N, t);
  }
  function spod(L, n, x0, x1, rows) {
    var t = [], m = (x0 + x1) / 2;
    for (var i = 0; i < n; i++) t.push([String(L + i), String(L - 1 - i)]);
    return desks(String(L), m < 520 ? "left" : "right", [[x0, m], [m, x1]], rows || (n === 4 ? R4S : R3S), t);
  }
  function hpod(series, cols, rows, top, bottom) {
    return desks(series, "left", cols, rows, [top, bottom]);
  }
  var W3C = [[222, 236], [236, 250], [250, 264]], W4C = [[218, 231], [231, 244], [244, 257], [257, 270]];
  var X3C = [[597, 610], [610, 623], [623, 636]];

  var PODS3 = [
    // North band
    npod(3037, 4, 307), npod(3053, 3, 336), npod(3059, 4, 366), npod(3067, 3, 395), npod(3073, 4, 425),
    npod(3081, 3, 454), npod(3087, 4, 484), npod(3095, 3, 513), npod(3101, 4, 543), npod(3109, 3, 572),
    npod(3115, 4, 601), npod(3131, 4, 661), npod(3139, 3, 690), npod(3145, 4, 719), npod(3153, 3, 749),
    npod(3159, 4, 779), npod(3167, 3, 808), npod(3173, 4, 838), npod(3181, 3, 867), npod(3187, 4, 896),
    npod(3195, 3, 925), npod(3201, 3, 954),
    // West column
    hpod("3021", W4C, [[158, 168], [168, 179]], [null, "3027", "3026", "3025"], ["3021", "3022", "3023", "3024"]),
    hpod("3015", W3C, [[187, 197], [197, 208]], ["3020", "3019", "3018"], ["3015", "3016", "3017"]),
    hpod("3007", W4C, [[217, 227], [227, 238]], [null, "3013", "3012", "3011"], ["3007", "3008", "3009", "3010"]),
    hpod("3001", W3C, [[246, 256], [256, 267]], ["3006", "3005", "3004"], ["3001", "3002", "3003"]),
    hpod("3511", W3C, [[275, 285], [285, 296]], ["3516", "3515", "3514"], ["3511", "3512", "3513"]),
    hpod("3503", W4C, [[305, 315], [315, 326]], [null, "3509", "3508", "3507"], ["3503", "3504", "3505", "3506"]),
    hpod("3497", W3C, [[333, 343], [343, 354]], ["3502", "3501", "3500"], ["3497", "3498", "3499"]),
    hpod("3491", [[230, 243], [243, 256], [256, 269]], [[368, 378], [378, 389]], ["3496", "3495", "3494"], ["3491", "3492", "3493"]),
    hpod("3485", [[230, 243], [243, 256], [256, 269]], [[396, 406], [406, 417]], ["3490", "3489", "3488"], ["3485", "3486", "3487"]),
    // South band
    desks("3429", "left", [[206, 217], [217, 228]], R3S, [["3432", "3431"], ["3433", "3430"], ["3434", "3429"]]),
    spod(3425, 4, 236, 260), spod(3418, 3, 266, 288), spod(3411, 4, 297, 321), spod(3404, 3, 329, 353),
    spod(3397, 4, 361, 385), spod(3390, 3, 392, 414), spod(3383, 4, 422, 446), spod(3376, 3, 452, 476),
    spod(3369, 4, 482, 506), spod(3362, 3, 512, 536),
    desks("3343", "right", [[542, 554], [554, 566]], R4S, [["3355", "3346"], ["3356", "3345"], ["3357", "3344"], ["3358", "3343"]]),
    // East band (AI Platform)
    desks("3281", "right", [[596, 606], [606, 616]], E4, [["3284", "3285"], ["3283", "3286"], ["3282", "3287"], ["3281", "3288"]]),
    desks("3275", "right", [[625, 637], [637, 649]], E3, [["3277", "3278"], ["3276", "3279"], ["3275", "3280"]]),
    spod(3272, 3, 652, 675, E3), spod(3266, 3, 681, 704, E3), spod(3259, 4, 712, 734, E4),
    spod(3252, 3, 742, 765, E3), spod(3245, 4, 772, 795, E4), spod(3238, 3, 803, 825, E3),
    // East column
    hpod("3289", X3C, [[277, 286], [286, 295]], ["3291", "3290", "3289"], ["3292", "3293", "3294"]),
    hpod("3295", [[601, 614], [614, 627], [627, 640]], [[307, 316], [316, 325]], ["3297", "3296", "3295"], ["3298", "3299", "3300"]),
    hpod("3301", X3C, [[336, 345], [345, 355]], ["3303", "3302", "3301"], ["3304", "3305", "3306"]),
    hpod("3307", X3C, [[364, 374], [374, 384]], ["3309", "3308", "3307"], ["3310", "3311", "3312"]),
    hpod("3313", [[590, 602], [602, 614], [614, 626], [626, 638]], [[394, 404], [404, 414]], ["3316", "3315", "3314", "3313"], ["3317", "3318", "3319", null]),
    hpod("3321", X3C, [[424, 433], [433, 443]], ["3323", "3322", "3321"], ["3324", "3325", "3326"]),
    hpod("3327", [[587, 598], [598, 609], [609, 620], [620, 632]], [[452, 462], [462, 472]], ["3330", "3329", "3328", "3327"], ["3331", "3332", "3333", "3334"]),
    // North-east diagonal
    cluster("3209", "right", 890, 155, [["3215", "3211", "3209"], ["3216", null, "3212"], ["3214", null, "3213"], ["3217", "3218", null]]),
    cluster("3219", "right", 866, 185, [["3221", null], ["3222", "3220"], ["3223", "3219"], ["3224", null]]),
    cluster("3225", "right", 850, 222, [["3227", null], ["3228", "3226"], ["3229", "3225"], ["3230", null]]),
    // South-west diagonal
    cluster("3463", "left", 86, 414, [["3469", "3471", "3470"], ["3468", null, "3465"], ["3463", null, "3466"], ["3467", "3464", null]]),
    cluster("3457", "left", 124, 452, [["3462", "3459"], ["3461", "3458"], ["3457", "3460"]]),
    cluster("3445", "left", 152, 480, [["3454", "3453", "3447"], ["3451", null, "3446"], ["3450", null, "3452"], ["3445", "3448", "3449"]]),
    cluster("3439", "left", 188, 512, [["3444", "3441"], ["3443", "3440"], ["3439", "3442"]])
  ];

  var ROOMS3 = [
    // North-west rooms
    R("315", 341, 137, 357, 153, "W"), R("314", 341, 153, 357, 170, "W"), R("313", 341, 170, 357, 186, "W"),
    R("Copy/Mail 3", 360, 137, 388, 160, "S"),
    R("321", 400, 137, 434, 163, "N:0.9"),
    R("Electricity", 434, 137, 466, 163, "N:0.1"),
    R("319E", 458, 172, 466, 182, "E"),
    R("Kitchen/Break Area 5", 360, 172, 458, 197, "S"),
    R("325", 481, 140, 501, 158, "W"), R("324", 481, 160, 501, 186, "W:0.85"),
    R("326", 503, 140, 520, 156, "E"), R("327", 503, 156, 520, 173, "E"), R("328", 503, 173, 520, 190, "E"),
    // North-centre rooms
    R("330", 538, 139, 557, 162, "W"), R("329", 538, 162, 557, 186, "W"),
    R("331", 557, 139, 576, 186, "E"),
    R("332A", 588, 139, 604, 154, "W"), R("332B", 588, 154, 604, 170, "W"), R("332C", 588, 170, 604, 186, "W"),
    R("333", 604, 139, 612, 150, "N"),
    R("Internet", 604, 152, 636, 190, "S"),
    R("334", 636, 139, 659, 164, "N"), R("335", 659, 139, 676, 164, "N"),
    R("350", 636, 164, 659, 190, "S"), R("349", 659, 164, 676, 190, "S"),
    R("336", 676, 139, 695, 164, "N"), R("337", 676, 164, 695, 190, "S"),
    R("Phone Booth", 622, 82, 636, 90, "S"), R("Phone Booth 2", 638, 82, 648, 90, "S"),
    R("340", 718, 139, 733, 150, "W"),
    R("339A", 718, 150, 733, 163, "W"), R("339B", 718, 163, 733, 176, "W"), R("339C", 718, 176, 733, 189, "W"),
    R("338", 718, 189, 733, 198, "W"),
    // North-east kitchen
    R("342", 818, 138, 838, 160, "N:0.15"), R("343", 838, 138, 856, 160, "N:0.15"), R("344", 856, 138, 868, 150, "N:0.2"),
    R("Kitchen/Break Area 6", 800, 162, 840, 196, "E"),
    R("346", 800, 196, 812, 206, "E"),
    // West column rooms
    R("311", 280, 197, 296, 215, "N"), R("310", 296, 197, 312, 215, "N"), R("309", 312, 197, 328, 215, "N"),
    R("Cell Phone", 280, 215, 328, 272, "E:0.08|E:0.92"),
    R("302C", 280, 284, 304, 296, "N"), R("302A", 304, 284, 328, 296, "N"),
    R("303", 280, 296, 304, 313, "W"), R("301", 304, 296, 328, 313, "E"),
    R("Automobile", 280, 313, 328, 343, "E"),
    R("304", 280, 343, 296, 360, "S"), R("305", 296, 343, 312, 360, "S"), R("306", 312, 343, 328, 360, "S"),
    // Core
    R("Reflection & Wellbeing 3", 425, 258, 446, 283, "W"),
    R("399C", 425, 285, 446, 306, "W"),
    R("Lactation Room 3", 425, 325, 462, 337, "S:0.75>Lactation Suite 3"),
    R("Lactation Suite 3", 425, 337, 462, 349, "W"),
    R("Lactation Room 4", 425, 349, 462, 361, "N:0.75>Lactation Suite 3"),
    R("354", 532, 272, 547, 288, "N:0.2"), R("353", 547, 272, 562, 288, "N:0.2"), R("352", 562, 272, 578, 288, "N:0.2"),
    R("355", 532, 288, 555, 308, "S"), R("356", 555, 288, 578, 308, "S:0.75"),
    R("358", 532, 325, 555, 345, "N:0.15"), R("357", 555, 325, 578, 345, "N:0.85"),
    R("Light Bulb", 532, 345, 578, 415, "W:0.08"),
    R("360", 532, 415, 547, 435, "S"), R("361", 547, 415, 562, 435, "S"), R("362", 562, 415, 578, 435, "S"),
    // South rooms
    R("380", 340, 443, 361, 462, "W"), R("379", 340, 462, 361, 478, "W"), R("378", 340, 478, 361, 492, "W"),
    R("376", 361, 443, 378, 466, "E:0.85"), R("377", 361, 467, 378, 492, "E:0.9"),
    R("Kitchen/Break Area 7", 395, 443, 472, 463, "N"),
    R("371F", 389, 455, 395, 463, "W"),
    R("Steam Engine", 389, 464, 424, 492, "S:0.85"),
    R("373", 424, 464, 444, 492, "S:0.15"), R("372", 444, 464, 465, 492, "S:0.15"),
    R("368", 482, 449, 502, 492, "W:0.1"),
    R("365", 503, 443, 519, 458, "E"), R("366", 503, 458, 519, 478, "E"), R("367", 503, 478, 519, 492, "E"),
    // South-west rooms
    R("Treadmill Room 3", 160, 368, 222, 388, "W"),
    R("Kitchen/Break Area 8", 158, 410, 226, 424, "W"),
    R("391", 165, 433, 185, 456, "N"), R("392", 185, 433, 204, 456, "N"), R("393", 204, 433, 223, 456, "N"),
    R("Wheel", 223, 433, 264, 456, "E:0.1"),
    R("387", 180, 458, 193, 470, "S:0.8"), R("386", 193, 458, 206, 470, "S"), R("385", 206, 458, 219, 470, "S"),
    R("Telegraph", 219, 458, 264, 490, "S:0.1"),
    R("383", 274, 446, 299, 497, "S"),
    R("381", 299, 452, 325, 474, "E"), R("382", 299, 474, 325, 497, "E"),
    R("398A", 190, 537, 204, 552, "N")
  ];

  var FIXTURES3 = [
    F("lift", 339, 255, 412, 307, "Lifts"), F("wc", 467, 256, 520, 307, "Restrooms"), F("other", 447, 258, 456, 306),
    F("lift", 339, 323, 412, 373, "Lifts"), F("wc", 467, 323, 520, 373, "Restrooms"),
    F("stair", 537, 192, 575, 262, "Stairs"), F("stair", 280, 369, 322, 436, "Stairs"),
    F("lift", 612, 139, 636, 152, "Lift"), F("other", 735, 139, 760, 198, "Open to below"),
    F("stair", 760, 139, 798, 198, "Stairs"), F("other", 160, 388, 226, 410)
  ];
  [
    Z([[290, 130], [312, 120], [332, 140], [325, 170], [295, 168]], "312", true),
    Z([[232, 120], [262, 92], [300, 82], [300, 135], [240, 150]], "397", true),
    Z([[345, 205], [513, 205], [513, 248], [345, 248]], "Compass", true),
    Z([[345, 381], [513, 381], [513, 431], [345, 431]], "Printing Press", true),
    Z([[622, 96], [651, 96], [651, 128], [622, 128]], "3122c", true),
    Z([[830, 238], [860, 238], [846, 256], [830, 256]], "339", true),
    Z([[975, 82], [1006, 82], [1012, 95], [1003, 112], [975, 128]], "341", true),
    Z([[525, 465], [550, 440], [575, 465], [550, 490]], "364", true),
    Z([[578, 492], [632, 475], [622, 515], [600, 538], [578, 548]], "363", true),
    Z([[115, 370], [150, 370], [150, 408], [130, 405], [115, 392]], "389", true),
    Z([[36, 372], [62, 370], [62, 395], [44, 395]], "332", true)
  ].forEach(function (z) { FIXTURES3.unshift(z); });
  sealSlits(ROOMS3, FIXTURES3);

  var OUTLINE3 = [
    [300, 75], [1000, 75], [1012, 82], [1016, 95], [1008, 110], [842, 262], [648, 262], [648, 440],
    [640, 480], [620, 520], [595, 545], [570, 556], [195, 556], [28, 385], [40, 366], [216, 366],
    [216, 160], [230, 125], [255, 97], [278, 82]
  ];

  var CONF3 = {
    "Cell Phone": "Conference", "Automobile": "Conference", "Internet": "Conference", "Electricity": "Conference",
    "Light Bulb": "Large Conf", "Wheel": "Conference", "Telegraph": "Conference", "Steam Engine": "Conference", "373": "Small Conf", "386": "Small Conf",
    "321": "Small Conf", "325": "Small Conf", "324": "Small Conf", "330": "Small Conf", "329": "Small Conf",
    "331": "Small Conf", "334": "Small Conf", "335": "Small Conf", "350": "Small Conf", "349": "Small Conf",
    "336": "Small Conf", "337": "Small Conf", "342": "Small Conf", "343": "Small Conf", "303": "Small Conf",
    "301": "Small Conf", "355": "Small Conf", "356": "Small Conf", "358": "Small Conf", "357": "Small Conf",
    "376": "Small Conf", "377": "Small Conf", "372": "Small Conf", "368": "Small Conf", "391": "Small Conf",
    "392": "Small Conf", "393": "Small Conf", "387": "Small Conf", "385": "Small Conf", "383": "Small Conf",
    "381": "Small Conf", "382": "Small Conf"
  };
  var TYPES3 = {};
  ["315", "314", "313", "311", "310", "309", "302C", "302A", "304", "305", "306", "332A", "332B", "332C",
    "339A", "339B", "339C", "340", "338", "354", "353", "352", "360", "361", "362", "365", "366", "367",
    "380", "379", "378", "Phone Booth", "Phone Booth 2", "326", "327", "328", "344", "398A"
  ].forEach(function (id) { TYPES3[id] = "phone"; });
  ["Copy/Mail 3", "319E", "333", "346", "371F", "Kitchen/Break Area 5", "Kitchen/Break Area 6", "Kitchen/Break Area 7",
    "Kitchen/Break Area 8", "Reflection & Wellbeing 3", "399C", "Lactation Room 3", "Lactation Suite 3",
    "Lactation Room 4", "Treadmill Room 3"
  ].forEach(function (id) { TYPES3[id] = "service"; });
  var LABELS3 = {
    "Copy/Mail 3": "Copy / Mail", "Kitchen/Break Area 5": "Kitchen / Break Area", "Kitchen/Break Area 6": "Kitchen / Break Area",
    "Kitchen/Break Area 7": "Kitchen / Break Area", "Kitchen/Break Area 8": "Kitchen / Break Area",
    "Reflection & Wellbeing 3": "Reflection & Wellbeing", "Lactation Room 3": "Lactation Room",
    "Lactation Suite 3": "Lactation Suite", "Lactation Room 4": "Lactation Room", "Treadmill Room 3": "Treadmill Room",
    "Phone Booth 2": "Phone Booth", "312": "312 · Open Collaboration", "397": "397 · Open Collaboration",
    "3122c": "3122c · Open Collaboration", "339": "339 · Open Collaboration", "341": "341 · Free Address",
    "364": "364 · Open Collaboration", "363": "363 · Open Collaboration", "389": "389 · Open Collaboration",
    "332": "332 · Open Collaboration", "Compass": "Compass · Open Collaboration", "Printing Press": "Printing Press · Open Collaboration"
  };
  Object.keys(CONF3).forEach(function (id) { LABELS3[id] = id + " · " + CONF3[id]; });

  var floor3 = g.DeskFloor.buildFloor({
    level: 7, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 70 * S, w: (1022 - 20) * S, h: (562 - 70) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS3, rooms: ROOMS3, fixtures: FIXTURES3, openGaps: [], midBand: null, solidZones: true,
    meetings: Object.keys(CONF3), types: TYPES3, labels: LABELS3, leftRooms: null, wingSplit: 520 * S,
    regions: {
      left: { id: "left", label: "West side", x: 25 * S, y: 75 * S, w: 315 * S, h: 481 * S },
      core: { id: "core", label: "Centre", x: 340 * S, y: 75 * S, w: 245 * S, h: 481 * S },
      right: { id: "right", label: "East side", x: 585 * S, y: 75 * S, w: 435 * S, h: 400 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 4 · Building 6110 (internal level 8). Same shell, core and pod grid as Floor 3;
   * the two central lounges are open to below.
   * ------------------------------------------------------------------------- */
  var PODS4 = [
    // North band
    desks("4037", "left", [[301.5, 312.5], [312.5, 323.5]], R4N, [["4037", "4052"], ["4038", "4051"], ["4039", "4050"], ["4040", "4049"]]),
    npod(4053, 3, 336), npod(4059, 4, 366), npod(4067, 3, 395), npod(4073, 4, 425),
    npod(4081, 3, 454), npod(4087, 4, 484), npod(4095, 3, 513), npod(4101, 4, 543), npod(4109, 3, 572),
    npod(4115, 4, 601), npod(4131, 4, 661), npod(4139, 3, 690), npod(4145, 4, 719), npod(4153, 3, 749),
    npod(4159, 4, 779), npod(4167, 3, 808), npod(4173, 4, 838), npod(4181, 3, 867), npod(4187, 4, 896),
    npod(4195, 3, 925), npod(4201, 3, 954),
    // North-west curve
    desks("4035", "left", [[270, 280], [280, 290]], [[96, 105]], [["4036", "4035"]]),
    desks("4033", "left", [[258, 268], [268, 278]], [[106, 115]], [["4033", "4034"]]),
    desks("4031", "left", [[246, 256], [256, 266]], [[119, 128]], [["4032", "4031"]]),
    desks("4029", "left", [[236, 246], [246, 256]], [[131, 140]], [["4029", "4030"]]),
    // West column
    hpod("4021", W4C, [[158, 168], [168, 179]], ["4028", "4027", "4026", "4025"], ["4021", "4022", "4023", "4024"]),
    hpod("4015", W3C, [[187, 197], [197, 208]], ["4020", "4019", "4018"], ["4015", "4016", "4017"]),
    hpod("4007", W4C, [[217, 227], [227, 238]], ["4014", "4013", "4012", "4011"], ["4007", "4008", "4009", "4010"]),
    hpod("4001", W3C, [[246, 256], [256, 267]], ["4006", "4005", "4004"], ["4001", "4002", "4003"]),
    hpod("4503", W4C, [[305, 315], [315, 326]], ["4510", "4509", "4508", "4507"], ["4503", "4504", "4505", "4506"]),
    hpod("4497", W3C, [[333, 343], [343, 354]], ["4502", "4501", "4500"], ["4497", "4498", "4499"]),
    hpod("4491", [[230, 243], [243, 256], [256, 269]], [[368, 378], [378, 389]], ["4496", "4495", "4494"], ["4491", "4492", "4493"]),
    hpod("4485", [[230, 243], [243, 256], [256, 269]], [[396, 406], [406, 417]], ["4490", "4489", "4488"], ["4485", "4486", "4487"]),
    // South band
    desks("4429", "left", [[206, 217], [217, 228]], R3S, [["4432", "4431"], ["4433", "4430"], ["4434", "4429"]]),
    spod(4425, 4, 236, 260), spod(4418, 3, 266, 288), spod(4411, 4, 297, 321), spod(4404, 3, 329, 353),
    spod(4397, 4, 361, 385), spod(4390, 3, 392, 414), spod(4383, 4, 422, 446), spod(4376, 3, 452, 476),
    spod(4369, 4, 482, 506), spod(4362, 3, 512, 536),
    desks("4343", "right", [[542, 554], [554, 566]], R4S, [["4355", "4346"], ["4356", "4345"], ["4357", "4344"], ["4358", "4343"]]),
    // East band (FIN Core)
    desks("4281", "right", [[596, 606], [606, 616]], E4, [["4285", "4284"], ["4286", "4283"], ["4287", "4282"], ["4288", "4281"]]),
    desks("4275", "right", [[625, 637], [637, 649]], E3, [["4278", "4277"], ["4279", "4276"], ["4280", "4275"]]),
    spod(4272, 3, 652, 675, E3), spod(4266, 3, 681, 704, E3), spod(4259, 4, 712, 734, E4),
    spod(4252, 3, 742, 765, E3), spod(4245, 4, 772, 795, E4), spod(4238, 3, 803, 825, E3),
    // East column
    hpod("4289", X3C, [[277, 286], [286, 295]], ["4291", "4290", "4289"], ["4292", "4293", "4294"]),
    hpod("4301", X3C, [[336, 345], [345, 355]], ["4303", "4302", "4301"], ["4304", "4305", "4306"]),
    hpod("4307", X3C, [[364, 374], [374, 384]], ["4309", "4308", "4307"], ["4310", "4311", "4312"]),
    hpod("4313", [[590, 602], [602, 614], [614, 626], [626, 638]], [[394, 404], [404, 414]], ["4316", "4315", "4314", "4313"], ["4317", "4318", "4319", null]),
    hpod("4321", X3C, [[424, 433], [433, 443]], ["4323", "4322", "4321"], ["4324", "4325", "4326"]),
    hpod("4327", [[587, 598], [598, 609], [609, 620], [620, 632]], [[452, 462], [462, 472]], ["4330", "4329", "4328", "4327"], ["4331", "4332", "4333", "4334"]),
    // North-east diagonal
    cluster("4209", "right", 890, 155, [["4215", "4211", "4209"], ["4216", null, "4212"], ["4214", null, "4213"], ["4217", "4218", null]]),
    cluster("4219", "right", 866, 185, [["4221", null], ["4222", "4220"], ["4223", "4219"], ["4224", null]]),
    cluster("4225", "right", 850, 222, [["4227", null], ["4228", "4226"], ["4229", "4225"], ["4230", null]]),
    // South-west diagonal
    desks("4474", "left", [[50, 62]], [[396, 406]], [["4474"]]),
    cluster("4463", "left", 86, 414, [["4469", "4471", "4470"], ["4468", null, "4465"], ["4463", null, "4466"], ["4467", "4464", null]]),
    cluster("4457", "left", 124, 452, [["4462", "4459"], ["4461", "4458"], ["4457", "4460"]]),
    cluster("4445", "left", 152, 480, [["4454", "4453", "4447"], ["4451", null, "4446"], ["4450", null, "4452"], ["4445", "4448", "4449"]]),
    cluster("4439", "left", 188, 512, [["4444", "4441"], ["4443", "4440"], ["4439", "4442"]])
  ];

  var ROOMS4 = [
    // North-west rooms
    R("415", 341, 137, 357, 153, "W"), R("414", 341, 153, 357, 170, "W"), R("413", 341, 170, 357, 186, "W"),
    R("416", 357, 137, 376, 181, "E:0.5"),
    R("Copy/Mail 4", 386, 137, 400, 163, "W:0.4"),
    R("420", 400, 137, 417, 163, "N"), R("421", 417, 137, 434, 163, "N"), R("Courtesy", 434, 137, 466, 163, "N:0.1"),
    R("Kitchen/Break Area 9", 390, 166, 458, 190, "S"),
    R("425", 481, 140, 501, 158, "W:0.15"), R("424", 481, 160, 501, 186, "W:0.15"),
    R("426", 503, 140, 520, 156, "E"), R("427", 503, 156, 520, 173, "E"), R("428", 503, 173, 520, 190, "E"),
    // North-centre rooms
    R("Ethics", 533, 141, 564, 187, "W:0.88"), R("430", 564, 141, 578, 187, "E"),
    R("431A", 592, 139, 604, 154, "W"), R("431B", 592, 154, 604, 170, "W"), R("431C", 592, 170, 604, 186, "W"),
    R("432", 604, 139, 612, 152, "N"),
    R("Honor", 604, 154, 636, 198, "W:0.88"),
    R("433", 636, 139, 660, 164, "N"), R("434", 660, 139, 676, 164, "N"), R("435", 676, 139, 695, 164, "N"),
    R("Fairness", 636, 164, 676, 198, "S:0.1"), R("436", 676, 164, 695, 198, "S"),
    R("4122a", 622, 82, 636, 90, "S"), R("4122b", 638, 82, 648, 90, "S"),
    R("440", 718, 139, 733, 150, "W"),
    R("439A", 718, 150, 733, 163, "W"), R("439B", 718, 163, 733, 176, "W"), R("439C", 718, 176, 733, 189, "W"),
    R("438", 718, 189, 733, 198, "W"),
    // North-east kitchen
    R("442", 818, 138, 838, 160, "N:0.15"), R("443", 838, 138, 856, 160, "N:0.15"), R("444", 856, 138, 868, 150, "N:0.2"),
    R("Kitchen/Break Area 10", 800, 162, 840, 196, "E"),
    R("446", 800, 196, 812, 206, "E"),
    // North-west curve
    R("Phone Booth 3", 284, 82, 296, 92, "S"), R("4028a", 224, 143, 234, 153, "E"),
    // West column rooms
    R("411", 280, 197, 296, 215, "N"), R("410", 296, 197, 312, 215, "N"), R("409", 312, 197, 328, 215, "N"),
    R("Dedication", 280, 215, 328, 272, "E:0.08|E:0.92"),
    R("4003 A", 218, 275, 243, 296, "N"), R("4004 A", 243, 275, 268, 296, "N"),
    R("402C", 280, 284, 296, 296, "N"), R("402B", 296, 284, 312, 296, "N"), R("402A", 312, 284, 328, 296, "N"),
    R("403", 280, 296, 304, 313, "W"), R("401", 304, 296, 328, 313, "E"),
    R("Candor", 280, 313, 328, 343, "E"),
    R("404", 280, 343, 296, 360, "S"), R("405", 296, 343, 312, 360, "S"), R("406", 312, 343, 328, 360, "S"),
    // Core
    R("Reflection & Wellbeing 4", 412, 253, 444, 278, "W:0.6"),
    R("499C", 424, 279, 444, 306, "W:0.2"),
    R("Lactation Room 5", 425, 325, 444, 341, "S:0.75>Lactation Suite 4"),
    R("Lactation Suite 4", 425, 341, 444, 357, "W"),
    R("Lactation Room 6", 425, 357, 444, 374, "N:0.75>Lactation Suite 4"),
    R("499G", 412, 358, 425, 374, "N"),
    R("499I", 342, 347, 371, 374, "E:0.2"),
    R("453", 532, 272, 547, 288, "N:0.2"), R("452", 547, 272, 562, 288, "N:0.2"), R("451", 562, 272, 578, 288, "N:0.2"),
    R("454", 532, 288, 555, 308, "S"), R("455", 555, 288, 578, 308, "S:0.9"),
    R("457", 532, 325, 578, 346, "W:0.8"),
    R("Loyalty", 532, 346, 578, 415, "W:0.08|W:0.95"),
    R("459", 532, 415, 547, 435, "S"), R("460", 547, 415, 562, 435, "S"), R("461", 562, 415, 578, 435, "S"),
    R("4303 A", 598, 307, 619, 325, "W"), R("4304 A", 619, 307, 640, 325, "E"),
    // South rooms
    R("479", 340, 443, 361, 462, "W"), R("478", 340, 462, 361, 478, "W"), R("477", 340, 478, 361, 492, "W"),
    R("475", 361, 443, 378, 466, "E:0.85"), R("476", 361, 467, 378, 492, "E:0.9"),
    R("Kitchen/Break Area 11", 395, 443, 472, 463, "N"),
    R("Morals", 389, 464, 424, 492, "S:0.85"),
    R("472", 424, 464, 444, 492, "S:0.15"), R("Copy/Mail 5", 444, 464, 472, 492, "S:0.15"),
    R("464", 503, 443, 519, 458, "E"), R("465", 503, 458, 519, 478, "E"), R("466", 503, 478, 519, 492, "E"),
    // South-west rooms
    R("Bike Room", 160, 368, 222, 388, "W"),
    R("Kitchen/Break Area 12", 158, 410, 226, 424, "W"),
    R("489", 165, 433, 185, 456, "N"), R("490", 185, 433, 204, 456, "N"), R("491", 204, 433, 223, 456, "N"),
    R("Trust", 223, 433, 264, 456, "E:0.1"),
    R("485", 180, 458, 199, 470, "S:0.8"), R("483", 201, 458, 219, 470, "S"),
    R("Transparency", 219, 458, 264, 490, "S:0.1"),
    R("481", 274, 449, 290, 497, "S:0.15"), R("Sincerity", 290, 449, 325, 497, "E:0.1"),
    R("4433 A", 190, 537, 204, 552, "N")
  ];

  var FIXTURES4 = [
    F("lift", 339, 251, 395, 307, "Lifts"), F("wall", 395, 280, 412, 307), F("wc", 445, 251, 520, 307, "Restrooms"),
    F("lift", 339, 325, 405, 346, "Lifts"), F("wall", 405, 325, 412, 349), F("wall", 405, 356, 410, 374), F("wall", 339, 346, 342, 374),
    F("wc", 445, 325, 520, 374, "Restrooms"), F("wall", 339, 374, 520, 381),
    F("stair", 537, 192, 575, 262, "Stairs"), F("stair", 280, 369, 322, 436, "Stairs"),
    F("lift", 612, 139, 636, 152, "Lift"), F("other", 735, 139, 760, 198, "Open to below"),
    F("stair", 760, 139, 798, 198, "Stairs"), F("other", 160, 388, 226, 410),
    F("other", 345, 204, 519, 252, "Open to below"), F("other", 345, 382, 518, 436, "Open to below"),
    F("room", 482, 449, 502, 492)
  ];
  [
    Z([[290, 130], [312, 120], [332, 140], [325, 170], [295, 168]], "412", true),
    Z([[622, 96], [651, 96], [651, 128], [622, 128]], "4122c", true),
    Z([[830, 238], [860, 238], [846, 256], [830, 256]], "4230 A", true),
    Z([[975, 82], [1006, 82], [1012, 95], [1003, 112], [975, 128]], "444a", true),
    Z([[525, 465], [550, 440], [575, 465], [550, 490]], "463", true),
    Z([[578, 492], [632, 475], [622, 515], [600, 538], [578, 548]], "462", true),
    Z([[115, 370], [150, 370], [150, 408], [130, 405], [115, 392]], "487", true)
  ].forEach(function (z) { FIXTURES4.unshift(z); });
  sealSlits(ROOMS4, FIXTURES4);

  var CONF4 = {
    "Dedication": "Conference", "Candor": "Conference", "Courtesy": "Conference", "Ethics": "Conference",
    "Honor": "Conference", "Fairness": "Conference", "Loyalty": "Large Conf", "Trust": "Conference",
    "Transparency": "Conference", "Sincerity": "Conference", "Morals": "Conference",
    "416": "Small Conf", "420": "Small Conf", "421": "Small Conf", "425": "Small Conf", "424": "Small Conf",
    "430": "Small Conf", "433": "Small Conf", "434": "Small Conf", "435": "Small Conf", "436": "Small Conf",
    "442": "Small Conf", "443": "Small Conf", "403": "Small Conf", "401": "Small Conf", "454": "Small Conf",
    "455": "Small Conf", "457": "Small Conf", "475": "Small Conf", "476": "Small Conf", "472": "Small Conf",
    "489": "Small Conf", "490": "Small Conf", "491": "Small Conf", "485": "Small Conf", "483": "Small Conf",
    "4003 A": "Small Conf", "481": "Small Conf", "4004 A": "Small Conf", "4303 A": "Small Conf", "4304 A": "Small Conf"
  };
  var TYPES4 = {};
  ["415", "414", "413", "411", "410", "409", "402C", "402B", "402A", "404", "405", "406", "431A", "431B", "431C",
    "440", "439A", "439B", "439C", "438", "453", "452", "451", "459", "460", "461", "479", "478", "477",
    "464", "465", "466", "426", "427", "428", "444", "Phone Booth 3", "4122a", "4122b", "4028a", "4433 A"
  ].forEach(function (id) { TYPES4[id] = "phone"; });
  ["Copy/Mail 4", "Copy/Mail 5", "Kitchen/Break Area 9", "Kitchen/Break Area 10", "Kitchen/Break Area 11",
    "Kitchen/Break Area 12", "Reflection & Wellbeing 4", "499C", "499I", "Lactation Room 5", "Lactation Suite 4",
    "Lactation Room 6", "499G", "Bike Room", "432", "446"
  ].forEach(function (id) { TYPES4[id] = "service"; });
  var LABELS4 = {
    "Copy/Mail 4": "Copy / Mail", "Copy/Mail 5": "Copy / Mail", "Kitchen/Break Area 9": "Kitchen / Break Area",
    "Kitchen/Break Area 10": "Kitchen / Break Area", "Kitchen/Break Area 11": "Kitchen / Break Area",
    "Kitchen/Break Area 12": "Kitchen / Break Area", "Reflection & Wellbeing 4": "Reflection & Wellbeing",
    "Lactation Room 5": "Lactation Room", "Lactation Suite 4": "Lactation Suite", "Lactation Room 6": "Lactation Room",
    "Phone Booth 3": "Phone Booth", "412": "412 · Open Collaboration", "4122c": "4122c · Open Collaboration",
    "4230 A": "4230 A · Open Collaboration", "444a": "444a · Free Address", "463": "463 · Open Collaboration",
    "462": "462 · Open Collaboration", "487": "487 · Open Collaboration"
  };
  Object.keys(CONF4).forEach(function (id) { LABELS4[id] = id + " · " + CONF4[id]; });

  var floor4 = g.DeskFloor.buildFloor({
    level: 8, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 70 * S, w: (1022 - 20) * S, h: (562 - 70) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS4, rooms: ROOMS4, fixtures: FIXTURES4, openGaps: [], midBand: null, solidZones: true,
    meetings: Object.keys(CONF4), types: TYPES4, labels: LABELS4, leftRooms: null, wingSplit: 520 * S,
    regions: {
      left: { id: "left", label: "West side", x: 25 * S, y: 75 * S, w: 315 * S, h: 481 * S },
      core: { id: "core", label: "Centre", x: 340 * S, y: 75 * S, w: 245 * S, h: 481 * S },
      right: { id: "right", label: "East side", x: 585 * S, y: 75 * S, w: 435 * S, h: 400 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 6 · Building 6110 (internal level 10). Floor 4 layout (voids, walled core) with
   * Floor 5's north-west lounge and east desk column.
   * ------------------------------------------------------------------------- */
  var PODS6 = [
    // North band
    desks("6037", "left", [[301.5, 312.5], [312.5, 323.5]], R4N, [["6037", "6052"], ["6038", "6051"], ["6039", "6050"], ["6040", "6049"]]),
    npod(6053, 3, 336), npod(6059, 4, 366), npod(6067, 3, 395), npod(6073, 4, 425),
    npod(6081, 3, 454), npod(6087, 4, 484), npod(6095, 3, 513), npod(6101, 4, 543), npod(6109, 3, 572),
    npod(6115, 4, 601), npod(6131, 4, 661), npod(6139, 3, 690), npod(6145, 4, 719), npod(6153, 3, 749),
    npod(6159, 4, 779), npod(6167, 3, 808), npod(6173, 4, 838), npod(6181, 3, 867), npod(6187, 4, 896),
    npod(6195, 3, 925), npod(6201, 3, 954),
    // West column
    hpod("6021", W4C, [[158, 168], [168, 179]], ["6028", "6027", "6026", "6025"], ["6021", "6022", "6023", "6024"]),
    hpod("6015", W3C, [[187, 197], [197, 208]], ["6020", "6019", "6018"], ["6015", "6016", "6017"]),
    hpod("6007", W4C, [[217, 227], [227, 238]], ["6014", "6013", "6012", "6011"], ["6007", "6008", "6009", "6010"]),
    hpod("6001", W3C, [[246, 256], [256, 267]], ["6006", "6005", "6004"], ["6001", "6002", "6003"]),
    hpod("6503", W4C, [[305, 315], [315, 326]], ["6510", "6509", "6508", "6507"], ["6503", "6504", "6505", "6506"]),
    hpod("6497", W3C, [[333, 343], [343, 354]], ["6502", "6501", "6500"], ["6497", "6498", "6499"]),
    hpod("6491", [[230, 243], [243, 256], [256, 269]], [[368, 378], [378, 389]], ["6496", "6495", "6494"], ["6491", "6492", "6493"]),
    hpod("6485", [[230, 243], [243, 256], [256, 269]], [[396, 406], [406, 417]], ["6490", "6489", "6488"], ["6485", "6486", "6487"]),
    // South band
    desks("6429", "left", [[206, 217], [217, 228]], R3S, [["6432", "6431"], ["6433", "6430"], ["6434", "6429"]]),
    spod(6425, 4, 236, 260), spod(6418, 3, 266, 288), spod(6411, 4, 297, 321), spod(6404, 3, 329, 353),
    spod(6397, 4, 361, 385), spod(6390, 3, 392, 414), spod(6383, 4, 422, 446), spod(6376, 3, 452, 476),
    spod(6369, 4, 482, 506), spod(6362, 3, 512, 536),
    desks("6343", "right", [[542, 554], [554, 566]], R4S, [["6355", "6346"], ["6356", "6345"], ["6357", "6344"], ["6358", "6343"]]),
    // East band (FIN Core)
    desks("6281", "right", [[596, 606], [606, 616]], E4, [["6285", "6284"], ["6286", "6283"], ["6287", "6282"], ["6288", "6281"]]),
    desks("6275", "right", [[625, 637], [637, 649]], E3, [["6278", "6277"], ["6279", "6276"], ["6280", "6275"]]),
    spod(6272, 3, 652, 675, E3), spod(6266, 3, 681, 704, E3), spod(6259, 4, 712, 734, E4),
    spod(6252, 3, 742, 765, E3), spod(6245, 4, 772, 795, E4), spod(6238, 3, 803, 825, E3),
    // East column
    hpod("6289", X3C, [[277, 286], [286, 295]], ["6291", "6290", "6289"], ["6292", "6293", "6294"]),
    hpod("6295", [[601, 614], [614, 627], [627, 640]], [[307, 316], [316, 325]], ["6297", "6296", "6295"], ["6298", "6299", "6300"]),
    hpod("6301", X3C, [[336, 345], [345, 355]], ["6303", "6302", "6301"], ["6304", "6305", "6306"]),
    hpod("6307", X3C, [[364, 374], [374, 384]], ["6309", "6308", "6307"], ["6310", "6311", "6312"]),
    hpod("6313", [[590, 602], [602, 614], [614, 626], [626, 638]], [[394, 404], [404, 414]], ["6316", "6315", "6314", "6313"], ["6317", "6318", "6319", null]),
    hpod("6321", X3C, [[424, 433], [433, 443]], ["6323", "6322", "6321"], ["6324", "6325", "6326"]),
    hpod("6327", [[587, 598], [598, 609], [609, 620], [620, 632]], [[452, 462], [462, 472]], ["6330", "6329", "6328", "6327"], ["6331", "6332", "6333", "6334"]),
    // North-east diagonal
    cluster("6209", "right", 890, 155, [["6215", "6211", "6209"], ["6216", null, "6212"], ["6214", null, "6213"], ["6217", "6218", null]]),
    cluster("6219", "right", 866, 185, [["6221", null], ["6222", "6220"], ["6223", "6219"], ["6224", null]]),
    cluster("6225", "right", 850, 222, [["6227", null], ["6228", "6226"], ["6229", "6225"], ["6230", null]]),
    // South-west diagonal
    cluster("6463", "left", 86, 414, [["6469", "6471", "6470"], ["6468", null, "6465"], ["6463", null, "6466"], ["6467", "6464", null]]),
    cluster("6457", "left", 124, 452, [["6462", "6459"], ["6461", "6458"], ["6457", "6460"]]),
    cluster("6445", "left", 152, 480, [["6454", "6453", "6447"], ["6451", null, "6446"], ["6450", null, "6452"], ["6445", "6448", "6449"]]),
    cluster("6439", "left", 188, 512, [["6444", "6441"], ["6443", "6440"], ["6439", "6442"]])
  ];

  var ROOMS6 = [
    // North-west rooms
    R("615", 341, 137, 357, 153, "W"), R("614", 341, 153, 357, 170, "W"), R("613", 341, 170, 357, 186, "W"),
    R("616", 357, 137, 376, 181, "E:0.5"),
    R("Copy/Mail 8", 386, 137, 405, 163, "W:0.4"),
    R("621", 405, 137, 434, 163, "N:0.9"), R("Dollar", 434, 137, 466, 163, "N:0.1"),
    R("Kitchen/Break Area 17", 390, 166, 458, 190, "S"),
    R("625", 481, 140, 501, 158, "W:0.15"), R("624", 481, 160, 501, 186, "W:0.15"),
    R("626", 503, 140, 520, 156, "E"), R("627", 503, 156, 520, 173, "E"), R("628", 503, 173, 520, 190, "E"),
    // North-centre rooms
    R("Euro", 533, 141, 564, 187, "W:0.88"), R("630", 564, 141, 578, 187, "E"),
    R("631A", 592, 139, 604, 154, "W"), R("631B", 592, 154, 604, 170, "W"), R("631C", 592, 170, 604, 186, "W"),
    R("632", 604, 139, 612, 152, "N"),
    R("Krone", 604, 154, 636, 198, "W:0.88"),
    R("633", 636, 139, 660, 164, "N"), R("634", 660, 139, 676, 164, "N"), R("635", 676, 139, 695, 164, "N"),
    R("Franc", 636, 164, 676, 198, "S:0.1"), R("636", 676, 164, 695, 198, "S"),
    R("Phone Booth 6", 628, 82, 646, 90, "S"),
    R("640", 718, 139, 733, 150, "W"),
    R("639A", 718, 150, 733, 163, "W"), R("639B", 718, 163, 733, 176, "W"), R("639C", 718, 176, 733, 189, "W"),
    R("638", 718, 189, 733, 198, "W"),
    // North-east kitchen
    R("642", 818, 138, 838, 160, "N:0.15"), R("643", 838, 138, 856, 160, "N:0.15"), R("644", 856, 138, 868, 150, "N:0.2"),
    R("Kitchen/Break Area 18", 800, 162, 840, 196, "E"),
    R("646", 800, 196, 812, 206, "E"),
    // North-west curve
    R("6025b", 284, 82, 296, 90, "S"),
    // West column rooms
    R("611", 280, 197, 296, 215, "N"), R("610", 296, 197, 312, 215, "N"), R("609", 312, 197, 328, 215, "N"),
    R("608", 280, 215, 328, 272, "E:0.08|E:0.92"),
    R("6003 A", 218, 275, 243, 296, "N"), R("6507 A", 243, 275, 268, 296, "N"),
    R("602C", 280, 284, 296, 296, "N"), R("602B", 296, 284, 312, 296, "N"), R("602A", 312, 284, 328, 296, "N"),
    R("603", 280, 296, 304, 313, "W"), R("601", 304, 296, 328, 313, "E"),
    R("Baht", 280, 313, 328, 343, "E"),
    R("604", 280, 343, 296, 360, "S"), R("605", 296, 343, 312, 360, "S"), R("606", 312, 343, 328, 360, "S"),
    // Core
    R("699B", 412, 253, 444, 278, "W:0.6"),
    R("699C", 424, 279, 444, 306, "W:0.2"),
    R("Lactation Room 7", 425, 325, 444, 341, "S:0.75>Lactation Suite 5"),
    R("Lactation Suite 5", 425, 341, 444, 357, "W"),
    R("Lactation Room 8", 425, 357, 444, 374, "N:0.75>Lactation Suite 5"),
    R("699G", 412, 358, 425, 374, "N"),
    R("653", 532, 272, 547, 288, "N:0.2"), R("652", 547, 272, 562, 288, "N:0.2"), R("651", 562, 272, 578, 288, "N:0.2"),
    R("654", 532, 288, 555, 308, "S"), R("655", 555, 288, 578, 308, "S:0.9"),
    R("657", 532, 325, 578, 346, "W:0.8"),
    R("Lira", 532, 346, 578, 415, "W:0.08|W:0.95"),
    R("659", 532, 415, 547, 435, "S"), R("660", 547, 415, 562, 435, "S"), R("661", 562, 415, 578, 435, "S"),
    
    // South rooms
    R("679", 340, 443, 361, 462, "W"), R("678", 340, 462, 361, 478, "W"), R("677", 340, 478, 361, 492, "W"),
    R("675", 361, 443, 378, 466, "E:0.85"), R("676", 361, 467, 378, 492, "E:0.9"),
    R("Kitchen/Break Area 19", 395, 443, 472, 463, "N"),
    R("Manat", 389, 464, 424, 492, "S:0.85"),
    R("672", 424, 464, 444, 492, "S:0.15"), R("Copy/Mail 9", 444, 464, 472, 492, "S:0.15"),
    R("667", 482, 449, 502, 492, "W:0.1"), R("664", 503, 443, 519, 458, "E"), R("665", 503, 458, 519, 478, "E"), R("666", 503, 478, 519, 492, "E"),
    // South-west rooms
    R("Treadmill 6", 160, 368, 222, 388, "W"),
    R("Kitchen/Break Area 20", 158, 410, 226, 424, "W"),
    R("689", 165, 433, 185, 456, "N"), R("690", 185, 433, 204, 456, "N"), R("691", 204, 433, 223, 456, "N"),
    R("Yen", 223, 433, 264, 456, "E:0.1"),
    R("685", 180, 458, 199, 470, "S:0.8"), R("683", 201, 458, 219, 470, "S"),
    R("Ringgit", 219, 458, 264, 490, "S:0.1"),
    R("681", 274, 449, 290, 497, "S:0.15"), R("Rand", 290, 449, 325, 497, "E:0.1"),
    R("6434 A", 190, 537, 204, 552, "N")
  ];

  var FIXTURES6 = [
    F("lift", 339, 251, 395, 307, "Lifts"), F("wall", 395, 280, 412, 307), F("wc", 445, 251, 520, 307, "Restrooms"),
    F("lift", 339, 325, 405, 346, "Lifts"), F("wall", 405, 325, 412, 349), F("wall", 405, 356, 410, 374), F("wall", 339, 346, 342, 374),
    F("wc", 445, 325, 520, 374, "Restrooms"), F("wall", 339, 374, 520, 381),
    F("stair", 537, 192, 575, 262, "Stairs"), F("stair", 280, 369, 322, 436, "Stairs"),
    F("lift", 612, 139, 636, 152, "Lift"), F("other", 735, 139, 760, 198, "Open to below"),
    F("stair", 760, 139, 798, 198, "Stairs"), F("other", 160, 388, 226, 410),
    F("other", 345, 204, 519, 252, "Open to below"), F("other", 345, 382, 518, 436, "Open to below")
  ];
  [
    Z([[290, 130], [312, 120], [332, 140], [325, 170], [295, 168]], "612", true),
    Z([[622, 96], [651, 96], [651, 128], [622, 128]], "6122c", true),
    Z([[234, 122], [258, 100], [298, 98], [298, 135], [240, 150]], "6025A", true),
    Z([[36, 372], [62, 370], [62, 395], [44, 395]], "6474 A", true),
    Z([[830, 238], [860, 238], [846, 256], [830, 256]], "6235 A", true),
    Z([[975, 82], [1006, 82], [1012, 95], [1003, 112], [975, 128]], "6206 A", true),
    Z([[525, 465], [550, 440], [575, 465], [550, 490]], "663", true),
    Z([[578, 492], [632, 475], [622, 515], [600, 538], [578, 548]], "6344 A", true),
    Z([[115, 370], [150, 370], [150, 408], [130, 405], [115, 392]], "687", true)
  ].forEach(function (z) { FIXTURES6.unshift(z); });
  sealSlits(ROOMS6, FIXTURES6);

  var CONF6 = {
    "608": "Conference", "Baht": "Conference", "Dollar": "Conference", "Euro": "Conference",
    "Krone": "Conference", "Franc": "Conference", "Lira": "Large Conf", "Yen": "Conference",
    "Ringgit": "Conference", "Rand": "Conference", "Manat": "Conference",
    "616": "Small Conf", "621": "Small Conf", "625": "Small Conf", "624": "Small Conf",
    "630": "Small Conf", "633": "Small Conf", "634": "Small Conf", "635": "Small Conf", "636": "Small Conf",
    "642": "Small Conf", "643": "Small Conf", "603": "Small Conf", "601": "Small Conf", "654": "Small Conf",
    "655": "Small Conf", "657": "Small Conf", "675": "Small Conf", "676": "Small Conf", "672": "Small Conf",
    "689": "Small Conf", "690": "Small Conf", "691": "Small Conf", "685": "Small Conf", "683": "Small Conf",
    "6003 A": "Small Conf", "681": "Small Conf", "6507 A": "Small Conf", "667": "Small Conf"
  };
  var TYPES6 = {};
  ["615", "614", "613", "611", "610", "609", "602C", "602B", "602A", "604", "605", "606", "631A", "631B", "631C",
    "640", "639A", "639B", "639C", "638", "653", "652", "651", "659", "660", "661", "679", "678", "677",
    "664", "665", "666", "626", "627", "628", "644", "Phone Booth 6", "6025b", "6434 A"
  ].forEach(function (id) { TYPES6[id] = "phone"; });
  ["Copy/Mail 8", "Copy/Mail 9", "Kitchen/Break Area 17", "Kitchen/Break Area 18", "Kitchen/Break Area 19",
    "Kitchen/Break Area 20", "699B", "699C", "Lactation Room 7", "Lactation Suite 5",
    "Lactation Room 8", "699G", "Treadmill 6", "632", "646"
  ].forEach(function (id) { TYPES6[id] = "service"; });
  var LABELS6 = {
    "Copy/Mail 8": "Copy / Mail", "Copy/Mail 9": "Copy / Mail", "Kitchen/Break Area 17": "Kitchen / Break Area",
    "Kitchen/Break Area 18": "Kitchen / Break Area", "Kitchen/Break Area 19": "Kitchen / Break Area",
    "Kitchen/Break Area 20": "Kitchen / Break Area", 
    "Lactation Room 7": "Lactation Room", "Lactation Suite 5": "Lactation Suite", "Lactation Room 8": "Lactation Room",
    "Phone Booth 6": "Phone Booth", "612": "612 · Open Collaboration", "6122c": "6122c · Open Collaboration", "6025A": "6025A · Open Collaboration", "6474 A": "6474 A · Open Collaboration",
    "6235 A": "6235 A · Open Collaboration", "6206 A": "6206 A · Free Address", "663": "663 · Open Collaboration",
    "6344 A": "6344 A · Open Collaboration", "687": "687 · Open Collaboration"
  };
  Object.keys(CONF6).forEach(function (id) { LABELS6[id] = id + " · " + CONF6[id]; });

  var floor6 = g.DeskFloor.buildFloor({
    level: 10, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 70 * S, w: (1022 - 20) * S, h: (562 - 70) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS6, rooms: ROOMS6, fixtures: FIXTURES6, openGaps: [], midBand: null, solidZones: true,
    meetings: Object.keys(CONF6), types: TYPES6, labels: LABELS6, leftRooms: null, wingSplit: 520 * S,
    regions: {
      left: { id: "left", label: "West side", x: 25 * S, y: 75 * S, w: 315 * S, h: 481 * S },
      core: { id: "core", label: "Centre", x: 340 * S, y: 75 * S, w: 245 * S, h: 481 * S },
      right: { id: "right", label: "East side", x: 585 * S, y: 75 * S, w: 435 * S, h: 400 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 5 · Building 6110 (internal level 9). Floor 3 pod grid (+2000) and room
   * layout with Floor 4's walled core.
   * ------------------------------------------------------------------------- */
  var PODS5 = [
    // North band
    desks("5037", "left", [[301.5, 312.5], [312.5, 323.5]], R4N, [["5037", "5052"], ["5038", "5051"], ["5039", "5050"], ["5040", "5049"]]),
    npod(5053, 3, 336), npod(5059, 4, 366), npod(5067, 3, 395), npod(5073, 4, 425),
    npod(5081, 3, 454), npod(5087, 4, 484), npod(5095, 3, 513), npod(5101, 4, 543), npod(5109, 3, 572),
    npod(5115, 4, 601), npod(5131, 4, 661), npod(5139, 3, 690), npod(5145, 4, 719), npod(5153, 3, 749),
    npod(5159, 4, 779), npod(5167, 3, 808), npod(5173, 4, 838), npod(5181, 3, 867), npod(5187, 4, 896),
    npod(5195, 3, 925), npod(5201, 3, 954),
    // West column
    hpod("5021", W4C, [[158, 168], [168, 179]], ["5028", "5027", "5026", "5025"], ["5021", "5022", "5023", "5024"]),
    hpod("5015", W3C, [[187, 197], [197, 208]], ["5020", "5019", "5018"], ["5015", "5016", "5017"]),
    hpod("5007", W4C, [[217, 227], [227, 238]], ["5014", "5013", "5012", "5011"], ["5007", "5008", "5009", "5010"]),
    hpod("5001", W3C, [[246, 256], [256, 267]], ["5006", "5005", "5004"], ["5001", "5002", "5003"]),
    hpod("5511", W3C, [[275, 285], [285, 296]], ["5516", "5515", "5514"], ["5511", "5512", "5513"]),
    hpod("5503", W4C, [[305, 315], [315, 326]], ["5510", "5509", "5508", "5507"], ["5503", "5504", "5505", "5506"]),
    hpod("5497", W3C, [[333, 343], [343, 354]], ["5502", "5501", "5500"], ["5497", "5498", "5499"]),
    hpod("5491", [[230, 243], [243, 256], [256, 269]], [[368, 378], [378, 389]], ["5496", "5495", "5494"], ["5491", "5492", "5493"]),
    hpod("5485", [[230, 243], [243, 256], [256, 269]], [[396, 406], [406, 417]], ["5490", "5489", "5488"], ["5485", "5486", "5487"]),
    // South band
    desks("5429", "left", [[206, 217], [217, 228]], R3S, [["5432", "5431"], ["5433", "5430"], ["5434", "5429"]]),
    spod(5425, 4, 236, 260), spod(5418, 3, 266, 288), spod(5411, 4, 297, 321), spod(5404, 3, 329, 353),
    spod(5397, 4, 361, 385), spod(5390, 3, 392, 414), spod(5383, 4, 422, 446), spod(5376, 3, 452, 476),
    spod(5369, 4, 482, 506), spod(5362, 3, 512, 536),
    desks("5343", "right", [[542, 554], [554, 566]], R4S, [["5355", "5346"], ["5356", "5345"], ["5357", "5344"], ["5358", "5343"]]),
    // East band
    desks("5281", "right", [[596, 606], [606, 616]], E4, [["5284", "5285"], ["5283", "5286"], ["5282", "5287"], ["5281", "5288"]]),
    desks("5275", "right", [[625, 637], [637, 649]], E3, [["5277", "5278"], ["5276", "5279"], ["5275", "5280"]]),
    spod(5272, 3, 652, 675, E3), spod(5266, 3, 681, 704, E3), spod(5259, 4, 712, 734, E4),
    spod(5252, 3, 742, 765, E3), spod(5245, 4, 772, 795, E4), spod(5238, 3, 803, 825, E3),
    // East column
    hpod("5289", X3C, [[277, 286], [286, 295]], ["5291", "5290", "5289"], ["5292", "5293", "5294"]),
    hpod("5295", [[601, 614], [614, 627], [627, 640]], [[307, 316], [316, 325]], ["5297", "5296", "5295"], ["5298", "5299", "5300"]),
    hpod("5301", X3C, [[336, 345], [345, 355]], ["5303", "5302", "5301"], ["5304", "5305", "5306"]),
    hpod("5307", X3C, [[364, 374], [374, 384]], ["5309", "5308", "5307"], ["5310", "5311", "5312"]),
    hpod("5313", [[590, 602], [602, 614], [614, 626], [626, 638]], [[394, 404], [404, 414]], ["5316", "5315", "5314", "5313"], ["5317", "5318", "5319", "5320"]),
    hpod("5321", X3C, [[424, 433], [433, 443]], ["5323", "5322", "5321"], ["5324", "5325", "5326"]),
    hpod("5327", [[587, 598], [598, 609], [609, 620], [620, 632]], [[452, 462], [462, 472]], ["5330", "5329", "5328", "5327"], ["5331", "5332", "5333", "5334"]),
    // North-east diagonal
    cluster("5209", "right", 890, 155, [["5215", "5211", "5209"], ["5216", null, "5212"], ["5214", null, "5213"], ["5217", "5218", null]]),
    cluster("5219", "right", 866, 185, [["5221", null], ["5222", "5220"], ["5223", "5219"], ["5224", null]]),
    cluster("5225", "right", 850, 222, [["5227", null], ["5228", "5226"], ["5229", "5225"], ["5230", null]]),
    // South-west diagonal
    cluster("5463", "left", 86, 414, [["5469", "5471", "5470"], ["5468", null, "5465"], ["5463", null, "5466"], ["5467", "5464", null]]),
    cluster("5457", "left", 124, 452, [["5462", "5459"], ["5461", "5458"], ["5457", "5460"]]),
    cluster("5445", "left", 152, 480, [["5454", "5453", "5447"], ["5451", null, "5446"], ["5450", null, "5452"], ["5445", "5448", "5449"]]),
    cluster("5439", "left", 188, 512, [["5444", "5441"], ["5443", "5440"], ["5439", "5442"]])
  ];

  var ROOMS5 = [
    // North-west rooms
    R("515", 341, 137, 357, 153, "W"), R("514", 341, 153, 357, 170, "W"), R("513", 341, 170, 357, 186, "W"),
    R("516", 357, 137, 376, 181, "E:0.5"),
    R("Copy/Mail 6", 386, 137, 405, 163, "N"),
    R("521", 405, 137, 434, 163, "N:0.9"),
    R("Doug", 434, 137, 466, 163, "N:0.1"),
    R("519D", 458, 172, 466, 182, "E"),
    R("Kitchen/Break Area 13", 386, 172, 458, 197, "S"),
    R("525", 481, 140, 501, 158, "W:0.15"), R("524", 481, 160, 501, 186, "W:0.15"),
    R("526", 503, 140, 520, 156, "E"), R("527", 503, 156, 520, 173, "E"), R("528", 503, 173, 520, 190, "E"),
    // North-centre rooms
    R("530", 538, 139, 557, 162, "W"), R("529", 538, 162, 557, 186, "W"),
    R("531", 557, 139, 576, 186, "E"),
    R("532A", 590, 139, 601, 154, "W"), R("532B", 590, 154, 601, 170, "W"), R("532C", 590, 170, 601, 186, "W"),
    R("533", 601, 139, 608, 152, "N"), R("533 A", 608, 139, 636, 152, "N"),
    R("Duck Tales", 601, 154, 636, 198, "W:0.88"),
    R("534", 636, 139, 659, 164, "N"), R("535", 659, 139, 676, 164, "N"),
    R("550", 636, 164, 659, 190, "S"), R("549", 659, 164, 676, 190, "S"),
    R("536", 676, 139, 695, 164, "N"), R("537", 676, 164, 695, 190, "S"),
    R("Phone Booth 5", 628, 82, 646, 90, "S"), R("5040B", 284, 82, 296, 90, "S"),
    R("540", 718, 139, 733, 150, "W"),
    R("539A", 718, 150, 733, 163, "W"), R("539B", 718, 163, 733, 176, "W"), R("539C", 718, 176, 733, 189, "W"),
    R("538", 718, 189, 733, 198, "W"),
    // North-east kitchen
    R("542", 818, 138, 838, 160, "N:0.15"), R("543", 838, 138, 856, 160, "N:0.15"), R("544", 856, 138, 868, 150, "N:0.2"),
    R("Kitchen/Break Area 14", 800, 162, 840, 196, "E"),
    R("546", 800, 196, 812, 206, "E"),
    // West column rooms
    R("511", 280, 197, 296, 215, "N"), R("510", 296, 197, 312, 215, "N"), R("509", 312, 197, 328, 215, "N"),
    R("Bluey", 280, 215, 328, 272, "E:0.08|E:0.92"),
    R("502C", 280, 284, 296, 296, "N"), R("502B", 296, 284, 312, 296, "N"), R("502A", 312, 284, 328, 296, "N"),
    R("503", 280, 296, 304, 313, "W"), R("501", 304, 296, 328, 313, "E"),
    R("Animaniacs", 280, 313, 328, 343, "E"),
    R("504", 280, 343, 296, 360, "S"), R("505", 296, 343, 312, 360, "S"), R("506", 312, 343, 328, 360, "S"),
    // Core
    R("599B", 412, 253, 444, 278, "W:0.6"),
    R("599C", 424, 279, 444, 306, "W:0.2"),
    R("599E", 425, 325, 444, 341, "S:0.75>599D"),
    R("599D", 425, 341, 444, 357, "W"),
    R("599F", 425, 357, 444, 374, "N:0.75>599D"),
    R("599G", 412, 358, 425, 374, "N"),
    R("554", 532, 272, 547, 288, "N:0.2"), R("553", 547, 272, 562, 288, "N:0.2"), R("552", 562, 272, 578, 288, "N:0.2"),
    R("555", 532, 288, 555, 308, "S"), R("556", 555, 288, 578, 308, "S:0.9"),
    R("558", 532, 325, 555, 345, "N:0.15"), R("557", 555, 325, 578, 345, "N:0.85"),
    R("Hey Arnold", 532, 346, 578, 415, "W:0.08|W:0.95"),
    R("560", 532, 415, 547, 435, "S"), R("561", 547, 415, 562, 435, "S"), R("562", 562, 415, 578, 435, "S"),
    // South rooms
    R("580", 340, 443, 361, 462, "W"), R("579", 340, 462, 361, 478, "W"), R("578", 340, 478, 361, 492, "W"),
    R("576", 361, 443, 378, 466, "E:0.85"), R("577", 361, 467, 378, 492, "E:0.9"),
    R("Kitchen/Break Area 15", 395, 443, 472, 463, "N"),
    R("571D", 389, 455, 395, 463, "W"),
    R("Rugrats", 389, 464, 424, 492, "S:0.85"),
    R("573", 424, 464, 444, 492, "S:0.15"), R("Copy/Mail 7", 444, 464, 465, 492, "S:0.15"),
    R("568", 482, 449, 502, 492, "W:0.1"),
    R("565", 503, 443, 519, 458, "E"), R("566", 503, 458, 519, 478, "E"), R("567", 503, 478, 519, 492, "E"),
    // South-west rooms
    R("Treadmill", 160, 368, 222, 388, "W"),
    R("Kitchen/Break Area 16", 158, 410, 226, 424, "W"),
    R("590B", 212, 400, 226, 410, "E"),
    R("591", 165, 433, 185, 456, "N"), R("592", 185, 433, 204, 456, "N"), R("593", 204, 433, 223, 456, "N"),
    R("The Smurfs", 223, 433, 264, 456, "E:0.1"),
    R("587", 180, 458, 193, 470, "S:0.8"), R("586", 193, 458, 206, 470, "S"), R("585", 206, 458, 219, 470, "S"),
    R("SpongeBob", 219, 458, 264, 490, "S:0.1"),
    R("583", 274, 446, 299, 497, "S"),
    R("581", 299, 452, 325, 474, "E"), R("582", 299, 474, 325, 497, "E"),
    R("5432 A", 190, 537, 204, 552, "N")
  ];

  var FIXTURES5 = [
    F("lift", 339, 251, 395, 307, "Lifts"), F("wall", 395, 280, 412, 307), F("wc", 445, 251, 520, 307, "Restrooms"),
    F("lift", 339, 325, 405, 346, "Lifts"), F("wall", 405, 325, 412, 349), F("wall", 405, 356, 410, 374), F("wall", 339, 346, 342, 374),
    F("wc", 445, 325, 520, 374, "Restrooms"), F("wall", 339, 374, 520, 381),
    F("stair", 537, 192, 575, 262, "Stairs"), F("stair", 280, 369, 322, 436, "Stairs"),
    F("other", 735, 139, 760, 198, "Open to below"),
    F("stair", 760, 139, 798, 198, "Stairs"), F("other", 160, 388, 212, 410)
  ];
  [
    Z([[290, 130], [312, 120], [332, 140], [325, 170], [295, 168]], "512", true),
    Z([[234, 122], [258, 100], [298, 98], [298, 135], [240, 150]], "5040A", true),
    Z([[345, 205], [513, 205], [513, 248], [345, 248]], "Bugs Bunny", true),
    Z([[345, 384], [513, 384], [513, 431], [345, 431]], "Phineas and Ferb", true),
    Z([[622, 96], [651, 96], [651, 128], [622, 128]], "5131c", true),
    Z([[830, 238], [860, 238], [846, 256], [830, 256]], "5235 A", true),
    Z([[975, 82], [1006, 82], [1012, 95], [1003, 112], [975, 128]], "5206 A", true),
    Z([[525, 465], [550, 440], [575, 465], [550, 490]], "564", true),
    Z([[578, 492], [632, 475], [622, 515], [600, 538], [578, 548]], "5334 A", true),
    Z([[115, 370], [150, 370], [150, 408], [130, 405], [115, 392]], "589", true),
    Z([[36, 372], [62, 370], [62, 395], [44, 395]], "5473 A", true)
  ].forEach(function (z) { FIXTURES5.unshift(z); });
  sealSlits(ROOMS5, FIXTURES5);

  var CONF5 = {
    "Bluey": "Conference", "Animaniacs": "Conference", "Duck Tales": "Conference", "Doug": "Conference",
    "Hey Arnold": "Large Conf", "The Smurfs": "Conference", "SpongeBob": "Conference", "Rugrats": "Conference",
    "516": "Small Conf", "521": "Small Conf", "525": "Small Conf", "524": "Small Conf", "530": "Small Conf",
    "529": "Small Conf", "531": "Small Conf", "534": "Small Conf", "535": "Small Conf", "550": "Small Conf",
    "549": "Small Conf", "536": "Small Conf", "537": "Small Conf", "542": "Small Conf", "543": "Small Conf",
    "503": "Small Conf", "501": "Small Conf", "555": "Small Conf", "556": "Small Conf", "558": "Small Conf",
    "557": "Small Conf", "576": "Small Conf", "577": "Small Conf", "573": "Small Conf", "568": "Small Conf",
    "591": "Small Conf", "592": "Small Conf", "593": "Small Conf", "586": "Small Conf", "583": "Small Conf",
    "581": "Small Conf", "582": "Small Conf"
  };
  var TYPES5 = {};
  ["515", "514", "513", "511", "510", "509", "502C", "502B", "502A", "504", "505", "506", "532A", "532B", "532C",
    "539A", "539B", "539C", "540", "538", "554", "553", "552", "560", "561", "562", "565", "566", "567",
    "580", "579", "578", "587", "585", "Phone Booth 5", "5040B", "526", "527", "528", "544", "5432 A"
  ].forEach(function (id) { TYPES5[id] = "phone"; });
  ["Copy/Mail 6", "Copy/Mail 7", "519D", "533", "533 A", "546", "571D", "590B", "Kitchen/Break Area 13", "Kitchen/Break Area 14",
    "Kitchen/Break Area 15", "Kitchen/Break Area 16", "599B", "599C", "599D", "599E", "599F", "599G", "Treadmill"
  ].forEach(function (id) { TYPES5[id] = "service"; });
  var LABELS5 = {
    "Copy/Mail 6": "Copy / Mail", "Copy/Mail 7": "Copy / Mail", "Kitchen/Break Area 13": "Kitchen / Break Area",
    "Kitchen/Break Area 14": "Kitchen / Break Area", "Kitchen/Break Area 15": "Kitchen / Break Area",
    "Kitchen/Break Area 16": "Kitchen / Break Area", "Phone Booth 5": "Phone Booth",
    "512": "512 · Open Collaboration", "5040A": "5040A · Open Collaboration", "5131c": "5131c · Open Collaboration",
    "5235 A": "5235 A · Open Collaboration", "5206 A": "5206 A · Free Address", "564": "564 · Open Collaboration",
    "5334 A": "5334 A · Open Collaboration", "589": "589 · Open Collaboration", "5473 A": "5473 A · Open Collaboration",
    "Bugs Bunny": "Bugs Bunny · Open Collaboration", "Phineas and Ferb": "Phineas and Ferb · Open Collaboration"
  };
  Object.keys(CONF5).forEach(function (id) { LABELS5[id] = id + " · " + CONF5[id]; });

  var floor5 = g.DeskFloor.buildFloor({
    level: 9, cityName: "Pleasanton 6110",
    building: {
      x: 20 * S, y: 70 * S, w: (1022 - 20) * S, h: (562 - 70) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS5, rooms: ROOMS5, fixtures: FIXTURES5, openGaps: [], midBand: null, solidZones: true,
    meetings: Object.keys(CONF5), types: TYPES5, labels: LABELS5, leftRooms: null, wingSplit: 520 * S,
    regions: {
      left: { id: "left", label: "West side", x: 25 * S, y: 75 * S, w: 315 * S, h: 481 * S },
      core: { id: "core", label: "Centre", x: 340 * S, y: 75 * S, w: 245 * S, h: 481 * S },
      right: { id: "right", label: "East side", x: 585 * S, y: 75 * S, w: 435 * S, h: 400 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6110", { 1: floor1, 2: floor2, 3: floor3, 4: floor4, 5: floor5, 6: floor6 }, {
    1: [["154.01", "VIBE"], ["Fitness Center", "Cantina"], ["Donut Day", "Mountain Day"],
        ["114", "6110"], ["Workdog", "Hack A Thon"]],
    2: [["2020", "Roadmap"], ["2497", "Jumpstart"], ["Go Live", "2319"], ["2227", "Next Level"], ["Workday", "2456"], ["2004", "2300"]],
    3: [["3037", "Light Bulb"], ["3497", "3333"], ["Cell Phone", "3201"], ["3439", "Internet"], ["3425", "Telegraph"], ["3235", "Wheel"]],
    4: [["4037", "Loyalty"], ["4497", "4333"], ["Dedication", "4201"], ["4439", "Honor"], ["4425", "Transparency"], ["4235", "Trust"]],
    5: [["5037", "Hey Arnold"], ["5497", "5333"], ["Bluey", "5201"], ["5439", "Duck Tales"], ["5425", "SpongeBob"], ["599B", "5235"]],
    6: [["6037", "Lira"], ["6497", "6333"], ["608", "6201"], ["6439", "Krone"], ["6425", "Ringgit"], ["699B", "6235"]]
  });
})();
