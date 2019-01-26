module.exports = {
  every: (result) => {
    console.log('callback:', result);
  },
  error: (err, worker) => {
    console.error(err);
    worker.disconnect();
  },
  all: (result) => {
    console.log('all finished', result);
  }
};
