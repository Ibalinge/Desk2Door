/*
 * Pune · Floors 1 and 2 — digital floor plan data.
 *
 * Coordinates are in plan units measured from the reference plan sections
 * (left wing, core, right wing on one shared grid). Desk numbering inside each
 * pod follows the serpentine order printed on the reference plan.
 * Floor 1 is derived from Floor 2: same shell and desk pods, its own room names.
 */
(function () {
  "use strict";

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  if (!g.DeskFloor) return;
  var buildFloor = g.DeskFloor.buildFloor;
  var pad = g.DeskFloor.pad;

  var BUILDING_F2 = { x: 10, y: 105, w: 2530, h: 507 };

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
      rows: MID_ROWS,
      ids: [[1, 2, 3, null, 5], seq(10, 6), seq(11, 15), seq(20, 16), [21, 22, 23], seq(30, 26), seq(31, 35), seq(40, 36)],
      f1ids: MID_IDS_8 },
    { series: "226", wing: "right",
      cols: [[2276, 2300], [2300, 2324], [2334, 2358], [2366, 2390], [2390, 2414], [2424, 2448]],
      rows: TOP_ROWS_RIGHT,
      ids: [seq(6, 1), seq(7, 12), [18, null, 16, 15, 14], seq(19, 24), seq(30, 25), seq(31, 36)],
      f1ids: TOP_BLOCK_IDS },
    { series: "227", wing: "right",
      cols: [[2476, 2500], [2500, 2524]],
      rows: [[160, 184], [184, 208], [225, 249], [249, 273]],
      ids: [[2, 3, 6, 7], [1, 4, 5, 8]] },
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
      ids: [seq(41, 44), seq(40, 37), [33, 34, null, 36], seq(32, 29), seq(25, 28), seq(24, 21), seq(17, 20),
        [16, 15, null, 13], seq(9, 12), seq(8, 5), seq(1, 4)],
      f1ids: [seq(41, 44), seq(40, 37), seq(33, 36), seq(32, 29), seq(25, 28), seq(24, 21), seq(17, 20),
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
    ["222A", 2095, 140, 2137, 208, "W:0.7"], ["222", 2095, 215, 2137, 292, "W:0.4"],
    ["226D", 2222, 112, 2252, 150, "E:0.3"], ["226C", 2222, 163, 2252, 200, "E"],
    ["226B", 2222, 205, 2252, 240, "E"], ["226A", 2222, 248, 2252, 287, "E"],
    ["227A", 2470, 112, 2510, 150, "S:0.15"],
    // Right wing · middle band
    ["242", 1462, 335, 1492, 374, "W"], ["241", 1462, 383, 1492, 413, "W"], ["240A", 1462, 423, 1492, 453, "W"],
    ["Krishna", 1500, 335, 1575, 395, "N:0.85"], ["Ravi", 1500, 398, 1575, 455, "S:0.85"],
    ["Mahanadi", 1802, 335, 1852, 395, "N:0.8"], ["Purna", 1802, 398, 1852, 455, "S:0.8"],
    ["Mandovi", 1856, 335, 1906, 395, "N:0.2"], ["Penna", 1856, 398, 1906, 455, "S:0.2"],
    ["Kaveri", 1912, 332, 2052, 420, "N:0.1"],
    ["236C", 1912, 426, 1945, 455, "S"], ["236B", 1952, 426, 1988, 455, "S"], ["236A", 1995, 426, 2030, 455, "S"],
    ["225A", 2338, 336, 2367, 372, "W"], ["225B", 2338, 376, 2367, 413, "W"], ["233A", 2346, 432, 2367, 456, "S"],
    ["Periyar", 2370, 333, 2418, 394, "N:0.8"], ["Pavana", 2370, 397, 2418, 456, "S:0.8"],
    ["229A", 2422, 336, 2448, 372, "E"], ["229B", 2422, 376, 2448, 413, "E"], ["229C", 2422, 417, 2448, 450, "E"],
    // East wall column: 230 and 232 are open 4-seat booths, 231 a small room, 232A a lounge corner.
    ["230", 2470, 338, 2530, 394, "N|S"], ["231", 2488, 418, 2528, 455, "S"],
    ["232", 2470, 488, 2530, 540, "N|S"], ["232A", 2470, 564, 2530, 605, "N"],
    // Right wing · bottom band
    ["239A", 1710, 500, 1752, 532, "N"], ["239B", 1710, 537, 1752, 570, "W"],
    ["239C", 1710, 576, 1729, 605, "W"], ["235B", 1733, 576, 1752, 605, "E"],
    ["234A", 2064, 500, 2105, 532, "N"], ["234B", 2064, 537, 2105, 570, "E"],
    ["235A", 2064, 576, 2083, 605, "W"], ["234C", 2086, 576, 2105, 605, "E"]
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
    ["stair", 2140, 150, 2218, 290, "Stairs"],
    // Booth nooks open to one corridor only.
    ["wall", 78, 448, 100, 458]
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
        ["213", 1, 35], ["225", 1, 40], ["226", 1, 36], ["227", 1, 8], ["234", 1, 44], ["235", 1, 35], ["239", 1, 28]
      ]).filter(function (id) {
        return ["225.04", "225.24", "225.25", "226.13", "226.17", "234.14", "234.35"].indexOf(id) === -1;
      }),
      meetings: MEETINGS.slice(),
      small: ranges([["263", 1, 8]]).concat([
        "264A", "264B", "264C", "264D", "265A", "265B", "260A", "260B", "260C", "259A",
        "262", "261", "258", "258A", "267A", "267B", "268", "269", "273", "274", "275",
        "278B", "279", "256A", "256B", "256C", "257A", "257B", "257C", "254A", "254B",
        "253A", "253B", "250A", "250B", "250C", "202",
        "226A", "226B", "226C", "226D", "227A", "229A", "229B", "229C", "233A", "240A",
        "241", "242", "211", "212B", "215", "216", "217", "221", "222", "222A", "223", "224",
        "230", "231", "232", "232A", "234A", "234B", "234C", "235A", "235B",
        "239A", "239B", "239C", "225A", "225B", "236A", "236B", "236C", "207", "209", "205", "200"
      ])
    };
  }


  /* Side passages that exist on the reference plan even though no door faces them. */
  var OPEN_GAPS = [
    ["267A", "269"], ["267B", "269"], ["267A", "268"],
    ["217", "221"], ["221", "224"], ["221", "223"],
    ["223", "222"], ["224", "222A"], ["223", "222A"], ["224", "222"]
  ];

  var FLOOR2 = {
    level: 2, cityName: "Pune", building: BUILDING_F2,
    pods: PODS.map(function (pod) { return Object.assign({ accent: ACCENTS[pod.series] }, pod); }),
    rooms: ROOMS, fixtures: FIXTURES, openGaps: OPEN_GAPS,
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
    "239C": "130B", "234A": "129A", "234B": "129B", "235A": "130A", "234C": "129C"
  };

  var F1_DROP = [
    "264A", "264B", "264C", "264D", "267A", "267B", "268", "269", "273", "274", "275",
    "Brahmaputra", "Alakananda", "Barak", "200", "202", "207", "209", "222", "222A", "235B",
    "230", "231", "232", "232A"
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
        pod.f1ids || pod.ids;
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
      level: 1, cityName: "Pune", building: BUILDING_F2, pods: pods, rooms: rooms, fixtures: fixtures, openGaps: openGaps,
      meetings: F1_MEETINGS, leftRooms: null, labels: { "100": "100 Reception", "101": "101 Kitchen / Break Area", "103": "103 Pantry" },
      inventory: null, youAreHere: null
    };
  }

  var floor2 = buildFloor(FLOOR2);
  var floor1 = buildFloor(deriveFloor1());
  g.CITIES = g.CITIES || {};
  g.CITIES.pune = {
    id: "pune", name: "Pune", note: "Floors 1 and 2",
    floors: { 1: floor1, 2: floor2 }, defaultFloor: 2,
    here: { key: "2:277.17", label: "277.17 · Floor 2" },
    testPairs: {
      1: [["159.44", "Kosi"], ["Ganga", "134.28"], ["183.17", "Mahi"], ["165C", "121.07"], ["101", "110"]],
      2: null
    }
  };
})();
