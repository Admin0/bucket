const note = document.getElementById("블랙야크") != null ? document.getElementById("블랙야크") : document.getElementById("블랙야크_canvas");
const canvas = document.getElementById("블랙야크_canvas");
const p = document.getElementById("블랙야크_p");

// The 'points' array will be populated from the Google Sheet.
let points = [];
let lastHoveredPointId = null;
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2sIB7-0jMCuFQWhaawx6bYXISAP4IOKffPgCsJF2EFG_JCDbbmNghCclU2jY3qfrnl-64iJf6U1__/pub?output=csv';

const MAP_MARGIN = 0;
const LATITUDE_MAX = 38.66;
const LATITUDE_MIN = 33.17;
const LONGITUDE_MAX = 131.26;
const LONGITUDE_MIN = 124.38;

// Main async function to fetch data and initialize the map
async function initializeMap() {
    try {
        const response = await fetch(googleSheetURL);
        if (!response.ok) throw new Error('Network response was not ok.');
        const csvText = await response.text();

        const lines = csvText.trim().split(/\r?\n/);
        const headers = lines[0].split(',');
        
        points = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry = {};
            headers.forEach((header, i) => {
                entry[header.trim()] = values[i] ? values[i].trim() : '';
            });

            return {
                no: parseInt(entry.no, 10),
                id: entry.id,
                done: {
                    step: entry.done_step ? parseInt(entry.done_step, 10) : false,
                    date: entry.done_date || ''
                },
                pos_0: {
                    y: parseFloat(entry.latitude),
                    x: parseFloat(entry.longitude)
                },
                info: {
                    peak: entry.peak,
                    height: parseFloat(entry.height)
                }
            };
        }).filter(p => p.id && !isNaN(p.no)); // Filter out invalid rows

        if (canvas) { // Only draw if canvas exists
          draw();
        }
        if (p) { // Only update progress if p exists
          calculateAndDisplayProgress();
        }

        // Dispatch a custom event to notify that points are loaded
        document.dispatchEvent(new CustomEvent('pointsLoaded', { detail: { points: points } }));

    } catch (error) {
        console.error('Failed to load or process mountain data:', error);
        if (p) p.innerHTML = "산 목록을 불러오는데 실패했습니다.";
    }
}

function getImagePath(point) {
    let path = isOnPage() ? "/" : "/블랙야크/";
    return `.${path}img/${point.no}_${point.id}.jpg`;
}

function isOnPage() {
    return document.querySelector("body#블랙야크") != null;
}

async function isImageExists(path) {
    try {
        const response = await fetch(path, { method: 'HEAD', mode: 'no-cors' });
        return response.ok;
    } catch (error) {
        console.error('Error checking image existence:', error);
        return false;
    }
}

async function updateTitle(p_el, point) {
    let title = `<div class="info">${point.id} | ${point.info.peak} | ${point.info.height.toLocaleString()} m</div>`;
    if (point.done.step) {
        const imagePath = getImagePath(point);
        title = `<img class="블랙야크_img" src='${imagePath}' onerror="this.style.display='none'"> ${title} <div class="done">${point.done.date} (${point.done.step}/100)</div>`;
    } else {
        title += `<div class="undone"></div>`;
    }

    p_el.addEventListener("mouseenter", (e) => {
        let tooltip = document.getElementById("tooltip");
        tooltip.innerHTML = title;

        if (isOnPage()) {
            document.querySelectorAll("#블랙야크_canvas .point").forEach(element => element.classList.remove("on"));
            p_el.classList.add("on");

            document.querySelectorAll("#블랙야크_table tr").forEach(tr => tr.classList.remove("on"));
            const table_item_target = document.querySelector(`#블랙야크_table tr.no-${point.no}`);
            if (table_item_target) {
                table_item_target.classList.add("on");
                if (!isMobile() && !window.matchMedia("only screen and (max-width: 1440px)").matches) {
                    table_item_target.scrollIntoView({ behavior: "smooth" });
                }
            }
            if (lastHoveredPointId !== point.no) {
                tooltip.style.setProperty("--tooltip-rotate", `${-3 + Math.random() * 6}deg`);
            }
            lastHoveredPointId = point.no;
        }
        tooltip.classList.add("on", "블랙야크");
        if (!isOnPage()) {
            tooltip.style.top = note.parentElement.getBoundingClientRect().top + scrollY + p_el.offsetTop + "px";
            let left = p_el.getBoundingClientRect().left;
            if (left <= 0) left = 0;
            tooltip.style.left = left + "px";
        }
    });
    p_el.addEventListener("mouseleave", (e) => {
        tooltip.classList.remove("on", "블랙야크");
    });
}

function pin(point) {
    if (!point.pos_0 || isNaN(point.pos_0.y) || isNaN(point.pos_0.x) || !canvas) return;

    let p_el = document.createElement("div");
    canvas.appendChild(p_el);

    point.pos = {
        x: ((point.pos_0.x - LONGITUDE_MIN) / (LONGITUDE_MAX - LONGITUDE_MIN)) * 100,
        y: ((LATITUDE_MAX - point.pos_0.y) / (LATITUDE_MAX - LATITUDE_MIN)) * 100
    };

    p_el.setAttribute("style", `left:${point.pos.x}%; top:${point.pos.y}%;`);
    updateTitle(p_el, point);

    p_el.classList.add("point");
    p_el.classList.add(`no-${point.no}`);
    if (point.done.step) {
        p_el.classList.add("done");
        if (point.done.step > 75) p_el.classList.add("c1");
        else if (point.done.step > 50) p_el.classList.add("c2");
        else if (point.done.step > 25) p_el.classList.add("c3");
        else p_el.classList.add("c4");
    }
}

function draw() {
    if (!canvas) return;
    canvas.innerHTML = ''; // Clear previous points
    points.forEach(point => pin(point));
}

function calculateAndDisplayProgress() {
    if (!p) return;
    const prog = points.filter(el => el.done.step).length;
    p.innerHTML = `완료: <span class="prog">${prog}</span>/100`;
}

// Helper function that might be missing
function isMobile() {
    try {
        return /Mobi|Android/i.test(navigator.userAgent);
    } catch(e) {
        return false;
    }
}

// Adjust canvas size
if (canvas) {
    canvas.style.height = `calc(${canvas.offsetWidth}px - .5em)`;
    if(note) {
      note.addEventListener("mouseenter", () => {
          if(canvas) canvas.style.height = `calc(${canvas.offsetWidth}px - .5em)`;
      });
    }
}

// Initialize
initializeMap();
