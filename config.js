const numCPUs = require('os').cpus().length;

module.exports = {
  //并发线程数
  processNum: numCPUs * 2,
  //每个线程并行执行数量
  parallelNum: 10,//todo unfinished
};
