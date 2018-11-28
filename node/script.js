const Max = require("max-api");
const wifi = require("node-wifi");

Max.post(`Loaded script: '${__filename}'`);

// Max.addHandler("bang", () => {
//   Max.post("got a bang!");
// });

// Max.outlet

wifi.init({ iface: null });

let timer;

async function scan() {
  const networks = await wifi.scan();
  return networks
    .filter(n => n.ssid)
    .map(({ ssid, signal_level }) => [ssid, parseInt(signal_level) + 100])
    .sort((a, b) => b[1] - a[1]);
}

function startScanning(interval = 10000) {
  scan().then(networks =>
    networks.forEach(([ssid, level]) => Max.post(`${ssid} - ${level}`))
  );

  timer = setInterval(async () => {
    Max.post("scanning...");
    const networks = await scan();
    // networks.forEach(([ssid, level]) => Max.post(`${ssid} - ${level}`));
    networks.forEach(([ssid, level]) => Max.outlet(ssid, level));
  }, interval);
}

Max.addHandler("startScanning", interval => {
  Max.post("initializing scanning...");
  const i = parseInt(interval);
  if (!isNaN(i)) {
    startScanning(i);
  } else {
    startScanning();
  }
});

Max.addHandler("stopScanning", () => {
  Max.post("ending scanning...");
  clearInterval(timer);
});
