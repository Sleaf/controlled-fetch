const cluster = require('cluster');
if (cluster.isMaster) {
  /*
  * Main process
  * code will exec only once
  * */
  const numCPUs = require('os').cpus().length;
  const tasks = require('./tasks');
  const { every, all } = require('./callback');
  const results = [];
  const askForTask = worker => {
    if (tasks.length > 0) {
      worker.send(tasks.pop())
    } else {
      worker.disconnect();
      if (Object.keys(cluster.workers).length === 0) {
        //all tasks finished
        all(results);
      }
    }
  };
  const onMessage = worker => payload => {
    //worked data
    every(payload);
    results.push(payload);
    //next task
    askForTask(worker)
  };
  // fork workers.
  for (let i = 0; i < numCPUs * 2; i++) {
    const worker = cluster.fork();
    worker.on('message', onMessage(worker));
    askForTask(worker);
  }
} else {
  const reducer = require('./reducer');
  process.on('message', msg => reducer(msg).then(
    res => process.send(res),
    err => {
      console.error(err);
      process.disconnect();
    }
  ));
}
