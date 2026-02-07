// src/features/plans/TripPlan/HotelCard.jsx
/**
 * ホテルカードコンポーネント
 * 推奨ホテルの詳細を表示します。
 */
import React from 'react';

function HotelCard({ hotel }) {
    return (
        <div>
            <div>
                <h4>
                    {hotel.name}
                </h4>
                <div>
                    <span>
                        {hotel.type || 'Hotel'}
                    </span>
                    {hotel.rating && (
                        <div>
                            <span>Rating: </span>
                            <span>{hotel.rating}</span>
                        </div>
                    )}
                </div>
                {hotel.address && (
                    <p>
                        Address: {hotel.address}
                    </p>
                )}
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                    <h5>
                        Amenities
                    </h5>
                    <div>
                        {hotel.amenities.map((amenity, index) => (
                            <span key={index}>
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {hotel.reason && (
                <p>
                    Reason: {hotel.reason}
                </p>
            )}

            <div>
                <div>
                    <div>
                        Price{hotel.totalNights > 1 ? ` (${hotel.totalNights} nights)` : ''}:
                        ¥{((hotel.pricePerNight || 0) * (hotel.totalNights || 1)).toLocaleString()}
                    </div>
                </div>
                {hotel.bookingUrl && (
                    <a
                        href={hotel.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Book Now
                    </a>
                )}
            </div>
        </div>
    );
}

export default HotelCard;
