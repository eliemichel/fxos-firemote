function showSettings() {
  document.getElementById("drawerheader").innerHTML = "Width";
  if (widthOption === "Screen Width") {
    document.getElementById("sidedrawer").innerHTML = "<select id='widthoption' class='draweritem'><option selected='selected'>Screen Width</option><option>Custom</option></select>";
    document.getElementById("sidedrawer").innerHTML += "<input type='number' id='width' style='display: none; width: 90%;'></input>";
  }
  else {
    document.getElementById("sidedrawer").innerHTML = "<select id='widthoption' class='draweritem'><option>Screen Width</option><option selected='selected'>Custom</option></select>";
    document.getElementById("sidedrawer").innerHTML += "<input type='number' id='width' style='width: 90%;'></input>";
  }
  document.getElementById("sidedrawer").innerHTML += "<button id='save' class='bb-button recommend draweritem'>Save</button>";
  document.getElementById("width").value = width;
  document.getElementById("save").addEventListener("click", function () { saveSettings(); });
  document.getElementById("widthoption").onchange = function() {
    if (document.getElementById("widthoption").value === "Screen Width") {
      document.getElementById("width").style.display = "none";
    }
    else {
      document.getElementById("width").style.display = "block";
    }
  };
}

function saveSettings() {
  widthOption = document.getElementById("widthoption").value;
  var store = db.transaction('settings', 'readwrite').objectStore('settings');
  var request = store.clear();
  request.onsuccess = function () {
    if (widthOption === "Screen Width") {
      width = Math.floor(document.getElementById("cmdlog").scrollWidth / 7) - 6;
      gCli.Resize(height, width);
    }
    else {
      width = document.getElementById("width").value;
    }
    var store = db.transaction('settings', 'readwrite').objectStore('settings');
    var request = store.put({ widthoption : widthOption, width : width });
    request.onsuccess = function() { };
    listItems();
  };
}

function loadWidth() {
  var store = db.transaction('settings').objectStore('settings');
  var request = store.openCursor();
  request.onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      var request = store.get(cursor.key);
      request.onsuccess = function (event) {
        width = event.target.result.width;
        widthOption = event.target.result.widthoption;
        cursor.continue();
      };
    }
  };
}