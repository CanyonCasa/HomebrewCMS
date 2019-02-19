// Plugin to add browser fetch function directly to Vue instance
// load after vue.js or vue.min.js library has been loaded so Vue exists!
// to support older browsers preceed with call to
// <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=fetch"></script>

// optimized (simplified) for GET/PUT/POST of JSON data... i.e. all communications assumes JSON
// wrapper 
//   1.) makes a JS fetch, 
//   2.) checks status and traps errors, 
//   3.) recovers headers, (response.headers,headers) text (response.raw), and JSON (response.jx)
//   4.) returns processed response Promise

var FetchWrapper = {
  install: function(Vue) {

    // check and fix status errors so function never fails...
    function ckStatus(response) {
      if (!response.ok) {
        if (response.options.verbose) console.info("fetch status error[%s]:",response.status, response.statusText);
        // response.text() not provide in event of an error, so add it for later parsing.
        response.text = function() { return Promise.resolve(JSON.stringify({error:{code:response.status,msg:response.statusText}}));};
      };
      return response;
    };
    
    // recover headers for convenience
    function recoverHeaders(response) {
      response.Headers = {};
      response.headers.forEach((v,i)=>{response.Headers[i]=v});
      if (response.options.verbose) console.info("fetch response Headers:",response.Headers);
      return response;
    };

    // parse raw text, and make safe JSON recovery...
    function parse(response) {
      return new Promise(function(resolve){
        response.text() // returns a promise
        .then(txt=>{ response.raw = txt; return response; })
        .then(function(res) {
          var jx={};
          res.jxOK = false;
          try { jx=JSON.parse(res.raw); response.jx = jx; res.jxOK = !('error' in jx); } catch(e) { console.error("fetch parse:",e); }; 
          if (res.options.verbose) console.info("fetch parse[%s]: %s",res.jxOK,res.jx);
          resolve(res);
        })
        .catch(e=>{}); // trap and ignore errors
      });
    };

    // fetch call...
    Vue.prototype.fetch = function() {
      var url = '';
      var options = {};
      // argument resolution
      if (arguments.length==3) { // assume: ('method', 'url', {options})
        url = arguments[1];
        options = arguments[2];
        options.method = arguments[0];
      }
      else if (arguments.length==2) { 
        if (typeof arguments[1]=='object') {  // assume: ('url', {options}), or 
          url = arguments[0];
          options = arguments[1];
          options.method = options.method || 'GET'; // ensure options.method defaults to GET
        }
        else {
        options.method = arguments[0];  // assume: ('method', 'url')
        url = arguments[1];
        }
      }
      else if (arguments.length==1) { 
        if (typeof arguments[0]=='object') {  // assume: ({options}), which must include url, or
          options = arguments[0];
          url = options.url;
        } else {
        url = arguments[0]; // assume: ('url') 
        }
      }
      else {
        throw Error('NO fetch parameters provided!');
      };
      options.method = options.method || 'GET'; // default method to GET
      if (('body' in options) && (typeof options.body=='object')) { // assume json data post, 
        options.body = JSON.stringify(options.body);
        options.method = (options.method=='GET') ? 'POST' : options.method; // POST or PUT, not GET
      };
      // create request headers, define default JSON request headers, then merge any other headers......
      options.Headers = {'Content-Type': 'application/json','Accept': 'application/json, text/plain, */*'}.mergekeys(options.headers);
      const headers = new Headers();
      for (k in options.Headers||{}) headers.set(k,options.Headers[k]);
      options.headers = headers;
      
      // log to console for info...
      if (options.verbose) console.info("fetch request[%s]: %s ==> ",options.method,url,options); // optionallly log request
      // make request... and perform post process parsing...

      return fetch(url,options)
        .then(res=>{ res.options=options; return res; }) // pass request options to response 
        .then(ckStatus) // check status and override request errors
        .then(recoverHeaders) // resolve headers promise for convenience
        .then(parse)  // parse JSON, with error checking
        .then(res=>{ if(res.options.verbose) { console.log('fetch response[%s]:',res.url,res); }; return res; }) // optionally log response
        .catch(e=>{console.error(e);}); // trap and ignore errors
    }
  }
};
if (typeof window !== 'undefined' && ('Vue' in window)) window.Vue.use(FetchWrapper);
