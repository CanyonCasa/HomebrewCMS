/// Vue components library for HomebrewCMS

//Vue.filter('capitalize', str => { s = str ? str.toString : ''; return s.charAt(0).toUpperCase() + s.slice(1); };

Vue.component('tip',{
  template: `<span class="tip"><slot></slot></span>`
});

Vue.component('cms-menu',{
  props: ['context','menu','mode','option'],
  template: `
    <span class="cms-menu">

    <span v-show="menu=='child'">
    <i class="fas fa-plus tooltip" @click=""><tip class="tip-left">add new item</tip></i>
    <i class="fas fa-project-diagram tooltip" @click="action('object')"><tip class="tip-left">add unordered collection</tip></i>
    <i class="fas fa-list tooltip" @click="action('array')"><tip class="tip-left">add ordered collection</tip></i>
    <i class="far fa-check-square tooltip" @click="action('boolean')"><tip class="tip-left">add true/false value</tip></i>
    <i class="fas fa-hashtag tooltip" @click="action('numeric')"><tip class="tip-left">add numeric value</tip></i>
    <i class="fas fa-quote-left tooltip" @click="action('text')"><tip class="tip-left">add line of text value</tip></i>
    <i class="far fa-calendar-alt tooltip" @click="action('date')"><tip class="tip-left">add date value</tip></i>
    <i class="fas fa-dice tooltip" @click="action('enumerated')"><tip class="tip-left">add enumerated value</tip></i>
    <i class="fas fa-link tooltip" @click="action('link')"><tip class="tip-left">add hyperlink</tip></i>
    </span>
    
    <span v-show="menu=='manager'">
    <span class="upper-case tooltip" @click="action('mode')">{{ mode }}<tip>change user mode</tip></span>
    <i class="fas fa-cloud-download-alt fa-fw tooltip" @click="action('download')"><tip>download</tip></i>
    <i class="fas fa-info fa-fw tooltip" v-show="see" @click="action('edit','schema')"><tip>edit schema</tip></i>
    <i class="far fa-edit fa-fw tooltip" @click="action('edit','data')"><tip>edit data</tip></i>
    <i class="fas fa-database fa-fw tooltip" v-show="see" @click="action('result')"><tip>result info</tip></i>
    <i class="far fa-image tooltip" @click="action('resources')"><tip>upload image and documents</tip></i>
    <i class="fas fa-pen-fancy fa-fw tooltip" v-show="false" @click="action('style')"><tip>manage style</tip></i>
    <i class="far fa-newspaper fa-fw tooltip" v-show="false" @click="action('template')"><tip>manage template</tip></i>
    <i class="fas fa-user-cog fa-fw tooltip" v-show="see" @click="action('user')"><tip>manage user(s)</tip></i>
    <i class="fas fa-cloud-upload-alt fa-fw tooltip" @click="action('publish')"><tip>publish</tip></i>
    <i class="far fa-comment fa-fw tooltip" v-show="see" @click="action('log')"><tip>log</tip></i>
    <i class="fas fa-bug fa-fw tooltip" v-show="see" @click="(e)=>action('debug',e.ctrlKey)"><tip>toggle debug code</tip></i>
    <i class="far fa-question-circle fa-fw tooltip" @click="action('help')"><tip>help</tip></i>
    </span>
    
    <span v-show="menu=='schema'">
    <span v-show="option=='*'"><i class="fas fa-folder-plus fa-fw tooltip" @click="action('expand')"><tip>cycle expand/collapse tree</tip></i></span>
    <span v-show="option=='+'"><i class="fas fa-folder-minus fa-fw tooltip" @click="action('expand')"><tip>cycle expand/collapse tree</tip></i></span>
    <span v-show="option=='-'"><i class="fas fa-folder-open fa-fw tooltip" @click="action('expand')"><tip>cycle expand/collapse tree</tip></i></span>
    <i class="fas fa-copy fa-fw tooltip" v-show="see" @click="(e)=>action('copy',e)"><tip>copy element</tip></i>
    <i class="fas fa-angle-double-up fa-fw tooltip" v-show="see" @click="action('move','up')"><tip>move element up</tip></i>
    <i class="fas fa-angle-double-down fa-fw tooltip" v-show="see" @click="action('move','down')"><tip>move element down</tip></i>
    <i class="fas fa-outdent fa-fw tooltip" v-show="see" @click="action('move','promote')"><tip>promote element</tip></i>
    <i class="fas fa-indent fa-fw tooltip" v-show="see" @click="action('move','demote')"><tip>demote element</tip></i>
    <i class="far fa-trash-alt fa-fw tooltip" v-show="see" @click="(e)=>action('delete',e)"><tip>delete element - CTRL+CLICK</tip></i>
    </span>
    
    <span v-show="menu=='result'">
    <i class="fas fa-exchange-alt fa-fw tooltip" v-show="see" @click="action('context')"><tip>swap schema/data context</tip></i>
    <!--<i class="fas fa-sitemap fa-fw tooltip" v-show="see" @click="action('refresh')"><tip>refresh data output</tip></i>-->
    <i class="fas fa-copy fa-fw tooltip" v-show="see" @click="action('clip')"><tip class="tip-right">copy schema/data to clipboard</tip></i>
    </span>
    
    </span>`,
  computed: {
    see: function() { return this.mode=='developer'; }
  },
  methods: {
    action: function(choice,option) { this.$emit('pick',this.menu,choice,option); }
  }
});

Vue.component('e-notes',{
  data: () => ({ edit:-1, newNote:'' }),
  props: ['notes','context'],
  template: `
    <div>
    <fieldset class="fieldset-element" v-if="context=='schema'"><legend class="legend-element"> Notes... </legend>
      <div v-for="note,i in notes">
        <div class="note-grid" v-if="edit!==i">
          <div class="note-note">{{ i+1 }}. {{ note }}</div>
          <div class="note-icons"><i class="far fa-edit" @click="action('edit',i)"></i><i class="far fa-trash-alt" @click="action('del',i)"></i></div>
        </div>
        <div class="note-grid" v-else>
          <input class="note-note note-stretch" type="text" v-model:value="notes[i]" @change="action('chg',i)" />
          <div class="note-icons"><i class="far fa-check-square" @click="action('chg',i)"></i></div>
        </div>
      </div>
      <div class="note-grid">
        <input class="note-note note-stretch" type="text" v-model:value="newNote" @change="action('add')" :placeholder="'Enter new note here...'" />
        <div class="note-icons"><i class="far fa-plus-square" @click="action('add')"></i></div>
      </div>
    </fieldset>
    <fieldset class="fieldset-element" v-if="notes&&context=='data'&&notes.length"><legend class="legend-element"> Notes... </legend>
      <ol>
      <li v-for="note in notes">{{ note }}</li>
      </ol>
    </fieldset>
    </div>`,
  methods: {
    action: function(act,arg) {
      switch (act) {
        case 'add': this.notes.push(this.newNote); this.newNote = ''; break;
        case 'chg': this.edit = -1; break;
        case 'del': this.notes.splice(arg,1); break;
        case 'edit': this.edit = arg; break;
      };     
    }
  }
});

Vue.component('f-tree',{
  props: ['highlight','filter','flist','store'],
  template: `
    <ul class="f-tree">
    <li v-for="f,i in flist.filter(f=>dOK(f)||fOK(f,filter))">
      <span class="f-tree-item" v-if="fOK(f,filter)" @click.stop="touch(f)"><i class="far fa-file-alt fa-fw f-tree-icon"></i>{{ lbl(f.name) + ' [' + f.name +']' }}</span>
      <span v-if="dOK(f)">
        <i class="far fa-folder-open fa-fw f-tree-icon"></i>{{ (f.name + ' folder').toUpperCase() }}
        <f-tree :highlight="highlight" :filter="filter" :flist="f.listing" :store="store+'/'+f.name" @act="act"></f-tree>
      </span>
    </li>
    </ul>`,
  methods: {
    act: function(msg) { this.$emit('act',msg); },
    dOK: (f) => 'listing' in f,
    fOK: (f,fltr) => !('listing' in f) && f.name.endsWith(fltr),
    lbl: (f) => f.replace('.json','').toUpperCase(),
    touch: function(f) { this.$emit('act',{action: 'pick', file:f, store: this.store}); }
  }
});

Vue.component('f-tree-plus',{
  props: ['filter','flist','store'],
  template: `
    <div class="f-tree">
      <span v-for="f,i in flist.filter(f=>isDir(f)||fOK(f,filter))">
        <span class="f-tree-grid">
        <span class="f-tree-file"><i :class="icon(f)"></i><span v-if="!isDir(f)" @click.stop="touch(f)">{{ f.name }}</span><span v-else>{{ f.name + ' FOLDER' }}</span></span>
        <span v-if="!isDir(f)" class="f-tree-size">{{ inKB(f.size) }}</span>
        <span v-if="!isDir(f)" class="f-tree-date">{{ dtd(f.date) }}</span>
        </span>
        <span v-if="isDir(f)"><f-tree-plus class="f-tree-indent" :filter="filter" :flist="f.listing" :store="store+'/'+f.name" @act="act"></f-tree-plus></span>
      </span>
    </div>`,
  methods: {
    act: function(msg) { this.$emit('act',msg); },
    dtd: (d) => new Date(d*1000).style('Y-0M-D h:m:s a z','local'),
    fOK: (f,fltr) => !('listing' in f) && f.name.endsWith(fltr),
    icon: (f) => 'far ' + ('listing' in f ? 'fa-folder-open' : 'fa-file-alt') + ' fa-fw f-tree-icon',
    inKB: (s) => (s/1024).toFixed(0) + 'KB',
    isDir: (f) => 'listing' in f,
    touch: function(f) { this.$emit('act',{action: 'pick', file:f, store: this.store}); }
  }
});

Vue.component('history',{
  props: ['history'],
  template: `
    <div>
    <fieldset class="fieldset-element"><legend class="legend-element"> History... </legend>
      <div class="history-grid" v-for="h in history.slice().reverse()">
      <span class="history-dtd">{{ h.dtd }}</span>
      <span class="history-author">{{ h.author }}</span>
      <span class="history-note">{{ h.note }}</span>
      </div>
    </fieldset>
    </div>`,
});

Vue.component('scribe',{
  props: ['msgs'],
  template: `
    <div class="scribe">
    <span class="msg-grid" v-for="msg in msgs.slice().reverse()">
      <span :class="'msg-date msg-' + msg.level"><i class="far fa-clock tooltip"><tip class="tip-left">{{ msg.dtd }}</tip></i></span>
      <span :class="'msg-text msg-' + msg.level"> {{ msg.text }}</span>
    </span>
    </div>`
});

Vue.component('mngr-download',{
  data: ()=> ({ backup: false, cloud: { file:'', store:'', spec: '', src: 'live' } }),
  props: ['files','folder','sources'],
  template: `
    <div>
    <div class="form-grid">
      <label class="form-lbl">Source:</label>
      <span class="form-input">
        <input type="radio" name="cloud.src" value="preview" v-model="cloud.src" @change="chgSrc" /> Preview [{{ sources['preview'] }}]
        <input type="radio" name="cloud.src" value="live" v-model="cloud.src" @change="chgSrc"/> Live Site [{{ sources['live'] }}]
        <input type="checkbox" v-model="backup" /> Include Backups
      </span>
      <span class="form-desc">NOTE: Only select preview if trying to recover a previously unpublished source.</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Schema:</label>
      <f-tree-plus class="form-input" :flist="files" :filter="backup?'':'.json'" :store="''" @act="pick"></f-tree-plus>
      <span class="form-desc">Pick schema from list...</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Selected:</label>
      <span class="form-input">{{ cloud.spec||'Please make schema selection ...' }}</span>
      <span class="form-desc">Click Download button to load this schema or make another selection.</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl"><button :disabled="!cloud.file" @click="download">Download</button></label>
    </div>
    
    </div>`,
  methods: {
    chgSrc: function(e) { this.cloud = {src:e.target.value,file:'',store:''}; this.list(); },
    download: function() { this.$emit('act',{action:'loadSchema',schema:this.cloud}); },
    list: function() { this.$emit('act',{action:'list',src:this.cloud.src}); },
    pick: function(selected) {this.cloud = { src:this.cloud.src,folder:this.folder,file:selected.file.name,store:selected.store.substr(1),
      spec: makePath(this.sources[this.cloud.src],this.folder,selected.store.substr(1),selected.file.name)}; }
  }
});

Vue.component('mngr-resources',{
  data: ()=> ({accept: {docs:'.csv,.doc,.docx,.pdf,.txt,.xls,.xlxs,.xml',images:'image/*',videos:'video/*',other:'*/*'},
    contents: null, msg: '', file: null, links: {ref: '', mark:'',html:''}, notation: '', resource: '', src: 'live', type: 'images' }),
  props: ['folders','lists'],
  template: `
    <div>
    <div class="form-grid">
      <label class="form-lbl">Resource:</label>
      <span class="form-input">
        <span v-show="folders.audio"><input type="radio" value="audio" v-model="type" @change="chgType" /> Audio</span>
        <span v-show="folders.docs"><input type="radio" value="docs" v-model="type" @change="chgType" /> Documents</span>
        <span v-show="folders.images"><input type="radio" value="images" v-model="type" @change="chgType"/> Images</span>
        <span v-show="folders.videos"><input type="radio" value="videos" v-model="type" @change="chgType"/> Videos</span>
        <span v-show="folders.other"><input type="radio" value="other" v-model="type" @change="chgType" /> Other</span>
      </span>
      <span class="form-desc">Select type of resource.</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">File:</label>
      <span class="form-input">
        <input v-show="false" ref="resourceFile" type="file" :accept="accept[type]" @change="chgFile" />
        <input type="button" value="Browse..." @click="$refs['resourceFile'].click();" />
      </span>
      <span class="form-desc">Select file to upload...</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Preview:</label>
      <img v-show="type=='images'" ref="resourceImg" class="form-input" src="" />
      <span class="form-desc">{{ resource }}<span v-if="msg" class="text-alert"><br>{{ msg }}</span></span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Notations:</label>
      <input class="form-input form-strecth" type="text" v-model="notation" @input="chgNotation" />
      <span class="form-desc">Annotation text for links. (i.e. displayed text)</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Links:</label>
      <span class="form-desc">
        REFERENCE: <span class="text-black">{{ links.ref }}</span> <i class="fas fa-copy fa-fw tooltip" 
          @click="action('clip',links.html)"><tip>copy to clipboard</tip></i><br>
        Markdown(MD): <span class="text-black">{{ links.mark }}</span> <i class="fas fa-copy fa-fw tooltip" 
          @click="action('clip',links.mark)"><tip>copy to clipboard</tip></i><br>
        RAW HTML: <span class="text-black">{{ links.html }}</span> <i class="fas fa-copy fa-fw tooltip" 
          @click="action('clip',links.html)"><tip>copy to clipboard</tip></i>
      </span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Upload:</label>
      <button class="form-input" :disabled="file===null||(contents&&contents.length>8000000)" @click="upload">UPLOAD</button>
      <span class="form-desc">Upload file to both preview and live sites...</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Existing:<br>({{type}})</label>
      <f-tree-plus class="form-input" :flist="flist" :filter="''" :store="''" @act="pick"></f-tree-plus>
      <span class="form-desc">Existing files. Check list to avoid overriding existing files.</span>
    </div>
    </div>`,
  computed: {
    flist: function() { return this.lists[this.type] ? this.lists[this.type].listing : []; }
  },
  methods: {
    action: function(action,text) { this.$emit('act',{action:action,text:text}); },
    chgSrc: function(e) { this.$emit('act',{action:'list',src:this.src}); },
    chgFile: function(e) { 
      this.msg = '';
      this.file = this.$refs["resourceFile"].files[0];
      this.makeLinks();
      this.resource = `${this.file.name} [${+(this.file.size/1024).toFixed(0)+1}KB] (${new Date(this.file.lastModified).style('iso','local')})`;
      var fReader = new FileReader();
      fReader.readAsDataURL(this.file);
      fReader.onloadend = event=>{
        this.contents = event.target.result;
        if (this.type=='images' && this.contents.length > 250000) this.msg = "Large images slow page load times, consider resizing before upload.";
        if (this.contents.length > 8000000) this.msg = "File too large to upload; must be uploaded via FTP.";
        if (this.type=='images') this.$refs['resourceImg'].src = event.target.result;
      };
    },
    chgNotation: function(e) { this.notation = e.target.value; this.makeLinks(); },
    chgType: function(e) { this.type = e.target.value; },
    makeLinks: function(name) {
      name = name || (this.file||{}).name;
      this.links.ref = makePath(this.folders[this.type],name);
      switch (this.type) {
        case 'images': 
          this.links.mark = `![${this.notation||name}](${this.links.ref} "${this.notation}")`;
          this.links.html = `<img src="${this.links.ref}" alt="${this.notation}" />`;
          break;
        default: 
          this.links.mark = `[${this.notation}](${this.links.ref})`; 
          this.links.html = `<a href="${this.links.ref}">${this.notation}</a>`;
      };
    },
    pick: function(info) { this.makeLinks(info.store ? info.store + "/" + info.file.name : info.file.name); },
    upload: function() {
      var file = { name: this.file.name, folder:this.type, format: 'base64', contents: this.contents };
      this.$emit('act',{action:'upload', file:file}); 
    }
  }
});

Vue.component('mngr-publish',{
  data: () => ({ backup:true, dx: new Date().style('YYYYMMDD'), newVersion: '', note: '' }),
  props: ['author','sources','version'],
  template: `
    <div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Settings... </legend>
      <div class="form-grid">
        <label class="form-lbl">Backup:</label>
        <span class="form-input"><input type="checkbox" v-model="backup"/> Enable Backup</span>
        <span class="form-desc">Generates a timestamped backup file on server.</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Version:</label>
        <input class="form-input" type="text" v-model="newVersion" ref="version"/>
        <span class="form-desc">Current ({{ version }})</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Note: </label>
        <input class="form-input form-stretch" type="text" ref="note" v-model:value="note" />
        <span class="form-desc">Brief description of changes. [REQUIRED to publish!]</span>
      </div>
      </fieldset>
      <fieldset class="fieldset-element"><legend class="legend-element"> Publishing... </legend>
      <p v-if="!author" class="alert">You must login to PREVIEW and PUBLISH!</p>
      <div class="form-grid">
        <label class="form-lbl form-stretch"><button :disabled="!author" @click="publish('preview')">PREVIEW</button></label>
        <span class="form-input">Uploads schema and data files to the preview site: [{{ sources.preview }}]</span>
        <span class="form-desc">NOTE: Does not impact live website.</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl form-stretch"><button :disabled="!note" @click="publish('live')">PUBLISH</button></label>
        <span class="form-input">Uploads schema and data files to the live web site: [{{ sources.live }}]</span>
        <span class="form-desc">NOTE: Records history and changes both preview and live websites.</span>
      </div>
      </fieldset>
    </div>`,
  created: function() { this.makeVersion(); },
  methods: {
    makeVersion: function() { this.newVersion = (this.version&&(this.version.startsWith(this.dx))) ? this.version.replace(/v(\d+)/,(m,n)=>'v'+(+n+1)) : this.dx+'v1'; },
    publish: function(dest) {
      var history = { author: this.author, dtd: new Date().style('iso'), note: this.note, version: this.newVersion };
      this.$emit('act',{ action: 'publish', dest: dest, args: {backup:this.backup,history:history} });
      if (dest='live') this.note='';   // prevent repeat form submission
    }
  },
  watch: {
    version: function() { this.makeVersion(); }
  }
});

Vue.component('mngr-users',{
  data: ()=> ({ action: 'create', button: {create:'CREATE USER',edit:'CHANGE USER'}, type: {pw:'password'},
    who: {email:'', fullname:'', member:[], name:'' ,pw:'', phone:'', ref:''} }),
  props: ['user'],
  template: `
    <div>
    <div class="form-grid">
      <label class="form-lbl">Action:</label>
      <span class="form-input">
        <span><input type="radio" value="create" v-model="action" /> Create</span>
        <span><input type="radio" value="edit" v-model="action" /> Edit</span>
        <span><input type="radio" value="manage" v-model="action" /> Manage</span>
      </span>
      <span class="form-desc"></span>
    </div>
    <span v-show="action=='create'||action=='edit'">
      <div class="form-grid">
        <label class="form-lbl">Username:</label>
        <input class="form-input" type="text" v-model="who.name"/>
        <span class="form-desc">Enter new username...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Password:</label>
        <span class="form-input"><input :type="type['pw']" v-model="who.pw" /><i class="fas fa-eye tooltip" @click="see('pw')"><tip>click to see password</tip></i></span>
        <span class="form-desc">Min 8 characters, 1+ each: a-z, A-Z, 0-9, !@#$...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Fullname:</label>
        <input class="form-input" type="text" v-model="who.fullname"/>
        <span class="form-desc">Please enter your username for reference...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Email:</label>
        <input class="form-input" type="text" v-model="who.email"/>
        <span class="form-desc">Please enter your email address for contact...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Phone:</label>
        <input class="form-input" type="text" v-model="who.phone"/>
        <span class="form-desc">Please enter your phone number for account activation and notices...</span>
      </div>
      <div class="form-grid">
        <button class="form-input" @click="submit">{{ button[action] }}</button>
      </div>
    </span>
    </div>`,
  methods: {
    see: function(ref) { this.type[ref] = this.type[ref]=='password' ? 'text' : 'password'; },
    submit: function() { this.$emit('act',{action:'user',info:{action:this.action,who:this.who}}); }
  },
  watch: {
    'action' : function() { if (this.action=='edit') {this.who = Object.assign({},this.user)}; }
  }
});

Vue.component('schema-info',{
  data: () => ({ series: false, trackSchema: true }),
  props: ['info'],
  template: `
    <div class="schema-info">
    <fieldset class="fieldset-element fieldset-info">
    <legend class="legend-element"> Schema Info Propeties... </legend>
    <div class="form-grid">
      <label class="form-lbl">Label:</label>
      <input class="form-input" type="text" v-model:value="info.label" />
      <span class="form-desc">Display-name of schema</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Description:</label>
      <input class="form-input form-stretch" type="text" v-model="info.description" />
      <span class="form-desc">Brief description of schema</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Type:</label>
      <span class="form-input">
        <input type="radio" value="unordered" v-model="info.container" /> Unordered (object)
        <input type="radio" value="ordered" v-model="info.container" /> Ordered (array)
      </span>
      <span class="form-desc">Specifies whether data renders as an object or array</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Store:</label>
      <input class="form-input" type="text" v-model="info.files.store" />
      <span class="form-desc">Optional subfolder path. (No leading or trailing slashes.)</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Schema File:</label>
      <input class="form-input" type="text" v-model="info.files.schema" @input="track" />
      <span class="form-desc">Filename of schema file</span>
    </div>
    <div class="form-grid">
      <label class="form-lbl">Data File:</label>
      <span class="form-input">
        <input type="text" v-model="info.files.data" />
        <input type="checkbox" v-model="trackSchema" /> Track schema filename
      </span>
      <span class="form-desc">Filename of schema result data</span>
    </div>
    <fieldset class="fieldset-element fieldset-info">
    <legend class="legend-element"> Series Propeties... </legend>
    <div class="form-grid">
      <label class="form-lbl">Series:</label>
      <span class="form-input"><input type="checkbox" ref="series" v-model:value="series" @input="(e)=>$emit('act','series',e.target.checked)" /> Sequential Data Files Mode</span>
      <span class="form-desc">Specifies whether page data renders as sequential data files (i.e. blog, newsfeed, ...)</span>
    </div>
    <div v-if="series" class="form-grid">
      <label class="form-lbl">Series Template:</label>
      <input class="form-input" type="text" v-model="info.series.template" />
      <span class="form-desc"><span v-if="series" class="text-white text-bold">REQUIRED! Defines the Vue component template used to render the series files</span></span>
    </div>
    <div v-if="series" class="form-grid">
      <label class="form-lbl">Series File:</label>
      <span class="form-input">
        <input type="text" v-model="info.files.series" />
      </span>
      <span class="form-desc">Filename template for serial posts</span>
    </div>
    </fieldset><br>
<!--    <div class="form-grid">
      <button class="form-input" @click="$emit('act','regen')">Regenerate Unique IDs</button>
      <span class="form-desc">Regenerates the schema and child ID's to ensure uniqueness.</span>
    </div>-->
    <p class="alert">NOTE: Schema information only saved when schema published.</p>
    </fieldset>
    </div>`,
  created: function() { this.series = !!this.info.series; },
  methods: {
    track: function(e) { if (this.trackSchema) Vue.set(this.info.files,'data',e.target.value); }
  }
});

Vue.component('schema-series',{
  data: () => ({ action:'new', index:null, view:false }),
  props: ['mode','series'],
  template: `
    <div class="series">
    <fieldset class="fieldset-element fieldset-series"><legend class="legend-element"> Series Post (i.e.Blog)... </legend>
      <!--<span>
        <input type="radio" value='new' v-model="action" /> NEW
        <input type="radio" value='edit' v-model="action" /> EDIT
        <input type="radio" value='copy' v-model="action" /> COPY
      </span>-->
      <div class="form-grid">
        <label class="form-lbl">Title:</label>
        <input type="text" class="form-input form-stretch" v-model="meta.title" />
      </div>
      <div class="form-grid">
        <label class="form-lbl">Author:</label>
        <input type="text" class="form-input" v-model="meta.author" />
      </div>
      <div class="form-grid">
        <label class="form-lbl">Dated:</label>
        <span class="form-input"> {{ dtd }} (Note: This value will update at publication time.)</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Brief:</label>
        <input type="text" class="form-input form-stretch" v-model="meta.brief" />
        <span class="form-desc">A one-line description of the post content...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Keywords:</label>
        <input type="text" class="form-input form-stretch" v-model="meta.keywords" />
        <span class="form-desc">A comma separated list of search keywords...</span>
      </div>
      <div v-if="mode=='developer'" class="form-grid">
        <label class="form-lbl">Template:</label>
        <input type="text" class="form-input form-stretch" v-model="meta.template" />
        <span class="form-desc">Template used to display series content.</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl"><button @click="clear">CLEAR</button></label>
        <span class="form-input"><button @click="view=!view">{{ caption }}</button></span>
      </div>
    <fieldset v-show="view" class="fieldset-element"><legend class="legend-element"> Previous Postings... </legend>
      <p>Series listing here...</p>
    </fieldset>
    </fieldset>
    </div>`,
  computed: {
    caption: function() { return this.view ? 'HIDE PREVIOUS POSTINGS' : 'VIEW PREVIOUS POSTINGS' },
    dtd: function() { return new Date().style('iso','local') },
    meta: function() { return this.series.meta||{}; }
  },
  methods: {
    clear: function() { this.meta = { author:'', title:'', brief:'', dtd:'', keywords:'' }; }
  }
});

Vue.component('schema-tree',{
  data: function () { return { open: [] }; },
  props: ['heritage','highlight','expand','mode','parent'],
  template: `
    <ul class="schema-list">
    <li class="schema-list-item" v-for="child,index in visibleChildren" @click.stop="touch(heir[index])">
      <span class="schema-container-icon" v-if="child.container">
      <i v-show="!isOpen(index)" class="fas fa-folder-plus" @click.stop="toggle(index)"></i>
      <i v-show="isOpen(index)" class="fas fa-folder-minus" @click.stop="toggle(index)"></i>
      </span>
      <span :class="'schema-list-label tooltip'+((heir[index]==highlight)?' se-active':'')">{{ child.label }}<tip class="tip-left">{{ child.description }}</tip></span>
      <schema-tree v-if="child.container" v-show="isOpen(index)" :highlight="highlight" :expand="expand" :heritage="heir[index]" :mode="mode"
        :parent="parent.children[index]" @act="act"></schema-tree>
    </li>
    <li v-show="mode=='developer'" class="schema-add-child">
      <cms-menu class="test" :menu="'child'" :mode="mode" @pick="addChild"></cms-menu>
    </li>
    </ul>`,
  computed: {  // only gets called for schema-tree instance, which by definition will be a parent...
    heir: function() { return (this.parent.children||[]).map((c,i)=>!c.hidden||this.mode=='developer' ? [this.heritage||'*',i].join('.') : null).filter(c=>c!==null); },
    id: function() { return makeArrayOf(this.parent.children.length,(v,i)=>this.name+'-'+i); },
    visibleChildren: function() { return (this.parent.children||[]).filter(c=>!c.hidden||this.mode=='developer'); }
  },
  methods: {
    act: function(msg) { this.$emit('act',msg); },
    addChild: function(m,c,o) { this.$emit('act',{action: 'add', parent: this.parent, element:c}) },
    toggle: function(index) { Vue.set(this.open,index,!this.open[index]); },
    isOpen: function(i) { return (this.open[i]&&(this.expand!='-'))||(this.expand=='+'); },
    touch: function(heir) { this.$emit('act',{action: 'touch', heritage: heir}); }
  }
});

Vue.component('schema-schema',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
      <fieldset class="fieldset-element fieldset-master">
      <legend class="legend-element legend-master">{{ schema.label }} ({{ context.toUpperCase() }})... </legend>
      <span v-if="context=='schema'">
        <schema-info :info="schema" @act="act"></schema-info>
        <history :history="schema.history"></history>
      </span>
      <span v-else>
        <schema-series v-if="schema.series" :mode="mode" :series="schema.series"></schema-series>
        <component v-for="ch,i in schema.children" :is="'schema-'+ch.element" :active="activeChild(i)" :context="context" :key="i" :mode="mode"></component>
      </span>
      </fieldset>
    </div>`,
  computed: {
    schema: function() { return this.active.child; }
  },
  methods: {
    act: function(a,x) { this.$emit('act',{action:a, option:x}); },
    activeChild: function(i) { return this.$root.getHeritage([this.active.heir,i].join('.')); }
  }
});

Vue.component('schema-boolean',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> BOOLEAN Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input form-bold">boolean</span>
        <span class="form-desc">Defines a boolean (true/false) value...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Value:</label>
        <input class="form-input" type="checkbox" v-model="my.data" />
        <span class="form-desc">Value assigned to data variable set by schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <fieldset class="fieldset-element"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
        <div v-show="!my.hidden">
        <input class="form-ck" type="checkbox" :disabled="locked" v-model="my.data" @input="chg" /> {{ my.description }}
        <e-notes :notes="my.notes" :context="context"></e-notes>
        </div>
        <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
      </fieldset>
    </div>
    </div>`,
  computed: {
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; } // shorthand
  },
  methods: {
    chg: function(e) { this.active.child.data = e.target.checked; }
  }
});

Vue.component('schema-numeric',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> NUMERIC Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">numeric</span>
        <span class="form-desc">Defines a numeric value...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Value:</label>
        <input class="form-input" type="text" v-model="my.data" @input="(e)=>{my.data=Number(e.target.value)}" />
        <span class="form-desc">Value assigned to data variable set by schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Constraints... </legend>
      <div class="form-grid">
        <label class="form-lbl">Minimum:</label>
        <input class="form-input" type="number" v-model:number="my.min" @input="(e)=>{my.min=Number(e.target.value)}" />
        <span class="form-desc">Minimum constraint for data value</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Maximum:</label>
        <input class="form-input" type="number" v-model:number="my.max" @input="(e)=>{my.max=Number(e.target.value)}" />
        <span class="form-desc">Maximum constraint for data value</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Filter:</label>
        <input class="form-input" type="text" v-model="my.filter" />
        <span class="form-desc">Regular Expression constraint for data value</span>
      </div>
      </fieldset>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <fieldset class="fieldset-element"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
        <div v-show="!my.hidden">
        <input class="form-input" type="number" :disabled="locked" v-model:number="my.data" @input="checkData" />
        <span class="form-desc">{{ my.description }}</span>
        <e-notes :notes="my.notes" :context="context"></e-notes>
        </div>
        <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
      </fieldset>
    </div>
    </div>`,
  computed: {
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; },  // shorthand
    re: function() { 
      if (!this.active.child.filter) return null;
      var [pat,flags] = this.active.child.filter.match(/\/(.*)\/([gimy])*$/).slice(1);
      return new RegExp(pat,flags);
    }
  },
  methods: {
    checkData: function(e) {
      if (e.target.value && this.re) {  // filter value if it and regular expression defined
          var match = e.target.value.match(this.re);
          e.target.value = (match!==null) ? match[0] : this.active.child.data;
      };
      // bound data if specified
      e.target.value = bound(this.active.child.min,e.target.value,this.active.child.max,this.active.child.data);
      this.active.child.data = Number(e.target.value);  //update data field
    }
  }
});

Vue.component('schema-text',{
  data: ()=> ({ frame: { element: null, ready: false, ref: null, src: '' }, preview: '', timex: null }),
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> Text Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">text</span>
        <span class="form-desc">Defines a single line or block of text...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Value:</label>
        <input class="form-input form-stretch" type="text" v-model="my.data" />
        <span class="form-desc">Value assigned to data variable set by schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        <input type="checkbox" v-model="my.block"/> Block
        </span>
        <span class="form-desc"></span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Auto Generated Output... </legend>
      <div class="form-grid">
        <label class="form-lbl">Generate:</label>
        <span class="form-input">
        <input type="radio" value="" v-model="my.auto" /> None
        <input type="radio" value="html" v-model="my.auto"/> MD to HTML
        </span>
        <span class="form-desc">Auto generate output.</span>
      </div>
      </fieldset>
      <fieldset class="fieldset-element"><legend class="legend-element"> Constraints... </legend>
      <div class="form-grid">
        <label class="form-lbl">Filter:</label>
        <input class="form-input" type="text" v-model="my.filter" />
        <span class="form-desc">Regular Expression constraint for data value</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Format:</label>
        <span class="form-input">
        <input type="radio" value="text" v-model="my.format" /> Text
        <input type="radio" value="md" v-model="my.format"/> Markdown
        <input type="radio" value="html" v-model="my.format"/> HTML
        </span>
        <span class="form-desc"></span>
      </div>
      <div class="form-grid" v-if="my.block">
        <label class="form-lbl">Block Size:</label>
        <span class="form-input">
        <input type="radio" value="sm" v-model="my.blocksize" /> Small
        <input type="radio" value="med" v-model="my.blocksize"/> Medium
        <input type="radio" value="lrg" v-model="my.blocksize"/> Large
        <input type="radio" value="xl" v-model="my.blocksize"/> Extra Large
        </span>
        <span class="form-desc"></span>
      </div>
      </fieldset>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <fieldset class="fieldset-element">
        <legend class="legend-element"> {{ my.label+' ['+my.format.toUpperCase()+']'+(locked ? ' (LOCKED)' : '') }} </legend>
        <div v-show="!my.hidden">
        <span class="form-grid-alt">
          <textarea v-if="my.block" :class="'form-input form-stretch form-ta-'+my.blocksize" v-model:value="my.data" :readonly="locked" @input="chkText"></textarea>
          <input v-if="!my.block" type="text" class="form-input form-stretch" :disabled="locked" v-model:value="my.data" @input="chkText" />
          <fieldset v-if="my.auto" class="fieldset-element"><legend class="legend-element"> Generated Output... </legend>
          <iframe v-if="my.block" ref="aframe" :height="autoHeight" width="100%"></iframe>
          <span v-if="!my.block" class="form-input form-stretch" v-html="preview"></span>
          </fieldset>
        </span>
        <span class="form-desc">{{ my.description }}</span>
        <e-notes :notes="my.notes" :context="context"></e-notes>
        </div>
        <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
      </fieldset>
    </div>
    </div>`,
  created: function() { if (this.my.block&&this.my.auto) this.chkFrameReady(); if (this.my.auto) this.render(); },
  computed: {
    autoHeight: function() { return ({ sm: '100px', med: '200px', lrg: '400px', xl: '800px' })[this.my.blocksize]||0; },
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() { return this.active.child||{}; },  // shorthand
    re: function() { 
      if (!this.my.filter) return null;
      var [pat,flags] = this.my.filter.match(/\/(.*)\/([gimy])*$/).slice(1);
      return new RegExp(pat,flags);
    }
  },
  methods: {
    chkFrameReady: function() {
      if (window.cfg&&window.cfg.autoTextFrame) {
        if (!this.frame.src) this.frame.src = window.cfg.autoTextFrame.src;
        if (this.$refs.aframe) this.frame.ref = this.$refs.aframe;
        if (this.frame.ref) { 
          if (!this.frame.ref.src) this.frame.ref.src = this.frame.src;
          var doc = this.frame.ref.contentDocument || this.frame.ref.contentWindow.document;
          var element = doc.getElementById(window.cfg.autoTextFrame.element);
          if (element) {
            this.frame.element = element;
            this.frame.element.innerHTML = md2html.render(this.my.data||'');
            return;
          };
        };
      };
      setTimeout(this.chkFrameReady,100);
    },
    chkText: function(e) {
      if (e.target.value && this.re) {  // filter value if it and regular expression defined
          var match = e.target.value.match(this.re);
          e.target.value = (match!==null) ? match[0] : this.my.data;
      };
      this.my.data = (e.target.value!==null) ? e.target.value : this.my.data;  //update data field
      this.debounce();
    },
    debounce: function() { 
      if (this.my.auto) { 
        clearTimeout(this.timex); 
        this.timex=setTimeout(this.render,1000);
      };
    },
    render: function() {
      if (this.my.block) {
        if (this.frame.element) this.frame.element.innerHTML = md2html.render(this.my.data||'');
      } else {
        this.preview = md2html.render(this.my.data||'');
      };
    }
  }
});

Vue.component('schema-date',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> Date Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">date</span>
        <span class="form-desc">Defines a date value...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Value:</label>
        <span class="form-input">{{ my.data }}</span>
        <span class="form-desc">Value assigned to data variable set by schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Constraints... </legend>
      <div class="form-grid">
        <label class="form-lbl">Format:</label>
        <span class="form-input">
        <input type="radio" value="datetime" v-model="my.format" /> Date and Time
        <input type="radio" value="date" v-model="my.format"/> Date
        <input type="radio" value="time" v-model="my.format"/> Time
        </span>
        <span class="form-desc"></span>
      </div>
      </fieldset>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <fieldset class="fieldset-element"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
        <div v-show="!my.hidden">
        <span class="form-input">
        <fieldset class="fieldset-element fieldset-inline" v-show="my.format!='time'"><legend class="legend-element"> Date </legend>
        <input type="date" :disabled="locked" v-model="fields[0]" @input="chg" />
        </fieldset>
        <fieldset class="fieldset-element fieldset-inline" v-show="my.format!='date'"><legend class="legend-element"> Time </legend>
        <input type="time" :disabled="locked" v-model="fields[1]" @input="chg" />
        </fieldset>
        </span>
        <span class="form-desc">{{ my.description }}</span>
        <e-notes :notes="my.notes" :context="context"></e-notes>
        </div>
        <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
      </fieldset>
    </div>
    </div>`,
  updated: function() { if (!this.active.child.data) this.active.child.data = new Date().toISOString(); },
  computed: {
    fields: function() { return new Date(this.active.child.data).style('form') },
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; } // shorthand
  },
  methods: {
    chg: function() { this.active.child.data = new Date(this.fields.join(' ')); this.$emit('chg'); }
  }
});

Vue.component('schema-enumerated',{
  data: () => ({ edit:-1, newLabel:'', newValue:'', selections:[] }),
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> Enumerated Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">enumerated</span>
        <span class="form-desc">Defines a list of values form which to choose...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Value:</label>
        <span class="form-input">{{ my.data }}</span>
        <span class="form-desc">Value assigned to data variable set by schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Constraints... </legend>
      <div class="form-grid">
        <label class="form-lbl">Mode:</label>
        <span class="form-input"><input type="checkbox" v-model="my.multiple" /> Allow multiple selections</span>
        <span class="form-desc"></span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Choices... </legend>
        <div v-for="choice,i in my.choices">
          <div class="choice-grid" v-if="edit!==i">
            <div class="choice-choice">{{ choice.asString() }}</div>
            <div class="choice-icons"><i class="far fa-edit" @click="action('edit',i)"></i><i class="far fa-trash-alt" @click="action('del',i)"></i></div>
          </div>
          <div class="choice-grid" v-else>
            <span class="choice-choice">
            <input type="text" v-model:value="my.choices[i][0]" @change="action('chg',i)" />
            <input type="text" v-model:value="my.choices[i][1]" @change="action('chg',i)" />
            </span>
            <div class="choice-icons"><i class="far fa-check-square" @click="action('chg',i)"></i></div>
          </div>
        </div>
        <div class="choice-grid">
            <span class="choice-choice">
            <fieldset class="fieldset-element fieldset-inline"><legend class="legend-element"> Selection </legend>
            <input class="choice-choice" type="text" v-model:value="newLabel" ref="label" @keyup.enter="action('add')"/>
            </fieldset>
            <fieldset class="fieldset-element fieldset-inline"><legend class="legend-element"> Value (Default=Selection)</legend>
            <input class="choice-choice" type="text" v-model:value="newValue" ref="value" @keyup.enter="action('add')" />
            </fieldset>
            </span>
          <div class="choice-icons"><i class="far fa-plus-square" @click="action('add')"></i></div>
        </div>
      </fieldset>
      </fieldset>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <div v-show="!my.hidden">
      <fieldset class="fieldset-element"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
      <select class="form-input" v-if="my.multiple" required :disabled="locked" multiple="true" v-model="selections" @change="change">     
      <option value="" selected disabled>Choose from list...</option>
      <option v-for="choice,index in my.choices" :value="choice[1]">{{ choice[0] }}</option>
      </select>      
      <select class="form-input" v-else required :disabled="locked" @change="change">     
      <option value="" selected disabled>Choose from list...</option>
      <option v-for="choice,index in my.choices" :value="choice[1]">{{ choice[0] }}</option>
      </select>    
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
      </div>
      <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
    </div>
    </div>`,
  computed: { 
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; } // shorthand
  },
  methods: {
    action: function(act,arg) {
      switch (act) {
        case 'add': 
          if (this.newLabel) { 
            this.active.child.choices.push([this.newLabel,this.newValue||this.newLabel]); this.newLabel = '';  this.newValue = ''; this.$refs.label.focus(); 
          }; 
          break;
        case 'chg': this.edit = -1; break;
        case 'del': this.active.child.choices.splice(arg,1); break;
        case 'edit': this.edit = arg; break;
      };     
    },
    change: function(e) {
      if (this.active.child.multiple) {
        this.active.child.data = this.active.child.choices.filter((e,i)=>this.selections.map(i=>i-1).includes(i));
      } else {
        this.active.child.data = [this.active.child.choices[e.target.selectedIndex-1]];
      };
      this.$emit('chg');
    }
  }
});

Vue.component('schema-link',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element"><legend class="legend-element"> Hyperlink Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">link</span>
        <span class="form-desc">Defines a hyperlink element with multiple output forms...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema element</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema element, if not element of array</span>
      </div>
      <fieldset class="fieldset-element"><legend class="legend-element"> Constraints... </legend>
        <div class="form-grid">
          <label class="form-lbl">Format:</label>
          <span class="form-input">
          <input type="radio" value="object" v-model="my.link.format" /> Javascript Object
          <input type="radio" value="anchor" v-model="my.link.format"/> HTML Anchor
          </span>
          <span class="form-desc">Output data format</span>
        </div>
        <div class="form-grid">
          <label class="form-lbl">Target:</label>
          <span class="form-input">
          <input type="checkbox" v-model="my.link.external" /> Blank Tab or Window
          </span>
          <span class="form-desc">Target an external blank tab or window when link opens</span>
        </div>
        <div class="form-grid">
          <label class="form-lbl">Action:</label>
          <span class="form-input">
          <input type="radio" value="href" v-model="my.link.action" /> Hyperlink 'href'
          <input type="radio" value="onclick" v-model="my.link.action"/> Hyperlink 'onclick'
          </span>
          <span class="form-desc">Defines property name used for link action</span>
        </div>
      </fieldset>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <div v-show="!my.hidden">
      <fieldset class="fieldset-element"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
      <div class="form-grid">
        <label class="form-lbl">Text:</label>
        <input ref="text" class="form-input form-stretch" type="text" v-model="my.link.text" @input="chgLink" />
        <span class="form-desc">Text displayed as clickable link</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Image:</label>
        <input ref="text" class="form-input form-stretch" type="text" v-model="my.link.image" @input="chgLink" />
        <span class="form-desc">Image displayed as clickable link. (Text used as title attribute if output as anchor.)</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Link:</label>
        <input ref="link" class="form-input form-stretch" type="text" v-model="my.link.link" @input="chgLink" />
        <span class="form-desc">Hyperlink destination. Prefix with # for local link</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Data:</label>
        <span class="form-input">{{ preview }}</span>
        <span class="form-desc">Hyperlink output data</span>
      </div>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
      </div>
      <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
    </div>
    </div>`,
  computed: { 
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; },  // shorthand
    preview: function() { return typeof this.my.data=='object' ? (this.my.data||{}).asString() : this.my.data; }
  },
  methods: {
    chgLink: function(e) {
      let { action, external, format, image, link, text } = this.my.link;
      if (format=='anchor') {
        let img = (image) ? '<img src="'+image+'" alt="'+text+'" />' : null;
        this.my.data = '<a href="'+(action=='href'?'':'" onclick="')+link+'"'+(external?' target="_blank"':'')+(img?' title="'+text+'"':'')+'>'+(img?img:text)+'</a>';
      } else {
        this.my.data = { image: image, link: link, target: external ? "_blank" : undefined, text: text};
      };
    }
  }
});

Vue.component('schema-container',{
  props: ['active','context','lock','mode'],
  template: `
    <div>
    <div v-if="context=='schema'">
      <fieldset class="fieldset-element fieldset-container"><legend class="legend-element"> Container Element... </legend>
      <div class="form-grid">
        <label class="form-lbl">Element:</label>
        <span class="form-input">container</span>
        <span class="form-desc">Defines an object (or array) that holds other elements...</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Type:</label>
        <span class="form-input">
          <input type="radio" name="type" value="unordered" v-model="my.container" /> Unordered (object)
          <input type="radio" name="type" value="ordered" v-model="my.container" /> Ordered (array)
        </span>
        <span class="form-desc">Specifies whether data renders as an object or array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Label:</label>
        <input class="form-input" type="text" v-model="my.label" />
        <span class="form-desc">Text displayed in schema view</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Description:</label>
        <input class="form-input form-stretch" type="text" v-model="my.description" />
        <span class="form-desc">Brief description of schema container function</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Name:</label>
        <input class="form-input" type="text" v-model="my.name" />
        <span class="form-desc">Name of data variable set by schema container, if not element of array</span>
      </div>
      <div class="form-grid">
        <label class="form-lbl">Flags:</label>
        <span class="form-input">
        <input type="checkbox" v-model="my.readonly" /> Read-only
        <input type="checkbox" v-model="my.hidden"/> Hidden
        </span>
        <span class="form-desc"></span>
      </div>
      <e-notes :notes="my.notes" :context="context"></e-notes>
      </fieldset>
    </div>
    <div v-if="context=='data' && isVisible">
      <fieldset class="fieldset-element fieldset-container"><legend class="legend-element"> {{ my.label+(locked ? ' (LOCKED)' : '') }} </legend>
        <div v-show="!my.hidden">
          <e-notes :notes="my.notes" :context="context"></e-notes>
          <component v-for="child,i in my.children" :key="i" :is="'schema-'+child.element" :active="activeChild(i)" :context="context" :lock="locked" :mode="mode"
            @chg="$emit('chg')"></component>
        </div>
        <p v-show="my.hidden" class="alert">Hidden element not avaiable for editing!</p>
      </fieldset>
    </div>
    </div>`,
  computed: {
    isVisible: function () { return !this.active.child.hidden || (this.mode=='developer'); },
    locked: function() { return this.lock||this.active.child.readonly; },
    my: function() {return this.active.child; } // shorthand
  },
  methods: {
    activeChild: function(i) { return this.$root.getHeritage([this.active.heir,i].join('.')); }
  }
});

Vue.component('schema-undefined',{ template: `<!-- undefined template -->` });
