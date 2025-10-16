
// const tooltip = document.getElementById('tooltip');

// let isDragging = false;
// let currentX;
// let currentY;
// let initialX;
// let initialY;
// let xOffset = 0;
// let yOffset = 0;
// let rotation = 0;

// tooltip.addEventListener("mousedown", dragStart);
// tooltip.addEventListener("mouseup", dragEnd);
// tooltip.addEventListener("mousemove", drag);

// function dragStart(e) {
//     initialX = e.clientX - xOffset;
//     initialY = e.clientY - yOffset;

//     if (e.target === tooltip) {
//         isDragging = true;
//     }
// }

// function dragEnd(e) {
//     initialX = currentX;
//     initialY = currentY;

//     isDragging = false;

//     rotation = Math.random() * 10 - 5;
//     setTranslate(xOffset, yOffset, tooltip);
// }

// function drag(e) {
//     if (isDragging) {
//         e.preventDefault();
//         currentX = e.clientX - initialX;
//         currentY = e.clientY - initialY;

//         xOffset = currentX;
//         yOffset = currentY;

//         setTranslate(currentX, currentY, tooltip);
//     }
// }

// function setTranslate(xPos, yPos, el) {
//     el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0) rotate(" + rotation + "deg)";
// }
