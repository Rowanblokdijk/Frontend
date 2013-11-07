/* Technical breakdown

Namespace SCOREAPP

Self invoking function

	SCOREAPP.settings

	Domready 
		execute -> SCOREAPP.controller

	SCOREAPP.controller
	 	execute -> SCOREAPP.router

	SCOREAPP.router
		execute -> SCOREAPP.page
		execute -> SCOREAPP.utils

	SCOREAPP.page
		execute -> SCOREAPP.directives
		execute -> SCOREAPP.router
		execute -> SCOREAPP.utils
		execute -> SCOREAPP.post
	
	SCOREAPP.directives

	SCOREAPP.post
		execute -> SCOREAPP.utils

	SCOREAPP.utils

*/

//The namespace
var SCOREAPP = SCOREAPP || {};

//A self invoking function
(function () {

	//Constant variables
	SCOREAPP.settings = {

		GAMESCOREURL: "https://api.leaguevine.com/v1/game_scores/",
		RANKINGURL: "https://api.leaguevine.com/v1/pools/?tournament_id=19389&access_token=82996312dc",
		SCHEDULEURL: "https://api.leaguevine.com/v1/games/?tournament_id=19389&pool_id=19222&access_token=9978f73c0b"

	}

	//A controller object meant to start the script when everything is loaded
	SCOREAPP.controller = {

		//Function init is executed at the end of the script
		init: function() {
			//When function init is executed, execute another function init inside SCOREAPP.router to start the script 
			SCOREAPP.router.init();
		}
	};

	SCOREAPP.router = {

		init: function () {

			//Execute a function inside object SCOREAPP.page when the associated href has been added to the URL
			routie({
				
			    '/schedule/:id': function() {
					SCOREAPP.page.schedulePost();
			    },

				'/ranking': function() {
					//Show the loader
					SCOREAPP.utils.loaderShow();
					SCOREAPP.page.ranking();
			    },

			    '/schedule': function() {
			    	SCOREAPP.utils.loaderShow();
			    	SCOREAPP.page.schedule();
			    },

			    //Default
			    '*': function() {
			    	SCOREAPP.page.home();
		    	}
		    });
		},

		//A function adding or removing classes from sections, depending on the data in the URL, when executed by a function inside SCOREAPP.page
		change: function () {

			//Slice the string inside method hash, from object location, into a string starting from the character at index 2 (which is character 3)
			//Variable route contains the outcome
        	var route = window.location.hash.slice(2);
        	
        	//Variable articles contains an array of HTML element articles with attribute data-route  
        	var articles = qwery('article[data-route]'); 

            //Variable article contains a data-route filled with the content of variable route
        	var article = qwery('[data-route=' + route + ']')[0];

        	if (article) {
            	
            	//For all keys from the array inside variable articles
            	for (var i=0; i < articles.length; i++){

            		//Remove class active
            		articles[i].classList.remove('active');
            	}

            	//And add class active to the current section being visited
            	article.classList.add('active');
            	
            }

            //If there isn't any variable route, show the first element in array articles
            if (!route) {
            	articles[0].classList.add('active');
            }

		},

		//For the pages that will been seen when clicking a edit link in the schedule page, there must be a function that doesn't use variable route
		postChange: function () {
        	  
        	var articles = qwery('article[data-route]'); 

        	//Variable article contains data-route="game"
        	var article = qwery('[data-route=game]')[0];

        	if (article) {
            	
            	for (var i=0; i < articles.length; i++){

            		articles[i].classList.remove('active');
            	}

            	article.classList.add('active');
            	
            }

		}

	};

	//An object containing functions which bind the data objects to an HTML element when executed
	SCOREAPP.page = {

		home: function() {
			SCOREAPP.router.change();
		},

		ranking: function () {

			//Get data
			var site = fermata.json(SCOREAPP.settings.RANKINGURL);					
			var data = site.get(function (err, result) {

				//If there isn't any error
				if (!err) {

					console.log(result.objects);

					//Bind result.objects to the HTML object with data-route="ranking"
					Transparency.render(qwery('[data-route=ranking]')[0], result.objects);
					SCOREAPP.router.change();
					//Hide the loader
					SCOREAPP.utils.loaderHide();
					//Make the menu item appear active
					SCOREAPP.utils.navRankingActive();

				}

			});

		},

		schedule: function () {

			//Hide all callbacks than may have been shown in earlier attempts to edit scores 
			SCOREAPP.utils.callbackSendHide();
			SCOREAPP.utils.callback1EmptyHide();
			SCOREAPP.utils.callback2EmptyHide();

			//Get data
			var site = fermata.json(SCOREAPP.settings.SCHEDULEURL);					
			var data = site.get(function (err, result) {

				if (!err) {

					Transparency.render(qwery('[data-route=scheduleData]')[0], result.objects, SCOREAPP.directives.schedule());
					SCOREAPP.router.change();
					SCOREAPP.utils.loaderHide();
					SCOREAPP.utils.navScheduleActive();

				}

			});
		},

		//If function game is executed
		schedulePost: function () {

			//The form has been put inside a variable
			var gamePostForm = qwery('#gamePostForm');
			//If the form has been submitted, execute SCOREAPP.post.post
		    gamePostForm[0].onsubmit = SCOREAPP.post.postGameData;
		    //Execute SCOREAPP.router.postChange wich will change the page
		    SCOREAPP.router.postChange();

		}

	};

    SCOREAPP.directives = {

    	//The directives for the schedule page
        schedule: function() {

			return {

				//The returned value gets assigned to the id of the HTML element with class swipe
				swipe: {
					id: function() {
						//This refers to the data result.objects in SCOREAPP.schedule
						return this.id;
					}
				},

				//The same, but with text
				date: {
					text: function() {
						//Slice start_time from index 0 to index 10, add a comma, and slice start_time again from index 11 to index 16
						return this.start_time.slice(0,10) + ", " + this.start_time.slice(11,16);
					}
				},

				versus: {
					text: function() {
						return this.team_1.name + " vs " + this.team_2.name;
					}
				},

				standing: {
					text: function() {
						return this.team_1_score + " - " + this.team_2_score;
					}
				}
			}
		},

    };

    SCOREAPP.post = {

    	//When the form for posting scores has been submitted, this function gets executed
		postGameData: function() {

			//Show loader
			SCOREAPP.utils.loaderShow();

			//Make some variables that contain HTML elements from the inputs fields of the form
			var team1ScoreInputField = qwery('#gamePostForm [name=team1score]')[0];
			var team2ScoreInputField = qwery('#gamePostForm [name=team2score]')[0];
			var isFinalInputField = qwery('#gamePostForm [name=isfinal]')[0];

			//gameId contains the id that has been added to the URL
			var gameId = window.location.hash.slice(11);

			//The json that will be send
			var json = {
				game_id: gameId,
				team_1_score: team1ScoreInputField.value,
				team_2_score: team2ScoreInputField.value,
				is_final: 'True'
			}

			var site = fermata.json("https://api.leaguevine.com/v1/game_scores/");
			var headers = {
				'Content-type':'application/json',
				'Authorization':'bearer a6abfe991a'
			};

			site.post(headers, json, function () {

					//Hide loader
					SCOREAPP.utils.loaderHide();

					//If both inputfields were empty, which means the post request was bad,
					if(team1ScoreInputField.value == false && team2ScoreInputField.value == false) {

						SCOREAPP.utils.callback1EmptyHide();
						SCOREAPP.utils.callbackSendHide();

						//Show warning text
						SCOREAPP.utils.callback2EmptyShow();

					//Same, but with one input field
					} else if(team1ScoreInputField.value == false || team2ScoreInputField.value == false) {
						
						SCOREAPP.utils.callback2EmptyHide();
						SCOREAPP.utils.callbackSendHide();
						
						//Show warning text
						SCOREAPP.utils.callback1EmptyShow();

					} else {

						SCOREAPP.utils.callback1EmptyHide();
						SCOREAPP.utils.callback2EmptyHide();

						//Show succes text
						SCOREAPP.utils.callbackSendShow();
					}
	
				});

			//Stop the page from refreshing
			return false;
		}
	}


	SCOREAPP.utils = {

		//Succes text when the form has been send
		callbackSend: qwery('p#callbackSend')[0],

		callbackSendShow: function() {

			this.callbackSend.classList.remove('callbackHide');
			this.callbackSend.classList.add('callbackShow');

		},

		callbackSendHide: function() {

			this.callbackSend.classList.remove('callbackShow');
			this.callbackSend.classList.add('callbackHide');

		},

		//Error text when the form hasn't been send
		callback1Empty: qwery('p#callback1Empty')[0],

		callback1EmptyShow: function() {

			this.callback1Empty.classList.remove('callbackHide');
			this.callback1Empty.classList.add('callbackShow');

		},

		callback1EmptyHide: function() {

			this.callback1Empty.classList.remove('callbackShow');
			this.callback1Empty.classList.add('callbackHide');

		},

		//Error text when the form hasn't been send
		callback2Empty: qwery('p#callback2Empty')[0],

		callback2EmptyShow: function() {

			this.callback2Empty.classList.remove('callbackHide');
			this.callback2Empty.classList.add('callbackShow');

		},

		callback2EmptyHide: function() {

			this.callback2Empty.classList.remove('callbackShow');
			this.callback2Empty.classList.add('callbackHide');

		},

		//Make the page that is active appear active in the menu
		navRanking: qwery('nav li#aRanking')[0],

		navSchedule: qwery('nav li#aSchedule')[0],

		navRankingActive: function() {

			this.navRanking.classList.remove('aInactive');
			this.navRanking.classList.add('aActive');

			this.navSchedule.classList.remove('aActive');
			this.navSchedule.classList.add('aInactive');

		},

		navScheduleActive: function() {

			this.navSchedule.classList.remove('aInactive');
			this.navSchedule.classList.add('aActive');

			this.navRanking.classList.remove('aActive');
			this.navRanking.classList.add('aInactive');

		},

		//Loader
		loader: qwery('div.loaderInactive')[0],

		loaderShow: function() {

			this.loader.classList.remove('loaderInactive');
			this.loader.classList.add('loaderActive');

		},

		loaderHide: function() {

			this.loader.classList.remove('loaderActive');
			this.loader.classList.add('loaderInactive');
		
		},

		//The swipe function below gets executed 2 times, therefore I made a controle number with value 1
		controleNumber: 1,

		swipe: function(self) {

			//When the function gets executed, add 1 to the value of the controle number
			this.controleNumber += 1;

			console.log(this.controleNumber);
			//When the controle number is equal to value 3, which means the function is being executed the second time, add a slash + the id op p.swipe that is being swiped, to the URL
			//-> Without the controle number, the id op p.swipe will be added to the URL 2 times, which we don't want
		    if(this.controleNumber == 3) {
				window.location.href += ("/" + self);

				//Reset the controle number to value 1
				this.controleNumber -= 2;
			}
		}
	}

	//When the edit score link in the schedule page, has been swiped, exectue SCOREAPP.utils.swipe
	$$('p.swipe').swipeRight(function() {
		//The id of p.swipe that is being swiped is 
		SCOREAPP.utils.swipe(this.id);
	});

	//When the DOM has been fully load, execute the function domready
	domready(function () {

		// Execute function init inside the controller object
		SCOREAPP.controller.init();

	});

})();