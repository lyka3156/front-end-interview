const path = require("path");

const Dashboard = require("webpack-dashboard");
const DashboardPlugin = require("webpack-dashboard/plugin"); // 可以更友好的展示相关打包信息。
const dashboard = new Dashboard();

module.exports = (env) => {
  const config = {
    mode: "none", // 源代码方式打包
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
    },
  };
  // 不使用插件打包
  if (env === "no-plugin") {
    console.log("不使用插件运行");
    return config;
  }
  console.log("使用插件运行");
  return {
    ...config,
    plugins: [new DashboardPlugin(dashboard.setData)],
  };
};
