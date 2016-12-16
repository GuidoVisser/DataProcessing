// select body
body = d3.select("body")

// add title to body
body.append('text')
    .attr("text-anchor", "left")
    .style("font-size", "28px")
    .style("font-family", "calibri")
    .text("Worldwide CO2 emission in the year 2013");

body.append('text')
    .attr("text-anchor", "left")
    .style("font-size", "20px")
    .style("font-family", "calibri")
    .text(" (in metric tons per capita)");

// add map container to body
var container = body.append("div")
    .attr("id", "map")
    .style("width", "1200px")
    .style("height", "600px")
    .style("position", "relative")

// load data from json file
var emission_data = {}
d3.json("CO2 emission.json", function (error, data) {

    // save data in emission_data
    data.forEach(function(d, i) {
        var name = d.Country_Name
        var code = d.Country_Code;
        var emission_2013 = d[2013];
        dict = {};
        dict["name"] = name
        dict["emission"] = emission_2013
        if (emission_2013 == "") {
            dict["fillKey"] = "no data"
        }
        else if (emission_2013 <= 2.78) {
           dict["fillKey"] = "< 2.78"
        }
        else if (emission_2013 > 2.78 && emission_2013 <= 6.31) {
           dict["fillKey"] = "2.78 - 6.31"
        }
        else if (emission_2013 > 6.31 && emission_2013 <= 10.69) {
            dict["fillKey"] = "6.31 - 10.69"
        }
        else if (emission_2013 > 10.69 && emission_2013 <= 16.39) {
            dict["fillKey"] = "10.69 - 16.39"
        }
        else {
            dict["fillKey"] = "> 16.39"
        }
        emission_data[code] = dict
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
                    return '<div class="hoverinfo"><p><strong>' + geography.properties.name + '</strong></p><p>CO2 emission: ' + data.emission + '</p></div>';
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
        data: emission_data
    });
    map.legend()
});
