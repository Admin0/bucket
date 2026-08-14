// 툴팁 생성 및 관리 모듈

/**
 * 활동 기록 배열을 받아 GPX 경로를 포함한 상세 툴팁 HTML을 생성합니다.
 * @param {Array|Object} records - 툴팁에 표시할 기록 데이터.
 * @param {Object} options - 툴팁 생성 옵션.
 * @param {boolean} [options.showGpx=true] - GPX 경로 SVG를 표시할지 여부.
 * @returns {Object} - 툴팁을 제어하는 show, addClass, hide, position 메서드를 포함한 객체.
 */
export function createTooltip(records, options = {}) {
    const { showGpx = true } = options;
    let tooltipContent = "";
    if (!Array.isArray(records)) records = [records];

    records.forEach((rec) => {
        if (!rec) return;
        const paceValue = (pace) => {
            if (pace === Infinity || !pace) return "N/A";
            return `${Math.floor(pace / 60)}′${Math.floor(pace % 60).toString().padStart(2, "0")}″`;
        };
        const tooltipPace = `${rec.type === "trail" ?
                `<span class="main">${paceValue(rec.elevation_pace)}</span><span class="replace">${paceValue(rec.pace)}</span>` :
                `<span class="replace">${paceValue(rec.elevation_pace)}</span><span class="main">${paceValue(rec.pace)}</span>`}
            ${rec.type === "trail" ? '<span class="unit main">/60 m↑</span><span class="unit replace">/km</span>' : '<span class="unit replace">/60 m↑</span><span class="unit main">/km</span>'}`;
        const tooltipDistance = rec.type === "trail" ?
            `<span class="main">${rec.elevation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span class="unit"> m</span></span><span class="replace">${rec.distance.toFixed(2)} <span class="unit"> km</span></span>` :
            `<span class="replace">${rec.elevation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span class="unit"> m</span></span><span class="main">${rec.distance.toFixed(2)} <span class="unit"> km</span></span>`;
        const tooltip_type = rec.isOfficial ? "공식 기록" : rec.type === "ride" ? "라이딩" : rec.type === "trail" ? "하이킹 / 트레일러닝" : rec.type === "walk" ? "걷기" : "러닝";
        const icon_distance = rec.type === "trail" ?
            `<span class="main">altitude</span><span class="replace">conversion_path</span>` :
            `<span class="replace">altitude</span><span class="main">conversion_path</span>`;
        const comment = rec.comment ? `<span class="comment">${rec.comment}</span>` : "";
        const uniqueId = `${rec.date}-${rec.over || 0}`;

        tooltipContent += `
        <div class="tooltip-item ${rec.isOfficial ? "official" : ""}">
            ${showGpx ? `<div class="gpx" id="gpx-${uniqueId}"><svg></svg></div>` : ''}
            <div class="title-container">
                <span class="type">${tooltip_type}</span>
                <span class="date">${rec.date}</span>
                <div class="title">${rec.title} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""} ${comment}</div>
            </div>
            <div class="data">
                <span class="material-symbols-outlined icon distance">${icon_distance}</span> <span class="distance">${tooltipDistance}</span>
                <span class="div"></span>
                <span class="material-symbols-outlined icon record">timer</span> <span class="rec">${rec.record}</span> 
                <span class="div"></span>
                <span class="material-symbols-outlined icon pace">speed</span> <span class="pace">${tooltipPace}</span>
            </div>
        </div>`;

        if (showGpx) {
            setTimeout(() => {
                if (rec.geometry && window.hermes && typeof window.hermes.gpx2svg === 'function') {
                    window.hermes.gpx2svg(rec.geometry, `#gpx-${uniqueId} svg`);
                }
            }, 0);
        }
    });

    const tooltip = document.getElementById("tooltip");

    return {
        show: function () {
            tooltip.innerHTML = tooltipContent;
            tooltip.classList.add("on");
            return this;
        },
        addClass: function (className) {
            tooltip.classList.add(className);
            return this;
        },
        hide: function () {
            tooltip.className = '';
            return this;
        },
        position: function (e) {}
    };
}

let tooltipsInitialized = false;

/**
 * 툴팁 관련 기능을 초기화합니다. (CSS position: fixed 버전)
 */
export function initializeTooltips() {
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
                tooltip.style.left = `${e.clientX + OFFSET_X}px`;
                const shouldFixTop = tooltip.offsetHeight > (e.clientY - 16 * 3);
                tooltip.classList.toggle("fixedTop", shouldFixTop);
                tooltip.style.top = shouldFixTop ? "" : `${e.clientY + OFFSET_Y}px`;
                ticked = false;
            });
            ticked = true;
        }
    });

    tooltipsInitialized = true;
}