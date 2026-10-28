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

  /* ---------------------------------------------------------------------------
   * Floor 2 — measured on its own whole-floor overview (1024 px wide), names and
   * desk numbers read from the close-up sheets. Slanted rooms (the lobby strip and
   * the Jimi Hendrix diamond) are walled pockets with one doorway each, so routes
   * only enter a room through its real door.
   * ------------------------------------------------------------------------- */

  function at(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  /* Straight wall from a to b, with openings at the given [t0, t1] fractions. */
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

  /* Solid polygon (restroom cores, atrium void) filled with thin horizontal strips. */
  function fill(type, pts, label) {
    var ys = pts.map(function (p) { return p[1]; });
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), step = 2, out = [];
    for (var y = y0; y < y1; y += step) {
      var ym = y + step / 2, xs = [];
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[i], b = pts[j];
        if ((a[1] > ym) !== (b[1] > ym)) xs.push(a[0] + (ym - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort(function (p, q) { return p - q; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        out.push(F(type, xs[k], y, xs[k + 1], Math.min(y + step, y1), out.length ? "" : label));
      }
    }
    return out;
  }

  /* Desk block: cols/rows as [from, to] pairs, table[row][col] = printed desk number. */
  function desks(series, wing, cols, rows, table, accent) {
    return {
      series: series, wing: wing, accent: accent || "#16a34a",
      cols: cols.map(function (c) { return [c[0] * S, c[1] * S]; }),
      rows: rows.map(function (r) { return [r[0] * S, r[1] * S]; }),
      ids: cols.map(function (_, c) { return table.map(function (row) { return row[c] == null ? null : row[c]; }); })
    };
  }

  var NA = [[29, 47], [47, 63], [63, 79], [79, 98]];
  var NC = [[18, 35], [35, 53], [53, 70], [70, 88]];
  var NF = [[32, 50], [50, 66], [66, 82], [82, 100]];
  var NE3 = [[29, 47], [47, 63], [63, 79]];
  var SA = [[187, 204], [204, 221], [221, 237], [237, 253]];
  var SJ = [[196, 211], [211, 226], [226, 241], [241, 256]];
  var SR = [[557, 573], [573, 589], [589, 605], [605, 622]];
  var EC = [[738, 755], [755, 772], [772, 789]];
  var HC = [[562, 579], [579, 596], [596, 613]];

  var PODS2 = [
    // North-west wing · north band
    desks("2200", "left", [[192, 208], [213, 228], [228, 245]], NA,
      [["2203", "2204", "2211"], ["2202", "2205", "2210"], ["2201", "2206", "2209"], ["2200", "2207", "2208"]]),
    desks("2212", "left", [[250, 265], [265, 281]], NA, [[null, "2218"], ["2212", "2217"], ["2213", "2216"], ["2214", "2215"]]),
    desks("2219", "left", [[286, 300], [300, 315]], NC, [["2219", "2226"], ["2220", "2225"], ["2221", "2224"], ["2222", "2223"]]),
    desks("2227", "left", [[320, 334], [334, 349]], NA, [[null, "2233"], ["2227", "2232"], ["2228", "2231"], ["2229", "2230"]]),
    desks("2234", "left", [[354, 369], [369, 384]], NA, [["2234", "2241"], ["2235", "2240"], ["2236", "2239"], ["2237", "2238"]]),
    desks("2242", "left", [[389, 404], [404, 419]], NF, [["2242", "2249"], ["2243", "2248"], ["2244", "2247"], ["2245", "2246"]]),
    desks("2250", "left", [[424, 439]], NA, [["2250"], ["2251"], ["2252"], ["2253"]]),
    // North band east of Thin Lizzy
    desks("2260", "right", [[480, 495]], NE3, [["2262"], ["2261"], ["2260"]]),
    desks("2263", "right", [[500, 515], [515, 530]], NE3, [["2263", "2268"], ["2264", "2267"], ["2265", "2266"]]),
    desks("2269", "right", [[535, 550], [550, 565]], NE3, [["2269", "2274"], ["2270", "2273"], ["2271", "2272"]]),
    desks("2275", "right", [[570, 585], [585, 600]], NE3, [["2275", "2280"], ["2276", "2279"], ["2277", "2278"]]),
    desks("2281", "right", [[605, 620]], NE3, [["2281"], ["2282"], ["2283"]]),
    // North-west wing · south band
    desks("2182", "left", [[192, 208], [213, 228], [228, 245]], SA,
      [["2193", "2186", "2185"], ["2192", "2187", "2184"], ["2191", "2188", "2183"], ["2190", "2189", "2182"]]),
    desks("2175", "left", [[250, 265], [265, 281]], SA, [["2179", "2178"], ["2180", "2177"], ["2181", "2176"], [null, "2175"]]),
    desks("2167", "left", [[286, 300], [300, 315]], SJ, [["2171", "2170"], ["2172", "2169"], ["2173", "2168"], ["2174", "2167"]]),
    desks("2160", "left", [[320, 334], [334, 349]], SA, [["2164", "2163"], ["2165", "2162"], ["2166", "2161"], [null, "2160"]]),
    desks("2152", "left", [[354, 369], [369, 384]], SA, [["2156", "2155"], ["2157", "2154"], ["2158", "2153"], ["2159", "2152"]]),
    desks("2144", "left", [[389, 404], [404, 419]], SA, [["2148", "2147"], ["2149", "2146"], ["2150", "2145"], ["2151", "2144"]]),
    desks("2140", "left", [[424, 439]], SA, [["2140"], ["2141"], ["2142"], ["2143"]]),
    // South wing · reservable hotel desks
    desks("Hotels", "right", HC, [[320, 335], [341, 356], [356, 371], [378, 393], [393, 409]],
      [["2127", "2128", "2129"], ["2126", "2125", "2124"], ["2121", "2122", "2123"], ["2120", "2119", "2118"], ["2115", "2116", "2117"]],
      "#0ea5e9"),
    // East column
    desks("2001", "right", EC, [[201, 217], [223, 239], [239, 255], [261, 277], [277, 293], [299, 315], [315, 330],
      [337, 353], [353, 368], [375, 391], [391, 407]],
      [["2001", "2002", "2003"], ["2006", "2005", "2004"], ["2007", "2008", "2009"], ["2012", "2011", "2010"],
       ["2013", "2014", "2015"], ["2018", "2017", "2016"], ["2019", "2020", "2021"], ["2024", "2023", "2022"],
       ["2025", "2026", "2027"], ["2030", "2029", "2028"], ["2031", "2032", "2033"]]),
    desks("2040", "right", EC, [[499, 515], [520, 535], [535, 550]],
      [["2040", "2041", "2042"], ["2045", "2044", "2043"], ["2046", "2047", "2048"]]),
    // South band
    desks("2077", "right", [[638, 654]], SR, [["2080"], ["2079"], ["2078"], ["2077"]]),
    desks("2069", "right", [[659, 675], [675, 690]], SR, [["2073", "2072"], ["2074", "2071"], ["2075", "2070"], ["2076", "2069"]]),
    desks("2061", "right", [[695, 711], [711, 727]], SR, [["2065", "2064"], ["2066", "2063"], ["2067", "2062"], ["2068", "2061"]]),
    desks("2053", "right", [[732, 748], [748, 763]], SR, [["2057", "2056"], ["2058", "2055"], ["2059", "2054"], ["2060", "2053"]]),
    desks("2049", "right", [[769, 784]], SR, [["2049"], ["2050"], ["2051"], ["2052"]])
  ];

  var ROOMS2 = [
    // North-west wing · middle band
    R("239a", 205, 118, 245, 168, "A"),
    R("Rush", 270, 113, 305, 163, "N:0.1"),
    R("Copy/Mail", 270, 164, 305, 173, "S"),
    R("241", 305, 113, 331, 139, "N:0.8"),
    R("238", 305, 139, 331, 170, "S"),
    R("242", 344, 113, 371, 139, "N:0.65"),
    R("243", 371, 113, 397, 139, "S:0.65"),
    R("244", 397, 113, 424, 139, "N"),
    R("245", 424, 113, 453, 139, "N"),
    R("236", 420, 141, 437, 170, "S:0.2"),
    R("235", 438, 141, 455, 170, "S:0.2"),
    R("232", 444, 187, 463, 212, "E"),
    R("231", 444, 212, 463, 237, "E"),
    R("230", 444, 237, 463, 255, "E"),
    // North band and kitchen
    R("Thin Lizzy", 444, 25, 477, 83, "S:0.85"),
    R("250", 636, 45, 662, 79, "W:0.8"),
    R("Kitchen/Break Area", 680, 55, 705, 68, "A"),
    R("251", 633, 96, 656, 114, "W:0.8"),
    R("202", 751, 98, 788, 160, "W:0.1|W:0.9"),
    R("203", 751, 160, 770, 184, "W:0.45"),
    R("204", 770, 160, 788, 184, "S:0.2"),
    // Lobby
    R("Treadmill", 478, 99, 513, 122, "N:0.2"),
    R("248", 513, 99, 544, 122, "N:0.15"),
    R("234", 478, 140, 529, 163, "W:0.6"),
    R("Reflection & Wellbeing", 478, 165, 496, 180, "W:0.9"),
    R("Rob Zombie", 503, 193, 540, 222, "A"),
    R("Quiet Riot", 551, 226, 566, 246, "A"),
    R("Pantera", 572, 248, 590, 266, "A"),
    R("227a", 597, 266, 604, 280, "W"),
    R("Jimi Hendrix", 675, 122, 706, 150, "S:0.6"),
    R("252", 648, 145.5, 655.5, 151, "E"),
    R("253", 670, 163, 678, 170, "W"),
    R("205", 693, 182, 722, 201, "E:0.8"),
    // South wing · conference column and core
    R("Ozzy Osbourne", 638, 288, 678, 334, "W"),
    R("226", 642, 335, 678, 359, "W"),
    R("Motorhead", 646, 359, 678, 395, "W"),
    R("Judas Priest", 678, 306, 722, 391, "E:0.1"),
    R("Kiss", 678, 391, 722, 418, "E:0.1"),
    R("224", 627, 396, 647, 418, "W"),
    R("223", 627, 418, 647, 440, "W"),
    R("222", 627, 440, 647, 463, "W"),
    R("209", 677, 433, 702, 476, "N:0.65"),
    R("208", 702, 433, 722, 452, "E"),
    R("214", 702, 452, 722, 476, "E"),
    R("211", 739, 422, 767, 452, "W:0.7"),
    R("210", 767, 422, 788, 452, "N:0.1"),
    R("212", 739, 452, 767, 483, "W:0.3"),
    R("213", 767, 452, 788, 483, "S:0.1"),
    // South wing · west side
    R("220D", 564, 436, 575, 446, "N"), R("220C", 576, 436, 587, 446, "N"),
    R("220B", 588, 436, 599, 446, "N"), R("220A", 601, 436, 612, 446, "N"),
    R("220", 562, 448, 613, 516, "E:0.9"),
    R("219B", 562, 524, 588, 553, "E>219A"),
    R("219A", 590, 526, 613, 553, "E"),
    R("219", 562, 557, 632, 630, "N:0.55>219A"),
    // Lactation suite: one entrance from the corridor, rooms open onto its lobby
    R("Lactation Room 1", 655, 486, 677, 503, "W"),
    R("Lactation Room 2", 655, 503, 677, 520, "W"),
    R("218", 628, 520, 651, 541, "S"),
    R("217", 651, 520, 677, 541, "S"),
    R("Motley Crue", 677, 484, 722, 532, "E:0.1"),
    R("Copy/Mail 2", 677, 532, 722, 541, "S")
  ];

  // Lobby strip (Rob Zombie → 227a) and the Jimi Hendrix diamond.
  var SA1 = [510, 163], SB1 = [479, 208], SC1 = [619, 262], SD1 = [596, 295];
  var DT = [686, 97], DR = [731, 140], DB = [686, 186], DL = [630, 141];
  var FIXTURES2 = [].concat(
    wall(SA1, SC1),
    wall(SA1, SB1, [[0.7, 0.9]]),
    wall(SB1, SD1, [[0.48, 0.56], [0.7, 0.78], [0.9, 0.97]]),
    wall(SC1, SD1),
    wall([563, 206], [529, 245]), wall([586, 228], [553, 261]), wall([605, 249], [582, 285]),
    wall(DL, DT),
    wall(DT, DR),
    wall(DR, DB, [[0.62, 0.78]]),
    wall(DL, DB, [[0.42, 0.62]]),
    wall([640, 128], [688, 166.6]),

    fill("void", [[563, 206], [603, 167], [647, 213], [610, 251]], "Atrium"),
    fill("wc", [[548, 137], [587, 139], [609, 165], [603, 167], [563, 206], [548, 196]], "Restrooms"),
    fill("wc", [[610, 251], [647, 213], [652, 208], [672, 230], [674, 243], [660, 255], [658, 275], [654, 284], [635, 288], [605, 258]], "Restrooms"),
    [
      F("stair", 331, 139, 384, 169, "Stairs"), F("other", 407, 141, 418, 170),
      F("other", 545, 99, 568, 122), F("stair", 569, 99, 619, 122, "Stairs"),
      F("lift", 693, 202, 723, 256, "Lifts"), F("lift", 693, 267, 723, 297),
      F("other", 648, 396, 676, 417), F("stair", 648, 433, 676, 472, "Stairs"),
      // Lactation suite walls, entrance at the north-west
      F("partition", 627, 482, 630, 484), F("door", 630, 482, 640, 484), F("partition", 640, 482, 677, 484),
      F("partition", 625, 484, 627, 520),
      // 219 open workspace screen beside the 2077–2080 desks
      F("partition", 632, 557, 636, 630)
    ]
  );
  [
    Z([[622, 25], [720, 25], [720, 48], [770, 48], [770, 97], [731, 140], [686, 97], [662, 97], [662, 80], [622, 80]], ""),
    Z([[628, 484], [655, 484], [655, 520], [628, 520]], "Lactation Suite")
  ].forEach(function (z) { FIXTURES2.unshift(z); });

  sealSlits(ROOMS2, FIXTURES2);

  var OUTLINE2 = [
    [188, 15], [440, 15], [440, 25], [720, 25], [720, 48], [770, 48], [770, 97], [789, 97],
    [789, 631], [561, 631], [561, 307], [514, 257], [188, 257]
  ];

  var CONF2 = {
    "Thin Lizzy": "Conference", "Rush": "Conference", "Jimi Hendrix": "Large Conf", "Rob Zombie": "Training",
    "Quiet Riot": "Conference", "Pantera": "Conference", "Ozzy Osbourne": "Conference", "Judas Priest": "Large Conf",
    "Motorhead": "Conference", "Kiss": "Conference", "Motley Crue": "Conference", "220": "Large Conf",
    "226": "Small Conf", "227a": "Small Conf", "241": "Small Conf", "238": "Small Conf", "242": "Small Conf",
    "243": "Small Conf", "244": "Small Conf", "245": "Small Conf", "252": "Small Conf", "253": "Small Conf",
    "203": "Small Conf", "204": "Small Conf", "211": "Small Conf", "212": "Small Conf",
    "230": "Huddle", "231": "Huddle", "232": "Huddle"
  };
  var TYPES2 = {};
  ["220A", "220B", "220C", "220D", "Lactation Room 1", "Lactation Room 2"].forEach(function (id) { TYPES2[id] = "phone"; });
  ["219A", "219B"].forEach(function (id) { TYPES2[id] = "service"; });
  var LABELS2 = {
    "239a": "239a Lounge", "Copy/Mail": "Copy / Mail", "Copy/Mail 2": "Copy / Mail",
    "Kitchen/Break Area": "Kitchen / Break Area", "219": "219 Open Workspace",
    "Lactation Room 1": "Lactation Room", "Lactation Room 2": "Lactation Room",
    "220A": "220A Phone Room", "220B": "220B Phone Room", "220C": "220C Phone Room", "220D": "220D Phone Room"
  };
  Object.keys(CONF2).forEach(function (id) { LABELS2[id] = id + " · " + CONF2[id]; });

  var floor2 = g.DeskFloor.buildFloor({
    level: 3, cityName: "Pleasanton 6130",
    building: {
      x: 180 * S, y: 8 * S, w: (800 - 180) * S, h: (640 - 8) * S,
      outline: OUTLINE2.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS2, rooms: ROOMS2, fixtures: FIXTURES2, openGaps: [], midBand: null,
    meetings: Object.keys(CONF2), types: TYPES2, labels: LABELS2, leftRooms: null, wingSplit: 470 * S,
    regions: {
      left: { id: "left", label: "North-west wing", x: 188 * S, y: 15 * S, w: 282 * S, h: 242 * S },
      core: { id: "core", label: "Lobby", x: 470 * S, y: 15 * S, w: 319 * S, h: 285 * S },
      right: { id: "right", label: "South wing", x: 561 * S, y: 300 * S, w: 228 * S, h: 331 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 3 · Building 6130 (internal level 4)
   * ------------------------------------------------------------------------- */

  var NR3 = [[53, 66], [66, 80], [80, 93], [93, 106]];
  var SR3 = [[213, 226], [226, 239], [239, 252], [252, 265]];
  var WC3 = [[562, 576], [576, 590], [590, 604]];
  var SB3 = [[595, 607], [607, 619], [619, 631]];
  var E3 = [[742, 757], [757, 772], [772, 788]];
  var E4 = [[740, 752], [752, 765], [765, 777], [777, 790]];

  var PODS3 = [
    // North-west wing · north band
    desks("3221", "left", [[213, 226], [226, 239]], NR3, [[null, "3227"], ["3221", "3226"], ["3222", "3225"], ["3223", "3224"]]),
    desks("3228", "left", [[243, 258], [258, 274]], NR3, [["3228", null], ["3229", "3234"], ["3230", "3233"], ["3231", "3232"]]),
    desks("3236", "left", [[279, 295], [295, 311]], NR3, [["3236", "3243"], ["3237", "3242"], ["3238", "3241"], ["3239", "3240"]]),
    desks("3244", "left", [[316, 332], [332, 348]], NR3, [["3244", null], ["3245", "3250"], ["3246", "3249"], ["3247", "3248"]]),
    desks("3252", "left", [[352, 367], [367, 382]], NR3, [["3252", "3259"], ["3253", "3258"], ["3254", null], ["3255", null]]),
    // North band east of Unicorn
    desks("3270", "right", [[481, 500]], [[58, 72], [72, 86], [86, 100]], [["3272"], ["3271"], ["3270"]]),
    desks("3273", "right", [[505, 520], [520, 535]], [[58, 72], [72, 86], [86, 100]], [["3273", "3278"], ["3274", "3277"], ["3275", "3276"]]),
    desks("3279", "right", [[539, 554], [554, 569]], [[58, 72], [72, 86], [86, 100]], [["3279", "3284"], ["3280", "3283"], ["3281", "3282"]]),
    desks("3285", "right", [[573, 588], [588, 603]], [[58, 72], [72, 86], [86, 100]], [["3285", "3290"], ["3286", "3289"], ["3287", "3288"]]),
    // North-west wing · south band
    desks("3200", "left", [[213, 227], [227, 241]], SR3, [["3204", "3203"], ["3205", "3202"], ["3206", "3201"], ["3207", "3200"]]),
    desks("3192", "left", [[245, 260], [260, 275]], SR3, [["3196", "3195"], ["3197", "3194"], ["3198", "3193"], ["3199", "3192"]]),
    desks("3184", "left", [[280, 296], [296, 312]], SR3, [["3188", "3187"], ["3189", "3186"], ["3190", "3185"], ["3191", "3184"]]),
    desks("3180", "left", [[318, 335]], SR3, [["3180"], ["3181"], ["3182"], ["3183"]]),
    desks("3162", "left", [[391, 407]], SR3, [["3165"], ["3164"], ["3163"], ["3162"]]),
    desks("3154", "left", [[412, 428], [428, 444]], SR3, [["3158", "3157"], ["3159", "3156"], ["3160", "3155"], ["3161", "3154"]]),
    desks("3150", "left", [[449, 465]], SR3, [["3150"], ["3151"], ["3152"], ["3153"]]),
    // East column · hot desks
    desks("3001", "right", E3, [[156, 169], [174, 188], [188, 202]], [["3001", "3002", "3003"], ["3006", "3005", "3004"], ["3007", "3008", null]]),
    desks("3009", "right", E3, [[220, 235], [235, 250]], [["3011", "3010", "3009"], ["3012", "3013", "3014"]]),
    desks("3015", "right", E3, [[258, 272], [272, 286]], [["3017", "3016", "3015"], ["3018", "3019", "3020"]]),
    desks("3021", "right", E3, [[291, 304], [304, 317]], [["3023", "3022", "3021"], ["3024", "3025", "3026"]]),
    desks("3027", "right", E3, [[322, 336]], [["3029", "3028", "3027"]]),
    desks("3030", "right", E4, [[410, 424]], [["3030", "3031", "3032", "3033"]]),
    desks("3034", "right", E4, [[430, 445], [445, 460]], [["3037", "3036", "3035", "3034"], ["3038", "3039", "3040", "3041"]]),
    desks("3042", "right", E4, [[466, 481], [481, 496]], [["3045", "3044", "3043", "3042"], ["3046", "3047", "3048", "3049"]]),
    desks("3050", "right", E4, [[501, 514]], [["3053", "3052", "3051", "3050"]]),
    desks("3054", "right", E4, [[519, 533]], [["3054", "3055", "3056", "3057"]]),
    desks("3058", "right", [[750, 763], [763, 777], [777, 790]], [[538, 556], [556, 574]], [["3060", "3059", "3058"], ["3061", "3062", "3063"]]),
    desks("3064", "right", [[756, 770], [770, 783]], [[585, 597], [597, 609], [609, 620], [620, 632]], [["3068", "3067"], ["3069", "3066"], ["3070", "3065"], ["3071", "3064"]]),
    // West column of the south wing
    desks("3134", "right", WC3, [[352, 368], [368, 384]], [["3139", "3138", "3137"], ["3134", "3135", "3136"]]),
    desks("3128", "right", WC3, [[388, 403], [403, 418]], [["3133", "3132", "3131"], ["3128", "3129", "3130"]]),
    desks("3122", "right", WC3, [[423, 438], [438, 453]], [["3127", "3126", "3125"], ["3122", "3123", "3124"]]),
    desks("3116", "right", WC3, [[458, 473], [473, 488]], [["3121", "3120", "3119"], ["3116", "3117", "3118"]]),
    desks("3110", "right", WC3, [[493, 508], [508, 523]], [["3115", "3114", "3113"], ["3110", "3111", "3112"]]),
    desks("3104", "right", WC3, [[531, 547], [547, 563]], [["3109", "3108", "3107"], ["3104", "3105", "3106"]]),
    desks("3096", "right", [[568, 584], [584, 600]], [[580, 593], [593, 606], [606, 619], [619, 632]], [["3100", "3099"], ["3101", "3098"], ["3102", "3097"], ["3103", "3096"]]),
    // South band
    desks("3090", "right", [[608, 624], [624, 640]], SB3, [["3093", "3092"], ["3094", "3091"], ["3095", "3090"]]),
    desks("3084", "right", [[645, 661], [661, 677]], SB3, [["3087", "3086"], ["3088", "3085"], ["3089", "3084"]]),
    desks("3078", "right", [[682, 698], [698, 714]], SB3, [["3081", "3080"], ["3082", "3079"], ["3083", "3078"]]),
    desks("3072", "right", [[719, 735], [735, 751]], SB3, [["3075", "3074"], ["3076", "3073"], ["3077", "3072"]])
  ];

  var ROOMS3 = [
    // North band
    R("346A", 385, 52, 443, 92, "S:0.1"),
    R("346B", 403, 94, 422, 110, "S"),
    R("346C", 423, 94, 442, 110, "S"),
    R("Unicorn", 447, 52, 477, 104, "S"),
    R("350", 635, 46, 672, 99, "W:0.8"),
    R("Kitchen/Break Area", 673, 42, 791, 118, "W:0.85|S:0.86"),
    R("302", 697, 122, 719, 141, "S:0.7"),
    R("303", 720, 122, 742, 141, "S:0.7"),
    R("304", 743, 122, 766, 141, "S:0.7"),
    R("348", 484, 120, 513, 144, "N:0.85"),
    R("Vulcan", 514, 119, 547, 145, "N:0.15"),
    R("353", 619, 119, 674, 145, "S:0.1"),
    // North-west wing · middle band
    R("339b", 209, 125, 218, 133, "N"),
    R("339a", 222, 125, 231, 133, "N"),
    R("Pegasus", 204, 136, 241, 191, "E:0.1"),
    R("340", 270, 136, 295, 162, "N"),
    R("341", 295, 136, 319, 162, "N"),
    R("342", 319, 136, 341, 162, "N"),
    R("338A", 270, 162, 295, 189, "S"),
    R("338", 295, 162, 319, 189, "S"),
    R("337", 319, 162, 341, 189, "S"),
    R("343", 346, 136, 376, 161, "N"),
    R("Treadmill", 376, 136, 406, 161, "N"),
    R("345", 406, 136, 434, 161, "N"),
    R("346", 434, 136, 465, 161, "N"),
    R("335", 427, 162, 445, 189, "S"),
    R("334", 445, 162, 465, 189, "S"),
    R("336", 340, 213, 377, 268, "E:0.9"),
    R("Merman", 474, 240, 527, 274, "N"),
    R("Medusa", 531, 249, 590, 299, "N:0.2|E:0.85"),
    // Core
    R("Copy/Mail", 483, 159, 509, 216, "N:0.7"),
    R("Nessie", 509, 159, 544, 216, "S:0.55"),
    R("352", 544, 159, 586, 214, "N:0.1"),
    R("Mermaid", 566, 216, 598, 241, "W"),
    R("327c", 606, 235, 613, 242, "W:0.8|S:0.2"),
    R("327b", 615, 243, 622, 250, "W:0.8|S:0.2"),
    R("327a", 624, 252, 631, 259, "W:0.8|S:0.2"),
    R("354", 692, 156, 721, 201, "W:0.1"),
    R("354a", 716, 203, 724, 211, "A"),
    R("306", 690, 300, 718, 326, "S"),
    R("Lady of the Lake", 613, 282, 638, 314, "N"),
    R("Leprechaun", 564, 300, 612, 346, "N:0.6"),
    R("Kree", 612, 315, 672, 345, "E"),
    R("324", 616, 347, 644, 367, "S"),
    R("325", 644, 347, 672, 365, "S"),
    R("Reflection & Wellbeing", 697, 349, 725, 385, "N:0.2"),
    R("308", 725, 346, 751, 388, "N:0.25"),
    R("Chupacabra", 751, 343, 785, 392, "S:0.15"),
    // South core
    R("322", 630, 388, 652, 407, "N"),
    R("323", 652, 388, 676, 406, "N"),
    R("311b", 679, 384, 686, 392, "A"),
    R("311a", 679, 394, 686, 402, "A"),
    R("321", 629, 410, 647, 438, "W"),
    R("320", 629, 439, 647, 467, "W"),
    R("319", 629, 468, 647, 495, "W"),
    R("311", 675, 410, 695, 438, "E"),
    R("312", 675, 446, 695, 467, "E"),
    R("313", 675, 468, 695, 495, "E"),
    R("314d", 645, 505, 659, 516, "N"),
    R("314c", 660, 505, 674, 516, "N"),
    R("314b", 675, 505, 689, 516, "N"),
    R("314a", 690, 505, 704, 516, "N"),
    R("Fairy Land", 637, 527, 672, 566, "W:0.85"),
    R("Enchanted Moor", 672, 523, 701, 562, "E:0.65")
  ];

  var FIXTURES3 = [].concat(
    fill("wc", [[590, 193], [634, 159], [676, 201], [634, 250], [612, 232]], "Restrooms"),
    [
      F("stair", 345, 163, 392, 189, "Stairs"), F("other", 416, 163, 427, 189),
      F("lift", 549, 119, 569, 145, "Lift"), F("stair", 581, 118, 618, 145, "Stairs"),
      F("lift", 692, 216, 720, 298, "Lifts"),
      F("stair", 638, 282, 667, 314, "Stairs"),
      F("lift", 648, 410, 673, 430, "Lift"), F("stair", 648, 446, 673, 495, "Stairs")
    ]
  );
  [
    Z([[640, 100], [673, 100], [673, 121], [640, 121]], "")
  ].forEach(function (z) { FIXTURES3.unshift(z); });

  sealSlits(ROOMS3, FIXTURES3);

  var OUTLINE3 = [
    [203, 48], [630, 48], [630, 40], [792, 40], [792, 636], [558, 636], [558, 300],
    [516, 300], [496, 275], [203, 275]
  ];

  var CONF3 = {
    "Pegasus": "Conference", "346A": "Large Conf", "Unicorn": "Conference", "350": "Conference",
    "Vulcan": "Conference", "Nessie": "Large Conf", "Mermaid": "Conference", "354": "Conference",
    "Merman": "Conference", "Medusa": "Large Conf", "Leprechaun": "Conference", "Kree": "Large Conf",
    "Lady of the Lake": "Small Conf", "336": "Conference", "Chupacabra": "Conference", "308": "Small Conf",
    "Fairy Land": "Conference", "Enchanted Moor": "Conference", "306": "Small Conf",
    "340": "Small Conf", "341": "Small Conf", "342": "Small Conf", "338A": "Small Conf", "338": "Small Conf",
    "337": "Small Conf", "343": "Small Conf", "345": "Small Conf", "346": "Small Conf"
  };
  var TYPES3 = {};
  ["339a", "339b", "327a", "327b", "327c", "311a", "311b", "314a", "314b", "314c", "314d", "354a"].forEach(function (id) { TYPES3[id] = "phone"; });
  ["Copy/Mail", "Treadmill"].forEach(function (id) { TYPES3[id] = "service"; });
  var LABELS3 = { "Copy/Mail": "Copy / Mail", "Kitchen/Break Area": "Kitchen / Break Area" };
  Object.keys(CONF3).forEach(function (id) { LABELS3[id] = id + " · " + CONF3[id]; });

  var floor3 = g.DeskFloor.buildFloor({
    level: 4, cityName: "Pleasanton 6130",
    building: {
      x: 195 * S, y: 34 * S, w: (800 - 195) * S, h: (644 - 34) * S,
      outline: OUTLINE3.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS3, rooms: ROOMS3, fixtures: FIXTURES3, openGaps: [], midBand: null,
    meetings: Object.keys(CONF3), types: TYPES3, labels: LABELS3, leftRooms: null, wingSplit: 480 * S,
    regions: {
      left: { id: "left", label: "North-west wing", x: 203 * S, y: 48 * S, w: 277 * S, h: 227 * S },
      core: { id: "core", label: "Core", x: 480 * S, y: 40 * S, w: 312 * S, h: 260 * S },
      right: { id: "right", label: "South wing", x: 558 * S, y: 300 * S, w: 234 * S, h: 336 * S }
    },
    inventory: null, youAreHere: null
  });

  /* ---------------------------------------------------------------------------
   * Floor 4 · Building 6130 (internal level 5)
   * ------------------------------------------------------------------------- */

  var NR4 = [[31, 44], [44, 57], [57, 70], [70, 82]];
  var SR4 = [[192, 205], [205, 218], [218, 231], [231, 243]];
  var WC4 = [[562, 576], [576, 589], [589, 602]];
  var EN4 = [[734, 748], [748, 762], [762, 775], [775, 789]];
  var EM4 = [[736, 750], [750, 764], [764, 778]];
  var ES4 = [[724, 737], [737, 751], [751, 764], [764, 778]];
  var SB4 = [[548, 562], [562, 575], [575, 589], [589, 602]];

  var PODS4 = [
    // North-west wing · north band
    desks("4210", "left", [[279, 296], [296, 314]], NR4, [["4210", "4217"], ["4211", "4216"], ["4212", "4215"], ["4213", "4214"]]),
    desks("4218", "left", [[318, 335], [335, 352]], NR4, [["4218", null], ["4219", "4224"], ["4220", "4223"], ["4221", "4222"]]),
    desks("4225", "left", [[356, 373], [373, 390]], NR4, [["4225", "4232"], ["4226", "4231"], ["4227", "4230"], ["4228", "4229"]]),
    desks("4233", "left", [[393, 407]], NR4, [[null], ["4233"], ["4234"], ["4235"]]),
    desks("4237", "left", [[411, 428], [428, 445]], NR4, [["4239", "4240"], ["4238", "4241"], ["4237", "4242"], [null, "4243"]]),
    // North band east of Yellowstone
    desks("4250", "right", [[485, 501], [501, 517]], NR4, [["4250", "4257"], ["4251", "4256"], ["4252", "4255"], ["4253", "4254"]]),
    desks("4258", "right", [[521, 537], [537, 553]], NR4, [["4258", "4265"], ["4259", "4264"], ["4260", "4263"], ["4261", "4262"]]),
    // North-west wing · south band
    desks("4200", "left", [[214, 230]], SR4, [["4202"], ["4201"], ["4200"], [null]]),
    desks("4194", "left", [[234, 250], [250, 266]], SR4, [["4197", "4196"], ["4198", "4195"], ["4199", "4194"], [null, null]]),
    desks("4186", "left", [[270, 286], [286, 302]], SR4, [["4190", "4189"], ["4191", "4188"], ["4192", "4187"], ["4193", "4186"]]),
    desks("4182", "left", [[306, 321]], SR4, [["4182"], ["4183"], ["4184"], ["4185"]]),
    desks("4178", "left", [[321, 337]], SR4, [[null], ["4180"], ["4179"], ["4178"]]),
    desks("4170", "left", [[341, 357], [357, 373]], SR4, [["4174", "4173"], ["4175", "4172"], ["4176", "4171"], ["4177", "4170"]]),
    desks("4162", "left", [[377, 393], [393, 409]], SR4, [["4166", "4165"], ["4167", "4164"], ["4168", "4163"], ["4169", "4162"]]),
    desks("4154", "left", [[413, 429], [429, 445]], SR4, [["4158", "4157"], ["4159", "4156"], ["4160", "4155"], ["4161", "4154"]]),
    desks("4150", "left", [[450, 466]], SR4, [["4150"], ["4151"], ["4152"], ["4153"]]),
    // East column
    desks("4001", "right", EN4, [[118, 133]], [["4001", "4002", "4003", "4004"]]),
    desks("4005", "right", EN4, [[138, 155], [155, 172]], [["4008", "4007", "4006", "4005"], ["4009", "4010", "4011", "4012"]]),
    desks("4013", "right", EM4, [[178, 194], [194, 210]], [["4015", "4014", "4013"], ["4016", "4017", "4018"]]),
    desks("4019", "right", EM4, [[214, 229], [229, 245]], [["4021", "4020", "4019"], ["4022", "4023", "4024"]]),
    desks("4025", "right", EM4, [[249, 264], [264, 279]], [["4027", "4026", "4025"], ["4028", "4029", "4030"]]),
    desks("4031", "right", EM4, [[283, 298]], [["4033", "4032", "4031"]]),
    // South wing · east
    desks("4040", "right", ES4, [[380, 396]], [["4040", "4041", "4042", "4043"]]),
    desks("4044", "right", ES4, [[399, 414], [414, 429]], [["4047", "4046", "4045", "4044"], ["4048", "4049", "4050", "4051"]]),
    desks("4052", "right", ES4, [[433, 447]], [["4055", "4054", "4053", "4052"]]),
    desks("4056", "right", ES4, [[450, 464]], [["4056", "4057", "4058", "4059"]]),
    desks("4060", "right", ES4, [[468, 484], [484, 500]], [["4063", "4062", "4061", "4060"], ["4064", "4065", "4066", "4067"]]),
    desks("4068", "right", ES4, [[504, 519], [519, 534]], [[null, "4070", "4069", "4068"], ["4072", "4073", "4074", "4075"]]),
    // South wing · west column
    desks("4142", "right", WC4, [[322, 338], [338, 354]], [["4144", "4143", "4142"], ["4139", "4140", "4141"]]),
    desks("4136", "right", WC4, [[358, 374], [374, 390]], [["4138", "4137", "4136"], ["4133", "4134", "4135"]]),
    desks("4128", "right", WC4, [[394, 410], [410, 426]], [[null, "4132", "4131"], ["4128", "4129", "4130"]]),
    desks("4122", "right", WC4, [[430, 446], [446, 462]], [["4127", "4126", "4125"], ["4122", "4123", "4124"]]),
    desks("4116", "right", WC4, [[466, 482], [482, 498]], [["4121", "4120", "4119"], ["4116", "4117", "4118"]]),
    desks("4110", "right", WC4, [[502, 518], [518, 534]], [["4115", "4114", "4113"], ["4110", "4111", "4112"]]),
    // South band
    desks("4098", "right", [[633, 649], [649, 665]], SB4, [["4105", "4098"], ["4104", "4099"], ["4103", "4100"], ["4102", "4101"]]),
    desks("4094", "right", [[669, 685]], SB4, [["4097"], ["4096"], ["4095"], ["4094"]]),
    desks("4090", "right", [[689, 705]], SB4, [["4090"], ["4091"], ["4092"], ["4093"]]),
    desks("4087", "right", [[709, 724]], SB4, [["4089"], ["4088"], ["4087"], [null]]),
    desks("4079", "right", [[728, 744], [744, 760]], SB4, [["4083", "4082"], ["4084", "4081"], ["4085", "4080"], ["4086", "4079"]]),
    desks("4076", "right", [[764, 778]], SB4, [["4076"], ["4077"], ["4078"], [null]])
  ];

  var ROOMS4 = [
    // North-west wing
    R("Mesa Verde", 204, 28, 277, 84, "S:0.1"),
    R("Pinnacles", 204, 98, 261, 143, "N:0.15"),
    R("439", 261, 113, 278, 135, "E"),
    R("438C", 204, 145, 230, 180, "S"),
    R("438B", 230, 145, 252, 180, "S"),
    R("438A", 252, 145, 275, 180, "S"),
    R("Yellowstone", 448, 28, 482, 82, "S:0.85"),
    R("437e", 302, 110, 313, 120, "W"),
    R("437d", 302, 120, 313, 130, "W"),
    R("437c", 302, 131, 313, 141, "W"),
    R("437b", 302, 141, 313, 151, "W"),
    R("437a", 302, 152, 313, 162, "W"),
    R("443", 315, 110, 341, 136, "N"),
    R("437", 315, 136, 341, 162, "S:0.75"),
    R("444", 354, 110, 380, 135, "N"),
    R("445", 380, 110, 406, 135, "N"),
    R("446A", 406, 110, 431, 135, "N"),
    R("446B", 431, 110, 461, 135, "N"),
    R("435", 427, 137, 444, 162, "S:0.2"),
    R("434", 444, 137, 461, 162, "S:0.8"),
    R("Mount Rainier", 470, 208, 515, 243, "N"),
    // Core · north
    R("450A", 562, 29, 580, 55, "W:0.5"),
    R("450B", 562, 55, 580, 81, "W:0.6"),
    R("450D", 580, 29, 615, 55, "E:0.9"),
    R("450C", 580, 55, 615, 81, "E:0.85"),
    R("402", 628, 25, 675, 81, "S:0.1"),
    R("Kitchen/Break Area", 676, 25, 776, 104, "W:0.8|S:0.95"),
    R("453a", 732, 106, 740, 113, "S"),
    R("453b", 742, 106, 750, 113, "S"),
    R("448a", 480, 93, 497, 119, "N"),
    R("448", 497, 93, 520, 119, "N"),
    R("449", 520, 93, 546, 119, "N"),
    R("452", 617, 95, 637, 118, "S:0.15"),
    R("451", 481, 136, 502, 191, "N:0.8"),
    R("North Cascades", 502, 136, 539, 191, "W:0.2>451"),
    R("403", 615, 136, 637, 155, "E"),
    R("404", 615, 155, 637, 174, "E"),
    R("405", 615, 174, 637, 191, "E"),
    R("453", 687, 120, 721, 147, "W:0.8"),
    R("454", 687, 147, 721, 174, "W:0.8"),
    R("454a", 707, 175, 715, 183, "S"),
    R("Lactation Room", 689, 256, 712, 298, "S:0.8"),
    // Core · south
    R("Lassen Volcanic", 516, 208, 580, 262, "N:0.6|E:0.75"),
    R("Joshua Tree", 609, 254, 632, 283, "N:0.3"),
    R("Kings Canyon", 562, 266, 607, 315, "N:0.75"),
    R("Isle Royale", 609, 284, 662, 314, "E:0.85"),
    R("425", 612, 318, 638, 340, "S"),
    R("Treadmill", 638, 318, 666, 340, "S"),
    R("409", 694, 322, 718, 358, "N:0.25"),
    R("Biscayne", 718, 322, 746, 358, "N:0.3"),
    R("Channel Islands", 746, 322, 778, 358, "S:0.25"),
    // South wing · core
    R("423", 624, 360, 649, 380, "N"),
    R("424", 649, 358, 670, 378, "N"),
    R("412b", 672, 358, 682, 368, "S"),
    R("421", 626, 383, 643, 410, "W"),
    R("420", 626, 410, 643, 437, "W"),
    R("419", 626, 437, 643, 462, "W"),
    R("412", 673, 383, 692, 410, "E"),
    R("413", 673, 410, 692, 434, "E"),
    R("414", 673, 434, 692, 461, "E"),
    R("419A", 614, 464, 623, 473, "W"),
    R("Glacier Bay", 624, 467, 660, 508, "W:0.85"),
    R("Everglades", 660, 466, 699, 504, "E:0.75"),
    R("416C", 634, 510, 655, 531, "S"),
    R("416B", 655, 508, 679, 530, "S"),
    R("416A", 679, 506, 701, 527, "S"),
    R("417B", 574, 537, 617, 561, "E:0.7"),
    R("417A", 574, 561, 617, 588, "E:0.2")
  ];

  var FIXTURES4 = [].concat(
    fill("wc", [[539, 136], [615, 136], [615, 191], [539, 191]], "Restrooms"),
    [
      F("stair", 350, 137, 380, 162, "Stairs"), F("lift", 415, 137, 427, 162, "Lift"),
      F("lift", 546, 92, 567, 120, "Lift"), F("stair", 567, 92, 613, 120, "Stairs"),
      F("lift", 689, 189, 716, 255, "Lifts"),
      F("stair", 633, 245, 663, 282, "Stairs"),
      F("lift", 644, 381, 672, 400, "Lift"), F("stair", 644, 416, 672, 463, "Stairs")
    ]
  );

  sealSlits(ROOMS4, FIXTURES4);

  var OUTLINE4 = [
    [203, 25], [790, 25], [790, 175], [780, 175], [780, 604], [558, 604], [558, 285],
    [515, 243], [203, 243]
  ];

  var CONF4 = {
    "Mesa Verde": "Large Conf", "Pinnacles": "Large Conf", "Yellowstone": "Conference", "450D": "Conference",
    "North Cascades": "Large Conf", "Mount Rainier": "Large Conf", "Lassen Volcanic": "Large Conf",
    "Kings Canyon": "Large Conf", "Isle Royale": "Large Conf", "Joshua Tree": "Small Conf",
    "Biscayne": "Conference", "Channel Islands": "Conference", "Glacier Bay": "Conference", "Everglades": "Conference",
    "443": "Small Conf", "437": "Small Conf", "444": "Small Conf", "445": "Small Conf", "446A": "Small Conf",
    "446B": "Small Conf", "438A": "Small Conf", "438B": "Small Conf", "438C": "Small Conf", "453": "Small Conf",
    "454": "Small Conf", "417A": "Small Conf", "417B": "Small Conf"
  };
  var TYPES4 = {};
  ["437a", "437b", "437c", "437d", "437e", "453a", "453b", "454a", "412b", "419A"].forEach(function (id) { TYPES4[id] = "phone"; });
  ["Treadmill", "Lactation Room", "451"].forEach(function (id) { TYPES4[id] = "service"; });
  var LABELS4 = { "Kitchen/Break Area": "Kitchen / Break Area", "412b": "412b Phone Booth", "451": "451 Lounge" };
  Object.keys(CONF4).forEach(function (id) { LABELS4[id] = id + " · " + CONF4[id]; });

  var floor4 = g.DeskFloor.buildFloor({
    level: 5, cityName: "Pleasanton 6130",
    building: {
      x: 195 * S, y: 18 * S, w: (798 - 195) * S, h: (612 - 18) * S,
      outline: OUTLINE4.map(function (p) { return [p[0] * S, p[1] * S]; })
    },
    pods: PODS4, rooms: ROOMS4, fixtures: FIXTURES4, openGaps: [], midBand: null,
    meetings: Object.keys(CONF4), types: TYPES4, labels: LABELS4, leftRooms: null, wingSplit: 480 * S,
    regions: {
      left: { id: "left", label: "North-west wing", x: 203 * S, y: 25 * S, w: 277 * S, h: 218 * S },
      core: { id: "core", label: "Core", x: 480 * S, y: 25 * S, w: 310 * S, h: 275 * S },
      right: { id: "right", label: "South wing", x: 558 * S, y: 300 * S, w: 222 * S, h: 304 * S }
    },
    inventory: null, youAreHere: null
  });

  g.addBuilding("pleasanton", "Pleasanton", "6130", { 1: floor1, 2: floor2, 3: floor3, 4: floor4 }, {
    1: [["High Roller", "Braun"], ["120.01", "Rose Tower"], ["Newton", "Eiffel Tower"],
        ["BT Tech Hub", "122"], ["Massage Room", "126A"]],
    2: [["2203", "Motley Crue"], ["Rob Zombie", "2052"], ["Jimi Hendrix", "2127"], ["Lactation Room 1", "Thin Lizzy"],
        ["Pantera", "2283"], ["252", "2033"]],
    3: [["3221", "Kree"], ["Pegasus", "3064"], ["Nessie", "3139"], ["Chupacabra", "3090"], ["336", "3001"], ["Fairy Land", "3272"]],
    4: [["4210", "Isle Royale"], ["Mesa Verde", "4076"], ["North Cascades", "4102"], ["Biscayne", "4153"], ["437a", "4033"], ["Lactation Room", "4265"]]
  });
})();
