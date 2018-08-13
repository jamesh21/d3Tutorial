// source https://scrimba.com/p/pb4WsX/c4WLes8

const api = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2017-12-31&end=2018-04-01'

document.addEventListener("DOMContentLoaded", function(event) {
    fetch(api)
        .then(function(response) { return response.json();})
        .then(function(data) {
            var parsedData = parseData(data);
            drawChart(parsedData.dataPoints, parsedData.bTCValues);
        })
        .catch(function(err) {console.log(err);})
});

function parseData(data) {
    var arr = [];
    var bTCValues = [];
    for (var i in data.bpi) {
        arr.push({
            date: new Date(i),
            value: +data.bpi[i]
        })
        bTCValues.push(+data.bpi[i]);
    }
    var result = {
        dataPoints: arr,
        bTCValues: bTCValues
    }
    return result;
}

function drawChart (data, bTCValues) {
    var mean = d3.mean(bTCValues);
    var deviation = d3.deviation(bTCValues);
    var uCL = calculateSigma(mean, deviation, 3);
    var lCL = calculateSigma(mean, deviation, -3);
    console.log("Mean " + mean);
    console.log("SD " + deviation);
    console.log("UCL " + calculateSigma(mean, deviation, 3));
    console.log("LCL " + calculateSigma(mean, deviation, -3));
    var svgWidth = 1000, svgHeight = 600;
    var margin = { top: 20, right: 20, bottom: 30, left: 50};
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.date)})
        .y(function(d) {return y(d.value)})
        x.domain(d3.extent(data, function(d) { return d.date}));
        //y.domain(d3.extent(data, function(d) { return d.value}));
        y.domain([0, uCL + deviation]);

    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    g.append("g")
        .attr("transform", "translate(0, "+ height +")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("dx", "0.71em")
        .attr("x", width)
        .attr("text-anchor", "end")
        .text("Time (Month/Year)");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    var circles = g.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) { return x(d.date); })
                    .attr("cy", function (d) { return y(d.value); })
                    .attr("r", 4)
                    .on("mouseover", function() {
                        tooltip.style("display", null);
                        d3.select(this)
                            .transition()
                            .style("fill", "red")
                            .attr("r", 12);
                    })
                    .on("mouseout", function() {
                        tooltip.style("display", "none");
                        d3.select(this)
                            .transition()
                            .style("fill", "black")
                            .attr("r", 4);
                    })
                    .on("mousemove", function(d) {
                        var xPos = d3.mouse(this)[0] - 15;
                        var yPos = d3.mouse(this)[1] - 55;
                        tooltip.attr("transform", "translate(" + xPos + "," + yPos +")");
                        tooltip.select("text").text("$" + d.value);
                    });

    var tooltip = svg.append("g")
        .style("display", "none")
        .attr("class", "tooltip");

    tooltip.append("text")
            .attr("x", 15)
            .attr("dy", "1.2em")
            .style("font-size", "1.2em")
            .attr("font-weight", "bold");

    var avgLine = g.append("line")
                    .style("stroke", "black")  // colour the line

                    .attr("x1", 0)     // x position of the first end of the line
                    .attr("y1", y(mean))      // y position of the first end of the line
                    .attr("x2", width)     // x position of the second end of the line
                    .attr("y2", y(mean));    // y position of the second end of the line

    var uCLLine = g.append("line")
                    .style("stroke", "black")  // colour the line
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("x1", 0)     // x position of the first end of the line
                    .attr("y1", y(uCL))      // y position of the first end of the line
                    .attr("x2", width)     // x position of the second end of the line
                    .attr("y2", y(uCL));    // y position of the second end of the line

    var lCLLine = g.append("line")
                    .style("stroke", "black")  // colour the line
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("x1", 0)     // x position of the first end of the line
                    .attr("y1", y(lCL))      // y position of the first end of the line
                    .attr("x2", width)     // x position of the second end of the line
                    .attr("y2", y(lCL));    // y position of the second end of the line
}

function calculateSigma (mean, deviation, numSigma) {
    return (deviation * numSigma) + mean;
}
