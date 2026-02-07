// src/features/plans/TripPlan/ItineraryMap.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// React での Leaflet のデフォルトマーカーアイコンの修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 地図の中心と境界の更新を処理するコンポーネント
function MapController({ points }) {
    const map = useMap();

    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);

    return null;
}

const ItineraryMap = ({ items }) => {
    // 座標を持つアイテムをフィルタリング
    const points = items
        .filter(item => item.lat && item.lng)
        .map(item => ({
            lat: Number(item.lat),
            lng: Number(item.lng),
            activity: item.activity,
            time: item.time
        }));

    if (points.length === 0) {
        return (
            <div style={{ height: '300px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
                <p className="text-secondary">表示する位置情報がありません</p>
            </div>
        );
    }

    const polylinePositions = points.map(p => [p.lat, p.lng]);

    return (
        <div
            className="map-wrapper"
            style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}
        >
            <MapContainer
                key={items[0]?.lat + items[0]?.lng + items.length} // Leaflet の内部的な問題を避けるため、場所が大きく変わったときに再レンダリングを強制する
                center={[points[0].lat, points[0].lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 各目的地のマーカー */}
                {points.map((point, index) => (
                    <Marker key={`marker-${index}-${point.lat}`} position={[point.lat, point.lng]}>
                        <Popup>
                            <strong>{point.time}</strong><br />
                            {point.activity}
                        </Popup>
                    </Marker>
                ))}

                {/* ルート線 */}
                <Polyline positions={polylinePositions} color="var(--primary-color)" weight={4} opacity={0.6} dashArray="10, 10" />

                <MapController points={points} />
            </MapContainer>
        </div>
    );
};

export default ItineraryMap;
