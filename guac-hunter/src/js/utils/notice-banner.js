var $ = require('jquery');

module.exports = {
  /**
   *  Notice banner
   *  Displays a notice under the nav across the site. Its default behavior is to handle cookie consent notices
        in the EU, but it can be used on any page (and through GTM) via an API:

      notice-banner.show(String message, String messageId, [, Boolean|Function cookieOrDisplayCallback ] ] ])

   *  @param message The (HTML) message to display.
               Elements with the class name "notice-banner-dismiss" will close the notice
               Elements with the class name "notice-banner-acknowledge" will close the notice and follow its href
   *  @param messageId A unique identifier
   *  @param cookieOrDisplayCallback Controls how the message is displayed:
               Boolean (default): Use a a cookie (based on messageId) - only displays once
               Function: Callback function to determine if the notice can be displayed. Expects a return value of true to display.

   *  @param messageId The unique message identifier. Returns true if it's been dismissed already, otherwise returns false.
   */

  show: function(message, messageId, cookieOrDisplayCallback) {
    var template = [
          '<div id="notice-banner">',
            '<a href="#" class="notice-banner-dismiss icon-x-thin"></a>',
            '<p></p>',
          '</div>'
        ].join(''),

        cookieValue = null,
        cookieExpiration = 'expires=' + (function() { var d = new Date(); d.setDate(d.getDate() + 30); return d.toUTCString(); })(),
        showNotice = null,
        _canWriteCookie = function() { // Default
          return true;
        },
        canWriteCookie = function() { return _canWriteCookie(); },

        $markup = null;

    function handleDismissClick(e) {
      e.preventDefault();

      dismiss();
    };

    function dismiss() {
      writeCookie();

      if ($markup)
        $markup
          .slideUp(250, 'linear', function() {
            detach();
          });
    };

    function writeCookie() {
      if (canWriteCookie() === false)
        return;

      document.cookie = [cookieValue, cookieExpiration].join(';');
    };

    function createMarkup(message) {
      $markup = $(template);

      $markup
        .find('p')
          .html(message)
        .end()
        .find('.notice-banner-dismiss')
          .on('click', handleDismissClick)
        .end()
        .find('.notice-banner-acknowledge')
          .on('click', function(e) {
            dismiss();
          });
    };

    function attach() {
      $('#landing').before($markup);
    };

    function detach() {
      $markup && $markup.remove();
      $markup = null;
    };

    function buildCookieValue(messageId) {
      return messageId + '=y';
    };

    function cookieNotSet(value) {
      return document.cookie.indexOf(value) === -1;
    };


    detach();
    canWriteCookie = function() { return _canWriteCookie(); };

    cookieValue = buildCookieValue(messageId);
    showNotice = cookieNotSet(cookieValue); // By default, if the cookie isn't present we display the notice

    // Flip the logic, the display callback should be the arbiter of showing the notice or not
    // True = ALWAYS show it, regardless of cookie
    if (cookieOrDisplayCallback && typeof cookieOrDisplayCallback === 'function') {
      canWriteCookie = cookieOrDisplayCallback;
      showNotice = canWriteCookie();
    }

    if (showNotice === true) {
      createMarkup(message);
      attach();
      writeCookie();
    }
  }

};
