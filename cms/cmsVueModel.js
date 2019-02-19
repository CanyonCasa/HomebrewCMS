///console.info(cfg,schemaDefinitions);

window.onload = function() { if (!window.name) window.name = 'cms'; };

var data = {
  active: {                   // default active element container
    id: '',                   // unique id of current active schema element
    index: null,              // equivalent parent children index of child
    child: {},                // active schema element
    parent: {children:[]}     // active schema parent
  }, 
  authenticated: false,
  context: 'data',
  folders : cfg.folders,
  idata: [],
  lists: {},
  mngrView: 'download',
  mode: 'author',
  msgs: [],
  schema: ({}).mergekeys(schemaDefinitions.newSchema),
  //lists: {images:{listing:[]}},
  sources: {
    active: 'live',
    live: cfg.locations.live || location.origin,
    preview: cfg.locations.preview || location.origin
  },
  timex: null,
  treeExpand: '*',
  user: {                     // current active user
    name: '',
    member: [],
    pw: ''
  },
  xdata: null
};
var debug = false;

var vm = new Vue({
  el: '#app', 
  data: data,
  methods: {
    act: function(msg) {  // wrapper for all Vue component events
      switch (msg.action) {
        case 'add': this.addElement(msg.parent,msg.element); break;   // add element to schema parent
        case 'build': this.buildData();                               // build xdata object from schema
        case 'clip': this.clipboard('copy',msg.text); break;          // copy context-specific result to clipboard as JSON object
        case 'copy': this.copyElement(); break;                       // copies active element under same parent
        case 'delete': this.deleteElement(msg.evt.ctrlKey); break;    // delete element if CTRL-CLICK, i.e. mouse event paased to detect ctrl key
        case 'info': this.chgSchemaType(msg.type); break;             // rebuild data when schema type changes in schema info form
        case 'list': this.listFolders(msg.src); break;                // list schema, docs, and images files at source
        case 'loadSchema': this.loadSchema(msg.schema); break;        // load schema: file, schema cloud reference
        case 'publish': this.publishSchema(msg.dest,msg.args); break; // publish schema and/or data to preview or live site
        case 'regen': this.fixIDs(schema);                            // Regenerate uniques IDs for schema (when copying the schema for reuse)
        case 'move': this.moveElement(msg.direction); break;          // move active element within the schema tree per direction
        case 'touch': this.touch(msg.parent,msg.index); break;        // highlight child of parent specified by index, where parent and index are null for top level schema
        case 'upload': this.upload(msg.file); break;                  // upload file record
        default: 
          scribe.warn("unknown act:",msg);
      };
    },
    addElement: function(parent,element) {
      var idx = parent.children.length;
      var child = schemaDefinitions.elements[element].copyByValue();
      child.id = uniqueID();
      child.pid = parent.id.valueOf();
      child.label = child.label + ' ' + (idx+1);
      child.name = child.name+(idx+1);
      child.description = "A new " + child.element + " type";
      parent.children.push(child);
      this.buildData();
    },
    buildData: function(args={}){
      var child=args.child; var data=args.data||null; var auto=args.auto||false;
      const byIdx = (child===undefined) ? (this.schema.dflt instanceof Array) : (child.container ? (child.dflt instanceof Array) : false); 
      ///console.warn("build:",(child||{}).name,child,data,auto,byIdx);
      if (child===undefined) {  // top level schema
        var tmp = (this.schema.dflt instanceof Array) ? [] : {};  // define root element
        this.schema.children.forEach((chx,ix) => { tmp[(byIdx)?ix:chx.name] = this.buildData({child:chx,data:data!==null?data[byIdx?ix:chx.name]:null,auto:auto}); });
        this.xdata = tmp;
        ///console.warn("build return:",(child||{}).name,tmp);
        return tmp;
      } else if (child.container) { // a container object
        var tmp = child.dflt.copyByValue();
        child.children.forEach((chx,ix) => { tmp[(byIdx)?ix:chx.name] = this.buildData({child:chx,data:data!==null?data[byIdx?ix:chx.name]:null,auto:auto}); });
        ///console.warn("build return:",(child||{}).name,tmp);
        return tmp;
      } else { // primitive element
        ///console.warn("primitive:",child,data,auto);
        if (child.data===undefined) child.addHiddenKey('data',child.dflt.valueOf());
        if (!child.auto) {
          if (data!==null&&!child.readonly) child.data = data.valueOf();
        } else {
          child.data = (!auto) ? '<auto generated at output>' : (child.auto=='html' ? md2html.render(child.src) : '???');
        };         
        ///console.warn("primitive return:",(child||{}).name,child.data);
        return child.data;
      };
    },
    byID: function(id,element) {
      var found=null;
      if (element===undefined) {
        if (id==this.schema.id) return this.schema;
        this.schema.children.some(chx => (found = this.byID(id,chx)));
        return found;
      } else if (element.container) {
          if (id==element.id) return element;
          element.children.some(ch => (found = this.byID(id,ch)));
          return found;
      } else {
        return (id==element.id) ? element : null;
      };
    },
    chgSchemaType: function(t) { this.schema.dflt = schemaDefinitions.elements[t].dflt.copyByValue(); this.buildData(); },
    clipboard: function(act,text) {
      if (act=='copy') {
        if (text) {
          navigator.clipboard.writeText(text).then(()=>{scribe.log("'"+text+"' copied to clipboard");}).catch(e=>{scribe.error(e);});
        } else {
          var clipData = JSON.stringify(this.context=='data' ? this.buildData({auto:true}) : this.schema,null,2);
          navigator.clipboard.writeText(clipData).then(()=>{scribe.log(this.context.toUpperCase(),' copied to clipboard');}).catch(e=>{scribe.error(e);});
        };
      };
    },
    copyElement: function() {
      if (this.active.parent) {
        var i = this.active.parent.children.length;
        var chd = this.active.parent.children[this.active.index].copyByValue();
        this.fixIDs(chd,this.active.parent.id);
        chd.label = chd.label + ' COPY ' + (i+1);
        chd.name = chd.element+(i+1);
        this.active.parent.children.push(chd);
        this.buildData();
      };
    },
    debounce: function() {
      clearTimeout(this.timex);
      timex = setTimeout(()=>{this.buildData();},500);  // debounce and notify change
    },
    deleteElement: function(ctrlKey) {
      if (this.active.parent && ctrlKey) {
        this.active.parent.children.splice(this.active.index,1); // delete child from current parent
        this.active = { id:'', index: null, child: {}, parent: {children:[]} };  // clear active element
        this.buildData();
      };
    },
    fixIDs: function(chd,pid=null) { chd.id=uniqueID(); chd.pid=pid; if (chd.container) chd.children.forEach(c=>this.fixIDs(c,chd.id)); },
    indexOfChildByID: function(parent,id) {
      var index;
      parent.children.some((ch,i) => (index=ch.id==id ? i : null));
      return (index!==null ? index : parent.children.length-1);
    },
    listFolders: function(src='live') {
      var fldrs = Object.keys(this.folders).join(',');
      this.load({url:cfg.locations[src]+cfg.locations.cms+'@list/'+fldrs+'/*.*',verbose:debug})
        .then(res => { if (res.jxOK) { res.jx.forEach((list,i)=>{Vue.set(this.lists,list.name,res.jx[i])}); scribe.log('lists loaded'); return res; } })
        .then(res => {
          if (location.hash) {  // auto load schema if given hash
            vm.loadSchema(location.hash);
          } else {
            vm.mngrView = 'download';
            scribe.log('READY');
          };
        })
        .catch(e=>{scribe.error(e);});
    },
    load: function(rqst) {
      rqst.headers = (rqst.headers||{}).mergekeys({
        'Authorization': 'Basic ' + window.btoa(this.user.name+":"+this.user.pw)
      });
      if (debug) scribe.info({rqst:rqst},true);
      return this.fetch(rqst).then(res=>res).catch(e=>{scribe.error(e);});
    },
    loadCfg: function() {
      var self = this;
      // loads user custom configuration...
      return new Promise(function(resolve){
        self.fetch('cfg.json')
          .then(res => {
            if (res.ok) { 
              cfg.mergekeys(res.jx);
              self.sources = { live: cfg.locations.live || location.origin, preview: cfg.locations.preview || location.origin };
              setTimeout(()=>{document.getElementById('app').className='content-grid'},1000); // show hidden document
              resolve(res);
            }; })
          .catch(e=>{scribe.error(e);});
      });
    },
    loadData: function(file) {
      if (this.schema.files.data) { 
      var dataFile = file || this.schema.files.data;
        var spec = makePath(this.sources[this.sources.active],cfg.folders.data,this.schema.files.store,dataFile);
        scribe.log("load schema data:",spec);
        var rqst = {
          body: { file: { name: this.schema.files.store+'/'+dataFile, folder: 'data' } },
          method: 'POST',
          url: this.sources[this.sources.active] + cfg.locations.cms + '@download',
          verbose: debug
        };
        this.load(rqst)
          .then(res => { 
            if (res.jxOK&&('contents' in res.jx)) {
              if (this.schema.serial&&!file) {  // default data file is a serial index and no file override given 
                this.idata = res.jx.contents;
                scribe.log(`Serial index ${dataFile} loaded.`); 
              } else {
                this.buildData({data:res.jx.contents,auto:true}); 
                scribe.log(`${dataFile} loaded and initial data build complete.`);
                this.$forceUpdate();
              };
            };
            scribe.log('READY'); 
          })
          .catch(e=>{scribe.error(e);});
      };
      
    },
    loadSchema: function(schema) {
      if (typeof schema=='string') {  // location.hash given so convert to object, assuming live source
        schema = {src:'live',store:schema.substr(1,schema.lastIndexOf('/')-1),file:schema.substr(schema.includes('/')?schema.lastIndexOf('/')+1:1)+'.json' }
        schema.spec = makePath(this.sources[schema.src],cfg.folders.schema,schema.store,schema.file);
      };
      this.sources.active = schema.src;
      scribe.log("load schema:",schema.spec);
      var rqst = {
        body: { file: { name: schema.store+'/'+schema.file, folder: 'schema' } },
        method: 'POST',
        url: this.sources[schema.src] + cfg.locations.cms+'@download',
        verbose: debug
      };
      this.load(rqst)
        .then(res=>{ 
          if (res.jxOK&&('contents' in res.jx)) {
            this.schema = {};
            for (let key in res.jx.contents) Vue.set(this.schema,key,res.jx.contents[key]);
            //this.schema.files.store = schema.store;
            if (this.schema.id=='') this.fixIDs(this.schema);
            this.touch();
            return res;
          };
        })
        .then(res=>{ this.loadData();} )
        .catch(e=>{scribe.error(e);});
    },
    login: function() {
      var self = this;
      return new Promise(function(resolve){
        if (self.user.name && self.user.pw)
          self.load({url:cfg.locations.cms+'@login'})
            .then(res=>{ 
              if (res.jxOK&&res.jx.user) {
                for (let k in res.jx.user) { Vue.set(self.user,k,res.jx.user[k]); };
                self.authenticated = self.user.member.includes('author')||self.user.member.includes('developer');
                self.mode = self.user.member.includes('developer') ? 'developer' : 'author';
              };
              if (self.authenticated) {
                scribe.info("login: ",self.user.name,' authenticated as ',self.mode.toUpperCase());
                scribe.info("user: ",JSON.stringify({name:self.user.name,session:self.user.session}));
                self.storage.session.save('user',{name:self.user.name,session:self.user.session});
                resolve(res);
              } else {
                scribe.warn("login: ",self.user.name,' authentication failed!');
                reject(res);
              };
            })
            .then(res=>{ self.listFolders(); })
            .then(res=>{ if (location.hash) self.loadSchema(location.hash); })
            .catch(e=>{});
      });
    },
    menuDo: function(menu,choice,option) {
      switch (menu) {
        case 'manager':
          switch (choice) {
            case 'context': this.context = this.mode=='author' ? 'data' : (this.context=='schema' ? 'data' : 'schema'); break;
            case 'debug': debug = !debug; scribe.info('DEBUG:',debug); break;
            case 'mode': 
              if (this.user.member.includes('developer')) {
                this.mode = (this.mode=='author') ?  'developer' : 'author'; 
                if (this.mode=='author') this.context = 'data';
              };
              break;
            default: this.mngrView = choice; this.context = this.context||'data';
          };
          break;
        case 'schema':
          switch (choice) {
            case 'copy': this.act({action:'copy'}); break;
            case 'delete': this.act({action:'delete',evt:option}); break;
            case 'expand': this.treeExpand = ({'+':'-','-':'*','*':'+'})[this.treeExpand]; scribe.log("expand tree:",this.treeExpand); break;
            case 'move': this.act({action:'move',direction:option}); break;
            case 'touch': this.mngrView = 'edit'; break;
          };
          break;
        case 'context':
          switch (choice) {
            case 'context': this.context = this.mode=='author' ? 'data' : (this.context=='schema' ? 'data' : 'schema'); break;
          };
          break;
        case 'result':
          switch (choice) {
            case 'context': this.context = this.mode=='author' ? 'data' : (this.context=='schema' ? 'data' : 'schema'); break;
            case 'refresh': this.buildData({auto:true}); break;
            case 'clip': this.act({action:'clip'}); break;
          };
          break;
        default:
          scribe.warn("menuDo ?: ",menu,choice,option);
      };
    },
    moveElement: function(direction) {
      if (this.active.parent)
        switch (direction) {
          case 'up':
          case 'down':
            if (((direction=='up')&&(this.active.index>0))||((direction=='down')&&(this.active.index<this.active.parent.children.length-1))) {
              var newIndex = this.active.index + ((direction=='up') ?  -1 : 1);
              var swap = this.active.parent.children[newIndex];
              Vue.set(this.active.parent.children,newIndex,this.active.child);
              Vue.set(this.active.parent.children,this.active.index,swap);
              this.act({action:'touch', parent:this.active.parent, index:newIndex})
              this.buildData();
            };
            break;
          case 'promote':
            var grandparent = this.byID(this.active.parent.pid);
            ///console.log("gp:",grandparent);
            if (grandparent) {
              ///grandparent.children.push(this.active.child); // move child under grandparent
              /// find index of parent in grandparent
              var place = this.indexOfChildByID(grandparent,this.active.parent.id)+1;
              ///console.log("parent index:",this.active.parent.id,place);
              grandparent.children.splice(place,0,this.active.child);
              this.active.parent.children.splice(this.active.index,1); // delete child from current parent
              this.act({action:'touch', parent:grandparent, index:place})
              this.buildData();
            };
           break;
          case 'demote':
            var sibling = (this.active.index>0) ? this.active.parent.children[this.active.index-1] : null;
            ///console.log("sibling:",sibling,(sibling||{}).container);
            if (sibling&&sibling.container) {
              sibling.children.push(this.active.child); // move child under sibling
              this.active.parent.children.splice(this.active.index,1);  // delete child from current parent
              this.act({action:'touch', parent:sibling, index:sibling.children.length-1});
              this.buildData();
            };
            break;
        };
    },
    publishSchema: function(dest, args) {
      scribe.log("publish:",dest,args.asString());
      // build file records, include history for live destination
      var file; var files=[]; var spec; var bak='.' + this.schema.version + '.bak';
      if (dest=='live'||args.schema.include) {
        if (dest=='live') {
          this.schema.version = args.schema.version;
          if (args.schema.history) this.schema.history.push(args.schema.history);
          if (args.data.history) this.schema.$history.push(args.data.history); 
        };
        spec = makePath(this.schema.files.store,this.schema.files.schema);
        files.push({ backup: (args.schema.backup) ? spec.replace('.json',bak) : '', contents: this.schema, folder: 'schema', name: spec });
      };
      if (dest=='live'||args.data.include) {
        this.buildData({auto:true}); // latest data, including auto generated output
        spec = makePath(this.schema.files.store,this.schema.files.data);
        files.push({ backup: (args.data.backup) ? spec.replace('.json',bak) : '', contents: this.xdata, folder: 'data', name: spec });
      };
      // publish to live site if specified
      if (dest=='live'){
        scribe.log("live:",cfg.locations['live']+cfg.locations.cms);
        this.load({url:cfg.locations['live']+cfg.locations.cms+'@upload', method:'POST', body:{files: files},verbose:debug})
          .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
          .catch(e=>{scribe.error(e)});
      };
      // always publish to preview site
      scribe.log("preview:",cfg.locations['preview']+cfg.locations.cms);
      this.load({url:cfg.locations['preview']+cfg.locations.cms+'@upload', method:'POST', body:{files: files},verbose:debug})
        .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
        .catch(e=>{scribe.error(e)});
    },
    scribeObj: function() { 
      var msgs = this.msgs;
      var postIt = function(...args) {
        var msg = (typeof args[1]=='object') ? JSON.stringify(args[1],null,args[2]?2:undefined) : args.slice(1).join(' ');
        msgs.push({dtd: new Date().style('iso','local'),level: args[0],text: msg});
        if (msgs.length>10) msgs.shift();
      };
      return {
        log: function(...args) { postIt('log',...args); },
        info: function(...args) { postIt('info',...args); },
        warn: function(...args) { postIt('warn',...args); console.warn(...args); },
        error: function(...args) { postIt('error',...args); console.error(...args); },
      };
    },
    touch: function(parent,index) {
      this.active = (parent) ? { parent: parent, index: index, child: parent.children[index], id: parent.children[index].id } : 
        { parent: null, index: null, child: this.schema, id: this.schema.id };
      this.mngrView = 'edit'; // automatically show edit window if element touched
    },
    upload: function(file) {
      scribe.log("upload: ",file.name);
      // upload to live site 
      this.load({url:cfg.locations['live']+cfg.locations.cms+'@upload', method:'POST', body:{file: file},verbose:debug})
        .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
        .catch(e=>{scribe.error(e)});
      // upload to preview site
      this.load({url:cfg.locations['preview']+cfg.locations.cms+'@upload', method:'POST', body:{file: file},verbose:debug})
        .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
        .catch(e=>{scribe.error(e)});
    }
  }
});

var scribe = vm.scribeObj();
var mdParser = window.markdownit('commonmark',{ replaceLink: function(link,env) { return link.startsWith(':') ? "javascript"+link : link; } });
var md2html = mdParser.use(markdownItAttrs).use(markdownitReplaceLink);
vm.loadCfg()
  .then(res=>{scribe.log('Configuration successfully loaded!'); return res;})
  .then(res=>{
    let who = vm.storage.session.recall('user');
    if (who) {
      console.log(who,new Date(who.session.expires),new Date(who.session.expires).valueOf()>new Date().valueOf());
      if ((new Date(who.session.expires).valueOf())>(new Date().valueOf())) {
        vm.user.name = who.name;
        vm.user.pw = who.session.id;
        vm.login();
      };
    };
  })
  .catch(e=>{scribe.error('ERROR initializing!');});
