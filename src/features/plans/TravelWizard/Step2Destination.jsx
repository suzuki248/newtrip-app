// src/features/plans/TravelWizard/Step2Destination.jsx
/**
 * ステップ2: 行き先選択
 * AIが提案した旅行先候補を表示し、ユーザーが選択する画面。
 * 画像はPollinations AIを使用して表示。
 */
import React, { useState, useEffect } from 'react';
import { getDestinations, getMoreDestinations } from '../../../services/aiService';

function Step2Destination({ data, onNext, onBack }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(data.destination || null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (destinations.length === 0) {
            loadDestinations();
        } else {
            setLoading(false);
        }
    }, []);

    const loadDestinations = async () => {
        try {
            setLoading(true);
            setError('');
            const results = await getDestinations(data.activity);
            setDestinations(results);
        } catch (err) {
            console.error('Error loading destinations:', err);
            if (err.message === 'API_QUOTA_EXCEEDED' || err.message.includes('RESOURCE_EXHAUSTED')) {
                setError('APIの無料枠制限に達した可能性があります。しばらく待ってから再試行するか、APIキーを確認してください。(429 Resource Exhausted)');
            } else {
                setError(`旅行先の取得に失敗しました。: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        try {
            setLoadingMore(true);
            setError('');
            const excludeIds = destinations.map(d => d.id);
            const moreResults = await getMoreDestinations(data.activity, excludeIds);
            setDestinations(prev => [...prev, ...moreResults]);
        } catch (err) {
            console.error('Error loading more destinations:', err);
            if (err.message === 'API_QUOTA_EXCEEDED' || err.message.includes('RESOURCE_EXHAUSTED')) {
                setError('APIの無料枠制限に達したため、追加の読み込みができません。(Resource Exhausted)');
            } else {
                setError('旅行先の追加読み込みに失敗しました。');
            }
        } finally {
            setLoadingMore(false);
        }
    };

    const handleNext = () => {
        if (!selectedDestination) {
            setError('旅行先を選択してください');
            return;
        }
        onNext({ destination: selectedDestination });
    };



    if (loading) {
        return (
            <div className="container text-center">
                <div className="card">
                    <h3><span>おすすめの旅行先を探しています...</span></h3>
                    <p><span>「{data.activity}」にぴったりの場所を見つけています</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="text-center mb-4">
                <h2>行き先を選択してください</h2>
                <p><strong>{data.activity}</strong> におすすめの場所です</p>
            </div>

            <div className="error-container" style={{ minHeight: '1.5rem' }}>
                {error && (
                    <div className="error-text text-center">
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Destinations Grid */}
            <div className="grid mb-4">
                {destinations.map((dest) => (
                    <div
                        key={dest.id}
                        className="card"
                        onClick={() => {
                            setSelectedDestination(dest);
                            setError('');
                        }}
                        style={{
                            cursor: 'pointer',
                            border: selectedDestination?.id === dest.id ? '2px solid var(--primary-color)' : '1px solid transparent',
                            padding: '0',
                            overflow: 'hidden'
                        }}
                    >


                        <div style={{ padding: '1rem' }}>
                            <div className="flex justify-between items-center mb-4">
                                <span style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                                    {dest.bestSeason}
                                </span>
                                {selectedDestination?.id === dest.id && (
                                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>選択中</span>
                                )}
                            </div>

                            <h3>{dest.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#555' }}>{dest.description}</p>

                            <div className="mb-4">
                                <ul style={{ paddingLeft: '1.2rem', marginBottom: '0' }}>
                                    {dest.highlights.map((highlight, idx) => (
                                        <li key={idx} style={{ fontSize: '0.9rem' }}>{highlight}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.8rem', color: '#777' }}>概算費用</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    ¥{typeof dest.estimatedCost === 'number' ? dest.estimatedCost.toLocaleString() : dest.estimatedCost}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mb-4">
                <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{ backgroundColor: 'var(--info-color)' }}
                >
                    <span>{loadingMore ? '読み込み中...' : 'もっと見る'}</span>
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
                <button onClick={onBack} style={{ backgroundColor: 'var(--secondary-color)', flex: 1 }}>
                    戻る
                </button>
                <button onClick={handleNext} style={{ flex: 2 }}>
                    次へ
                </button>
            </div>
        </div>
    );
}

export default Step2Destination;
