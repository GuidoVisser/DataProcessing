/*
Guido Visser
10199187
*/

// Prepare data
data = [];
maxTemp = 0;
minTemp = 0;
loadingData = document.getElementById("rawdata").value.split("\n");
loadingData.forEach(function (d) {
    d = d.split(",");
    d[0] = d[0].slice(0,4) + "-" + d[0].slice(4, 6) + "-" + d[0].slice(6);
    d[0] = new Date(d[0]);
    d[1] = parseInt(d[1]) / 10.0;
    if (d[1] > maxTemp) {
        maxTemp = d[1];
    };
    if (d[1] < minTemp) {
        minTemp = d[1];
    };
    data.push(d);
});
console.log(data, maxTemp, minTemp);


// function to create a function that transforms coordinates
function createTransform(domain, range){
    // domain is a two-element array of the data bounds [domain_min, domain_max]
    // range is a two-element array of the screen bounds [range_min, range_max]
    var alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
	var beta = range[0] - alpha * domain[0];

	return function(x){
		return alpha * x + beta;
	};
}

// select canvas
var canvas = document.getElementById('mycanvas'); // in your HTML this element appears as <canvas id="mycanvas"></canvas>
var ctx = canvas.getContext('2d');

// start drawing
ctx.beginPath();
coor_x_min = 60;
coor_y_max = 60;
ctx.font = "12px serif";
ctx.textAlign = "right";
maxValue = parseInt(maxTemp + 1);
if (minTemp < 0) {
    minValue = parseInt(minTemp - 1);
} else {
    minValue = parseInt(minTemp + 1);
};
ctx.strokeStyle = 'black';
x = coor_x_min;
y = coor_y_max;
ctx.moveTo(x,y);
//ctx.lineTo(x+100, y);

// label y-axis
ctx.save();
ctx.translate(x - 40, y + 260);
ctx.rotate(-Math.PI/2);
ctx.font = "20px serif"
ctx.fillText("Degrees Celcius", x, 0);
ctx.restore();

// draw y-axis
for (i = 0; i < maxValue + Math.abs(minValue); i++) {

    // value on the y-axis
    value = parseInt(maxTemp + 1) - i

    // define origin's position
    if (value == 0) {
        x_origin = x;
        y_origin = y;
    };

    // label values
    ctx.fillText(value, x - 10, y + 5);

    // draw lines
    ctx.lineTo(x - 3, y);
    ctx.moveTo(x, y);
    y += 20;
    ctx.lineTo(x, y);
};

// finish axis
ctx.lineTo(x - 3, y);
ctx.fillText(value - 1, x - 10, y + 5);

//
coor_y_min = y;
ctx.moveTo(x, y);

// transform function
var transform = createTransform([minValue, maxValue], [coor_y_max, y]);

// draw line and x-axis
data.forEach(function (d) {
    x += 3;
    y = y - (transform(d[1]) - coor_y_max);
    ctx.lineTo(x, y);
    y = coor_y_min;

});
coor_x_max = x;

// draw x-axis
y = y_origin
ctx.moveTo(coor_x_min, y);
months = ["Januari", "Februari", "March", "April", "May", "June", "Juli", "August", "September", "October", "November", "December"];
ctx.lineTo(coor_x_min, y - 3);
ctx.fillText(months[0], coor_x_min + 40, y + 20);
interval = (coor_x_max + coor_x_min) / 12;
for (i=0; i < 12; i++) {
    ctx.moveTo(coor_x_min + i * interval, y)
    ctx.lineTo(coor_x_min + (i + 1) * interval, y);
    ctx.lineTo(coor_x_min + (i + 1) * interval, y + 3);
    ctx.fillText(months[i + 1], coor_x_min + (i + 1) * interval + 40, y + 20)
}

// label x-axis
ctx.font = "20px serif"
ctx.fillText("Time of the Year", coor_x_min + 670, coor_y_min + 20);

ctx.stroke();