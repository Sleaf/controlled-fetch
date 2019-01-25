const cluster = require('cluster');
const { processNum, parallelNum } = require('./config');
/*
* 通讯结构:
* master => worker
* {
*   code: 0(no task) / 200(normal)
*   payload: <Any>
* }
*
* worker => master
* {
*   code: 0(finished) / 100(query task) / 200(normal) / 400(error)
*   payload: <Any>
* }
* */

if (cluster.isMaster) {
  /*
  * Master process
  * codes will exec only once
  * */
  const tasks = require('./custom/tasks');
  const { every, all } = require('./custom/callback');
  const results = [];
  const askForTask = worker => {
    if (tasks.length > 0) {
      worker.send({
        code: 200,
        payload: tasks.shift(),
      })
    } else {
      // worker.send({
      //   code: 0,
      // });
      worker.disconnect();//todo remove
      if (results.length > 0 && Object.keys(cluster.workers).length === 0) {
        //all tasks finished
        all(results);
      }
    }
  };
  const onTaskFinished = worker => ({ code, payload }) => {
    switch (code) {
      case 100:
        return askForTask(worker);
      case 200:
        //worked data
        const mappedPayload = every(payload);
        results.push(mappedPayload != null ? mappedPayload : payload);
        //next task
        return askForTask(worker);
      case 400:
        console.error(payload);
        return worker.disconnect();
      default:
    }
  };
  // fork workers.
  for (let i = 0; i < processNum; i++) {
    const worker = cluster.fork();
    worker.on('message', onTaskFinished(worker));
  }
} else {
  /*
  * Worker process
  * codes will run many times!
  * */
  const reducer = require('./custom/reducer');
  const onGetNewTask = ({ code, payload }) => {
    switch (code) {
      case 200:
        return reducer(payload).then(
          res => process.send({ code: 200, payload: res }),
          err => process.send({ code: 400, payload: err })
        );
      case 0:
      //wait for rest task and disconnect after all done.
    }
  };
  process.send({ code: 100, payload: null });//get first task
  process.on('message', onGetNewTask);
}
