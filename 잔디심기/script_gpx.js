hermes.svgCache = {};

hermes.gpx2svg = async (gpxUrl, svgElementId) => {
    // DOM 업데이트를 기다리기 위한 짧은 지연 추가
    await new Promise(resolve => setTimeout(resolve, 0));

    const svg = document.querySelector(svgElementId);
    if (!svg) return;

    // Check cache first
    if (hermes.svgCache[gpxUrl]) {
        const cachedSvg = hermes.svgCache[gpxUrl];
        svg.setAttribute("viewBox", cachedSvg.viewBox);
        svg.setAttribute("style", cachedSvg.style);
        svg.innerHTML = cachedSvg.innerHTML;
        return;
    }

    // 1. GPX 데이터 가져오기
    const response = await fetch(gpxUrl);
    const gpxText = await response.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, "text/xml");

    // 2. 위도, 경도 좌표 추출
    const pts = Array.from(gpxDoc.querySelectorAll("trkpt")).map((pt) => ({
        lat: parseFloat(pt.getAttribute("lat")),
        lon: parseFloat(pt.getAttribute("lon")),
    }));

    if (pts.length < 2) {
        return; // 경로를 그릴 점이 충분하지 않음
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
    for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];

        const x1 = ((p1.lon - minLon) / (maxLon - minLon)) * width;
        const y1 = height - ((p1.lat - minLat) / (maxLat - minLat)) * height
        const x2 = ((p2.lon - minLon) / (maxLon - minLon)) * width;
        const y2 = height - ((p2.lat - minLat) / (maxLat - minLat)) * height;

        const factor = i / (pts.length - 2);
        const strokeColor = interpolateColor(startColor, endColor, factor);

        pathSegments += `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="2.5" />`;
    }

    // Add start and end circles
    const x_start = ((pts[0].lon - minLon) / (maxLon - minLon)) * width;
    const y_start = height - ((pts[0].lat - minLat) / (maxLat - minLat)) * height;
    const x_end = ((pts[pts.length - 1].lon - minLon) / (maxLon - minLon)) * width;
    const y_end = height - ((pts[pts.length - 1].lat - minLat) / (maxLat - minLat)) * height;

    const startColorHex = interpolateColor(startColor, endColor, 0);
    const endColorHex = interpolateColor(startColor, endColor, 1);

    pathSegments += `<circle cx="${x_start}" cy="${y_start}" r="3.5" stroke="${startColorHex}" stroke-width="2" fill="white" />`;
    pathSegments += `<circle cx="${x_end}" cy="${y_end}" r="3.5" stroke="${endColorHex}" stroke-width="2" fill="white" />`;

    // 5. SVG 요소에 주입 및 캐싱
    const viewBox = `0 0 ${width} ${height}`;
    const style = `width: ${(maxLon - minLon) * 5000}px`;

    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("style", style);
    svg.innerHTML = pathSegments;

    // Cache the result
    hermes.svgCache[gpxUrl] = {
        viewBox,
        style,
        innerHTML: pathSegments,
    };
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
                <div class="title">${rec.title} ${comment} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""}</div>
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