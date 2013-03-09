/**
 * Module shows / hides a layer (particularly useful for dropdowns). Similar to frontier ddPopover Control.
 */

/**
 * Requirements: 
 * - trigger click opens/closes dd menu
 * - esc key closes menu
 * - clicking outside of menu closes menu
 * - clicking inside dd doesn't close it
 * - show/hide should fire custom events if defined
 * - showing one menu should hide other menus
 *
 * - ability to fetch the popover instances from the page
 * - opening add close listeners,  (too keep event crowding low)
 * - close removes close listeners
 */


/**
 * Module Deps
 */
var getEl = require("qwery");
var events = require("event");  
var parseDataControls = require("data-control-parser");

//TODO: pass in context and scope for all of these!

//instantiate a new popover instance
function ddPopover(container, config) {
  var container_node = getEl(container)[0];
  var context = container_node;

  var trigger = config.trigger || ".trigger";
  var trigger_node = getEl(trigger, context);

  var target = config.target || ".target";
  var target_node = getEl(target, context);

  var toggleClass = config.toggleClass || "visible";

  var closeTrigger = config.closeTrigger || false; //clicking this el will close the target


  //show / hide menu on trigger click  (toggle dd popover) (evt delegation)
  container_node.on('click', trigger, function(e) {
    e.preventDefault(); //prevent following the link 
    
    //if class is present, show it, else hide it
    if ( target_node.hasClass(toggleClass) ) {
      closeMenu();

    } else {
      toggleMenu(true, target_node, toggleClass, config.openEvent); //open menu
      
      setTimeout(function(){ 
        $("html").on("click", closeMenu); //add global click listener to close menu
        $(document).on("keyup", closeMenuOnEsc); //add global esc key listener to close menu  
      }, 50);

    }
  });

  //hide menu on escape keystroke
  

    
  //stop click on dropdown to close the menu 
  container_node.on('click', target, function(e){
    e.stopPropagation();
  });
  
  //if a close trigger is passed in, set delegate for it.
  if (closeTrigger) {
    //if there's a close trigger, add listener to close
    container_node.on('click', closeTrigger, function(){
      closeMenu();
    }); 
  } 
  
  //close on escape
  function closeMenuOnEsc(e) {
    if (e.keyCode === 27) {
      closeMenu();
    }
  }

  //close convenience method
  function closeMenu() {
    toggleMenu(false, target_node, toggleClass, config.closeEvent);  //force close
    $("html").off("click", closeMenu); //remove global close click listener
    $(document).off("keyup", closeMenuOnEsc); //remove global esc key listener
  }

  function toggleMenu(switchBool, el, className, eventToFire) {
    $(el).toggleClass(className, switchBool); //switch = if true/false to add/remove class
    //if open event defined, fire it
    if (eventToFire) {
      $(el).trigger(eventToFire); 
    }
  }
} //ddPopover()


//Convenience methods

//get the html fixture instances on the page
function getPopoverNodes(query) {
  var popover_query = query || "[data-control=ddPopover]";
  var popovers = getEl(popover_query);
  console.log(popovers);
  return popovers;
}

//build only the first item
function one(query) {
  var popover = getPopoverNodes(query).slice(0,1); //only leave the first item
  buildPopovers(popover);
}

//build all items found
function all(query) {
  var popovers = getPopoverNodes(query);
  buildPopovers(popovers);
}

function buildPopovers(popovers) {
  
  //construct all the popover instances collected
  for (var i = popovers.length - 1; i >= 0; i--) {
    
    var cfg = parseDataControls(popovers[i]);
    
    //enhance the markup with functionality
    new ddPopover(cfg.container, cfg)
  };
}



module.exports = {
  all: all, //fetch all instance from the page. Build all instances that match the query.
  one: one //build one popover instance. Build the first instance found
}

// module.exports = function() {

//   //return new ddPopover(config.container, config);

// }
