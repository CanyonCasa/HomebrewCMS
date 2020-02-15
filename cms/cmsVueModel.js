/// Vue model code for HomebrewCMS

window.onload = function() { if (!window.name) window.name = 'cms'; };

var data = {
  active: {                   // default active element container
    child: {},                // active schema element
    granparent: null,
    heir: '*',
    id: '',                   // unique id of current active schema element
    index: null,              // equivalent parent children index of child
    parent: {children:[]},    // active schema parent
    pindex: null,
  }, 
  authenticated: false,
  context: 'data',
  folders : cfg.folders,
  lists: {},
  mngrView: 'download',
  mode: 'author',
  msgs: [],
  save: {},
  schema: schemaDefinitions.newSchema.copyByValue(),
  sources: {
    active: 'live',
    live: cfg.locations.live || location.origin,
    preview: cfg.locations.preview || location.origin
  },
  timex: null,
  treeExpand: '*',
  user: {                     // current active user
    member: [],
    name: '',
    pw: '',
    session: {}
  }
};
var debug = false;
var verbose = false;

var vm = new Vue({
  el: '#app', 
  data: data,
  methods: {
    act: function(msg) {  // wrapper for all Vue component events
      switch (msg.action) {
        case 'add': this.addElement(msg.parent,msg.element); break;   // add element to schema parent
        case 'clip': this.clipboard('copy',msg.text); break;          // copy context-specific result to clipboard as JSON object
        case 'copy': this.copyElement(msg.evt); break;                // copies active element at place or to (CTRL) or from (ALT) clipboard
        case 'delete': this.deleteElement(msg.evt); break;            // delete element if CTRL-CLICK, i.e. event passed to detect ctrl key
        case 'download': this.loadSchema(msg.schema); break;          // download schema: schema cloud reference
        case 'list': this.listFolders(msg.src); break;                // list schema, docs, and images files at source
        case 'move': this.moveElement(msg.direction); break;          // move active element within the schema tree per direction
        case 'publish': this.publish(msg.dest,msg.args); break;       // publish schema and/or data to preview or live site
        case 'serial': this.chgSeries(msg.data); break;               // Change to or from a series post
        case 'series': this.setData(this.schema,msg.data); break;     // load the schema with the given series data
        case 'touch': this.touch(msg.heritage); break;                // highlight heir/ancestor
        case 'upload': this.upload(msg.file); break;                  // upload file record
        default: 
          scribe.warn("act: unknown? -> ",msg);
      };
    },
    addElement: function(parent,element) {
      var idx = parent.children.length;
      var child = schemaDefinitions.elements[element].copyByValue();
      child.label = child.label + ' ' + (idx+1);
      child.name = child.name+(idx+1);
      child.description = "A new " + child.element + " type";
      parent.children.push(child);
    },
    chgSeries: function(add) {
      if (add) {
        Vue.set(this.schema,'series',window.schemaDefinitions.series.copyByValue());
        Vue.set(this.schema.files,'series',window.cfg.series.pattern);
      } else {
        if (this.schema.series) {
          window.schemaDefinitions.series = this.schema.series.copyByValue();
          window.cfg.series.pattern = this.schema.files.series;
        };
        delete this.schema.series;
        delete this.schema.files.series;
      };
    },
    clipboard: function(act,text) {
      if (!navigator.clipboard) return console.warn("Clipboard access denied...");
      if (act=='copy') {
        if (text) {
          navigator.clipboard.writeText(text).then(()=>{scribe.log("'"+text+"' copied to clipboard");}).catch(e=>{scribe.error(e);});
        } else {
          var clipData = JSON.stringify(this.context=='data' ? this.extractData() : this.schema,null,2);
          navigator.clipboard.writeText(clipData).then(()=>{scribe.log(this.context.toUpperCase(),' copied to clipboard');}).catch(e=>{scribe.error(e);});
        };
      };
    },
    copyElement: function(evt={}) {
      if (evt.altKey) {  // copy from clipboard (paste)
        let self = this;
        let parent = this.active.parent || this.active.child;
        let position = this.active.index!==null ? this.active.index : parent.children.length;
        navigator.clipboard.readText().then(res=>{
          let chd = JSON.parse(res); 
          scribe.log("'"+chd.name+"' copied from clipboard");
          chd.label = chd.label + ' COPY ' + (parent.children.length+1);
          chd.name = chd.element + (parent.children.length+1);
          parent.children.splice(position,0,chd);
          self.touch(this.getHeir(this.active.heir,'parent')+'.'+position);
          self.context = 'schema';
          }).catch(e=>{scribe.error(e);});
      } else if (this.active.parent) {
        let chd = this.active.parent.children[this.active.index].copyByValue();
        let i = this.active.index + 1;
        if (evt.ctrlKey) {  // copy to clipboard
          navigator.clipboard.writeText(JSON.stringify(chd)).then(()=>{scribe.log("'"+chd.name+"' copied to clipboard");}).catch(e=>{scribe.error(e);});
        } else { // copy to parent
          chd.label = chd.label + ' COPY ' + (i);
          chd.name = chd.element + (i);
          this.active.parent.children.splice(i,0,chd);
        };
      };
    },
    deleteElement: function(evt) {
      if (this.active.parent && evt.ctrlKey && !evt.altKey) {
        let kin = this.active.index ? this.getKinOf(this.active.heir,'sibling',this.active.index-1) : this.getKinOf(this.active.heir,'parent');
        this.active.parent.children.splice(this.active.index,1); // delete child from current parent
        this.touch(kin); // assign nearest relative as active element
      };
      if (!this.active.parent && evt.ctrlKey && evt.altKey) {
        this.schema = schemaDefinitions.newSchema.copyByValue();
        this.touch('*');  // set schema as active element
      };
    },
    extractData: function(child,raw=false){ // returns current schema data
      if (child===undefined) child = this.schema;
      if (child.container) {
        let tmp = (child.container=='ordered') ? [] : {};
        for (let i in child.children) {
          let index = (child.container=='ordered') ? i : child.children[i].name;
          tmp[index] = this.extractData(child.children[i],raw);
        };
        return tmp;
      } else {
        return !raw&&child.auto ? md2html(child.data,!child.block&&child.strip) : child.data;  // presently only supports MD->HTML
      };
    },
    getHeritage: function(heritage='*') {
      let heirs = heritage.split('.').slice(1);
      let root = this.schema;
      while (heirs.length>2) { root = root.children[heirs[0]]; heirs.shift(); };
      switch (heirs.length) {
        case 0: return { child:root, grandparent:null, heir:'*', index:null, parent:null, pindex:null };
        case 1: return { child:root.children[heirs[0]], grandparent:null, heir: heritage, index: +heirs[0], parent:root, pindex:null };
        case 2: return { child:root.children[heirs[0]].children[heirs[1]], grandparent:root, heir: heritage, index: +heirs[1], parent:root.children[heirs[0]], pindex:+heirs[0] };
      };
    },
    getKinOf: function(heir,who='parent',index=0) {
      let heirs = heir.split('.');
      switch (who) {
        case 'child': heirs.push(index); break;
        case 'sibling': heirs.pop(); heirs.push(index); break;
        case 'parent': heirs.pop(); break;
      };
      return heirs.join('.');
    },
    listFolders: function(src='live') {
      var fldrs = Object.keys(this.folders).join(',');
      var self = this;
      return new Promise(function(resolve){
        self.load({url:cfg.locations[src]+cfg.locations.cms+'@list/'+fldrs+'/*.*',verbose:debug})
          .then(res => { if (res.jxOK) { res.jx.forEach((list,i)=>{Vue.set(self.lists,list.name,res.jx[i])}); scribe.log('lists loaded'); return res; } })
          .then(res => { vm.mngrView = 'download'; scribe.log('READY'); resolve(res); })
          .catch(e=>{scribe.error(e);});
      });
    },
    load: function(rqst) {
      scribe.log("load: ",this.user.pw);
      rqst.headers = (rqst.headers||{}).mergekeys({
        'Authorization': 'Basic ' + window.btoa(this.user.name+":"+this.user.pw)
      });
      if (debug&&verbose) scribe.info({rqst:rqst},true);
      return this.fetch(rqst)
        .then(res=>{
          if (!res.jxOK&&('error' in res.jx)) scribe.error(res.jx.error.msg + ': ' + res.jx.detail);
          return res; })
        .catch(e=>{scribe.error(e);});
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
    loadSchema: function(schema) {
      if (typeof schema=='string') {  // location.hash given so convert to object, assuming live source
	    schema = schema.replace('-','/');	// fix subfolder delimiter passed as - character
        schema = {src:'live',store:schema.substr(1,schema.lastIndexOf('/')-1),file:schema.substr(schema.includes('/')?schema.lastIndexOf('/')+1:1)+'.json' }
        schema.spec = makePath(this.sources[schema.src],cfg.folders.schema,schema.store,schema.file);
      };
      this.sources.active = schema.src;
      scribe.log("loadSchema:",schema.spec);
      var rqst = {
        body: { file: { name: schema.store+'/'+schema.file, folder: 'schema' } },
        method: 'POST',
        url: this.sources[schema.src] + cfg.locations.cms+'@download',
        verbose: debug
      };
      var self = this;
      self.load(rqst)
        .then(res=>{ 
          if (res.jxOK&&('contents' in res.jx)) {
            let refreshedSchema = schemaDefinitions.newSchema.copyByValue();
            if ('series' in (res.jx.contents||{})) refreshedSchema.series = schemaDefinitions.series.copyByValue();
            let save = refreshedSchema.copyByValue()
            self.schema = refreshedSchema.mergekeys(self.updateSchemaElements(res.jx.contents));
            self.save = { schema: self.schema.copyByValue(), data: self.extractData(), raw: self.extractData(undefined,true) };
            self.touch('*');
            return res;
          };
        })
        .catch(e=>{scribe.error(e);});
    },
    login: function() {
      this.authenticated = false;
      if (this.user.name && this.user.pw) {
        var self = this;
        self.load({url:cfg.locations.cms+'@login'})
          .then(res=>{ 
            console.warn("res:",res);
            if (res.jxOK&&res.jx.user) {
              for (let k in res.jx.user) { Vue.set(self.user,k,res.jx.user[k]); };
              console.warn("user:",res.jx.user,self.user);
              self.authenticated = self.user.member.includes('author')||self.user.member.includes('developer');
              self.mode = self.user.member.includes('developer') ? 'developer' : 'author';
            };
            if (self.authenticated) {
              scribe.info("login: ",self.user.name,' authenticated as ',self.mode.toUpperCase());
              scribe.info("user: ",JSON.stringify({name:self.user.name,session:self.user.session}));
              self.storage.session.save('user',{name:self.user.name,session:self.user.session});
              if (cfg.session) self.user.pw = self.storage.session.recall('user')['session']['id']; // make session id the active pw 
            } else {
              scribe.warn("login: ",self.user.name,' authentication failed!');
              if (self.user.pw==self.user.session.id) scribe.warn("login: ",self.user.name,' session expired!');
            };
            return self.authenticated; })
          .then(res=>{ if (res) self.listFolders().then(res=>{ if (location.hash) self.loadSchema(location.hash); }); })
          .catch(e=>{});
      }
    },
    menuDo: function(menu,choice,option) {
      switch (menu) {
        case 'manager':
          switch (choice) {
            case 'context': this.context = this.mode=='author' ? 'data' : (this.context=='schema' ? 'data' : 'schema'); break;
            case 'debug': if (option) {verbose=!verbose;} else {debug=!debug;}; scribe.info('DEBUG:', debug, verbose?'verbose':''); break;
            case 'edit': this.mngrView = choice; this.context = option; break;
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
            case 'copy': this.act({action:'copy',evt:option}); break;
            case 'delete': this.act({action:'delete',evt:option}); break;
            case 'expand': this.treeExpand = ({'+':'-','-':'*','*':'+'})[this.treeExpand]; break;
            case 'move': this.act({action:'move',direction:option}); break;
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
              let offset = (direction=='up') ?  -1 : 1;
              let newIndex = this.active.index + offset;
              let swap = this.active.parent.children[newIndex];
              Vue.set(this.active.parent.children,newIndex,this.active.child);
              Vue.set(this.active.parent.children,this.active.index,swap);
              this.touch(this.getKinOf(this.active.heir,'sibling',newIndex));
            };
            break;
          case 'promote':
            if (this.active.grandparent) {  // move child under grandparent
              let active = this.active.copyByValue();
              this.active.parent.children.splice(active.index,1);
              this.touch(this.getKinOf(this.active.heir,'parent'));
              this.active.parent.children.splice(this.active.index+1,0,active.child);
              this.touch(this.getKinOf(this.active.heir,'sibling',this.active.index+1));
            };
           break;
          case 'demote':
            var sibling = (this.active.index>0) ? this.active.parent.children[this.active.index-1] : null;
            if (sibling&&sibling.container) {
              sibling.children.push(this.active.child); // move child under sibling
              this.active.parent.children.splice(this.active.index,1);  // delete child from current parent
              this.touch(this.getKinOf(this.active.heir,'sibling',this.active.index-1));
              this.touch(this.getKinOf(this.active.heir,'child',sibling.children.length-1));
            };
            break;
        };
    },
    publish: function(dest, args) {
      var addKWs = (src,kwStr,i) => { (kwStr||'').split(',').map(kw=>kw.trim()).forEach(kw=>(kw in src)?src[kw].push(i):src[kw]=[i]); return src; };
      scribe.log(dest=="live" ? "publish" : "preview",this.schema.series ? "[series]":"",": ",args.asString());
      // build file records, include history for live destination
      let files=[]; let bakExt='.' + this.schema.version + '.bak';
      if (dest=='live') {
        this.schema.version = args.history.version;
        this.schema.history.push(args.history);
      };
      let active = this.schema.series ? this.schema.series.active : null;
      // determine of this is a new post or edit of last post vs edit of an old post...
      let newEdit = !this.schema.series || ((active==null) || (active==(this.schema.series.index.length-1)));
      console.log("publish:",active,newEdit);
      let meta = (this.schema.series||{}).meta||{};
      // restore saved schema if an old post has been editted.
      let schemaSchema = (newEdit ? this.schema : this.save.schema).copyByValue();
      let schemaData = this.extractData();                      // current data for normal post or series post
      // restore original schema and extracted data of last entry, if editting an earlier post.
      let seriesData = Object.assign({},newEdit?schemaData:this.save.data,{$index:[],$keywords:{}});  // (series) index data;
      let seriesInstanceData = { $data:{}, $meta:{} };          // placeholder
      if (schemaSchema.series) { // define post data, update meta data and build an index
        let rawSchemaData = this.extractData(undefined,true);  // raw data for series data
        // construct series instance data file name
        meta.dtd = new Date().style('iso');
        let dtd = new Date(meta.dtd).style(cfg.series.dformat||'YYYYMMDDThhmm');
        let pstr = '00000000' + (1 + (active===null ? schemaSchema.series.index.length:active));
        let ver = schemaSchema.version.replace(/^\d+/,'');
        // file pattern --> $d:date, $p:post, $u:user, $v:version, $$:$
        meta.file = makePath(this.schema.files.store,schemaSchema.files.series.replace(/\$([dpuv$])(\d+)?/ig,(m,x,n)=> 
          x=='$'?'$':x=='u'?this.user.name:x=='d'?dtd:x=='p'?pstr.substr(-(n||4)):x=='v'?ver:'?'));
        //instance data contents...
        seriesInstanceData = { $data: schemaData, $meta: meta };
        // build the series index and keywords table data ...
        schemaSchema.series.index.forEach((p,i)=>{seriesData.$index.push({$meta:p.$meta, $data:null}); addKWs(seriesData.$keywords,p.$meta.keywords,i)});
        // update schema file and series data...
        // add current post (new to end of index or edit metadata for editted post
        if (newEdit) {
          // add new post to schema index...
          schemaSchema.series.index.push({$meta: meta, $data:rawSchemaData });
          // add "new" current post to end of series index ...
          seriesData.$index.push({$meta: meta, $data:schemaData });
        } else {
          // update previous schema index contents...
          schemaSchema.series.index[active] = {$meta: meta, $data:rawSchemaData };
          schemaSchema.series.index[schemaSchema.series.index.length-1].$data = this.save.raw;
          // update series index for active index...
          seriesData.$index[active].$meta = meta
          seriesData.$index[schemaSchema.series.index.length-1].$data = this.save.raw;
        };
        //update keywords...
        addKWs(seriesData.$keywords,meta.keywords,seriesData.$index.length-1);
      };
      // prep filespecs...
      // prep schema file
      let spec = makePath(this.schema.files.store,this.schema.files.schema);
      let backupSpec = (args.backup) ? spec.replace('.json',bakExt) : '';
      files.push({ backup: backupSpec, contents: schemaSchema, folder: 'schema', name: spec });
      // prep data file...
      spec = makePath(this.schema.files.store,this.schema.files.data);
      backupSpec = (args.backup) ? spec.replace('.json',bakExt) : '';
      files.push({ backup: backupSpec, contents:  schemaSchema.series?seriesData:schemaData, folder: 'data', name: spec });
      // prep series file...
      if (this.schema.series) {
        spec = meta.file;
        backupSpec = (args.backup) ? spec.replace('.json',bakExt) : '';
        files.push({ backup: backupSpec, contents: seriesInstanceData, folder: 'data', name: spec });
      };
      if (args.writeEnable) { 
        // publish to live site if specified
        if (dest=='live'){
          this.load({url:cfg.locations['live']+cfg.locations.cms+'@upload', method:'POST', body:{files: files},verbose:debug})
            .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
            .catch(e=>{scribe.error(e)});
          if (this.schema.series) {
            /// not sure about this
            this.schema.series.index = schemaSchema.series.index;  // backfill series data
            this.schema.series.active = schemaSchema.series.index.length-1;
            /// new meta data???
          };
        };
        // always publish to preview site
        this.load({url:cfg.locations['preview']+cfg.locations.cms+'@upload', method:'POST', body:{files: files},verbose:debug})
          .then(res=>{ scribe.info(res.jxOK ? res.jx : res.raw); })
          .catch(e=>{scribe.error(e)});
      } else {
        files.forEach(f=>{ console.log(f.folder+'/'+f.name+':',f.contents); });
      };
    },
    scribeObj: function() { 
      var msgs = this.msgs;
      var postIt = function(...args) {
        var msg = (typeof args[1]=='object') ? JSON.stringify(args[1],null,args[2]?2:undefined) : args.slice(1).join(' ');
        msgs.push({dtd: new Date().style('iso','local'),level: args[0],text: msg});
        if (msgs.length>25) msgs.shift();
      };
      return {
        log: function(...args) { postIt('log',...args); },
        info: function(...args) { postIt('info',...args); },
        warn: function(...args) { postIt('warn',...args); console.warn(...args); },
        error: function(...args) { postIt('error',...args); console.error(...args); },
      };
    },
    setData: function(child,data){  // call with no data to clear current schema data
      if (child===undefined) child = this.schema;
      if (child.container) {
        for (let i in child.children) {
          let cdata = data!==undefined ? data[(child.container=='ordered') ? i : child.children[i].name] : undefined;
          this.setData(child.children[i],cdata);
        };
      } else {
        child.data = (data!==undefined) ? data : schemaDefinitions.elements[child.element].data;
      };
    },
    touch: function(heritage) {
      this.active = this.getHeritage(heritage);
      this.mngrView = 'edit'; // automatically show edit window if element touched
      this.context = (this.active.index!==null) ? this.context : 'data';  // switch to data root schema touched
    },
    updateSchemaElements: function(src) { // updates schema with any definition changes and new defaults
      let s = {};
      for (let key in src) {
        if (key=="children") {
          let c = [];
          for (let child in src[key]) {
            let el = src[key][child].element;
            if (el=='container') {
              c.push(this.updateSchemaElements(src[key][child]));              
            } else {
              c.push(Object.assign({},schemaDefinitions.elements[el],src[key][child]));
            };
          };
          s[key] = c;
        } else {
          s[key] = src[key];
        };
      };
      return s;
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

var md = window.markdownit('commonmark').use(markdownItAttrs).use(markdownitLinkPlus).use(markdownitDiv).use(markdownitSpan);
var md2html = function(content,strip=false) {
  let rendered = md.render(content);
  return strip ? rendered.replace(/^<p>|<\/p>(?:\n)?$/gm,'') : rendered;
};
vm.loadCfg()
  .then(res=>{scribe.log('Configuration successfully loaded!'); return res;})
  .then(res=>{
    let who = vm.storage.session.recall('user');
    if (who) {
      if ((new Date(who.session.expires).valueOf())>(new Date().valueOf())) {
        vm.user.name = who.name;
        vm.user.pw = who.session.id;
        vm.login();
      };
    };
  })
  .catch(e=>{scribe.error('ERROR initializing!');});
