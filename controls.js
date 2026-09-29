/*
 * Searchable From / To selectors, filters, and the route summary.
 */
(function (root) {
  "use strict";

  var TYPE_HEADING = {
    meeting: "Meeting rooms",
    service: "Service rooms",
    phone: "Phone booths and small rooms",
    desk: "Desks"
  };

  function wingName(wing) {
    return wing === "left" ? "Left" : "Right";
  }

  function mount(floor, handlers) {
    var typeFilter = "";
    var fromId = null;
    var toId = null;
    var fromCombo = buildCombo("from", function (id) { handlers.onFrom(id); });
    var toCombo = buildCombo("to", function (id) { handlers.onTo(id); });

    function matches(item, query) {
      if (typeFilter === "desk" && item.type !== "desk") return false;
      if (typeFilter === "meeting" && item.type !== "meeting") return false;
      if (typeFilter === "room" && item.type !== "phone" && item.type !== "service") return false;
      var wing = document.getElementById("wing-filter").value;
      if (wing && item.wing !== wing) return false;
      if (!query) return true;
      return item.hay.indexOf(query.toLowerCase()) !== -1;
    }

    function buildCombo(name, onPick) {
      var input = document.getElementById(name + "-input");
      var list = document.getElementById(name + "-list");
      var selected = null;
      var open = false;
      var active = -1;
      var visible = [];

      function close() {
        open = false;
        list.hidden = true;
        input.setAttribute("aria-expanded", "false");
        active = -1;
      }

      function restore() {
        input.value = selected ? selected.label : "";
      }

      function place() {
        var rect = input.getBoundingClientRect();
        list.style.position = "fixed";
        list.style.left = rect.left + "px";
        list.style.width = rect.width + "px";
        list.style.top = (rect.bottom + 4) + "px";
        var viewH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        list.style.maxHeight = Math.max(120, Math.min(280, viewH - rect.bottom - 12)) + "px";
      }

      function render(query) {
        visible = floor.directory.filter(function (item) { return matches(item, query); });
        list.innerHTML = "";
        if (!visible.length) {
          var empty = document.createElement("li");
          empty.className = "combo-empty";
          empty.textContent = "No matches";
          list.appendChild(empty);
          return;
        }
        var shown = visible.slice(0, 70);
        var lastType = "";
        shown.forEach(function (item, index) {
          if (item.type !== lastType) {
            var head = document.createElement("li");
            head.className = "combo-head";
            head.textContent = TYPE_HEADING[item.type] || item.type;
            list.appendChild(head);
            lastType = item.type;
          }
          var option = document.createElement("li");
          option.className = "combo-option";
          option.setAttribute("role", "option");
          option.id = name + "-opt-" + index;
          if (index === active) option.classList.add("is-active");
          var label = document.createElement("span");
          label.textContent = item.label;
          var meta = document.createElement("span");
          meta.className = "combo-meta";
          meta.textContent = "Floor " + item.floor + " · " + wingName(item.wing) + (item.youAreHere ? " · You are here" : "");
          option.appendChild(label);
          option.appendChild(meta);
          option.addEventListener("mousedown", function (event) {
            event.preventDefault();
            choose(item);
          });
          list.appendChild(option);
        });
        if (visible.length > shown.length) {
          var more = document.createElement("li");
          more.className = "combo-more";
          more.textContent = (visible.length - shown.length) + " more — keep typing";
          list.appendChild(more);
        }
      }

      function openList(query) {
        if (name === "from") toCombo.close();
        else fromCombo.close();
        open = true;
        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
        place();
        render(query);
      }

      function choose(item) {
        selected = item;
        input.value = item.label;
        close();
        onPick(item.key);
      }

      function move(delta) {
        if (!open) openList(input.value === (selected && selected.label) ? "" : input.value);
        if (!visible.length) return;
        active = (active + delta + visible.length) % Math.min(visible.length, 70);
        render(input.value === (selected && selected.label) ? "" : input.value);
        var node = document.getElementById(name + "-opt-" + active);
        if (node) node.scrollIntoView({ block: "nearest" });
      }

      input.addEventListener("focus", function () {
        input.value = "";
        active = -1;
        if (window.matchMedia("(max-width: 860px)").matches) input.scrollIntoView({ block: "start" });
        openList("");
      });

      input.addEventListener("pointerdown", function () {
        if (document.activeElement === input) return;
        input.value = "";
        active = -1;
        openList("");
      });

      input.addEventListener("click", function () {
        if (!selected || input.value !== selected.label) return;
        input.value = "";
        active = -1;
        openList("");
      });

      input.addEventListener("input", function () {
        active = -1;
        openList(input.value);
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (open && active >= 0 && visible[active]) choose(visible[active]);
          else if (open && visible[0]) choose(visible[0]);
        } else if (event.key === "Escape") {
          close();
          restore();
        }
      });

      input.addEventListener("blur", function () {
        close();
        restore();
      });

      function follow() {
        if (open) place();
      }
      window.addEventListener("resize", follow);
      window.addEventListener("scroll", follow, true);
      if (window.visualViewport) window.visualViewport.addEventListener("resize", follow);

      return {
        close: close,
        setId: function (id) {
          selected = id ? floor.directory.filter(function (item) { return item.key === id; })[0] : null;
          if (document.activeElement !== input) input.value = selected ? selected.label : "";
        }
      };
    }

    document.querySelectorAll(".segment button[data-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        typeFilter = button.getAttribute("data-type");
        document.querySelectorAll(".segment button[data-type]").forEach(function (other) {
          other.classList.toggle("is-on", other === button);
        });
      });
    });

    document.getElementById("swap-btn").addEventListener("click", function () { handlers.onSwap(); });
    document.getElementById("clear-btn").addEventListener("click", function () { handlers.onClear(); });
    document.getElementById("here-btn").addEventListener("click", function () { handlers.onHere(); });
    document.getElementById("walks-toggle").addEventListener("change", function (event) {
      handlers.onWalks(event.target.checked);
    });
    document.querySelectorAll(".jump .segment button[data-wing]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onWing(button.getAttribute("data-wing"));
      });
    });

    var title = document.getElementById("route-title");
    var steps = document.getElementById("route-steps");
    var note = document.getElementById("route-note");
    var card = document.getElementById("route-card");
    var floorGo = document.getElementById("floor-go");
    floorGo.addEventListener("click", function () { handlers.onFloorGo(); });

    function typeWord(type) {
      if (type === "meeting") return "meeting";
      if (type === "phone") return "phone booth";
      if (type === "service") return "service room";
      return "desk";
    }

    function sync(state) {
      fromId = state.fromId;
      toId = state.toId;
      fromCombo.setId(state.fromId);
      toCombo.setId(state.toId);
      document.getElementById("from-combo").classList.toggle("is-set", !!state.fromId);
      document.getElementById("to-combo").classList.toggle("is-set", !!state.toId);
      document.getElementById("clear-btn").disabled = !state.fromId && !state.toId;
      document.getElementById("swap-btn").disabled = !state.fromId && !state.toId;

      card.classList.remove("is-ok", "is-bad", "is-same", "is-floor");
      floorGo.hidden = true;
      var route = state.route;
      if (!state.fromId || !state.toId || !route || route.status === "incomplete") {
        title.textContent = "Choose a start and a destination.";
        steps.textContent = "";
        note.textContent = "Search both fields, or click the plan. The first click sets From. The next sets To.";
        return;
      }
      if (route.status === "same") {
        card.classList.add("is-same");
        title.textContent = "Route: " + route.from.label + " → " + route.to.label;
        steps.textContent = "0 steps";
        note.textContent = "You're already at this place.";
        return;
      }
      if (route.status === "floors") {
        card.classList.add("is-floor");
        title.textContent = route.to.label + " is on Floor " + route.to.floor;
        steps.textContent = "You are on Floor " + route.from.floor;
        note.textContent = "Go to Floor " + route.to.floor + " by the stairs or lift, then search again with your start on Floor " +
          route.to.floor + ".";
        floorGo.textContent = "I am on Floor " + route.to.floor + " now";
        floorGo.hidden = false;
        return;
      }
      if (route.status === "none") {
        card.classList.add("is-bad");
        title.textContent = "No route found";
        steps.textContent = "";
        note.textContent = "These two places are not connected by a corridor.";
        return;
      }
      card.classList.add("is-ok");
      title.textContent = "Route: " + route.from.label + " → " + route.to.label;
      steps.textContent = "≈ " + route.steps + (route.steps === 1 ? " step" : " steps") + " · " + route.meters + " m";
      note.textContent = typeWord(route.from.type) + " · " + wingName(route.from.wing) + " wing, to " +
        typeWord(route.to.type) + " · " + wingName(route.to.wing) + " wing. The line follows the corridor only.";
    }

    return { sync: sync };
  }

  root.Controls = { mount: mount };
})(typeof globalThis !== "undefined" ? globalThis : this);
