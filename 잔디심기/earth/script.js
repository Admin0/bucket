const style_light = VersaTilesStyle.graybeard({
    baseUrl: "https://tiles.versatiles.org/",
    language: "ko",
    recolor: {
        blend: 0.2,
        blendColor: "#FFF" // make all colors lighter
    }
});
const style_dark = VersaTilesStyle.shadow({
    baseUrl: "https://tiles.versatiles.org/",
    language: "ko",
    recolor: {
        blend: 0.2,
        blendColor: "#000" // make all colors lighter
    }
});

// 1. 다크 모드 미디어 쿼리 객체 생성
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
let currentStyle;

// 2. 테마 변경 처리 함수 정의
const handleThemeChange = (e) => {
    if (e.matches) {
        currentStyle = "dark";
    } else {
        currentStyle = "light";
    }
};

// 3. 초기 테마 설정 (페이지 로드 시)
handleThemeChange(darkModeMediaQuery);

// 4. 이벤트 리스너 등록 (시스템 테마 변경 시 동작)
darkModeMediaQuery.addEventListener("change", handleThemeChange);

// (참고) 리스너 제거가 필요할 경우
// darkModeMediaQuery.removeEventListener('change', handleThemeChange);

const map = new maplibregl.Map({
    container: "map",
    // style: "https://api.maptiler.com/maps/019c17e7-c33a-70d9-ac59-ac40754b0df4/style.json",
    style: currentStyle === "light" ? style_light : style_dark,
    center: [127.5, 36],
    zoom: 8,
    maxZoom: 20,
    minZoom: 3
})
    // --- Map Controls ---
    .addControl(
        new maplibregl.NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true
        })
    )
    .addControl(
        new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true
        })
    );

// --- Global State & UI Elements ---
let allFeatures = [];
let isInitialLoadStarted = false;

// --- Coordinate Decoding ---
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

// --- Cache API Helper Functions ---
async function storeDataInCache(cacheName, key, data) {
    try {
        const cache = await caches.open(cacheName);
        await cache.put(key, new Response(JSON.stringify(data)));
    } catch (error) {
        console.error("Failed to store data in cache:", error);
    }
}

async function loadDataFromCache(cacheName, key) {
    try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(key);
        return response ? response.json() : null;
    } catch (error) {
        console.error("Failed to load data from cache:", error);
        return null;
    }
}

// --- Map Style & Layer Updates ---
function updatePaintProperties() {
    const styleColors = {
        dark: {
            gpx: "#00ff7f",
            gpxCerti: "#ffD700",
            text: "#ffffff"
        },
        light: {
            gpx: "#00b264",
            gpxCerti: "#FAAB0C",
            text: "#000000"
        }
    };
    const colors = styleColors[currentStyle];
    const layers = ["gpx-normal-layer", "gpx-certified-layer"];

    layers.forEach((layerId) => {
        if (!map.getLayer(layerId)) return;
        switch (layerId) {
            case "gpx-normal-layer":
                map.setPaintProperty(layerId, "line-color", colors.gpx);
                break;
            case "gpx-certified-layer":
                map.setPaintProperty(layerId, "line-color", colors.gpxCerti);
                break;
            case "contour-lines":
                map.setPaintProperty(layerId, "line-color", colors.text);
                break;
            case "contour-labels":
                map.setPaintProperty(layerId, "text-color", colors.text);
                break;
        }
    });
}

function addSourcesAndLayers() {
    const layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    if (!map.getSource("gpx-data-source"))
        map.addSource("gpx-data-source", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] }
        });

    if (!map.getLayer("gpx-normal-layer"))
        map.addLayer(
            {
                id: "gpx-normal-layer",
                type: "line",
                source: "gpx-data-source",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        4, // 줌 레벨
                        10, // 두깨
                        11, // 줌 레벨
                        3.5, // 두깨
                        13, // 줌 레벨
                        2.5 // 두깨
                    ],
                    "line-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7, // 줌 레벨
                        0.75, // 투명도
                        10, // 줌 레벨
                        0.25 // 투명도
                    ]
                },
                filter: ["!=", ["get", "certified"], true]
            },
            // firstSymbolId
            "label-address-housenumber"
        );
    if (!map.getLayer("gpx-certified-layer"))
        map.addLayer(
            {
                id: "gpx-certified-layer",
                type: "line",
                source: "gpx-data-source",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        4, // 줌 레벨
                        10, // 두깨
                        11, // 줌 레벨
                        3.5, // 두깨
                        13, // 줌 레벨
                        2.5 // 두깨
                    ],
                    "line-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7, // 줌 레벨
                        0.75, // 투명도
                        10, // 줌 레벨
                        0.33 // 투명도
                    ]
                },
                filter: ["==", ["get", "certified"], true]
            },
            // firstSymbolId
            "label-address-housenumber"
        );

    // --- DEM & Contour Source Setup ---
    const demSource = new mlcontour.DemSource({
        url: "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp",
        encoding: "terrarium",
        worker: true,
        cacheSize: 100,
        timeoutMs: 10_000
    });
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
    if (!map.getLayer("hillshade-layer")) map.addLayer({ id: "hillshade-layer", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": 0.1 } }, "land-forest");
    if (!map.getLayer("contour-lines"))
        map.addLayer(
            {
                id: "contour-lines",
                type: "line",
                source: "contour-source",
                "source-layer": "contours",
                paint: { "line-opacity": 0.33, "line-width": ["match", ["get", "level"], 1, 1, 0.5] },
                layout: { "line-join": "round" }
            },
            "label-place-neighbourhood"
        );
    if (!map.getLayer("contour-labels"))
        map.addLayer(
            {
                id: "contour-labels",
                type: "symbol",
                source: "contour-source",
                "source-layer": "contours",
                filter: [">", ["get", "level"], 0],
                layout: { "symbol-placement": "line", "text-size": 10, "text-field": ["concat", ["number-format", ["get", "ele"], {}], " m"], "text-font": ["Noto Sans Bold"] }
            },
            "label-place-neighbourhood"
        );
}

// --- Data Loading & Progress UI ---
function updateProgress(processed, total) {
    const progressBar = document.getElementById("progress-bar");
    const gpxCounter = document.getElementById("gpx-counter");
    const progressContainer = document.getElementById("progress-container");
    const percentage = total > 0 ? (processed / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    gpxCounter.textContent = `${Math.round(percentage)}%`;
    gpxCounter.style.left = `calc(${percentage}% - 0px)`;

    if (processed >= total && total > 0) {
        setTimeout(() => {
            progressContainer.style.opacity = "0";
        }, 1500);
    }
}

function updateMapSource() {
    if (map.getSource("gpx-data-source")) {
        map.getSource("gpx-data-source").setData({
            type: "FeatureCollection",
            features: allFeatures
        });
    }
}

async function loadGpxData() {
    hermes_records.push(...hermes_records_4_earth);
    const recordsMap = new Map(hermes_records.map((r) => [`${r.date}${r.over ? `_${r.over}` : ""}`.trim(), r]));
    const LS_KEY = "cachedGpxFeatures_v5_shortpath";

    // 1. 로컬 스토리지 데이터 로드 및 전체 레코드 정보 재결합
    let cachedHybridFeatures = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

    allFeatures = cachedHybridFeatures
        .map((hybrid) => {
            const record = recordsMap.get(hybrid.properties.path.trim());
            if (!record) return null; // hermes_records.js에서 기록이 제거된 경우
            return {
                type: "Feature",
                properties: { ...record, ...hybrid.properties }, // 전체 속성 병합
                geometry: {
                    type: "LineString",
                    coordinates: decodeCoordinates(hybrid.geometry.encoded_coordinates)
                }
            };
        })
        .filter(Boolean); // null 값 제거

    updateMapSource();

    const cachedPaths = new Set(cachedHybridFeatures.map((f) => f.properties.path.trim()));
    const totalRecords = hermes_records.length;
    let processedCount = allFeatures.length;
    updateProgress(processedCount, totalRecords);

    const recordsToLoad = hermes_records.filter((r) => {
        const shortPath = `${r.date}${r.over ? `_${r.over}` : ""}`.trim();
        return !cachedPaths.has(shortPath);
    });

    if (recordsToLoad.length === 0) {
        updateProgress(totalRecords, totalRecords);
        return;
    }
    document.getElementById("progress-container").style.opacity = "1";

    // 2. 압축 파일 로드
    const years = [...new Set(recordsToLoad.map((r) => r.date.substring(0, 4)))];
    const compressedDataMap = new Map();

    const compressedJsonPromises = years.map((year) => {
        const url = `../records/compressed/${year}.json`;
        return fetch(url)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                const features = Array.isArray(data) ? data : data.features;
                if (!features) return;

                const yearDataMap = new Map();
                features.forEach((feat) => {
                    if (feat?.properties?.path) {
                        yearDataMap.set(feat.properties.path.trim(), feat);
                    }
                });
                compressedDataMap.set(year, yearDataMap);
            })
            .catch((err) => console.error(`Failed to fetch/parse '${year}.json'.`, err));
    });
    await Promise.allSettled(compressedJsonPromises);

    // 3. 데이터 소스 분류
    const gpxRecordsToFetch = [];
    const compressedFeatures = [];

    recordsToLoad.forEach((record) => {
        const year = record.date.substring(0, 4);
        const shortPath = `${record.date}${record.over ? `_${record.over}` : ""}`.trim();
        const dateOnlyPath = record.date.trim();
        const compressedYearData = compressedDataMap.get(year);

        let feat = compressedYearData?.get(shortPath) || compressedYearData?.get(dateOnlyPath);

        if (feat) {
            compressedFeatures.push({
                type: "Feature",
                properties: { ...record, path: shortPath, certified: record.certi != null },
                geometry: {
                    type: "LineString",
                    coordinates: decodeCoordinates(feat.geometry.encoded_coordinates)
                }
            });
        } else if (!record.comment?.includes("gpx 파일 누락") && !record.comment?.includes("위치 기록 누락")) {
            gpxRecordsToFetch.push(record);
        }
    });

    // 압축 데이터 일괄 추가
    if (compressedFeatures.length > 0) {
        allFeatures.push(...compressedFeatures);
        updateMapSource();
        processedCount += compressedFeatures.length;
        updateProgress(processedCount, totalRecords);
    }

    // 개별 GPX 로드
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
                        .then((res) => (res.ok ? res.text() : Promise.reject(new Error(res.statusText))))
                        .then((gpxText) => gpxWorker.postMessage({ gpxText, path: fullPath }))
                        .catch(rej);
                })
                    .then((encodedCoordinates) => {
                        if (encodedCoordinates) {
                            allFeatures.push({
                                type: "Feature",
                                properties: { ...record, path: shortPath, certified: record.certi != null },
                                geometry: {
                                    type: "LineString",
                                    coordinates: decodeCoordinates(encodedCoordinates)
                                }
                            });
                            updateMapSource();

                            // 로컬스토리지에는 최소 정보만 저장
                            cachedHybridFeatures.push({
                                type: "Feature",
                                properties: { path: shortPath, certified: record.certi != null },
                                geometry: { encoded_coordinates: encodedCoordinates }
                            });
                            localStorage.setItem(LS_KEY, JSON.stringify(cachedHybridFeatures));
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

// --- 경로 호버 팝업 기능 ---
function trackPopup() {
    const layersToHover = ["gpx-normal-layer", "gpx-certified-layer"];

    layersToHover.forEach((layerId) => {
        map.on("mouseenter", layerId, (e) => {
            map.getCanvas().style.cursor = "pointer";

            const rec = e.features[0].properties;
            if (!rec) return;

            // 기록 시간을 초로 변환
            const parts = rec.record.split(":").map(Number);
            let time;
            if (parts.length === 3) {
                time = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                time = parts[0] * 60 + parts[1];
            }

            // 거리, 고도, 트레일 여부 설정
            const distance = rec.distance || (rec.course == "full" ? 42.195 : rec.course == "half" ? 21.0975 : rec.course == "10k" ? 10 : rec.course == "5k" ? 5 : 0);
            const elevation = rec.elevation || 0;
            const isTrail = rec.type == "trail";

            // 페이스 계산
            let elevation_pace = Infinity;
            let distance_pace = Infinity;

            if (isTrail) {
                if (elevation > 0) elevation_pace = (time / elevation / 2) * 60; // 60m당 페이스
                if (distance > 0) distance_pace = time / distance;
            }

            rec.isOfficial = rec.course !== undefined;
            rec.pace = time / distance;
            rec.elevation_pace = isTrail ? elevation_pace : distance > 0 ? time / distance : Infinity;

            const paceValue = rec.type === "trail" ? rec.elevation_pace : rec.pace;
            const tooltipPace = `${Math.floor(paceValue / 60)}′${Math.floor(paceValue % 60)
                .toString()
                .padStart(2, "0")}″${rec.type === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'}`;
            const tooltipDistance = rec.type === "trail" ? `${rec.elevation} <span class="unit"> m</span>` : `${distance.toFixed(2)} <span class="unit"> km</span>`;
            const tooltip_type = rec.isOfficial ? "공식 대회" : rec.type === "trail" ? "하이킹 / 트레일러닝" : rec.type === "walk" ? "걷기" : "러닝";
            const icon_distance = rec.type === "trail" ? "altitude" : "conversion_path";
            const comment = rec.comment ? `<span class="comment">${rec.comment}</span>` : "";
            const gpxFileName = rec.date + (rec.over !== undefined ? "_" + rec.over : "");

            let tooltipContent = `
            <div class="tooltip-item ${rec.isOfficial ? "official" : ""}">
                <div class="gpx d-${gpxFileName}"><svg></svg></div>
                <div class="title-container">
                    <span class="type">${tooltip_type}</span>
                    <span class="date">${rec.date}</span>
                    <div class="title">${rec.title} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""} ${comment}</div>
                </div>
                <div class="data">
                    <span class="material-symbols-outlined icon distance">${icon_distance}</span> <span class="distance">${tooltipDistance}</span> |
                    <span class="material-symbols-outlined icon record">timer</span> <span class="rec">${rec.record}</span> |
                    <span class="material-symbols-outlined icon pace">speed</span> <span class="pace">${tooltipPace}</span>
                </div>
            </div>`;

            let tooltip = document.getElementById("tooltip");
            tooltip.innerHTML = tooltipContent;
            tooltip.classList.add("on");
            tooltip.style.left = e.point.x + "px";
            tooltip.style.top = e.point.y + "px";
            // console.log(e);
            // console.log(properties);
        });

        map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
            tooltip.classList.remove("on");
            // trackPopup.remove();
        });
    });
}

// --- Map Event Listeners & Initial Load ---
map.on("style.load", () => {
    map.setProjection({ type: "globe" });
    addSourcesAndLayers();
    updatePaintProperties();
    updateMapSource();
});

map.on("load", () => {
    map.setProjection({ type: "globe" });
    map.setTerrain({ source: "dem", exaggeration: 1.5 });
    loadGpxData();
    trackPopup();

    // Initialize GPX drag-and-drop functionality
    if (hermes && typeof hermes.gpx.init === "function") {
        hermes.gpx.init(map);
    }
});
