// src/App.jsx
/**
 * メインアプリケーションコンポーネント
 * React Router を使用してアプリケーションのルーティングを設定します。
 * 
 * ルート:
 * - /: ホームページ
 * - /accounts: ユーザー認証とアカウント管理
 * - /routePlanner: 旅行ルートのプランニングツール
 * - /directions: 特定の道順ビュー
 * - /subscribe: サブスクリプション管理
 * - /searchTrip: 旅行プランの検索
 * - /create-plan: 新しい旅行プランの作成
 * - /my-plans: ユーザーの保存済みプランの表示
 * - /plan/:planId: 特定のプランの詳細表示
 */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// レイアウトコンポーネント
import Format from "./components/Format";

// 機能コンポーネント
import Home from "./features/Home";
import RoutePlanner from "./features/navigation/RoutePlanner";
import CreatePlan from "./features/plans/CreatePlan";
import DirectionsComponent from "./features/navigation/DirectionsComponent";
import MyPlans from "./features/plans/MyPlans";

function App() {
  return (
    <Router>
      <Routes>
        {/* メインレイアウトルート */}
        <Route path="/" element={<Format />}>
          <Route index element={<Home />} />
          <Route path="routePlanner" element={<RoutePlanner />} />
          <Route path="directions" element={<DirectionsComponent />} />
          <Route path="create-plan" element={<CreatePlan />} />
          <Route path="my-plans" element={<MyPlans />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
