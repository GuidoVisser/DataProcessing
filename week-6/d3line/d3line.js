/************************
Guido Visser
10199187
************************/

window.onload = function() {

    // set dimensions of canvas
    var margin = {top: 150, right: 50, bottom: 70, left: 80},
        width = 1080 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%Y%m%d").parse,
        bisectDate = d3.bisector(function(d) { return d.date; }).left;
        dateToString = d3.time.format("%e %b");

    // set ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // set line
    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.maximum); });


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
        data.forEach(function (d) {
            d.date = parseDate(d.date)
            d.maximum = +d.maximum / 10
        });

        // scale range of data
        x.domain(d3.extent(data, function (d) {
            return d.date;
        }));

        y.domain([d3.min(data, function (d) {
            return d.maximum})
                , d3.max(data, function (d) {
            return d.maximum
        })]);

        // Add the line path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", line(data))

        // add focus to create mouse interactivity
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        // add circle element to focus to indicate where the focus is on the path
        focus.append("circle")
            .attr("r", 4.5);

        // add background to focus for label y-axis
        focus.append("rect")
            .attr("id", "y_label_background")
            .attr("height", 20)
            .attr("width", 40)
            .attr("transform", "translate(0,-20)")
            .style("fill", "white")
            .style("opacity", 0.4);

        // add background to focus for label x-axis
        focus.append("rect")
            .attr("id", "x_label_background")
            .attr("height", 20)
            .attr("width", 50)
            .attr("transform", "translate(0,-20)")
            .style("fill", "white")
            .style("opacity", 0.4);

        // add line element to focus to trace from path to y-axis
        focus.append("line")
            .attr("id", "line_y")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "grey");

        // add line element to focus to trace from path to x-axis
        focus.append("line")
            .attr("id", "line_x")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "grey");

        // add text element to focus to label y-axis
        focus.append("text")
            .attr("id", "y-label")
            .attr("x", 4)
            .attr("y", -10)
            .attr("dy", ".35em");

        // add text element to focus to label x-axis
        focus.append("text")
            .attr("id", "x-label")
            .attr("x", 4)
            .attr("y", - 10)
            .attr("dy", ".35em");

        // add overlay to detect mouse placement
        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        // function to call whenever mouse moves within overlay
        function mousemove() {

            // invert and bisect data
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            // translate focus to point on path
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.maximum) + ")");

            // draw line to x-axis
            focus.select("#line_x").attr("x1", -x(d.date));

            // draw line to y-axis
            focus.select("#line_y").attr("y1", height - y(d.maximum));

            // relocate background from label y-axis
            focus.select("#y_label_background")
                .attr("x", -x(d.date))

            focus.select("#x_label_background")
                .attr("y", (- y(d.maximum) + height));

            // add text to label x-axis
            focus.select("#x-label").text(d.maximum)
                .attr("transform", "translate(" + -x(d.date) + ",0)")
                .style("font-size", "16");

            // add text to label y-axis
            focus.select("#y-label").text(dateToString(d.date))
                .attr("transform", "translate(0," + (- y(d.maximum) + height) + ")")
                .attr("font-size", "12");
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
            .text("graden celcius");
    });

    // add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 1.5))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .text("Maximum temperature on Schiphol Airport");

    // add subtitle
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2.2))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("In the year 2016");

    // add subtitle
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "end")
        .style("font-size", "14px")
        .text("source: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi");
};