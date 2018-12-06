const wifi = require("node-wifi");
const max = require("./max-api");

const REMOVED_DECAY_RATE = 0.6;
const DEFAULT_SCAN_INTERVAL = 6000;
const MIN_BPM = 90;
// const MAX_BPM = 130;
const MIN_BEAT_INTERVAL = (1 / (MIN_BPM / 60)) * 1000;
// const MAX_BEAT_INTERVAL = (1 / (MAX_BPM / 60)) * 1000;

max.post(`Loaded script: '${__filename}'`);

wifi.init({ iface: null });

/** setInterval id for the network scanner. */
let scanTimer;

/** setInterval id for the beat emitter. */
let beatTimer;

const state = {};

async function scan() {
  const networks = await wifi.scan();
  const networkList = {};
  networks
    .filter(n => n.ssid && n.ssid.trim().length > 0 && n.mac)
    .sort((a, b) => b.signal_level - a.signal_level)
    .forEach(n => {
      networkList[n.ssid] = {
        mac: n.mac,
        level: (n.signal_level + 100) / 100
      };
    });

  // First, unflag any networks flagged to remove if they came back.
  for (const [ssid, obj] of Object.entries(state)) {
    if (ssid in networkList) {
      obj.level = networkList[ssid].level;
      obj.removed = false;
    } else {
      if (!obj.removed) {
        max.post(`removing network: ${ssid}`);
        obj.removed = true;
      }
    }
  }

  const addedNetworks = Object.keys(networkList).filter(
    ssid => !(ssid in state)
  );

  for (const added of addedNetworks) {
    max.post(`adding network: ${added}`);
    state[added] = {
      ...networkList[added],
      notes: [
        // TODO: bitbuffer to pick notes
        [randomInt(0, 16), randomInt(0, 16)],
        [randomInt(0, 16), randomInt(0, 16)],
        [randomInt(0, 16), randomInt(0, 16)],
        [randomInt(0, 16), randomInt(0, 16)],
        [randomInt(0, 16), randomInt(0, 16)],
        [randomInt(0, 16), randomInt(0, 16)]
      ],
      note: 0,
      volume: 0,
      removed: false
    };
  }
}

function beat() {
  const toRemove = [];

  // TODO: don't slice...? figure out a way to play everything...?
  // for (const [ssid, obj] of Object.entries(state)) {
  let i = -1;
  for (const [ssid, obj] of Object.entries(state).slice(0, 2)) {
    i += 1;
    const currentNotes = obj.notes[obj.note];
    for (const note of currentNotes) {
      // notes 10-15 are silence!
      if (note < 10) {
        // Slight random delay to humanize!
        const time = randomInt(0, 30) + i * 100;

        setTimeout(() => {
          max.outlet(note, obj.volume * obj.level);
        }, time);
      }
    }

    obj.note = (obj.note + 1) % 6;
    if (obj.removed) {
      obj.volume *= REMOVED_DECAY_RATE;
      if (obj.volume <= 0.05) {
        toRemove.push(ssid);
      }
    } else {
      if (obj.volume < 1) {
        obj.volume = Math.min(obj.volume + 0.1, 1);
      }
    }
  }

  for (const ssid of toRemove) {
    delete state[ssid];
  }
}

// Interval functions

function startScanning(interval) {
  max.post("initializing scanning...");

  let i = parseInt(interval);
  if (isNaN(i)) {
    i = DEFAULT_SCAN_INTERVAL;
  }

  scan(); // Kick off a first scan immediately

  scanTimer = setInterval(scan, i);
}

function startBeat() {
  beatTimer = setInterval(beat, MIN_BEAT_INTERVAL);
}

// Max handlers

max.addHandler("startScanning", interval => {
  startScanning(interval);
});

max.addHandler("stopScanning", () => {
  max.post("ending scanning...");
  clearInterval(scanTimer);
});

max.addHandler("startAll", scanInterval => {
  startScanning(scanInterval);
  startBeat();
});

max.addHandler("stopAll", () => {
  clearInterval(scanTimer);
  clearInterval(beatTimer);
});

// Util

/**
 * @param {number} min
 * @param {number?} max
 */
function randomInt(min, max) {
  if (typeof max === "undefined") {
    max = min;
    min = 0;
  }
  if (max < min) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min)) + min;
}
