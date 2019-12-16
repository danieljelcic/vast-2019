var all_data;

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

var min, max;
var testSlider = document.getElementById('testSlider');
console.log(testSlider);

noUiSlider.create(testSlider, {
	start: [-1, 1],
	connect: false,
  	tooltips: true,
	range: {
			'min': -1,
			'max': 1
		   }
});

// Runs new SQL query based on user updates to humidity slider
testSlider.noUiSlider.on('change', function(){
	var values = testSlider.noUiSlider.get();
	min = values[0];
	max = values[1];
	console.log(`New query: ${min} - ${max}`);
	runQuery(constructSQL(), printData);
});

var constructSQL = function() {
	return `SELECT * FROM posts WHERE sent_score > ${min} AND sent_score < ${max}`
}

var printData = function(data) {
	all_data = data;
	console.log(data);
}



//////////////////////////////////////////////////////////////////////////////////////////////



	
	// var xhttp = new XMLHttpRequest();
	// xhttp.open("POST", "/data", false);
	// xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// xhttp.send('query=' + query);
	// data = JSON.parse(xhttp.responseText);
	// // console.log(data);
	// cbfun(data);


//////////////////////////////////////////////////////////////////////////////////////////////


// var dataset;

// var executeQuery = function(queryString, functionCB) {
//     console.log("executeQuery")
//       return new Promise(function(resolve, reject) {
// 	  var request = new Request("/test",{
// 	      method:"GET",
// 	    //   body: 'query=' + queryString,
// 	    //   mode:"cors"
// 	  });
	  
// 	  fetch(request).then(function(response) {
// 	      return response.json();
// 	  }).then(function(resultSet) {
// 	      functionCB(resultSet);



// 	      resolve(1);
// 	  }).catch(function(error) {
// 		  // The following line tells javascript that the promise has failed
// 		  console.log('very sad story');
// 	      reject(0);
// 	  });
//       });
//   }


// var myFunction = function(resultSet) {
// 	console.log("myFunction")
// 	dataset = resultSet;
// 	console.log(dataset);
// }

// executeQuery('SELECT * FROM posts LIMIT 10', myFunction);