// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css'; // 集約された CSS
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// アプリのパフォーマンス測定を開始したい場合は、結果をログに記録する関数を渡すか
// （例：reportWebVitals(console.log)）、分析エンドポイントに送信してください。
// 詳細はこちら：https://bit.ly/CRA-vitals
reportWebVitals();
