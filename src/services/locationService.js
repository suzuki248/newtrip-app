/**
 * ユーザーのジオロケーションを処理するサービス
 */

/**
 * ユーザーの現在位置を取得
 * @returns {Promise<GeolocationPosition>}
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(position);
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};

/**
 * 逆ジオコーディングのアプローチを使用して座標から住所の詳細を取得
 * この MVP では、無料の API が利用できない場合は、座標を解釈するために AI に頼るか、
 * 座標をそのまま輸送サービスに渡す可能性があります。
 * 
 * 注意：「最小限の UI」を維持し、可能であれば地図用の外部 API キーを避けるために、
 * 主に座標を返します。
 */
export const getUserLocationName = async (lat, lng) => {
    // 実際のアプリでは、ここで Google Maps Geocoding API または OpenStreetMap を使用します。
    // 追加のキーがない MVP の場合は、フォーマットされた文字列を返します。
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export default {
    getCurrentPosition,
    getUserLocationName
};
