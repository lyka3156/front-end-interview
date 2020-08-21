const response = require("./data.js");

/**
 * 功能： 将以下字段重新设置赋值
 * - treeNode =>  policyTree
 *    - childNodes => children
 *      - objectInfo => userObject
 *      - menus => menuList
 * - listNode => documentList
 */

let { treeNode, listNode = [], indicators } = response.data; // 后台返回的response

function encapsulationData(rootTree) {
  // 1. 将除了childNodes子节点的数据除外的其他属性封装成 userObject 对象
  let { childNodes = [], objectInfo, ...userObject } = rootTree;
  let isDocument = userObject.nodeType === "DOCUMENT";
  // 1.1 遍历到文档层，就把他的子元素填充到pageList中，就不需要处理他的子节点childNodes了
  if (isDocument) {
    userObject.pageList = childNodes.map((pageNode) => {
      let { objectInfo, ...otherProp } = pageNode; // 取出objectInfo ，还有除了他的所有属性集合
      let { menus: menuList, ...otherObjectInfo } = objectInfo; // 去除menus 数据，还有除了他的所有属性集合
      return { ...otherProp, menuList, ...otherObjectInfo };
    });
  }
  // 1.2 将objectInfo 对象也封装到 userObject对象中
  if (objectInfo) {
    let { menus: menuList, ...otherObj } = objectInfo; // 将menus设置成menuList
    userObject = { ...userObject, ...otherObj, menuList };
  }
  // 1.3 设置目录名称
  userObject.folderName = userObject.nodeName; // 节点名称

  // 2. 封装children
  let children = isDocument ? [] : childNodes; // 遍历到文档就不需要children了
  // 遍历递归修改子节点
  children = children.map((treeNode) => {
    return encapsulationData(treeNode);
  });
  let result = {
    children,
    userObject,
  };
  !result.children.length && delete result.children; // children没有就删除
  return result;
}

// 1. 将 treeNode 封装成 policyTree
let policyTree = encapsulationData(treeNode);
policyTree.userObject &&
  (policyTree.userObject.policyNo = policyTree.userObject.nodeName); // 设置根节点名称
// 2. 将 listNode 封装成 documentList
let documentList = listNode.map((document) => {
  let {
    description: formDescription,
    status: statusIndicator,
    ...props
  } = document;
  return {
    formDescription,
    statusIndicator,
    ...props,
  };
});
// 3. 将数据整合之后返回
let newData = { policyTree, documentList, indicators };
response.data = newData;

console.log(JSON.stringify(response));
