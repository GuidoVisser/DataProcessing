/************************
Guido Visser
10199187
************************/

window.onload = function() {

    // set dimensions of canvas
    var margin = {top: 150, right: 80, bottom: 70, left: 80},
        width = 1080 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%Y%m%d").parse,
        bisectDate = d3.bisector(function(d) { return d.date; }).left,
        dateToString = d3.time.format("%e %b");

    // set ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // set line for maximum temperature
    var line_maximum = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.maximum); });

    // set line for minimum temperature
    var line_minimum = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.minimum); });

    // set line for average temperature
    var line_average = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.average); });


    // define x-axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(12);

    // define y-axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // add svg element to html
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // load the data
    d3.json("../Temperatuur Schiphol 2016.json", function (error, data) {

        // group data
        data.forEach(function (d) {
            d.date = parseDate(d.date)
            d.maximum = +d.maximum / 10
            d.minimum = +d.minimum / 10
            d.average = +d.average / 10
        });

        // scale range of data
        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([d3.min(data, function (d) {
            return d.minimum})
                , d3.max(data, function (d) {
            return d.maximum
        })]);

        // Add line path for maximum
        svg.append("path")
            .attr("id", "maximum")
            .attr("data-legend", "highest temperature")
            .attr("class", "line")
            .attr("d", line_maximum(data))
            .attr("stroke", "darkcyan");

        // Add line path for minimum
        svg.append("path")
            .attr("id", "minimum")
            .attr("data-legend", "lowest temperature")
            .attr("class", "line")
            .attr("d", line_minimum(data))
            .attr("stroke", "darkgreen");

        // Add line path for average
        svg.append("path")
            .attr("id", "average")
            .attr("data-legend", "average temperature")
            .attr("class", "line")
            .attr("d", line_average(data))
            .attr("stroke", "darkblue");

        // create focus element
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        // add line-indicators to focus
        var circles = ["circle_maximum", "circle_minimum", "circle_average"];
        circles.forEach( function(i) {
            focus.append("circle")
                .attr("id", i)
                .attr("r", 3);
        });

        // add background for y_labels to focus
        var rectangles = ["y_label_background_maximum", "y_label_background_minimum", "y_label_background_average"]
        rectangles.forEach( function(i) {
            focus.append("rect")
                .attr("transform", "translate(-20," + (-height - 30) + ")")
                .attr("id", i)
                .attr("height", 20)
                .attr("width", 40)
                .attr("rx", "5")
                .attr("ry", "5");
        });

        // add background to focus for label x-axis
        focus.append("rect")
            .attr("id", "x_label_background")
            .attr("height", 20)
            .attr("width", 50)
            .attr("transform", "translate(0,-20)")
            .style("fill", "white")
            .style("opacity", 0.4);

        // add line element to focus, that traces from path to y_axis
        var y_lines = ["y_line_maximum", "y_line_minimum", "y_line_average"]
        y_lines.forEach( function (i) {
            focus.append("line")
                .attr("id", i)
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5")
                .attr("stroke", "black");
        });

        // add vertical line element indicating x value to focus
        focus.append("line")
            .attr("id", "x_line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "darkslategrey");

        // add text element y_labels to labels
        var x_labels = ["y_label_maximum", "y_label_minimum", "y_label_average"]
        x_labels.forEach( function (i) {
            focus.append("text")
                .attr("transform", "translate(-20," + (-height - 20) + ")")
                .attr("id", i)
                .attr("dy", ".35em")
                .style("fill", "white");
        });

        // add text element for x_label to focus
        focus.append("text")
            .attr("transform", "translate(5,-10)")
            .attr("id", "x_label")
            .attr("dy", ".35em");

        // add overlay to track mousemovement
        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", (height + 40))
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        // function to call when mouse moves within overlay
        function mousemove() {

            // invert and bisect data
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            // move focus to (x,y) position according to mouses x value
            focus.attr("transform", "translate(" + x(d.date) + "," + height + ")");


            // lock line-indicators to line
            focus.select("#circle_maximum")
                .attr("transform", "translate(0," + (- height + y(d.maximum)) + ")");
            focus.select("#circle_minimum")
                .attr("transform", "translate(0," + (- height + y(d.minimum)) + ")");
            focus.select("#circle_average")
                .attr("transform", "translate(0," + (- height + y(d.average)) + ")");

            // draw lines from path to axes
            focus.select("#x_line")
                .attr("y1", -height);

            focus.select("#y_line_maximum")
                .attr("x1", -x(d.date))
                .attr("y1", y(d.maximum)- height)
                .attr("y2", y(d.maximum)- height);

            focus.select("#y_line_minimum")
                .attr("x1", -x(d.date))
                .attr("y1", y(d.minimum)- height)
                .attr("y2", y(d.minimum)- height);

            focus.select("#y_line_average")
                .attr("x1", -x(d.date))
                .attr("y1", y(d.average)- height)
                .attr("y2", y(d.average)- height);


            // put background for labels y-axis in the right place
            focus.select("#y_label_background_maximum")
                .attr("x", 60)
                .attr("fill", "darkcyan");

            focus.select("#y_label_background_minimum")
                .attr("x", -60)
                .attr("fill", "darkgreen");

            focus.select("#y_label_background_average")
                .attr("fill", "darkblue");

            // put labels y-axis in the right place
            focus.select("#y_label_maximum").text(d.maximum)
                .attr("x", 65)
                .style("font-size", "16");

            focus.select("#y_label_minimum").text(d.minimum)
                .attr("x", -55)
                .style("font-size", "16");

            focus.select("#y_label_average").text(d.average)
                .attr("x", 5)
                .style("font-size", "16");

            // add text to label x-axis
            focus.select("#x_label").text(dateToString(d.date))
                .style("font-size", "12");
          }

        // add x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.7em")
            .attr("dy", "0.7em")
            .attr("transform", "rotate(-20)");

        // add y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -80)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size", "16px")
            .text("Degrees Celcius");
    });

    // add legend
    legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","20px")
        .attr("data-style-padding",15)
        .call(d3.legend)

    // show legend
    setTimeout(function() {
        legend.call(d3.legend)
    })

    // add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 1.5))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .text("Temperature on Schiphol Airport per day");

    // add subtitle
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2.2))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("In year 2016");

    // add source
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "end")
        .style("font-size", "14px")
        .text("source: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi");
};