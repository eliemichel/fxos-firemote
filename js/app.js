var gDebugMode = true, 
    gCli,
    gConnection,
    height = 24,
    width = 80,
    widthOption,
    serverObjects = [],
    edit = false,
    firemoteDB = indexedDB.open('firemote-data', '1'),
    db,
    privatekey,
    publickey;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function connectToServer(host, port, type, username, password) {
  if (host && port) {
    setProtocol(type);
    gConnection.host = host;
    gConnection.port = parseInt(port);
    if (privatekey) {
      gConnection.privatekey = new paramikojs.RSAKey(new paramikojs.Message('ssh-rsa'), paramikojs.PKey.prototype._read_private_key('RSA', privatekey, ''), null, '');
    }
    if (username && password) {
      gConnection.login = username;
      gConnection.password = password;
    }
    gConnection.width = gCli.cols;
    gConnection.height = gCli.rows;
    gConnection.connect(false);         
  }
}

firemoteDB.onsuccess = function (){
  db = this.result;
};
firemoteDB.onerror = function () {
  gConnection.observer.onError("DB Root Error");
};
firemoteDB.onupgradeneeded = function (event) {
  var store = event.currentTarget.result.createObjectStore('servers', { autoIncrement : true, keyPath : 'ruid' });
  store.createIndex('ruid', 'ruid', { unique: true });
  store.createIndex('host', 'host', { unique: false });
  store.createIndex('port', 'port', { unique: false });
  store.createIndex('type', 'type', { unique: false });
  store.createIndex('username', 'username', { unique: false });
  store.createIndex('password', 'password', { unique: false });
  var settings = event.currentTarget.result.createObjectStore('settings', { autoIncrement : true, keyPath : 'width' });
  settings.createIndex('widthoption', 'widthoption', {unique : true});
  settings.createIndex('width', 'width', {unique : true});
  var keypair = event.currentTarget.result.createObjectStore('keypair', { autoIncrement : true, keyPath : 'private' });
  keypair.createIndex('private', 'private', { unique: true });
  keypair.createIndex('public', 'public', { unique: true });
};

window.addEventListener("load", function() {
  gCli = new cli(document.getElementById("cmdlog").contentWindow);
  height = Math.floor((document.getElementById("cmdlog").scrollHeight - 60) / 12);
  if (db) {
    listItems();
    loadWidth();
    loadKey();
  }
  gCli.Resize(height, width);
  gCli.update("Touch + to begin.");
  document.getElementById("edit").addEventListener("click", function () {
    if (!edit) {
      edit = true;
    }
    else {
      edit = false;
    }
    listItems();
  });
  document.getElementById("keys").addEventListener("click", function () { showKeys(); });
  document.getElementById("settings").addEventListener("click", function () { showSettings(); });
  document.getElementById("add").addEventListener("click", function () { addItem(); });
  document.getElementById("close").addEventListener("click", function () { gConnection.disconnect(); });
});