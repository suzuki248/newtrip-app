// src/features/Home.jsx
/**
 * Home Page Component
 * Landing page of the application.
 * Displays navigation to key features: Plan Creation, My Plans, Trip Search, and Subscription.
 */
import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="container text-center">
            {/* Hero Section */}
            <p style={{ color: '#888', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                本アプリは旅行のプランを作成するアプリです。{"\n"}
                APIの利用上限によってプランを作成できない可能性があります
            </p>
            <div className="card mb-4" style={{ padding: '3rem' }}>
                <h1 className="mb-4">
                    Trip Planner
                </h1>
                <p className="mb-4">
                    AIがあなたにぴったりの旅行プランを提案します
                </p>
                <div>
                    <Link to="/create-plan">
                        <button style={{ minWidth: '200px', fontSize: '1.2rem' }}>
                            プランを作成する
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
