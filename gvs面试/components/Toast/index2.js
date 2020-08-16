/**
 *  Toast组件比较特殊
 *  因为<Toast />不会被直接渲染在DOM中
 *  而是动态插入页面中
 *  Toast组件核心就是通过Notification暴露的重写方法 动态改变Notification
 */
import Notification from "./notification";

let newNotification;

/**
 * 获得一个Notification
 * 单例 保持页面始终只有一个Notification
 */
const getNewNotification = () => {
  if (!newNotification) {
    newNotification = Notification.newInstance();
  }
  return newNotification;
};

// notice方法实际上就是集合参数 完成对Notification的改变
const notice = (content, type, icon, duration, onClose, mask = true) => {
  let notificationInstance = getNewNotification();

  notificationInstance.notice({
    duration,
    type,
    mask,
    icon,
    content,
    onClose: () => {
      if (onClose) onClose();
      hide(); //  hide
    }
  });
};

/**
 * 隐藏
 */
const hide = () => {
  if (newNotification) {
    newNotification.destroy();
    newNotification = null;
  }
};

export default {
  // 无动画
  show(content, duration, icon, mask, onClose) {
    return notice(content, undefined, icon, duration, onClose, mask);
  },
  // 翻转效果
  info(content, duration, icon, mask, onClose) {
    return notice(content, "info", icon, duration, hide, mask);
  },
  // 缩放效果
  success(content, duration, icon, mask, onClose) {
    return notice(content, "success", icon, duration, hide, mask);
  },
  // 从下方滑入
  warning(content, duration, icon, mask, onClose) {
    return notice(content, "warning", icon, duration, onClose, mask);
  },
  // 抖动
  error(content, duration, icon, mask, onClose) {
    return notice(content, "error", icon, duration, onClose, mask);
  },
  // 失败
  fail(content, duration, icon, mask, onClose) {
    return notice(content, "error", icon, duration, onClose, mask);
  },
  // 销毁
  hide() {
    if (newNotification) {
      newNotification.destroy();
      newNotification = null;
    }
  }
};
