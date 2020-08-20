# 1. 从一道面试题说起：GET 请求能传图片吗？

[文章](https://juejin.im/post/6860253625030017031)

- 正常情况，file 对象数据是放在 POST 请求的 body 里面，并且是 form-data 编码。

- 那么 GET 请求能否有 body 体呢？答案是可以有。
- GET 和 POST 并没有本质上的区别，他们只是 HTTP 协议中两种请求方式，仅仅是报文格式不同（或者说规范不同）。

举个栗子, 一个普通的 GET 请求，他们收到是这样的：

```js
GET /test/?sex=man&name=zhangsan HTTP/1.1
Host: http://localhost:8080
Accept: application/json, text/plain, */*
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: Keep-Alive

```

POST 请求长这样：

```js
POST /add HTTP/1.1
Host: http://localhost:8080
Content-Type: application/x-www-form-urlencoded
Content-Length: 40
Connection: Keep-Alive

sex=man&name=Professional

```

综上所述，GET 请求是可以传图片的，但是 GET 和 POST 的规范还是要遵守的，如果有后台让你这么做，锤他就行了!

# 2. 一道价值 25k 的蚂蚁金服异步串行面试题 note1/2.js

[文章](https://juejin.im/post/6860646761392930830)
