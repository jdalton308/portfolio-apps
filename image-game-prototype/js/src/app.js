
// CONFIG
// =======================================

var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
	$routeProvider
		.when('/', {
			templateUrl: '/views/intro.html',
			controller: 'mainCtrl'
		})
		.when('/how-to-play', {
			templateUrl: '/views/howtoplay.html',
			controller: 'mainCtrl'
		})
		.when('/game', {
			templateUrl: '/views/game.html',
			controller: 'gameCtrl'
		})
		.when('/result', {
			templateUrl: '/views/result.html',
			controller: 'mainCtrl'
		})
		.when('/win', {
			templateUrl: '/views/win.html',
			controller: 'mainCtrl'
		})
		.when('/signup', {
			templateUrl: '/views/signup.html',
			controller: 'mainCtrl'
		})
		.when('/thanks', {
			templateUrl: '/views/thanks.html',
			controller: 'mainCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});

});



// FACTORIES
// ===================================

app.factory('Images', [function(){
	
	// 1 = easy
	// 2 = medium
	// 3 = hard

	var images = {
		1: [
			{
				src: 'kitten2.jpg',
				spots: {
					1: {
						x: '14%',
						y: '14%'
					},
					2: {
						x: '30%',
						y: '52%'
					},
					3: {
						x: '43%',
						y: '69%'
					},
					4: {
						x: '61%',
						y: '47%'
					}
				}
			},
			{
				src: 'kitten4.jpg',
				spots: {
					1: {
						x: '50%',
						y: '25%'
					},
					2: {
						x: '60%',
						y: '25%'
					},
					3: {
						x: '83%',
						y: '91%'
					}
				}
			},
			{
				src: 'kitten9.jpg',
				spots: {
					1: {
						x: '5%',
						y: '73%'
					},
					2: {
						x: '28%',
						y: '74%'
					},
					3: {
						x: '47%',
						y: '86%'
					}
				}
			}

		],
		2: [
			{
				src: 'kitten1.jpg',
				spots: {
					1: {
						x: '44%',
						y: '31%'
					},
					2: {
						x: '60%',
						y: '47%'
					},
					3: {
						x: '63%',
						y: '20%'
					}
				}
			},
			{
				src: 'kitten3.jpg',
				spots: {
					1: {
						x: '4%',
						y: '20%'
					},
					2: {
						x: '2%',
						y: '94%'
					},
					3: {
						x: '93%',
						y: '2%'
					},
					4: {
						x: '48%',
						y: '78%'
					}
				}
			}
		],
		3: [
			
			{
				src: 'kitten7.jpg',
				spots: {
					1: {
						x: '83%',
						y: '28%'
					},
					2: {
						x: '55%',
						y: '37%'
					},
					3: {
						x: '22%',
						y: '63%'
					}
				}
			},
			{
				src: 'kitten5.jpg',
				spots: {
					1: {
						x: '36%',
						y: '10%'
					},
					2: {
						x: '50%',
						y: '12%'
					},
					3: {
						x: '30%',
						y: '70%'
					},
					4: {
						x: '62%',
						y: '54%'
					}
				}
			},
			{
				src: 'kitten6.jpg',
				spots: {
					1: {
						x: '26%',
						y: '75%'
					},
					2: {
						x: '39%',
						y: '38%'
					},
					3: {
						x: '58%',
						y: '22%'
					}
				}
			}

		]
	}

	return images;
}]);




// CONTROLLERS
// ===========================================

app.controller('mainCtrl', ['$scope', '$location', function($scope, $location) {

	$scope.leaveIntro = function() {
		$location.url('/how-to-play');
	}

	$scope.startGame = function() {
		$location.url('/game');
	}

	$scope.leaveWin = function() {
		$location.url('/thanks');
	}

}]);

app.controller('gameCtrl', ['$scope', '$location', 'Images', function($scope, $location, Images) {


	//// Variables ////

	var round = 1;
	var totalRounds = 3;
	var timeRef = {
		1: 45,
		2: 45,
		3: 30
	};
	var images;
	$scope.game = {};
	$scope.game.currentImg;


	//// Initialize Image ////
	// To progress the image, just update the var round, then call setImage().

	var getRoundImages = function() {
		return Images[round];
	}
	var pickImage = function(imageArray) {
		var range = imageArray.length;
		var index = Math.floor(Math.random() * range);
		console.log('Image index: '+ index);

		return imageArray[index];
		// returns object with hotspot coordinates
	}

	var setImage = function() {
		images = getRoundImages();
		$scope.game.currentImg =  pickImage(images);
	}

	setImage();


	//// Timer ////

	var timerRef;
	var interval = 500;
	var totalTime;
	$scope.game.currentTime;
	$scope.game.timerWidth;

	var setRoundTime = function() {
		totalTime = timeRef[round] * 1000;
		console.log("Total Time: "+ totalTime);
		$scope.game.currentTime = totalTime;
	}
	$scope.addPenalty = function() {
		console.log('Penalty occured');
		$scope.game.currentTime -= 5000;
	}
	var updateTimer = function() {
		$scope.game.currentTime -= interval;
		var currentRatio = $scope.game.currentTime/totalTime * 100;

		if (currentRatio > 0) {
			$scope.game.timerWidth = currentRatio + '%';
		} else {
			$scope.game.timerWidth = 0;
			stopTimer();
			$scope.lostImage();
		}
		$scope.$apply();
	}
	var startTimer = function() {
		setRoundTime();
		timerRef = setInterval(updateTimer, interval);
		console.log('Timer started');
	}
	var stopTimer = function() {
		clearInterval(timerRef);
		console.log('Timer stopped');
	}

	startTimer();


	//// Gameplay ////

	$scope.game.selectedSpots = {};

	$scope.foundOne = function(index) {
		$scope.game.selectedSpots[index] = true;
		console.log('Selected Spots:');
		console.log($scope.game.selectedSpots);

		var selectedLength = Object.keys($scope.game.selectedSpots).length;
		var totalLength = Object.keys($scope.game.currentImg.spots).length;

		if (selectedLength == totalLength) {
			console.log('FOUND THEM ALL');
			$scope.completedImage();
		}
	}
	$scope.completedImage = function() {
		stopTimer();
		$scope.game.message = {
			prompt: "YOU DID IT!",
			button: "NEXT"
		}
	}
	$scope.lostImage = function() {
		$scope.game.message = {
			prompt: "YOU LOST",
			button: "NEXT"
		}
	}
	$scope.startNextImage = function() {
		if (round != totalRounds) {
			round += 1;
			$scope.game.selectedSpots = {};
			setImage();
			startTimer();
			$scope.game.message = null;
		} else {
			$location.url('/win');
		}
	}
	$scope.game.giveUp = function() {
		stopTimer();
		$scope.lostImage();
	}


	//// Game Progression ////

}]);