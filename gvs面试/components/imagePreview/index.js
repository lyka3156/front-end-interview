/*
 * @name:图片预览组件
 * @author:colin
 * @props showImage（Boolean）:父级组件是否显示预览  imgSrc(String)：图片链接  changeState（Function）:修改父组件state方法
 *
 * */

import React, { Component } from "react";
import { Modal } from "antd-mobile";
import "./style.less";
export default class ImagePreview extends Component {
  render() {
    return (
      <Modal
        visible={true}
        transparent
        // closable={true}
        maskClosable={true}
        // title="Title"
        //点击清空显示标识和图片路径
        // footer={[{ text: 'Ok', onPress: () =>this.props.changeState({showImage:false,imgSrc:''}) }]}
        className="preview-image-pop"
        onClose={() =>
          this.props.changeState({ previewImg: { flag: false, imgSrc: "" } })
        }
      >
        <div
          className="image-content"
          style={{
            height: this.props.height || 300,
            overflow: this.props.overflow || "hidden"
          }}
          onClick={() =>
            this.props.changeState({ previewImg: { flag: false, imgSrc: "" } })
          }
        >
          <img
            src={this.props.previewImg.imgSrc}
            style={{
              height: this.props.overflow === "auto" ? "" : "100%"
            }}
          />
        </div>
      </Modal>
    );
  }
}
