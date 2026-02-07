// 전역 'hermes' 객체 초기화
const hermes = {};

// 외부 'hermes_records' 데이터로 'hermes' 객체의 'records' 속성 설정
hermes.records = hermes_records;

// 코스 카테고리 정의: 트랙 ID를 코스 및 유형 정보에 매핑
hermes.courseCategories = {
    "track-full": { course: "full", type: "run" },
    "track-half": { course: "half", type: "run" },
    "track-10k": { course: "10k", type: "run" },
    "track-5k": { course: "5k", type: "run" },
    "track-trail": { type: "trail" }
};

// 날짜를 기반으로 주차 정보(연도, 주)를 가져오는 헬퍼 함수
function getWeekInfo(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const year = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return { year, week: weekNo };
}

// 기록 데이터 초기화 및 계산된 속성 추가
hermes.recordInit = function () {
    hermes.records = hermes.records.map((record, index) => {
        // 기록 시간을 초로 변환
        const parts = record.record.split(":").map(Number);
        let time;
        if (parts.length === 3) {
            time = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            time = parts[0] * 60 + parts[1];
        }

        // 거리, 고도, 트레일 여부 설정
        const distance = record.distance || (record.course == "full" ? 42.195 : record.course == "half" ? 21.0975 : record.course == "10k" ? 10 : record.course == "5k" ? 5 : 0);
        const elevation = record.elevation || 0;
        const isTrail = record.type == "trail";

        // 페이스 계산
        let elevation_pace = Infinity;
        let distance_pace = Infinity;

        if (isTrail) {
            if (elevation > 0) elevation_pace = (time / elevation / 2) * 60; // 60m당 페이스
            if (distance > 0) distance_pace = time / distance;
        }

        const dateObj = new Date(record.date);

        // 계산된 속성을 포함하여 새로운 기록 객체 반환
        return {
            ...record,
            id: index,
            isOfficial: record.course !== undefined,
            time,
            distance,
            distance_pace: time / distance,
            elevation,
            pace: time / distance,
            elevation_pace: isTrail ? elevation_pace : distance > 0 ? time / distance : Infinity,
            distance_pace,
            course: record.type == "run" ? (distance >= 42.195 ? "full" : distance >= 21.0975 ? "half" : distance >= 10 ? "10k" : "5k") : record.type,
            dateObj: dateObj,
            weekInfo: getWeekInfo(dateObj)
        };
    });
};

// 전체 통계 계산 및 표시
hermes.stats = () => {
    let totalDistance = 0;
    let totalRunningDistance = 0;
    let totalElevation = 0;
    let totalTrailElevation = 0;
    hermes.records.forEach((record) => {
        totalDistance += record.distance || 0;
        totalElevation += record.elevation || 0;
        if (record.type == "trail") {
            totalTrailElevation += record.elevation || 0;
        } else {
            totalRunningDistance += record.distance || 0;
        }
    });

    const statsHeader = document.getElementById("stats-header");
    statsHeader.innerHTML = `
            <div class="stat-item">
                <span class="label">러닝 거리</span>
                <span class="value" title="야외 러닝으로 이동한 거리입니다."><span class="material-symbols-outlined icon"> sprint </span> ${totalRunningDistance.toLocaleString("en-US", {
                    maximumFractionDigits: 1
                })} <span class="unit"> km</span></span>
            </div>
            <div class="stat-item">
                <span class="label">거리</span>
                <span class="value" title="모든 야외 활동 중 이동한 거리입니다."><span class="material-symbols-outlined icon"> conversion_path </span> ${totalDistance.toLocaleString("en-US", {
                    maximumFractionDigits: 1
                })} <span class="unit"> km</span></span>
            </div>
            <div class="stat-item">
                <span class="label">트레일 상승고도</span>
                <span class="value" title="트레일 러닝 혹은 등산으로 상승한 높이입니다."><span class="material-symbols-outlined icon"> hiking </span> ${
                    totalTrailElevation > 1000
                        ? (totalTrailElevation / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> km</span>`
                        : totalTrailElevation.toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> m</span>`
                } </span>
            </div>
            <div class="stat-item">
                <span class="label">상승고도</span>
                <span class="value" title="모든 야외 활동 중 상승한 높이입니다."><span class="material-symbols-outlined icon"> altitude </span> ${
                    totalElevation > 1000
                        ? (totalElevation / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> km</span>`
                        : totalElevation.toLocaleString("en-US", { maximumFractionDigits: 1 }) + ` <span class="unit"> m</span>`
                } </span>
            </div>
            <div class="stat-item">
                <span class="label">활동</span>
                <span class="value" title="야외 활동을 했던 횟수입니다."><span class="material-symbols-outlined icon"> accessibility_new </span> ${hermes.records.length}</span>
            </div>
        `;
};

// 트랙 시각화 생성
hermes.track = function () {
    if (!hermes.records || hermes.records.length === 0) return;

    // 달리기 기록 페이스 계산
    const runRecords = hermes.records.filter((r) => r.course !== "trail");
    const runPaces = runRecords.map((r) => r.pace).filter((p) => p !== Infinity);
    const limitPace = 7 * 60; // 7분/km
    const minPace = runPaces.length > 0 ? Math.min(...runPaces) : 0;
    const maxPace = runPaces.length > 0 ? Math.min(Math.max(...runPaces), limitPace) : limitPace;

    // 트레일 기록 통계 계산
    const trailRecords = hermes.records.filter((r) => r.course === "trail");
    hermes.trailStats = {
        elevations: trailRecords.map((r) => r.elevation),
        elevation_paces: trailRecords.map((r) => r.elevation_pace).filter((p) => p !== Infinity),
        distances: trailRecords.map((r) => r.distance),
        distance_paces: trailRecords.map((r) => r.distance_pace).filter((p) => p !== Infinity)
    };

    const limitElevationPace = 12 * 60; // 12분/60m
    const limitTrailDistancePace = 28 * 60; // 28분/km

    hermes.trailStats.maxElevation = Math.max(0, ...hermes.trailStats.elevations);
    hermes.trailStats.minElevation = Math.min(...hermes.trailStats.elevations.filter((e) => e > 0));
    hermes.trailStats.maxElevationPace = Math.min(Math.max(0, ...hermes.trailStats.elevation_paces), limitElevationPace);
    hermes.trailStats.minElevationPace = Math.min(...hermes.trailStats.elevation_paces);
    hermes.trailStats.maxDistance = Math.max(0, ...hermes.trailStats.distances);
    hermes.trailStats.minDistance = Math.min(...hermes.trailStats.distances.filter((d) => d > 0));
    hermes.trailStats.maxDistancePace = Math.min(Math.max(0, ...hermes.trailStats.distance_paces), limitTrailDistancePace);
    hermes.trailStats.minDistancePace = Math.min(...hermes.trailStats.distance_paces);

    // 마커 색상 그라데이션 설정
    const startColor = [0, 255, 127]; // SpringGreen (좋은 기록)
    const endColor = [0, 77, 64]; // Teal900 (나쁜 기록)

    // 기록의 시작 및 종료 연도 설정
    const years = [...new Set(hermes.records.map((r) => r.weekInfo.year))];
    const startYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
    const endYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    // 트랙 렌더링 함수
    function renderTracks() {
        const trailFilterValue = document.querySelector('input[name="trail-filter"]:checked').value;

        for (const trackId in hermes.courseCategories) {
            const category = hermes.courseCategories[trackId];
            const element = document.getElementById(trackId);
            if (!element) continue;

            element.innerHTML = "";

            let categoryRecords = hermes.records.filter((r) => {
                if (category.type === "trail") return r.course === "trail";
                return r.course === category.course;
            });

            const bestRecordContainer = element.parentElement.querySelector(".best-record-container");
            if (bestRecordContainer) bestRecordContainer.innerHTML = "";

            // 최고 기록 표시
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

            // 연도별 마커 생성
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
                            marker.addEventListener("click", () => {
                                open(representativeRecord.certi);
                            });
                        } else {
                            marker.classList.add("unofficial");
                        }

                        // 마커에 대한 툴팁 및 하이라이트 이벤트 리스너
                        marker.addEventListener("mouseenter", (e) => {
                            let tooltip = document.getElementById("tooltip");
                            tooltip.innerHTML = hermes.tooltip(recordsForWeek);
                            tooltip.classList.add("on");
                            tooltip.style.left = marker.getBoundingClientRect().left + marker.getBoundingClientRect().width / 2 + "px";
                            tooltip.style.top = marker.getBoundingClientRect().top + window.scrollY + "px";
                            const recordIds = JSON.parse(marker.dataset.recordIds);
                            recordIds.forEach((id) => {
                                document.querySelector(`#records-table tr[data-record-id="${id}"]`)?.classList.add("highlight");
                            });
                        });

                        marker.addEventListener("mouseleave", () => {
                            tooltip.classList.remove("on");
                            const recordIds = JSON.parse(marker.dataset.recordIds);
                            recordIds.forEach((id) => {
                                document.querySelector(`#records-table tr[data-record-id="${id}"]`)?.classList.remove("highlight");
                            });
                        });

                        // 기록 값에 따라 마커 색상 계산
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

        // 트랙 스크롤 시 그림자 효과 업데이트
        const tracks = document.querySelectorAll(".track");
        tracks.forEach((track) => {
            const updateShadows = () => {
                const { scrollTop, scrollHeight, clientHeight } = track;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

                track.classList.toggle("shadow-top", !isAtTop);
                track.classList.toggle("shadow-bottom", !isAtBottom);
            };

            track.addEventListener("scroll", updateShadows);
            updateShadows();
        });
    }

    renderTracks();

    // 트레일 필터 변경 시 트랙 다시 렌더링
    document.querySelectorAll('input[name="trail-filter"]').forEach((radio) => {
        radio.addEventListener("change", renderTracks);
    });
};

// 기록 테이블 생성 및 관리
hermes.table = function () {
    const tableBody = document.querySelector("#records-table tbody");
    const tableHeaders = document.querySelectorAll("#records-table th");
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const courseFilterContainer = document.getElementById("course-filter-container");
    const courseRadios = document.querySelectorAll('input[name="course"]');
    const yearRadiosContainer = document.getElementById("year-filter-container");
    const resetButton = document.getElementById("reset-filters");
    const searchInput = document.getElementById("search-input"); // 검색 입력 필드

    if (!hermes.records || hermes.records.length === 0) return;

    let currentSort = { key: "date", direction: "desc" };
    let filteredRecords = [...hermes.records];

    // 연도 필터 동적 생성
    const years = [...new Set(hermes.records.map((r) => r.weekInfo.year))].sort((a, b) => b - a);
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

    // 기본 연도 필터 설정
    function setDefaultYearFilter() {
        const currentYear = new Date().getFullYear();
        const currentYearRadio = document.querySelector(`input[name="year"][value="${currentYear}"]`);
        if (currentYearRadio) {
            currentYearRadio.checked = true;
        } else {
            document.querySelector('input[name="year"][value="all"]').checked = true;
        }
    }

    // 코스 필터 활성화/비활성화
    function toggleCourseFilter(disabled) {
        courseFilterContainer.classList.toggle("disabled", disabled);
        courseRadios.forEach((radio) => (radio.disabled = disabled));
        if (disabled) {
            document.querySelector('input[name="course"][value="all"]').checked = true;
        }
    }

    // 기록 필터링 및 렌더링
    function filterAndRender() {
        const type = document.querySelector('input[name="type"]:checked').value;
        const course = document.querySelector('input[name="course"]:checked').value;
        const year = document.querySelector('input[name="year"]:checked').value;
        const searchTerm = searchInput.value.toLowerCase(); // 검색어

        toggleCourseFilter(type === "trail" || type === "walk");

        filteredRecords = hermes.records.filter((record) => {
            const recordType = record.type;
            const matchesType = type === "all" || recordType === type;
            const matchesCourse = course === "all" || record.course === course || type === "trail";
            const matchesYear = year === "all" || record.weekInfo.year == year;
            const matchesSearch =
                searchTerm === "" || record.title.toLowerCase().includes(searchTerm) || record.course.toLowerCase().includes(searchTerm) || record.comment.toLowerCase().includes(searchTerm);

            return matchesType && matchesCourse && matchesYear && matchesSearch;
        });

        renderTable();
    }

    // 테이블 렌더링
    function renderTable() {
        // 현재 정렬 기준에 따라 기록 정렬
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
            row.title = record.comment;

            const isTrail = record.course === "trail";

            // 페이스 및 거리 문자열 형식화
            const paceString = `${Math.floor(record.pace / 60)}′${Math.floor(record.pace % 60)
                .toString()
                .padStart(2, "0")}″<span class="unit">/km</span>`;
            const paceStringTrail = `${Math.floor(record.elevation_pace / 60)}′${Math.floor(record.elevation_pace % 60)
                .toString()
                .padStart(2, "0")}″<span class="unit">/60 m↑</span>`;
            const paceDetail = isTrail ? `<span class="replace">${paceString}</span><span class="main">${paceStringTrail}</span>` : `${paceString}`;

            const distanceDetail = isTrail
                ? `<span class="main">${record.elevation}<span class="unit"> m</span></span><span class="replace">${record.distance.toFixed(2)}<span class="unit"> km</span></span>`
                : `${record.distance.toFixed(2)} <span class="unit"> km</span>`;
            const icon_distance = record.course === "trail" ? `<span class="main">altitude</span><span class="replace">conversion_path</span>` : "conversion_path";
            const dateString = `w${record.weekInfo.week}`;

            // 테이블 행 내용 설정
            row.innerHTML = `
                <td class="course">${record.course}</td>
                <td class="date"><span class="main">${record.date}</span><span class="replace">${dateString}</span></td>
                <td class="title">${record.title}</td>
                <td class="isOfficial">${record.isOfficial ? '<span class="material-symbols icon"> crown </span>' : ""}</td>
                <td class="distance"><span class="material-symbols-outlined icon distance"> ${icon_distance} </span>${distanceDetail} </td>
                <td class="record"><span class="material-symbols-outlined icon record"> timer </span>${record.record} </td>
                <td class="pace"><span class="material-symbols-outlined icon pace"> speed </span>${paceDetail}</td>
            `;

            // 행에 마우스 오버/아웃 시 트랙 마커 하이라이트
            row.addEventListener("mouseover", () => {
                const courseType = record.course;
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
                const courseType = record.course;
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

    // 필터 변경 이벤트 리스너
    typeRadios.forEach((radio) => radio.addEventListener("change", filterAndRender));
    courseRadios.forEach((radio) => radio.addEventListener("change", filterAndRender));
    searchInput.addEventListener("input", filterAndRender); // 검색 입력 시 필터링

    // 테이블 헤더 클릭 시 정렬
    tableHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const sortKey = header.dataset.sort;
            if (!sortKey) return;

            if (currentSort.key === sortKey) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort.key = sortKey;
                currentSort.direction = ["date", "isOfficial", "distance"].includes(sortKey) ? "desc" : "asc";
            }
            tableHeaders.forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
            header.classList.add(`sort-${currentSort.direction}`);

            renderTable();
        });
    });

    // 필터 초기화 버튼
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            document.querySelector('input[name="type"][value="all"]').checked = true;
            document.querySelector('input[name="course"][value="all"]').checked = true;
            searchInput.value = ""; // 검색 필드 초기화
            setDefaultYearFilter();
            toggleCourseFilter(false);
            currentSort = { key: "date", direction: "desc" };
            tableHeaders.forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
            document.querySelector('th[data-sort="date"]').classList.add("sort-desc");
            filterAndRender();
        });
    }

    // 초기화
    setDefaultYearFilter();
    document.querySelector('th[data-sort="date"]').classList.add("sort-desc");
    filterAndRender();
};

// 애플리케이션 초기화 함수
hermes.initiate = function () {
    hermes.recordInit();
    hermes.track();
    hermes.calendar();
    hermes.table();
    hermes.stats();
};

// DOM 콘텐츠 로드 완료 시 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", (event) => {
    hermes.initiate();
});
