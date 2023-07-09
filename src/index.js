/* 
import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
 */
import ReactDOM from 'react-dom';

// 导入antd-mobile的样式：
import 'antd-mobile/dist/antd-mobile.css'

import './assets/fonts/iconfont.css'
// 注意：我们自己写的全局样式需要放在组件库样式后面导入，这样，样式才会生效！因为后面的样式会覆盖前面同名的样式
import './index.css'
import 'react-virtualized/styles.css'
import App from "./App";
ReactDOM.render(<App/>,document.getElementById('root'))

/* const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
 */