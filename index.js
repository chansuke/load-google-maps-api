export default ({
  libraries = [],
  key,
  client,
  v,
  timeout = 10000
} = {}) => {

  const callbackName = '__googleMapsApiOnLoadCallback';

  return new Promise((resolve, reject) => {

    // Exit if not running inside a browser.
    if (typeof window === 'undefined') {
      return reject(new Error('Can only load the Google Maps API in the browser'));
    }

    // Prepare the `script` tag to be inserted into the page.
    const scriptElement = document.createElement('script');
    const params = ['callback=' + callbackName];
    libraries = [].concat(libraries); // Ensure that `libaries` is an array
    if (libraries.length) params.push('libraries=' + libraries.join(','));
    if (key) params.push('key=' + key);
    if (client) params.push('client=' + client);
    if (v) params.push('v=' + v);
    scriptElement.src = 'https://maps.googleapis.com/maps/api/js?' + params.join('&');

    // Timeout if necessary.
    let timeoutId = null;
    if (timeout) {
      timeoutId = setTimeout(() => {
        window[callbackName] = () => {}; // Set the on load callback to a no-op.
        reject(new Error('Could not load the Google Maps API'));
      }, timeout);
    }

    // Hook up the on load callback.
    window[callbackName] = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      resolve(window.google.maps);
      delete window[callbackName];
    };

    // Insert the `script` tag.
    document.body.appendChild(scriptElement);

  });

};