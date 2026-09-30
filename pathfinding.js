/*
 * A* over the corridor graph.
 * Routes visit corridor nodes only. Rooms attach through doorNode.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  root.Pathfinding = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var STEP_METERS = 0.75;

  function MinHeap() {
    this.ids = [];
    this.pri = [];
  }

  MinHeap.prototype.push = function (id, priority) {
    var ids = this.ids;
    var pri = this.pri;
    var i = ids.length;
    ids.push(id);
    pri.push(priority);
    while (i > 0) {
      var parent = (i - 1) >> 1;
      if (pri[parent] <= pri[i]) break;
      var t = ids[parent]; ids[parent] = ids[i]; ids[i] = t;
      t = pri[parent]; pri[parent] = pri[i]; pri[i] = t;
      i = parent;
    }
  };

  MinHeap.prototype.pop = function () {
    var ids = this.ids;
    var pri = this.pri;
    var top = ids[0];
    var lastId = ids.pop();
    var lastPri = pri.pop();
    if (ids.length) {
      ids[0] = lastId;
      pri[0] = lastPri;
      var i = 0;
      var n = ids.length;
      while (true) {
        var l = i * 2 + 1;
        var r = l + 1;
        var m = i;
        if (l < n && pri[l] < pri[m]) m = l;
        if (r < n && pri[r] < pri[m]) m = r;
        if (m === i) break;
        var t = ids[m]; ids[m] = ids[i]; ids[i] = t;
        t = pri[m]; pri[m] = pri[i]; pri[i] = t;
        i = m;
      }
    }
    return top;
  };

  function create(floor) {
    var nodes = floor.corridorNodes;
    var n = nodes.length;
    var index = {};
    var xs = new Float64Array(n);
    var ys = new Float64Array(n);
    nodes.forEach(function (node, i) {
      index[node.id] = i;
      xs[i] = node.x;
      ys[i] = node.y;
    });

    var degree = new Int32Array(n + 1);
    var pairs = [];
    floor.corridorEdges.forEach(function (edge) {
      var a = index[edge.from];
      var b = index[edge.to];
      if (a == null || b == null) return;
      pairs.push(a, b);
      degree[a] += 1;
      degree[b] += 1;
    });
    var offset = new Int32Array(n + 1);
    var i;
    for (i = 0; i < n; i++) offset[i + 1] = offset[i] + degree[i];
    var cursor = offset.slice(0, n);
    var nbr = new Int32Array(offset[n]);
    var wt = new Float64Array(offset[n]);
    for (i = 0; i < pairs.length; i += 2) {
      var a = pairs[i];
      var b = pairs[i + 1];
      var w = Math.hypot(xs[a] - xs[b], ys[a] - ys[b]);
      nbr[cursor[a]] = b; wt[cursor[a]++] = w;
      nbr[cursor[b]] = a; wt[cursor[b]++] = w;
    }

    var gScore = new Float64Array(n);
    var came = new Int32Array(n);
    var closed = new Uint8Array(n);

    function astar(s, t) {
      gScore.fill(Infinity);
      came.fill(-1);
      closed.fill(0);
      var heap = new MinHeap();
      gScore[s] = 0;
      heap.push(s, Math.hypot(xs[s] - xs[t], ys[s] - ys[t]));
      while (heap.ids.length) {
        var cur = heap.pop();
        if (closed[cur]) continue;
        if (cur === t) {
          var path = [cur];
          while (came[cur] !== -1) {
            cur = came[cur];
            path.push(cur);
          }
          return path.reverse();
        }
        closed[cur] = 1;
        var e;
        for (e = offset[cur]; e < offset[cur + 1]; e++) {
          var next = nbr[e];
          if (closed[next]) continue;
          var tentative = gScore[cur] + wt[e];
          if (tentative < gScore[next]) {
            gScore[next] = tentative;
            came[next] = cur;
            heap.push(next, tentative + Math.hypot(xs[next] - xs[t], ys[next] - ys[t]));
          }
        }
      }
      return null;
    }

    function smooth(points) {
      if (!floor.lineClear || points.length < 3) return points;
      var out = [points[0]];
      var anchor = 0;
      while (anchor < points.length - 1) {
        var reach = anchor + 1;
        var probe = reach + 1;
        while (probe < points.length &&
          floor.lineClear(points[anchor].x, points[anchor].y, points[probe].x, points[probe].y, 0.3)) {
          reach = probe;
          probe += 1;
        }
        out.push(points[reach]);
        anchor = reach;
      }
      return out;
    }

    function length(points) {
      var total = 0;
      var k;
      for (k = 1; k < points.length; k++) {
        total += Math.hypot(points[k].x - points[k - 1].x, points[k].y - points[k - 1].y);
      }
      return total;
    }

    function doorsOf(room) {
      return room.doors && room.doors.length ? room.doors : [{ node: room.doorNode, point: room.doorPoint }];
    }

    function route(fromRoom, toRoom) {
      if (!fromRoom || !toRoom) return { status: "incomplete" };
      if (fromRoom.id === toRoom.id) {
        return { status: "same", steps: 0, meters: 0, from: fromRoom, to: toRoom, points: [], nodeIds: [] };
      }
      var best = null;
      doorsOf(fromRoom).forEach(function (da) {
        doorsOf(toRoom).forEach(function (db) {
          var s = index[da.node];
          var t = index[db.node];
          var path = s == null || t == null ? null : astar(s, t);
          if (!path) return;
          var raw = path.map(function (k) { return { x: xs[k], y: ys[k] }; });
          var pts = [da.point].concat(smooth(raw), [db.point]);
          var d = length(pts);
          if (!best || d < best.distance) best = { path: path, points: pts, distance: d };
        });
      });
      if (!best) return { status: "none", from: fromRoom, to: toRoom, points: [], nodeIds: [] };
      var path = best.path;
      var points = best.points;
      var distance = best.distance;
      var meters = distance * (floor.metersPerUnit || 0.065);
      return {
        status: "ok",
        from: fromRoom,
        to: toRoom,
        nodeIds: path.map(function (k) { return nodes[k].id; }),
        points: points,
        distance: distance,
        meters: Math.round(meters),
        steps: Math.max(1, Math.round(meters / STEP_METERS))
      };
    }

    return { route: route };
  }

  function selfTest(floor, customPairs) {
    var router = create(floor);
    var pairs = customPairs || [
      ["277.17", "Narmada"],
      ["264.01", "234.44"],
      ["263.01", "227.07"],
      ["257.44", "Kaveri"],
      ["215", "253.01"]
    ];
    var failures = [];
    pairs.forEach(function (pair) {
      var a = floor.roomById[pair[0]];
      var b = floor.roomById[pair[1]];
      if (!a || !b) {
        failures.push(pair.join(" → ") + " is missing from the plan");
        return;
      }
      var forward = router.route(a, b);
      var back = router.route(b, a);
      if (forward.status !== "ok") {
        failures.push("No route " + pair.join(" → "));
        return;
      }
      if (back.status !== "ok" || Math.abs(back.distance - forward.distance) > 40) {
        failures.push("Return route differs for " + pair.join(" → "));
      }
      var hasNode = function (room, id) {
        return (room.doors || []).some(function (d) { return d.node === id; }) || room.doorNode === id;
      };
      if (!hasNode(a, forward.nodeIds[0]) || !hasNode(b, forward.nodeIds[forward.nodeIds.length - 1])) {
        failures.push("Route " + pair.join(" → ") + " does not use the door nodes");
      }
      var k;
      for (k = 1; k < forward.points.length; k++) {
        var p = forward.points[k - 1];
        var q = forward.points[k];
        if (!floor.lineClear(p.x, p.y, q.x, q.y, 0)) {
          failures.push("Route " + pair.join(" → ") + " crosses a desk, room, or wall");
          break;
        }
      }
    });
    return { ok: failures.length === 0, failures: failures };
  }

  return { create: create, selfTest: selfTest };
});
