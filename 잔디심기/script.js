const hermes = {};

hermes.records = hermes_records;

hermes.courseCategories = {
    "track-full": { course: "full", type: "run" },
    "track-half": { course: "half", type: "run" },
    "track-10k": { course: "10k", type: "run" },
    "track-5k": { course: "5k", type: "run" },
    "track-trail": { type: "trail" },
};

function getWeekInfo(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const year = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year, week: weekNo };
}

hermes.track = function () {
    const allRecords = hermes.records.map((record, index) => {
        const parts = record.record.split(":").map(Number);
        let time;
        if (parts.length === 3) {
            time = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            time = parts[0] * 60 + parts[1];
        }

        const distance = record.distance || (record.course == "full" ? 42.195 : record.course == "half" ? 21.0975 : record.course == "10k" ? 10 : record.course == "5k" ? 5 : 0);
        const elevation = record.elevation || 0;
        const isTrail = elevation > 0;

        let elevation_pace = Infinity;
        let distance_pace = Infinity;

        if (isTrail) {
            if (elevation > 0) elevation_pace = (time / elevation / 2) * 60; // 60 m 당 페이스
            if (distance > 0) distance_pace = time / distance;
        }

        const dateObj = new Date(record.date);

        return {
            ...record,
            id: index,
            isOfficial: record.course !== undefined,
            time,
            distance,
            elevation,
            pace: time / distance,
            elevation_pace: isTrail ? elevation_pace : distance > 0 ? time / distance : Infinity,
            distance_pace,
            course: record.course || (isTrail ? "trail" : distance >= 42.195 ? "full" : distance >= 21.0975 ? "half" : distance >= 10 ? "10k" : "5k"),
            dateObj: dateObj,
            weekInfo: getWeekInfo(dateObj),
        };
    });

    hermes.allRecords = allRecords;
    if (!hermes.allRecords || hermes.allRecords.length === 0) return;

    const totalDistance = allRecords
        .reduce((sum, r) => sum + r.distance, 0);

    const totalRunningDistance = allRecords
        .filter(r => r.course !== 'trail')
        .reduce((sum, r) => sum + r.distance, 0);

    const totalTrailElevation = allRecords
        .filter(r => r.course === 'trail')
        .reduce((sum, r) => sum + r.elevation, 0);

    document.getElementById('total-distance').innerHTML = `${totalDistance.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span class="unit">km</span>`;
    document.getElementById('total-running-distance').innerHTML = `${totalRunningDistance.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span class="unit">km</span>`;
    document.getElementById('total-trail-elevation').innerHTML = `${(totalTrailElevation/1000).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span class="unit">km</span>`;
    document.getElementById('total-record-count').innerHTML = allRecords.length.toLocaleString();


    const runRecords = allRecords.filter((r) => r.course !== "trail");
    const runPaces = runRecords.map((r) => r.pace).filter((p) => p !== Infinity);
    const limitPace = 7 * 60; // 7분/km
    const minPace = runPaces.length > 0 ? Math.min(...runPaces) : 0;
    const maxPace = runPaces.length > 0 ? Math.min(Math.max(...runPaces), limitPace) : limitPace;

    const trailRecords = allRecords.filter((r) => r.course === "trail");
    hermes.trailStats = {
        elevations: trailRecords.map((r) => r.elevation),
        elevation_paces: trailRecords.map((r) => r.elevation_pace).filter((p) => p !== Infinity),
        distances: trailRecords.map((r) => r.distance),
        distance_paces: trailRecords.map((r) => r.distance_pace).filter((p) => p !== Infinity),
    };

    const limitElevationPace = 12 * 60; // 12분/60 m
    const limitTrailDistancePace = 28 * 60; // 28분/km

    hermes.trailStats.maxElevation = Math.max(0, ...hermes.trailStats.elevations);
    hermes.trailStats.minElevation = Math.min(...hermes.trailStats.elevations.filter((e) => e > 0));
    hermes.trailStats.maxElevationPace = Math.min(Math.max(0, ...hermes.trailStats.elevation_paces), limitElevationPace);
    hermes.trailStats.minElevationPace = Math.min(...hermes.trailStats.elevation_paces);
    hermes.trailStats.maxDistance = Math.max(0, ...hermes.trailStats.distances);
    hermes.trailStats.minDistance = Math.min(...hermes.trailStats.distances.filter((d) => d > 0));
    hermes.trailStats.maxDistancePace = Math.min(Math.max(0, ...hermes.trailStats.distance_paces), limitTrailDistancePace);
    hermes.trailStats.minDistancePace = Math.min(...hermes.trailStats.distance_paces);

    const startColor = [0, 255, 127]; // SpringGreen (좋은 기록)
    const endColor = [0, 77, 64]; // Teal900 (나쁜 기록)

    const years = [...new Set(allRecords.map((r) => r.weekInfo.year))];
    const startYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
    const endYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    function renderTracks() {
        const trailFilterValue = document.querySelector('input[name="trail-filter"]:checked').value;

        for (const trackId in hermes.courseCategories) {
            const category = hermes.courseCategories[trackId];
            const element = document.getElementById(trackId);
            if (!element) continue;

            element.innerHTML = "";

            let categoryRecords = allRecords.filter((r) => {
                if (category.type === "trail") return r.course === "trail";
                return r.course === category.course;
            });

            const bestRecordContainer = element.parentElement.querySelector(".best-record-container");
            if (bestRecordContainer) bestRecordContainer.innerHTML = "";

            if (category.type === "trail") {
                if (categoryRecords.length > 0) {
                    let bestRecord;
                    switch (trailFilterValue) {
                        case "elevation":
                            bestRecord = categoryRecords.reduce((best, cur) => (cur.elevation > best.elevation ? cur : best));
                            break;
                        case "elevation_pace":
                            bestRecord = categoryRecords.reduce((best, cur) => (cur.elevation_pace < best.elevation_pace ? cur : best));
                            break;
                        case "distance":
                            bestRecord = categoryRecords.reduce((best, cur) => (cur.distance > best.distance ? cur : best));
                            break;
                        case "distance_pace":
                            bestRecord = categoryRecords.reduce((best, cur) => (cur.distance_pace < best.distance_pace ? cur : best));
                            break;
                    }

                    if (bestRecord) {
                        let value, pace, unit;
                        if (trailFilterValue.includes("elevation")) {
                            value = `${bestRecord.elevation.toLocaleString()}m`;
                            pace = bestRecord.elevation_pace;
                            unit = "/60 m↑";
                        } else {
                            value = `${bestRecord.distance.toFixed(2)}km`;
                            pace = bestRecord.distance_pace;
                            unit = "/km";
                        }
                        const paceMinutes = Math.floor(pace / 60);
                        const paceSeconds = Math.floor(pace % 60)
                            .toString()
                            .padStart(2, "0");

                        const p = document.createElement("p");
                        p.className = `best-record ${bestRecord.isOfficial ? "official" : "unofficial"}`;
                        p.innerHTML = `<strong>${value}</strong> (${paceMinutes}'${paceSeconds}''<span class="unit">${unit}</span>)`;
                        bestRecordContainer.appendChild(p);
                    }
                }
            } else {
                const officialRecords = categoryRecords.filter((r) => r.isOfficial);
                const unofficialRecords = categoryRecords.filter((r) => !r.isOfficial);
                let bestOfficial = officialRecords.length > 0 ? officialRecords.reduce((best, current) => (current.pace < best.pace ? current : best)) : null;
                let bestUnofficial = unofficialRecords.length > 0 ? unofficialRecords.reduce((best, current) => (current.pace < best.pace ? current : best)) : null;

                if (bestOfficial) {
                    const p = document.createElement("p");
                    p.className = "best-record official";
                    p.innerHTML = `<strong>${bestOfficial.record}</strong> (${Math.floor(bestOfficial.pace / 60)}'${Math.floor(bestOfficial.pace % 60)}''<span class="unit">/km</span>)`;
                    bestRecordContainer.appendChild(p);
                }
                if (bestUnofficial && (!bestOfficial || bestUnofficial.time < bestOfficial.time)) {
                    const p = document.createElement("p");
                    p.className = "best-record unofficial";
                    p.innerHTML = `<strong>${bestUnofficial.record}</strong> (${Math.floor(bestUnofficial.pace / 60)}'${Math.floor(bestUnofficial.pace % 60)}''<span class="unit">/km</span>)`;
                    bestRecordContainer.appendChild(p);
                }
            }
            if (bestRecordContainer.innerHTML === "") {
                const p = document.createElement("p");
                p.className = "best-record unofficial";
                p.innerHTML = `-`;
                bestRecordContainer.appendChild(p);
            }

            for (let year = endYear; year >= startYear; year--) {
                const yearRecords = categoryRecords.filter((r) => r.weekInfo.year === year);
                const yearMarkerContainer = document.createElement("div");
                yearMarkerContainer.className = "year-marker-container";
                const yearLabel = document.createElement("div");
                yearLabel.className = "year-label";
                yearLabel.textContent = year;
                yearMarkerContainer.appendChild(yearLabel);
                const markerGrid = document.createElement("div");
                markerGrid.className = "marker-grid";

                const weeklyRecords = new Array(52).fill(null).map(() => []);
                yearRecords.forEach((record) => {
                    const week = record.weekInfo.week;
                    if (week >= 1 && week <= 52) {
                        weeklyRecords[week - 1].push(record);
                    }
                });

                for (let i = 0; i < 52; i++) {
                    const marker = document.createElement("div");
                    const weekNumber = 52 - i;
                    marker.className = "marker";
                    marker.dataset.year = year;
                    marker.dataset.week = weekNumber;

                    const recordsForWeek = weeklyRecords[weekNumber - 1];
                    if (recordsForWeek && recordsForWeek.length > 0) {
                        const representativeRecord = recordsForWeek.find((r) => r.isOfficial) || recordsForWeek[0];

                        marker.dataset.recordIds = JSON.stringify(recordsForWeek.map((r) => r.id));
                        marker.classList.add("has-record");
                        if (recordsForWeek.some((r) => r.isOfficial)) {
                            marker.classList.add("official");
                        } else {
                            marker.classList.add("unofficial");
                        }

                        let tooltipContent = "";
                        recordsForWeek.forEach((record) => {
                            const tooltipPace = `${Math.floor((record.course === "trail" ? record.elevation_pace : record.pace) / 60)}'${Math.floor(
                                (record.course === "trail" ? record.elevation_pace : record.pace) % 60
                            )}"${record.course === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'}`;
                            const tooltipDistance = record.course === "trail" ? `${record.elevation} <span class="unit">m</span>` : `${record.distance.toFixed(2)} <span class="unit">km</span>`;
                            const tooltip_type = record.isOfficial ? "공식 대회" : record.course === "trail" ? "하이킹 / 트레일러닝" : "러닝";
                            const tooltip__icon_distance = record.course === "trail" ? "altitude" : "conversion_path";

                            tooltipContent += `
                            <div class="tooltip-item">
                                <div class="title-container">
                                    <span class="type"> ${tooltip_type} </span> 
                                    <span class="date">${record.date}</span>
                                    <div class="title">${record.title} ${record.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""}</div> 
                                </div>
                                <div class="data">
                                    <span class="material-symbols-outlined icon distance"> ${tooltip__icon_distance} </span> <span class="distance">${tooltipDistance}</span> | 
                                    <span class="material-symbols-outlined icon record"> timer </span> <span class="record">${record.record}</span> | 
                                    <span class="material-symbols-outlined icon pace"> speed </span> <span class="pace">${tooltipPace}</span>
                                </div>
                            </div>`;
                        });

                        marker.addEventListener("mouseover", (e) => {
                            let tooltip = document.getElementById("tooltip");
                            tooltip.innerHTML = tooltipContent;
                            tooltip.classList.add("on");
                            tooltip.style.left = marker.getBoundingClientRect().left + marker.getBoundingClientRect().width / 2 + "px";
                            tooltip.style.top = marker.getBoundingClientRect().top + window.scrollY + "px";
                            const recordIds = JSON.parse(marker.dataset.recordIds);
                            recordIds.forEach((id) => {
                                document.querySelector(`#records-table tr[data-record-id="${id}"]`)?.classList.add("highlight");
                            });
                        });

                        marker.addEventListener("mouseout", () => {
                            tooltip.classList.remove("on");
                            const recordIds = JSON.parse(marker.dataset.recordIds);
                            recordIds.forEach((id) => {
                                document.querySelector(`#records-table tr[data-record-id="${id}"]`)?.classList.remove("highlight");
                            });
                        });

                        let colorValue = 0.5;
                        const record = representativeRecord;

                        if (record.course === "trail") {
                            let value,
                                min,
                                max,
                                limit,
                                higherIsBetter = false;
                            switch (trailFilterValue) {
                                case "elevation":
                                    value = record.elevation;
                                    min = hermes.trailStats.minElevation;
                                    max = hermes.trailStats.maxElevation;
                                    higherIsBetter = true;
                                    break;
                                case "elevation_pace":
                                    value = record.elevation_pace;
                                    min = hermes.trailStats.minElevationPace;
                                    max = hermes.trailStats.maxElevationPace;
                                    limit = limitElevationPace;
                                    break;
                                case "distance":
                                    value = record.distance;
                                    min = hermes.trailStats.minDistance;
                                    max = hermes.trailStats.maxDistance;
                                    higherIsBetter = true;
                                    break;
                                case "distance_pace":
                                    value = record.distance_pace;
                                    min = hermes.trailStats.minDistancePace;
                                    max = hermes.trailStats.maxDistancePace;
                                    limit = limitTrailDistancePace;
                                    break;
                            }
                            if (limit) value = Math.min(value, limit);
                            if (max > min) {
                                colorValue = (value - min) / (max - min);
                                if (!higherIsBetter) colorValue = 1 - colorValue;
                            }
                        } else if (record.pace !== Infinity && maxPace > minPace) {
                            colorValue = (Math.min(record.pace, limitPace) - minPace) / (maxPace - minPace);
                            colorValue = 1 - colorValue;
                        }

                        const r = Math.round(startColor[0] * colorValue + endColor[0] * (1 - colorValue));
                        const g = Math.round(startColor[1] * colorValue + endColor[1] * (1 - colorValue));
                        const b = Math.round(startColor[2] * colorValue + endColor[2] * (1 - colorValue));
                        marker.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                    }
                    marker.textContent = `${weekNumber}`;
                    markerGrid.appendChild(marker);
                }
                yearMarkerContainer.appendChild(markerGrid);
                element.appendChild(yearMarkerContainer);
            }
        }
        
        const tracks = document.querySelectorAll(".track");
        tracks.forEach(track => {
            
            const updateShadows = () => {
                const { scrollTop, scrollHeight, clientHeight } = track;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight -1; 

                track.classList.toggle("shadow-top", !isAtTop);
                track.classList.toggle("shadow-bottom", !isAtBottom);
            };

            track.addEventListener("scroll", updateShadows);
            updateShadows(); 
        });
    }

    renderTracks();

    document.querySelectorAll('input[name="trail-filter"]').forEach((radio) => {
        radio.addEventListener("change", renderTracks);
    });
};

hermes.table = function () {
    const tableBody = document.querySelector("#records-table tbody");
    const tableHeaders = document.querySelectorAll("#records-table th");
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const courseFilterContainer = document.getElementById("course-filter-container");
    const courseRadios = document.querySelectorAll('input[name="course"]');
    const yearRadiosContainer = document.getElementById("year-filter-container");
    const resetButton = document.getElementById("reset-filters");

    if (!hermes.allRecords || hermes.allRecords.length === 0) return;

    let currentSort = { key: "date", direction: "desc" };
    let filteredRecords = [...hermes.allRecords];

    const years = [...new Set(hermes.allRecords.map((r) => r.weekInfo.year))].sort((a, b) => b - a);
    if (yearRadiosContainer.children.length < years.length + 1) {
        years.forEach((year) => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "year";
            radio.value = year;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(`${year}`));
            yearRadiosContainer.appendChild(label);
        });
    }
    document.querySelectorAll('input[name="year"]').forEach((radio) => radio.addEventListener("change", filterAndRender));

    function setDefaultYearFilter() {
        const currentYear = new Date().getFullYear();
        const currentYearRadio = document.querySelector(`input[name="year"][value="${currentYear}"]`);
        if (currentYearRadio) {
            currentYearRadio.checked = true;
        } else {
            document.querySelector('input[name="year"][value="all"]').checked = true;
        }
    }

    function toggleCourseFilter(disabled) {
        courseFilterContainer.classList.toggle("disabled", disabled);
        courseRadios.forEach((radio) => (radio.disabled = disabled));
        if (disabled) {
            document.querySelector('input[name="course"][value="all"]').checked = true;
        }
    }

    function filterAndRender() {
        const type = document.querySelector('input[name="type"]:checked').value;
        const course = document.querySelector('input[name="course"]:checked').value;
        const year = document.querySelector('input[name="year"]:checked').value;

        toggleCourseFilter(type === "trail");

        filteredRecords = hermes.allRecords.filter((record) => {
            const recordType = record.course === "trail" ? "trail" : "run";
            return (type === "all" || recordType === type) && (course === "all" || record.course === course || type === "trail") && (year === "all" || record.weekInfo.year == year);
        });

        renderTable();
    }

    function renderTable() {
        filteredRecords.sort((a, b) => {
            const key = currentSort.key;
            let valA = a[key];
            let valB = b[key];

            if (key === "date") {
                valA = a.dateObj;
                valB = b.dateObj;
            }
            if (key === "distance") {
                valA = a.course === "trail" ? a.elevation : a.distance;
                valB = b.course === "trail" ? b.elevation : b.distance;
            }

            if (valA < valB) return currentSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return currentSort.direction === "asc" ? 1 : -1;
            return b.dateObj - a.dateObj;
        });

        tableBody.innerHTML = "";
        filteredRecords.forEach((record) => {
            const row = document.createElement("tr");
            row.dataset.recordId = record.id;
            row.classList.add(record.course);

            const isTrail = record.course === "trail";

            const paceString = `${Math.floor(record.pace / 60)}'${Math.floor(record.pace % 60)
                .toString()
                .padStart(2, "0")}''<span class="unit">/km</span>`;
            const paceStringTrail = `${Math.floor(record.elevation_pace / 60)}'${Math.floor(record.elevation_pace % 60)
                .toString()
                .padStart(2, "0")}''<span class="unit">/60 m↑</span>`;
            const paceDetail = isTrail ? `<span class="replace">${paceString}</span><span class="main">${paceStringTrail}</span>` : `${paceString}`;

            const distanceDetail = isTrail
                ? `<span class="main">${record.elevation}<span class="unit"> m</span></span><span class="replace">${record.distance.toFixed(2)}<span class="unit"> km</span></span>`
                : `${record.distance.toFixed(2)} <span class="unit"> km</span>`;
            const icon_distance = record.course === "trail" ? `<span class="main">altitude</span><span class="replace">conversion_path</span>` : "conversion_path";
            const dateString = `w${record.weekInfo.week}`;

            row.innerHTML = `
                <td class="course">${record.course}</td>
                <td class="date"><span class="main">${record.date}</span><span class="replace">${dateString}</span></td>
                <td class="title">${record.title}</td>
                <td class="isOfficial">${record.isOfficial ? '<span class="material-symbols icon"> crown </span>' : ""}</td>
                <td class="distance"><span class="material-symbols-outlined icon distance"> ${icon_distance} </span>${distanceDetail} </td>
                <td class="record"><span class="material-symbols-outlined icon record"> timer </span>${record.record} </td>
                <td class="pace"><span class="material-symbols-outlined icon pace"> speed </span>${paceDetail}</td>
            `;

            row.addEventListener("mouseover", () => {
                const courseType = record.course === "trail" ? "trail" : record.course;
                const trackId = Object.keys(hermes.courseCategories).find((key) => {
                    const category = hermes.courseCategories[key];
                    return (category.type === "trail" && courseType === "trail") || category.course === courseType;
                });
                if (trackId) {
                    const marker = document.querySelector(`#${trackId} .marker[data-year="${record.weekInfo.year}"][data-week="${record.weekInfo.week}"]`);
                    marker?.classList.add("highlight");
                }
            });
            row.addEventListener("mouseout", () => {
                const courseType = record.course === "trail" ? "trail" : record.course;
                const trackId = Object.keys(hermes.courseCategories).find((key) => {
                    const category = hermes.courseCategories[key];
                    return (category.type === "trail" && courseType === "trail") || category.course === courseType;
                });
                if (trackId) {
                    const marker = document.querySelector(`#${trackId} .marker[data-year="${record.weekInfo.year}"][data-week="${record.weekInfo.week}"]`);
                    marker?.classList.remove("highlight");
                }
            });
            tableBody.appendChild(row);
        });
    }

    typeRadios.forEach((radio) => radio.addEventListener("change", filterAndRender));
    courseRadios.forEach((radio) => radio.addEventListener("change", filterAndRender));

    tableHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const sortKey = header.dataset.sort;
            if (!sortKey) return;

            if (currentSort.key === sortKey) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort.key = sortKey;
                currentSort.direction = sortKey === "date" ? "desc" : "asc";
            }
            tableHeaders.forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
            header.classList.add(`sort-${currentSort.direction}`);

            renderTable();
        });
    });

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            document.querySelector('input[name="type"][value="all"]').checked = true;
            document.querySelector('input[name="course"][value="all"]').checked = true;
            setDefaultYearFilter();
            toggleCourseFilter(false);
            currentSort = { key: "date", direction: "desc" };
            tableHeaders.forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
            document.querySelector('th[data-sort="date"]').classList.add("sort-desc");
            filterAndRender();
        });
    }

    setDefaultYearFilter();
    document.querySelector('th[data-sort="date"]').classList.add("sort-desc");
    filterAndRender();
};

hermes.initiate = function () {
    hermes.track();
    hermes.calendar();
    hermes.table();
};

document.addEventListener("DOMContentLoaded", (event) => {
    hermes.initiate();
});
