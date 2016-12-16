/*
Guido Visser
10199187

TODO:
slider moet nog 'on click' de map refreshen
tooltip voor slider
slider moet de kleur van het geselecteerde land weer groen maken

*/

// starting year for map
var year = 2013,

// select body
body = d3.select("body")

// set dimensions of canvas
var margin = {top: 50, right: 50, bottom: 70, left: 80},
    width = 1400 - margin.left - margin.right,
    height = 300  - margin.top - margin.bottom;

// set ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height, 0]);


// define x-axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickValues([1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015]);

// define y-axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// add tip
var barChartTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<span><center><strong>Year: " + d.year + "</strong></center><center>CO2 emission: " + d.emission + "</center></span>";
    });

// add svg element to html
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(barChartTip);

// add map container to body
var container = body.append("div")
    .attr("id", "map")
    .style("width", width + "px")
    .style("height", height + 400 + "px")
    .style("position", "absolute")
    .style("top", "450px")

// draw map
renderMap(year);

// make slider
slider = d3.slider()
    .on("slideend", function(event, value) {
        renderMap(value);
        document.getElementById("title year").innerHTML = value;
    })
    .axis(true)
    .step(1)
    .min(1960)
    .max(2015);

d3.select("wrapper").style("width", width);
d3.select('#slider1').call(slider);

// show axes
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.7em")
    .attr("dy", "0.7em")
    .attr("transform", "rotate(-50)");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-size", "20px")
    .text("CO2 emission")

// function that creates the barchart
function createBarchart(data, country) {

    // remove old barchart
    svg.selectAll("*").remove();
        local_data = data[country]["data"]

   // scale range of data
    x.domain(local_data.map(function (d) {
        return d.year;
    }));
    var max_y = d3.max(local_data, function (d) {
            return parseInt(d.emission);
        });
    if (max_y < 23) {
        y.domain([0, 23]);
    } else {
        y.domain([0,max_y]);
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
        .attr("transform", "rotate(-30)");

    // add y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -20)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "20px")
        .text("CO2 emission")

    // add bar chart
    svg.selectAll("bar")
        .data(local_data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            if (y(d.emission)) {
                return y(d.emission);
            }
        })
        .attr("height", function (d) {
            if (y(d.emission)) {
                return height - y(d.emission);
            }
        })

        // show/hide tip
        .on('mouseover', barChartTip.show)
        .on('mouseout', barChartTip.hide)

        // when user clicks on bar, render new map with corresponding year
        .on('click', function(d) {
            document.getElementById("title year").innerHTML = d.year;
            slider.value(d.year);
            renderMap(d.year, country);
        });
};


// function that renders the datamap
function renderMap(time, selected_country) {

    // remove old map
    if (d3.select("map")) {
        container.selectAll("*").remove()
    }

    // load data from json file
    var emission_data = {}
    d3.json("CO2 emission.json", function (error, data) {

        // save data in emission_data
        data.forEach(function(d, i) {
            var name = d.Country_Name;
            var code = d.Country_Code;
            var emission = d[time];
            dict = {};
            dict["name"] = name;

            // set country colors and fillkeys
            if (emission == "") {
                dict["fillKey"] = "no data";
                dict["color"] = "black"
            }
            else if (emission <= 2.78) {
               dict["fillKey"] = "< 2.78";
               dict["color"] = "#feedde"
            }
            else if (emission > 2.78 && emission <= 6.31) {
               dict["fillKey"] = "2.78 - 6.31";
               dict["color"] = "#fdbe85"
            }
            else if (emission > 6.31 && emission <= 10.69) {
                dict["fillKey"] = "6.31 - 10.69";
                dict["color"] = "#fd8d3c"
            }
            else if (emission > 10.69 && emission <= 16.39) {
                dict["fillKey"] = "10.69 - 16.39";
                dict["color"] = "#e6550d"
            }
            else {
                dict["fillKey"] = "> 16.39";
                dict["color"] = "#a63603"
            };

            // set data in json format that can be read by createBarchart()
            var emission_json = [];
            for (year in d) {
                var emission_dict = {};
                if (year.length == 4) {
                    emission_dict["year"] = year;
                    emission_dict["emission"] = d[year];
                };
                emission_json.push(emission_dict);
            };
            dict["data"] = emission_json;

            // save all data in emission_data
            emission_data[code] = dict;
        });

        // create datamap
        var map = new Datamap({
            scope: 'world',
            element: document.getElementById('map'),
            projection: 'mercator',
            geographyConfig: {
                borderColor: 'black',
                highlightFillColor: 'white',
                highlightBorderColor: 'black',
                highlightBorderWidth: 2,
                highlightBorderOpacity: 1,
                popupTemplate: function(geography, data) {
                    if (data.fillKey != "no data") {
                        return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
                    }
                }
            },
            fills: {
                defaultFill: '#000000',
                "< 2.78": "#feedde",
                "2.78 - 6.31" : "#fdbe85",
                "6.31 - 10.69" : "#fd8d3c",
                "10.69 - 16.39" : "#e6550d",
                "> 16.39" : "#a63603",
                "no data" : "black"
            },
            data: emission_data,

            // when user clicks on country, color country and make barChart for corresponding country
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    createBarchart(emission_data, geography.id);
                    renderMap(time, geography.id)
                })
            }
        });

        if (typeof selected_country !== "undefined") {
            local_dict = {};
            local_dict[selected_country] = "#006400";
            map.updateChoropleth(local_dict);
        }

        // create legend
        map.legend()
    });
};