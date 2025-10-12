
document.querySelectorAll(".note").forEach((note) => {
    let left = Math.floor(Math.random() * 100);
    let left_limit = 100 - (400 / document.documentElement.clientWidth) * 100;
    let top = Math.floor(Math.random() * 100);
    let top_limit = 100 - (400 / document.documentElement.clientHeight) * 100;
    let deg = Math.floor(Math.random() * 30);    let initialDeg = deg - 15;
    note.style.left = `${left > left_limit ? left_limit : left}vw`;
    note.style.top = `${top > top_limit ? top_limit : top}vh`;
    note.style.transform = `rotate(${initialDeg}deg)`;

    let isDragging = false;
    let offsetX, offsetY;

    note.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - note.getBoundingClientRect().left;
        offsetY = e.clientY - note.getBoundingClientRect().top;
        lastX = e.clientX;
        note.style.cursor = "grabbing";
        note.style.transition = ''; // Remove transition for smooth dragging
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        const mouseX = e.clientX;
        const velocityX = mouseX - lastX;
        lastX = mouseX;
        // Calculate rotation based on velocity
        let rotation = initialDeg + (velocityX * 1.5);
        rotation = Math.max(-40, Math.min(40, rotation)); // Clamp the rotation

        note.style.left = e.clientX - offsetX + "px";
        note.style.top = e.clientY - offsetY + "px";
        note.style.transform = `rotate(${rotation}deg)`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        note.style.cursor = "grab";
        
        // Add a smooth transition back to the initial state
        note.style.transition = 'transform 0.5s ease-out';
        note.style.transform = `rotate(${initialDeg}deg)`;
    });
});
