// hermes.calendar: 캘린더 UI를 생성하고 관리하는 메인 함수
hermes.calendar = () => {
    // 필요한 DOM 요소들을 가져옵니다.
    const calendarGrid = document.getElementById("calendar-grid");
    const tooltip = document.getElementById("tooltip");
    const yearFilterContainer = document.getElementById("calendar-year-filter-container");
    const recordYearFilterContainer = document.getElementById("year-filter-container");
    const calendarViewFilterContainer = document.getElementById("calendar-view-filter-container");

    // 기록 데이터를 날짜 역순으로 정렬합니다.
    const records = hermes.records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 기록이 없으면 함수를 종료합니다.
    if (!records.length) {
        return;
    }

    // 기록을 날짜별로 그룹화하여 쉽게 찾아볼 수 있도록 합니다.
    const recordsByDate = {};
    records.forEach((record) => {
        const date = record.date;
        if (!recordsByDate[date]) {
            recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
    });

    // 기록에서 중복 없는 연도를 추출하고 정렬합니다.
    const allYears = [...new Set(records.map((r) => new Date(r.date).getFullYear()))].sort((a, b) => b - a);

    // 시각화 스케일링을 위해 하루 최대 활동량(거리)을 계산합니다.
    let maxActivity = 0;
    Object.values(recordsByDate).forEach((dayRecords) => {
        const dailyDistance = dayRecords.reduce((sum, rec) => sum + (rec.distance || 0), 0);
        if (dailyDistance > maxActivity) {
            maxActivity = dailyDistance;
        }
    });

    // Date 객체를 'YYYY-MM-DD' 형식으로 변환하는 헬퍼 함수
    const toYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // 주어진 날짜의 ISO 8601 주차와 연도를 반환하는 헬퍼 함수
    const getWeekInfo = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const year = d.getUTCFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        return { weekNo, year };
    };

    // 캘린더 그리드를 렌더링하는 메인 함수
    const renderCalendar = () => {
        // 현재 필터 값을 가져옵니다.
        const selectedValue = document.querySelector('input[name="calendar-year"]:checked').value;
        const calendarView = document.querySelector('input[name="calendar-view"]:checked').value;

        calendarGrid.classList.toggle("compact", calendarView === "compact");

        let yearsToRender;
        let monthsToRender;
        const today = new Date();

        // 필터에 따라 렌더링할 연도와 월을 결정합니다.
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

        let fullHtml = ""; // 전체 캘린더 HTML을 저장할 변수

        // 연도별로 캘린더 구조를 만듭니다.
        yearsToRender.forEach((year) => {
            const yearRecords = records.filter((r) => new Date(r.date).getFullYear() === year);
            if (!yearRecords.length) return;

            fullHtml += `<div class="year-container" id="year-${year}">`;

            // 연간 통계 계산 및 HTML 생성
            let yearTotalDistance = 0, yearRunningDistance = 0, yearElevation = 0, yearTrailElevation = 0;
            yearRecords.forEach((rec) => {
                yearTotalDistance += rec.distance || 0;
                yearElevation += rec.elevation || 0;
                if (rec.type == "trail") {
                    yearTrailElevation += rec.elevation || 0;
                } else if (rec.type == "run") {
                    yearRunningDistance += rec.distance || 0;
                }
            });

            const statsHtml = `
                <div class="year-stats">
                    <div class="stat-item"><span class="value">${year}</span></div>
                    <div class="stat-item"><span class="label">러닝 거리</span><span class="value">${yearRunningDistance.toFixed(1)} <span class="unit"> km</span></span></div>
                    <div class="stat-item"><span class="label">거리</span><span class="value">${yearTotalDistance.toFixed(1)} <span class="unit"> km</span></span></div>
                    <div class="stat-item"><span class="label">트레일 상승고도</span><span class="value">${yearTrailElevation > 1000 ? (yearTrailElevation / 1000).toFixed(1) + ` <span class="unit">km</span>` : yearTrailElevation.toFixed(0) + ` <span class="unit">m</span>`} </span></div>
                    <div class="stat-item"><span class="label">상승고도</span><span class="value">${yearElevation > 1000 ? (yearElevation / 1000).toFixed(1) + ` <span class="unit">km</span>` : yearElevation.toFixed(0) + ` <span class="unit">m</span>`} </span></div>
                    <div class="stat-item"><span class="label">활동</span><span class="value">${yearRecords.length}</span></div>
                </div>
            `;
            fullHtml += statsHtml;


            fullHtml += `<div class="months-grid">`;

            // 월별로 (역순으로) 캘린더 테이블을 생성합니다.
            monthsToRender.slice().reverse().forEach((month) => {
                const monthRecords = yearRecords.filter((r) => new Date(r.date).getMonth() === month);
                if (monthRecords.length === 0 && selectedValue !== "recent") return;

                let monthTableHtml = `<div class="month-table-container"><table>`;
                monthTableHtml += `<thead><tr><th></th><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>`;

                let monthTotalDistance = 0, monthRunningDistance = 0, monthElevation = 0, monthTrailElevation = 0;
                monthRecords.forEach((rec) => {
                    monthTotalDistance += rec.distance || 0;
                    monthElevation += rec.elevation || 0;
                    if (rec.type == "trail") {
                        monthTrailElevation += rec.elevation || 0;
                    } else if (rec.type === "run") {
                        monthRunningDistance += rec.distance || 0;
                    }
                });

                const monthStatsHtml = `
                    <tr class="month-stats-row">
                        <td colspan="8">
                            <div class="month-stats">
                                <div class="stat-item"><span class="value">${new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month, 1))}</span></div>
                                <div class="stat-item"><span class="label">러닝 거리</span><span class="value">${monthRunningDistance.toFixed(1)} <span class="unit"> km</span></span></div>
                                <div class="stat-item"><span class="label">거리</span><span class="value">${monthTotalDistance.toFixed(1)} <span class="unit"> km</span></span></div>
                                <div class="stat-item"><span class="label">트레일 상승고도</span><span class="value">${monthTrailElevation > 1000 ? (monthTrailElevation / 1000).toFixed(1) + ` <span class="unit"> km</span>` : monthTrailElevation.toFixed(0) + ` <span class="unit">m</span>`}</span></div>
                                <div class="stat-item"><span class="label">상승고도</span><span class="value">${monthElevation > 1000 ? (monthElevation / 1000).toFixed(1) + ` <span class="unit"> km</span>` : monthElevation.toFixed(0) + ` <span class="unit">m</span>`}</span></div>
                                <div class="stat-item"><span class="label">활동</span><span class="value">${monthRecords.length}</span></div>
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

                    // --- 주간 통계 계산 로직 수정 --- //
                    let weeklyDistance = 0, weeklyRunningDistance = 0, weeklyElevation = 0, weeklyTrailElevation = 0;

                    for (let d = new Date(mondayOfISOWeek); d <= sundayOfISOWeek; d.setDate(d.getDate() + 1)) {
                        const dateString = toYYYYMMDD(d);
                        if (recordsByDate[dateString]) {
                            recordsByDate[dateString].forEach((rec) => {
                                weeklyDistance += rec.distance || 0;
                                weeklyElevation += rec.elevation || 0;
                                if (rec.type === "trail") {
                                    weeklyTrailElevation += rec.elevation || 0;
                                } else if (rec.type === "run") {
                                    weeklyRunningDistance += rec.distance || 0;
                                }
                            });
                        }
                    }
                    // --- 주간 통계 계산 로직 끝 --- //

                    // --- 주간 통계 HTML 출력 수정 --- //
                    const weeklyDistanceHTML =  `${weeklyRunningDistance.toFixed(1)} <span class="unit">km</span>` ;
                    const weeklyTotalDistanceHTML =  `${weeklyDistance.toFixed(1)} <span class="unit">km</span>`;
                    
                    const weeklyElevationHTML = `${weeklyTrailElevation > 1000 ? (weeklyTrailElevation/1000).toFixed(1) + `<span class="unit">km</span>` : weeklyTrailElevation.toFixed(0) + `<span class="unit">m</span>`}` ;
                    const weeklyTotalElevationHTML = `${weeklyElevation > 1000 ? (weeklyElevation/1000).toFixed(1) + `<span class="unit">km</span>` : weeklyElevation.toFixed(0) + `<span class="unit">m</span>`}` ;

                    let weekHtml = `<tr>`;
                    weekHtml += `<td class="week-summary y${weekYear.toString().slice(2)} w${weekNo}">
                        <div class="week-info">w${weekNo}</div>
                        <div class="week-stats">
                            <div class="week-distance main">${weeklyDistanceHTML} </div>
                            <div class="week-distance-total replace">${weeklyTotalDistanceHTML}</div>
                            <div class="week-elevation main">${weeklyElevationHTML} </div>
                            <div class="week-elevation-total replace"> ${weeklyTotalElevationHTML}</div>
                        </div>
                    </td>`;
                    // --- 주간 통계 HTML 출력 끝 --- //

                    for (let i = 0; i < 7; i++) {
                        const day = new Date(currentCalendarSunday);
                        day.setDate(day.getDate() + i);

                        if (day.getMonth() !== month) {
                            weekHtml += `<td class="day-cell hidden"></td>`;
                            continue;
                        }

                        const dateString = toYYYYMMDD(day);
                        const { weekNo: dayWeek, year: dayYear } = getWeekInfo(day);
                        const isOfficial = recordsByDate[dateString] && recordsByDate[dateString].length > 0 ? recordsByDate[dateString][0].isOfficial : null;
                        const certiUrl = isOfficial ? recordsByDate[dateString][0].certi : null;

                        weekHtml += `<td class="day-cell y${dayYear.toString().slice(2)} w${dayWeek} ${isOfficial ? "official" : ""}" data-date="${dateString}" data-certi="${certiUrl}"><span class="date-display">${day.getDate()}</span>`;

                        if (recordsByDate[dateString]) {
                            const dayRecords = recordsByDate[dateString];
                            let dailyDistance = 0,
                                dailyElevation = 0;
                            dayRecords.forEach((rec) => {
                                dailyDistance += rec.distance || 0;
                                dailyElevation += rec.elevation || 0;
                            });
                        
                            const radius = Math.sqrt(dailyDistance / maxActivity);
                            const distanceText = dailyDistance > 0 ? `${dailyDistance.toFixed(1)}<span class="unit"> km</span>` : "";
                            const elevationText = dailyElevation > 0 ? (dailyElevation > 1000 ? `${(dailyElevation / 1000).toFixed(1)}<span class="unit"> km</span>` : `${dailyElevation.toFixed(0)}<span class="unit"> m</span>`) : "";
                        
                            let svgContent = '';
                            if (dailyDistance > 0) {
                                if (dayRecords.length === 1) {
                                    const record = dayRecords[0];
                                    // 1. circle에 record.type을 클래스로 부여합니다.
                                    svgContent = `<circle class="${record.type}" cx="50" cy="50" r="45" fill="#00b264" />`;
                                } else if (dayRecords.length > 1) {
                                    // 2. 여러 활동이 있으면 파이 차트를 생성합니다.
                                    let startAngle = -Math.PI / 2; // -90도, 위쪽에서 시작
                                    dayRecords.forEach(rec => {
                                        if (!rec.distance || rec.distance <= 0) return;
                        
                                        const sliceRatio = rec.distance / dailyDistance;
                                        const sliceAngle = sliceRatio * 2 * Math.PI;
                                        const endAngle = startAngle - sliceAngle;
                        
                                        const startX = 50 + 45 * Math.cos(startAngle);
                                        const startY = 50 + 45 * Math.sin(startAngle);
                        
                                        const endX = 50 + 45 * Math.cos(endAngle);
                                        const endY = 50 + 45 * Math.sin(endAngle);
                        
                                        // 조각이 180도보다 크면 large-arc-flag를 1로 설정
                                        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                        
                                        const pathData = `M 50,50 L ${startX},${startY} A 45,45 0 ${largeArcFlag} 0 ${endX},${endY} Z`;
                        
                                        // 각 path에도 record.type을 클래스로 부여합니다.
                                        // stroke-linejoin="round"는 파이 차트 중앙의 모서리를 부드럽게 처리합니다.
                                        svgContent += `<path class="${rec.type}" d="${pathData}" stroke-linejoin="round"/>`;
                        
                                        startAngle = endAngle;
                                    });
                                }
                        
                            weekHtml += `<div class="activity-circle" style="--gg:${radius};"><svg viewBox="0 0 100 100">${svgContent}</svg></div>
                            <div class="activity-stats">
                            ${elevationText ? `<div class="elevation">${elevationText}</div>` : ""}
                            ${distanceText ? `<div class="distance">${distanceText}</div>` : ""}
                            </div>`;
                        }
                        

                            let iconsHtml = '<div class="activity-icons">';
                            recordsByDate[dateString].forEach((rec) => {
                                const iconName = rec.isOfficial ? "emoji_events" : rec.type == "trail" ? "terrain" : rec.type == "walk" ? "directions_walk" : "directions_run";
                                const iconClass = rec.isOfficial ? "material-symbols official-race-icon" : "material-symbols-outlined";
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

            fullHtml += `</div></div>`;
        });

        calendarGrid.innerHTML = fullHtml; // 생성된 HTML을 그리드에 삽입합니다.

        // 각 날짜 셀에 마우스 이벤트를 추가하여 툴팁과 하이라이트를 제어합니다.
        const dayCells = document.querySelectorAll(".day-cell, .week-summary");
        dayCells.forEach((cell) => {
            cell.addEventListener("mouseenter", (e) => {
                // 주간 하이라이트 및 툴팁 표시 로직
                const targetCell = e.currentTarget;
                const yearClass = Array.from(targetCell.classList).find((c) => /^y\d+/.test(c));
                const weekClass = Array.from(targetCell.classList).find((c) => /^w\d+/.test(c));

                if (yearClass && weekClass) {
                    document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`).forEach((c) => c.classList.add("on"));
                }

                const date = targetCell.dataset.date;
                if(date) {
                    const dayRecords = recordsByDate[date];
    
                    if (dayRecords) {
                        tooltip.innerHTML = hermes.tooltip(dayRecords);
                        tooltip.classList.add("on");
                    }
                }
            });

            cell.addEventListener("mouseleave", (e) => {
                // 주간 하이라이트 해제 및 툴팁 숨김 로직
                const targetCell = e.currentTarget;
                const yearClass = Array.from(targetCell.classList).find((c) => /^y\d+/.test(c));
                const weekClass = Array.from(targetCell.classList).find((c) => /^w\d+/.test(c));

                if (yearClass && weekClass) {
                    document.querySelectorAll(`#calendar-grid .${yearClass}.${weekClass}`).forEach((c) => c.classList.remove("on"));
                }

                if (tooltip.classList.contains("on")) {
                    tooltip.classList.remove("on");
                }
            });
        });
    };

    calendarGrid.addEventListener("click", (e) => {
        const cell = e.target.closest(".day-cell.official");
        if (cell && cell.dataset.certi && cell.dataset.certi !== 'null') {
            window.open(cell.dataset.certi, "_blank");
        }
    });

    // 툴팁 위치를 마우스 커서에 따라 업데이트합니다.
    document.addEventListener("mousemove", (e) => {
        if (tooltip.classList.contains("on")) {
            tooltip.style.left = e.pageX + "px";
            tooltip.style.top = e.pageY + "px";
        }
    });

    // 연도 필터 옵션을 동적으로 생성합니다.
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

    let isSyncingFilters = false; // 필터 동기화 중복 실행을 방지하기 위한 플래그

    // 연도 필터 변경을 처리하는 함수
    const handleYearFilterChange = (e) => {
        if (isSyncingFilters) return;

        isSyncingFilters = true;
        const selectedValue = e.target.value;
        const sourceName = e.target.name;

        if (sourceName !== "calendar-year") {
            document.querySelectorAll('input[name="calendar-year"]').forEach((radio) => {
                radio.checked = radio.value === selectedValue;
            });
        }

        if (sourceName !== "year") {
            document.querySelectorAll('input[name="year"]').forEach((radio) => {
                if (radio.value === selectedValue) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event("change")); // 다른 스크립트의 리스너를 트리거
                }
            });
        }
        
        if (selectedValue === "recent") {
            document.querySelector('input[name="calendar-view"][value="normal"]').checked = true;
        } else {
            document.querySelector('input[name="calendar-view"][value="compact"]').checked = true;
        }

        renderCalendar(); // 변경된 필터로 캘린더를 다시 렌더링합니다.

        setTimeout(() => {
            isSyncingFilters = false;
        }, 0);
    };

    // 필터 변경 시 이벤트 리스너를 등록합니다.
    document.querySelectorAll('input[name="calendar-year"], input[name="year"]').forEach((radio) => {
        radio.addEventListener("change", handleYearFilterChange);
    });

    calendarViewFilterContainer.addEventListener("change", renderCalendar);

    // 페이지 로드 시 기본 필터 값을 설정하고 캘린더를 렌더링합니다.
    function setDefaultCalendarYearFilter() {
        const recentRadio = document.querySelector('input[name="calendar-year"][value="recent"]');
        if (recentRadio) {
            recentRadio.checked = true;
            handleYearFilterChange({ target: recentRadio });
        }
    }

    setDefaultCalendarYearFilter();
};
