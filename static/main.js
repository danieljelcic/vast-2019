var all_data;

d3.csv("/static/data/data.csv", function(data) {
	all_data = data;
	// console.log(all_data);
});

// var request = new Request("http://127.0.0.1:5000/data",{
//         method:"POST",
//         body: JSON.stringify({'query':'SELECT * FROM test_time'}),
//         mode:"cors"
// });
	  
// fetch(request).then(function(response) {
//         console.log("expecting json:");
//         console.log(response.json());
// });

var executeQuery = function(queryString, functionCB) {
	console.log("executeQuery")
	return new Promise(function(resolve, reject) {
		var request = new Request("http://127.0.0.1:5000/data",{
			method:"POST",
			body: `query=${queryString}`,
			mode:"cors"
		});
		
		fetch(request).then(function(response) {
			return response.json();
		}).then(function(resultSet) {
			functionCB(resultSet);
			resolve(1);
		}).catch(function(error) {
			// The following line tells javascript that the promise has failed
			reject(0);
		});
	});
}

var myFunction = function(results) {
	console.log('results: ' + results.json());
}

// executeQuery('SELECT * FROM test_time', myFunction);



var xhttp = new XMLHttpRequest();
xhttp.open("POST", "http://127.0.0.1:5000/data", false);
xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhttp.send('query=SELECT * FROM test_time');
data = JSON.parse(xhttp.responseText);
console.log(data);