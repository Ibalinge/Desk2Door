window.FLOOR_DATA = (function () {
  "use strict";

  const floor = {
    id: "pune-floor-2",
    name: "Pune - Floor 2",

    width: 9000,
    height: 1450,

    metresPerUnit: 0.03,

    areas: [],
    workstationZones: [],
    workstations: {},
    destinations: {},

    walkingNodes: {},
    walkingEdges: []
  };

  function addNode(id, x, y) {
    floor.walkingNodes[id] = [
      Number(x),
      Number(y)
    ];
  }

  function addEdge(from, to) {
    floor.walkingEdges.push([
      from,
      to
    ]);
  }

  function horizontalPath(
    prefix,
    y,
    startX,
    endX,
    step
  ) {
    const ids = [];
    let index = 0;

    for (
      let x = startX;
      x <= endX;
      x += step
    ) {
      const id =
        prefix +
        String(index).padStart(
          2,
          "0"
        );

      addNode(id, x, y);
      ids.push(id);
      index++;
    }

    for (
      let i = 0;
      i < ids.length - 1;
      i++
    ) {
      addEdge(
        ids[i],
        ids[i + 1]
      );
    }

    return ids;
  }

  function nearestNode(ids, x) {
    let selected = ids[0];
    let shortest = Infinity;

    ids.forEach(function (id) {
      const point =
        floor.walkingNodes[id];

      const difference =
        Math.abs(
          x - point[0]
        );

      if (
        difference < shortest
      ) {
        shortest = difference;
        selected = id;
      }
    });

    return selected;
  }

  function addArea(
    id,
    name,
    type,
    x,
    y,
    width,
    height,
    accessNode,
    capacity
  ) {
    floor.areas.push({
      id: id,
      label: name,
      type: type,

      x: x,
      y: y,

      width: width,
      height: height,

      accessNode:
        accessNode || null,

      capacity:
        capacity || ""
    });

    if (
      name &&
      accessNode
    ) {
      floor.destinations[name] = {
        id:
          "destination:" +
          id,

        name: name,
        type: type,

        capacity:
          capacity || "",

        x:
          x + width / 2,

        y:
          y + height / 2,

        accessNode:
          accessNode
      };
    }
  }

  /*
   * Building and corridors.
   */
  floor.areas.push({
    id: "BUILDING",
    label: "",
    type: "Building",

    x: 20,
    y: 30,

    width: 8960,
    height: 1390
  });

  floor.areas.push({
    id: "MAIN_CORRIDOR",
    label: "",
    type: "Corridor",

    x: 40,
    y: 370,

    width: 8920,
    height: 100
  });

  floor.areas.push({
    id: "SOUTH_CORRIDOR",
    label: "",
    type: "Corridor",

    x: 40,
    y: 820,

    width: 8920,
    height: 80
  });

  const mainNodes =
    horizontalPath(
      "M",
      420,
      80,
      8920,
      200
    );

  const southNodes =
    horizontalPath(
      "S",
      860,
      80,
      8920,
      200
    );

  /*
   * Connect every matching corridor point.
   */
  for (
    let index = 0;
    index < mainNodes.length;
    index++
  ) {
    if (southNodes[index]) {
      addEdge(
        mainNodes[index],
        southNodes[index]
      );
    }
  }

  function nearestMain(x) {
    return nearestNode(
      mainNodes,
      x
    );
  }

  function nearestSouth(x) {
    return nearestNode(
      southNodes,
      x
    );
  }

  function createAccess(
    id,
    x,
    useSouth
  ) {
    const accessId =
      "ACCESS_" + id;

    const y =
      useSouth
        ? 820
        : 470;

    addNode(
      accessId,
      x,
      y
    );

    addEdge(
      accessId,
      useSouth
        ? nearestSouth(x)
        : nearestMain(x)
    );

    return accessId;
  }

  /*
   * Rooms, facilities and collaboration areas.
   */
  const roomData = [
    ["263A", "263A Open Collaboration", "Open Collaboration", 50, 70, 180, 120, false, ""],
    ["264D", "264D Open Collaboration", "Open Collaboration", 1030, 70, 180, 120, false, ""],

    ["267B", "267B Copy/Mail", "Copy/Mail", 1240, 70, 150, 110, false, ""],
    ["268", "268 Storage Room", "Storage Room", 1400, 70, 220, 110, false, ""],
    ["267A", "267A Kitchen/Break Area", "Kitchen/Break Area", 1240, 195, 150, 155, false, ""],
    ["269", "269 Game Room", "Game Room", 1400, 195, 220, 155, false, ""],

    ["275", "275 Storage Room", "Storage Room", 1640, 70, 160, 90, false, ""],
    ["274", "274 BT", "BT", 1640, 170, 160, 80, false, ""],
    ["273", "273 Lactation Room", "Lactation Room", 1640, 260, 160, 90, false, ""],

    ["205", "205 Open Collaboration", "Open Collaboration", 2800, 190, 250, 160, false, ""],
    ["LUGGAGE", "Luggage Room Closet", "Closet", 3070, 190, 150, 160, false, ""],

    ["278B", "278B All Gender Restroom", "Restroom", 3240, 190, 180, 160, false, ""],
    ["279", "279 Kitchen/Break Area", "Kitchen/Break Area", 3440, 190, 190, 160, false, ""],

    ["BARAK", "Barak", "Interview Room", 3650, 190, 160, 160, false, ""],
    ["211", "211 Kitchen/Break Area", "Kitchen/Break Area", 3830, 190, 190, 160, false, ""],

    ["212B", "212B All Gender Restroom", "Restroom", 4040, 190, 180, 160, false, ""],

    ["215", "215 Storage Room", "Storage Room", 4240, 70, 220, 110, false, ""],
    ["216", "216 BT", "BT", 4240, 190, 220, 70, false, ""],
    ["217", "217 Storage Room", "Storage Room", 4240, 270, 220, 80, false, ""],

    ["221", "221 Storage Room", "Storage Room", 4480, 70, 220, 110, false, ""],
    ["223", "223 Reflection & Wellbeing", "Wellbeing", 4480, 190, 220, 160, false, ""],

    ["224", "224 Open Collaboration", "Open Collaboration", 4720, 70, 230, 110, false, ""],
    ["222A", "222A Copy/Mail", "Copy/Mail", 4720, 190, 110, 160, false, ""],
    ["222", "222 Kitchen/Break Area", "Kitchen/Break Area", 4840, 190, 110, 160, false, ""],

    ["262", "262 Open Collaboration", "Open Collaboration", 50, 480, 170, 280, false, ""],

    ["TUNGABHADRA", "Tungabhadra", "Huddle Room", 360, 480, 200, 130, false, "3-5"],
    ["TEESTA", "Teesta", "Huddle Room", 360, 620, 200, 140, true, "3-5"],

    ["NARMADA", "Narmada", "Large Conference Room", 1570, 480, 550, 200, false, "13+"],

    ["256A", "256A Open Collaboration", "Open Collaboration", 1570, 690, 170, 90, true, ""],
    ["256B", "256B Open Collaboration", "Open Collaboration", 1750, 690, 170, 90, true, ""],
    ["256C", "256C Open Collaboration", "Open Collaboration", 1930, 690, 170, 90, true, ""],

    ["UMNGOT", "Umngot", "Huddle Room", 2140, 480, 170, 130, false, "3-5"],
    ["TAPI", "Tapi", "Huddle Room", 2140, 620, 170, 140, true, "3-5"],

    ["VAIGAI", "Vaigai", "Huddle Room", 2320, 480, 170, 130, false, "3-5"],
    ["SPITI", "Spiti", "Huddle Room", 2320, 620, 170, 140, true, "3-5"],

    ["ZUARI", "Zuari", "Huddle Room", 3240, 480, 170, 130, false, "3-5"],
    ["SARAYU", "Sarayu", "Huddle Room", 3240, 620, 170, 140, true, "3-5"],

    ["BHARATHAPPUZHA", "Bharathappuzha", "Medium Conference Room", 3560, 480, 440, 130, false, "10-12"],
    ["SUTLEJ", "Sutlej", "Open Collaboration", 3560, 620, 440, 140, true, ""],

    ["200", "200 Reception", "Reception", 4020, 480, 190, 130, false, ""],
    ["GODAVARI", "Godavari", "Interview Room", 4230, 480, 180, 130, false, ""],
    ["SAVITRI", "Savitri", "Small Conference Room", 4020, 620, 390, 140, true, "6-9"],

    ["207", "207 Copy/Mail", "Copy/Mail", 4210, 700, 130, 80, true, ""],
    ["202", "202 Closet", "Closet", 4350, 700, 130, 80, true, ""],

    ["KRISHNA", "Krishna", "Huddle Room", 4580, 480, 160, 130, false, "3-5"],
    ["RAVI", "Ravi", "Huddle Room", 4580, 620, 160, 140, true, "3-5"],

    ["MAHANADI", "Mahanadi", "Huddle Room", 5410, 480, 160, 130, false, "3-5"],
    ["PURNA", "Purna", "Huddle Room", 5410, 620, 160, 140, true, "3-5"],

    ["MANDOVI", "Mandovi", "Huddle Room", 5580, 480, 160, 130, false, "3-5"],
    ["PENNA", "Penna", "Huddle Room", 5580, 620, 160, 140, true, "3-5"],

    ["KAVERI", "Kaveri", "Large Conference Room", 5760, 480, 480, 200, false, "13+"],

    ["236A", "236A Open Collaboration", "Open Collaboration", 5760, 690, 150, 90, true, ""],
    ["236B", "236B Open Collaboration", "Open Collaboration", 5920, 690, 150, 90, true, ""],
    ["236C", "236C Open Collaboration", "Open Collaboration", 6080, 690, 150, 90, true, ""],

    ["PERIYAR", "Periyar", "Huddle Room", 7040, 480, 230, 130, false, "3-5"],
    ["PAVANA", "Pavana", "Huddle Room", 7040, 620, 230, 140, true, "3-5"],

    ["230", "230 Open Collaboration", "Open Collaboration", 7420, 480, 220, 130, false, ""],
    ["232", "232 Open Collaboration", "Open Collaboration", 7420, 620, 220, 140, true, ""],
    ["232A", "232A Open Collaboration", "Open Collaboration", 7660, 620, 190, 140, true, ""],

    ["227A", "227A Open Collaboration", "Open Collaboration", 7480, 70, 190, 120, false, ""],

    ["258", "258 Open Collaboration", "Open Collaboration", 40, 920, 180, 140, true, ""],
    ["258A", "258A Open Collaboration", "Open Collaboration", 40, 1070, 180, 140, true, ""],

    ["BRAHMAPUTRA", "Brahmaputra", "Multipurpose Room", 2950, 920, 820, 320, true, ""],
    ["ALAKANANDA", "Alakananda", "Multipurpose Room", 3790, 920, 820, 320, true, ""]
  ];

  roomData.forEach(function (item) {
    const id = item[0];
    const centreX =
      item[3] +
      item[5] / 2;

    addArea(
      item[0],
      item[1],
      item[2],
      item[3],
      item[4],
      item[5],
      item[6],

      createAccess(
        id,
        centreX,
        item[7]
      ),

      item[8]
    );
  });

  /*
   * Phone spaces.
   */
  function addPhone(
    id,
    name,
    type,
    x,
    y,
    useSouth,
    explicitAccess,
    width,
    height
  ) {
    const finalWidth =
      width || 110;

    const finalHeight =
      height || 90;

    const accessNode =
      explicitAccess ||
      createAccess(
        id,
        x +
          finalWidth / 2,
        useSouth
      );

    addArea(
      id,
      name,
      type,
      x,
      y,
      finalWidth,
      finalHeight,
      accessNode,

      type ===
        "Phone Room"
        ? "1-2"
        : "1"
    );
  }

  const phoneData = [
    ["261", "261 Phone Booth", "Phone Booth", 230, 670, true],

    ["260C", "260C Phone Room", "Phone Room", 580, 480, false],
    ["260B", "260B Phone Room", "Phone Room", 580, 580, false],
    ["260A", "260A Phone Room", "Phone Room", 580, 680, true],

    ["265A", "265A Phone Room", "Phone Room", 700, 480, false],
    ["265B", "265B Phone Room", "Phone Room", 700, 580, false],
    ["259A", "259A Phone Booth", "Phone Booth", 700, 680, true],

    ["264C", "264C Phone Room", "Phone Room", 1020, 100, false],
    ["264B", "264B Phone Room", "Phone Room", 1020, 200, false],
    ["264A", "264A Phone Room", "Phone Room", 1020, 300, false],

    ["250A", "250A Phone Room", "Phone Room", 3430, 480, false],
    ["250B", "250B Phone Room", "Phone Room", 3430, 580, false],
    ["250C", "250C Phone Booth", "Phone Booth", 3430, 680, true],

    ["242", "242 Phone Room", "Phone Room", 4430, 480, false],
    ["241", "241 Phone Room", "Phone Room", 4430, 580, false],
    ["240A", "240A Phone Booth", "Phone Booth", 4430, 680, true],
    ["209", "209 Phone Booth", "Phone Booth", 4550, 680, true],

    ["225A", "225A Phone Room", "Phone Room", 6910, 480, false],
    ["225B", "225B Phone Room", "Phone Room", 6910, 580, false],
    ["233A", "233A Phone Booth", "Phone Booth", 6910, 680, true],

    ["229A", "229A Phone Room", "Phone Room", 7290, 480, false],
    ["229B", "229B Phone Room", "Phone Room", 7290, 580, false],
    ["229C", "229C Phone Room", "Phone Room", 7290, 680, true],
    ["231", "231 Phone Booth", "Phone Booth", 7870, 590, true],

    ["257A", "257A Phone Room", "Phone Room", 1160, 920, true],
    ["257B", "257B Phone Room", "Phone Room", 1160, 1020, true],
    ["257C", "257C Phone Booth", "Phone Booth", 1160, 1120, true],

    ["254B", "254B Phone Booth", "Phone Booth", 1960, 1120, true],
    ["254A", "254A Phone Booth", "Phone Booth", 2070, 1120, true],

    ["253A", "253A Phone Room", "Phone Room", 2200, 920, true],
    ["253B", "253B Phone Room", "Phone Room", 2200, 1020, true],

    ["239A", "239A Phone Room", "Phone Room", 5240, 920, true],
    ["239B", "239B Phone Room", "Phone Room", 5240, 1020, true],
    ["239C", "239C Phone Booth", "Phone Booth", 5240, 1120, true],

    ["235B", "235B Phone Booth", "Phone Booth", 5850, 1120, true],

    ["234A", "234A Phone Room", "Phone Room", 5980, 920, true],
    ["234B", "234B Phone Room", "Phone Room", 5980, 1020, true],
    ["235A", "235A Phone Booth", "Phone Booth", 5980, 1120, true],
    ["234C", "234C Phone Booth", "Phone Booth", 6100, 1120, true]
  ];

  phoneData.forEach(function (item) {
    addPhone(
      item[0],
      item[1],
      item[2],
      item[3],
      item[4],
      item[5]
    );
  });

  /*
   * 226 phone stack.
   */
  floor.areas.push({
    id: "EAST_STAIRCASE",
    label: "East Staircase",
    type: "Staircase",

    x: 5480,
    y: 70,

    width: 300,
    height: 300
  });

  addNode(
    "A226_PHONE",
    5910,
    420
  );

  addEdge(
    "A226_PHONE",
    nearestMain(5910)
  );

  addPhone(
    "226D",
    "226D Phone Booth",
    "Phone Booth",
    5900,
    55,
    false,
    "A226_PHONE",
    90,
    75
  );

  addPhone(
    "226C",
    "226C Phone Room",
    "Phone Room",
    5820,
    145,
    false,
    "A226_PHONE",
    160,
    90
  );

  addPhone(
    "226B",
    "226B Phone Room",
    "Phone Room",
    5820,
    245,
    false,
    "A226_PHONE",
    160,
    90
  );

  addPhone(
    "226A",
    "226A Phone Room",
    "Phone Room",
    5820,
    345,
    false,
    "A226_PHONE",
    160,
    90
  );

  /*
   * Workstation exits.
   */
  const exits = [
    ["A263", 280, 370],
    ["A264", 680, 370],
    ["A266", 1280, 820],

    ["A257", 680, 900],
    ["A254", 1600, 900],
    ["A253", 2600, 900],

    ["A277", 2860, 470],
    ["A213", 5030, 470],

    ["A239", 4930, 900],
    ["A235", 5660, 900],

    ["A225", 6580, 470],

    ["A234W", 6250, 900],
    ["A234C", 7040, 900],
    ["A234E", 7830, 900],

    ["A226", 6410, 450],
    ["A227", 7240, 370]
  ];

  exits.forEach(function (item) {
    addNode(
      item[0],
      item[1],
      item[2]
    );

    addEdge(
      item[0],

      item[2] > 600
        ? nearestSouth(
            item[1]
          )
        : nearestMain(
            item[1]
          )
    );
  });

  function addZone(
    id,
    prefix,
    x,
    y,
    width,
    height,
    columns,
    count,
    zoneExits,
    physicalBanks
  ) {
    const availableExits =
      Array.isArray(
        zoneExits
      )
        ? zoneExits
        : [zoneExits];

    floor.workstationZones.push({
      id: id,
      prefix: prefix,

      x: x,
      y: y,

      width: width,
      height: height,

      columns: columns,
      count: count,

      accessNodes:
        availableExits
    });

    function closestExit(
      deskX,
      deskY
    ) {
      let selected =
        availableExits[0];

      let shortest =
        Infinity;

      availableExits.forEach(
        function (exitId) {
          const point =
            floor.walkingNodes[
              exitId
            ];

          const distance =
            Math.hypot(
              deskX -
                point[0],

              deskY -
                point[1]
            );

          if (
            distance < shortest
          ) {
            shortest =
              distance;

            selected =
              exitId;
          }
        }
      );

      return selected;
    }

    function saveDesk(
      deskId,
      deskX,
      deskY,

      columnLeft,
      columnRight,

      columnIndex,
      totalColumns
    ) {
      const exitId =
        closestExit(
          deskX,
          deskY
        );

      const exitPoint =
        floor.walkingNodes[
          exitId
        ];

      let gapX;

      if (columnIndex === 0) {
        gapX =
          columnRight;
      } else if (
        columnIndex ===
        totalColumns - 1
      ) {
        gapX =
          columnLeft;
      } else {
        gapX =
          Math.abs(
            deskX -
              columnLeft
          ) <=
          Math.abs(
            columnRight -
              deskX
          )
            ? columnLeft
            : columnRight;
      }

      const internalBoundaryY =
        exitPoint[1] <
        y + height / 2
          ? y + 12
          : y +
            height -
            12;

      floor.workstations[
        deskId
      ] = {
        id:
          "desk:" +
          deskId,

        name:
          deskId,

        x:
          deskX,

        y:
          deskY,

        accessNode:
          exitId,

        egressPoints: [
          [
            gapX,
            deskY
          ],

          [
            gapX,
            internalBoundaryY
          ],

          [
            exitPoint[0],
            internalBoundaryY
          ]
        ]
      };
    }

    if (physicalBanks) {
      const bankWidth =
        width /
        physicalBanks.length;

      physicalBanks.forEach(
        function (
          bank,
          columnIndex
        ) {
          const rowHeight =
            height /
            bank.length;

          const columnLeft =
            x +
            columnIndex *
              bankWidth;

          const columnRight =
            columnLeft +
            bankWidth;

          bank.forEach(
            function (
              number,
              rowIndex
            ) {
              const deskId =
                prefix +
                "." +
                String(
                  number
                ).padStart(
                  2,
                  "0"
                );

              saveDesk(
                deskId,

                columnLeft +
                  bankWidth /
                    2,

                y +
                  rowIndex *
                    rowHeight +
                  rowHeight /
                    2,

                columnLeft,
                columnRight,

                columnIndex,
                physicalBanks
                  .length
              );
            }
          );
        }
      );

      return;
    }

    const rows =
      Math.ceil(
        count /
        columns
      );

    const cellWidth =
      width /
      columns;

    const cellHeight =
      height /
      rows;

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const columnIndex =
        index %
        columns;

      const rowIndex =
        Math.floor(
          index /
          columns
        );

      const columnLeft =
        x +
        columnIndex *
          cellWidth;

      const columnRight =
        columnLeft +
        cellWidth;

      const deskId =
        prefix +
        "." +
        String(
          index + 1
        ).padStart(
          2,
          "0"
        );

      saveDesk(
        deskId,

        columnLeft +
          cellWidth / 2,

        y +
          rowIndex *
            cellHeight +
          cellHeight / 2,

        columnLeft,
        columnRight,

        columnIndex,
        columns
      );
    }
  }

  const zones = [
    ["ZONE263", "263", 250, 80, 180, 270, 2, 8, "A263"],
    ["ZONE264", "264", 450, 70, 560, 280, 6, 36, "A264"],

    ["ZONE266", "266", 820, 480, 730, 280, 8, 40, "A266"],

    ["ZONE277", "277", 2510, 480, 710, 280, 7, 35, "A277"],

    ["ZONE213", "213", 4660, 480, 730, 280, 7, 35, "A213"],

    ["ZONE225", "225", 6260, 480, 630, 280, 8, 40, "A225"],

    ["ZONE226", "226", 6010, 70, 810, 365, 6, 36, "A226"],

    ["ZONE227", "227", 7000, 100, 460, 250, 2, 8, "A227"],

    ["ZONE257", "257", 240, 920, 900, 320, 11, 44, "A257"],

    ["ZONE254", "254", 1290, 920, 650, 320, 9, 34, "A254"],

    ["ZONE253", "253", 2330, 920, 600, 320, 7, 28, "A253"],

    ["ZONE239", "239", 4630, 920, 590, 320, 7, 28, "A239"],

    ["ZONE235", "235", 5370, 920, 590, 320, 7, 35, "A235"]
  ];

  zones.forEach(function (zone) {
    addZone(
      zone[0],
      zone[1],
      zone[2],
      zone[3],
      zone[4],
      zone[5],
      zone[6],
      zone[7],
      zone[8]
    );
  });

  const banks234 = [
    [41, 42, 43, 44],
    [40, 39, 38, 37],
    [33, 34, 35, 36],
    [32, 31, 30, 29],
    [25, 26, 27, 28],
    [24, 23, 22, 21],
    [17, 18, 19, 20],
    [16, 15, 14, 13],
    [9, 10, 11, 12],
    [8, 7, 6, 5],
    [1, 2, 3, 4]
  ];

  addZone(
    "ZONE234",
    "234",

    6240,
    920,

    1600,
    320,

    11,
    44,

    [
      "A234W",
      "A234C",
      "A234E"
    ],

    banks234
  );

  return floor;
})();
