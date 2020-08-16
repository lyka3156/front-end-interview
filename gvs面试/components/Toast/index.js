/**
 * toast
 */
import { Toast, Modal } from "antd-mobile";
import React from "react";
import ToastContent from "../toastContent";
import loading from "../Loading";
import intl from "react-intl-universal";
// 引入ant design的Toast
// const fail = (message, duration = 1) => Toast.fail(message, duration);
// const success = (message, duration = 1) => Toast.success(message, duration);
// const info = (message, duration = 1) => Toast.info(message, duration);

const tips = (message, duration = 1) =>
  Toast.info(<ToastContent text={message} />, duration);
//const loading = (message, duration = 0) => Toast.loading(message, duration);
const hide = () => Toast.hide();

// 也是引入ant design的，只不过自定义了message样式
const fail = (message, duration = 3) =>
  Toast.info(<ToastContent text={message} type="fail" />, duration);
const success = (message, duration = 3) =>
  Toast.info(<ToastContent text={message} type="success" />, duration);
const info = (message, duration = 3) =>
  // Toast.info(<ToastContent text={message} type="info" />, duration);
  Modal.alert(intl.get("tips"), message, [
    { text: intl.get("ok"), onPress: () => console.log("ok") }
  ]);

export default {
  fail,
  success,
  info,
  loading,
  hide,
  tips
};
