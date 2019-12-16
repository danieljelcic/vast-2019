
var runQuery = function (query, cbfun) {
    console.log("in runQuery: query is " + query);

    var url = '/data';

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var fetchData = {
        method : 'POST',
        body : JSON.stringify({'query' : query}),
        headers : headers
    }

    fetch(url, fetchData)
        .then((resp) => resp.json())
        .then(function(data) {
            cbfun(data);
        })
        .catch(function (error) {
            console.log('Error: ' + Error);
        });

    console.log('After fetch call');

    }

        var nbrhoods = ["Palace Hills","Northwest", "Old Town", "Safe Town", "Southwest", "Downtown", "Wilson Forest", "Scenic Vista", "Broadview", "Chapparal", "Terrapin Springs", "Cheddarford", "Easton", "Weston", "Southton", "Oak Willow", "East Parton", "West Parton"];


        //---------------- StackedAreaChart Funcitons -------------------//
        StackedAreaChart = function(_parentElement, _data){
            this.parentElement = _parentElement;
            this.data = _data;
            this.displayData = []; // see data wrangling
            // DEBUG RAW DATA
            this.initVis();
        }

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

            console.log(vis.svg)
        
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
        
            // d3.selectAll("path")
            //     .on("mouseover", function(d){
            //         vis.tooltip.html(d.key)
            //                 .transition()
            //                 .duration(200)
            //                  .style("opacity", 0.9);
        
            //     })
            //     .on("mouseout", function(d){
            //         vis.tooltip.style("opacity", 0)
            //                     .transition()
            //                     .duration(500);
            //     });
        
            categories.exit().remove();
        
            // Call axis functions with the new domain 
            vis.svg.select(".x-axis").call(vis.xAxis);
            vis.svg.select(".y-axis").call(vis.yAxis);
        }
        //------------------------------------------------------------------- //

        var constructSQL = function() {
            return `SELECT * FROM repost_occurences WHERE post_ID = ${6942}`;
        }


        var constructSQL_post = function(id) {
            return `SELECT * FROM posts WHERE ID = ${6942}`;
        }

        var createviz = function(data) {
            var repost_data = data;

            var postID = data[0].post_id;
            var post_data = null;

            var get_post = function(pdata){
                post_data = pdata
                
                post_text(post_data);
                create(repost_data);
            }
            runQuery(constructSQL_post(postID),get_post);
        }
        runQuery(constructSQL(), createviz);


        var post_text = function(data){

            var node = document.createElement("H2");        
            var textnode = document.createTextNode(`${data[0].post_text}`); 
            node.appendChild(textnode);

            document.getElementById("post-text").appendChild(node);
        }

        var create = function(repost_data){
            
            var layers = []
            var categories =[];

            repost_data.forEach((element, i) =>{
                categories[i]= {};
                nbrhoods.forEach(element =>{
                    categories[i][`${element}`] = 0;
                })
                categories[i][`Year`] = "";
            });


            repost_data.forEach((element, i) => {
                var year = new Date(element.timestmp.toString());
                
                categories[i][`${element.neighbourhood}`]++;
                categories[i][`Year`] = year;
            });

            layers.push(categories)
            areachart = new StackedAreaChart("post-viz", layers);
            console.log(areachart)
        }