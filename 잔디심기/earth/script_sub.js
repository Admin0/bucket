import { createTooltip } from '../script_tooltip.js';

let tooltipsInitialized = false; // Local state for this module
let searchedFeatureIds = new Set();

export const initializeTooltips = function (map) {
    if (tooltipsInitialized) return; // 중복 초기화 방지
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
            tooltip.classList.remove("on", "generic", "fixedTop", "searched");
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

    /* ----------------------------------------
     * ↑ same as original code / ↓ customed for earth
     * ---------------------------------------- */

    // create tooltip
    // activate tooltip

    const tooltipEl = document.getElementById("tooltip");
    let hoveredFeatureId = null;
    const highlightLayers = ["gpx-highlight-border", "gpx-highlight-main", "gpx-highlight-points-border", "gpx-highlight-points"];
    const layersToQuery = ["gpx-line-base", "gpx-line-base-certi"];
    const normalColors = { start: "#00ff80", end: "#005c45" };
    const certiColors = { start: "#ffd700", end: "#f57f17" };

    function getHoverGradient(feature) {
        const colors = window.routeColors?.[feature.properties.certified ? "certified" : "normal"] || (feature.properties.certified ? certiColors : normalColors);
        const isSearched = searchedFeatureIds.has(feature.properties.id);
        return ["interpolate", ["linear"], ["line-progress"], 0, isSearched ? colors.searchStart || colors.start : colors.start, 1, isSearched ? colors.searchEnd || colors.end : colors.end];
    }

    function getPointStrokeColor(feature) {
        const colors = window.routeColors?.[feature.properties.certified ? "certified" : "normal"] || (feature.properties.certified ? certiColors : normalColors);
        const isSearched = searchedFeatureIds.has(feature.properties.id);
        const startColor = isSearched ? colors.searchStart || colors.start : colors.start;
        const endColor = isSearched ? colors.searchEnd || colors.end : colors.end;
        return ["case", ["==", ["get", "point_type"], "start"], startColor, endColor];
    }

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
        tooltipEl.classList.remove("searched");
        map.getCanvas().style.cursor = "";
    }

    function dismissTooltip() {
        tooltipEl.removeAttribute('class');
        tooltipEl.style.top = "";
        tooltipEl.style.left = "";
    }

    ["#route-search", "#gpx-list-container"].forEach((selector) => {
        document.querySelector(selector)?.addEventListener("mouseenter", dismissTooltip);
    });

    function showFeatureTooltip(feature, e) {
        const newHoveredId = feature.properties.id;
        if (hoveredFeatureId !== newHoveredId) {
            hoveredFeatureId = newHoveredId;
            const filter = ["==", ["get", "id"], hoveredFeatureId];
            highlightLayers.forEach((layerId) => map.setFilter(layerId, filter));
            map.setPaintProperty("gpx-highlight-main", "line-gradient", getHoverGradient(feature));
            map.setPaintProperty("gpx-highlight-points", "circle-stroke-color", getPointStrokeColor(feature));
        }

        map.getCanvas().style.cursor = "pointer";
        tooltipEl.removeAttribute('class');
        tooltipEl.classList.add("on");

        // createTooltip에 전달하기 전에 distance를 숫자로 변환합니다.
        const tooltipProps = { ...feature.properties };
        if (typeof tooltipProps.distance === 'string') {
            tooltipProps.distance = parseFloat(tooltipProps.distance);
        }
        createTooltip(tooltipProps, { showGpx: false }).show();
        if (window.matchMedia("only screen and (min-width: 1920px)").matches) {
            tooltipEl.style.left = `${e.point.x + 15}px`;
            tooltipEl.style.top = `${e.point.y - 40}px`;
        }
    }

    map.on("route-search-enter", (e) => {
        showFeatureTooltip(e.feature, { point: e.point });
        tooltipEl.classList.add("searched");
    });

    map.on("route-search-leave", clearHighlightAndTooltip);

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
    tooltipsInitialized = true;

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


export const settingsTerraium = function (map, currentStyle, useFreeService) {
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

export const settingsRouteDesign = function (map) {
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

export const settingsRouteSearch = function (map, getFeatures, setSearchResults) {
    const search = document.getElementById("route-search");
    const input = document.getElementById("route-search-input");
    if (!search || !input) return;

    function setSearchRouteColors(ids = []) {
        const routeColors = window.routeColors || {};
        const normal = routeColors.normal || { base: "#00b264", searchEnd: "#f44a01" };
        const certified = routeColors.certified || { base: "#FAAB0C", searchEnd: "#f44a01" };
        const matchingIds = ["literal", ids];
        const normalColor = ids.length > 0 ? ["case", ["in", ["get", "id"], matchingIds], "#f44a01", normal.base] : normal.base;
        const certifiedColor = ids.length > 0 ? ["case", ["in", ["get", "id"], matchingIds], "#f44a01", certified.base] : certified.base;
        const searchSortKey = ids.length > 0 ? ["case", ["in", ["get", "id"], matchingIds], 1, 0] : 0;

        if (map.getLayer("gpx-line-base")) {
            map.setPaintProperty("gpx-line-base", "line-color", normalColor);
            map.setPaintProperty('gpx-line-base', 'line-opacity', ["interpolate", ["linear"], ["zoom"], 7, 0.75, 10, 0.5]);
            map.setLayoutProperty("gpx-line-base", "line-sort-key", searchSortKey);
        }
        if (map.getLayer("gpx-line-base-certi")) {
            map.setPaintProperty("gpx-line-base-certi", "line-color", certifiedColor);
            map.setPaintProperty('gpx-line-base-certi', 'line-opacity', ["interpolate", ["linear"], ["zoom"], 7, 0.75, 10, 0.5]);
            map.setLayoutProperty("gpx-line-base-certi", "line-sort-key", searchSortKey);
        }
    }

    const updateSearch = () => {
        const query = input.value.trim().toLocaleLowerCase();
        const tokens = query
            .replace(/([&,])/g, " $1 ")
            .replace(/\b(AND|OR|NOT)\b/gi, " $1 ")
            .split(/\s+/)
            .filter(Boolean);
        const includedGroups = [[]];
        const excludedTerms = [];
        let negateNext = false;

        tokens.forEach(token => {
            const operator = token.toUpperCase();
            if (operator === "OR" || token === ",") {
                if (includedGroups.at(-1).length > 0) includedGroups.push([]);
                negateNext = false;
                return;
            }
            if (operator === "AND" || token === "&") return;
            if (operator === "NOT") {
                negateNext = true;
                return;
            }

            if (token.startsWith("-")) {
                const term = token.slice(1);
                if (term) excludedTerms.push(term);
            } else if (negateNext) {
                excludedTerms.push(token);
            } else {
                includedGroups.at(-1).push(token);
            }
            negateNext = false;
        });
        const validIncludedGroups = includedGroups.filter(group => group.length > 0);
        const matchingIds = query
            ? getFeatures()
                .filter(feature => {
                    const searchText = feature.properties.searchText || "";
                    const isExcluded = excludedTerms.some(term => searchText.includes(term));
                    const isIncluded = validIncludedGroups.length === 0 || validIncludedGroups.some(group => group.every(term => searchText.includes(term)));
                    return !isExcluded && isIncluded;
                })
                .map(feature => feature.properties.id)
            : [];
        searchedFeatureIds = new Set(matchingIds);
        const matchingFeatures = query ? getFeatures().filter(feature => matchingIds.includes(feature.properties.id)) : [];

        setSearchRouteColors(matchingIds);
        setSearchResults?.(matchingFeatures);
        search.classList.toggle("on", matchingIds.length > 0);
        document.getElementById("gpx-list-view-toggle").classList.toggle("on", matchingIds.length > 0);;
    };

    input.addEventListener("input", updateSearch);
    updateSearch();
    return updateSearch;
};
