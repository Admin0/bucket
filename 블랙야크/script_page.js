// 테이블 만들기
function createTableFromJSON(jsonData, tableId) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ""; // 기존 내용 초기화

    jsonData.forEach((item) => {
        const row = document.createElement("tr"); // 새로운 행 생성

        Object.keys(item).forEach((key) => {
            const cell = `<td class="no"> ${item.no} </td>
            <td class="name"> ${item.id} </td>
            <td class="peak"> ${item.info.peak} </td>
            <td class="height"> ${Math.floor(item.info.height).toLocaleString()} </td>
            <td class="done"> ${item.done.date ? item.done.date : "(미완료)"} </td>
            <td class="step"> ${item.done.date ? item.done.step : "(미완료)"} </td>`;
            row.innerHTML = cell;

            if (item.done.step != false) row.classList.add("done");
            row.setAttribute("onmouseover", item.done.step ? `play(${item.done.step})` : `play(${item.no}, false)`);
            row.setAttribute("onclick", `scrollToCanvas()`);
            // updateTitle(row, item);
        });

        tableBody.appendChild(row); // 행을 테이블 본문에 추가
    });
}
createTableFromJSON(points, "블랙야크_tbody");

// 재생하기
async function play(no, done = true) {
    const index = done ? points.findIndex((item) => item.done.step === no) : no - 1;

    let title = `<div class="info">${points[index].id} | ${points[index].info.peak} | ${points[index].info.height.toLocaleString()} m</div>`;
    if (points[index].done.step) {
        const imagePath = getImagePath(points[index]);
        if (await isImageExists(imagePath)) {
            title = `<img class="블랙야크_img" src='${imagePath}'> ${title} <div class="done">${points[index].done.date} (${no}/100)</div>`;
        } else {
            title = `${title} <div class="done">${points[index].done.date} (${no}/100)</div>`;
        }
    } else {
        title += `<div class="undone"></div>`;
    }

    // 초기화
    let tooltip = document.getElementById("tooltip");
    document.querySelectorAll("#블랙야크_canvas .point").forEach(function (element) {
        element.classList.remove("on");
    });
    tooltip.classList.remove("on", "블랙야크");

    tooltip.innerHTML = title;

    let p_target = document.querySelector(`#블랙야크_canvas .point:nth-of-type(${index + 1})`);
    p_target.classList.add("on");
    tooltip.classList.add("on", "블랙야크");
}

// scroll to canvas
function scrollToCanvas() {
    const canvas = document.getElementById("블랙야크_canvas");
    canvas.scrollIntoView({ behavior: "smooth" });
}

// sort point class
function sortClass(type) {
    document.querySelectorAll("#블랙야크_canvas .point").forEach(function (element) {
        element.classList.remove("c1", "c2", "c3", "c4");
    });
    points.forEach((item) => {
        let p_target = document.querySelector(`#블랙야크_canvas .point:nth-of-type(${item.no})`);
        switch (type) {
            case "no":
                if (item.no > 75) {
                    p_target.classList.add("c1");
                } else if (item.no > 50) {
                    p_target.classList.add("c2");
                } else if (item.no > 25) {
                    p_target.classList.add("c3");
                } else if (item.no > 0){
                    p_target.classList.add("c4");
                }
                break;
            case "height":
                if (item.info.height > 1500) {
                    p_target.classList.add("c1");
                } else if (item.info.height > 1000) {
                    p_target.classList.add("c2");
                } else if (item.info.height > 750) {
                    p_target.classList.add("c3");
                } else if (item.info.height > 0){
                    p_target.classList.add("c4");
                }
                break;
            case "step":
                if (item.done.step > 75) {
                    p_target.classList.add("c1");
                } else if (item.done.step > 50) {
                    p_target.classList.add("c2");
                } else if (item.done.step > 25) {
                    p_target.classList.add("c3");
                } else if (item.done.step > 0){
                    p_target.classList.add("c4");
                }
                break;
            default:
                break;
        }
    });
}

play(4);
