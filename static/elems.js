var mapTabButton = document.getElementById('mapTabButton');
var postTabButton = document.getElementById('postTabButton');
var hashtagTabButton = document.getElementById('hashtagTabButton');
tabButtons = [mapTabButton, postTabButton, hashtagTabButton];

var mapTab = document.getElementById('mapVisDiv');
var postTab = document.getElementById('postVisDiv');
var hashtagTab = document.getElementById('hashtagVisDiv');
tabs = [mapTab, postTab, hashtagTab];

var tabFunctions = [
    function() {
        console.log("Switched to Map tab");
    },
    function() {
        console.log("Switched to Post tab");
    },
    function() {
        console.log("Switched to Hashtag tab");
    }
    
];

var activeTab = 0;

tabButtons[activeTab].classList.add('tabButtonActive');

var onTabButtonClick = function(event) {

    var newActiveTab;

    switch(this.innerText) {
        case "Map":
            switchToMapTab();
            break;
        case "Post":
            var topPost = getTopPost(all_data);
            runQuery('/data', `SELECT * FROM repost_occurences WHERE post_id = ${topPost.id}`, repostCB)
            switchToPostTab(topPost.post_text);
            break;
        case "Tag":
            switchToHashtagTab(0);
            break;
    }
}

var repostCB = function (data) {
    // renderPosts(data);
    console.log("got reposts!");
    console.log(data);
    endLoadingDisplay();
}

mapTabButton.addEventListener('click', onTabButtonClick);
postTabButton.addEventListener('click', onTabButtonClick);
hashtagTabButton.addEventListener('click', onTabButtonClick);


var switchToMapTab = function() {
    var newActiveTab = 0;

    if (newActiveTab == activeTab) {
        return;
    }

    tabButtons[activeTab].classList.remove('tabButtonActive');
    activeTab = newActiveTab;
    tabButtons[activeTab].classList.add('tabButtonActive');

    tabs[activeTab].scrollIntoView({behavior: 'smooth' });

    tabFunctions[activeTab]();
}
var switchToPostTab = function(post_text) {
    var newActiveTab = 1;

    if (newActiveTab == activeTab) {
        return;
    }

    tabButtons[activeTab].classList.remove('tabButtonActive');
    activeTab = newActiveTab;
    tabButtons[activeTab].classList.add('tabButtonActive');

    document.getElementById("postBodyTitle").innerText = `"${post_text}"`;

    tabs[activeTab].scrollIntoView({behavior: 'smooth' });

    tabFunctions[activeTab]();
}
var switchToHashtagTab = function(hashtagID) {
    var newActiveTab = 2;

    if (newActiveTab == activeTab) {
        return;
    }

    tabButtons[activeTab].classList.remove('tabButtonActive');
    activeTab = newActiveTab;
    tabButtons[activeTab].classList.add('tabButtonActive');

    // var hashtagText = all_data[0]["post_text"];
    // document.getElementById("postBodyTitle").innerText = `"${postText}"`;

    tabs[activeTab].scrollIntoView({behavior: 'smooth' });

    tabFunctions[activeTab]();
}

var getTopPost = function(all_data) {
    var maxScore = 0;
    var postObj = all_data[0];

    all_data.forEach(function(post) {
        if (post.post_score > maxScore) {
            maxScore = post.post_score;
            postObj = post;
        }
    });

    return postObj;
}