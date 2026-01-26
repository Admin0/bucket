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

/**
 * 웹 워커를 사용하여 GPX 파일들을 백그라운드에서 로드하고, 지도에 경로를 표시합니다.
 * 메인 스레드의 부하를 줄여 부드러운 UI 경험을 제공합니다.
 */
function loadGpxFiles() {
    const gpxFiles = [];
    hermes_records.forEach(record => {
        if ((record.comment && record.comment.includes("gpx 파일 누락")) || (record.comment && record.comment.includes("위치 기록 누락"))) {
            return;
        }
        const year = record.date.substring(0, 4);
        const basePath = `../records/${year}/${record.date}`;

        // 수정된 로직: 각 레코드가 하나의 GPX 파일에만 매핑되도록 수정
        if (record.over) {
            // 'over' 속성 값이 있으면 _1, _2 와 같은 접미사가 붙은 파일명을 사용
            gpxFiles.push(`${basePath}_${record.over}.gpx`);
        } else {
            // 'over' 속성이 없으면 기본 파일명을 사용
            gpxFiles.push(`${basePath}.gpx`);
        }
    });

    const totalFiles = gpxFiles.length;
    let loadedFiles = 0;
    updateProgress(loadedFiles, totalFiles);

    // 웹 워커 생성
    const gpxWorker = new Worker('gpx-worker.js');

    // 워커에게 GPX 파일 목록을 전달하며 작업 시작
    gpxWorker.postMessage(gpxFiles);

    // 워커로부터 메시지 수신
    gpxWorker.onmessage = (e) => {
        const { type, payload, index } = e.data;
        
        if (type === 'gpx-data') {
            // 워커가 보낸 좌표 데이터로 경로를 그림
            L.polyline(payload, {
                color: '#00b264',
                weight: 3,
                opacity: 0.5
            }).addTo(map);
        } else if (type === 'error') {
            console.error('Failed to load or parse GPX file:', payload);
        }

        // 진행률 업데이트 (성공/실패에 관계없이)
        loadedFiles++;
        updateProgress(loadedFiles, totalFiles);
    };
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

    // if (loaded === total) {
    //     setTimeout(() => {
    //         progressContainer.style.opacity = '0';
    //         gpxCounter.style.opacity = '0';
    //     }, 500);
    // }
}
