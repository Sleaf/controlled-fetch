# Controlled fetch
> 自用辣鸡爬虫基础设施
- 采用 `cluster` / `Promise` 实现多进程并行并发

## 支持执行参数附加文件
```bash
  node index.js  \
  --callbackPath 'PATH_OF_YOUR_FILE' \ 
  --taskPath 'PATH_OF_YOUR_FILE' \
  --reducerPath 'PATH_OF_YOUR_FILE'
```

## 文件说明(所有文件均为导出对象)
> * 文件**单次**执行：`task.js` `callback.js` 
> * 文件**多次**执行(建议使用纯函数)：`reducer.js` `config.js`
- **config.js**:  请直接参阅文件
- **/custom/reducer.js**:
```javascript
module.exports = function(task):Promise {
  // (Task)=>Promise 用于处理每次传入的task,返回值必须为Promise
  // Promise.resolve将会被打印在控制台，当前子进程将会被杀死
};
```
- **/custom/task.js**:
```javascript
module.exports = [
  // <Any> 用于定义每次传入reducer的值
]
```
- **/custom/callback.js**:
```javascript
module.exports = {
  every:function(result,worker) {
    //(Result,Worker)=>Any,  完成 **每次** 任务中resolve之后的值，如果有非null返回值将会被塞入最终结果,worker为执行任务的子进程
  },
  error:function(err,worker) {
    //(Error,Worker)=>Any,  完成 **每次** 任务中reject之后的值，如果有非null返回值将会被塞入最终结果,，worker为执行任务的子进程
  },
  all:function(result:Array,errors:Array) {
    //([Result],[Error])=>Any  完成 **所有** 任务之后的回调（与every调用顺序一致）,[Result]与[Error]均为空则不调用
  },
}
```
