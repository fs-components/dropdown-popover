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
require('query-qwery'); //use qwery as selector engine for query
var query = require("query");
var events = require("event");  
var parseDataControls = require("data-control-parser");
var stopProp = require('stop'); //x-browser stopPropogation 
var preventDef = require('prevent'); //x-browser preventDefault 
var GlobalMediator = require('custom-evt-manager'); //used to fire global custom events, that can be heard from other components.



//instantiate a new popover instance
function ddPopover(container, config) {
  var mediator = new GlobalMediator();

  //custom event stuff
  var unique_id = config.unique_id || false; //used to scope the custom event this fires properly. If not passed, no custom event will fire.
  var COMP_EVT_NAME = "ddPopover";
  var CLOSE_EVT = "close";
  var OPEN_EVT = "open";


  var container_node = query(container);
  var context = container_node;

  var trigger = config.trigger || ".trigger";
  var trigger_node = query(trigger, context);

  var target = config.target || ".target";
  var target_node = query(target, context);

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
        events.bind(query('html'), "click", closeMenu); //add global click listener to close menu
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
    events.bind(query(closeTrigger, context), "click", closeMenu);
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

    events.unbind(query('html'), "click", closeMenu); //remove global close click listener
    events.unbind(document, "keyup", closeMenuOnEsc); //remove global esc key listener
  }

  function hideMenu(el, className) {
    
    el.className = el.className.replace(className, ""); //remove className

    
    //fire custom event (if unique name is passed) (which can be heard across modules / components)
    if (unique_id) {
      var evt_namespace = COMP_EVT_NAME + "::" + unique_id + "::" + CLOSE_EVT;
      //console.log (evt_namespace);
      //fire event, and pass the evt name as argument.
      mediator.publish( evt_namespace, evt_namespace ); //pass which instance is closed, opened...
      //mediator.publish( "chat::message", "shaggy1187", "CLOSE" );  
    }
    
  }

  function showMenu(el, className) {
    el.className += " " + className; //add className

    //fire custom event (if unique name is passed) (which can be heard across modules / components)
    if (unique_id) {
      var evt_namespace = COMP_EVT_NAME + "::" + unique_id + "::" + OPEN_EVT;
      //fire event, and pass the evt name as argument.
      mediator.publish( evt_namespace, evt_namespace ); //pass which instance is closed, opened...
     
    }

  }

  
} //ddPopover()


//Convenience methods

//get the html fixture instances on the page
//build only the first item
function one(query_str) {
  var popover_query = query_str || "[data-control=ddPopover]";
  var popover = [query(query_str)]; //buildPopovers expevts array
  buildPopovers(popover);
}

//build all items found
function all(query_str) {
  var popover_query = query_str || "[data-control=ddPopover]";
  var popovers = query.all(query_str);
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
};


// module.exports = function() {

//   //return new ddPopover(config.container, config);

// }
