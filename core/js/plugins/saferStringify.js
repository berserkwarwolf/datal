function saferStringify(obj, replacer, space) {
    return JSON.stringify(obj, replacer, space).replace(new RegExp('/', 'g'), '\\/')
    // Escape u2028 and u2029
    // http://timelessrepo.com/json-isnt-a-javascript-subset
    // https://github.com/mapbox/tilestream-pro/issues/1638
    .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
};