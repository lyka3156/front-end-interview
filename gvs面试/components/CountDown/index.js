/**
 * 倒计时
 */
import React from "react";
import { InputItem } from "antd-mobile";
import Toast from "Components/Toast";
import API from "Utils/api";
import Request from "Utils/request";
import Validate from "Utils/validate";
import intl from "react-intl-universal";
import { ToastInfo, isZh } from "Utils/helper";
import "./style";
class Index extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendMsgStop: true,
      validateCode: "",
      time: this.props.time || 60,
      disabled: false,
      styleChange: false
    };
  }

  /**
   * 发送验证码
   */
  fnCountdown = async () => {
    const { fnSendCode, fnMobile, searchBarValue = "", fnGraphic } = this.props;
    const { sendMsgStop } = this.state;
    const mobile = fnMobile();
    const validateMobile = Validate.mobile(mobile);
    let fncode = "";
    if (fnGraphic) {
      fncode = fnGraphic();
    }
    if (validateMobile !== true) {
      ToastInfo(validateMobile, 1);
      return;
    }
    // "请输入图形验证码"
    if (fncode) {
      if (!fncode.code) {
        ToastInfo(intl.get("verificationCodeTips1"), 1);
        return;
      }
      // 校验验证码
      const res = await Request({
        url: API.vertify.checkCode,
        method: "POST",
        loading: true,
        data: {
          ...fncode
        }
      });
      console.log(res);
      if (res.status) {
        if (res.data == false) {
          // ToastInfo(
          //   intl.get("pleaseEnterCorrect", {
          //     type: intl.get("graphicCertifyCode")
          //   })
          // );
          ToastInfo(intl.get("errorGraphicVerificationCode"));
          return;
        }
      }
    }

    // if (fncode && !fncode.cGraph) {
    //   // "请输入图形验证码"
    //   ToastInfo(intl.get("verificationCodeTips1"), 1);
    //   return;
    // }
    // if (fncode && !fncode.oGraphFlag) {
    //   // "请输入正确的图形验证码"
    //   ToastInfo(intl.get("verificationCodeTips2"), 1);
    //   return;
    // }
    this.setState({
      // disabled: true,
      styleChange: true
    });

    this.setState({
      sendMsgStop: false,
      disabled: false
    });
    this.props.changeState({
      isSendMsg: true,
      isOutDate: false
    }); //修改验证码标识
    let i = this.props.time || 60;
    this.timer = setInterval(() => {
      this.setState({
        time: --i
      });
      if (i < 1) {
        clearInterval(this.timer);
        this.setState(
          {
            sendMsgStop: true,
            time: this.props.time || 60,
            styleChange: false
          },
          () => {
            this.props.changeState({
              isOutDate: true
            }); //修改验证码标识
          }
        );
      }
    }, 1000);

    if (sendMsgStop) {
      console.log(this.props);
      if (this.props.type === "login") {
        console.log("MFA登录发送验证码");
        let response = await Request({
          url: API.vertify.sendCaptcha,
          method: "post",
          data: {
            username: mobile,
            type: 1
          },
          loading: false
        });
        console.log(response);
        if (response.status) {
          if (
            response.data.msg &&
            (response.data.msg.includes("频繁") ||
              response.data.msg.includes("frequent"))
          ) {
            Toast.fail(response.data.msg);
            this.resetCode();
          }
          console.log("验证码发送成功");
        } else {
          this.resetCode();
        }
      } else {
        console.log("注册发送验证码");
        let response = await Request({
          url: API.bind.sendSMS,
          method: "post",
          data: {
            phoneNumber: mobile
          },
          loading: false
        });
        if (response.status) {
          console.log("验证码发送成功");
        } else {
          this.resetCode();
        }
      }
    }
  };
  // 重置验证码
  resetCode = () => {
    console.log("重置验证码秒数");
    // 清除本身的验证码state
    this.setState({ validateCode: "" }, () => {
      // 清除父级的验证码props
      this.props.changeClearMobileInfo && this.props.changeClearMobileInfo();
      // 暂停倒计时
      clearInterval(this.timer);
      this.setState({
        sendMsgStop: true,
        time: this.props.time || 60,
        styleChange: false
      });
      this.props.changeState({
        isOutDate: true
      }); //修改验证码标识
    });
  };

  // 父级传过来的props改变是触发
  componentWillReceiveProps(newProps) {
    if (newProps.clearMobileInfo) {
      // 清空数据
      // 清除本身的验证码state
      this.setState({ validateCode: "" }, () => {
        newProps.onChange(""); // 清除父级的验证码props
        newProps.changeClearMobileInfo();
        // 暂停倒计时
        clearInterval(this.timer);
        this.setState({
          sendMsgStop: true,
          time: this.props.time || 60,
          styleChange: false
        });
        this.props.changeState({
          isOutDate: true
        }); //修改验证码标识
      });
    }
  }
  componentWillUnmount() {
    // 清除定时器
    clearInterval(this.timer);
  }

  /**
   * 输入验证码
   */
  handleChangeValidateCode = validateCode => {
    this.setState({ validateCode }, () => this.props.onChange(validateCode));
  };

  render() {
    const { time, sendMsgStop } = this.state;
    // console.log(
    //   "render::const { time, sendMsgStop } = this.state;const { time, sendMsgStop } = this.state;"
    // );
    return (
      <div className="countdown-bind adaptBtn">
        <InputItem
          autoComplete="off"
          placeholder={this.props.placeHolder || intl.get("pleaseInput")}
          onClick={() => {
            this.verificationMobile.focus();
          }}
          value={this.state.validateCode}
          onInput={v => {
            let validateCode = v.target.value.trimAll();
            validateCode =
              validateCode.length > 6 ? validateCode.slice(0, 6) : validateCode;
            this.setState(
              {
                validateCode
              },
              () => {
                this.props.onChange(this.state.validateCode);
              }
            );
          }}
          // onChange={this.handleChangeValidateCode}
          // maxLength={6}
          className={
            intl.getInitOptions()["currentLocale"] === "en_US"
              ? "eng-item"
              : null
          }
          style={{
            width: "90%"
          }}
          extra={
            <span
              className={
                this.state.styleChange
                  ? "verification-code active"
                  : "verification-code"
              }
              style={
                !isZh() && this.state.styleChange ? { textAlign: "center" } : {}
              }
            >
              {!sendMsgStop ? (
                intl.get("sendAgain", {
                  time
                })
              ) : this.state.disabled ? (
                <span>{intl.get("getAuthCode")}</span>
              ) : (
                <span onClick={this.fnCountdown}>
                  {intl.get("getAuthCode")}
                </span>
              )}
            </span>
          }
          ref={e => (this.verificationMobile = e)}
        >
          {this.props.showText && (
            <span className="countText"> {intl.get("verificationCode")}</span>
          )}
        </InputItem>
      </div>
    );
  }
}

export default Index;
