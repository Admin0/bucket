const style_light = VersaTilesStyle.graybeard({
    baseUrl: "https://tiles.versatiles.org/",
    language: "ko",
    recolor: { blend: 0.2, blendColor: "#FFF" }
});
const style_dark = VersaTilesStyle.shadow({
    baseUrl: "https://tiles.versatiles.org/",
    language: "ko",
    recolor: { blend: 0.2, blendColor: "#000" }
});

let currentStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const map = new maplibregl.Map({
    container: "map",
    style: currentStyle === "light" ? style_light : style_dark,
    center: [127.5, 36],
    zoom: 8,
    maxZoom: 20,
    minZoom: 3
})
    .addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: true, showCompass: true }))
    .addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true }));

// --- Global State ---
let allLineFeatures = [],
    allPointFeatures = [];
let featureIdCounter = 0;

// --- Utility Functions ---
function decodeCoordinates(encoded) {
    if (!encoded) return [];
    let coordinates = [],
        index = 0,
        len = encoded.length,
        lat = 0,
        lon = 0;
    while (index < len) {
        let b,
            shift = 0,
            result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlon = result & 1 ? ~(result >> 1) : result >> 1;
        lon += dlon;
        coordinates.push([lon / 1e6, lat / 1e6]);
    }
    return coordinates;
}

function createFeature(record, coordinates, path) {
    const newFeature = {
        type: "Feature",
        properties: { ...record, id: featureIdCounter, path: path, certified: record.certi != null },
        geometry: { type: "LineString", coordinates }
    };
    featureIdCounter++;
    return newFeature;
}

// --- Tooltip Functions ---
function generateTooltipHtml(properties) {
    const isTrail = properties.type === "trail";
    const isOfficial = properties.certified;

    const parts = properties.record.split(":").map(Number);
    let time;
    if (parts.length === 3) {
        time = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        time = parts[0] * 60 + parts[1];
    }

    const distance = properties.distance || (properties.course == "full" ? 42.195 : properties.course == "half" ? 21.0975 : properties.course == "10k" ? 10 : properties.course == "5k" ? 5 : 0);

    const elevation_pace = (time / properties.elevation / 2) * 60; // 60 m 당 페이스
    const pace = time / distance;
    const paceValue = isTrail ? elevation_pace : pace;
    const paceUnit = isTrail ? "/60 m↑" : "/km";
    const tooltipPace = paceValue
        ? `${Math.floor(paceValue / 60)}′${Math.floor(paceValue % 60)
              .toString()
              .padStart(2, "0")}″<span class="unit">${paceUnit}</span>`
        : "N/A";

    const distanceValue = isTrail ? `${properties.elevation} m` : `${parseFloat(distance).toFixed(2)} km`;
    const distanceIcon = isTrail ? "altitude" : "conversion_path";

    const comment = properties.comment ? `<span class="comment">${properties.comment}</span>` : "";
    const typeText = isOfficial ? "공식 대회" : isTrail ? "하이킹 / 트레일러닝" : properties.type === "walk" ? "걷기" : properties.type === "ride" ? "자전거 타기" : "러닝";

    return `
        <div class="tooltip-item ${isOfficial ? "official" : ""}">
             <div class="title-container">
                <span class="type">${typeText}</span>
                <span class="date">${properties.date}</span>
                <div class="title">${properties.title} ${isOfficial ? '<span class="material-symbols official"> crown </span>' : ""}${comment}</div>
            </div>
            <div class="data">
                <span class="material-symbols-outlined icon distance">${distanceIcon}</span> <span class="distance">${distanceValue}</span> <span class="div"></span>
                <span class="material-symbols-outlined icon record">timer</span> <span class="rec">${properties.record || "N/A"}</span> <span class="div"></span>
                <span class="material-symbols-outlined icon pace">speed</span> <span class="pace">${tooltipPace}</span>
            </div>
        </div>`;
}

function handleMapTooltip(e, features, tooltipElement) {
    if (features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        tooltipElement.classList.add("on");
        tooltipElement.innerHTML = generateTooltipHtml(features[0].properties);
        tooltipElement.style.left = `${e.point.x + 15}px`;
        tooltipElement.style.top = `${e.point.y - 40}px`;
    } else {
        tooltipElement.style.left = `${e.point.x + 15}px`;
        tooltipElement.style.top = `${e.point.y - 40}px`;
    }
}

// --- Map & Data Setup ---
function addSourcesAndLayers() {
    if (!map.getSource("gpx-lines-source")) map.addSource("gpx-lines-source", { type: "geojson", data: { type: "FeatureCollection", features: [] }, lineMetrics: true });
    if (!map.getSource("gpx-points-source")) map.addSource("gpx-points-source", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

    const demSource = new mlcontour.DemSource({ url: "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp", encoding: "terrarium", worker: true, cacheSize: 100, timeoutMs: 10_000 });
    demSource.setupMaplibre(maplibregl);
    if (!map.getSource("dem")) map.addSource("dem", { type: "raster-dem", encoding: "terrarium", tiles: [demSource.sharedDemProtocolUrl], tileSize: 256, maxzoom: 12 });
    if (!map.getSource("contour-source"))
        map.addSource("contour-source", {
            type: "vector",
            tiles: [
                demSource.contourProtocolUrl({
                    thresholds: { 11: [200, 1000], 12: [100, 500], 14: [50, 200], 15: [20, 100] },
                    contourLayer: "contours",
                    elevationKey: "ele",
                    levelKey: "level",
                    maxzoom: 12
                })
            ]
        });

    const layerinsertBefore = "label-address-housenumber";
    const lineLayout = { "line-join": "round", "line-cap": "round" };
    const normalColors = { start: "#00ff80", end: "#004D40", border: "rgba(255, 255, 255, 1)", base: "#00b264" };
    const certiColors = { start: "#ffd700", end: "#f57f17", border: "rgba(255, 255, 255, 1)", base: "#FAAB0C" };
    const highlightFilter = ["==", ["get", "id"], -1];

    const layers = [
        { id: "hillshade-layer", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": 0.1 } },
        {
            id: "contour-lines",
            type: "line",
            source: "contour-source",
            "source-layer": "contours",
            layout: { "line-join": "round" },
            paint: { "line-opacity": 0.33, "line-width": ["match", ["get", "level"], 1, 1, 0.5], "line-color": currentStyle === "dark" ? "#fff" : "#000" }
        },
        {
            id: "contour-labels",
            type: "symbol",
            source: "contour-source",
            "source-layer": "contours",
            filter: [">", ["get", "level"], 0],
            layout: { "symbol-placement": "line", "text-size": 10, "text-field": ["concat", ["number-format", ["get", "ele"], {}], " m"], "text-font": ["Noto Sans Bold"] },
            paint: { "text-color": currentStyle === "dark" ? "#aaa" : "#333" }
        },
        {
            id: "gpx-line-base",
            type: "line",
            source: "gpx-lines-source",
            layout: lineLayout,
            filter: ["!", ["==", ["get", "certified"], true]],
            paint: {
                "line-color": normalColors.base,
                "line-width": ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 3.5, 13, 2.5],
                "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.75, 10, 0.25]
            }
        },
        {
            id: "gpx-line-base-certi",
            type: "line",
            source: "gpx-lines-source",
            layout: lineLayout,
            filter: ["==", ["get", "certified"], true],
            paint: {
                "line-color": certiColors.base,
                "line-width": ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 3.5, 13, 2.5],
                "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.75, 10, 0.33]
            }
        },
        {
            id: "gpx-highlight-border",
            type: "line",
            source: "gpx-lines-source",
            layout: lineLayout,
            filter: highlightFilter,
            paint: { "line-color": ["case", ["==", ["get", "certified"], true], certiColors.border, normalColors.border], "line-width": ["interpolate", ["linear"], ["zoom"], 5, 6, 12, 8] }
        },
        {
            id: "gpx-highlight-points-border",
            type: "circle",
            source: "gpx-points-source",
            filter: highlightFilter,
            paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 6, 16, 10], "circle-color": "#fff" }
        },
        {
            id: "gpx-highlight-main",
            type: "line",
            source: "gpx-lines-source",
            layout: lineLayout,
            filter: highlightFilter,
            paint: { "line-width": ["interpolate", ["linear"], ["zoom"], 9, 3, 16, 5], "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, normalColors.start, 1, normalColors.end] }
        },
        {
            id: "gpx-highlight-points",
            type: "circle",
            source: "gpx-points-source",
            filter: highlightFilter,
            paint: {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 2, 16, 3],
                "circle-color": "#fff",
                "circle-stroke-color": [
                    "case",
                    ["==", ["get", "certified"], true],
                    ["case", ["==", ["get", "point_type"], "start"], certiColors.start, certiColors.end],
                    ["case", ["==", ["get", "point_type"], "start"], normalColors.start, normalColors.end]
                ],
                "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 9, 2, 16, 5]
            }
        }
    ];

    layers.forEach((layer) => {
        if (!map.getLayer(layer.id)) map.addLayer(layer, layerinsertBefore);
    });
}

function updateProgress(p, t) {
    const bar = document.getElementById("progress-bar"),
        counter = document.getElementById("gpx-counter"),
        cont = document.getElementById("progress-container"),
        pct = t > 0 ? (p / t) * 100 : 0;
    bar.style.width = `${pct}%`;
    counter.textContent = `${Math.round(pct)}%`;
    if (p >= t && t > 0) setTimeout(() => (cont.style.opacity = "0"), 1500);
}

function updateMapSources() {
    if (map.getSource("gpx-lines-source")) map.getSource("gpx-lines-source").setData({ type: "FeatureCollection", features: allLineFeatures });
    if (map.getSource("gpx-points-source")) map.getSource("gpx-points-source").setData({ type: "FeatureCollection", features: allPointFeatures });
}

function processNewFeatures(features) {
    features.forEach((lineFeature) => {
        allLineFeatures.push(lineFeature);
        const coords = lineFeature.geometry.coordinates;
        if (coords.length > 0) {
            const startPoint = { type: "Feature", properties: { ...lineFeature.properties, point_type: "start" }, geometry: { type: "Point", coordinates: coords[0] } };
            const endPoint = { type: "Feature", properties: { ...lineFeature.properties, point_type: "end" }, geometry: { type: "Point", coordinates: coords[coords.length - 1] } };
            allPointFeatures.push(startPoint, endPoint);
        }
    });
}

async function loadGpxData() {
    hermes_records.push(...hermes_records_4_earth);
    const recordsMap = new Map(hermes_records.map((r) => [`${r.date}${r.over ? `_${r.over}` : ""}`.trim(), r]));
    const LS_KEY = "cachedGpxFeatures_v5_shortpath";
    let cachedHybridFeatures = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

    const cachedFeatures = [];
    cachedHybridFeatures.forEach((hybrid) => {
        const record = recordsMap.get(hybrid.properties.path.trim());
        if (!record) return;
        const coordinates = decodeCoordinates(hybrid.geometry.encoded_coordinates);
        if (coordinates.length > 0) cachedFeatures.push(createFeature(record, coordinates, hybrid.properties.path));
    });
    if (cachedFeatures.length > 0) processNewFeatures(cachedFeatures);
    updateMapSources();

    const cachedPaths = new Set(cachedHybridFeatures.map((f) => f.properties.path.trim()));
    const totalRecords = hermes_records.length;
    let processedCount = cachedFeatures.length;
    updateProgress(processedCount, totalRecords);

    const recordsToLoad = hermes_records.filter((r) => !cachedPaths.has(`${r.date}${r.over ? `_${r.over}` : ""}`.trim()));
    if (recordsToLoad.length === 0) {
        updateProgress(totalRecords, totalRecords);
        return;
    }
    document.getElementById("progress-container").style.opacity = "1";

    const years = [...new Set(recordsToLoad.map((r) => r.date.substring(0, 4)))];
    const compressedDataMap = new Map();
    const compressedJsonPromises = years.map((year) =>
        fetch(`../records/${year}.json`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                const features = Array.isArray(data) ? data : data.features;
                if (!features) return;
                const yearDataMap = new Map();
                features.forEach((feat) => {
                    if (feat?.properties?.path) yearDataMap.set(feat.properties.path.trim(), feat);
                });
                compressedDataMap.set(year, yearDataMap);
            })
            .catch((err) => console.error(`Failed to parse '${year}.json'.`, err))
    );
    await Promise.allSettled(compressedJsonPromises);

    const gpxRecordsToFetch = [];
    const compressedFeatures = [];
    recordsToLoad.forEach((record) => {
        const shortPath = `${record.date}${record.over ? `_${record.over}` : ""}`.trim();
        const feat = compressedDataMap.get(record.date.substring(0, 4))?.get(shortPath);
        if (feat) {
            const coordinates = decodeCoordinates(feat.geometry.encoded_coordinates);
            if (coordinates.length > 0) compressedFeatures.push(createFeature(record, coordinates, shortPath));
        } else if (!record.comment?.includes("gpx 파일 누락") && !record.comment?.includes("위치 기록 누락")) {
            gpxRecordsToFetch.push(record);
        }
    });

    if (compressedFeatures.length > 0) {
        processNewFeatures(compressedFeatures);
        updateMapSources();
        processedCount += compressedFeatures.length;
        updateProgress(processedCount, totalRecords);
    }

    if (gpxRecordsToFetch.length > 0) {
        const gpxWorker = new Worker("gpx-worker.js");
        const promises = new Map();
        gpxWorker.onmessage = ({ data }) => {
            if (promises.has(data.path)) promises.get(data.path).resolve(data.encodedCoordinates);
        };
        gpxWorker.onerror = (error) => promises.forEach(({ reject }) => reject(error));

        for (const record of gpxRecordsToFetch) {
            const shortPath = `${record.date}${record.over ? `_${record.over}` : ""}`.trim();
            const fullPath = `../records/${record.date.substring(0, 4)}/${shortPath}.gpx`;
            await new Promise((resolve) => {
                new Promise((res, rej) => {
                    promises.set(fullPath, { resolve: res, reject: rej });
                    fetch(fullPath)
                        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText))))
                        .then((gpxText) => gpxWorker.postMessage({ gpxText, path: fullPath }))
                        .catch(rej);
                })
                    .then((encoded) => {
                        if (encoded) {
                            const coordinates = decodeCoordinates(encoded);
                            if (coordinates.length > 0) {
                                const newFeature = createFeature(record, coordinates, shortPath);
                                processNewFeatures([newFeature]);
                                updateMapSources();
                                cachedHybridFeatures.push({ type: "Feature", properties: { path: shortPath, certified: record.certi != null }, geometry: { encoded_coordinates: encoded } });
                                localStorage.setItem(LS_KEY, JSON.stringify(cachedHybridFeatures));
                            }
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        processedCount++;
                        updateProgress(processedCount, totalRecords);
                        promises.delete(fullPath);
                        resolve();
                    });
            });
        }
        gpxWorker.terminate();
    }
    updateProgress(totalRecords, totalRecords);
}

// --- Map Event Handlers ---
map.on("style.load", () => {
    addSourcesAndLayers();
    updateMapSources();
});

map.on("load", () => {
    map.setProjection({ type: "globe" });
    map.setTerrain({ source: "dem", exaggeration: 1.5 });
    loadGpxData();
    if (hermes && typeof hermes.gpx.init === "function") hermes.gpx.init(map);

    const trackTooltip = document.getElementById("tooltip");
    //     const trackTooltip = document.createElement("div");
    // trackTooltip.id = "tooltip";
    // map.getContainer().appendChild(trackTooltip);

    let hoveredFeatureId = null;
    const highlightLayers = ["gpx-highlight-border", "gpx-highlight-main", "gpx-highlight-points-border", "gpx-highlight-points"];
    const layersToQuery = ["gpx-line-base", "gpx-line-base-certi"];
    const normalColors = { start: "#00ff80", end: "#005c45" };
    const certiColors = { start: "#ffd700", end: "#f57f17" };

    // --- 하이라이트 및 툴팁 관리를 위한 통합 함수 ---

    // 하이라이트와 툴팁을 모두 제거하는 함수
    function clearHighlightAndTooltip() {
        if (hoveredFeatureId !== null) {
            hoveredFeatureId = null; // 현재 하이라이트된 ID 상태를 초기화
            highlightLayers.forEach((layerId) => {
                if (map.getLayer(layerId)) {
                    map.setFilter(layerId, ["==", "id", ""]); // 레이어 필터를 제거하여 하이라이트 숨김
                }
            });
            trackTooltip.classList.remove("on"); // 툴팁 숨김
        }
    }

    // --- 이벤트 핸들러 ---

    // 마우스 움직임에 따라 경로를 하이라이트하거나 해제
    map.on("mousemove", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });

        if (features.length > 0) {
            // 마우스가 경로 위에 있을 경우
            const newHoveredId = features[0].properties.id;
            if (hoveredFeatureId !== newHoveredId) {
                hoveredFeatureId = newHoveredId; // 새로운 경로 ID로 상태 업데이트
                const isCertified = features[0].properties.certified;

                const filter = ["==", ["get", "id"], hoveredFeatureId];
                highlightLayers.forEach((layerId) => map.setFilter(layerId, filter));

                const gradient = isCertified
                    ? ["interpolate", ["linear"], ["line-progress"], 0, certiColors.start, 1, certiColors.end]
                    : ["interpolate", ["linear"], ["line-progress"], 0, normalColors.start, 1, normalColors.end];
                map.setPaintProperty("gpx-highlight-main", "line-gradient", gradient);
            }
        } else {
            // 마우스가 경로 위에 없을 경우, 하이라이트 제거
            // clearHighlightAndTooltip();
        }

        // 툴팁 위치와 내용을 실시간으로 업데이트
        handleMapTooltip(e, features, trackTooltip);
    });

    // 지도의 아무 곳이나 클릭하면 하이라이트와 툴팁을 제거
    map.on("click", () => {
        clearHighlightAndTooltip();
    });
});
