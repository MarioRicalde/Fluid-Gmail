/*
 * Fluid Gmail UserScripts
 * Url Pattern: *.google.com/mail/*
 */
 
// Insert jQuery
var q = document.createElement('script'); q.setAttribute('src','http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js'); document.body.appendChild(q);

// Be sure that jQuery is ready, 
// then initialize.
(function tryReady() {
  if (typeof jQuery == "undefined")
    setTimeout(tryReady, 200);
  else
    init();
  
  function init() {
    Growl();
  }
})();

function Growl() {
  if (!window.fluid) { return; }

  var config = {
    initialDelay         : 5,      // seconds to wait for the first check
    pollInterval         : 10,      // seconds to wait between checks
    priority             : 1,      // Growl preference
    sticky               : false,  // Growl preference
    trimLength           : 150,    // Max number of characters to show for sender, subject and message body
    sound                : "Blow", // System Sound
    growlForever         : true,   // Growl new messages count forever each 10 minutes. Till none is left.
    growlForeverInterval : 300     // 300 seconds (5 minutes)
  };

  var global = {
    unreadMsgCount : -1,
    $mail          : Array(),
    oldCount       : 0
  };

  var selector = {
    inbox                : 'a.n0[title^=Inbox]',
    unreadMessage        : 'tr.zA.zE',
    sender               : 'span.zF',
    subject              : '.y6 span:first',
    body                 : '.y2'
  };

  var Growl = {
    notify               : function(title, description) {
      if (config.sound) {
        window.fluid.playSound(config.sound);
      }
      return fluid.showGrowlNotification({
        title            : title,
        description      : description,
        priority         : config.priority,
        sticky           : config.sticky
      });
    }

  };

  var Notify = {
    // Display the Unread Message Count.
    unreadMsgCount: function() {
      if (global.unreadMsgCount <= 0) { return false; }
      Growl.notify(
        global.unreadMsgCount + ' new message' + ( global.unreadMsgCount > 1 ? 's' : '' ), null
      );
      return true;
    },
    // Display the new messages title and descriptions on a growl.
    unreadMsgTitles: function() {
      // Counter for the number of new message growls displayed
      var currentMsg = 0;

      // Helper function to set all the text lengths to something reasonable for a growl notification
      var prepText = function($field){
        return $field.text().substring(0, config.trimLength);
      };

      // Iterate over the unread messages and display a growl notification for the NEW unread messages
      global.$mail.find(selector.unreadMessage).each(function(){
        if(++currentMsg > (global.unreadMsgCount - global.oldCount)){ return false; } // We're only going to show you the NEW unread messages
        return Growl.notify(
          'New Message From ' + prepText($(this).find(selector.sender)),
          prepText($(this).find(selector.subject)) + prepText($(this).find(selector.body))
        );
      });
    }
  };

  var Messages = {
    unreadInbox: function() {
      global.oldCount = global.unreadMsgCount;
      // Make sure jQuery has been loaded (if it hasn't yet, it might be on the next pass)
      if (jQuery){
        if(!global.$mail.length){ global.$mail = jQuery('#canvas_frame').contents(); }

        // Extract the number of unread messages
        matches = global.$mail.find(selector.inbox).text().match(/\((\d*)\)/);
      }

      global.unreadMsgCount = matches ? matches[1] : 0;

    }
  };

  function init(justNotify) {
    Messages.unreadInbox();
    // If the unread message count is greater than it was the last
    // time we checked, we know that we've received one or more new
    // messages.

    if(global.oldCount == -1 || justNotify) {
      Notify.unreadMsgCount();
    } else if (global.unreadMsgCount > global.oldCount) {
      Notify.unreadMsgTitles();
    }

  }

  // Run the 1st check, likely sooner than the config.pollInterval
  setTimeout(init,  config.initialDelay * 1000); 
  // Keep checking at a longer interval
  setInterval(init, config.pollInterval * 1000);
  // If forever notify, set the interval.
  if (config.growlForever) { setInterval(function() { init(true); }, config.growlForeverInterval * 1000); }
}
