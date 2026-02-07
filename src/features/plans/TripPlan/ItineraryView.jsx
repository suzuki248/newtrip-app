// src/features/plans/TripPlan/ItineraryView.jsx
/**
 * 日程表示コンポーネント
 * 旅行の毎日の日程を表示します。
 */
import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function ItineraryView({ itinerary }) {
    if (!itinerary || itinerary.length === 0) {
        return null;
    }

    return (
        <div>
            <h3>
                Itinerary
            </h3>

            {itinerary.map((day, dayIndex) => (
                <div key={dayIndex}>
                    {/* 日付ヘッダー */}
                    <div>
                        <h4>
                            {day.title || `Day ${day.day}`}
                        </h4>
                        {day.date && (
                            <p>
                                {format(new Date(day.date), 'yyyy/MM/dd (E)', { locale: ja })}
                            </p>
                        )}
                    </div>

                    {/* タイムライン */}
                    <div>
                        {day.items.map((item, itemIndex) => (
                            <div key={itemIndex}>
                                <div>
                                    <div>
                                        <span>
                                            {item.time}
                                        </span>
                                        <h5>
                                            {item.activity}
                                        </h5>
                                    </div>
                                    {item.cost > 0 && (
                                        <span>
                                            ¥{item.cost.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {item.location && (
                                    <p>
                                        at {item.location}
                                    </p>
                                )}

                                {item.description && (
                                    <p>
                                        {item.description}
                                    </p>
                                )}

                                {item.notes && (
                                    <p>
                                        Note: {item.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ItineraryView;
