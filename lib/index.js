//
//  State Machine
//  Fork/derivative of https://github.com/jakesgordon/javascript-state-machine
//
var StateMachine = {
  WILDCARD: '*'
};

StateMachine.create = function (cfg, target) {
  
  var fsm = target || cfg.target || {};
  var events = cfg.events || {};
  var callbacks = cfg.callbacks || {};
  
  
  
  for (var event in events) {
    fsm[event] = this.buildEvent(event, events[event]);
  }
  
  
  for (var name in callbacks) {
    if (callbacks.hasOwnProperty(name)) {
      fsm[name] = callbacks[name];
    }
  }
  
  
  fsm.current = cfg.initial || 'idle';
  
  fsm.is = function (state) {
    return (this.current === state) ? true : false;
  }
  
  
  fsm.can = function (event) {
  
    if (!events.hasOwnProperty(event) || !events[event].hasOwnProperty(this.current)) {
      return false;
    }
    
    return true;
  }
  
  
  fsm.cannot = function (event) {
    return !this.can(event);
  }
  
  
  return fsm;
};


StateMachine.buildEvent = function (event, events) {
  
  
  function ucfirst(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
  
  return function () {
    //console.log(event + '()');

    if (this._pending) {
      console.log('transition pending:', event + '()', this._pending);
      return;
    }
    
    if (this.cannot(event)) {
      console.log('unable to transition', event + '()', this.current, events);
      return;
    }

    
    //  Callbacks

    //onBeforeEVENT
    //onBefore
    //onLeaveSTATE
    //onLeave
    //onStateSTATE
    //onEnterSTATE
    //onEnter
    //onEventEVENT
    //onAfterEVENT
    //onAfter
    var callbacks = [
      'onBefore' + ucfirst(event),
      'onBefore',
      'onLeave' + ucfirst(this.current),
      'onLeave',
      function () { 
        console.log(this.current, '->', events[this.current]);
        this.current = events[this.current];
      },
      'onState' + ucfirst(events[this.current]),
      'onEnter' + ucfirst(events[this.current]),
      'onEnter',
      'onEvent' + ucfirst(event),
      'onAfter' + ucfirst(event),
      'onAfter'
    ];


    var iterate = function (callbacks) {
      var callback = callbacks.shift();
      
      //console.log('c', callback);
      
      if (!callback) {
        this._pending = null;
        //console.log('no more callbacks');
        return;
      }
      
      
      if (typeof callback === 'function') {
        callback.bind(this)();
        iterate(callbacks);
        return;
      }
      
      
      if (this[callback]) {
        this._pending = callback;
        var result = this[callback](function (cancel) {
          
          this._pending = null;
          
          if (cancel) {
            //  Cancel - do nothing
            return;
          }
          
          iterate(callbacks);
        }.bind(this), event, this.current, events[this.current]);
        
        
        //  Support Async Callback
        if (~['undefined', 'null'].indexOf(typeof result)) {
          //console.log('async detected', callback);
          return;
        }
        
        
        //  Support Promises
        if (typeof result === 'object' && typeof result.then === 'function') {
          result.then(function () {
            iterate(callbacks);
          }, function () {
            //  Cancel - do nothing
          });
          return;
        }
        
        
        if (result === true) {
          iterate(callbacks);
          return;
        }
        
        if (result === false) {
          //  Cancel
          return;
        }
        
        throw new Error('Unsupported callback return');
      }
      else {
        iterate(callbacks);
      }
      
      
    }.bind(this);
    
    
    iterate(callbacks);
    
  };
};


module.exports = StateMachine;
