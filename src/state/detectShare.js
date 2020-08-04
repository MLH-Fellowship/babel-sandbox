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

  // Attempt to capture :key from http://example.com/share/:key/
  const pathParts = window.location.pathname.split('/');
  if (pathParts.length > 1 && pathParts[2]) {
    return pathParts[2];
  }
}

export { isShareLink, extractID };
