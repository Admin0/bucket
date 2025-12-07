const hermes = {};

hermes.records = [
    { date: "2024-11-10", course: 10, record: "00:58:43", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-04-20", course: 10, record: "01:02:24", title: "아산이순신마라톤" },
    { date: "2025-09-28", course: 10, record: "00:54:16", title: "공주백제마라톤" },
    { date: "2025-10-12", course: 10, record: "00:51:32", title: "빵빵런 대전" },
    { date: "2025-10-19", course: 10, record: "00:48:29", title: "꽈자런 천안" },
    { date: "2025-11-09", course: 10, record: "01:00:07", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-12-07", course: 21, distance: 21.26, record: "01:57:05", title: "장항선구철도길" },
    { date: "2025-10-07", course: 5, distance: 5.03, record: "00:24:44", title: "신정호" },
    { date: "2025-09-23", course: 5, distance: 5.78, record: "00:29:52", title: "장항선구철도길" },
    { date: "2025-07-12", course: 5, distance: 5.01, record: "00:26:26", title: "신정호" },
    { date: "2025-09-09", course: 10, distance: 10.1, record: "00:55:08", title: "천안종합운동장" },
    { date: "2025-09-05", course: 10, distance: 13.44, record: "01:16:02", title: "장항선구철도길" },
];

hermes.initiate = function () {
    const allRecords = hermes.records.map((record) => {
        const [hr, min, sec] = record.record.split(":").map(Number);
        return {
            ...record,
            isOfficial: !record.distance,
            time: hr * 3600 + min * 60 + sec,
            distance: record.distance || Number(record.course),
            course: Number(record.course),
            dateObj: new Date(record.date),
        };
    });

    const officialRecords = allRecords.filter((r) => r.isOfficial);
    if (officialRecords.length === 0) return;

    const overallMinDate = new Date(Math.min(...officialRecords.map((r) => r.dateObj)));
    const overallMaxDate = new Date(Math.max(...officialRecords.map((r) => r.dateObj)));
    const totalDays = (overallMaxDate - overallMinDate) / (1000 * 60 * 60 * 24);
    const timelineHeight = Math.max(totalDays, 1000);

    const courseCategories = {
        "timeline-full": { courseMin: 42, courseMax: Infinity },
        "timeline-half": { courseMin: 21, courseMax: 41.99 },
        "timeline-10k": { courseMin: 10, courseMax: 20.99 },
        "timeline-5k": { courseMin: 0, courseMax: 9.99 },
    };

    for (const timelineId in courseCategories) {
        const { courseMin, courseMax } = courseCategories[timelineId];
        const element = document.getElementById(timelineId);
        if (!element) continue;

        const trackLane = element.parentElement;
        // Clear previous content
        element.innerHTML = "";
        const existingBest = trackLane.querySelector(".best-record");
        if (existingBest) existingBest.remove();

        element.style.height = `${timelineHeight}px`;

        // Filter records based on course range
        const categoryRecords = allRecords.filter((r) => r.course >= courseMin && r.course <= courseMax);
        const categoryOfficialRecords = categoryRecords.filter((r) => r.isOfficial);
        const categoryUnofficialRecords = categoryRecords.filter((r) => !r.isOfficial);

        const bestOfficial = categoryOfficialRecords.length > 0 ? categoryOfficialRecords.reduce((b, c) => (c.time < b.time ? c : b)) : null;
        const bestUnofficial = categoryUnofficialRecords.length > 0 ? categoryUnofficialRecords.reduce((b, c) => (c.time / c.distance < b.time / b.distance ? c : b)) : null;

        // Create and append the best record element
        const bestRecordDiv = document.createElement("div");
        bestRecordDiv.classList.add("best-record");
        let content = "";
        let bestOfficial_temp = 0;
        if (bestOfficial) {
            const pace = bestOfficial.time / bestOfficial.distance;
            const paceMin = Math.floor(pace / 60);
            const paceSec = Math.round(pace % 60);
            content += `<div class='official'><strong>${bestOfficial.record}</strong> (${paceMin}'${paceSec}''/km)</div>`;
            bestOfficial_temp = bestOfficial.time;
        } else {
            bestOfficial_temp = 99999;
        }
        console.log(bestUnofficial);
        
        if (bestUnofficial && bestOfficial_temp > bestUnofficial.time) {
            const pace = bestUnofficial.time / bestUnofficial.distance;
            const paceMin = Math.floor(pace / 60);
            const paceSec = Math.round(pace % 60);
            content += `<div class='unofficial'><strong>${bestUnofficial.record}</strong> (${paceMin}'${paceSec}''/km)</div>`;
        }
        bestRecordDiv.innerHTML = content;
        trackLane.insertBefore(bestRecordDiv, element);

        // Render timeline with official records only
        categoryRecords.forEach((record) => {
            const daysFromStart = (record.dateObj - overallMinDate) / (1000 * 60 * 60 * 24);
            const topPosition = timelineHeight - (daysFromStart / totalDays) * timelineHeight;

            const eventDiv = document.createElement("div");
            eventDiv.classList.add("timeline-event");
            eventDiv.style.top = `${topPosition}px`;

            const pace = record.time / record.distance;
            const paceMin = Math.floor(pace / 60);
            const paceSec = Math.round(pace % 60);

            eventDiv.innerHTML = `
                <div class="timeline-icon ${record.isOfficial ? "official" : "unofficial"}"></div>
                <div class="timeline-event-content">
                    <span class="date">${record.date}</span>
                    <h3 class="title">${record.title}</h3>
                    <ul>
                        <li><span class="course">Distance ${record.course} km</span></li>
                        <li><span class="record">Record ${record.record}</span></li>
                        <li><span class="pace">Pace ${paceMin}'${paceSec}\''/km</span></li>
                    </ul>
                </div>
            `;
            element.appendChild(eventDiv);
        });
    }

    // Add Year Markers to the first timeline (or any other designated timeline)
    const firstTimelineElement = document.getElementById("timeline-full");
    if (firstTimelineElement) {
        for (let year = overallMinDate.getFullYear(); year <= overallMaxDate.getFullYear(); year++) {
            const yearDate = new Date(year, 0, 1);
            if (yearDate >= overallMinDate && yearDate <= overallMaxDate) {
                const daysFromStart = (yearDate - overallMinDate) / (1000 * 60 * 60 * 24);
                const topPosition = timelineHeight - (daysFromStart / totalDays) * timelineHeight;

                const yearMarker = document.createElement("div");
                yearMarker.classList.add("year-marker");
                yearMarker.textContent = year;
                yearMarker.style.top = `${topPosition}px`;
                firstTimelineElement.appendChild(yearMarker);
            }
        }
    }
};

hermes.initiate();
