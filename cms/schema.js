/*******************************************************************************
This file defines the default configuration dflts and root schema used to 
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
        dflt:         default data value
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
  version: '20181125v1',
  authAs: 'token',            // group authentication credentials "username"
  folders: {                  // content folders relative to document root, uploads allowed
    data: '/data',
    docs: '/docs',
    images: '/images',
    schema: '/schema',
    styles: '/styles'
  },
  locations: {                // request urls, no upload allowed
    credentials: 'c:/xampp/.htpasswds/credentials.json',  // absolute since not under root!
    cms: '/cms/$',
  }
}


////////////////////////////////////////////////////////////////////////
// the "schema" variable represents the data for creation of hierarchical schema instances (schema files)
//   "schema instances" define structure for creation of JSON datasets ( data files)
////////////////////////////////////////////////////////////////////////

// testSchema defines the default dflts for populating a new schema
var schemaDefinitions = {
  version: cfg.version,
  copyright: '(c)2018 Enchanted Engineering',
  elements: {
    'boolean': {
      description: 'BOOLEAN Element...',
      dflt: false,
      disabled: false,
      element: 'boolean',
      hidden: false,
      id: '',
      label: 'BOOLEAN',
      name: 'boolean',
      notes: [],
      pid: '',
      readonly: false
    },
    'numeric': {
      description: 'NUMERIC Element...',
      dflt: 0,
      disabled: false,
      element: 'numeric',
      filter: null,
      hidden: false,
      id: '',
      label: 'NUMERIC',
      max: null,
      min: null,
      name: 'numeric',
      notes: [],
      pid: '',
      readonly: false

    },
    'text': {
      auto: '',
      block: false,
      description: 'Line of text...',
      dflt: '',
      disabled: false,
      element: 'text',
      filter: null,
      format: 'text',
      hidden: false,
      id: '',
      label: 'TEXT',
      name: 'text',
      notes: [],
      pid: '',
      readonly: false,
      src: ''
    },
    'date': {
      description: 'A date entry...',
      dflt: '',
      disabled: false,
      element: 'date',
      format: 'datetime',
      hidden: false,
      id: '',
      label: 'DATE',
      name: 'date',
      notes: [],
      pid: '',
      readonly: false
    },
    'enumerated': {
      choices: [],
      description: 'A list of choices...',
      dflt: [],
      disabled: false,
      element: 'enumerated',
      filter: null,
      hidden: false,
      id: '',
      label: 'CHOICE',
      name: 'choice',
      notes: [],
      pid: '',
      readonly: false
    },
    'array': {
      children: [],
      container: true,
      description: 'An ordered list of elements...',
      dflt: [],
      disabled: false,
      element: 'container',
      hidden: false,
      id: '',
      label: 'CONTAINER',
      name: 'container',
      notes: [],
      pid: '',
      readonly: false
    },
    'object': {
      children: [],
      container: true,
      description: 'An unordered list of elements...',
      dflt: {},
      disabled: false,
      element: 'container',
      hidden: false,
      id: '',
      label: 'CONTAINER',
      name: 'container',
      notes: [],
      pid: '',
      readonly: false
    }
  },
  'newSchema': {
    children: [],
    container: true,
    description: 'A new empty schema...',
    dflt: {},
    element: 'schema',
    files: {
      store: '',
      data: 'untitled.json',
      schema: 'untitled.json',
      template: 'untitled.html'
    },
    label: 'UNSAVED',
    history: [],  // schema history
    $history: [], // data history
    id: uniqueID(),
    notes: [],
    series: {
      enabled: false,
      file: '',
      index: null,
      meta: {
        author: '',
        brief: '',
        dtd: '',
        keywords: '',
        title: ''
      },
      pattern: '$u-$d-v1'
    },
    version: cfg.version
  }
};

///console.log(JSON.stringify(cfg,null,2));
///console.log(JSON.stringify(schema,null,2));
