/*
 * Canvas renderer for the generated floor plan.
 * Pan, zoom, hit testing, corridor routes, and the you-are-here pin.
 */
(function (root) {
  "use strict";

  var FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hexAlpha(hex, alpha) {
    var n = parseInt(String(hex).replace("#", ""), 16);
    if (isNaN(n)) return "rgba(120,113,108," + alpha + ")";
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function create(canvas, floor, handlers) {
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = 1;
    var viewW = 1;
    var viewH = 1;
    var scale = 0.4;
    var camX = floor.plate.x + floor.plate.w / 2;
    var camY = floor.plate.y + floor.plate.h / 2;
    var showWalks = false;
    var fromId = null;
    var toId = null;
    var hoverId = null;
    var route = null;
    var dash = 0;
    var pulse = 0;
    var anim = null;
    var pointer = null;
    var touchState = null;

    function worldToScreen(x, y) {
      return {
        x: (x - camX) * scale + viewW / 2,
        y: (y - camY) * scale + viewH / 2
      };
    }

    function screenToWorld(x, y) {
      return {
        x: (x - viewW / 2) / scale + camX,
        y: (y - viewH / 2) / scale + camY
      };
    }

    function localPoint(event) {
      var rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(1, rect.width);
      viewH = Math.max(1, rect.height);
      canvas.width = Math.max(1, Math.round(viewW * dpr));
      canvas.height = Math.max(1, Math.round(viewH * dpr));
    }

    function zoomAt(sx, sy, nextScale) {
      var before = screenToWorld(sx, sy);
      scale = clamp(nextScale, 0.08, 3.2);
      camX = before.x - (sx - viewW / 2) / scale;
      camY = before.y - (sy - viewH / 2) / scale;
    }

    function animateTo(x, y, nextScale, immediate) {
      if (anim) cancelAnimationFrame(anim);
      nextScale = clamp(nextScale, 0.08, 3.2);
      if (immediate || reduce) {
        camX = x;
        camY = y;
        scale = nextScale;
        return;
      }
      var startX = camX;
      var startY = camY;
      var startS = scale;
      var t0 = performance.now();
      function frame(now) {
        var u = Math.min(1, (now - t0) / 280);
        var e = 1 - Math.pow(1 - u, 3);
        camX = startX + (x - startX) * e;
        camY = startY + (y - startY) * e;
        scale = startS + (nextScale - startS) * e;
        if (u < 1) anim = requestAnimationFrame(frame);
      }
      anim = requestAnimationFrame(frame);
    }

    function frameBounds(bounds, maxScale, immediate) {
      if (!viewW || !bounds.w || !bounds.h) return;
      var s = Math.min((viewW - 28) / bounds.w, (viewH - 28) / bounds.h);
      if (maxScale) s = Math.min(s, maxScale);
      animateTo(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, s, immediate);
    }

    function frameAll(immediate) {
      frameBounds(floor.plate, null, immediate);
    }

    function frameHeightAt(worldX, immediate) {
      var s = (viewH - 32) / floor.plate.h;
      animateTo(worldX, floor.plate.y + floor.plate.h / 2, s, immediate);
    }

    function frameRoom(id) {
      var room = floor.roomById[id];
      if (!room) return;
      animateTo(room.x + room.w / 2, room.y + room.h / 2, Math.min(2.2, 42 / room.w), false);
    }

    function frameRoute(result) {
      if (!result || result.status !== "ok" || !result.points.length) return;
      var minX = Infinity;
      var minY = Infinity;
      var maxX = -Infinity;
      var maxY = -Infinity;
      function grow(x, y) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      result.points.forEach(function (p) { grow(p.x, p.y); });
      [result.from, result.to].forEach(function (room) {
        if (!room) return;
        grow(room.x, room.y);
        grow(room.x + room.w, room.y + room.h);
      });
      frameBounds({
        x: minX - 80,
        y: minY - 80,
        w: maxX - minX + 160,
        h: maxY - minY + 160
      }, 1.6, false);
    }

    function hitTest(sx, sy) {
      var world = screenToWorld(sx, sy);
      var slop = 3 / scale;
      var best = null;
      var bestArea = Infinity;
      var i;
      for (i = 0; i < floor.rooms.length; i++) {
        var room = floor.rooms[i];
        if (world.x < room.x - slop || world.x > room.x + room.w + slop) continue;
        if (world.y < room.y - slop || world.y > room.y + room.h + slop) continue;
        var area = room.w * room.h;
        if (area < bestArea) {
          best = room;
          bestArea = area;
        }
      }
      return best;
    }

    function roomFill(room) {
      if (room.id === fromId) return "rgba(4, 120, 87, 0.2)";
      if (room.id === toId) return "rgba(185, 28, 28, 0.16)";
      if (room.accent === "pantry") return "#e3f6ea";
      if (room.accent === "reception") return "#fff4e4";
      if (room.type === "meeting") return "#e6eef6";
      if (room.type === "phone") return "#f3eef9";
      if (room.type === "service") return "#eef2f4";
      return "#fffdf9";
    }

    function roomStroke(room) {
      if (room.type === "meeting") return "#1e3a5f";
      if (room.type === "phone") return "#6d5a94";
      if (room.type === "service") return "#334155";
      return room.accent || "#78716c";
    }

    function drawDoorBar(room) {
      if (room.type === "desk") return;
      (room.doors || [{ point: room.doorPoint, side: room.doorSide }]).forEach(function (door) {
        var p = door.point;
        var horizontal = door.side === "N" || door.side === "S";
        var half = horizontal ? Math.min(8, room.w / 3) : Math.min(8, room.h / 3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        if (horizontal) {
          var y = door.side === "N" ? room.y : room.y + room.h;
          ctx.moveTo(p.x - half, y);
          ctx.lineTo(p.x + half, y);
        } else {
          var x = door.side === "W" ? room.x : room.x + room.w;
          ctx.moveTo(x, p.y - half);
          ctx.lineTo(x, p.y + half);
        }
        ctx.stroke();
      });
    }

    function drawFixtures() {
      floor.fixtures.forEach(function (item) {
        if (item.type === "void" || item.type === "wall") {
          ctx.fillStyle = "#d6d3d1";
          ctx.fillRect(item.x, item.y, item.w, item.h);
          return;
        }
        if (item.type === "room") {
          ctx.fillStyle = "#eceef1";
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1.1 / scale;
          roundRect(ctx, item.x, item.y, item.w, item.h, 4);
          ctx.fill();
          ctx.stroke();
          return;
        }
        ctx.fillStyle = "#e6e2d9";
        ctx.strokeStyle = "#44403c";
        ctx.lineWidth = 1.1 / scale;
        roundRect(ctx, item.x, item.y, item.w, item.h, 4);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        roundRect(ctx, item.x, item.y, item.w, item.h, 4);
        ctx.clip();
        ctx.beginPath();
        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 1 / scale;
        if (item.type === "stair") {
          var step;
          for (step = 1; step < 7; step++) {
            var yy = item.y + (item.h / 7) * step;
            ctx.moveTo(item.x + 8, yy);
            ctx.lineTo(item.x + item.w - 8, yy);
          }
          ctx.stroke();
        } else if (item.type === "lift") {
          ctx.strokeRect(item.x + item.w * 0.18, item.y + 16, item.w * 0.28, item.h - 32);
          ctx.strokeRect(item.x + item.w * 0.54, item.y + 16, item.w * 0.28, item.h - 32);
        }
        ctx.restore();
      });
    }

    var walkImage = null;

    function drawWalks() {
      if (!showWalks) return;
      var g = floor.grid;
      if (!walkImage) {
        walkImage = document.createElement("canvas");
        walkImage.width = g.cols;
        walkImage.height = g.rows;
        var wctx = walkImage.getContext("2d");
        var img = wctx.createImageData(g.cols, g.rows);
        var k;
        for (k = 0; k < g.main.length; k++) {
          if (!g.main[k]) continue;
          img.data[k * 4] = 37;
          img.data[k * 4 + 1] = 99;
          img.data[k * 4 + 2] = 235;
          img.data[k * 4 + 3] = 46;
        }
        wctx.putImageData(img, 0, 0);
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(walkImage, g.x0, g.y0, g.cols * g.size, g.rows * g.size);
      ctx.imageSmoothingEnabled = true;
    }

    function drawRoute() {
      if (!route || route.status !== "ok" || route.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(route.points[0].x, route.points[0].y);
      var i;
      for (i = 1; i < route.points.length; i++) ctx.lineTo(route.points[i].x, route.points[i].y);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 7 / scale;
      ctx.stroke();
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 3.1 / scale;
      ctx.stroke();
      if (!reduce) {
        ctx.setLineDash([9 / scale, 12 / scale]);
        ctx.lineDashOffset = -dash / scale;
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.6 / scale;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function drawWorld() {
      var b = floor.building;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(b.x, b.y, b.w, b.h);

      drawWalks();

      floor.groups.forEach(function (group) {
        ctx.fillStyle = hexAlpha(group.accent, 0.08);
        ctx.fillRect(group.x, group.y, group.w, group.h);
        ctx.strokeStyle = hexAlpha(group.accent, 0.85);
        ctx.lineWidth = 1.2 / scale;
        ctx.strokeRect(group.x, group.y, group.w, group.h);
      });

      drawFixtures();

      floor.rooms.forEach(function (room) {
        var radius = room.type === "desk" ? 2 : 5;
        ctx.fillStyle = roomFill(room);
        ctx.strokeStyle = roomStroke(room);
        ctx.lineWidth = 1.15 / scale;
        roundRect(ctx, room.x, room.y, room.w, room.h, radius);
        ctx.fill();
        ctx.stroke();
        drawDoorBar(room);
      });

      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 2.2 / scale;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      drawRoute();
    }

    function drawLabel(text, x, y, size, color, maxWidth) {
      ctx.font = "600 " + size + "px " + FONT;
      if (maxWidth && ctx.measureText(text).width > maxWidth) return false;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      return true;
    }

    function drawScreenLabels() {
      var showNumbers = 24 * scale >= 20;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ["left", "core", "right"].forEach(function (key) {
        var region = floor.regions[key];
        var p = worldToScreen(region.x + region.w / 2, floor.building.y - 16);
        if (p.x < -80 || p.x > viewW + 80 || p.y < -20 || p.y > viewH) return;
        ctx.font = "600 11px " + FONT;
        ctx.fillStyle = "#78716c";
        ctx.fillText(region.label.toUpperCase(), p.x, p.y);
      });

      if (!showNumbers) {
        floor.groups.forEach(function (group) {
          var c = worldToScreen(group.x + group.w / 2, group.y + group.h / 2);
          var sw = group.w * scale;
          if (sw < 36) return;
          if (c.x < -40 || c.x > viewW + 40 || c.y < -20 || c.y > viewH + 20) return;
          ctx.font = "700 13px " + FONT;
          ctx.fillStyle = group.accent;
          ctx.fillText(group.label, c.x, c.y);
        });
      }

      floor.fixtures.forEach(function (item) {
        if (!item.label) return;
        var c = worldToScreen(item.x + item.w / 2, item.y + item.h / 2);
        var sw = item.w * scale;
        if (sw < 28 || c.x < 0 || c.x > viewW || c.y < 0 || c.y > viewH) return;
        var text = item.type === "wc" ? "WC" : item.label;
        drawLabel(text, c.x, c.y, sw > 70 ? 12 : 10, "#44403c", sw - 8);
      });

      floor.rooms.forEach(function (room) {
        var c = worldToScreen(room.x + room.w / 2, room.y + room.h / 2);
        var sw = room.w * scale;
        var sh = room.h * scale;
        if (c.x < -30 || c.x > viewW + 30 || c.y < -20 || c.y > viewH + 20) return;
        if (room.type === "desk" || room.series === "263") {
          if (!showNumbers) return;
          var text = sw >= 46 ? room.label : room.label.split(".")[1];
          drawLabel(text, c.x, c.y, 10, "#1c1917", sw - 4);
          return;
        }
        if (sw < 14 || sh < 10) return;
        var short = room.label.split(" · ")[0];
        if (/^\d/.test(short)) short = room.id;
        var labels = [room.label];
        if (short !== room.label) labels.push(short);
        if (short.indexOf(" ") !== -1) labels.push(short.split(" ")[0]);
        short = labels[labels.length - 1];
        var max = sw > 150 ? 13 : 11;
        var li;
        var size;
        for (li = 0; li < labels.length; li++) {
          for (size = max; size >= 7; size--) {
            ctx.font = "600 " + size + "px " + FONT;
            if (ctx.measureText(labels[li]).width <= sw - 6 && size <= sh - 2) {
              ctx.fillStyle = "#1c1917";
              ctx.fillText(labels[li], c.x, c.y);
              return;
            }
          }
        }
        if (sh > sw) {
          for (size = Math.min(max, Math.floor(sw - 2)); size >= 7; size--) {
            ctx.font = "600 " + size + "px " + FONT;
            if (ctx.measureText(short).width <= sh - 6) {
              ctx.save();
              ctx.translate(c.x, c.y);
              ctx.rotate(-Math.PI / 2);
              ctx.fillStyle = "#1c1917";
              ctx.fillText(short, 0, 0);
              ctx.restore();
              return;
            }
          }
        }
      });

      strokeRoom(fromId, "#047857");
      strokeRoom(toId, "#b91c1c");
      if (hoverId && hoverId !== fromId && hoverId !== toId) strokeRoom(hoverId, "#0f172a");
      drawMarkers();
      drawHerePin();
    }

    function strokeRoom(id, color) {
      if (!id) return;
      var room = floor.roomById[id];
      if (!room) return;
      var a = worldToScreen(room.x, room.y);
      var b = worldToScreen(room.x + room.w, room.y + room.h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(a.x - 2, a.y - 2, b.x - a.x + 4, b.y - a.y + 4);
    }

    function drawMarker(point, fill, letter) {
      if (!point) return;
      var p = worldToScreen(point.x, point.y);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "700 11px " + FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, p.x, p.y + 0.5);
    }

    function drawMarkers() {
      if (!route || route.status !== "ok" || !route.points.length) return;
      drawMarker(route.points[0], "#047857", "S");
      drawMarker(route.points[route.points.length - 1], "#b91c1c", "E");
    }

    function drawHerePin() {
      var room = floor.roomById[floor.youAreHere];
      if (!room) return;
      var p = worldToScreen(room.x + room.w / 2, room.y + room.h / 2);
      if (p.x < -20 || p.x > viewW + 20 || p.y < -20 || p.y > viewH + 20) return;
      var ring = 11 + (reduce ? 0 : Math.sin(pulse) * 2);
      ctx.beginPath();
      ctx.arc(p.x, p.y, ring, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(5, 150, 105, 0.16)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#059669";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#e7e5e4";
      ctx.fillRect(0, 0, viewW, viewH);

      ctx.setTransform(
        dpr * scale, 0, 0, dpr * scale,
        dpr * (viewW / 2 - camX * scale),
        dpr * (viewH / 2 - camY * scale)
      );
      drawWorld();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScreenLabels();
    }

    function loop(now) {
      if (!reduce) {
        dash = (now / 18) % 400;
        pulse = now / 280;
      }
      draw();
      requestAnimationFrame(loop);
    }

    function emitHover(room, event) {
      hoverId = room ? room.id : null;
      if (handlers.onHover) handlers.onHover(room, event ? event.clientX : 0, event ? event.clientY : 0);
      canvas.style.cursor = pointer && pointer.dragging ? "grabbing" : room ? "pointer" : "grab";
    }

    canvas.addEventListener("wheel", function (event) {
      event.preventDefault();
      var p = localPoint(event);
      var factor = event.deltaY < 0 ? 1.09 : 1 / 1.09;
      zoomAt(p.x, p.y, scale * factor);
    }, { passive: false });

    canvas.addEventListener("dblclick", function (event) {
      var p = localPoint(event);
      zoomAt(p.x, p.y, scale * 1.35);
    });

    canvas.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") return;
      var p = localPoint(event);
      pointer = { id: event.pointerId, x: p.x, y: p.y, camX: camX, camY: camY, moved: false, dragging: false };
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", function (event) {
      if (pointer && event.pointerId === pointer.id) {
        var p = localPoint(event);
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        if (!pointer.moved && Math.hypot(dx, dy) > 4) {
          pointer.moved = true;
          pointer.dragging = true;
          canvas.style.cursor = "grabbing";
        }
        if (pointer.dragging) {
          camX = pointer.camX - dx / scale;
          camY = pointer.camY - dy / scale;
        }
        return;
      }
      if (event.pointerType === "touch") return;
      var hover = hitTest(localPoint(event).x, localPoint(event).y);
      emitHover(hover, event);
    });

    canvas.addEventListener("pointerup", function (event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      var p = localPoint(event);
      var wasDrag = pointer.moved;
      pointer = null;
      if (!wasDrag) {
        var room = hitTest(p.x, p.y);
        if (room && handlers.onPick) handlers.onPick(room);
      }
      var hover = hitTest(p.x, p.y);
      emitHover(hover, event);
    });

    canvas.addEventListener("pointerleave", function () {
      if (!pointer) emitHover(null, null);
    });

    canvas.addEventListener("touchstart", function (event) {
      if (event.touches.length === 1) {
        var p = localPoint(event.touches[0]);
        touchState = {
          mode: "pan",
          x: p.x,
          y: p.y,
          camX: camX,
          camY: camY,
          moved: false
        };
      } else if (event.touches.length === 2) {
        event.preventDefault();
        var a = localPoint(event.touches[0]);
        var b = localPoint(event.touches[1]);
        touchState = {
          mode: "pinch",
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          scale: scale,
          midX: (a.x + b.x) / 2,
          midY: (a.y + b.y) / 2
        };
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", function (event) {
      if (!touchState) return;
      if (touchState.mode === "pan" && event.touches.length === 1) {
        event.preventDefault();
        var p = localPoint(event.touches[0]);
        var dx = p.x - touchState.x;
        var dy = p.y - touchState.y;
        if (Math.hypot(dx, dy) > 6) touchState.moved = true;
        camX = touchState.camX - dx / scale;
        camY = touchState.camY - dy / scale;
      } else if (touchState.mode === "pinch" && event.touches.length === 2) {
        event.preventDefault();
        var a = localPoint(event.touches[0]);
        var b = localPoint(event.touches[1]);
        var distNow = Math.hypot(a.x - b.x, a.y - b.y);
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2;
        zoomAt(mx, my, touchState.scale * (distNow / Math.max(1, touchState.dist)));
      }
    }, { passive: false });

    canvas.addEventListener("touchend", function (event) {
      if (!touchState) return;
      if (touchState.mode === "pan" && !touchState.moved && event.changedTouches.length) {
        var p = localPoint(event.changedTouches[0]);
        var room = hitTest(p.x, p.y);
        if (room && handlers.onPick) handlers.onPick(room);
      }
      if (!event.touches.length) touchState = null;
    });

    if (window.ResizeObserver) {
      var observer = new ResizeObserver(function () { resize(); });
      observer.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", resize);
    }

    resize();
    requestAnimationFrame(loop);

    return {
      resize: resize,
      frameAll: frameAll,
      frameBounds: frameBounds,
      frameHeightAt: frameHeightAt,
      frameRoom: frameRoom,
      frameRoute: frameRoute,
      setSelection: function (from, to) {
        fromId = from;
        toId = to;
      },
      setRoute: function (next) { route = next; },
      setShowWalks: function (value) { showWalks = !!value; },
      zoomBy: function (factor) { zoomAt(viewW / 2, viewH / 2, scale * factor); },
      ready: function () { return viewW > 20 && viewH > 20; }
    };
  }

  root.FloorPlan = { create: create };
})(typeof globalThis !== "undefined" ? globalThis : this);
