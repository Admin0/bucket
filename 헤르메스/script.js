const hermes = {};

hermes.records = [
    // 2024 Data

    // original data official
    { date: "2025-11-09", course: 10, record: "01:00:07", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-10-19", course: 10, record: "00:48:29", title: "꽈자런 천안" },
    { date: "2025-10-12", course: 10, record: "00:51:32", title: "빵빵런 대전" },
    { date: "2025-09-28", course: 10, record: "00:54:16", title: "공주백제마라톤" },
    { date: "2025-04-20", course: 10, record: "01:02:24", title: "아산이순신마라톤" },

    { date: "2024-11-10", course: 10, record: "00:58:43", title: "아산은행나무길 전국마라톤대회" },

    // original unofficial data
    { date: "2025-12-06", course: 21, distance: 21.26, record: "01:57:05", title: "장항선구철도길" },
    { date: "2025-12-06", course: "trail", distance: 3.56, elevation: 173, record: "01:03:23", title: "봉서산" },
    { date: "2025-12-03", course: 5, distance: 5.36, record: "00:30:54", title: "신정호" },

    { date: "2025-11-30", course: "trail", distance: 10.0, elevation: 742, record: "02:27:32", title: "백암산" },
    { date: "2025-11-16", course: "trail", distance: 7.36, elevation: 330, record: "01:58:36", title: "재약산" },
    { date: "2025-11-15", course: "trail", distance: 11.15, elevation: 1055, record: "03:58:36", title: "신불산" },
    { date: "2025-11-14", course: "trail", distance: 5.8, elevation: 672, record: "01:57:07", title: "금오산" },
    { date: "2025-11-01", course: "trail", distance: 7.5, elevation: 821, record: "03:20:00", title: "삼악산" },

    { date: "2025-10-07", course: 5, distance: 5.03, record: "00:24:44", title: "신정호" },
    { date: "2025-09-23", course: 5, distance: 5.78, record: "00:29:52", title: "장항선구철도길" },
    { date: "2025-07-12", course: 5, distance: 5.01, record: "00:26:26", title: "신정호" },
    { date: "2025-09-09", course: 10, distance: 10.1, record: "00:55:08", title: "천안종합운동장" },
    { date: "2025-09-05", course: 10, distance: 13.44, record: "01:16:02", title: "장항선구철도길" },
];

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
}

hermes.initiate = function () {
    const allRecords = hermes.records.map((record) => {
        const parts = record.record.split(":").map(Number);
        let time;
        if (parts.length === 3) {
            time = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            time = parts[0] * 60 + parts[1];
        }

        const distance = record.distance || (typeof record.course === "number" ? record.course : 0);
        return {
            ...record,
            isOfficial: !record.distance,
            time,
            distance,
            pace: distance > 0 ? time / distance : Infinity, // seconds per km
            course: record.course,
            dateObj: new Date(record.date),
        };
    });

    const runRecords = allRecords.filter(r => r.course !== 'trail');
    const trailRecords = allRecords.filter(r => r.course === 'trail');
    
    const runPaces = runRecords.map((r) => r.pace).filter((p) => p !== Infinity);
    const minPace = Math.min(...runPaces);
    const maxPace = Math.max(...runPaces);

    const trailElevations = trailRecords.map(r => r.elevation).filter(e => e !== undefined);
    const minElevation = Math.min(...trailElevations);
    const maxElevation = Math.max(...trailElevations);

    const startColor = [0, 255, 127]; // SpringGreen
    const endColor = [64, 58, 50]; // #8a3a32 (marker background)

    const startYear = Math.min(...allRecords.map((r) => r.dateObj.getFullYear()));
    const endYear = Math.max(...allRecords.map((r) => r.dateObj.getFullYear()));

    const courseCategories = {
        "track-full": { courseMin: 42, courseMax: Infinity, type: "run" },
        "track-half": { courseMin: 21, courseMax: 41.99, type: "run" },
        "track-10k": { courseMin: 10, courseMax: 20.99, type: "run" },
        "track-5k": { courseMin: 0, courseMax: 9.99, type: "run" },
        "track-trail": { type: "trail" },
    };

    for (const trackId in courseCategories) {
        const category = courseCategories[trackId];
        const element = document.getElementById(trackId);
        if (!element) continue;

        element.innerHTML = "";

        let categoryRecords;
        if (category.type === "run") {
            categoryRecords = runRecords.filter((r) => typeof r.course === "number" && r.course >= category.courseMin && r.course <= category.courseMax);
        } else {
            categoryRecords = trailRecords;
        }

        const bestRecordContainer = element.previousElementSibling;
        bestRecordContainer.innerHTML = "";

        const officialRecords = categoryRecords.filter((r) => r.isOfficial);
        const unofficialRecords = categoryRecords.filter((r) => !r.isOfficial);

        let bestOfficial = officialRecords.length > 0 ? officialRecords.reduce((best, current) => (current.time < best.time ? current : best)) : null;
        let bestUnofficial = unofficialRecords.length > 0 ? unofficialRecords.reduce((best, current) => (current.time < best.time ? current : best)) : null;

        if (bestOfficial) {
            const p = document.createElement("p");
            p.className = "best-record official";
            p.innerHTML = `<strong>${bestOfficial.record}</strong> (${Math.floor(bestOfficial.pace / 60)}'${Math.floor(bestOfficial.pace % 60)}''/km)`;
            bestRecordContainer.appendChild(p);
        }
        if (bestUnofficial) {
            if (category.type == "run") {
                if (!bestOfficial || bestUnofficial.time < bestOfficial.time) {
                    const p = document.createElement("p");
                    p.className = "best-record unofficial";
                    p.innerHTML = `<strong>${bestUnofficial.record}</strong> (${Math.floor(bestUnofficial.pace / 60)}'${Math.floor(bestUnofficial.pace % 60)}''/km)`;
                    bestRecordContainer.appendChild(p);
                }
            }else {
                const p = document.createElement("p");
                p.className = "best-record unofficial";
                p.innerHTML = `<strong>${bestUnofficial.elevation} m</strong> (${Math.floor(bestUnofficial.pace / 60)}'${Math.floor(bestUnofficial.pace % 60)}''/km)`;
                bestRecordContainer.appendChild(p);
            }
        }

        for (let year = endYear; year >= startYear; year--) {
            const yearRecords = categoryRecords.filter((r) => r.dateObj.getFullYear() === year);

            const yearMarkerContainer = document.createElement("div");
            yearMarkerContainer.className = "year-marker-container";

            const yearLabel = document.createElement("div");
            yearLabel.className = "year-label";
            yearLabel.textContent = year;
            yearMarkerContainer.appendChild(yearLabel);

            const markerGrid = document.createElement("div");
            markerGrid.className = "marker-grid";

            const weeklyRecords = new Array(52).fill(null);
            yearRecords.forEach((record) => {
                const week = getWeekNumber(record.dateObj);
                if (week >= 1 && week <= 52 && !weeklyRecords[week - 1]) {
                    weeklyRecords[week - 1] = record;
                }
            });

            weeklyRecords.reverse();

            for (let i = 0; i < 52; i++) {
                const marker = document.createElement("div");
                marker.className = "marker";
                const record = weeklyRecords[i];
                if (record) {
                    marker.classList.add("has-record");
                    if (record.isOfficial) {
                        marker.classList.add("official");
                    } else {
                        marker.classList.add("unofficial");
                    }
                    marker.title = `${record.title} - ${record.record} (${Math.floor(record.pace / 60)}'${Math.floor(record.pace % 60)}''/km) - ${record.date}`

                    if (record.course === 'trail') {
                        if (record.elevation !== undefined) {
                            const normalizedElevation = (maxElevation - record.elevation) / (maxElevation - minElevation);

                            const r = Math.round(endColor[0] * normalizedElevation + startColor[0] * (1 - normalizedElevation));
                            const g = Math.round(endColor[1] * normalizedElevation + startColor[1] * (1 - normalizedElevation));
                            const b = Math.round(endColor[2] * normalizedElevation + startColor[2] * (1 - normalizedElevation));

                            marker.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                        }
                    } else {
                        if (record.pace !== Infinity) {
                            const normalizedPace = (record.pace - minPace) / (maxPace - minPace);

                            const r = Math.round(endColor[0] * normalizedPace + startColor[0] * (1 - normalizedPace));
                            const g = Math.round(endColor[1] * normalizedPace + startColor[1] * (1 - normalizedPace));
                            const b = Math.round(endColor[2] * normalizedPace + startColor[2] * (1 - normalizedPace));

                            marker.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                        }
                    }
                } else {
                    // marker.title = `${year}-w${52-i}`
                }
                marker.textContent = `${52 - i}`;
                markerGrid.appendChild(marker);
            }
            yearMarkerContainer.appendChild(markerGrid);
            element.appendChild(yearMarkerContainer);
        }
    }
};

hermes.initiate();
