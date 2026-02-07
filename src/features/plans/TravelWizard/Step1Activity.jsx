// src/features/plans/TravelWizard/Step1Activity.jsx
/**
 * ステップ 1: アクティビティの選択
 * ユーザーが希望するアクティビティを入力または選択します。
 */
import React, { useState } from 'react';

function Step1Activity({ data, onNext }) {
    const [activity, setActivity] = useState(data.activity || '');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!activity.trim()) {
            setError('アクティビティを入力してください');
            return;
        }
        onNext({ activity });
    };

    const suggestions = ['温泉でリラックス', '北海道でスキー', '京都で寺社巡り', '沖縄でダイビング', '大阪で食べ歩き'];

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="text-center mb-4">
                <h2>どんな旅行をしたいですか？</h2>
                <p>やりたいことや行きたい場所のキーワードを入力してください</p>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="例: 温泉、スキー、美味しい海鮮..."
                        value={activity}
                        onChange={(e) => {
                            setActivity(e.target.value);
                            setError('');
                        }}
                        style={{ fontSize: '1.2rem', padding: '1rem' }}
                    />
                    <div className="error-container" style={{ minHeight: '1.2rem' }}>
                        {error && <div className="error-text"><span>{error}</span></div>}
                    </div>
                </div>

                <div className="mb-4">
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}><span>おすすめのキーワード:</span></p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActivity(s)}
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    color: '#333',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem 1rem'
                                }}
                            >
                                <span>{s}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" style={{ width: '100%', fontSize: '1.2rem' }}>
                    次へ
                </button>
            </form>
        </div>
    );
}

export default Step1Activity;
