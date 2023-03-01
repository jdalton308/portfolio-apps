
// CONFIG
// =======================================

var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
	$routeProvider
		.when('/', {
			templateUrl: '/views/landing.html',
			controller: 'landingCntrl'
		})
		.when('/question', {
			templateUrl: '/views/question.html',
			controller: 'questionsCntrl'
		})
		.when('/result', {
			templateUrl: '/views/result.html',
			controller: 'resultCntrl'
		})
		.when('/share', {
			templateUrl: '/views/share.html',
			controller: 'shareCntrl'
		})
		.when('/wrong', {
			templateUrl: '/views/wrong.html',
			controller: 'wrongCntrl'
		})
		.when('/nobowls', {
			templateUrl: '/views/nobowls.html',
			controller: 'noBowlsCntrl'
		})
		.when('/riddleover', {
			templateUrl: '/views/over.html',
			controller: 'overCntrl'
		})
		.otherwise({
			redirectTo: '/'
		});

});

app.run(function($location, $rootScope){

	// If user has not already started on the landing page, and set the 'allowAccess' to true, redirect them there
	$rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
		if (!$rootScope.allowAccess) {
			$location.url('/');
		}
	});

	// Google Analytics for each page view
	// $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl){
	// 	_gaq.push(['_trackPageview', $location.path()]);
	// });


});



// FACTORIES
// ===================================


app.factory('Lang', ['$http', function($http){

	// Determine the current day of the promotion (0-4);
	var startMonth = 10;
	var startDay = 5;
	var timezoneDiff = (new Date().getTimezoneOffset() / 60); // returns the difference between the current time and UTC - this should return 7 for PST
	var startTimeOffset = 7; // we want this to start 7 hours off Midnight UTC (Midnight PST)

	var startDate = Date.UTC(2015, (startMonth - 1), startDay, startTimeOffset);
	var today = new Date();
	var today = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds() ); // Basically local time to PDT, but on UTC

	// var timeDiff = Math.floor( (today - startDate) / (1000*60*60*24) );
	var timeDiff = 2;

	return {
		get: function(){
			return $http.get('/js/lang.json'); // returns a promise
		},
		day: function() {
			return timeDiff;
		}
	}
}]);

app.factory('WrongCounter', function(){
	// count the number of tries a user goes through

	var tryLimit = 3;
	var tryCount = 0;

	return {
		getCount: function() {
			return tryCount;
		},
		add: function() {
			tryCount++;
			return tryCount;
		}
	}
});

app.factory('Vibes', ['$http', function($http){

	// var proxyUrl = 'http://api-proxy.chipotle.com/shk-riddle-sweepstakes/';

	// var availUrl = proxyUrl + 'available';
	// var signupUrl = proxyUrl + 'sign-up';

	return {
	// 	checkAvailable: function() {
	// 		return $http.get(availUrl); // returns promise
	// 	},
	// 	signUp: function(json) {

	// 		return $http.post(signupUrl, json, {
	// 			headers: {
	// 				'Content-Type': 'text/plain'
	// 			}
	// 		}); // returns promise

	// 	}
	}
}]);

app.factory('Analytics', [function() {
	return {
// 		trackQuestion: function(questionNum, label) {
// 			// label: 'started', 'answered', 'restarted', 'sweeps submission'
// 			return _gaq.push(['_trackEvent', 'riddle', questionNum, label]);
// 		},
// 		trackAnswer: function(questionNum, label) {
// 			// label: 'right' || 'wrong'
// 			return _gaq.push(['_trackEvent', 'riddle', 'question-'+questionNum+'-answer', label]);
// 		},
// 		trackShare: function(questionNum, shareType) {
// 			// shareTypes: 'facebook' || 'twitter'
// 			return _gaq.push(['_trackEvent', 'riddle', 'question-'+questionNum+'-share', shareType]);
// 		}
	}
}]);



// CONTROLLERS
// ===========================================


app.controller('landingCntrl', ['$scope', '$location', '$route', '$rootScope', 'Lang', 'Vibes', 'Analytics', function($scope, $location, $route, $rootScope, Lang, Vibes, Analytics){

	// LANDING PAGE ////

	var promoDay = Lang.day();
	$scope.devStartDay = promoDay;
	$scope.sending = false;

	// Pull in the language data
	var lang;

	Lang.get().then(
		function(response){
			lang = response.data.home;

			// Set language based on whether promo has started, or go to 'Promo Over' page
			if (promoDay < 0) {
				$scope.lang = lang[1]; // see lang.json file
				$scope.buttonDisabled = true;
			} else if (promoDay >= 0 && promoDay < 5) {
				$scope.lang = lang[0];
				$scope.buttonDisabled = false;
			} else {
				$rootScope.allowAccess = true;
				$location.url('/riddleover');
			}

		}, 
		function(err) {
			console.error('Error getting language data: '+ err);
		});


	$scope.beginGame = function() {
		// allow navigation through app, since started on landing page
		$rootScope.allowAccess = true;

		$scope.sending = true;

		// Vibes.checkAvailable().then(
		// 	function(response){
				// Google Analytics
				// Analytics.trackQuestion(promoDay.toString(), 'started');

				$location.url('/question');
			// },
			// function(err){
			// 	// out of offers
			// 	if (promoDay == 4) {
			// 		$location.url('/riddleover');
			// 	} else {
			// 		$location.url('/nobowls');
			// 	}
			// });
	};

}]);


app.controller('overCntrl', ['$scope', '$location', '$http', 'Lang', 'Vibes', 'Analytics', function($scope, $location, $http, Lang, Vibes, Analytics){

	// PROMOTION OVER PAGE ////

	// check if form filled after all fields touched
	$scope.isFieldEmpty = function(form) {
		if (form.email.$touched &&
			form.zip.$touched
			){
			// all fields have been hit
			if (form.$error.required) {
				return true;
			}
		}
	}


	// Form Submission
	$scope.submitError = null;
	// $scope.submitText = 'SUBMIT';
	var disableSubmit = false
	$scope.sending = false;

	// The logic here was interpreted from the main.js file
	$scope.emailSignup = function() {
		$scope.sending = true;
		// $scope.submitText = 'Sending...';

		var baseUrl = 'http://api-proxy.chipotle.com/shophouseupdates/';
		var params = '?e=' + $scope.user.e + '&z=' + $scope.user.z;

		var submitUrl = baseUrl + params;

		$http.get(submitUrl).then(
			function(resp){
				$scope.sending = false;
				// $scope.submitText = 'Success';
				window.location.href = '/thank-you.html';
			},
			function(err){
				$scope.sending = false;
				// $scope.submitText = 'SUBMIT';
				$scope.submitError = err.data.error;
			}
		);
	};

	// Disable button if form not filled or 'disableSubmit' is set
	$scope.submitDisabled = function() {
		if (!$scope.submitForm.$valid ||  disableSubmit || $scope.sending) {
			return true;
		} else {
			return false;
		}
	}


	// Google Analytics
	$scope.trackFacebook = function() {
		// Analytics.trackShare(dayNumber.toString(), 'facebook');
	};
	$scope.trackTwitter = function() {
		// Analytics.trackShare(dayNumber.toString(), 'twitter');
	};

}]);


app.controller('questionsCntrl', ['$scope', '$location', 'Lang', 'Vibes', 'Analytics', 'WrongCounter', function($scope, $location, Lang, Vibes, Analytics, WrongCounter){

	// RIDDLE PAGE ////

	var dayNumber = Lang.day();


	// check if bowls are still available
	// Vibes.checkAvailable().then(
	// 	function(response){
	// 		// still offers, so do nothing
	// 		return true;
	// 	},
	// 	function(err){
	// 		// out of offers
	// 		if (dayNumber == 4) {
	// 			$location.url('/riddleover');
	// 		} else {
	// 			$location.url('/nobowls');
	// 		}
	// 	});

	// Pull in the language data
	Lang.get().then(
		function(response){
			$scope.lang = response.data.questions[dayNumber];
		}, 
		function(err) {
			console.error('Error getting language data: '+ err);
		});



	// Check if guess is correct
	$scope.checkAnswer = function() {

		// Google Analytics
		// Analytics.trackQuestion(dayNumber.toString(), 'answered');

		var input = $scope.answer.answer.trim().toLowerCase();
		var rightAnswer = function() {
			// Google Analytics
			// Analytics.trackAnswer(dayNumber.toString(), 'right');

			$location.url('/result');
		};

		var wrongAnswer = function() {
			// Google Analytics
			// Analytics.trackAnswer(dayNumber.toString(), 'wrong');

			WrongCounter.add();
			
			if (WrongCounter.getCount() < 3) {
				$location.url('/wrong');
			} else {
				$location.url('/result');
			}
		}

		// Check against array of answers
		if (angular.isArray($scope.lang.answer)) {

			// loop through answers
			for (var index in $scope.lang.answer) {
				if (input == $scope.lang.answer[index]) {
					rightAnswer();
					return
				}
			}

		// Check single answer
		} else {

			if (input == $scope.lang.answer) {
				rightAnswer();
				return
			}
		}
		
		// Answer is wrong if reached this point
		wrongAnswer();
	}
}]);


app.controller('resultCntrl', ['$scope', '$location', '$filter', 'Lang', 'Vibes', 'Analytics', 'WrongCounter', function($scope, $location, $filter, Lang, Vibes, Analytics, WrongCounter){

	// RESULT PAGE ////

	var dayNumber = Lang.day();
	$scope.submitError = false;

	// Pull in the language data
	Lang.get().then(
		function(response){

			$scope.lang = response.data.questions[dayNumber];

			// Check if user reached page by wrong answers
			if (WrongCounter.getCount() < 3) {
				$scope.lang.resultSubhead = $scope.lang.answerResponse;
				// Image URL
				$scope.imglabel = (angular.isArray($scope.lang.answer)) ? $scope.lang.answer[0].replace(' ', '') : $scope.lang.answer.replace(' ', '');
				$scope.headImg = $scope.imglabel;
			} else {
				$scope.lang.resultSubhead = $scope.lang.wrongResponse;
				// Image URL
				$scope.imglabel = (angular.isArray($scope.lang.answer)) ? $scope.lang.answer[0].replace(' ', '') : $scope.lang.answer.replace(' ', '');
				$scope.headImg = "wrong";
			}
	
		}, 
		function(err) {
			console.error('Error getting language data: '+ err);
		});

	// as user goes through form, if there has been input, but still empty, return true (which changes 'required' text to red)
	$scope.turnRed = function() {
		var fields = ['email', 'zip', 'first', 'last'];

		for (var index in fields) {
			var field = fields[index];
			var status = $scope.submitForm[field];

			if (!status.$pristine && status.$error.required) {
				return true
			}
		}
		return false
	}


	// Change 'Submit' button text to 'Submitting' while sending data
	$scope.sending = false;


	// Submit info and get free bowl
	$scope.getBowl = function(form) {
		
		// Control the button text
		$scope.sending = true;


		// Create JSON of user data
		var userObj = angular.copy($scope.user);

		userObj.z = userObj.z.toString();
		userObj.s = (userObj.s) ? '1' : '0';

		var userJSON = JSON.stringify(userObj);

		// Google Analytics
		// Analytics.trackQuestion(dayNumber.toString(), 'sweeps submission');


		// Submit user data
		// Vibes.signUp(userJSON).then(
		// 	function(response){
		// 		$scope.sending = false;

				// finally, redirect to Share page
				$location.url('/share');
			// },
			// function(err){
			// 	console.error('Error submitting sign-up form');
			// 	console.error(err);
			// 	$scope.sending = false;
			// 	$scope.submitError = 'Sorry, there was an error submitting the form:\n\n' + err.data.error;
			// });

	};

}]);


app.controller('shareCntrl', ['$scope', '$location', 'Lang', 'Analytics', function($scope, $location, Lang, Analytics){

	// SHARE PAGE ////

	var dayNumber = Lang.day();
	$scope.answer = {};

	// Pull in the language data
	Lang.get().then(
		function(response){
			$scope.lang = response.data.questions[dayNumber];
		}, 
		function(err) {
			console.error('Error getting language data: '+ err);
		});

	// Google Analytics
	$scope.trackFacebook = function() {
		// Analytics.trackShare(dayNumber.toString(), 'facebook');
	};
	$scope.trackTwitter = function() {
		// Analytics.trackShare(dayNumber.toString(), 'twitter');
	};

}]);


app.controller('noBowlsCntrl', ['$scope', '$location', 'Lang', 'Vibes', 'Analytics', function($scope, $location, Lang, Vibes, Analytics){

	// OUT OF BOWLS PAGE ////

	// Pull in the language data
	var lang;
	var dayNumber = Lang.day();

	Lang.get().then(
		function(response){
			lang = response.data;
			$scope.lang = lang.out[dayNumber];
		},
		function(err) {
			console.error('Error getting language data: '+ err);
		});

}]);


app.controller('wrongCntrl', ['$scope', '$location', 'Lang', 'Analytics', 'WrongCounter', function($scope, $location, Lang, Analytics, WrongCounter){

	// WRONG ANSWER PAGE ////

	var hasAnsweredBefore = false;

	if (WrongCounter.getCount() > 1) {
		hasAnsweredBefore = true;
	}


	// Pull in the language data
	var lang;
	var dayNumber = Lang.day();

	Lang.get().then(
		function(response){
			lang = response.data;
			setWrongLang(lang);
		}, 
		function(err) {
			console.error('Error getting language data: '+ err);
		});


	// Set language used based on if tried already present
	var setWrongLang = function(lang) {
		if (!hasAnsweredBefore) {
			// get friendly wrong message
			$scope.lang = lang.incorrect[dayNumber].first;
		} else {
			// get snarky wrong message
			$scope.lang = lang.incorrect[dayNumber].second;
		}
	}


	// Play again
	$scope.restart = function() {

		// Google Analytics
		// Analytics.trackQuestion(dayNumber.toString(), 'restarted');

		$location.url('/question');
	}

}]);