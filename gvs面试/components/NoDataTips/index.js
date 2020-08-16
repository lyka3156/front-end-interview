import React, { Component } from "react";
import intl from "react-intl-universal";
import "./style.less";

export default class NoData extends Component {
  render() {
    let { from, showNoDataText } = this.props;
    return (
      <div className={from ? "no-data-tip home-tip" : "no-data-tip"}>
        <img
          src={
            from
              ? require("../../static/images/wufuwu@2x.png")
              : require("../../static/images/zanwushuju.png")
          }
        />

        <p
          style={{
            visibility: from && !showNoDataText ? "hidden" : "visible"
          }}
        >
          {from
            ? // "暂无专属服务"
              intl.get("not-server")
            : // '暂无数据'
              intl.get("no.data")}
        </p>
      </div>
    );
  }
}
