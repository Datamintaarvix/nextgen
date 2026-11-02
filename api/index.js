let app;
try {
  app = require('../server');
} catch (e) {
  app = require('../nextgen-dma-ventures-v4/nextgen-dma-ventures/server');
}
module.exports = app;
