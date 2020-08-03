/**
 * isShareLink returns true iff the pathname contains the text `share`
 * @returns {boolean}
 */
function isShareLink() {
  const path = window.location.pathname;
  const shareIndicator = "share";
  return path.includes(shareIndicator);
}

function extractID() {
  const path = window.location.pathname;
  // Attempt to capture everything after the /share/
  // that's not a URL reserved character as defined here:
  // https://en.wikipedia.org/wiki/Percent-encoding#Percent-encoding_reserved_characters
  const re = /\/share\/([^!*'();:@&=+$,/?#[\]]+)/g;

  return path.replace(re, "$1");
}

export { isShareLink, extractID };
