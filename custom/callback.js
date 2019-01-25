module.exports = {
  every: (result) => {
    console.log('callback:', result);
  },
  all: (result) => {
    console.log('all finished', result);
  }
};
