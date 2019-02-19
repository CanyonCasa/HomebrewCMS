/*******************************************************************************
This file defines the default configuration datas and root schema used to 
represent a simple JSON file based content management system. 

  cfg:          DEFAULT configuration definitions
    version:    current configuration definition version
    authAs:     group user name
    folders:    user configurable folders used by HomebrewCMS and site (open access)
    locations:  site specific paths used internally to access HomebrewCMS components

///*************************************************************
/// NOTE: DO NOT REDEFINE ROOT SCHEMA BELOW. 
/// Schema extensions saved to cfg.paths.schema location.
///*************************************************************

  schema:             as defined here, an object that represents the base schema definitions
                      as an instance, defines a specific schema used to define a spcific data tree
                      Note: * marks properties assumed "immutable", which should be treated as read-only..
      
    author:           name for change history
    backup:           flag to denote whether to backup schema before overwriting
    container:        defines schema as a container  
    copyright:        copyright notice, (c)2018 Enchanted Engineering
    description:      a short schema description
    element:          element type (array or object)
    files:            file properties
      data:           data file properties
        name:         data file name, default 'untitled.json'
      schema:         schema file properties
        name:         schema file name, default 'untitled.json'
      template:       template file properties
        name:         template file name, default 'untitled.html', that names schema file
    label:            descriptive schema label
    include:          flag to include info in data object (not applicable to array element)
    note:             a brief release note for history
    },            
    version:          version definition of schema file
        
    elements:         defines a list of predefined schema pieces that can be used a schema tree
      <element>:  
        container:    defines a container type element  
        element:      defines the element type that matches a corresponding schema-element template
       *name:    automatically added at time of creation, specifies the name or index of the resultant data variable 
       *data:         hidden key, data value for the element instance
        label:        Label (root) displayed UI
        description:        Caption used for schema editor fieldset legend
        data:         default data value
        disabled:     flag indicating whether or not element changes disabled for author mode
        hidden:       flag indicating whether or not element hidden for author mode
        notes:        specifies a text block identifying any author specific instructions for a given instance
        <properties>: other properties specific to data type

*******************************************************************************/


//**************************************************************
// NOTE: DEFAULT cfg variable defined here may be overridden 
// by a custom user defined cfg.js file loaded after this file.
//**************************************************************

var cfg = {
  version: '20190214v1',
  authAs: 'token',            // group authentication credentials "username"
  autoTextFrame: {
    element: 'section',
    src: '/cms/text.html'
  },            
  folders: {                  // content folders relative to document root, uploads allowed
    data: '/data',
    docs: '/docs',
    images: '/images',
    schema: '/schema',
    videos: '/videos'
  },
  locations: {                // request urls, no upload allowed
    cms: '/cms/$',
    restricted: '../../../restricted',  // override with site cfg.json file..., NOT UNDER ROOT!
    live: 'http://localhost',           // override with site cfg.json file...
    preview: 'http://localhost'         // override with site cfg.json file...
  },
  pretty: false,
  series: {
    dformat: 'YYYYMMDD',
    pattern: '$u-p$p4-$d.json'
  },
  session: 86400
};

////////////////////////////////////////////////////////////////////////
// the "schema" variable represents the data for creation of hierarchical schema instances (schema files)
//   "schema instances" define structure for creation of JSON datasets ( data files)
////////////////////////////////////////////////////////////////////////

// testSchema defines the default datas for populating a new schema
var schemaDefinitions = {
  version: cfg.version,
  copyright: '(c)2019 Enchanted Engineering',
  elements: {
    'boolean': {
      data: false,
      description: 'BOOLEAN Element...',
      disabled: false,
      element: 'boolean',
      hidden: false,
      label: 'BOOLEAN',
      name: 'boolean',
      notes: [],
      readonly: false
    },
    'numeric': {
      data: 0,
      description: 'NUMERIC Element...',
      disabled: false,
      element: 'numeric',
      filter: null,
      hidden: false,
      label: 'NUMERIC',
      max: null,
      min: null,
      name: 'numeric',
      notes: [],
      readonly: false

    },
    'text': {
      auto: '',
      block: false,
      data: '',
      description: 'Line of text...',
      disabled: false,
      element: 'text',
      filter: null,
      format: 'text',
      hidden: false,
      label: 'TEXT',
      name: 'text',
      notes: [],
      readonly: false
    },
    'date': {
      data: '',
      description: 'A date entry...',
      disabled: false,
      element: 'date',
      format: 'datetime',
      hidden: false,
      label: 'DATE',
      name: 'date',
      notes: [],
      readonly: false
    },
    'enumerated': {
      choices: [],
      data: [],
      description: 'A list of choices...',
      disabled: false,
      element: 'enumerated',
      filter: null,
      hidden: false,
      label: 'CHOICE',
      name: 'choice',
      notes: [],
      readonly: false
    },
    'link': {
      data: null,
      description: 'A hyperlink element...',
      disabled: false,
      element: 'link',
      hidden: false,
      label: 'LINK',
      link: {action:'href', external:'', format:'anchor', image:'', link:'', text:''},
      name: 'link',
      notes: [],
      readonly: false
    },
    'array': {
      children: [],
      container: 'ordered',
      data: [],
      description: 'An ordered list of elements...',
      disabled: false,
      element: 'container',
      hidden: false,
      label: 'ORDERED CONTAINER',
      name: 'container',
      notes: [],
      readonly: false
    },
    'object': {
      children: [],
      container: 'unordered',
      data: {},
      description: 'An unordered list of elements...',
      disabled: false,
      element: 'container',
      hidden: false,
      label: 'UNORDERED CONTAINER',
      name: 'container',
      notes: [],
      readonly: false
    }
  },
  'newSchema': {
    children: [],
    container: 'unordered',
    description: 'A new empty schema...',
    data: {},
    element: 'schema',
    files: {
      store: '',
      data: 'untitled.json',
      schema: 'untitled.json'
    },
    label: 'UNSAVED',
    history: [],
    notes: [],
    version: cfg.version
  },
  series: {
    active: null,       // index of active post
    data: [],           // placeholder for all posts
    meta: {
      author: '',
      brief: '',
      dtd: '',
      file: '', 
      keywords: '',
      template: 'post', // Vue render component, visible to developer only
      title: ''
    }
  }
};

///console.log(JSON.stringify(cfg,null,2));
///console.log(JSON.stringify(schema,null,2));
