const cluster = require('cluster');
const { processNum, parallelNum } = require('./config');
const { callbackPath, taskPath, reducerPath } = require('minimist')(process.argv);
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
  const { every, error, all } = require(callbackPath || './custom/callback');
  let tasks = require(taskPath || './custom/tasks');
  let askForTask;
  if (Array.isArray(tasks)) {
    /*task是一个简单数组*/
    askForTask = worker => worker.send({
      code: tasks.length > 0 ? 200 : 0,
      payload: tasks.shift(),
    });
  } else if (tasks && tasks.next) {
    /*task是一个可调用next方法的生成器*/
    askForTask = worker => {
      let nextValue = tasks.next();
      return worker.send({
        code: nextValue.done ? 0 : 200,
        payload: nextValue.value,
      });
    }
  } else {
    throw new Error('Tasks should be [Array] or [Function*] !');
  }
  const results = [], errors = [];
  const onTaskFinished = worker => ({ code, payload }) => {
    switch (code) {
      case 0:
        worker.disconnect();
        if ((results.length > 0 || errors.length > 0) && Object.keys(cluster.workers).length === 0) {
          //all tasks finished
          all(results);
        }
        return;
      case 100:
        return askForTask(worker);
      case 200:
        //worked data
        const mappedPayload = every(payload, worker);
        return results.push(mappedPayload != null ? mappedPayload : payload);
      case 400:
        const mappedError = error(payload, worker);
        return errors.push(mappedError != null ? mappedError : payload);
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
  const taskPool = Array(parallelNum).fill(false);
  const reducer = require(reducerPath || './custom/reducer');
  const askTask = () => taskPool.some(i => !i) && process.send({ code: 100 });
  const onGetNewTask = ({ code, payload }) => {
    switch (code) {
      case 200:
        const insertIndex = taskPool.indexOf(false);
        taskPool[insertIndex] = reducer(payload).then(
          res => {
            taskPool[insertIndex] = false;
            process.send({ code: 200, payload: res });
            askTask();
          },
          err => {
            taskPool[insertIndex] = false;
            process.send({ code: 400, payload: err });
            askTask();
          },
        );
        break;
      case 0:
        //wait for rest task and disconnect after all done.
        taskPool.every(i => !i) && process.send({ code: 0 });
    }
  };
  askTask();//get first task
  process.on('message', onGetNewTask);
}
