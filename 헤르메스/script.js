const hermes = {};

hermes.records = [
    // official data
    { date: "2025-11-09", course: "10k", record: "01:00:07", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-10-19", course: "10k", record: "00:48:29", title: "꽈자런 천안" },
    { date: "2025-10-12", course: "10k", record: "00:51:32", title: "빵빵런 대전" },
    { date: "2025-09-28", course: "10k", record: "00:54:16", title: "공주백제마라톤" },
    { date: "2025-04-20", course: "10k", record: "01:02:24", title: "아산이순신마라톤" },

    { date: "2024-11-10", course: "10k", record: "00:58:43", title: "아산은행나무길 전국마라톤대회" },


    // unofficial 2025 run
    { date: "2025-12-06", distance: 21.26, record: "01:57:05", title: "장항선구철도길" },
    { date: "2025-12-04", distance: 5.36, record: "00:30:54", title: "신정호" },

    { date: "2025-11-26", distance: 6.35, record: "00:37:58", title: "신정호" },
    { date: "2025-11-12", distance: 6.14, record: "00:33:45", title: "신정호" },
    { date: "2025-11-03", distance: 5.34, record: "00:29:52", title: "장항선구철도길" },

    { date: "2025-10-27", distance: 6.2, record: "00:40:43", title: "신정호" },
    { date: "2025-10-21", distance: 5.33, record: "00:29:29", title: "장항선구철도길" },
    { date: "2025-10-18", distance: 6.2, record: "00:34:50", title: "신정호" },
    { date: "2025-10-07", distance: 5.03, record: "00:24:44", title: "신정호" },
    { date: "2025-10-03", distance: 7.16, record: "01:29:06", title: "독립기념관" },

    { date: "2025-09-26", distance: 5.95, record: "00:32:40", title: "이순신종합운동장" },
    { date: "2025-09-23", distance: 5.78, record: "00:29:52", title: "장항선구철도길" },
    { date: "2025-09-20", distance: 12.31, record: "01:13:08", title: "장항선구철도길" },
    { date: "2025-09-16", distance: 5.03, record: "00:28:13", title: "장항선구철도길" },
    { date: "2025-09-11", distance: 5.04, record: "00:32:38", title: "성성호수공원" },
    { date: "2025-09-09", distance: 10.1, record: "00:55:08", title: "천안종합운동장" },
    { date: "2025-09-05", distance: 13.44, record: "01:16:02", title: "장항선구철도길" },
    { date: "2025-09-03", distance: 6.30, record: "00:36:21", title: "신정호" },

    { date: "2025-08-28", distance: 6.25, record: "00:34:14", title: "신정호" },
    { date: "2025-08-24", distance: 11.11, record: "01:08:51", title: "신정호" },
    { date: "2025-08-23", distance: 5.16, record: "00:29:36", title: "삼천" },
    { date: "2025-08-21", distance: 10.15, record: "01:07:30", title: "장재천" },
    { date: "2025-08-14", distance: 5.02, record: "00:27:14", title: "장항선구철도길" },
    { date: "2025-08-11", distance: 12.47, record: "01:15:15", title: "장항선구철도길" },
    { date: "2025-08-10", distance: 5.12, record: "00:28:43", title: "삼천" },
    { date: "2025-08-05", distance: 10.08, record: "00:56:55", title: "장항선구철도길" },
    { date: "2025-08-01", distance: 10.01, record: "00:57:26", title: "장항선구철도길" },

    { date: "2025-07-31", distance: 5.14, record: "00:34:38", title: "신정호" },
    { date: "2025-07-21", distance: 10.01, record: "01:00:17", title: "장항선구철도길" },
    { date: "2025-07-23", distance: 5.11, record: "00:32:15", title: "신정호" },
    { date: "2025-07-20", distance: 7.36, record: "00:42:20", title: "장항선구철도길" },
    { date: "2025-07-10", distance: 7.01, record: "00:42:54", title: "곡교천" },
    { date: "2025-07-01", distance: 5.11, record: "00:32:15", title: "신정호" },

    { date: "2025-06-25", distance: 5.02, record: "00:28:19", title: "신정호" },
    { date: "2025-06-18", distance: 5.01, record: "00:28:51", title: "신정호" },
    { date: "2025-06-14", distance: 5.01, record: "00:29:15", title: "신정호" },

    { date: "2025-05-20", distance: 5.01, record: "00:32:58", title: "신정호" },
    { date: "2025-05-15", distance: 5.02, record: "00:34:13", title: "신정호" },

    { date: "2025-04-29", distance: 5.02, record: "00:34:13", title: "신정호" },
    { date: "2025-04-07", distance: 5.03, record: "00:33:50", title: "순천향대학교" },

    { date: "2025-03-31", distance: 5.01, record: "00:31:58", title: "신정호" },
    { date: "2025-03-05", distance: 5.05, record: "00:32:36", title: "신정호" },

    { date: "2025-02-25", distance: 5.01, record: "00:29:34", title: "신정호" },

    { date: "2025-01-26", distance: 5.01, record: "00:29:46", title: "신정호" },

    // unofficial 2025 trail
    { date: "2025-12-06", distance: 3.56, elevation: 173, record: "01:03:23", title: "봉서산" },

    { date: "2025-11-30", distance: 10.0, elevation: 742, record: "02:27:32", title: "백암산" },
    { date: "2025-11-16", distance: 7.36, elevation: 330, record: "01:58:36", title: "재약산" },
    { date: "2025-11-15", distance: 11.15, elevation: 1055, record: "03:58:36", title: "신불산" },
    { date: "2025-11-14", distance: 5.8, elevation: 672, record: "01:57:07", title: "금오산" },
    { date: "2025-11-01", distance: 7.5, elevation: 821, record: "03:20:00", title: "삼악산" },

    { date: "2025-10-30", distance: 11.57, elevation: 1033, record: "04:02:44", title: "용문산" },
    { date: "2025-10-25", distance: 14.63, elevation: 1470, record: "04:39:37", title: "설악산" },
    { date: "2025-10-10", distance: 8.47, elevation: 453, record: "02:24:29", title: "불갑산" },
    { date: "2025-10-02", distance: 2.84, elevation: 193, record: "01:16:49", title: "알틴-아라산(키르기스스탄)" },
    
    { date: "2025-09-21", distance: 11.41, elevation: 893, record: "04:08:26", title: "망경산" },
    { date: "2025-09-14", distance: 6.20, elevation: 509, record: "01:38:36", title: "두타산" },
    { date: "2025-09-07", distance: 6.83, elevation: 539, record: "02:48:40", title: "광덕산" },

    { date: "2025-08-29", distance: 7.53, elevation: 894, record: "02:50:56", title: "팔공산" },
    { date: "2025-08-22", distance: 12.41, elevation: 948, record: "03:42:58", title: "무등산" },
    { date: "2025-08-16", distance: 3.23, elevation: 255, record: "01:14:18", title: "배방산" },
    { date: "2025-08-08", distance: 7.68, elevation: 826, record: "03:22:45", title: "구봉산(진안)" },
    { date: "2025-08-02", distance: 10.26, elevation: 544, record: "03:32:20", title: "칠보산(괴산)" },

    { date: "2025-07-26", distance: 4.87, elevation: 385, record: "01:29:27", title: "배방산" },
    { date: "2025-07-06", distance: 3.68, elevation: 150, record: "01:15:07", title: "봉서산" },

    // { date: "2025-06-29", distance: 3.46, elevation: 293, record: "01:28:51", title: "배방산" },
    { date: "2025-06-27", distance: 6.75, elevation: 645, record: "02:33:54", title: "천마산" },
    { date: "2025-06-21", distance: 8.38, elevation: 543, record: "02:25:23", title: "소요산" },
    { date: "2025-06-15", distance: 4.59, elevation: 218, record: "01:25:27", title: "영인산" },
    // { date: "2025-06-08", distance: 6.77, elevation: 312, record: "01:42:49", title: "선운산" },
    { date: "2025-06-06", distance: 7.26, elevation: 545, record: "03:22:04", title: "관악산" },
    
    { date: "2025-05-31", distance: 11.68, elevation: 690, record: "03:54:34", title: "수락산" },
    { date: "2025-05-23", distance: 14.88, elevation: 744, record: "03:56:49", title: "속리산" },
    { date: "2025-05-17", distance: 11.56, elevation: 871, record: "03:50:16", title: "주흘산" },
    { date: "2025-05-11", distance: 5.72, elevation: 488, record: "01:40:26", title: "청계산" },
    { date: "2025-05-04", distance: 8.28, elevation: 638, record: "02:51:06", title: "마이산" },
    
    { date: "2025-04-26", distance: 7.00, elevation: 592, record: "02:03:17", title: "금정산" },
    { date: "2025-04-13", distance: 8.01, elevation: 915, record: "03:11:58", title: "대둔산" },
    { date: "2025-04-12", distance: 6.24, elevation: 641, record: "02:11:27", title: "모악산" },
    { date: "2025-04-06", distance: 6.85, elevation: 406, record: "01:59:15", title: "흑성산" },

    { date: "2025-03-30", distance: 8.59, elevation: 884, record: "03:24:04", title: "계룡산" },
    { date: "2025-03-29", distance: 5.78, elevation: 501, record: "01:47:08", title: "오봉산" },
    { date: "2025-03-01", distance: 3.01, elevation: 304, record: "02:02:22", title: "망산" },

    { date: "2025-02-23", distance: 7.66, elevation: 697, record: "03:11:28", title: "칠갑산" },
    { date: "2025-02-02", distance: 6.93, elevation: 849, record: "04:24:27", title: "가야산(충남)" },
    
    { date: "2025-01-25", distance: 6.79, elevation: 846, record: "04:47:30", title: "내장산" },
    { date: "2025-01-19", distance: 2.45, elevation: 396, record: "01:45:22", title: "용봉산" },
    { date: "2025-01-12", distance: 7.22, elevation: 1193, record: "05:55:49", title: "월악산" },


    // unofficial 2024 run
    { date: "2024-12-12", distance: 5.07, record: "00:28:25", title: "신정호" },
    { date: "2024-12-07", distance: 5.01, record: "00:28:48", title: "신정호" },

    { date: "2024-11-19", distance: 5.01, record: "00:29:46", title: "신정호" },
    { date: "2024-11-07", distance: 5.01, record: "00:27:43", title: "신정호" },

    { date: "2024-10-31", distance: 5.03, record: "00:27:41", title: "신정호" },
    { date: "2024-10-23", distance: 5.01, record: "00:31:57", title: "신정호" },
    { date: "2024-10-15", distance: 5.01, record: "00:28:58", title: "신정호" },
    { date: "2024-10-12", distance: 5.01, record: "00:28:43", title: "신정호" },
    { date: "2024-10-05", distance: 5.00, record: "00:30:55", title: "신정호" },
    
    { date: "2024-09-28", distance: 5.01, record: "00:31:41", title: "신정호" },
    { date: "2024-09-23", distance: 10.01, record: "01:15:07", title: "신정호" },

    { date: "2024-08-27", distance: 5.01, record: "00:31:05", title: "신정호" },

    { date: "2024-07-21", distance: 5.01, record: "00:36:37", title: "신정호" },
    { date: "2024-07-05", distance: 5.09, record: "00:43:34", title: "신정호" },

    { date: "2024-06-23", distance: 5.01, record: "00:37:21", title: "신정호" },
    { date: "2024-06-10", distance: 5.02, record: "00:32:49", title: "신정호" },
    { date: "2024-06-08", distance: 5.01, record: "00:33:41", title: "신정호" },

    { date: "2024-05-31", distance: 5.08, record: "00:31:04", title: "신정호" },
    { date: "2024-05-19", distance: 5.01, record: "00:28:59", title: "신정호" },
    { date: "2024-05-16", distance: 5.12, record: "00:32:08", title: "신정호" },
    { date: "2024-05-09", distance: 5.02, record: "00:31:54", title: "신정호" },
    { date: "2024-05-01", distance: 5.02, record: "00:33:45", title: "신정호" },

    { date: "2024-04-16", distance: 5.01, record: "00:33:17", title: "신정호" },
    { date: "2024-04-11", distance: 5.01, record: "00:34:44", title: "신정호" },
    { date: "2024-04-01", distance: 5.02, record: "00:32:53", title: "신정호" },

    { date: "2024-03-15", distance: 5.03, record: "00:37:09", title: "신정호" },
    { date: "2024-03-09", distance: 5.17, record: "00:43:40", title: "신정호" },

    // unofficial 2024 trail
    { date: "2024-12-29", distance: 19.00, elevation: 1460, record: "07:14:58", title: "한라산" },
    { date: "2024-12-22", distance: 5.98, elevation: 1189, record: "02:55:13", title: "치악산" },
    { date: "2024-12-08", distance: 3.48, elevation: 391, record: "01:58:29", title: "덕숭산" },
    { date: "2024-12-01", distance: 3.12, elevation: 319, record: "01:37:59", title: "배방산" },
    
    { date: "2024-11-17", distance: 11.57, elevation: 853, record: "04:41:17", title: "광교산" },
    { date: "2024-11-02", distance: 9.17, elevation: 797, record: "04:39:07", title: "오서산" },
    
    { date: "2024-10-27", distance: 4.59, elevation: 507, record: "01:50:34", title: "광덕산" },
    { date: "2024-10-09", distance: 3.97, elevation: 410, record: "03:04:38", title: "설화산" },
    { date: "2024-10-03", distance: 6.22, elevation: 406, record: "02:42:04", title: "봉수산" },

    { date: "2024-09-14", distance: 4.38, elevation: 346, record: "02:07:31", title: "설화산" },

    { date: "2024-07-20", distance: 3.16, elevation: 122, record: "01:27:44", title: "고용산" },
    { date: "2024-07-13", distance: 8.01, elevation: 645, record: "02:52:37", title: "광덕산" },
    
    { date: "2024-06-22", distance: 8.00, elevation: 487, record: "02:10:13", title: "태조산" },
    { date: "2024-06-15", distance: 8.88, elevation: 444, record: "02:10:13", title: "영인산" },
    { date: "2024-06-09", distance: 8.45, elevation: 594, record: "02:48:51", title: "광덕산" },


    // unofficial 2023 run
    // { date: "2023-10-17", distance: 11.05, record: "02:00:28", title: "신정호" },
    // { date: "2023-10-11", distance: 7.21, record: "01:20:27", title: "온양온천" },
    // { date: "2023-10-10", distance: 11.92, record: "01:59:03", title: "신정호" },
    // { date: "2023-10-05", distance: 7.18, record: "01:15:00", title: "온양온천" },

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

        const distance = record.distance || (record.course == "full" ? 42.195 : record.course == "half" ? 21.0975 : record.course == "10k" ? 10 : record.course == "5k" ? 5 : 0);
        const elevation = record.elevation || 0;

        return {
            ...record,
            isOfficial: record.course !== undefined,
            time,
            distance,
            elevation,
            pace: elevation > 0 ? (time / elevation) * 50 : distance > 0 ? time / distance : Infinity, // sec per elevation 100 m || seconds per km
            course: record.course || (elevation > 0 ? "trail" : distance >= 42.195 ? "full" : distance >= 21.0975 ? "half" : distance >= 10 ? "10k" : "5k"),
            dateObj: new Date(record.date),
        };
    });

    const runRecords = allRecords.filter((r) => r.course !== "trail");
    const trailRecords = allRecords.filter((r) => r.course === "trail");

    const runPaces = runRecords.map((r) => r.pace).filter((p) => p !== Infinity);
    const limitPace = 7;
    const minPace = Math.min(...runPaces);
    const maxPace = Math.min(Math.max(...runPaces), limitPace * 60);

    const trailElevations = trailRecords.map((r) => r.elevation).filter((e) => e !== undefined);
    const minElevation = Math.min(...trailElevations);
    const maxElevation = Math.max(...trailElevations);

    const startColor = [0, 255, 127]; // #00FF7F SpringGreen
    const endColor = [0, 77, 64]; // #004D40 Teal900 

    const startYear = Math.min(...allRecords.map((r) => r.dateObj.getFullYear()));
    const endYear = Math.max(...allRecords.map((r) => r.dateObj.getFullYear()));

    const courseCategories = {
        "track-full": { course: "full", type: "run" },
        "track-half": { course: "half", type: "run" },
        "track-10k": { course: "10k", type: "run" },
        "track-5k": { course: "5k", type: "run" },
        "track-trail": { type: "trail" },
    };

    for (const trackId in courseCategories) {
        const category = courseCategories[trackId];
        const element = document.getElementById(trackId);
        if (!element) continue;

        element.innerHTML = "";

        let categoryRecords;
        if (category.type === "run") {
            categoryRecords = runRecords.filter((r) => r.course == category.course);
        } else {
            categoryRecords = trailRecords;
        }

        const bestRecordContainer = element.previousElementSibling;
        bestRecordContainer.innerHTML = "";

        const officialRecords = categoryRecords.filter((r) => r.isOfficial);
        const unofficialRecords = categoryRecords.filter((r) => !r.isOfficial);

        let bestOfficial = officialRecords.length > 0 ? officialRecords.reduce((best, current) => (current.pace < best.pace ? current : best)) : null;
        let bestUnofficial =
            unofficialRecords.length > 0
                ? unofficialRecords.reduce((best, current) => (category.type == "run" ? (current.pace < best.pace ? current : best) : current.elevation > best.elevation ? current : best))
                : null;

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
            } else {
                const p = document.createElement("p");
                p.className = "best-record unofficial";
                p.innerHTML = `<strong>${bestUnofficial.elevation.toLocaleString()}</strong> m (${Math.floor(bestUnofficial.pace / 60)}'${Math.floor(bestUnofficial.pace % 60)}''/100 m↑)`;
                bestRecordContainer.appendChild(p);
            }
        } else {
            const p = document.createElement("p");
            p.className = "best-record unofficial";
            p.innerHTML = `-`;
            bestRecordContainer.appendChild(p);
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
                    marker.title = `${record.title} - ${record.record} (${Math.floor(record.pace / 60)}'${Math.floor(record.pace % 60)}''${category.type == "run" ? "/km" : "/100 m↑"}) - ${
                        record.date
                    }`;

                    if (record.course === "trail") {
                        if (record.elevation !== undefined) {
                            const normalizedElevation = (maxElevation - record.elevation) / (maxElevation - minElevation);

                            const r = Math.round(endColor[0] * normalizedElevation + startColor[0] * (1 - normalizedElevation));
                            const g = Math.round(endColor[1] * normalizedElevation + startColor[1] * (1 - normalizedElevation));
                            const b = Math.round(endColor[2] * normalizedElevation + startColor[2] * (1 - normalizedElevation));

                            marker.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                        }
                    } else {
                        if (record.pace !== Infinity) {
                            const normalizedPace = (Math.min(record.pace, limitPace * 60) - minPace) / (maxPace - minPace);

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
