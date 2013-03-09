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
var stopProp = require('stop'); //x-browser stopPropogation 
var preventDef = require('prevent'); //x-browser preventDefault 

//TODO: pull in yields/stop, yields/prevent (for x-browser both of those)

//instantiate a new popover instance
function ddPopover(container, config) {
  var container_node = getEl(container)[0];
  var context = container_node;

  var trigger = config.trigger || ".trigger";
  var trigger_node = getEl(trigger, context)[0];

  var target = config.target || ".target";
  var target_node = getEl(target, context)[0];

  var toggleClass = config.toggleClass || "visible";

  var closeTrigger = config.closeTrigger || false; //clicking this el will close the target


  //show / hide menu on trigger click  (toggle dd popover) (evt delegation)
  //FIXME: figure out delegation?
  events.bind(trigger_node, 'click', function(e){
    preventDef(e); //prevent following the link 
    
    //if class is present, show it, else hide it
    if ( target_node.className.match(toggleClass) ) {
      closeMenu();

    } else {
      showMenu(target_node, toggleClass);
      //toggleMenu(true, target_node, toggleClass, config.openEvent); //open menu
      
      setTimeout(function(){ 
        events.bind(getEl('html')[0], "click", closeMenu); //add global click listener to close menu
        events.bind(document, "keyup", closeMenuOnEsc); //add global esc key listener to close menu  
      }, 50);

    }
  });
  

  //stop click on dropdown to close the menu 
  events.bind(target_node, 'click', function(e){
    stopProp(e);
  });
  
  //if a close trigger is passed in, set delegate for it.
  if (closeTrigger) {
    //if there's a close trigger, add listener to close
    events.bind(getEl(closeTrigger, context)[0], "click", closeMenu);
  } 
  
  //close on escape
  function closeMenuOnEsc(e) {
    if (e.keyCode === 27) {
      closeMenu();
    }
  }

  //close convenience method
  function closeMenu() {
    hideMenu(target_node, toggleClass);
    //if open event defined, fire it
    //FIXME: Q: How are we going to fire custom events without jquery?
    // if (eventToFire) {
    //   $(el).trigger(eventToFire); 
    // }

    events.unbind(getEl('html')[0], "click", closeMenu); //remove global close click listener
    events.unbind(document, "keyup", closeMenuOnEsc); //remove global esc key listener
  }

  function hideMenu(el, className) {
    el.className = el.className.replace(className, ""); //remove className

  }

  function showMenu(el, className) {
    el.className += " " + className; //add className

    //if open event defined, fire it
    //FIXME: How are we going to fire the custom events without jquery? Is that possible?
    // if (eventToFire) {
    //   $(el).trigger(eventToFire); 
    // }
  }

  
} //ddPopover()


//Convenience methods

//get the html fixture instances on the page
function getPopoverNodes(query) {
  var popover_query = query || "[data-control=ddPopover]";
  var popovers = getEl(popover_query);
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
