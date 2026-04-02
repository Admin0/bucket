// 전체 통계 계산 및 표시
hermes.stats = () => {
    // top-level totals
    let totalDistance = 0,
        totalRunningDistance = 0,
        totalTrailDistance = 0,
        totalWalkDistance = 0;
    let totalElevation = 0,
        totalRunningElevation = 0,
        totalTrailElevation = 0,
        totalWalkElevation = 0;
    let totalTime = 0,
        totalRunningTime = 0,
        totalTrailTime = 0,
        totalWalkTime = 0;

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
        "half": { value: Infinity, record: null, pace: Infinity },
        "30k": { value: Infinity, record: null, pace: Infinity },
        "full": { value: Infinity, record: null, pace: Infinity }
    });

    const stats = {
        overall: {
            ...createStatObject(),
            totalTime: 0,
            totalRunningTime: 0,
            totalTrailTime: 0,
            totalWalkTime: 0,
            totalDistance: 0,
            totalRunningDistance: 0,
            totalTrailDistance: 0,
            totalWalkDistance: 0,
            averagePace: Infinity,
            averageRunningPace: Infinity,
            averageTrailPace: Infinity,
            averageWalkPace: Infinity,
            totalElevation: 0,
            totalRunningElevation: 0,
            totalTrailElevation: 0,
            totalWalkElevation: 0,
            averageElevationPace: Infinity,
            averageRunningElevationPace: Infinity,
            averageTrailElevationPace: Infinity,
            averageWalkElevationPace: Infinity,
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
        run_dist_stats: {
            "5k": { distance: 0, time: 0, count: 0 },
            "10k": { distance: 0, time: 0, count: 0 },
            "half": { distance: 0, time: 0, count: 0 },
            "30k": { distance: 0, time: 0, count: 0 },
            "full": { distance: 0, time: 0, count: 0 }
        },
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
        } else if (type === "walk") {
            totalWalkTime += time;
            totalWalkDistance += distance;
            totalWalkElevation += elevation;
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
                if (record.distance >= 30) updateMinPB(pbCategory["30k"], (time / distance) * 30, pace, record);
                if (record.distance >= 42.195) updateMinPB(pbCategory.full, (time / distance) * 42.195, pace, record);
            };

            updatePBs(stats.run_pb_overall);
            if (record.isOfficial) {
                updatePBs(stats.run_pb_official);
            }

            const updateDistStats = (dist_cat, record) => {
                stats.run_dist_stats[dist_cat].distance += record.distance;
                stats.run_dist_stats[dist_cat].time += record.time;
                stats.run_dist_stats[dist_cat].count++;
            };
            if (record.distance >= 5) updateDistStats("5k", record);
            if (record.distance >= 10) updateDistStats("10k", record);
            if (record.distance >= 21.0975) updateDistStats("half", record);
            if (record.distance >= 30) updateDistStats("30k", record);
            if (record.distance >= 42.195) updateDistStats("full", record);
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
    const totalWalkDurationInMinutes = totalWalkTime / 60;
    stats.overall.totalTime = totalTime;
    stats.overall.totalRunningTime = totalRunningTime;
    stats.overall.totalTrailTime = totalTrailTime;
    stats.overall.totalWalkTime = totalWalkTime;
    stats.overall.totalDistance = totalDistance;
    stats.overall.totalRunningDistance = totalRunningDistance;
    stats.overall.totalTrailDistance = totalTrailDistance;
    stats.overall.totalWalkDistance = totalWalkDistance;
    stats.overall.averagePace = totalDistance > 0 ? totalDurationInMinutes / totalDistance : Infinity;
    stats.overall.averageRunningPace = totalRunningDistance > 0 ? totalRunningDurationInMinutes / totalRunningDistance : Infinity;
    stats.overall.averageTrailPace = totalTrailDistance > 0 ? totalTrailDurationInMinutes / totalTrailDistance : Infinity;
    stats.overall.averageWalkPace = totalWalkDistance > 0 ? totalWalkDurationInMinutes / totalWalkDistance : Infinity;
    stats.overall.totalElevation = totalElevation;
    stats.overall.totalRunningElevation = totalRunningElevation;
    stats.overall.totalTrailElevation = totalTrailElevation;
    stats.overall.totalWalkElevation = totalWalkElevation;
    const elevPace = (duration, elev) => (elev > 60 ? duration / ((elev * 2) / 60) : Infinity);
    stats.overall.averageElevationPace = elevPace(totalDurationInMinutes, totalElevation);
    stats.overall.averageRunningElevationPace = elevPace(totalRunningDurationInMinutes, totalRunningElevation);
    stats.overall.averageTrailElevationPace = elevPace(totalTrailDurationInMinutes, totalTrailElevation);
    stats.overall.averageWalkElevationPace = elevPace(totalWalkDurationInMinutes, totalWalkElevation);
    stats.overall.runCount = stats.run.count;
    stats.overall.trailCount = stats.trail.count;
    stats.overall.walkCount = stats.walk.count;

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
                    if (primaryCategory === "run" && category === "run_official") return ""; 
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
                    subItems.push(`<div style="${subStatStyle}"><span class="label">트레일 <span class="hide_f">상승 페이스</span></span><span>${formatPace(stats.overall.averageTrailPace)} <span class="unit">/60 m↑</span></span></div>`);
                }
                if (subItems.length > 0) subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
            } else if (primaryCategory === "run" || primaryCategory === "trail" || primaryCategory === "walk") {
                const mapping = {
                    run: {
                        officialCat: "run_official",
                        totalTime: stats.overall.totalRunningTime,
                        totalDistance: stats.overall.totalRunningDistance,
                        averagePace: stats.overall.averageRunningPace,
                        totalElevation: stats.overall.totalRunningElevation,
                        averageElevationPace: stats.overall.averageRunningElevationPace
                    },
                    trail: {
                        officialCat: "trail_official",
                        totalTime: stats.overall.totalTrailTime,
                        totalDistance: stats.overall.totalTrailDistance,
                        averagePace: stats.overall.averageTrailPace,
                        totalElevation: stats.overall.totalTrailElevation,
                        averageElevationPace: stats.overall.averageTrailElevationPace
                    },
                    walk: {
                        totalTime: stats.overall.totalWalkTime,
                        totalDistance: stats.overall.totalWalkDistance,
                        averagePace: stats.overall.averageWalkPace,
                        totalElevation: stats.overall.totalWalkElevation,
                        averageElevationPace: stats.overall.averageWalkElevationPace
                    }
                }[primaryCategory];

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];

                if (mapping.officialCat) {
                    const officialStat = stats[mapping.officialCat]?.[statType.key];

                    if (officialStat && isFinite(officialStat.value) && officialStat.value !== 0) {
                        const record = officialStat.record;
                        const tooltipData = record ? `data-type="${mapping.officialCat}" data-tooltip="${statType.key}"` : "";
                        subItems.push(`<div style="${subStatStyle}" ${tooltipData}><span class="label">공식 기록</span><span>${statType.format(officialStat.value)}</span></div>`);
                    }
                }

                const formatDurationHours = (s) => `${Math.floor(s / 3600).toLocaleString()} <span class="unit">시간</span>`;
                const formatDistanceInt = (d) => `${Math.floor(d).toLocaleString()} <span class="unit">km</span>`;
                const formatElevationInt = (e) => `${Math.floor(e / 1000).toLocaleString()} <span class="unit">km</span>`;

                if (statType.key === "longestTime") {
                    if (mapping.totalTime > 0) subItems.push(`<div style="${subStatStyle}"><span class="label">전체 합계</span><span>${formatDurationHours(mapping.totalTime)}</span></div>`);
                } else if (statType.key === "longestDistance") {
                    if (mapping.totalDistance > 0) subItems.push(`<div style="${subStatStyle}"><span class="label">전체 합계</span><span>${formatDistanceInt(mapping.totalDistance)}</span></div>`);
                } else if (statType.key === "fastestPace") {
                    if (isFinite(mapping.averagePace)) subItems.push(`<div style="${subStatStyle}"><span class="label">평균 페이스</span><span>${formatPace(mapping.averagePace)} <span class="unit">/km</span></span></div>`);
                } else if (statType.key === "highestElevation") {
                    if (mapping.totalElevation > 0) subItems.push(`<div style="${subStatStyle}"><span class="label">전체 합계</span><span>${formatElevationInt(mapping.totalElevation)}</span></div>`);
                } else if (statType.key === "fastestElevationPace") {
                    if (isFinite(mapping.averageElevationPace)) subItems.push(`<div style="${subStatStyle}"><span class="label">평균 페이스</span><span>${formatPace(mapping.averageElevationPace)} <span class="unit">/60 m↑</span></span></div>`);
                }

                if (subItems.length > 0) {
                    subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
                }
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
        } else if (primaryCategory === "run" || primaryCategory === "trail" || primaryCategory === "walk") {
            const totalCount = stats[primaryCategory]?.count || 0;
            if (totalCount > 0) {
                const icon = { run: "directions_run", trail: "hiking", walk: "directions_walk" }[primaryCategory] || "tag";
                const valueHTML = `<div style="justify-content: end;"><span class="material-symbols-outlined icon">${icon}</span> <span>${totalCount}</span></div>`;

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];

                if (categories.length > 1) { // has official category
                    const officialCount = stats[categories[1]]?.count || 0;
                    if (officialCount > 0) {
                        subItems.push(`<div style="${subStatStyle}" data-type="official"><span class="label">공식 기록</span><span>${officialCount}</span></div>`);
                    }
                }
                subItems.push(`<div style="${subStatStyle}"><span class="label">—</span><span></span></div>`);
                
                const subStatHTML = subItems.length > 0 ? `<div class="sub-stats">${subItems.join("")}</div>` : "";
                gridContent += `<div class="stat-item" data-type="${primaryCategory}"><span class="label">활동</span><div class="value">${valueHTML}</div>${subStatHTML}</div>`;
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
            { key: "30k", label: "30 km 최단 시간", icon: "30fps" },
            { key: "full", label: "마라톤 최단 시간", icon: "circle" }
        ];

        const gridContent = pbTypes
            .map((pbType) => {
                const overallStat = overallPBs[pbType.key];

                const formatPB = (stat) => `${formatDuration(stat.value)} <span class="unit">(${formatPace(stat.pace)})</span>`;
                
                const valueHTML = `<div>
                    <span class="material-symbols-outlined icon" ${pbType.key == "full" ? `style="font-variation-settings: 'FILL' 1"` : ""}>${pbType.icon}</span> 
                    <span>${formatPB(overallStat)}</span></div>`;

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];
                const officialStat = officialPBs[pbType.key];
                if (isFinite(officialStat.value)) {
                    subItems.push(`<div style="${subStatStyle}" data-type="${officialPBsKey}" data-tooltip="${pbType.key}"><span class="label">공식 기록</span><span>${formatPB(officialStat)}</span></div>`);
                }else{
                    subItems.push(`<div style="${subStatStyle}" data-type="${officialPBsKey}" data-tooltip="${pbType.key}"><span class="label">공식 기록</span><span>—</span></div>`);
                }

                const distStats = stats.run_dist_stats[pbType.key];
                if (distStats ) {
                    const formatDurationHours = (s) => `${Math.floor(s / 3600).toLocaleString()} <span class="unit">시간</span>`;
                    const formatDistanceInt = (d) => `${Math.floor(d).toLocaleString()} <span class="unit">km</span>`;
                    const avgPace = distStats.time > 0 && distStats.distance > 0 ? distStats.time / 60 / distStats.distance : Infinity;
                    
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 시간</span><span>${formatDurationHours(distStats.time)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 거리</span><span>${formatDistanceInt(distStats.distance)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">평균 페이스</span><span>${formatPace(avgPace)} <span class="unit">/km</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">활동 수</span><span>${distStats.count}</span></div>`);
                }
                
                const subStatHTML = subItems.length > 0 ? `<div class="sub-stats">${subItems.join("")}</div>` : "";

                return `<div class="stat-item" data-type="${overallPBsKey}" data-tooltip="${pbType.key}"><span class="label">${pbType.label}</span><div class="value">${valueHTML}</div>${subStatHTML}</div>`;
            })
            .join("");

        if (!gridContent.trim()) return "";
        return `<div class="stats-section"><div class="stat-grid">${gridContent}</div></div>`;
    };

    const renderAnnualStats = (annualStats) => {
        let annualHtml = "";
        const sortedYears = Object.keys(annualStats).sort((a, b) => b - a);
        for (const year of sortedYears) {
            annualHtml += `<div class="stat-item"><span class="label">${year}년</span><span class="value">${annualStats[year].distance.toFixed(1)} <span class="unit">km</span></span></div>`;
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
