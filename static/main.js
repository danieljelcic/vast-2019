console.log("I'm workingggg")

var all_data;

d3.csv("/static/data/data.csv", function(data) {
        all_data = data;
});

console.log(all_data);