/*
 * Pleasanton (USA) · Building 6130 · Floor 1 — digital floor plan data.
 *
 * L-shaped building: conference wing to the north-west, diamond lobby with
 * the lifts in the middle, and the training / workspace wing to the south.
 * Positions are measured on the whole-floor overview (1024 px wide, read from
 * the high-resolution sheet) and scaled by S into plan units.
 */
(function () {
  "use strict";

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  if (!g.DeskFloor) return;
  var S = 2;

  function R(id, x0, y0, x1, y1, door) { return [id, x0 * S, y0 * S, x1 * S, y1 * S, door]; }
  function F(type, x0, y0, x1, y1, label, id) { return [type, x0 * S, y0 * S, x1 * S, y1 * S, label || "", id]; }

  /* Slanted wall drawn as a continuous staircase of thin partitions from (x0,y0) to (x1,y1). */
  function slant(x0, y0, x1, y1, n) {
    var out = [], t = 2;
    for (var i = 0; i < n; i++) {
      var xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
      var ya = y0 + (y1 - y0) * i / n, yb = y0 + (y1 - y0) * (i + 1) / n;
      out.push(F("partition", Math.min(xa, xb), ya, Math.max(xa, xb) + t, ya + t));
      out.push(F("partition", xb, ya, xb + t, yb + t));
    }
    return out;
  }

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
    pod("120", "right", [770, 784, 798], [346, 359, 375, 387], 13, 11,
      [[10, 11, 12], [9, 8, 7], [4, 5, 6], [3, 2, 1]], "#16a34a")
  ];

  var ROOMS = [
    // North-west conference wing
    R("High Roller", 227, 40, 272, 108, "E:0.1"),
    R("Lincoln Cathedral", 227, 108, 272, 170, "E:0.1"),
    R("Great Pyramid", 293, 40, 378, 87, "S:0.92"),
    R("Gerbrandy Tower", 379, 40, 460, 87, "S:0.05"),
    R("Kitchen/Break Area", 330, 112, 370, 120, "S"),
    R("146a", 410, 125, 419, 149, "W"),
    R("147", 425, 130, 433, 134, "S"),
    R("Shanghai Tower", 302, 150, 366, 190, "W:0.15"),
    R("Rose Tower", 227, 190, 366, 263, "E:0.85"),
    R("Tokyo Skytree", 381, 179, 433, 218, "W:0.2"),
    R("Washington Monument", 381, 218, 457, 263, "W:0.15"),
    // North-centre: lab, storage suite, 135/136
    R("Accessibility Lab", 460, 40, 512, 73, "S:0.05"),
    R("138a", 473, 73, 512, 99, "W:0.8"),
    R("137", 473, 99, 497, 117, "W:0.4"),
    R("138b", 473, 117, 512, 133, "S:0.15"),
    R("136", 532, 56, 560, 64, "S"),
    R("Storage", 585, 40, 658, 83, "W:0.6|S:0.93"),
    R("135", 530, 86, 580, 133, "W:0.15"),
    // Wellness rooms off their own hallway
    R("152", 459, 149, 497, 195, "E:0.9"),
    R("153", 459, 195, 497, 215, "E:0.85"),
    R("Massage Room", 459, 215, 497, 237, "E:0.4"),
    R("Lyra Sessions", 470, 245, 500, 252, "N"),
    R("156", 522, 214, 542, 221, "N"),
    R("158", 615, 149, 640, 169, "N:0.8"),
    R("100", 640, 160, 658, 167, "S"),
    // 130 and BT Tech Hub at the north-east
    R("130", 664, 98, 684, 105, "S"),
    R("BT Tech Hub", 680, 50, 715, 57, "S:0.3"),
    // East column beside the lobby
    R("101", 778, 110, 812, 138, "W:0.8"),
    R("102", 784, 138, 812, 165, "W:0.8"),
    R("Eiffel Tower", 779, 165, 811, 189, "W:0.85"),
    R("Accessibility Lab 2", 783, 233, 803, 240, "N"),
    // 126 office suite, entered from its south end
    R("126D", 745, 258, 771, 292, "E:0.15"),
    R("126E", 745, 292, 771, 327, "E:0.15"),
    R("126C", 786, 258, 811, 290, "W:0.2"),
    R("126B", 786, 290, 811, 312, "W"),
    R("126A", 786, 312, 811, 334, "W"),
    R("SAN", 719, 343, 749, 380, "E:0.15"),
    R("124", 763, 407, 811, 432, "W:0.35"),
    R("123", 763, 434, 811, 460, "W:0.25"),
    R("121", 719, 410, 749, 459, "E:0.1"),
    R("122", 755, 505, 775, 512, "N"),
    R("119", 750, 592, 780, 598, "N"),
    R("119A", 726, 615, 739, 625, "N"),
    R("119B", 781, 615, 793, 625, "N"),
    R("119C", 794, 615, 805, 625, "N"),
    // South wing, west side
    R("159", 613, 290, 640, 311, "E:0.4"),
    R("113C", 590, 311, 640, 340, "S:0.45"),
    R("113B", 590, 340, 609, 366, "E:0.8"),
    R("113A", 590, 366, 609, 393, "E:0.75"),
    R("113D", 641, 357, 698, 373, "S:0.1"),
    R("Newton", 590, 394, 673, 472, "E:0.15|S:0.92"),
    R("118A", 590, 487, 641, 514, "N:0.5"),
    R("115", 641, 487, 678, 514, "E:0.15"),
    R("115B", 680, 503, 690, 514, "N"),
    R("115A", 690, 503, 700, 514, "N"),
    R("Braun", 590, 514, 690, 626, "E:0.05|E:0.85")
  ];

  var FIXTURES = [
    // North-west: lobby stair
    F("stair", 382, 150, 420, 178, "Stairs"),
    // Lounge strip beside Tokyo Skytree, door from the main corridor
    F("partition", 441, 149, 449, 151), F("door", 449, 149, 459, 151),
    // Double door across the main corridor west of 138b
    F("door", 489, 133, 491, 149),
    // 147 open desk: 146a opens off it, single door at the bottom
    F("partition", 440, 124, 442, 149),
    F("partition", 419, 149, 421, 151), F("partition", 428, 149, 442, 151),
    F("other", 420, 151, 441, 178), F("door", 421, 149, 428, 151),
    // 137 closet
    F("other", 497, 99, 512, 117),
    // 136 storage: double door into the vestibule beside 135, Storage reached through it
    F("door", 514, 84, 530, 86), F("partition", 530, 84, 580, 86),
    F("partition", 580, 40, 582, 66), F("door", 580, 66, 582, 82), F("partition", 580, 82, 582, 84),
    F("door", 514, 131, 530, 133),
    // Back-of-house rooms and stair behind Storage
    F("other", 582, 85, 642, 108),
    F("other", 582, 109, 598, 133), F("other", 598, 109, 614, 133),
    F("stair", 615, 108, 643, 133, "Stairs"),
    // Wellness hallway entrance from the north corridor
    F("door", 497, 149, 511, 151),
    // Restrooms behind the wellness rooms; the slanted block forms the lobby's NW face
    F("wc", 511, 149, 553, 209, "Restrooms"),
    F("wc", 553, 149, 615, 170),
    F("wc", 553, 170, 626, 180, "Restrooms"),
    F("wc", 553, 180, 616, 190),
    F("wc", 553, 190, 606, 200),
    F("wc", 553, 200, 597, 209),
    F("wc", 561, 209, 587, 219),
    F("wc", 569, 219, 577, 229),
    F("door", 549, 149, 559, 151), F("door", 580, 149, 588, 151),
    // 156 door from the wellness hallway
    F("door", 509, 209, 511, 218), F("partition", 509, 218, 511, 229),
    // Diamond lobby: info desk and lift core
    F("other", 719, 171, 754, 179, "Info desk"),
    F("other", 719, 201, 753, 211),
    F("lift", 726, 212, 747, 256, "Lifts"),
    F("other", 719, 257, 745, 327), F("door", 717, 262, 719, 270), F("door", 717, 317, 719, 326),
    F("door", 717, 329, 719, 337), F("door", 717, 405, 719, 415), F("door", 717, 382, 719, 390),
    // Slanted restroom block forming the lobby's SE face, entered from the east corridor
    F("wc", 676, 218, 688, 228),
    F("wc", 664, 228, 701, 238),
    F("wc", 654, 238, 703, 248, "Restrooms"),
    F("wc", 644, 248, 703, 258),
    F("wc", 634, 258, 703, 268),
    F("wc", 624, 268, 703, 278),
    F("wc", 618, 278, 703, 290),
    F("wc", 640, 290, 703, 293),
    F("door", 703, 245, 705, 254),
    // 130 open collaboration (open to BT Tech Hub): door in its south wall, slanted glass wall to the lobby
    F("partition", 659, 69, 661, 133)
  ].concat(slant(719, 86, 675, 133, 5), [
    F("door", 661, 131, 671, 133), F("partition", 671, 131, 677, 133),
    // Accessibility Lab (east): L-shaped, door on the west of its upper part
    F("partition", 777, 189, 779, 191), F("door", 777, 191, 779, 201), F("partition", 777, 201, 779, 219),
    F("partition", 746, 217, 779, 219), F("partition", 746, 219, 748, 257),
    // 126 suite: closed at the lab, single entrance at the south end of its hallway
    F("partition", 745, 256, 812, 258),
    F("partition", 745, 334, 771, 336), F("door", 771, 334, 786, 336), F("partition", 786, 334, 812, 336),
    F("other", 719, 380, 749, 405),
    // South wing: 113 suite rooms, blank rooms and the Newton stair
    F("other", 641, 309, 683, 356), F("other", 683, 309, 702, 356), F("door", 692, 307, 702, 309),
    F("partition", 698, 373, 700, 383), F("door", 698, 383, 700, 393),
    F("other", 673, 412, 704, 433), F("door", 704, 424, 706, 432),
    F("stair", 673, 433, 704, 473, "Stairs"),
    F("door", 702, 476, 704, 485),
    // 122 open workspace: walled, door at the top between 121 and 123
    F("partition", 719, 460, 749, 462), F("door", 749, 460, 760, 462), F("partition", 760, 460, 812, 462),
    F("partition", 717, 462, 719, 566),
    F("partition", 717, 566, 812, 568),
    // 119 kitchen: counter and its opening from the corridor at the south-west corner
    F("partition", 717, 568, 719, 604), F("door", 717, 604, 719, 626),
    F("other", 735, 575, 795, 583)
  ]);

  function Z(points, label) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var f = F("zone", Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), label);
    f[7] = points.map(function (p) { return [p[0] * S, p[1] * S]; });
    return f;
  }
  [
    Z([[512, 40], [580, 40], [580, 84], [512, 84]], ""),
    Z([[419, 124], [440, 124], [440, 149], [419, 149]], ""),
    Z([[433, 151], [459, 151], [459, 218], [433, 218]], ""),
    Z([[290, 102], [409, 102], [409, 149], [290, 149]], ""),
    Z([[459, 237], [497, 237], [497, 229], [521, 229], [548, 256], [541, 263], [459, 263]], ""),
    Z([[511, 209], [553, 209], [570, 232], [548, 256], [521, 229], [511, 229]], ""),
    Z([[640, 149], [664, 149], [664, 193], [650, 193], [628, 178], [640, 169]], ""),
    Z([[663, 40], [744, 40], [744, 60], [719, 86], [675, 133], [661, 133], [661, 69], [663, 69]], ""),
    Z([[748, 219], [779, 219], [779, 189], [811, 189], [811, 257], [748, 257]], ""),
    Z([[719, 462], [812, 462], [812, 566], [719, 566]], ""),
    Z([[719, 568], [812, 568], [812, 626], [719, 626]], ""),
    Z([[609, 340], [624, 340], [624, 373], [698, 373], [698, 393], [609, 393]], "113")
  ].forEach(function (z) { FIXTURES.unshift(z); });

  sealSlits(ROOMS, FIXTURES);

  var OUTLINE = [
    [227, 40], [744, 40], [744, 60], [719, 86], [770, 136], [792, 107], [813, 107],
    [813, 627], [590, 627], [590, 311], [617, 284], [570, 234], [548, 256], [541, 263], [227, 263]
  ];

  var CONF = {
    "High Roller": "Conference", "Lincoln Cathedral": "Conference", "Great Pyramid": "Large Conf",
    "Gerbrandy Tower": "Large Conf", "Shanghai Tower": "Conference", "Rose Tower": "Large Conf",
    "Tokyo Skytree": "Conference", "Washington Monument": "Conference", "Eiffel Tower": "Small Conf",
    "Newton": "Training", "Braun": "Training", "113C": "Small Conf", "124": "Small Conf",
    "115": "Small Conf"
  };
  var MEETINGS = Object.keys(CONF);
  var PHONES = ["113A", "113B", "115A", "115B", "119A", "119B", "119C", "158"];
  var TYPES = {};
  PHONES.forEach(function (id) { TYPES[id] = "phone"; });
  ["146a", "136", "Storage", "135", "SAN", "138a", "138b", "137", "159", "118A"]
    .forEach(function (id) { TYPES[id] = "service"; });

  var LABELS = {
    "Kitchen/Break Area": "Kitchen / Break Area", "146a": "146a Storage", "147": "147 Open Desk",
    "138a": "138a Storage", "137": "137 Storage", "138b": "138b Storage", "136": "136 Storage",
    "135": "135 Storage", "152": "152 Wellness Room", "153": "153 Wellness Room",
    "Lyra Sessions": "Lyra Sessions · Open Workspace", "156": "156 Open Collaboration",
    "158": "158 Phone Room", "100": "100 Open Workspace", "130": "130 Open Collaboration",
    "BT Tech Hub": "BT Tech Hub · Workspace", "101": "101 Lounge", "102": "102 Lounge",
    "Accessibility Lab 2": "Accessibility Lab", "126D": "126D Office", "126E": "126E Office",
    "126C": "126C Office", "126B": "126B Office", "126A": "126A Office", "SAN": "SAN Room",
    "123": "123 Office", "121": "121 Office", "122": "122 Open Workspace",
    "119": "119 Kitchen / Break Area", "159": "159 Restroom", "113D": "113D Office",
    "118A": "118A Storage"
  };
  MEETINGS.forEach(function (id) { LABELS[id] = id + " · " + CONF[id]; });
  PHONES.forEach(function (id) { LABELS[id] = id + " Phone Room"; });

  var floor1 = g.DeskFloor.buildFloor({
    level: 2, cityName: "Pleasanton 6130",
    building: {
      x: 220 * S, y: 34 * S, w: (820 - 220) * S, h: (633 - 34) * S,
      outline: OUTLINE.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS, rooms: ROOMS, fixtures: FIXTURES, openGaps: [], midBand: null,
    meetings: MEETINGS, types: TYPES, labels: LABELS, leftRooms: null, wingSplit: 590 * S,
    regions: {
      left: { id: "left", label: "North-west wing", x: 227 * S, y: 34 * S, w: 233 * S, h: 230 * S },
      core: { id: "core", label: "Lobby", x: 460 * S, y: 34 * S, w: 353 * S, h: 270 * S },
      right: { id: "right", label: "South wing", x: 590 * S, y: 284 * S, w: 223 * S, h: 349 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6130", { 1: floor1 }, {
    1: [["High Roller", "Braun"], ["120.01", "Rose Tower"], ["Newton", "Eiffel Tower"],
        ["BT Tech Hub", "122"], ["Massage Room", "126A"]]
  });
})();
