function addItem() {
  ruid = UUID.generate();
  putItem('host', 'port', 'ssh2', 'username', 'password', ruid);
  editItem('host', 'port', 'ssh2', 'username', 'password', ruid);
}

function saveItem(ruid) {
  deleteItem(ruid);
  putItem(document.getElementById('host').value,
          document.getElementById('port').value,
          document.getElementById('type').value,
          document.getElementById('username').value,
          document.getElementById('password').value);
  listItems();
  edit = false;
}

function editItem(host, port, type, username, password, ruid) {
  username = username || "username";
  password = password || "password";
  document.getElementById('sidedrawer').innerHTML = "<input type='text' id='host' style='width: 90%;' value='" + host + "'></input>";
  document.getElementById('sidedrawer').innerHTML += "<input type='text' id='port' style='width: 90%;' value='" + port + "'></input>";
  if (type === "telnet") {
    document.getElementById('sidedrawer').innerHTML += "<select id='type' class='draweritem'><option selected='selected'>telnet</option><option>ssh2</option></select>";
    document.getElementById('sidedrawer').innerHTML += "<input type='text' id='username' style='width: 90%; display: none;' value='" + username + "'></input>";
    document.getElementById('sidedrawer').innerHTML += "<input type='password' id='password' style='width: 90%; display: none;' value='" + password + "'></input>";
  }
  else {
    document.getElementById('sidedrawer').innerHTML += "<select id='type' class='draweritem'><option>telnet</option><option selected='selected'>ssh2</option></select>";
    document.getElementById('sidedrawer').innerHTML += "<input type='text' id='username' style='width: 90%;' value='" + username + "'></input>";
    document.getElementById('sidedrawer').innerHTML += "<input type='password' id='password' style='width: 90%;' value='" + password + "'></input>";
  }
  document.getElementById('sidedrawer').innerHTML += "<button id='save' class='bb-button recommend draweritem'>Save</button>";
  document.getElementById('sidedrawer').innerHTML += "<button id='delete' class='bb-button danger draweritem'>Delete</button>";
  document.getElementById('delete').addEventListener('click', function() {
    deleteItem(ruid);
    listItems();
    edit = false;
  });
  document.getElementById('save').addEventListener('click', function() { saveItem(ruid); });
  document.getElementById('type').onchange = function () {
    if (document.getElementById('type').value === "ssh2") {
      document.getElementById('username').style.display = "block";
      document.getElementById('password').style.display = "block";
    }
    else {
      document.getElementById('username').style.display = "none";
      document.getElementById('password').style.display = "none";
    }
  };
}

function createServerItemFunction(ruid, host, port, type, username, password) {
  return function () {
    if (edit === true) {
      editItem(host, port, type, username, password, ruid);
    }
    else {
      connectToServer(host, port, type, username, password);
      window.location = "#content";
    }
  };
}

function buildServerList() {
  serverObjects = serverObjects.sort(function(a, b){
    var hostA=a.host.toLowerCase(), hostB=b.host.toLowerCase();
    if (hostA < hostB) {
      return -1;
    }
    if (hostA > hostB) {
      return 1;
    }
    return 0;
  });
  document.getElementById('sidedrawer').innerHTML = "";
  document.getElementById("drawerheader").innerHTML = "Servers";
  for (var i = 0; i < serverObjects.length; i += 1) {
    var newItem = document.createElement('li');
    if (edit === true) {
      newItem.innerHTML = "<a style='color: #008aaa;' id='" + serverObjects[i].ruid + "'>" + serverObjects[i].host + "</a>";
    }
    else {
      newItem.innerHTML = "<a id='" + serverObjects[i].ruid + "'>" + serverObjects[i].host + "</a>";
    }
    document.getElementById("sidedrawer").appendChild(newItem);
    document.getElementById(serverObjects[i].ruid).addEventListener("click", createServerItemFunction(serverObjects[i].ruid,
                                                                                                      serverObjects[i].host,
                                                                                                      serverObjects[i].port,
                                                                                                      serverObjects[i].type,
                                                                                                      serverObjects[i].username,
                                                                                                      serverObjects[i].password));
  }
}


function putItem(host, port, type, username, password, ruid) {
  ruid = ruid || UUID.generate();
  var object = { ruid : ruid, host : host, port : port, type : type, username : username, password : password };
  var store = db.transaction('servers', 'readwrite').objectStore('servers');
  var request = store.add(object);
  request.onsuccess = function () { };
  request.onerror = function () {
    gConnection.observer.onError("DB Object Creation Error");
  };
}

function deleteItem(ruid) {
  var store = db.transaction('servers', 'readwrite').objectStore('servers');
  var request = store.delete(ruid);
  request.onsuccess = function () { };
}

function listItems() {
  serverObjects = [];
  var store = db.transaction('servers').objectStore('servers');
  var request = store.openCursor();
  request.onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      var request = store.get(cursor.key);
      request.onsuccess = function (event) {
        serverObjects.push(event.target.result);
        cursor.continue();
      };
    }
    else {
      buildServerList();
    }
  };
  request.onerror = function () {
    gConnection.observer.onError("DB Open Cursor Error");
  };
}