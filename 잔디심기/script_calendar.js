hermes.calendar = function () {
    const records = hermes_records.sort((a, b) => new Date(b.date) - new Date(a.date));
    const calendarGrid = document.getElementById("calendar-grid");
    const tooltip = document.getElementById("tooltip");
    const loadMoreButton = document.getElementById("load-more-calendar");

    if (!records.length) {
        loadMoreButton.style.display = "none";
        return;
    }

    const recordsByDate = {};
    records.forEach((record) => {
        const date = record.date;
        if (!recordsByDate[date]) {
            recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
    });

    const allYears = [...new Set(records.map((r) => new Date(r.date).getFullYear()))].sort((a, b) => b - a);
    let visibleYearCount = 1;

    let maxActivity = 0;
    Object.values(recordsByDate).forEach((dayRecords) => {
        const dailyDistance = dayRecords.reduce((sum, rec) => {
            if (/5k|10k|half|full/.test(rec.course)) {
                if (rec.course === "5k") return sum + 5;
                if (rec.course === "10k") return sum + 10;
                if (rec.course === "half") return sum + 21.0975;
                if (rec.course === "full") return sum + 42.195;
            }
            return sum + (rec.distance || 0);
        }, 0);
        if (dailyDistance > maxActivity) {
            maxActivity = dailyDistance;
        }
    });

    const renderCalendar = () => {
        const visibleYears = allYears.slice(0, visibleYearCount);
        let fullHtml = "";

        visibleYears.forEach((year) => {
            const yearRecords = records.filter((r) => new Date(r.date).getFullYear() === year);
            if (!yearRecords.length) return;

            let yearTotalDistance = 0;
            let yearRunningDistance = 0;
            let yearTrailElevation = 0;
            yearRecords.forEach((rec) => {
                yearTotalDistance += rec.distance || 0;
                if (rec.elevation > 0) {
                    yearTrailElevation += rec.elevation || 0;
                } else {
                    yearRunningDistance += rec.distance || 0;
                }
            });

            const statsHtml = `
                <tr class="year-stats-row">
                    <th colspan="8">
                        <div class="stat-item">
                            <span class="label">거리</span>
                            <span class="value">${yearTotalDistance.toFixed(2)} km</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">러닝 거리</span>
                            <span class="value">${yearRunningDistance.toFixed(2)} km</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">트레일 상승고도</span>
                            <span class="value">${
                                yearTrailElevation > 1000 ? (yearTrailElevation / 1000).toFixed(2) + ` <span class="unit">km</span>` : yearTrailElevation.toFixed(0) + ` <span class="unit">m</span>`
                            } </span>
                        </div>
                        <div class="stat-item">
                            <span class="label">활동</span>
                            <span class="value">${yearRecords.length}</span>
                        </div>
                    </th>
                </tr>
            `;

            const newestDate = new Date(yearRecords[0].date);
            const oldestDate = new Date(yearRecords[yearRecords.length - 1].date);

            let html = "<table><thead>";
            html += `<tr><th class="year">${year}</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>
            ${statsHtml}
            </thead>
            <tbody>`;

            let weekRows = [];
            let lastYear = null;

            let currentSunday = new Date(newestDate);
            if (currentSunday.getDay() !== 0) {
                currentSunday.setDate(currentSunday.getDate() + (7 - currentSunday.getDay()));
            }

            let oldestMonday = new Date(oldestDate);
            let dayOfWeek = oldestMonday.getDay();
            let offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            oldestMonday.setDate(oldestMonday.getDate() - offset);

            const getWeekInfo = (d) => {
                d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
                const year = d.getUTCFullYear();
                const yearStart = new Date(Date.UTC(year, 0, 1));
                const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
                return { weekNo, year };
            };

            const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

            while (currentSunday >= oldestMonday) {
                let weeklyDistance = 0;
                let weeklyElevation = 0;
                let hasActivity = false;

                const startOfWeek = new Date(currentSunday);
                startOfWeek.setDate(startOfWeek.getDate() - 6);

                for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    const dateString = day.toISOString().split("T")[0];
                    if (recordsByDate[dateString]) {
                        hasActivity = true;
                        recordsByDate[dateString].forEach((rec) => {
                            weeklyDistance += rec.distance || 0;
                            weeklyElevation += rec.elevation || 0;
                        });
                    }
                }

                let weekHtml = `<tr class="${hasActivity ? "" : "empty-week"}">`;

                const { weekNo, year: weekYear } = getWeekInfo(startOfWeek);
                let yearPrefix = "";
                if (lastYear !== weekYear) {
                    yearPrefix = weekYear + " ";
                    lastYear = weekYear;
                }

                const startMonth = monthFormatter.format(startOfWeek) + ".";
                const startDay = startOfWeek.getDate();
                const endMonth = monthFormatter.format(currentSunday) + ".";
                const endDay = currentSunday.getDate();

                let dateRange;
                if (startMonth === endMonth) {
                    dateRange = `${startMonth} ${startDay} – ${endDay}`;
                } else {
                    dateRange = `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
                }

                const weekInfo = `${yearPrefix}w${weekNo} <br> ${dateRange}`;

                weekHtml += `<td class="week-summary">
                            <div class="week-info">${weekInfo}</div>
                            <div class="week-stats">
                                <div class="week-distance">${weeklyDistance.toFixed(2)} <span class="unit">km</span></div>
                                <div class="week-elevation">${
                                    weeklyElevation > 1000 ? (weeklyElevation / 1000).toFixed(2) + ` <span class="unit">km</span>` : weeklyElevation.toFixed(0) + ` <span class="unit">m</span>`
                                } </div>
                            </div>
                         </td>`;

                for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    const dateString = day.toISOString().split("T")[0];

                    weekHtml += `<td class="day-cell" data-date="${dateString}">`;

                    if (recordsByDate[dateString]) {
                        let dailyDistance = 0;
                        let dailyElevation = 0;
                        recordsByDate[dateString].forEach((rec) => {
                            if (/5k|10k|half|full/.test(rec.course)) {
                                if (rec.course === "5k") dailyDistance += 5;
                                if (rec.course === "10k") dailyDistance += 10;
                                if (rec.course === "half") dailyDistance += 21.0975;
                                if (rec.course === "full") dailyDistance += 42.195;
                            } else {
                                dailyDistance += rec.distance || 0;
                            }
                            dailyElevation += rec.elevation || 0;
                        });

                        const radius = Math.min(45, (dailyDistance / maxActivity) * 45 * 2);

                        let colorIntensity = Math.min(1, (dailyDistance - 5) / maxActivity);

                        const startColor = [0, 77, 64]; // Darkest color
                        const endColor = [0, 255, 127]; // Brightest color

                        const r = Math.round(startColor[0] * (1 - colorIntensity) + endColor[0] * colorIntensity);
                        const g = Math.round(startColor[1] * (1 - colorIntensity) + endColor[1] * colorIntensity);
                        const b = Math.round(startColor[2] * (1 - colorIntensity) + endColor[2] * colorIntensity);
                        const color = `rgb(${r}, ${g}, ${b})`;

                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        const textColor = luminance > 128 ? "#000000" : "#FFFFFF";

                        const showUnit = radius > 30;
                        const distanceUnit = showUnit ? " km" : "";
                        const elevationUnit = showUnit ? (dailyElevation > 1000 ? " km" : " m") : "";

                        const distanceText = dailyDistance > 0 ? `${dailyDistance.toFixed(1)}${distanceUnit}` : "";
                        const elevationText =
                            dailyElevation > 0 ? (dailyElevation > 1000 ? `${(dailyElevation / 1000).toFixed(1)}${elevationUnit}` : `${dailyElevation.toFixed(0)}${elevationUnit}`) : "";

                        let textContent = "";
                        const textAttributes = `class="date-in-circle" fill="${textColor}" text-anchor="middle" dominant-baseline="central"`;

                        if (radius > 15) {
                            if (elevationText && distanceText) {
                                textContent = `
                                <text x="50%" y="50%" ${textAttributes}>
                                    <tspan x="50%" dy="-0.6em">${distanceText}</tspan>
                                    <tspan x="50%" dy="1.2em">${elevationText}</tspan>
                                </text>
                            `;
                            } else if (distanceText) {
                                textContent = `<text x="50%" y="50%" ${textAttributes}>${distanceText}</text>`;
                            } else if (elevationText) {
                                textContent = `<text x="50%" y="50%" ${textAttributes}>${elevationText}</text>`;
                            }
                        }

                        weekHtml += `<svg class="activity-circle" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="${radius}" fill="${color}" />
                                        ${textContent}
                                     </svg>`;

                        let iconsHtml = '<div class="activity-icons">';
                        recordsByDate[dateString].forEach((rec) => {
                            const isOfficialRace = /5k|10k|half|full/.test(rec.course);
                            const iconName = isOfficialRace ? "emoji_events" : rec.elevation > 0 ? "terrain" : "directions_run";
                            const iconClass = isOfficialRace ? "material-symbols-outlined official-race-icon" : "material-symbols-outlined";
                            iconsHtml += `<i class="${iconClass}">${iconName}</i>`;
                        });
                        iconsHtml += "</div>";
                        weekHtml += iconsHtml;
                    } else {
                        weekHtml += '<div class="activity-icons"><span class="rest">rest</span></div>';
                        // weekHtml += '<div class="activity-icons"><i class="material-symbols-outlined rest">heart_plus</i></div>';
                    }
                    weekHtml += "</td>";
                }

                weekHtml += "</tr>";
                weekRows.push(weekHtml);

                currentSunday.setDate(currentSunday.getDate() - 7);
            }

            html += weekRows.join("");
            html += "</tbody></table>";
            fullHtml += html;
        });

        calendarGrid.innerHTML = fullHtml;

        if (visibleYearCount >= allYears.length) {
            loadMoreButton.style.display = "none";
        } else {
            loadMoreButton.style.display = "block";
        }
    };

    loadMoreButton.addEventListener("click", () => {
        visibleYearCount++;
        renderCalendar();
    });

    calendarGrid.addEventListener("mouseover", (e) => {
        const cell = e.target.closest(".day-cell");
        if (!cell) return;

        const date = cell.dataset.date;
        const dayRecords = recordsByDate[date];

        if (dayRecords) {
            tooltip.classList.add("on");
            let tooltipContent = "";
            dayRecords.forEach((rec) => {
                const type = rec.elevation > 0 ? "trail" : "run";
                const title = rec.title;
                const distance = rec.distance ? `<span class="icon distance"></span>${rec.distance.toFixed(2)}<span class="unit">km</span>` : "";
                const elevation = rec.elevation ? `<span class="icon elevation"></span>${rec.elevation}<span class="unit">m</span>` : "";
                tooltipContent += `<div class="tooltip-item">
                                       <div class="type">${type}</div>
                                       <div class="title">${title}</div>
                                       <div class="data">${distance} ${elevation}</div>
                                   </div>`;
            });
            tooltip.innerHTML = tooltipContent;
        }
    });

    calendarGrid.addEventListener("mouseout", (e) => {
        const cell = e.target.closest(".day-cell");
        if (cell && tooltip.classList.contains("on")) {
            tooltip.classList.remove("on");
        }
    });

    document.addEventListener("mousemove", (e) => {
        if (tooltip.classList.contains("on")) {
            tooltip.style.left = e.pageX + "px";
            tooltip.style.top = e.pageY + "px";
        }
    });

    renderCalendar();
};
