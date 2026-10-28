/*
 * Floor engine shared by every city.
 *
 * buildFloor(cfg) turns a city's pods, rooms and fixtures into a walkable floor:
 * it seals wall slits, lays a fine corridor grid over the white space, wires doors
 * into it and validates the result. City data lives in its own file
 * (puneData.js, chennaiData.js, pleasantonData.js, ...), loaded after this one.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  root.FLOOR_DATA = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var GRID = 4;
  var INFLATE = 0.4;
  var WALL_CLEAR = 12;
  var METERS_PER_UNIT = 0.065;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
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

  function roomType(id, meetings, types) {
    if (types && types[id]) return types[id];
    if (meetings.indexOf(id) !== -1) return "meeting";
    if (/^\d{3}[A-Z]$/.test(id)) return "phone";
    return "service";
  }

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
  function closeGaps(rooms, fixtures, openGaps, band) {
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
          var midBand = !!band && desk.y > band[0] && desk.y + desk.h < band[1];
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
    var BUILDING = cfg.building;
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
          var id = typeof num === "string" ? num : pod.series + "." + pad(num);
          rooms.push({
            id: id, label: id, type: pod.type || "desk", wing: pod.wing, series: pod.series,
            x: col[0], y: row[0], w: col[1] - col[0], h: row[1] - row[0],
            doorSpecs: [{ side: "A", at: 0.5 }], accent: pod.accent
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
        accent: pod.accent || "#78716c"
      });
    });

    cfg.rooms.forEach(function (r) {
      rooms.push({
        id: r[0], label: (cfg.labels || {})[r[0]] || r[0], type: roomType(r[0], cfg.meetings, cfg.types),
        wing: cfg.leftRooms ? (leftSet[r[0]] ? "left" : "right") : ((r[1] + r[3]) / 2 < (cfg.wingSplit || 1090) ? "left" : "right"),
        series: r[0], floor: cfg.level,
        x: r[1], y: r[2], w: r[3] - r[1], h: r[4] - r[2],
        doorSpecs: r[5].split("|").map(function (s) {
          var host = s.split(">");
          var parts = host[0].split(":");
          return { side: parts[0], at: parts.length > 1 ? parseFloat(parts[1]) : 0.5, via: host[1] || null };
        }),
        accent: null
      });
    });

    cfg.fixtures.forEach(function (f, i) {
      fixtures.push({ id: f[6] || "fx" + i, type: f[0], label: f[5] || "", x: f[1], y: f[2], w: f[3] - f[1], h: f[4] - f[2],
        poly: f[7] || null });
    });

    /* Zones are shaded open areas (open collaboration, cafe floor); people walk through them. */
    var solid = fixtures.filter(function (f) { return f.type !== "zone" && f.type !== "door"; });
    var added = closeGaps(rooms, solid, cfg.openGaps || [], cfg.midBand === undefined ? [320, 470] : cfg.midBand);
    fixtures = fixtures.concat(added);
    var obstacles = rooms.concat(solid, added);

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
    var OUTLINE = BUILDING.outline || null;
    function inOutline(x, y) {
      var inside = false;
      for (var a = 0, b = OUTLINE.length - 1; a < OUTLINE.length; b = a++) {
        var xa = OUTLINE[a][0], ya = OUTLINE[a][1], xb = OUTLINE[b][0], yb = OUTLINE[b][1];
        if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) inside = !inside;
      }
      return inside;
    }
    var i;
    var j;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var px = cx(i);
        var py = cy(j);
        if (px < BUILDING.x + WALL_CLEAR || px > BUILDING.x + BUILDING.w - WALL_CLEAR ||
            py < BUILDING.y + WALL_CLEAR || py > BUILDING.y + BUILDING.h - WALL_CLEAR) blocked[j * cols + i] = 1;
        else if (OUTLINE && !(inOutline(px - WALL_CLEAR, py) && inOutline(px + WALL_CLEAR, py) &&
            inOutline(px, py - WALL_CLEAR) && inOutline(px, py + WALL_CLEAR))) blocked[j * cols + i] = 1;
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

    /* A door with a host room ("N:0.2>202") opens into that room; routes pass through the host's own door. */
    var hostOf = {};
    rooms.forEach(function (room) { hostOf[room.id] = room; });
    rooms.sort(function (a, c) {
      return (a.doorSpecs.some(function (s) { return s.via; }) ? 1 : 0) - (c.doorSpecs.some(function (s) { return s.via; }) ? 1 : 0);
    });
    rooms.forEach(function (room) {
      room.doors = [];
      room.doorSpecs.forEach(function (spec) {
        if (spec.via) {
          var host = hostOf[spec.via];
          if (!host || !host.doors || !host.doors.length || !host.doors[0].node) {
            errors.push("Door " + spec.side + " of " + room.id + " opens into unknown room " + spec.via);
            return;
          }
          host.doors.forEach(function (hd) {
            room.doors.push({ node: hd.node, point: sidePoint(room, spec.side, spec.at), side: spec.side, via: hd.point, host: host.id });
          });
          return;
        }
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
        if (fixtures[c].type !== "zone" && fixtures[c].type !== "door" && overlap(rooms[a], fixtures[c])) errors.push("Overlap " + rooms[a].id + " and core " + (fixtures[c].label || "wall"));
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
      floor: (cfg.cityName || "Office") + " – Floor " + cfg.level,
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
      regions: cfg.regions || {
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

  var g = typeof globalThis !== "undefined" ? globalThis : this;
  g.DeskFloor = { buildFloor: buildFloor, pad: pad };
  g.CITIES = g.CITIES || {};
  /* Campus cities: each building adds its floors (keyed by floor number) to one city.
     Floor levels must be unique across the campus; floorNo is the number people see. */
  g.addBuilding = function (cityId, cityName, building, floorsByNo, testPairs) {
    var c = g.CITIES[cityId] || (g.CITIES[cityId] = {
      id: cityId, name: cityName, floors: {}, buildings: [], testPairs: {}, defaultFloor: null, here: null
    });
    var levels = [];
    Object.keys(floorsByNo).forEach(function (no) {
      var f = floorsByNo[no];
      f.buildingId = building;
      f.floorNo = Number(no);
      f.floor = f.floor.replace(/Floor \d+$/, "Floor " + no);
      f.directory.forEach(function (d) { d.hay = d.hay.replace(/floor \d+$/, "floor " + no) + " building " + building; });
      c.floors[f.level] = f;
      c.testPairs[f.level] = testPairs ? testPairs[no] : undefined;
      levels.push(f.level);
    });
    var entry = c.buildings.filter(function (b) { return b.id === building; })[0];
    if (entry) entry.levels = entry.levels.concat(levels);
    else c.buildings.push({ id: building, name: "Building " + building, levels: levels });
    if (c.defaultFloor == null) c.defaultFloor = levels[0];
    c.note = "USA · " + c.buildings.map(function (b) { return b.id; }).join(", ");
  };
  return g.DeskFloor;
});
