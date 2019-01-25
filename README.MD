# Controlled fetch
> 自用辣鸡爬虫基础设施
- 采用`cluster`实现多进程并行


## 文件说明(所有文件均为导出对象)
> * 文件**单次**执行：`task.js` `callback.js` 
> * 文件**多次**执行(建议使用纯函数)：`reducer.js`
- **reducer.js**:
```javascript
module.exports = function(task):Promise {
  // (Task)=>Promise 用于处理每次传入的task,返回值必须为Promise
  // Promise.resolve将会被打印在控制台，当前子进程将会被杀死
};
```
- **task.js**:
```javascript
module.exports = [
  // <Any> 用于定义每次传入reducer的值
]
```
- **callback.js**:
```javascript
module.exports = {
  every:function(result) {
    //(Result)=>Any,  完成 **每次** 任务中resolve之后的值，如果有非null返回值将会被塞入最终结果
  },
  all:function(result:Array) {
    //([Result])=>Any  完成 **所有** 任务之后的回调（不保证顺序）
  },
}
```
