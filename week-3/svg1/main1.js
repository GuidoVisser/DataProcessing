/*
Guido Visser
10199187
*/

// color countries
window.onload = function() {
    changeColor("fr", "darkgreen");
    changeColor("se", "darkcyan");
    changeColor("de", "darkblue");
    changeColor("be", "purple");
}

// changeColor takes a path ID and a color (hex value) and changes that path's fill color
function changeColor(id, color) {
    path = document.getElementById(id);
    path.style.fill = color;
}