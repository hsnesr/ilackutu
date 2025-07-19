// PROGRESS BARS
function showProgressBar() {
    const bar = document.getElementById("progressBar");
    if (!bar) return;
    bar.style.width = "0%";
    bar.style.display = "block";

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
        } else {
            width += Math.random() * 10;
            bar.style.width = width + "%";
        }
    }, 100);
}

function hideProgressBar() {
    const bar = document.getElementById("progressBar");
    if (!bar) return;
    bar.style.width = "100%";
    setTimeout(() => {
        bar.style.display = "none";
        bar.style.width = "0%";
    }, 300);
}

window.addEventListener("load", () => {showProgressBar();setTimeout(() => {hideProgressBar();}, 1500);});