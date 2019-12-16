// data - lists of reposts
var renderPostData = function(divtag, data){
    console.log("in renderPostData");
    console.log(data);
    var nbrhoods = ["Palace Hills","Northwest", "Old Town", "Safe Town", "Southwest", "Downtown", "Wilson Forest", "Scenic Vista", "Broadview", "Chapparal", "Terrapin Springs", "Cheddarford", "Easton", "Weston", "Southton", "Oak Willow", "East Parton", "West Parton"];
        // var createviz = function(data) {
        //     var repost_data = data["reposts"];
            
            // var get_post = function(pdata){
            //     post_data = pdata;
                // post_text(post_data);
                
            // }
            // runQuery(constructSQL_post(postID),get_post);
        // }

        // createviz();

        // var post_text = function(data){

        //     var node = document.createElement("P");        
        //     var textnode = document.createTextNode(`${data[0].post_text}`); 
        //     node.appendChild(textnode);

        //     document.getElementById("post-text").appendChild(node);
        // }
            var categories =[];

             nbrhoods.forEach((element) =>{
                var val = {}
                val["occurences"] = 0;
                val["nbrhood"] = element;
                categories.push(val)
            });

            data.forEach((element) => {
                categories.forEach((marker, i) => {
                if(categories[i][`nbrhood`] == element.neighbourhood){
                    categories[i].occurences++;
                }
            })

            });
        

            console.log("categories: ", categories)

            //--------------- BEGIN D3 ---------
            // var data = categories;

            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 500 - margin.left - margin.right,
                height = 350 - margin.top - margin.bottom;

                // set the ranges
                var x = d3.scaleBand()
                        .range([0, width])
                        .padding(0.1);

                var y = d3.scaleLinear()
                        .range([height, 0]);

                var svg = d3.select(`#${divtag}`).append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
                x.domain(categories.map(function(d) { return d.nbrhood; }));
                y.domain([0, d3.max(categories, function(d) { console.log(d.occurences); return d.occurences; })]);


                svg.selectAll(".bar")
                    .data(categories)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.nbrhood); })
                    .attr("width", x.bandwidth())
                    .attr("y", function(d) { return y(d.occurences); })
                    .attr("height", function(d) { console.log(d.occurences); return height - y(d.occurences); })
                    .attr("fill", "rgb(150, 14, 14)");

                // add the x Axis
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", "-.55em")
                    .attr("transform", "rotate(-60)" );

                // add the y Axis
                svg.append("g")
                    .call(d3.axisLeft(y));
            
        }
    