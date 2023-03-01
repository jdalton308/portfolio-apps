module.exports = {
  // action: id, e.g. "Round 1 :: Quit Clicks"
  // category: e.g. "Gameplay", "Misc"
  // label: defaults to action, but can override if necessary
  event: function(action, category, label, value) {
    if (!('dataLayer' in window))
      return;
    
    var event = {
      event: 'analyticsEvent',
      eventCategory: category || 'All',
      eventAction: action,
      eventLabel: label,
      eventValue: value || null
    };
    
    dataLayer.push(event);
  }
};


// Categories and Actions
// ---------------------------------------------
// - 'Page View'/'Page View'/(page name)
// - 'Button Click'/'Click'/(button name)
// - 'Game Event'/'Round #'/(event description)
// - 'Photo Event'/(Photo Name)/(event description)
// - 'Share Event'/'Click'/'Facebook/Twitter'
