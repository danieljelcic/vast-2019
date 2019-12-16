

/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

StackedAreaChart = function(_parentElement, _data){
    console.log("Lpppp")
	this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling
    // DEBUG RAW DATA
    console.log(this.data);
    this.initVis();
}

// Initialize visualization (static content, e.g. SVG area or axes)
StackedAreaChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
       .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Overlay with path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);


    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.Year; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Get data categories
    var dataCategories = colorScale.domain();

	// TO-DO: Initialize stack layout with the food and drink categories
    vis.stack = d3.stack()
                .keys(dataCategories)
                .value(function(d, key){return d[key];})
            
    //Stack data:
    vis.stackedData = vis.stack(vis.data);
    // console.log("StackedData: ", vis.stackedData)

    // TO-DO: Build the stacked stacked area layout
    // This creates the dimensions to render the pretty layers for each category
    // Try to read up on the d3.area function and its paramters.

    vis.area = d3.area()
        .x(function(d, i, j) {return vis.x(d.data.Year);})
        .y0(function(d) { return vis.y(d[0]);})
        .y1(function(d) { return vis.y(d[1]);});
        

    // Basic area layout - creates dimensions for basic area chart
    vis.basicArea = d3.area()
        .x(function (d) { return vis.x(d.data.Year); })
        .y0(vis.height)
        .y1(function (d) { return vis.y(d[1] - d[0]); });

    // Tooltip placeholder
        vis.tooltip = vis.svg.append("text")
        .attr("class", "focus")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", ".35em")




	// (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function () {

    var vis = this;
    var dataCategories = colorScale.domain();
    // When page first loaded, no data wrangling/filtering needed

    //If data is filtered with brushing of the timeline...
    if (vis.filter) {
        var indexOfFilter = dataCategories.findIndex(function (d) { return d == vis.filter });
        vis.displayData = [vis.stackedData[indexOfFilter]];
    }
    else {
        vis.displayData = vis.stackedData;
    }
    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function () {
    var vis = this;

    // Update domain
    vis.y.domain([0, d3.max(vis.displayData, function (d) {
        return d3.max(d, function (e) {
            if (vis.filter) {
                return e[1] - e[0];
            }
            else {
                return e[1];
            }
        });
    })
    ]);

    var dataCategories = colorScale.domain();

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function (d, i) {
            if (vis.filter) {
                var indexOfFilter = dataCategories.findIndex(function (d) { return d == vis.filter });
                return colorScale(dataCategories[indexOfFilter]);
            }
            else {
                return colorScale(dataCategories[i]);
            }
        })
        .attr("d", function (d) {
            if (vis.filter)
                return vis.basicArea(d);
            else
                return vis.area(d);
        })



    // TO-DO: Update tooltip text:
    // This isn't a conventional tool tip that moves with the mouse, 
    // This is a static label that populates at the top left of the chart
    // See demo for details

    d3.selectAll("path")
        .on("mouseover", function(d){
            vis.tooltip.html(d.key)
                    .transition()
                    .duration(200)
                     .style("opacity", 0.9);

        })
        .on("mouseout", function(d){
            vis.tooltip.style("opacity", 0)
                        .transition()
                        .duration(500);
        });


	categories.exit().remove();


	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}
