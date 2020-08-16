/*
 * 拖拽滑块组件
 * */

import React, { Component } from "react";
import "./style.less";

class Drag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pointX: 0, //鼠标距物体横坐标
      pointY: 0 //鼠标距物体纵坐标
    };
  }

  touchStart = ev => {
    let target = ev.targetTouches[0];
    let offsetX = parseInt(this.dragEl.style.left); // 获取当前的x轴距离
    let offsetY = parseInt(this.dragEl.style.top); // 获取当前的y轴距离
    this.setState({
      pointX: target.clientX - offsetX,
      pointY: target.clientY - offsetY
    });
  };

  touchMove = ev => {
    ev.preventDefault();
    document.body.style = "position:fixed"; //阻止页面滚动
    let { pointX, pointY } = this.state;
    let target = ev.targetTouches[0];
    let moveX = target.clientX;
    let moveY = target.clientY;
    let left = moveX - pointX;
    let top = moveY - pointY;
    this.dragEl.style.left = left + "px";
    this.dragEl.style.top = top + "px";
    //边界判断start
    if (left <= 0) {
      this.dragEl.style.left = "0px";
    }
    if (top <= 0) {
      this.dragEl.style.top = "0px";
    }
    if (left >= window.innerWidth - parseInt(this.dragEl.style.width) - 50) {
      this.dragEl.style.left =
        window.innerWidth - parseInt(this.dragEl.style.width) - 50 + "px";
    }
    if (top >= window.innerHeight - parseInt(this.dragEl.style.height) - 50) {
      this.dragEl.style.top =
        window.innerHeight - parseInt(this.dragEl.style.height) - 50 + "px";
    }
    //边界end
  };

  touchEnd = () => {
    this.dragEl.ontouchmove = null;
    document.body.style = "position:relative"; //开启页面滚动
  };

  componentDidMount() {
    let style = {
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 99
    };
    this.dragEl = document.getElementById("drag-item");
    if (this.props.style) {
      Object.assign(style, this.props.style);
      this.setState({ style });
    }
  }

  render() {
    let { style } = this.state;
    return (
      <div
        id="drag-item"
        onTouchStart={ev => this.touchStart(ev)}
        onTouchMove={ev => this.touchMove(ev)}
        onTouchEnd={() => this.touchEnd()}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Drag;
