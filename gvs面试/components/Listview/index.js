/**
 * Listview(pull down refresh、pull up load more)
 * 1. dataSource
 * 2. Item
 * 3. onRefresh
 * 4. onEndReached
 * 5. fnLink
 * 6. useBodyScroll
 */
import React, { Component } from "react";
import ReactDOM from "react-dom";
// import ListView from "rmc-list-view";
// import PullToRefresh from "rmc-pull-to-refresh";
import { ListView, PullToRefresh } from "antd-mobile";
import intl from "react-intl-universal";
import "./style";

class ListComponent extends Component {
  state = {
    dataSource: new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    }), // 数据源
    refreshing: true, // 上拉刷新
    isLoading: true, // 加载更多
    height: document.documentElement.clientHeight, // 容器高度
    hasData: true // 还有更多数据
  };
  // 1. 组件挂载完成执行
  componentDidMount() {
    if (ReactDOM.findDOMNode(this.lv)) {
      let hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
      this.setState({ height: hei });
    }
    this.initData(this.props);
  }

  // 2. 属性改变触发
  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      this.initData(nextProps);
    }
  }
  // 渲染数据
  initData = props => {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.dataSource),
      refreshing: false,
      isLoading: props.isLoading || false,
      height:
        document.documentElement.clientHeight -
        (typeof props.height === "function"
          ? props.height()
          : props.height || 50),
      hasData: props.hasMore || false
    });
  };

  // 3. 属性或者状态改变时触发
  componentDidUpdate() {
    if (this.state.useBodyScroll) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }

  // 上拉刷新
  onRefresh = () => {
    this.setState({ refreshing: true, isLoading: true });
    this.props.onRefresh();
  };

  // 当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
  onEndReached = () => {
    this.props.onEndReached();
  };

  render() {
    // Item(渲染每项的组件) reset(渲染每项组件的数据)
    const { Item, ...rest } = this.props;
    // 渲染行数
    const row = (rowData, sectionID, rowID) => {
      rowID = +rowID + 1;
      return <Item {...rest} {...rowData} />;
    };

    // 没有数据
    if (!this.props.HideNoData && this.props.dataSource.length === 0) {
      return null;
    }

    return (
      <div className="pull-list" ref={ref => (this.pullList = ref)}>
        <ListView
          key={1}
          ref={el => (this.lv = el)}
          dataSource={this.state.dataSource}
          renderRow={row}
          renderFooter={() => {
            // listView底部
            return (
              <div
                style={{ padding: 10, paddingTop: "0", textAlign: "center" }}
              >
                {this.state.isLoading
                  ? `${intl.get("loading")}...`
                  : this.state.hasData
                  ? `${intl.get("pullMoreData")}`
                  : `${intl.get("NoMoreData")}`}
              </div>
            );
          }}
          style={this.props.useBodyScroll ? {} : { height: this.state.height }}
          // 上拉刷新组件
          // pullToRefresh={
          //   <PullToRefresh
          //     refreshing={this.state.refreshing}
          //     onRefresh={this.onRefresh}
          //   />
          // }
          useBodyScroll={this.props.useBodyScroll} // 使用 html 的 body 作为滚动容器
          onEndReached={this.onEndReached}
          // 调用onEndReached之前的临界值，单位是像素
          onEndReachedThreshold={15}
          // 初始化渲染条数
          initialListSize={this.props.pageSize * this.props.pageNum || 10}
          // 每次事件循环（每帧）渲染的行数
          pageSize={this.props.pageSize * this.props.pageNum || 10}
        />
      </div>
    );
  }
}

export default ListComponent;
