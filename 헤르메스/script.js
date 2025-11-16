const hermes = {};

hermes.records = [
    { date: "2024-11-10", course: 10, record: "00:58:43", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-04-20", course: 10, record: "01:02:24", title: "아산이순신마라톤" },
    { date: "2025-09-28", course: 10, record: "00:54:16", title: "공주백제마라톤" },
    { date: "2025-09-28", course: 10, record: "00:54:16", title: "빵빵런 대전" },
    { date: "2025-09-28", course: 10, record: "00:54:16", title: "꽈자런 천안" },
    { date: "2025-11-09", course: 10, record: "01:00:07", title: "아산은행나무길 전국마라톤대회" },
];

hermes.initiate = function () {
    hermes.records.forEach((e) => {
        document.getElementById("output").innerHTML += `
        <div>
            <span class="date">${e.date}</span> /
            <span class="course">${e.course}K</span> /
            <span class="record">${e.record}</span> /
            <span class="title">${e.title}</span> 
        </div>`;
    });
};

hermes.initiate();
