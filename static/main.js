///////////////////////////////////////////////////////////////////////////////////////////
// loading display functions


var startLoadingDisplay = function() {
	document.getElementById('loading').style.display = 'block';
}

var endLoadingDisplay = function() {
	document.getElementById('loading').style.display = 'none';
}

var getDateString = function(date) {

	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	if (month < 10) {
		month = '0' + month;
	}
	if (day < 10) {
		day = '0' + day;
	}
	if (hours < 10) {
		hours = '0' + hours;
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}
	
	return minDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/////////////////////////////////////////////////////////////
// query stuff

var all_data;
var hashtag_data;

var filterData = {
	'sentimentSlider' : {
		'min' : 0,
		'max' : 0
	},
	'relevaceUserSlider' : {
		'min' : 0,
		'max' : 0
	},
	'relevacePostSlider' : {
		'min' : 0,
		'max' : 0
	},
	'timestmp' : {
		'min' : '0',
		'max' : '0'
	},
	'keywords' : [],
	'neighbourhoods' : [],
	'sentiment_positivity' : 'n'
}

var runQuery = function (url, query, cbfun) {
	startLoadingDisplay();
	console.log("in runQuery: query is " + query);

	var headers = new Headers();
	headers.append('Content-Type', 'application/json');

	var fetchData = {
		method : 'POST',
		body : JSON.stringify({'query' : query}),
		headers : headers
	}

	fetch(url, fetchData)
		.then(function (resp) {
			return resp.json();
		})
		.then(function(data) {
			cbfun(data);
		})
		.catch(function (error) {
			console.log('Error: ' + error);
		});

	console.log('After fetch call');

}

var runPostsQuery = function (query, cbfun) {
	console.log(query);
	runQuery('/data', query, cbfun);
}

var constructPostsSQL = function() {
	query = "SELECT * FROM posts WHERE ";

	query += `sent_magnitude >= ${filterData.sentimentSlider.min} AND `;
	query += `sent_magnitude <= ${filterData.sentimentSlider.max} AND `;
	query += `post_score >= ${filterData.relevacePostSlider.min} AND `;
	query += `post_score <= ${filterData.relevacePostSlider.max} AND `;
	query += `user_score >= ${filterData.relevaceUserSlider.min} AND `;
	query += `user_score <= ${filterData.relevaceUserSlider.max} AND `;
	query += `timestmp >= '${filterData.timestmp.min}' AND `;
	query += `timestmp <= '${filterData.timestmp.max}' AND `;
	query += `neighbourhood IN (`;

	filterData.neighbourhoods.forEach(function(value, index) {
		query += `\'${value}\'`;
		if ( index + 1 < filterData.neighbourhoods.length) {
			query += ', ';
		}
	});

	query += ') AND ';
	
	filterData.keywords.forEach(function(value) {
		query += `post_text LIKE '%${value}%' AND `
	})

	switch (filterData.sentiment_positivity) {
		case 'n':
			query += `sent_score >= -1 AND sent_score <=1`;
			break;
		case 'pos':
			query += `sent_score > 0 AND sent_score <=1`;
			break;
		case 'neg':
			query += `sent_score >= -1 AND sent_score <0`;
			break;
	}

	return query;
}

var constructHashtagsSQL = function() {
	query = "SELECT * FROM hashtag_occurences WHERE ";

	query += `user_score >= ${filterData.relevaceUserSlider.min} AND `;
	query += `user_score <= ${filterData.relevaceUserSlider.max} AND `;
	query += `timestmp >= '${filterData.timestmp.min}' AND `;
	query += `timestmp <= '${filterData.timestmp.max}' AND `;
	query += `neighbourhood IN (`;

	filterData.neighbourhoods.forEach(function(value, index) {
		query += `\'${value}\'`;
		if ( index + 1 < filterData.neighbourhoods.length) {
			query += ', ';
		}
	});

	query += ')';

	return query;
}

var printData = function(data) {
	all_data = data;
	console.log(data);
}

//////////////////////////////////////////////////////////////////////////
// Slider Stuff

var extremes = {};


/////////////////////////////////////////////////////////////////////////////////////////////
// Initialize filters

var initFilters = async function() {
	var neighbourhoods = ["Broadview", "Chapparal", "Cheddarford", "Downtown", "East Parton", "Easton", "Northwest", "Oak Willow", "Old Town", "Palace Hills", "Pepper Mill", "Safe Town", "Scenic Vista", "Southton", "Southwest", "Terrapin Springs", "West Parton", "Weston", "Wilson Forest", "<Location with-held due to contract>", "UNKNOWN"];
	neighbourhoodsFilter = document.getElementById('neighbourhoodFiler').childNodes[1];

	neighbourhoods.forEach(function(value) {
		neighbourhoodsFilter.innerHTML += `<li><input type=\"checkbox\" checked=checked class=\"nbCheckbox\" value=\"${value}\">${value}</li>`;
	});

	filterData.neighbourhoods = neighbourhoods;

	var initQuery = 'SELECT MIN(sent_magnitude) min_sm, MAX(sent_magnitude) max_sm, MIN (timestmp) min_t, MAX(timestmp) max_t, MIN(user_score) min_us, MAX(user_score) max_us, MIN(post_score) min_ps, MAX(post_score) max_ps FROM posts';
	runQuery("/data", initQuery, function(data) {
		data = data[0];

		extremes = {
			'sentimentSlider' : {
				'min' : data.min_sm,
				'max' : data.max_sm
			},
			'timestmp' : {
				'min' : getDateString(new Date(Date.parse(data.min_t))),
				'max' : getDateString(new Date(Date.parse(data.max_t)))
			},
			'relevaceUserSlider' : {
				'min' : data.min_us,
				'max' : data.max_us
			},
			'relevacePostSlider' : {
				'min' : data.min_ps,
				'max' : data.max_ps
			},
		}

		filterData.sentimentSlider = extremes.sentimentSlider;
		filterData.relevaceUserSlider = extremes.relevaceUserSlider;
		filterData.relevacePostSlider = extremes.relevacePostSlider;
		filterData.timestmp = extremes.timestmp;
		filterData.sentiment_positivity = 'n';

		var sliderIds = ['relevaceUserSlider','relevacePostSlider', 'sentimentSlider'];

		sliderIds.forEach(function(sliderId, index) {
			var slider = document.getElementById(sliderId);
	
			noUiSlider.create(slider, {
				start: [extremes[sliderId].min, extremes[sliderId].max],
				connect: false,
				tooltips: true,
				range: {
						'min': extremes[sliderId].min,
						'max': extremes[sliderId].max
					}
			});
	
			// listener implemented here, didn't work outside
			slider.noUiSlider.on('change', function() {
				
				console.log("sliderId: " + sliderId);

				var values = slider.noUiSlider.get();
				min = values[0];
				max = values[1];
				console.log(`New query: ${min} - ${max}`);
				filterData[sliderId].min = min;
				filterData[sliderId].max = max;
				console.log(filterData);
				runPostsQuery(constructPostsSQL(), filterCB);
			});
		});

		timeSlider = document.getElementById("timeSlider");
		
		var timeMin = Math.floor(Date.parse(extremes["timestmp"].min));
		var timeMax = Math.floor(Date.parse(extremes["timestmp"].max));

		console.log("timeMin: " + timeMin);


		noUiSlider.create(timeSlider, {
			start: [timeMin, timeMax],
			connect: true,
			tooltips: false,
			range: {
					'min': timeMin,
					'max': timeMax
				}
		});

		// listener implemented here, didn't work outside
		timeSlider.noUiSlider.on('change', function() {

			var values = timeSlider.noUiSlider.get();
			min = values[0];
			max = values[1];
			console.log(`New query: ${min} - ${max}`);
			var minDate = new Date(Math.floor(min));
			var maxDate = new Date(Math.floor(max));
			extremes["timestmp"].min = getDateString(minDate);
			extremes["timestmp"].max = getDateString(maxDate);
			console.log(filterData);
			runPostsQuery(constructPostsSQL(), filterCB);
		});

		d3.selectAll(".nbCheckbox").on("change", neighbourhoodsListener);
		d3.selectAll(".spCheckbox").on("change", sentPositivityListener);
		document.getElementById("searchFilterInput").addEventListener("submit", keywordListener);

		endLoadingDisplay();

		runPostsQuery(constructPostsSQL(), filterCB);
	});


	
}

var updatePostsList = function(data) {
	
	var postsList = document.getElementById("postsList");
	postsList.innerHTML = "";

	data.sort(function(first, second) {
		return second.post_score - first.post_score;
	});

	data.forEach(function(value, index) {

		if (index > 50) {
			return;
		}

		var entry = document.createElement('li');
		entry.appendChild(document.createTextNode(`${value.post_score.toFixed(3)} | ${value.post_text}`));
		postsList.appendChild(entry);

		// console.log("before posts list on click")
		// console.log(postsList.childNodes[postsList.childNodes.length - 1]);

		postsList.childNodes[postsList.childNodes.length - 1].addEventListener('click', function(event) {
			console.log("in posts list on click")
			console.log(postsList.childNodes);
            runQuery('/data', `SELECT * FROM repost_occurences WHERE post_id = ${value.id}`, repostCB)
            switchToPostTab(value.post_text);
		})
	});
}

var initSystem = function(){
	initFilters();
};

/////////////////////////////////////////////////////////////////////////////////////////////
// filter listeners

var sliderListener = function(slider) {
	var values = slider.noUiSlider.get();
	min = values[0];
	max = values[1];
	console.log(`New query: ${min} - ${max}`);
	console.log(filterData);
	runPostsQuery(constructPostsSQL(), filterCB);
};

var neighbourhoodsListener = function() {
	var cbnbs = d3.select(this)._groups[0][0];
	var nb = cbnbs.value;

	if(cbnbs.checked){
		filterData.neighbourhoods.push(nb);
		
		console.log(filterData);
		runPostsQuery(constructPostsSQL(), filterCB);
	}
	else{
		var index = filterData.neighbourhoods.indexOf(nb);
		if (index > -1) {
			filterData.neighbourhoods.splice(filterData.neighbourhoods.indexOf(nb), 1);
		
			console.log(filterData);
			runPostsQuery (constructPostsSQL(), filterCB);
		}
	}
};

var sentPositivityListener = function() {

	var is_pos, is_neg

	is_pos = document.getElementById("spCheckboxPos").checked;
	is_neg = document.getElementById("spCheckboxNeg").checked;

	if (is_pos && is_neg) {
		filterData.sentiment_positivity = 'n';
	} else if (!(is_pos || is_neg)) {
		filterData.sentiment_positivity = 'n';
	} else if (is_pos) {
		filterData.sentiment_positivity = 'pos';
	} else if (is_neg) {
		filterData.sentiment_positivity = 'neg';
	}

	console.log(filterData);
	runPostsQuery (constructPostsSQL(), filterCB);
};

var keywordListener = function(event) {
	
	event.preventDefault();

	textbox = document.getElementById("searchFilterInput").childNodes[1];
	keyword = textbox.value;

	if (keyword == "") {
		return;
	}

	var keywordList = document.getElementById("keywordList");
	keywordList.innerHTML = `<li><div class=\"keywordText\">${keyword}</div></li>` + keywordList.innerHTML;

	filterData.keywords.push(keyword);
	textbox.value = "";

	console.log(filterData);
	runPostsQuery (constructPostsSQL(), filterCB);

	if (filterData.keywords.length == 1) {
		var clearButton = document.getElementById("clearKeywordsButton");
		clearButton.addEventListener('click', function(){
			filterData.keywords = [];
			keywordList.innerHTML = ""
			clearButton.style.display = 'none';

			console.log(filterData);
			runPostsQuery (constructPostsSQL(), filterCB);
		});
		clearButton.style.display = 'inline-block';
	}


	console.log(filterData);

	// call query
};


var timeBrushListener = function() {
	// do something, idk
}


/////////////////////////////////////////////////////////////////////////////////////////
// filter runPostsQuery callbacks


var filterCB = function(data) {
	console.log(`Got ${data.length} rows`);
	all_data = data;
	// document.getElementById("mapVisDiv").innerHTML = JSON.stringify(data);

	// runQuery('/data', constructHashtagsSQL(), hashtagCB);
	endLoadingDisplay();
	document.getElementById("mapVis").innerHTML = "";
	renderMapData("mapVis", all_data);
	updatePostsList(data);
}

var hashtagCB = function(data) {
	hashtag_data = data;
	endLoadingDisplay();
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