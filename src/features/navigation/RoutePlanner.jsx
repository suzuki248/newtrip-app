/**
 * Route Planner Component
 * Entry point for the route planning feature.
 * Combines DirectionsComponent for map/routing.
 */
import React from "react";
import DirectionsComponent from "./DirectionsComponent";

function RoutePlanner() {
    return (
        <div className="container">
            <div className="text-center mb-4">
                <h2>ルート検索</h2>
                <p>目的地までの経路と交通費を計算します</p>
            </div>
            <DirectionsComponent />
        </div>
    );
}

export default RoutePlanner;

