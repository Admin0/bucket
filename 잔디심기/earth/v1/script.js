const map = L.map('map');
const gpxCounter = document.getElementById('gpx-counter');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

function onLocationFound(e) {
    map.setView(e.latlng, 13);
    loadGpxFiles();
}

function onLocationError(e) {
    console.log(e.message);
    map.setView([37.5665, 126.9780], 13);
    loadGpxFiles();
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: false, maxZoom: 13});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    minZoom: 5,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

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


async function loadGpxFiles() {
    const allRecords = hermes_records;
    const totalRecords = allRecords.length;
    let processedCount = 0;
    updateProgress(processedCount, totalRecords);

    const years = [...new Set(allRecords.map(r => r.date.substring(0, 4)))];
    const compressedDataMap = new Map();

    const compressedJsonPromises = years.map(year => {
        return fetch(`../../records/compressed/${year}.json`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    const yearDataMap = new Map();
                    const features = Array.isArray(data) ? data : data.features;
                    features.forEach(feat => {
                        if (feat && feat.properties && feat.properties.path) {
                            yearDataMap.set(feat.properties.path.trim(), feat);
                        }
                    });
                    compressedDataMap.set(year, yearDataMap);
                }
            });
    });
    await Promise.allSettled(compressedJsonPromises);

    const gpxRecordsToFetch = [];
    allRecords.forEach(record => {
        const year = record.date.substring(0, 4);
        const shortPath = `${record.date}${record.over ? `_${record.over}` : ""}`.trim();
        const compressedYearData = compressedDataMap.get(year);
        
        let feat = compressedYearData ? compressedYearData.get(shortPath) : null;

        if (feat) {
            const coordinates = decodeCoordinates(feat.geometry.encoded_coordinates);
            L.polyline(coordinates.map(c => [c[1], c[0]]), {
                color: '#00b264',
                weight: 3,
                opacity: 0.5
            }).addTo(map);
            processedCount++;
        } else {
            if (!record.comment?.includes("gpx 파일 누락") && !record.comment?.includes("위치 기록 누락")) {
                 gpxRecordsToFetch.push(record);
            } else {
                processedCount++;
            }
        }
    });
    
    updateProgress(processedCount, totalRecords);

    if (gpxRecordsToFetch.length > 0) {
        const gpxFiles = gpxRecordsToFetch.map(record => {
            const basePath = `../../records/${record.date.substring(0, 4)}/${record.date}`;
            return record.over ? `${basePath}_${record.over}.gpx` : `${basePath}.gpx`;
        });

        const gpxWorker = new Worker('gpx-worker.js');
        gpxWorker.postMessage(gpxFiles);

        gpxWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            
            if (type === 'gpx-data') {
                L.polyline(payload, {
                    color: '#00b264',
                    weight: 3,
                    opacity: 0.5
                }).addTo(map);
            }
            
            processedCount++;
            updateProgress(processedCount, totalRecords);
        };
    }
}

/**
 * 프로그레스 바와 카운터의 UI를 업데이트하는 함수
 * @param {number} loaded - 현재 처리된 파일 수
 * @param {number} total - 전체 파일 수
 */
function updateProgress(loaded, total) {
    const percentage = total > 0 ? (loaded / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    gpxCounter.textContent = `${loaded} / ${total}`;
    gpxCounter.style.left = `${percentage}%`;

    if (percentage < 10) {
        gpxCounter.style.transform = 'translateX(0%)';
    } else if (percentage > 90) {
        gpxCounter.style.transform = 'translateX(-100%)';
    } else {
        gpxCounter.style.transform = 'translateX(-50%)';
    }
}
