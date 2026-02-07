// src/features/plans/TripPlan/BudgetBreakdown.jsx
/**
 * 予算内訳コンポーネント
 * パイチャートを使用して推定予算を可視化します。
 * 詳細な内訳リストを表示します。
 */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    transportation: '#3b82f6',
    accommodation: '#8b5cf6',
    activities: '#ec4899',
    meals: '#f59e0b',
    other: '#6b7280'
};

const LABELS = {
    transportation: 'Transportation',
    accommodation: 'Accommodation',
    activities: 'Activities',
    meals: 'Meals',
    other: 'Other'
};

function BudgetBreakdown({ breakdown, originalBudget }) {
    if (!breakdown) return null;

    const chartData = Object.entries(breakdown)
        .filter(([key]) => key !== 'total')
        .map(([key, value]) => ({
            name: LABELS[key] || key,
            value: value,
            color: COLORS[key] || COLORS.other
        }))
        .filter(item => item.value > 0);

    const total = breakdown.total || 0;
    const isOverBudget = originalBudget && total > originalBudget;

    return (
        <div>
            <h3>
                Budget Breakdown
            </h3>

            <div>
                {/* チャート */}
                {chartData.length > 0 && (
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* 内訳リスト */}
                <div>
                    {Object.entries(breakdown)
                        .filter(([key]) => key !== 'total')
                        .map(([key, value]) => {
                            if (value === 0) return null;
                            return (
                                <div key={key}>
                                    <span>
                                        {LABELS[key] || key}:
                                    </span>
                                    <span>
                                        ¥{value.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}

                    {/* Total */}
                    <div>
                        <div>
                            <div>Total</div>
                            <div>
                                ¥{total.toLocaleString()}
                            </div>
                        </div>
                        {originalBudget && (
                            <div>
                                <div>Budget</div>
                                <div>
                                    ¥{originalBudget.toLocaleString()}
                                </div>
                                {isOverBudget && (
                                    <div>
                                        Over Budget: ¥{(total - originalBudget).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isOverBudget && (
                        <div>
                            Warning: Budget Exceeded.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BudgetBreakdown;
