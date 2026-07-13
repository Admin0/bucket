hermes.initializeTooltips = function(map) {
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

    /* ----------------------------------------
     * ↑ same as original code / ↓ customed for earth
     * ---------------------------------------- */

    // create tooltip

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
    
    // activate tooltip

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
};


hermes.settingsTerraium = function(map, currentStyle, useFreeService) {
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
}

hermes.settingsRouteDesign = function(map) {
    const lineWidthSlider = document.getElementById('line-width-slider');
    lineWidthSlider.addEventListener('input', (e) => {
        const newWidth = parseFloat(e.target.value);
        map.setPaintProperty('gpx-line-base', 'line-width', newWidth);
        map.setPaintProperty('gpx-line-base-certi', 'line-width', newWidth);
    });

    const lineOpacitySlider = document.getElementById('line-opacity-slider');
    lineOpacitySlider.addEventListener('input', (e) => {
        const newOpacity = parseFloat(e.target.value);
        map.setPaintProperty('gpx-line-base', 'line-opacity', newOpacity);
        map.setPaintProperty('gpx-line-base-certi', 'line-opacity', newOpacity);
    });
}
