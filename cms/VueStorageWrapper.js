// Plugin to add HTML storage of JSON objects directly to Vue

var StorageWrapper = {
  install: function(Vue) {

    var localSim = {};
    var sessionSim = {};
    var emulate = typeof(Storage)===undefined;
    var localStore = emulate ? localSim : window.localStorage;
    var sessionStore = emulate ? sessionSim : window.sessionStorage;
    var toJSON = v => v===undefined ? undefined : JSON.stringify(v);
    var fromJSON = v => v===undefined ? undefined : JSON.parse(v);
    
    // storage call...
    Vue.prototype.storage = {
      emulated: emulate,
      local: {
        recall: key => key ? fromJSON(localStore[key]) : localStore,
        save: (key,value) => localStore[key]=toJSON(value)
      },
      session: {
        recall: key => key ? fromJSON(sessionStore[key]) : sessionStore,
        save: (key,value) => sessionStore[key]=toJSON(value)
      }
    };
  }
};
if (typeof window !== 'undefined' && ('Vue' in window)) window.Vue.use(StorageWrapper);
