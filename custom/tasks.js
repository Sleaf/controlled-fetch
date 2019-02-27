/**
 * 支持以下格式：
 * - 数组 Array
 * - 迭代生成器 Function*
 * */
function* makeIterator() {
  let index = 0;
  while (index < 1000)
    yield index++;
}

// module.exports = makeIterator();
module.exports =[];
