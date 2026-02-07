// src/features/plans/MyPlans.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import storageService from '../../services/storageService';

function MyPlans() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        setPlans(storageService.getPlans());
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('このプランを削除しますか？')) {
            storageService.deletePlan(id);
            setPlans(storageService.getPlans());
        }
    };

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-4">
                <h1>保存したもの</h1>

            </div>

            {plans.length === 0 ? (
                <div className="card text-center">
                    <p>保存されたプランはまだありません。</p>
                    <Link to="/create-plan">
                        <button style={{ backgroundColor: 'var(--secondary-color)' }}>最初プランを作成する</button>
                    </Link>
                </div>
            ) : (
                <div className="grid">
                    {plans.map((plan) => (
                        <div key={plan.id} className="card">
                            <h3>{plan.params?.destination?.name || '不明な目的地'}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{plan.summary}</p>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                                保存日: {new Date(plan.savedAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/create-plan?id=${plan.id}`} style={{ flex: 1 }}>
                                    <button style={{ width: '100%', padding: '0.5rem' }}>表示</button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    style={{ backgroundColor: 'var(--danger-color)', padding: '0.5rem' }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-center">
                <Link to="/" style={{ color: 'var(--secondary-color)' }}>ホームに戻る</Link>
            </div>
        </div>
    );
}

export default MyPlans;
