let max;
try {
  max = require("max-api");
} catch (e) {
  console.log(`can't load max api`);
  max = {
    post(...mess) {
      console.log(`[max.post] `, ...mess);
    },
    outlet(...data) {
      console.log(`[max.outlet] `, ...data);
    },
    addHandler() {}
  };
}

module.exports = max;
