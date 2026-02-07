import { useEffect, useState } from "react";

let isScriptLoaded = false;  // 一度読み込まれたかのフラグ

export function useGoogleMaps(apiKey) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR対策

    // 既に読み込み済みならすぐにtrue
    if (isScriptLoaded) {
      setLoaded(true);
      return;
    }

    // windowにコールバック関数を登録
    window.initMap = () => {
      isScriptLoaded = true;
      setLoaded(true);
    };

    // scriptタグがすでに存在するか確認
    if (!document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        // アンマウント時はscriptは残す（再利用のため削除しない）
      };
    } else {
      // scriptタグはあるがisScriptLoadedがfalseなら読み込み完了を待つ形になる
    }
  }, [apiKey]);

  return loaded;
}
