module.exports = {
  every: (result, worker) => {
    console.log('Callback:', result);
  },
  error: (err, worker) => {
    console.error('Error:', err);
  },
  all: (result) => {
    console.log('All task finished:', result);
  }
};
