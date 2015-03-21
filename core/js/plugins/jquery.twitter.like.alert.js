jQuery.TwitterMessage = function(options)
{
  var defaults = {
    message: '',
    type:    ''
  };

  var opts = jQuery.extend(defaults, options);

  $MessageContainer = jQuery('#jquery_twitter_like_alert');

  if ($MessageContainer.size()) {
      window.clearTimeout(TwitterMessageTimer);
      $MessageContainer.html('<div>' + opts.message + '</div>').removeClass().addClass(opts.type);
  } else {
      jQuery('body').append('<div id="jquery_twitter_like_alert" class="' + opts.type + '"><div>' + opts.message + '</div></div>');
      $MessageContainer = jQuery('#jquery_twitter_like_alert');
  }

  var removeMessage = function(){
      window.clearTimeout(TwitterMessageTimer);
      $MessageContainer.animate({height: '0'}, {duration: 'slow', complete: function(){ $MessageContainer.remove() }});
  }

  $MessageContainer.animate({height: '60px'}, 600).click(removeMessage).hover(removeMessage);

  var TwitterMessageTimer = window.setTimeout(function () {
    $MessageContainer.trigger('click');
  }, 5000);

  return $MessageContainer;
}
