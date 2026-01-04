hermes.calendar = () => {
    const records = hermes.records.sort((a, b) => new Date(b.date) - new Date(a.date));
    const calendarGrid = document.getElementById("calendar-grid");
    const tooltip = document.getElementById("tooltip");
    const yearFilterContainer = document.getElementById("calendar-year-filter-container");

    if (!records.length) {
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

    const toYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getWeekInfo = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const year = d.getUTCFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        return { weekNo, year };
    };

    const renderCalendar = () => {
        const selectedYear = document.querySelector('input[name="calendar-year"]:checked').value;
        const yearsToRender = selectedYear === 'all' ? allYears : [parseInt(selectedYear)];

        let fullHtml = "";

        yearsToRender.forEach((year) => {
            const yearRecords = records.filter((r) => new Date(r.date).getFullYear() === year);
            if (!yearRecords.length) return;

            fullHtml += `<div class="year-container" id="year-${year}">`;

            let yearTotalDistance = 0;
            let yearRunningDistance = 0;
            let yearElevation = 0;
            let yearTrailElevation = 0;
            yearRecords.forEach((rec) => {
                yearTotalDistance += rec.distance || 0;
                yearElevation += rec.elevation || 0;
                if (rec.type == "trail") {
                    yearTrailElevation += rec.elevation || 0;
                } else {
                    yearRunningDistance += rec.distance || 0;
                }
            });

            const statsHtml = `
                <div class="year-stats">
                    <div class="stat-item">
                        <span class="value">${year}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">거리</span>
                        <span class="value">${yearTotalDistance.toFixed(2)} km</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">러닝 거리</span>
                        <span class="value">${yearRunningDistance.toFixed(2)} km</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">상승고도</span>
                        <span class="value">${
                            yearElevation > 1000 ? (yearElevation / 1000).toFixed(2) + ` <span class="unit">km</span>` : yearElevation.toFixed(0) + ` <span class="unit">m</span>`
                        } </span>
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
                </div>
            `;
            fullHtml += statsHtml;

            fullHtml += `<div class="months-grid">`;

            for (let month = 11; month >= 0; month--) {
                const monthRecords = yearRecords.filter((r) => new Date(r.date).getMonth() === month);
                if (monthRecords.length === 0) continue;

                let monthTableHtml = `<div class="month-table-container"><table>`;
                monthTableHtml += `<thead><tr><th></th><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>`;

                let monthTotalDistance = 0;
                let monthRunningDistance = 0;
                let monthElevation = 0;
                let monthTrailElevation = 0;
                monthRecords.forEach((rec) => {
                    monthTotalDistance += rec.distance || 0;
                    monthElevation += rec.elevation || 0;
                    if (rec.type == "trail") {
                        monthTrailElevation += rec.elevation || 0;
                    } else {
                        monthRunningDistance += rec.distance || 0;
                    }
                });

                const monthStatsHtml = `
                <tr class="month-stats-row">
                    <td colspan="8">
                        <div class="stat-item">
                            <span class="value">${new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month, 1))}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">거리</span>
                            <span class="value">${monthTotalDistance.toFixed(2)} km</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">러닝 거리</span>
                            <span class="value">${monthRunningDistance.toFixed(2)} km</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">상승고도</span>
                            <span class="value">${
                                monthElevation > 1000 ? (monthElevation / 1000).toFixed(2) + ` <span class="unit">km</span>` : monthElevation.toFixed(0) + ` <span class="unit">m</span>`
                            }</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">트레일 상승고도</span>
                            <span class="value">${
                                monthTrailElevation > 1000 ? (monthTrailElevation / 1000).toFixed(2) + ` <span class="unit">km</span>` : monthTrailElevation.toFixed(0) + ` <span class="unit">m</span>`
                            }</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">활동</span>
                            <span class="value">${monthRecords.length}</span>
                        </div>
                    </td>
                </tr>
            `;
                monthTableHtml += monthStatsHtml;

                const firstDateOfMonth = new Date(year, month, 1);
                const lastDateOfMonth = new Date(year, month + 1, 0);

                let currentCalendarSunday = new Date(firstDateOfMonth);
                currentCalendarSunday.setDate(currentCalendarSunday.getDate() - currentCalendarSunday.getDay());

                while (currentCalendarSunday <= lastDateOfMonth) {
                    const thursdayOfCalendarRow = new Date(currentCalendarSunday);
                    thursdayOfCalendarRow.setDate(thursdayOfCalendarRow.getDate() + 4);

                    const { weekNo, year: weekYear } = getWeekInfo(thursdayOfCalendarRow);

                    const mondayOfISOWeek = new Date(thursdayOfCalendarRow);
                    mondayOfISOWeek.setDate(mondayOfISOWeek.getDate() - 3);

                    const sundayOfISOWeek = new Date(mondayOfISOWeek);
                    sundayOfISOWeek.setDate(mondayOfISOWeek.getDate() + 6);

                    let weeklyDistance = 0;
                    let weeklyElevation = 0;

                    for (let d = new Date(mondayOfISOWeek); d <= sundayOfISOWeek; d.setDate(d.getDate() + 1)) {
                        const dateString = toYYYYMMDD(d);
                        if (recordsByDate[dateString]) {
                            recordsByDate[dateString].forEach((rec) => {
                                if (/5k|10k|half|full/.test(rec.course)) {
                                    if (rec.course === "5k") weeklyDistance += 5;
                                    else if (rec.course === "10k") weeklyDistance += 10;
                                    else if (rec.course === "half") weeklyDistance += 21.0975;
                                    else if (rec.course === "full") weeklyDistance += 42.195;
                                } else {
                                    weeklyDistance += rec.distance || 0;
                                }
                                weeklyElevation += rec.elevation || 0;
                            });
                        }
                    }

                    let weekHtml = `<tr>`;
                    weekHtml += `<td class="week-summary y${weekYear.toString().slice(2)} w${weekNo}">
                                    <div class="week-info">w${weekNo}</div>
                                    <div class="week-stats">
                                        <div class="week-distance">${weeklyDistance.toFixed(1)} <span class="unit">km</span></div>
                                        <div class="week-elevation">${
                                            weeklyElevation > 1000 ? (weeklyElevation / 1000).toFixed(1) + ` <span class="unit">km</span>` : weeklyElevation.toFixed(0) + ` <span class="unit">m</span>`
                                        } </div>
                                    </div>
                                 </td>`;

                    for (let i = 0; i < 7; i++) {
                        const day = new Date(currentCalendarSunday);
                        day.setDate(day.getDate() + i);

                        if (day.getMonth() !== month) {
                            weekHtml += `<td class="day-cell hidden"></td>`;
                            continue;
                        }

                        const dateString = toYYYYMMDD(day);
                        const { weekNo: dayWeek, year: dayYear } = getWeekInfo(day);

                        weekHtml += `<td class="day-cell y${dayYear.toString().slice(2)} w${dayWeek}" data-date="${dateString}">
                        <span class="date-display">${day.getDate()}</span>`;

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

                            const radius = Math.sqrt(dailyDistance / maxActivity);

                            let colorIntensity = Math.min(1, (dailyDistance - 5) / (maxActivity * 0.8));

                            const startColor = [0, 77, 64];
                            const endColor = [0, 255, 127];

                            const r = Math.round(startColor[0] * (1 - colorIntensity) + endColor[0] * colorIntensity);
                            const g = Math.round(startColor[1] * (1 - colorIntensity) + endColor[1] * colorIntensity);
                            const b = Math.round(startColor[2] * (1 - colorIntensity) + endColor[2] * colorIntensity);
                            const color = `rgb(${r}, ${g}, ${b})`;

                            const distanceText = dailyDistance > 0 ? `${dailyDistance.toFixed(1)}<span class="unit">km</span>` : "";
                            const elevationText =
                                dailyElevation > 0
                                    ? dailyElevation > 1000
                                        ? `${(dailyElevation / 1000).toFixed(1)}<span class="unit">km</span>`
                                        : `${dailyElevation.toFixed(0)}<span class="unit">m</span>`
                                    : "";

                            weekHtml += `<div class="activity-circle" style="--gg:${radius};">
                                            <svg viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="${color}" />
                                            </svg>
                                         </div>
                                         <div class="activity-stats">
                                            ${distanceText ? `<div class="distance">${distanceText}</div>` : ""}
                                            ${elevationText ? `<div class="elevation">${elevationText}</div>` : ""}
                                         </div>
                                         `;

                            let iconsHtml = '<div class="activity-icons">';
                            recordsByDate[dateString].forEach((rec) => {
                                const iconName = rec.isOfficial ? "emoji_events" : rec.type == "trail" ? "terrain" : "directions_run";
                                const iconClass = rec.isOfficial ? "material-symbols-outlined official-race-icon" : "material-symbols-outlined";
                                iconsHtml += `<i class="${iconClass}">${iconName}</i>`;
                            });
                            iconsHtml += "</div>";
                            weekHtml += iconsHtml;
                        } else {
                            weekHtml += '<div class="activity-icons"><i class="material-symbols-outlined rest"></i></div>';
                        }
                        weekHtml += "</td>";
                    }
                    weekHtml += "</tr>";
                    monthTableHtml += weekHtml;
                    currentCalendarSunday.setDate(currentCalendarSunday.getDate() + 7);
                }
                monthTableHtml += "</tbody></table></div>";
                fullHtml += monthTableHtml;
            }
            fullHtml += `</div></div>`; // Close months-grid and year-container
        });

        calendarGrid.innerHTML = fullHtml;
    };

    calendarGrid.addEventListener("mouseover", (e) => {
        const cell = e.target.closest(".day-cell, .week-summary");
        if (!cell) return;

        const yearClass = Array.from(cell.classList).find(c => /^y\d+/.test(c));
        const weekClass = Array.from(cell.classList).find(c => /^w\d+/.test(c));

        if (yearClass && weekClass) {
            const cellsToHighlight = document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`);
            cellsToHighlight.forEach(c => c.classList.add('on'));
        }

        const date = cell.dataset.date;
        const dayRecords = recordsByDate[date];

        if (dayRecords) {
            tooltip.classList.add("on");
            let tooltipContent = "";
            dayRecords.forEach((rec) => {
                const tooltipPace = `${Math.floor((rec.course === "trail" ? rec.elevation_pace : rec.pace) / 60)}'${Math.floor((rec.course === "trail" ? rec.elevation_pace : rec.pace) % 60)}"${
                    rec.course === "trail" ? '<span class="unit">/60 m↑</span>' : '<span class="unit">/km</span>'
                }`;
                const tooltipDistance = rec.course === "trail" ? `${rec.elevation} <span class="unit">m</span>` : `${rec.distance.toFixed(2)} <span class="unit">km</span>`;
                const tooltip_type = rec.isOfficial ? "공식 대회" : rec.course === "trail" ? "하이킹 / 트레일러닝" : "러닝";
                const tooltip__icon_distance = rec.course === "trail" ? "altitude" : "conversion_path";

                tooltipContent += `
                <div class="tooltip-item">
                    <div class="title-container">
                        <span class="type"> ${tooltip_type} </span>
                        <span class="date">${rec.date}</span>
                        <div class="title">${rec.title} ${rec.isOfficial ? '<span class="material-symbols official"> crown </span>' : ""}</div>
                    </div>
                    <div class="data">
                        <span class="material-symbols-outlined icon distance"> ${tooltip__icon_distance} </span> <span class="distance">${tooltipDistance}</span> |
                        <span class="material-symbols-outlined icon record"> timer </span> <span class="rec">${rec.record}</span> |
                        <span class="material-symbols-outlined icon pace"> speed </span> <span class="pace">${tooltipPace}</span>
                    </div>
                </div>`;
            });

            tooltip.innerHTML = tooltipContent;
        }
    });

    calendarGrid.addEventListener("mouseout", (e) => {
        const cell = e.target.closest(".day-cell, .week-summary");
        if (!cell) return;

        const yearClass = Array.from(cell.classList).find(c => /^y\d+/.test(c));
        const weekClass = Array.from(cell.classList).find(c => /^w\d+/.test(c));

        if (yearClass && weekClass) {
            const cellsToHighlight = document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`);
            cellsToHighlight.forEach(c => c.classList.remove('on'));
        }

        if (tooltip.classList.contains("on")) {
            tooltip.classList.remove("on");
        }
    });

    document.addEventListener("mousemove", (e) => {
        if (tooltip.classList.contains("on")) {
            tooltip.style.left = e.pageX + "px";
            tooltip.style.top = e.pageY + "px";
        }
    });

    // Populate year filter
    allYears.forEach((year) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "calendar-year";
        radio.value = year;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(year));
        yearFilterContainer.appendChild(label);
    });

    document.querySelectorAll('input[name="calendar-year"]').forEach((radio) => {
        radio.addEventListener("change", renderCalendar);
    });

    function setDefaultCalendarYearFilter() {
        const currentYear = new Date().getFullYear().toString();
        const currentYearRadio = document.querySelector(`input[name="calendar-year"][value="${currentYear}"]`);
        if (currentYearRadio) {
            currentYearRadio.checked = true;
        } else {
            // If no records for the current year, check 'all'
            document.querySelector('input[name="calendar-year"][value="all"]').checked = true;
        }
    }
    
    setDefaultCalendarYearFilter();
    renderCalendar();
};
