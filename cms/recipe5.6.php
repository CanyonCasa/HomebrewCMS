<?php
// functions to define or request variables with defaults without generating errors...
function setKey($k,$a,$dflt=null) { if (!array_key_exists($k,$a)) $a[$k] = $dflt; return $a[$k]; };
function getKey($k,$a,$dflt=null) { return is_array($a) ? (array_key_exists($k,$a) ? $a[$k]: $dflt) : (is_object($a)&&property_exists($a,$k) ? $a->$k : $dflt ); };

// recover JSON body data...
function getBody() {
  try {
    $body = @json_decode(file_get_contents('php://input'));
  } catch(Exception $e) { echo_error(400,['x'=>$e,'body'=>$body]); };
  if ($body === null) $body = [];
  return $body;
};

// recursively scan a directory and list files and folders matching optional filter
function listFolder($folder,$filter='*.*') {
  $list = [];
  $tmp = array_slice(scandir($folder),2);
  foreach($tmp as $f) {
    $ff = $folder.'/'.$f;
    if (is_dir($ff)) {
      array_push($list,['name'=>$f, 'listing'=>listFolder($ff,$filter)]);
    } elseif (fnmatch($filter,$f)) {
      $stats = stat($ff);
      array_push($list,['name'=>$f, 'size'=>$stats['size'], 'date'=>$stats['mtime']]);
    };  
  };
  return $list;
};

// script always returns json!
//  function echo_json($data,$flags=JSON_FORCE_OBJECT) {
function echo_json($data,$flags=JSON_UNESCAPED_SLASHES) {
  header('Content-type: application/json');
  echo json_encode($data, $flags);
  exit();
};

// wrapper for error messages...
$status_text = ['200'=>'OK','400'=>'Bad Request','401'=>'Unauthorized','403'=>'Forbidden','404'=>'Not Found','500'=>'Internal Server Error'];
function echo_error($code,$detail=null) {
  $msg = ['error'=>['code'=>(int)$code,'msg'=>$GLOBALS['status_text'][(string)$code]]];
  if ($detail!==null) { $msg += is_array($detail) ? $detail : ['detail'=>$detail]; };
  echo_json($msg);
};

// define default server specific paths/files...
$base = rtrim($_SERVER['DOCUMENT_ROOT'],'\\/');
$server = $_SERVER['REQUEST_SCHEME'].'//'.$_SERVER['SERVER_NAME'].(($_SERVER['SERVER_PORT']!="80")?':'.$_SERVER['SERVER_PORT']:'');
$cfg = [
  'version' => '20190129v1',
  'authAs' => 'token',
  'folders' => [
    'data' => '/data',
    'docs' => '/docs',
    'images' => '/images',
    'schema' => '/schema',
    'videos' => '/videos'
  ],
  'locations' => [
    'cms' => '/cms/cms.php',
    'restricted' => '../restricted',
    'live' => $server,
    'preview' => $server
  ],
  'pretty' => false,
  'session' => 86400,
  'autoTextFrame' => [
    'element' => 'section',
    'src' => '/cms/text.html'
  ]
]; 
// override with site_cfg -- note: loaded server-side to prevent client-side tampering...
try {
  $site_cfg = @file_get_contents(getcwd().'/cfg.json');
  $site_cfg = ($site_cfg===false) ? null : @json_decode($site_cfg,true);  // will return null if not found or if decode fails
} catch(Exception $e) {};
$cfg = array_replace_recursive($cfg,($site_cfg ? $site_cfg : []));
$restricted = realpath($cfg['locations']['restricted']);  // resolve relative path and verify its valid by checking for credentials file. 
if (!file_exists($restricted.'/credentials.json')) echo_error(500,['configuration'=>"'credentials' file not found in locations.restricted"]);

/*  // form submissions exempt from authentication and never cross origin!
if ($_SERVER['REQUEST_METHOD']=='POST' && getKey('submit',$_REQUEST,'')) {
  echo_json(['note'=>'not yet implemented','submit'=>$_REQUEST['submit']]);
};
*/

// CORS support...
$xorigin = getKey('HTTP_ORIGIN',$_SERVER,'');
if($xorigin && in_array($xorigin,[$cfg['locations']['live'],$cfg['locations']['preview']])) {
  header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
  header('Access-Control-Expose-Headers: *');  // needed for passing any CORS restricted headers
};
if ($_SERVER['REQUEST_METHOD']=='OPTIONS') {
  if($xorigin) {
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-type');
  } else {
    header("HTTP/1.1 403 Access Forbidden");
    header("Content-Type: text/plain");
    echo_json(['error'=>"Unauthorized cross-site request"]);
  }
  exit(0);
};

// authenticate all requests using Authorization header (but recipe authorization may not require it...
$authenticated = false; $user =[];
try {
  $credentials = @file_get_contents($restricted.'/credentials.json');  // load credentials
  $credentials = ($credentials===false) ? null : @json_decode($credentials,true);
} catch(Exception $e) {};
if (!$credentials) echo_error(500,['detail'=>'Credentials file syntax error!']);

if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) { // basic auth header values?
  // try basic authentication... as user and/or 'authAs' group token authentication...
  $username = strtolower($_SERVER['PHP_AUTH_USER']);
  $user = getKey($username,$credentials['users'],[]);
  if ($user['status']=='ACTIVE') {
    if ($cfg['session']&&$user['session']) { // password may be prior session id
      $authenticated = $user['session']['id']==$_SERVER['PHP_AUTH_PW'];
      if ($authenticated&&(strtotime($user['session']['expires'])<strtotime('now'))) echo_error(401,'Session expired!');
    };
    if (!$authenticated) $authenticated = password_verify($_SERVER['PHP_AUTH_PW'],getKey('hash',$user,''));
    if (!$authenticated&&$cfg['authAs']) {
      $authAs = getKey($cfg['authAs'],$credentials['users'],[]);
      $authenticated = password_verify($_SERVER['PHP_AUTH_PW'],getKey('hash',$authAs));
      if ($authenticated) $user['member'] = $authAs['member'];  // assign "group" permissions for validated "authAs" user
    };
  };
};
if (!$authenticated) echo_error(401,'Authentication failed!');


$prefix = getKey('prefix',$_REQUEST,'');  // prefix (char) defines request mode => $:data access , @:action, or !:info
$recipe = getKey('recipe',$_REQUEST,'');  // recipe defines request model name
$opt1 = getKey('opt1',$_REQUEST,'');      // force optional parameters existance to avoid errors
$opt2 = getKey('opt2',$_REQUEST,'');
$opt3 = getKey('opt3',$_REQUEST,'');
if (!$recipe) echo_error(400,['request'=>$_REQUEST]);

// GET requests...
if ($_SERVER['REQUEST_METHOD']=='GET') {
  
  // permissions ($user['member']) exist for validated login only, provided for client informational use...
  if ($prefix.$recipe=='@login') {
    $user['session'] = ['id'=>uniqid(),'expires'=>date("Y-m-d\TH:i:sO",time()+$cfg['session'])];
    $credentials['users'][$username] = $user;
    file_put_contents($restricted.'/credentials.json',json_encode($credentials,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    unset($user['hash']);
    echo_json(['user'=>$user]);
  };
  
  // list schema and data files...
  if ($prefix.$recipe=='@list') {
    $folders = $opt1 ? explode(',',$opt1) : array_keys($cfg['folders']);
    $filter = $opt2 ? $opt2 : '*.*';
    $list = [];
    foreach ($folders as $folder) {
      if (array_key_exists($folder,$cfg['folders'])) {  // must be one of defined folders
        if (file_exists($base.$cfg['folders'][$folder])) {
          array_push($list,['name'=>$folder, 'listing'=> listFolder($base.$cfg['folders'][$folder],$filter)]);
        } else {
          array_push($list,['name'=>$folder, 'error'=>'NOT FOUND/CONFIGURED']);
        };
      } else {
        array_push($list,['name'=>$folder, 'error'=>'NOT AUTHORIZED']);
      };
    };
    echo_json($list,0);
  };
};
  
// POST schema and data json files, docs, or images...
if ($_SERVER['REQUEST_METHOD']=='POST') {
  $body = getBody();  // recover JSON body data...
  // download to support cross-origin requests
  if ($prefix.$recipe=='@download') {
    // assume $file structure includes folder, name, etc, but trap potential errors
    $file = getKey('file',$body,[]);
    $folder = getKey('folder',$file,'!');
    try {
      if (!getKey($folder,$cfg['folders'])) echo_error(403,['file'=>$file]); // error if not in list of configured folders
      $name = getKey('name',$file,'');
      if (!$name) echo_error(400,['file'=>$file]); // error if no file name
      $filespec = $base.$cfg['folders'][$folder].'/'.$name;
      if (!file_exists($filespec)) echo_error(404,['file'=>$file,'spec'=>$filespec]);  // file not found
      $raw = file_get_contents($filespec);
      $format = getKey('format',$file,'json');
      $contents = ($format==='json') ? json_decode($raw,false) : (($format==='base64') ? base64_encode($raw) : $raw); // handle json or base64 encoding first
      } catch (Exception $x) { echo_error(500,['x'=>$x]); };
    echo_json(['contents'=>$contents],false);
  };
  
  if ($prefix.$recipe=='@upload') {
    // always process as a list of files
    // assume $file[n] structure includes folder, name, format, contents, etc, but trap potential errors
    $files = getKey('files',$body,[getKey('file',$body,[])]);
    $status = [];
    foreach ($files as $file) {
      $folder = getKey('folder',$file,'?');
      setKey($folder,$status,[]);
      try {
        if (!getKey($folder,$cfg['folders'])) { // error if not in list of configured folders
          $status[$folder] = [403];
        } else {
          $filespec = $base.$cfg['folders'][$folder].'/'.getKey('name',$file,'!');
          if (getKey('backup',$file)&&file_exists($filespec)) {
            $fileBAK = $base.$cfg['folders'][$folder].'/'.getKey('backup',$file);
            copy($filespec,$fileBAK);
          };
          $name = getKey('name',$file,'untitled.json');
          $format = getKey('format',$file,'json');
          $contents = getKey('contents',$file,'');
          if ($format=='base64') {  // $contents holds base64 encoded binary data
            $altered = base64_decode(explode(";base64,",$contents)[1]);
          } elseif ($format=='text') {  // $contents is just text
            $altered = $contents;
          } else {  // assume $contents holds array variable ready to encode as JSON and save
            $altered = json_encode($contents,0+($cfg['pretty']?JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES:0));
          };
          // save the file
          $flag = getKey('append',$file) ? FILE_APPEND : 0;
          file_put_contents($filespec,$altered,$flag);
          $status[$folder][$name] = [200];
        };
      } catch (Exception $x) { echo_error(500,['x'=>$x,'file'=>$file]); };
      // expand status messages...
    };
    foreach($status as $fldr=>$value) {
      foreach($status[$fldr] as $f=>$v) {
        if (is_numeric($v)) {
          $status[$fldr] = [(int)$v,$status_text[(string)$v]];
        } else {
          $code = $status[$fldr][$f][0];
          $status[$fldr][$f] = [(int)$code,$status_text[(string)$code]];
        };
      };
    };
    echo_json($status,0);
  };
};

echo_error(400,'Method '.$_SERVER['REQUEST_METHOD'].' not supported');
