/**
 * request
 */

import { BASE_API } from "../config";
import Toast from "Components/Toast";
import { Modal } from "antd-mobile";
import {
  generateUuid,
  getQueryString,
  isRunByApp,
  emailUp,
  maintain,
  ToastInfo,
} from "Utils/helper";
import Nprogress from "nprogress";
import "nprogress/nprogress.css";
import { Session, Application } from "../storage";
import React from "react";
import { createHashHistory } from "history";
import intl from "react-intl-universal";
import { fetch } from "whatwg-fetch";
const history = createHashHistory();
const alert = Modal.alert;

/**
 * request
 * @param {*} 请求配置
 */
export default async function ({
  url,
  method = "get",
  data = {},
  headers = { "Content-Type": "application/json" },
  loading = false,
  timeout = 2000,
}) {
  // check network
  if (!window.navigator.onLine) {
    // Toast.fail("没有网络");
    Toast.fail(intl.get("requestTips3"));
    return;
  }

  // fetch promise
  const fetchPromise = new Promise((resolve, reject) => {
    let requestConfig = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff", //防止基于 MIME 类型混淆的攻击
        "X-XSS-Protection": "1;mode=block", //检测到跨站脚本攻击 (XSS)时，浏览器将停止加载页面
      },
    };

    //url
    url =
      url.includes("http://") || url.includes("https://")
        ? url
        : BASE_API + url;

    console.log(headers, requestConfig.headers);
    // lang
    requestConfig.headers.lang =
      Session.get("lang_type") || Application.get("lang_type") || "zh";
    // 请求序号
    let requestNo = Session.get("requestNo");
    if (!requestNo) {
      requestNo = generateUuid();
      Session.set("requestNo", requestNo);
    }
    requestConfig.headers.reqno = requestNo;
    // header
    if (Object.keys(headers).length !== 0) {
      Object.assign(requestConfig.headers, headers);
    }
    // token
    let token = Session.get("token") || Application.get("token");
    // console.log(
    //   Session.get("token"),
    //   "1111111111111",
    //   Application.get("token")
    // );
    if (token) {
      requestConfig.headers.token = token;
    }
    if (!requestConfig.headers.token) {
      delete requestConfig.headers.token;
    }
    console.log("token", requestConfig.headers);
    // method & data
    if (method.toLowerCase() === "post") {
      // TODO
      // 交易编号
      data.transactionNo = data.transactionNo || Session.get("transactionNo");
      if (!data.transactionNo) {
        data.transactionNo = "";
      }
      // transfer编号
      data.transferNo =
        Session.get("transferNo") || getQueryString("transferNo") || "";
      // form or json
      const contentType = requestConfig.headers["Content-Type"];
      if (contentType === "application/json") {
        Object.defineProperty(requestConfig, "body", {
          value: JSON.stringify(data),
        });
      } else if (contentType === "x-www-form-urlencoded") {
        // 表单文件上传
        const form = new FormData();
        Object.keys(data).forEach((key) => {
          form.append(key, data[key]);
        });
        // form.append("file", data["file"]);
        // console.log("xxx", form);
        requestConfig.body = form;
        // Object.defineProperty(requestConfig, "body", {
        //   form
        // });
        // headers["Content-Type"] = "multipart/form-data; boundary=%s";
        delete requestConfig.headers["Content-Type"];
      }
    } else if (method.toLowerCase() === "get") {
      if (Object.keys(data).length !== 0) {
        const str = Object.entries(data)
          .reduce((acc, cur) => acc.concat(cur.join("=")), [])
          .join("&");
        url += "?" + str;
      }
    }
    // header 里公共参数
    requestConfig.headers = {
      ...requestConfig.headers,
      version: 1, // 服务版本号
      source: isRunByApp() ? "APP" : "WECHAT", //来源
      //requestNo: new Date().getTime() // 请求序号
    };

    fetch(url, requestConfig)
      .then((response) => {
        // console.log(11111111);
        // 数据检验
        return response;
      })
      .then((response) => {
        console.log(response, "请求响应结果", url);
        maintain(); // 跳转维护页面
        if (response) {
          if (["500", "502", "503"].find((item) => item == response.status)) {
            console.log("接口请求返回的错误", response);
            history.replace("/systemUpgrade");
            // code为1并且接口不包含message/notice/sendBusinessNotice
            if (
              ![
                "message/sendLoginSMSService",
                "account/sendCaptcha",
                "message/notice/sendBusinessNotice",
              ].find((noUrl) => url.includes(noUrl))
            ) {
              emailUp(url, JSON.stringify(data));
            }
          }
        }
        // 解析数据
        let responseData;
        switch (requestConfig.headers.Accept) {
          // json
          case "application/json":
            responseData = response.json();
            break;
          // 文本
          case "text/html":
            responseData = response.text();
            break;
          // 文件下载
          case "application/octet-stream":
            console.log(response);
            const blob = response.blob();
            const a = document.createElement("a");
            const fileurl = window.URL.createObjectURL(blob); // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
            const filename = response.headers.get("Content-Disposition");
            a.href = fileurl;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(fileurl);
            break;
        }
        return responseData;
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        Nprogress.done();
        console.log("请求报错", error);
        // history.replace("/systemUpgrade");
        // Toast.info(error.message);
        // if (!url.includes("message/notice/sendBusinessNotice")) {
        //   emailUp(url, JSON.stringify(error));
        // }
      });
  });

  const timeoutPromise = new Promise(function (resolve, reject) {
    // const time = setTimeout(() => {
    //   clearTimeout(time);
    //   reject(new Error("请求超时"));
    // }, timeout);
  });

  // 小菊花
  // loading && Toast.loading('loading');
  loading && Nprogress.start();
  try {
    let result = await Promise.race([fetchPromise, timeoutPromise]);
    loading && Nprogress.done();
    if (result.type === "file") {
      let { blob, filename } = result;
      blob.then((data) => {
        const a = document.createElement("a");
        const fileurl = window.URL.createObjectURL(data); // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
        a.href = fileurl;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(fileurl);
      });
    } else {
      // 业务逻辑code 200为成功
      if (+result.code === 0) {
        result.status = true;
      } else if (result.code === "10") {
        alert(
          intl.get("tips") || "提示",
          intl.get("requestTips1") || "账号在别处登录,请重新登录",
          [
            {
              text: intl.get("sureBack") || "确定",
              onPress: () => {
                // Session.remove("token");
                Session.clear();
                Application.remove("token");
                if (isRunByApp()) {
                  // app
                  console.log("app重新登录");
                  history.replace("/login");
                  // window.location.reload();
                } else {
                  // 微信
                  console.log("微信重新登录");
                  // window.location.reload();
                }
              },
            },
          ]
        );
      } else if (result.code === "11") {
        alert(
          intl.get("tips") || "提示",
          intl.get("requestTips2") || "登录过期，请重新登录",
          [
            {
              text: intl.get("sureBack") || "确定",
              onPress: () => {
                // Session.remove("token");
                Session.clear();
                Application.remove("token");
                if (isRunByApp()) {
                  // app
                  console.log("app重新登录");
                  history.replace("/login");
                  // window.location.reload();
                } else {
                  // 微信
                  console.log("微信重新登录");
                  // window.location.reload();
                }
              },
            },
          ]
        );
      } else {
        Toast.fail(result.msg);
      }
      return result;
    }
  } catch (error) {
    Toast.fail(error.message);
    Nprogress.done();
  }
}
