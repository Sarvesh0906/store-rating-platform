const app = require('./app');
const { syncDatabaseSequences } = require('./utils/sequenceSync');

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await syncDatabaseSequences();
    console.log('Database sequences synced');
  } catch (error) {
    console.error('Unable to sync database sequences', error);
  }

  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}

startServer();
