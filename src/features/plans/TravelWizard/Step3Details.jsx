// src/features/plans/TravelWizard/Step3Details.jsx
/**
 * ステップ3: 詳細入力
 * 日程、予算、好みなどの詳細を入力する画面。
 * ユーザーの現在地から交通費を概算する。
 */
import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { getCurrentPosition } from '../../../services/locationService';
import { estimateTransportCost } from '../../../services/transportService';

function Step3Details({ data, onNext, onBack }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const [startDate, setStartDate] = useState(data.startDate || tomorrow);
    const [endDate, setEndDate] = useState(data.endDate || format(addDays(new Date(), 3), 'yyyy-MM-dd'));
    const [budget, setBudget] = useState(data.budget || '');
    const [preferences, setPreferences] = useState(data.preferences || '');
    const [errors, setErrors] = useState({});

    // 交通費ロジック
    const [transportCost, setTransportCost] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [loadingCost, setLoadingCost] = useState(true);
    const [includeTransport, setIncludeTransport] = useState(data.includeTransport !== undefined ? data.includeTransport : true);

    useEffect(() => {
        const fetchLocationAndCost = async () => {
            try {
                setLoadingCost(true);
                // 1. 位置情報取得
                const position = await getCurrentPosition();
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                // 2. 交通費計算
                const cost = await estimateTransportCost({ lat: latitude, lng: longitude }, data.destination.name);
                setTransportCost(cost);

                // 予算提案（交通費 + 50000円）
                if (!budget && cost > 0) {
                    setBudget(data.budget || (cost + 50000).toString());
                }
            } catch (error) {
                console.error("Location/Cost Error:", error);
                // エラー時はコスト0扱い
            } finally {
                setLoadingCost(false);
            }
        };

        if (data.destination) {
            fetchLocationAndCost();
        }
    }, [data.destination]);

    const validate = () => {
        const newErrors = {};

        if (!startDate) newErrors.startDate = '開始日を選択してください';
        if (!endDate) newErrors.endDate = '終了日を選択してください';
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            newErrors.endDate = '終了日は開始日より後に設定してください';
        }

        if (!budget || budget <= 0) {
            newErrors.budget = '予算を入力してください';
        } else if (includeTransport && transportCost > 0 && Number(budget) < transportCost) {
            newErrors.budget = `予算は最低でも交通費（¥${transportCost.toLocaleString()}）以上に設定してください`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onNext({
            startDate,
            endDate,
            budget: Number(budget),
            preferences,
            userLocation,
            estimatedTransportCost: transportCost,
            includeTransport
        });
    };

    const days = (startDate && endDate) ?
        Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1) : 0;

    return (
        <div className="container">
            <div className="text-center mb-4">
                <h2>旅行の詳細を入力</h2>
                <p><strong>{data.destination?.name}</strong> への旅行計画</p>
            </div>

            <form onSubmit={handleSubmit} className="card">
                {/* 交通費情報 */}
                <div className="mb-4" style={{ backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>概算交通費</h4>
                    <div className="transport-info-container" style={{ minHeight: '3rem' }}>
                        {loadingCost ? (
                            <div className="text-secondary">現在地から計算中...</div>
                        ) : (
                            <div className="cost-display">
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                    ¥{transportCost.toLocaleString()}
                                </p>
                                <small className="text-secondary">（現在地からの片道交通費/人）</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid mb-4">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>開始日</label>
                        <input
                            type="date"
                            value={startDate}
                            min={today}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setErrors(prev => ({ ...prev, startDate: '' }));
                            }}
                        />
                        <div className="error-container" style={{ minHeight: '1.2rem' }}>
                            {errors.startDate && <div className="error-text">{errors.startDate}</div>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>終了日</label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || today}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setErrors(prev => ({ ...prev, endDate: '' }));
                            }}
                        />
                        <div className="error-container" style={{ minHeight: '1.2rem' }}>
                            {errors.endDate && <div className="error-text">{errors.endDate}</div>}
                        </div>
                    </div>
                </div>

                {days > 0 && (
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>期間</label>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            <span>{days} 日間</span>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>総予算 (円)</label>
                    <div className="mb-2">
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={includeTransport}
                                onChange={(e) => {
                                    setIncludeTransport(e.target.checked);
                                    // チェックを外したらエラーもクリアする（予算バリデーションが変わるため）
                                    if (!e.target.checked) setErrors(prev => ({ ...prev, budget: '' }));
                                }}
                            />
                            <span>交通費（¥{transportCost.toLocaleString()}）を予算に含める</span>
                        </label>
                    </div>
                    <input
                        type="number"
                        placeholder={includeTransport ? `最低額: ${transportCost}` : "予算を入力"}
                        value={budget}
                        onChange={(e) => {
                            setBudget(e.target.value);
                            setErrors(prev => ({ ...prev, budget: '' }));
                        }}
                        min={includeTransport ? transportCost : 0}
                        step="1000"
                    />
                    <div className="error-container" style={{ minHeight: '1.2rem' }}>
                        {errors.budget && <div className="error-text">{errors.budget}</div>}
                    </div>
                </div>

                <div className="mb-4">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>その他のご要望 (任意)</label>
                    <textarea
                        placeholder="例: 子供連れ、オーシャンビュー、2日目はフリー..."
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={onBack} style={{ backgroundColor: 'var(--secondary-color)', flex: 1 }}>
                        戻る
                    </button>
                    <button type="submit" style={{ flex: 2 }}>
                        プラン作成
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Step3Details;
