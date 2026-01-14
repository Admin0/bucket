hermes.svgCache = {};

hermes.gpx2svg = async (gpxUrl, svgElementId) => {
    // DOM 업데이트를 기다리기 위한 짧은 지연 추가
    await new Promise(resolve => setTimeout(resolve, 0));

    const svg = document.querySelector(svgElementId);
    if (!svg) return;

    // 1. Show loading indicator
    svg.innerHTML = `<image href="imgs/icon_loading.svg" width="20" height="20" x="250" y="65"/>`;
    svgNotFound = '<image href="imgs/icon_notfound.svg" width="20" height="20" x="250" y="65"/>';

    // Check cache first
    const cachedData = hermes.svgCache[gpxUrl];
    if (cachedData) {
        if (cachedData === 'not-found') {
            svg.innerHTML = svgNotFound;
        } else {
            svg.setAttribute("viewBox", cachedData.viewBox);
            svg.setAttribute("style", cachedData.style);
            svg.innerHTML = cachedData.innerHTML;
        }
        return;
    }

    try {
        // 2. GPX 데이터 가져오기
        const response = await fetch(gpxUrl);
        if (!response.ok) {
            throw new Error('GPX file not found');
        }
        const gpxText = await response.text();
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, "text/xml");

        // 2. 위도, 경도, 고도 좌표 추출
        const pts = Array.from(gpxDoc.querySelectorAll("trkpt")).map((pt) => ({
            lat: parseFloat(pt.getAttribute("lat")),
            lon: parseFloat(pt.getAttribute("lon")),
            ele: parseFloat(pt.querySelector("ele")?.textContent || 0)
        }));

        if (pts.length < 2) {
            svg.innerHTML = ''; // No points to draw
            return;
        }

        // 전체 상승 고도 계산
        let totalElevationGain = 0;
        for (let i = 1; i < pts.length; i++) {
            const eleDiff = pts[i].ele - pts[i - 1].ele;
            if (eleDiff > 0) {
                totalElevationGain += eleDiff;
            }
        }

        // 3. 화면 좌표 변환을 위한 경계값(Bounding Box) 계산
        const lats = pts.map((p) => p.lat);
        const lons = pts.map((p) => p.lon);
        const tolerance = 0.0025;
        const minLat = Math.min(...lats) - tolerance,
            maxLat = Math.max(...lats) + tolerance;
        const minLon = Math.min(...lons) - tolerance,
            maxLon = Math.max(...lons) + tolerance;

        // 4. SVG 경로(path) 데이터 생성
        const width = (maxLon - minLon) * 5000;
        const height = (maxLat - minLat) * 5000;

        const startColor = { r: 0, g: 255, b: 127 }; // #00ff7f
        const endColor = { r: 0, g: 92, b: 69 };     // #005c45

        function interpolateColor(color1, color2, factor) {
            const result = {
                r: Math.round(color1.r + factor * (color2.r - color1.r)),
                g: Math.round(color1.g + factor * (color2.g - color1.g)),
                b: Math.round(color1.b + factor * (color2.b - color1.b)),
            };
            const r = result.r.toString(16).padStart(2, '0');
            const g = result.g.toString(16).padStart(2, '0');
            const b = result.b.toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }

        let pathSegments = "";
        const numPathElements = 64;
        const totalSegments = pts.length - 1;

        if (totalSegments > 0) {
            const segmentsPerPath = Math.ceil(totalSegments / numPathElements);

            for (let i = 0; i < numPathElements; i++) {
                const startSegment = i * segmentsPerPath;
                if (startSegment >= totalSegments) break;

                const endSegment = Math.min((i + 1) * segmentsPerPath, totalSegments);

                const firstPoint = pts[startSegment];
                const x_start_segment = ((firstPoint.lon - minLon) / (maxLon - minLon)) * width;
                const y_start_segment = height - ((firstPoint.lat - minLat) / (maxLat - minLat)) * height;

                let pathData = `M ${x_start_segment} ${y_start_segment}`;

                for (let j = startSegment; j < endSegment; j++) {
                    const nextPoint = pts[j + 1];
                    const x_next = ((nextPoint.lon - minLon) / (maxLon - minLon)) * width;
                    const y_next = height - ((nextPoint.lat - minLat) / (maxLat - minLat)) * height;
                    pathData += ` L ${x_next} ${y_next}`;
                }

                const factor = startSegment / totalSegments;
                const strokeColor = interpolateColor(startColor, endColor, factor);

                pathSegments += `<path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="2.5" />`;
            }
        }

        let svgInnerHtml = pathSegments;

        if (totalElevationGain >= 250) {
            const highestPoint = pts.reduce((max, p) => (p.ele > max.ele) ? p : max, pts[0]);
            if (highestPoint) {
                const peakX = ((highestPoint.lon - minLon) / (maxLon - minLon)) * width;
                const peakY = height - ((highestPoint.lat - minLat) / (maxLat - minLat)) * height;
                const triangleSize = 4;
                const peakMarkerHtml = `<path d="M ${peakX} ${peakY - (triangleSize * 1.5)} L ${peakX - triangleSize} ${peakY + (triangleSize*0.5)} L ${peakX + triangleSize} ${peakY + (triangleSize*0.5)} Z" fill="gold" stroke="#00b264" stroke-width="2"/>`;
                svgInnerHtml += peakMarkerHtml;
            }
        }

        const x_start = ((pts[0].lon - minLon) / (maxLon - minLon)) * width;
        const y_start = height - ((pts[0].lat - minLat) / (maxLat - minLat)) * height;
        const x_end = ((pts[pts.length - 1].lon - minLon) / (maxLon - minLon)) * width;
        const y_end = height - ((pts[pts.length - 1].lat - minLat) / (maxLat - minLat)) * height;

        const startColorHex = interpolateColor(startColor, endColor, 0);
        const endColorHex = interpolateColor(startColor, endColor, 1);

        svgInnerHtml += `<circle cx="${x_start}" cy="${y_start}" r="3.5" stroke="${startColorHex}" stroke-width="2" fill="white" />`;
        svgInnerHtml += `<circle cx="${x_end}" cy="${y_end}" r="3.5" stroke="${endColorHex}" stroke-width="2" fill="white" />`;

        const viewBox = `0 0 ${width} ${height}`;
        const style = `width: ${(maxLon - minLon) * 5000}px`;

        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("style", style);
        svg.innerHTML = svgInnerHtml;

        hermes.svgCache[gpxUrl] = {
            viewBox,
            style,
            innerHTML: svgInnerHtml,
        };

    } catch (error) {
        // 3. Show error indicator if fetch fails and cache the state
        hermes.svgCache[gpxUrl] = 'not-found';
        svg.innerHTML = svgNotFound;
    }
};



// 호출 예시
// renderGpxToSvg('records/2025-12-15__5k__신정호.gpx', 'pa');

hermes.tooltip = (records) => {
    let tooltipContent = "";
    records.forEach((rec) => {
        const tooltipPace = `${Math.floor((rec.course === "trail" ? rec.elevation_pace : rec.pace) / 60)}'${Math.floor((rec.course === "trail" ? rec.elevation_pace : rec.pace) % 60)}"${rec.course === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'
            }`;
        const tooltipDistance = rec.course === "trail" ? `${rec.elevation} <span class="unit"> m</span>` : `${rec.distance.toFixed(2)} <span class="unit"> km</span>`;
        const tooltip_type = rec.isOfficial ? "공식 대회" : rec.course === "trail" ? "하이킹 / 트레일러닝" : "러닝";
        const tooltip__icon_distance = rec.course === "trail" ? "altitude" : "conversion_path";
        const comment = rec.comment ? `<span class="comment">${rec.comment}</span>` : "";

        const gpxFileName = rec.date + (rec.over !== undefined ? "_" + rec.over : "");
        // console.log(gpxFileName);

        tooltipContent += `
        <div class="tooltip-item ${rec.isOfficial ? "official" : ""}">
            <div class="gpx d-${gpxFileName}">
                <svg></svg>
            </div>
            <div class="title-container">
                <span class="type"> ${tooltip_type} </span>
                <span class="date">${rec.date}</span>
                <div class="title">${rec.title} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""} ${comment} </div>
            </div>
            <div class="data">
                <span class="material-symbols-outlined icon distance"> ${tooltip__icon_distance} </span> <span class="distance">${tooltipDistance}</span> |
                <span class="material-symbols-outlined icon record"> timer </span> <span class="rec">${rec.record}</span> |
                <span class="material-symbols-outlined icon pace"> speed </span> <span class="pace">${tooltipPace}</span>
            </div>
        </div>`;

        // hermes.gpx2svg(`records/${new Date(rec.date).getFullYear()}/${rec.date}.gpx`, `#pa`);
        hermes.gpx2svg(`records/${new Date(rec.date).getFullYear()}/${gpxFileName}.gpx`, `#tooltip .gpx.d-${gpxFileName} svg`);
    });

    return tooltipContent;
};