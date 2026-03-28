// 전체 통계 계산 및 표시
hermes.stats = () => {
    // top-level totals
    let totalDistance = 0,
        totalRunningDistance = 0,
        totalTrailDistance = 0;
    let totalElevation = 0,
        totalRunningElevation = 0,
        totalTrailElevation = 0;
    let totalTime = 0,
        totalRunningTime = 0,
        totalTrailTime = 0;

    const createStatObject = () => ({
        count: 0,
        longestTime: { value: 0, record: null },
        longestDistance: { value: 0, record: null },
        fastestPace: { value: Infinity, record: null },
        highestElevation: { value: 0, record: null },
        fastestElevationPace: { value: Infinity, record: null }
    });

    const createPBObject = () => ({
        "5k": { value: Infinity, record: null, pace: Infinity },
        "10k": { value: Infinity, record: null, pace: Infinity },
        half: { value: Infinity, record: null, pace: Infinity },
        full: { value: Infinity, record: null, pace: Infinity }
    });

    const stats = {
        overall: {
            ...createStatObject(),
            totalTime: 0,
            totalRunningTime: 0,
            totalTrailTime: 0,
            totalDistance: 0,
            totalRunningDistance: 0,
            totalTrailDistance: 0,
            averagePace: Infinity,
            averageRunningPace: Infinity,
            averageTrailPace: Infinity,
            totalElevation: 0,
            totalRunningElevation: 0,
            totalTrailElevation: 0,
            averageElevationPace: Infinity,
            averageRunningElevationPace: Infinity,
            averageTrailElevationPace: Infinity,
            runCount: 0,
            trailCount: 0,
            walkCount: 0
        },
        run: createStatObject(),
        run_overall: createStatObject(), // For non-official runs
        run_official: createStatObject(), // For official runs
        trail: createStatObject(),
        trail_overall: createStatObject(),
        trail_official: createStatObject(),
        walk: createStatObject(),
        run_pb_overall: createPBObject(), // PBs from all runs
        run_pb_official: createPBObject(), // PBs from official runs
        annual: {}
    };

    const updateMax = (statObject, value, record) => {
        if (value > statObject.value) {
            statObject.value = value;
            statObject.record = record;
        }
    };

    const updateMin = (statObject, value, record) => {
        if (value < statObject.value) {
            statObject.value = value;
            statObject.record = record;
        }
    };

    const updateMinPB = (statObject, value, pace, record) => {
        if (value < statObject.value) {
            statObject.value = value;
            statObject.record = record;
            statObject.pace = pace;
        }
    };

    const updateCategoryStats = (category, record, pace, elevationPace) => {
        if (!category) return;
        category.count++;
        updateMax(category.longestTime, record.time, record);
        updateMax(category.longestDistance, record.distance, record);
        updateMin(category.fastestPace, pace, record);
        updateMax(category.highestElevation, record.elevation, record);
        updateMin(category.fastestElevationPace, elevationPace, record);
    };

    hermes.records.forEach((record) => {
        const time = record.time || 0;
        const distance = record.distance || 0;
        const elevation = record.elevation || 0;
        const type = record.type || "run";

        totalTime += time;
        totalDistance += distance;
        totalElevation += elevation;

        if (type === "run") {
            totalRunningTime += time;
            totalRunningDistance += distance;
            totalRunningElevation += elevation;
        } else if (type === "trail") {
            totalTrailTime += time;
            totalTrailDistance += distance;
            totalTrailElevation += elevation;
        }

        if (!record.time || !record.distance) return;
        const durationInMinutes = record.time / 60;
        const pace = durationInMinutes / record.distance;
        const elevationPace = record.elevation > 60 ? durationInMinutes / ((record.elevation * 2) / 60) : Infinity;

        updateCategoryStats(stats.overall, record, pace, elevationPace);
        updateCategoryStats(stats[type], record, pace, elevationPace);

        if (record.isOfficial) {
            updateCategoryStats(stats[`${type}_official`], record, pace, elevationPace);
        }

        if (type === "run") {
            const updatePBs = (pbCategory) => {
                if (record.distance >= 5) updateMinPB(pbCategory["5k"], (time / distance) * 5, pace, record);
                if (record.distance >= 10) updateMinPB(pbCategory["10k"], (time / distance) * 10, pace, record);
                if (record.distance >= 21.0975) updateMinPB(pbCategory.half, (time / distance) * 21.0975, pace, record);
                if (record.distance >= 42.195) updateMinPB(pbCategory.full, (time / distance) * 42.195, pace, record);
            };

            updatePBs(stats.run_pb_overall);
            if (record.isOfficial) {
                updatePBs(stats.run_pb_official);
            }
        }

        const year = new Date(record.date).getFullYear();
        if (!stats.annual[year]) {
            stats.annual[year] = { distance: 0 };
        }
        stats.annual[year].distance += record.distance;
    });

    const totalDurationInMinutes = totalTime / 60;
    const totalRunningDurationInMinutes = totalRunningTime / 60;
    const totalTrailDurationInMinutes = totalTrailTime / 60;
    stats.overall.totalTime = totalTime;
    stats.overall.totalRunningTime = totalRunningTime;
    stats.overall.totalTrailTime = totalTrailTime;
    stats.overall.totalDistance = totalDistance;
    stats.overall.totalRunningDistance = totalRunningDistance;
    stats.overall.totalTrailDistance = totalTrailDistance;
    stats.overall.averagePace = totalDistance > 0 ? totalDurationInMinutes / totalDistance : Infinity;
    stats.overall.averageRunningPace = totalRunningDistance > 0 ? totalRunningDurationInMinutes / totalRunningDistance : Infinity;
    stats.overall.averageTrailPace = totalTrailDistance > 0 ? totalTrailDurationInMinutes / totalTrailDistance : Infinity;
    stats.overall.totalElevation = totalElevation;
    stats.overall.totalRunningElevation = totalRunningElevation;
    stats.overall.totalTrailElevation = totalTrailElevation;
    const elevPace = (duration, elev) => (elev > 60 ? duration / ((elev * 2) / 60) : Infinity);
    stats.overall.averageElevationPace = elevPace(totalDurationInMinutes, totalElevation);
    stats.overall.averageRunningElevationPace = elevPace(totalRunningDurationInMinutes, totalRunningElevation);
    stats.overall.averageTrailElevationPace = elevPace(totalTrailDurationInMinutes, totalTrailElevation);
    stats.overall.runCount = stats.run.count;
    stats.overall.trailCount = stats.trail.count;
    stats.overall.walkCount = stats.walk.count;

    // const statsHeader = document.getElementById("stats-header");
    // statsHeader.innerHTML = `
    //         <div class="stat-item">
    //             <span class="label">러닝 거리</span>
    //             <span class="value" title="야외 러닝으로 이동한 거리입니다."><span class="material-symbols-outlined icon"> sprint </span> ${totalRunningDistance.toLocaleString("en-US", {
    //                 maximumFractionDigits: 1
    //             })} <span class="unit"> km</span></span>
    //         </div>
    //         <div class="stat-item">
    //             <span class="label">거리</span>
    //             <span class="value" title="모든 야외 활동 중 이동한 거리입니다."><span class="material-symbols-outlined icon"> conversion_path </span> ${totalDistance.toLocaleString("en-US", {
    //                 maximumFractionDigits: 1
    //             })} <span class="unit"> km</span></span>
    //         </div>
    //         <div class="stat-item">
    //             <span class="label">트레일 상승고도</span>
    //             <span class="value" title="트레일 러닝 혹은 등산으로 상승한 높이입니다."><span class="material-symbols-outlined icon"> hiking </span> ${
    //                 totalTrailElevation > 1000
    //                     ? (totalTrailElevation / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> km</span>`
    //                     : totalTrailElevation.toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> m</span>`
    //             } </span>
    //         </div>
    //         <div class="stat-item">
    //             <span class="label">상승고도</span>
    //             <span class="value" title="모든 야외 활동 중 상승한 높이입니다."><span class="material-symbols-outlined icon"> altitude </span> ${
    //                 totalElevation > 1000
    //                     ? (totalElevation / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> km</span>`
    //                     : totalElevation.toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> m</span>`
    //             } </span>
    //         </div>
    //         <div class="stat-item">
    //             <span class="label">활동</span>
    //             <span class="value" title="야외 활동을 했던 횟수입니다."><span class="material-symbols-outlined icon"> accessibility_new </span> ${hermes.records.length}</span>
    //         </div>
    //     `;

    const formatDuration = (seconds) => {
        if (!isFinite(seconds) || seconds == 0) return "-";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.round(seconds % 60);
        return `${h > 0 ? h + '<span class="unit">시간</span>' : ""} ${m}<span class="unit">분</span> ${s}<span class="unit">초</span>`;
    };

    const formatPace = (pace) => {
        if (!isFinite(pace)) return "-";
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}′${seconds.toString().padStart(2, "0")}″`;
    };

    const renderStatsSection = (title, ...categories) => {
        const statTypes = [
            { key: "longestTime", label: "최장 시간", format: formatDuration, icon: "timer" },
            { key: "longestDistance", label: "최장 거리", format: (d) => (d ? `${d.toFixed(2)} <span class="unit">km</span>` : "-"), icon: "distance" },
            { key: "fastestPace", label: "최고 페이스", format: (p) => (isFinite(p) ? `${formatPace(p)} <span class="unit">/km</span>` : "-"), icon: "speed" },
            { key: "highestElevation", label: "최고 상승 고도", format: (e) => (e ? `${e.toLocaleString()} <span class="unit">m</span>` : "-"), icon: "altitude" },
            { key: "fastestElevationPace", label: "최고 상승 페이스", format: (p) => (isFinite(p) ? `${formatPace(p)} <span class="unit">/60 m↑</span>` : "-"), icon: "speed" }
        ];

        const generateStatItemHTML = (statType) => {
            const primaryCategory = categories[0];
            const primaryStat = stats[primaryCategory]?.[statType.key];
            const dataAttributes = primaryStat?.record ? `data-type="${primaryCategory}" data-tooltip="${statType.key}"` : "";

            const values = categories
                .map((category) => {
                    if (!stats[category] || stats[category].count === 0) return "";
                    const stat = stats[category]?.[statType.key];
                    if (!stat || !isFinite(stat.value) || stat.value === 0) return "";
                    const isPrimary = category === primaryCategory;
                    const innerDataAttributes = !isPrimary && stat.record ? `data-type="${category}" data-tooltip="${statType.key}"` : "";
                    const icon = category.includes("_official") ? "emoji_events" : statType.icon;
                    return `<div ${innerDataAttributes}><span class="material-symbols-outlined icon">${icon}</span> <span>${statType.format(stat.value)}</span></div>`;
                })
                .join("");

            if (!values.trim()) return "";

            let subStatHTML = "";
            if (primaryCategory === "overall") {
                const formatDurationHours = (s) => `${Math.floor(s / 3600).toLocaleString()} <span class="unit">시간</span>`;
                const formatDistanceInt = (d) => `${Math.floor(d).toLocaleString()} <span class="unit">km</span>`;
                const formatElevationInt = (e) => `${Math.floor(e / 1000).toLocaleString()} <span class="unit">km</span>`;
                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];
                if (statType.key === "longestTime") {
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 <span class="hide_f">시간</span></span><span>${formatDurationHours(stats.overall.totalTime)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">러닝 <span class="hide_f">시간</span></span><span>${formatDurationHours(stats.overall.totalRunningTime)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">시간</span></span><span>${formatDurationHours(stats.overall.totalTrailTime)}</span></div>`);
                } else if (statType.key === "longestDistance") {
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 <span class="hide_f">거리</span></span><span>${formatDistanceInt(stats.overall.totalDistance)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">러닝 <span class="hide_f">거리</span></span><span>${formatDistanceInt(stats.overall.totalRunningDistance)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">거리</span></span><span>${formatDistanceInt(stats.overall.totalTrailDistance)}</span></div>`);
                } else if (statType.key === "fastestPace") {
                    subItems.push(`<div style="${subStatStyle}"><span class="label">평균 <span class="hide_f">페이스</span></span></span><span>${formatPace(stats.overall.averagePace)} <span class="unit">/km</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">러닝 <span class="hide_f">페이스</span></span><span>${formatPace(stats.overall.averageRunningPace)} <span class="unit">/km</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">페이스</span></span><span>${formatPace(stats.overall.averageTrailPace)} <span class="unit">/km</span></span></div>`);
                } else if (statType.key === "highestElevation") {
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 <span class="hide_f">상승 고도</span></span><span>${formatElevationInt(stats.overall.totalElevation)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">러닝 <span class="hide_f">상승 고도</span></span><span>${formatElevationInt(stats.overall.totalRunningElevation)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">상승 고도</span></span><span>${formatElevationInt(stats.overall.totalTrailElevation)}</span></div>`);
                } else if (statType.key === "fastestElevationPace") {
                    subItems.push(`<div style="${subStatStyle}"><span class="label">평균 <span class="hide_f">상승 페이스</span></span><span>${formatPace(stats.overall.averageElevationPace)} <span class="unit">/60 m↑</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">러닝 <span class="hide_f">상승 페이스</span></span><span>${formatPace(stats.overall.averageRunningElevationPace)} <span class="unit">/60 m↑</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">상승 페이스</span></span><span>${formatPace(stats.overall.averageTrailElevationPace)} <span class="unit">/60 m↑</span></span></div>`);
                }
                if (subItems.length > 0) subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
            }
            return `<div class="stat-item" ${dataAttributes}><span class="label">${statType.label}</span><div class="value">${values}</div>${subStatHTML}</div>`;
        };

        let gridContent = statTypes.map(generateStatItemHTML).join("");
        const primaryCategory = categories[0];

        if (primaryCategory === "overall") {
            const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
            const subItems = [
                `<div style="${subStatStyle}"><span class="label">—</span><span></span></div>`,
                `<div style="${subStatStyle}"><span class="label">러닝</span><span>${stats.overall.runCount}</span></div>`,
                `<div style="${subStatStyle}"><span class="label">트레일</span><span>${stats.overall.trailCount}</span></div>`
            ];
            const subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
            gridContent += `<div class="stat-item" data-type="overall"><span class="label">활동</span><div class="value"><div style="justify-content: end;"><span class="material-symbols-outlined icon">tag</span> <span>${stats.overall.count}</span></div></div>${subStatHTML}</div>`;
        } else if (primaryCategory === "run" || primaryCategory === "trail") {
            const overallCat = primaryCategory,
                officialCat = categories[1];
            const overallCount = stats[overallCat]?.count || 0;
            const officialCount = stats[officialCat]?.count || 0;
                if (overallCount + officialCount > 0) {
                const icon = primaryCategory === "run" ? "directions_run" : "hiking";
                const regularHTML = overallCount > 0 ? `<div><span class="material-symbols-outlined icon">${icon}</span> <span>${overallCount}</span></div>` : "";
                
                const officialHTML = officialCount > 0 ? `<div data-type="official"><span class="material-symbols-outlined icon">emoji_events</span> <span>${officialCount}</span></div>` : "";
                gridContent += `<div class="stat-item" data-type="${primaryCategory}"><span class="label">활동</span><div class="value">${regularHTML}${officialHTML}</div></div>`;
            }
        } else if (stats[primaryCategory]?.count > 0) {
            gridContent += `<div class="stat-item" data-type="${primaryCategory}"><span class="label">활동</span><div class="value"><div style="justify-content: end;"><span class="material-symbols-outlined icon">tag</span> <span>${stats[primaryCategory].count}</span></div></div></div>`;
        }

        return `<div class="stats-section"><h3>${title}</h3><div class="stat-grid">${gridContent}</div></div>`;
    };

    const renderRunningPBs = (overallPBsKey, officialPBsKey) => {
        if (stats.run.count === 0) return "";
        const overallPBs = stats[overallPBsKey];
        const officialPBs = stats[officialPBsKey];
        const pbTypes = [
            { key: "5k", label: "5 km 최단 시간", icon: "timer_5_shutter" },
            { key: "10k", label: "10 km 최단 시간", icon: "timer_10" },
            { key: "half", label: "하프 마라톤 최단 시간", icon: "contrast" },
            { key: "full", label: "마라톤 최단 시간", icon: "circle" }
        ];

        const gridContent = pbTypes
            .map((pbType) => {
                const overallStat = overallPBs[pbType.key];
                const officialStat = officialPBs[pbType.key];

                const formatPB = (stat) => `${formatDuration(stat.value)} <span class="unit">(${formatPace(stat.pace)})</span>`;

                let overallHTML = "";
                let officialHTML = "";
                overallHTML = `<div>
                    <span class="material-symbols-outlined icon" ${pbType.key == "full" ? `style="font-variation-settings: 'FILL' 1"` : ""}>${pbType.icon}</span> 
                    <span>${formatPB(overallStat)}</span></div>`;
                officialHTML = `<div data-type="${officialPBsKey}" data-tooltip="${pbType.key}"><span class="material-symbols-outlined icon">emoji_events</span> <span>${formatPB(officialStat)}</span></div>`;

                const finalHTML = overallHTML + officialHTML;
                if (!finalHTML.trim()) return "";

                return `<div class="stat-item" data-type="${overallPBsKey}" data-tooltip="${pbType.key}"><span class="label">${pbType.label}</span><div class="value">${finalHTML}</div></div>`;
            })
            .join("");

        if (!gridContent.trim()) return "";
        return `<div class="stats-section"><div class="stat-grid">${gridContent}</div></div>`;
    };

    const renderAnnualStats = (annualStats) => {
        let annualHtml = "";
        const sortedYears = Object.keys(annualStats).sort((a, b) => b - a);
        for (const year of sortedYears) {
            annualHtml += `<div class="stat-item"><span class="label">${year}년 거리</span><span class="value">${annualStats[year].distance.toFixed(1)} <span class="unit">km</span></span></div>`;
        }
        if (annualHtml === "") return "";
        return `<div class="stats-section"><h3>연간 기록</h3><div class="stat-grid">${annualHtml}</div></div>`;
    };

    const statsGrid = document.getElementById("stats-grid") || document.createElement("div");
    if (!document.getElementById("stats-container")) {
        statsGrid.id = "stats-container";
        document.querySelector(".container").appendChild(statsGrid);
    }

    statsGrid.innerHTML = `
        ${renderStatsSection("전체 통계", "overall")}
        ${renderStatsSection("러닝", "run", "run_official")}
        ${renderRunningPBs("run_pb_overall", "run_pb_official")}
        ${renderStatsSection("트레일", "trail", "trail_official")}
        ${renderStatsSection("걷기", "walk")}
        ${renderAnnualStats(stats.annual)}
    `;

    statsGrid.querySelectorAll("[data-tooltip]").forEach((item) => {
        item.addEventListener("mouseenter", (e) => {
            e.stopPropagation();
            const currentTarget = e.currentTarget;
            const type = currentTarget.dataset.type;
            const tooltip = currentTarget.dataset.tooltip;
            const recordHolder = stats[type]?.[tooltip];
            if (recordHolder && recordHolder.record) {
                hermes.tooltip(recordHolder.record).show();
            }
        });
        item.addEventListener("mouseleave", (e) => {
            e.stopPropagation();
            document.getElementById("tooltip").classList.remove("on");
        });
    });
};
