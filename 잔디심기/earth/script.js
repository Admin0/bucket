const map = new maplibregl.Map({
    container: 'map',
    style: 'theme-dark.json',
    center: [127.5, 36],
    zoom: 8,
});

map.addControl(
    new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
    })
);

// 1. 현재 위치 추적 컨트롤을 생성합니다.
const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true, // 높은 정확도의 위치 정보를 요청합니다.
    },
    trackUserLocation: true, // 사용자의 위치를 지속적으로 추적합니다.
    showUserHeading: true, // 사용자가 바라보는 방향을 표시합니다.
});

// 2. 생성한 컨트롤을 지도에 추가합니다. (화면에 버튼이 나타납니다)
map.addControl(geolocate);

// --- Global state ---
let allCoordinates = [];
let isDataLoadingOrLoaded = false;
let currentTheme = "dark";

// --- Theme switcher ---
document.getElementById("theme-switcher").addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    map.setStyle(currentTheme === "dark" ? "theme-dark.json" : "theme.json");
});

// --- UI update function ---
function updateProgress(loaded, total) {
    const progressBar = document.getElementById("progress-bar");
    const gpxCounter = document.getElementById("gpx-counter");
    const progressContainer = document.getElementById("progress-container");

    const percentage = total > 0 ? (loaded / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    gpxCounter.textContent = `${loaded} / ${total}`;
    gpxCounter.style.left = `${percentage}%`;

    if (percentage < 10) {
        gpxCounter.style.transform = "translateX(0%)";
    } else if (percentage > 90) {
        gpxCounter.style.transform = "translateX(-100%)";
    } else {
        gpxCounter.style.transform = "translateX(-50%)";
    }

    if (loaded === total) {
        setTimeout(() => {
            progressContainer.style.opacity = "0";
            gpxCounter.style.opacity = "0";
        }, 1000);
    }
}

// --- Map data handling ---
function updateMapSource() {
    const source = map.getSource("gpx-data-source");
    if (source) {
        const lineFeature = {
            type: "Feature",
            properties: {},
            geometry: { type: "MultiLineString", coordinates: allCoordinates },
        };
        source.setData({
            type: "FeatureCollection",
            features: [lineFeature],
        });
    }
}

function addSourcesAndLayers() {
    map.setProjection({ type: "globe" }); // 올바른 프로젝션 설정

    if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
    }
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    // Add GPX data source if it doesn't exist
    if (!map.getSource("gpx-data-source")) {
        map.addSource("gpx-data-source", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
    }

    // Add GPX layer if it doesn't exist
    if (!map.getLayer("all-gpx-layer")) {
        map.addLayer({
            id: "all-gpx-layer",
            type: "line",
            source: "gpx-data-source",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": currentTheme === "dark" ? "#00ff7f" : "#00b264", "line-width": 2.5, "line-opacity": 0.25 },
        });
    }

    // If data is already loaded, update the source immediately
    if (allCoordinates.length > 0) {
        updateMapSource();
    }
}

// --- Main data loading logic ---
async function loadGpxData() {
    if (isDataLoadingOrLoaded) {
        return;
    }
    isDataLoadingOrLoaded = true;

    const cachedData = localStorage.getItem("cachedGpxCoordinates");
    if (cachedData) {
        console.log("Loading from cache...");
        allCoordinates = JSON.parse(cachedData);
        updateMapSource();
        updateProgress(1, 1);
        return;
    }

    const gpxFilePaths = [];
    hermes_records.forEach((record) => {
        if ((record.comment && record.comment.includes("gpx 파일 누락")) || (record.comment && record.comment.includes("위치 기록 누락"))) {
            return;
        }
        const year = record.date.substring(0, 4);
        const basePath = `../records/${year}/${record.date}`;
        if (record.over) {
            gpxFilePaths.push(`${basePath}_${record.over}.gpx`);
        } else {
            gpxFilePaths.push(`${basePath}.gpx`);
        }
    });

    const totalFiles = gpxFilePaths.length;
    let loadedFiles = 0;
    updateProgress(loadedFiles, totalFiles);

    const gpxWorker = new Worker("gpx-worker.js?v=" + new Date().getTime());

    for (const path of gpxFilePaths) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const gpxText = await response.text();

            const coordinates = await new Promise((resolve, reject) => {
                gpxWorker.onmessage = (e) => resolve(e.data.coordinates);
                gpxWorker.onerror = (e) => reject(new Error("Worker error: " + e.message));
                gpxWorker.postMessage({ gpxText });
            });

            if (coordinates.length > 0) {
                allCoordinates.push(coordinates);
            }
        } catch (error) {
            console.error(`Failed to load or process ${path}:`, error);
        } finally {
            loadedFiles++;
            updateProgress(loadedFiles, totalFiles);
            if (allCoordinates.length > 0) {
                updateMapSource();
            }
        }
    }

    if (allCoordinates.length > 0) {
        console.log("Saving to cache...");
        localStorage.setItem("cachedGpxCoordinates", JSON.stringify(allCoordinates));
    }

    gpxWorker.terminate();
}

// --- Map event listeners ---
map.on("load", () => {
    // 3. 지도가 로드되면, 컨트롤을 실행하여 현재 위치를 요청하고 지도를 이동시킵니다.
    // geolocate.trigger();

    addSourcesAndLayers();
    loadGpxData();
});

map.on("style.load", () => {
    // This event fires when a new style is loaded, so we re-apply our layers
    addSourcesAndLayers();
});
