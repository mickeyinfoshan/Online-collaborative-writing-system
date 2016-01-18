/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Base = __webpack_require__(1);
	var Model = __webpack_require__(4);
	var DSSet = __webpack_require__(5);

	module.exports = {
		Base: Base,
		Model: Model,
		DSSet: DSSet
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
		@author : Mickey
		@email : mickey.in.foshan@gmail.com

		****************************************

		The structure of a complex application is like a tree
		and a data station is like a node of the tree.
		A data station take the responsibility to receive
		data, process data, and then dispatch the processed
		data to the next.
		Everything can be a data station. Models, views and
		controllers in MVC can be data stations. Dispatchers
		and stores in Flux can be data stations.
		A data station can have several data sources. Sources can be
		added through 'addSource' method,
		which will create a receiver waiting for data.
		A data station can have one or more data destinations. When a data station
		add an another data station as a data source, this data station will be a data
		destination of the other one.
		A data station can have several handlers dealing
		with a certain data type. When data comes, a data station will choose the
		corresponding handler to process the data.
		If no corresponding handler found, do nothing.
		If a handler returns value, then the data station will
		dispatch the return value to all data destinations of it.
		Otherwise, nothing more to do.
		If the return value doesn't have '$type' attribute,
		the origin $type will add to it.
	*/

	'use strict';

	var Emitter = __webpack_require__(2).EventEmitter;
	var DEFAULT_TYPE = __webpack_require__(3).DEFAULT_TYPE;

	class Base {

		constructor() {
			this.$sources = new Map();
			this.$destinations = new Set();
			this.$handlers = new Map();
		}

		addSource(dataStation, $type) {

			dataStation._addDestination(this);
			var emitter = new Emitter();
			if ($type == undefined) {
				$type = DEFAULT_TYPE;
			}
			emitter.on($type, this.process.bind(this));
			var _types = this.$sources.get(dataStation);
			_types = _types || new Map();
			_types.set($type, emitter);
			this.$sources.set(dataStation, _types);
		}

		removeSource(dataStation, $type) {
			function removeSourceDataStation() {
				dataStation._removeDestination(this);
				this.$sources.delete(dataStation);
			}

			var types = this.$sources.get(dataStation);
			if (types && $type) {
				types.delete($type);
				if (types.size <= 0) {
					removeSourceDataStation.bind(this)();
				}
			} else {
				removeSourceDataStation.bind(this)();
			}
		}

		hasSource(dataStation, $type) {
			if ($type == undefined) {
				return this.$sources.has(dataStation);
			}
			if (!this.$sources.has(dataStation)) {
				return false;
			}
			return this.$sources.get(dataStation).has($type);
		}

		getSourcesCount() {
			return this.$sources.size;
		}
		//shouldn't invoke by users, this is
		// a private method
		_addDestination(dataStation) {
			this.$destinations.add(dataStation);
		}
		_removeDestination(dataStation) {
			this.$destinations.delete(dataStation);
		}
		hasDestination(dataStation) {
			return this.$destinations.has(dataStation);
		}
		getDestinationsCount() {
			return this.$destinations.size;
		}

		//deliver the data to another dataStation
		deliver(data, dataStation) {
			if (!data) {
				return;
			}
			var receiver = dataStation.getReceiver(this, data.$type);
			if (!receiver) {
				return;
			}
			receiver.emit(data.$type, data);
		}

		getReceiver(dataStation, $type) {
			var types = this.$sources.get(dataStation);
			if (!types) {
				return;
			}
			return types.get($type);
		}

		addHandler(handler, $type) {
			//adding the handler of data type existed
			//will override the origin one
			//`this` needs to be binded when the handler use `this` ,
			//For example:
			//  var foo = {
			// 		func(){		        // a method use `this`
			//	    	...
			//			...this...
			//			...
			// 		}
			// 	};
			// 	var ds = new Base();
			// 	ds.addHandler(foo.func);			//NOT OK! foo.func won't work as you expect
			// 	ds.addHandler(foo.func.bind(foo));  //OK

			if ($type == undefined) {
				$type = DEFAULT_TYPE;
			}
			this.$handlers.set($type, handler);
		}

		removeHandler($type) {
			if ($type == undefined) {
				$type = DEFAULT_TYPE;
			}
			this.$handlers.delete($type);
		}

		//process the data received
		process(data, callback) {
			var handler = this.$handlers.get(data.$type);
			//if the handler of such data type doesn't exist, then
			//do nothing
			if (!handler) {
				return;
			}

			//handle the data
			var processedData = handler(data.$content);
			if (processedData && processedData.$type == undefined) {
				processedData.$type = data.$type;
			}
			//default callback is this.dispatch
			callback = callback || this.dispatch;
			callback = callback.bind(this);
			return callback(processedData);
		}
		hasHandler($type) {
			if ($type == undefined) {
				$type = DEFAULT_TYPE;
			}
			return this.$handlers.has($type);
		}

		//dispatch the data to all destinations
		dispatch(data) {
			//If the handler didn't produce any data,
			//do nothing.
			if (!data) {
				return;
			}
			if (data.$type == undefined) {
				data.$type = DEFAULT_TYPE;
			}
			this.$destinations.forEach(this.deliver.bind(this, data));
		}
	}

	module.exports = Base;

/***/ },
/* 2 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function (n) {
	  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function (type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events) this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler)) return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++) listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function (type, listener) {
	  var m;

	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  if (!this._events) this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function (type, listener) {
	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function (type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type]) return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener || isFunction(list.listener) && list.listener === listener) {
	    delete this._events[type];
	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0) return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function (type) {
	  var key, listeners;

	  if (!this._events) return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function (type) {
	  var ret;
	  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function (type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function (emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	var _CONSTANTS = {
		DEFAULT_TYPE: "_DATA"
	};

	module.exports = _CONSTANTS;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		@author : Mickey
		@email : mickey.in.foshan@gmail.com

		****************************************

		Model, which is inherited from Base, is developed to
	  solve the problem that it's no easy job to detect the changes of a model.
	  Something similar to Observer pattern is used here. When the `set` method is called,
	  the instance will dispatch the information to all it's `destinations`(Observers).

	  For more information, read the test!

	*/

	'use strict';

	const Base = __webpack_require__(1);

	class Model extends Base {

	  //get the value of the field provided
	  get(fieldName) {
	    return this[fieldName];
	  }

	  //change the value of the field provided and dispatch the information to its Observers
	  set(newStatus) {
	    var prevStatus = {};
	    for (var field in newStatus) {
	      prevStatus[field] = this.get(field);
	      this._setField({
	        field: field,
	        value: newStatus[field]
	      });
	    }

	    //dispatch the information to Observers
	    this.dispatch({
	      $type: this._getClassName() + ".change",
	      $content: {
	        instance: this,
	        prevStatus: prevStatus
	      }
	    });
	  }

	  //change the value of a certain field
	  _setField(newStatus) {
	    this[newStatus.field] = newStatus.value;
	  }

	  //get the class name of the instance
	  _getClassName() {
	    return this.constructor.name;
	  }
	}

	module.exports = Model;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';

	var Base = __webpack_require__(1);

	class DSSet extends Set {
	  constructor() {
	    super();
	    this.$dataStation = new Base();
	  }

	  add(item) {
	    super.add(item);
	    var itemClassName = item.constructor.name;
	    this.getDataStation().dispatch({
	      $type: `${ itemClassName }.add`,
	      $content: {
	        instance: item
	      }
	    });
	  }

	  delete(item) {
	    var deleteResult = super.delete(item);
	    var itemClassName = item.constructor.name;
	    var deletedInstance = deleteResult ? item : undefined;
	    this.getDataStation().dispatch({
	      $type: `${ itemClassName }.delete`,
	      $content: {
	        instance: deletedInstance,
	        success: deleteResult
	      }
	    });
	    return deleteResult;
	  }

	  getDataStation() {
	    return this.$dataStation;
	  }
	}

	module.exports = DSSet;

/***/ }
/******/ ]);