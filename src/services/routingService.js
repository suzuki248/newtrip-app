// services/routingService.js
// OpenRouteService API を使用したルート検索サービス

const API_KEY = process.env.REACT_APP_OPENROUTESERVICE_API_KEY || "";
const BASE_URL = "https://api.openrouteservice.org";

/**
 * 住所から座標を取得（ジオコーディング）
 * @param {string} address - 住所
 * @returns {Promise<{lat: number, lng: number}>} - 座標
 */
export async function geocodeAddress(address) {
    const url = `${BASE_URL}/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(address)}&boundary.country=JP`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates;
            return { lng: coords[0], lat: coords[1] };
        }
        throw new Error("No results found");
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
}

/**
 * 2地点間のルートを計算
 * @param {Object} params - ルート検索パラメータ
 * @param {Object} params.start - 出発地座標 {lat, lng}
 * @param {Object} params.end - 目的地座標 {lat, lng}
 * @param {string} params.profile - 移動手段 ('driving-car', 'foot-walking', 'cycling-regular')
 * @returns {Promise<Object>} - ルート情報
 */
export async function getRoute({ start, end, profile = 'driving-car' }) {
    const url = `${BASE_URL}/v2/directions/${profile}`;

    const body = {
        coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat]
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Routing failed: ${response.status} - ${error.error?.message || JSON.stringify(error)}`);
        }

        const data = await response.json();
        const route = data.features[0];
        const summary = route.properties.summary;

        return {
            distance: summary.distance, // メートル
            duration: summary.duration, // 秒
            coordinates: route.geometry.coordinates.map(c => [c[1], c[0]]), // [lat, lng]に変換
            bounds: route.bbox // [minLng, minLat, maxLng, maxLat]
        };
    } catch (error) {
        console.error("Routing error:", error);
        throw error;
    }
}

/**
 * 距離をフォーマット（メートル → km/m）
 * @param {number} meters - 距離（メートル）
 * @returns {string} - フォーマットされた距離
 */
export function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
}

/**
 * 時間をフォーマット（秒 → 時間/分）
 * @param {number} seconds - 時間（秒）
 * @returns {string} - フォーマットされた時間
 */
export function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
}

/**
 * 移動手段を OpenRouteService のプロファイルに変換
 * @param {string} mode - 移動手段 ('DRIVING', 'WALKING', 'BICYCLING')
 * @returns {string} - ORS プロファイル
 */
export function travelModeToProfile(mode) {
    const mapping = {
        'DRIVING': 'driving-car',
        'WALKING': 'foot-walking',
        'BICYCLING': 'cycling-regular',
        'TRANSIT': 'driving-car' // 公共交通は代替として車を使用
    };
    return mapping[mode] || 'driving-car';
}

export default {
    geocodeAddress,
    getRoute,
    formatDistance,
    formatDuration,
    travelModeToProfile
};
