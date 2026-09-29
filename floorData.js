/*
 * Pune · Floor 2 — digital floor plan data.
 *
 * Coordinates are in plan units measured from the reference plan sections
 * (left wing, core, right wing on one shared grid). Desk numbering inside each
 * pod follows the serpentine order printed on the reference plan.
 *
 * Walkable space is everything inside the building outline that is not a
 * desk, room, or core fixture. The corridor graph is a fine grid over that
 * white space, so routes can never pass through a desk, room, or wall.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  root.FLOOR_DATA = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var BUILDING_F2 = { x: 10, y: 105, w: 2610, h: 507 };
  var GRID = 4;
  var INFLATE = 0.4;
  var WALL_CLEAR = 12;
  var METERS_PER_UNIT = 0.065;

  var MEETINGS = [
    "Tungabhadra", "Teesta", "Narmada", "Umngot", "Vaigai", "Tapi", "Spiti", "Zuari", "Sarayu",
    "Krishna", "Ravi", "Mahanadi", "Mandovi", "Kaveri", "Purna", "Penna", "Pavana", "Periyar",
    "Bharathappuzha", "Sutlej", "Brahmaputra", "Alakananda", "Savitri", "Godavari", "Barak"
  ];

  var LEFT_ROOMS = [
    "Tungabhadra", "Teesta", "Narmada", "Umngot", "Vaigai", "Tapi", "Spiti", "Zuari", "Sarayu",
    "264A", "264B", "264C", "264D", "265A", "265B", "260A", "260B", "260C", "259A", "262", "261",
    "258", "258A", "267A", "267B", "268", "269", "273", "274", "275", "278B", "279", "256A", "256B",
    "256C", "257A", "257B", "257C", "254A", "254B", "253A", "253B", "250A", "250B", "250C", "202"
  ];

  var LABELS = { "200": "200 Reception", "205": "205 Pantry" };

  var ACCENTS = {
    "263": "#7c6aa0", "264": "#d4a017", "266": "#d4a017", "277": "#0ea5e9",
    "257": "#a855f7", "254": "#dc2626", "253": "#0ea5e9", "213": "#78716c",
    "225": "#78716c", "226": "#d4a017", "227": "#d4a017", "234": "#84cc16",
    "235": "#06b6d4", "239": "#7c3aed"
  };

  function seq(a, b) {
    var out = [];
    var step = a <= b ? 1 : -1;
    var n;
    for (n = a; step > 0 ? n <= b : n >= b; n += step) out.push(n);
    return out;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  var TOP_ROWS_LEFT = [[116, 140], [140, 164], [164, 188], [215, 239], [239, 263], [263, 287]];
  var TOP_ROWS_RIGHT = [[116, 140], [140, 164], [164, 188], [210, 234], [234, 258], [258, 282]];
  var MID_ROWS = [[335, 359], [359, 383], [383, 407], [407, 431], [431, 455]];
  var BOT_ROWS = [[503, 527], [527, 551], [551, 575], [575, 599]];

  var TOP_BLOCK_IDS = [seq(6, 1), seq(7, 12), seq(18, 13), seq(19, 24), seq(30, 25), seq(31, 36)];
  var MID_IDS_8 = [seq(1, 5), seq(10, 6), seq(11, 15), seq(20, 16), seq(21, 25), seq(30, 26), seq(31, 35), seq(40, 36)];
  var MID_IDS_7 = MID_IDS_8.slice(0, 7);

  /* Desk pods: cols = [x0, x1] per column, rows = [y0, y1] per row,
     ids[c] = seat numbers from top to bottom in column c. */
  var PODS = [
    { series: "263", wing: "left", type: "phone",
      cols: [[23, 48], [48, 74]],
      rows: [[165, 188], [188, 211], [228, 252], [252, 276]],
      ids: [[1, 4, 5, 8], [2, 3, 6, 7]] },
    { series: "264", wing: "left",
      cols: [[108, 132], [138, 162], [168, 192], [203, 227], [233, 257], [263, 287]],
      rows: TOP_ROWS_LEFT, ids: TOP_BLOCK_IDS },
    { series: "266", wing: "left",
      cols: [[251, 276], [276, 302], [310, 337], [337, 364], [373, 398], [398, 424], [433, 461], [461, 490]],
      rows: MID_ROWS, ids: MID_IDS_8 },
    { series: "277", wing: "left",
      cols: [[753, 780], [780, 807], [814, 842], [842, 870], [877, 903], [903, 930], [941, 965]],
      rows: MID_ROWS, ids: MID_IDS_7 },
    { series: "257", wing: "left",
      cols: [[96, 120], [138, 164], [164, 190], [198, 224], [224, 250], [258, 284], [284, 310],
        [318, 344], [344, 370], [383, 410], [410, 437]],
      rows: BOT_ROWS,
      ids: [seq(44, 41), seq(37, 40), seq(36, 33), seq(29, 32), seq(28, 25), seq(21, 24), seq(20, 17),
        seq(13, 16), seq(12, 9), seq(5, 8), seq(4, 1)] },
    { series: "254", wing: "left",
      cols: [[500, 522], [528, 554], [554, 580], [588, 614], [614, 640], [652, 676], [676, 701], [708, 734], [734, 760]],
      rows: BOT_ROWS,
      ids: [[34, 33], seq(29, 32), seq(28, 25), seq(21, 24), seq(20, 17), seq(13, 16), seq(12, 9), seq(5, 8), seq(4, 1)] },
    { series: "253", wing: "left",
      cols: [[843, 869], [869, 895], [903, 929], [929, 955], [963, 989], [989, 1015], [1026, 1048]],
      rows: BOT_ROWS,
      ids: [seq(25, 28), seq(24, 21), seq(17, 20), seq(16, 13), seq(9, 12), seq(8, 5), seq(1, 4)] },
    { series: "213", wing: "right",
      cols: [[1588, 1612], [1612, 1637], [1648, 1672], [1672, 1697], [1708, 1732], [1732, 1757], [1773, 1797]],
      rows: MID_ROWS, ids: MID_IDS_7 },
    { series: "225", wing: "right",
      cols: [[2086, 2111], [2111, 2137], [2146, 2171], [2171, 2197], [2206, 2231], [2231, 2257], [2266, 2291], [2291, 2317]],
      rows: MID_ROWS, ids: MID_IDS_8 },
    { series: "226", wing: "right",
      cols: [[2258, 2282], [2288, 2312], [2321, 2345], [2353, 2377], [2383, 2407], [2418, 2442]],
      rows: TOP_ROWS_RIGHT, ids: TOP_BLOCK_IDS },
    { series: "227", wing: "right",
      cols: [[2476, 2500], [2500, 2524]],
      rows: [[160, 184], [184, 208], [225, 249], [249, 273]],
      ids: [[2, 3, 6, 7], [1, 4, 5]] },
    { series: "239", wing: "right",
      cols: [[1487, 1511], [1520, 1545], [1545, 1570], [1584, 1609], [1609, 1634], [1648, 1673], [1673, 1698]],
      rows: BOT_ROWS,
      ids: [seq(28, 25), seq(21, 24), seq(20, 17), seq(13, 16), seq(12, 9), seq(5, 8), seq(4, 1)] },
    { series: "235", wing: "right",
      cols: [[1784, 1810], [1810, 1836], [1849, 1875], [1875, 1901], [1910, 1935], [1935, 1960], [1970, 1995], [1995, 2020], [2030, 2054]],
      rows: BOT_ROWS,
      ids: [seq(32, 35), seq(31, 28), seq(24, 27), seq(23, 20), seq(16, 19), seq(15, 12), seq(8, 11), seq(7, 4), seq(1, 3)] },
    { series: "234", wing: "right",
      cols: [[2115, 2141], [2141, 2167], [2183, 2209], [2209, 2235], [2243, 2269], [2269, 2295], [2303, 2329],
        [2329, 2355], [2363, 2389], [2389, 2415], [2425, 2449]],
      rows: BOT_ROWS,
      ids: [seq(41, 44), seq(40, 37), seq(33, 36), seq(32, 29), seq(25, 28), seq(24, 21), seq(17, 20),
        seq(16, 13), seq(9, 12), seq(8, 5), seq(1, 4)] }
  ];

  /* Rooms: [id, x0, y0, x1, y1, door side N|S|E|W] */
  var ROOMS = [
    // Left wing · top band
    ["264D", 318, 110, 352, 150, "W"], ["264C", 318, 163, 352, 200, "W"],
    ["264B", 318, 205, 352, 240, "W"], ["264A", 318, 248, 352, 287, "W"],
    ["267B", 420, 148, 495, 205, "E"], ["267A", 420, 212, 495, 290, "S"],
    ["268", 505, 148, 630, 203, "W"], ["269", 505, 208, 630, 292, "S"],
    ["275", 640, 148, 705, 198, "W"], ["274", 645, 202, 705, 236, "W"], ["273", 645, 240, 705, 292, "W"],
    ["278B", 940, 225, 980, 258, "S"], ["279", 985, 255, 1025, 292, "S"],
    // Left wing · middle band
    ["262", 18, 332, 78, 380, "E"], ["261", 18, 415, 48, 458, "E"],
    ["260C", 100, 338, 128, 372, "W"], ["260B", 100, 383, 128, 415, "W"], ["260A", 100, 425, 128, 458, "W"],
    ["Tungabhadra", 132, 335, 195, 395, "N:0.2"], ["Teesta", 132, 398, 195, 458, "S:0.2"],
    ["265A", 199, 338, 226, 372, "E"], ["265B", 199, 383, 226, 415, "E"], ["259A", 199, 425, 226, 458, "E"],
    ["Narmada", 496, 335, 640, 430, "N:0.9"],
    ["256C", 505, 436, 535, 458, "S"], ["256B", 548, 436, 585, 458, "S"], ["256A", 592, 436, 628, 458, "S"],
    ["Umngot", 645, 335, 695, 395, "N:0.8"], ["Tapi", 645, 398, 695, 458, "S:0.8"],
    ["Vaigai", 698, 335, 748, 395, "N:0.2"], ["Spiti", 698, 398, 748, 458, "S:0.2"],
    ["Zuari", 970, 335, 1020, 395, "N:0.25"], ["Sarayu", 970, 398, 1020, 452, "S:0.25"],
    ["250A", 1024, 338, 1054, 372, "E"], ["250B", 1024, 383, 1054, 413, "E"], ["250C", 1024, 423, 1054, 453, "E"],
    // Left wing · bottom band
    ["258", 18, 495, 78, 570, "E"], ["258A", 18, 578, 48, 605, "E"],
    ["257A", 448, 500, 490, 532, "N"], ["257B", 448, 537, 490, 570, "W"],
    ["257C", 448, 576, 468, 605, "W"], ["254B", 471, 576, 490, 605, "E"],
    ["253A", 778, 500, 815, 535, "N"], ["253B", 778, 540, 815, 572, "E"], ["254A", 778, 578, 815, 605, "E"],
    // Central core
    ["205", 1215, 252, 1310, 295, "S"],
    ["211", 1495, 255, 1540, 292, "S"],
    ["Barak", 1378, 252, 1420, 294, "S"],
    ["Bharathappuzha", 1090, 330, 1195, 400, "E:0.85"], ["Sutlej", 1090, 402, 1185, 464, "W:0.15"],
    ["202", 1188, 425, 1223, 464, "E:0.25"],
    ["200", 1225, 330, 1305, 392, "S"],
    ["209", 1308, 430, 1340, 464, "W:0.3"],
    ["Godavari", 1332, 330, 1386, 390, "W:0.85"], ["207", 1386, 330, 1436, 390, "N:0.85"],
    ["Savitri", 1343, 392, 1436, 464, "E:0.15"],
    ["Brahmaputra", 1054, 466, 1265, 608, "N:0.1|N:0.87"], ["Alakananda", 1265, 466, 1475, 608, "N:0.15|N:0.9"],
    // Right wing · top band
    ["212B", 1595, 255, 1640, 292, "S"],
    ["215", 1840, 140, 1965, 188, "S"], ["216", 1840, 195, 1878, 245, "E"],
    ["217", 1840, 252, 1915, 292, "S"], ["221", 1925, 195, 1960, 292, "S"],
    ["224", 1972, 140, 2065, 200, "S"], ["223", 1972, 210, 2065, 292, "S"],
    ["222A", 2075, 140, 2110, 208, "S"], ["222", 2075, 215, 2110, 292, "S"],
    ["226D", 2203, 112, 2237, 150, "E"], ["226C", 2203, 163, 2237, 200, "E"],
    ["226B", 2203, 205, 2237, 240, "E"], ["226A", 2203, 248, 2237, 287, "E"],
    ["227A", 2470, 112, 2510, 150, "S"],
    // Right wing · middle band
    ["242", 1462, 335, 1492, 374, "W"], ["241", 1462, 383, 1492, 413, "W"], ["240A", 1462, 423, 1492, 453, "W"],
    ["Krishna", 1500, 335, 1575, 395, "N:0.85"], ["Ravi", 1500, 398, 1575, 455, "S:0.85"],
    ["Mahanadi", 1802, 335, 1852, 395, "N:0.8"], ["Purna", 1802, 398, 1852, 455, "S:0.8"],
    ["Mandovi", 1856, 335, 1906, 395, "N:0.2"], ["Penna", 1856, 398, 1906, 455, "S:0.2"],
    ["Kaveri", 1912, 332, 2052, 420, "N:0.1"],
    ["236C", 1912, 426, 1945, 455, "S"], ["236B", 1952, 426, 1988, 455, "S"], ["236A", 1995, 426, 2030, 455, "S"],
    ["225A", 2328, 338, 2358, 372, "W"], ["225B", 2328, 383, 2358, 413, "W"], ["233A", 2328, 428, 2358, 455, "W"],
    ["Periyar", 2364, 335, 2418, 395, "N:0.8"], ["Pavana", 2364, 398, 2418, 455, "S:0.8"],
    ["229A", 2422, 340, 2446, 372, "E"], ["229B", 2422, 383, 2446, 413, "E"], ["229C", 2422, 420, 2446, 450, "E"],
    ["230", 2470, 335, 2530, 395, "N"], ["231", 2470, 398, 2530, 455, "S"],
    ["232", 2540, 335, 2605, 395, "N"], ["232A", 2540, 398, 2605, 455, "S"],
    // Right wing · bottom band
    ["239A", 1710, 500, 1752, 532, "N"], ["239B", 1710, 537, 1752, 570, "W"],
    ["239C", 1710, 576, 1729, 605, "W"], ["235B", 1733, 576, 1752, 605, "E"],
    ["234A", 2064, 500, 2105, 532, "N"], ["234B", 2064, 537, 2105, 570, "E"],
    ["235A", 2064, 576, 2083, 605, "W"], ["235C", 2086, 576, 2105, 605, "E"],
    ["234C", 2460, 500, 2495, 535, "N"]
  ];

  /* Core fixtures and solid areas: [type, x0, y0, x1, y1, label] */
  var FIXTURES = [
    ["void", 10, 105, 92, 160],
    ["void", 355, 105, 735, 145],
    ["stair", 360, 148, 415, 290, "Stairs"],
    ["void", 705, 145, 735, 295],
    ["wc", 735, 140, 935, 295, "Restrooms"],
    ["void", 940, 105, 1040, 222],
    ["void", 985, 222, 1040, 252],
    ["void", 1040, 105, 1500, 140],
    ["stair", 1045, 148, 1098, 290, "Stairs"],
    ["lift", 1105, 140, 1425, 250, "Lifts"],
    ["other", 1112, 255, 1160, 292, "Luggage"],
    ["stair", 1432, 148, 1487, 290, "Stairs"],
    ["stair", 1250, 426, 1289, 464, "Stairs"],
    ["void", 1545, 105, 1585, 295],
    ["wc", 1585, 130, 1790, 250, "Restrooms"],
    ["wc", 1645, 250, 1790, 295],
    ["void", 1790, 105, 2200, 140],
    ["void", 1792, 140, 1836, 295],
    ["stair", 2125, 150, 2195, 290, "Stairs"],
    // Booth nooks open to one corridor only.
    ["wall", 78, 448, 100, 458],
    ["wall", 2446, 447, 2470, 455]
  ];

  function ranges(list) {
    var ids = [];
    list.forEach(function (r) {
      var n;
      for (n = r[1]; n <= r[2]; n++) ids.push(r[0] + "." + pad(n));
    });
    return ids;
  }

  function expectedInventory() {
    return {
      desks: ranges([
        ["264", 1, 36], ["266", 1, 40], ["277", 1, 35], ["257", 1, 44], ["254", 1, 34], ["253", 1, 28],
        ["213", 1, 35], ["225", 1, 40], ["226", 1, 36], ["227", 1, 7], ["234", 1, 44], ["235", 1, 35], ["239", 1, 28]
      ]),
      meetings: MEETINGS.slice(),
      small: ranges([["263", 1, 8]]).concat([
        "264A", "264B", "264C", "264D", "265A", "265B", "260A", "260B", "260C", "259A",
        "262", "261", "258", "258A", "267A", "267B", "268", "269", "273", "274", "275",
        "278B", "279", "256A", "256B", "256C", "257A", "257B", "257C", "254A", "254B",
        "253A", "253B", "250A", "250B", "250C", "202",
        "226A", "226B", "226C", "226D", "227A", "229A", "229B", "229C", "233A", "240A",
        "241", "242", "211", "212B", "215", "216", "217", "221", "222", "222A", "223", "224",
        "230", "231", "232", "232A", "234A", "234B", "234C", "235A", "235B", "235C",
        "239A", "239B", "239C", "225A", "225B", "236A", "236B", "236C", "207", "209", "205", "200"
      ])
    };
  }

  function diffIds(expected, actual) {
    var exp = {};
    var got = {};
    expected.forEach(function (id) { exp[id] = true; });
    actual.forEach(function (id) { got[id] = true; });
    return {
      missing: expected.filter(function (id) { return !got[id]; }),
      extra: actual.filter(function (id) { return !exp[id]; })
    };
  }

  function roomType(id, meetings) {
    if (meetings.indexOf(id) !== -1) return "meeting";
    if (/^\d{3}[A-Z]$/.test(id)) return "phone";
    return "service";
  }

  /* Side passages that exist on the reference plan even though no door faces them. */
  var OPEN_GAPS = [
    ["267A", "269"], ["267B", "269"], ["267A", "268"],
    ["217", "221"], ["221", "224"], ["221", "223"],
    ["223", "222"], ["224", "222A"], ["223", "222A"], ["224", "222"]
  ];
  var MAX_GAP = 13;

  function doorPoint(room, side, at) {
    var t = at == null ? 0.5 : at;
    if (side === "N") return { x: room.x + room.w * t, y: room.y - 3 };
    if (side === "S") return { x: room.x + room.w * t, y: room.y + room.h + 3 };
    if (side === "E") return { x: room.x + room.w + 3, y: room.y + room.h * t };
    return { x: room.x - 3, y: room.y + room.h * t };
  }

  function anyDoorFaces(a, b) {
    return (a.doorSpecs || []).some(function (spec) { return doorFaces(a, spec.side, spec.at, b); });
  }

  function doorFaces(a, side, at, b) {
    var p = doorPoint(a, side, at);
    if (side === "E") return b.x >= a.x + a.w && p.y > b.y && p.y < b.y + b.h;
    if (side === "W") return b.x + b.w <= a.x && p.y > b.y && p.y < b.y + b.h;
    if (side === "S") return b.y >= a.y + a.h && p.x > b.x && p.x < b.x + b.w;
    if (side === "N") return b.y + b.h <= a.y && p.x > b.x && p.x < b.x + b.w;
    return false;
  }

  /* Seals slits narrower than MAX_GAP between rooms, core, and desk clusters,
     unless a door opens into the slit or it is a listed side passage. */
  function closeGaps(rooms, fixtures, openGaps) {
    var open = {};
    openGaps.forEach(function (p) { open[p[0] + "|" + p[1]] = open[p[1] + "|" + p[0]] = true; });
    function inPod(r) { return r.type === "desk" || r.series === "263"; }
    var solids = rooms.filter(function (r) { return !inPod(r); }).concat(fixtures);
    var deskBlocks = {};
    rooms.forEach(function (r) {
      if (!inPod(r)) return;
      var col = deskBlocks[r.series + "|" + r.x];
      if (!col) {
        col = deskBlocks[r.series + "|" + r.x] = { id: r.series, desk: true, x: r.x, y: r.y, w: r.w, h: r.h };
      } else {
        var y1 = Math.max(col.y + col.h, r.y + r.h);
        col.y = Math.min(col.y, r.y);
        col.h = y1 - col.y;
      }
    });
    var items = solids.concat(Object.keys(deskBlocks).map(function (k) { return deskBlocks[k]; }));
    var walls = [];
    var sealed = {};
    var i;
    var j;
    for (i = 0; i < items.length; i++) {
      for (j = i + 1; j < items.length; j++) {
        var a = items[i];
        var b = items[j];
        if (a.desk && b.desk) continue;
        if (open[a.id + "|" + b.id]) continue;
        if (a.desk || b.desk) {
          var desk = a.desk ? a : b;
          var other = desk === a ? b : a;
          var lft = a.x < b.x ? a : b;
          var rgt = lft === a ? b : a;
          var sx = rgt.x - (lft.x + lft.w);
          var overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          var midBand = desk.y > 320 && desk.y + desk.h < 470;
          var key = (lft.x + lft.w) + "|" + (desk.y + desk.h);
          if (midBand && overlapY > 12 && sx > 0 && sx < MAX_GAP && !sealed[key] &&
              other.y + other.h >= desk.y + desk.h - 6) {
            sealed[key] = true;
            walls.push({ type: "wall", label: "", x: lft.x + lft.w, y: desk.y + desk.h - 6, w: sx, h: 6 });
          }
          continue;
        }
        if (anyDoorFaces(a, b) || anyDoorFaces(b, a)) continue;
        var oy0 = Math.max(a.y, b.y);
        var oy1 = Math.min(a.y + a.h, b.y + b.h);
        var ox0 = Math.max(a.x, b.x);
        var ox1 = Math.min(a.x + a.w, b.x + b.w);
        if (oy1 - oy0 > 0) {
          var left = a.x < b.x ? a : b;
          var right = left === a ? b : a;
          var gx = right.x - (left.x + left.w);
          if (gx > 0 && gx < MAX_GAP) walls.push({ type: "wall", label: "", x: left.x + left.w, y: oy0, w: gx, h: oy1 - oy0 });
        } else if (ox1 - ox0 > 0) {
          var upper = a.y < b.y ? a : b;
          var lower = upper === a ? b : a;
          var gy = lower.y - (upper.y + upper.h);
          if (gy > 0 && gy < MAX_GAP) walls.push({ type: "wall", label: "", x: ox0, y: upper.y + upper.h, w: ox1 - ox0, h: gy });
        }
      }
    }
    walls.forEach(function (w, k) { w.id = "wall" + k; });
    return walls;
  }

  function buildFloor(cfg) {
    var BUILDING = cfg.building || BUILDING_F2;
    var errors = [];
    var rooms = [];
    var groups = [];
    var fixtures = [];
    var leftSet = {};
    (cfg.leftRooms || []).forEach(function (id) { leftSet[id] = true; });

    cfg.pods.forEach(function (pod) {
      var minX = Infinity;
      var minY = Infinity;
      var maxX = -Infinity;
      var maxY = -Infinity;
      var count = 0;
      pod.cols.forEach(function (col, c) {
        (pod.ids[c] || []).forEach(function (num, r) {
          if (num == null) return;
          var row = pod.rows[r];
          var id = pod.series + "." + pad(num);
          rooms.push({
            id: id, label: id, type: pod.type || "desk", wing: pod.wing, series: pod.series,
            x: col[0], y: row[0], w: col[1] - col[0], h: row[1] - row[0],
            doorSpecs: [{ side: "A", at: 0.5 }], accent: pod.accent || ACCENTS[pod.series]
          });
          minX = Math.min(minX, col[0]);
          minY = Math.min(minY, row[0]);
          maxX = Math.max(maxX, col[1]);
          maxY = Math.max(maxY, row[1]);
          count += 1;
        });
      });
      groups.push({
        id: pod.series, label: pod.series, wing: pod.wing, count: count,
        x: minX - 3, y: minY - 3, w: maxX - minX + 6, h: maxY - minY + 6,
        accent: pod.accent || ACCENTS[pod.series] || "#78716c"
      });
    });

    cfg.rooms.forEach(function (r) {
      rooms.push({
        id: r[0], label: (cfg.labels || {})[r[0]] || r[0], type: roomType(r[0], cfg.meetings),
        wing: cfg.leftRooms ? (leftSet[r[0]] ? "left" : "right") : ((r[1] + r[3]) / 2 < 1090 ? "left" : "right"),
        series: r[0], floor: cfg.level,
        x: r[1], y: r[2], w: r[3] - r[1], h: r[4] - r[2],
        doorSpecs: r[5].split("|").map(function (s) {
          var parts = s.split(":");
          return { side: parts[0], at: parts.length > 1 ? parseFloat(parts[1]) : 0.5 };
        }),
        accent: null
      });
    });

    cfg.fixtures.forEach(function (f, i) {
      fixtures.push({ id: f[6] || "fx" + i, type: f[0], label: f[5] || "", x: f[1], y: f[2], w: f[3] - f[1], h: f[4] - f[2] });
    });

    fixtures = fixtures.concat(closeGaps(rooms, fixtures, cfg.openGaps || []));
    var obstacles = rooms.concat(fixtures);

    /* Spatial buckets for fast line-of-sight checks. */
    var BUCKET = 50;
    var bucketCount = Math.ceil(BUILDING.w / BUCKET) + 2;
    var buckets = [];
    var b;
    for (b = 0; b < bucketCount; b++) buckets.push([]);
    obstacles.forEach(function (o) {
      var b0 = Math.max(0, Math.floor((o.x - 2 - BUILDING.x) / BUCKET));
      var b1 = Math.min(bucketCount - 1, Math.floor((o.x + o.w + 2 - BUILDING.x) / BUCKET));
      for (b = b0; b <= b1; b++) buckets[b].push(o);
    });

    function pointClear(x, y, inflate) {
      if (x <= BUILDING.x + 1 || x >= BUILDING.x + BUILDING.w - 1) return false;
      if (y <= BUILDING.y + 1 || y >= BUILDING.y + BUILDING.h - 1) return false;
      var list = buckets[Math.floor((x - BUILDING.x) / BUCKET)] || [];
      var i;
      for (i = 0; i < list.length; i++) {
        var o = list[i];
        if (x > o.x - inflate && x < o.x + o.w + inflate && y > o.y - inflate && y < o.y + o.h + inflate) return false;
      }
      return true;
    }

    function lineClear(ax, ay, bx, by, inflate) {
      inflate = inflate || 0;
      var dx = bx - ax;
      var dy = by - ay;
      var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy)));
      var s;
      for (s = 0; s <= steps; s++) {
        if (!pointClear(ax + (dx * s) / steps, ay + (dy * s) / steps, inflate)) return false;
      }
      return true;
    }

    /* Walkable grid over the white space. */
    var cols = Math.floor(BUILDING.w / GRID);
    var rows = Math.floor(BUILDING.h / GRID);
    var total = cols * rows;
    var blocked = new Uint8Array(total);
    function cx(i) { return BUILDING.x + GRID / 2 + i * GRID; }
    function cy(j) { return BUILDING.y + GRID / 2 + j * GRID; }
    var i;
    var j;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var px = cx(i);
        var py = cy(j);
        if (px < BUILDING.x + WALL_CLEAR || px > BUILDING.x + BUILDING.w - WALL_CLEAR ||
            py < BUILDING.y + WALL_CLEAR || py > BUILDING.y + BUILDING.h - WALL_CLEAR) blocked[j * cols + i] = 1;
      }
    }
    obstacles.forEach(function (o) {
      var i0 = Math.max(0, Math.ceil((o.x - INFLATE - BUILDING.x - GRID / 2) / GRID));
      var i1 = Math.min(cols - 1, Math.floor((o.x + o.w + INFLATE - BUILDING.x - GRID / 2) / GRID));
      var j0 = Math.max(0, Math.ceil((o.y - INFLATE - BUILDING.y - GRID / 2) / GRID));
      var j1 = Math.min(rows - 1, Math.floor((o.y + o.h + INFLATE - BUILDING.y - GRID / 2) / GRID));
      var ii;
      var jj;
      for (jj = j0; jj <= j1; jj++) {
        for (ii = i0; ii <= i1; ii++) blocked[jj * cols + ii] = 1;
      }
    });

    function free(ii, jj) {
      return ii >= 0 && jj >= 0 && ii < cols && jj < rows && !blocked[jj * cols + ii];
    }

    /* Keep the largest connected walkable area. */
    var label = new Int32Array(total).fill(-1);
    var queue = new Int32Array(total);
    var bestLabel = -1;
    var bestSize = 0;
    var nextLabel = 0;
    var k;
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (k = 0; k < total; k++) {
      if (blocked[k] || label[k] !== -1) continue;
      var head = 0;
      var tail = 0;
      queue[tail++] = k;
      label[k] = nextLabel;
      while (head < tail) {
        var cur = queue[head++];
        var ci = cur % cols;
        var cj = (cur - ci) / cols;
        var d;
        for (d = 0; d < 8; d++) {
          var ni = ci + DIRS[d][0];
          var nj = cj + DIRS[d][1];
          if (!free(ni, nj)) continue;
          if (DIRS[d][0] && DIRS[d][1] && (!free(ci + DIRS[d][0], cj) || !free(ci, cj + DIRS[d][1]))) continue;
          var nk = nj * cols + ni;
          if (label[nk] !== -1) continue;
          label[nk] = nextLabel;
          queue[tail++] = nk;
        }
      }
      if (tail > bestSize) {
        bestSize = tail;
        bestLabel = nextLabel;
      }
      nextLabel += 1;
    }

    var main = new Uint8Array(total);
    var nodeOf = new Int32Array(total).fill(-1);
    var corridorNodes = [];
    for (k = 0; k < total; k++) {
      if (label[k] !== bestLabel) continue;
      main[k] = 1;
      var ki = k % cols;
      nodeOf[k] = corridorNodes.length;
      corridorNodes.push({ id: "n" + corridorNodes.length, x: cx(ki), y: cy((k - ki) / cols) });
    }

    var corridorEdges = [];
    function isMain(ii, jj) {
      return ii >= 0 && jj >= 0 && ii < cols && jj < rows && main[jj * cols + ii] === 1;
    }
    for (k = 0; k < total; k++) {
      if (!main[k]) continue;
      var ei = k % cols;
      var ej = (k - ei) / cols;
      var from = "n" + nodeOf[k];
      if (isMain(ei + 1, ej)) corridorEdges.push({ from: from, to: "n" + nodeOf[k + 1] });
      if (isMain(ei, ej + 1)) corridorEdges.push({ from: from, to: "n" + nodeOf[k + cols] });
      if (isMain(ei + 1, ej + 1) && isMain(ei + 1, ej) && isMain(ei, ej + 1)) {
        corridorEdges.push({ from: from, to: "n" + nodeOf[k + cols + 1] });
      }
      if (isMain(ei - 1, ej + 1) && isMain(ei - 1, ej) && isMain(ei, ej + 1)) {
        corridorEdges.push({ from: from, to: "n" + nodeOf[k + cols - 1] });
      }
    }

    /* Attach every room to the corridor through one door node. */
    var sidePoint = doorPoint;

    function nearestNode(p) {
      var pi = Math.round((p.x - BUILDING.x - GRID / 2) / GRID);
      var pj = Math.round((p.y - BUILDING.y - GRID / 2) / GRID);
      var cand = [];
      var di;
      var dj;
      for (dj = -8; dj <= 8; dj++) {
        for (di = -8; di <= 8; di++) {
          var ii = pi + di;
          var jj = pj + dj;
          if (!isMain(ii, jj)) continue;
          var nx = cx(ii);
          var ny = cy(jj);
          cand.push({ node: nodeOf[jj * cols + ii], x: nx, y: ny, d: Math.hypot(nx - p.x, ny - p.y) });
        }
      }
      cand.sort(function (a, c) { return a.d - c.d; });
      var q;
      for (q = 0; q < cand.length; q++) {
        if (lineClear(p.x, p.y, cand[q].x, cand[q].y, 0)) return cand[q];
      }
      return null;
    }

    function findDoor(room, spec) {
      var sides = spec.side === "A" ? ["N", "S", "E", "W"] : [spec.side];
      var best = null;
      sides.forEach(function (s) {
        var p = sidePoint(room, s, spec.at);
        if (!pointClear(p.x, p.y, 0)) return;
        var hit = nearestNode(p);
        if (hit && (!best || hit.d < best.d)) best = { node: "n" + hit.node, d: hit.d, point: p, side: s };
      });
      return best;
    }

    rooms.forEach(function (room) {
      room.doors = [];
      room.doorSpecs.forEach(function (spec) {
        var door = findDoor(room, spec);
        if (!door && spec.side !== "A") {
          errors.push("Door " + spec.side + " of " + room.id + " opens onto no walkway");
          door = findDoor(room, { side: "A", at: 0.5 });
        }
        if (door) room.doors.push({ node: door.node, point: door.point, side: door.side });
      });
      if (!room.doors.length) {
        errors.push("No corridor access for " + room.id);
        room.doors.push({ node: null, point: { x: room.x + room.w / 2, y: room.y + room.h / 2 }, side: "N" });
      }
      room.doorNode = room.doors[0].node;
      room.doorPoint = room.doors[0].point;
      room.doorSide = room.doors[0].side;
      delete room.doorSpecs;
      room.youAreHere = room.id === cfg.youAreHere;
      room.floor = cfg.level;
      room.key = cfg.level + ":" + room.id;
    });

    /* Validation against the authoritative inventory. */
    var seen = {};
    var byType = { desk: [], meeting: [], phone: [], service: [] };
    rooms.forEach(function (r) {
      if (seen[r.id]) errors.push("Duplicate id " + r.id);
      seen[r.id] = true;
      byType[r.type].push(r.id);
      if (r.x < BUILDING.x || r.y < BUILDING.y || r.x + r.w > BUILDING.x + BUILDING.w || r.y + r.h > BUILDING.y + BUILDING.h) {
        errors.push(r.id + " sits outside the building outline");
      }
    });
    var expected = cfg.inventory ? cfg.inventory() : null;
    var smallActual = byType.phone.concat(byType.service);
    function report(name, diff) {
      if (diff.missing.length) errors.push(name + " missing: " + diff.missing.slice(0, 12).join(", "));
      if (diff.extra.length) errors.push(name + " unexpected: " + diff.extra.slice(0, 12).join(", "));
    }
    if (expected) {
      report("Desks", diffIds(expected.desks, byType.desk));
      report("Meetings", diffIds(expected.meetings, byType.meeting));
      report("Small rooms", diffIds(expected.small, smallActual));
    }

    function overlap(a, c) {
      return a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;
    }
    var a;
    for (a = 0; a < rooms.length && errors.length < 40; a++) {
      var c;
      for (c = a + 1; c < rooms.length; c++) {
        if (overlap(rooms[a], rooms[c])) errors.push("Overlap " + rooms[a].id + " and " + rooms[c].id);
      }
      for (c = 0; c < fixtures.length; c++) {
        if (overlap(rooms[a], fixtures[c])) errors.push("Overlap " + rooms[a].id + " and core " + (fixtures[c].label || "wall"));
      }
    }

    var roomById = {};
    rooms.forEach(function (r) { roomById[r.id] = r; });

    var typeRank = { meeting: 0, service: 1, phone: 2, desk: 3 };
    var directory = rooms.map(function (r) {
      return {
        id: r.id, key: r.key, floor: cfg.level, label: r.label, type: r.type, wing: r.wing, series: r.series,
        youAreHere: r.youAreHere,
        hay: (r.label + " " + r.type + " " + r.wing + " " + r.series + " floor " + cfg.level).toLowerCase()
      };
    }).sort(function (p, q) {
      if (typeRank[p.type] !== typeRank[q.type]) return typeRank[p.type] - typeRank[q.type];
      return p.label.localeCompare(q.label, "en", { numeric: true, sensitivity: "base" });
    });

    var counts = {
      desks: byType.desk.length,
      meetings: byType.meeting.length,
      phones: byType.phone.length,
      service: byType.service.length,
      small: smallActual.length,
      nodes: corridorNodes.length,
      edges: corridorEdges.length
    };

    var top = BUILDING.y;
    var height = BUILDING.h;
    return {
      floor: "Pune – Floor " + cfg.level,
      level: cfg.level,
      checked: !!cfg.inventory,
      width: BUILDING.x + BUILDING.w,
      height: BUILDING.y + BUILDING.h,
      building: BUILDING,
      plate: { x: BUILDING.x - 30, y: BUILDING.y - 40, w: BUILDING.w + 60, h: BUILDING.h + 70 },
      metersPerUnit: METERS_PER_UNIT,
      youAreHere: cfg.youAreHere || null,
      rooms: rooms,
      roomById: roomById,
      corridorNodes: corridorNodes,
      corridorEdges: corridorEdges,
      fixtures: fixtures,
      groups: groups,
      grid: { x0: BUILDING.x, y0: BUILDING.y, size: GRID, cols: cols, rows: rows, main: main },
      lineClear: lineClear,
      regions: {
        left: { id: "left", label: "Left wing", x: BUILDING.x, y: top, w: 1035, h: height },
        core: { id: "core", label: "Core", x: 1040, y: top, w: 455, h: height },
        right: { id: "right", label: "Right wing", x: 1495, y: top, w: BUILDING.x + BUILDING.w - 1495, h: height }
      },
      directory: directory,
      validation: {
        ok: errors.length === 0,
        errors: errors.slice(0, 30),
        counts: counts,
        summary: counts.desks + " desks, " + counts.meetings + " meetings, " + counts.small + " small rooms, " +
          counts.nodes + " walkable points"
      }
    };
  }

  var FLOOR2 = {
    level: 2, pods: PODS, rooms: ROOMS, fixtures: FIXTURES, openGaps: OPEN_GAPS,
    meetings: MEETINGS, leftRooms: LEFT_ROOMS, labels: LABELS,
    inventory: expectedInventory, youAreHere: "277.17"
  };

  /* Floor 1 shares the building shell and desk-pod geometry with Floor 2.
     Rooms whose label is unreadable on the Floor 1 plan are kept as unnamed rooms. */
  var F1_SERIES = {
    "257": "159", "254": "157", "253": "154", "266": "171", "277": "183", "213": "108",
    "225": "119", "226": "120", "227": "121", "239": "134", "235": "130", "234": "129"
  };

  var F1_RENAME = {
    "262": "164A", "261": "163A", "260C": "162C", "260B": "162B", "260A": "162A",
    "265A": "171A", "265B": "171B", "259A": "161A", "Tungabhadra": "Parvati",
    "Narmada": "176", "256C": "158C", "256B": "158B", "256A": "158A",
    "Umngot": "Pamba", "Vaigai": "Sharda", "Spiti": "Meghna",
    "250A": "150A", "250B": "150B", "250C": "150C",
    "258": "160", "258A": "160A", "257A": "159A", "257B": "159B", "257C": "159C", "254B": "159D",
    "253A": "154A", "253B": "154B", "254A": "157A",
    "205": "103", "211": "106", "212B": "107B",
    "Bharathappuzha": "Mahi", "Sutlej": "Mahananda", "200": "100", "Godavari": "Luni", "Savitri": "Kabini",
    "242": "137", "241": "136", "240A": "135A", "Krishna": "Achankovil",
    "Mahanadi": "Bhima", "Mandovi": "Beas", "Penna": "Jhelum", "Kaveri": "Kosi",
    "236C": "131C", "236B": "131B", "236A": "131A",
    "225A": "119A", "225B": "119B", "233A": "128A", "Pavana": "Indus",
    "229A": "123A", "229B": "123B", "229C": "123C",
    "215": "110", "216": "111", "217": "112", "221": "116",
    "224": "Reflection & Wellbeing", "223": "Prayer Room",
    "226D": "120D", "226C": "120C", "226B": "120B", "226A": "120A",
    "239A": "134A", "239B": "134B",
    "Teesta": "Padma", "Tapi": "Netravati", "Ravi": "Kuppam", "Purna": "Koyna", "Periyar": "Chenab",
    "278B": "184B", "279": "185", "Zuari": "Sabarmati", "Sarayu": "Manjra",
    
    "227A": "121A",
    "239C": "130B", "234A": "129A", "234B": "129B", "235A": "130A", "235C": "129C"
  };

  var F1_DROP = [
    "264A", "264B", "264C", "264D", "267A", "267B", "268", "269", "273", "274", "275",
    "Brahmaputra", "Alakananda", "Barak", "200", "202", "207", "209", "222", "222A", "235B",
    "230", "231", "232", "232A", "234C"
  ];

  var F1_ROOMS_ADDED = [
    ["165D", 18, 112, 72, 155, "S:0.5"],
    ["165C", 44, 162, 72, 198, "W"], ["165B", 44, 202, 72, 240, "W"], ["165A", 44, 244, 72, 283, "W"],
    ["Ganga", 76, 110, 207, 250, "S:0.05"], ["Yamuna", 207, 110, 348, 250, "S:0.85"],
    ["167", 107, 254, 188, 292, "S"], ["169A", 220, 258, 238, 288, "S"], ["169", 243, 256, 305, 292, "S"],
    ["172B", 420, 148, 490, 226, "S"], ["175", 491, 148, 610, 203, "S:0.06"],
    ["181", 613, 148, 682, 172, "E"], ["180", 613, 175, 682, 244, "E"], ["179", 613, 247, 682, 292, "E"],
    ["172A", 420, 247, 470, 292, "S"], ["173", 506, 205, 555, 292, "S"], ["174", 555, 205, 610, 292, "S"],
    ["101", 1054, 466, 1475, 608, "N:0.05|N:0.44|N:0.58|N:0.95"],
    ["102", 1112, 255, 1160, 292, "S"],
    ["100", 1230, 333, 1270, 348, "S"],
    ["Large Tea Point / Repro", 2072, 140, 2112, 292, "S:0.85"],
    ["Damodar", 2470, 334, 2530, 372, "W"], ["Gomti", 2470, 376, 2530, 416, "W"], ["Hooghly", 2470, 420, 2530, 458, "W"],
    ["127", 2478, 498, 2530, 584, "W"], ["127A", 2478, 588, 2530, 607, "W"]
  ];

  var F1_MEETINGS = [
    "Ganga", "Yamuna", "Parvati", "Padma", "Pamba", "Sharda", "Netravati", "Meghna", "Sabarmati", "Manjra", "Kuppam", "Koyna", "Chenab", "Damodar", "Gomti", "Hooghly", "Mahi", "Mahananda", "Luni", "Kabini",
    "Achankovil", "Bhima", "Beas", "Jhelum", "Kosi", "Indus"
  ];

  function deriveFloor1() {
    var pods = [];
    PODS.forEach(function (pod) {
      if (pod.series === "263" || pod.series === "264") return;
      var accent = ACCENTS[pod.series];
      var ids = pod.series === "235" ? pod.ids.slice(0, 8).concat([[1, 2]]) :
        pod.series === "227" ? [[2, 3, 6, 7], [1, 4, 5, 8]] : pod.ids;
      pods.push({ series: F1_SERIES[pod.series], wing: pod.wing, type: pod.type, cols: pod.cols, rows: pod.rows, ids: ids, accent: accent });
    });

    var rooms = [];
    var fixtures = FIXTURES.filter(function (f) {
      return !(f[1] === 10 && f[2] === 105) && f[5] !== "Luggage" && !(f[1] === 1250 && f[2] === 426) && f[1] < 2536;
    });
    fixtures.push(["other", 1378, 252, 1420, 294, "Luggage room"]);
    fixtures.push(["stair", 190, 254, 205, 292, ""]);
    ROOMS.forEach(function (r) {
      if (F1_DROP.indexOf(r[0]) !== -1) return;
      var name = F1_RENAME[r[0]];
      if (name) rooms.push([name].concat(r.slice(1)));
      else fixtures.push(["room", r[1], r[2], r[3], r[4], "", "u:" + r[0]]);
    });
    rooms = rooms.concat(F1_ROOMS_ADDED);

    var openGaps = OPEN_GAPS.map(function (pair) {
      return pair.map(function (id) { return F1_RENAME[id] || "u:" + id; });
    });

    return {
      level: 1, building: { x: 10, y: 105, w: 2530, h: 507 }, pods: pods, rooms: rooms, fixtures: fixtures, openGaps: openGaps,
      meetings: F1_MEETINGS, leftRooms: null, labels: { "100": "100 Reception", "101": "101 Kitchen / Break Area", "103": "103 Pantry" },
      inventory: null, youAreHere: null
    };
  }

  var floor2 = buildFloor(FLOOR2);
  var floor1 = buildFloor(deriveFloor1());
  var g = typeof globalThis !== "undefined" ? globalThis : this;
  g.FLOORS = { 1: floor1, 2: floor2 };
  /* Add a city by building its floors with buildFloor and registering it here. */
  g.CITIES = g.CITIES || {};
  g.CITIES.pune = {
    id: "pune", name: "Pune", note: "Floors 1 and 2",
    floors: g.FLOORS, defaultFloor: 2,
    here: { key: "2:277.17", label: "277.17 · Floor 2" },
    testPairs: {
      1: [["159.44", "Kosi"], ["Ganga", "134.28"], ["183.17", "Mahi"], ["165C", "121.07"], ["101", "110"]],
      2: null
    }
  };
  return floor2;
});
