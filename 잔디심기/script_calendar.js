hermes.calendar = () => {
    const records = hermes.records.sort((a, b) => new Date(b.date) - new Date(a.date));
    const calendarGrid = document.getElementById("calendar-grid");
    const tooltip = document.getElementById("tooltip");
    const yearFilterContainer = document.getElementById("calendar-year-filter-container");
    const recordYearFilterContainer = document.getElementById("year-filter-container");
    const calendarViewFilterContainer = document.getElementById("calendar-view-filter-container");

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
        const dailyDistance = dayRecords.reduce((sum, rec) => sum + (rec.distance || 0), 0);
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
        const selectedValue = document.querySelector('input[name="calendar-year"]:checked').value;
        const calendarView = document.querySelector('input[name="calendar-view"]:checked').value;

        calendarGrid.classList.toggle("compact", calendarView === "compact");

        let yearsToRender;
        let monthsToRender;
        const today = new Date();

        if (selectedValue === "recent") {
            yearsToRender = [today.getFullYear()];
            monthsToRender = [today.getMonth()];
        } else if (selectedValue === "all") {
            yearsToRender = allYears;
            monthsToRender = Array.from({ length: 12 }, (_, i) => i);
        } else {
            yearsToRender = [parseInt(selectedValue)];
            monthsToRender = Array.from({ length: 12 }, (_, i) => i);
        }

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
                        <span class="label">러닝 거리</span>
                        <span class="value">${yearRunningDistance.toFixed(1)} <span class="unit"> km</span></span>
                    </div>
                    <div class="stat-item">
                        <span class="label">거리</span>
                        <span class="value">${yearTotalDistance.toFixed(1)} <span class="unit"> km</span></span>
                    </div>
                    <div class="stat-item">
                        <span class="label">트레일 상승고도</span>
                        <span class="value">${
                            yearTrailElevation > 1000 ? (yearTrailElevation / 1000).toFixed(1) + ` <span class="unit">km</span>` : yearTrailElevation.toFixed(0) + ` <span class="unit">m</span>`
                        } </span>
                    </div>
                    <div class="stat-item">
                        <span class="label">상승고도</span>
                        <span class="value">${
                            yearElevation > 1000 ? (yearElevation / 1000).toFixed(1) + ` <span class="unit">km</span>` : yearElevation.toFixed(0) + ` <span class="unit">m</span>`
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

            monthsToRender
                .slice()
                .reverse()
                .forEach((month) => {
                    const monthRecords = yearRecords.filter((r) => new Date(r.date).getMonth() === month);
                    if (monthRecords.length === 0 && selectedValue !== "recent") return;

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
                                    <span class="label">러닝 거리</span>
                                    <span class="value">${monthRunningDistance.toFixed(1)} <span class="unit"> km</span></span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">거리</span>
                                    <span class="value">${monthTotalDistance.toFixed(1)} <span class="unit"> km</span></span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">트레일 상승고도</span>
                                    <span class="value">${
                                        monthTrailElevation > 1000
                                            ? (monthTrailElevation / 1000).toFixed(1) + ` <span class="unit"> km</span>`
                                            : monthTrailElevation.toFixed(0) + ` <span class="unit">m</span>`
                                    }</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">상승고도</span>
                                    <span class="value">${
                                        monthElevation > 1000 ? (monthElevation / 1000).toFixed(1) + ` <span class="unit"> km</span>` : monthElevation.toFixed(0) + ` <span class="unit">m</span>`
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

                        let weeklyRunningDistance = 0;
                        let weeklyTrailElevation = 0;

                        for (let d = new Date(mondayOfISOWeek); d <= sundayOfISOWeek; d.setDate(d.getDate() + 1)) {
                            const dateString = toYYYYMMDD(d);
                            if (recordsByDate[dateString]) {
                                recordsByDate[dateString].forEach((rec) => {
                                    if (rec.type === "trail") {
                                        weeklyTrailElevation += rec.elevation || 0;
                                    } else {
                                        weeklyRunningDistance += rec.distance || 0;
                                    }
                                });
                            }
                        }

                        let weekHtml = `<tr>`;
                        weekHtml += `<td class="week-summary y${weekYear.toString().slice(2)} w${weekNo}">
                                    <div class="week-info">w${weekNo}</div>
                                        <div class="week-stats">
                                            <div class="week-distance">${weeklyRunningDistance.toFixed(1)} <span class="unit"> km</span></div>
                                            <div class="week-elevation">${
                                                weeklyTrailElevation > 1000
                                                    ? (weeklyTrailElevation / 1000).toFixed(1) + ` <span class="unit"> km</span>`
                                                    : weeklyTrailElevation.toFixed(0) + ` <span class="unit"> m</span>`
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
                            const isOfficial = recordsByDate[dateString] && recordsByDate[dateString].length > 0 ? recordsByDate[dateString][0].isOfficial : null; // 공식인지 확인
                            const certiUrl = isOfficial ? recordsByDate[dateString][0].certi : null;

                            weekHtml += `<td 
                                            class="day-cell y${dayYear.toString().slice(2)} w${dayWeek} ${isOfficial ? "official" : ""}" 
                                            data-date="${dateString}"
                                            data-certi="${certiUrl}"
                                        >
                                        <span class="date-display">${day.getDate()}</span>`;

                            if (recordsByDate[dateString]) {
                                let dailyDistance = 0;
                                let dailyElevation = 0;
                                recordsByDate[dateString].forEach((rec) => {
                                    dailyDistance += rec.distance || 0;
                                    dailyElevation += rec.elevation || 0;
                                });

                                const radius = Math.sqrt(dailyDistance / maxActivity);
                                const color = `#00b264`;

                                const distanceText = dailyDistance > 0 ? `${dailyDistance.toFixed(1)}<span class="unit"> km</span>` : "";
                                const elevationText =
                                    dailyElevation > 0
                                        ? dailyElevation > 1000
                                            ? `${(dailyElevation / 1000).toFixed(1)}<span class="unit"> km</span>`
                                            : `${dailyElevation.toFixed(0)}<span class="unit"> m</span>`
                                        : "";

                                weekHtml += `<div class="activity-circle" style="--gg:${radius};">
                                            <svg viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="${color}" />
                                            </svg>
                                        </div>
                                        <div class="activity-stats">
                                            ${distanceText ? `<div class="distance">${distanceText}</div>` : ""}
                                            ${elevationText ? `<div class="elevation">${elevationText}</div>` : ""}
                                        </div>`;

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
                });
            fullHtml += `</div></div>`; // Close months-grid and year-container
        });

        calendarGrid.innerHTML = fullHtml;

        // 마우스오버 이벤트 처리
        const dayCells = document.querySelectorAll(".day-cell");
        dayCells.forEach((cell) => {
            cell.addEventListener("mouseenter", (e) => {
                // 주간 하이라이트 로직
                const targetCell = e.currentTarget;
                const yearClass = Array.from(targetCell.classList).find((c) => /^y\d+/.test(c));
                const weekClass = Array.from(targetCell.classList).find((c) => /^w\d+/.test(c));

                if (yearClass && weekClass) {
                    const cellsToHighlight = document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`);

                    cellsToHighlight.forEach((c) => c.classList.add("on"));
                }

                // 툴팁 표시 로직
                const date = targetCell.dataset.date;
                const dayRecords = recordsByDate[date];

                if (dayRecords) {
                    tooltip.innerHTML = hermes.tooltip(dayRecords);
                    tooltip.classList.add("on");
                }
            });

            // 마우스아웃 이벤트 처리
            cell.addEventListener("mouseleave", (e) => {
                const targetCell = e.currentTarget;
                const yearClass = Array.from(targetCell.classList).find((c) => /^y\d+/.test(c));
                const weekClass = Array.from(targetCell.classList).find((c) => /^w\d+/.test(c));

                if (yearClass && weekClass) {
                    const cellsToHighlight = document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`);
                    cellsToHighlight.forEach((c) => c.classList.remove("on"));
                }

                // 툴팁 숨김 로직
                if (tooltip.classList.contains("on")) {
                    tooltip.classList.remove("on");
                }
            });

            // 클릭 이벤트 처리
            calendarGrid.addEventListener("click", (e) => {
                // 클릭한 요소가 '.official-day' 클래스를 가진 셀인지 확인
                const cell = e.target.closest(".day-cell.official");
                // 해당 셀과 데이터 속성이 존재하면 새 탭에서 링크 열기

                if (cell && cell.dataset.certi) {
                    window.open(cell.dataset.certi, "_blank");
                }
            });
        });
    };

    document.addEventListener("mousemove", (e) => {
        if (tooltip.classList.contains("on")) {
            tooltip.style.left = e.pageX + "px";
            tooltip.style.top = e.pageY + "px";
        }
    });

    // Populate year filter
    allYears.forEach((year) => {
        const calendarLabel = document.createElement("label");
        const calendarRadio = document.createElement("input");
        calendarRadio.type = "radio";
        calendarRadio.name = "calendar-year";
        calendarRadio.value = year;
        calendarLabel.appendChild(calendarRadio);
        calendarLabel.appendChild(document.createTextNode(year));
        yearFilterContainer.appendChild(calendarLabel);

        const recordLabel = document.createElement("label");
        const recordRadio = document.createElement("input");
        recordRadio.type = "radio";
        recordRadio.name = "year";
        recordRadio.value = year;
        recordLabel.appendChild(recordRadio);
        recordLabel.appendChild(document.createTextNode(year));
        recordYearFilterContainer.appendChild(recordLabel);
    });

    let isSyncingFilters = false; // 필터 동기화 중복 실행 방지용 '가드' 변수

    const handleYearFilterChange = (e) => {
        if (isSyncingFilters) return; // 동기화 작업 중이면 함수 실행 방지

        isSyncingFilters = true; // 동기화 시작
        const selectedValue = e.target.value;
        const sourceName = e.target.name;

        // calendar-year 필터 상태 동기화
        if (sourceName !== "calendar-year") {
            document.querySelectorAll('input[name="calendar-year"]').forEach((radio) => {
                radio.checked = radio.value === selectedValue;
            });
        }

        // year(기록 테이블) 필터 상태 동기화 및 이벤트 강제 발생
        if (sourceName !== "year") {
            document.querySelectorAll('input[name="year"]').forEach((radio) => {
                if (radio.value === selectedValue) {
                    radio.checked = true;
                    // script.js의 이벤트 리스너를 강제로 실행
                    radio.dispatchEvent(new Event("change"));
                }
            });
        }

        // 캘린더 뷰 모드 자동 변경
        if (selectedValue === "recent") {
            document.querySelector('input[name="calendar-view"][value="normal"]').checked = true;
        } else {
            document.querySelector('input[name="calendar-view"][value="compact"]').checked = true;
        }

        renderCalendar();

        // 비동기적으로 가드 변수를 리셋하여 다음 사용자 입력에 대비
        setTimeout(() => {
            isSyncingFilters = false;
        }, 0);
    };

    // 각 필터 그룹에 이벤트 리스너 등록
    document.querySelectorAll('input[name="calendar-year"], input[name="year"]').forEach((radio) => {
        radio.addEventListener("change", handleYearFilterChange);
    });

    calendarViewFilterContainer.addEventListener("change", renderCalendar);

    function setDefaultCalendarYearFilter() {
        const recentRadio = document.querySelector('input[name="calendar-year"][value="recent"]');
        if (recentRadio) {
            recentRadio.checked = true;
            handleYearFilterChange({ target: recentRadio });
        }
    }

    setDefaultCalendarYearFilter();
};
