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
const style_maptilerlight = "https://api.maptiler.com/maps/019d5607-c62e-736d-adde-04f8f879a22b/style.json?key=Bdy6sMAQwxQOz1O2ur6a";
const style_maptilerdark = "https://api.maptiler.com/maps/019c17e7-c33a-70d9-ac59-ac40754b0df4/style.json?key=Bdy6sMAQwxQOz1O2ur6a";

// Self-executing async function to correctly set up the map style before initialization
(async () => {
    let currentStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    let useFreeService;

    const styleUrlToCheck = currentStyle === "light" ? style_maptilerlight : style_maptilerdark;

    try {
        const response = await fetch(styleUrlToCheck, { method: 'HEAD' });
        useFreeService = !response.ok;
        if (useFreeService) {
            console.warn("Custom MapTiler style not found. Falling back to free service.");
        }
    } catch (error) {
        console.warn("Could not check for custom MapTiler style, falling back to free service.", error);
        useFreeService = true;
    }

    // All original code is now placed after the async check to ensure `useFreeService` is correctly set.
    const map = new maplibregl.Map({
        container: "map",
        style: useFreeService ? (currentStyle === "light" ? style_light : style_dark) : currentStyle === "light" ? style_maptilerlight : style_maptilerdark,
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
            properties: { ...record, id: featureIdCounter, path: path, certified: record.certi != null && record.certi.length > 0 },
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

    // --- Map & Data Setup ---
    function addSourcesAndLayers() {
        if (!map.getSource("gpx-lines-source")) map.addSource("gpx-lines-source", { type: "geojson", data: { type: "FeatureCollection", features: [] }, lineMetrics: true });
        if (!map.getSource("gpx-points-source")) map.addSource("gpx-points-source", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

        const demSource = new mlcontour.DemSource({ url: "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp", encoding: "terrarium", worker: true, cacheSize: 100, timeoutMs: 10_000 });
        demSource.setupMaplibre(maplibregl);
        if (!map.getSource("dem") && useFreeService) map.addSource("dem", { type: "raster-dem", encoding: "terrarium", tiles: [demSource.sharedDemProtocolUrl], tileSize: 256, maxzoom: 12 });
        if (!map.getSource("contour-source") && useFreeService)
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

        const layerinsertBefore = useFreeService ? "label-address-housenumber" : "Country border";
        const lineLayout = { "line-join": "round", "line-cap": "round" };
        const normalColors = { start: "#00ff80", end: "#004D40", border: "rgba(255, 255, 255, 1)", base: "#00b264" };
        const certiColors = { start: "#ffd700", end: "#f57f17", border: "rgba(255, 255, 255, 1)", base: "#FAAB0C" };
        const highlightFilter = ["==", ["get", "id"], -1];

        const layers = [
            { id: "hillshade-layer", type: "hillshade", source: "dem", layout: { visibility: "none" }, paint: { "hillshade-exaggeration": 0.1 } },
            {
                id: "contour-lines",
                type: "line",
                source: "contour-source",
                "source-layer": "contours",
                layout: { "line-join": "round", visibility: "none" },
                paint: { "line-opacity": 0.33, "line-width": ["match", ["get", "level"], 1, 1, 0.5], "line-color": currentStyle === "dark" ? "#fff" : "#000" }
            },
            {
                id: "contour-labels",
                type: "symbol",
                source: "contour-source",
                "source-layer": "contours",
                filter: [">", ["get", "level"], 0],
                layout: { "symbol-placement": "line", "text-size": 10, "text-field": ["concat", ["number-format", ["get", "ele"], {}], " m"], "text-font": ["Noto Sans Bold"], visibility: "none" },
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
                    "line-width": ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 4, 13, 2],
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
                    "line-width": ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 4, 13, 2],
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
        const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT90q_lKriPriF0lBgggvlbnHwJgbtLz-SrkUd8YsU-IBiFkmhzlDcHaLZ7BUvWZSZept-iBvMKVVAs/pub?gid=0&single=true&output=csv";
        const googleSheetUrl_4_earth = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT90q_lKriPriF0lBgggvlbnHwJgbtLz-SrkUd8YsU-IBiFkmhzlDcHaLZ7BUvWZSZept-iBvMKVVAs/pub?gid=363853972&single=true&output=csv";
        let hermes_records = [];

        document.getElementById("progress-container").style.opacity = "1";
        updateProgress(0, 1); // Start progress

        try {
            const responses = await Promise.all([
                fetch(googleSheetUrl),
                fetch(googleSheetUrl_4_earth)
            ]);

            const csvTexts = await Promise.all(responses.map(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text();
            }));

            csvTexts.forEach(csvText => {
                const rows = csvText.trim().split('\n');
                const headers = rows.shift().trim().split(',').map(h => h.trim());
                
                const records = rows.map(row => {
                    if (!row || !row.trim()) return null;

                    const values = row.split(',');

                    const obj = {};
                    headers.forEach((header, i) => {
                        let value = (values[i] || '').trim();
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1).replace(/""/g, '"');
                        }
                        obj[header] = value || undefined;
                    });
                    return obj;
                }).filter(r => r && r.date);
                
                hermes_records.push(...records);
            });
            
        } catch (error) {
            console.error("Google Sheet에서 기록을 불러오지 못했습니다:", error);
            const progressContainer = document.getElementById("progress-container");
            progressContainer.textContent = "Google Sheet에서 기록을 불러오는 데 실패했습니다.";
            return;
        }

        const totalRecords = hermes_records.length;
        let processedCount = 0;
        const gpxRecordsToFetch = [];
        
        const featuresFromSheet = [];

        for (const record of hermes_records) {
            const suffix = record.over || record.type;
            const shortPath = `${record.date}${suffix ? `_${suffix}` : ""}`.trim();
            
            if (record.geometry && record.geometry.length > 10) {
                const coordinates = decodeCoordinates(record.geometry);
                if (coordinates.length > 0) {
                    featuresFromSheet.push(createFeature(record, coordinates, shortPath));
                }
            } else if (!record.comment?.includes("gpx 파일 누락") && !record.comment?.includes("위치 기록 누락")) {
                gpxRecordsToFetch.push({ record, shortPath });
            }
        }

        if (featuresFromSheet.length > 0) {
            processNewFeatures(featuresFromSheet);
            updateMapSources();
            processedCount += featuresFromSheet.length;
            updateProgress(processedCount, totalRecords);
        }
        
        if (gpxRecordsToFetch.length > 0) {
            const gpxWorker = new Worker("/잔디심기/earth/gpx-worker.js");
            const promises = new Map();
            gpxWorker.onmessage = ({ data }) => {
                if (promises.has(data.path)) promises.get(data.path).resolve(data.encodedCoordinates);
            };
            gpxWorker.onerror = (error) => promises.forEach(({ reject }) => reject(error));

            for (const { record, shortPath } of gpxRecordsToFetch) {
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
        loadGpxData();
        if (hermes && typeof hermes.gpx.init === "function") hermes.gpx.init(map);

        const terrariumBtn = document.getElementById("terrarium-btn");
        let isTerrariumOn = false;
        terrariumBtn.addEventListener("click", () => {
            isTerrariumOn = !isTerrariumOn;
            terrariumBtn.classList.toggle("active", isTerrariumOn);
            if (useFreeService) {
                if (isTerrariumOn) {
                    map.setTerrain({ source: "dem", exaggeration: 1.5 });
                    map.setLayoutProperty("hillshade-layer", "visibility", "visible");
                    map.setLayoutProperty("contour-lines", "visibility", "visible");
                    map.setLayoutProperty("contour-labels", "visibility", "visible");
                } else {
                    map.setTerrain(null);
                    map.setLayoutProperty("hillshade-layer", "visibility", "none");
                    map.setLayoutProperty("contour-lines", "visibility", "none");
                    map.setLayoutProperty("contour-labels", "visibility", "none");
                }
            } else {
                if (isTerrariumOn) {
                    map.setTerrain({ source: (currentStyle === "light" ? "terrain-rgb-v2" : "terrain-rgb"), exaggeration: 1.5 });
                    map.setLayoutProperty("Hillshading", "visibility", "visible");
                } else {
                    map.setTerrain(null);
                    map.setLayoutProperty("Hillshading", "visibility", "none");
                }
            }
        });

        hermes.initializeTooltips();
        hermes.settingsRouteDesign(map);

        const tooltipEl = document.getElementById("tooltip");
        let hoveredFeatureId = null;
        const highlightLayers = ["gpx-highlight-border", "gpx-highlight-main", "gpx-highlight-points-border", "gpx-highlight-points"];
        const layersToQuery = ["gpx-line-base", "gpx-line-base-certi"];
        const normalColors = { start: "#00ff80", end: "#005c45" };
        const certiColors = { start: "#ffd700", end: "#f57f17" };

        function clearHighlightAndTooltip() {
            if (hoveredFeatureId !== null) {
                hoveredFeatureId = null;
                highlightLayers.forEach((layerId) => {
                    if (map.getLayer(layerId)) {
                        map.setFilter(layerId, ["==", "id", ""]);
                    }
                });
            }
            tooltipEl.classList.remove("on");
            map.getCanvas().style.cursor = "";
        }

        function showFeatureTooltip(feature, e) {
            const newHoveredId = feature.properties.id;
            if (hoveredFeatureId !== newHoveredId) {
                hoveredFeatureId = newHoveredId;
                const isCertified = feature.properties.certified;
                const filter = ["==", ["get", "id"], hoveredFeatureId];
                highlightLayers.forEach((layerId) => map.setFilter(layerId, filter));
                const gradient = isCertified
                    ? ["interpolate", ["linear"], ["line-progress"], 0, certiColors.start, 1, certiColors.end]
                    : ["interpolate", ["linear"], ["line-progress"], 0, normalColors.start, 1, normalColors.end];
                map.setPaintProperty("gpx-highlight-main", "line-gradient", gradient);
            }

            map.getCanvas().style.cursor = "pointer";
            tooltipEl.classList.add("on");
            tooltipEl.innerHTML = generateTooltipHtml(feature.properties);
            if (window.matchMedia("only screen and (min-width: 1920px)").matches) {
                tooltipEl.style.left = `${e.point.x + 15}px`;
                tooltipEl.style.top = `${e.point.y - 40}px`;
            }
        }

        map.on("mousemove", (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });

            if (features.length > 0) {
                showFeatureTooltip(features[0], e);
            } else {
                map.getCanvas().style.cursor = "";
            }

            if (tooltipEl.classList.contains("on")) {
                if (window.matchMedia("only screen and (min-width: 1920px)").matches) {
                    // 1. 가로(Left) 위치 계산: 왼쪽 및 오른쪽 한계 설정
                    const halfWidth = tooltipEl.offsetWidth / 2;
                    const maxRight = window.innerWidth - halfWidth;
                    const margin = 16;

                    if (halfWidth > e.point.x - margin) {
                        // 1) 왼쪽 경계를 벗어날 때
                        tooltipEl.style.left = `calc(${halfWidth}px + 1em)`;
                    } else if (e.point.x > maxRight - margin) {
                        // 2) 오른쪽 경계를 벗어날 때 (툴팁의 절반이 오른쪽에 걸칠 때)
                        tooltipEl.style.left = `calc(${maxRight}px - 1em)`;
                    } else {
                        // 3) 정상 위치
                        tooltipEl.style.left = `${e.point.x}px`;
                    }

                    // 2. 세로(Top) 위치 계산: 위쪽 한계 설정 (기존 코드 유지)
                    if (tooltipEl.offsetHeight > e.point.y - 16 * 3) {
                        tooltipEl.classList.add("fixedTop");
                        tooltipEl.style.top = ``;
                    } else {
                        tooltipEl.classList.remove("fixedTop");
                        tooltipEl.style.top = `${e.point.y}px`;
                    }
                }
            }
        });

        map.on("touchstart", (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });
            if (features.length > 0) {
                // e.preventDefault();
                showFeatureTooltip(features[0], e);
            }
        });

        map.on("click", (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });
            if (features.length === 0) {
                clearHighlightAndTooltip();
            }
        });

        map.on("mousedown", (e) => {
            tooltipEl.classList.remove("on");
        });

        map.on("mouseup", (e) => {
            if (hoveredFeatureId !== null) {
                tooltipEl.classList.add("on");
            }
        });


    });
})();
