function trackPiwik(options) {
  var _paq = window._paq = window._paq || [];
  _paq.push(["setCookieDomain", options.cookieDomain]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  var u=options.piwikUrl;
  _paq.push(['setTrackerUrl', u+'piwik.php']);
  _paq.push(['setSiteId', options.siteId]);
  var d=document, g=d.createElement('script'),
  s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.defer=true;
  g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
}
