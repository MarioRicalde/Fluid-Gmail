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