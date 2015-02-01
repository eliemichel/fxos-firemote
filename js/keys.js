function showKeys() {
  document.getElementById("drawerheader").innerHTML = "Key";
  if (privatekey) {
    document.getElementById("sidedrawer").innerHTML = "<a href='mailto:?body=" + publickey + "' id='exportkey' class='button recommend' style='margin-top: 1em; width: 90%;'>Export Key</a>";
  }
  else {
    document.getElementById("sidedrawer").innerHTML = "<button id='addkey' class='recommend' style='margin-top: 1em; width: 90%;'>Create Key</button>";
    document.getElementById("addkey").addEventListener("click", function () { addKey(); });
  }
}

function addKey() {
  document.getElementById("sidedrawer").innerHTML = "<h2>Generating Key Pair...</h2>";
  var crypt = new JSEncrypt({default_key_size: 2048});
  crypt.getKey(function() {
    privatekey = crypt.getPrivateKey();
    publickey = crypt.getPublicKey();
    var keypair = { private : privatekey, public : publickey };
    var store = db.transaction('keypair', 'readwrite').objectStore('keypair');
    var request = store.add(keypair);
    request.onsuccess = function () { };
    request.onerror = function () {
      console.log("Saving keypair failed.");
    };
    showKeys();
  });
}

function loadKey() {
  var store = db.transaction('keypair').objectStore('keypair');
  var request = store.openCursor();
  request.onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      var request = store.get(cursor.key);
      request.onsuccess = function (event) {
        privatekey = event.target.result.private;
        publickey = event.target.result.public;
        cursor.continue();
      };
    }
  };
}