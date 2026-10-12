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

  function Z(points, label) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var f = F("zone", Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), label);
    f[7] = points.map(function (p) { return [p[0] * S, p[1] * S]; });
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

  g.addBuilding("pleasanton", "Pleasanton", "6110", { 1: floor1 }, {
    1: [["154.01", "VIBE"], ["Fitness Center", "Cantina"], ["Donut Day", "Mountain Day"],
        ["114", "6110"], ["Workdog", "Hack A Thon"]]
  });
})();
