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
            newActiveTab = 0;
            break;
        case "Post":
            newActiveTab = 1;
            break;
        case "Tag":
            newActiveTab = 2;
            break;
    }

    if (newActiveTab == activeTab) {
        return;
    }

    tabButtons[activeTab].classList.remove('tabButtonActive');
    activeTab = newActiveTab;
    tabButtons[activeTab].classList.add('tabButtonActive');

    tabs[activeTab].scrollIntoView({behavior: 'smooth' });

    tabFunctions[activeTab]();
}

mapTabButton.addEventListener('click', onTabButtonClick);
postTabButton.addEventListener('click', onTabButtonClick);
hashtagTabButton.addEventListener('click', onTabButtonClick);


var switchToMapTab = function() {
    mapTabButton.click();
}
var switchToPostTab = function() {
    postTabButton.click();
}
var switchToHashtagTab = function() {
    hashtagTabButton.click();
}