
// Utility function to check for mobile devices
function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}

// Add a dynamic footer link based on the device
const link4mobile = isMobile()
    ? `<a href="//bac100.page.link/oBW476KYqErgWq5Q7" class="i o" title="점조직 산악회 페이지">점조직 산악회 (BAC)</a>`
    : `<a href="//bac.blackyak.com/profile/643244" class="i o" title="등산개굴 프로필 페이지">등산개굴 (BAC)</a>`;
const footer = document.getElementsByTagName("footer")[0];
if (footer) footer.insertAdjacentHTML("beforeend", link4mobile);

// Listen for the custom 'pointsLoaded' event dispatched from script.js
document.addEventListener('pointsLoaded', function(e) {
    const points = e.detail.points;

    // Helper functions to ensure the script is self-contained
    function isOnPage() {
        return document.querySelector("body#블랙야크") != null;
    }

    function getImagePath(point) {
        let path = isOnPage() ? "/" : "/블랙야크/";
        return `.${path}img/${point.no}_${point.id}.jpg`;
    }

    // This function creates the mountain list table from the loaded data.
    function createTableFromJSON(jsonData, tableId) {
        const tableBody = document.getElementById(tableId);
        if (!tableBody) return;
        tableBody.innerHTML = ""; // Clear any existing content

        jsonData.forEach((item) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="no">${item.no}</td>
                <td class="name">${item.id}</td>
                <td class="peak">${item.info.peak}</td>
                <td class="height">${item.info.height ? Math.floor(item.info.height).toLocaleString() : ''}</td>
                <td class="done">${item.done.date ? item.done.date : ""}</td>
                <td class="step">${item.done.step ? item.done.step : ""}</td>
            `;

            row.classList.add(`no-${item.no}`);
            if (item.done.step) {
                row.classList.add("done");
            }
            
            const play_params = item.done.step ? `${item.done.step}, true` : `${item.no}, false`;
            row.setAttribute("onmouseover", `play(${play_params})`);
            row.setAttribute("onclick", `scrollToCanvas()`);

            tableBody.appendChild(row);
        });
    }

    // This function handles showing the tooltip and highlighting points on the map.
    window.play = function(id, isDone) {
        const point = isDone 
            ? points.find(p => p.done.step === id) 
            : points.find(p => p.no === id);
        
        if (!point) return;

        let title = `<div class="info">${point.id} | ${point.info.peak} | ${point.info.height.toLocaleString()} m</div>`;
        if (point.done.step) {
            const imagePath = getImagePath(point);
            title = `<img class="블랙야크_img" src='${imagePath}' onerror="this.style.display='none'"> ${title} <div class="done">${point.done.date} (${point.done.step}/100)</div>`;
        } else {
            title += `<div class="undone"></div>`;
        }

        document.querySelectorAll("#블랙야크_canvas .point, #블랙야크_table tr").forEach(el => el.classList.remove("on"));

        const canvasPoint = document.querySelector(`#블랙야크_canvas .point.no-${point.no}`);
        const tableRow = document.querySelector(`#블랙야크_table tr.no-${point.no}`);
        if (canvasPoint) canvasPoint.classList.add("on");
        if (tableRow) tableRow.classList.add("on");
        
        let tooltip = document.getElementById("tooltip");
        if(tooltip) {
            tooltip.innerHTML = title;
            tooltip.classList.add("on", "블랙야크");
            tooltip.style.setProperty("--tooltip-rotate", `${-3 + Math.random() * 6}deg`);
        }
    };

    window.scrollToCanvas = function() {
        const canvas = document.getElementById("블랙야크_canvas");
        if(canvas) canvas.scrollIntoView({ behavior: "smooth" });
    };

    createTableFromJSON(points, "블랙야크_tbody");

    // Automatically activate Hallasan (no. 94) on load.
    const hallasan = points.find(p => p.no === 94);
    if (hallasan) {
        // A small delay to ensure all elements are rendered.
        setTimeout(() => {
            if (hallasan.done.step) {
                window.play(hallasan.done.step, true);
            } else {
                window.play(hallasan.no, false);
            }
        }, 100);
    }
});
