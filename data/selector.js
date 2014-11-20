var matchedElement = null;
var originalBgColor = null;
var active = false;

// Reset the element's background color
function resetMatchedElement() {
  if (matchedElement) {
    (matchedElement).css('background-color', originalBgColor);
    (matchedElement).unbind('click.annotator');
  }
}

// I believe this is a listener to the 'worker.postMessage(annotatorIsOn);' in main.js
self.on('message', function onMessage(activation) {
  active = activation;
  if (!active) {
    resetMatchedElement();
  }
});

// Everytime you mouseover any element (*) in the DOM, this happens
$('*').mouseenter(function() {
  if (!active || $(this).hasClass('annotated')) {
    return;
  }
  resetMatchedElement();

  // Get the closest ancestor with an 'id' attribute
  ancestor = $(this).closest("[id]");
  matchedElement = $(this).first();

  // Store the original background color
  originalBgColor = $(matchedElement).css('background-color');

  // Change the background color of the element to yellow
  $(matchedElement).css('background-color', 'yellow');

  // I think 'click.annotator' is a custom named event type
  $(matchedElement).bind('click.annotator', function(event) {
    // Prevent parent elements from executing this same function
    event.stopPropagation();

    // Prevent the defult behavior of this event's click event
    event.preventDefault();

    // Send some data to the main add-on code
    // Additional reading: https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts#Communicating_with_the_add-on
    self.port.emit('show',
      [
        document.location.toString(),
        $(ancestor).attr("id"),
        $(matchedElement).text()
      ]
   );
  });
});

// After mousing out of any element in the DOM, this happens
$('*').mouseout(function() {
  resetMatchedElement();
});
