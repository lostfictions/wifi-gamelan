const wifi = require("node-wifi");
const max = require("./max-api");

max.post(`Loaded script: '${__filename}'`);

wifi.init({ iface: null });

let timer;

async function scan() {
  const networks = await wifi.scan();
  return networks
    .filter(n => n.ssid)
    .map(({ ssid, signal_level }) => [ssid, signal_level + 100])
    .sort((a, b) => b[1] - a[1]);
}

function startScanning(interval = 10000) {
  scan().then(networks =>
    networks.forEach(([ssid, level]) => max.post(`${ssid} - ${level}`))
  );

  timer = setInterval(async () => {
    max.post("scanning...");
    const networks = await scan();
    networks.forEach(([ssid, level]) => max.outlet(ssid, level));
  }, interval);
}

max.addHandler("startScanning", interval => {
  max.post("initializing scanning...");
  const i = parseInt(interval);
  if (!isNaN(i)) {
    startScanning(i);
  } else {
    startScanning();
  }
});

max.addHandler("stopScanning", () => {
  max.post("ending scanning...");
  clearInterval(timer);
});
