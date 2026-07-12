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
