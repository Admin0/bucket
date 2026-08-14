// GPX-SVG 변환 및 툴팁 관련 기능을 담당하는 스크립트

// 전역 캐시 객체 초기화
window.hermes.svgCache = {}; // 렌더링된 SVG 경로 캐시

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
export const gpx2svg = async (geometry, svgElementId) => {
    await new Promise((resolve) => setTimeout(resolve, 0)); // DOM 업데이트 대기

    const svg = document.querySelector(svgElementId);
    if (!svg) return;

    const svgLoading = '<image href="imgs/icon_loading.svg" class="svg-info" />';
    const svgNotFound = '<image href="imgs/icon_notfound.svg" class="svg-info" />';

    svg.innerHTML = svgLoading;

    // 1. 렌더링된 SVG 캐시 확인 (geometry를 키로 사용)
    const cacheKey = geometry;
    const cachedSvg = window.hermes.svgCache[cacheKey];
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
            window.hermes.svgCache[cacheKey] = "not-found"; // 캐시에 'not-found' 저장
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

        window.hermes.svgCache[cacheKey] = { viewBox, style, innerHTML: svgInnerHtml };

    } catch (error) {
        console.error("Error rendering SVG:", error);
        window.hermes.svgCache[cacheKey] = "not-found";
        svg.innerHTML = svgNotFound;
    }
};