
// GPX-SVG 변환 및 툴팁 관련 기능을 담당하는 스크립트

// 전역 캐시 객체 초기화
hermes.svgCache = {}; // 렌더링된 SVG 경로 캐시
hermes.compressedCache = {}; // 불러온 압축 데이터 연도별 캐시

// 좌표 디코딩 함수 (earth 페이지와 동일)
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

        // GPX 파서와 동일한 {lon, lat, ele} 구조를 맞추기 위해 Z(고도) 값도 추가 (압축 데이터에는 고도 정보 없음)
        coordinates.push([lon / 1e6, lat / 1e6, 0]);
    }
    return coordinates;
}

/**
 * GPX 데이터를 기반으로 SVG 경로를 생성하고 렌더링하는 함수.
 * 압축된 데이터를 우선적으로 확인하고, 없을 경우 원본 GPX 파일을 불러옵니다.
 *
 * @param {string} gpxUrl - 원본 GPX 파일의 경로.
 * @param {string} svgElementId - SVG를 렌더링할 요소의 CSS 셀렉터.
 */
hermes.gpx2svg = async (gpxUrl, svgElementId) => {
    await new Promise((resolve) => setTimeout(resolve, 0)); // DOM 업데이트 대기

    const svg = document.querySelector(svgElementId);
    if (!svg) return;

    const svgLoading = '<image href="imgs/icon_loading.svg" class="svg-info" />';
    const svgNotFound = '<image href="imgs/icon_notfound.svg" class="svg-info" />';

    svg.innerHTML = svgLoading;

    // 1. 렌더링된 SVG 캐시 확인
    const cachedSvg = hermes.svgCache[gpxUrl];
    if (cachedSvg) {
        if (cachedSvg === "not-found") {
            svg.innerHTML = svgNotFound;
        } else {
            svg.setAttribute("viewBox", cachedSvg.viewBox);
            svg.setAttribute("style", cachedSvg.style);
            svg.innerHTML = cachedSvg.innerHTML;
        }
        return;
    }

    try {
        let pts = null;
        const urlParts = gpxUrl.split('/');
        const year = urlParts[1];
        const shortPath = urlParts[2].replace('.gpx', '');
        const compressedUrl = `records/${year}.json`;

        // 2. 압축 데이터 확인 (메모리 캐시 우선)
        let yearDataMap = hermes.compressedCache[year];
        if (!yearDataMap) {
            try {
                const res = await fetch(compressedUrl);
                if (res.ok) {
                    const data = await res.json();
                    const features = Array.isArray(data) ? data : data.features;
                    const newMap = new Map();
                    features.forEach((feat) => {
                        if (feat && feat.properties && feat.properties.path) {
                            newMap.set(feat.properties.path.trim(), feat);
                        }
                    });
                    hermes.compressedCache[year] = newMap;
                    yearDataMap = newMap;
                } else {
                    hermes.compressedCache[year] = "not-found";
                }
            } catch (e) {
                hermes.compressedCache[year] = "not-found";
            }
        }

        // 압축 데이터에서 경로 추출
        if (yearDataMap && yearDataMap !== "not-found") {
            const feat = yearDataMap.get(shortPath);
            if (feat && feat.geometry && feat.geometry.encoded_coordinates) {
                const decodedCoords = decodeCoordinates(feat.geometry.encoded_coordinates);
                pts = decodedCoords.map((c) => ({ lon: c[0], lat: c[1], ele: c[2] || 0 }));
            }
        }

        // 3. 압축 데이터에 없으면 원본 GPX 파일 Fetch
        if (!pts) {
            const response = await fetch(gpxUrl);
            if (!response.ok) throw new Error("GPX file not found");
            const gpxText = await response.text();
            const parser = new DOMParser();
            const gpxDoc = parser.parseFromString(gpxText, "text/xml");
            pts = Array.from(gpxDoc.querySelectorAll("trkpt")).map((pt) => ({
                lat: parseFloat(pt.getAttribute("lat")),
                lon: parseFloat(pt.getAttribute("lon")),
                ele: parseFloat(pt.querySelector("ele")?.textContent || 0)
            }));
        }

        if (pts.length < 2) {
            svg.innerHTML = ""; // 그릴 포인트가 없음
            return;
        }

        // --- 여기서부터 SVG 렌더링 로직 (기존과 동일) ---

        let totalElevationGain = 0;
        for (let i = 1; i < pts.length; i++) {
            const eleDiff = pts[i].ele - pts[i - 1].ele;
            if (eleDiff > 0) totalElevationGain += eleDiff;
        }

        const lats = pts.map((p) => p.lat);
        const lons = pts.map((p) => p.lon);
        const tolerance = 0.0025;
        const minLat = Math.min(...lats) - tolerance, maxLat = Math.max(...lats) + tolerance;
        const minLon = Math.min(...lons) - tolerance, maxLon = Math.max(...lons) + tolerance;

        const width = (maxLon - minLon) * 5000;
        const height = (maxLat - minLat) * 5000;

        // const startColor = { r: 0, g: 255, b: 127 }, endColor = { r: 0, g: 92, b: 69 };
        // function interpolateColor(c1, c2, factor) {
        //     const r = Math.round(c1.r + factor * (c2.r - c1.r)).toString(16).padStart(2, "0");
        //     const g = Math.round(c1.g + factor * (c2.g - c1.g)).toString(16).padStart(2, "0");
        //     const b = Math.round(c1.b + factor * (c2.b - c1.b)).toString(16).padStart(2, "0");
        //     return `#${r}${g}${b}`;
        // }

        // --- SVG 렌더링 로직 수정 ---

        let pathSegments = "";
        const numPathElements = 64, totalSegments = pts.length - 1;
        if (totalSegments > 0) {
            const segmentsPerPath = Math.ceil(totalSegments / numPathElements);
            
            // 테두리 경로와 메인 경로를 담을 그룹 생성
            let borderPaths = '<g class="gpx-border">';
            let mainPaths = '<g class="gpx-main">';

            for (let i = 0; i < numPathElements; i++) {
                const startSegment = i * segmentsPerPath;
                if (startSegment >= totalSegments) break;

                const endSegment = Math.min((i + 1) * segmentsPerPath, totalSegments);
                const firstPoint = pts[startSegment];
                
                let pathData = `M ${((firstPoint.lon - minLon) / (maxLon - minLon)) * width} ${height - ((firstPoint.lat - minLat) / (maxLat - minLat)) * height}`;
                for (let j = startSegment; j < endSegment; j++) {
                    const nextPoint = pts[j + 1];
                    pathData += ` L ${((nextPoint.lon - minLon) / (maxLon - minLon)) * width} ${height - ((nextPoint.lat - minLat) / (maxLat - minLat)) * height}`;
                }

                // 테두리 경로 (더 두껍고 반투명한 검정색)
                borderPaths += `<path d="${pathData}" fill="none" stroke="var(--color--track)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`;
                
                // 메인 경로 (기존 색상)
                mainPaths += `<path d="${pathData}" fill="none" stroke="color-mix(in oklab, var(--color--gpx-start), var(--color--gpx-end) ${startSegment / totalSegments * 100}%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
            }

            borderPaths += '</g>';
            mainPaths += '</g>';

            const x_start = ((pts[0].lon - minLon) / (maxLon - minLon)) * width;
            const y_start = height - ((pts[0].lat - minLat) / (maxLat - minLat)) * height;
            const x_end = ((pts[pts.length - 1].lon - minLon) / (maxLon - minLon)) * width;
            const y_end = height - ((pts[pts.length - 1].lat - minLat) / (maxLat - minLat)) * height;
            borderPaths += `<circle cx="${x_start}" cy="${y_start}" r="6" fill="var(--color--track)" />`;
            borderPaths += `<circle cx="${x_end}" cy="${y_end}" r="6" fill="var(--color--track)" />`;
            mainPaths += `<circle cx="${x_start}" cy="${y_start}" r="3.5" stroke="var(--color--gpx-start)" stroke-width="2" fill="var(--color--track)" />`;
            mainPaths += `<circle cx="${x_end}" cy="${y_end}" r="3.5" stroke="var(--color--gpx-end)" stroke-width="2" fill="var(--color--track)" />`;
      
            // 테두리 그룹을 먼저 추가하고 그 위에 메인 그룹을 추가
            pathSegments = borderPaths + mainPaths;
        }

        let svgInnerHtml = pathSegments;
        if (totalElevationGain >= 250) {
            const highestPoint = pts.reduce((max, p) => (p.ele > max.ele ? p : max), pts[0]);
            if (highestPoint) {
                const peakX = ((highestPoint.lon - minLon) / (maxLon - minLon)) * width;
                const peakY = height - ((highestPoint.lat - minLat) / (maxLat - minLat)) * height;
                // 최고 고도 마커에도 테두리와 일관된 모서리 스타일 적용
                svgInnerHtml += `<path d="M ${peakX} ${peakY - 6} L ${peakX - 4} ${peakY + 2} L ${peakX + 4} ${peakY + 2} Z" fill="gold" stroke="#00b264" stroke-width="2" stroke-linejoin="round"/>`;
            }
        }


      
        const viewBox = `0 0 ${width} ${height}`;
        const style = `width: ${width}px`;

        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("style", style);
        svg.innerHTML = svgInnerHtml;

        // 4. 렌더링된 SVG 결과를 캐시에 저장
        hermes.svgCache[gpxUrl] = { viewBox, style, innerHTML: svgInnerHtml };

    } catch (error) {
        hermes.svgCache[gpxUrl] = "not-found";
        svg.innerHTML = svgNotFound;
    }
};

/**
 * 활동 기록 배열을 받아 GPX 경로를 포함한 상세 툴팁 HTML을 생성합니다.
 */
hermes.tooltip = (records) => {
    let tooltipContent = "";
    if (!Array.isArray(records)) records = [records];
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    records.forEach((rec) => {
        const paceValue = rec.course === "trail" ? rec.elevation_pace : rec.pace;
        const tooltipPace = `${Math.floor(paceValue / 60)}′${Math.floor(paceValue % 60).toString().padStart(2, "0")}″${rec.course === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'}`;
        const tooltipDistance = rec.course === "trail" ? `${rec.elevation} <span class="unit"> m</span>` : `${rec.distance.toFixed(2)} <span class="unit"> km</span>`;
        const tooltip_type = rec.isOfficial ? "공식 대회" : rec.type === "trail" ? "하이킹 / 트레일러닝" : rec.type === "walk" ? "걷기" : "러닝";
        const icon_distance = rec.course === "trail" ? "altitude" : "conversion_path";
        const comment = rec.comment ? `<span class="comment">${rec.comment}</span>` : "";
        const gpxFileName = rec.date + (rec.over !== undefined ? "_" + rec.over : "");

        tooltipContent += `
        <div class="tooltip-item ${rec.isOfficial ? "official" : ""}">
            <div class="gpx d-${gpxFileName}"><svg></svg></div>
            <div class="title-container">
                <span class="type">${tooltip_type}</span>
                <span class="date">${rec.date}</span>
                <div class="title">${rec.title} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""} ${comment}</div>
            </div>
            <div class="data">
                <span class="material-symbols-outlined icon distance">${icon_distance}</span> <span class="distance">${tooltipDistance}</span> <span class="div"></span>
                <span class="material-symbols-outlined icon record">timer</span> <span class="rec">${rec.record}</span> <span class="div"></span>
                <span class="material-symbols-outlined icon pace">speed</span> <span class="pace">${tooltipPace}</span>
            </div>
        </div>`;

        // 툴팁 생성 후, 해당 GPX/SVG를 그리는 함수 호출
        hermes.gpx2svg(`records/${new Date(rec.date).getFullYear()}/${gpxFileName}.gpx`, `#tooltip .gpx.d-${gpxFileName} svg`);
    });

    return tooltipContent;
};

// 일반 'title' 속성을 위한 툴팁 기능 초기화
function initializeGenericTooltips() {
    const tooltip = document.getElementById("tooltip");
    if (!tooltip) return;

    document.body.addEventListener("mouseover", (e) => {
        const target = e.target.closest("[title]");
        if (target && target.title && !target.closest(".day-cell, .marker")) {
            target.dataset.genericTooltip = target.title;
            target.title = "";
            tooltip.innerHTML = `<div class="tooltip-comment">${target.dataset.genericTooltip}</div>`;
            tooltip.classList.add("on", "generic");
        }
    });

    document.body.addEventListener("mouseout", (e) => {
        const target = e.target.closest("[data-generic-tooltip]");
        if (target) {
            target.title = target.dataset.genericTooltip;
            target.removeAttribute("data-generic-tooltip");
            if (tooltip.classList.contains("generic")) {
                tooltip.classList.remove("on", "generic");
            }
        }
    });
}

// 모든 툴팁이 마우스를 따라다니도록 공통 리스너 추가
if (!hermes.tooltipListenerAttached) {
    document.addEventListener("mousemove", (e) => {
        const tooltipEl = document.getElementById("tooltip");
        if (tooltipEl && tooltipEl.classList.contains("on")) {
            tooltipEl.style.left = e.pageX + "px";
            tooltipEl.style.top = e.pageY + "px";
        }
    });
    hermes.tooltipListenerAttached = true;
}

document.addEventListener("DOMContentLoaded", initializeGenericTooltips);
