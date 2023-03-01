'use strict';

var $ = require('jquery'),
    manifest = require('asset-manifest-uk'),
    tracker = require('./utils/tracker'),
    noticeBanner = require('./utils/notice-banner'),
    resultLang = require('./utils/resultLang-uk'),
    Elem = require('./utils/elements');


$(function(){

  // Game controllers and state
  //----------------------------
  var GuacGame = {

    apiProxy: 'http://api.guachunter.co.uk/guac-it-out-uk',
    triedFullScreen: false,
    isMobile: (screen.width < 768) ? true : false,

    //---------------------------
    //// App State variables ////
    //---------------------------

    totalItems: 5,
    totalPhotos: 3,
    timerLength: 45000,
    timerInterval: 300, //ms
    penalty: 5000,

    timeLeft: 0,
    itemsFound: 0,
    photosWon: 0,
    photosPlayed: 0,

    playedBefore: false,
    formSubmitted: false,
    offersAvailable: null,

    // pastPhotoIndex: [],
    totalTimeUsed: 0,
    nextBtnCopy: null,


    //-------------------------
    //// General Functions ////
    //-------------------------

    init: function() {

      var showFullScreen = function() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen ||
                                docEl.mozRequestFullScreen ||
                                docEl.webkitRequestFullScreen ||
                                docEl.msRequestFullscreen;

        if (requestFullScreen)
          requestFullScreen.call(docEl);

        // Don't try again after first time
        GuacGame.triedFullScreen = true;
      }

      //// SET-UP STATE ////
      // Check if user has already played, and set language appropriately
      GuacGame.checkForRepeat();

      if (!GuacGame.playedBefore) {
        // Check if offers are still available
        GuacGame.checkForAvailable();
      }

      //// BASIC EVENTS ////
      // Buttons that progress game
      Elem.nextButtons.click(function(e){
        e.preventDefault();

        var $this = $(this);
        var target = $this.attr('href').substr(1);

        // Call function to trigger view change
        GuacGame[target]();

        // Attempt to make full-screen on mobile
        if (GuacGame.isMobile && !GuacGame.triedFullScreen) {
          showFullScreen();
        }

        // GTM
        var buttonName = $this.text().toLowerCase();
        tracker.event('Click', 'Button Click', buttonName);
      });

      // Facebook Share & GTM
      Elem.facebookBtn.click(function(e){
        e.preventDefault();

        // GTM
        tracker.event('Share Event', 'Click', 'Facebook Share');

        // Share...
        FB.ui({
            method: 'share',
            href: 'http://www.guachunter.co.uk',
          }, function (response) {
            // if (response && !response.error_message) {
            // }
          }
        );
      });

      // Twitter GTM
      Elem.twitterBtn.click(function(){
        tracker.event('Share Event', 'Click', 'Twitter Share');
      });


      // Show EU cookie consent if not previously seen or dismissed
      var cookieConsentText = 'Chipotle uses cookies to offer you the best website experience. By continuing to use our website, you are agreeing to our use of cookies and we won’t display this message next time you visit. To find out more about cookies and how to manage and disable them in your browser settings, visit our <a href="https://chipotle.co.uk/cookie-policy" class="notice-banner-acknowledge" target="_blank">cookies policy</a>.';

      noticeBanner.show(cookieConsentText, 'euCookiePolicyAcknowledged');


      //// START GAME ////
      //===========================

      GuacGame.landing();

      //===========================
    },
    checkForRepeat: function() {
      var repeat = window.localStorage.guacGame;

      // Set app state
      if (repeat) {
        GuacGame.playedBefore = true;

        // Set new language
        GuacGame.setAlternateLanguage();
      }
    },
    checkForAvailable: function() {

      function availSuccess(data) {
        var isAvail = (data.status === 'success');

        if (isAvail)  {
          // Don't really need to do anything...
          GuacGame.offersAvailable = true;
        } else {
          GuacGame.offersAvailable = false;
          // Set appropriate language
          GuacGame.setAlternateLanguage();
          // In signup view, change signup form
          // GuacGame.sizeEndCont();
        }
      }

      $.ajax({
          url: GuacGame.apiProxy + '/avail',
          type: 'GET',
          timeout: 3000

        }).done(function(data, status, XHR) {
          availSuccess(data);

        }).fail(function(data, status, XHR) {
          if (status === 'timeout') {
            // console.log('Timeout occurred');

            // try 2nd time
            //----------------
            $.ajax({
              url: GuacGame.apiProxy + '/avail',
              type: 'GET',
              timeout: 3000
            }).done(function(data, status, XHR) {
              availSuccess(data);

            }).fail(function(data, status, XHR) {
              if (status === 'timeout') {
                // console.log('Timeout occurred again');

                // try 3rd time, no timeout
                //-----------------------------
                $.ajax({
                  url: GuacGame.apiProxy + '/avail',
                  type: 'GET',
                }).done(function(data, status, XHR) {
                  availSuccess(data);

                }).fail(function(data, status, XHR) {
                  availSuccess(data);

                }); // end ajax #3

              }
            }); // end ajax #2

          }
        }); // end ajax #1

    },
    setAlternateLanguage: function() {
      // Set new language
      Elem.introTitle.text('GET THE SCOOP');
      Elem.introCopy.addClass('repeat').text("We know you know it's extra, but right now you can get it for free.");
      Elem.howToListItem.text('Get your guac hunt on.');
      Elem.shareView.addClass('repeat');

      // For no-availability sign-up
      Elem.signUpSubhead.text('Holy guacamole! That free guac went fast. Sign up for e-mail alerts below to stay ahead of the pack next time around.');
      Elem.consent.prop('checked', true);
      Elem.signupView.addClass('noAvail');
      Elem.zip.val('11111').addClass('valid touched');

    },
    imageLoading: function() {
      Elem.gotIt.prop('disabled', true).text('Loading...');

      // Save text for after loaded...
      GuacGame.nextBtnCopy = Elem.resultBtn.text();
      Elem.resultBtn.prop('disabled', true).text('Prepping Round...');
    },
    imageLoaded: function() {
      // Enable buttons and add 'loading...' text
      Elem.gotIt.prop('disabled', false).text('GET IT');
      Elem.resultBtn.prop('disabled', false).text(GuacGame.nextBtnCopy);
    },
    sizeEndCont: function() {
      var isSignupView = Elem.endView.hasClass('signup');
      var windowHeight = window.innerHeight;
      var footerHeight = 102;

      // If Sign-Up view, always resize...
      if (isSignupView) {
        var view = Elem.signupView;
        var viewHeight = view.height() + 50; // extra 50 to add padding

        if ((viewHeight + footerHeight) < windowHeight) {
          viewHeight = windowHeight - footerHeight; // ensure covers full height on large screens
        }

        Elem.endAnimate.css({height: viewHeight+'px'});

      // If Share view, only resize on mobile...
      } else if (GuacGame.isMobile) {
        var view = Elem.shareView;
        var viewHeight = view.height();

        Elem.window[0].scrollTo(0, 0);
        // Elem.window.animate({
        //   scrollTop: 0
        // }, function(){
          Elem.endAnimate.css({height: viewHeight+'px'});
        // });

      // Otherwise, on Share view, erase the Sign-up view sizing
      } else {
        Elem.endAnimate.attr('style', '');
      }
    },


    //--------------------
    //// Timer Object ////
    //--------------------

    timer: {
      start: function() {

        function setTimerHtml(time) {
          var realTime = Math.ceil(time/1000);
          var timeString = (realTime < 10) ? (':0' + realTime) : (':' + realTime);
          Elem.timer.text(timeString);

          return;
        }

        // set view's html to ':45'
        setTimerHtml(GuacGame.timeLeft);

        // Start interval for updating timer
        window.gameTimer = window.setInterval(function(){

          // update timeleft
          GuacGame.timeLeft -= GuacGame.timerInterval;

          // update totalTime taken
          GuacGame.totalTimeUsed += GuacGame.timerInterval;

          if (GuacGame.timeLeft > 0) {
            // update view
            setTimerHtml(GuacGame.timeLeft);
          } else {
            // set timer to ':00'
            setTimerHtml(0);
            Elem.document.trigger('photoOver', [false]);
          }
        }, GuacGame.timerInterval);
      },
      stop: function() {
        window.clearInterval(gameTimer);
      },
      reset: function() {
        // Reset timeleft to total time
        GuacGame.timeLeft = GuacGame.timerLength;
      }
    },


    //------------------------
    //// View Controllers ////
    //------------------------

    landing: function(){
      Elem.allViews.removeClass('current');
      Elem.landingView.addClass('current');
      Elem.introView.addClass('current');

      function landingScreen() {
        Elem.document.click(function(){
          Elem.document.off('click');
          window.clearTimeout(introTimer);
          GuacGame.intro();
        });

        var introTimer = window.setTimeout(function(){
          Elem.document.off('click');
          GuacGame.intro();
        }, 5000);
      }

      // Check for orientation
      if (window.innerHeight > window.innerWidth) {

        // if portrait, don't procede until in landscape
        Elem.window.on('resize', function(){
          if (window.innerHeight < window.innerWidth) {
            Elem.window.off('resize');
            landingScreen();
          }
        });
      } else {
        landingScreen();
      }

      // GTM
      tracker.event('Page View', 'Page View', 'Landing Page');
    },

    intro: function(){

      // If going through a second time, need to call this here
      GuacGame.checkForRepeat();

      Elem.allViews.removeClass('current');
      Elem.introView.addClass('current');

      // GTM
      tracker.event('Page View', 'Page View', 'Intro Page');
    },

    game: function(){
      Elem.allViews.removeClass('current');
      window.setTimeout(function() {
        Elem.gameView.addClass('current');
      }, 600);

      // GTM
      tracker.event('Page View', 'Page View', 'Game Page');

      var currentJSON;
      var pastResultCopy = [];

      function getRound() {
        // returns string
        return 'Round '+ (GuacGame.photosPlayed + 1);
      }
      function getLastRound() {
        return 'Round '+ GuacGame.photosPlayed;
      }
      function clickPenalty() {
        GuacGame.timeLeft -= GuacGame.penalty;

        // Create timer flash
        Elem.timer.addClass('penalty');

        // Show overlay
        Elem.penaltyOveraly.fadeIn(200);

        window.setTimeout(function(){
          Elem.timer.removeClass('penalty');
          Elem.penaltyOveraly.fadeOut(50);
        }, 750);

        // GTM
        var image = currentJSON.name;
        tracker.event('Photo Event', image, 'Error Penalty Occured');
      }

      function gameEvents() {

        // Allow user to start round after images are loaded
        Elem.gameView.off('imgLoad');
        Elem.gameView.on('imgLoad', function(){
          // Simply enable the start buttons

          GuacGame.imageLoaded();
        });

        // Got-It button
        Elem.gotIt.off('click');
        Elem.gotIt.click(function(){
          // hide 'how-to' overlay, then start countdown timer and load image
          Elem.howToOverlay.fadeOut(300);
          startRound();

          // GTM
          tracker.event( 'Click', 'Button Click', 'How to Play Start');
        });

        // Give up button
        Elem.giveUp.off('click');
        Elem.giveUp.click(function(){
          GuacGame.timer.stop();
          Elem.giveUpOverlay.fadeIn(200);

          // GTM
          var roundNum = getRound();
          tracker.event('Game Event', roundNum, 'Quit Click');
        });

        // 'Keep Hunting' in Give-up
        Elem.giveUpStay.off('click');
        Elem.giveUpStay.click(function(){
          Elem.giveUpOverlay.fadeOut(200);
          GuacGame.timer.start();

          // GTM
          var roundNum = getRound();
          tracker.event('Game Event', roundNum, 'Keep Hunting Click');
        });

        // 'x' in Give-up
        Elem.giveUpClose.off('click');
        Elem.giveUpClose.click(function(){
          Elem.giveUpOverlay.fadeOut(200);
          GuacGame.timer.start();

          // GTM
          var roundNum = getRound();
          tracker.event('Game Event', roundNum, 'X in Give-up Click');
        });

        // 'Escape' in Give-up
        Elem.giveUpLeave.off('click');
        Elem.giveUpLeave.click(function(){
          Elem.giveUpOverlay.hide();
          GuacGame.landing();

          // GTM
          var roundNum = getRound();
          tracker.event('Game Event', roundNum, 'Escape Click');
        });

        // Penalization for missing
        Elem.gamePhoto.off('click');
        Elem.gamePhoto.click(function(e){
          clickPenalty();
        });
        Elem.refPhoto.off('click');
        Elem.refPhoto.click(function(e){
          clickPenalty();
        });

        // Continue button (in overlay)
        Elem.resultBtn.off('click');
        Elem.resultBtn.click(function(){

          var roundNum = getLastRound();

          if (GuacGame.photosPlayed == GuacGame.totalPhotos) {

            // GTM
            tracker.event('Game Event', roundNum, 'Get Your Guac Click');

            // Check if played before or offers, and open guac recipe if have
            if (GuacGame.playedBefore) {
              window.open("https://www.chipotle.co.uk/guac-recipe");
              GuacGame.share();
            } else if (!GuacGame.offersAvailable){
              window.open("https://www.chipotle.co.uk/guac-recipe");
              GuacGame.signup();
            } else {
              // Go to 'SignUp' view
              GuacGame.signup();
            }

          } else {
            startRound();

            // GTM
            tracker.event('Game Event', roundNum, 'Next Round Click');
          }
        });

        // Photo completed, by time or guesses
        Elem.document.off('photoOver');
        Elem.document.on('photoOver', function(e, wonBool){
          photoOver(wonBool);
        });
      }


      function initImage() {
        // Set starting state for game
        Elem.gamePhoto.removeClass('over');
        Elem.refPhoto.removeClass('over');
        Elem.imageCont.removeClass('show');

        Elem.countdownCont.removeClass('hide');
        Elem.timer.hide();

        // Choose item from 'asset manifest'
        getImageJSON().then(function(data){

          // Update round number
          var roundText = 'ROUND ' + (GuacGame.photosPlayed + 1);
          Elem.roundNum.removeClass('red').text(roundText);

          // Load images and hotspots
          currentJSON = data;

          insertImages(currentJSON);
          createHotspots(currentJSON);
        });
      }


      function getImageJSON() {

        // Determine difficulty
        var difficulty;
        switch (GuacGame.photosPlayed) {
          case 0:
            difficulty = 'easy';
            break;
          case 1:
            difficulty = 'medium';
            break;
          case 2:
            difficulty = 'hard';
            break;
        }

        var roundArray = manifest[difficulty];
        var total = roundArray.length;

        function getRandom(max) {
          return Math.floor(Math.random() * max);
        }

        var randomIndex = getRandom(total);

        // return promise
        return $.ajax({
          url: roundArray[randomIndex],
          dataType: 'json'
        });
      }


      function insertImages(json) {

        // 1. Insert <img> elements without srcs
        var leftImg = '<img src="" alt="game image">';
        var rightImg = '<img src="" alt="reference image">';

        Elem.gamePhoto.html(leftImg);
        Elem.refPhoto.html(rightImg);

        var $gameImg = Elem.gamePhoto.find('img');
        var $refImg = Elem.refPhoto.find('img');

        // 2. Bind 'onload' event before setting 'src'
        $gameImg.load(function(){
          Elem.gameView.trigger('imgLoad');
        });

        // 3. Set the 'src' attributes
        $gameImg.attr('src', json.images.left);
        $refImg.attr('src', json.images.right);

        return;
      }


      function createHotspots(json) {

        GuacGame.totalItems = json.markers.length;

        // clean out checkboxes first, and ensure state is at 0
        Elem.checkboxCont.empty();
        GuacGame.itemsFound = 0;

        json.markers.forEach(function(mark, i, array){

          // Create HTML for spots on images
          var topP = (mark.top-3) + "%";
          var leftP = (mark.left-1) + "%";
          var spot = '<div class="spot" style="left:'+ leftP +'; top:'+ topP +';"><div class="avo"><span class="hair north"></span><span class="hair south"></span><span class="hair west"></span><span class="hair east"></span></div></div>';

          Elem.gamePhoto.append(spot);
          Elem.refPhoto.append(spot);

          // Create checkboxes
          // <img src="/assets/img/pit.svg" alt="icon" class="pit-icon">
          var checkbox = '<div class="box"><span class="hair north"></span><span class="hair south"></span><span class="hair west"></span><span class="hair east"></span><span class="pit-icon"></span><span class="missed-pit"></span></div>';
          Elem.checkboxCont.append(checkbox);

        });

        // Bind click events to hotspots
        var $spots = $('.images .spot');
        $spots.click(function(e){
          e.stopPropagation();
          foundSpot(this);
        });
      }


      function startRound() {
        var timerLength = 2;

        Elem.resultOver.fadeOut(400);
        Elem.countdownEl.addClass('animate');

        // Countdown
        var countdownTimer = setInterval(function(){


          if (timerLength == 0) {
            // When countdown done
            clearInterval(countdownTimer);

            // Hide countdown
            Elem.countdownCont.addClass('hide');

            // Animate the image cont
            Elem.imageCont.addClass('show');

            // Start game timer
            GuacGame.timer.reset();
            GuacGame.timer.start();

            // Show 'Give Up' button
            Elem.giveUp.fadeIn(200);
            Elem.timer.fadeIn(200);

            // reset countdown for next image
            window.setTimeout(function() {
              Elem.countdownEl.text(3);
              Elem.countdownEl.removeClass('animate');
            }, 1000);

          } else {
            // Countdown...
            Elem.countdownEl.text(timerLength);
            timerLength--;
          }
        }, 1000);
      }


      function foundSpot(el) {

        var $this = $(el);

        // Determine which photo (l/r) was clicked
        var $parent = $this.closest('.game-img');
        var $otherPhoto = ($parent.hasClass('left')) ? Elem.refPhoto : Elem.gamePhoto;
        // Find sister spot
        var foundStyle = $this.attr('style');
        var $sisterSpot = $otherPhoto.find('[style="'+ foundStyle + '"]');

        // Show both clicked spots
        $this.addClass('found');
        $sisterSpot.addClass('found');

        // Unbind click events
        $this.off('click');
        $sisterSpot.off('click');


        // Mark checkbox
        var nextCheckbox = Elem.checkboxCont.find('.box').eq(GuacGame.itemsFound);
        nextCheckbox.addClass('found');

        // Increase count of foundItems
        GuacGame.itemsFound++

        // Check if it was the last spot
        if (GuacGame.itemsFound == GuacGame.totalItems) {
          Elem.document.trigger('photoOver', [true]);
        }
      }


      function photoOver(wonBool) {

        // if lost, Loop through hot-spots, and add class to missed spots
        function markMissed($parentEl) {
          var $spots = $parentEl.find('.spot');
          $spots.each(function(){
            var $this = $(this);
            if (!$this.hasClass('found')) {
              $this.addClass('missed')
                  .off('click');
            }
          });
        }

        // Populate overlay text, and add correct class to show background image
        function addResultLang(wonBool) {
          var resultString = (wonBool) ? 'success' : 'wrong';
          var langObj = ((GuacGame.playedBefore || !GuacGame.offersAvailable) && (GuacGame.photosPlayed == 2) ) ?
            resultLang[resultString][3] :
            resultLang[resultString][GuacGame.photosPlayed];

          if (!langObj.hasOwnProperty('copy')) {
            // Randomly select copy from array for first two rounds
            var copyArray = resultLang.copy;
            var nextIndex = Math.floor(Math.random() * copyArray.length);

            // ensure the phrase was not used in the first round
            while ( $.inArray(nextIndex, pastResultCopy) != -1 ) {
              nextIndex = Math.floor(Math.random() * copyArray.length);
            }

            langObj.copy = copyArray[nextIndex];

            // save index, and don't use next time
            pastResultCopy.push(nextIndex);
          }

          // Update copy
          Elem.resultTitle.text(langObj.title);
          Elem.resultCopy.text(langObj.copy);
          Elem.resultBtn.text(langObj.button);

          // Add class to show correct background image
          var newClass = resultString + GuacGame.photosPlayed;
          Elem.resultOver.attr('class', ('result overlay ' + newClass));
        }

        function showOverlay() {
          Elem.resultOver.fadeIn(200);
          Elem.document.off('click');

          if (GuacGame.photosPlayed < 3) {
            GuacGame.imageLoading();
            window.setTimeout(function(){
              // reset the game view while overlay showing
              initImage();
            }, 500);
          }

        }

        addResultLang(wonBool);

        // Hide 'Give Up'
        Elem.giveUp.hide();

        // Change text from "Round #"
        var overText = (wonBool) ? 'HOORAY!' : "TIME'S UP!";
        Elem.roundNum.addClass('red').text(overText);

        // Add dark overlay to images w/css
        Elem.gamePhoto.addClass('over');
        Elem.refPhoto.addClass('over');


        // If lost...
        if (!wonBool) {
          markMissed(Elem.gamePhoto);
          markMissed(Elem.refPhoto);

          // loop through checkboxes, and add class to missed
          var $checkboxes = Elem.checkboxCont.find('.box');
          $checkboxes.each(function(){
            var $this = $(this);

            if (!$this.hasClass('found'))
              $this.addClass('missed');
          });

        }

        // Show the overlay on click, or after 5 sec
        Elem.document.click(function(){
          showOverlay();
          window.clearTimeout(overlayTimer);
        });

        var overlayTimer = window.setTimeout(function(){
          showOverlay();
        }, 5000);

        GuacGame.timer.stop();
        GuacGame.photosPlayed++;
        if (wonBool) GuacGame.photosWon++;


        //// GTM ////
        // GTM - Photo win/fail
        var photoString = (wonBool) ? 'Photo Won' : 'Photo Lost';
        var image = currentJSON.name;
        tracker.event('Photo Event', image, photoString);

        // GTM - Photo time-to-complete
        var timeUsed = Math.floor( (GuacGame.timerLength - GuacGame.timeLeft)/ 1000 );
        tracker.event('Photo Event', image, 'Time Used', timeUsed);

        // GTM - Round win/fail
        var roundString = (wonBool) ? 'Round Success' : 'Round Fail';
        var roundNum = getLastRound();
        tracker.event('Game Event', roundNum, roundString);
      } // end photoOver()


      function initGame() {
        // GuacGame.pastPhotoIndex = [];
        GuacGame.totalTimeUsed = 0;
        GuacGame.photosWon = 0;
        GuacGame.photosPlayed = 0;

        GuacGame.imageLoading();
        initImage();
        gameEvents();

        Elem.howToOverlay.show();
      }

      initGame();

    },

    signup: function() {
      Elem.allViews.removeClass('current');
      Elem.endView.removeClass('share').addClass('current signup');
      Elem.resultOver.fadeOut(300);
      GuacGame.sizeEndCont();

      // Form Interaction:
      // - First input validation called after a blur event on that input
      // - After blur has occured, monitor input on each key-up
      //    - Input receives either class 'valid' or 'error'
      // - On each input validation, perform form validation
      //    - form validation checks text input for class 'valid'

      function validateText($inputEl) {
        var value = $inputEl.val().trim();
        var regex = /^[a-zA-Z\s]*$/;
        var valid = regex.test(value);

        return valid;
      }
      // function validatePhone($inputEl) {
      //   var value = $inputEl.val().trim();
      //   var simpleValue = value.replace(/[()-.\s]/g, '');
      //   var regex = /^[0-9]{10}$/;
      //   var valid = regex.test(simpleValue);

      //   return valid;
      // }
      // function validateZip($inputEl) {
      //   var value = $inputEl.val().trim();
      //   var regex = /^([0-9]{5})|(([a-z0-9]{3})( )?([a-z0-9]{3}))$/i;
      //   var valid = regex.test(value);

      //   return valid;
      // }
      function validateEmail($inputEl) {
        var value = $inputEl.val().trim();
        var regex = /^[a-z0-9._%+-]+@([a-z0-9][a-z0-9-]*\.)+[a-z]+$/i;
        var valid = regex.test(value);

        return valid;
      }

      function errorCheck($inputEl) {
        var valid;
        var errorMsg;
        var $errorEl = $inputEl.siblings('.error-text');

        // if ($inputEl.hasClass('mobile')) {
        //   valid = validatePhone($inputEl);
        //   errorMsg = 'Please enter a 10-digit phone number';
        //   $errorEl = $inputEl.siblings('.mobile-error');

        // } else if ($inputEl.hasClass('zip')) {
        //   valid = validateZip($inputEl);
        //   errorMsg = 'Please enter a valid US or CA ZIP code';
        //   $errorEl = $inputEl.siblings('.zip-error');

        if ($inputEl.hasClass('email')) {
          valid = validateEmail($inputEl);
          errorMsg = 'Please enter a valid email address';

        } else {

          if ($inputEl.val() == '') {
            $inputEl.removeClass('valid').addClass('error');
            errorMsg = "Don't forget this field!";
          } else {
            valid = validateText($inputEl);
            errorMsg = 'Please only use letters in your name';
          }

          // $errorEl = $inputEl.siblings('.error-text');
        }

        // Show or hide error message
        if (valid) {
          $inputEl.removeClass('error').addClass('valid');
          $errorEl.slideUp(300);
        } else {
          $inputEl.removeClass('valid').addClass('error');
          $errorEl.text(errorMsg).slideDown(300);
        }

      }
      function validateForm() {
        var formValid = true;

        // Check inputs for '.valid'
        Elem.inputs.each(function(){
          var $this = $(this);
          var touched = $this.hasClass('touched');
          var fieldValid = $this.hasClass('valid');

          // If touched input, but has invalid entry...
          if (!fieldValid && touched) {
            formValid = false;

          // If have not touched input, form not valid
          } else if (!touched) {
            formValid = false;
          }

        }); // end each();

        // enable/disable button
        Elem.signupSubmit.prop('disabled', !formValid);

        return formValid;
      }
      function getFormData() {
        // var phoneVal = Elem.mobile.val().trim().replace(/[()-.\s]/g, '');
        var consent = (Elem.consent.prop('checked')) ? 'true' : 'false';

        var obj = {
          f: Elem.first.val().trim(),
          l: Elem.last.val().trim(),
          // m: phoneVal,
          // z: Elem.zip.val().trim().replace(/ /g, ''),
          e: Elem.email.val(),
          s: consent
        };

        return JSON.stringify(obj); // comment to get submit error
      }
      function submitForm(dataObj) {
        return $.ajax({
          url: GuacGame.apiProxy + '/reg',
          method: 'post',
          data: dataObj
        });
      }
      function resetForm() {
        Elem.first.val('').removeClass('valid');
        Elem.last.val('').removeClass('valid');
        // Elem.mobile.val('').removeClass('valid');
        Elem.email.val('').removeClass('valid');
        Elem.consent.prop('checked', false);

        Elem.youGuac.addClass('hide');

        window.setTimeout(function(){
          Elem.youGuac.hide().removeClass('open hide');
        }, 2000);
      }

      // Bind Events
      //--------------
      Elem.inputs.on('blur', function(){
        var $this = $(this);
        $this.addClass('touched');
        errorCheck($this);
        validateForm();
      });

      Elem.inputs.keyup(function(){
        var $this = $(this);

        // do nothing unless already touched the field already
        if ( !$this.hasClass('touched') )
          return

        errorCheck($this);
        validateForm();
      });

      Elem.signupSubmit.click(function(e){
        e.preventDefault();

        if (validateForm()) {
          // Form valid, so submit

          // Disable button and change text
          Elem.signupSubmit.prop('disabled', true).text('SENDING...');

          var data = getFormData();

          // GTM
          tracker.event('Game Event', 'Form', 'Entry Form Submit Click');

          // Send form...
          if (!GuacGame.formSubmitted) {
            submitForm(data).then(
              // ...submit success:
              function(data, status, XHR){

                GuacGame.formSubmitted = true;
                var isRepeat = data.is_repeat;

                function goToSignup() {
                  resetForm();
                  GuacGame.share();
                  Elem.signupSubmit.prop('disabled', false).text('SUBMIT');
                  window.localStorage.guacGame = true;
                }

                if (!GuacGame.offersAvailable) {
                  goToSignup();
                } else {
                  Elem.endView.removeClass('signup').addClass('current share');
                  GuacGame.sizeEndCont();

                  if (isRepeat) {
                    Elem.youGuacTitle.text('GUAC HOG!');
                    Elem.youGuacCopyCont.html("<p>Sorry, you've already claimed your free chips and gauc. Limit one per email address.</p>");
                  }

                  Elem.youGuac.addClass('open');

                  // proceed after either a click or 5 seconds
                  var successTimer = window.setTimeout(function(){
                    Elem.document.off('click');
                    goToSignup();
                  }, 5000);

                  Elem.document.click(function(){
                    Elem.document.off('click');
                    window.clearTimeout(successTimer);
                    goToSignup();
                  });
                }

                // GTM
                tracker.event('Game Event', 'Form', 'Entry Form Submit Success');
              },
              // ...submit error:
              function(XHR, textStatus, errorThrown){

                Elem.signupError.text('Error submitting form: '+ textStatus).slideDown(300);
                Elem.signupSubmit.prop('disabled', false).text('SUBMIT');
                Elem.errorOverlay.addClass('open');

                // Event to close 'Form Error' overlay
                Elem.errorOverlayClose.off('click');
                Elem.errorOverlayClose.click(function(){
                  Elem.errorOverlay.removeClass('open');
                });

                // GTM
                tracker.event('Game Event', 'Form', 'Entry Form Submit Error');
              }
            );
          // end if(!formSubmitted)
          } else {
            Elem.signupError.text("Looks like you have already signed up for chips and guac").slideDown(300);
            window.setTimeout(function(){
              GuacGame.share();
            }, 2000);
          }


        } else {
          // form not valid
          return;
        }

      });

    },

    share: function() {
      Elem.allViews.removeClass('current');
      Elem.endView.removeClass('signup').addClass('current share show');
      Elem.resultOver.fadeOut(300);
      GuacGame.sizeEndCont();
    }

  };


  // Begin magic
  GuacGame.init();
});
