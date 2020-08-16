/**
 * Listview(pull down refresh、pull up load more)
 * 1. dataSource
 * 2. Item
 * 3. onRefresh
 * 4. onEndReached
 * 5. fnLink
 * 6. useBodyScroll
 */
import React from "react";
import ReactDOM from "react-dom";
// import ListView from "rmc-list-view";
// import PullToRefresh from "rmc-pull-to-refresh";
import { ListView, PullToRefresh } from "antd-mobile";

import "./style";
class ListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      }),
      refreshing: true,
      isLoading: true,
      height: document.documentElement.clientHeight,
      hasData: true
    };
  }

  //If you use redux, the data maybe at props, you need use `componentWillReceiveProps`
  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(nextProps.dataSource),
        refreshing: false,
        isLoading: false,
        height:
          document.documentElement.clientHeight - (nextProps.height || 50),
        hasData: nextProps.hasMore
      });
    }
  }

  componentWillUpdate() {
    // const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
    // this.setState({ height: hei });
  }

  componentDidUpdate() {
    if (this.state.useBodyScroll) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }

  componentDidMount() {
    let hei;
    if (ReactDOM.findDOMNode(this.lv)) {
      hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
    }
    this.setState({ height: hei });

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.dataSource),
      refreshing: false,
      isLoading: false,
      height: document.documentElement.clientHeight - (this.props.height || 50),
      hasData: this.props.hasMore
    });
  }

  /**
   * refresh
   */
  onRefresh = () => {
    this.setState({ refreshing: true, isLoading: true });
    this.props.onRefresh();
  };

  /**
   * load more
   */
  onEndReached = () => {
    const { hasData } = this.state;
    hasData && this.props.onEndReached();
  };

  render() {
    const separator = (sectionID, rowID) => (
      <div
        key={`${sectionID}-${rowID}`}
        style={{
          height: 10
        }}
      />
    );
    const { Item, ...rest } = this.props;
    const row = (rowData, sectionID, rowID) => {
      rowID = +rowID + 1;

      return <Item {...rest} {...rowData} />;
    };

    // no data
    if (!this.props.HideNoData && this.props.dataSource.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: ".4rem 0" }}>No data</div>
      );
    }

    return (
      <div className="pull-list">
        <ListView
          key={1}
          ref={el => (this.lv = el)}
          dataSource={this.state.dataSource}
          renderRow={row}
          renderFooter={() => (
            <div style={{ padding: 10, textAlign: "center" }}>
              {this.state.isLoading
                ? "加载中..."
                : this.state.hasData
                ? "下拉获取更多数据"
                : "没有更多数据"}
            </div>
          )}
          style={this.props.useBodyScroll ? {} : { height: this.state.height }}
          pullToRefresh={
            <PullToRefresh
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          useBodyScroll={this.props.useBodyScroll}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={1000}
          initialListSize={15}
          pageSize={15}
        />
      </div>
    );
  }
}

export default ListComponent;
