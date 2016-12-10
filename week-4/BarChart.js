/************************
Guido Visser
10199187
************************/

window.onload = function() {

    // set dimensions of canvas
    var margin = {top: 150, right: 50, bottom: 70, left: 80},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set ranges
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().range([height, 0]);


    // define x-axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues([1860, 1865, 1870, 1875, 1880, 1885, 1890, 1895, 1900, 1905, 1910, 1915, 1920, 1925, 1930, 1935, 1940, 1945, 1950, 1955, 1959]);

    // define y-axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // add tip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span><center><strong>Year: " + d.time + "</strong></center><center>Discoveries: " + d.discoveries + "</center></span>";
        });


    // add svg element to html
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

    // load the data
    d3.json("discoveries.json", function (error, data) {

        // scale range of data
        x.domain(data.map(function (d) {
            return d.time;
        }));

        y.domain([0, d3.max(data, function (d) {
            return parseInt(d.discoveries);
        })]);

        // add x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.7em")
            .attr("dy", "0.7em")
            .attr("transform", "rotate(-50)");

        // add y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -80)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size", "22px")
            .text("Discoveries");

        // add bar chart
        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.time);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.discoveries);
            })
            .attr("height", function (d) {
                return height - y(d.discoveries);
            })

            // show/hide tip
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    });

    // add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 1.5))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .text("Number of significant discoveries per year");

    // add subtitle
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2.2))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("1860-1959");
};