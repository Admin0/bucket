import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';

export const gpx = (() => {
    const state = {
        map: null,
        droppedTracks: [],
        searchResults: [],
        selectedTrackIds: [],
        lastSelectedTrackId: null
    };

    const listContainer = document.getElementById("gpx-list-container");
    const listElement = listContainer ? listContainer.querySelector("ul") : null;
    let dragCounter = 0;
    let draggedTrackId = null;

    // --- Helper Functions ---
    function haversineDistance(coords1, coords2) {
        const R = 6371e3;
        const φ1 = (coords1[1] * Math.PI) / 180;
        const φ2 = (coords2[1] * Math.PI) / 180;
        const Δφ = ((coords2[1] - coords1[1]) * Math.PI) / 180;
        const Δλ = ((coords2[0] - coords1[0]) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    function formatDuration(seconds) {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");
        return `${h}:${m}:${s}`;
    }
    function formatPace(seconds, distanceKm) {
        if (distanceKm === 0) return "0′00″";
        const pace = seconds / distanceKm;
        const min = Math.floor(pace / 60);
        const sec = Math.floor(pace % 60)
            .toString()
            .padStart(2, "0");
        return `${min}′${sec}″`;
    }
    function encode(val) {
        val = val < 0 ? ~(val << 1) : val << 1;
        let result = "";
        while (val >= 0x20) {
            result += String.fromCharCode((0x20 | (val & 0x1f)) + 63);
            val >>= 5;
        }
        result += String.fromCharCode(val + 63);
        return result;
    }
    function encodeCoordinates(coordinates) {
        let plat = 0;
        let plon = 0;
        let encoded = "";
        for (const point of coordinates) {
            const lat = Math.round(point[1] * 1e6);
            const lon = Math.round(point[0] * 1e6);
            encoded += encode(lat - plat);
            encoded += encode(lon - plon);
            plat = lat;
            plon = lon;
        }
        return encoded;
    }
    async function getAddressFromCoordinates(lat, lon) {
        if (!lat || !lon) return null;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=ko,en`;
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            const address = data.address;
            if (!address) return null;
            return address.road || address.suburb || address.village || address.city || address.country || null;
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return null;
        }
    }

    function handleDragStart(e) {
        draggedTrackId = e.target.closest("li").dataset.trackId;
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetLi = e.target.closest("li");
        if (!targetLi || !draggedTrackId) {
            draggedTrackId = null;
            return;
        }

        const droppedOnTrackId = targetLi.dataset.trackId;
        if (draggedTrackId === droppedOnTrackId) {
            draggedTrackId = null;
            return;
        }

        const draggedIndex = state.droppedTracks.findIndex((t) => t.id === draggedTrackId);
        const droppedOnIndex = state.droppedTracks.findIndex((t) => t.id === droppedOnTrackId);

        if (draggedIndex === -1 || droppedOnIndex === -1) {
            draggedTrackId = null;
            return;
        }

        // Reorder the array
        const [draggedItem] = state.droppedTracks.splice(draggedIndex, 1);
        state.droppedTracks.splice(droppedOnIndex, 0, draggedItem);

        draggedTrackId = null;
        updateList();
    }

    function movingAverage(data, size) {
        if (size <= 1 || data.length <= size) {
            return data;
        }
        const smoothed = [];
        const halfSize = Math.floor(size / 2);
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - halfSize);
            const end = Math.min(data.length, i + halfSize + 1);
            const window = data.slice(start, end);
            const average = window.reduce((sum, val) => sum + val, 0) / window.length;
            smoothed.push(average);
        }
        return smoothed;
    }

    // --- File Parsing & Data Processing ---
    function parseFile(fileContent, fileType, fileName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(fileContent, "application/xml");
        let points = [],
            times = [],
            elevations = [];
        let pointSelector, latAttr, lonAttr, timeTag, eleTag;
        if (fileType === "gpx") {
            pointSelector = "trkpt";
            latAttr = "lat";
            lonAttr = "lon";
            timeTag = "time";
            eleTag = "ele";
        } else {
            pointSelector = "Trackpoint";
            latAttr = "LatitudeDegrees";
            lonAttr = "LongitudeDegrees";
            timeTag = "Time";
            eleTag = "AltitudeMeters";
        }
        const trackpoints = doc.querySelectorAll(pointSelector);
        trackpoints.forEach((pt) => {
            let lat, lon;
            if (fileType === "gpx") {
                lat = parseFloat(pt.getAttribute(latAttr));
                lon = parseFloat(pt.getAttribute(lonAttr));
            } else {
                const latNode = pt.querySelector(latAttr);
                const lonNode = pt.querySelector(lonAttr);
                if (!latNode || !lonNode) return;
                lat = parseFloat(latNode.textContent);
                lon = parseFloat(lonNode.textContent);
            }
            points.push([lon, lat]);
            const timeNode = pt.querySelector(timeTag);
            if (timeNode) times.push(new Date(timeNode.textContent));
            const eleNode = pt.querySelector(eleTag);
            if (eleNode) elevations.push(parseFloat(eleNode.textContent));
        });
        if (points.length === 0) return null;
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
            distance += haversineDistance(points[i - 1], points[i]);
        }
        let elevationGain = 0;
        if (elevations.length > 1) {
            const smoothingWindow = 25;
            const smoothedElevations = movingAverage(elevations, smoothingWindow);
            for (let i = 1; i < smoothedElevations.length; i++) {
                const diff = smoothedElevations[i] - smoothedElevations[i - 1];
                if (diff > 0) {
                    elevationGain += diff;
                }
            }
        }
        const duration = times.length > 1 ? (times[times.length - 1] - times[0]) / 1000 : 0;
        const date = times.length > 0 ? new Date(times[0].getTime() - times[0].getTimezoneOffset() * 60000).toISOString().split("T")[0] : null;
        return { points, distance: distance / 1000, elevation: Math.round(elevationGain), duration, date, title: null, name: fileName };
    }

    // --- UI & Map Interaction ---
    function getTrackMapIds(trackId) {
        const cleanTrackId = String(trackId).trim();
        const layerId = `gpx-layer-${cleanTrackId}`;
        return {
            sourceId: `gpx-source-${cleanTrackId}`,
            layerId,
            borderLayerId: `${layerId}-border`
        };
    }

    function deleteSelectedTracks() {
        if (state.selectedTrackIds.length === 0) return;
        state.selectedTrackIds.forEach((trackId) => {
            const { layerId, borderLayerId, sourceId } = getTrackMapIds(trackId);
            if (state.map.getLayer(borderLayerId)) state.map.removeLayer(borderLayerId);
            if (state.map.getLayer(layerId)) state.map.removeLayer(layerId);
            if (state.map.getSource(sourceId)) state.map.removeSource(sourceId);
        });
        state.droppedTracks = state.droppedTracks.filter((track) => !state.selectedTrackIds.includes(track.id));
        state.selectedTrackIds = [];
        state.lastSelectedTrackId = null;
        updateList();
        const outputContainer = document.getElementById("export-output");
        if (outputContainer) {
            outputContainer.innerHTML = "";
            outputContainer.style.display = "none";
        }
    }

    function updateList() {
        if (!listElement) return;
        listElement.innerHTML = "";

        if (state.droppedTracks.length > 0 && state.searchResults.length > 0) {
            const heading = document.createElement("li");
            heading.className = "list-heading uploaded-heading";
            heading.textContent = "업로드한 경로";
            listElement.appendChild(heading);
        }

        state.droppedTracks.forEach((track) => {
            const li = document.createElement("li");
            li.dataset.trackId = track.id;
            li.draggable = true;
            li.addEventListener("dragstart", handleDragStart);

            if (state.selectedTrackIds.includes(track.id)) {
                li.classList.add("selected");
            }
            const pace = formatPace(track.duration, track.distance);

            let activityTitle = "걷기";
            const paceInSecondsPerKm = track.distance > 0 ? track.duration / track.distance : 0;

            if (track.elevation >= 250) {
                activityTitle = "등산";
            } else if (paceInSecondsPerKm > 0 && paceInSecondsPerKm <= 480) {
                // 8 min/km
                activityTitle = "러닝";
            }

            const displayName = track.title ? `${track.title} ${activityTitle} ` : `${activityTitle} `;

            li.innerHTML = `
            <div class="track-name"> <span class="title">${displayName}</span> <span class="date">${track.date}</span> </div>
            <div class="track-meta">
                <span class="material-symbols-outlined"> conversion_path </span> ${track.distance.toFixed(2)} <span class="unit"> km</span>
                <span class="material-symbols-outlined"> floor </span> ${track.elevation} <span class="unit"> m</span>
                <span class="material-symbols-outlined"> timer </span> ${formatDuration(track.duration)}
                <span class="material-symbols-outlined"> avg_pace </span> ${pace}<span class="unit">/km</span>
            </div>
            <span class="comment">${track.name || ""}</span>`;
            li.addEventListener("click", (e) => {
                handleTrackSelection(track.id, e.shiftKey, e.metaKey || e.ctrlKey);
            });
            listElement.appendChild(li);
        });

        if (state.searchResults.length > 0) {
            const heading = document.createElement("li");
            heading.className = "list-heading";
            heading.textContent = `검색된 경로 (${state.searchResults.length})`;
            listElement.appendChild(heading);
        }

        function rating(val, type) {
            const numericValue = Number(val) || 0;
            const totalStars = 5;
            const stepValue = type === "trail" ? 375 : 5;
            const normalized = Math.min(Math.max(numericValue / stepValue, 0), totalStars);
            const activeHalfStars = Math.round(normalized * 2);

            let stars = "";
            for (let i = 0; i < totalStars; i++) {
                const remaining = activeHalfStars - i * 2;
                let starState = "off";
                if (remaining >= 2) starState = "on";
                else if (remaining === 1) starState = "half";
                stars += `<span class="material-symbols icon ${starState}"> star </span>`;
            }
            return stars;
        }

        const sortedSearchResults = [...state.searchResults].sort((a, b) => {
            const dateA = Date.parse(a.properties?.date || "") || 0;
            const dateB = Date.parse(b.properties?.date || "") || 0;
            return dateB - dateA;
        });

        sortedSearchResults.forEach((feature) => {
            const prop = feature.properties;
            const li = document.createElement("li");
            li.className = "search-result";
            li.innerHTML = `
            <div>
                <span class="title">${prop.title}</span>
                <span class="date"><span class="main">${prop.date}</span></span>
                ${prop.isOfficial ? '<span class="material-symbols official"> crown </span>' : ''}
            </div>
            <span class="distance">
                ${prop.type === "trail"
                    ? `${rating(prop.elevation, prop.type)} ${Number(prop.elevation).toFixed(0)}<span class="unit"> m</span>`
                    : `${rating(prop.distance, prop.type)} ${Number(prop.distance).toFixed(1)}<span class="unit"> km</span>`}
            </span >
            <span class="comment">${prop.comment || ""}</span>
            `;
            li.addEventListener("click", () => {
                const bounds = new maplibregl.LngLatBounds();
                feature.geometry.coordinates.forEach((point) => bounds.extend(point));
                state.map.fitBounds(bounds, { padding: 160, maxZoom: 15 });

                document.getElementById("gpx-list-container")?.classList.remove("on");
                document.getElementById("route-search")?.classList.remove("on");
            });
            li.addEventListener("mouseenter", () => {
                const point = state.map.project(feature.geometry.coordinates[0]);
                state.map.fire("route-search-enter", { feature, point });
            });
            li.addEventListener("mouseleave", () => {
                state.map.fire("route-search-leave");
            });
            // console.log("Search Result:", feature);
            listElement.appendChild(li);
        });
    }

    function toggleListView() {
        const listContainer = document.getElementById("gpx-list-container");
        const routeSearch = document.getElementById("route-search");
        const isOn = listContainer?.classList.contains("on");
        listContainer?.classList.toggle("on", !isOn);
        routeSearch?.classList.toggle("on", !isOn);
        document.getElementById("tooltip")?.classList.remove("on");
    }

    function addTrackLayer(track) {
        const { sourceId, layerId, borderLayerId } = getTrackMapIds(track.id);
        if (state.map.getSource(sourceId)) return;

        state.map.addSource(sourceId, { type: "geojson", lineMetrics: true, data: { type: "Feature", geometry: { type: "LineString", coordinates: track.points } } });
        state.map
            .addLayer({
                id: borderLayerId,
                type: "line",
                source: sourceId,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#ffffff", "line-width": 5 }
            })
            .addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#f44a01", "line-width": 3 }
            });
    }

    function focusOnSelectedTracks() {
        state.droppedTracks.forEach((track) => {
            const { layerId, borderLayerId } = getTrackMapIds(track.id);
            if (!state.map.getLayer(layerId)) return;
            state.map
                .setPaintProperty(layerId, "line-color", "#fc5200")
                .setPaintProperty(layerId, "line-width", ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 4, 13, 1.5])
                .setPaintProperty(borderLayerId, "line-width", 0);
        });

        const selectedTracks = state.droppedTracks.filter((t) => state.selectedTrackIds.includes(t.id));

        if (selectedTracks.length === 0) {
            updateList();
            return;
        }

        const bounds = new maplibregl.LngLatBounds();
        selectedTracks.forEach((track) => {
            const { layerId, borderLayerId } = getTrackMapIds(track.id);
            if (!state.map.getLayer(layerId)) return;
            state.map
                .setPaintProperty(layerId, "line-gradient", ["interpolate", ["linear"], ["line-progress"], 0, "#F98D00", 0.5, "#fc5200", 1, "#ff1744"])
                .setPaintProperty(layerId, "line-width", ["interpolate", ["linear"], ["zoom"], 9, 3, 16, 5])
                .setPaintProperty(borderLayerId, "line-width", ["interpolate", ["linear"], ["zoom"], 5, 6, 12, 8]);
            track.points.forEach((point) => bounds.extend(point));
        });

        requestAnimationFrame(() => {
            state.map.fitBounds(bounds, { padding: 256, maxZoom: 15 });
        });
        updateList();
    }

    function handleTrackSelection(trackId, isShift, isCtrl) {
        const currentIds = state.selectedTrackIds;
        const lastId = state.lastSelectedTrackId;

        if (isShift && lastId) {
            const trackIds = state.droppedTracks.map((t) => t.id);
            const lastIdx = trackIds.indexOf(lastId);
            const currentIdx = trackIds.indexOf(trackId);
            const start = Math.min(lastIdx, currentIdx);
            const end = Math.max(lastIdx, currentIdx);
            const range = trackIds.slice(start, end + 1);

            if (isCtrl) {
                state.selectedTrackIds = [...new Set([...currentIds, ...range])];
            } else {
                state.selectedTrackIds = range;
            }
        } else if (isCtrl) {
            if (currentIds.includes(trackId)) {
                state.selectedTrackIds = currentIds.filter((id) => id !== trackId);
            } else {
                state.selectedTrackIds.push(trackId);
            }
        } else {
            if (currentIds.length === 1 && currentIds[0] === trackId) {
                state.selectedTrackIds = [];
            } else {
                state.selectedTrackIds = [trackId];
            }
        }

        state.lastSelectedTrackId = trackId;
        focusOnSelectedTracks();
    }

    // --- Export Functionality ---
    function handleExport() {
        if (state.selectedTrackIds.length === 0) {
            alert("내보낼 항목을 먼저 선택해주세요.");
            return;
        }

        const selectedTracks = state.droppedTracks.filter((track) => state.selectedTrackIds.includes(track.id));

        // Helper for CSV formatting to handle commas and quotes
        const toCsvField = (value) => {
            if (value === null || value === undefined || value === '') return '';
            const str = String(value);
            // If the string contains a comma, a quote, or a newline, enclose it in quotes.
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                // Escape quotes by doubling them
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const columns = ['date', 'over', 'type', 'gear', 'course', 'distance', 'elevation', 'record', 'title', 'comment', 'certi', 'geometry'];
        let isGeometryTooLong = false;

        const tracksByDate = {};
        const orderedDates = [];
        selectedTracks.forEach(track => {
            const date = track.date || 'N/A';
            if (!tracksByDate[date]) {
                tracksByDate[date] = [];
                orderedDates.push(date);
            }
            tracksByDate[date].push(track);
        });
        orderedDates.sort();

        const csvRows = [];
        orderedDates.forEach(date => {
            const tracksOnDate = tracksByDate[date];
            // Sort by file name to have a consistent order
            tracksOnDate.sort((a, b) => a.name.localeCompare(b.name));

            tracksOnDate.forEach((track, index) => {
                let activityType = "walk";
                const paceInSecondsPerKm = track.distance > 0 ? track.duration / track.distance : 0;

                if (track.elevation >= 250) {
                    activityType = "trail";
                } else if (paceInSecondsPerKm > 0 && paceInSecondsPerKm <= 480) { // 8 min/km pace
                    activityType = "run";
                }

                const geometry = encodeCoordinates(track.points);
                if (geometry.length > 50000) {
                    isGeometryTooLong = true;
                }

                const record = {
                    date: track.date || '',
                    over: (tracksOnDate.length > 1 && index > 0) ? index : '',
                    type: activityType,
                    course: track.course || '',
                    distance: parseFloat(track.distance.toFixed(2)),
                    elevation: track.elevation,
                    record: formatDuration(track.duration),
                    title: track.title || track.name.replace(/\.(gpx|tcx)$/i, ""),
                    comment: '',
                    certi: '',
                    geometry: geometry
                };

                const rowValues = columns.map(col => record[col] ?? '');
                csvRows.push(rowValues.map(toCsvField).join('\t'));
            });
        });

        if (isGeometryTooLong) {
            alert('경고: 하나 이상의 레코드에서 geometry 데이터가 5만자를 초과합니다. 구글 시트 셀 제한을 초과할 수 있습니다.');
        }

        const csvHeader = columns.join('\t');
        const csvOutput = csvRows.join('\n'); //csvHeader + '\n' + csvRows.join('\n');

        // Directly copy to clipboard
        navigator.clipboard.writeText(csvOutput).then(() => {
            const exportButton = document.getElementById("export-button");
            if (!exportButton) return;
            const originalText = exportButton.textContent;
            exportButton.textContent = "복사 완료!";
            exportButton.disabled = true;
            setTimeout(() => {
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error("클립보드 복사 실패:", err);
            // Fallback to showing a textarea for manual copy
            const outputContainer = document.getElementById("export-output");
            if (outputContainer) {
                outputContainer.innerHTML = `<p>자동 복사에 실패했습니다. 아래 텍스트를 직접 복사해주세요.</p><textarea readonly style="width: 100%; height: 150px;">${csvOutput}</textarea>`;
                outputContainer.style.display = "block";
                outputContainer.querySelector("textarea").select();
            } else {
                alert("자동 복사에 실패했습니다. 개발자 콘솔을 확인해주세요.");
            }
        });
    }

    function processFiles(files) {
        const filteredFiles = Array.from(files).filter((f) => /\.(gpx|tcx)$/i.test(f.name));
        if (filteredFiles.length === 0) return;

        const readPromises = filteredFiles.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileType = file.name.split(".").pop().toLowerCase();
                    const trackData = parseFile(event.target.result, fileType, file.name);
                    if (trackData) {
                        resolve({ id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, ...trackData });
                    } else {
                        resolve(null);
                    }
                };
                reader.onerror = reject;
                reader.readAsText(file);
            });
        });

        Promise.all(readPromises).then((newTracksData) => {
            const validTracks = newTracksData.filter(Boolean);
            if (validTracks.length === 0) return;

            state.droppedTracks.push(...validTracks);
            validTracks.forEach((track) => addTrackLayer(track));

            state.selectedTrackIds = validTracks.map((t) => t.id);
            state.lastSelectedTrackId = validTracks.length > 0 ? validTracks[validTracks.length - 1].id : null;
            focusOnSelectedTracks();

            const geocodingPromises = validTracks.map((track) => {
                if (track.points.length > 0) {
                    return getAddressFromCoordinates(track.points[0][1], track.points[0][0]).then((addressTitle) => {
                        if (addressTitle) {
                            const trackToUpdate = state.droppedTracks.find((t) => t.id === track.id);
                            if (trackToUpdate) trackToUpdate.title = addressTitle;
                        }
                    });
                }
                return Promise.resolve();
            });

            Promise.all(geocodingPromises).then(() => updateList());
        });
    }

    // --- Initialization ---
    function initDragAndDrop() {
        const mapContainer = state.map.getContainer();

        mapContainer.addEventListener("dragenter", (e) => {
            e.preventDefault();
            dragCounter++;
            mapContainer.classList.add("drag-over");
        });
        mapContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        mapContainer.addEventListener("dragleave", (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                mapContainer.classList.remove("drag-over");
            }
        });

        mapContainer.addEventListener("drop", (e) => {
            e.preventDefault();
            dragCounter = 0;
            mapContainer.classList.remove("drag-over");

            processFiles(e.dataTransfer.files);
        });

        if (listElement) {
            listElement.addEventListener("dragover", handleDragOver);
            listElement.addEventListener("drop", handleDrop);
        }
    }

    function init(mapInstance) {
        if (!mapInstance) return console.error("Map instance not provided for gpx module initialization.");
        state.map = mapInstance;

        document.getElementById("gpx-upload-btn")?.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".gpx,.tcx";
            fileInput.multiple = true;
            fileInput.addEventListener("change", (e) => {
                processFiles(e.target.files);
            });
            fileInput.click();
        });

        document.getElementById("export-button")?.addEventListener("click", handleExport);

        document.getElementById("gpx-list-view-toggle")?.addEventListener("touchend", toggleListView);

        document.addEventListener("keydown", (e) => {
            const activeElement = document.activeElement;
            const isTyping = ["INPUT", "TEXTAREA"].includes(activeElement.tagName) || activeElement.isContentEditable;
            if (!isTyping && (e.key === "Backspace" || e.key === "Delete")) {
                if (state.selectedTrackIds.length > 0) {
                    e.preventDefault();
                    deleteSelectedTracks();
                }
            }
        });

        initDragAndDrop();
    }

    function setSearchResults(features) {
        state.searchResults = features || [];
        updateList();
    }

    return { init, setSearchResults };
})();
