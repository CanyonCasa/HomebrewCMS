////////////////////////////////////////////////////////////////
// Extensions to Client Side JavaScript ES5 compatible...
////////////////////////////////////////////////////////////////

///*************************************************************
/// Array Object Extensions...
///*************************************************************
// function to generate page base path add-on to location variable...
if (!(Array.includes||Array.prototype.includes)) Array.prototype.includes =  function(element) { return (this.indexOf(element)!==-1); };


///*************************************************************
/// Date Extensions...
///*************************************************************
// append a zone abbreviation string to Date objects...
var zone = new Date().toString().split('(')[1].replace(/[a-z) ]/g,'');
if (!Date.prototype.zone) Date.prototype.zone = zone.toString();
delete zone;

// declare strings for days of the week and months of the year...
if (!Date.prototype.days) Date.prototype.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
if (!Date.prototype.months) Date.prototype.months = 
  ["January","February","March","April","May","June","July","August","September","October","November","December"];

// define a function for creating formated date strings
// Date.prototype.style(<format_string>|'iso'|'form'[,'local'|'utc'])
// formats a date according to specified string defined by ...
//    'text':   quoted text preserved, as well as non-meta characters such as spaces
//    Y:        4 digit year, i.e. 2016
//    M:        month, i.e. 2
//    D:        day of month, i.e. 4
//    N:        day of the week, i.e. 0-6
//    SM:       long month name string, i.e. February
//    SD:       long day name string, i.e. Sunday
//    h:        hour of the day, 12 hour format, unpadded, i.e. 9
//    hh:       hour of the day, 24 hour format, padded, i.e. 09
//    m:        minutes part hour, i.e. 7
//    s:        seconds past minute, i.e. 5
//    x:        milliseconds, i.e. 234
//    a:        short meridiem flag, i.e. A or P
//    z:        short time zone, i.e. MST
//    e:        Unix epoch, seconds past midnight Jan 1, 1970
//    LY:       leap year flag, true/false (not usable in format)
//    dst:      Daylight Savings Time flag, true/false (not usable in format)
//    ofs:      Local time offset (not usable in format)
//    default - returns an object representing fields noted above
//  defined format keywords ...
//    form:               ["YYYY-MM-DD","hh:mm:ss"], needed by form inputs for date and time (always local)
//    iso:                "YYYY-MM-DD'T'hh:mm:ssZ", JavaScript standard
//  notes:
//    1. Add a leading 0 or duplicate field character to pad result as 2 character field [MDNhms], i.e. 0M or MM
//    2. Use Y or YYYY for 4 year or YY for 2 year
//    3. Second parameter (boolean) used to specify local vs UTC time (undefined).
//  examples...
//    d = new Date();      // 2016-12-07T21:22:11.262Z
//    d.style();           // { Y: 2016, M: 12, D: 7, h: 21, m: 22, s: 11, x: 262, SM: 'December', SD: 'Wednesday', a: 'PM', e: 1481145731.262, z: 'MST', N: 3, LY: true, dst: false }
//    d.style().e;         // 1481145731.262
//    d.style("MM/DD/YY"); // '12/07/16'
// local flag signifies a conversion from UTC to local OR local to UTC; 
//  'local':    treats input as UTC time and adjusts to local time before styling (default)
//  'utc':      treats input as local time and adjusts to UTC before styling
if (!Date.prototype.style)
  Date.prototype.style = function(frmt,local) {
    var sign = String(local).toLowerCase()=='utc' ? -1 : 1;
    var dx = (local||frmt=='form') ? new Date(this-sign*this.getTimezoneOffset()*60*1000) : this;
    base = dx.toISOString();
    switch (frmt||'') {
      case 'form': return base.split(/[TZ\.]/i).slice(0,2); break;  // values for form inputs, always local
      case 'iso': return (local && sign==1) ? base.replace(/z/i,dx.zone) : base; break; // ISO Zulu time or localtime
      case '':  // object of date field values
        var [Y,M,D,h,m,s,ms] = base.split(/[\-:\.TZ]/);
        return {Y:+Y,M:+M,D:+D,h:+h,m:+m,s:+s,x:+ms,z:dx.zone,
          SM: this.months[M-1], SD: dx.days[dx.getDay()],a:h<12 ?"AM":"PM",
          e:this.valueOf()*0.001,z:dx.zone,N:dx.getDay(),LY: Y%4==0&&(Y%100==Y%400),
          dst: !!(new Date(1970,1,1).getTimezoneOffset()-dx.getTimezoneOffset()),
          ofs: -dx.getTimezoneOffset()}; break;
      default:
        var flags = dx.style(); flags['YYYY'] = flags.Y; flags['hh'] = ('0'+flags['h']).substr(0,2); if (flags['h']>12) flags['h'] %= 12;
        var token = /Y(?:YYY|Y)?|S[MD]|0?([MDNhms])\1?|[aexz]|"[^"]*"|'[^']*'/g;
        var pad = function(s) { return ('0'+s).slice(-2) };
        return (frmt).replace(token, function($0) { return $0 in flags ? flags[$0] : ($0.slice(1) in flags ? pad(flags[$0.slice(1)]) : $0.slice(1,$0.length-1)); });
    };
  };


///*************************************************************
/// Object Extensions...
///*************************************************************
// following done as non-enumerable definitions to not break "for in" loops
// make object keys iterable to work in for-of-loops like arrays
Object.prototype[Symbol.iterator] = function () {
  var keys = Object.keys(this); var index = 0; 
  return { next: function() { return index<keys.length ? {value: keys[index++], done: false} : {done: true}; } }
};

// test to differentiate objects and arrays
if (!Object.isObj) Object.defineProperty(Object,'isObj', {
  value: function(obj,excludeNull) { return (excludeNull && (obj===null)) ? false : ((typeof obj==='object') && !(obj instanceof Array)); },
  enumerable: false
});

// recursively merge keys of an ojbect into an existing objects with merged object having precedence
if (!Object.mergekeys) Object.defineProperty(Object.prototype,'mergekeys', {
  value: 
    function(merged) {
      merged = merged || {};
      for (var key in merged) { 
        if (Object.isObj(merged[key],true) && Object.isObj(this[key],true)) {
          this[key].mergekeys(merged[key]); // both objects so recursively merge keys
        }
        else {
          this[key] = merged[key];  // just replace with or insert mergedkeys
        };
      };
      return this; 
    },
  enumerable: false
});

// recursively serialize simple object into string of max length...
if (!Object.asString) Object.defineProperty(Object.prototype,'asString', {
  value: 
    function(max) {
      var str = this instanceof Array ? '[ ' : '{ ';
      var qs = function(s) { return "'" + s.replace(/'/g,"\\'") + "'"; };
      var qk = function(k) { return k.includes(' ') ? "'" + k + "'" : k };
      var is = function(v,t) {return typeof v==t; };
      var asStr = function(v) { return v===null||v===undefined||is(v,'number')||is(v,'boolean') ? String(v) : (is(v,'object') ? v.asString() : (is(v,'string') ? qs(v) : '?')); };
      for (var key in this) str += (this instanceof Array ? '' : qk(key) + ': ') + asStr(this[key]) + ', ';
      str = (str.endsWith(', ') ? str.slice(0,-2)+' ' : str) + (this instanceof Array ? ']' : '}');
      return max ? str.slice(0,max-3)+'...' : str;
    },
  enumerable: false
});

// adds a hidden key with optional value to specific object...
// hidden key is addressable as a regular key, but does not enumerate, including in JSON output
if (!Object.addHiddenKey) Object.defineProperty(Object.prototype,'addHiddenKey',{
  value:
    function(key,value) {
      Object.defineProperty(this,key,{enumerable:false,writable:true});
      if (value!==undefined) this[key] = value;
      return this;
    },
  enumerable: false
});

// dereference a simple object or array - i.e. return a copy-by-value
// does not copy hidden keys; in contrast obj.valueOf() maintains reference to original object
if (!Object.copyByValue) Object.defineProperty(Object.prototype,'copyByValue', {
  value: function() { return JSON.parse(JSON.stringify(this))},
  enumerable: false
});


///*************************************************************
/// General Extensions...
///*************************************************************
// function to generate page base path add-on to location variable...
if ((typeof location!=='undefined')&&!location.base) 
  location.base = location.origin + location.pathname.replace('/'+location.pathname.split('/').pop(),'');

// function to create and populate an array of given size and values, note value can even be a function
if (!makeArrayOf) function makeArrayOf(size,value) { return Array.apply(null, Array(size)).map(function(v,i,a){ return (typeof value=='function') ? value(v,i,a) : value }); };

// function to correctly join an array of path parts, excluding "empty, null, or undefined parts", into a valid path...
if (!makePath) function makePath() { return Array.from(arguments).filter(e=>e).join('/').replace(/\/{2,}/g,'/').replace(/:\//,'://'); };

// formats JSON as HTML for pretty printing in color... 
//   requires css class definitions for colors: .json (wrap everything), .json-key, .json-value, .json-string, .json-boolean
// original code source: Dem Pilafian
//   fixed problems: spaces in keys, empty objects, changed quoted strings styling, added boolean styling
//   https://blog.centerkey.com/2013/05/javascript-colorized-pretty-print-json.html
if (!JSON.prettyHTML) Object.defineProperty(JSON,'prettyHTML',{
  value: function(obj,spaces) {
    spaces = spaces || 1;
    var pattern = /^( *)("[$\w ]+":)? ?("[^"]*"|[\w.+-]*)?([,[{}\]]+)?$/mg;
    function replacer(match, indent, key, val, term) {
      var tag = function(style,content,quote) { 
        quote = quote || '';
        return quote+"<span class='json-"+style+"'>"+content+'</span>'+quote; 
      };
      var line = indent || '';  // build the line piecewise from wrapped fields
      line += (key) ? tag('key',key.replace(/[":]/g, '')) + ': ' : '';
      line += (val) ? (val.startsWith('"') ? tag('string',val.replace(/"/g, ''),'"') : ((val=='false'||val=='true') ? tag('boolean',val) : tag('value',val))) : '';
      return line + (term || '');
    };
    return JSON.stringify(obj, null, spaces)
      .replace(/\\"/g, '&quot;')                    // escaped quotes inside JSON string values
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')  // html tag escapes, current browsers seem ok with quotes and ampersands
      .replace(pattern, replacer);                  // parse and wrap fields with tags
  },
  enumerate: false
});

// generates an 8 character unique ID ...
if (!uniqueID) var uniqueID = function() {return Math.random().toString(36).substr(2,8); };

// bounds a value between min and max or returns dflt or 0...
if (!bound) var bound = function(min,val,max,dflt) {
  val = Number(isNaN(val) ? (isNaN(dflt) ? 0 : dflt ) : val);
  if (min!==null&&!isNaN(min)) val = (val<min) ? Number(min) : val;
  if (max!==null&&!isNaN(max)) val = (val>max) ? Number(max) : val;
  return val;
};
