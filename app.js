/*
 * City picker first, then the chosen city's floors, routers, canvas plans, and controls.
 */
(function () {
  "use strict";

  var cities = window.CITIES || {};
  var city = null;
  var levels = [];
  var floors = {};
  var state = { fromId: null, toId: null, route: null, view: null };
  var routers = {};
  var plans = {};
  var canvases = {};
  var controls;
  var mobile = window.matchMedia("(max-width: 860px)");

  function cityList() {
    return Object.keys(cities).map(function (id) { return cities[id]; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  function readHashParams() {
    return new URLSearchParams((location.hash || "").replace(/^#/, ""));
  }

  function showCityScreen() {
    var screen = document.getElementById("city-screen");
    var input = document.getElementById("city-input");
    var list = document.getElementById("city-list");

    function render() {
      var q = input.value.trim().toLowerCase();
      list.replaceChildren();
      var shown = cityList().filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) !== -1; });
      if (!shown.length) {
        var empty = document.createElement("li");
        empty.className = "city-empty";
        empty.textContent = "No office in that city yet";
        list.appendChild(empty);
        return;
      }
      shown.forEach(function (c) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.type = "button";
        button.className = "city-option";
        var name = document.createElement("strong");
        name.textContent = c.name;
        var meta = document.createElement("span");
        meta.textContent = c.note || (Object.keys(c.floors).length + " floors");
        button.appendChild(name);
        button.appendChild(meta);
        button.addEventListener("click", function () { pickCity(c.id); });
        li.appendChild(button);
        list.appendChild(li);
      });
    }

    input.value = "";
    input.oninput = render;
    input.onkeydown = function (event) {
      if (event.key !== "Enter") return;
      var first = list.querySelector(".city-option");
      if (first) first.click();
    };
    render();
    document.getElementById("app").hidden = true;
    screen.hidden = false;
    if (!mobile.matches) input.focus();
  }

  function pickCity(id) {
    if (city && city.id !== id) {
      try { sessionStorage.setItem("officeWayfinder.switchTo", id); } catch (e) { /* storage blocked */ }
      location.hash = "city=" + id;
      location.reload();
      return;
    }
    document.getElementById("city-screen").hidden = true;
    document.getElementById("app").hidden = false;
    if (!city) startCity(cities[id]);
    else resizeView();
  }

  function room(key) {
    if (!key) return null;
    var cut = key.indexOf(":");
    var floor = floors[key.slice(0, cut)];
    return floor ? floor.roomById[key.slice(cut + 1)] || null : null;
  }

  function compute() {
    var a = room(state.fromId);
    var b = room(state.toId);
    if (!a || !b) return { status: "incomplete" };
    if (a.floor !== b.floor) return { status: "floors", from: a, to: b };
    return routers[a.floor].route(a, b);
  }

  function writeHash() {
    var params = new URLSearchParams();
    params.set("city", city.id);
    if (state.fromId) params.set("from", state.fromId);
    if (state.toId) params.set("to", state.toId);
    var next = "#" + params.toString();
    if (location.hash !== next) history.replaceState(null, "", location.pathname + location.search + next);
  }

  function resizeView() {
    if (plans[state.view]) plans[state.view].resize();
  }

  function setView(level) {
    state.view = level;
    levels.forEach(function (l) { canvases[l].hidden = l !== level; });
    document.querySelectorAll("#floor-tabs button").forEach(function (button) {
      button.classList.toggle("is-on", Number(button.getAttribute("data-floor")) === level);
    });
    document.getElementById("floor-mark").textContent = String(level);
    document.getElementById("floor-title").textContent = city.name + " · Floor " + level;
    document.title = "Desk2Door · " + city.name + " · Floor " + level;
    var counts = floors[level].validation.counts;
    document.getElementById("stats").textContent = counts.desks + " desks · " +
      counts.meetings + " meetings · " + counts.small + " small rooms";
    resizeView();
  }

  function publish(frame) {
    state.route = compute();
    var from = room(state.fromId);
    var to = room(state.toId);
    levels.forEach(function (level) {
      plans[level].setSelection(from && from.floor === level ? from.id : null, to && to.floor === level ? to.id : null);
      var ok = state.route.status === "ok" && state.route.from.floor === level;
      plans[level].setRoute(ok ? state.route : null);
    });
    if (from && from.floor !== state.view) setView(from.floor);
    else if (!from && to && to.floor !== state.view) setView(to.floor);
    controls.sync(state);
    writeHash();
    if (frame) frameResult();
  }

  function frameResult() {
    var status = state.route.status;
    if (status !== "ok" && status !== "floors") return;
    if (mobile.matches) {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      setSheet(false);
    }
    requestAnimationFrame(function () {
      resizeView();
      if (state.route.status === "ok") plans[state.view].frameRoute(state.route);
      else if (state.route.status === "floors") plans[state.view].frameRoom(room(state.fromId).id);
    });
  }

  function setFrom(key, frame) {
    state.fromId = key;
    if (state.toId === key) state.toId = null;
    publish(frame);
  }

  function setTo(key, frame) {
    state.toId = key;
    publish(frame);
  }

  function onPick(picked) {
    if (!state.fromId || (state.fromId && state.toId)) {
      state.toId = null;
      setFrom(picked.key, false);
      return;
    }
    setTo(picked.key, picked.key !== state.fromId);
  }

  function showTooltip(picked, x, y) {
    var tip = document.getElementById("tooltip");
    if (!picked) {
      tip.hidden = true;
      return;
    }
    tip.hidden = false;
    tip.replaceChildren();
    var title = document.createElement("strong");
    title.textContent = picked.label;
    var meta = document.createElement("span");
    var kind = picked.type === "meeting" ? "Meeting room" : picked.type === "phone" ? "Phone booth" : picked.type === "service" ? "Service room" : "Desk";
    meta.textContent = kind + " · Floor " + picked.floor + " · " + (picked.wing === "left" ? "Left" : "Right") + " wing";
    tip.appendChild(title);
    tip.appendChild(meta);
    if (picked.youAreHere) {
      var here = document.createElement("span");
      here.className = "tip-here";
      here.textContent = "You are here";
      tip.appendChild(here);
    }
    var left = x + 14;
    var top = y + 16;
    if (left + 210 > window.innerWidth) left = Math.max(8, x - 210);
    if (top + 78 > window.innerHeight) top = Math.max(8, y - 78);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function readHash() {
    var params = readHashParams();
    var from = params.get("from");
    var to = params.get("to");
    if (from && room(from)) state.fromId = from;
    if (to && room(to)) state.toId = to;
  }

  function showChecks() {
    var banner = document.getElementById("banner");
    var line = document.getElementById("check-line");
    var messages = [];
    levels.forEach(function (level) {
      var floor = floors[level];
      var label = "Floor " + level + ": ";
      floor.validation.errors.forEach(function (e) { messages.push(label + e); });
      var pairs = city.testPairs ? city.testPairs[level] : null;
      if (pairs !== undefined || !city.testPairs) {
        Pathfinding.selfTest(floor, pairs || null).failures.forEach(function (e) { messages.push(label + e); });
      }
    });
    if (messages.length) {
      banner.hidden = false;
      banner.textContent = messages.slice(0, 8).join("\n");
      line.textContent = "Layout check failed";
      return;
    }
    banner.hidden = true;
    line.textContent = "Layout and route checks passed";
  }

  function setSheet(open) {
    var panel = document.getElementById("panel");
    panel.classList.toggle("is-collapsed", !open);
    document.getElementById("sheet-btn").setAttribute("aria-expanded", String(open));
    document.getElementById("sheet-label").textContent = open ? "Hide options" : "Show directions";
    requestAnimationFrame(function () {
      resizeView();
      window.dispatchEvent(new Event("resize"));
    });
  }

  function boot() {
    resizeView();
    if (!plans[state.view].ready()) {
      requestAnimationFrame(boot);
      return;
    }
    readHash();
    publish(false);
    var plan = plans[state.view];
    if (state.route.status === "ok" || state.route.status === "floors") frameResult();
    else {
      var here = city.here ? room(city.here.key) : null;
      var floor = floors[state.view];
      plan.frameHeightAt(here && here.floor === state.view ? here.x + here.w / 2 : floor.plate.x + floor.plate.w * 0.25, true);
    }
  }

  function startCity(chosen) {
    city = chosen;
    floors = city.floors;
    levels = Object.keys(floors).map(Number).sort(function (a, b) { return a - b; });
    state.view = city.defaultFloor && floors[city.defaultFloor] ? city.defaultFloor : levels[0];
    levels.forEach(function (level) { routers[level] = Pathfinding.create(floors[level]); });

    var typeRank = { meeting: 0, service: 1, phone: 2, desk: 3 };
    var directory = levels.reduce(function (all, level) { return all.concat(floors[level].directory); }, []);
    directory.sort(function (p, q) {
      if (typeRank[p.type] !== typeRank[q.type]) return typeRank[p.type] - typeRank[q.type];
      if (p.floor !== q.floor) return p.floor - q.floor;
      return p.label.localeCompare(q.label, "en", { numeric: true, sensitivity: "base" });
    });

    var hereBtn = document.getElementById("here-btn");
    hereBtn.hidden = !city.here;
    if (city.here) hereBtn.textContent = "You are here · " + city.here.label;

    controls = Controls.mount({ directory: directory }, {
      onFrom: function (key) { setFrom(key, true); },
      onTo: function (key) { setTo(key, true); },
      onSwap: function () {
        var nextFrom = state.toId;
        state.toId = state.fromId;
        state.fromId = nextFrom;
        publish(true);
      },
      onClear: function () {
        state.fromId = null;
        state.toId = null;
        publish(false);
      },
      onFloorGo: function () {
        var to = room(state.toId);
        if (!to) return;
        state.fromId = null;
        setView(to.floor);
        publish(false);
        plans[to.floor].frameRoom(to.id);
        document.getElementById("from-input").focus();
      },
      onHere: function () {
        var here = room(city.here.key);
        if (!here) return;
        setView(here.floor);
        plans[here.floor].frameRoom(here.id);
      },
      onWalks: function (on) {
        levels.forEach(function (level) { plans[level].setShowWalks(on); });
      },
      onWing: function (wing) {
        var plan = plans[state.view];
        if (wing === "all") plan.frameAll(false);
        else plan.frameBounds(floors[state.view].regions[wing], null, false);
      }
    });

    var stage = document.querySelector(".stage");
    var hint = stage.querySelector(".hint");
    var tabs = document.getElementById("floor-tabs");
    tabs.replaceChildren();
    levels.forEach(function (level) {
      var canvas = document.createElement("canvas");
      canvas.hidden = true;
      canvas.setAttribute("aria-label", "Digital floor plan of " + city.name + " Floor " + level +
        ". Drag to pan, pinch or scroll to zoom, tap a desk or room.");
      stage.insertBefore(canvas, hint);
      canvases[level] = canvas;
      canvas.hidden = level !== state.view;
      plans[level] = FloorPlan.create(canvas, floors[level], { onPick: onPick, onHover: showTooltip });

      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-floor", String(level));
      button.textContent = "Floor " + level;
      button.addEventListener("click", function () {
        setView(level);
        if (plans[level].ready()) plans[level].frameAll(false);
      });
      tabs.appendChild(button);
    });

    showChecks();
    setView(state.view);

    document.getElementById("zoom-in").addEventListener("click", function () { plans[state.view].zoomBy(1.15); });
    document.getElementById("zoom-out").addEventListener("click", function () { plans[state.view].zoomBy(1 / 1.15); });
    document.getElementById("zoom-fit").addEventListener("click", function () { plans[state.view].frameAll(false); });
    ["from-input", "to-input"].forEach(function (id) {
      document.getElementById(id).addEventListener("focus", function () {
        if (!mobile.matches && document.getElementById("panel").classList.contains("is-collapsed")) setSheet(true);
      });
    });
    document.getElementById("sheet-btn").addEventListener("click", function () {
      setSheet(document.getElementById("panel").classList.contains("is-collapsed"));
    });

    document.addEventListener("keydown", function (event) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (event.key === "+" || event.key === "=") plans[state.view].zoomBy(1.15);
      if (event.key === "-" || event.key === "_") plans[state.view].zoomBy(1 / 1.15);
      if (event.key === "0") plans[state.view].frameAll(false);
    });

    if ("ResizeObserver" in window) new ResizeObserver(resizeView).observe(stage);

    requestAnimationFrame(boot);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("city-btn").addEventListener("click", showCityScreen);
    var switchTo = null;
    try {
      switchTo = sessionStorage.getItem("officeWayfinder.switchTo");
      sessionStorage.removeItem("officeWayfinder.switchTo");
    } catch (e) { /* storage blocked */ }
    if (switchTo && cities[switchTo]) pickCity(switchTo);
    else showCityScreen();
  });
})();
