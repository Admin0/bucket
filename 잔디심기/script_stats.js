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
        recentCount: 0,
        streaks: {
            current: 0,
            longest: 0,
            lastDate: null,
        },
        longestTime: { value: 0, records: [] },
        longestDistance: { value: 0, records: [] },
        fastestPace: { value: Infinity, records: [] },
        highestElevation: { value: 0, records: [] },
        fastestElevationPace: { value: Infinity, records: [] },
        paces: [],
        elevationPaces: [],
    });

    const createPBObject = () => ({
        "5k": { value: Infinity, records: [], pace: Infinity },
        "10k": { value: Infinity, records: [], pace: Infinity },
        "half": { value: Infinity, records: [], pace: Infinity },
        "30k": { value: Infinity, records: [], pace: Infinity },
        "full": { value: Infinity, records: [], pace: Infinity }
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
            "5k": { distance: 0, time: 0, count: 0, paces: [] },
            "10k": { distance: 0, time: 0, count: 0, paces: [] },
            "half": { distance: 0, time: 0, count: 0, paces: [] },
            "30k": { distance: 0, time: 0, count: 0, paces: [] },
            "full": { distance: 0, time: 0, count: 0, paces: [] }
        },
        annual: {}
    };

    const updateMax = (statObject, value, record) => {
        statObject.records.push({ value, record });
        statObject.records.sort((a, b) => b.value - a.value);
        if (statObject.records.length > 3) {
            statObject.records.length = 3;
        }
        if (statObject.records.length > 0) {
            statObject.value = statObject.records[0].value;
        } else {
            statObject.value = 0;
        }
    };

    const updateMin = (statObject, value, record) => {
        if (!isFinite(value)) return;
        statObject.records.push({ value, record });
        statObject.records.sort((a, b) => a.value - b.value);
        if (statObject.records.length > 3) {
            statObject.records.length = 3;
        }
        if (statObject.records.length > 0) {
            statObject.value = statObject.records[0].value;
        } else {
            statObject.value = Infinity;
        }
    };

    const updateMinPB = (statObject, value, pace, record) => {
        if (!isFinite(value)) return;
        statObject.records.push({ value, record, pace });
        statObject.records.sort((a, b) => a.value - b.value);
        if (statObject.records.length > 3) {
            statObject.records.length = 3;
        }
        if (statObject.records.length > 0) {
            statObject.value = statObject.records[0].value;
            statObject.pace = statObject.records[0].pace;
        } else {
            statObject.value = Infinity;
            statObject.pace = Infinity;
        }
    };

    const updateCategoryStats = (category, record, pace, elevationPace) => {
        if (!category) return;
        category.count++;
        updateMax(category.longestTime, record.time, record);
        updateMax(category.longestDistance, record.distance, record);
        updateMin(category.fastestPace, pace, record);
        updateMax(category.highestElevation, record.elevation, record);
        if (isFinite(elevationPace)) {
            updateMin(category.fastestElevationPace, elevationPace, record);
            category.elevationPaces.push(elevationPace);
        }
        if (isFinite(pace)) {
            category.paces.push(pace);
        }
    };

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

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
                const pbDistances = {
                    "5k": 5,
                    "10k": 10,
                    "half": 21.0975,
                    "30k": 30,
                    "full": 42.195
                };

                for (const key in pbDistances) {
                    const targetDistance = pbDistances[key];
                    if (distance >= targetDistance) {
                        // Estimate time for the target distance based on the run's average pace.
                        const estimatedTime = (time / distance) * targetDistance;
                        // The pace is the same for the estimation and the whole run.
                        updateMinPB(pbCategory[key], estimatedTime, pace, record);
                    }
                }
            };

            updatePBs(stats.run_pb_overall);
            if (record.isOfficial) {
                updatePBs(stats.run_pb_official);
            }

            const updateDistStats = (dist_cat, record) => {
                const stats_obj = stats.run_dist_stats[dist_cat];
                stats_obj.distance += record.distance;
                stats_obj.time += record.time;
                stats_obj.count++;
                const pace = (record.time / 60) / record.distance;
                if (isFinite(pace)) {
                    stats_obj.paces.push(pace);
                }
            };
            if (record.distance >= 5) updateDistStats("5k", record);
            if (record.distance >= 10) updateDistStats("10k", record);
            if (record.distance >= 21.0975) updateDistStats("half", record);
            if (record.distance >= 30) updateDistStats("30k", record);
            if (record.distance >= 42.195) updateDistStats("full", record);
        }

        const year = new Date(record.date).getFullYear();
        if (!stats.annual[year]) {
            stats.annual[year] = { distance: 0, count: 0 };
        }
        stats.annual[year].distance += record.distance;
        stats.annual[year].count++;

        if (new Date(record.date) >= oneYearAgo) {
            stats.overall.recentCount++;
            if (stats[type]) {
                stats[type].recentCount++;
            }
        }
    });
    
    const calculateMedianPace = (paces) => {
        if (paces.length === 0) return Infinity;
        const sortedPaces = [...paces].sort((a, b) => a - b);
        const mid = Math.floor(sortedPaces.length / 2);
        return sortedPaces.length % 2 !== 0 ? sortedPaces[mid] : (sortedPaces[mid - 1] + sortedPaces[mid]) / 2;
    };

    stats.run.medianPace = calculateMedianPace(stats.run.paces);
    stats.trail.medianPace = calculateMedianPace(stats.trail.paces);
    stats.walk.medianPace = calculateMedianPace(stats.walk.paces);
    
    stats.run.medianElevationPace = calculateMedianPace(stats.run.elevationPaces);
    stats.trail.medianElevationPace = calculateMedianPace(stats.trail.elevationPaces);
    stats.walk.medianElevationPace = calculateMedianPace(stats.walk.elevationPaces);


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
            const dataAttributes = (primaryStat?.records && primaryStat.records.length > 0) ? `data-type="${primaryCategory}" data-tooltip="${statType.key}"` : "";

            const values = categories
                .map((category) => {
                    if (primaryCategory === "run" && category === "run_official") return ""; 
                    if (!stats[category] || stats[category].count === 0) return "";
                    const stat = stats[category]?.[statType.key];
                    if (!stat || !isFinite(stat.value) || stat.value === 0) return "";
                    const icon = category.includes("_official") ? "emoji_events" : statType.icon;
                    return `<span class="material-symbols-outlined icon">${icon}</span> <span>${statType.format(stat.value)}</span>`;
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
            } else if (primaryCategory === "run" || primaryCategory === "trail" || primaryCategory === "walk") {
                const mapping = {
                    run: {
                        officialCat: "run_official",
                        totalTime: stats.overall.totalRunningTime,
                        totalDistance: stats.overall.totalRunningDistance,
                        averagePace: stats.overall.averageRunningPace,
                        totalElevation: stats.overall.totalRunningElevation,
                        averageElevationPace: stats.overall.averageRunningElevationPace,
                        medianPace: stats.run.medianPace,
                        medianElevationPace: stats.run.medianElevationPace,
                        count: stats.run.count
                    },
                    trail: {
                        officialCat: "trail_official",
                        totalTime: stats.overall.totalTrailTime,
                        totalDistance: stats.overall.totalTrailDistance,
                        averagePace: stats.overall.averageTrailPace,
                        totalElevation: stats.overall.totalTrailElevation,
                        averageElevationPace: stats.overall.averageTrailElevationPace,
                        medianPace: stats.trail.medianPace,
                        medianElevationPace: stats.trail.medianElevationPace,
                        count: stats.trail.count
                    },
                    walk: {
                        totalTime: stats.overall.totalWalkTime,
                        totalDistance: stats.overall.totalWalkDistance,
                        averagePace: stats.overall.averageWalkPace,
                        totalElevation: stats.overall.totalWalkElevation,
                        averageElevationPace: stats.overall.averageWalkElevationPace,
                        medianPace: stats.walk.medianPace,
                        medianElevationPace: stats.walk.medianElevationPace,
                        count: stats.walk.count
                    }
                }[primaryCategory];

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];

                if (mapping.officialCat) {
                    const officialStat = stats[mapping.officialCat]?.[statType.key];

                    if (officialStat && isFinite(officialStat.value) && officialStat.value !== 0) {
                        const hasRecord = officialStat.records && officialStat.records.length > 0;
                        const tooltipData = hasRecord ? `data-type="${mapping.officialCat}" data-tooltip="${statType.key}"` : "";
                        subItems.push(`<div style="${subStatStyle}" ${tooltipData}><span class="label">공식 기록</span><span>${statType.format(officialStat.value)}</span></div>`);
                    }
                }

                const formatDurationHours = (s) => `${(s / 3600).toFixed(0)} <span class="unit">시간</span>`;
                const formatDistanceInt = (d) => d>1000?`${d.toFixed(0)} <span class="unit">km</span>`:`${d.toFixed(2)} <span class="unit">km</span>`;
                const formatElevationInt = (e) => e>1000?`${Math.round(e/1000).toLocaleString()} <span class="unit">km</span>`:`${Math.round(e).toLocaleString()} <span class="unit">m</span>`;

                if (statType.key === "longestTime") {
                    if (mapping.totalTime > 0) {subItems.push(`
                        <div style="${subStatStyle}"><span class="label">전체 시간</span><span>${formatDurationHours(mapping.totalTime)}</span></div>
                        <div style="${subStatStyle}"><span class="label">평균 시간</span><span>${formatDuration(mapping.totalTime / mapping.count)}</span></div>
                        `);}
                } else if (statType.key === "longestDistance") {
                    if (mapping.totalDistance > 0) subItems.push(`
                        <div style="${subStatStyle}"><span class="label">전체 거리</span><span>${formatDistanceInt(mapping.totalDistance)}</span></div>
                        <div style="${subStatStyle}"><span class="label">평균 거리</span><span>${formatDistanceInt(mapping.totalDistance / mapping.count)}</span></div>
                    `);
                } else if (statType.key === "fastestPace") {
                    if (isFinite(mapping.averagePace)) subItems.push(`
                        <div style="${subStatStyle}"><span class="label">중앙 페이스</span><span>${formatPace(mapping.medianPace)} <span class="unit">/km</span></span></div>
                        <div style="${subStatStyle}"><span class="label">평균 페이스</span><span>${formatPace(mapping.averagePace)} <span class="unit">/km</span></span></div>
                        `);
                } else if (statType.key === "highestElevation") {
                    if (mapping.totalElevation > 0) subItems.push(`
                        <div style="${subStatStyle}"><span class="label">전체 상승 고도</span><span>${formatElevationInt(mapping.totalElevation)}</span></div>
                        <div style="${subStatStyle}"><span class="label">평균 상승 고도</span><span>${formatElevationInt(mapping.totalElevation/mapping.count)}</span></div>
                        `);
                } else if (statType.key === "fastestElevationPace") {
                    if (isFinite(mapping.averageElevationPace)) subItems.push(`
                        <div style="${subStatStyle}"><span class="label">중앙 상승 페이스</span><span>${formatPace(mapping.medianElevationPace)} <span class="unit">/60 m↑</span></span></div>
                        <div style="${subStatStyle}"><span class="label">평균 상승 페이스</span><span>${formatPace(mapping.averageElevationPace)} <span class="unit">/60 m↑</span></span></div>
                        `);
                }

                if (subItems.length > 0) {
                    subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
                }
            }

            return `<div class="stat-item" ${dataAttributes}><span class="label">${statType.label}</span><div class="value">${values}</div>${subStatHTML}</div>`;
        };

        let gridContent = statTypes.map(generateStatItemHTML).join("");
        const primaryCategory = categories[0];
        
        const numYears = Object.keys(stats.annual).length;
        const annualAverage = numYears > 0 ? (stats.overall.count / numYears).toFixed(0) : 0;

        if (primaryCategory === "overall") {
            const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
            const subItems = [
                `<div style="${subStatStyle}"><span class="label">연간 평균</span><span>${annualAverage}</span></div>`,
                `<div style="${subStatStyle}"><span class="label">러닝</span><span>${stats.overall.runCount}</span></div>`,
                `<div style="${subStatStyle}"><span class="label">트레일</span><span>${stats.overall.trailCount}</span></div>`
            ];
            const subStatHTML = `<div class="sub-stats">${subItems.join("")}</div>`;
            gridContent += `<div class="stat-item" data-type="overall"><span class="label">활동</span><div class="value"><span class="material-symbols-outlined icon">tag</span> <span>${stats.overall.count}</span></div>${subStatHTML}</div>`;
        } else if (primaryCategory === "run" || primaryCategory === "trail" || primaryCategory === "walk") {
            const totalCount = stats[primaryCategory]?.count || 0;
            if (totalCount > 0) {
                const icon = { run: "directions_run", trail: "hiking", walk: "directions_walk" }[primaryCategory] || "tag";
                const valueHTML = `<span class="material-symbols-outlined icon">${icon}</span> <span>${totalCount}</span>`;

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];

                if (categories.length > 1) { // has official category
                    const officialCount = stats[categories[1]]?.count || 0;
                    if (officialCount > 0) {
                        subItems.push(`<div style="${subStatStyle}" data-type="official"><span class="label">공식 기록</span><span>${officialCount}</span></div>`);
                    }
                }
                
                const recentCount = stats[primaryCategory]?.recentCount || 0;
                const categoryAnnualAverage = numYears > 0 ? (totalCount / numYears).toFixed(0) : 0;
                
                subItems.push(`
                    <div style="${subStatStyle}"><span class="label">최근 1년</span><span>${recentCount}</span></div>
                    <div style="${subStatStyle}"><span class="label">연간 평균</span><span>${categoryAnnualAverage}</span></div>
                    `);
                
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

        const pbDistances = {
            "5k": 5,
            "10k": 10,
            "half": 21.0975,
            "30k": 30,
            "full": 42.195
        };

        const gridContent = pbTypes
            .map((pbType) => {
                const overallStat = overallPBs[pbType.key];

                const formatPB = (stat) => `${formatDuration(stat.value)} <span class="unit">(${formatPace(stat.pace)})</span>`;
                
                const valueHTML = 
                    `<span class="material-symbols-outlined icon" ${pbType.key == "full" ? `style="font-variation-settings: 'FILL' 1"` : ""}>${pbType.icon}</span> 
                    <span>${formatPB(overallStat)}</span>`;

                const subStatStyle = "display: flex; justify-content: space-between; align-items: center;";
                const subItems = [];
                const officialStat = officialPBs[pbType.key];
                if (isFinite(officialStat.value)) {
                    subItems.push(`<div style="${subStatStyle}" data-type="${officialPBsKey}" data-tooltip="${pbType.key}"><span class="label">공식 기록</span><span>${formatPB(officialStat)}</span></div>`);
                }else{
                    subItems.push(`<div style="${subStatStyle}"><span class="label">공식 기록</span><span>—</span></div>`);
                }

                const distStats = stats.run_dist_stats[pbType.key];
                if (distStats ) {
                    const formatDurationHours = (s) => `${Math.floor(s / 3600).toLocaleString()} <span class="unit">시간</span>`;
                    const formatDistanceInt = (d) => `${Math.floor(d).toLocaleString()} <span class="unit">km</span>`;
                    const avgPace = distStats.paces.length > 0 ? distStats.paces.reduce((a, b) => a + b, 0) / distStats.paces.length : Infinity;
                    const targetDistance = pbDistances[pbType.key];
                    const averageEstimatedTime = isFinite(avgPace) ? (avgPace * 60) * targetDistance : Infinity;
                    subItems.push(`<div style="${subStatStyle}"><span class="label">평균 시간</span><span>${formatDuration(averageEstimatedTime)} <span class="unit">(${formatPace(avgPace)})</span></span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 시간</span><span>${formatDurationHours(distStats.time)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">전체 거리</span><span>${formatDistanceInt(distStats.distance)}</span></div>`);
                    subItems.push(`<div style="${subStatStyle}"><span class="label">활동</span><span>${distStats.count}</span></div>`);              }
                
                const subStatHTML = subItems.length > 0 ? `<div class="sub-stats">${subItems.join("")}</div>` : "";

                const dataAttributes = isFinite(overallStat.value) ? `data-type="${overallPBsKey}" data-tooltip="${pbType.key}"` : "";
                return `<div class="stat-item" ${dataAttributes}><span class="label">${pbType.label}</span><div class="value">${valueHTML}</div>${subStatHTML}</div>`;
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

    let lastRecordsKey = null;
    let tooltipHideTimeout;
    statsGrid.querySelectorAll("[data-tooltip]").forEach((item) => {
        item.addEventListener("mouseover", (e) => {
            clearTimeout(tooltipHideTimeout);
            e.stopPropagation();
            const currentTarget = e.currentTarget;
            const type = currentTarget.dataset.type;
            const tooltipKey = currentTarget.dataset.tooltip;
            const newRecordsKey = `${type}-${tooltipKey}`;

            if (lastRecordsKey === newRecordsKey) {
                const tooltipEl = document.getElementById("tooltip");
                if (tooltipEl) tooltipEl.classList.add("on");
                return;
            }
            lastRecordsKey = newRecordsKey;
            
            const recordHolder = stats[type]?.[tooltipKey];
            if (recordHolder && recordHolder.records && recordHolder.records.length > 0) {
                const records = recordHolder.records.map(r => r.record);
                hermes.tooltip(records).show().addClass("stats");
            }
        });
        item.addEventListener("mouseout", (e) => {
            e.stopPropagation();
            tooltipHideTimeout = setTimeout(() => {
                const tooltipEl = document.getElementById("tooltip");
                if (tooltipEl) tooltipEl.classList.remove("on", "stats");
                lastRecordsKey = null;
            }, 50);
        });
    });

    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.addEventListener("mouseover", () => {
            clearTimeout(tooltipHideTimeout);
        });
        tooltip.addEventListener("mouseout", () => {
            tooltipHideTimeout = setTimeout(() => {
                const tooltipEl = document.getElementById("tooltip");
                if (tooltipEl) tooltipEl.classList.remove("on");
                lastRecordsKey = null;
            }, 50);
        });
    }
};
