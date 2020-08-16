/**
 * error boundary
 */
import React from "react";
import intl from "react-intl-universal";
import "./style.less";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    console.log("====================================");
    console.log(error, info);
    console.log("====================================");
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="success-container2">
          <div className="notice-conten">
            <img
              src={require("../../static/images/wangluo.png")}
              alt=""
              className="success-img"
            />
            <div className="upSuccess">您的网络太慢了，请点击刷新!</div>
          </div>
          <div className="notice-button">
            <div className="active button" onClick={() => location.reload()}>
              刷新
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
