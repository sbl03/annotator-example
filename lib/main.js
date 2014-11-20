// This file is loaded as soon as the add-on is loaded. (When it is installed, enabled, or Firefox starts)

// Represents a button that you see on Firefox's add-on bar.
// Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/widget
// Widget is actually deprecated in Firefox 29+. Use UI instead: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/ui
var widgets = require('sdk/widget');

// Access all the stuff in the /data directory
// Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/self#data
var data = require('sdk/self').data;

// Run scripts in the context of web pages whose URL matches a given pattern.
// Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
var pageMod = require('sdk/page-mod');

var selectors = [];
var annotatorIsOn = false;

// Toggle the annotatorIsOn variable
function toggleActivation() {
  annotatorIsOn = !annotatorIsOn;
  return annotatorIsOn;
}

// Your main function - this gets executed first.
// Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Listening_for_load_and_unload
exports.main = function() {

  // Represents a button that you see on Firefox's add-on bar.
  var widget = widgets.Widget({
    id: 'toggle-switch',
    label: 'Annotator',
    contentURL: data.url('widget/pencil-off.png'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/widget.js')
  });

  // Receive from the content script
  widget.port.on('left-click', function() {
    console.log('activate/deactivate');
    widget.contentURL = toggleActivation() ?
              data.url('widget/pencil-on.png') :
              data.url('widget/pencil-off.png');
  });

  // Receive from the content script
  widget.port.on('right-click', function() {
      console.log('show annotation list');
  });

  // Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Annotator/Creating_annotations#Updating_main.js
  var selector = pageMod.PageMod({
    // Include all pages
    include: ['*'],
    // Default functionality
    contentScriptWhen: 'ready',
    // Attach these scripts to the page
    contentScriptFile: [data.url('jquery-1.11.1.min.js'),
                        data.url('selector.js')],
    // What gets executed after the scripts are attached
    onAttach: function(worker) {
      // Send a message to the content script
      worker.postMessage(annotatorIsOn);
      // Save the current worker to a local array
      selectors.push(worker);
      // Add a listener under the 'show' keyword
      worker.port.on('show', function(data) {
        console.log(data);
      });
      // Add a listener under the 'detach' keyword
      worker.on('detach', function () {
        detachWorker(this, selectors);
      });
    }
  });
}

// Helper method to detach the worker from the local array
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

function activateSelectors() {
  selectors.forEach(
    function (selector) {
      selector.postMessage(annotatorIsOn);
  });
}

function toggleActivation() {
  annotatorIsOn = !annotatorIsOn;
  activateSelectors();
  return annotatorIsOn;
}
