var $ = require('jquery');

module.exports = {
    nextButtons: $('a.next'),
    footer: $('#footer'),
    document: $(document),
    window: $(window),

    //// Views ////
    allViews: $('.view'),
    landingView: $('#landing'),
    introView: $('#intro'),
    gameView: $('#game'),
    endView: $('#end'),
    signupView: $('#signUp'),
    shareView: $('#share'),
    endAnimate: $('#end .animation-cont'),

    //// For repeat play ////
    introTitle: $('#intro h2'),
    introCopy: $('#intro p'),
    howToListItem: $('.how-to .two'),
    signUpSubhead: $('#signUp .subhead'),
    shareToggle: $('#share .toggle'),
    resetBtn: $('#intro .test-button'),

    //// Within Game View ////
    gamePhoto: $('.game-img.left'),
    refPhoto: $('.game-img.right'),
    roundNum: $('.round-num'),
    checkboxCont: $('.checkboxes'),

    resultOver: $('.result.overlay'),
    resultTitle: $('.result h2'),
    resultCopy: $('.result p'),
    resultBtn: $('.result button'),

    imageCont: $('#game .images'),
    countdownCont: $('.countdown-cont'),
    countdownEl: $('.countdown'),
    penaltyOveraly: $('.penalty-overlay'),

    giveUp: $('.give-up'),
    giveUpOverlay: $('.give-up-overlay'),
    giveUpStay: $('#give-up-stay'),
    giveUpLeave: $('#give-up-leave'),
    giveUpClose: $('.give-up-close'),

    timer: $('.timer'),
    howToOverlay: $('.how-to.overlay'),
    gotIt: $('.got-it'),

    //// Signup Form ////
    signupSubhead: $('#signup .subhead'),
    inputs: $('#signup-form .input'),
    first: $('#first-name'),
    last: $('#last-name'),
    mobile: $('#mobile-num'),
    zip: $('#zip'),
    email: $('#email'),
    consent: $('#consent'),
    signupSubmit: $('#signup-form .submit'),
    signupError: $('#signup-form .form-error-text'),
    // noAvailCopy: $('#signup-form .no-avail-instructions'),
    // consentCopy: $('#signup-form .consent-copy'),

    errorOverlay: $('.form-error-overlay'),
    errorOverlayClose: $('#error-try-again'),

    youGuac: $('.you-guac-overlay'),
    youGuacTitle: $('.you-guac-overlay h2'),
    youGuacCopyCont: $('.you-guac-overlay .copy-cont'),

    facebookBtn: $('#share .facebook'),
    twitterBtn: $('#share .twitter')
};