// GPX-SVG 변환 및 툴팁 관련 기능을 담당하는 스크립트

// 전역 캐시 객체 초기화
hermes.svgCache = {}; // 렌더링된 SVG 경로 캐시

// 좌표 디코딩 함수
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

        coordinates.push([lon / 1e6, lat / 1e6, 0]);
    }
    return coordinates;
}

/**
 * geometry 데이터를 기반으로 SVG 경로를 생성하고 렌더링하는 함수.
 *
 * @param {string} geometry - 인코딩된 폴리라인 문자열.
 * @param {string} svgElementId - SVG를 렌더링할 요소의 CSS 셀렉터.
 */
hermes.gpx2svg = async (geometry, svgElementId) => {
    await new Promise((resolve) => setTimeout(resolve, 0)); // DOM 업데이트 대기

    const svg = document.querySelector(svgElementId);
    if (!svg) return;

    const svgLoading = '<image href="imgs/icon_loading.svg" class="svg-info" />';
    const svgNotFound = '<image href="imgs/icon_notfound.svg" class="svg-info" />';

    svg.innerHTML = svgLoading;

    // 1. 렌더링된 SVG 캐시 확인 (geometry를 키로 사용)
    const cacheKey = geometry;
    const cachedSvg = hermes.svgCache[cacheKey];
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

        if (geometry) {
            const decodedCoords = decodeCoordinates(geometry);
            pts = decodedCoords.map((c) => ({ lon: c[0], lat: c[1], ele: c[2] || 0 }));
        }

        if (!pts || pts.length < 2) {
            svg.innerHTML = svgNotFound; // Fallback for no points
            hermes.svgCache[cacheKey] = "not-found"; // 캐시에 'not-found' 저장
            return;
        }

        // --- SVG 렌더링 로직 (위도-경도 비율 보정 적용) ---
        let totalElevationGain = 0;
        for (let i = 1; i < pts.length; i++) {
            const eleDiff = pts[i].ele - pts[i - 1].ele;
            if (eleDiff > 0) totalElevationGain += eleDiff;
        }

        const lats = pts.map((p) => p.lat);
        const lons = pts.map((p) => p.lon);
        const tolerance = 0.0025;
        const minLat = Math.min(...lats) - tolerance,
            maxLat = Math.max(...lats) + tolerance;
        const minLon = Math.min(...lons) - tolerance,
            maxLon = Math.max(...lons) + tolerance;

        // 위도에 따른 경도 거리 보정 계수
        const aspectRatio = Math.cos(minLat * Math.PI / 180);
        const width = (maxLon - minLon) * 5000 * aspectRatio; // 너비에 보정 계수 적용
        const height = (maxLat - minLat) * 5000;

        let pathSegments = "";
        const numPathElements = 64,
            totalSegments = pts.length - 1;
        if (totalSegments > 0) {
            const segmentsPerPath = Math.ceil(totalSegments / numPathElements);

            let borderPaths = '<g class="gpx-border">';
            let mainPaths = '<g class="gpx-main">';

            for (let i = 0; i < numPathElements; i++) {
                const startSegment = i * segmentsPerPath;
                if (startSegment >= totalSegments) break;

                const endSegment = Math.min((i + 1) * segmentsPerPath, totalSegments);
                const firstPoint = pts[startSegment];

                // 경로 데이터 계산 시 x 좌표에 보정 계수 적용
                let pathData = `M ${((firstPoint.lon - minLon) / (maxLon - minLon)) * width} ${height - ((firstPoint.lat - minLat) / (maxLat - minLat)) * height}`;
                for (let j = startSegment; j < endSegment; j++) {
                    const nextPoint = pts[j + 1];
                    pathData += ` L ${((nextPoint.lon - minLon) / (maxLon - minLon)) * width} ${height - ((nextPoint.lat - minLat) / (maxLat - minLat)) * height}`;
                }

                borderPaths += `<path d="${pathData}" fill="none" stroke="var(--color--track)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`;
                mainPaths += `<path d="${pathData}" fill="none" stroke="color-mix(in oklab, var(--color--gpx-start), var(--color--gpx-end) ${(startSegment / totalSegments) * 100}%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
            }

            borderPaths += "</g>";
            mainPaths += "</g>";

            const x_start = ((pts[0].lon - minLon) / (maxLon - minLon)) * width;
            const y_start = height - ((pts[0].lat - minLat) / (maxLat - minLat)) * height;
            const x_end = ((pts[pts.length - 1].lon - minLon) / (maxLon - minLon)) * width;
            const y_end = height - ((pts[pts.length - 1].lat - minLat) / (maxLat - minLat)) * height;
            borderPaths += `<circle cx="${x_start}" cy="${y_start}" r="6" fill="var(--color--track)" />`;
            borderPaths += `<circle cx="${x_end}" cy="${y_end}" r="6" fill="var(--color--track)" />`;
            mainPaths += `<circle cx="${x_start}" cy="${y_start}" r="3.5" stroke="var(--color--gpx-start)" stroke-width="2" fill="var(--color--track)" />`;
            mainPaths += `<circle cx="${x_end}" cy="${y_end}" r="3.5" stroke="var(--color--gpx-end)" stroke-width="2" fill="var(--color--track)" />`;

            pathSegments = borderPaths + mainPaths;
        }

        let svgInnerHtml = pathSegments;
        if (totalElevationGain >= 250) {
            const highestPoint = pts.reduce((max, p) => (p.ele > max.ele ? p : max), pts[0]);
            if (highestPoint) {
                const peakX = ((highestPoint.lon - minLon) / (maxLon - minLon)) * width;
                const peakY = height - ((highestPoint.lat - minLat) / (maxLat - minLat)) * height;
                svgInnerHtml += `<path d="M ${peakX} ${peakY - 6} L ${peakX - 4} ${peakY + 2} L ${peakX + 4} ${peakY + 2} Z" fill="gold" stroke="#00b264" stroke-width="2" stroke-linejoin="round"/>`;
            }
        }

        const viewBox = `0 0 ${width} ${height}`;
        const style = `width: ${width}px`;

        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("style", style);
        svg.innerHTML = svgInnerHtml;

        hermes.svgCache[cacheKey] = { viewBox, style, innerHTML: svgInnerHtml };

    } catch (error) {
        console.error("Error rendering SVG:", error);
        hermes.svgCache[cacheKey] = "not-found";
        svg.innerHTML = svgNotFound;
    }
};

/**
 * 활동 기록 배열을 받아 GPX 경로를 포함한 상세 툴팁 HTML을 생성합니다.
 */
hermes.tooltip = function(records) {
    let tooltipContent = "";
    if (!Array.isArray(records)) records = [records];

    records.forEach((rec, i) => {
        if (!rec) return;
        const paceValue = rec.course === "trail" ? rec.elevation_pace : rec.pace;
        const tooltipPace = `${Math.floor(paceValue / 60)}′${Math.floor(paceValue % 60)
            .toString()
            .padStart(2, "0")}″${rec.course === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'}`;
        const tooltipDistance = rec.course === "trail" ? `${rec.elevation.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} <span class="unit"> m</span>` : `${rec.distance.toFixed(2)} <span class="unit"> km</span>`;
        const tooltip_type = rec.isOfficial ? "공식 기록" : rec.type === "trail" ? "하이킹 / 트레일러닝" : rec.type === "walk" ? "걷기" : "러닝";
        const icon_distance = rec.course === "trail" ? "altitude" : "conversion_path";
        const comment = rec.comment ? `<span class="comment">${rec.comment}</span>` : "";
        const uniqueId = `${rec.date}-${rec.over || 0}`;

        tooltipContent += `
        <div class="tooltip-item ${rec.isOfficial ? "official" : ""}">
            <div class="gpx" id="gpx-${uniqueId}"><svg></svg></div>
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
        
        setTimeout(() => {
            if (rec.geometry) {
                hermes.gpx2svg(rec.geometry, `#gpx-${uniqueId} svg`);
            }
        }, 0);
    });

    const tooltip = document.getElementById("tooltip");

    return {
        show: function() {
            tooltip.innerHTML = tooltipContent;
            tooltip.classList.add("on");
            return this;
        },
        addClass: function(className) {
            tooltip.classList.add(className);
            return this;
        },
        hide: function() {
            tooltip.className = '';
            return this;
        },
        position: function(e) {}
    };
};

/**
 * 툴팁 관련 기능을 초기화합니다. (CSS position: fixed 버전)
 */
hermes.initializeTooltips = function() {
    if (hermes.tooltipsInitialized) return; // 중복 초기화 방지

    const tooltip = document.getElementById("tooltip");
    if (!tooltip) return;

    // 1. 일반 'title' 속성 툴팁 처리
    document.body.addEventListener("mouseover", (e) => {
        const target = e.target.closest("[title]");
        
        if (target && !target.closest(".day-cell, .marker, [data-record-id]")) {
            target.dataset.genericTooltip = target.title;
            target.removeAttribute("title"); 
            
            tooltip.innerHTML = `<div class="tooltip-comment">${target.dataset.genericTooltip}</div>`;
            tooltip.classList.add("on", "generic");
        }
    }, { passive: true });

    document.body.addEventListener("mouseout", (e) => {
        const target = e.target.closest("[data-generic-tooltip]");
        if (!target) return;

        const relatedTarget = e.relatedTarget;
        if (relatedTarget && target.contains(relatedTarget)) return;

        target.title = target.dataset.genericTooltip;
        target.removeAttribute("data-generic-tooltip");
        
        if (tooltip.classList.contains("generic")) {
            tooltip.classList.remove("on", "generic", "fixedTop");
            tooltip.style.top = "";
            tooltip.style.left = "";
        }
    }, { passive: true });

    // 2. 툴팁 마우스 추적 기능 (position: fixed 전용)
    let ticked = false;
    const OFFSET_X = 10; // 마우스 커서 우측 여백
    const OFFSET_Y = 15; // 마우스 커서 하단 여백

    document.addEventListener("mousemove", (e) => {
        if (!tooltip.classList.contains("on")) return;

        if (!ticked) {
            window.requestAnimationFrame(() => {
                // fixed 레이아웃이므로 clientX, clientY 사용
                tooltip.style.left = `${e.clientX + OFFSET_X}px`;
                
                // 화면 상단 경계선 감지 (e.clientY 기준이므로 scrollY 계산이 필요 없음)
                const shouldFixTop = tooltip.offsetHeight > (e.clientY - 48);
                
                if (shouldFixTop) {
                    tooltip.classList.add("fixedTop");
                    tooltip.style.top = ""; 
                } else {
                    tooltip.classList.remove("fixedTop");
                    // 마우스 커서 살짝 아래에 위치하도록 여백(OFFSET_Y) 추가
                    tooltip.style.top = `${e.clientY + OFFSET_Y}px`;
                }
                ticked = false;
            });
            ticked = true;
        }
    });

    hermes.tooltipsInitialized = true;
};

// DOM 로드 체크
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hermes.initializeTooltips);
} else {
    hermes.initializeTooltips();
}