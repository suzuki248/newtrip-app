// src/features/plans/TravelWizard/Step4Plan.jsx
/**
 * ステップ4: プラン生成と確認
 * 生成されたプランを表示する画面。
 * チャートを排除しシンプルなUIを表示。
 */
import React, { useState, useEffect } from 'react';
import { generateItinerary } from '../../../services/aiService';
import { useNavigate } from 'react-router-dom';
import ItineraryMap from '../TripPlan/ItineraryMap';
import storageService from '../../../services/storageService';

function Step4Plan({ data, onBack, onComplete, updateData }) {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(data.generatedPlan || null);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(1);
    const [saved, setSaved] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!plan) {
            generatePlan();
        } else {
            setLoading(false);
        }
    }, []);

    const generatePlan = async () => {
        try {
            setLoading(true);
            setError('');

            // AIに渡す予算を調整（「交通費を含める」場合のみ総予算から引く）
            const transportDeduction = data.includeTransport ? (data.estimatedTransportCost || 0) : 0;
            const remainingBudget = data.budget - transportDeduction;

            const generatedPlan = await generateItinerary({
                activity: data.activity,
                destination: data.destination.name,
                startDate: data.startDate,
                endDate: data.endDate,
                budget: remainingBudget > 0 ? remainingBudget : data.budget,
                preferences: data.preferences
            });

            setPlan(generatedPlan);
            updateData({ generatedPlan });
        } catch (err) {
            console.error('Error generating plan:', err);
            setError('プランの生成に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!plan) return;
        const savedPlan = storageService.savePlan({
            ...plan,
            params: data // 保存時に検索条件も一緒に保存
        });
        if (savedPlan) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleShare = () => {
        try {
            const planData = btoa(unescape(encodeURIComponent(JSON.stringify(plan))));
            const url = `${window.location.origin}${window.location.pathname}?plan=${planData}`;
            setShareUrl(url);
            navigator.clipboard.writeText(url);
            alert('共有用のリンクをクリップボードにコピーしました！');
        } catch (err) {
            console.error('Sharing failed:', err);
            alert('共有リンクの作成に失敗しました。データが大きすぎる可能性があります。');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFinish = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="container text-center">
                <div className="card">
                    <h3><span>旅行プランを作成中...</span></h3>
                    <p><span>AIがあなただけの特別プランを考えています</span></p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><span>目的地: {data.destination?.name}</span></li>
                        <li><span>交通費: {data.includeTransport ? `¥${(data.estimatedTransportCost || 0).toLocaleString()} (予算に含む)` : "予算に含まない"}</span></li>
                    </ul>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container text-center">
                <div className="card">
                    <h3 className="text-danger">エラー</h3>
                    <p className="error-text">{error}</p>
                    <div className="flex gap-2 justify-center">
                        <button onClick={onBack} style={{ backgroundColor: 'var(--secondary-color)' }}>戻る</button>
                        <button onClick={generatePlan}>再試行</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="text-center mb-4 no-print">
                <h2>あなたの旅行プラン</h2>
                <p>{plan.summary}</p>
                <div className="flex gap-2 justify-center mt-2">
                    <button
                        onClick={handleSave}
                        style={{
                            backgroundColor: saved ? '#4CAF50' : 'var(--primary-color)',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        {saved ? '✓ 保存しました' : '💾 プランを保存'}
                    </button>
                    <button
                        onClick={handleShare}
                        style={{
                            backgroundColor: '#2196F3',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        🔗 共有リンクをコピー
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{
                            backgroundColor: '#607D8B',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        🖨️ 印刷 / PDF
                    </button>
                </div>
            </div>

            {/* 印刷用ヘッダー（印刷時にのみ表示） */}
            <div className="print-only text-center mb-4" style={{ display: 'none' }}>
                <h1>Travel Plan: {data.destination?.name}</h1>
                <p>{plan.summary}</p>
            </div>

            {/* 日付セレクター */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ borderBottom: '1px solid #eee' }}>
                {plan.itinerary.map((day) => (
                    <button
                        key={day.day}
                        onClick={() => setSelectedDay(day.day)}
                        style={{
                            backgroundColor: selectedDay === day.day ? 'var(--primary-color)' : '#fff',
                            color: selectedDay === day.day ? '#fff' : '#666',
                            border: `1px solid ${selectedDay === day.day ? 'var(--primary-color)' : '#ddd'}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        {day.day}日目
                    </button>
                ))}
            </div>

            {/* 日別ビュー: 地図 + リスト */}
            <div className="grid mb-4" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 400px', gap: '1.5rem', alignItems: 'start' }}>
                {/* 日程リスト */}
                <div className="card">
                    {plan.itinerary.filter(d => d.day === selectedDay).map((day, index) => (
                        <div key={index}>
                            <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>{day.title}</h3>
                            <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem' }}>{day.date}</div>

                            {day.items.map((item, idx) => (
                                <div key={idx} style={{
                                    marginBottom: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#f9f9f9',
                                    borderLeft: '4px solid var(--primary-color)',
                                    borderRadius: '0 4px 4px 0'
                                }}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div style={{ fontWeight: 'bold' }}>{item.time} - {item.activity}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>¥{item.cost?.toLocaleString() || 0}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.5rem' }}>📍 {item.location}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</div>
                                    {item.notes && <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginTop: '0.25rem' }}>※ {item.notes}</div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* 地図ビュー */}
                <div style={{ position: 'sticky', top: '20px' }}>
                    <div className="card" style={{ padding: '0.75rem' }}>
                        <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>移動ルート ({selectedDay}日目)</h4>
                        <ItineraryMap items={plan.itinerary.find(d => d.day === selectedDay)?.items || []} />
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                            ※ピンをタップすると場所の詳細が表示されます。
                        </p>
                    </div>
                </div>
            </div>

            {/* 宿泊先 */}
            {plan.hotels && plan.hotels.length > 0 && (
                <div className="card mb-4">
                    <h3>宿泊先</h3>
                    {plan.hotels.map((hotel, index) => (
                        <div key={index} className="mb-4">
                            <h4>{hotel.name}</h4>
                            <p>¥{hotel.pricePerNight?.toLocaleString() || 0} / 泊</p>
                            <p style={{ fontSize: '0.9rem' }}>{hotel.reason}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* 予算概要（テキストのみ） */}
            {plan.budgetBreakdown && (
                <div className="card mb-4">
                    <h3>概算予算</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                        <div>交通費 (現在地〜目的地)</div>
                        <div className={data.includeTransport ? "" : "text-secondary"} style={{ textDecoration: data.includeTransport ? 'none' : 'line-through' }}>
                            ¥{(data.estimatedTransportCost || 0).toLocaleString()}
                            {!data.includeTransport && <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>(予算外)</span>}
                        </div>

                        <div>現地交通費</div>
                        <div>¥{plan.budgetBreakdown.transportation?.toLocaleString() || 0}</div>

                        <div>宿泊費</div>
                        <div>¥{plan.budgetBreakdown.accommodation?.toLocaleString() || 0}</div>

                        <div>アクティビティ</div>
                        <div>¥{plan.budgetBreakdown.activities?.toLocaleString() || 0}</div>

                        <div>食事</div>
                        <div>¥{plan.budgetBreakdown.meals?.toLocaleString() || 0}</div>

                        <div style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '0.5rem', marginTop: '0.5rem' }}>合計見積もり</div>
                        <div style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                            ¥{((plan.budgetBreakdown.total || 0) + (data.includeTransport ? (data.estimatedTransportCost || 0) : 0)).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-2 no-print">
                <button onClick={onBack} style={{ backgroundColor: 'var(--secondary-color)', flex: 1 }}>修正する</button>
                <button onClick={handleFinish} style={{ flex: 2 }}>
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}

export default Step4Plan;
