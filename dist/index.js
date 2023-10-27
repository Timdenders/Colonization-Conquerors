module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(334);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 9:
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49);

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

module.exports = eos;


/***/ }),

/***/ 11:
/***/ (function(module) {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 23:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = HttpDuplex;

var util = __webpack_require__(669),
  stream = __webpack_require__(574);

util.inherits(HttpDuplex, stream.Duplex);

function HttpDuplex(req, res, options) {
  var self = this;

  if (!(self instanceof HttpDuplex)) return new HttpDuplex(req, res, options);

  stream.Duplex.call(self, options);
  self._output = null;

  self.connect(req, res);
}

HttpDuplex.prototype.connect = function(req, res) {
  var self = this;
  self.req = req;
  self._output = res;
  self.emit('response', res);

  res.on('data', function(c) {
    if (!self.push(c)) self._output.pause();
  });
  res.on('end', function() {
    self.push(null);
  });
};

HttpDuplex.prototype._read = function(n) {
  if (this._output) this._output.resume();
};

HttpDuplex.prototype._write = function(chunk, encoding, cb) {
  this.req.write(chunk, encoding);
  cb();
};

HttpDuplex.prototype.end = function(chunk, encoding, cb) {
  this._output.socket.destroy();
  return this.req.end(chunk, encoding, cb);
};

HttpDuplex.prototype.destroy = function() {
  this.req.destroy();
  this._output.socket.destroy();
};


/***/ }),

/***/ 33:
/***/ (function(module, __unusedexports, __webpack_require__) {

// This wrapper class is used to retain backwards compatibility with
// pre-v0.4 ssh2. If it weren't for `read()` and `write()` being used by the
// streams2/3 API, we could just pass the SFTPStream directly to the end user...

var inherits = __webpack_require__(669).inherits;
var EventEmitter = __webpack_require__(614).EventEmitter;

function SFTPWrapper(stream) {
  var self = this;

  EventEmitter.call(this);

  this._stream = stream;

  stream.on('error', function(err) {
    self.emit('error', err);
  }).on('end', function() {
    self.emit('end');
  }).on('close', function() {
    self.emit('close');
  }).on('continue', function() {
    self.emit('continue');
  });
}
inherits(SFTPWrapper, EventEmitter);

// stream-related methods to pass on
SFTPWrapper.prototype.end = function() {
  return this._stream.end();
};
// SFTPStream client methods
SFTPWrapper.prototype.createReadStream = function(path, options) {
  return this._stream.createReadStream(path, options);
};
SFTPWrapper.prototype.createWriteStream = function(path, options) {
  return this._stream.createWriteStream(path, options);
};
SFTPWrapper.prototype.open = function(path, flags, attrs, cb) {
  return this._stream.open(path, flags, attrs, cb);
};
SFTPWrapper.prototype.close = function(handle, cb) {
  return this._stream.close(handle, cb);
};
SFTPWrapper.prototype.read = function(handle, buf, off, len, position, cb) {
  return this._stream.readData(handle, buf, off, len, position, cb);
};
SFTPWrapper.prototype.write = function(handle, buf, off, len, position, cb) {
  return this._stream.writeData(handle, buf, off, len, position, cb);
};
SFTPWrapper.prototype.fastGet = function(remotePath, localPath, opts, cb) {
  return this._stream.fastGet(remotePath, localPath, opts, cb);
};
SFTPWrapper.prototype.fastPut = function(localPath, remotePath, opts, cb) {
  return this._stream.fastPut(localPath, remotePath, opts, cb);
};
SFTPWrapper.prototype.readFile = function(path, options, callback_) {
  return this._stream.readFile(path, options, callback_);
};
SFTPWrapper.prototype.writeFile = function(path, data, options, callback_) {
  return this._stream.writeFile(path, data, options, callback_);
};
SFTPWrapper.prototype.appendFile = function(path, data, options, callback_) {
  return this._stream.appendFile(path, data, options, callback_);
};
SFTPWrapper.prototype.exists = function(path, cb) {
  return this._stream.exists(path, cb);
};
SFTPWrapper.prototype.unlink = function(filename, cb) {
  return this._stream.unlink(filename, cb);
};
SFTPWrapper.prototype.rename = function(oldPath, newPath, cb) {
  return this._stream.rename(oldPath, newPath, cb);
};
SFTPWrapper.prototype.mkdir = function(path, attrs, cb) {
  return this._stream.mkdir(path, attrs, cb);
};
SFTPWrapper.prototype.rmdir = function(path, cb) {
  return this._stream.rmdir(path, cb);
};
SFTPWrapper.prototype.readdir = function(where, opts, cb) {
  return this._stream.readdir(where, opts, cb);
};
SFTPWrapper.prototype.fstat = function(handle, cb) {
  return this._stream.fstat(handle, cb);
};
SFTPWrapper.prototype.stat = function(path, cb) {
  return this._stream.stat(path, cb);
};
SFTPWrapper.prototype.lstat = function(path, cb) {
  return this._stream.lstat(path, cb);
};
SFTPWrapper.prototype.opendir = function(path, cb) {
  return this._stream.opendir(path, cb);
};
SFTPWrapper.prototype.setstat = function(path, attrs, cb) {
  return this._stream.setstat(path, attrs, cb);
};
SFTPWrapper.prototype.fsetstat = function(handle, attrs, cb) {
  return this._stream.fsetstat(handle, attrs, cb);
};
SFTPWrapper.prototype.futimes = function(handle, atime, mtime, cb) {
  return this._stream.futimes(handle, atime, mtime, cb);
};
SFTPWrapper.prototype.utimes = function(path, atime, mtime, cb) {
  return this._stream.utimes(path, atime, mtime, cb);
};
SFTPWrapper.prototype.fchown = function(handle, uid, gid, cb) {
  return this._stream.fchown(handle, uid, gid, cb);
};
SFTPWrapper.prototype.chown = function(path, uid, gid, cb) {
  return this._stream.chown(path, uid, gid, cb);
};
SFTPWrapper.prototype.fchmod = function(handle, mode, cb) {
  return this._stream.fchmod(handle, mode, cb);
};
SFTPWrapper.prototype.chmod = function(path, mode, cb) {
  return this._stream.chmod(path, mode, cb);
};
SFTPWrapper.prototype.readlink = function(path, cb) {
  return this._stream.readlink(path, cb);
};
SFTPWrapper.prototype.symlink = function(targetPath, linkPath, cb) {
  return this._stream.symlink(targetPath, linkPath, cb);
};
SFTPWrapper.prototype.realpath = function(path, cb) {
  return this._stream.realpath(path, cb);
};
// extended requests
SFTPWrapper.prototype.ext_openssh_rename = function(oldPath, newPath, cb) {
  return this._stream.ext_openssh_rename(oldPath, newPath, cb);
};
SFTPWrapper.prototype.ext_openssh_statvfs = function(path, cb) {
  return this._stream.ext_openssh_statvfs(path, cb);
};
SFTPWrapper.prototype.ext_openssh_fstatvfs = function(handle, cb) {
  return this._stream.ext_openssh_fstatvfs(handle, cb);
};
SFTPWrapper.prototype.ext_openssh_hardlink = function(oldPath, newPath, cb) {
  return this._stream.ext_openssh_hardlink(oldPath, newPath, cb);
};
SFTPWrapper.prototype.ext_openssh_fsync = function(handle, cb) {
  return this._stream.ext_openssh_fsync(handle, cb);
};

module.exports = SFTPWrapper;


/***/ }),

/***/ 46:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = __webpack_require__(740);

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;

/***/ }),

/***/ 49:
/***/ (function(module, __unusedexports, __webpack_require__) {

var wrappy = __webpack_require__(11)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 58:
/***/ (function(module) {

module.exports = {
  readUInt32BE: function readUInt32BE(buf, offset) {
    return buf[offset++] * 16777216
           + buf[offset++] * 65536
           + buf[offset++] * 256
           + buf[offset];
  },
  writeUInt32BE: function writeUInt32BE(buf, value, offset) {
    buf[offset++] = (value >>> 24);
    buf[offset++] = (value >>> 16);
    buf[offset++] = (value >>> 8);
    buf[offset++] = value;
    return offset;
  },
  writeUInt32LE: function writeUInt32LE(buf, value, offset) {
    buf[offset++] = value;
    buf[offset++] = (value >>> 8);
    buf[offset++] = (value >>> 16);
    buf[offset++] = (value >>> 24);
    return offset;
  }
};


/***/ }),

/***/ 62:
/***/ (function(module, __unusedexports, __webpack_require__) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

// If you have no idea what ASN.1 or BER is, see this:
// ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc

var Ber = __webpack_require__(249);



// --- Exported API

module.exports = {

  Ber: Ber,

  BerReader: Ber.Reader,

  BerWriter: Ber.Writer

};


/***/ }),

/***/ 75:
/***/ (function(module) {

// https://github.com/HenrikJoreteg/extend-object/blob/v0.1.0/extend-object.js

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

module.exports.extend = function(obj) {
  each.call(slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

module.exports.parseJSON = function(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
};


/***/ }),

/***/ 76:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an Service
 * @param {Object} modem docker-modem
 * @param {String} id    Service's ID
 */
var Service = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Service.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Query Docker for service details.
 *
 * @param {function} callback
 */
Service.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/services/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Delete Service
 *
 * @param {function} callback
 */
Service.prototype.remove = function(callback) {
  var self = this;

  var optsf = {
    path: '/services/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'no such service',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Update service
 *
 * @param {object} auth
 * @param {object} opts
 * @param {function} callback
 */
Service.prototype.update = function(auth, opts, callback) {
  var self = this;
  if (!callback) {
    var t = typeof opts;
    if(t === 'function'){
      callback = opts;
      opts = auth;
      auth = opts.authconfig || undefined;
    } else if (t === 'undefined'){
      opts = auth;
      auth = opts.authconfig || undefined;
    }
  }

  var optsf = {
    path: '/services/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    },
    authconfig: auth,
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};



/**
 * Service logs
 * @param  {Object}   opts     Logs options. (optional)
 * @param  {Function} callback Callback with data
 */
Service.prototype.logs = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, {});

  var optsf = {
    path: '/services/' + this.id + '/logs?',
    method: 'GET',
    isStream: args.opts.follow || false,
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error',
      503: 'node is not part of a swarm'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};



module.exports = Service;


/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(867);
const util = __webpack_require__(669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(858);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(486)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.replace(/\s*\n\s*/g, ' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 82:
/***/ (function(__unusedmodule, exports) {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 89:
/***/ (function(module, __unusedexports, __webpack_require__) {

var inherits = __webpack_require__(669).inherits;
var DuplexStream = __webpack_require__(413).Duplex;
var ReadableStream = __webpack_require__(413).Readable;
var WritableStream = __webpack_require__(413).Writable;

var STDERR = __webpack_require__(139).constants.CHANNEL_EXTENDED_DATATYPE.STDERR;

var PACKET_SIZE = 32 * 1024;
var MAX_WINDOW = 2 * 1024 * 1024;
var WINDOW_THRESHOLD = MAX_WINDOW / 2;
var CUSTOM_EVENTS = [
  'CHANNEL_EOF',
  'CHANNEL_CLOSE',
  'CHANNEL_DATA',
  'CHANNEL_EXTENDED_DATA',
  'CHANNEL_WINDOW_ADJUST',
  'CHANNEL_SUCCESS',
  'CHANNEL_FAILURE',
  'CHANNEL_REQUEST'
];
var CUSTOM_EVENTS_LEN = CUSTOM_EVENTS.length;

function Channel(info, client, opts) {
  var streamOpts = {
    highWaterMark: MAX_WINDOW,
    allowHalfOpen: (!opts || (opts && opts.allowHalfOpen !== false))
  };

  this.allowHalfOpen = streamOpts.allowHalfOpen;

  DuplexStream.call(this, streamOpts);

  var self = this;
  var server = opts && opts.server;

  this.server = server;
  this.type = info.type;
  this.subtype = undefined;
  /*
    incoming and outgoing contain these properties:
    {
      id: undefined,
      window: undefined,
      packetSize: undefined,
      state: 'closed'
    }
  */
  var incoming = this.incoming = info.incoming;
  var incomingId = incoming.id;
  var outgoing = this.outgoing = info.outgoing;
  var callbacks = this._callbacks = [];
  var exitCode;
  var exitSignal;
  var exitDump;
  var exitDesc;
  var exitLang;

  this._client = client;
  this._hasX11 = false;

  var channels = client._channels;
  var sshstream = client._sshstream;

  function ondrain() {
    if (self._waitClientDrain) {
      self._waitClientDrain = false;
      if (!self._waitWindow) {
        if (self._chunk)
          self._write(self._chunk, null, self._chunkcb);
        else if (self._chunkcb)
          self._chunkcb();
        else if (self._chunkErr)
          self.stderr._write(self._chunkErr, null, self._chunkcbErr);
        else if (self._chunkcbErr)
          self._chunkcbErr();
      }
    }
  }
  client._sock.on('drain', ondrain);

  sshstream.once('CHANNEL_EOF:' + incomingId, function() {
    if (incoming.state !== 'open')
      return;
    incoming.state = 'eof';

    if (self.readable)
      self.push(null);
    if (!server && self.stderr.readable)
      self.stderr.push(null);
  }).once('CHANNEL_CLOSE:' + incomingId, function() {
    if (incoming.state === 'closed')
      return;
    incoming.state = 'closed';

    if (self.readable)
      self.push(null);
    if (server && self.stderr.writable)
      self.stderr.end();
    else if (!server && self.stderr.readable)
      self.stderr.push(null);

    if (outgoing.state === 'open' || outgoing.state === 'eof')
      self.close();
    if (outgoing.state === 'closing')
      outgoing.state = 'closed';

    delete channels[incomingId];

    var state = self._writableState;
    client._sock.removeListener('drain', ondrain);
    if (!state.ending && !state.finished)
      self.end();

    // Take care of any outstanding channel requests
    self._callbacks = [];
    for (var i = 0; i < callbacks.length; ++i)
      callbacks[i](true);
    callbacks = self._callbacks;

    if (!server) {
      // align more with node child processes, where the close event gets the
      // same arguments as the exit event
      if (!self.readable) {
        if (exitCode === null) {
          self.emit('close', exitCode, exitSignal, exitDump, exitDesc,
                    exitLang);
        } else
          self.emit('close', exitCode);
      } else {
        self.once('end', function() {
          if (exitCode === null) {
            self.emit('close', exitCode, exitSignal, exitDump, exitDesc,
                      exitLang);
          } else
            self.emit('close', exitCode);
        });
      }

      if (!self.stderr.readable)
        self.stderr.emit('close');
      else {
        self.stderr.once('end', function() {
          self.stderr.emit('close');
        });
      }
    } else { // Server mode
      if (!self.readable)
        self.emit('close');
      else {
        self.once('end', function() {
          self.emit('close');
        });
      }
    }

    for (var i = 0; i < CUSTOM_EVENTS_LEN; ++i)
      sshstream.removeAllListeners(CUSTOM_EVENTS[i] + ':' + incomingId);
  }).on('CHANNEL_DATA:' + incomingId, function(data) {
    // the remote party should not be sending us data if there is no window
    // space available ...
    // TODO: raise error on data with not enough window
    if (incoming.window === 0)
      return;

    incoming.window -= data.length;

    if (!self.push(data)) {
      self._waitChanDrain = true;
      return;
    }

    if (incoming.window <= WINDOW_THRESHOLD)
      windowAdjust(self);
  }).on('CHANNEL_WINDOW_ADJUST:' + incomingId, function(amt) {
    // the server is allowing us to send `amt` more bytes of data
    outgoing.window += amt;

    if (self._waitWindow) {
      self._waitWindow = false;
      if (!self._waitClientDrain) {
        if (self._chunk)
          self._write(self._chunk, null, self._chunkcb);
        else if (self._chunkcb)
          self._chunkcb();
        else if (self._chunkErr)
          self.stderr._write(self._chunkErr, null, self._chunkcbErr);
        else if (self._chunkcbErr)
          self._chunkcbErr();
      }
    }
  }).on('CHANNEL_SUCCESS:' + incomingId, function() {
    if (server) {
      sshstream._kalast = Date.now();
      sshstream._kacnt = 0;
    } else
      client._resetKA();
    if (callbacks.length)
      callbacks.shift()(false);
  }).on('CHANNEL_FAILURE:' + incomingId, function() {
    if (server) {
      sshstream._kalast = Date.now();
      sshstream._kacnt = 0;
    } else
      client._resetKA();
    if (callbacks.length)
      callbacks.shift()(true);
  }).on('CHANNEL_REQUEST:' + incomingId, function(info) {
    if (!server) {
      if (info.request === 'exit-status') {
        self.emit('exit', exitCode = info.code);
        return;
      } else if (info.request === 'exit-signal') {
        self.emit('exit',
                  exitCode = null,
                  exitSignal = 'SIG' + info.signal,
                  exitDump = info.coredump,
                  exitDesc = info.description,
                  exitLang = info.lang);
        return;
      }
    }

    // keepalive request? OpenSSH will send one as a channel request if there
    // is a channel open

    if (info.wantReply)
      sshstream.channelFailure(outgoing.id);
  });

  this.stdin = this.stdout = this;

  if (server)
    this.stderr = new ServerStderr(this);
  else {
    this.stderr = new ReadableStream(streamOpts);
    this.stderr._read = function(n) {
      if (self._waitChanDrain) {
        self._waitChanDrain = false;
        if (incoming.window <= WINDOW_THRESHOLD)
          windowAdjust(self);
      }
    };

    sshstream.on('CHANNEL_EXTENDED_DATA:' + incomingId,
      function(type, data) {
        // the remote party should not be sending us data if there is no window
        // space available ...
        // TODO: raise error on data with not enough window
        if (incoming.window === 0)
          return;

        incoming.window -= data.length;

        if (!self.stderr.push(data)) {
          self._waitChanDrain = true;
          return;
        }

        if (incoming.window <= WINDOW_THRESHOLD)
          windowAdjust(self);
      }
    );
  }

  // outgoing data
  this._waitClientDrain = false; // Client stream-level backpressure
  this._waitWindow = false; // SSH-level backpressure

  // incoming data
  this._waitChanDrain = false; // Channel Readable side backpressure

  this._chunk = undefined;
  this._chunkcb = undefined;
  this._chunkErr = undefined;
  this._chunkcbErr = undefined;

  function onFinish() {
    self.eof();
    if (server || (!server && !self.allowHalfOpen))
      self.close();
    self.writable = false;
  }
  this.on('finish', onFinish)
      .on('prefinish', onFinish); // for node v0.11+
  function onEnd() {
    self.readable = false;
  }
  this.on('end', onEnd)
      .on('close', onEnd);
}
inherits(Channel, DuplexStream);

Channel.prototype.eof = function() {
  var ret = true;
  var outgoing = this.outgoing;

  if (outgoing.state === 'open') {
    outgoing.state = 'eof';
    ret = this._client._sshstream.channelEOF(outgoing.id);
  }

  return ret;
};

Channel.prototype.close = function() {
  var ret = true;
  var outgoing = this.outgoing;

  if (outgoing.state === 'open' || outgoing.state === 'eof') {
    outgoing.state = 'closing';
    ret = this._client._sshstream.channelClose(outgoing.id);
  }

  return ret;
};

Channel.prototype._read = function(n) {
  if (this._waitChanDrain) {
    this._waitChanDrain = false;
    if (this.incoming.window <= WINDOW_THRESHOLD)
      windowAdjust(this);
  }
};

Channel.prototype._write = function(data, encoding, cb) {
  var sshstream = this._client._sshstream;
  var outgoing = this.outgoing;
  var packetSize = outgoing.packetSize;
  var id = outgoing.id;
  var window = outgoing.window;
  var len = data.length;
  var p = 0;
  var ret;
  var buf;
  var sliceLen;

  if (outgoing.state !== 'open')
    return;

  while (len - p > 0 && window > 0) {
    sliceLen = len - p;
    if (sliceLen > window)
      sliceLen = window;
    if (sliceLen > packetSize)
      sliceLen = packetSize;

    ret = sshstream.channelData(id, data.slice(p, p + sliceLen));

    p += sliceLen;
    window -= sliceLen;

    if (!ret) {
      this._waitClientDrain = true;
      this._chunk = undefined;
      this._chunkcb = cb;
      break;
    }
  }

  outgoing.window = window;

  if (len - p > 0) {
    if (window === 0)
      this._waitWindow = true;
    if (p > 0) {
      // partial
      buf = Buffer.allocUnsafe(len - p);
      data.copy(buf, 0, p);
      this._chunk = buf;
    } else
      this._chunk = data;
    this._chunkcb = cb;
    return;
  }

  if (!this._waitClientDrain)
    cb();
};

Channel.prototype.destroy = function() {
  this.end();
};

// session type-specific methods
Channel.prototype.setWindow = function(rows, cols, height, width) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  if (this.type === 'session'
      && (this.subtype === 'shell' || this.subtype === 'exec')
      && this.writable
      && this.outgoing.state === 'open') {
    return this._client._sshstream.windowChange(this.outgoing.id,
                                                rows,
                                                cols,
                                                height,
                                                width);
  }

  return true;
};
Channel.prototype.signal = function(signalName) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  if (this.type === 'session'
      && this.writable
      && this.outgoing.state === 'open')
    return this._client._sshstream.signal(this.outgoing.id, signalName);

  return true;
};
Channel.prototype.exit = function(name, coreDumped, msg) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  if (this.type === 'session'
      && this.writable
      && this.outgoing.state === 'open') {
    if (typeof name === 'number')
      return this._client._sshstream.exitStatus(this.outgoing.id, name);
    else {
      return this._client._sshstream.exitSignal(this.outgoing.id,
                                                name,
                                                coreDumped,
                                                msg);
    }
  }

  return true;
};

Channel.MAX_WINDOW = MAX_WINDOW;
Channel.PACKET_SIZE = PACKET_SIZE;

function windowAdjust(self) {
  if (self.outgoing.state === 'closed')
    return true;
  var amt = MAX_WINDOW - self.incoming.window;
  if (amt <= 0)
    return true;
  self.incoming.window += amt;
  return self._client._sshstream.channelWindowAdjust(self.outgoing.id, amt);
}

function ServerStderr(channel) {
  WritableStream.call(this, { highWaterMark: MAX_WINDOW });
  this._channel = channel;
}
inherits(ServerStderr, WritableStream);

ServerStderr.prototype._write = function(data, encoding, cb) {
  var channel = this._channel;
  var sshstream = channel._client._sshstream;
  var outgoing = channel.outgoing;
  var packetSize = outgoing.packetSize;
  var id = outgoing.id;
  var window = outgoing.window;
  var len = data.length;
  var p = 0;
  var ret;
  var buf;
  var sliceLen;

  if (channel.outgoing.state !== 'open')
    return;

  while (len - p > 0 && window > 0) {
    sliceLen = len - p;
    if (sliceLen > window)
      sliceLen = window;
    if (sliceLen > packetSize)
      sliceLen = packetSize;

    ret = sshstream.channelExtData(id, data.slice(p, p + sliceLen), STDERR);

    p += sliceLen;
    window -= sliceLen;

    if (!ret) {
      channel._waitClientDrain = true;
      channel._chunkErr = undefined;
      channel._chunkcbErr = cb;
      break;
    }
  }

  outgoing.window = window;

  if (len - p > 0) {
    if (window === 0)
      channel._waitWindow = true;
    if (p > 0) {
      // partial
      buf = Buffer.allocUnsafe(len - p);
      data.copy(buf, 0, p);
      channel._chunkErr = buf;
    } else
      channel._chunkErr = data;
    channel._chunkcbErr = cb;
    return;
  }

  if (!channel._waitClientDrain)
    cb();
};

module.exports = Channel;


/***/ }),

/***/ 102:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(747));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 107:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an Node
 * @param {Object} modem docker-modem
 * @param {String} id    Node's ID
 */
var Node = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Node.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Query Docker for Node details.
 *
 * @param {function} callback
 */
Node.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/nodes/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Update a node.
 *
 * @param {object} opts
 * @param {function} callback
 */
Node.prototype.update = function(opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
  }

  var optsf = {
    path: '/nodes/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such node',
      406: 'node is not part of a swarm',
      500: 'server error'
    },
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Remove a Node.
 * Warning: This method is not documented in the API.
 *
 * @param {object} opts
 * @param {function} callback
 */
Node.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/nodes/' + this.id + '?',
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


module.exports = Node;


/***/ }),

/***/ 120:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

var chownr = __webpack_require__(941)
var tar = __webpack_require__(394)
var pump = __webpack_require__(453)
var mkdirp = __webpack_require__(516)
var fs = __webpack_require__(747)
var path = __webpack_require__(622)
var os = __webpack_require__(87)

var win32 = os.platform() === 'win32'

var noop = function () {}

var echo = function (name) {
  return name
}

var normalize = !win32 ? echo : function (name) {
  return name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_')
}

var statAll = function (fs, stat, cwd, ignore, entries, sort) {
  var queue = entries || ['.']

  return function loop (callback) {
    if (!queue.length) return callback()
    var next = queue.shift()
    var nextAbs = path.join(cwd, next)

    stat(nextAbs, function (err, stat) {
      if (err) return callback(err)

      if (!stat.isDirectory()) return callback(null, next, stat)

      fs.readdir(nextAbs, function (err, files) {
        if (err) return callback(err)

        if (sort) files.sort()
        for (var i = 0; i < files.length; i++) {
          if (!ignore(path.join(cwd, next, files[i]))) queue.push(path.join(next, files[i]))
        }

        callback(null, next, stat)
      })
    })
  }
}

var strip = function (map, level) {
  return function (header) {
    header.name = header.name.split('/').slice(level).join('/')

    var linkname = header.linkname
    if (linkname && (header.type === 'link' || path.isAbsolute(linkname))) {
      header.linkname = linkname.split('/').slice(level).join('/')
    }

    return map(header)
  }
}

exports.pack = function (cwd, opts) {
  if (!cwd) cwd = '.'
  if (!opts) opts = {}

  var xfs = opts.fs || fs
  var ignore = opts.ignore || opts.filter || noop
  var map = opts.map || noop
  var mapStream = opts.mapStream || echo
  var statNext = statAll(xfs, opts.dereference ? xfs.stat : xfs.lstat, cwd, ignore, opts.entries, opts.sort)
  var strict = opts.strict !== false
  var umask = typeof opts.umask === 'number' ? ~opts.umask : ~processUmask()
  var dmode = typeof opts.dmode === 'number' ? opts.dmode : 0
  var fmode = typeof opts.fmode === 'number' ? opts.fmode : 0
  var pack = opts.pack || tar.pack()
  var finish = opts.finish || noop

  if (opts.strip) map = strip(map, opts.strip)

  if (opts.readable) {
    dmode |= parseInt(555, 8)
    fmode |= parseInt(444, 8)
  }
  if (opts.writable) {
    dmode |= parseInt(333, 8)
    fmode |= parseInt(222, 8)
  }

  var onsymlink = function (filename, header) {
    xfs.readlink(path.join(cwd, filename), function (err, linkname) {
      if (err) return pack.destroy(err)
      header.linkname = normalize(linkname)
      pack.entry(header, onnextentry)
    })
  }

  var onstat = function (err, filename, stat) {
    if (err) return pack.destroy(err)
    if (!filename) {
      if (opts.finalize !== false) pack.finalize()
      return finish(pack)
    }

    if (stat.isSocket()) return onnextentry() // tar does not support sockets...

    var header = {
      name: normalize(filename),
      mode: (stat.mode | (stat.isDirectory() ? dmode : fmode)) & umask,
      mtime: stat.mtime,
      size: stat.size,
      type: 'file',
      uid: stat.uid,
      gid: stat.gid
    }

    if (stat.isDirectory()) {
      header.size = 0
      header.type = 'directory'
      header = map(header) || header
      return pack.entry(header, onnextentry)
    }

    if (stat.isSymbolicLink()) {
      header.size = 0
      header.type = 'symlink'
      header = map(header) || header
      return onsymlink(filename, header)
    }

    // TODO: add fifo etc...

    header = map(header) || header

    if (!stat.isFile()) {
      if (strict) return pack.destroy(new Error('unsupported type for ' + filename))
      return onnextentry()
    }

    var entry = pack.entry(header, onnextentry)
    if (!entry) return

    var rs = mapStream(xfs.createReadStream(path.join(cwd, filename)), header)

    rs.on('error', function (err) { // always forward errors on destroy
      entry.destroy(err)
    })

    pump(rs, entry)
  }

  var onnextentry = function (err) {
    if (err) return pack.destroy(err)
    statNext(onstat)
  }

  onnextentry()

  return pack
}

var head = function (list) {
  return list.length ? list[list.length - 1] : null
}

var processGetuid = function () {
  return process.getuid ? process.getuid() : -1
}

var processUmask = function () {
  return process.umask ? process.umask() : 0
}

exports.extract = function (cwd, opts) {
  if (!cwd) cwd = '.'
  if (!opts) opts = {}

  var xfs = opts.fs || fs
  var ignore = opts.ignore || opts.filter || noop
  var map = opts.map || noop
  var mapStream = opts.mapStream || echo
  var own = opts.chown !== false && !win32 && processGetuid() === 0
  var extract = opts.extract || tar.extract()
  var stack = []
  var now = new Date()
  var umask = typeof opts.umask === 'number' ? ~opts.umask : ~processUmask()
  var dmode = typeof opts.dmode === 'number' ? opts.dmode : 0
  var fmode = typeof opts.fmode === 'number' ? opts.fmode : 0
  var strict = opts.strict !== false

  if (opts.strip) map = strip(map, opts.strip)

  if (opts.readable) {
    dmode |= parseInt(555, 8)
    fmode |= parseInt(444, 8)
  }
  if (opts.writable) {
    dmode |= parseInt(333, 8)
    fmode |= parseInt(222, 8)
  }

  var utimesParent = function (name, cb) { // we just set the mtime on the parent dir again everytime we write an entry
    var top
    while ((top = head(stack)) && name.slice(0, top[0].length) !== top[0]) stack.pop()
    if (!top) return cb()
    xfs.utimes(top[0], now, top[1], cb)
  }

  var utimes = function (name, header, cb) {
    if (opts.utimes === false) return cb()

    if (header.type === 'directory') return xfs.utimes(name, now, header.mtime, cb)
    if (header.type === 'symlink') return utimesParent(name, cb) // TODO: how to set mtime on link?

    xfs.utimes(name, now, header.mtime, function (err) {
      if (err) return cb(err)
      utimesParent(name, cb)
    })
  }

  var chperm = function (name, header, cb) {
    var link = header.type === 'symlink'

    /* eslint-disable node/no-deprecated-api */
    var chmod = link ? xfs.lchmod : xfs.chmod
    var chown = link ? xfs.lchown : xfs.chown
    /* eslint-enable node/no-deprecated-api */

    if (!chmod) return cb()

    var mode = (header.mode | (header.type === 'directory' ? dmode : fmode)) & umask
    chmod(name, mode, function (err) {
      if (err) return cb(err)
      if (!own) return cb()
      if (!chown) return cb()
      chown(name, header.uid, header.gid, cb)
    })
  }

  extract.on('entry', function (header, stream, next) {
    header = map(header) || header
    header.name = normalize(header.name)
    var name = path.join(cwd, path.join('/', header.name))

    if (ignore(name, header)) {
      stream.resume()
      return next()
    }

    var stat = function (err) {
      if (err) return next(err)
      utimes(name, header, function (err) {
        if (err) return next(err)
        if (win32) return next()
        chperm(name, header, next)
      })
    }

    var onsymlink = function () {
      if (win32) return next() // skip symlinks on win for now before it can be tested
      xfs.unlink(name, function () {
        xfs.symlink(header.linkname, name, stat)
      })
    }

    var onlink = function () {
      if (win32) return next() // skip links on win for now before it can be tested
      xfs.unlink(name, function () {
        var srcpath = path.join(cwd, path.join('/', header.linkname))

        xfs.link(srcpath, name, function (err) {
          if (err && err.code === 'EPERM' && opts.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath)
            return onfile()
          }

          stat(err)
        })
      })
    }

    var onfile = function () {
      var ws = xfs.createWriteStream(name)
      var rs = mapStream(stream, header)

      ws.on('error', function (err) { // always forward errors on destroy
        rs.destroy(err)
      })

      pump(rs, ws, function (err) {
        if (err) return next(err)
        ws.on('close', stat)
      })
    }

    if (header.type === 'directory') {
      stack.push([name, header.mtime])
      return mkdirfix(name, {
        fs: xfs, own: own, uid: header.uid, gid: header.gid
      }, stat)
    }

    var dir = path.dirname(name)

    validate(xfs, dir, path.join(cwd, '.'), function (err, valid) {
      if (err) return next(err)
      if (!valid) return next(new Error(dir + ' is not a valid path'))

      mkdirfix(dir, {
        fs: xfs, own: own, uid: header.uid, gid: header.gid
      }, function (err) {
        if (err) return next(err)

        switch (header.type) {
          case 'file': return onfile()
          case 'link': return onlink()
          case 'symlink': return onsymlink()
        }

        if (strict) return next(new Error('unsupported type for ' + name + ' (' + header.type + ')'))

        stream.resume()
        next()
      })
    })
  })

  if (opts.finish) extract.on('finish', opts.finish)

  return extract
}

function validate (fs, name, root, cb) {
  if (name === root) return cb(null, true)
  fs.lstat(name, function (err, st) {
    if (err && err.code !== 'ENOENT') return cb(err)
    if (err || st.isDirectory()) return validate(fs, path.join(name, '..'), root, cb)
    cb(null, false)
  })
}

function mkdirfix (name, opts, cb) {
  mkdirp(name, { fs: opts.fs }, function (err, made) {
    if (!err && made && opts.own) {
      chownr(made, opts.uid, opts.gid, cb)
    } else {
      cb(err)
    }
  })
}


/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 139:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = {
  SFTPStream: __webpack_require__(157),
  SSH2Stream: __webpack_require__(635),
  utils: __webpack_require__(780),
  constants: __webpack_require__(801)
};

/***/ }),

/***/ 149:
/***/ (function(module, exports, __webpack_require__) {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(293)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 154:
/***/ (function(__unusedmodule, exports) {

var alloc = Buffer.alloc

var ZEROS = '0000000000000000000'
var SEVENS = '7777777777777777777'
var ZERO_OFFSET = '0'.charCodeAt(0)
var USTAR_MAGIC = Buffer.from('ustar\x00', 'binary')
var USTAR_VER = Buffer.from('00', 'binary')
var GNU_MAGIC = Buffer.from('ustar\x20', 'binary')
var GNU_VER = Buffer.from('\x20\x00', 'binary')
var MASK = parseInt('7777', 8)
var MAGIC_OFFSET = 257
var VERSION_OFFSET = 263

var clamp = function (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

var toType = function (flag) {
  switch (flag) {
    case 0:
      return 'file'
    case 1:
      return 'link'
    case 2:
      return 'symlink'
    case 3:
      return 'character-device'
    case 4:
      return 'block-device'
    case 5:
      return 'directory'
    case 6:
      return 'fifo'
    case 7:
      return 'contiguous-file'
    case 72:
      return 'pax-header'
    case 55:
      return 'pax-global-header'
    case 27:
      return 'gnu-long-link-path'
    case 28:
    case 30:
      return 'gnu-long-path'
  }

  return null
}

var toTypeflag = function (flag) {
  switch (flag) {
    case 'file':
      return 0
    case 'link':
      return 1
    case 'symlink':
      return 2
    case 'character-device':
      return 3
    case 'block-device':
      return 4
    case 'directory':
      return 5
    case 'fifo':
      return 6
    case 'contiguous-file':
      return 7
    case 'pax-header':
      return 72
  }

  return 0
}

var indexOf = function (block, num, offset, end) {
  for (; offset < end; offset++) {
    if (block[offset] === num) return offset
  }
  return end
}

var cksum = function (block) {
  var sum = 8 * 32
  for (var i = 0; i < 148; i++) sum += block[i]
  for (var j = 156; j < 512; j++) sum += block[j]
  return sum
}

var encodeOct = function (val, n) {
  val = val.toString(8)
  if (val.length > n) return SEVENS.slice(0, n) + ' '
  else return ZEROS.slice(0, n - val.length) + val + ' '
}

/* Copied from the node-tar repo and modified to meet
 * tar-stream coding standard.
 *
 * Source: https://github.com/npm/node-tar/blob/51b6627a1f357d2eb433e7378e5f05e83b7aa6cd/lib/header.js#L349
 */
function parse256 (buf) {
  // first byte MUST be either 80 or FF
  // 80 for positive, FF for 2's comp
  var positive
  if (buf[0] === 0x80) positive = true
  else if (buf[0] === 0xFF) positive = false
  else return null

  // build up a base-256 tuple from the least sig to the highest
  var tuple = []
  for (var i = buf.length - 1; i > 0; i--) {
    var byte = buf[i]
    if (positive) tuple.push(byte)
    else tuple.push(0xFF - byte)
  }

  var sum = 0
  var l = tuple.length
  for (i = 0; i < l; i++) {
    sum += tuple[i] * Math.pow(256, i)
  }

  return positive ? sum : -1 * sum
}

var decodeOct = function (val, offset, length) {
  val = val.slice(offset, offset + length)
  offset = 0

  // If prefixed with 0x80 then parse as a base-256 integer
  if (val[offset] & 0x80) {
    return parse256(val)
  } else {
    // Older versions of tar can prefix with spaces
    while (offset < val.length && val[offset] === 32) offset++
    var end = clamp(indexOf(val, 32, offset, val.length), val.length, val.length)
    while (offset < end && val[offset] === 0) offset++
    if (end === offset) return 0
    return parseInt(val.slice(offset, end).toString(), 8)
  }
}

var decodeStr = function (val, offset, length, encoding) {
  return val.slice(offset, indexOf(val, 0, offset, offset + length)).toString(encoding)
}

var addLength = function (str) {
  var len = Buffer.byteLength(str)
  var digits = Math.floor(Math.log(len) / Math.log(10)) + 1
  if (len + digits >= Math.pow(10, digits)) digits++

  return (len + digits) + str
}

exports.decodeLongPath = function (buf, encoding) {
  return decodeStr(buf, 0, buf.length, encoding)
}

exports.encodePax = function (opts) { // TODO: encode more stuff in pax
  var result = ''
  if (opts.name) result += addLength(' path=' + opts.name + '\n')
  if (opts.linkname) result += addLength(' linkpath=' + opts.linkname + '\n')
  var pax = opts.pax
  if (pax) {
    for (var key in pax) {
      result += addLength(' ' + key + '=' + pax[key] + '\n')
    }
  }
  return Buffer.from(result)
}

exports.decodePax = function (buf) {
  var result = {}

  while (buf.length) {
    var i = 0
    while (i < buf.length && buf[i] !== 32) i++
    var len = parseInt(buf.slice(0, i).toString(), 10)
    if (!len) return result

    var b = buf.slice(i + 1, len - 1).toString()
    var keyIndex = b.indexOf('=')
    if (keyIndex === -1) return result
    result[b.slice(0, keyIndex)] = b.slice(keyIndex + 1)

    buf = buf.slice(len)
  }

  return result
}

exports.encode = function (opts) {
  var buf = alloc(512)
  var name = opts.name
  var prefix = ''

  if (opts.typeflag === 5 && name[name.length - 1] !== '/') name += '/'
  if (Buffer.byteLength(name) !== name.length) return null // utf-8

  while (Buffer.byteLength(name) > 100) {
    var i = name.indexOf('/')
    if (i === -1) return null
    prefix += prefix ? '/' + name.slice(0, i) : name.slice(0, i)
    name = name.slice(i + 1)
  }

  if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155) return null
  if (opts.linkname && Buffer.byteLength(opts.linkname) > 100) return null

  buf.write(name)
  buf.write(encodeOct(opts.mode & MASK, 6), 100)
  buf.write(encodeOct(opts.uid, 6), 108)
  buf.write(encodeOct(opts.gid, 6), 116)
  buf.write(encodeOct(opts.size, 11), 124)
  buf.write(encodeOct((opts.mtime.getTime() / 1000) | 0, 11), 136)

  buf[156] = ZERO_OFFSET + toTypeflag(opts.type)

  if (opts.linkname) buf.write(opts.linkname, 157)

  USTAR_MAGIC.copy(buf, MAGIC_OFFSET)
  USTAR_VER.copy(buf, VERSION_OFFSET)
  if (opts.uname) buf.write(opts.uname, 265)
  if (opts.gname) buf.write(opts.gname, 297)
  buf.write(encodeOct(opts.devmajor || 0, 6), 329)
  buf.write(encodeOct(opts.devminor || 0, 6), 337)

  if (prefix) buf.write(prefix, 345)

  buf.write(encodeOct(cksum(buf), 6), 148)

  return buf
}

exports.decode = function (buf, filenameEncoding) {
  var typeflag = buf[156] === 0 ? 0 : buf[156] - ZERO_OFFSET

  var name = decodeStr(buf, 0, 100, filenameEncoding)
  var mode = decodeOct(buf, 100, 8)
  var uid = decodeOct(buf, 108, 8)
  var gid = decodeOct(buf, 116, 8)
  var size = decodeOct(buf, 124, 12)
  var mtime = decodeOct(buf, 136, 12)
  var type = toType(typeflag)
  var linkname = buf[157] === 0 ? null : decodeStr(buf, 157, 100, filenameEncoding)
  var uname = decodeStr(buf, 265, 32)
  var gname = decodeStr(buf, 297, 32)
  var devmajor = decodeOct(buf, 329, 8)
  var devminor = decodeOct(buf, 337, 8)

  var c = cksum(buf)

  // checksum is still initial value if header was null.
  if (c === 8 * 32) return null

  // valid checksum
  if (c !== decodeOct(buf, 148, 8)) throw new Error('Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?')

  if (USTAR_MAGIC.compare(buf, MAGIC_OFFSET, MAGIC_OFFSET + 6) === 0) {
    // ustar (posix) format.
    // prepend prefix, if present.
    if (buf[345]) name = decodeStr(buf, 345, 155, filenameEncoding) + '/' + name
  } else if (GNU_MAGIC.compare(buf, MAGIC_OFFSET, MAGIC_OFFSET + 6) === 0 &&
             GNU_VER.compare(buf, VERSION_OFFSET, VERSION_OFFSET + 2) === 0) {
    // 'gnu'/'oldgnu' format. Similar to ustar, but has support for incremental and
    // multi-volume tarballs.
  } else {
    throw new Error('Invalid tar header: unknown format.')
  }

  // to support old tar versions that use trailing / to indicate dirs
  if (typeflag === 0 && name && name[name.length - 1] === '/') typeflag = 5

  return {
    name,
    mode,
    uid,
    gid,
    size,
    mtime: new Date(1000 * mtime),
    type,
    linkname,
    uname,
    gname,
    devmajor,
    devminor
  }
}


/***/ }),

/***/ 157:
/***/ (function(module, __unusedexports, __webpack_require__) {

// TODO: support EXTENDED request packets

var TransformStream = __webpack_require__(413).Transform;
var ReadableStream = __webpack_require__(413).Readable;
var WritableStream = __webpack_require__(413).Writable;
var constants = __webpack_require__(747).constants || process.binding('constants');
var util = __webpack_require__(669);
var inherits = util.inherits;
var isDate = util.isDate;
var listenerCount = __webpack_require__(614).EventEmitter.listenerCount;
var fs = __webpack_require__(747);

var readString = __webpack_require__(780).readString;
var readInt = __webpack_require__(780).readInt;
var readUInt32BE = __webpack_require__(523).readUInt32BE;
var writeUInt32BE = __webpack_require__(523).writeUInt32BE;

var ATTR = {
  SIZE: 0x00000001,
  UIDGID: 0x00000002,
  PERMISSIONS: 0x00000004,
  ACMODTIME: 0x00000008,
  EXTENDED: 0x80000000
};

var STATUS_CODE = {
  OK: 0,
  EOF: 1,
  NO_SUCH_FILE: 2,
  PERMISSION_DENIED: 3,
  FAILURE: 4,
  BAD_MESSAGE: 5,
  NO_CONNECTION: 6,
  CONNECTION_LOST: 7,
  OP_UNSUPPORTED: 8
};
Object.keys(STATUS_CODE).forEach(function(key) {
  STATUS_CODE[STATUS_CODE[key]] = key;
});
var STATUS_CODE_STR = {
  0: 'No error',
  1: 'End of file',
  2: 'No such file or directory',
  3: 'Permission denied',
  4: 'Failure',
  5: 'Bad message',
  6: 'No connection',
  7: 'Connection lost',
  8: 'Operation unsupported'
};
SFTPStream.STATUS_CODE = STATUS_CODE;

var REQUEST = {
  INIT: 1,
  OPEN: 3,
  CLOSE: 4,
  READ: 5,
  WRITE: 6,
  LSTAT: 7,
  FSTAT: 8,
  SETSTAT: 9,
  FSETSTAT: 10,
  OPENDIR: 11,
  READDIR: 12,
  REMOVE: 13,
  MKDIR: 14,
  RMDIR: 15,
  REALPATH: 16,
  STAT: 17,
  RENAME: 18,
  READLINK: 19,
  SYMLINK: 20,
  EXTENDED: 200
};
Object.keys(REQUEST).forEach(function(key) {
  REQUEST[REQUEST[key]] = key;
});

var RESPONSE = {
  VERSION: 2,
  STATUS: 101,
  HANDLE: 102,
  DATA: 103,
  NAME: 104,
  ATTRS: 105,
  EXTENDED: 201
};
Object.keys(RESPONSE).forEach(function(key) {
  RESPONSE[RESPONSE[key]] = key;
});

var OPEN_MODE = {
  READ: 0x00000001,
  WRITE: 0x00000002,
  APPEND: 0x00000004,
  CREAT: 0x00000008,
  TRUNC: 0x00000010,
  EXCL: 0x00000020
};
SFTPStream.OPEN_MODE = OPEN_MODE;

var MAX_PKT_LEN = 34000;
var MAX_REQID = Math.pow(2, 32) - 1;
var CLIENT_VERSION_BUFFER = Buffer.from([0, 0, 0, 5 /* length */,
                                         REQUEST.INIT,
                                         0, 0, 0, 3 /* version */]);
var SERVER_VERSION_BUFFER = Buffer.from([0, 0, 0, 5 /* length */,
                                         RESPONSE.VERSION,
                                         0, 0, 0, 3 /* version */]);
/*
  http://tools.ietf.org/html/draft-ietf-secsh-filexfer-02:

     The maximum size of a packet is in practice determined by the client
     (the maximum size of read or write requests that it sends, plus a few
     bytes of packet overhead).  All servers SHOULD support packets of at
     least 34000 bytes (where the packet size refers to the full length,
     including the header above).  This should allow for reads and writes
     of at most 32768 bytes.

  OpenSSH caps this to 256kb instead of the ~34kb as mentioned in the sftpv3
  spec.
*/
var RE_OPENSSH = /^SSH-2.0-(?:OpenSSH|dropbear)/;
var OPENSSH_MAX_DATA_LEN = (256 * 1024) - (2 * 1024)/*account for header data*/;

function DEBUG_NOOP(msg) {}

function SFTPStream(cfg, remoteIdentRaw) {
  if (typeof cfg === 'string' && !remoteIdentRaw) {
    remoteIdentRaw = cfg;
    cfg = undefined;
  }
  if (typeof cfg !== 'object' || !cfg)
    cfg = {};

  TransformStream.call(this, {
    highWaterMark: (typeof cfg.highWaterMark === 'number'
                    ? cfg.highWaterMark
                    : 32 * 1024)
  });

  this.debug = (typeof cfg.debug === 'function' ? cfg.debug : DEBUG_NOOP);
  this.server = (cfg.server ? true : false);
  this._isOpenSSH = (remoteIdentRaw && RE_OPENSSH.test(remoteIdentRaw));
  this._needContinue = false;
  this._state = {
    // common
    status: 'packet_header',
    writeReqid: -1,
    pktLeft: undefined,
    pktHdrBuf: Buffer.allocUnsafe(9), // room for pktLen + pktType + req id
    pktBuf: undefined,
    pktType: undefined,
    version: undefined,
    extensions: {},

    // client
    maxDataLen: (this._isOpenSSH ? OPENSSH_MAX_DATA_LEN : 32768),
    requests: {}
  };

  var self = this;
  this.on('end', function() {
    self.readable = false;
  }).on('finish', onFinish)
    .on('prefinish', onFinish);
  function onFinish() {
    self.writable = false;
    self._cleanup(false);
  }

  if (!this.server)
    this.push(CLIENT_VERSION_BUFFER);
}
inherits(SFTPStream, TransformStream);

SFTPStream.prototype.__read = TransformStream.prototype._read;
SFTPStream.prototype._read = function(n) {
  if (this._needContinue) {
    this._needContinue = false;
    this.emit('continue');
  }
  return this.__read(n);
};
SFTPStream.prototype.__push = TransformStream.prototype.push;
SFTPStream.prototype.push = function(chunk, encoding) {
  if (!this.readable)
    return false;
  if (chunk === null)
    this.readable = false;
  var ret = this.__push(chunk, encoding);
  this._needContinue = (ret === false);
  return ret;
};

SFTPStream.prototype._cleanup = function(callback) {
  var state = this._state;

  state.pktBuf = undefined; // give GC something to do

  var requests = state.requests;
  var keys = Object.keys(requests);
  var len = keys.length;
  if (len) {
    if (this.readable) {
      var err = new Error('SFTP session ended early');
      for (var i = 0, cb; i < len; ++i)
        (cb = requests[keys[i]].cb) && cb(err);
    }
    state.requests = {};
  }

  if (this.readable)
    this.push(null);
  if (!this._readableState.endEmitted && !this._readableState.flowing) {
    // Ugh!
    this.resume();
  }
  if (callback !== false) {
    this.debug('DEBUG[SFTP]: Parser: Malformed packet');
    callback && callback(new Error('Malformed packet'));
  }
};

SFTPStream.prototype._transform = function(chunk, encoding, callback) {
  var state = this._state;
  var server = this.server;
  var status = state.status;
  var pktType = state.pktType;
  var pktBuf = state.pktBuf;
  var pktLeft = state.pktLeft;
  var version = state.version;
  var pktHdrBuf = state.pktHdrBuf;
  var requests = state.requests;
  var debug = this.debug;
  var chunkLen = chunk.length;
  var chunkPos = 0;
  var buffer;
  var chunkLeft;
  var id;

  while (true) {
    if (status === 'discard') {
      chunkLeft = (chunkLen - chunkPos);
      if (pktLeft <= chunkLeft) {
        chunkPos += pktLeft;
        pktLeft = 0;
        status = 'packet_header';
        buffer = pktBuf = undefined;
      } else {
        pktLeft -= chunkLeft;
        break;
      }
    } else if (pktBuf !== undefined) {
      chunkLeft = (chunkLen - chunkPos);
      if (pktLeft <= chunkLeft) {
        chunk.copy(pktBuf,
                   pktBuf.length - pktLeft,
                   chunkPos,
                   chunkPos + pktLeft);
        chunkPos += pktLeft;
        pktLeft = 0;
        buffer = pktBuf;
        pktBuf = undefined;
        continue;
      } else {
        chunk.copy(pktBuf, pktBuf.length - pktLeft, chunkPos);
        pktLeft -= chunkLeft;
        break;
      }
    } else if (status === 'packet_header') {
      if (!buffer) {
        pktLeft = 5;
        pktBuf = pktHdrBuf;
      } else {
        // here we read the right-most 5 bytes from buffer (pktHdrBuf)
        pktLeft = readUInt32BE(buffer, 4) - 1; // account for type byte
        pktType = buffer[8];

        if (server) {
          if (version === undefined && pktType !== REQUEST.INIT) {
            debug('DEBUG[SFTP]: Parser: Unexpected packet before init');
            this._cleanup(false);
            return callback(new Error('Unexpected packet before init'));
          } else if (version !== undefined && pktType === REQUEST.INIT) {
            debug('DEBUG[SFTP]: Parser: Unexpected duplicate init');
            status = 'bad_pkt';
          } else if (pktLeft > MAX_PKT_LEN) {
            var msg = 'Packet length ('
                      + pktLeft
                      + ') exceeds max length ('
                      + MAX_PKT_LEN
                      + ')';
            debug('DEBUG[SFTP]: Parser: ' + msg);
            this._cleanup(false);
            return callback(new Error(msg));
          } else if (pktType === REQUEST.EXTENDED) {
            status = 'bad_pkt';
          } else if (REQUEST[pktType] === undefined) {
            debug('DEBUG[SFTP]: Parser: Unsupported packet type: ' + pktType);
            status = 'discard';
          }
        } else if (version === undefined && pktType !== RESPONSE.VERSION) {
          debug('DEBUG[SFTP]: Parser: Unexpected packet before version');
          this._cleanup(false);
          return callback(new Error('Unexpected packet before version'));
        } else if (version !== undefined && pktType === RESPONSE.VERSION) {
          debug('DEBUG[SFTP]: Parser: Unexpected duplicate version');
          status = 'bad_pkt';
        } else if (RESPONSE[pktType] === undefined) {
          status = 'discard';
        }

        if (status === 'bad_pkt') {
          // Copy original packet info to left of pktHdrBuf
          writeUInt32BE(pktHdrBuf, pktLeft + 1, 0);
          pktHdrBuf[4] = pktType;

          pktLeft = 4;
          pktBuf = pktHdrBuf;
        } else {
          pktBuf = Buffer.allocUnsafe(pktLeft);
          status = 'payload';
        }
      }
    } else if (status === 'payload') {
      if (pktType === RESPONSE.VERSION || pktType === REQUEST.INIT) {
        /*
          uint32 version
          <extension data>
        */
        version = state.version = readInt(buffer, 0, this, callback);
        if (version === false)
          return;
        if (version < 3) {
          this._cleanup(false);
          return callback(new Error('Incompatible SFTP version: ' + version));
        } else if (server)
          this.push(SERVER_VERSION_BUFFER);

        var buflen = buffer.length;
        var extname;
        var extdata;
        buffer._pos = 4;
        while (buffer._pos < buflen) {
          extname = readString(buffer, buffer._pos, 'ascii', this, callback);
          if (extname === false)
            return;
          extdata = readString(buffer, buffer._pos, 'ascii', this, callback);
          if (extdata === false)
            return;
          if (state.extensions[extname])
            state.extensions[extname].push(extdata);
          else
            state.extensions[extname] = [ extdata ];
        }

        this.emit('ready');
      } else {
        /*
          All other packets (client and server) begin with a (client) request
          id:
          uint32     id
        */
        id = readInt(buffer, 0, this, callback);
        if (id === false)
          return;

        var filename;
        var attrs;
        var handle;
        var data;

        if (!server) {
          var req = requests[id];
          var cb = req && req.cb;
          debug('DEBUG[SFTP]: Parser: Response: ' + RESPONSE[pktType]);
          if (req && cb) {
            if (pktType === RESPONSE.STATUS) {
              /*
                uint32     error/status code
                string     error message (ISO-10646 UTF-8)
                string     language tag
              */
              var code = readInt(buffer, 4, this, callback);
              if (code === false)
                return;
              if (code === STATUS_CODE.OK) {
                cb();
              } else {
                // We borrow OpenSSH behavior here, specifically we make the
                // message and language fields optional, despite the
                // specification requiring them (even if they are empty). This
                // helps to avoid problems with buggy implementations that do
                // not fully conform to the SFTP(v3) specification.
                var msg;
                var lang = '';
                if (buffer.length >= 12) {
                  msg = readString(buffer, 8, 'utf8', this, callback);
                  if (msg === false)
                    return;
                  if ((buffer._pos + 4) < buffer.length) {
                    lang = readString(buffer,
                                      buffer._pos,
                                      'ascii',
                                      this,
                                      callback);
                    if (lang === false)
                      return;
                  }
                }
                var err = new Error(msg
                                    || STATUS_CODE_STR[code]
                                    || 'Unknown status');
                err.code = code;
                err.lang = lang;
                cb(err);
              }
            } else if (pktType === RESPONSE.HANDLE) {
              /*
                string     handle
              */
              handle = readString(buffer, 4, this, callback);
              if (handle === false)
                return;
              cb(undefined, handle);
            } else if (pktType === RESPONSE.DATA) {
              /*
                string     data
              */
              if (req.buffer) {
                // we have already pre-allocated space to store the data
                var dataLen = readInt(buffer, 4, this, callback);
                if (dataLen === false)
                  return;
                var reqBufLen = req.buffer.length;
                if (dataLen > reqBufLen) {
                  // truncate response data to fit expected size
                  writeUInt32BE(buffer, reqBufLen, 4);
                }
                data = readString(buffer, 4, req.buffer, this, callback);
                if (data === false)
                  return;
                cb(undefined, data, dataLen);
              } else {
                data = readString(buffer, 4, this, callback);
                if (data === false)
                  return;
                cb(undefined, data);
              }
            } else if (pktType === RESPONSE.NAME) {
              /*
                uint32     count
                repeats count times:
                        string     filename
                        string     longname
                        ATTRS      attrs
              */
              var namesLen = readInt(buffer, 4, this, callback);
              if (namesLen === false)
                return;
              var names = [],
                  longname;
              buffer._pos = 8;
              for (var i = 0; i < namesLen; ++i) {
                // we are going to assume UTF-8 for filenames despite the SFTPv3
                // spec not specifying an encoding because the specs for newer
                // versions of the protocol all explicitly specify UTF-8 for
                // filenames
                filename = readString(buffer,
                                      buffer._pos,
                                      'utf8',
                                      this,
                                      callback);
                if (filename === false)
                  return;
                // `longname` only exists in SFTPv3 and since it typically will
                // contain the filename, we assume it is also UTF-8
                longname = readString(buffer,
                                      buffer._pos,
                                      'utf8',
                                      this,
                                      callback);
                if (longname === false)
                  return;
                attrs = readAttrs(buffer, buffer._pos, this, callback);
                if (attrs === false)
                  return;
                names.push({
                  filename: filename,
                  longname: longname,
                  attrs: attrs
                });
              }
              cb(undefined, names);
            } else if (pktType === RESPONSE.ATTRS) {
              /*
                ATTRS      attrs
              */
              attrs = readAttrs(buffer, 4, this, callback);
              if (attrs === false)
                return;
              cb(undefined, attrs);
            } else if (pktType === RESPONSE.EXTENDED) {
              if (req.extended) {
                switch (req.extended) {
                  case 'statvfs@openssh.com':
                  case 'fstatvfs@openssh.com':
                    /*
                      uint64    f_bsize   // file system block size
                      uint64    f_frsize  // fundamental fs block size
                      uint64    f_blocks  // number of blocks (unit f_frsize)
                      uint64    f_bfree   // free blocks in file system
                      uint64    f_bavail  // free blocks for non-root
                      uint64    f_files   // total file inodes
                      uint64    f_ffree   // free file inodes
                      uint64    f_favail  // free file inodes for to non-root
                      uint64    f_fsid    // file system id
                      uint64    f_flag    // bit mask of f_flag values
                      uint64    f_namemax // maximum filename length
                    */
                    var stats = {
                      f_bsize: undefined,
                      f_frsize: undefined,
                      f_blocks: undefined,
                      f_bfree: undefined,
                      f_bavail: undefined,
                      f_files: undefined,
                      f_ffree: undefined,
                      f_favail: undefined,
                      f_sid: undefined,
                      f_flag: undefined,
                      f_namemax: undefined
                    };
                    stats.f_bsize = readUInt64BE(buffer, 4, this, callback);
                    if (stats.f_bsize === false)
                      return;
                    stats.f_frsize = readUInt64BE(buffer, 12, this, callback);
                    if (stats.f_frsize === false)
                      return;
                    stats.f_blocks = readUInt64BE(buffer, 20, this, callback);
                    if (stats.f_blocks === false)
                      return;
                    stats.f_bfree = readUInt64BE(buffer, 28, this, callback);
                    if (stats.f_bfree === false)
                      return;
                    stats.f_bavail = readUInt64BE(buffer, 36, this, callback);
                    if (stats.f_bavail === false)
                      return;
                    stats.f_files = readUInt64BE(buffer, 44, this, callback);
                    if (stats.f_files === false)
                      return;
                    stats.f_ffree = readUInt64BE(buffer, 52, this, callback);
                    if (stats.f_ffree === false)
                      return;
                    stats.f_favail = readUInt64BE(buffer, 60, this, callback);
                    if (stats.f_favail === false)
                      return;
                    stats.f_sid = readUInt64BE(buffer, 68, this, callback);
                    if (stats.f_sid === false)
                      return;
                    stats.f_flag = readUInt64BE(buffer, 76, this, callback);
                    if (stats.f_flag === false)
                      return;
                    stats.f_namemax = readUInt64BE(buffer, 84, this, callback);
                    if (stats.f_namemax === false)
                      return;
                    cb(undefined, stats);
                  break;
                }
              }
              // XXX: at least provide the raw buffer data to the callback in
              // case of unexpected extended response?
              cb();
            }
          }
          if (req)
            delete requests[id];
        } else {
          // server
          var evName = REQUEST[pktType];
          var offset;
          var path;

          debug('DEBUG[SFTP]: Parser: Request: ' + evName);
          if (listenerCount(this, evName)) {
            if (pktType === REQUEST.OPEN) {
              /*
                string        filename
                uint32        pflags
                ATTRS         attrs
              */
              filename = readString(buffer, 4, 'utf8', this, callback);
              if (filename === false)
                return;
              var pflags = readInt(buffer, buffer._pos, this, callback);
              if (pflags === false)
                return;
              attrs = readAttrs(buffer, buffer._pos + 4, this, callback);
              if (attrs === false)
                return;
              this.emit(evName, id, filename, pflags, attrs);
            } else if (pktType === REQUEST.CLOSE
                       || pktType === REQUEST.FSTAT
                       || pktType === REQUEST.READDIR) {
              /*
                string     handle
              */
              handle = readString(buffer, 4, this, callback);
              if (handle === false)
                return;
              this.emit(evName, id, handle);
            } else if (pktType === REQUEST.READ) {
              /*
                string     handle
                uint64     offset
                uint32     len
              */
              handle = readString(buffer, 4, this, callback);
              if (handle === false)
                return;
              offset = readUInt64BE(buffer, buffer._pos, this, callback);
              if (offset === false)
                return;
              var len = readInt(buffer, buffer._pos, this, callback);
              if (len === false)
                return;
              this.emit(evName, id, handle, offset, len);
            } else if (pktType === REQUEST.WRITE) {
              /*
                string     handle
                uint64     offset
                string     data
              */
              handle = readString(buffer, 4, this, callback);
              if (handle === false)
                return;
              offset = readUInt64BE(buffer, buffer._pos, this, callback);
              if (offset === false)
                return;
              data = readString(buffer, buffer._pos, this, callback);
              if (data === false)
                return;
              this.emit(evName, id, handle, offset, data);
            } else if (pktType === REQUEST.LSTAT
                       || pktType === REQUEST.STAT
                       || pktType === REQUEST.OPENDIR
                       || pktType === REQUEST.REMOVE
                       || pktType === REQUEST.RMDIR
                       || pktType === REQUEST.REALPATH
                       || pktType === REQUEST.READLINK) {
              /*
                string     path
              */
              path = readString(buffer, 4, 'utf8', this, callback);
              if (path === false)
                return;
              this.emit(evName, id, path);
            } else if (pktType === REQUEST.SETSTAT
                       || pktType === REQUEST.MKDIR) {
              /*
                string     path
                ATTRS      attrs
              */
              path = readString(buffer, 4, 'utf8', this, callback);
              if (path === false)
                return;
              attrs = readAttrs(buffer, buffer._pos, this, callback);
              if (attrs === false)
                return;
              this.emit(evName, id, path, attrs);
            } else if (pktType === REQUEST.FSETSTAT) {
              /*
                string     handle
                ATTRS      attrs
              */
              handle = readString(buffer, 4, this, callback);
              if (handle === false)
                return;
              attrs = readAttrs(buffer, buffer._pos, this, callback);
              if (attrs === false)
                return;
              this.emit(evName, id, handle, attrs);
            } else if (pktType === REQUEST.RENAME
                       || pktType === REQUEST.SYMLINK) {
              /*
                RENAME:
                  string     oldpath
                  string     newpath
                SYMLINK:
                  string     linkpath
                  string     targetpath
              */
              var str1;
              var str2;
              str1 = readString(buffer, 4, 'utf8', this, callback);
              if (str1 === false)
                return;
              str2 = readString(buffer, buffer._pos, 'utf8', this, callback);
              if (str2 === false)
                return;
              if (pktType === REQUEST.SYMLINK && this._isOpenSSH) {
                // OpenSSH has linkpath and targetpath positions switched
                this.emit(evName, id, str2, str1);
              } else
                this.emit(evName, id, str1, str2);
            }
          } else {
            // automatically reject request if no handler for request type
            this.status(id, STATUS_CODE.OP_UNSUPPORTED);
          }
        }
      }

      // prepare for next packet
      status = 'packet_header';
      buffer = pktBuf = undefined;
    } else if (status === 'bad_pkt') {
      if (server && buffer[4] !== REQUEST.INIT) {
        var errCode = (buffer[4] === REQUEST.EXTENDED
                       ? STATUS_CODE.OP_UNSUPPORTED
                       : STATUS_CODE.FAILURE);

        // no request id for init/version packets, so we have no way to send a
        // status response, so we just close up shop ...
        if (buffer[4] === REQUEST.INIT || buffer[4] === RESPONSE.VERSION)
          return this._cleanup(callback);

        id = readInt(buffer, 5, this, callback);
        if (id === false)
          return;
        this.status(id, errCode);
      }

      // by this point we have already read the type byte and the id bytes, so
      // we subtract those from the number of bytes to skip
      pktLeft = readUInt32BE(buffer, 0) - 5;

      status = 'discard';
    }

    if (chunkPos >= chunkLen)
      break;
  }

  state.status = status;
  state.pktType = pktType;
  state.pktBuf = pktBuf;
  state.pktLeft = pktLeft;
  state.version = version;

  callback();
};

// client
SFTPStream.prototype.createReadStream = function(path, options) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  return new ReadStream(this, path, options);
};
SFTPStream.prototype.createWriteStream = function(path, options) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  return new WriteStream(this, path, options);
};
SFTPStream.prototype.open = function(path, flags_, attrs, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  if (typeof attrs === 'function') {
    cb = attrs;
    attrs = undefined;
  }

  var flags = (typeof flags_ === 'number' ? flags_ : stringToFlags(flags_));
  if (flags === null)
    throw new Error('Unknown flags string: ' + flags_);

  var attrFlags = 0;
  var attrBytes = 0;
  if (typeof attrs === 'string' || typeof attrs === 'number') {
    attrs = { mode: attrs };
  }
  if (typeof attrs === 'object' && attrs !== null) {
    attrs = attrsToBytes(attrs);
    attrFlags = attrs.flags;
    attrBytes = attrs.nbytes;
    attrs = attrs.bytes;
  }

  /*
    uint32        id
    string        filename
    uint32        pflags
    ATTRS         attrs
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen + 4 + 4 + attrBytes);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.OPEN;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');
  writeUInt32BE(buf, flags, p += pathlen);
  writeUInt32BE(buf, attrFlags, p += 4);
  if (attrs && attrFlags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }
  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing OPEN');
  return this.push(buf);
};
SFTPStream.prototype.close = function(handle, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  var state = this._state;

  /*
    uint32     id
    string     handle
  */
  var handlelen = handle.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.CLOSE;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, handlelen, p);
  handle.copy(buf, p += 4);

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing CLOSE');
  return this.push(buf);
};
SFTPStream.prototype.readData = function(handle, buf, off, len, position, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');
  else if (!Buffer.isBuffer(buf))
    throw new Error('buffer is not a Buffer');
  else if (off >= buf.length)
    throw new Error('offset is out of bounds');
  else if (off + len > buf.length)
    throw new Error('length extends beyond buffer');
  else if (position === null)
    throw new Error('null position currently unsupported');

  var state = this._state;

  /*
    uint32     id
    string     handle
    uint64     offset
    uint32     len
  */
  var handlelen = handle.length;
  var p = 9;
  var pos = position;
  var out = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen + 8 + 4);

  writeUInt32BE(out, out.length - 4, 0);
  out[4] = REQUEST.READ;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(out, reqid, 5);

  writeUInt32BE(out, handlelen, p);
  handle.copy(out, p += 4);
  p += handlelen;
  for (var i = 7; i >= 0; --i) {
    out[p + i] = pos & 0xFF;
    pos /= 256;
  }
  writeUInt32BE(out, len, p += 8);

  state.requests[reqid] = {
    cb: function(err, data, nb) {
      if (err) {
        if (cb._wantEOFError || err.code !== STATUS_CODE.EOF)
          return cb(err);
      } else if (nb > len) {
        return cb(new Error('Received more data than requested'));
      }
      cb(undefined, nb || 0, data, position);
    },
    buffer: buf.slice(off, off + len)
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing READ');
  return this.push(out);
};
SFTPStream.prototype.writeData = function(handle, buf, off, len, position, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');
  else if (!Buffer.isBuffer(buf))
    throw new Error('buffer is not a Buffer');
  else if (off > buf.length)
    throw new Error('offset is out of bounds');
  else if (off + len > buf.length)
    throw new Error('length extends beyond buffer');
  else if (position === null)
    throw new Error('null position currently unsupported');

  var self = this;
  var state = this._state;

  if (!len) {
    cb && process.nextTick(function() { cb(undefined, 0); });
    return;
  }

  var overflow = (len > state.maxDataLen
                  ? len - state.maxDataLen
                  : 0);
  var origPosition = position;

  if (overflow)
    len = state.maxDataLen;

  /*
    uint32     id
    string     handle
    uint64     offset
    string     data
  */
  var handlelen = handle.length;
  var p = 9;
  var out = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen + 8 + 4 + len);

  writeUInt32BE(out, out.length - 4, 0);
  out[4] = REQUEST.WRITE;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(out, reqid, 5);

  writeUInt32BE(out, handlelen, p);
  handle.copy(out, p += 4);
  p += handlelen;
  for (var i = 7; i >= 0; --i) {
    out[p + i] = position & 0xFF;
    position /= 256;
  }
  writeUInt32BE(out, len, p += 8);
  buf.copy(out, p += 4, off, off + len);

  state.requests[reqid] = {
    cb: function(err) {
      if (err)
        cb && cb(err);
      else if (overflow) {
        self.writeData(handle,
                       buf,
                       off + len,
                       overflow,
                       origPosition + len,
                       cb);
      } else
        cb && cb(undefined, off + len);
    }
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing WRITE');
  return this.push(out);
};
function tryCreateBuffer(size) {
  try {
    return Buffer.allocUnsafe(size);
  } catch (ex) {
    return ex;
  }
}
function fastXfer(src, dst, srcPath, dstPath, opts, cb) {
  var concurrency = 64;
  var chunkSize = 32768;
  //var preserve = false;
  var onstep;
  var mode;
  var fileSize;

  if (typeof opts === 'function') {
    cb = opts;
  } else if (typeof opts === 'object' && opts !== null) {
    if (typeof opts.concurrency === 'number'
        && opts.concurrency > 0
        && !isNaN(opts.concurrency))
      concurrency = opts.concurrency;
    if (typeof opts.chunkSize === 'number'
        && opts.chunkSize > 0
        && !isNaN(opts.chunkSize))
      chunkSize = opts.chunkSize;
    if (typeof opts.fileSize === 'number'
        && opts.fileSize > 0
        && !isNaN(opts.fileSize))
      fileSize = opts.fileSize;
    if (typeof opts.step === 'function')
      onstep = opts.step;
    //preserve = (opts.preserve ? true : false);
    if (typeof opts.mode === 'string' || typeof opts.mode === 'number')
      mode = modeNum(opts.mode);
  }

  // internal state variables
  var fsize;
  var pdst = 0;
  var total = 0;
  var hadError = false;
  var srcHandle;
  var dstHandle;
  var readbuf;
  var bufsize = chunkSize * concurrency;

  function onerror(err) {
    if (hadError)
      return;

    hadError = true;

    var left = 0;
    var cbfinal;

    if (srcHandle || dstHandle) {
      cbfinal = function() {
        if (--left === 0)
          cb(err);
      };
      if (srcHandle && (src === fs || src.writable))
        ++left;
      if (dstHandle && (dst === fs || dst.writable))
        ++left;
      if (srcHandle && (src === fs || src.writable))
        src.close(srcHandle, cbfinal);
      if (dstHandle && (dst === fs || dst.writable))
        dst.close(dstHandle, cbfinal);
    } else
      cb(err);
  }

  src.open(srcPath, 'r', function(err, sourceHandle) {
    if (err)
      return onerror(err);

    srcHandle = sourceHandle;

    if (fileSize === undefined)
      src.fstat(srcHandle, tryStat);
    else
      tryStat(null, { size: fileSize });

    function tryStat(err, attrs) {
      if (err) {
        if (src !== fs) {
          // Try stat() for sftp servers that may not support fstat() for
          // whatever reason
          src.stat(srcPath, function(err_, attrs_) {
            if (err_)
              return onerror(err);
            tryStat(null, attrs_);
          });
          return;
        }
        return onerror(err);
      }
      fsize = attrs.size;

      dst.open(dstPath, 'w', function(err, destHandle) {
        if (err)
          return onerror(err);

        dstHandle = destHandle;

        if (fsize <= 0)
          return onerror();

        // Use less memory where possible
        while (bufsize > fsize) {
          if (concurrency === 1) {
            bufsize = fsize;
            break;
          }
          bufsize -= chunkSize;
          --concurrency;
        }

        readbuf = tryCreateBuffer(bufsize);
        if (readbuf instanceof Error)
          return onerror(readbuf);

        if (mode !== undefined) {
          dst.fchmod(dstHandle, mode, function tryAgain(err) {
            if (err) {
              // Try chmod() for sftp servers that may not support fchmod() for
              // whatever reason
              dst.chmod(dstPath, mode, function(err_) {
                tryAgain();
              });
              return;
            }
            startReads();
          });
        } else {
          startReads();
        }

        function onread(err, nb, data, dstpos, datapos, origChunkLen) {
          if (err)
            return onerror(err);

          datapos = datapos || 0;

          if (src === fs)
            dst.writeData(dstHandle, readbuf, datapos, nb, dstpos, writeCb);
          else
            dst.write(dstHandle, readbuf, datapos, nb, dstpos, writeCb);

          function writeCb(err) {
            if (err)
              return onerror(err);

            total += nb;
            onstep && onstep(total, nb, fsize);

            if (nb < origChunkLen)
              return singleRead(datapos, dstpos + nb, origChunkLen - nb);

            if (total === fsize) {
              dst.close(dstHandle, function(err) {
                dstHandle = undefined;
                if (err)
                  return onerror(err);
                src.close(srcHandle, function(err) {
                  srcHandle = undefined;
                  if (err)
                    return onerror(err);
                  cb();
                });
              });
              return;
            }

            if (pdst >= fsize)
              return;

            var chunk = (pdst + chunkSize > fsize ? fsize - pdst : chunkSize);
            singleRead(datapos, pdst, chunk);
            pdst += chunk;
          }
        }

        function makeCb(psrc, pdst, chunk) {
          return function(err, nb, data) {
            onread(err, nb, data, pdst, psrc, chunk);
          };
        }

        function singleRead(psrc, pdst, chunk) {
          if (src === fs) {
            src.read(srcHandle,
                     readbuf,
                     psrc,
                     chunk,
                     pdst,
                     makeCb(psrc, pdst, chunk));
          } else {
            src.readData(srcHandle,
                         readbuf,
                         psrc,
                         chunk,
                         pdst,
                         makeCb(psrc, pdst, chunk));
          }
        }

        function startReads() {
          var reads = 0;
          var psrc = 0;
          while (pdst < fsize && reads < concurrency) {
            var chunk = (pdst + chunkSize > fsize ? fsize - pdst : chunkSize);
            singleRead(psrc, pdst, chunk);
            psrc += chunk;
            pdst += chunk;
            ++reads;
          }
        }
      });
    }
  });
}
SFTPStream.prototype.fastGet = function(remotePath, localPath, opts, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  fastXfer(this, fs, remotePath, localPath, opts, cb);
};
SFTPStream.prototype.fastPut = function(localPath, remotePath, opts, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  fastXfer(fs, this, localPath, remotePath, opts, cb);
};
SFTPStream.prototype.readFile = function(path, options, callback_) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var callback;
  if (typeof callback_ === 'function') {
    callback = callback_;
  } else if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  var self = this;

  if (typeof options === 'string')
    options = { encoding: options, flag: 'r' };
  else if (!options)
    options = { encoding: null, flag: 'r' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  var encoding = options.encoding;
  if (encoding && !Buffer.isEncoding(encoding))
    throw new Error('Unknown encoding: ' + encoding);

  // first, stat the file, so we know the size.
  var size;
  var buffer; // single buffer with file data
  var buffers; // list for when size is unknown
  var pos = 0;
  var handle;

  // SFTPv3 does not support using -1 for read position, so we have to track
  // read position manually
  var bytesRead = 0;

  var flag = options.flag || 'r';
  this.open(path, flag, 438 /*=0666*/, function(er, handle_) {
    if (er)
      return callback && callback(er);
    handle = handle_;

    self.fstat(handle, function tryStat(er, st) {
      if (er) {
        // Try stat() for sftp servers that may not support fstat() for
        // whatever reason
        self.stat(path, function(er_, st_) {
          if (er_) {
            return self.close(handle, function() {
              callback && callback(er);
            });
          }
          tryStat(null, st_);
        });
        return;
      }

      size = st.size || 0;
      if (size === 0) {
        // the kernel lies about many files.
        // Go ahead and try to read some bytes.
        buffers = [];
        return read();
      }

      buffer = Buffer.allocUnsafe(size);
      read();
    });
  });

  function read() {
    if (size === 0) {
      buffer = Buffer.allocUnsafe(8192);
      self.readData(handle, buffer, 0, 8192, bytesRead, afterRead);
    } else {
      self.readData(handle, buffer, pos, size - pos, bytesRead, afterRead);
    }
  }

  function afterRead(er, nbytes) {
    var eof;
    if (er) {
      eof = (er.code === STATUS_CODE.EOF);
      if (!eof) {
        return self.close(handle, function() {
          return callback && callback(er);
        });
      }
    } else {
      eof = false;
    }

    if (eof || (size === 0 && nbytes === 0))
      return close();

    bytesRead += nbytes;
    pos += nbytes;
    if (size !== 0) {
      if (pos === size)
        close();
      else
        read();
    } else {
      // unknown size, just read until we don't get bytes.
      buffers.push(buffer.slice(0, nbytes));
      read();
    }
  }
  afterRead._wantEOFError = true;

  function close() {
    self.close(handle, function(er) {
      if (size === 0) {
        // collected the data into the buffers list.
        buffer = Buffer.concat(buffers, pos);
      } else if (pos < size) {
        buffer = buffer.slice(0, pos);
      }

      if (encoding)
        buffer = buffer.toString(encoding);
      return callback && callback(er, buffer);
    });
  }
};
function writeAll(self, handle, buffer, offset, length, position, callback_) {
  var callback = (typeof callback_ === 'function' ? callback_ : undefined);

  self.writeData(handle,
                 buffer,
                 offset,
                 length,
                 position,
                 function(writeErr, written) {
    if (writeErr) {
      return self.close(handle, function() {
        callback && callback(writeErr);
      });
    }
    if (written === length)
      self.close(handle, callback);
    else {
      offset += written;
      length -= written;
      position += written;
      writeAll(self, handle, buffer, offset, length, position, callback);
    }
  });
}
SFTPStream.prototype.writeFile = function(path, data, options, callback_) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var callback;
  if (typeof callback_ === 'function') {
    callback = callback_;
  } else if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  var self = this;

  if (typeof options === 'string')
    options = { encoding: options, mode: 438, flag: 'w' };
  else if (!options)
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  if (options.encoding && !Buffer.isEncoding(options.encoding))
    throw new Error('Unknown encoding: ' + options.encoding);

  var flag = options.flag || 'w';
  this.open(path, flag, options.mode, function(openErr, handle) {
    if (openErr)
      callback && callback(openErr);
    else {
      var buffer = (Buffer.isBuffer(data)
                    ? data
                    : Buffer.from('' + data, options.encoding || 'utf8'));
      var position = (/a/.test(flag) ? null : 0);

      // SFTPv3 does not support the notion of 'current position'
      // (null position), so we just attempt to append to the end of the file
      // instead
      if (position === null) {
        self.fstat(handle, function tryStat(er, st) {
          if (er) {
            // Try stat() for sftp servers that may not support fstat() for
            // whatever reason
            self.stat(path, function(er_, st_) {
              if (er_) {
                return self.close(handle, function() {
                  callback && callback(er);
                });
              }
              tryStat(null, st_);
            });
            return;
          }
          writeAll(self, handle, buffer, 0, buffer.length, st.size, callback);
        });
        return;
      }
      writeAll(self, handle, buffer, 0, buffer.length, position, callback);
    }
  });
};
SFTPStream.prototype.appendFile = function(path, data, options, callback_) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var callback;
  if (typeof callback_ === 'function') {
    callback = callback_;
  } else if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (typeof options === 'string')
    options = { encoding: options, mode: 438, flag: 'a' };
  else if (!options)
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'a' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  if (!options.flag)
    options = util._extend({ flag: 'a' }, options);
  this.writeFile(path, data, options, callback);
};
SFTPStream.prototype.exists = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  this.stat(path, function(err) {
    cb && cb(err ? false : true);
  });
};
SFTPStream.prototype.unlink = function(filename, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     filename
  */
  var fnamelen = Buffer.byteLength(filename);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + fnamelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.REMOVE;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, fnamelen, p);
  buf.write(filename, p += 4, fnamelen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing REMOVE');
  return this.push(buf);
};
SFTPStream.prototype.rename = function(oldPath, newPath, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     oldpath
    string     newpath
  */
  var oldlen = Buffer.byteLength(oldPath);
  var newlen = Buffer.byteLength(newPath);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + oldlen + 4 + newlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.RENAME;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, oldlen, p);
  buf.write(oldPath, p += 4, oldlen, 'utf8');
  writeUInt32BE(buf, newlen, p += oldlen);
  buf.write(newPath, p += 4, newlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing RENAME');
  return this.push(buf);
};
SFTPStream.prototype.mkdir = function(path, attrs, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var flags = 0;
  var attrBytes = 0;
  var state = this._state;

  if (typeof attrs === 'function') {
    cb = attrs;
    attrs = undefined;
  }
  if (typeof attrs === 'object' && attrs !== null) {
    attrs = attrsToBytes(attrs);
    flags = attrs.flags;
    attrBytes = attrs.nbytes;
    attrs = attrs.bytes;
  }

  /*
    uint32     id
    string     path
    ATTRS      attrs
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen + 4 + attrBytes);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.MKDIR;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');
  writeUInt32BE(buf, flags, p += pathlen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing MKDIR');
  return this.push(buf);
};
SFTPStream.prototype.rmdir = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.RMDIR;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing RMDIR');
  return this.push(buf);
};
SFTPStream.prototype.readdir = function(where, opts, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;
  var doFilter;

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  if (typeof opts !== 'object' || opts === null)
    opts = {};

  doFilter = (opts && opts.full ? false : true);

  if (!Buffer.isBuffer(where) && typeof where !== 'string')
    throw new Error('missing directory handle or path');

  if (typeof where === 'string') {
    var self = this;
    var entries = [];
    var e = 0;

    return this.opendir(where, function reread(err, handle) {
      if (err)
        return cb(err);

      self.readdir(handle, opts, function(err, list) {
        var eof = (err && err.code === STATUS_CODE.EOF);

        if (err && !eof) {
          return self.close(handle, function() {
            cb(err);
          });
        } else if (eof) {
          return self.close(handle, function(err) {
            if (err)
              return cb(err);
            cb(undefined, entries);
          });
        }

        for (var i = 0, len = list.length; i < len; ++i, ++e)
          entries[e] = list[i];

        reread(undefined, handle);
      });
    });
  }

  /*
    uint32     id
    string     handle
  */
  var handlelen = where.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.READDIR;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, handlelen, p);
  where.copy(buf, p += 4);

  state.requests[reqid] = {
    cb: (doFilter
         ? function(err, list) {
             if (err)
               return cb(err);

             for (var i = list.length - 1; i >= 0; --i) {
               if (list[i].filename === '.' || list[i].filename === '..')
                 list.splice(i, 1);
             }

             cb(undefined, list);
           }
         : cb)
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing READDIR');
  return this.push(buf);
};
SFTPStream.prototype.fstat = function(handle, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  var state = this._state;

  /*
    uint32     id
    string     handle
  */
  var handlelen = handle.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.FSTAT;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, handlelen, p);
  handle.copy(buf, p += 4);

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing FSTAT');
  return this.push(buf);
};
SFTPStream.prototype.stat = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.STAT;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing STAT');
  return this.push(buf);
};
SFTPStream.prototype.lstat = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.LSTAT;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing LSTAT');
  return this.push(buf);
};
SFTPStream.prototype.opendir = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.OPENDIR;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing OPENDIR');
  return this.push(buf);
};
SFTPStream.prototype.setstat = function(path, attrs, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var flags = 0;
  var attrBytes = 0;
  var state = this._state;

  if (typeof attrs === 'object' && attrs !== null) {
    attrs = attrsToBytes(attrs);
    flags = attrs.flags;
    attrBytes = attrs.nbytes;
    attrs = attrs.bytes;
  } else if (typeof attrs === 'function')
    cb = attrs;

  /*
    uint32     id
    string     path
    ATTRS      attrs
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen + 4 + attrBytes);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.SETSTAT;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');
  writeUInt32BE(buf, flags, p += pathlen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing SETSTAT');
  return this.push(buf);
};
SFTPStream.prototype.fsetstat = function(handle, attrs, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  var flags = 0;
  var attrBytes = 0;
  var state = this._state;

  if (typeof attrs === 'object' && attrs !== null) {
    attrs = attrsToBytes(attrs);
    flags = attrs.flags;
    attrBytes = attrs.nbytes;
    attrs = attrs.bytes;
  } else if (typeof attrs === 'function')
    cb = attrs;

  /*
    uint32     id
    string     handle
    ATTRS      attrs
  */
  var handlelen = handle.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handlelen + 4 + attrBytes);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.FSETSTAT;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, handlelen, p);
  handle.copy(buf, p += 4);
  writeUInt32BE(buf, flags, p += handlelen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing FSETSTAT');
  return this.push(buf);
};
SFTPStream.prototype.futimes = function(handle, atime, mtime, cb) {
  return this.fsetstat(handle, {
    atime: toUnixTimestamp(atime),
    mtime: toUnixTimestamp(mtime)
  }, cb);
};
SFTPStream.prototype.utimes = function(path, atime, mtime, cb) {
  return this.setstat(path, {
    atime: toUnixTimestamp(atime),
    mtime: toUnixTimestamp(mtime)
  }, cb);
};
SFTPStream.prototype.fchown = function(handle, uid, gid, cb) {
  return this.fsetstat(handle, {
    uid: uid,
    gid: gid
  }, cb);
};
SFTPStream.prototype.chown = function(path, uid, gid, cb) {
  return this.setstat(path, {
    uid: uid,
    gid: gid
  }, cb);
};
SFTPStream.prototype.fchmod = function(handle, mode, cb) {
  return this.fsetstat(handle, {
    mode: mode
  }, cb);
};
SFTPStream.prototype.chmod = function(path, mode, cb) {
  return this.setstat(path, {
    mode: mode
  }, cb);
};
SFTPStream.prototype.readlink = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.READLINK;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = {
    cb: function(err, names) {
      if (err)
        return cb(err);
      else if (!names || !names.length)
        return cb(new Error('Response missing link info'));
      cb(undefined, names[0].filename);
    }
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing READLINK');
  return this.push(buf);
};
SFTPStream.prototype.symlink = function(targetPath, linkPath, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     linkpath
    string     targetpath
  */
  var linklen = Buffer.byteLength(linkPath);
  var targetlen = Buffer.byteLength(targetPath);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + linklen + 4 + targetlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.SYMLINK;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  if (this._isOpenSSH) {
    // OpenSSH has linkpath and targetpath positions switched
    writeUInt32BE(buf, targetlen, p);
    buf.write(targetPath, p += 4, targetlen, 'utf8');
    writeUInt32BE(buf, linklen, p += targetlen);
    buf.write(linkPath, p += 4, linklen, 'utf8');
  } else {
    writeUInt32BE(buf, linklen, p);
    buf.write(linkPath, p += 4, linklen, 'utf8');
    writeUInt32BE(buf, targetlen, p += linklen);
    buf.write(targetPath, p += 4, targetlen, 'utf8');
  }

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing SYMLINK');
  return this.push(buf);
};
SFTPStream.prototype.realpath = function(path, cb) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var state = this._state;

  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.REALPATH;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);

  writeUInt32BE(buf, pathlen, p);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = {
    cb: function(err, names) {
      if (err)
        return cb(err);
      else if (!names || !names.length)
        return cb(new Error('Response missing path info'));
      cb(undefined, names[0].filename);
    }
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing REALPATH');
  return this.push(buf);
};
// extended requests
SFTPStream.prototype.ext_openssh_rename = function(oldPath, newPath, cb) {
  var state = this._state;

  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!state.extensions['posix-rename@openssh.com']
           || state.extensions['posix-rename@openssh.com'].indexOf('1') === -1)
    throw new Error('Server does not support this extended request');

  /*
    uint32    id
    string    "posix-rename@openssh.com"
    string    oldpath
    string    newpath
  */
  var oldlen = Buffer.byteLength(oldPath);
  var newlen = Buffer.byteLength(newPath);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 24 + 4 + oldlen + 4 + newlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.EXTENDED;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);
  writeUInt32BE(buf, 24, p);
  buf.write('posix-rename@openssh.com', p += 4, 24, 'ascii');

  writeUInt32BE(buf, oldlen, p += 24);
  buf.write(oldPath, p += 4, oldlen, 'utf8');
  writeUInt32BE(buf, newlen, p += oldlen);
  buf.write(newPath, p += 4, newlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing posix-rename@openssh.com');
  return this.push(buf);
};
SFTPStream.prototype.ext_openssh_statvfs = function(path, cb) {
  var state = this._state;

  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!state.extensions['statvfs@openssh.com']
           || state.extensions['statvfs@openssh.com'].indexOf('2') === -1)
    throw new Error('Server does not support this extended request');

  /*
    uint32    id
    string    "statvfs@openssh.com"
    string    path
  */
  var pathlen = Buffer.byteLength(path);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 19 + 4 + pathlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.EXTENDED;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);
  writeUInt32BE(buf, 19, p);
  buf.write('statvfs@openssh.com', p += 4, 19, 'ascii');

  writeUInt32BE(buf, pathlen, p += 19);
  buf.write(path, p += 4, pathlen, 'utf8');

  state.requests[reqid] = {
    extended: 'statvfs@openssh.com',
    cb: cb
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing statvfs@openssh.com');
  return this.push(buf);
};
SFTPStream.prototype.ext_openssh_fstatvfs = function(handle, cb) {
  var state = this._state;

  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!state.extensions['fstatvfs@openssh.com']
           || state.extensions['fstatvfs@openssh.com'].indexOf('2') === -1)
    throw new Error('Server does not support this extended request');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  /*
    uint32    id
    string    "fstatvfs@openssh.com"
    string    handle
  */
  var handlelen = handle.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 20 + 4 + handlelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.EXTENDED;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);
  writeUInt32BE(buf, 20, p);
  buf.write('fstatvfs@openssh.com', p += 4, 20, 'ascii');

  writeUInt32BE(buf, handlelen, p += 20);
  buf.write(handle, p += 4, handlelen, 'utf8');

  state.requests[reqid] = {
    extended: 'fstatvfs@openssh.com',
    cb: cb
  };

  this.debug('DEBUG[SFTP]: Outgoing: Writing fstatvfs@openssh.com');
  return this.push(buf);
};
SFTPStream.prototype.ext_openssh_hardlink = function(oldPath, newPath, cb) {
  var state = this._state;

  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!state.extensions['hardlink@openssh.com']
           || state.extensions['hardlink@openssh.com'].indexOf('1') === -1)
    throw new Error('Server does not support this extended request');

  /*
    uint32    id
    string    "hardlink@openssh.com"
    string    oldpath
    string    newpath
  */
  var oldlen = Buffer.byteLength(oldPath);
  var newlen = Buffer.byteLength(newPath);
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 20 + 4 + oldlen + 4 + newlen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.EXTENDED;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);
  writeUInt32BE(buf, 20, p);
  buf.write('hardlink@openssh.com', p += 4, 20, 'ascii');

  writeUInt32BE(buf, oldlen, p += 20);
  buf.write(oldPath, p += 4, oldlen, 'utf8');
  writeUInt32BE(buf, newlen, p += oldlen);
  buf.write(newPath, p += 4, newlen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing hardlink@openssh.com');
  return this.push(buf);
};
SFTPStream.prototype.ext_openssh_fsync = function(handle, cb) {
  var state = this._state;

  if (this.server)
    throw new Error('Client-only method called in server mode');
  else if (!state.extensions['fsync@openssh.com']
           || state.extensions['fsync@openssh.com'].indexOf('1') === -1)
    throw new Error('Server does not support this extended request');
  else if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  /*
    uint32    id
    string    "fsync@openssh.com"
    string    handle
  */
  var handlelen = handle.length;
  var p = 9;
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 17 + 4 + handlelen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = REQUEST.EXTENDED;
  var reqid = state.writeReqid = (state.writeReqid + 1) % MAX_REQID;
  writeUInt32BE(buf, reqid, 5);
  writeUInt32BE(buf, 17, p);
  buf.write('fsync@openssh.com', p += 4, 17, 'ascii');

  writeUInt32BE(buf, handlelen, p += 17);
  buf.write(handle, p += 4, handlelen, 'utf8');

  state.requests[reqid] = { cb: cb };

  this.debug('DEBUG[SFTP]: Outgoing: Writing fsync@openssh.com');
  return this.push(buf);
};

// server
SFTPStream.prototype.status = function(id, code, message, lang) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  if (!STATUS_CODE[code] || typeof code !== 'number')
    throw new Error('Bad status code: ' + code);

  message || (message = '');
  lang || (lang = '');

  var msgLen = Buffer.byteLength(message);
  var langLen = Buffer.byteLength(lang);
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + 4 + msgLen + 4 + langLen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = RESPONSE.STATUS;
  writeUInt32BE(buf, id, 5);

  writeUInt32BE(buf, code, 9);

  writeUInt32BE(buf, msgLen, 13);
  if (msgLen)
    buf.write(message, 17, msgLen, 'utf8');

  writeUInt32BE(buf, langLen, 17 + msgLen);
  if (langLen)
    buf.write(lang, 17 + msgLen + 4, langLen, 'ascii');

  this.debug('DEBUG[SFTP]: Outgoing: Writing STATUS');
  return this.push(buf);
};
SFTPStream.prototype.handle = function(id, handle) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  var handleLen = handle.length;

  if (handleLen > 256)
    throw new Error('handle too large (> 256 bytes)');

  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + handleLen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = RESPONSE.HANDLE;
  writeUInt32BE(buf, id, 5);

  writeUInt32BE(buf, handleLen, 9);
  if (handleLen)
    handle.copy(buf, 13);

  this.debug('DEBUG[SFTP]: Outgoing: Writing HANDLE');
  return this.push(buf);
};
SFTPStream.prototype.data = function(id, data, encoding) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var isBuffer = Buffer.isBuffer(data);

  if (!isBuffer && typeof data !== 'string')
    throw new Error('data is not a Buffer or string');

  if (!isBuffer)
    encoding || (encoding = 'utf8');

  var dataLen = (isBuffer ? data.length : Buffer.byteLength(data, encoding));
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + dataLen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = RESPONSE.DATA;
  writeUInt32BE(buf, id, 5);

  writeUInt32BE(buf, dataLen, 9);
  if (dataLen) {
    if (isBuffer)
      data.copy(buf, 13);
    else
      buf.write(data, 13, dataLen, encoding);
  }

  this.debug('DEBUG[SFTP]: Outgoing: Writing DATA');
  return this.push(buf);
};
SFTPStream.prototype.name = function(id, names) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  if (!Array.isArray(names)) {
    if (typeof names !== 'object' || names === null)
      throw new Error('names is not an object or array');
    names = [ names ];
  }

  var count = names.length;
  var namesLen = 0;
  var nameAttrs;
  var attrs = [];
  var name;
  var filename;
  var longname;
  var attr;
  var len;
  var len2;
  var buf;
  var p;
  var i;
  var j;
  var k;

  for (i = 0; i < count; ++i) {
    name = names[i];
    filename = (!name || !name.filename || typeof name.filename !== 'string'
                ? ''
                : name.filename);
    namesLen += 4 + Buffer.byteLength(filename);
    longname = (!name || !name.longname || typeof name.longname !== 'string'
                ? ''
                : name.longname);
    namesLen += 4 + Buffer.byteLength(longname);

    if (typeof name.attrs === 'object' && name.attrs !== null) {
      nameAttrs = attrsToBytes(name.attrs);
      namesLen += 4 + nameAttrs.nbytes;
      attrs.push(nameAttrs);
    } else {
      namesLen += 4;
      attrs.push(null);
    }
  }

  buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + namesLen);

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = RESPONSE.NAME;
  writeUInt32BE(buf, id, 5);

  writeUInt32BE(buf, count, 9);

  p = 13;

  for (i = 0; i < count; ++i) {
    name = names[i];

    filename = (!name || !name.filename || typeof name.filename !== 'string'
                ? ''
                : name.filename);
    len = Buffer.byteLength(filename);
    writeUInt32BE(buf, len, p);
    p += 4;
    if (len) {
      buf.write(filename, p, len, 'utf8');
      p += len;
    }

    longname = (!name || !name.longname || typeof name.longname !== 'string'
                ? ''
                : name.longname);
    len = Buffer.byteLength(longname);
    writeUInt32BE(buf, len, p);
    p += 4;
    if (len) {
      buf.write(longname, p, len, 'utf8');
      p += len;
    }

    attr = attrs[i];
    if (attr) {
      writeUInt32BE(buf, attr.flags, p);
      p += 4;
      if (attr.flags && attr.bytes) {
        var bytes = attr.bytes;
        for (j = 0, len = bytes.length; j < len; ++j)
          for (k = 0, len2 = bytes[j].length; k < len2; ++k)
            buf[p++] = bytes[j][k];
      }
    } else {
      writeUInt32BE(buf, 0, p);
      p += 4;
    }
  }

  this.debug('DEBUG[SFTP]: Outgoing: Writing NAME');
  return this.push(buf);
};
SFTPStream.prototype.attrs = function(id, attrs) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  if (typeof attrs !== 'object' || attrs === null)
    throw new Error('attrs is not an object');

  var info = attrsToBytes(attrs);
  var buf = Buffer.allocUnsafe(4 + 1 + 4 + 4 + info.nbytes);
  var p = 13;

  writeUInt32BE(buf, buf.length - 4, 0);
  buf[4] = RESPONSE.ATTRS;
  writeUInt32BE(buf, id, 5);

  writeUInt32BE(buf, info.flags, 9);

  if (info.flags && info.bytes) {
    var bytes = info.bytes;
    for (var j = 0, len = bytes.length; j < len; ++j)
      for (var k = 0, len2 = bytes[j].length; k < len2; ++k)
        buf[p++] = bytes[j][k];
  }

  this.debug('DEBUG[SFTP]: Outgoing: Writing ATTRS');
  return this.push(buf);
};

function readAttrs(buf, p, stream, callback) {
  /*
    uint32   flags
    uint64   size           present only if flag SSH_FILEXFER_ATTR_SIZE
    uint32   uid            present only if flag SSH_FILEXFER_ATTR_UIDGID
    uint32   gid            present only if flag SSH_FILEXFER_ATTR_UIDGID
    uint32   permissions    present only if flag SSH_FILEXFER_ATTR_PERMISSIONS
    uint32   atime          present only if flag SSH_FILEXFER_ACMODTIME
    uint32   mtime          present only if flag SSH_FILEXFER_ACMODTIME
    uint32   extended_count present only if flag SSH_FILEXFER_ATTR_EXTENDED
    string   extended_type
    string   extended_data
    ...      more extended data (extended_type - extended_data pairs),
               so that number of pairs equals extended_count
  */
  var flags = readUInt32BE(buf, p);
  var attrs = new Stats();

  p += 4;

  if (flags & ATTR.SIZE) {
    var size = readUInt64BE(buf, p, stream, callback);
    if (size === false)
      return false;
    attrs.size = size;
    p += 8;
  }
  if (flags & ATTR.UIDGID) {
    var uid;
    var gid;
    uid = readInt(buf, p, this, callback);
    if (uid === false)
      return false;
    attrs.uid = uid;
    p += 4;
    gid = readInt(buf, p, this, callback);
    if (gid === false)
      return false;
    attrs.gid = gid;
    p += 4;
  }
  if (flags & ATTR.PERMISSIONS) {
    var mode = readInt(buf, p, this, callback);
    if (mode === false)
      return false;
    attrs.mode = mode;
    // backwards compatibility
    attrs.permissions = mode;
    p += 4;
  }
  if (flags & ATTR.ACMODTIME) {
    var atime;
    var mtime;
    atime = readInt(buf, p, this, callback);
    if (atime === false)
      return false;
    attrs.atime = atime;
    p += 4;
    mtime = readInt(buf, p, this, callback);
    if (mtime === false)
      return false;
    attrs.mtime = mtime;
    p += 4;
  }
  if (flags & ATTR.EXTENDED) {
    // TODO: read/parse extended data
    var extcount = readInt(buf, p, this, callback);
    if (extcount === false)
      return false;
    p += 4;
    for (var i = 0, len; i < extcount; ++i) {
      len = readInt(buf, p, this, callback);
      if (len === false)
        return false;
      p += 4 + len;
    }
  }

  buf._pos = p;

  return attrs;
}

function readUInt64BE(buffer, p, stream, callback) {
  if ((buffer.length - p) < 8) {
    stream && stream._cleanup(callback);
    return false;
  }

  var val = 0;

  for (var len = p + 8; p < len; ++p) {
    val *= 256;
    val += buffer[p];
  }

  buffer._pos = p;

  return val;
}

function attrsToBytes(attrs) {
  var flags = 0;
  var attrBytes = 0;
  var ret = [];
  var i = 0;

  if (typeof attrs !== 'object' || attrs === null)
    return { flags: flags, nbytes: attrBytes, bytes: ret };

  if (typeof attrs.size === 'number') {
    flags |= ATTR.SIZE;
    attrBytes += 8;
    var sizeBytes = new Array(8);
    var val = attrs.size;
    for (i = 7; i >= 0; --i) {
      sizeBytes[i] = val & 0xFF;
      val /= 256;
    }
    ret.push(sizeBytes);
  }
  if (typeof attrs.uid === 'number' && typeof attrs.gid === 'number') {
    flags |= ATTR.UIDGID;
    attrBytes += 8;
    ret.push([(attrs.uid >> 24) & 0xFF, (attrs.uid >> 16) & 0xFF,
              (attrs.uid >> 8) & 0xFF, attrs.uid & 0xFF]);
    ret.push([(attrs.gid >> 24) & 0xFF, (attrs.gid >> 16) & 0xFF,
              (attrs.gid >> 8) & 0xFF, attrs.gid & 0xFF]);
  }
  if (typeof attrs.permissions === 'number'
      || typeof attrs.permissions === 'string'
      || typeof attrs.mode === 'number'
      || typeof attrs.mode === 'string') {
    var mode = modeNum(attrs.mode || attrs.permissions);
    flags |= ATTR.PERMISSIONS;
    attrBytes += 4;
    ret.push([(mode >> 24) & 0xFF,
              (mode >> 16) & 0xFF,
              (mode >> 8) & 0xFF,
              mode & 0xFF]);
  }
  if ((typeof attrs.atime === 'number' || isDate(attrs.atime))
      && (typeof attrs.mtime === 'number' || isDate(attrs.mtime))) {
    var atime = toUnixTimestamp(attrs.atime);
    var mtime = toUnixTimestamp(attrs.mtime);

    flags |= ATTR.ACMODTIME;
    attrBytes += 8;
    ret.push([(atime >> 24) & 0xFF, (atime >> 16) & 0xFF,
              (atime >> 8) & 0xFF, atime & 0xFF]);
    ret.push([(mtime >> 24) & 0xFF, (mtime >> 16) & 0xFF,
              (mtime >> 8) & 0xFF, mtime & 0xFF]);
  }
  // TODO: extended attributes

  return { flags: flags, nbytes: attrBytes, bytes: ret };
}

function toUnixTimestamp(time) {
  if (typeof time === 'number' && !isNaN(time))
    return time;
  else if (isDate(time))
    return parseInt(time.getTime() / 1000, 10);
  throw new Error('Cannot parse time: ' + time);
}

function modeNum(mode) {
  if (typeof mode === 'number' && !isNaN(mode))
    return mode;
  else if (typeof mode === 'string')
    return modeNum(parseInt(mode, 8));
  throw new Error('Cannot parse mode: ' + mode);
}

var stringFlagMap = {
  'r': OPEN_MODE.READ,
  'r+': OPEN_MODE.READ | OPEN_MODE.WRITE,
  'w': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE,
  'wx': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL,
  'xw': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL,
  'w+': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE,
  'wx+': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
         | OPEN_MODE.EXCL,
  'xw+': OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
         | OPEN_MODE.EXCL,
  'a': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.WRITE,
  'ax': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL,
  'xa': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL,
  'a+': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE,
  'ax+': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
         | OPEN_MODE.EXCL,
  'xa+': OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
         | OPEN_MODE.EXCL
};
var stringFlagMapKeys = Object.keys(stringFlagMap);

function stringToFlags(str) {
  var flags = stringFlagMap[str];
  if (flags !== undefined)
    return flags;
  return null;
}
SFTPStream.stringToFlags = stringToFlags;

function flagsToString(flags) {
  for (var i = 0; i < stringFlagMapKeys.length; ++i) {
    var key = stringFlagMapKeys[i];
    if (stringFlagMap[key] === flags)
      return key;
  }
  return null;
}
SFTPStream.flagsToString = flagsToString;

function Stats(initial) {
  this.mode = (initial && initial.mode);
  this.permissions = this.mode; // backwards compatiblity
  this.uid = (initial && initial.uid);
  this.gid = (initial && initial.gid);
  this.size = (initial && initial.size);
  this.atime = (initial && initial.atime);
  this.mtime = (initial && initial.mtime);
}
Stats.prototype._checkModeProperty = function(property) {
  return ((this.mode & constants.S_IFMT) === property);
};
Stats.prototype.isDirectory = function() {
  return this._checkModeProperty(constants.S_IFDIR);
};
Stats.prototype.isFile = function() {
  return this._checkModeProperty(constants.S_IFREG);
};
Stats.prototype.isBlockDevice = function() {
  return this._checkModeProperty(constants.S_IFBLK);
};
Stats.prototype.isCharacterDevice = function() {
  return this._checkModeProperty(constants.S_IFCHR);
};
Stats.prototype.isSymbolicLink = function() {
  return this._checkModeProperty(constants.S_IFLNK);
};
Stats.prototype.isFIFO = function() {
  return this._checkModeProperty(constants.S_IFIFO);
};
Stats.prototype.isSocket = function() {
  return this._checkModeProperty(constants.S_IFSOCK);
};
SFTPStream.Stats = Stats;

// =============================================================================
// ReadStream/WriteStream-related
var fsCompat = __webpack_require__(599);
var validateNumber = fsCompat.validateNumber;
var destroyImpl = fsCompat.destroyImpl;
var ERR_OUT_OF_RANGE = fsCompat.ERR_OUT_OF_RANGE;
var ERR_INVALID_ARG_TYPE = fsCompat.ERR_INVALID_ARG_TYPE;

var kMinPoolSpace = 128;

var pool;
// It can happen that we expect to read a large chunk of data, and reserve
// a large chunk of the pool accordingly, but the read() call only filled
// a portion of it. If a concurrently executing read() then uses the same pool,
// the "reserved" portion cannot be used, so we allow it to be re-used as a
// new pool later.
var poolFragments = [];

function allocNewPool(poolSize) {
  if (poolFragments.length > 0)
    pool = poolFragments.pop();
  else
    pool = Buffer.allocUnsafe(poolSize);
  pool.used = 0;
}

// Check the `this.start` and `this.end` of stream.
function checkPosition(pos, name) {
  if (!Number.isSafeInteger(pos)) {
    validateNumber(pos, name);
    if (!Number.isInteger(pos))
      throw new ERR_OUT_OF_RANGE(name, 'an integer', pos);
    throw new ERR_OUT_OF_RANGE(name, '>= 0 and <= 2 ** 53 - 1', pos);
  }
  if (pos < 0)
    throw new ERR_OUT_OF_RANGE(name, '>= 0 and <= 2 ** 53 - 1', pos);
}

function roundUpToMultipleOf8(n) {
  return (n + 7) & ~7;  // Align to 8 byte boundary.
}

function ReadStream(sftp, path, options) {
  if (options === undefined)
    options = {};
  else if (typeof options === 'string')
    options = { encoding: options };
  else if (options === null || typeof options !== 'object')
    throw new TypeError('"options" argument must be a string or an object');
  else
    options = Object.create(options);

  // A little bit bigger buffer and water marks by default
  if (options.highWaterMark === undefined)
    options.highWaterMark = 64 * 1024;

  // For backwards compat do not emit close on destroy.
  options.emitClose = false;

  ReadableStream.call(this, options);

  this.path = path;
  this.flags = options.flags === undefined ? 'r' : options.flags;
  this.mode = options.mode === undefined ? 0o666 : options.mode;

  this.start = options.start;
  this.end = options.end;
  this.autoClose = options.autoClose === undefined ? true : options.autoClose;
  this.pos = 0;
  this.bytesRead = 0;
  this.closed = false;

  this.handle = options.handle === undefined ? null : options.handle;
  this.sftp = sftp;
  this._opening = false;

  if (this.start !== undefined) {
    checkPosition(this.start, 'start');

    this.pos = this.start;
  }

  if (this.end === undefined) {
    this.end = Infinity;
  } else if (this.end !== Infinity) {
    checkPosition(this.end, 'end');

    if (this.start !== undefined && this.start > this.end) {
      throw new ERR_OUT_OF_RANGE(
        'start',
        `<= "end" (here: ${this.end})`,
        this.start
      );
    }
  }

  this.on('end', function() {
    if (this.autoClose)
      this.destroy();
  });

  if (!Buffer.isBuffer(this.handle))
    this.open();
}
inherits(ReadStream, ReadableStream);

ReadStream.prototype.open = function() {
  if (this._opening)
    return;

  this._opening = true;

  this.sftp.open(this.path, this.flags, this.mode, (er, handle) => {
    this._opening = false;

    if (er) {
      this.emit('error', er);
      if (this.autoClose)
        this.destroy();
      return;
    }

    this.handle = handle;
    this.emit('open', handle);
    this.emit('ready');
    // start the flow of data.
    this.read();
  });
};

ReadStream.prototype._read = function(n) {
  if (!Buffer.isBuffer(this.handle)) {
    return this.once('open', function() {
      this._read(n);
    });
  }

  // XXX: safe to remove this?
  if (this.destroyed)
    return;

  if (!pool || pool.length - pool.used < kMinPoolSpace) {
    // discard the old pool.
    allocNewPool(this.readableHighWaterMark
                 || this._readableState.highWaterMark);
  }

  // Grab another reference to the pool in the case that while we're
  // in the thread pool another read() finishes up the pool, and
  // allocates a new one.
  var thisPool = pool;
  var toRead = Math.min(pool.length - pool.used, n);
  var start = pool.used;

  if (this.end !== undefined)
    toRead = Math.min(this.end - this.pos + 1, toRead);

  // Already read everything we were supposed to read!
  // treat as EOF.
  if (toRead <= 0)
    return this.push(null);

  // the actual read.
  this.sftp.readData(this.handle,
                     pool,
                     pool.used,
                     toRead,
                     this.pos,
                     (er, bytesRead) => {
    if (er) {
      this.emit('error', er);
      if (this.autoClose)
        this.destroy();
      return;
    }
    var b = null;

    // Now that we know how much data we have actually read, re-wind the
    // 'used' field if we can, and otherwise allow the remainder of our
    // reservation to be used as a new pool later.
    if (start + toRead === thisPool.used && thisPool === pool) {
      var newUsed = thisPool.used + bytesRead - toRead;
      thisPool.used = roundUpToMultipleOf8(newUsed);
    } else {
      // Round down to the next lowest multiple of 8 to ensure the new pool
      // fragment start and end positions are aligned to an 8 byte boundary.
      var alignedEnd = (start + toRead) & ~7;
      var alignedStart = roundUpToMultipleOf8(start + bytesRead);
      if (alignedEnd - alignedStart >= kMinPoolSpace)
        poolFragments.push(thisPool.slice(alignedStart, alignedEnd));
    }

    if (bytesRead > 0) {
      this.bytesRead += bytesRead;
      b = thisPool.slice(start, start + bytesRead);
    }

    // Move the pool positions, and internal position for reading.
    this.pos += bytesRead;

    this.push(b);
  });

  pool.used = roundUpToMultipleOf8(pool.used + toRead);
};

if (typeof ReadableStream.prototype.destroy !== 'function')
  ReadStream.prototype.destroy = destroyImpl;

ReadStream.prototype._destroy = function(err, cb) {
  if (this._opening && !Buffer.isBuffer(this.handle)) {
    this.once('open', closeStream.bind(null, this, cb, err));
    return;
  }

  closeStream(this, cb, err);
  this.handle = null;
  this._opening = false;
};

function closeStream(stream, cb, err) {
  if (!stream.handle)
    return onclose();

  stream.sftp.close(stream.handle, onclose);

  function onclose(er) {
    er = er || err;
    cb(er);
    stream.closed = true;
    if (!er)
      stream.emit('close');
  }
}

ReadStream.prototype.close = function(cb) {
  this.destroy(null, cb);
};

Object.defineProperty(ReadStream.prototype, 'pending', {
  get() { return this.handle === null; },
  configurable: true
});

function WriteStream(sftp, path, options) {
  if (options === undefined)
    options = {};
  else if (typeof options === 'string')
    options = { encoding: options };
  else if (options === null || typeof options !== 'object')
    throw new TypeError('"options" argument must be a string or an object');
  else
    options = Object.create(options);

  // For backwards compat do not emit close on destroy.
  options.emitClose = false;

  WritableStream.call(this, options);

  this.path = path;
  this.flags = options.flags === undefined ? 'w' : options.flags;
  this.mode = options.mode === undefined ? 0o666 : options.mode;

  this.start = options.start;
  this.autoClose = options.autoClose === undefined ? true : options.autoClose;
  this.pos = 0;
  this.bytesWritten = 0;
  this.closed = false;

  this.handle = options.handle === undefined ? null : options.handle;
  this.sftp = sftp;
  this._opening = false;

  if (this.start !== undefined) {
    checkPosition(this.start, 'start');

    this.pos = this.start;
  }

  if (options.encoding)
    this.setDefaultEncoding(options.encoding);

  // Node v6.x only
  this.on('finish', function() {
    if (this._writableState.finalCalled)
      return;
    if (this.autoClose)
      this.destroy();
  });

  if (!Buffer.isBuffer(this.handle))
    this.open();
}
inherits(WriteStream, WritableStream);

WriteStream.prototype._final = function(cb) {
  if (this.autoClose)
    this.destroy();
  cb();
};

WriteStream.prototype.open = function() {
  if (this._opening)
    return;

  this._opening = true;

  this.sftp.open(this.path, this.flags, this.mode, (er, handle) => {
    this._opening = false;

    if (er) {
      this.emit('error', er);
      if (this.autoClose)
        this.destroy();
      return;
    }

    this.handle = handle;

    var tryAgain = (err) => {
      if (err) {
        // Try chmod() for sftp servers that may not support fchmod() for
        // whatever reason
        this.sftp.chmod(this.path, this.mode, (err_) => {
          tryAgain();
        });
        return;
      }

      // SFTPv3 requires absolute offsets, no matter the open flag used
      if (this.flags[0] === 'a') {
        var tryStat = (err, st) => {
          if (err) {
            // Try stat() for sftp servers that may not support fstat() for
            // whatever reason
            this.sftp.stat(this.path, (err_, st_) => {
              if (err_) {
                this.destroy();
                this.emit('error', err);
                return;
              }
              tryStat(null, st_);
            });
            return;
          }

          this.pos = st.size;
          this.emit('open', handle);
          this.emit('ready');
        };

        this.sftp.fstat(handle, tryStat);
        return;
      }

      this.emit('open', handle);
      this.emit('ready');
    };

    this.sftp.fchmod(handle, this.mode, tryAgain);
  });
};

WriteStream.prototype._write = function(data, encoding, cb) {
  if (!Buffer.isBuffer(data)) {
    const err = new ERR_INVALID_ARG_TYPE('data', 'Buffer', data);
    return this.emit('error', err);
  }

  if (!Buffer.isBuffer(this.handle)) {
    return this.once('open', function() {
      this._write(data, encoding, cb);
    });
  }

  this.sftp.writeData(this.handle,
                      data,
                      0,
                      data.length,
                      this.pos,
                      (er, bytes) => {
    if (er) {
      if (this.autoClose)
        this.destroy();
      return cb(er);
    }
    this.bytesWritten += bytes;
    cb();
  });

  this.pos += data.length;
};

WriteStream.prototype._writev = function(data, cb) {
  if (!Buffer.isBuffer(this.handle)) {
    return this.once('open', function() {
      this._writev(data, cb);
    });
  }

  var sftp = this.sftp;
  var handle = this.handle;
  var writesLeft = data.length;

  var onwrite = (er, bytes) => {
    if (er) {
      this.destroy();
      return cb(er);
    }
    this.bytesWritten += bytes;
    if (--writesLeft === 0)
      cb();
  };

  // TODO: try to combine chunks to reduce number of requests to the server
  for (var i = 0; i < data.length; ++i) {
    var chunk = data[i].chunk;

    sftp.writeData(handle, chunk, 0, chunk.length, this.pos, onwrite);
    this.pos += chunk.length;
  }
};

if (typeof WritableStream.prototype.destroy !== 'function')
  WriteStream.prototype.destroy = ReadStream.prototype.destroy;

WriteStream.prototype._destroy = ReadStream.prototype._destroy;
WriteStream.prototype.close = function(cb) {
  if (cb) {
    if (this.closed) {
      process.nextTick(cb);
      return;
    } else {
      this.on('close', cb);
    }
  }

  // If we are not autoClosing, we should call
  // destroy on 'finish'.
  if (!this.autoClose)
    this.on('finish', this.destroy.bind(this));

  this.end();
};

// There is no shutdown() for files.
WriteStream.prototype.destroySoon = WriteStream.prototype.end;

Object.defineProperty(WriteStream.prototype, 'pending', {
  get() { return this.handle === null; },
  configurable: true
});

module.exports = SFTPStream;



/***/ }),

/***/ 176:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ERR_INVALID_ARG_TYPE = __webpack_require__(563).codes.ERR_INVALID_ARG_TYPE;

function from(Readable, iterable, opts) {
  var iterator;

  if (iterable && typeof iterable.next === 'function') {
    iterator = iterable;
  } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();else throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);

  var readable = new Readable(_objectSpread({
    objectMode: true
  }, opts)); // Reading boolean to protect against _read
  // being called before last iteration completion.

  var reading = false;

  readable._read = function () {
    if (!reading) {
      reading = true;
      next();
    }
  };

  function next() {
    return _next2.apply(this, arguments);
  }

  function _next2() {
    _next2 = _asyncToGenerator(function* () {
      try {
        var _ref = yield iterator.next(),
            value = _ref.value,
            done = _ref.done;

        if (done) {
          readable.push(null);
        } else if (readable.push((yield value))) {
          next();
        } else {
          reading = false;
        }
      } catch (err) {
        readable.destroy(err);
      }
    });
    return _next2.apply(this, arguments);
  }

  return readable;
}

module.exports = from;

/***/ }),

/***/ 180:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents a config
 * @param {Object} modem docker-modem
 * @param {String} id  Config's id
 */
var Config = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Config.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Config.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/configs/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'config not found',
      500: 'server error',
      503: 'node is not part of a swarm'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Update a config.
 *
 * @param {object} opts
 * @param {function} callback
 */
Config.prototype.update = function(opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
  }

  var optsf = {
    path: '/configs/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'config not found',
      500: 'server error',
      503: 'node is not part of a swarm'
    },
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Removes the config
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Config.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/configs/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'config not found',
      500: 'server error',
      503: 'node is not part of a swarm'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};



module.exports = Config;


/***/ }),

/***/ 191:
/***/ (function(module) {

module.exports = require("querystring");

/***/ }),

/***/ 196:
/***/ (function(module, __unusedexports, __webpack_require__) {

(function(nacl) {
'use strict';

// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

var gf = function(init) {
  var i, r = new Float64Array(16);
  if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
  return r;
};

//  Pluggable, initialized in high-level API below.
var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

var _0 = new Uint8Array(16);
var _9 = new Uint8Array(32); _9[0] = 9;

var gf0 = gf(),
    gf1 = gf([1]),
    _121665 = gf([0xdb41, 1]),
    D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
    D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
    X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
    Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
    I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

function ts64(x, i, h, l) {
  x[i]   = (h >> 24) & 0xff;
  x[i+1] = (h >> 16) & 0xff;
  x[i+2] = (h >>  8) & 0xff;
  x[i+3] = h & 0xff;
  x[i+4] = (l >> 24)  & 0xff;
  x[i+5] = (l >> 16)  & 0xff;
  x[i+6] = (l >>  8)  & 0xff;
  x[i+7] = l & 0xff;
}

function vn(x, xi, y, yi, n) {
  var i,d = 0;
  for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
  return (1 & ((d - 1) >>> 8)) - 1;
}

function crypto_verify_16(x, xi, y, yi) {
  return vn(x,xi,y,yi,16);
}

function crypto_verify_32(x, xi, y, yi) {
  return vn(x,xi,y,yi,32);
}

function core_salsa20(o, p, k, c) {
  var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
      j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
      j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
      j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
      j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
      j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
      j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
      j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
      j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
      j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
      j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
      j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
      j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
      j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
      j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
      j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

  var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
      x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
      x15 = j15, u;

  for (var i = 0; i < 20; i += 2) {
    u = x0 + x12 | 0;
    x4 ^= u<<7 | u>>>(32-7);
    u = x4 + x0 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x4 | 0;
    x12 ^= u<<13 | u>>>(32-13);
    u = x12 + x8 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x1 | 0;
    x9 ^= u<<7 | u>>>(32-7);
    u = x9 + x5 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x9 | 0;
    x1 ^= u<<13 | u>>>(32-13);
    u = x1 + x13 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x6 | 0;
    x14 ^= u<<7 | u>>>(32-7);
    u = x14 + x10 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x14 | 0;
    x6 ^= u<<13 | u>>>(32-13);
    u = x6 + x2 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x11 | 0;
    x3 ^= u<<7 | u>>>(32-7);
    u = x3 + x15 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x3 | 0;
    x11 ^= u<<13 | u>>>(32-13);
    u = x11 + x7 | 0;
    x15 ^= u<<18 | u>>>(32-18);

    u = x0 + x3 | 0;
    x1 ^= u<<7 | u>>>(32-7);
    u = x1 + x0 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x1 | 0;
    x3 ^= u<<13 | u>>>(32-13);
    u = x3 + x2 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x4 | 0;
    x6 ^= u<<7 | u>>>(32-7);
    u = x6 + x5 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x6 | 0;
    x4 ^= u<<13 | u>>>(32-13);
    u = x4 + x7 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x9 | 0;
    x11 ^= u<<7 | u>>>(32-7);
    u = x11 + x10 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x11 | 0;
    x9 ^= u<<13 | u>>>(32-13);
    u = x9 + x8 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x14 | 0;
    x12 ^= u<<7 | u>>>(32-7);
    u = x12 + x15 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x12 | 0;
    x14 ^= u<<13 | u>>>(32-13);
    u = x14 + x13 | 0;
    x15 ^= u<<18 | u>>>(32-18);
  }
   x0 =  x0 +  j0 | 0;
   x1 =  x1 +  j1 | 0;
   x2 =  x2 +  j2 | 0;
   x3 =  x3 +  j3 | 0;
   x4 =  x4 +  j4 | 0;
   x5 =  x5 +  j5 | 0;
   x6 =  x6 +  j6 | 0;
   x7 =  x7 +  j7 | 0;
   x8 =  x8 +  j8 | 0;
   x9 =  x9 +  j9 | 0;
  x10 = x10 + j10 | 0;
  x11 = x11 + j11 | 0;
  x12 = x12 + j12 | 0;
  x13 = x13 + j13 | 0;
  x14 = x14 + j14 | 0;
  x15 = x15 + j15 | 0;

  o[ 0] = x0 >>>  0 & 0xff;
  o[ 1] = x0 >>>  8 & 0xff;
  o[ 2] = x0 >>> 16 & 0xff;
  o[ 3] = x0 >>> 24 & 0xff;

  o[ 4] = x1 >>>  0 & 0xff;
  o[ 5] = x1 >>>  8 & 0xff;
  o[ 6] = x1 >>> 16 & 0xff;
  o[ 7] = x1 >>> 24 & 0xff;

  o[ 8] = x2 >>>  0 & 0xff;
  o[ 9] = x2 >>>  8 & 0xff;
  o[10] = x2 >>> 16 & 0xff;
  o[11] = x2 >>> 24 & 0xff;

  o[12] = x3 >>>  0 & 0xff;
  o[13] = x3 >>>  8 & 0xff;
  o[14] = x3 >>> 16 & 0xff;
  o[15] = x3 >>> 24 & 0xff;

  o[16] = x4 >>>  0 & 0xff;
  o[17] = x4 >>>  8 & 0xff;
  o[18] = x4 >>> 16 & 0xff;
  o[19] = x4 >>> 24 & 0xff;

  o[20] = x5 >>>  0 & 0xff;
  o[21] = x5 >>>  8 & 0xff;
  o[22] = x5 >>> 16 & 0xff;
  o[23] = x5 >>> 24 & 0xff;

  o[24] = x6 >>>  0 & 0xff;
  o[25] = x6 >>>  8 & 0xff;
  o[26] = x6 >>> 16 & 0xff;
  o[27] = x6 >>> 24 & 0xff;

  o[28] = x7 >>>  0 & 0xff;
  o[29] = x7 >>>  8 & 0xff;
  o[30] = x7 >>> 16 & 0xff;
  o[31] = x7 >>> 24 & 0xff;

  o[32] = x8 >>>  0 & 0xff;
  o[33] = x8 >>>  8 & 0xff;
  o[34] = x8 >>> 16 & 0xff;
  o[35] = x8 >>> 24 & 0xff;

  o[36] = x9 >>>  0 & 0xff;
  o[37] = x9 >>>  8 & 0xff;
  o[38] = x9 >>> 16 & 0xff;
  o[39] = x9 >>> 24 & 0xff;

  o[40] = x10 >>>  0 & 0xff;
  o[41] = x10 >>>  8 & 0xff;
  o[42] = x10 >>> 16 & 0xff;
  o[43] = x10 >>> 24 & 0xff;

  o[44] = x11 >>>  0 & 0xff;
  o[45] = x11 >>>  8 & 0xff;
  o[46] = x11 >>> 16 & 0xff;
  o[47] = x11 >>> 24 & 0xff;

  o[48] = x12 >>>  0 & 0xff;
  o[49] = x12 >>>  8 & 0xff;
  o[50] = x12 >>> 16 & 0xff;
  o[51] = x12 >>> 24 & 0xff;

  o[52] = x13 >>>  0 & 0xff;
  o[53] = x13 >>>  8 & 0xff;
  o[54] = x13 >>> 16 & 0xff;
  o[55] = x13 >>> 24 & 0xff;

  o[56] = x14 >>>  0 & 0xff;
  o[57] = x14 >>>  8 & 0xff;
  o[58] = x14 >>> 16 & 0xff;
  o[59] = x14 >>> 24 & 0xff;

  o[60] = x15 >>>  0 & 0xff;
  o[61] = x15 >>>  8 & 0xff;
  o[62] = x15 >>> 16 & 0xff;
  o[63] = x15 >>> 24 & 0xff;
}

function core_hsalsa20(o,p,k,c) {
  var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
      j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
      j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
      j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
      j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
      j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
      j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
      j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
      j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
      j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
      j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
      j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
      j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
      j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
      j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
      j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

  var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
      x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
      x15 = j15, u;

  for (var i = 0; i < 20; i += 2) {
    u = x0 + x12 | 0;
    x4 ^= u<<7 | u>>>(32-7);
    u = x4 + x0 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x4 | 0;
    x12 ^= u<<13 | u>>>(32-13);
    u = x12 + x8 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x1 | 0;
    x9 ^= u<<7 | u>>>(32-7);
    u = x9 + x5 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x9 | 0;
    x1 ^= u<<13 | u>>>(32-13);
    u = x1 + x13 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x6 | 0;
    x14 ^= u<<7 | u>>>(32-7);
    u = x14 + x10 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x14 | 0;
    x6 ^= u<<13 | u>>>(32-13);
    u = x6 + x2 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x11 | 0;
    x3 ^= u<<7 | u>>>(32-7);
    u = x3 + x15 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x3 | 0;
    x11 ^= u<<13 | u>>>(32-13);
    u = x11 + x7 | 0;
    x15 ^= u<<18 | u>>>(32-18);

    u = x0 + x3 | 0;
    x1 ^= u<<7 | u>>>(32-7);
    u = x1 + x0 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x1 | 0;
    x3 ^= u<<13 | u>>>(32-13);
    u = x3 + x2 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x4 | 0;
    x6 ^= u<<7 | u>>>(32-7);
    u = x6 + x5 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x6 | 0;
    x4 ^= u<<13 | u>>>(32-13);
    u = x4 + x7 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x9 | 0;
    x11 ^= u<<7 | u>>>(32-7);
    u = x11 + x10 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x11 | 0;
    x9 ^= u<<13 | u>>>(32-13);
    u = x9 + x8 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x14 | 0;
    x12 ^= u<<7 | u>>>(32-7);
    u = x12 + x15 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x12 | 0;
    x14 ^= u<<13 | u>>>(32-13);
    u = x14 + x13 | 0;
    x15 ^= u<<18 | u>>>(32-18);
  }

  o[ 0] = x0 >>>  0 & 0xff;
  o[ 1] = x0 >>>  8 & 0xff;
  o[ 2] = x0 >>> 16 & 0xff;
  o[ 3] = x0 >>> 24 & 0xff;

  o[ 4] = x5 >>>  0 & 0xff;
  o[ 5] = x5 >>>  8 & 0xff;
  o[ 6] = x5 >>> 16 & 0xff;
  o[ 7] = x5 >>> 24 & 0xff;

  o[ 8] = x10 >>>  0 & 0xff;
  o[ 9] = x10 >>>  8 & 0xff;
  o[10] = x10 >>> 16 & 0xff;
  o[11] = x10 >>> 24 & 0xff;

  o[12] = x15 >>>  0 & 0xff;
  o[13] = x15 >>>  8 & 0xff;
  o[14] = x15 >>> 16 & 0xff;
  o[15] = x15 >>> 24 & 0xff;

  o[16] = x6 >>>  0 & 0xff;
  o[17] = x6 >>>  8 & 0xff;
  o[18] = x6 >>> 16 & 0xff;
  o[19] = x6 >>> 24 & 0xff;

  o[20] = x7 >>>  0 & 0xff;
  o[21] = x7 >>>  8 & 0xff;
  o[22] = x7 >>> 16 & 0xff;
  o[23] = x7 >>> 24 & 0xff;

  o[24] = x8 >>>  0 & 0xff;
  o[25] = x8 >>>  8 & 0xff;
  o[26] = x8 >>> 16 & 0xff;
  o[27] = x8 >>> 24 & 0xff;

  o[28] = x9 >>>  0 & 0xff;
  o[29] = x9 >>>  8 & 0xff;
  o[30] = x9 >>> 16 & 0xff;
  o[31] = x9 >>> 24 & 0xff;
}

function crypto_core_salsa20(out,inp,k,c) {
  core_salsa20(out,inp,k,c);
}

function crypto_core_hsalsa20(out,inp,k,c) {
  core_hsalsa20(out,inp,k,c);
}

var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
            // "expand 32-byte k"

function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
  var z = new Uint8Array(16), x = new Uint8Array(64);
  var u, i;
  for (i = 0; i < 16; i++) z[i] = 0;
  for (i = 0; i < 8; i++) z[i] = n[i];
  while (b >= 64) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
    u = 1;
    for (i = 8; i < 16; i++) {
      u = u + (z[i] & 0xff) | 0;
      z[i] = u & 0xff;
      u >>>= 8;
    }
    b -= 64;
    cpos += 64;
    mpos += 64;
  }
  if (b > 0) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
  }
  return 0;
}

function crypto_stream_salsa20(c,cpos,b,n,k) {
  var z = new Uint8Array(16), x = new Uint8Array(64);
  var u, i;
  for (i = 0; i < 16; i++) z[i] = 0;
  for (i = 0; i < 8; i++) z[i] = n[i];
  while (b >= 64) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < 64; i++) c[cpos+i] = x[i];
    u = 1;
    for (i = 8; i < 16; i++) {
      u = u + (z[i] & 0xff) | 0;
      z[i] = u & 0xff;
      u >>>= 8;
    }
    b -= 64;
    cpos += 64;
  }
  if (b > 0) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < b; i++) c[cpos+i] = x[i];
  }
  return 0;
}

function crypto_stream(c,cpos,d,n,k) {
  var s = new Uint8Array(32);
  crypto_core_hsalsa20(s,n,k,sigma);
  var sn = new Uint8Array(8);
  for (var i = 0; i < 8; i++) sn[i] = n[i+16];
  return crypto_stream_salsa20(c,cpos,d,sn,s);
}

function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
  var s = new Uint8Array(32);
  crypto_core_hsalsa20(s,n,k,sigma);
  var sn = new Uint8Array(8);
  for (var i = 0; i < 8; i++) sn[i] = n[i+16];
  return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
}

/*
* Port of Andrew Moon's Poly1305-donna-16. Public domain.
* https://github.com/floodyberry/poly1305-donna
*/

var poly1305 = function(key) {
  this.buffer = new Uint8Array(16);
  this.r = new Uint16Array(10);
  this.h = new Uint16Array(10);
  this.pad = new Uint16Array(8);
  this.leftover = 0;
  this.fin = 0;

  var t0, t1, t2, t3, t4, t5, t6, t7;

  t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
  t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
  t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
  t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
  t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
  this.r[5] = ((t4 >>>  1)) & 0x1ffe;
  t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
  t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
  t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
  this.r[9] = ((t7 >>>  5)) & 0x007f;

  this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
  this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
  this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
  this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
  this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
  this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
  this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
  this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
};

poly1305.prototype.blocks = function(m, mpos, bytes) {
  var hibit = this.fin ? 0 : (1 << 11);
  var t0, t1, t2, t3, t4, t5, t6, t7, c;
  var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;

  var h0 = this.h[0],
      h1 = this.h[1],
      h2 = this.h[2],
      h3 = this.h[3],
      h4 = this.h[4],
      h5 = this.h[5],
      h6 = this.h[6],
      h7 = this.h[7],
      h8 = this.h[8],
      h9 = this.h[9];

  var r0 = this.r[0],
      r1 = this.r[1],
      r2 = this.r[2],
      r3 = this.r[3],
      r4 = this.r[4],
      r5 = this.r[5],
      r6 = this.r[6],
      r7 = this.r[7],
      r8 = this.r[8],
      r9 = this.r[9];

  while (bytes >= 16) {
    t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
    t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
    t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
    t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
    t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
    h5 += ((t4 >>>  1)) & 0x1fff;
    t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
    t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
    t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
    h9 += ((t7 >>> 5)) | hibit;

    c = 0;

    d0 = c;
    d0 += h0 * r0;
    d0 += h1 * (5 * r9);
    d0 += h2 * (5 * r8);
    d0 += h3 * (5 * r7);
    d0 += h4 * (5 * r6);
    c = (d0 >>> 13); d0 &= 0x1fff;
    d0 += h5 * (5 * r5);
    d0 += h6 * (5 * r4);
    d0 += h7 * (5 * r3);
    d0 += h8 * (5 * r2);
    d0 += h9 * (5 * r1);
    c += (d0 >>> 13); d0 &= 0x1fff;

    d1 = c;
    d1 += h0 * r1;
    d1 += h1 * r0;
    d1 += h2 * (5 * r9);
    d1 += h3 * (5 * r8);
    d1 += h4 * (5 * r7);
    c = (d1 >>> 13); d1 &= 0x1fff;
    d1 += h5 * (5 * r6);
    d1 += h6 * (5 * r5);
    d1 += h7 * (5 * r4);
    d1 += h8 * (5 * r3);
    d1 += h9 * (5 * r2);
    c += (d1 >>> 13); d1 &= 0x1fff;

    d2 = c;
    d2 += h0 * r2;
    d2 += h1 * r1;
    d2 += h2 * r0;
    d2 += h3 * (5 * r9);
    d2 += h4 * (5 * r8);
    c = (d2 >>> 13); d2 &= 0x1fff;
    d2 += h5 * (5 * r7);
    d2 += h6 * (5 * r6);
    d2 += h7 * (5 * r5);
    d2 += h8 * (5 * r4);
    d2 += h9 * (5 * r3);
    c += (d2 >>> 13); d2 &= 0x1fff;

    d3 = c;
    d3 += h0 * r3;
    d3 += h1 * r2;
    d3 += h2 * r1;
    d3 += h3 * r0;
    d3 += h4 * (5 * r9);
    c = (d3 >>> 13); d3 &= 0x1fff;
    d3 += h5 * (5 * r8);
    d3 += h6 * (5 * r7);
    d3 += h7 * (5 * r6);
    d3 += h8 * (5 * r5);
    d3 += h9 * (5 * r4);
    c += (d3 >>> 13); d3 &= 0x1fff;

    d4 = c;
    d4 += h0 * r4;
    d4 += h1 * r3;
    d4 += h2 * r2;
    d4 += h3 * r1;
    d4 += h4 * r0;
    c = (d4 >>> 13); d4 &= 0x1fff;
    d4 += h5 * (5 * r9);
    d4 += h6 * (5 * r8);
    d4 += h7 * (5 * r7);
    d4 += h8 * (5 * r6);
    d4 += h9 * (5 * r5);
    c += (d4 >>> 13); d4 &= 0x1fff;

    d5 = c;
    d5 += h0 * r5;
    d5 += h1 * r4;
    d5 += h2 * r3;
    d5 += h3 * r2;
    d5 += h4 * r1;
    c = (d5 >>> 13); d5 &= 0x1fff;
    d5 += h5 * r0;
    d5 += h6 * (5 * r9);
    d5 += h7 * (5 * r8);
    d5 += h8 * (5 * r7);
    d5 += h9 * (5 * r6);
    c += (d5 >>> 13); d5 &= 0x1fff;

    d6 = c;
    d6 += h0 * r6;
    d6 += h1 * r5;
    d6 += h2 * r4;
    d6 += h3 * r3;
    d6 += h4 * r2;
    c = (d6 >>> 13); d6 &= 0x1fff;
    d6 += h5 * r1;
    d6 += h6 * r0;
    d6 += h7 * (5 * r9);
    d6 += h8 * (5 * r8);
    d6 += h9 * (5 * r7);
    c += (d6 >>> 13); d6 &= 0x1fff;

    d7 = c;
    d7 += h0 * r7;
    d7 += h1 * r6;
    d7 += h2 * r5;
    d7 += h3 * r4;
    d7 += h4 * r3;
    c = (d7 >>> 13); d7 &= 0x1fff;
    d7 += h5 * r2;
    d7 += h6 * r1;
    d7 += h7 * r0;
    d7 += h8 * (5 * r9);
    d7 += h9 * (5 * r8);
    c += (d7 >>> 13); d7 &= 0x1fff;

    d8 = c;
    d8 += h0 * r8;
    d8 += h1 * r7;
    d8 += h2 * r6;
    d8 += h3 * r5;
    d8 += h4 * r4;
    c = (d8 >>> 13); d8 &= 0x1fff;
    d8 += h5 * r3;
    d8 += h6 * r2;
    d8 += h7 * r1;
    d8 += h8 * r0;
    d8 += h9 * (5 * r9);
    c += (d8 >>> 13); d8 &= 0x1fff;

    d9 = c;
    d9 += h0 * r9;
    d9 += h1 * r8;
    d9 += h2 * r7;
    d9 += h3 * r6;
    d9 += h4 * r5;
    c = (d9 >>> 13); d9 &= 0x1fff;
    d9 += h5 * r4;
    d9 += h6 * r3;
    d9 += h7 * r2;
    d9 += h8 * r1;
    d9 += h9 * r0;
    c += (d9 >>> 13); d9 &= 0x1fff;

    c = (((c << 2) + c)) | 0;
    c = (c + d0) | 0;
    d0 = c & 0x1fff;
    c = (c >>> 13);
    d1 += c;

    h0 = d0;
    h1 = d1;
    h2 = d2;
    h3 = d3;
    h4 = d4;
    h5 = d5;
    h6 = d6;
    h7 = d7;
    h8 = d8;
    h9 = d9;

    mpos += 16;
    bytes -= 16;
  }
  this.h[0] = h0;
  this.h[1] = h1;
  this.h[2] = h2;
  this.h[3] = h3;
  this.h[4] = h4;
  this.h[5] = h5;
  this.h[6] = h6;
  this.h[7] = h7;
  this.h[8] = h8;
  this.h[9] = h9;
};

poly1305.prototype.finish = function(mac, macpos) {
  var g = new Uint16Array(10);
  var c, mask, f, i;

  if (this.leftover) {
    i = this.leftover;
    this.buffer[i++] = 1;
    for (; i < 16; i++) this.buffer[i] = 0;
    this.fin = 1;
    this.blocks(this.buffer, 0, 16);
  }

  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  for (i = 2; i < 10; i++) {
    this.h[i] += c;
    c = this.h[i] >>> 13;
    this.h[i] &= 0x1fff;
  }
  this.h[0] += (c * 5);
  c = this.h[0] >>> 13;
  this.h[0] &= 0x1fff;
  this.h[1] += c;
  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  this.h[2] += c;

  g[0] = this.h[0] + 5;
  c = g[0] >>> 13;
  g[0] &= 0x1fff;
  for (i = 1; i < 10; i++) {
    g[i] = this.h[i] + c;
    c = g[i] >>> 13;
    g[i] &= 0x1fff;
  }
  g[9] -= (1 << 13);

  mask = (c ^ 1) - 1;
  for (i = 0; i < 10; i++) g[i] &= mask;
  mask = ~mask;
  for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];

  this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
  this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
  this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
  this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
  this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
  this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
  this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
  this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;

  f = this.h[0] + this.pad[0];
  this.h[0] = f & 0xffff;
  for (i = 1; i < 8; i++) {
    f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
    this.h[i] = f & 0xffff;
  }

  mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
  mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
  mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
  mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
  mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
  mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
  mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
  mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
  mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
  mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
  mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
  mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
  mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
  mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
  mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
  mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
};

poly1305.prototype.update = function(m, mpos, bytes) {
  var i, want;

  if (this.leftover) {
    want = (16 - this.leftover);
    if (want > bytes)
      want = bytes;
    for (i = 0; i < want; i++)
      this.buffer[this.leftover + i] = m[mpos+i];
    bytes -= want;
    mpos += want;
    this.leftover += want;
    if (this.leftover < 16)
      return;
    this.blocks(this.buffer, 0, 16);
    this.leftover = 0;
  }

  if (bytes >= 16) {
    want = bytes - (bytes % 16);
    this.blocks(m, mpos, want);
    mpos += want;
    bytes -= want;
  }

  if (bytes) {
    for (i = 0; i < bytes; i++)
      this.buffer[this.leftover + i] = m[mpos+i];
    this.leftover += bytes;
  }
};

function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
  var s = new poly1305(k);
  s.update(m, mpos, n);
  s.finish(out, outpos);
  return 0;
}

function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
  var x = new Uint8Array(16);
  crypto_onetimeauth(x,0,m,mpos,n,k);
  return crypto_verify_16(h,hpos,x,0);
}

function crypto_secretbox(c,m,d,n,k) {
  var i;
  if (d < 32) return -1;
  crypto_stream_xor(c,0,m,0,d,n,k);
  crypto_onetimeauth(c, 16, c, 32, d - 32, c);
  for (i = 0; i < 16; i++) c[i] = 0;
  return 0;
}

function crypto_secretbox_open(m,c,d,n,k) {
  var i;
  var x = new Uint8Array(32);
  if (d < 32) return -1;
  crypto_stream(x,0,32,n,k);
  if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
  crypto_stream_xor(m,0,c,0,d,n,k);
  for (i = 0; i < 32; i++) m[i] = 0;
  return 0;
}

function set25519(r, a) {
  var i;
  for (i = 0; i < 16; i++) r[i] = a[i]|0;
}

function car25519(o) {
  var i, v, c = 1;
  for (i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c-1 + 37 * (c-1);
}

function sel25519(p, q, b) {
  var t, c = ~(b-1);
  for (var i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}

function pack25519(o, n) {
  var i, j, b;
  var m = gf(), t = gf();
  for (i = 0; i < 16; i++) t[i] = n[i];
  car25519(t);
  car25519(t);
  car25519(t);
  for (j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
      m[i-1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
    b = (m[15]>>16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1-b);
  }
  for (i = 0; i < 16; i++) {
    o[2*i] = t[i] & 0xff;
    o[2*i+1] = t[i]>>8;
  }
}

function neq25519(a, b) {
  var c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a);
  pack25519(d, b);
  return crypto_verify_32(c, 0, d, 0);
}

function par25519(a) {
  var d = new Uint8Array(32);
  pack25519(d, a);
  return d[0] & 1;
}

function unpack25519(o, n) {
  var i;
  for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
  o[15] &= 0x7fff;
}

function A(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
}

function Z(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
}

function M(o, a, b) {
  var v, c,
     t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
     t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
    t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
    t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
    b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11],
    b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];

  v = a[0];
  t0 += v * b0;
  t1 += v * b1;
  t2 += v * b2;
  t3 += v * b3;
  t4 += v * b4;
  t5 += v * b5;
  t6 += v * b6;
  t7 += v * b7;
  t8 += v * b8;
  t9 += v * b9;
  t10 += v * b10;
  t11 += v * b11;
  t12 += v * b12;
  t13 += v * b13;
  t14 += v * b14;
  t15 += v * b15;
  v = a[1];
  t1 += v * b0;
  t2 += v * b1;
  t3 += v * b2;
  t4 += v * b3;
  t5 += v * b4;
  t6 += v * b5;
  t7 += v * b6;
  t8 += v * b7;
  t9 += v * b8;
  t10 += v * b9;
  t11 += v * b10;
  t12 += v * b11;
  t13 += v * b12;
  t14 += v * b13;
  t15 += v * b14;
  t16 += v * b15;
  v = a[2];
  t2 += v * b0;
  t3 += v * b1;
  t4 += v * b2;
  t5 += v * b3;
  t6 += v * b4;
  t7 += v * b5;
  t8 += v * b6;
  t9 += v * b7;
  t10 += v * b8;
  t11 += v * b9;
  t12 += v * b10;
  t13 += v * b11;
  t14 += v * b12;
  t15 += v * b13;
  t16 += v * b14;
  t17 += v * b15;
  v = a[3];
  t3 += v * b0;
  t4 += v * b1;
  t5 += v * b2;
  t6 += v * b3;
  t7 += v * b4;
  t8 += v * b5;
  t9 += v * b6;
  t10 += v * b7;
  t11 += v * b8;
  t12 += v * b9;
  t13 += v * b10;
  t14 += v * b11;
  t15 += v * b12;
  t16 += v * b13;
  t17 += v * b14;
  t18 += v * b15;
  v = a[4];
  t4 += v * b0;
  t5 += v * b1;
  t6 += v * b2;
  t7 += v * b3;
  t8 += v * b4;
  t9 += v * b5;
  t10 += v * b6;
  t11 += v * b7;
  t12 += v * b8;
  t13 += v * b9;
  t14 += v * b10;
  t15 += v * b11;
  t16 += v * b12;
  t17 += v * b13;
  t18 += v * b14;
  t19 += v * b15;
  v = a[5];
  t5 += v * b0;
  t6 += v * b1;
  t7 += v * b2;
  t8 += v * b3;
  t9 += v * b4;
  t10 += v * b5;
  t11 += v * b6;
  t12 += v * b7;
  t13 += v * b8;
  t14 += v * b9;
  t15 += v * b10;
  t16 += v * b11;
  t17 += v * b12;
  t18 += v * b13;
  t19 += v * b14;
  t20 += v * b15;
  v = a[6];
  t6 += v * b0;
  t7 += v * b1;
  t8 += v * b2;
  t9 += v * b3;
  t10 += v * b4;
  t11 += v * b5;
  t12 += v * b6;
  t13 += v * b7;
  t14 += v * b8;
  t15 += v * b9;
  t16 += v * b10;
  t17 += v * b11;
  t18 += v * b12;
  t19 += v * b13;
  t20 += v * b14;
  t21 += v * b15;
  v = a[7];
  t7 += v * b0;
  t8 += v * b1;
  t9 += v * b2;
  t10 += v * b3;
  t11 += v * b4;
  t12 += v * b5;
  t13 += v * b6;
  t14 += v * b7;
  t15 += v * b8;
  t16 += v * b9;
  t17 += v * b10;
  t18 += v * b11;
  t19 += v * b12;
  t20 += v * b13;
  t21 += v * b14;
  t22 += v * b15;
  v = a[8];
  t8 += v * b0;
  t9 += v * b1;
  t10 += v * b2;
  t11 += v * b3;
  t12 += v * b4;
  t13 += v * b5;
  t14 += v * b6;
  t15 += v * b7;
  t16 += v * b8;
  t17 += v * b9;
  t18 += v * b10;
  t19 += v * b11;
  t20 += v * b12;
  t21 += v * b13;
  t22 += v * b14;
  t23 += v * b15;
  v = a[9];
  t9 += v * b0;
  t10 += v * b1;
  t11 += v * b2;
  t12 += v * b3;
  t13 += v * b4;
  t14 += v * b5;
  t15 += v * b6;
  t16 += v * b7;
  t17 += v * b8;
  t18 += v * b9;
  t19 += v * b10;
  t20 += v * b11;
  t21 += v * b12;
  t22 += v * b13;
  t23 += v * b14;
  t24 += v * b15;
  v = a[10];
  t10 += v * b0;
  t11 += v * b1;
  t12 += v * b2;
  t13 += v * b3;
  t14 += v * b4;
  t15 += v * b5;
  t16 += v * b6;
  t17 += v * b7;
  t18 += v * b8;
  t19 += v * b9;
  t20 += v * b10;
  t21 += v * b11;
  t22 += v * b12;
  t23 += v * b13;
  t24 += v * b14;
  t25 += v * b15;
  v = a[11];
  t11 += v * b0;
  t12 += v * b1;
  t13 += v * b2;
  t14 += v * b3;
  t15 += v * b4;
  t16 += v * b5;
  t17 += v * b6;
  t18 += v * b7;
  t19 += v * b8;
  t20 += v * b9;
  t21 += v * b10;
  t22 += v * b11;
  t23 += v * b12;
  t24 += v * b13;
  t25 += v * b14;
  t26 += v * b15;
  v = a[12];
  t12 += v * b0;
  t13 += v * b1;
  t14 += v * b2;
  t15 += v * b3;
  t16 += v * b4;
  t17 += v * b5;
  t18 += v * b6;
  t19 += v * b7;
  t20 += v * b8;
  t21 += v * b9;
  t22 += v * b10;
  t23 += v * b11;
  t24 += v * b12;
  t25 += v * b13;
  t26 += v * b14;
  t27 += v * b15;
  v = a[13];
  t13 += v * b0;
  t14 += v * b1;
  t15 += v * b2;
  t16 += v * b3;
  t17 += v * b4;
  t18 += v * b5;
  t19 += v * b6;
  t20 += v * b7;
  t21 += v * b8;
  t22 += v * b9;
  t23 += v * b10;
  t24 += v * b11;
  t25 += v * b12;
  t26 += v * b13;
  t27 += v * b14;
  t28 += v * b15;
  v = a[14];
  t14 += v * b0;
  t15 += v * b1;
  t16 += v * b2;
  t17 += v * b3;
  t18 += v * b4;
  t19 += v * b5;
  t20 += v * b6;
  t21 += v * b7;
  t22 += v * b8;
  t23 += v * b9;
  t24 += v * b10;
  t25 += v * b11;
  t26 += v * b12;
  t27 += v * b13;
  t28 += v * b14;
  t29 += v * b15;
  v = a[15];
  t15 += v * b0;
  t16 += v * b1;
  t17 += v * b2;
  t18 += v * b3;
  t19 += v * b4;
  t20 += v * b5;
  t21 += v * b6;
  t22 += v * b7;
  t23 += v * b8;
  t24 += v * b9;
  t25 += v * b10;
  t26 += v * b11;
  t27 += v * b12;
  t28 += v * b13;
  t29 += v * b14;
  t30 += v * b15;

  t0  += 38 * t16;
  t1  += 38 * t17;
  t2  += 38 * t18;
  t3  += 38 * t19;
  t4  += 38 * t20;
  t5  += 38 * t21;
  t6  += 38 * t22;
  t7  += 38 * t23;
  t8  += 38 * t24;
  t9  += 38 * t25;
  t10 += 38 * t26;
  t11 += 38 * t27;
  t12 += 38 * t28;
  t13 += 38 * t29;
  t14 += 38 * t30;
  // t15 left as is

  // first car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  // second car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  o[ 0] = t0;
  o[ 1] = t1;
  o[ 2] = t2;
  o[ 3] = t3;
  o[ 4] = t4;
  o[ 5] = t5;
  o[ 6] = t6;
  o[ 7] = t7;
  o[ 8] = t8;
  o[ 9] = t9;
  o[10] = t10;
  o[11] = t11;
  o[12] = t12;
  o[13] = t13;
  o[14] = t14;
  o[15] = t15;
}

function S(o, a) {
  M(o, a, a);
}

function inv25519(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 253; a >= 0; a--) {
    S(c, c);
    if(a !== 2 && a !== 4) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function pow2523(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 250; a >= 0; a--) {
      S(c, c);
      if(a !== 1) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function crypto_scalarmult(q, n, p) {
  var z = new Uint8Array(32);
  var x = new Float64Array(80), r, i;
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf();
  for (i = 0; i < 31; i++) z[i] = n[i];
  z[31]=(n[31]&127)|64;
  z[0]&=248;
  unpack25519(x,p);
  for (i = 0; i < 16; i++) {
    b[i]=x[i];
    d[i]=a[i]=c[i]=0;
  }
  a[0]=d[0]=1;
  for (i=254; i>=0; --i) {
    r=(z[i>>>3]>>>(i&7))&1;
    sel25519(a,b,r);
    sel25519(c,d,r);
    A(e,a,c);
    Z(a,a,c);
    A(c,b,d);
    Z(b,b,d);
    S(d,e);
    S(f,a);
    M(a,c,a);
    M(c,b,e);
    A(e,a,c);
    Z(a,a,c);
    S(b,a);
    Z(c,d,f);
    M(a,c,_121665);
    A(a,a,d);
    M(c,c,a);
    M(a,d,f);
    M(d,b,x);
    S(b,e);
    sel25519(a,b,r);
    sel25519(c,d,r);
  }
  for (i = 0; i < 16; i++) {
    x[i+16]=a[i];
    x[i+32]=c[i];
    x[i+48]=b[i];
    x[i+64]=d[i];
  }
  var x32 = x.subarray(32);
  var x16 = x.subarray(16);
  inv25519(x32,x32);
  M(x16,x16,x32);
  pack25519(q,x16);
  return 0;
}

function crypto_scalarmult_base(q, n) {
  return crypto_scalarmult(q, n, _9);
}

function crypto_box_keypair(y, x) {
  randombytes(x, 32);
  return crypto_scalarmult_base(y, x);
}

function crypto_box_beforenm(k, y, x) {
  var s = new Uint8Array(32);
  crypto_scalarmult(s, x, y);
  return crypto_core_hsalsa20(k, _0, s, sigma);
}

var crypto_box_afternm = crypto_secretbox;
var crypto_box_open_afternm = crypto_secretbox_open;

function crypto_box(c, m, d, n, y, x) {
  var k = new Uint8Array(32);
  crypto_box_beforenm(k, y, x);
  return crypto_box_afternm(c, m, d, n, k);
}

function crypto_box_open(m, c, d, n, y, x) {
  var k = new Uint8Array(32);
  crypto_box_beforenm(k, y, x);
  return crypto_box_open_afternm(m, c, d, n, k);
}

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function crypto_hashblocks_hl(hh, hl, m, n) {
  var wh = new Int32Array(16), wl = new Int32Array(16),
      bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
      bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
      th, tl, i, j, h, l, a, b, c, d;

  var ah0 = hh[0],
      ah1 = hh[1],
      ah2 = hh[2],
      ah3 = hh[3],
      ah4 = hh[4],
      ah5 = hh[5],
      ah6 = hh[6],
      ah7 = hh[7],

      al0 = hl[0],
      al1 = hl[1],
      al2 = hl[2],
      al3 = hl[3],
      al4 = hl[4],
      al5 = hl[5],
      al6 = hl[6],
      al7 = hl[7];

  var pos = 0;
  while (n >= 128) {
    for (i = 0; i < 16; i++) {
      j = 8 * i + pos;
      wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
      wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
    }
    for (i = 0; i < 80; i++) {
      bh0 = ah0;
      bh1 = ah1;
      bh2 = ah2;
      bh3 = ah3;
      bh4 = ah4;
      bh5 = ah5;
      bh6 = ah6;
      bh7 = ah7;

      bl0 = al0;
      bl1 = al1;
      bl2 = al2;
      bl3 = al3;
      bl4 = al4;
      bl5 = al5;
      bl6 = al6;
      bl7 = al7;

      // add
      h = ah7;
      l = al7;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma1
      h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
      l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Ch
      h = (ah4 & ah5) ^ (~ah4 & ah6);
      l = (al4 & al5) ^ (~al4 & al6);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // K
      h = K[i*2];
      l = K[i*2+1];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // w
      h = wh[i%16];
      l = wl[i%16];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      th = c & 0xffff | d << 16;
      tl = a & 0xffff | b << 16;

      // add
      h = th;
      l = tl;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma0
      h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
      l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Maj
      h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
      l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh7 = (c & 0xffff) | (d << 16);
      bl7 = (a & 0xffff) | (b << 16);

      // add
      h = bh3;
      l = bl3;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      h = th;
      l = tl;

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh3 = (c & 0xffff) | (d << 16);
      bl3 = (a & 0xffff) | (b << 16);

      ah1 = bh0;
      ah2 = bh1;
      ah3 = bh2;
      ah4 = bh3;
      ah5 = bh4;
      ah6 = bh5;
      ah7 = bh6;
      ah0 = bh7;

      al1 = bl0;
      al2 = bl1;
      al3 = bl2;
      al4 = bl3;
      al5 = bl4;
      al6 = bl5;
      al7 = bl6;
      al0 = bl7;

      if (i%16 === 15) {
        for (j = 0; j < 16; j++) {
          // add
          h = wh[j];
          l = wl[j];

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = wh[(j+9)%16];
          l = wl[(j+9)%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma0
          th = wh[(j+1)%16];
          tl = wl[(j+1)%16];
          h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
          l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma1
          th = wh[(j+14)%16];
          tl = wl[(j+14)%16];
          h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
          l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          wh[j] = (c & 0xffff) | (d << 16);
          wl[j] = (a & 0xffff) | (b << 16);
        }
      }
    }

    // add
    h = ah0;
    l = al0;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[0];
    l = hl[0];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[0] = ah0 = (c & 0xffff) | (d << 16);
    hl[0] = al0 = (a & 0xffff) | (b << 16);

    h = ah1;
    l = al1;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[1];
    l = hl[1];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[1] = ah1 = (c & 0xffff) | (d << 16);
    hl[1] = al1 = (a & 0xffff) | (b << 16);

    h = ah2;
    l = al2;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[2];
    l = hl[2];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[2] = ah2 = (c & 0xffff) | (d << 16);
    hl[2] = al2 = (a & 0xffff) | (b << 16);

    h = ah3;
    l = al3;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[3];
    l = hl[3];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[3] = ah3 = (c & 0xffff) | (d << 16);
    hl[3] = al3 = (a & 0xffff) | (b << 16);

    h = ah4;
    l = al4;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[4];
    l = hl[4];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[4] = ah4 = (c & 0xffff) | (d << 16);
    hl[4] = al4 = (a & 0xffff) | (b << 16);

    h = ah5;
    l = al5;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[5];
    l = hl[5];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[5] = ah5 = (c & 0xffff) | (d << 16);
    hl[5] = al5 = (a & 0xffff) | (b << 16);

    h = ah6;
    l = al6;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[6];
    l = hl[6];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[6] = ah6 = (c & 0xffff) | (d << 16);
    hl[6] = al6 = (a & 0xffff) | (b << 16);

    h = ah7;
    l = al7;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[7];
    l = hl[7];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[7] = ah7 = (c & 0xffff) | (d << 16);
    hl[7] = al7 = (a & 0xffff) | (b << 16);

    pos += 128;
    n -= 128;
  }

  return n;
}

function crypto_hash(out, m, n) {
  var hh = new Int32Array(8),
      hl = new Int32Array(8),
      x = new Uint8Array(256),
      i, b = n;

  hh[0] = 0x6a09e667;
  hh[1] = 0xbb67ae85;
  hh[2] = 0x3c6ef372;
  hh[3] = 0xa54ff53a;
  hh[4] = 0x510e527f;
  hh[5] = 0x9b05688c;
  hh[6] = 0x1f83d9ab;
  hh[7] = 0x5be0cd19;

  hl[0] = 0xf3bcc908;
  hl[1] = 0x84caa73b;
  hl[2] = 0xfe94f82b;
  hl[3] = 0x5f1d36f1;
  hl[4] = 0xade682d1;
  hl[5] = 0x2b3e6c1f;
  hl[6] = 0xfb41bd6b;
  hl[7] = 0x137e2179;

  crypto_hashblocks_hl(hh, hl, m, n);
  n %= 128;

  for (i = 0; i < n; i++) x[i] = m[b-n+i];
  x[n] = 128;

  n = 256-128*(n<112?1:0);
  x[n-9] = 0;
  ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
  crypto_hashblocks_hl(hh, hl, x, n);

  for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

  return 0;
}

function add(p, q) {
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf(),
      g = gf(), h = gf(), t = gf();

  Z(a, p[1], p[0]);
  Z(t, q[1], q[0]);
  M(a, a, t);
  A(b, p[0], p[1]);
  A(t, q[0], q[1]);
  M(b, b, t);
  M(c, p[3], q[3]);
  M(c, c, D2);
  M(d, p[2], q[2]);
  A(d, d, d);
  Z(e, b, a);
  Z(f, d, c);
  A(g, d, c);
  A(h, b, a);

  M(p[0], e, f);
  M(p[1], h, g);
  M(p[2], g, f);
  M(p[3], e, h);
}

function cswap(p, q, b) {
  var i;
  for (i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b);
  }
}

function pack(r, p) {
  var tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  M(tx, p[0], zi);
  M(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}

function scalarmult(p, q, s) {
  var b, i;
  set25519(p[0], gf0);
  set25519(p[1], gf1);
  set25519(p[2], gf1);
  set25519(p[3], gf0);
  for (i = 255; i >= 0; --i) {
    b = (s[(i/8)|0] >> (i&7)) & 1;
    cswap(p, q, b);
    add(q, p);
    add(p, p);
    cswap(p, q, b);
  }
}

function scalarbase(p, s) {
  var q = [gf(), gf(), gf(), gf()];
  set25519(q[0], X);
  set25519(q[1], Y);
  set25519(q[2], gf1);
  M(q[3], X, Y);
  scalarmult(p, q, s);
}

function crypto_sign_keypair(pk, sk, seeded) {
  var d = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()];
  var i;

  if (!seeded) randombytes(sk, 32);
  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  scalarbase(p, d);
  pack(pk, p);

  for (i = 0; i < 32; i++) sk[i+32] = pk[i];
  return 0;
}

var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

function modL(r, x) {
  var carry, i, j, k;
  for (i = 63; i >= 32; --i) {
    carry = 0;
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)];
      carry = (x[j] + 128) >> 8;
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (j = 0; j < 32; j++) x[j] -= carry * L[j];
  for (i = 0; i < 32; i++) {
    x[i+1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}

function reduce(r) {
  var x = new Float64Array(64), i;
  for (i = 0; i < 64; i++) x[i] = r[i];
  for (i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}

// Note: difference from C - smlen returned, not passed as argument.
function crypto_sign(sm, m, n, sk) {
  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
  var i, j, x = new Float64Array(64);
  var p = [gf(), gf(), gf(), gf()];

  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  var smlen = n + 64;
  for (i = 0; i < n; i++) sm[64 + i] = m[i];
  for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

  crypto_hash(r, sm.subarray(32), n+32);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 32; i < 64; i++) sm[i] = sk[i];
  crypto_hash(h, sm, n + 64);
  reduce(h);

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i+j] += h[i] * d[j];
    }
  }

  modL(sm.subarray(32), x);
  return smlen;
}

function unpackneg(r, p) {
  var t = gf(), chk = gf(), num = gf(),
      den = gf(), den2 = gf(), den4 = gf(),
      den6 = gf();

  set25519(r[2], gf1);
  unpack25519(r[1], p);
  S(num, r[1]);
  M(den, num, D);
  Z(num, num, r[2]);
  A(den, r[2], den);

  S(den2, den);
  S(den4, den2);
  M(den6, den4, den2);
  M(t, den6, num);
  M(t, t, den);

  pow2523(t, t);
  M(t, t, num);
  M(t, t, den);
  M(t, t, den);
  M(r[0], t, den);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) M(r[0], r[0], I);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) return -1;

  if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

  M(r[3], r[0], r[1]);
  return 0;
}

function crypto_sign_open(m, sm, n, pk) {
  var i, mlen;
  var t = new Uint8Array(32), h = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()],
      q = [gf(), gf(), gf(), gf()];

  mlen = -1;
  if (n < 64) return -1;

  if (unpackneg(q, pk)) return -1;

  for (i = 0; i < n; i++) m[i] = sm[i];
  for (i = 0; i < 32; i++) m[i+32] = pk[i];
  crypto_hash(h, m, n);
  reduce(h);
  scalarmult(p, q, h);

  scalarbase(q, sm.subarray(32));
  add(p, q);
  pack(t, p);

  n -= 64;
  if (crypto_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0;
    return -1;
  }

  for (i = 0; i < n; i++) m[i] = sm[i + 64];
  mlen = n;
  return mlen;
}

var crypto_secretbox_KEYBYTES = 32,
    crypto_secretbox_NONCEBYTES = 24,
    crypto_secretbox_ZEROBYTES = 32,
    crypto_secretbox_BOXZEROBYTES = 16,
    crypto_scalarmult_BYTES = 32,
    crypto_scalarmult_SCALARBYTES = 32,
    crypto_box_PUBLICKEYBYTES = 32,
    crypto_box_SECRETKEYBYTES = 32,
    crypto_box_BEFORENMBYTES = 32,
    crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
    crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
    crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
    crypto_sign_BYTES = 64,
    crypto_sign_PUBLICKEYBYTES = 32,
    crypto_sign_SECRETKEYBYTES = 64,
    crypto_sign_SEEDBYTES = 32,
    crypto_hash_BYTES = 64;

nacl.lowlevel = {
  crypto_core_hsalsa20: crypto_core_hsalsa20,
  crypto_stream_xor: crypto_stream_xor,
  crypto_stream: crypto_stream,
  crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
  crypto_stream_salsa20: crypto_stream_salsa20,
  crypto_onetimeauth: crypto_onetimeauth,
  crypto_onetimeauth_verify: crypto_onetimeauth_verify,
  crypto_verify_16: crypto_verify_16,
  crypto_verify_32: crypto_verify_32,
  crypto_secretbox: crypto_secretbox,
  crypto_secretbox_open: crypto_secretbox_open,
  crypto_scalarmult: crypto_scalarmult,
  crypto_scalarmult_base: crypto_scalarmult_base,
  crypto_box_beforenm: crypto_box_beforenm,
  crypto_box_afternm: crypto_box_afternm,
  crypto_box: crypto_box,
  crypto_box_open: crypto_box_open,
  crypto_box_keypair: crypto_box_keypair,
  crypto_hash: crypto_hash,
  crypto_sign: crypto_sign,
  crypto_sign_keypair: crypto_sign_keypair,
  crypto_sign_open: crypto_sign_open,

  crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
  crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
  crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
  crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
  crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
  crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
  crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
  crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
  crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
  crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
  crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
  crypto_sign_BYTES: crypto_sign_BYTES,
  crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
  crypto_hash_BYTES: crypto_hash_BYTES
};

/* High-level API */

function checkLengths(k, n) {
  if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
  if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
}

function checkBoxLengths(pk, sk) {
  if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
  if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
}

function checkArrayTypes() {
  var t, i;
  for (i = 0; i < arguments.length; i++) {
     if ((t = Object.prototype.toString.call(arguments[i])) !== '[object Uint8Array]')
       throw new TypeError('unexpected type ' + t + ', use Uint8Array');
  }
}

function cleanup(arr) {
  for (var i = 0; i < arr.length; i++) arr[i] = 0;
}

// TODO: Completely remove this in v0.15.
if (!nacl.util) {
  nacl.util = {};
  nacl.util.decodeUTF8 = nacl.util.encodeUTF8 = nacl.util.encodeBase64 = nacl.util.decodeBase64 = function() {
    throw new Error('nacl.util moved into separate package: https://github.com/dchest/tweetnacl-util-js');
  };
}

nacl.randomBytes = function(n) {
  var b = new Uint8Array(n);
  randombytes(b, n);
  return b;
};

nacl.secretbox = function(msg, nonce, key) {
  checkArrayTypes(msg, nonce, key);
  checkLengths(key, nonce);
  var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
  var c = new Uint8Array(m.length);
  for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
  crypto_secretbox(c, m, m.length, nonce, key);
  return c.subarray(crypto_secretbox_BOXZEROBYTES);
};

nacl.secretbox.open = function(box, nonce, key) {
  checkArrayTypes(box, nonce, key);
  checkLengths(key, nonce);
  var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
  var m = new Uint8Array(c.length);
  for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
  if (c.length < 32) return false;
  if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return false;
  return m.subarray(crypto_secretbox_ZEROBYTES);
};

nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

nacl.scalarMult = function(n, p) {
  checkArrayTypes(n, p);
  if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
  if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
  var q = new Uint8Array(crypto_scalarmult_BYTES);
  crypto_scalarmult(q, n, p);
  return q;
};

nacl.scalarMult.base = function(n) {
  checkArrayTypes(n);
  if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
  var q = new Uint8Array(crypto_scalarmult_BYTES);
  crypto_scalarmult_base(q, n);
  return q;
};

nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

nacl.box = function(msg, nonce, publicKey, secretKey) {
  var k = nacl.box.before(publicKey, secretKey);
  return nacl.secretbox(msg, nonce, k);
};

nacl.box.before = function(publicKey, secretKey) {
  checkArrayTypes(publicKey, secretKey);
  checkBoxLengths(publicKey, secretKey);
  var k = new Uint8Array(crypto_box_BEFORENMBYTES);
  crypto_box_beforenm(k, publicKey, secretKey);
  return k;
};

nacl.box.after = nacl.secretbox;

nacl.box.open = function(msg, nonce, publicKey, secretKey) {
  var k = nacl.box.before(publicKey, secretKey);
  return nacl.secretbox.open(msg, nonce, k);
};

nacl.box.open.after = nacl.secretbox.open;

nacl.box.keyPair = function() {
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
  crypto_box_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.box.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_box_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  crypto_scalarmult_base(pk, secretKey);
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
nacl.box.nonceLength = crypto_box_NONCEBYTES;
nacl.box.overheadLength = nacl.secretbox.overheadLength;

nacl.sign = function(msg, secretKey) {
  checkArrayTypes(msg, secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
  crypto_sign(signedMsg, msg, msg.length, secretKey);
  return signedMsg;
};

nacl.sign.open = function(signedMsg, publicKey) {
  if (arguments.length !== 2)
    throw new Error('nacl.sign.open accepts 2 arguments; did you mean to use nacl.sign.detached.verify?');
  checkArrayTypes(signedMsg, publicKey);
  if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
    throw new Error('bad public key size');
  var tmp = new Uint8Array(signedMsg.length);
  var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
  if (mlen < 0) return null;
  var m = new Uint8Array(mlen);
  for (var i = 0; i < m.length; i++) m[i] = tmp[i];
  return m;
};

nacl.sign.detached = function(msg, secretKey) {
  var signedMsg = nacl.sign(msg, secretKey);
  var sig = new Uint8Array(crypto_sign_BYTES);
  for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
  return sig;
};

nacl.sign.detached.verify = function(msg, sig, publicKey) {
  checkArrayTypes(msg, sig, publicKey);
  if (sig.length !== crypto_sign_BYTES)
    throw new Error('bad signature size');
  if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
    throw new Error('bad public key size');
  var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
  var m = new Uint8Array(crypto_sign_BYTES + msg.length);
  var i;
  for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
  for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
  return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
};

nacl.sign.keyPair = function() {
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  crypto_sign_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.sign.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.sign.keyPair.fromSeed = function(seed) {
  checkArrayTypes(seed);
  if (seed.length !== crypto_sign_SEEDBYTES)
    throw new Error('bad seed size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  for (var i = 0; i < 32; i++) sk[i] = seed[i];
  crypto_sign_keypair(pk, sk, true);
  return {publicKey: pk, secretKey: sk};
};

nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
nacl.sign.seedLength = crypto_sign_SEEDBYTES;
nacl.sign.signatureLength = crypto_sign_BYTES;

nacl.hash = function(msg) {
  checkArrayTypes(msg);
  var h = new Uint8Array(crypto_hash_BYTES);
  crypto_hash(h, msg, msg.length);
  return h;
};

nacl.hash.hashLength = crypto_hash_BYTES;

nacl.verify = function(x, y) {
  checkArrayTypes(x, y);
  // Zero length arguments are considered not equal.
  if (x.length === 0 || y.length === 0) return false;
  if (x.length !== y.length) return false;
  return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
};

nacl.setPRNG = function(fn) {
  randombytes = fn;
};

(function() {
  // Initialize PRNG if environment provides CSPRNG.
  // If not, methods calling randombytes will throw.
  var crypto = typeof self !== 'undefined' ? (self.crypto || self.msCrypto) : null;
  if (crypto && crypto.getRandomValues) {
    // Browsers.
    var QUOTA = 65536;
    nacl.setPRNG(function(x, n) {
      var i, v = new Uint8Array(n);
      for (i = 0; i < n; i += QUOTA) {
        crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
      }
      for (i = 0; i < n; i++) x[i] = v[i];
      cleanup(v);
    });
  } else if (true) {
    // Node.js.
    crypto = __webpack_require__(417);
    if (crypto && crypto.randomBytes) {
      nacl.setPRNG(function(x, n) {
        var i, v = crypto.randomBytes(n);
        for (i = 0; i < n; i++) x[i] = v[i];
        cleanup(v);
      });
    }
  }
})();

})( true && module.exports ? module.exports : (self.nacl = self.nacl || {}));


/***/ }),

/***/ 211:
/***/ (function(module) {

module.exports = require("https");

/***/ }),

/***/ 215:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
/* eslint-disable node/no-deprecated-api */



var buffer = __webpack_require__(293)
var Buffer = buffer.Buffer

var safer = {}

var key

for (key in buffer) {
  if (!buffer.hasOwnProperty(key)) continue
  if (key === 'SlowBuffer' || key === 'Buffer') continue
  safer[key] = buffer[key]
}

var Safer = safer.Buffer = {}
for (key in Buffer) {
  if (!Buffer.hasOwnProperty(key)) continue
  if (key === 'allocUnsafe' || key === 'allocUnsafeSlow') continue
  Safer[key] = Buffer[key]
}

safer.Buffer.prototype = Buffer.prototype

if (!Safer.from || Safer.from === Uint8Array.from) {
  Safer.from = function (value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value)
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' + typeof value)
    }
    return Buffer(value, encodingOrOffset, length)
  }
}

if (!Safer.alloc) {
  Safer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size)
    }
    if (size < 0 || size >= 2 * (1 << 30)) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
    var buf = Buffer(size)
    if (!fill || fill.length === 0) {
      buf.fill(0)
    } else if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
    return buf
  }
}

if (!safer.kStringMaxLength) {
  try {
    safer.kStringMaxLength = process.binding('buffer').kStringMaxLength
  } catch (e) {
    // we can't determine kStringMaxLength in environments where process.binding
    // is unsupported, so let's not set it
  }
}

if (!safer.constants) {
  safer.constants = {
    MAX_LENGTH: safer.kMaxLength
  }
  if (safer.kStringMaxLength) {
    safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength
  }
}

module.exports = safer


/***/ }),

/***/ 216:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var ERR_INVALID_OPT_VALUE = __webpack_require__(563).codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};

/***/ }),

/***/ 226:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
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


module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = __webpack_require__(614).EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = __webpack_require__(427);
/*</replacement>*/


var Buffer = __webpack_require__(293).Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = __webpack_require__(669);

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = __webpack_require__(896);

var destroyImpl = __webpack_require__(232);

var _require = __webpack_require__(216),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = __webpack_require__(563).codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

__webpack_require__(689)(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(831);
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(674).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(831);
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(674).StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = __webpack_require__(46);
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = __webpack_require__(176);
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}

/***/ }),

/***/ 232:
/***/ (function(module) {

"use strict";
 // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};

/***/ }),

/***/ 238:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).


var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = __webpack_require__(563).codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = __webpack_require__(740);
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;

/***/ }),

/***/ 241:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
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
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.


module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: __webpack_require__(917)
};
/*</replacement>*/

/*<replacement>*/

var Stream = __webpack_require__(427);
/*</replacement>*/


var Buffer = __webpack_require__(293).Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = __webpack_require__(232);

var _require = __webpack_require__(216),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = __webpack_require__(563).codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

__webpack_require__(689)(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(831);
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(831); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};

/***/ }),

/***/ 244:
/***/ (function(module) {

function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function Manager(interval, streamInterval, kaCountMax) {
  var streams = this._streams = [];
  this._timer = undefined;
  this._timerInterval = interval;
  this._timerfn = function() {
    var now = Date.now();
    for (var i = 0, len = streams.length, s, last; i < len; ++i) {
      s = streams[i];
      last = s._kalast;
      if (last && (now - last) >= streamInterval) {
        if (++s._kacnt > kaCountMax) {
          var err = new Error('Keepalive timeout');
          err.level = 'client-timeout';
          s.emit('error', err);
          s.disconnect();
          spliceOne(streams, i);
          --i;
          len = streams.length;
        } else {
          s._kalast = now;
          // XXX: if the server ever starts sending real global requests to the
          //      client, we will need to add a dummy callback here to keep the
          //      correct reply order
          s.ping();
        }
      }
    }
  };
}

Manager.prototype.start = function() {
  if (this._timer)
    this.stop();
  this._timer = setInterval(this._timerfn, this._timerInterval);
};

Manager.prototype.stop = function() {
  if (this._timer) {
    clearInterval(this._timer);
    this._timer = undefined;
  }
};

Manager.prototype.add = function(stream) {
  var streams = this._streams,
      self = this;

  stream.once('end', function() {
    self.remove(stream);
  }).on('packet', resetKA);

  streams[streams.length] = stream;

  resetKA();

  if (!this._timer)
    this.start();

  function resetKA() {
    stream._kalast = Date.now();
    stream._kacnt = 0;
  }
};

Manager.prototype.remove = function(stream) {
  var streams = this._streams,
      index = streams.indexOf(stream);
  if (index > -1)
    spliceOne(streams, index);
  if (!streams.length)
    this.stop();
};

module.exports = Manager;


/***/ }),

/***/ 249:
/***/ (function(module, __unusedexports, __webpack_require__) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

var errors = __webpack_require__(584);
var types = __webpack_require__(362);

var Reader = __webpack_require__(733);
var Writer = __webpack_require__(998);


// --- Exports

module.exports = {

  Reader: Reader,

  Writer: Writer

};

for (var t in types) {
  if (types.hasOwnProperty(t))
    module.exports[t] = types[t];
}
for (var e in errors) {
  if (errors.hasOwnProperty(e))
    module.exports[e] = errors[e];
}


/***/ }),

/***/ 255:
/***/ (function(module) {

// https://github.com/HenrikJoreteg/extend-object/blob/v0.1.0/extend-object.js

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

module.exports.extend = function(obj) {
  each.call(slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

module.exports.processArgs = function(opts, callback, defaultOpts) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }
  return {
    callback: callback,
    opts: module.exports.extend({}, defaultOpts, opts)
  };
};


/**
 * Parse the given repo tag name (as a string) and break it out into repo/tag pair.
 * // if given the input http://localhost:8080/woot:latest
 * {
 *   repository: 'http://localhost:8080/woot',
 *   tag: 'latest'
 * }
 * @param {String} input Input e.g: 'repo/foo', 'ubuntu', 'ubuntu:latest'
 * @return {Object} input parsed into the repo and tag.
 */
module.exports.parseRepositoryTag = function(input) {
  var separatorPos;
  var digestPos = input.indexOf('@');
  var colonPos = input.lastIndexOf(':');
  // @ symbol is more important
  if (digestPos >= 0) {
    separatorPos = digestPos;
  } else if (colonPos >= 0) {
    separatorPos = colonPos;
  } else {
    // no colon nor @
    return {
      repository: input
    };
  }

  // last colon is either the tag (or part of a port designation)
  var tag = input.slice(separatorPos + 1);

  // if it contains a / its not a tag and is part of the url
  if (tag.indexOf('/') === -1) {
    return {
      repository: input.slice(0, separatorPos),
      tag: tag
    };
  }

  return {
    repository: input
  };
};


/***/ }),

/***/ 279:
/***/ (function(module, __unusedexports, __webpack_require__) {

var net = __webpack_require__(631);
var EventEmitter = __webpack_require__(614).EventEmitter;
var listenerCount = EventEmitter.listenerCount;
var inherits = __webpack_require__(669).inherits;

var ssh2_streams = __webpack_require__(139);
var parseKey = ssh2_streams.utils.parseKey;
var SSH2Stream = ssh2_streams.SSH2Stream;
var SFTPStream = ssh2_streams.SFTPStream;
var consts = ssh2_streams.constants;
var DISCONNECT_REASON = consts.DISCONNECT_REASON;
var CHANNEL_OPEN_FAILURE = consts.CHANNEL_OPEN_FAILURE;
var ALGORITHMS = consts.ALGORITHMS;

var Channel = __webpack_require__(89);
var KeepaliveManager = __webpack_require__(244);
var writeUInt32BE = __webpack_require__(58).writeUInt32BE;

var MAX_CHANNEL = Math.pow(2, 32) - 1;
var MAX_PENDING_AUTHS = 10;

var kaMgr;

function Server(cfg, listener) {
  if (!(this instanceof Server))
    return new Server(cfg, listener);

  var hostKeys = {
    'ssh-rsa': null,
    'ssh-dss': null,
    'ssh-ed25519': null,
    'ecdsa-sha2-nistp256': null,
    'ecdsa-sha2-nistp384': null,
    'ecdsa-sha2-nistp521': null
  };

  var hostKeys_ = cfg.hostKeys;
  if (!Array.isArray(hostKeys_))
    throw new Error('hostKeys must be an array');

  var i;
  for (i = 0; i < hostKeys_.length; ++i) {
    var privateKey;
    if (Buffer.isBuffer(hostKeys_[i]) || typeof hostKeys_[i] === 'string')
      privateKey = parseKey(hostKeys_[i]);
    else
      privateKey = parseKey(hostKeys_[i].key, hostKeys_[i].passphrase);
    if (privateKey instanceof Error)
      throw new Error('Cannot parse privateKey: ' + privateKey.message);
    if (Array.isArray(privateKey))
      privateKey = privateKey[0]; // OpenSSH's newer format only stores 1 key for now
    if (privateKey.getPrivatePEM() === null)
      throw new Error('privateKey value contains an invalid private key');
    if (hostKeys[privateKey.type])
      continue;
    hostKeys[privateKey.type] = privateKey;
  }

  var algorithms = {
    kex: undefined,
    kexBuf: undefined,
    cipher: undefined,
    cipherBuf: undefined,
    serverHostKey: undefined,
    serverHostKeyBuf: undefined,
    hmac: undefined,
    hmacBuf: undefined,
    compress: undefined,
    compressBuf: undefined
  };
  if (typeof cfg.algorithms === 'object' && cfg.algorithms !== null) {
    var algosSupported;
    var algoList;

    algoList = cfg.algorithms.kex;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_KEX;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported key exchange algorithm: ' + algoList[i]);
      }
      algorithms.kex = algoList;
    }

    algoList = cfg.algorithms.cipher;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_CIPHER;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported cipher algorithm: ' + algoList[i]);
      }
      algorithms.cipher = algoList;
    }

    algoList = cfg.algorithms.serverHostKey;
    var copied = false;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_SERVER_HOST_KEY;
      for (i = algoList.length - 1; i >= 0; --i) {
        if (algosSupported.indexOf(algoList[i]) === -1) {
          throw new Error('Unsupported server host key algorithm: '
                           + algoList[i]);
        }
        if (!hostKeys[algoList[i]]) {
          // Silently discard for now
          if (!copied) {
            algoList = algoList.slice();
            copied = true;
          }
          algoList.splice(i, 1);
        }
      }
      if (algoList.length > 0)
        algorithms.serverHostKey = algoList;
    }

    algoList = cfg.algorithms.hmac;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_HMAC;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported HMAC algorithm: ' + algoList[i]);
      }
      algorithms.hmac = algoList;
    }

    algoList = cfg.algorithms.compress;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_COMPRESS;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported compression algorithm: ' + algoList[i]);
      }
      algorithms.compress = algoList;
    }
  }

  // Make sure we at least have some kind of valid list of support key
  // formats
  if (algorithms.serverHostKey === undefined) {
    var hostKeyAlgos = Object.keys(hostKeys);
    for (i = hostKeyAlgos.length - 1; i >= 0; --i) {
      if (!hostKeys[hostKeyAlgos[i]])
        hostKeyAlgos.splice(i, 1);
    }
    algorithms.serverHostKey = hostKeyAlgos;
  }

  if (!kaMgr
      && Server.KEEPALIVE_INTERVAL > 0
      && Server.KEEPALIVE_CLIENT_INTERVAL > 0
      && Server.KEEPALIVE_CLIENT_COUNT_MAX >= 0) {
    kaMgr = new KeepaliveManager(Server.KEEPALIVE_INTERVAL,
                                 Server.KEEPALIVE_CLIENT_INTERVAL,
                                 Server.KEEPALIVE_CLIENT_COUNT_MAX);
  }

  var self = this;

  EventEmitter.call(this);

  if (typeof listener === 'function')
    self.on('connection', listener);

  var streamcfg = {
    algorithms: algorithms,
    hostKeys: hostKeys,
    server: true
  };
  var keys;
  var len;
  for (i = 0, keys = Object.keys(cfg), len = keys.length; i < len; ++i) {
    var key = keys[i];
    if (key === 'privateKey'
        || key === 'publicKey'
        || key === 'passphrase'
        || key === 'algorithms'
        || key === 'hostKeys'
        || key === 'server') {
      continue;
    }
    streamcfg[key] = cfg[key];
  }

  if (typeof streamcfg.debug === 'function') {
    var oldDebug = streamcfg.debug;
    var cfgKeys = Object.keys(streamcfg);
  }

  this._srv = new net.Server(function(socket) {
    if (self._connections >= self.maxConnections) {
      socket.destroy();
      return;
    }
    ++self._connections;
    socket.once('close', function(had_err) {
      --self._connections;

      // since joyent/node#993bb93e0a, we have to "read past EOF" in order to
      // get an `end` event on streams. thankfully adding this does not
      // negatively affect node versions pre-joyent/node#993bb93e0a.
      sshstream.read();
    }).on('error', function(err) {
      sshstream.reset();
      sshstream.emit('error', err);
    });

    var conncfg = streamcfg;

    // prepend debug output with a unique identifier in case there are multiple
    // clients connected at the same time
    if (oldDebug) {
      conncfg = {};
      for (var i = 0, key; i < cfgKeys.length; ++i) {
        key = cfgKeys[i];
        conncfg[key] = streamcfg[key];
      }
      var debugPrefix = '[' + process.hrtime().join('.') + '] ';
      conncfg.debug = function(msg) {
        oldDebug(debugPrefix + msg);
      };
    }

    var sshstream = new SSH2Stream(conncfg);
    var client = new Client(sshstream, socket);

    socket.pipe(sshstream).pipe(socket);

    // silence pre-header errors
    function onClientPreHeaderError(err) {}
    client.on('error', onClientPreHeaderError);

    sshstream.once('header', function(header) {
      if (sshstream._readableState.ended) {
        // already disconnected internally in SSH2Stream due to incompatible
        // protocol version
        return;
      } else if (!listenerCount(self, 'connection')) {
        // auto reject
        return sshstream.disconnect(DISCONNECT_REASON.BY_APPLICATION);
      }

      client.removeListener('error', onClientPreHeaderError);

      self.emit('connection',
                client,
                { ip: socket.remoteAddress,
                  family: socket.remoteFamily,
                  port: socket.remotePort,
                  header: header });
    });
  }).on('error', function(err) {
    self.emit('error', err);
  }).on('listening', function() {
    self.emit('listening');
  }).on('close', function() {
    self.emit('close');
  });
  this._connections = 0;
  this.maxConnections = Infinity;
}
inherits(Server, EventEmitter);

Server.prototype.listen = function() {
  this._srv.listen.apply(this._srv, arguments);
  return this;
};

Server.prototype.address = function() {
  return this._srv.address();
};

Server.prototype.getConnections = function(cb) {
  this._srv.getConnections(cb);
};

Server.prototype.close = function(cb) {
  this._srv.close(cb);
  return this;
};

Server.prototype.ref = function() {
  this._srv.ref();
};

Server.prototype.unref = function() {
  this._srv.unref();
};


function Client(stream, socket) {
  EventEmitter.call(this);

  var self = this;

  this._sshstream = stream;
  var channels = this._channels = {};
  this._curChan = -1;
  this._sock = socket;
  this.noMoreSessions = false;
  this.authenticated = false;

  stream.on('end', function() {
    socket.resume();
    self.emit('end');
  }).on('close', function(hasErr) {
    self.emit('close', hasErr);
  }).on('error', function(err) {
    self.emit('error', err);
  }).on('drain', function() {
    self.emit('drain');
  }).on('continue', function() {
    self.emit('continue');
  });

  var exchanges = 0;
  var acceptedAuthSvc = false;
  var pendingAuths = [];
  var authCtx;

  // begin service/auth-related ================================================
  stream.on('SERVICE_REQUEST', function(service) {
    if (exchanges === 0
        || acceptedAuthSvc
        || self.authenticated
        || service !== 'ssh-userauth')
      return stream.disconnect(DISCONNECT_REASON.SERVICE_NOT_AVAILABLE);

    acceptedAuthSvc = true;
    stream.serviceAccept(service);
  }).on('USERAUTH_REQUEST', onUSERAUTH_REQUEST);
  function onUSERAUTH_REQUEST(username, service, method, methodData) {
    if (exchanges === 0
        || (authCtx
            && (authCtx.username !== username || authCtx.service !== service))
          // TODO: support hostbased auth
        || (method !== 'password'
            && method !== 'publickey'
            && method !== 'hostbased'
            && method !== 'keyboard-interactive'
            && method !== 'none')
        || pendingAuths.length === MAX_PENDING_AUTHS)
      return stream.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    else if (service !== 'ssh-connection')
      return stream.disconnect(DISCONNECT_REASON.SERVICE_NOT_AVAILABLE);

    // XXX: this really shouldn't be reaching into private state ...
    stream._state.authMethod = method;

    var ctx;
    if (method === 'keyboard-interactive') {
      ctx = new KeyboardAuthContext(stream, username, service, method,
                                    methodData, onAuthDecide);
    } else if (method === 'publickey') {
      ctx = new PKAuthContext(stream, username, service, method, methodData,
                              onAuthDecide);
    } else if (method === 'hostbased') {
      ctx = new HostbasedAuthContext(stream, username, service, method,
                                     methodData, onAuthDecide);
    } else if (method === 'password') {
      ctx = new PwdAuthContext(stream, username, service, method, methodData,
                               onAuthDecide);
    } else if (method === 'none')
      ctx = new AuthContext(stream, username, service, method, onAuthDecide);

    if (authCtx) {
      if (!authCtx._initialResponse)
        return pendingAuths.push(ctx);
      else if (authCtx._multistep && !this._finalResponse) {
        // RFC 4252 says to silently abort the current auth request if a new
        // auth request comes in before the final response from an auth method
        // that requires additional request/response exchanges -- this means
        // keyboard-interactive for now ...
        authCtx._cleanup && authCtx._cleanup();
        authCtx.emit('abort');
      }
    }

    authCtx = ctx;

    if (listenerCount(self, 'authentication'))
      self.emit('authentication', authCtx);
    else
      authCtx.reject();
  }
  function onAuthDecide(ctx, allowed, methodsLeft, isPartial) {
    if (authCtx === ctx && !self.authenticated) {
      if (allowed) {
        stream.removeListener('USERAUTH_REQUEST', onUSERAUTH_REQUEST);
        authCtx = undefined;
        self.authenticated = true;
        stream.authSuccess();
        pendingAuths = [];
        self.emit('ready');
      } else {
        stream.authFailure(methodsLeft, isPartial);
        if (pendingAuths.length) {
          authCtx = pendingAuths.pop();
          if (listenerCount(self, 'authentication'))
            self.emit('authentication', authCtx);
          else
            authCtx.reject();
        }
      }
    }
  }
  // end service/auth-related ==================================================

  var unsentGlobalRequestsReplies = [];

  function sendReplies() {
    var reply;
    while (unsentGlobalRequestsReplies.length > 0
           && unsentGlobalRequestsReplies[0].type) {
      reply = unsentGlobalRequestsReplies.shift();
      if (reply.type === 'SUCCESS')
        stream.requestSuccess(reply.buf);
      if (reply.type === 'FAILURE')
        stream.requestFailure();
    }
  }

  stream.on('GLOBAL_REQUEST', function(name, wantReply, data) {
    var reply = {
      type: null,
      buf: null
    };

    function setReply(type, buf) {
      reply.type = type;
      reply.buf = buf;
      sendReplies();
    }

    if (wantReply)
      unsentGlobalRequestsReplies.push(reply);

    if ((name === 'tcpip-forward'
         || name === 'cancel-tcpip-forward'
         || name === 'no-more-sessions@openssh.com'
         || name === 'streamlocal-forward@openssh.com'
         || name === 'cancel-streamlocal-forward@openssh.com')
        && listenerCount(self, 'request')
        && self.authenticated) {
      var accept;
      var reject;

      if (wantReply) {
        var replied = false;
        accept = function(chosenPort) {
          if (replied)
            return;
          replied = true;
          var bufPort;
          if (name === 'tcpip-forward'
              && data.bindPort === 0
              && typeof chosenPort === 'number') {
            bufPort = Buffer.allocUnsafe(4);
            writeUInt32BE(bufPort, chosenPort, 0);
          }
          setReply('SUCCESS', bufPort);
        };
        reject = function() {
          if (replied)
            return;
          replied = true;
          setReply('FAILURE');
        };
      }

      if (name === 'no-more-sessions@openssh.com') {
        self.noMoreSessions = true;
        accept && accept();
        return;
      }

      self.emit('request', accept, reject, name, data);
    } else if (wantReply)
      setReply('FAILURE');
  });

  stream.on('CHANNEL_OPEN', function(info) {
    // do early reject in some cases to prevent wasteful channel allocation
    if ((info.type === 'session' && self.noMoreSessions)
        || !self.authenticated) {
      var reasonCode = CHANNEL_OPEN_FAILURE.ADMINISTRATIVELY_PROHIBITED;
      return stream.channelOpenFail(info.sender, reasonCode);
    }

    var localChan = nextChannel(self);
    var accept;
    var reject;
    var replied = false;
    if (localChan === false) {
      // auto-reject due to no channels available
      return stream.channelOpenFail(info.sender,
                                    CHANNEL_OPEN_FAILURE.RESOURCE_SHORTAGE);
    }

    // be optimistic, reserve channel to prevent another request from trying to
    // take the same channel
    channels[localChan] = true;

    reject = function() {
      if (replied)
        return;

      replied = true;

      delete channels[localChan];

      var reasonCode = CHANNEL_OPEN_FAILURE.ADMINISTRATIVELY_PROHIBITED;
      return stream.channelOpenFail(info.sender, reasonCode);
    };

    switch (info.type) {
      case 'session':
        if (listenerCount(self, 'session')) {
          accept = function() {
            if (replied)
              return;

            replied = true;

            stream.channelOpenConfirm(info.sender,
                                      localChan,
                                      Channel.MAX_WINDOW,
                                      Channel.PACKET_SIZE);

            return new Session(self, info, localChan);
          };

          self.emit('session', accept, reject);
        } else
          reject();
      break;
      case 'direct-tcpip':
        if (listenerCount(self, 'tcpip')) {
          accept = function() {
            if (replied)
              return;

            replied = true;

            stream.channelOpenConfirm(info.sender,
                                      localChan,
                                      Channel.MAX_WINDOW,
                                      Channel.PACKET_SIZE);

            var chaninfo = {
              type: undefined,
              incoming: {
                id: localChan,
                window: Channel.MAX_WINDOW,
                packetSize: Channel.PACKET_SIZE,
                state: 'open'
              },
              outgoing: {
                id: info.sender,
                window: info.window,
                packetSize: info.packetSize,
                state: 'open'
              }
            };

            return new Channel(chaninfo, self);
          };

          self.emit('tcpip', accept, reject, info.data);
        } else
          reject();
      break;
      case 'direct-streamlocal@openssh.com':
        if (listenerCount(self, 'openssh.streamlocal')) {
          accept = function() {
            if (replied)
              return;

            replied = true;

            stream.channelOpenConfirm(info.sender,
                                      localChan,
                                      Channel.MAX_WINDOW,
                                      Channel.PACKET_SIZE);

            var chaninfo = {
              type: undefined,
              incoming: {
                id: localChan,
                window: Channel.MAX_WINDOW,
                packetSize: Channel.PACKET_SIZE,
                state: 'open'
              },
              outgoing: {
                id: info.sender,
                window: info.window,
                packetSize: info.packetSize,
                state: 'open'
              }
            };

            return new Channel(chaninfo, self);
          };

          self.emit('openssh.streamlocal', accept, reject, info.data);
        } else
          reject();
      break;
      default:
        // auto-reject unsupported channel types
        reject();
    }
  });

  stream.on('NEWKEYS', function() {
    if (++exchanges > 1)
      self.emit('rekey');
  });

  if (kaMgr) {
    this.once('ready', function() {
      kaMgr.add(stream);
    });
  }
}
inherits(Client, EventEmitter);

Client.prototype.end = function() {
  return this._sshstream.disconnect(DISCONNECT_REASON.BY_APPLICATION);
};

Client.prototype.x11 = function(originAddr, originPort, cb) {
  var opts = {
    originAddr: originAddr,
    originPort: originPort
  };
  return openChannel(this, 'x11', opts, cb);
};

Client.prototype.forwardOut = function(boundAddr, boundPort, remoteAddr,
                                       remotePort, cb) {
  var opts = {
    boundAddr: boundAddr,
    boundPort: boundPort,
    remoteAddr: remoteAddr,
    remotePort: remotePort
  };
  return openChannel(this, 'forwarded-tcpip', opts, cb);
};

Client.prototype.openssh_forwardOutStreamLocal = function(socketPath, cb) {
  var opts = {
    socketPath: socketPath
  };
  return openChannel(this, 'forwarded-streamlocal@openssh.com', opts, cb);
};

Client.prototype.rekey = function(cb) {
  var stream = this._sshstream;
  var ret = true;
  var error;

  try {
    ret = stream.rekey();
  } catch (ex) {
    error = ex;
  }

  // TODO: re-throw error if no callback?

  if (typeof cb === 'function') {
    if (error) {
      process.nextTick(function() {
        cb(error);
      });
    } else
      this.once('rekey', cb);
  }

  return ret;
};

function Session(client, info, localChan) {
  this.subtype = undefined;

  var ending = false;
  var self = this;
  var outgoingId = info.sender;
  var channel;

  var chaninfo = {
    type: 'session',
    incoming: {
      id: localChan,
      window: Channel.MAX_WINDOW,
      packetSize: Channel.PACKET_SIZE,
      state: 'open'
    },
    outgoing: {
      id: info.sender,
      window: info.window,
      packetSize: info.packetSize,
      state: 'open'
    }
  };

  function onREQUEST(info) {
    var replied = false;
    var accept;
    var reject;

    if (info.wantReply) {
      // "real session" requests will have custom accept behaviors
      if (info.request !== 'shell'
          && info.request !== 'exec'
          && info.request !== 'subsystem') {
        accept = function() {
          if (replied || ending || channel)
            return;

          replied = true;

          return client._sshstream.channelSuccess(outgoingId);
        };
      }

      reject = function() {
        if (replied || ending || channel)
          return;

        replied = true;

        return client._sshstream.channelFailure(outgoingId);
      };
    }

    if (ending) {
      reject && reject();
      return;
    }

    switch (info.request) {
      // "pre-real session start" requests
      case 'env':
        if (listenerCount(self, 'env')) {
          self.emit('env', accept, reject, {
            key: info.key,
            val: info.val
          });
        } else
          reject && reject();
      break;
      case 'pty-req':
        if (listenerCount(self, 'pty')) {
          self.emit('pty', accept, reject, {
            cols: info.cols,
            rows: info.rows,
            width: info.width,
            height: info.height,
            term: info.term,
            modes: info.modes,
          });
        } else
          reject && reject();
      break;
      case 'window-change':
        if (listenerCount(self, 'window-change')) {
          self.emit('window-change', accept, reject, {
            cols: info.cols,
            rows: info.rows,
            width: info.width,
            height: info.height
          });
        } else
          reject && reject();
      break;
      case 'x11-req':
        if (listenerCount(self, 'x11')) {
          self.emit('x11', accept, reject, {
            single: info.single,
            protocol: info.protocol,
            cookie: info.cookie,
            screen: info.screen
          });
        } else
          reject && reject();
      break;
      // "post-real session start" requests
      case 'signal':
        if (listenerCount(self, 'signal')) {
          self.emit('signal', accept, reject, {
            name: info.signal
          });
        } else
          reject && reject();
      break;
      // XXX: is `auth-agent-req@openssh.com` really "post-real session start"?
      case 'auth-agent-req@openssh.com':
        if (listenerCount(self, 'auth-agent'))
          self.emit('auth-agent', accept, reject);
        else
          reject && reject();
      break;
      // "real session start" requests
      case 'shell':
        if (listenerCount(self, 'shell')) {
          accept = function() {
            if (replied || ending || channel)
              return;

            replied = true;

            if (info.wantReply)
              client._sshstream.channelSuccess(outgoingId);

            channel = new Channel(chaninfo, client, { server: true });

            channel.subtype = self.subtype = info.request;

            return channel;
          };

          self.emit('shell', accept, reject);
        } else
          reject && reject();
      break;
      case 'exec':
        if (listenerCount(self, 'exec')) {
          accept = function() {
            if (replied || ending || channel)
              return;

            replied = true;

            if (info.wantReply)
              client._sshstream.channelSuccess(outgoingId);

            channel = new Channel(chaninfo, client, { server: true });

            channel.subtype = self.subtype = info.request;

            return channel;
          };

          self.emit('exec', accept, reject, {
            command: info.command
          });
        } else
          reject && reject();
      break;
      case 'subsystem':
        accept = function() {
          if (replied || ending || channel)
            return;

          replied = true;

          if (info.wantReply)
            client._sshstream.channelSuccess(outgoingId);

          channel = new Channel(chaninfo, client, { server: true });

          channel.subtype = self.subtype = (info.request + ':' + info.subsystem);

          if (info.subsystem === 'sftp') {
            var sftp = new SFTPStream({
              server: true,
              debug: client._sshstream.debug
            });
            channel.pipe(sftp).pipe(channel);

            return sftp;
          } else
            return channel;
        };

        if (info.subsystem === 'sftp' && listenerCount(self, 'sftp'))
          self.emit('sftp', accept, reject);
        else if (info.subsystem !== 'sftp' && listenerCount(self, 'subsystem')) {
          self.emit('subsystem', accept, reject, {
            name: info.subsystem
          });
        } else
          reject && reject();
      break;
      default:
        reject && reject();
    }
  }
  function onEOF() {
    ending = true;
    self.emit('eof');
    self.emit('end');
  }
  function onCLOSE() {
    ending = true;
    self.emit('close');
  }
  client._sshstream
        .on('CHANNEL_REQUEST:' + localChan, onREQUEST)
        .once('CHANNEL_EOF:' + localChan, onEOF)
        .once('CHANNEL_CLOSE:' + localChan, onCLOSE);
}
inherits(Session, EventEmitter);


function AuthContext(stream, username, service, method, cb) {
  EventEmitter.call(this);

  var self = this;

  this.username = this.user = username;
  this.service = service;
  this.method = method;
  this._initialResponse = false;
  this._finalResponse = false;
  this._multistep = false;
  this._cbfinal = function(allowed, methodsLeft, isPartial) {
    if (!self._finalResponse) {
      self._finalResponse = true;
      cb(self, allowed, methodsLeft, isPartial);
    }
  };
  this._stream = stream;
}
inherits(AuthContext, EventEmitter);
AuthContext.prototype.accept = function() {
  this._cleanup && this._cleanup();
  this._initialResponse = true;
  this._cbfinal(true);
};
AuthContext.prototype.reject = function(methodsLeft, isPartial) {
  this._cleanup && this._cleanup();
  this._initialResponse = true;
  this._cbfinal(false, methodsLeft, isPartial);
};

var RE_KBINT_SUBMETHODS = /[ \t\r\n]*,[ \t\r\n]*/g;
function KeyboardAuthContext(stream, username, service, method, submethods, cb) {
  AuthContext.call(this, stream, username, service, method, cb);
  this._multistep = true;

  var self = this;

  this._cb = undefined;
  this._onInfoResponse = function(responses) {
    if (self._cb) {
      var callback = self._cb;
      self._cb = undefined;
      callback(responses);
    }
  };
  this.submethods = submethods.split(RE_KBINT_SUBMETHODS);
  this.on('abort', function() {
    self._cb && self._cb(new Error('Authentication request aborted'));
  });
}
inherits(KeyboardAuthContext, AuthContext);
KeyboardAuthContext.prototype._cleanup = function() {
  this._stream.removeListener('USERAUTH_INFO_RESPONSE', this._onInfoResponse);
};
KeyboardAuthContext.prototype.prompt = function(prompts, title, instructions,
                                                cb) {
  if (!Array.isArray(prompts))
    prompts = [ prompts ];

  if (typeof title === 'function') {
    cb = title;
    title = instructions = undefined;
  } else if (typeof instructions === 'function') {
    cb = instructions;
    instructions = undefined;
  }

  for (var i = 0; i < prompts.length; ++i) {
    if (typeof prompts[i] === 'string') {
      prompts[i] = {
        prompt: prompts[i],
        echo: true
      };
    }
  }

  this._cb = cb;
  this._initialResponse = true;
  this._stream.once('USERAUTH_INFO_RESPONSE', this._onInfoResponse);

  return this._stream.authInfoReq(title, instructions, prompts);
};

function PKAuthContext(stream, username, service, method, pkInfo, cb) {
  AuthContext.call(this, stream, username, service, method, cb);

  this.key = { algo: pkInfo.keyAlgo, data: pkInfo.key };
  this.signature = pkInfo.signature;
  var sigAlgo;
  if (this.signature) {
    // TODO: move key type checking logic to ssh2-streams
    switch (pkInfo.keyAlgo) {
      case 'ssh-rsa':
      case 'ssh-dss':
        sigAlgo = 'sha1';
        break;
      case 'ssh-ed25519':
        sigAlgo = null;
        break;
      case 'ecdsa-sha2-nistp256':
        sigAlgo = 'sha256';
        break;
      case 'ecdsa-sha2-nistp384':
        sigAlgo = 'sha384';
        break;
      case 'ecdsa-sha2-nistp521':
        sigAlgo = 'sha512';
        break;
    }
  }
  this.sigAlgo = sigAlgo;
  this.blob = pkInfo.blob;
}
inherits(PKAuthContext, AuthContext);
PKAuthContext.prototype.accept = function() {
  if (!this.signature) {
    this._initialResponse = true;
    this._stream.authPKOK(this.key.algo, this.key.data);
  } else {
    AuthContext.prototype.accept.call(this);
  }
};

function HostbasedAuthContext(stream, username, service, method, pkInfo, cb) {
  AuthContext.call(this, stream, username, service, method, cb);

  this.key = { algo: pkInfo.keyAlgo, data: pkInfo.key };
  this.signature = pkInfo.signature;
  var sigAlgo;
  if (this.signature) {
    // TODO: move key type checking logic to ssh2-streams
    switch (pkInfo.keyAlgo) {
      case 'ssh-rsa':
      case 'ssh-dss':
        sigAlgo = 'sha1';
        break;
      case 'ssh-ed25519':
        sigAlgo = null;
        break;
      case 'ecdsa-sha2-nistp256':
        sigAlgo = 'sha256';
        break;
      case 'ecdsa-sha2-nistp384':
        sigAlgo = 'sha384';
        break;
      case 'ecdsa-sha2-nistp521':
        sigAlgo = 'sha512';
        break;
    }
  }
  this.sigAlgo = sigAlgo;
  this.blob = pkInfo.blob;
  this.localHostname = pkInfo.localHostname;
  this.localUsername = pkInfo.localUsername;
}
inherits(HostbasedAuthContext, AuthContext);

function PwdAuthContext(stream, username, service, method, password, cb) {
  AuthContext.call(this, stream, username, service, method, cb);

  this.password = password;
}
inherits(PwdAuthContext, AuthContext);


function openChannel(self, type, opts, cb) {
  // ask the client to open a channel for some purpose
  // (e.g. a forwarded TCP connection)
  var localChan = nextChannel(self);
  var initWindow = Channel.MAX_WINDOW;
  var maxPacket = Channel.PACKET_SIZE;
  var ret = true;

  if (localChan === false)
    return cb(new Error('No free channels available'));

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  self._channels[localChan] = true;

  var sshstream = self._sshstream;
  sshstream.once('CHANNEL_OPEN_CONFIRMATION:' + localChan, function(info) {
    sshstream.removeAllListeners('CHANNEL_OPEN_FAILURE:' + localChan);

    var chaninfo = {
      type: type,
      incoming: {
        id: localChan,
        window: initWindow,
        packetSize: maxPacket,
        state: 'open'
      },
      outgoing: {
        id: info.sender,
        window: info.window,
        packetSize: info.packetSize,
        state: 'open'
      }
    };
    cb(undefined, new Channel(chaninfo, self, { server: true }));
  }).once('CHANNEL_OPEN_FAILURE:' + localChan, function(info) {
    sshstream.removeAllListeners('CHANNEL_OPEN_CONFIRMATION:' + localChan);

    delete self._channels[localChan];

    var err = new Error('(SSH) Channel open failure: ' + info.description);
    err.reason = info.reason;
    err.lang = info.lang;
    cb(err);
  });

  if (type === 'forwarded-tcpip')
    ret = sshstream.forwardedTcpip(localChan, initWindow, maxPacket, opts);
  else if (type === 'x11')
    ret = sshstream.x11(localChan, initWindow, maxPacket, opts);
  else if (type === 'forwarded-streamlocal@openssh.com') {
    ret = sshstream.openssh_forwardedStreamLocal(localChan,
                                                 initWindow,
                                                 maxPacket,
                                                 opts);
  }

  return ret;
}

function nextChannel(self) {
  // get the next available channel number

  // fast path
  if (self._curChan < MAX_CHANNEL)
    return ++self._curChan;

  // slower lookup path
  for (var i = 0, channels = self._channels; i < MAX_CHANNEL; ++i)
    if (!channels[i])
      return i;

  return false;
}


Server.createServer = function(cfg, listener) {
  return new Server(cfg, listener);
};
Server.KEEPALIVE_INTERVAL = 1000;
Server.KEEPALIVE_CLIENT_INTERVAL = 15000;
Server.KEEPALIVE_CLIENT_COUNT_MAX = 3;

module.exports = Server;
module.exports.IncomingClient = Client;


/***/ }),

/***/ 293:
/***/ (function(module) {

module.exports = require("buffer");

/***/ }),

/***/ 304:
/***/ (function(module) {

module.exports = require("string_decoder");

/***/ }),

/***/ 307:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

var HttpAgent = __webpack_require__(605).Agent;
var HttpsAgent = __webpack_require__(211).Agent;
var inherits = __webpack_require__(669).inherits;

var Client;

[HttpAgent, HttpsAgent].forEach((ctor) => {
  function SSHAgent(connectCfg, agentOptions) {
    if (!(this instanceof SSHAgent))
      return new SSHAgent(connectCfg, agentOptions);

    ctor.call(this, agentOptions);

    this._connectCfg = connectCfg;
    this._defaultSrcIP = (agentOptions && agentOptions.srcIP) || 'localhost';
  }
  inherits(SSHAgent, ctor);

  SSHAgent.prototype.createConnection = createConnection;

  exports[ctor === HttpAgent ? 'SSHTTPAgent' : 'SSHTTPSAgent'] = SSHAgent;
});

function createConnection(options, cb) {
  var srcIP = (options && options.localAddress) || this._defaultSrcIP;
  var srcPort = (options && options.localPort) || 0;
  var dstIP = options.host;
  var dstPort = options.port;

  if (Client === undefined)
    Client = __webpack_require__(597).Client;

  var client = new Client();
  var triedForward = false;
  client.on('ready', () => {
    client.forwardOut(srcIP, srcPort, dstIP, dstPort, (err, stream) => {
      triedForward = true;
      if (err) {
        client.end();
        return cb(err);
      }
      stream.once('close', () => {
        client.end();
      });
      cb(null, decorateStream(stream));
    });
  }).on('error', cb).on('close', () => {
    if (!triedForward)
      cb(new Error('Unexpected connection loss'));
  }).connect(this._connectCfg);
}

function noop() {}

function decorateStream(stream) {
  stream.setKeepAlive = noop;
  stream.setNoDelay = noop;
  stream.setTimeout = noop;
  stream.ref = noop;
  stream.unref = noop;
  stream.destroySoon = stream.destroy;
  return stream;
}


/***/ }),

/***/ 315:
/***/ (function(module) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ 317:
/***/ (function(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 334:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(470);
const { spawnSync } = __webpack_require__(129);
const fs = __webpack_require__(747);
const path = __webpack_require__(622)

// Setup Docker
const Docker = __webpack_require__(965);
var docker = new Docker({socketPath: '/var/run/docker.sock'});

try {

  // Get inputs
  var docker_image = core.getInput('containerImage');
  var work_dir = core.getInput('directory');
  var use_container = core.getInput('useContainer');
  var godot_executable = core.getInput('godotExecutable');

  if(work_dir)
  {
    process.chdir(work_dir);
  }

  if(use_container == "true")
  {  

    // Pull docker image for building
    console.log("Pulling build image...");
    docker.pull(docker_image, function(err, stream)
    {

      docker.modem.followProgress(stream, onFinished, onProgress);

      // Wait to run build until after pull complete
      function onFinished(err, output)
      {
        console.log("Starting image...")
        docker.run(docker_image, [godot_executable, '-d', '-s', '--path', '/project', 'addons/gut/gut_cmdln.gd'], process.stdout, 
        
        // Mount working directory to `/project`
        { HostConfig: { Binds: [ process.cwd() + ":/project" ] }},
        
        function (err, data, container) {

          if(err)
          {
            core.setFailed(error.message);
          }

          console.log("Tests exited with status: " + data.StatusCode);

          if( data.StatusCode != "0" )
          {
              core.setFailed("GUT tests failed!");
          }
      
        })
      }
      function onProgress(event) {}

    });
  }
  else
  {
    console.log("Running GUT tests locally");

    var result = spawnSync(`${godot_executable} -d -s --path . addons/gut/gut_cmdln.gd`, {
      stdio: 'inherit',
      shell: true
    });

    if(result.status != null && result.status != 0)
    {
      core.setFailed("GUT tests failed!");
    }
  
  }

} catch (error) {
  core.setFailed(error.message);
}

/***/ }),

/***/ 357:
/***/ (function(module) {

module.exports = require("assert");

/***/ }),

/***/ 360:
/***/ (function(module, __unusedexports, __webpack_require__) {

var extend = __webpack_require__(255).extend,
  Exec = __webpack_require__(757),
  util = __webpack_require__(255);

/**
 * Represents a Container
 * @param {Object} modem docker-modem
 * @param {String} id    Container's ID
 */
var Container = function(modem, id) {
  this.modem = modem;
  this.id = id;

  this.defaultOptions = {
    top: {},
    start: {},
    commit: {},
    stop: {},
    pause: {},
    unpause: {},
    restart: {},
    resize: {},
    attach: {},
    remove: {},
    copy: {},
    kill: {},
    exec: {},
    rename: {},
    log: {},
    stats: {},
    getArchive: {},
    infoArchive: {},
    putArchive: {},
    update: {},
    wait: {}
  };
};

Container.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback, if supplied will query Docker.
 * @return {Object}            ID only and only if callback isn't supplied.
 */
Container.prototype.inspect = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/' + this.id + '/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Rename
 * @param  {Object}   opts     Rename options
 * @param  {Function} callback Callback
 */
Container.prototype.rename = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.rename);

  var optsf = {
    path: '/containers/' + this.id + '/rename?',
    method: 'POST',
    statusCodes: {
      200: true,
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Update
 * @param  {Object}   opts     Update options
 * @param  {Function} callback Callback
 */
Container.prototype.update = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.update);

  var optsf = {
    path: '/containers/' + this.id + '/update',
    method: 'POST',
    statusCodes: {
      200: true,
      204: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Top
 * @param  {Object}   opts like 'ps_args' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.top = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.top);

  var optsf = {
    path: '/containers/' + this.id + '/top?',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Containers changes
 * @param  {Function} callback Callback
 */
Container.prototype.changes = function(callback) {
  var self = this;
  var optsf = {
    path: '/containers/' + this.id + '/changes',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Checkpoints list
 * @param  {Object}   opts     List checkpoints options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.listCheckpoint = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/' + this.id + '/checkpoints?',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Delete checkpoint
 * @param  {Object}   opts     Delete checkpoint options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.deleteCheckpoint = function(checkpoint, opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/' + this.id + '/checkpoints/' + checkpoint + '?',
    method: 'DELETE',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Create checkpoint
 * @param  {Object}   opts     Create checkpoint options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.createCheckpoint = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/' + this.id + '/checkpoints',
    method: 'POST',
    allowEmpty: true,
    statusCodes: {
      200: true, //unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Export
 * @param  {Function} callback Callback with the octet-stream.
 */
Container.prototype.export = function(callback) {
  var self = this;
  var optsf = {
    path: '/containers/' + this.id + '/export',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Start
 * @param  {Object}   opts     Container start options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.start = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.start);

  var optsf = {
    path: '/containers/' + this.id + '/start',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      304: 'container already started',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Pause
 * @param  {Object}   opts     Pause options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.pause = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.pause);

  var optsf = {
    path: '/containers/' + this.id + '/pause',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Unpause
 * @param  {Object}   opts     Unpause options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.unpause = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.unpause);

  var optsf = {
    path: '/containers/' + this.id + '/unpause',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Setup an exec call to a running container
 *
 * @param {object} opts
 * @param {function} callback
 */
Container.prototype.exec = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.exec);

  var optsf = {
    path: '/containers/' + this.id + '/exec',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };


  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(new Exec(self.modem, data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, new Exec(self.modem, data.Id));
    });
  }
};

/**
 * Commit
 * @param  {Object}   opts     Commit options like 'Hostname' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.commit = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.commit);

  args.opts.container = this.id;

  var optsf = {
    path: '/commit?',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Stop
 * @param  {Object}   opts     Container stop options, like 't' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.stop = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.stop);

  var optsf = {
    path: '/containers/' + this.id + '/stop?',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      304: 'container already stopped',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Restart
 * @param  {Object}   opts     Container restart options, like 't' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.restart = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.restart);

  var optsf = {
    path: '/containers/' + this.id + '/restart?',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Kill
 * @param  {Object}   opts     Container kill options, like 'signal' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.kill = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.kill);

  var optsf = {
    path: '/containers/' + this.id + '/kill?',
    method: 'POST',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Container resize
 * @param  {[type]}   opts     Resize options. (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.resize = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.resize);

  var optsf = {
    path: '/containers/' + this.id + '/resize?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Attach
 * @param  {Object}   opts     Attach options, like 'logs' (optional)
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.attach = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.attach);

  var optsf = {
    path: '/containers/' + this.id + '/attach?',
    method: 'POST',
    isStream: true,
    hijack: args.opts.hijack,
    openStdin: args.opts.stdin,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, stream) {
        if (err) {
          return reject(err);
        }
        resolve(stream);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, stream) {
      args.callback(err, stream);
    });
  }
};

/**
 * Waits for a container to end.
 * @param  {[type]}   opts     Container wait options, like condition. (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.wait = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.wait);

  var optsf = {
    path: '/containers/' + this.id + '/wait?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Removes a container
 * @param  {Object}   opts     Remove options, like 'force' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.remove);

  var optsf = {
    path: '/containers/' + this.id + '?',
    method: 'DELETE',
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Copy (WARNING: DEPRECATED since RAPI v1.20)
 * @param  {Object}   opts     Copy options, like 'Resource' (optional)
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.copy = function(opts, callback) {
  var self = this;
  console.log('container.copy is deprecated since Docker v1.8.x');
  var args = util.processArgs(opts, callback, this.defaultOptions.copy);

  var optsf = {
    path: '/containers/' + this.id + '/copy',
    method: 'POST',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * getArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.getArchive = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.getArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * infoArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.infoArchive = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.infoArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'HEAD',
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * putArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.putArchive = function(file, opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.putArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'PUT',
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      403: 'client error, permission denied',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Container logs
 * @param  {Object}   opts     Logs options. (optional)
 * @param  {Function} callback Callback with data
 */
Container.prototype.logs = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.log);

  var optsf = {
    path: '/containers/' + this.id + '/logs?',
    method: 'GET',
    isStream: args.opts.follow || false,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Container stats
 * @param  {Object}   opts     Stats options. (optional)
 * @param  {Function} callback Callback with data
 */
Container.prototype.stats = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.stats);
  var isStream = true;
  if (args.opts.stream === false) {
    isStream = false;
  }
  var optsf = {
    path: '/containers/' + this.id + '/stats?',
    method: 'GET',
    isStream: isStream,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

module.exports = Container;


/***/ }),

/***/ 362:
/***/ (function(module) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


module.exports = {
  EOC: 0,
  Boolean: 1,
  Integer: 2,
  BitString: 3,
  OctetString: 4,
  Null: 5,
  OID: 6,
  ObjectDescriptor: 7,
  External: 8,
  Real: 9, // float
  Enumeration: 10,
  PDV: 11,
  Utf8String: 12,
  RelativeOID: 13,
  Sequence: 16,
  Set: 17,
  NumericString: 18,
  PrintableString: 19,
  T61String: 20,
  VideotexString: 21,
  IA5String: 22,
  UTCTime: 23,
  GeneralizedTime: 24,
  GraphicString: 25,
  VisibleString: 26,
  GeneralString: 28,
  UniversalString: 29,
  CharacterString: 30,
  BMPString: 31,
  Constructor: 32,
  Context: 128
};


/***/ }),

/***/ 364:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(669)
var bl = __webpack_require__(954)
var headers = __webpack_require__(154)

var Writable = __webpack_require__(574).Writable
var PassThrough = __webpack_require__(574).PassThrough

var noop = function () {}

var overflow = function (size) {
  size &= 511
  return size && 512 - size
}

var emptyStream = function (self, offset) {
  var s = new Source(self, offset)
  s.end()
  return s
}

var mixinPax = function (header, pax) {
  if (pax.path) header.name = pax.path
  if (pax.linkpath) header.linkname = pax.linkpath
  if (pax.size) header.size = parseInt(pax.size, 10)
  header.pax = pax
  return header
}

var Source = function (self, offset) {
  this._parent = self
  this.offset = offset
  PassThrough.call(this, { autoDestroy: false })
}

util.inherits(Source, PassThrough)

Source.prototype.destroy = function (err) {
  this._parent.destroy(err)
}

var Extract = function (opts) {
  if (!(this instanceof Extract)) return new Extract(opts)
  Writable.call(this, opts)

  opts = opts || {}

  this._offset = 0
  this._buffer = bl()
  this._missing = 0
  this._partial = false
  this._onparse = noop
  this._header = null
  this._stream = null
  this._overflow = null
  this._cb = null
  this._locked = false
  this._destroyed = false
  this._pax = null
  this._paxGlobal = null
  this._gnuLongPath = null
  this._gnuLongLinkPath = null

  var self = this
  var b = self._buffer

  var oncontinue = function () {
    self._continue()
  }

  var onunlock = function (err) {
    self._locked = false
    if (err) return self.destroy(err)
    if (!self._stream) oncontinue()
  }

  var onstreamend = function () {
    self._stream = null
    var drain = overflow(self._header.size)
    if (drain) self._parse(drain, ondrain)
    else self._parse(512, onheader)
    if (!self._locked) oncontinue()
  }

  var ondrain = function () {
    self._buffer.consume(overflow(self._header.size))
    self._parse(512, onheader)
    oncontinue()
  }

  var onpaxglobalheader = function () {
    var size = self._header.size
    self._paxGlobal = headers.decodePax(b.slice(0, size))
    b.consume(size)
    onstreamend()
  }

  var onpaxheader = function () {
    var size = self._header.size
    self._pax = headers.decodePax(b.slice(0, size))
    if (self._paxGlobal) self._pax = Object.assign({}, self._paxGlobal, self._pax)
    b.consume(size)
    onstreamend()
  }

  var ongnulongpath = function () {
    var size = self._header.size
    this._gnuLongPath = headers.decodeLongPath(b.slice(0, size), opts.filenameEncoding)
    b.consume(size)
    onstreamend()
  }

  var ongnulonglinkpath = function () {
    var size = self._header.size
    this._gnuLongLinkPath = headers.decodeLongPath(b.slice(0, size), opts.filenameEncoding)
    b.consume(size)
    onstreamend()
  }

  var onheader = function () {
    var offset = self._offset
    var header
    try {
      header = self._header = headers.decode(b.slice(0, 512), opts.filenameEncoding)
    } catch (err) {
      self.emit('error', err)
    }
    b.consume(512)

    if (!header) {
      self._parse(512, onheader)
      oncontinue()
      return
    }
    if (header.type === 'gnu-long-path') {
      self._parse(header.size, ongnulongpath)
      oncontinue()
      return
    }
    if (header.type === 'gnu-long-link-path') {
      self._parse(header.size, ongnulonglinkpath)
      oncontinue()
      return
    }
    if (header.type === 'pax-global-header') {
      self._parse(header.size, onpaxglobalheader)
      oncontinue()
      return
    }
    if (header.type === 'pax-header') {
      self._parse(header.size, onpaxheader)
      oncontinue()
      return
    }

    if (self._gnuLongPath) {
      header.name = self._gnuLongPath
      self._gnuLongPath = null
    }

    if (self._gnuLongLinkPath) {
      header.linkname = self._gnuLongLinkPath
      self._gnuLongLinkPath = null
    }

    if (self._pax) {
      self._header = header = mixinPax(header, self._pax)
      self._pax = null
    }

    self._locked = true

    if (!header.size || header.type === 'directory') {
      self._parse(512, onheader)
      self.emit('entry', header, emptyStream(self, offset), onunlock)
      return
    }

    self._stream = new Source(self, offset)

    self.emit('entry', header, self._stream, onunlock)
    self._parse(header.size, onstreamend)
    oncontinue()
  }

  this._onheader = onheader
  this._parse(512, onheader)
}

util.inherits(Extract, Writable)

Extract.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true

  if (err) this.emit('error', err)
  this.emit('close')
  if (this._stream) this._stream.emit('close')
}

Extract.prototype._parse = function (size, onparse) {
  if (this._destroyed) return
  this._offset += size
  this._missing = size
  if (onparse === this._onheader) this._partial = false
  this._onparse = onparse
}

Extract.prototype._continue = function () {
  if (this._destroyed) return
  var cb = this._cb
  this._cb = noop
  if (this._overflow) this._write(this._overflow, undefined, cb)
  else cb()
}

Extract.prototype._write = function (data, enc, cb) {
  if (this._destroyed) return

  var s = this._stream
  var b = this._buffer
  var missing = this._missing
  if (data.length) this._partial = true

  // we do not reach end-of-chunk now. just forward it

  if (data.length < missing) {
    this._missing -= data.length
    this._overflow = null
    if (s) return s.write(data, cb)
    b.append(data)
    return cb()
  }

  // end-of-chunk. the parser should call cb.

  this._cb = cb
  this._missing = 0

  var overflow = null
  if (data.length > missing) {
    overflow = data.slice(missing)
    data = data.slice(0, missing)
  }

  if (s) s.end(data)
  else b.append(data)

  this._overflow = overflow
  this._onparse()
}

Extract.prototype._final = function (cb) {
  if (this._partial) return this.destroy(new Error('Unexpected end of data'))
  cb()
}

module.exports = Extract


/***/ }),

/***/ 383:
/***/ (function(module, __unusedexports, __webpack_require__) {

var constants = __webpack_require__(534)
var eos = __webpack_require__(9)
var inherits = __webpack_require__(689)
var alloc = Buffer.alloc

var Readable = __webpack_require__(574).Readable
var Writable = __webpack_require__(574).Writable
var StringDecoder = __webpack_require__(304).StringDecoder

var headers = __webpack_require__(154)

var DMODE = parseInt('755', 8)
var FMODE = parseInt('644', 8)

var END_OF_TAR = alloc(1024)

var noop = function () {}

var overflow = function (self, size) {
  size &= 511
  if (size) self.push(END_OF_TAR.slice(0, 512 - size))
}

function modeToType (mode) {
  switch (mode & constants.S_IFMT) {
    case constants.S_IFBLK: return 'block-device'
    case constants.S_IFCHR: return 'character-device'
    case constants.S_IFDIR: return 'directory'
    case constants.S_IFIFO: return 'fifo'
    case constants.S_IFLNK: return 'symlink'
  }

  return 'file'
}

var Sink = function (to) {
  Writable.call(this)
  this.written = 0
  this._to = to
  this._destroyed = false
}

inherits(Sink, Writable)

Sink.prototype._write = function (data, enc, cb) {
  this.written += data.length
  if (this._to.push(data)) return cb()
  this._to._drain = cb
}

Sink.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true
  this.emit('close')
}

var LinkSink = function () {
  Writable.call(this)
  this.linkname = ''
  this._decoder = new StringDecoder('utf-8')
  this._destroyed = false
}

inherits(LinkSink, Writable)

LinkSink.prototype._write = function (data, enc, cb) {
  this.linkname += this._decoder.write(data)
  cb()
}

LinkSink.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true
  this.emit('close')
}

var Void = function () {
  Writable.call(this)
  this._destroyed = false
}

inherits(Void, Writable)

Void.prototype._write = function (data, enc, cb) {
  cb(new Error('No body allowed for this entry'))
}

Void.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true
  this.emit('close')
}

var Pack = function (opts) {
  if (!(this instanceof Pack)) return new Pack(opts)
  Readable.call(this, opts)

  this._drain = noop
  this._finalized = false
  this._finalizing = false
  this._destroyed = false
  this._stream = null
}

inherits(Pack, Readable)

Pack.prototype.entry = function (header, buffer, callback) {
  if (this._stream) throw new Error('already piping an entry')
  if (this._finalized || this._destroyed) return

  if (typeof buffer === 'function') {
    callback = buffer
    buffer = null
  }

  if (!callback) callback = noop

  var self = this

  if (!header.size || header.type === 'symlink') header.size = 0
  if (!header.type) header.type = modeToType(header.mode)
  if (!header.mode) header.mode = header.type === 'directory' ? DMODE : FMODE
  if (!header.uid) header.uid = 0
  if (!header.gid) header.gid = 0
  if (!header.mtime) header.mtime = new Date()

  if (typeof buffer === 'string') buffer = Buffer.from(buffer)
  if (Buffer.isBuffer(buffer)) {
    header.size = buffer.length
    this._encode(header)
    var ok = this.push(buffer)
    overflow(self, header.size)
    if (ok) process.nextTick(callback)
    else this._drain = callback
    return new Void()
  }

  if (header.type === 'symlink' && !header.linkname) {
    var linkSink = new LinkSink()
    eos(linkSink, function (err) {
      if (err) { // stream was closed
        self.destroy()
        return callback(err)
      }

      header.linkname = linkSink.linkname
      self._encode(header)
      callback()
    })

    return linkSink
  }

  this._encode(header)

  if (header.type !== 'file' && header.type !== 'contiguous-file') {
    process.nextTick(callback)
    return new Void()
  }

  var sink = new Sink(this)

  this._stream = sink

  eos(sink, function (err) {
    self._stream = null

    if (err) { // stream was closed
      self.destroy()
      return callback(err)
    }

    if (sink.written !== header.size) { // corrupting tar
      self.destroy()
      return callback(new Error('size mismatch'))
    }

    overflow(self, header.size)
    if (self._finalizing) self.finalize()
    callback()
  })

  return sink
}

Pack.prototype.finalize = function () {
  if (this._stream) {
    this._finalizing = true
    return
  }

  if (this._finalized) return
  this._finalized = true
  this.push(END_OF_TAR)
  this.push(null)
}

Pack.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true

  if (err) this.emit('error', err)
  this.emit('close')
  if (this._stream && this._stream.destroy) this._stream.destroy()
}

Pack.prototype._encode = function (header) {
  if (!header.pax) {
    var buf = headers.encode(header)
    if (buf) {
      this.push(buf)
      return
    }
  }
  this._encodePax(header)
}

Pack.prototype._encodePax = function (header) {
  var paxHeader = headers.encodePax({
    name: header.name,
    linkname: header.linkname,
    pax: header.pax
  })

  var newHeader = {
    name: 'PaxHeader',
    mode: header.mode,
    uid: header.uid,
    gid: header.gid,
    size: paxHeader.length,
    mtime: header.mtime,
    type: 'pax-header',
    linkname: header.linkname && 'PaxHeader',
    uname: header.uname,
    gname: header.gname,
    devmajor: header.devmajor,
    devminor: header.devminor
  }

  this.push(headers.encode(newHeader))
  this.push(paxHeader)
  overflow(this, paxHeader.length)

  newHeader.size = header.size
  newHeader.type = header.type
  this.push(headers.encode(newHeader))
}

Pack.prototype._read = function (n) {
  var drain = this._drain
  this._drain = noop
  drain()
}

module.exports = Pack


/***/ }),

/***/ 393:
/***/ (function(module, __unusedexports, __webpack_require__) {

var Socket = __webpack_require__(631).Socket;
var EventEmitter = __webpack_require__(614).EventEmitter;
var inherits = __webpack_require__(669).inherits;
var path = __webpack_require__(622);
var fs = __webpack_require__(747);
var cp = __webpack_require__(129);

var readUInt32BE = __webpack_require__(58).readUInt32BE;
var writeUInt32BE = __webpack_require__(58).writeUInt32BE;
var writeUInt32LE = __webpack_require__(58).writeUInt32LE;

var REQUEST_IDENTITIES = 11;
var IDENTITIES_ANSWER = 12;
var SIGN_REQUEST = 13;
var SIGN_RESPONSE = 14;
var FAILURE = 5;

var RE_CYGWIN_SOCK = /^\!<socket >(\d+) s ([A-Z0-9]{8}\-[A-Z0-9]{8}\-[A-Z0-9]{8}\-[A-Z0-9]{8})/;

// Format of `//./pipe/ANYTHING`, with forward slashes and backward slashes being interchangeable
var WINDOWS_PIPE_REGEX = /^[/\\][/\\]\.[/\\]pipe[/\\].+/;

module.exports = function(sockPath, key, keyType, data, cb) {
  var sock;
  var error;
  var sig;
  var datalen;
  var keylen = 0;
  var isSigning = Buffer.isBuffer(key);
  var type;
  var count = 0;
  var siglen = 0;
  var nkeys = 0;
  var keys;
  var comlen = 0;
  var comment = false;
  var accept;
  var reject;

  if (typeof key === 'function' && typeof keyType === 'function') {
    // agent forwarding
    accept = key;
    reject = keyType;
  } else if (isSigning) {
    keylen = key.length;
    datalen = data.length;
  } else {
    cb = key;
    key = undefined;
  }

  function onconnect() {
    var buf;
    if (isSigning) {
      /*
        byte        SSH2_AGENTC_SIGN_REQUEST
        string      key_blob
        string      data
        uint32      flags
      */
      var p = 9;
      buf = Buffer.allocUnsafe(4 + 1 + 4 + keylen + 4 + datalen + 4);
      writeUInt32BE(buf, buf.length - 4, 0);
      buf[4] = SIGN_REQUEST;
      writeUInt32BE(buf, keylen, 5);
      key.copy(buf, p);
      writeUInt32BE(buf, datalen, p += keylen);
      data.copy(buf, p += 4);
      writeUInt32BE(buf, 0, p += datalen);
      sock.write(buf);
    } else {
      /*
        byte        SSH2_AGENTC_REQUEST_IDENTITIES
      */
      sock.write(Buffer.from([0, 0, 0, 1, REQUEST_IDENTITIES]));
    }
  }
  function ondata(chunk) {
    for (var i = 0, len = chunk.length; i < len; ++i) {
      if (type === undefined) {
        // skip over packet length
        if (++count === 5) {
          type = chunk[i];
          count = 0;
        }
      } else if (type === SIGN_RESPONSE) {
        /*
          byte        SSH2_AGENT_SIGN_RESPONSE
          string      signature_blob
        */
        if (!sig) {
          siglen <<= 8;
          siglen += chunk[i];
          if (++count === 4) {
            sig = Buffer.allocUnsafe(siglen);
            count = 0;
          }
        } else {
          sig[count] = chunk[i];
          if (++count === siglen) {
            sock.removeAllListeners('data');
            return sock.destroy();
          }
        }
      } else if (type === IDENTITIES_ANSWER) {
        /*
          byte        SSH2_AGENT_IDENTITIES_ANSWER
          uint32      num_keys

        Followed by zero or more consecutive keys, encoded as:

          string      public key blob
          string      public key comment
        */
        if (keys === undefined) {
          nkeys <<= 8;
          nkeys += chunk[i];
          if (++count === 4) {
            keys = new Array(nkeys);
            count = 0;
            if (nkeys === 0) {
              sock.removeAllListeners('data');
              return sock.destroy();
            }
          }
        } else {
          if (!key) {
            keylen <<= 8;
            keylen += chunk[i];
            if (++count === 4) {
              key = Buffer.allocUnsafe(keylen);
              count = 0;
            }
          } else if (comment === false) {
            key[count] = chunk[i];
            if (++count === keylen) {
              keys[nkeys - 1] = key;
              keylen = 0;
              count = 0;
              comment = true;
              if (--nkeys === 0) {
                key = undefined;
                sock.removeAllListeners('data');
                return sock.destroy();
              }
            }
          } else if (comment === true) {
            comlen <<= 8;
            comlen += chunk[i];
            if (++count === 4) {
              count = 0;
              if (comlen > 0)
                comment = comlen;
              else {
                key = undefined;
                comment = false;
              }
              comlen = 0;
            }
          } else {
            // skip comments
            if (++count === comment) {
              comment = false;
              count = 0;
              key = undefined;
            }
          }
        }
      } else if (type === FAILURE) {
        if (isSigning)
          error = new Error('Agent unable to sign data');
        else
          error = new Error('Unable to retrieve list of keys from agent');
        sock.removeAllListeners('data');
        return sock.destroy();
      }
    }
  }
  function onerror(err) {
    error = err;
  }
  function onclose() {
    if (error)
      cb(error);
    else if ((isSigning && !sig) || (!isSigning && !keys))
      cb(new Error('Unexpected disconnection from agent'));
    else if (isSigning && sig)
      cb(undefined, sig);
    else if (!isSigning && keys)
      cb(undefined, keys);
  }

  if (process.platform === 'win32' && !WINDOWS_PIPE_REGEX.test(sockPath)) {
    if (sockPath === 'pageant') {
      // Pageant (PuTTY authentication agent)
      sock = new PageantSock();
    } else {
      // cygwin ssh-agent instance
      var triedCygpath = false;
      fs.readFile(sockPath, function readCygsocket(err, data) {
        if (err) {
          if (triedCygpath)
            return cb(new Error('Invalid cygwin unix socket path'));
          // try using `cygpath` to convert a possible *nix-style path to the
          // real Windows path before giving up ...
          cp.exec('cygpath -w "' + sockPath + '"',
                  function(err, stdout, stderr) {
            if (err || stdout.length === 0)
              return cb(new Error('Invalid cygwin unix socket path'));
            triedCygpath = true;
            sockPath = stdout.toString().replace(/[\r\n]/g, '');
            fs.readFile(sockPath, readCygsocket);
          });
          return;
        }

        var m;
        if (m = RE_CYGWIN_SOCK.exec(data.toString('ascii'))) {
          var port;
          var secret;
          var secretbuf;
          var state;
          var bc = 0;
          var isRetrying = false;
          var inbuf = [];
          var credsbuf = Buffer.allocUnsafe(12);
          var i;
          var j;

          // use 0 for pid, uid, and gid to ensure we get an error and also
          // a valid uid and gid from cygwin so that we don't have to figure it
          // out ourselves
          credsbuf.fill(0);

          // parse cygwin unix socket file contents
          port = parseInt(m[1], 10);
          secret = m[2].replace(/\-/g, '');
          secretbuf = Buffer.allocUnsafe(16);
          for (i = 0, j = 0; j < 32; ++i,j+=2)
            secretbuf[i] = parseInt(secret.substring(j, j + 2), 16);

          // convert to host order (always LE for Windows)
          for (i = 0; i < 16; i += 4)
            writeUInt32LE(secretbuf, readUInt32BE(secretbuf, i), i);

          function _onconnect() {
            bc = 0;
            state = 'secret';
            sock.write(secretbuf);
          }
          function _ondata(data) {
            bc += data.length;
            if (state === 'secret') {
              // the secret we sent is echoed back to us by cygwin, not sure of
              // the reason for that, but we ignore it nonetheless ...
              if (bc === 16) {
                bc = 0;
                state = 'creds';
                sock.write(credsbuf);
              }
            } else if (state === 'creds') {
              // if this is the first attempt, make sure to gather the valid
              // uid and gid for our next attempt
              if (!isRetrying)
                inbuf.push(data);

              if (bc === 12) {
                sock.removeListener('connect', _onconnect);
                sock.removeListener('data', _ondata);
                sock.removeListener('close', _onclose);
                if (isRetrying) {
                  addSockListeners();
                  sock.emit('connect');
                } else {
                  isRetrying = true;
                  credsbuf = Buffer.concat(inbuf);
                  writeUInt32LE(credsbuf, process.pid, 0);
                  sock.destroy();
                  tryConnect();
                }
              }
            }
          }
          function _onclose() {
            cb(new Error('Problem negotiating cygwin unix socket security'));
          }
          function tryConnect() {
            sock = new Socket();
            sock.once('connect', _onconnect);
            sock.on('data', _ondata);
            sock.once('close', _onclose);
            sock.connect(port);
          }
          tryConnect();
        } else
          cb(new Error('Malformed cygwin unix socket file'));
      });
      return;
    }
  } else
    sock = new Socket();

  function addSockListeners() {
    if (!accept && !reject) {
      sock.once('connect', onconnect);
      sock.on('data', ondata);
      sock.once('error', onerror);
      sock.once('close', onclose);
    } else {
      var chan;
      sock.once('connect', function() {
        chan = accept();
        var isDone = false;
        function onDone() {
          if (isDone)
            return;
          sock.destroy();
          isDone = true;
        }
        chan.once('end', onDone)
            .once('close', onDone)
            .on('data', function(data) {
          sock.write(data);
        });
        sock.on('data', function(data) {
          chan.write(data);
        });
      });
      sock.once('close', function() {
        if (!chan)
          reject();
      });
    }
  }
  addSockListeners();
  sock.connect(sockPath);
};


// win32 only ------------------------------------------------------------------
if (process.platform === 'win32') {
  var RET_ERR_BADARGS = 10;
  var RET_ERR_UNAVAILABLE = 11;
  var RET_ERR_NOMAP = 12;
  var RET_ERR_BINSTDIN = 13;
  var RET_ERR_BINSTDOUT = 14;
  var RET_ERR_BADLEN = 15;

  var ERROR = {};
  var EXEPATH = __webpack_require__.ab + "pagent.exe";
  ERROR[RET_ERR_BADARGS] = new Error('Invalid pagent.exe arguments');
  ERROR[RET_ERR_UNAVAILABLE] = new Error('Pageant is not running');
  ERROR[RET_ERR_NOMAP] = new Error('pagent.exe could not create an mmap');
  ERROR[RET_ERR_BINSTDIN] = new Error('pagent.exe could not set mode for stdin');
  ERROR[RET_ERR_BINSTDOUT] = new Error('pagent.exe could not set mode for stdout');
  ERROR[RET_ERR_BADLEN] = new Error('pagent.exe did not get expected input payload');

  function PageantSock() {
    this.proc = undefined;
    this.buffer = null;
  }
  inherits(PageantSock, EventEmitter);

  PageantSock.prototype.write = function(buf) {
    if (this.buffer === null)
      this.buffer = buf;
    else {
      this.buffer = Buffer.concat([this.buffer, buf],
                                  this.buffer.length + buf.length);
    }
    // Wait for at least all length bytes
    if (this.buffer.length < 4)
      return;

    var len = readUInt32BE(this.buffer, 0);
    // Make sure we have a full message before querying pageant
    if ((this.buffer.length - 4) < len)
      return;

    buf = this.buffer.slice(0, 4 + len);
    if (this.buffer.length > (4 + len))
      this.buffer = this.buffer.slice(4 + len);
    else
      this.buffer = null;

    var self = this;
    var proc;
    var hadError = false;
    proc = this.proc = cp.spawn(__webpack_require__.ab + "pagent.exe", [ buf.length ]);
    proc.stdout.on('data', function(data) {
      self.emit('data', data);
    });
    proc.once('error', function(err) {
      if (!hadError) {
        hadError = true;
        self.emit('error', err);
      }
    });
    proc.once('close', function(code) {
      self.proc = undefined;
      if (ERROR[code] && !hadError) {
        hadError = true;
        self.emit('error', ERROR[code]);
      }
      self.emit('close', hadError);
    });
    proc.stdin.end(buf);
  };
  PageantSock.prototype.end = PageantSock.prototype.destroy = function() {
    this.buffer = null;
    if (this.proc) {
      this.proc.kill();
      this.proc = undefined;
    }
  };
  PageantSock.prototype.connect = function() {
    this.emit('connect');
  };
}


/***/ }),

/***/ 394:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

exports.extract = __webpack_require__(364)
exports.pack = __webpack_require__(383)


/***/ }),

/***/ 413:
/***/ (function(module) {

module.exports = require("stream");

/***/ }),

/***/ 417:
/***/ (function(module) {

module.exports = require("crypto");

/***/ }),

/***/ 427:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(413);


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 453:
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49)
var eos = __webpack_require__(9)
var fs = __webpack_require__(747) // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {}
var ancient = /^v?\.0/.test(process.version)

var isFn = function (fn) {
  return typeof fn === 'function'
}

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
}

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
}

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback)

  var closed = false
  stream.on('close', function () {
    closed = true
  })

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true
    callback()
  })

  var destroyed = false
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'))
  }
}

var call = function (fn) {
  fn()
}

var pipe = function (from, to) {
  return from.pipe(to)
}

var pump = function () {
  var streams = Array.prototype.slice.call(arguments)
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop

  if (Array.isArray(streams[0])) streams = streams[0]
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1
    var writing = i > 0
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err
      if (err) destroys.forEach(call)
      if (reading) return
      destroys.forEach(call)
      callback(error)
    })
  })

  return streams.reduce(pipe)
}

module.exports = pump


/***/ }),

/***/ 458:
/***/ (function(module, __unusedexports, __webpack_require__) {

/*
  Based heavily on the Streaming Boyer-Moore-Horspool C++ implementation
  by Hongli Lai at: https://github.com/FooBarWidget/boyer-moore-horspool
*/
var EventEmitter = __webpack_require__(614).EventEmitter,
    inherits = __webpack_require__(669).inherits;

function jsmemcmp(buf1, pos1, buf2, pos2, num) {
  for (var i = 0; i < num; ++i, ++pos1, ++pos2)
    if (buf1[pos1] !== buf2[pos2])
      return false;
  return true;
}

function SBMH(needle) {
  if (typeof needle === 'string')
    needle = new Buffer(needle);
  var i, j, needle_len = needle.length;

  this.maxMatches = Infinity;
  this.matches = 0;

  this._occ = new Array(256);
  this._lookbehind_size = 0;
  this._needle = needle;
  this._bufpos = 0;

  this._lookbehind = new Buffer(needle_len);

  // Initialize occurrence table.
  for (j = 0; j < 256; ++j)
    this._occ[j] = needle_len;

  // Populate occurrence table with analysis of the needle,
  // ignoring last letter.
  if (needle_len >= 1) {
    for (i = 0; i < needle_len - 1; ++i)
      this._occ[needle[i]] = needle_len - 1 - i;
  }
}
inherits(SBMH, EventEmitter);

SBMH.prototype.reset = function() {
  this._lookbehind_size = 0;
  this.matches = 0;
  this._bufpos = 0;
};

SBMH.prototype.push = function(chunk, pos) {
  var r, chlen;
  if (!Buffer.isBuffer(chunk))
    chunk = new Buffer(chunk, 'binary');
  chlen = chunk.length;
  this._bufpos = pos || 0;
  while (r !== chlen && this.matches < this.maxMatches)
    r = this._sbmh_feed(chunk);
  return r;
};

SBMH.prototype._sbmh_feed = function(data) {
  var len = data.length, needle = this._needle, needle_len = needle.length;

  // Positive: points to a position in `data`
  //           pos == 3 points to data[3]
  // Negative: points to a position in the lookbehind buffer
  //           pos == -2 points to lookbehind[lookbehind_size - 2]
  var pos = -this._lookbehind_size,
      last_needle_char = needle[needle_len - 1],
      occ = this._occ,
      lookbehind = this._lookbehind;

  if (pos < 0) {
    // Lookbehind buffer is not empty. Perform Boyer-Moore-Horspool
    // search with character lookup code that considers both the
    // lookbehind buffer and the current round's haystack data.
    //
    // Loop until
    //   there is a match.
    // or until
    //   we've moved past the position that requires the
    //   lookbehind buffer. In this case we switch to the
    //   optimized loop.
    // or until
    //   the character to look at lies outside the haystack.
    while (pos < 0 && pos <= len - needle_len) {
       var ch = this._sbmh_lookup_char(data, pos + needle_len - 1);

      if (ch === last_needle_char
          && this._sbmh_memcmp(data, pos, needle_len - 1)) {
        this._lookbehind_size = 0;
        ++this.matches;
        if (pos > -this._lookbehind_size)
          this.emit('info', true, lookbehind, 0, this._lookbehind_size + pos);
        else
          this.emit('info', true);

        this._bufpos = pos + needle_len;
        return pos + needle_len;
      } else
        pos += occ[ch];
    }

    // No match.

    if (pos < 0) {
      // There's too few data for Boyer-Moore-Horspool to run,
      // so let's use a different algorithm to skip as much as
      // we can.
      // Forward pos until
      //   the trailing part of lookbehind + data
      //   looks like the beginning of the needle
      // or until
      //   pos == 0
      while (pos < 0 && !this._sbmh_memcmp(data, pos, len - pos))
        pos++;
    }

    if (pos >= 0) {
      // Discard lookbehind buffer.
      this.emit('info', false, lookbehind, 0, this._lookbehind_size);
      this._lookbehind_size = 0;
    } else {
      // Cut off part of the lookbehind buffer that has
      // been processed and append the entire haystack
      // into it.
      var bytesToCutOff = this._lookbehind_size + pos;

      if (bytesToCutOff > 0) {
        // The cut off data is guaranteed not to contain the needle.
        this.emit('info', false, lookbehind, 0, bytesToCutOff);
      }

      lookbehind.copy(lookbehind, 0, bytesToCutOff,
                      this._lookbehind_size - bytesToCutOff);
      this._lookbehind_size -= bytesToCutOff;

      data.copy(lookbehind, this._lookbehind_size);
      this._lookbehind_size += len;

      this._bufpos = len;
      return len;
    }
  }

  if (pos >= 0)
    pos += this._bufpos;

  // Lookbehind buffer is now empty. Perform Boyer-Moore-Horspool
  // search with optimized character lookup code that only considers
  // the current round's haystack data.
  while (pos <= len - needle_len) {
    var ch = data[pos + needle_len - 1];

    if (ch === last_needle_char
        && data[pos] === needle[0]
        && jsmemcmp(needle, 0, data, pos, needle_len - 1)) {
      ++this.matches;
      if (pos > 0)
        this.emit('info', true, data, this._bufpos, pos);
      else
        this.emit('info', true);

      this._bufpos = pos + needle_len;
      return pos + needle_len;
    } else
      pos += occ[ch];
  }

  // There was no match. If there's trailing haystack data that we cannot
  // match yet using the Boyer-Moore-Horspool algorithm (because the trailing
  // data is less than the needle size) then match using a modified
  // algorithm that starts matching from the beginning instead of the end.
  // Whatever trailing data is left after running this algorithm is added to
  // the lookbehind buffer.
  if (pos < len) {
    while (pos < len && (data[pos] !== needle[0]
                         || !jsmemcmp(data, pos, needle, 0, len - pos))) {
      ++pos;
    }
    if (pos < len) {
      data.copy(lookbehind, 0, pos, pos + (len - pos));
      this._lookbehind_size = len - pos;
    }
  }

  // Everything until pos is guaranteed not to contain needle data.
  if (pos > 0)
    this.emit('info', false, data, this._bufpos, pos < len ? pos : len);

  this._bufpos = len;
  return len;
};

SBMH.prototype._sbmh_lookup_char = function(data, pos) {
  if (pos < 0)
    return this._lookbehind[this._lookbehind_size + pos];
  else
    return data[pos];
}

SBMH.prototype._sbmh_memcmp = function(data, pos, len) {
  var i = 0;

  while (i < len) {
    if (this._sbmh_lookup_char(data, pos + i) === this._needle[i])
      ++i;
    else
      return false;
  }
  return true;
}

module.exports = SBMH;


/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const file_command_1 = __webpack_require__(102);
const utils_1 = __webpack_require__(82);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 479:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents a volume
 * @param {Object} modem docker-modem
 * @param {String} name  Volume's name
 */
var Volume = function(modem, name) {
  this.modem = modem;
  this.name = name;
};

Volume.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Volume.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/volumes/' + this.name,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such volume',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Removes the volume
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Volume.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes/' + this.name,
    method: 'DELETE',
    statusCodes: {
      204: true,
      404: 'no such volume',
      409: 'conflict',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

module.exports = Volume;


/***/ }),

/***/ 486:
/***/ (function(module, __unusedexports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(317);

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 498:
/***/ (function(module, exports, __webpack_require__) {

//Based on follow-redirects v0.0.x

var nativeHttps = __webpack_require__(211),
  nativeHttp = __webpack_require__(605),
  url = __webpack_require__(835),
  utils = __webpack_require__(75);

var maxRedirects = module.exports.maxRedirects = 5;

var protocols = {
  https: nativeHttps,
  http: nativeHttp
};

for (var protocol in protocols) {
  var h = function() {};
  h.prototype = protocols[protocol];
  h = new h();

  h.request = function(h) {
    return function(options, callback, redirectOptions) {

      redirectOptions = redirectOptions || {};

      var max = (typeof options === 'object' && 'maxRedirects' in options) ? options.maxRedirects : exports.maxRedirects;

      var redirect = utils.extend({
        count: 0,
        max: max,
        clientRequest: null,
        userCallback: callback
      }, redirectOptions);

      if (redirect.count > redirect.max) {
        var err = new Error('Max redirects exceeded. To allow more redirects, pass options.maxRedirects property.');
        redirect.clientRequest.emit('error', err);
        return redirect.clientRequest;
      }

      redirect.count++;

      var reqUrl;
      if (typeof options === 'string') {
        reqUrl = options;
      } else {
        reqUrl = url.format(utils.extend({
          protocol: protocol
        }, options));
      }

      var clientRequest = Object.getPrototypeOf(h).request(options, redirectCallback(reqUrl, redirect));

      if (!redirect.clientRequest) redirect.clientRequest = clientRequest;

      function redirectCallback(reqUrl, redirect) {
        return function(res) {
          if (res.statusCode < 300 || res.statusCode > 399) {
            return redirect.userCallback(res);
          }

          if (!('location' in res.headers)) {
            return redirect.userCallback(res);
          }

          var redirectUrl = url.resolve(reqUrl, res.headers.location);

          var proto = url.parse(redirectUrl).protocol;
          proto = proto.substr(0, proto.length - 1);
          return module.exports[proto].get(redirectUrl, redirectCallback(reqUrl, redirect), redirect);
        };
      }

      return clientRequest;
    };
  }(h);

  // see https://github.com/joyent/node/blob/master/lib/http.js#L1623
  h.get = function(h) {
    return function(options, cb, redirectOptions) {
      var req = h.request(options, cb, redirectOptions);
      req.end();
      return req;
    };
  }(h);

  module.exports[protocol] = h;
}


/***/ }),

/***/ 516:
/***/ (function(module, __unusedexports, __webpack_require__) {

var path = __webpack_require__(622);
var fs = __webpack_require__(747);
var _0777 = parseInt('0777', 8);

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    
    var cb = f || function () {};
    p = path.resolve(p);
    
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};


/***/ }),

/***/ 523:
/***/ (function(module) {

module.exports = {
  readUInt32BE: function readUInt32BE(buf, offset) {
    return buf[offset++] * 16777216
           + buf[offset++] * 65536
           + buf[offset++] * 256
           + buf[offset];
  },
  writeUInt32BE: function writeUInt32BE(buf, value, offset) {
    buf[offset++] = (value >>> 24);
    buf[offset++] = (value >>> 16);
    buf[offset++] = (value >>> 8);
    buf[offset++] = value;
    return offset;
  },
  writeUInt32LE: function writeUInt32LE(buf, value, offset) {
    buf[offset++] = value;
    buf[offset++] = (value >>> 8);
    buf[offset++] = (value >>> 16);
    buf[offset++] = (value >>> 24);
    return offset;
  }
};


/***/ }),

/***/ 534:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(747).constants || __webpack_require__(619)


/***/ }),

/***/ 546:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents a plugin
 * @param {Object} modem docker-modem
 * @param {String} name  Plugin's name
 */
var Plugin = function(modem, name, remote) {
  this.modem = modem;
  this.name = name;
  this.remote = remote || name;
};

Plugin.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Plugin.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/plugins/' + this.name,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'plugin is not installed',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Removes the plugin
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Plugin.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins/' + this.name + '?',
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'plugin is not installed',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, data);
    });
  }
};

/**
 * get privileges
 * @param  {Function} callback Callback
 * @return {Object}            Name only if callback isn't specified.
 */
Plugin.prototype.privileges = function(callback) {
  var self = this;
  var optsf = {
    path: '/plugins/privileges?',
    method: 'GET',
    options: {
      'remote': this.remote
    },
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Installs a new plugin
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Plugin.prototype.pull = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  if(args.opts._query && !args.opts._query.name) {
    args.opts._query.name = this.name;
  }
  if(args.opts._query && !args.opts._query.remote) {
    args.opts._query.remote = this.remote;
  }

  var optsf = {
    path: '/plugins/pull?',
    method: 'POST',
    isStream: true,
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      500: 'server error'
    }
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Enable
 * @param  {Object}   opts     Plugin enable options (optional)
 * @param  {Function} callback Callback
 */
Plugin.prototype.enable = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins/' + this.name + '/enable?',
    method: 'POST',
    statusCodes: {
      200: true,
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Disable
 * @param  {Object}   opts     Plugin disable options (optional)
 * @param  {Function} callback Callback
 */
Plugin.prototype.disable = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins/' + this.name + '/disable',
    method: 'POST',
    statusCodes: {
      200: true,
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Push
 * @param  {Object}   opts     Plugin push options (optional)
 * @param  {Function} callback Callback
 */
Plugin.prototype.push = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins/' + this.name + '/push',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'plugin not installed',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * COnfigure
 * @param  {Object}   opts     Plugin configure options (optional)
 * @param  {Function} callback Callback
 */
Plugin.prototype.configure = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins/' + this.name + '/set',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'plugin not installed',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Upgrade plugin
 *
 * @param {object} auth
 * @param {object} opts
 * @param {function} callback
 */
Plugin.prototype.upgrade = function(auth, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  }

  var optsf = {
    path: '/plugins/' + this.name + '/upgrade?',
    method: 'POST',
    statusCodes: {
      200: true,
      204: true,
      404: 'plugin not installed',
      500: 'server error'
    },
    authconfig: auth,
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


module.exports = Plugin;


/***/ }),

/***/ 563:
/***/ (function(module) {

"use strict";


const codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error
  }

  function getMessage (arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message
    } else {
      return message(arg1, arg2, arg3)
    }
  }

  class NodeError extends Base {
    constructor (arg1, arg2, arg3) {
      super(getMessage(arg1, arg2, arg3));
    }
  }

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;

  codes[code] = NodeError;
}

// https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js
function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    const len = expected.length;
    expected = expected.map((i) => String(i));
    if (len > 2) {
      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` +
             expected[len - 1];
    } else if (len === 2) {
      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
    } else {
      return `of ${thing} ${expected[0]}`;
    }
  } else {
    return `of ${thing} ${String(expected)}`;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
function startsWith(str, search, pos) {
	return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
function endsWith(str, search, this_len) {
	if (this_len === undefined || this_len > str.length) {
		this_len = str.length;
	}
	return str.substring(this_len - search.length, this_len) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"'
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  let determiner;
  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  let msg;
  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
  } else {
    const type = includes(name, '.') ? 'property' : 'argument';
    msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
  }

  msg += `. Received type ${typeof actual}`;
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented'
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');

module.exports.codes = codes;


/***/ }),

/***/ 574:
/***/ (function(module, exports, __webpack_require__) {

var Stream = __webpack_require__(413);
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream.Readable;
  Object.assign(module.exports, Stream);
  module.exports.Stream = Stream;
} else {
  exports = module.exports = __webpack_require__(226);
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = __webpack_require__(241);
  exports.Duplex = __webpack_require__(831);
  exports.Transform = __webpack_require__(925);
  exports.PassThrough = __webpack_require__(882);
  exports.finished = __webpack_require__(740);
  exports.pipeline = __webpack_require__(238);
}


/***/ }),

/***/ 584:
/***/ (function(module) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


module.exports = {

  newInvalidAsn1Error: function (msg) {
    var e = new Error();
    e.name = 'InvalidAsn1Error';
    e.message = msg || '';
    return e;
  }

};


/***/ }),

/***/ 588:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an image
 * @param {Object} modem docker-modem
 * @param {String} name  Image's name
 */
var Image = function(modem, name) {
  this.modem = modem;
  this.name = name;
};

Image.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Image.prototype.inspect = function(callback) {
  var self = this;

  var opts = {
    path: '/images/' + this.name + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such image',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      if (err) return callback(err, data);
      callback(err, data);
    });
  }
};

/**
 * Distribution
 * @param {Object} opts
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Image.prototype.distribution = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;

  var fopts = {
    path: '/distribution/' + this.name + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      401: 'no such image',
      500: 'server error'
    },
    authconfig: (args.opts) ? args.opts.authconfig : undefined
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(fopts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(fopts, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, data);
    });
  }
};

/**
 * History
 * @param  {Function} callback Callback
 */
Image.prototype.history = function(callback) {
  var self = this;
  var opts = {
    path: '/images/' + this.name + '/history',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such image',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      if (err) return callback(err, data);
      callback(err, data);
    });
  }
};

/**
 * Get
 * @param  {Function} callback Callback with data stream.
 */
Image.prototype.get = function(callback) {
  var self = this;
  var opts = {
    path: '/images/' + this.name + '/get',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      if (err) return callback(err, data);
      callback(err, data);
    });
  }
};

/**
 * Push
 * @param  {Object}   opts     Push options, like 'registry' (optional)
 * @param  {Function} callback Callback with stream.
 * @param  {Object}   auth     Registry authentication
 */
Image.prototype.push = function(opts, callback, auth) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var isStream = true;
  if (args.opts.stream === false) {
    isStream = false;
  }
  var optsf = {
    path: '/images/' + this.name + '/push?',
    method: 'POST',
    options: args.opts,
    authconfig: args.opts.authconfig || auth,
    isStream: isStream,
    statusCodes: {
      200: true,
      404: 'no such image',
      500: 'server error'
    }
  };

  delete optsf.options.authconfig;

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Tag
 * @param  {Object}   opts     Tag options, like 'repo' (optional)
 * @param  {Function} callback Callback
 */
Image.prototype.tag = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/images/' + this.name + '/tag?',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      400: 'bad parameter',
      404: 'no such image',
      409: 'conflict',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Removes the image
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Image.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);


  var optsf = {
    path: '/images/' + this.name + '?',
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such image',
      409: 'conflict',
      500: 'server error'
    },
    options: args.opts
  };


  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

module.exports = Image;


/***/ }),

/***/ 597:
/***/ (function(module, __unusedexports, __webpack_require__) {

var crypto = __webpack_require__(417);
var Socket = __webpack_require__(631).Socket;
var dnsLookup = __webpack_require__(881).lookup;
var EventEmitter = __webpack_require__(614).EventEmitter;
var inherits = __webpack_require__(669).inherits;
var HASHES = crypto.getHashes();

var ssh2_streams = __webpack_require__(139);
var SSH2Stream = ssh2_streams.SSH2Stream;
var SFTPStream = ssh2_streams.SFTPStream;
var consts = ssh2_streams.constants;
var BUGS = consts.BUGS;
var ALGORITHMS = consts.ALGORITHMS;
var EDDSA_SUPPORTED = consts.EDDSA_SUPPORTED;
var parseKey = ssh2_streams.utils.parseKey;

var HTTPAgents = __webpack_require__(307);
var Channel = __webpack_require__(89);
var agentQuery = __webpack_require__(393);
var SFTPWrapper = __webpack_require__(33);
var readUInt32BE = __webpack_require__(58).readUInt32BE;

var MAX_CHANNEL = Math.pow(2, 32) - 1;
var RE_OPENSSH = /^OpenSSH_(?:(?![0-4])\d)|(?:\d{2,})/;
var DEBUG_NOOP = function(msg) {};

function Client() {
  if (!(this instanceof Client))
    return new Client();

  EventEmitter.call(this);

  this.config = {
    host: undefined,
    port: undefined,
    localAddress: undefined,
    localPort: undefined,
    forceIPv4: undefined,
    forceIPv6: undefined,
    keepaliveCountMax: undefined,
    keepaliveInterval: undefined,
    readyTimeout: undefined,

    username: undefined,
    password: undefined,
    privateKey: undefined,
    tryKeyboard: undefined,
    agent: undefined,
    allowAgentFwd: undefined,
    authHandler: undefined,

    hostHashAlgo: undefined,
    hostHashCb: undefined,
    strictVendor: undefined,
    debug: undefined
  };

  this._readyTimeout = undefined;
  this._channels = undefined;
  this._callbacks = undefined;
  this._forwarding = undefined;
  this._forwardingUnix = undefined;
  this._acceptX11 = undefined;
  this._agentFwdEnabled = undefined;
  this._curChan = undefined;
  this._remoteVer = undefined;

  this._sshstream = undefined;
  this._sock = undefined;
  this._resetKA = undefined;
}
inherits(Client, EventEmitter);

Client.prototype.connect = function(cfg) {
  var self = this;

  if (this._sock && this._sock.writable) {
    this.once('close', function() {
      self.connect(cfg);
    });
    this.end();
    return;
  }

  this.config.host = cfg.hostname || cfg.host || 'localhost';
  this.config.port = cfg.port || 22;
  this.config.localAddress = (typeof cfg.localAddress === 'string'
                              ? cfg.localAddress
                              : undefined);
  this.config.localPort = (typeof cfg.localPort === 'string'
                           || typeof cfg.localPort === 'number'
                           ? cfg.localPort
                           : undefined);
  this.config.forceIPv4 = cfg.forceIPv4 || false;
  this.config.forceIPv6 = cfg.forceIPv6 || false;
  this.config.keepaliveCountMax = (typeof cfg.keepaliveCountMax === 'number'
                                   && cfg.keepaliveCountMax >= 0
                                   ? cfg.keepaliveCountMax
                                   : 3);
  this.config.keepaliveInterval = (typeof cfg.keepaliveInterval === 'number'
                                   && cfg.keepaliveInterval > 0
                                   ? cfg.keepaliveInterval
                                   : 0);
  this.config.readyTimeout = (typeof cfg.readyTimeout === 'number'
                              && cfg.readyTimeout >= 0
                              ? cfg.readyTimeout
                              : 20000);

  var algorithms = {
    kex: undefined,
    kexBuf: undefined,
    cipher: undefined,
    cipherBuf: undefined,
    serverHostKey: undefined,
    serverHostKeyBuf: undefined,
    hmac: undefined,
    hmacBuf: undefined,
    compress: undefined,
    compressBuf: undefined
  };
  var i;
  if (typeof cfg.algorithms === 'object' && cfg.algorithms !== null) {
    var algosSupported;
    var algoList;

    algoList = cfg.algorithms.kex;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_KEX;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported key exchange algorithm: ' + algoList[i]);
      }
      algorithms.kex = algoList;
    }

    algoList = cfg.algorithms.cipher;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_CIPHER;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported cipher algorithm: ' + algoList[i]);
      }
      algorithms.cipher = algoList;
    }

    algoList = cfg.algorithms.serverHostKey;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_SERVER_HOST_KEY;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1) {
          throw new Error('Unsupported server host key algorithm: '
                           + algoList[i]);
        }
      }
      algorithms.serverHostKey = algoList;
    }

    algoList = cfg.algorithms.hmac;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_HMAC;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported HMAC algorithm: ' + algoList[i]);
      }
      algorithms.hmac = algoList;
    }

    algoList = cfg.algorithms.compress;
    if (Array.isArray(algoList) && algoList.length > 0) {
      algosSupported = ALGORITHMS.SUPPORTED_COMPRESS;
      for (i = 0; i < algoList.length; ++i) {
        if (algosSupported.indexOf(algoList[i]) === -1)
          throw new Error('Unsupported compression algorithm: ' + algoList[i]);
      }
      algorithms.compress = algoList;
    }
  }
  if (algorithms.compress === undefined) {
    if (cfg.compress) {
      algorithms.compress = ['zlib@openssh.com', 'zlib'];
      if (cfg.compress !== 'force')
        algorithms.compress.push('none');
    } else if (cfg.compress === false)
      algorithms.compress = ['none'];
  }

  if (typeof cfg.username === 'string')
    this.config.username = cfg.username;
  else if (typeof cfg.user === 'string')
    this.config.username = cfg.user;
  else
    throw new Error('Invalid username');

  this.config.password = (typeof cfg.password === 'string'
                          ? cfg.password
                          : undefined);
  this.config.privateKey = (typeof cfg.privateKey === 'string'
                            || Buffer.isBuffer(cfg.privateKey)
                            ? cfg.privateKey
                            : undefined);
  this.config.localHostname = (typeof cfg.localHostname === 'string'
                               && cfg.localHostname.length
                               ? cfg.localHostname
                               : undefined);
  this.config.localUsername = (typeof cfg.localUsername === 'string'
                               && cfg.localUsername.length
                               ? cfg.localUsername
                               : undefined);
  this.config.tryKeyboard = (cfg.tryKeyboard === true);
  this.config.agent = (typeof cfg.agent === 'string' && cfg.agent.length
                       ? cfg.agent
                       : undefined);
  this.config.allowAgentFwd = (cfg.agentForward === true
                               && this.config.agent !== undefined);
  var authHandler = this.config.authHandler = (
    typeof cfg.authHandler === 'function' ? cfg.authHandler : undefined
  );

  this.config.strictVendor = (typeof cfg.strictVendor === 'boolean'
                              ? cfg.strictVendor
                              : true);

  var debug = this.config.debug = (typeof cfg.debug === 'function'
                                   ? cfg.debug
                                   : DEBUG_NOOP);

  if (cfg.agentForward === true && !this.config.allowAgentFwd)
    throw new Error('You must set a valid agent path to allow agent forwarding');

  var callbacks = this._callbacks = [];
  this._channels = {};
  this._forwarding = {};
  this._forwardingUnix = {};
  this._acceptX11 = 0;
  this._agentFwdEnabled = false;
  this._curChan = -1;
  this._remoteVer = undefined;
  var privateKey;

  if (this.config.privateKey) {
    privateKey = parseKey(this.config.privateKey, cfg.passphrase);
    if (privateKey instanceof Error)
      throw new Error('Cannot parse privateKey: ' + privateKey.message);
    if (Array.isArray(privateKey))
      privateKey = privateKey[0]; // OpenSSH's newer format only stores 1 key for now
    if (privateKey.getPrivatePEM() === null)
      throw new Error('privateKey value does not contain a (valid) private key');
  }

  var stream = this._sshstream = new SSH2Stream({
    algorithms: algorithms,
    debug: (debug === DEBUG_NOOP ? undefined : debug)
  });
  var sock = this._sock = (cfg.sock || new Socket());

  // drain stderr if we are connection hopping using an exec stream
  if (this._sock.stderr && typeof this._sock.stderr.resume === 'function')
    this._sock.stderr.resume();

  // keepalive-related
  var kainterval = this.config.keepaliveInterval;
  var kacountmax = this.config.keepaliveCountMax;
  var kacount = 0;
  var katimer;
  function sendKA() {
    if (++kacount > kacountmax) {
      clearInterval(katimer);
      if (sock.readable) {
        var err = new Error('Keepalive timeout');
        err.level = 'client-timeout';
        self.emit('error', err);
        sock.destroy();
      }
      return;
    }
    if (sock.writable) {
      // append dummy callback to keep correct callback order
      callbacks.push(resetKA);
      stream.ping();
    } else
      clearInterval(katimer);
  }
  function resetKA() {
    if (kainterval > 0) {
      kacount = 0;
      clearInterval(katimer);
      if (sock.writable)
        katimer = setInterval(sendKA, kainterval);
    }
  }
  this._resetKA = resetKA;

  stream.on('USERAUTH_BANNER', function(msg) {
    self.emit('banner', msg);
  });

  sock.on('connect', function() {
    debug('DEBUG: Client: Connected');
    self.emit('connect');
    if (!cfg.sock)
      stream.pipe(sock).pipe(stream);
  }).on('timeout', function() {
    self.emit('timeout');
  }).on('error', function(err) {
    clearTimeout(self._readyTimeout);
    err.level = 'client-socket';
    self.emit('error', err);
  }).on('end', function() {
    stream.unpipe(sock);
    clearTimeout(self._readyTimeout);
    clearInterval(katimer);
    self.emit('end');
  }).on('close', function() {
    stream.unpipe(sock);
    clearTimeout(self._readyTimeout);
    clearInterval(katimer);
    self.emit('close');

    // notify outstanding channel requests of disconnection ...
    var callbacks_ = callbacks;
    var err = new Error('No response from server');
    callbacks = self._callbacks = [];
    for (i = 0; i < callbacks_.length; ++i)
      callbacks_[i](err);

    // simulate error for any channels waiting to be opened. this is safe
    // against successfully opened channels because the success and failure
    // event handlers are automatically removed when a success/failure response
    // is received
    var channels = self._channels;
    var chanNos = Object.keys(channels);
    self._channels = {};
    for (i = 0; i < chanNos.length; ++i) {
      var ev1 = stream.emit('CHANNEL_OPEN_FAILURE:' + chanNos[i], err);
      // emitting CHANNEL_CLOSE should be safe too and should help for any
      // special channels which might otherwise keep the process alive, such
      // as agent forwarding channels which have open unix sockets ...
      var ev2 = stream.emit('CHANNEL_CLOSE:' + chanNos[i]);
      var earlyCb;
      if (!ev1 && !ev2 && (earlyCb = channels[chanNos[i]])
          && typeof earlyCb === 'function') {
        earlyCb(err);
      }
    }
  });
  stream.on('drain', function() {
    self.emit('drain');
  }).once('header', function(header) {
    self._remoteVer = header.versions.software;
    if (header.greeting)
      self.emit('greeting', header.greeting);
  }).on('continue', function() {
    self.emit('continue');
  }).on('error', function(err) {
    if (err.level === undefined)
      err.level = 'protocol';
    else if (err.level === 'handshake')
      clearTimeout(self._readyTimeout);
    self.emit('error', err);
  }).on('end', function() {
    sock.resume();
  });

  if (typeof cfg.hostVerifier === 'function') {
    if (HASHES.indexOf(cfg.hostHash) === -1)
      throw new Error('Invalid host hash algorithm: ' + cfg.hostHash);
    var hashCb = cfg.hostVerifier;
    var hasher = crypto.createHash(cfg.hostHash);
    stream.once('fingerprint', function(key, verify) {
      hasher.update(key);
      var ret = hashCb(hasher.digest('hex'), verify);
      if (ret !== undefined)
        verify(ret);
    });
  }

  // begin authentication handling =============================================
  var curAuth;
  var curPartial = null;
  var curAuthsLeft = null;
  var agentKeys;
  var agentKeyPos = 0;
  var authsAllowed = ['none'];
  if (this.config.password !== undefined)
    authsAllowed.push('password');
  if (privateKey !== undefined)
    authsAllowed.push('publickey');
  if (this.config.agent !== undefined)
    authsAllowed.push('agent');
  if (this.config.tryKeyboard)
    authsAllowed.push('keyboard-interactive');
  if (privateKey !== undefined
      && this.config.localHostname !== undefined
      && this.config.localUsername !== undefined) {
    authsAllowed.push('hostbased');
  }

  if (authHandler === undefined) {
    var authPos = 0;
    authHandler = function authHandler(authsLeft, partial, cb) {
      if (authPos === authsAllowed.length)
        return false;
      return authsAllowed[authPos++];
    };
  }

  var hasSentAuth = false;
  function doNextAuth(authName) {
    hasSentAuth = true;
    if (authName === false) {
      stream.removeListener('USERAUTH_FAILURE', onUSERAUTH_FAILURE);
      stream.removeListener('USERAUTH_PK_OK', onUSERAUTH_PK_OK);
      var err = new Error('All configured authentication methods failed');
      err.level = 'client-authentication';
      self.emit('error', err);
      if (stream.writable)
        self.end();
      return;
    }
    if (authsAllowed.indexOf(authName) === -1)
      throw new Error('Authentication method not allowed: ' + authName);
    curAuth = authName;
    switch (curAuth) {
      case 'password':
        stream.authPassword(self.config.username, self.config.password);
      break;
      case 'publickey':
        stream.authPK(self.config.username, privateKey);
        stream.once('USERAUTH_PK_OK', onUSERAUTH_PK_OK);
      break;
      case 'hostbased':
        function hostbasedCb(buf, cb) {
          var signature = privateKey.sign(buf);
          if (signature instanceof Error) {
            signature.message = 'Error while signing data with privateKey: '
                                + signature.message;
            signature.level = 'client-authentication';
            self.emit('error', signature);
            return tryNextAuth();
          }

          cb(signature);
        }
        stream.authHostbased(self.config.username,
                             privateKey,
                             self.config.localHostname,
                             self.config.localUsername,
                             hostbasedCb);
      break;
      case 'agent':
        agentQuery(self.config.agent, function(err, keys) {
          if (err) {
            err.level = 'agent';
            self.emit('error', err);
            agentKeys = undefined;
            return tryNextAuth();
          } else if (keys.length === 0) {
            debug('DEBUG: Agent: No keys stored in agent');
            agentKeys = undefined;
            return tryNextAuth();
          }

          agentKeys = keys;
          agentKeyPos = 0;

          stream.authPK(self.config.username, keys[0]);
          stream.once('USERAUTH_PK_OK', onUSERAUTH_PK_OK);
        });
      break;
      case 'keyboard-interactive':
        stream.authKeyboard(self.config.username);
        stream.on('USERAUTH_INFO_REQUEST', onUSERAUTH_INFO_REQUEST);
      break;
      case 'none':
        stream.authNone(self.config.username);
      break;
    }
  }
  function tryNextAuth() {
    hasSentAuth = false;
    var auth = authHandler(curAuthsLeft, curPartial, doNextAuth);
    if (hasSentAuth || auth === undefined)
      return;
    doNextAuth(auth);
  }
  function tryNextAgentKey() {
    if (curAuth === 'agent') {
      if (agentKeyPos >= agentKeys.length)
        return;
      if (++agentKeyPos >= agentKeys.length) {
        debug('DEBUG: Agent: No more keys left to try');
        debug('DEBUG: Client: agent auth failed');
        agentKeys = undefined;
        tryNextAuth();
      } else {
        debug('DEBUG: Agent: Trying key #' + (agentKeyPos + 1));
        stream.authPK(self.config.username, agentKeys[agentKeyPos]);
        stream.once('USERAUTH_PK_OK', onUSERAUTH_PK_OK);
      }
    }
  }
  function onUSERAUTH_INFO_REQUEST(name, instructions, lang, prompts) {
    var nprompts = (Array.isArray(prompts) ? prompts.length : 0);
    if (nprompts === 0) {
      debug('DEBUG: Client: Sending automatic USERAUTH_INFO_RESPONSE');
      return stream.authInfoRes();
    }
    // we sent a keyboard-interactive user authentication request and now the
    // server is sending us the prompts we need to present to the user
    self.emit('keyboard-interactive',
              name,
              instructions,
              lang,
              prompts,
              function(answers) {
                stream.authInfoRes(answers);
              }
    );
  }
  function onUSERAUTH_PK_OK() {
    if (curAuth === 'agent') {
      var agentKey = agentKeys[agentKeyPos];
      var keyLen = readUInt32BE(agentKey, 0);
      var pubKeyFullType = agentKey.toString('ascii', 4, 4 + keyLen);
      var pubKeyType = pubKeyFullType.slice(4);
      // Check that we support the key type first
      // TODO: move key type checking logic to ssh2-streams
      switch (pubKeyFullType) {
        case 'ssh-rsa':
        case 'ssh-dss':
        case 'ecdsa-sha2-nistp256':
        case 'ecdsa-sha2-nistp384':
        case 'ecdsa-sha2-nistp521':
          break;
        default:
          if (EDDSA_SUPPORTED && pubKeyFullType === 'ssh-ed25519')
            break;
          debug('DEBUG: Agent: Skipping unsupported key type: '
                + pubKeyFullType);
          return tryNextAgentKey();
      }
      stream.authPK(self.config.username, 
                    agentKey,
                    function(buf, cb) {
        agentQuery(self.config.agent,
                   agentKey,
                   pubKeyType,
                   buf,
                   function(err, signed) {
          if (err) {
            err.level = 'agent';
            self.emit('error', err);
          } else {
            var sigFullTypeLen = readUInt32BE(signed, 0);
            if (4 + sigFullTypeLen + 4 < signed.length) {
              var sigFullType = signed.toString('ascii', 4, 4 + sigFullTypeLen);
              if (sigFullType !== pubKeyFullType) {
                err = new Error('Agent key/signature type mismatch');
                err.level = 'agent';
                self.emit('error', err);
              } else {
                // skip algoLen + algo + sigLen
                return cb(signed.slice(4 + sigFullTypeLen + 4));
              }
            }
          }

          tryNextAgentKey();
        });
      });
    } else if (curAuth === 'publickey') {
      stream.authPK(self.config.username, privateKey, function(buf, cb) {
        var signature = privateKey.sign(buf);
        if (signature instanceof Error) {
          signature.message = 'Error while signing data with privateKey: '
                              + signature.message;
          signature.level = 'client-authentication';
          self.emit('error', signature);
          return tryNextAuth();
        }
        cb(signature);
      });
    }
  }
  function onUSERAUTH_FAILURE(authsLeft, partial) {
    stream.removeListener('USERAUTH_PK_OK', onUSERAUTH_PK_OK);
    stream.removeListener('USERAUTH_INFO_REQUEST', onUSERAUTH_INFO_REQUEST);
    if (curAuth === 'agent') {
      debug('DEBUG: Client: Agent key #' + (agentKeyPos + 1) + ' failed');
      return tryNextAgentKey();
    } else {
      debug('DEBUG: Client: ' + curAuth + ' auth failed');
    }

    curPartial = partial;
    curAuthsLeft = authsLeft;
    tryNextAuth();
  }
  stream.once('USERAUTH_SUCCESS', function() {
    stream.removeListener('USERAUTH_FAILURE', onUSERAUTH_FAILURE);
    stream.removeListener('USERAUTH_INFO_REQUEST', onUSERAUTH_INFO_REQUEST);

    // start keepalive mechanism
    resetKA();

    clearTimeout(self._readyTimeout);

    self.emit('ready');
  }).on('USERAUTH_FAILURE', onUSERAUTH_FAILURE);
  // end authentication handling ===============================================

  // handle initial handshake completion
  stream.once('ready', function() {
    stream.service('ssh-userauth');
    stream.once('SERVICE_ACCEPT', function(svcName) {
      if (svcName === 'ssh-userauth')
        tryNextAuth();
    });
  });

  // handle incoming requests from server, typically a forwarded TCP or X11
  // connection
  stream.on('CHANNEL_OPEN', function(info) {
    onCHANNEL_OPEN(self, info);
  });

  // handle responses for tcpip-forward and other global requests
  stream.on('REQUEST_SUCCESS', function(data) {
    if (callbacks.length)
      callbacks.shift()(false, data);
  }).on('REQUEST_FAILURE', function() {
    if (callbacks.length)
      callbacks.shift()(true);
  });

  stream.on('GLOBAL_REQUEST', function(name, wantReply, data) {
    // auto-reject all global requests, this can be especially useful if the
    // server is sending us dummy keepalive global requests
    if (wantReply)
      stream.requestFailure();
  });

  if (!cfg.sock) {
    var host = this.config.host;
    var forceIPv4 = this.config.forceIPv4;
    var forceIPv6 = this.config.forceIPv6;

    debug('DEBUG: Client: Trying '
          + host
          + ' on port '
          + this.config.port
          + ' ...');

    function doConnect() {
      startTimeout();
      self._sock.connect({
        host: host,
        port: self.config.port,
        localAddress: self.config.localAddress,
        localPort: self.config.localPort
      });
      self._sock.setNoDelay(true);
      self._sock.setMaxListeners(0);
      self._sock.setTimeout(typeof cfg.timeout === 'number' ? cfg.timeout : 0);
    }

    if ((!forceIPv4 && !forceIPv6) || (forceIPv4 && forceIPv6))
      doConnect();
    else {
      dnsLookup(host, (forceIPv4 ? 4 : 6), function(err, address, family) {
        if (err) {
          var error = new Error('Error while looking up '
                                + (forceIPv4 ? 'IPv4' : 'IPv6')
                                + ' address for host '
                                + host
                                + ': ' + err);
          clearTimeout(self._readyTimeout);
          error.level = 'client-dns';
          self.emit('error', error);
          self.emit('close');
          return;
        }
        host = address;
        doConnect();
      });
    }
  } else {
    startTimeout();
    stream.pipe(sock).pipe(stream);
  }

  function startTimeout() {
    if (self.config.readyTimeout > 0) {
      self._readyTimeout = setTimeout(function() {
        var err = new Error('Timed out while waiting for handshake');
        err.level = 'client-timeout';
        self.emit('error', err);
        sock.destroy();
      }, self.config.readyTimeout);
    }
  }
};

Client.prototype.end = function() {
  if (this._sock
      && this._sock.writable
      && this._sshstream
      && this._sshstream.writable)
    return this._sshstream.disconnect();
  return false;
};

Client.prototype.destroy = function() {
  this._sock && this._sock.destroy();
};

Client.prototype.exec = function(cmd, opts, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var self = this;
  var extraOpts = { allowHalfOpen: (opts.allowHalfOpen !== false) };

  return openChannel(this, 'session', extraOpts, function(err, chan) {
    if (err)
      return cb(err);

    var todo = [];

    function reqCb(err) {
      if (err) {
        chan.close();
        return cb(err);
      }
      if (todo.length)
        todo.shift()();
    }

    if (self.config.allowAgentFwd === true
        || (opts
            && opts.agentForward === true
            && self.config.agent !== undefined)) {
      todo.push(function() {
        reqAgentFwd(chan, reqCb);
      });
    }

    if (typeof opts === 'object' && opts !== null) {
      if (typeof opts.env === 'object' && opts.env !== null)
        reqEnv(chan, opts.env);
      if ((typeof opts.pty === 'object' && opts.pty !== null)
          || opts.pty === true) {
        todo.push(function() { reqPty(chan, opts.pty, reqCb); });
      }
      if ((typeof opts.x11 === 'object' && opts.x11 !== null)
          || opts.x11 === 'number'
          || opts.x11 === true) {
        todo.push(function() { reqX11(chan, opts.x11, reqCb); });
      }
    }

    todo.push(function() { reqExec(chan, cmd, opts, cb); });
    todo.shift()();
  });
};

Client.prototype.shell = function(wndopts, opts, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  // start an interactive terminal/shell session
  var self = this;

  if (typeof wndopts === 'function') {
    cb = wndopts;
    wndopts = opts = undefined;
  } else if (typeof opts === 'function') {
    cb = opts;
    opts = undefined;
  }
  if (wndopts && (wndopts.x11 !== undefined || wndopts.env !== undefined)) {
    opts = wndopts;
    wndopts = undefined;
  }

  return openChannel(this, 'session', function(err, chan) {
    if (err)
      return cb(err);

    var todo = [];

    function reqCb(err) {
      if (err) {
        chan.close();
        return cb(err);
      }
      if (todo.length)
        todo.shift()();
    }

    if (self.config.allowAgentFwd === true
        || (opts
            && opts.agentForward === true
            && self.config.agent !== undefined)) {
      todo.push(function() { reqAgentFwd(chan, reqCb); });
    }

    if (wndopts !== false)
      todo.push(function() { reqPty(chan, wndopts, reqCb); });

    if (typeof opts === 'object' && opts !== null) {
      if (typeof opts.env === 'object' && opts.env !== null)
        reqEnv(chan, opts.env);
      if ((typeof opts.x11 === 'object' && opts.x11 !== null)
          || opts.x11 === 'number'
          || opts.x11 === true) {
        todo.push(function() { reqX11(chan, opts.x11, reqCb); });
      }
    }

    todo.push(function() { reqShell(chan, cb); });
    todo.shift()();
  });
};

Client.prototype.subsys = function(name, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

	return openChannel(this, 'session', function(err, chan) {
		if (err)
			return cb(err);

		reqSubsystem(chan, name, function(err, stream) {
			if (err)
				return cb(err);

			cb(undefined, stream);
		});
	});
};

Client.prototype.sftp = function(cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  var self = this;

  // start an SFTP session
  return openChannel(this, 'session', function(err, chan) {
    if (err)
      return cb(err);

    reqSubsystem(chan, 'sftp', function(err, stream) {
      if (err)
        return cb(err);

      var serverIdentRaw = self._sshstream._state.incoming.identRaw;
      var cfg = { debug: self.config.debug };
      var sftp = new SFTPStream(cfg, serverIdentRaw);

      function onError(err) {
        sftp.removeListener('ready', onReady);
        stream.removeListener('exit', onExit);
        cb(err);
      }

      function onReady() {
        sftp.removeListener('error', onError);
        stream.removeListener('exit', onExit);
        cb(undefined, new SFTPWrapper(sftp));
      }

      function onExit(code, signal) {
        sftp.removeListener('ready', onReady);
        sftp.removeListener('error', onError);
        var msg;
        if (typeof code === 'number') {
          msg = 'Received exit code '
                + code
                + ' while establishing SFTP session';
        } else {
          msg = 'Received signal '
                + signal
                + ' while establishing SFTP session';
        }
        var err = new Error(msg);
        err.code = code;
        err.signal = signal;
        cb(err);
      }

      sftp.once('error', onError)
          .once('ready', onReady)
          .once('close', function() {
            stream.end();
          });

      // OpenSSH server sends an exit-status if there was a problem spinning up
      // an sftp server child process, so we listen for that here in order to
      // properly raise an error.
      stream.once('exit', onExit);

      sftp.pipe(stream).pipe(sftp);
    });
  });
};

Client.prototype.forwardIn = function(bindAddr, bindPort, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  // send a request for the server to start forwarding TCP connections to us
  // on a particular address and port

  var self = this;
  var wantReply = (typeof cb === 'function');

  if (wantReply) {
    this._callbacks.push(function(had_err, data) {
      if (had_err) {
        return cb(had_err !== true
                  ? had_err
                  : new Error('Unable to bind to ' + bindAddr + ':' + bindPort));
      }

      var realPort = bindPort;
      if (bindPort === 0 && data && data.length >= 4) {
        realPort = readUInt32BE(data, 0);
        if (!(self._sshstream.remoteBugs & BUGS.DYN_RPORT_BUG))
          bindPort = realPort;
      }

      self._forwarding[bindAddr + ':' + bindPort] = realPort;

      cb(undefined, realPort);
    });
  }

  return this._sshstream.tcpipForward(bindAddr, bindPort, wantReply);
};

Client.prototype.unforwardIn = function(bindAddr, bindPort, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  // send a request to stop forwarding us new connections for a particular
  // address and port

  var self = this;
  var wantReply = (typeof cb === 'function');

  if (wantReply) {
    this._callbacks.push(function(had_err) {
      if (had_err) {
        return cb(had_err !== true
                  ? had_err
                  : new Error('Unable to unbind from '
                              + bindAddr + ':' + bindPort));
      }

      delete self._forwarding[bindAddr + ':' + bindPort];

      cb();
    });
  }

  return this._sshstream.cancelTcpipForward(bindAddr, bindPort, wantReply);
};

Client.prototype.forwardOut = function(srcIP, srcPort, dstIP, dstPort, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  // send a request to forward a TCP connection to the server

  var cfg = {
    srcIP: srcIP,
    srcPort: srcPort,
    dstIP: dstIP,
    dstPort: dstPort
  };

  return openChannel(this, 'direct-tcpip', cfg, cb);
};

Client.prototype.openssh_noMoreSessions = function(cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  var wantReply = (typeof cb === 'function');

  if (!this.config.strictVendor
      || (this.config.strictVendor && RE_OPENSSH.test(this._remoteVer))) {
    if (wantReply) {
      this._callbacks.push(function(had_err) {
        if (had_err) {
          return cb(had_err !== true
                    ? had_err
                    : new Error('Unable to disable future sessions'));
        }

        cb();
      });
    }

    return this._sshstream.openssh_noMoreSessions(wantReply);
  } else if (wantReply) {
    process.nextTick(function() {
      cb(new Error('strictVendor enabled and server is not OpenSSH or compatible version'));
    });
  }

  return true;
};

Client.prototype.openssh_forwardInStreamLocal = function(socketPath, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  var wantReply = (typeof cb === 'function');
  var self = this;

  if (!this.config.strictVendor
      || (this.config.strictVendor && RE_OPENSSH.test(this._remoteVer))) {
    if (wantReply) {
      this._callbacks.push(function(had_err) {
        if (had_err) {
          return cb(had_err !== true
                    ? had_err
                    : new Error('Unable to bind to ' + socketPath));
        }
        self._forwardingUnix[socketPath] = true;
        cb();
      });
    }

    return this._sshstream.openssh_streamLocalForward(socketPath, wantReply);
  } else if (wantReply) {
    process.nextTick(function() {
      cb(new Error('strictVendor enabled and server is not OpenSSH or compatible version'));
    });
  }

  return true;
};

Client.prototype.openssh_unforwardInStreamLocal = function(socketPath, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  var wantReply = (typeof cb === 'function');
  var self = this;

  if (!this.config.strictVendor
      || (this.config.strictVendor && RE_OPENSSH.test(this._remoteVer))) {
    if (wantReply) {
      this._callbacks.push(function(had_err) {
        if (had_err) {
          return cb(had_err !== true
                    ? had_err
                    : new Error('Unable to unbind on ' + socketPath));
        }
        delete self._forwardingUnix[socketPath];
        cb();
      });
    }

    return this._sshstream.openssh_cancelStreamLocalForward(socketPath,
                                                            wantReply);
  } else if (wantReply) {
    process.nextTick(function() {
      cb(new Error('strictVendor enabled and server is not OpenSSH or compatible version'));
    });
  }

  return true;
};

Client.prototype.openssh_forwardOutStreamLocal = function(socketPath, cb) {
  if (!this._sock
      || !this._sock.writable
      || !this._sshstream
      || !this._sshstream.writable)
    throw new Error('Not connected');

  if (!this.config.strictVendor
      || (this.config.strictVendor && RE_OPENSSH.test(this._remoteVer))) {
    var cfg = { socketPath: socketPath };
    return openChannel(this, 'direct-streamlocal@openssh.com', cfg, cb);
  } else {
    process.nextTick(function() {
      cb(new Error('strictVendor enabled and server is not OpenSSH or compatible version'));
    });
  }

  return true;
};

function openChannel(self, type, opts, cb) {
  // ask the server to open a channel for some purpose
  // (e.g. session (sftp, exec, shell), or forwarding a TCP connection
  var localChan = nextChannel(self);
  var initWindow = Channel.MAX_WINDOW;
  var maxPacket = Channel.PACKET_SIZE;
  var ret = true;

  if (localChan === false)
    return cb(new Error('No free channels available'));

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  self._channels[localChan] = cb;

  var sshstream = self._sshstream;
  sshstream.once('CHANNEL_OPEN_CONFIRMATION:' + localChan, onSuccess)
           .once('CHANNEL_OPEN_FAILURE:' + localChan, onFailure)
           .once('CHANNEL_CLOSE:' + localChan, onFailure);

  if (type === 'session')
    ret = sshstream.session(localChan, initWindow, maxPacket);
  else if (type === 'direct-tcpip')
    ret = sshstream.directTcpip(localChan, initWindow, maxPacket, opts);
  else if (type === 'direct-streamlocal@openssh.com') {
    ret = sshstream.openssh_directStreamLocal(localChan,
                                              initWindow,
                                              maxPacket,
                                              opts);
  }

  return ret;

  function onSuccess(info) {
    sshstream.removeListener('CHANNEL_OPEN_FAILURE:' + localChan, onFailure);
    sshstream.removeListener('CHANNEL_CLOSE:' + localChan, onFailure);

    var chaninfo = {
      type: type,
      incoming: {
        id: localChan,
        window: initWindow,
        packetSize: maxPacket,
        state: 'open'
      },
      outgoing: {
        id: info.sender,
        window: info.window,
        packetSize: info.packetSize,
        state: 'open'
      }
    };
    cb(undefined, new Channel(chaninfo, self));
  }

  function onFailure(info) {
    sshstream.removeListener('CHANNEL_OPEN_CONFIRMATION:' + localChan,
                             onSuccess);
    sshstream.removeListener('CHANNEL_OPEN_FAILURE:' + localChan, onFailure);
    sshstream.removeListener('CHANNEL_CLOSE:' + localChan, onFailure);

    delete self._channels[localChan];

    var err;
    if (info instanceof Error)
      err = info;
    else if (typeof info === 'object' && info !== null) {
      err = new Error('(SSH) Channel open failure: ' + info.description);
      err.reason = info.reason;
      err.lang = info.lang;
    } else {
      err = new Error('(SSH) Channel open failure: '
                      + 'server closed channel unexpectedly');
      err.reason = err.lang = '';
    }
    cb(err);
  }
}

function nextChannel(self) {
  // get the next available channel number

  // optimized path
  if (self._curChan < MAX_CHANNEL)
    return ++self._curChan;

  // slower lookup path
  for (var i = 0, channels = self._channels; i < MAX_CHANNEL; ++i)
    if (!channels[i])
      return i;

  return false;
}

function reqX11(chan, screen, cb) {
  // asks server to start sending us X11 connections
  var cfg = {
    single: false,
    protocol: 'MIT-MAGIC-COOKIE-1',
    cookie: undefined,
    screen: 0
  };

  if (typeof screen === 'function') {
    cb = screen;
  } else if (typeof screen === 'object' && screen !== null) {
    if (typeof screen.single === 'boolean')
      cfg.single = screen.single;
    if (typeof screen.screen === 'number')
      cfg.screen = screen.screen;
    if (typeof screen.protocol === 'string')
      cfg.protocol = screen.protocol;
    if (typeof screen.cookie === 'string')
      cfg.cookie = screen.cookie;
    else if (Buffer.isBuffer(screen.cookie))
      cfg.cookie = screen.cookie.toString('hex');
  }
  if (cfg.cookie === undefined)
    cfg.cookie = randomCookie();

  var wantReply = (typeof cb === 'function');

  if (chan.outgoing.state !== 'open') {
    wantReply && cb(new Error('Channel is not open'));
    return true;
  }

  if (wantReply) {
    chan._callbacks.push(function(had_err) {
      if (had_err) {
        return cb(had_err !== true
                  ? had_err
                  : new Error('Unable to request X11'));
      }

      chan._hasX11 = true;
      ++chan._client._acceptX11;
      chan.once('close', function() {
        if (chan._client._acceptX11)
          --chan._client._acceptX11;
      });

      cb();
    });
  }

  return chan._client._sshstream.x11Forward(chan.outgoing.id, cfg, wantReply);
}

function reqPty(chan, opts, cb) {
  var rows = 24;
  var cols = 80;
  var width = 640;
  var height = 480;
  var term = 'vt100';
  var modes = null;

  if (typeof opts === 'function')
    cb = opts;
  else if (typeof opts === 'object' && opts !== null) {
    if (typeof opts.rows === 'number')
      rows = opts.rows;
    if (typeof opts.cols === 'number')
      cols = opts.cols;
    if (typeof opts.width === 'number')
      width = opts.width;
    if (typeof opts.height === 'number')
      height = opts.height;
    if (typeof opts.term === 'string')
      term = opts.term;
    if (typeof opts.modes === 'object')
      modes = opts.modes;
  }

  var wantReply = (typeof cb === 'function');

  if (chan.outgoing.state !== 'open') {
    wantReply && cb(new Error('Channel is not open'));
    return true;
  }

  if (wantReply) {
    chan._callbacks.push(function(had_err) {
      if (had_err) {
        return cb(had_err !== true
                  ? had_err
                  : new Error('Unable to request a pseudo-terminal'));
      }
      cb();
    });
  }

  return chan._client._sshstream.pty(chan.outgoing.id,
                                     rows,
                                     cols,
                                     height,
                                     width,
                                     term,
                                     modes,
                                     wantReply);
}

function reqAgentFwd(chan, cb) {
  var wantReply = (typeof cb === 'function');

  if (chan.outgoing.state !== 'open') {
    wantReply && cb(new Error('Channel is not open'));
    return true;
  } else if (chan._client._agentFwdEnabled) {
    wantReply && cb(false);
    return true;
  }

  chan._client._agentFwdEnabled = true;

  chan._callbacks.push(function(had_err) {
    if (had_err) {
      chan._client._agentFwdEnabled = false;
      wantReply && cb(had_err !== true
                      ? had_err
                      : new Error('Unable to request agent forwarding'));
      return;
    }

    wantReply && cb();
  });

  return chan._client._sshstream.openssh_agentForward(chan.outgoing.id, true);
}

function reqShell(chan, cb) {
  if (chan.outgoing.state !== 'open') {
    cb(new Error('Channel is not open'));
    return true;
  }
  chan._callbacks.push(function(had_err) {
    if (had_err) {
      return cb(had_err !== true
                ? had_err
                : new Error('Unable to open shell'));
    }
    chan.subtype = 'shell';
    cb(undefined, chan);
  });

  return chan._client._sshstream.shell(chan.outgoing.id, true);
}

function reqExec(chan, cmd, opts, cb) {
  if (chan.outgoing.state !== 'open') {
    cb(new Error('Channel is not open'));
    return true;
  }
  chan._callbacks.push(function(had_err) {
    if (had_err) {
      return cb(had_err !== true
                ? had_err
                : new Error('Unable to exec'));
    }
    chan.subtype = 'exec';
    chan.allowHalfOpen = (opts.allowHalfOpen !== false);
    cb(undefined, chan);
  });

  return chan._client._sshstream.exec(chan.outgoing.id, cmd, true);
}

function reqEnv(chan, env) {
  if (chan.outgoing.state !== 'open')
    return true;
  var ret = true;
  var keys = Object.keys(env || {});
  var key;
  var val;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    val = env[key];
    ret = chan._client._sshstream.env(chan.outgoing.id, key, val, false);
  }

  return ret;
}

function reqSubsystem(chan, name, cb) {
  if (chan.outgoing.state !== 'open') {
    cb(new Error('Channel is not open'));
    return true;
  }
  chan._callbacks.push(function(had_err) {
    if (had_err) {
      return cb(had_err !== true
                ? had_err
                : new Error('Unable to start subsystem: ' + name));
    }
    chan.subtype = 'subsystem';
    cb(undefined, chan);
  });

  return chan._client._sshstream.subsystem(chan.outgoing.id, name, true);
}

function onCHANNEL_OPEN(self, info) {
  // the server is trying to open a channel with us, this is usually when
  // we asked the server to forward us connections on some port and now they
  // are asking us to accept/deny an incoming connection on their side

  var localChan = false;
  var reason;

  function accept() {
    var chaninfo = {
      type: info.type,
      incoming: {
        id: localChan,
        window: Channel.MAX_WINDOW,
        packetSize: Channel.PACKET_SIZE,
        state: 'open'
      },
      outgoing: {
        id: info.sender,
        window: info.window,
        packetSize: info.packetSize,
        state: 'open'
      }
    };
    var stream = new Channel(chaninfo, self);

    self._sshstream.channelOpenConfirm(info.sender,
                                       localChan,
                                       Channel.MAX_WINDOW,
                                       Channel.PACKET_SIZE);
    return stream;
  }
  function reject() {
    if (reason === undefined) {
      if (localChan === false)
        reason = consts.CHANNEL_OPEN_FAILURE.RESOURCE_SHORTAGE;
      else
        reason = consts.CHANNEL_OPEN_FAILURE.CONNECT_FAILED;
    }

    self._sshstream.channelOpenFail(info.sender, reason, '', '');
  }

  if (info.type === 'forwarded-tcpip'
      || info.type === 'x11'
      || info.type === 'auth-agent@openssh.com'
      || info.type === 'forwarded-streamlocal@openssh.com') {

    // check for conditions for automatic rejection
    var rejectConn = (
     (info.type === 'forwarded-tcpip'
      && self._forwarding[info.data.destIP
                         + ':'
                         + info.data.destPort] === undefined)
     || (info.type === 'forwarded-streamlocal@openssh.com'
         && self._forwardingUnix[info.data.socketPath] === undefined)
     || (info.type === 'x11' && self._acceptX11 === 0)
     || (info.type === 'auth-agent@openssh.com'
         && !self._agentFwdEnabled)
    );

    if (!rejectConn) {
      localChan = nextChannel(self);

      if (localChan === false) {
        self.config.debug('DEBUG: Client: Automatic rejection of incoming channel open: no channels available');
        rejectConn = true;
      } else
        self._channels[localChan] = true;
    } else {
      reason = consts.CHANNEL_OPEN_FAILURE.ADMINISTRATIVELY_PROHIBITED;
      self.config.debug('DEBUG: Client: Automatic rejection of incoming channel open: unexpected channel open for: '
                        + info.type);
    }

    // TODO: automatic rejection after some timeout?

    if (rejectConn)
      reject();

    if (localChan !== false) {
      if (info.type === 'forwarded-tcpip') {
        if (info.data.destPort === 0) {
          info.data.destPort = self._forwarding[info.data.destIP
                                                + ':'
                                                + info.data.destPort];
        }
        self.emit('tcp connection', info.data, accept, reject);
      } else if (info.type === 'x11') {
        self.emit('x11', info.data, accept, reject);
      } else if (info.type === 'forwarded-streamlocal@openssh.com') {
        self.emit('unix connection', info.data, accept, reject);
      } else {
        agentQuery(self.config.agent, accept, reject);
      }
    }
  } else {
    // automatically reject any unsupported channel open requests
    self.config.debug('DEBUG: Client: Automatic rejection of incoming channel open: unsupported type: '
                      + info.type);
    reason = consts.CHANNEL_OPEN_FAILURE.UNKNOWN_CHANNEL_TYPE;
    reject();
  }
}

var randomCookie = (function() {
  if (typeof crypto.randomFillSync === 'function') {
    var buffer = Buffer.alloc(16);
    return function randomCookie() {
      crypto.randomFillSync(buffer, 0, 16);
      return buffer.toString('hex');
    };
  } else {
    return function randomCookie() {
      return crypto.randomBytes(16).toString('hex');
    };
  }
})();

Client.Client = Client;
Client.Server = __webpack_require__(279);
// pass some useful utilities on to end user (e.g. parseKey())
Client.utils = ssh2_streams.utils;
// expose useful SFTPStream constants for sftp server usage
Client.SFTP_STATUS_CODE = SFTPStream.STATUS_CODE;
Client.SFTP_OPEN_MODE = SFTPStream.OPEN_MODE;
// expose http(s).Agent implementations to allow easy tunneling of HTTP(S)
// requests
Client.HTTPAgent = HTTPAgents.SSHTTPAgent;
Client.HTTPSAgent = HTTPAgents.SSHTTPSAgent;

module.exports = Client; // backwards compatibility


/***/ }),

/***/ 599:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


var inspect = __webpack_require__(669).inspect;

function assert(value, message) {
  if (!value)
    throw new ERR_INTERNAL_ASSERTION(message);
}
assert.fail = function fail(message) {
  throw new ERR_INTERNAL_ASSERTION(message);
};

// Only use this for integers! Decimal numbers do not work with this function.
function addNumericalSeparator(val) {
  var res = '';
  var i = val.length;
  var start = val[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3)
    res = `_${val.slice(i - 3, i)}${res}`;
  return `${val.slice(0, i)}${res}`;
}

function oneOf(expected, thing) {
  assert(typeof thing === 'string', '`thing` has to be of type string');
  if (Array.isArray(expected)) {
    var len = expected.length;
    assert(len > 0, 'At least one expected value needs to be specified');
    expected = expected.map((i) => String(i));
    if (len > 2) {
      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or `
              + expected[len - 1];
    } else if (len === 2) {
      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
    } else {
      return `of ${thing} ${expected[0]}`;
    }
  } else {
    return `of ${thing} ${String(expected)}`;
  }
}



exports.ERR_INTERNAL_ASSERTION = class ERR_INTERNAL_ASSERTION extends Error {
  constructor(message) {
    super();
    Error.captureStackTrace(this, ERR_INTERNAL_ASSERTION);

    var suffix = 'This is caused by either a bug in ssh2-streams '
                 + 'or incorrect usage of ssh2-streams internals.\n'
                 + 'Please open an issue with this stack trace at '
                 + 'https://github.com/mscdex/ssh2-streams/issues\n';

    this.message = (message === undefined ? suffix : `${message}\n${suffix}`);
  }
};

var MAX_32BIT_INT = Math.pow(2, 32);
var MAX_32BIT_BIGINT = (function() {
  try {
    return new Function('return 2n ** 32n')();
  } catch (ex) {}
})();
exports.ERR_OUT_OF_RANGE = class ERR_OUT_OF_RANGE extends RangeError {
  constructor(str, range, input, replaceDefaultBoolean) {
    super();
    Error.captureStackTrace(this, ERR_OUT_OF_RANGE);

    assert(range, 'Missing "range" argument');
    var msg = (replaceDefaultBoolean
               ? str
               : `The value of "${str}" is out of range.`);
    var received;
    if (Number.isInteger(input) && Math.abs(input) > MAX_32BIT_INT) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === 'bigint') {
      received = String(input);
      if (input > MAX_32BIT_BIGINT || input < -MAX_32BIT_BIGINT)
        received = addNumericalSeparator(received);
      received += 'n';
    } else {
      received = inspect(input);
    }
    msg += ` It must be ${range}. Received ${received}`;

    this.message = msg;
  }
};

exports.ERR_INVALID_ARG_TYPE = class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super();
    Error.captureStackTrace(this, ERR_INVALID_ARG_TYPE);

    assert(typeof name === 'string', `'name' must be a string`);

    // determiner: 'must be' or 'must not be'
    var determiner;
    if (typeof expected === 'string' && expected.startsWith('not ')) {
      determiner = 'must not be';
      expected = expected.replace(/^not /, '');
    } else {
      determiner = 'must be';
    }

    var msg;
    if (name.endsWith(' argument')) {
      // For cases like 'first argument'
      msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
    } else {
      var type = (name.includes('.') ? 'property' : 'argument');
      msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
    }

    msg += `. Received type ${typeof actual}`;

    this.message = msg;
  }
};

exports.validateNumber = function validateNumber(value, name) {
  if (typeof value !== 'number')
    throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
};


// =============================================================================
// Following code is only needed to support node v6.x ....

// Undocumented cb() API, needed for core, not for public API
exports.destroyImpl = function destroy(err, cb) {
  const readableDestroyed = this._readableState &&
    this._readableState.destroyed;
  const writableDestroyed = this._writableState &&
    this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  }

  // We set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // If this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, (err) => {
    if (!cb && err) {
      if (!this._writableState) {
        process.nextTick(emitErrorAndCloseNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, this, err);
      } else {
        process.nextTick(emitCloseNT, this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, this);
    }
  });

  return this;
};

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose)
    return;
  if (self._readableState && !self._readableState.emitClose)
    return;
  self.emit('close');
}
// =============================================================================


/***/ }),

/***/ 605:
/***/ (function(module) {

module.exports = require("http");

/***/ }),

/***/ 614:
/***/ (function(module) {

module.exports = require("events");

/***/ }),

/***/ 619:
/***/ (function(module) {

module.exports = require("constants");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 627:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an Task
 * @param {Object} modem docker-modem
 * @param {String} id    Task's ID
 */
var Task = function(modem, id) {
  this.modem = modem;
  this.id = id;

  this.defaultOptions = {
    log: {}
  };
};

Task.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Query Docker for Task details.
 *
 * @param {function} callback
 */
Task.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/tasks/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'unknown task',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Task logs
 * @param  {Object}   opts     Logs options. (optional)
 * @param  {Function} callback Callback with data
 */
Task.prototype.logs = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback, this.defaultOptions.log);

  var optsf = {
    path: '/tasks/' + this.id + '/logs?',
    method: 'GET',
    isStream: args.opts.follow || false,
    statusCodes: {
      101: true,
      200: true,
      404: 'no such container',
      500: 'server error',
      503: 'node is not part of a swarm'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


module.exports = Task;


/***/ }),

/***/ 631:
/***/ (function(module) {

module.exports = require("net");

/***/ }),

/***/ 635:
/***/ (function(module, __unusedexports, __webpack_require__) {

// TODO: * Automatic re-key every (configurable) n bytes or length of time
//         - RFC suggests every 1GB of transmitted data or 1 hour, whichever
//           comes sooner
//       * Filter control codes from strings
//         (as per http://tools.ietf.org/html/rfc4251#section-9.2)

var crypto = __webpack_require__(417);
var zlib = __webpack_require__(761);
var TransformStream = __webpack_require__(413).Transform;
var inherits = __webpack_require__(669).inherits;
var inspect = __webpack_require__(669).inspect;

var StreamSearch = __webpack_require__(458);
var Ber = __webpack_require__(62).Ber;

var readUInt32BE = __webpack_require__(523).readUInt32BE;
var writeUInt32BE = __webpack_require__(523).writeUInt32BE;
var consts = __webpack_require__(801);
var utils = __webpack_require__(780);
var iv_inc = utils.iv_inc;
var readString = utils.readString;
var readInt = utils.readInt;
var DSASigBERToBare = utils.DSASigBERToBare;
var ECDSASigASN1ToSSH = utils.ECDSASigASN1ToSSH;
var sigSSHToASN1 = utils.sigSSHToASN1;
var parseDERKey = __webpack_require__(798).parseDERKey;

var CIPHER_INFO = consts.CIPHER_INFO;
var HMAC_INFO = consts.HMAC_INFO;
var MESSAGE = consts.MESSAGE;
var DYNAMIC_KEXDH_MESSAGE = consts.DYNAMIC_KEXDH_MESSAGE;
var KEXDH_MESSAGE = consts.KEXDH_MESSAGE;
var ALGORITHMS = consts.ALGORITHMS;
var DISCONNECT_REASON = consts.DISCONNECT_REASON;
var CHANNEL_OPEN_FAILURE = consts.CHANNEL_OPEN_FAILURE;
var SSH_TO_OPENSSL = consts.SSH_TO_OPENSSL;
var TERMINAL_MODE = consts.TERMINAL_MODE;
var SIGNALS = consts.SIGNALS;
var EDDSA_SUPPORTED = consts.EDDSA_SUPPORTED;
var CURVE25519_SUPPORTED = consts.CURVE25519_SUPPORTED;
var BUGS = consts.BUGS;
var BUGGY_IMPLS = consts.BUGGY_IMPLS;
var BUGGY_IMPLS_LEN = BUGGY_IMPLS.length;
var MODULE_VER = __webpack_require__(724).version;
var I = 0;
var IN_INIT = I++;
var IN_GREETING = I++;
var IN_HEADER = I++;
var IN_PACKETBEFORE = I++;
var IN_PACKET = I++;
var IN_PACKETDATA = I++;
var IN_PACKETDATAVERIFY = I++;
var IN_PACKETDATAAFTER = I++;
var OUT_INIT = I++;
var OUT_READY = I++;
var OUT_REKEYING = I++;
var MAX_SEQNO = 4294967295;
var MAX_PACKET_SIZE = 35000;
var MAX_PACKETS_REKEYING = 50;
var EXP_TYPE_HEADER = 0;
var EXP_TYPE_LF = 1;
var EXP_TYPE_BYTES = 2; // Waits until n bytes have been seen
var Z_PARTIAL_FLUSH = zlib.Z_PARTIAL_FLUSH;
var ZLIB_OPTS = { flush: Z_PARTIAL_FLUSH };

var RE_NULL = /\x00/g;

var IDENT_PREFIX_BUFFER = Buffer.from('SSH-');
var EMPTY_BUFFER = Buffer.allocUnsafe(0);
var HMAC_COMPUTE = Buffer.allocUnsafe(9);
var PING_PACKET = Buffer.from([
  MESSAGE.GLOBAL_REQUEST,
  // "keepalive@openssh.com"
  0, 0, 0, 21,
    107, 101, 101, 112, 97, 108, 105, 118, 101, 64, 111, 112, 101, 110, 115,
    115, 104, 46, 99, 111, 109,
  // Request a reply
  1
]);
var NEWKEYS_PACKET = Buffer.from([MESSAGE.NEWKEYS]);
var USERAUTH_SUCCESS_PACKET = Buffer.from([MESSAGE.USERAUTH_SUCCESS]);
var REQUEST_SUCCESS_PACKET = Buffer.from([MESSAGE.REQUEST_SUCCESS]);
var REQUEST_FAILURE_PACKET = Buffer.from([MESSAGE.REQUEST_FAILURE]);
var NO_TERMINAL_MODES_BUFFER = Buffer.from([TERMINAL_MODE.TTY_OP_END]);
var KEXDH_GEX_REQ_PACKET = Buffer.from([
  MESSAGE.KEXDH_GEX_REQUEST,
  // Minimal size in bits of an acceptable group
  0, 0, 4, 0, // 1024, modp2
  // Preferred size in bits of the group the server will send
  0, 0, 16, 0, // 4096, modp16
  // Maximal size in bits of an acceptable group
  0, 0, 32, 0 // 8192, modp18
]);

function DEBUG_NOOP(msg) {}

function SSH2Stream(cfg) {
  if (typeof cfg !== 'object' || cfg === null)
    cfg = {};

  TransformStream.call(this, {
    highWaterMark: (typeof cfg.highWaterMark === 'number'
                    ? cfg.highWaterMark
                    : 32 * 1024)
  });

  this._needContinue = false;
  this.bytesSent = this.bytesReceived = 0;
  this.debug = (typeof cfg.debug === 'function' ? cfg.debug : DEBUG_NOOP);
  this.server = (cfg.server === true);
  this.maxPacketSize = (typeof cfg.maxPacketSize === 'number'
                        ? cfg.maxPacketSize
                        : MAX_PACKET_SIZE);
  // Bitmap that indicates any bugs the remote side has. This is determined
  // by the reported software version.
  this.remoteBugs = 0;

  if (this.server) {
    // TODO: Remove when we support group exchange for server implementation
    this.remoteBugs = BUGS.BAD_DHGEX;
  }

  this.readable = true;

  var self = this;

  var hostKeys = cfg.hostKeys;
  if (this.server && (typeof hostKeys !== 'object' || hostKeys === null))
    throw new Error('hostKeys must be an object keyed on host key type');

  this.config = {
    // Server
    hostKeys: hostKeys, // All keys supported by server

    // Client/Server
    ident: 'SSH-2.0-'
           + (cfg.ident
              || ('ssh2js' + MODULE_VER + (this.server ? 'srv' : ''))),
    algorithms: {
      kex: ALGORITHMS.KEX,
      kexBuf: ALGORITHMS.KEX_BUF,
      serverHostKey: ALGORITHMS.SERVER_HOST_KEY,
      serverHostKeyBuf: ALGORITHMS.SERVER_HOST_KEY_BUF,
      cipher: ALGORITHMS.CIPHER,
      cipherBuf: ALGORITHMS.CIPHER_BUF,
      hmac: ALGORITHMS.HMAC,
      hmacBuf: ALGORITHMS.HMAC_BUF,
      compress: ALGORITHMS.COMPRESS,
      compressBuf: ALGORITHMS.COMPRESS_BUF
    }
  };
  // RFC 4253 states the identification string must not contain NULL
  this.config.ident.replace(RE_NULL, '');

  if (this.config.ident.length + 2 /* Account for "\r\n" */ > 255)
    throw new Error('ident too long');

  if (typeof cfg.algorithms === 'object' && cfg.algorithms !== null) {
    var algos = cfg.algorithms;
    if (Array.isArray(algos.kex) && algos.kex.length > 0) {
      this.config.algorithms.kex = algos.kex;
      if (!Buffer.isBuffer(algos.kexBuf))
        algos.kexBuf = Buffer.from(algos.kex.join(','), 'ascii');
      this.config.algorithms.kexBuf = algos.kexBuf;
    }
    if (Array.isArray(algos.serverHostKey) && algos.serverHostKey.length > 0) {
      this.config.algorithms.serverHostKey = algos.serverHostKey;
      if (!Buffer.isBuffer(algos.serverHostKeyBuf)) {
        algos.serverHostKeyBuf = Buffer.from(algos.serverHostKey.join(','),
                                             'ascii');
      }
      this.config.algorithms.serverHostKeyBuf = algos.serverHostKeyBuf;
    }
    if (Array.isArray(algos.cipher) && algos.cipher.length > 0) {
      this.config.algorithms.cipher = algos.cipher;
      if (!Buffer.isBuffer(algos.cipherBuf))
        algos.cipherBuf = Buffer.from(algos.cipher.join(','), 'ascii');
      this.config.algorithms.cipherBuf = algos.cipherBuf;
    }
    if (Array.isArray(algos.hmac) && algos.hmac.length > 0) {
      this.config.algorithms.hmac = algos.hmac;
      if (!Buffer.isBuffer(algos.hmacBuf))
        algos.hmacBuf = Buffer.from(algos.hmac.join(','), 'ascii');
      this.config.algorithms.hmacBuf = algos.hmacBuf;
    }
    if (Array.isArray(algos.compress) && algos.compress.length > 0) {
      this.config.algorithms.compress = algos.compress;
      if (!Buffer.isBuffer(algos.compressBuf))
        algos.compressBuf = Buffer.from(algos.compress.join(','), 'ascii');
      this.config.algorithms.compressBuf = algos.compressBuf;
    }
  }

  this.reset(true);

  // Common events
  this.on('end', function() {
    // Let GC collect any Buffers we were previously storing
    self.readable = false;
    self._state = undefined;
    self.reset();
    self._state.outgoing.bufSeqno = undefined;
  });
  this.on('DISCONNECT', function(reason, code, desc, lang) {
    onDISCONNECT(self, reason, code, desc, lang);
  });
  this.on('KEXINIT', function(init, firstFollows) {
    onKEXINIT(self, init, firstFollows);
  });
  this.on('NEWKEYS', function() { onNEWKEYS(self); });

  if (this.server) {
    // Server-specific events
    this.on('KEXDH_INIT', function(e) { onKEXDH_INIT(self, e); });
  } else {
    // Client-specific events
    this.on('KEXDH_REPLY', function(info) { onKEXDH_REPLY(self, info); })
        .on('KEXDH_GEX_GROUP',
            function(prime, gen) { onKEXDH_GEX_GROUP(self, prime, gen); });
  }

  if (this.server) {
    // Greeting displayed before the ssh identification string is sent, this is
    // usually ignored by most clients
    if (typeof cfg.greeting === 'string' && cfg.greeting.length) {
      if (cfg.greeting.slice(-2) === '\r\n')
        this.push(cfg.greeting);
      else
        this.push(cfg.greeting + '\r\n');
    }
    // Banner shown after the handshake completes, but before user
    // authentication begins
    if (typeof cfg.banner === 'string' && cfg.banner.length) {
      if (cfg.banner.slice(-2) === '\r\n')
        this.banner = cfg.banner;
      else
        this.banner = cfg.banner + '\r\n';
    }
  }
  this.debug('DEBUG: Local ident: ' + inspect(this.config.ident));
  this.push(this.config.ident + '\r\n');

  this._state.incoming.expectedPacket = 'KEXINIT';
}
inherits(SSH2Stream, TransformStream);

SSH2Stream.prototype.__read = TransformStream.prototype._read;
SSH2Stream.prototype._read = function(n) {
  if (this._needContinue) {
    this._needContinue = false;
    this.emit('continue');
  }
  return this.__read(n);
};
SSH2Stream.prototype.__push = TransformStream.prototype.push;
SSH2Stream.prototype.push = function(chunk, encoding) {
  var ret = this.__push(chunk, encoding);
  this._needContinue = (ret === false);
  return ret;
};

SSH2Stream.prototype._cleanup = function(callback) {
  this.reset();
  this.debug('DEBUG: Parser: Malformed packet');
  callback && callback(new Error('Malformed packet'));
};

SSH2Stream.prototype._transform = function(chunk, encoding, callback, decomp) {
  var skipDecrypt = false;
  var decryptAuthMode = false;
  var state = this._state;
  var instate = state.incoming;
  var outstate = state.outgoing;
  var expect = instate.expect;
  var decrypt = instate.decrypt;
  var decompress = instate.decompress;
  var chlen = chunk.length;
  var chleft = 0;
  var debug = this.debug;
  var self = this;
  var i = 0;
  var p = i;
  var blockLen;
  var buffer;
  var buf;
  var r;

  this.bytesReceived += chlen;

  while (true) {
    if (expect.type !== undefined) {
      if (i >= chlen)
        break;
      if (expect.type === EXP_TYPE_BYTES) {
        chleft = (chlen - i);
        var pktLeft = (expect.buf.length - expect.ptr);
        if (pktLeft <= chleft) {
          chunk.copy(expect.buf, expect.ptr, i, i + pktLeft);
          i += pktLeft;
          buffer = expect.buf;
          expect.buf = undefined;
          expect.ptr = 0;
          expect.type = undefined;
        } else {
          chunk.copy(expect.buf, expect.ptr, i);
          expect.ptr += chleft;
          i += chleft;
        }
        continue;
      } else if (expect.type === EXP_TYPE_HEADER) {
        i += instate.search.push(chunk);
        if (expect.type !== undefined)
          continue;
      } else if (expect.type === EXP_TYPE_LF) {
        if (++expect.ptr + 4 /* Account for "SSH-" */ > 255) {
          this.reset();
          debug('DEBUG: Parser: Identification string exceeded 255 characters');
          return callback(new Error('Max identification string size exceeded'));
        }
        if (chunk[i] === 0x0A) {
          expect.type = undefined;
          if (p < i) {
            if (expect.buf === undefined)
              expect.buf = chunk.toString('ascii', p, i);
            else
              expect.buf += chunk.toString('ascii', p, i);
          }
          buffer = expect.buf;
          expect.buf = undefined;
          ++i;
        } else {
          if (++i === chlen && p < i) {
            if (expect.buf === undefined)
              expect.buf = chunk.toString('ascii', p, i);
            else
              expect.buf += chunk.toString('ascii', p, i);
          }
          continue;
        }
      }
    }

    if (instate.status === IN_INIT) {
      if (!this.readable)
        return callback();
      if (this.server) {
        // Retrieve what should be the start of the protocol version exchange
        if (!buffer) {
          debug('DEBUG: Parser: IN_INIT (waiting for identification begin)');
          expectData(this, EXP_TYPE_BYTES, 4);
        } else {
          if (buffer[0] === 0x53       // S
              && buffer[1] === 0x53    // S
              && buffer[2] === 0x48    // H
              && buffer[3] === 0x2D) { // -
            instate.status = IN_GREETING;
            debug('DEBUG: Parser: IN_INIT (waiting for rest of identification)');
          } else {
            this.reset();
            debug('DEBUG: Parser: Bad identification start');
            return callback(new Error('Bad identification start'));
          }
        }
      } else {
        debug('DEBUG: Parser: IN_INIT');
        // Retrieve any bytes that may come before the protocol version exchange
        var ss = instate.search = new StreamSearch(IDENT_PREFIX_BUFFER);
        ss.on('info', function onInfo(matched, data, start, end) {
          if (data) {
            if (instate.greeting === undefined)
              instate.greeting = data.toString('binary', start, end);
            else
              instate.greeting += data.toString('binary', start, end);
          }
          if (matched) {
            expect.type = undefined;
            instate.search.removeListener('info', onInfo);
          }
        });
        ss.maxMatches = 1;
        expectData(this, EXP_TYPE_HEADER);
        instate.status = IN_GREETING;
      }
    } else if (instate.status === IN_GREETING) {
      debug('DEBUG: Parser: IN_GREETING');
      instate.search = undefined;
      // Retrieve the identification bytes after the "SSH-" header
      p = i;
      expectData(this, EXP_TYPE_LF);
      instate.status = IN_HEADER;
    } else if (instate.status === IN_HEADER) {
      debug('DEBUG: Parser: IN_HEADER');
      if (buffer.charCodeAt(buffer.length - 1) === 13)
        buffer = buffer.slice(0, -1);
      var idxDash = buffer.indexOf('-');
      var idxSpace = buffer.indexOf(' ');
      var header = {
        // RFC says greeting SHOULD be utf8
        greeting: instate.greeting,
        identRaw: 'SSH-' + buffer,
        versions: {
          protocol: buffer.substr(0, idxDash),
          software: (idxSpace === -1
                     ? buffer.substring(idxDash + 1)
                     : buffer.substring(idxDash + 1, idxSpace))
        },
        comments: (idxSpace > -1 ? buffer.substring(idxSpace + 1) : undefined)
      };
      instate.greeting = undefined;

      if (header.versions.protocol !== '1.99'
          && header.versions.protocol !== '2.0') {
        this.reset();
        debug('DEBUG: Parser: protocol version not supported: '
              + header.versions.protocol);
        return callback(new Error('Protocol version not supported'));
      } else
        this.emit('header', header);

      if (instate.status === IN_INIT) {
        // We reset from an event handler, possibly due to an unsupported SSH
        // protocol version?
        return;
      }

      var identRaw = header.identRaw;
      var software = header.versions.software;
      this.debug('DEBUG: Remote ident: ' + inspect(identRaw));
      for (var j = 0, rule; j < BUGGY_IMPLS_LEN; ++j) {
        rule = BUGGY_IMPLS[j];
        if (typeof rule[0] === 'string') {
          if (software === rule[0])
            this.remoteBugs |= rule[1];
        } else if (rule[0].test(software))
          this.remoteBugs |= rule[1];
      }
      instate.identRaw = identRaw;
      // Adjust bytesReceived first otherwise it will have an incorrectly larger
      // total when we call back into this function after completing KEXINIT
      this.bytesReceived -= (chlen - i);
      KEXINIT(this, function() {
        if (i === chlen)
          callback();
        else
          self._transform(chunk.slice(i), encoding, callback);
      });
      instate.status = IN_PACKETBEFORE;
      return;
    } else if (instate.status === IN_PACKETBEFORE) {
      blockLen = (decrypt.instance ? decrypt.info.blockLen : 8);
      debug('DEBUG: Parser: IN_PACKETBEFORE (expecting ' + blockLen + ')');
      // Wait for the right number of bytes so we can determine the incoming
      // packet length
      expectData(this, EXP_TYPE_BYTES, blockLen, decrypt.buf);
      instate.status = IN_PACKET;
    } else if (instate.status === IN_PACKET) {
      debug('DEBUG: Parser: IN_PACKET');
      if (decrypt.instance) {
        decryptAuthMode = (decrypt.info.authLen > 0);
        if (!decryptAuthMode)
          buffer = decryptData(this, buffer);
        blockLen = decrypt.info.blockLen;
      } else {
        decryptAuthMode = false;
        blockLen = 8;
      }

      r = readInt(buffer, 0, this, callback);
      if (r === false)
        return;
      var hmacInfo = instate.hmac.info;
      var macSize;
      if (hmacInfo)
        macSize = hmacInfo.actualLen;
      else
        macSize = 0;
      var fullPacketLen = r + 4 + macSize;
      var maxPayloadLen = this.maxPacketSize;
      if (decompress.instance) {
        // Account for compressed payloads
        // This formula is taken from dropbear which derives it from zlib's
        // documentation. Explanation from dropbear:
        /* For exact details see http://www.zlib.net/zlib_tech.html
         * 5 bytes per 16kB block, plus 6 bytes for the stream.
         * We might allocate 5 unnecessary bytes here if it's an
         * exact multiple. */
        maxPayloadLen += (((this.maxPacketSize / 16384) + 1) * 5 + 6);
      }
      if (r > maxPayloadLen
          // TODO: Change 16 to "MAX(16, decrypt.info.blockLen)" when/if SSH2
          // adopts 512-bit ciphers
          || fullPacketLen < (16 + macSize)
          || ((r + (decryptAuthMode ? 0 : 4)) % blockLen) !== 0) {
        this.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
        debug('DEBUG: Parser: Bad packet length (' + fullPacketLen + ')');
        return callback(new Error('Bad packet length'));
      }

      instate.pktLen = r;
      var remainLen = instate.pktLen + 4 - blockLen;
      if (decryptAuthMode) {
        decrypt.instance.setAAD(buffer.slice(0, 4));
        debug('DEBUG: Parser: pktLen:'
              + instate.pktLen
              + ',remainLen:'
              + remainLen);
      } else {
        instate.padLen = buffer[4];
        debug('DEBUG: Parser: pktLen:'
              + instate.pktLen
              + ',padLen:'
              + instate.padLen
              + ',remainLen:'
              + remainLen);
      }
      if (remainLen > 0) {
        if (decryptAuthMode)
          instate.pktExtra = buffer.slice(4);
        else
          instate.pktExtra = buffer.slice(5);
        // Grab the rest of the packet
        expectData(this, EXP_TYPE_BYTES, remainLen);
        instate.status = IN_PACKETDATA;
      } else if (remainLen < 0)
        instate.status = IN_PACKETBEFORE;
      else {
        // Entire message fit into one block
        skipDecrypt = true;
        instate.status = IN_PACKETDATA;
        continue;
      }
    } else if (instate.status === IN_PACKETDATA) {
      debug('DEBUG: Parser: IN_PACKETDATA');
      if (decrypt.instance) {
        decryptAuthMode = (decrypt.info.authLen > 0);
        if (!skipDecrypt) {
          if (!decryptAuthMode)
            buffer = decryptData(this, buffer);
        } else {
          skipDecrypt = false;
        }
      } else {
        decryptAuthMode = false;
        skipDecrypt = false;
      }
      var padStart = instate.pktLen - instate.padLen - 1;
      // TODO: Allocate a Buffer once that is slightly larger than maxPacketSize
      // (to accommodate for packet length field and MAC) and re-use that
      // instead
      if (instate.pktExtra) {
        buf = Buffer.allocUnsafe(instate.pktExtra.length + buffer.length);
        instate.pktExtra.copy(buf);
        buffer.copy(buf, instate.pktExtra.length);
        instate.payload = buf.slice(0, padStart);
      } else {
        // Entire message fit into one block
        if (decryptAuthMode)
          buf = buffer.slice(4);
        else
          buf = buffer.slice(5);
        instate.payload = buffer.slice(5, 5 + padStart);
      }
      if (instate.hmac.info !== undefined) {
        // Wait for hmac hash
        var inHMACSize = decrypt.info.authLen || instate.hmac.info.actualLen;
        debug('DEBUG: Parser: HMAC size:' + inHMACSize);
        expectData(this, EXP_TYPE_BYTES, inHMACSize, instate.hmac.buf);
        instate.status = IN_PACKETDATAVERIFY;
        instate.packet = buf;
      } else
        instate.status = IN_PACKETDATAAFTER;
      instate.pktExtra = undefined;
      buf = undefined;
    } else if (instate.status === IN_PACKETDATAVERIFY) {
      debug('DEBUG: Parser: IN_PACKETDATAVERIFY');
      // Verify packet data integrity
      if (hmacVerify(this, buffer)) {
        debug('DEBUG: Parser: IN_PACKETDATAVERIFY (Valid HMAC)');
        instate.status = IN_PACKETDATAAFTER;
        instate.packet = undefined;
      } else {
        this.reset();
        debug('DEBUG: Parser: IN_PACKETDATAVERIFY (Invalid HMAC)');
        return callback(new Error('Invalid HMAC'));
      }
    } else if (instate.status === IN_PACKETDATAAFTER) {
      if (decompress.instance) {
        if (!decomp) {
          debug('DEBUG: Parser: Decompressing');
          decompress.instance.write(instate.payload);
          var decompBuf = [];
          var decompBufLen = 0;
          decompress.instance.on('readable', function() {
            var buf;
            while (buf = this.read()) {
              decompBuf.push(buf);
              decompBufLen += buf.length;
            }
          }).flush(Z_PARTIAL_FLUSH, function() {
            decompress.instance.removeAllListeners('readable');
            if (decompBuf.length === 1)
              instate.payload = decompBuf[0];
            else
              instate.payload = Buffer.concat(decompBuf, decompBufLen);
            decompBuf = null;
            var nextSlice;
            if (i === chlen)
              nextSlice = EMPTY_BUFFER; // Avoid slicing a zero-length buffer
            else
              nextSlice = chunk.slice(i);
            self._transform(nextSlice, encoding, callback, true);
          });
          return;
        } else {
          // Make sure we reset this after this first time in the loop,
          // otherwise we could end up trying to interpret as-is another
          // compressed packet that is within the same chunk
          decomp = false;
        }
      }

      this.emit('packet');

      var ptype = instate.payload[0];

      if (debug !== DEBUG_NOOP) {
        var msgPacket = 'DEBUG: Parser: IN_PACKETDATAAFTER, packet: ';
        var authMethod = state.authsQueue[0];
        var msgPktType = null;

        if (outstate.status === OUT_REKEYING
            && !(ptype <= 4 || (ptype >= 20 && ptype <= 49)))
          msgPacket += '(enqueued) ';

        if (ptype === MESSAGE.KEXDH_INIT) {
          switch (state.kex.type) {
            case 'group':
              msgPktType = 'KEXDH_INIT';
              break;
            case 'groupex':
              msgPktType = 'KEXDH_GEX_REQUEST';
              break;
            default:
              msgPktType = 'KEXECDH_INIT';
          }
        } else if (ptype === MESSAGE.KEXDH_REPLY) {
          switch (state.kex.type) {
            case 'group':
              msgPktType = 'KEXDH_REPLY';
              break;
            case 'groupex':
              msgPktType = 'KEXDH_GEX_GROUP';
              break;
            default:
              msgPktType = 'KEXECDH_REPLY';
          }
        } else if (ptype === MESSAGE.KEXDH_GEX_GROUP) {
          msgPktType = 'KEXDH_GEX_GROUP';
        } else if (ptype === MESSAGE.KEXDH_GEX_REPLY) {
          msgPktType = 'KEXDH_GEX_REPLY';
        } else if (ptype === 60) {
          if (authMethod === 'password')
            msgPktType = 'USERAUTH_PASSWD_CHANGEREQ';
          else if (authMethod === 'keyboard-interactive')
            msgPktType = 'USERAUTH_INFO_REQUEST';
          else if (authMethod === 'publickey')
            msgPktType = 'USERAUTH_PK_OK';
          else
            msgPktType = 'UNKNOWN PACKET 60';
        } else if (ptype === 61) {
          if (authMethod === 'keyboard-interactive')
            msgPktType = 'USERAUTH_INFO_RESPONSE';
          else
            msgPktType = 'UNKNOWN PACKET 61';
        }

        if (msgPktType === null)
          msgPktType = MESSAGE[ptype];

        // Don't write debug output for messages we custom make in parsePacket()
        if (ptype !== MESSAGE.CHANNEL_OPEN
            && ptype !== MESSAGE.CHANNEL_REQUEST
            && ptype !== MESSAGE.CHANNEL_SUCCESS
            && ptype !== MESSAGE.CHANNEL_FAILURE
            && ptype !== MESSAGE.CHANNEL_EOF
            && ptype !== MESSAGE.CHANNEL_CLOSE
            && ptype !== MESSAGE.CHANNEL_DATA
            && ptype !== MESSAGE.CHANNEL_EXTENDED_DATA
            && ptype !== MESSAGE.CHANNEL_WINDOW_ADJUST
            && ptype !== MESSAGE.DISCONNECT
            && ptype !== MESSAGE.USERAUTH_REQUEST
            && ptype !== MESSAGE.GLOBAL_REQUEST)
          debug(msgPacket + msgPktType);
      }

      // Only parse packet if we are not re-keying or the packet is not a
      // transport layer packet needed for re-keying
      if (outstate.status === OUT_READY
          || ptype <= 4
          || (ptype >= 20 && ptype <= 49)) {
        if (parsePacket(this, callback) === false)
          return;

        if (instate.status === IN_INIT) {
          // We were reset due to some error/disagreement ?
          return;
        }
      } else if (outstate.status === OUT_REKEYING) {
        if (instate.rekeyQueue.length === MAX_PACKETS_REKEYING) {
          debug('DEBUG: Parser: Max incoming re-key queue length reached');
          this.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
          return callback(
            new Error('Incoming re-key queue length limit reached')
          );
        }

        // Make sure to record the sequence number in case we need it later on
        // when we drain the queue (e.g. unknown packet)
        var seqno = instate.seqno;
        if (++instate.seqno > MAX_SEQNO)
          instate.seqno = 0;

        instate.rekeyQueue.push([seqno, instate.payload]);
      }

      instate.status = IN_PACKETBEFORE;
      instate.payload = undefined;
    }
    if (buffer !== undefined)
      buffer = undefined;
  }

  callback();
};

SSH2Stream.prototype.reset = function(noend) {
  if (this._state) {
    var state = this._state;
    state.incoming.status = IN_INIT;
    state.outgoing.status = OUT_INIT;
  } else {
    this._state = {
      authsQueue: [],
      hostkeyFormat: undefined,
      kex: undefined,

      incoming: {
        status: IN_INIT,
        expectedPacket: undefined,
        search: undefined,
        greeting: undefined,
        seqno: 0,
        pktLen: undefined,
        padLen: undefined,
        pktExtra: undefined,
        payload: undefined,
        packet: undefined,
        kexinit: undefined,
        identRaw: undefined,
        rekeyQueue: [],
        ignoreNext: false,

        expect: {
          amount: undefined,
          type: undefined,
          ptr: 0,
          buf: undefined
        },

        decrypt: {
          instance: false,
          info: undefined,
          iv: undefined,
          key: undefined,
          buf: undefined,
          type: undefined
        },

        hmac: {
          info: undefined,
          key: undefined,
          buf: undefined,
          type: false
        },

        decompress: {
          instance: false,
          type: false
        }
      },

      outgoing: {
        status: OUT_INIT,
        seqno: 0,
        bufSeqno: Buffer.allocUnsafe(4),
        rekeyQueue: [],
        kexinit: undefined,
        kexsecret: undefined,
        pubkey: undefined,
        exchangeHash: undefined,
        sessionId: undefined,
        sentNEWKEYS: false,

        encrypt: {
          instance: false,
          info: undefined,
          iv: undefined,
          key: undefined,
          type: undefined
        },

        hmac: {
          info: undefined,
          key: undefined,
          buf: undefined,
          type: false
        },

        compress: {
          instance: false,
          type: false,
          queue: null
        }
      }
    };
  }
  if (!noend) {
    if (this.readable)
      this.push(null);
  }
};

// Common methods
// Global
SSH2Stream.prototype.disconnect = function(reason) {
  /*
    byte      SSH_MSG_DISCONNECT
    uint32    reason code
    string    description in ISO-10646 UTF-8 encoding
    string    language tag
  */
  var buf = Buffer.alloc(1 + 4 + 4 + 4);

  buf[0] = MESSAGE.DISCONNECT;

  if (DISCONNECT_REASON[reason] === undefined)
    reason = DISCONNECT_REASON.BY_APPLICATION;
  writeUInt32BE(buf, reason, 1);

  this.debug('DEBUG: Outgoing: Writing DISCONNECT ('
             + DISCONNECT_REASON[reason]
             + ')');
  send(this, buf);
  this.reset();

  return false;
};
SSH2Stream.prototype.ping = function() {
  this.debug('DEBUG: Outgoing: Writing ping (GLOBAL_REQUEST: keepalive@openssh.com)');
  return send(this, PING_PACKET);
};
SSH2Stream.prototype.rekey = function() {
  var status = this._state.outgoing.status;
  if (status === OUT_REKEYING)
    throw new Error('A re-key is already in progress');
  else if (status !== OUT_READY)
    throw new Error('Cannot re-key yet');

  this.debug('DEBUG: Outgoing: Starting re-key');
  return KEXINIT(this);
};

// 'ssh-connection' service-specific
SSH2Stream.prototype.requestSuccess = function(data) {
  var buf;
  if (Buffer.isBuffer(data)) {
    buf = Buffer.allocUnsafe(1 + data.length);

    buf[0] = MESSAGE.REQUEST_SUCCESS;

    data.copy(buf, 1);
  } else
    buf = REQUEST_SUCCESS_PACKET;

  this.debug('DEBUG: Outgoing: Writing REQUEST_SUCCESS');
  return send(this, buf);
};
SSH2Stream.prototype.requestFailure = function() {
  this.debug('DEBUG: Outgoing: Writing REQUEST_FAILURE');
  return send(this, REQUEST_FAILURE_PACKET);
};
SSH2Stream.prototype.channelSuccess = function(chan) {
  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4);

  buf[0] = MESSAGE.CHANNEL_SUCCESS;

  writeUInt32BE(buf, chan, 1);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_SUCCESS (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelFailure = function(chan) {
  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4);

  buf[0] = MESSAGE.CHANNEL_FAILURE;

  writeUInt32BE(buf, chan, 1);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_FAILURE (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelEOF = function(chan) {
  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4);

  buf[0] = MESSAGE.CHANNEL_EOF;

  writeUInt32BE(buf, chan, 1);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_EOF (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelClose = function(chan) {
  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4);

  buf[0] = MESSAGE.CHANNEL_CLOSE;

  writeUInt32BE(buf, chan, 1);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_CLOSE (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelWindowAdjust = function(chan, amount) {
  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_WINDOW_ADJUST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, amount, 5);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_WINDOW_ADJUST ('
             + chan
             + ', '
             + amount
             + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelData = function(chan, data) {
  var dataIsBuffer = Buffer.isBuffer(data);
  var dataLen = (dataIsBuffer ? data.length : Buffer.byteLength(data));
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + dataLen);

  buf[0] = MESSAGE.CHANNEL_DATA;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, dataLen, 5);
  if (dataIsBuffer)
    data.copy(buf, 9);
  else
    buf.write(data, 9, dataLen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_DATA (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelExtData = function(chan, data, type) {
  var dataIsBuffer = Buffer.isBuffer(data);
  var dataLen = (dataIsBuffer ? data.length : Buffer.byteLength(data));
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 4 + dataLen);

  buf[0] = MESSAGE.CHANNEL_EXTENDED_DATA;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, type, 5);

  writeUInt32BE(buf, dataLen, 9);
  if (dataIsBuffer)
    data.copy(buf, 13);
  else
    buf.write(data, 13, dataLen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_EXTENDED_DATA (' + chan + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelOpenConfirm = function(remoteChan, localChan,
                                                   initWindow, maxPacket) {
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN_CONFIRMATION;

  writeUInt32BE(buf, remoteChan, 1);

  writeUInt32BE(buf, localChan, 5);

  writeUInt32BE(buf, initWindow, 9);

  writeUInt32BE(buf, maxPacket, 13);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN_CONFIRMATION (r:'
             + remoteChan
             + ', l:'
             + localChan
             + ')');
  return send(this, buf);
};
SSH2Stream.prototype.channelOpenFail = function(remoteChan, reason, desc,
                                                lang) {
  if (typeof desc !== 'string')
    desc = '';
  if (typeof lang !== 'string')
    lang = '';

  var descLen = Buffer.byteLength(desc);
  var langLen = Buffer.byteLength(lang);
  var p = 9;
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 4 + descLen + 4 + langLen);

  buf[0] = MESSAGE.CHANNEL_OPEN_FAILURE;

  writeUInt32BE(buf, remoteChan, 1);

  writeUInt32BE(buf, reason, 5);

  writeUInt32BE(buf, descLen, p);
  p += 4;
  if (descLen) {
    buf.write(desc, p, descLen, 'utf8');
    p += descLen;
  }

  writeUInt32BE(buf, langLen, p);
  if (langLen)
    buf.write(lang, p += 4, langLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN_FAILURE ('
             + remoteChan
             + ')');
  return send(this, buf);
};

// Client-specific methods
// Global
SSH2Stream.prototype.service = function(svcName) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var svcNameLen = Buffer.byteLength(svcName);
  var buf = Buffer.allocUnsafe(1 + 4 + svcNameLen);

  buf[0] = MESSAGE.SERVICE_REQUEST;

  writeUInt32BE(buf, svcNameLen, 1);
  buf.write(svcName, 5, svcNameLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing SERVICE_REQUEST (' + svcName + ')');
  return send(this, buf);
};
// 'ssh-connection' service-specific
SSH2Stream.prototype.tcpipForward = function(bindAddr, bindPort, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var addrlen = Buffer.byteLength(bindAddr);
  var buf = Buffer.allocUnsafe(1 + 4 + 13 + 1 + 4 + addrlen + 4);

  buf[0] = MESSAGE.GLOBAL_REQUEST;

  writeUInt32BE(buf, 13, 1);
  buf.write('tcpip-forward', 5, 13, 'ascii');

  buf[18] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, addrlen, 19);
  buf.write(bindAddr, 23, addrlen, 'ascii');

  writeUInt32BE(buf, bindPort, 23 + addrlen);

  this.debug('DEBUG: Outgoing: Writing GLOBAL_REQUEST (tcpip-forward)');
  return send(this, buf);
};
SSH2Stream.prototype.cancelTcpipForward = function(bindAddr, bindPort,
                                                   wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var addrlen = Buffer.byteLength(bindAddr);
  var buf = Buffer.allocUnsafe(1 + 4 + 20 + 1 + 4 + addrlen + 4);

  buf[0] = MESSAGE.GLOBAL_REQUEST;

  writeUInt32BE(buf, 20, 1);
  buf.write('cancel-tcpip-forward', 5, 20, 'ascii');

  buf[25] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, addrlen, 26);
  buf.write(bindAddr, 30, addrlen, 'ascii');

  writeUInt32BE(buf, bindPort, 30 + addrlen);

  this.debug('DEBUG: Outgoing: Writing GLOBAL_REQUEST (cancel-tcpip-forward)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_streamLocalForward = function(socketPath,
                                                           wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var pathlen = Buffer.byteLength(socketPath);
  var buf = Buffer.allocUnsafe(1 + 4 + 31 + 1 + 4 + pathlen);

  buf[0] = MESSAGE.GLOBAL_REQUEST;

  writeUInt32BE(buf, 31, 1);
  buf.write('streamlocal-forward@openssh.com', 5, 31, 'ascii');

  buf[36] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, pathlen, 37);
  buf.write(socketPath, 41, pathlen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing GLOBAL_REQUEST (streamlocal-forward@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_cancelStreamLocalForward = function(socketPath,
                                                                 wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var pathlen = Buffer.byteLength(socketPath);
  var buf = Buffer.allocUnsafe(1 + 4 + 38 + 1 + 4 + pathlen);

  buf[0] = MESSAGE.GLOBAL_REQUEST;

  writeUInt32BE(buf, 38, 1);
  buf.write('cancel-streamlocal-forward@openssh.com', 5, 38, 'ascii');

  buf[43] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, pathlen, 44);
  buf.write(socketPath, 48, pathlen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing GLOBAL_REQUEST (cancel-streamlocal-forward@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.directTcpip = function(chan, initWindow, maxPacket, cfg) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var srclen = Buffer.byteLength(cfg.srcIP);
  var dstlen = Buffer.byteLength(cfg.dstIP);
  var p = 29;
  var buf = Buffer.allocUnsafe(1 + 4 + 12 + 4 + 4 + 4 + 4 + srclen + 4 + 4
                               + dstlen + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 12, 1);
  buf.write('direct-tcpip', 5, 12, 'ascii');

  writeUInt32BE(buf, chan, 17);

  writeUInt32BE(buf, initWindow, 21);

  writeUInt32BE(buf, maxPacket, 25);

  writeUInt32BE(buf, dstlen, p);
  buf.write(cfg.dstIP, p += 4, dstlen, 'ascii');

  writeUInt32BE(buf, cfg.dstPort, p += dstlen);

  writeUInt32BE(buf, srclen, p += 4);
  buf.write(cfg.srcIP, p += 4, srclen, 'ascii');

  writeUInt32BE(buf, cfg.srcPort, p += srclen);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', direct-tcpip)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_directStreamLocal = function(chan, initWindow,
                                                          maxPacket, cfg) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var pathlen = Buffer.byteLength(cfg.socketPath);
  var p = 47;
  var buf = Buffer.allocUnsafe(1 + 4 + 30 + 4 + 4 + 4 + 4 + pathlen + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 30, 1);
  buf.write('direct-streamlocal@openssh.com', 5, 30, 'ascii');

  writeUInt32BE(buf, chan, 35);

  writeUInt32BE(buf, initWindow, 39);

  writeUInt32BE(buf, maxPacket, 43);

  writeUInt32BE(buf, pathlen, p);
  buf.write(cfg.socketPath, p += 4, pathlen, 'utf8');

  // reserved fields (string and uint32)
  buf.fill(0, buf.length - 8);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', direct-streamlocal@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_noMoreSessions = function(wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var buf = Buffer.allocUnsafe(1 + 4 + 28 + 1);

  buf[0] = MESSAGE.GLOBAL_REQUEST;

  writeUInt32BE(buf, 28, 1);
  buf.write('no-more-sessions@openssh.com', 5, 28, 'ascii');

  buf[33] = (wantReply === undefined || wantReply === true ? 1 : 0);

  this.debug('DEBUG: Outgoing: Writing GLOBAL_REQUEST (no-more-sessions@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.session = function(chan, initWindow, maxPacket) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 7 + 4 + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 7, 1);
  buf.write('session', 5, 7, 'ascii');

  writeUInt32BE(buf, chan, 12);

  writeUInt32BE(buf, initWindow, 16);

  writeUInt32BE(buf, maxPacket, 20);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', session)');
  return send(this, buf);
};
SSH2Stream.prototype.windowChange = function(chan, rows, cols, height, width) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 13 + 1 + 4 + 4 + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 13, 5);
  buf.write('window-change', 9, 13, 'ascii');

  buf[22] = 0;

  writeUInt32BE(buf, cols, 23);

  writeUInt32BE(buf, rows, 27);

  writeUInt32BE(buf, width, 31);

  writeUInt32BE(buf, height, 35);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', window-change)');
  return send(this, buf);
};
SSH2Stream.prototype.pty = function(chan, rows, cols, height,
                                    width, term, modes, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  if (!term || !term.length)
    term = 'vt100';
  if (modes
      && !Buffer.isBuffer(modes)
      && !Array.isArray(modes)
      && typeof modes === 'object')
    modes = modesToBytes(modes);
  if (!modes || !modes.length)
    modes = NO_TERMINAL_MODES_BUFFER;

  var termLen = term.length;
  var modesLen = modes.length;
  var p = 21;
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 7 + 1 + 4 + termLen + 4 + 4 + 4 + 4
                               + 4 + modesLen);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 7, 5);
  buf.write('pty-req', 9, 7, 'ascii');

  buf[16] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, termLen, 17);
  buf.write(term, 21, termLen, 'utf8');

  writeUInt32BE(buf, cols, p += termLen);

  writeUInt32BE(buf, rows, p += 4);

  writeUInt32BE(buf, width, p += 4);

  writeUInt32BE(buf, height, p += 4);

  writeUInt32BE(buf, modesLen, p += 4);
  p += 4;
  if (Array.isArray(modes)) {
    for (var i = 0; i < modesLen; ++i)
      buf[p++] = modes[i];
  } else if (Buffer.isBuffer(modes)) {
    modes.copy(buf, p);
  }

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', pty-req)');
  return send(this, buf);
};
SSH2Stream.prototype.shell = function(chan, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 5 + 1);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 5, 5);
  buf.write('shell', 9, 5, 'ascii');

  buf[14] = (wantReply === undefined || wantReply === true ? 1 : 0);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', shell)');
  return send(this, buf);
};
SSH2Stream.prototype.exec = function(chan, cmd, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var cmdlen = (Buffer.isBuffer(cmd) ? cmd.length : Buffer.byteLength(cmd));
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 4 + 1 + 4 + cmdlen);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 4, 5);
  buf.write('exec', 9, 4, 'ascii');

  buf[13] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, cmdlen, 14);
  if (Buffer.isBuffer(cmd))
    cmd.copy(buf, 18);
  else
    buf.write(cmd, 18, cmdlen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', exec)');
  return send(this, buf);
};
SSH2Stream.prototype.signal = function(chan, signal) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  signal = signal.toUpperCase();
  if (signal.slice(0, 3) === 'SIG')
    signal = signal.substring(3);

  if (SIGNALS.indexOf(signal) === -1)
    throw new Error('Invalid signal: ' + signal);

  var signalLen = signal.length;
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 6 + 1 + 4 + signalLen);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 6, 5);
  buf.write('signal', 9, 6, 'ascii');

  buf[15] = 0;

  writeUInt32BE(buf, signalLen, 16);
  buf.write(signal, 20, signalLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', signal)');
  return send(this, buf);
};
SSH2Stream.prototype.env = function(chan, key, val, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var keyLen = Buffer.byteLength(key);
  var valLen = (Buffer.isBuffer(val) ? val.length : Buffer.byteLength(val));
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 3 + 1 + 4 + keyLen + 4 + valLen);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 3, 5);
  buf.write('env', 9, 3, 'ascii');

  buf[12] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, keyLen, 13);
  buf.write(key, 17, keyLen, 'ascii');

  writeUInt32BE(buf, valLen, 17 + keyLen);
  if (Buffer.isBuffer(val))
    val.copy(buf, 17 + keyLen + 4);
  else
    buf.write(val, 17 + keyLen + 4, valLen, 'utf8');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', env)');
  return send(this, buf);
};
SSH2Stream.prototype.x11Forward = function(chan, cfg, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var protolen = Buffer.byteLength(cfg.protocol);
  var cookielen = Buffer.byteLength(cfg.cookie);
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 7 + 1 + 1 + 4 + protolen + 4
                               + cookielen + 4);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 7, 5);
  buf.write('x11-req', 9, 7, 'ascii');

  buf[16] = (wantReply === undefined || wantReply === true ? 1 : 0);

  buf[17] = (cfg.single ? 1 : 0);

  writeUInt32BE(buf, protolen, 18);
  var bp = 22;
  if (Buffer.isBuffer(cfg.protocol))
    cfg.protocol.copy(buf, bp);
  else
    buf.write(cfg.protocol, bp, protolen, 'utf8');
  bp += protolen;

  writeUInt32BE(buf, cookielen, bp);
  bp += 4;
  if (Buffer.isBuffer(cfg.cookie))
    cfg.cookie.copy(buf, bp);
  else
    buf.write(cfg.cookie, bp, cookielen, 'binary');
  bp += cookielen;

  writeUInt32BE(buf, (cfg.screen || 0), bp);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', x11-req)');
  return send(this, buf);
};
SSH2Stream.prototype.subsystem = function(chan, name, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var nameLen = Buffer.byteLength(name);
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 9 + 1 + 4 + nameLen);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 9, 5);
  buf.write('subsystem', 9, 9, 'ascii');

  buf[18] = (wantReply === undefined || wantReply === true ? 1 : 0);

  writeUInt32BE(buf, nameLen, 19);
  buf.write(name, 23, nameLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', subsystem: '
             + name
             + ')');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_agentForward = function(chan, wantReply) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 26 + 1);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 26, 5);
  buf.write('auth-agent-req@openssh.com', 9, 26, 'ascii');

  buf[35] = (wantReply === undefined || wantReply === true ? 1 : 0);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', auth-agent-req@openssh.com)');
  return send(this, buf);
};
// 'ssh-userauth' service-specific
SSH2Stream.prototype.authPassword = function(username, password) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var userLen = Buffer.byteLength(username);
  var passLen = Buffer.byteLength(password);
  var p = 0;
  var buf = Buffer.allocUnsafe(1
                               + 4 + userLen
                               + 4 + 14 // "ssh-connection"
                               + 4 + 8 // "password"
                               + 1
                               + 4 + passLen);

  buf[p] = MESSAGE.USERAUTH_REQUEST;

  writeUInt32BE(buf, userLen, ++p);
  buf.write(username, p += 4, userLen, 'utf8');

  writeUInt32BE(buf, 14, p += userLen);
  buf.write('ssh-connection', p += 4, 14, 'ascii');

  writeUInt32BE(buf, 8, p += 14);
  buf.write('password', p += 4, 8, 'ascii');

  buf[p += 8] = 0;

  writeUInt32BE(buf, passLen, ++p);
  buf.write(password, p += 4, passLen, 'utf8');

  this._state.authsQueue.push('password');
  this.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (password)');
  return send(this, buf);
};
SSH2Stream.prototype.authPK = function(username, pubKey, cbSign) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var self = this;
  var outstate = this._state.outgoing;
  var keyType;

  if (typeof pubKey.getPublicSSH === 'function') {
    keyType = pubKey.type;
    pubKey = pubKey.getPublicSSH();
  } else {
    keyType = pubKey.toString('ascii',
                              4,
                              4 + readUInt32BE(pubKey, 0));
  }

  var userLen = Buffer.byteLength(username);
  var algoLen = Buffer.byteLength(keyType);
  var pubKeyLen = pubKey.length;
  var sesLen = outstate.sessionId.length;
  var p = 0;
  var buf = Buffer.allocUnsafe((cbSign ? 4 + sesLen : 0)
                               + 1
                               + 4 + userLen
                               + 4 + 14 // "ssh-connection"
                               + 4 + 9 // "publickey"
                               + 1
                               + 4 + algoLen
                               + 4 + pubKeyLen
                              );

  if (cbSign) {
    writeUInt32BE(buf, sesLen, p);
    outstate.sessionId.copy(buf, p += 4);
    buf[p += sesLen] = MESSAGE.USERAUTH_REQUEST;
  } else {
    buf[p] = MESSAGE.USERAUTH_REQUEST;
  }

  writeUInt32BE(buf, userLen, ++p);
  buf.write(username, p += 4, userLen, 'utf8');

  writeUInt32BE(buf, 14, p += userLen);
  buf.write('ssh-connection', p += 4, 14, 'ascii');

  writeUInt32BE(buf, 9, p += 14);
  buf.write('publickey', p += 4, 9, 'ascii');

  buf[p += 9] = (cbSign ? 1 : 0);

  writeUInt32BE(buf, algoLen, ++p);
  buf.write(keyType, p += 4, algoLen, 'ascii');

  writeUInt32BE(buf, pubKeyLen, p += algoLen);
  pubKey.copy(buf, p += 4);

  if (!cbSign) {
    this._state.authsQueue.push('publickey');
    this.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (publickey -- check)');
    return send(this, buf);
  }

  cbSign(buf, function(signature) {
    signature = convertSignature(signature, keyType);
    if (signature === false)
      throw new Error('Error while converting handshake signature');

    var sigLen = signature.length;
    var sigbuf = Buffer.allocUnsafe(1
                                    + 4 + userLen
                                    + 4 + 14 // "ssh-connection"
                                    + 4 + 9 // "publickey"
                                    + 1
                                    + 4 + algoLen
                                    + 4 + pubKeyLen
                                    + 4 // 4 + algoLen + 4 + sigLen
                                    + 4 + algoLen
                                    + 4 + sigLen);

    p = 0;

    sigbuf[p] = MESSAGE.USERAUTH_REQUEST;

    writeUInt32BE(sigbuf, userLen, ++p);
    sigbuf.write(username, p += 4, userLen, 'utf8');

    writeUInt32BE(sigbuf, 14, p += userLen);
    sigbuf.write('ssh-connection', p += 4, 14, 'ascii');

    writeUInt32BE(sigbuf, 9, p += 14);
    sigbuf.write('publickey', p += 4, 9, 'ascii');

    sigbuf[p += 9] = 1;

    writeUInt32BE(sigbuf, algoLen, ++p);
    sigbuf.write(keyType, p += 4, algoLen, 'ascii');

    writeUInt32BE(sigbuf, pubKeyLen, p += algoLen);
    pubKey.copy(sigbuf, p += 4);
    writeUInt32BE(sigbuf, 4 + algoLen + 4 + sigLen, p += pubKeyLen);
    writeUInt32BE(sigbuf, algoLen, p += 4);
    sigbuf.write(keyType, p += 4, algoLen, 'ascii');
    writeUInt32BE(sigbuf, sigLen, p += algoLen);
    signature.copy(sigbuf, p += 4);

    // Servers shouldn't send packet type 60 in response to signed publickey
    // attempts, but if they do, interpret as type 60.
    self._state.authsQueue.push('publickey');
    self.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (publickey)');
    return send(self, sigbuf);
  });
  return true;
};
SSH2Stream.prototype.authHostbased = function(username, pubKey, hostname,
                                              userlocal, cbSign) {
  // TODO: Make DRY by sharing similar code with authPK()

  if (this.server)
    throw new Error('Client-only method called in server mode');

  var self = this;
  var outstate = this._state.outgoing;
  var keyType;

  if (typeof pubKey.getPublicSSH === 'function') {
    keyType = pubKey.type;
    pubKey = pubKey.getPublicSSH();
  } else {
    keyType = pubKey.toString('ascii',
                              4,
                              4 + readUInt32BE(pubKey, 0));
  }

  var userLen = Buffer.byteLength(username);
  var algoLen = Buffer.byteLength(keyType);
  var pubKeyLen = pubKey.length;
  var sesLen = outstate.sessionId.length;
  var hostnameLen = Buffer.byteLength(hostname);
  var userlocalLen = Buffer.byteLength(userlocal);
  var p = 0;
  var buf = Buffer.allocUnsafe(4 + sesLen
                               + 1
                               + 4 + userLen
                               + 4 + 14 // "ssh-connection"
                               + 4 + 9 // "hostbased"
                               + 4 + algoLen
                               + 4 + pubKeyLen
                               + 4 + hostnameLen
                               + 4 + userlocalLen
                              );

  writeUInt32BE(buf, sesLen, p);
  outstate.sessionId.copy(buf, p += 4);

  buf[p += sesLen] = MESSAGE.USERAUTH_REQUEST;

  writeUInt32BE(buf, userLen, ++p);
  buf.write(username, p += 4, userLen, 'utf8');

  writeUInt32BE(buf, 14, p += userLen);
  buf.write('ssh-connection', p += 4, 14, 'ascii');

  writeUInt32BE(buf, 9, p += 14);
  buf.write('hostbased', p += 4, 9, 'ascii');

  writeUInt32BE(buf, algoLen, p += 9);
  buf.write(keyType, p += 4, algoLen, 'ascii');

  writeUInt32BE(buf, pubKeyLen, p += algoLen);
  pubKey.copy(buf, p += 4);

  writeUInt32BE(buf, hostnameLen, p += pubKeyLen);
  buf.write(hostname, p += 4, hostnameLen, 'ascii');

  writeUInt32BE(buf, userlocalLen, p += hostnameLen);
  buf.write(userlocal, p += 4, userlocalLen, 'utf8');

  cbSign(buf, function(signature) {
    signature = convertSignature(signature, keyType);
    if (signature === false)
      throw new Error('Error while converting handshake signature');

    var sigLen = signature.length;
    var sigbuf = Buffer.allocUnsafe((buf.length - sesLen) + sigLen);

    buf.copy(sigbuf, 0, 4 + sesLen);
    writeUInt32BE(sigbuf, sigLen, sigbuf.length - sigLen - 4);
    signature.copy(sigbuf, sigbuf.length - sigLen);

    self._state.authsQueue.push('hostbased');
    self.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (hostbased)');
    return send(self, sigbuf);
  });
  return true;
};
SSH2Stream.prototype.authKeyboard = function(username) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var userLen = Buffer.byteLength(username);
  var p = 0;
  var buf = Buffer.allocUnsafe(1
                               + 4 + userLen
                               + 4 + 14 // "ssh-connection"
                               + 4 + 20 // "keyboard-interactive"
                               + 4 // no language set
                               + 4 // no submethods
                              );

  buf[p] = MESSAGE.USERAUTH_REQUEST;

  writeUInt32BE(buf, userLen, ++p);
  buf.write(username, p += 4, userLen, 'utf8');

  writeUInt32BE(buf, 14, p += userLen);
  buf.write('ssh-connection', p += 4, 14, 'ascii');

  writeUInt32BE(buf, 20, p += 14);
  buf.write('keyboard-interactive', p += 4, 20, 'ascii');

  writeUInt32BE(buf, 0, p += 20);

  writeUInt32BE(buf, 0, p += 4);

  this._state.authsQueue.push('keyboard-interactive');
  this.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (keyboard-interactive)');
  return send(this, buf);
};
SSH2Stream.prototype.authNone = function(username) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var userLen = Buffer.byteLength(username);
  var p = 0;
  var buf = Buffer.allocUnsafe(1
                               + 4 + userLen
                               + 4 + 14 // "ssh-connection"
                               + 4 + 4 // "none"
                              );

  buf[p] = MESSAGE.USERAUTH_REQUEST;

  writeUInt32BE(buf, userLen, ++p);
  buf.write(username, p += 4, userLen, 'utf8');

  writeUInt32BE(buf, 14, p += userLen);
  buf.write('ssh-connection', p += 4, 14, 'ascii');

  writeUInt32BE(buf, 4, p += 14);
  buf.write('none', p += 4, 4, 'ascii');

  this._state.authsQueue.push('none');
  this.debug('DEBUG: Outgoing: Writing USERAUTH_REQUEST (none)');
  return send(this, buf);
};
SSH2Stream.prototype.authInfoRes = function(responses) {
  if (this.server)
    throw new Error('Client-only method called in server mode');

  var responsesLen = 0;
  var p = 0;
  var resLen;
  var len;
  var i;

  if (responses) {
    for (i = 0, len = responses.length; i < len; ++i)
      responsesLen += 4 + Buffer.byteLength(responses[i]);
  }
  var buf = Buffer.allocUnsafe(1 + 4 + responsesLen);

  buf[p++] = MESSAGE.USERAUTH_INFO_RESPONSE;

  writeUInt32BE(buf, responses ? responses.length : 0, p);
  if (responses) {
    p += 4;
    for (i = 0, len = responses.length; i < len; ++i) {
      resLen = Buffer.byteLength(responses[i]);
      writeUInt32BE(buf, resLen, p);
      p += 4;
      if (resLen) {
        buf.write(responses[i], p, resLen, 'utf8');
        p += resLen;
      }
    }
  }

  this.debug('DEBUG: Outgoing: Writing USERAUTH_INFO_RESPONSE');
  return send(this, buf);
};

// Server-specific methods
// Global
SSH2Stream.prototype.serviceAccept = function(svcName) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var svcNameLen = svcName.length;
  var buf = Buffer.allocUnsafe(1 + 4 + svcNameLen);

  buf[0] = MESSAGE.SERVICE_ACCEPT;

  writeUInt32BE(buf, svcNameLen, 1);
  buf.write(svcName, 5, svcNameLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing SERVICE_ACCEPT (' + svcName + ')');
  send(this, buf);

  if (this.server && this.banner && svcName === 'ssh-userauth') {
    /*
      byte      SSH_MSG_USERAUTH_BANNER
      string    message in ISO-10646 UTF-8 encoding
      string    language tag
    */
    var bannerLen = Buffer.byteLength(this.banner);
    var packetLen = 1 + 4 + bannerLen + 4;
    var packet = Buffer.allocUnsafe(packetLen);
    packet[0] = MESSAGE.USERAUTH_BANNER;
    writeUInt32BE(packet, bannerLen, 1);
    packet.write(this.banner, 5, bannerLen, 'utf8');
    packet.fill(0, packetLen - 4); // Empty language tag
    this.debug('DEBUG: Outgoing: Writing USERAUTH_BANNER');
    send(this, packet);
    this.banner = undefined; // Prevent banner from being displayed again
  }
};
// 'ssh-connection' service-specific
SSH2Stream.prototype.forwardedTcpip = function(chan, initWindow, maxPacket,
                                               cfg) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var boundAddrLen = Buffer.byteLength(cfg.boundAddr);
  var remoteAddrLen = Buffer.byteLength(cfg.remoteAddr);
  var p = 36 + boundAddrLen;
  var buf = Buffer.allocUnsafe(1 + 4 + 15 + 4 + 4 + 4 + 4 + boundAddrLen + 4 + 4
                               + remoteAddrLen + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 15, 1);
  buf.write('forwarded-tcpip', 5, 15, 'ascii');

  writeUInt32BE(buf, chan, 20);

  writeUInt32BE(buf, initWindow, 24);

  writeUInt32BE(buf, maxPacket, 28);

  writeUInt32BE(buf, boundAddrLen, 32);
  buf.write(cfg.boundAddr, 36, boundAddrLen, 'ascii');

  writeUInt32BE(buf, cfg.boundPort, p);

  writeUInt32BE(buf, remoteAddrLen, p += 4);
  buf.write(cfg.remoteAddr, p += 4, remoteAddrLen, 'ascii');

  writeUInt32BE(buf, cfg.remotePort, p += remoteAddrLen);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', forwarded-tcpip)');
  return send(this, buf);
};
SSH2Stream.prototype.x11 = function(chan, initWindow, maxPacket, cfg) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var addrLen = Buffer.byteLength(cfg.originAddr);
  var p = 24 + addrLen;
  var buf = Buffer.allocUnsafe(1 + 4 + 3 + 4 + 4 + 4 + 4 + addrLen + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 3, 1);
  buf.write('x11', 5, 3, 'ascii');

  writeUInt32BE(buf, chan, 8);

  writeUInt32BE(buf, initWindow, 12);

  writeUInt32BE(buf, maxPacket, 16);

  writeUInt32BE(buf, addrLen, 20);
  buf.write(cfg.originAddr, 24, addrLen, 'ascii');

  writeUInt32BE(buf, cfg.originPort, p);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', x11)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_authAgent = function(chan, initWindow, maxPacket) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var buf = Buffer.allocUnsafe(1 + 4 + 22 + 4 + 4 + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 22, 1);
  buf.write('auth-agent@openssh.com', 5, 22, 'ascii');

  writeUInt32BE(buf, chan, 27);

  writeUInt32BE(buf, initWindow, 31);

  writeUInt32BE(buf, maxPacket, 35);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', auth-agent@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.openssh_forwardedStreamLocal = function(chan, initWindow,
                                                             maxPacket, cfg) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var pathlen = Buffer.byteLength(cfg.socketPath);
  var buf = Buffer.allocUnsafe(1 + 4 + 33 + 4 + 4 + 4 + 4 + pathlen + 4);

  buf[0] = MESSAGE.CHANNEL_OPEN;

  writeUInt32BE(buf, 33, 1);
  buf.write('forwarded-streamlocal@openssh.com', 5, 33, 'ascii');

  writeUInt32BE(buf, chan, 38);

  writeUInt32BE(buf, initWindow, 42);

  writeUInt32BE(buf, maxPacket, 46);

  writeUInt32BE(buf, pathlen, 50);
  buf.write(cfg.socketPath, 54, pathlen, 'utf8');

  writeUInt32BE(buf, 0, 54 + pathlen);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_OPEN ('
             + chan
             + ', forwarded-streamlocal@openssh.com)');
  return send(this, buf);
};
SSH2Stream.prototype.exitStatus = function(chan, status) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  // Does not consume window space
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 11 + 1 + 4);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 11, 5);
  buf.write('exit-status', 9, 11, 'ascii');

  buf[20] = 0;

  writeUInt32BE(buf, status, 21);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', exit-status)');
  return send(this, buf);
};
SSH2Stream.prototype.exitSignal = function(chan, name, coreDumped, msg) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  // Does not consume window space
  var nameLen = Buffer.byteLength(name);
  var msgLen = (msg ? Buffer.byteLength(msg) : 0);
  var p = 25 + nameLen;
  var buf = Buffer.allocUnsafe(1 + 4 + 4 + 11 + 1 + 4 + nameLen + 1 + 4 + msgLen
                               + 4);

  buf[0] = MESSAGE.CHANNEL_REQUEST;

  writeUInt32BE(buf, chan, 1);

  writeUInt32BE(buf, 11, 5);
  buf.write('exit-signal', 9, 11, 'ascii');

  buf[20] = 0;

  writeUInt32BE(buf, nameLen, 21);
  buf.write(name, 25, nameLen, 'utf8');

  buf[p++] = (coreDumped ? 1 : 0);

  writeUInt32BE(buf, msgLen, p);
  p += 4;
  if (msgLen) {
    buf.write(msg, p, msgLen, 'utf8');
    p += msgLen;
  }

  writeUInt32BE(buf, 0, p);

  this.debug('DEBUG: Outgoing: Writing CHANNEL_REQUEST ('
             + chan
             + ', exit-signal)');
  return send(this, buf);
};
// 'ssh-userauth' service-specific
SSH2Stream.prototype.authFailure = function(authMethods, isPartial) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var authsQueue = this._state.authsQueue;
  if (!authsQueue.length)
    throw new Error('No auth in progress');

  var methods;

  if (typeof authMethods === 'boolean') {
    isPartial = authMethods;
    authMethods = undefined;
  }

  if (authMethods) {
    methods = [];
    for (var i = 0, len = authMethods.length; i < len; ++i) {
      if (authMethods[i].toLowerCase() === 'none')
        continue;
      methods.push(authMethods[i]);
    }
    methods = methods.join(',');
  } else
    methods = '';

  var methodsLen = methods.length;
  var buf = Buffer.allocUnsafe(1 + 4 + methodsLen + 1);

  buf[0] = MESSAGE.USERAUTH_FAILURE;

  writeUInt32BE(buf, methodsLen, 1);
  buf.write(methods, 5, methodsLen, 'ascii');

  buf[5 + methodsLen] = (isPartial === true ? 1 : 0);

  this._state.authsQueue.shift();
  this.debug('DEBUG: Outgoing: Writing USERAUTH_FAILURE');
  return send(this, buf);
};
SSH2Stream.prototype.authSuccess = function() {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var authsQueue = this._state.authsQueue;
  if (!authsQueue.length)
    throw new Error('No auth in progress');

  var state = this._state;
  var outstate = state.outgoing;
  var instate = state.incoming;

  state.authsQueue.shift();

  this.debug('DEBUG: Outgoing: Writing USERAUTH_SUCCESS');
  var ret = send(this, USERAUTH_SUCCESS_PACKET);

  if (outstate.compress.type === 'zlib@openssh.com') {
    outstate.compress.instance = zlib.createDeflate(ZLIB_OPTS);
    outstate.compress.queue = [];
  }
  if (instate.decompress.type === 'zlib@openssh.com')
    instate.decompress.instance = zlib.createInflate(ZLIB_OPTS);

  return ret;
};
SSH2Stream.prototype.authPKOK = function(keyAlgo, key) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var authsQueue = this._state.authsQueue;
  if (!authsQueue.length || authsQueue[0] !== 'publickey')
    throw new Error('"publickey" auth not in progress');

  var keyAlgoLen = keyAlgo.length;
  var keyLen = key.length;
  var buf = Buffer.allocUnsafe(1 + 4 + keyAlgoLen + 4 + keyLen);

  buf[0] = MESSAGE.USERAUTH_PK_OK;

  writeUInt32BE(buf, keyAlgoLen, 1);
  buf.write(keyAlgo, 5, keyAlgoLen, 'ascii');

  writeUInt32BE(buf, keyLen, 5 + keyAlgoLen);
  key.copy(buf, 5 + keyAlgoLen + 4);

  this._state.authsQueue.shift();
  this.debug('DEBUG: Outgoing: Writing USERAUTH_PK_OK');
  return send(this, buf);
};
SSH2Stream.prototype.authPasswdChg = function(prompt, lang) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var promptLen = Buffer.byteLength(prompt);
  var langLen = lang ? lang.length : 0;
  var p = 0;
  var buf = Buffer.allocUnsafe(1 + 4 + promptLen + 4 + langLen);

  buf[p] = MESSAGE.USERAUTH_PASSWD_CHANGEREQ;

  writeUInt32BE(buf, promptLen, ++p);
  buf.write(prompt, p += 4, promptLen, 'utf8');

  writeUInt32BE(buf, langLen, p += promptLen);
  if (langLen)
    buf.write(lang, p += 4, langLen, 'ascii');

  this.debug('DEBUG: Outgoing: Writing USERAUTH_PASSWD_CHANGEREQ');
  return send(this, buf);
};
SSH2Stream.prototype.authInfoReq = function(name, instructions, prompts) {
  if (!this.server)
    throw new Error('Server-only method called in client mode');

  var promptsLen = 0;
  var nameLen = name ? Buffer.byteLength(name) : 0;
  var instrLen = instructions ? Buffer.byteLength(instructions) : 0;
  var p = 0;
  var promptLen;
  var prompt;
  var len;
  var i;

  for (i = 0, len = prompts.length; i < len; ++i)
    promptsLen += 4 + Buffer.byteLength(prompts[i].prompt) + 1;
  var buf = Buffer.allocUnsafe(1 + 4 + nameLen + 4 + instrLen + 4 + 4
                               + promptsLen);

  buf[p++] = MESSAGE.USERAUTH_INFO_REQUEST;

  writeUInt32BE(buf, nameLen, p);
  p += 4;
  if (name) {
    buf.write(name, p, nameLen, 'utf8');
    p += nameLen;
  }

  writeUInt32BE(buf, instrLen, p);
  p += 4;
  if (instructions) {
    buf.write(instructions, p, instrLen, 'utf8');
    p += instrLen;
  }

  writeUInt32BE(buf, 0, p);
  p += 4;

  writeUInt32BE(buf, prompts.length, p);
  p += 4;
  for (i = 0, len = prompts.length; i < len; ++i) {
    prompt = prompts[i];
    promptLen = Buffer.byteLength(prompt.prompt);
    writeUInt32BE(buf, promptLen, p);
    p += 4;
    if (promptLen) {
      buf.write(prompt.prompt, p, promptLen, 'utf8');
      p += promptLen;
    }
    buf[p++] = (prompt.echo ? 1 : 0);
  }

  this.debug('DEBUG: Outgoing: Writing USERAUTH_INFO_REQUEST');
  return send(this, buf);
};

// Shared incoming/parser functions
function onDISCONNECT(self, reason, code, desc, lang) { // Client/Server
  if (code !== DISCONNECT_REASON.BY_APPLICATION) {
    var err = new Error(desc || reason);
    err.code = code;
    self.emit('error', err);
  }
  self.reset();
}

function onKEXINIT(self, init, firstFollows) { // Client/Server
  var state = self._state;
  var outstate = state.outgoing;

  if (outstate.status === OUT_READY) {
    self.debug('DEBUG: Received re-key request');
    outstate.status = OUT_REKEYING;
    outstate.kexinit = undefined;
    KEXINIT(self, check);
  } else {
    check();
  }

  function check() {
    if (check_KEXINIT(self, init, firstFollows) === true) {
      if (!self.server) {
        if (state.kex.type === 'groupex')
          KEXDH_GEX_REQ(self);
        else
          KEXDH_INIT(self);
      } else {
        state.incoming.expectedPacket = state.kex.pktInit;
      }
    }
  }
}

function check_KEXINIT(self, init, firstFollows) {
  var state = self._state;
  var instate = state.incoming;
  var outstate = state.outgoing;
  var debug = self.debug;
  var serverList;
  var clientList;
  var val;
  var len;
  var i;

  debug('DEBUG: Comparing KEXINITs ...');

  var algos = self.config.algorithms;

  var kexList = algos.kex;
  if (self.remoteBugs & BUGS.BAD_DHGEX) {
    var copied = false;
    for (var j = kexList.length - 1; j >= 0; --j) {
      if (kexList[j].indexOf('group-exchange') !== -1) {
        if (!copied) {
          kexList = kexList.slice();
          copied = true;
        }
        kexList.splice(j, 1);
      }
    }
  }

  debug('DEBUG: (local) KEX algorithms: ' + kexList);
  debug('DEBUG: (remote) KEX algorithms: ' + init.algorithms.kex);
  if (self.server) {
    serverList = kexList;
    clientList = init.algorithms.kex;
  } else {
    serverList = init.algorithms.kex;
    clientList = kexList;
  }
  // Check for agreeable key exchange algorithm
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching key exchange algorithm');
    var err = new Error('Handshake failed: no matching key exchange algorithm');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  var kex_algorithm = clientList[i];
  debug('DEBUG: KEX algorithm: ' + kex_algorithm);
  if (firstFollows
      && (!init.algorithms.kex.length
          || kex_algorithm !== init.algorithms.kex[0])) {
    // Ignore next incoming packet, it was a wrong first guess at KEX algorithm
    instate.ignoreNext = true;
  }

  debug('DEBUG: (local) Host key formats: ' + algos.serverHostKey);
  debug('DEBUG: (remote) Host key formats: ' + init.algorithms.srvHostKey);
  if (self.server) {
    serverList = algos.serverHostKey;
    clientList = init.algorithms.srvHostKey;
  } else {
    serverList = init.algorithms.srvHostKey;
    clientList = algos.serverHostKey;
  }
  // Check for agreeable server host key format
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching host key format');
    var err = new Error('Handshake failed: no matching host key format');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  state.hostkeyFormat = clientList[i];
  debug('DEBUG: Host key format: ' + state.hostkeyFormat);

  debug('DEBUG: (local) Client->Server ciphers: ' + algos.cipher);
  debug('DEBUG: (remote) Client->Server ciphers: '
        + init.algorithms.cs.encrypt);
  if (self.server) {
    serverList = algos.cipher;
    clientList = init.algorithms.cs.encrypt;
  } else {
    serverList = init.algorithms.cs.encrypt;
    clientList = algos.cipher;
  }
  // Check for agreeable client->server cipher
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Client->Server cipher');
    var err = new Error('Handshake failed: no matching client->server cipher');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = instate.decrypt.type = clientList[i];
  else
    val = outstate.encrypt.type = clientList[i];
  debug('DEBUG: Client->Server Cipher: ' + val);

  debug('DEBUG: (local) Server->Client ciphers: ' + algos.cipher);
  debug('DEBUG: (remote) Server->Client ciphers: '
        + (init.algorithms.sc.encrypt));
  if (self.server) {
    serverList = algos.cipher;
    clientList = init.algorithms.sc.encrypt;
  } else {
    serverList = init.algorithms.sc.encrypt;
    clientList = algos.cipher;
  }
  // Check for agreeable server->client cipher
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Server->Client cipher');
    var err = new Error('Handshake failed: no matching server->client cipher');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = outstate.encrypt.type = clientList[i];
  else
    val = instate.decrypt.type = clientList[i];
  debug('DEBUG: Server->Client Cipher: ' + val);

  debug('DEBUG: (local) Client->Server HMAC algorithms: ' + algos.hmac);
  debug('DEBUG: (remote) Client->Server HMAC algorithms: '
        + init.algorithms.cs.mac);
  if (self.server) {
    serverList = algos.hmac;
    clientList = init.algorithms.cs.mac;
  } else {
    serverList = init.algorithms.cs.mac;
    clientList = algos.hmac;
  }
  // Check for agreeable client->server hmac algorithm
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Client->Server HMAC algorithm');
    var err = new Error('Handshake failed: no matching client->server HMAC');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = instate.hmac.type = clientList[i];
  else
    val = outstate.hmac.type = clientList[i];
  debug('DEBUG: Client->Server HMAC algorithm: ' + val);

  debug('DEBUG: (local) Server->Client HMAC algorithms: ' + algos.hmac);
  debug('DEBUG: (remote) Server->Client HMAC algorithms: '
        + init.algorithms.sc.mac);
  if (self.server) {
    serverList = algos.hmac;
    clientList = init.algorithms.sc.mac;
  } else {
    serverList = init.algorithms.sc.mac;
    clientList = algos.hmac;
  }
  // Check for agreeable server->client hmac algorithm
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Server->Client HMAC algorithm');
    var err = new Error('Handshake failed: no matching server->client HMAC');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = outstate.hmac.type = clientList[i];
  else
    val = instate.hmac.type = clientList[i];
  debug('DEBUG: Server->Client HMAC algorithm: ' + val);

  debug('DEBUG: (local) Client->Server compression algorithms: '
        + algos.compress);
  debug('DEBUG: (remote) Client->Server compression algorithms: '
        + init.algorithms.cs.compress);
  if (self.server) {
    serverList = algos.compress;
    clientList = init.algorithms.cs.compress;
  } else {
    serverList = init.algorithms.cs.compress;
    clientList = algos.compress;
  }
  // Check for agreeable client->server compression algorithm
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Client->Server compression algorithm');
    var err = new Error('Handshake failed: no matching client->server '
                        + 'compression algorithm');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = instate.decompress.type = clientList[i];
  else
    val = outstate.compress.type = clientList[i];
  debug('DEBUG: Client->Server compression algorithm: ' + val);

  debug('DEBUG: (local) Server->Client compression algorithms: '
        + algos.compress);
  debug('DEBUG: (remote) Server->Client compression algorithms: '
        + init.algorithms.sc.compress);
  if (self.server) {
    serverList = algos.compress;
    clientList = init.algorithms.sc.compress;
  } else {
    serverList = init.algorithms.sc.compress;
    clientList = algos.compress;
  }
  // Check for agreeable server->client compression algorithm
  for (i = 0, len = clientList.length;
       i < len && serverList.indexOf(clientList[i]) === -1;
       ++i);
  if (i === len) {
    // No suitable match found!
    debug('DEBUG: No matching Server->Client compression algorithm');
    var err = new Error('Handshake failed: no matching server->client '
                        + 'compression algorithm');
    err.level = 'handshake';
    self.emit('error', err);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  if (self.server)
    val = outstate.compress.type = clientList[i];
  else
    val = instate.decompress.type = clientList[i];
  debug('DEBUG: Server->Client compression algorithm: ' + val);

  state.kex = new KeyExchange(kex_algorithm);
  state.kex.generateKeys();
  outstate.pubkey = state.kex.getPublicKey();

  return true;
}

function onKEXDH_GEX_GROUP(self, prime, gen) {
  var state = self._state;
  var outstate = state.outgoing;

  state.kex.setDHParams(prime, gen);
  state.kex.generateKeys();
  outstate.pubkey = state.kex.getPublicKey();

  KEXDH_INIT(self);
}

function onKEXDH_INIT(self, e) { // Server
  KEXDH_REPLY(self, e);
}

function onKEXDH_REPLY(self, info, verifiedHost) { // Client
  var state = self._state;
  var instate = state.incoming;
  var outstate = state.outgoing;
  var debug = self.debug;
  var len;
  var i;

  if (verifiedHost === undefined) {
    instate.expectedPacket = 'NEWKEYS';
    outstate.sentNEWKEYS = false;

    debug('DEBUG: Checking host key format');
    // Ensure all host key formats agree
    var hostkey_format = readString(info.hostkey, 0, 'ascii', self);
    if (hostkey_format === false)
      return false;
    if (info.hostkey_format !== state.hostkeyFormat
        || info.hostkey_format !== hostkey_format) {
      // Expected and actual server host key format do not match!
      debug('DEBUG: Host key format mismatch');
      self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
      self.reset();
      var err = new Error('Handshake failed: host key format mismatch');
      err.level = 'handshake';
      self.emit('error', err);
      return false;
    }

    debug('DEBUG: Checking signature format');
    // Ensure signature formats agree
    var sig_format = readString(info.sig, 0, 'ascii', self);
    if (sig_format === false)
      return false;
    if (info.sig_format !== sig_format) {
      debug('DEBUG: Signature format mismatch');
      self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
      self.reset();
      var err = new Error('Handshake failed: signature format mismatch');
      err.level = 'handshake';
      self.emit('error', err);
      return false;
    }
  }

  // Verify the host fingerprint first if needed
  if (outstate.status === OUT_INIT) {
    if (verifiedHost === undefined) {
      debug('DEBUG: Verifying host fingerprint');
      var sync = true;
      var emitted = self.emit('fingerprint', info.hostkey, function(permitted) {
        // Prevent multiple calls to this callback
        if (verifiedHost !== undefined)
          return;
        verifiedHost = !!permitted;
        if (!sync) {
          // Continue execution by re-entry
          onKEXDH_REPLY(self, info, verifiedHost);
        }
      });
      sync = false;
      // Support async calling of verification callback
      if (emitted && verifiedHost === undefined)
        return;
    }
    if (verifiedHost === undefined)
      debug('DEBUG: Host accepted by default (no verification)');
    else if (verifiedHost === true)
      debug('DEBUG: Host accepted (verified)');
    else {
      debug('DEBUG: Host denied via fingerprint verification');
      self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
      self.reset();
      var err = new Error('Handshake failed: '
                          + 'host fingerprint verification failed');
      err.level = 'handshake';
      self.emit('error', err);
      return false;
    }
  }

  info.pubkey = state.kex.convertPublicKey(info.pubkey);

  info.secret = state.kex.computeSecret(info.pubkey);

  if (info.secret instanceof Error) {
    info.secret.message = 'Error while computing DH secret ('
                          + state.kex.type + '): '
                          + info.secret.message;
    info.secret.level = 'handshake';
    self.emit('error', info.secret);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  var hash = crypto.createHash(state.kex.hash);

  var len_ident = Buffer.byteLength(self.config.ident);
  var len_sident = Buffer.byteLength(instate.identRaw);
  var len_init = outstate.kexinit.length;
  var len_sinit = instate.kexinit.length;
  var len_hostkey = info.hostkey.length;
  var len_pubkey = outstate.pubkey.length;
  var len_spubkey = info.pubkey.length;
  var len_secret = info.secret.length;

  var exchangeBufLen = len_ident
                       + len_sident
                       + len_init
                       + len_sinit
                       + len_hostkey
                       + len_pubkey
                       + len_spubkey
                       + len_secret
                       + (4 * 8); // Length fields for above values

  // Group exchange-related
  var len_gex_prime;
  var len_gex_gen;
  var gex_prime;
  var gex_gen;
  var dhParams = state.kex.getDHParams();
  if (dhParams) {
    gex_prime = dhParams.prime;
    gex_gen = dhParams.generator;
    len_gex_prime = gex_prime.length;
    len_gex_gen = gex_gen.length;
    exchangeBufLen += (4 * 3); // min, n, max values
    exchangeBufLen += (4 * 2); // prime, generator length fields
    exchangeBufLen += len_gex_prime;
    exchangeBufLen += len_gex_gen;
  }

  var bp = 0;
  var exchangeBuf = Buffer.allocUnsafe(exchangeBufLen);

  writeUInt32BE(exchangeBuf, len_ident, bp);
  bp += 4;
  exchangeBuf.write(self.config.ident, bp, 'utf8'); // V_C
  bp += len_ident;

  writeUInt32BE(exchangeBuf, len_sident, bp);
  bp += 4;
  exchangeBuf.write(instate.identRaw, bp, 'utf8'); // V_S
  bp += len_sident;

  writeUInt32BE(exchangeBuf, len_init, bp);
  bp += 4;
  outstate.kexinit.copy(exchangeBuf, bp); // I_C
  bp += len_init;
  outstate.kexinit = undefined;

  writeUInt32BE(exchangeBuf, len_sinit, bp);
  bp += 4;
  instate.kexinit.copy(exchangeBuf, bp); // I_S
  bp += len_sinit;
  instate.kexinit = undefined;

  writeUInt32BE(exchangeBuf, len_hostkey, bp);
  bp += 4;
  info.hostkey.copy(exchangeBuf, bp); // K_S
  bp += len_hostkey;

  if (dhParams) {
    KEXDH_GEX_REQ_PACKET.slice(1).copy(exchangeBuf, bp); // min, n, max
    bp += (4 * 3); // Skip over bytes just copied

    writeUInt32BE(exchangeBuf, len_gex_prime, bp);
    bp += 4;
    gex_prime.copy(exchangeBuf, bp); // p
    bp += len_gex_prime;

    writeUInt32BE(exchangeBuf, len_gex_gen, bp);
    bp += 4;
    gex_gen.copy(exchangeBuf, bp); // g
    bp += len_gex_gen;
  }

  writeUInt32BE(exchangeBuf, len_pubkey, bp);
  bp += 4;
  outstate.pubkey.copy(exchangeBuf, bp); // e
  bp += len_pubkey;

  writeUInt32BE(exchangeBuf, len_spubkey, bp);
  bp += 4;
  info.pubkey.copy(exchangeBuf, bp); // f
  bp += len_spubkey;

  writeUInt32BE(exchangeBuf, len_secret, bp);
  bp += 4;
  info.secret.copy(exchangeBuf, bp); // K

  outstate.exchangeHash = hash.update(exchangeBuf).digest(); // H

  var rawsig = readString(info.sig, info.sig._pos, self); // s
  if (rawsig === false
      || !(rawsig = sigSSHToASN1(rawsig, info.sig_format, self))) {
    return false;
  }

  var hostPubKey = parseDERKey(info.hostkey, info.sig_format);
  if (hostPubKey instanceof Error)
    return false;

  debug('DEBUG: Verifying signature');

  if (hostPubKey.verify(outstate.exchangeHash, rawsig) !== true) {
    debug('DEBUG: Signature verification failed');
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    self.reset();
    var err = new Error('Handshake failed: signature verification failed');
    err.level = 'handshake';
    self.emit('error', err);
    return false;
  }

  if (outstate.sessionId === undefined)
    outstate.sessionId = outstate.exchangeHash;
  outstate.kexsecret = info.secret;

  debug('DEBUG: Outgoing: Writing NEWKEYS');
  if (outstate.status === OUT_REKEYING)
    send(self, NEWKEYS_PACKET, undefined, true);
  else
    send(self, NEWKEYS_PACKET);
  outstate.sentNEWKEYS = true;

  if (verifiedHost !== undefined && instate.expectedPacket === undefined) {
    // We received NEWKEYS while we were waiting for the fingerprint
    // verification callback to be called. In this case we have to re-execute
    // onNEWKEYS to finish the handshake.
    onNEWKEYS(self);
  }
}

function onNEWKEYS(self) { // Client/Server
  var state = self._state;
  var outstate = state.outgoing;
  var instate = state.incoming;

  instate.expectedPacket = undefined;

  if (!outstate.sentNEWKEYS)
    return;

  var len = outstate.kexsecret.length;

  var outCipherInfo = outstate.encrypt.info = CIPHER_INFO[outstate.encrypt.type];
  var p = 0;

  var dhHashAlgo = state.kex.hash;

  var secret = Buffer.allocUnsafe(4 + len);
  var iv;
  var key;

  // Whenever the client sends a new authentication request, it is enqueued
  // here.  Once the request is resolved (success, fail, or PK_OK),
  // dequeue.  Whatever is at the front of the queue determines how we
  // interpret packet type 60.
  state.authsQueue = [];

  writeUInt32BE(secret, len, p);
  p += 4;
  outstate.kexsecret.copy(secret, p);
  outstate.kexsecret = undefined;
  if (!outCipherInfo.stream) {
    iv = crypto.createHash(dhHashAlgo)
               .update(secret)
               .update(outstate.exchangeHash)
               .update(!self.server ? 'A' : 'B', 'ascii')
               .update(outstate.sessionId)
               .digest();
    while (iv.length < outCipherInfo.ivLen) {
      iv = Buffer.concat([iv,
                          crypto.createHash(dhHashAlgo)
                                .update(secret)
                                .update(outstate.exchangeHash)
                                .update(iv)
                                .digest()]);
    }
    if (iv.length > outCipherInfo.ivLen)
      iv = iv.slice(0, outCipherInfo.ivLen);
  } else {
    iv = EMPTY_BUFFER; // Streaming ciphers don't use an IV upfront
  }

  key = crypto.createHash(dhHashAlgo)
              .update(secret)
              .update(outstate.exchangeHash)
              .update(!self.server ? 'C' : 'D', 'ascii')
              .update(outstate.sessionId)
              .digest();
  while (key.length < outCipherInfo.keyLen) {
    key = Buffer.concat([key,
                         crypto.createHash(dhHashAlgo)
                               .update(secret)
                               .update(outstate.exchangeHash)
                               .update(key)
                               .digest()]);
  }
  if (key.length > outCipherInfo.keyLen)
    key = key.slice(0, outCipherInfo.keyLen);

  if (outCipherInfo.authLen > 0) {
    outstate.encrypt.iv = iv;
    outstate.encrypt.key = key;
    outstate.encrypt.instance = true;
  } else {
    var cipherAlgo = SSH_TO_OPENSSL[outstate.encrypt.type];
    outstate.encrypt.instance = crypto.createCipheriv(cipherAlgo, key, iv);
    outstate.encrypt.instance.setAutoPadding(false);
  }

  // And now for decrypting ...

  var inCipherInfo = instate.decrypt.info = CIPHER_INFO[instate.decrypt.type];
  if (!inCipherInfo.stream) {
    iv = crypto.createHash(dhHashAlgo)
               .update(secret)
               .update(outstate.exchangeHash)
               .update(!self.server ? 'B' : 'A', 'ascii')
               .update(outstate.sessionId)
               .digest();
    while (iv.length < inCipherInfo.ivLen) {
      iv = Buffer.concat([iv,
                          crypto.createHash(dhHashAlgo)
                                .update(secret)
                                .update(outstate.exchangeHash)
                                .update(iv)
                                .digest()]);
    }
    if (iv.length > inCipherInfo.ivLen)
      iv = iv.slice(0, inCipherInfo.ivLen);
  } else {
    iv = EMPTY_BUFFER; // Streaming ciphers don't use an IV upfront
  }

  // Create a reusable buffer for decryption purposes
  instate.decrypt.buf = Buffer.allocUnsafe(inCipherInfo.blockLen);

  key = crypto.createHash(dhHashAlgo)
              .update(secret)
              .update(outstate.exchangeHash)
              .update(!self.server ? 'D' : 'C', 'ascii')
              .update(outstate.sessionId)
              .digest();
  while (key.length < inCipherInfo.keyLen) {
    key = Buffer.concat([key,
                         crypto.createHash(dhHashAlgo)
                               .update(secret)
                               .update(outstate.exchangeHash)
                               .update(key)
                               .digest()]);
  }
  if (key.length > inCipherInfo.keyLen)
    key = key.slice(0, inCipherInfo.keyLen);

  var decipherAlgo = SSH_TO_OPENSSL[instate.decrypt.type];
  instate.decrypt.instance = crypto.createDecipheriv(decipherAlgo, key, iv);
  instate.decrypt.instance.setAutoPadding(false);
  instate.decrypt.iv = iv;
  instate.decrypt.key = key;

  var emptyBuf;
  if (outCipherInfo.discardLen > 0) {
    emptyBuf = Buffer.alloc(outCipherInfo.discardLen);
    outstate.encrypt.instance.update(emptyBuf);
  }
  if (inCipherInfo.discardLen > 0) {
    if (!emptyBuf || emptyBuf.length !== inCipherInfo.discardLen)
      emptyBuf = Buffer.alloc(outCipherInfo.discardLen);
    instate.decrypt.instance.update(emptyBuf);
  }

  var outHMACInfo = outstate.hmac.info = HMAC_INFO[outstate.hmac.type];
  var inHMACInfo = instate.hmac.info = HMAC_INFO[instate.hmac.type];

  if (outCipherInfo.authLen === 0) {
    key = crypto.createHash(dhHashAlgo)
                .update(secret)
                .update(outstate.exchangeHash)
                .update(!self.server ? 'E' : 'F', 'ascii')
                .update(outstate.sessionId)
                .digest();
    while (key.length < outHMACInfo.len) {
      key = Buffer.concat([key,
                           crypto.createHash(dhHashAlgo)
                                 .update(secret)
                                 .update(outstate.exchangeHash)
                                 .update(key)
                                 .digest()]);
    }
    if (key.length > outHMACInfo.len)
      key = key.slice(0, outHMACInfo.len);
    outstate.hmac.key = key;
  } else {
    outstate.hmac.key = undefined;
  }
  if (inCipherInfo.authLen === 0) {
    key = crypto.createHash(dhHashAlgo)
                .update(secret)
                .update(outstate.exchangeHash)
                .update(!self.server ? 'F' : 'E', 'ascii')
                .update(outstate.sessionId)
                .digest();
    while (key.length < inHMACInfo.len) {
      key = Buffer.concat([key,
                           crypto.createHash(dhHashAlgo)
                                 .update(secret)
                                 .update(outstate.exchangeHash)
                                 .update(key)
                                 .digest()]);
    }
    if (key.length > inHMACInfo.len)
      key = key.slice(0, inHMACInfo.len);
    instate.hmac.key = key;
  } else {
    instate.hmac.key = undefined;
  }

  // Create a reusable buffer for message verification purposes
  var inHMACSize = inCipherInfo.authLen || instate.hmac.info.actualLen;
  if (!instate.hmac.buf
      || instate.hmac.buf.length !== inHMACSize) {
    instate.hmac.buf = Buffer.allocUnsafe(inHMACSize);
  }

  outstate.exchangeHash = undefined;

  if (outstate.compress.type === 'zlib') {
    outstate.compress.instance = zlib.createDeflate(ZLIB_OPTS);
    outstate.compress.queue = [];
  } else if (outstate.compress.type === 'none') {
    outstate.compress.instance = false;
    outstate.compress.queue = null;
  }
  if (instate.decompress.type === 'zlib')
    instate.decompress.instance = zlib.createInflate(ZLIB_OPTS);
  else if (instate.decompress.type === 'none')
    instate.decompress.instance = false;

  self.bytesSent = self.bytesReceived = 0;

  if (outstate.status === OUT_REKEYING) {
    outstate.status = OUT_READY;

    // Empty our outbound buffer of any data we tried to send during the
    // re-keying process
    var queue = outstate.rekeyQueue;
    var qlen = queue.length;
    var q = 0;

    outstate.rekeyQueue = [];

    for (; q < qlen; ++q) {
      if (Buffer.isBuffer(queue[q]))
        send(self, queue[q]);
      else
        send(self, queue[q][0], queue[q][1]);
    }

    // Now empty our inbound buffer of any non-transport layer packets we
    // received during the re-keying process
    queue = instate.rekeyQueue;
    qlen = queue.length;
    q = 0;

    instate.rekeyQueue = [];

    var curSeqno = instate.seqno;
    for (; q < qlen; ++q) {
      instate.seqno = queue[q][0];
      instate.payload = queue[q][1];
      if (parsePacket(self) === false)
        return;

      if (instate.status === IN_INIT) {
        // We were reset due to some error/disagreement ?
        return;
      }
    }
    instate.seqno = curSeqno;
  } else {
    outstate.status = OUT_READY;
    if (instate.status === IN_PACKET) {
      // Explicitly update incoming packet parser status in order to get the
      // correct decipher, hmac, etc. states.

      // We only get here if the host fingerprint callback was called
      // asynchronously and the incoming packet parser is still expecting an
      // unencrypted packet, etc.

      self.debug('DEBUG: Parser: IN_PACKETBEFORE (update) (expecting '
                 + inCipherInfo.blockLen + ')');
      // Wait for the right number of bytes so we can determine the incoming
      // packet length
      expectData(self,
                 EXP_TYPE_BYTES,
                 inCipherInfo.blockLen,
                 instate.decrypt.buf);
    }
    self.emit('ready');
  }
}

function getPacketType(self, pktType) {
  var kex = self._state.kex;
  if (kex) {
    // Disambiguate
    switch (pktType) {
      case 30:
        return kex.pktInit;
      case 31:
        switch (kex.type) {
          case 'group':
            return 'KEXDH_REPLY';
          case 'groupex':
            return 'KEXDH_GEX_GROUP';
          default:
            return 'KEXECDH_REPLY';
        }
        break;
      case 33:
        if (kex.type === 'groupex')
          return 'KEXDH_GEX_REPLY';
    }
  }
  return MESSAGE[pktType];
}

function parsePacket(self, callback) {
  var instate = self._state.incoming;
  var outstate = self._state.outgoing;
  var payload = instate.payload;
  var seqno = instate.seqno;
  var serviceName;
  var lang;
  var message;
  var info;
  var chan;
  var data;
  var srcIP;
  var srcPort;
  var sender;
  var window;
  var packetSize;
  var recipient;
  var description;
  var socketPath;

  if (++instate.seqno > MAX_SEQNO)
    instate.seqno = 0;

  if (instate.ignoreNext) {
    self.debug('DEBUG: Parser: Packet ignored');
    instate.ignoreNext = false;
    return;
  }

  var type = payload[0];
  if (type === undefined)
    return false;

  // If we receive a packet during handshake that is not the expected packet
  // and it is not one of: DISCONNECT, IGNORE, UNIMPLEMENTED, or DEBUG, then we
  // close the stream
  if (outstate.status !== OUT_READY
      && getPacketType(self, type) !== instate.expectedPacket
      && type < 1
      && type > 4) {
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, expected: '
               + instate.expectedPacket
               + ' but got: '
               + getPacketType(self, type));
    // XXX: Potential issue where the module user decides to initiate a rekey
    // via KEXINIT() (which sets `expectedPacket`) after receiving a packet
    // and there is still another packet already waiting to be parsed at the
    // time the KEXINIT is written. this will cause an unexpected disconnect...
    self.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    var err = new Error('Received unexpected packet');
    err.level = 'protocol';
    self.emit('error', err);
    return false;
  }

  if (type === MESSAGE.CHANNEL_DATA) {
    /*
      byte      SSH_MSG_CHANNEL_DATA
      uint32    recipient channel
      string    data
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    // TODO: MAX_CHAN_DATA_LEN here should really be dependent upon the
    //       channel's packet size. The ssh2 module uses 32KB, so we'll hard
    //       code this for now ...
    data = readString(payload, 5, self, callback, 32768);
    if (data === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_DATA ('
               + chan
               + ')');
    self.emit('CHANNEL_DATA:' + chan, data);
  } else if (type === MESSAGE.CHANNEL_EXTENDED_DATA) {
    /*
      byte      SSH_MSG_CHANNEL_EXTENDED_DATA
      uint32    recipient channel
      uint32    data_type_code
      string    data
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    var dataType = readInt(payload, 5, self, callback);
    if (dataType === false)
      return false;
    data = readString(payload, 9, self, callback);
    if (data === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: '
               + 'CHANNEL_EXTENDED_DATA ('
               + chan
               + ')');
    self.emit('CHANNEL_EXTENDED_DATA:' + chan, dataType, data);
  } else if (type === MESSAGE.CHANNEL_WINDOW_ADJUST) {
    /*
      byte      SSH_MSG_CHANNEL_WINDOW_ADJUST
      uint32    recipient channel
      uint32    bytes to add
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    var bytesToAdd = readInt(payload, 5, self, callback);
    if (bytesToAdd === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: '
               + 'CHANNEL_WINDOW_ADJUST ('
               + chan
               + ', '
               + bytesToAdd
               + ')');
    self.emit('CHANNEL_WINDOW_ADJUST:' + chan, bytesToAdd);
  } else if (type === MESSAGE.CHANNEL_SUCCESS) {
    /*
      byte      SSH_MSG_CHANNEL_SUCCESS
      uint32    recipient channel
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_SUCCESS ('
               + chan
               + ')');
    self.emit('CHANNEL_SUCCESS:' + chan);
  } else if (type === MESSAGE.CHANNEL_FAILURE) {
    /*
      byte      SSH_MSG_CHANNEL_FAILURE
      uint32    recipient channel
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_FAILURE ('
               + chan
               + ')');
    self.emit('CHANNEL_FAILURE:' + chan);
  } else if (type === MESSAGE.CHANNEL_EOF) {
    /*
      byte      SSH_MSG_CHANNEL_EOF
      uint32    recipient channel
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_EOF ('
               + chan
               + ')');
    self.emit('CHANNEL_EOF:' + chan);
  } else if (type === MESSAGE.CHANNEL_OPEN) {
    /*
      byte      SSH_MSG_CHANNEL_OPEN
      string    channel type in US-ASCII only
      uint32    sender channel
      uint32    initial window size
      uint32    maximum packet size
      ....      channel type specific data follows
    */
    var chanType = readString(payload, 1, 'ascii', self, callback);
    if (chanType === false)
      return false;
    sender = readInt(payload, payload._pos, self, callback);
    if (sender === false)
      return false;
    window = readInt(payload, payload._pos += 4, self, callback);
    if (window === false)
      return false;
    packetSize = readInt(payload, payload._pos += 4, self, callback);
    if (packetSize === false)
      return false;
    var channel;

    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_OPEN ('
               + sender
               + ', '
               + chanType
               + ')');

    if (chanType === 'forwarded-tcpip' // Server->Client
        || chanType === 'direct-tcpip') { // Client->Server
      /*
        string    address that was connected / host to connect
        uint32    port that was connected / port to connect
        string    originator IP address
        uint32    originator port
      */
      var destIP = readString(payload,
                              payload._pos += 4,
                              'ascii',
                              self,
                              callback);
      if (destIP === false)
        return false;
      var destPort = readInt(payload, payload._pos, self, callback);
      if (destPort === false)
        return false;
      srcIP = readString(payload, payload._pos += 4, 'ascii', self, callback);
      if (srcIP === false)
        return false;
      srcPort = readInt(payload, payload._pos, self, callback);
      if (srcPort === false)
        return false;
      channel = {
        type: chanType,
        sender: sender,
        window: window,
        packetSize: packetSize,
        data: {
          destIP: destIP,
          destPort: destPort,
          srcIP: srcIP,
          srcPort: srcPort
        }
      };
    } else if (// Server->Client
               chanType === 'forwarded-streamlocal@openssh.com'
               // Client->Server
               || chanType === 'direct-streamlocal@openssh.com') {
      /*
        string    socket path
        string    reserved for future use
      */
      socketPath = readString(payload,
                              payload._pos += 4,
                              'utf8',
                              self,
                              callback);
      if (socketPath === false)
        return false;
      channel = {
        type: chanType,
        sender: sender,
        window: window,
        packetSize: packetSize,
        data: {
          socketPath: socketPath,
        }
      };
    } else if (chanType === 'x11') { // Server->Client
      /*
        string    originator address (e.g., "192.168.7.38")
        uint32    originator port
      */
      srcIP = readString(payload, payload._pos += 4, 'ascii', self, callback);
      if (srcIP === false)
        return false;
      srcPort = readInt(payload, payload._pos, self, callback);
      if (srcPort === false)
        return false;
      channel = {
        type: chanType,
        sender: sender,
        window: window,
        packetSize: packetSize,
        data: {
          srcIP: srcIP,
          srcPort: srcPort
        }
      };
    } else {
      // 'session' (Client->Server), 'auth-agent@openssh.com' (Server->Client)
      channel = {
        type: chanType,
        sender: sender,
        window: window,
        packetSize: packetSize,
        data: {}
      };
    }

    self.emit('CHANNEL_OPEN', channel);
  } else if (type === MESSAGE.CHANNEL_OPEN_CONFIRMATION) {
    /*
      byte      SSH_MSG_CHANNEL_OPEN_CONFIRMATION
      uint32    recipient channel
      uint32    sender channel
      uint32    initial window size
      uint32    maximum packet size
      ....      channel type specific data follows
    */
    // "The 'recipient channel' is the channel number given in the
    // original open request, and 'sender channel' is the channel number
    // allocated by the other side."
    recipient = readInt(payload, 1, self, callback);
    if (recipient === false)
      return false;
    sender = readInt(payload, 5, self, callback);
    if (sender === false)
      return false;
    window = readInt(payload, 9, self, callback);
    if (window === false)
      return false;
    packetSize = readInt(payload, 13, self, callback);
    if (packetSize === false)
      return false;

    info = {
      recipient: recipient,
      sender: sender,
      window: window,
      packetSize: packetSize
    };

    if (payload.length > 17)
      info.data = payload.slice(17);

    self.emit('CHANNEL_OPEN_CONFIRMATION:' + info.recipient, info);
  } else if (type === MESSAGE.CHANNEL_OPEN_FAILURE) {
    /*
      byte      SSH_MSG_CHANNEL_OPEN_FAILURE
      uint32    recipient channel
      uint32    reason code
      string    description in ISO-10646 UTF-8 encoding
      string    language tag
    */
    recipient = readInt(payload, 1, self, callback);
    if (recipient === false)
      return false;
    var reasonCode = readInt(payload, 5, self, callback);
    if (reasonCode === false)
      return false;
    description = readString(payload, 9, 'utf8', self, callback);
    if (description === false)
      return false;
    lang = readString(payload, payload._pos, 'utf8', self, callback);
    if (lang === false)
      return false;
    payload._pos = 9;
    info = {
      recipient: recipient,
      reasonCode: reasonCode,
      reason: CHANNEL_OPEN_FAILURE[reasonCode],
      description: description,
      lang: lang
    };

    self.emit('CHANNEL_OPEN_FAILURE:' + info.recipient, info);
  } else if (type === MESSAGE.CHANNEL_CLOSE) {
    /*
      byte      SSH_MSG_CHANNEL_CLOSE
      uint32    recipient channel
    */
    chan = readInt(payload, 1, self, callback);
    if (chan === false)
      return false;
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_CLOSE ('
               + chan
               + ')');
    self.emit('CHANNEL_CLOSE:' + chan);
  } else if (type === MESSAGE.IGNORE) {
    /*
      byte      SSH_MSG_IGNORE
      string    data
    */
  } else if (type === MESSAGE.DISCONNECT) {
    /*
      byte      SSH_MSG_DISCONNECT
      uint32    reason code
      string    description in ISO-10646 UTF-8 encoding
      string    language tag
    */
    var reason = readInt(payload, 1, self, callback);
    if (reason === false)
      return false;
    var reasonText = DISCONNECT_REASON[reason];
    description = readString(payload, 5, 'utf8', self, callback);
    if (description === false)
      return false;

    if (payload._pos < payload.length)
      lang = readString(payload, payload._pos, 'ascii', self, callback);

    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: DISCONNECT ('
               + reasonText
               + ')');

    self.emit('DISCONNECT', reasonText, reason, description, lang);
  } else if (type === MESSAGE.DEBUG) {
    /*
      byte      SSH_MSG_DEBUG
      boolean   always_display
      string    message in ISO-10646 UTF-8 encoding
      string    language tag
    */
    message = readString(payload, 2, 'utf8', self, callback);
    if (message === false)
      return false;
    lang = readString(payload, payload._pos, 'ascii', self, callback);
    if (lang === false)
      return false;

    self.emit('DEBUG', message, lang);
  } else if (type === MESSAGE.NEWKEYS) {
    /*
      byte      SSH_MSG_NEW_KEYS
    */
    self.emit('NEWKEYS');
  } else if (type === MESSAGE.SERVICE_REQUEST) {
    /*
      byte      SSH_MSG_SERVICE_REQUEST
      string    service name
    */
    serviceName = readString(payload, 1, 'ascii', self, callback);
    if (serviceName === false)
      return false;

    self.emit('SERVICE_REQUEST', serviceName);
  } else if (type === MESSAGE.SERVICE_ACCEPT) {
    /*
      byte      SSH_MSG_SERVICE_ACCEPT
      string    service name
    */
    serviceName = readString(payload, 1, 'ascii', self, callback);
    if (serviceName === false)
      return false;

    self.emit('SERVICE_ACCEPT', serviceName);
  } else if (type === MESSAGE.USERAUTH_REQUEST) {
    /*
      byte      SSH_MSG_USERAUTH_REQUEST
      string    user name in ISO-10646 UTF-8 encoding [RFC3629]
      string    service name in US-ASCII
      string    method name in US-ASCII
      ....      method specific fields
    */
    var username = readString(payload, 1, 'utf8', self, callback);
    if (username === false)
      return false;
    var svcName = readString(payload, payload._pos, 'ascii', self, callback);
    if (svcName === false)
      return false;
    var method = readString(payload, payload._pos, 'ascii', self, callback);
    if (method === false)
      return false;

    var methodData;
    var methodDesc;

    if (method === 'password') {
      methodData = readString(payload,
                              payload._pos + 1,
                              'utf8',
                              self,
                              callback);
      if (methodData === false)
        return false;
    } else if (method === 'publickey' || method === 'hostbased') {
      var pkSigned;
      var keyAlgo;
      var key;
      var signature;
      var blob;
      var hostname;
      var userlocal;
      if (method === 'publickey') {
        pkSigned = payload[payload._pos++];
        if (pkSigned === undefined)
          return false;
        pkSigned = (pkSigned !== 0);
      }
      keyAlgo = readString(payload, payload._pos, 'ascii', self, callback);
      if (keyAlgo === false)
        return false;
      key = readString(payload, payload._pos, self, callback);
      if (key === false)
        return false;

      if (pkSigned || method === 'hostbased') {
        if (method === 'hostbased') {
          hostname = readString(payload, payload._pos, 'ascii', self, callback);
          if (hostname === false)
            return false;
          userlocal = readString(payload, payload._pos, 'utf8', self, callback);
          if (userlocal === false)
            return false;
        }

        var blobEnd = payload._pos;
        signature = readString(payload, blobEnd, self, callback);
        if (signature === false)
          return false;

        if (signature.length > (4 + keyAlgo.length + 4)
            && signature.toString('ascii', 4, 4 + keyAlgo.length) === keyAlgo) {
          // Skip algoLen + algo + sigLen
          signature = signature.slice(4 + keyAlgo.length + 4);
        }

        signature = sigSSHToASN1(signature, keyAlgo, self, callback);
        if (signature === false)
          return false;

        blob = Buffer.allocUnsafe(4 + outstate.sessionId.length + blobEnd);
        writeUInt32BE(blob, outstate.sessionId.length, 0);
        outstate.sessionId.copy(blob, 4);
        payload.copy(blob, 4 + outstate.sessionId.length, 0, blobEnd);
      } else {
        methodDesc = 'publickey -- check';
      }

      methodData = {
        keyAlgo: keyAlgo,
        key: key,
        signature: signature,
        blob: blob,
        localHostname: hostname,
        localUsername: userlocal
      };
    } else if (method === 'keyboard-interactive') {
      // Skip language, it's deprecated
      var skipLen = readInt(payload, payload._pos, self, callback);
      if (skipLen === false)
        return false;
      methodData = readString(payload,
                              payload._pos + 4 + skipLen,
                              'utf8',
                              self,
                              callback);
      if (methodData === false)
        return false;
    } else if (method !== 'none')
      methodData = payload.slice(payload._pos);

    if (methodDesc === undefined)
      methodDesc = method;

    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: USERAUTH_REQUEST ('
               + methodDesc
               + ')');

    self._state.authsQueue.push(method);
    self.emit('USERAUTH_REQUEST', username, svcName, method, methodData);
  } else if (type === MESSAGE.USERAUTH_SUCCESS) {
    /*
      byte      SSH_MSG_USERAUTH_SUCCESS
    */
    if (outstate.compress.type === 'zlib@openssh.com') {
      outstate.compress.instance = zlib.createDeflate(ZLIB_OPTS);
      outstate.compress.queue = [];
    }
    if (instate.decompress.type === 'zlib@openssh.com')
      instate.decompress.instance = zlib.createInflate(ZLIB_OPTS);

    self._state.authsQueue.shift();

    self.emit('USERAUTH_SUCCESS');
  } else if (type === MESSAGE.USERAUTH_FAILURE) {
    /*
      byte      SSH_MSG_USERAUTH_FAILURE
      name-list    authentications that can continue
      boolean      partial success
    */
    var auths = readString(payload, 1, 'ascii', self, callback);
    if (auths === false)
      return false;
    var partSuccess = payload[payload._pos];
    if (partSuccess === undefined)
      return false;

    partSuccess = (partSuccess !== 0);
    auths = auths.split(',');

    self._state.authsQueue.shift();
    self.emit('USERAUTH_FAILURE', auths, partSuccess);
  } else if (type === MESSAGE.USERAUTH_BANNER) {
    /*
      byte      SSH_MSG_USERAUTH_BANNER
      string    message in ISO-10646 UTF-8 encoding
      string    language tag
    */
    message = readString(payload, 1, 'utf8', self, callback);
    if (message === false)
      return false;
    lang = readString(payload, payload._pos, 'utf8', self, callback);
    if (lang === false)
      return false;

    self.emit('USERAUTH_BANNER', message, lang);
  } else if (type === MESSAGE.GLOBAL_REQUEST) {
    /*
      byte      SSH_MSG_GLOBAL_REQUEST
      string    request name in US-ASCII only
      boolean   want reply
      ....      request-specific data follows
    */
    var request = readString(payload, 1, 'ascii', self, callback);
    if (request === false) {
      self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: GLOBAL_REQUEST');
      return false;
    }
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: GLOBAL_REQUEST ('
               + request
               + ')');

    var wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);

    var reqData;
    if (request === 'tcpip-forward' || request === 'cancel-tcpip-forward') {
      var bindAddr = readString(payload, payload._pos, 'ascii', self, callback);
      if (bindAddr === false)
        return false;
      var bindPort = readInt(payload, payload._pos, self, callback);
      if (bindPort === false)
        return false;
      reqData = {
        bindAddr: bindAddr,
        bindPort: bindPort
      };
    } else if (request === 'streamlocal-forward@openssh.com'
               || request === 'cancel-streamlocal-forward@openssh.com') {
      socketPath = readString(payload, payload._pos, 'utf8', self, callback);
      if (socketPath === false)
        return false;
      reqData = {
        socketPath: socketPath
      };
    } else if (request === 'no-more-sessions@openssh.com') {
      // No data
    } else {
      reqData = payload.slice(payload._pos);
    }

    self.emit('GLOBAL_REQUEST', request, wantReply, reqData);
  } else if (type === MESSAGE.REQUEST_SUCCESS) {
    /*
      byte      SSH_MSG_REQUEST_SUCCESS
      ....      response specific data
    */
    if (payload.length > 1)
      self.emit('REQUEST_SUCCESS', payload.slice(1));
    else
      self.emit('REQUEST_SUCCESS');
  } else if (type === MESSAGE.REQUEST_FAILURE) {
    /*
      byte      SSH_MSG_REQUEST_FAILURE
    */
    self.emit('REQUEST_FAILURE');
  } else if (type === MESSAGE.UNIMPLEMENTED) {
    /*
      byte      SSH_MSG_UNIMPLEMENTED
      uint32    packet sequence number of rejected message
    */
    // TODO
  } else if (type === MESSAGE.KEXINIT)
    return parse_KEXINIT(self, callback);
  else if (type === MESSAGE.CHANNEL_REQUEST)
    return parse_CHANNEL_REQUEST(self, callback);
  else if (type >= 30 && type <= 49) // Key exchange method-specific messages
    return parse_KEX(self, type, callback);
  else if (type >= 60 && type <= 70) // User auth context-specific messages
    return parse_USERAUTH(self, type, callback);
  else {
    // Unknown packet type
    var unimpl = Buffer.allocUnsafe(1 + 4);
    unimpl[0] = MESSAGE.UNIMPLEMENTED;
    writeUInt32BE(unimpl, seqno, 1);
    send(self, unimpl);
  }
}

function parse_KEXINIT(self, callback) {
  var instate = self._state.incoming;
  var payload = instate.payload;

  /*
    byte         SSH_MSG_KEXINIT
    byte[16]     cookie (random bytes)
    name-list    kex_algorithms
    name-list    server_host_key_algorithms
    name-list    encryption_algorithms_client_to_server
    name-list    encryption_algorithms_server_to_client
    name-list    mac_algorithms_client_to_server
    name-list    mac_algorithms_server_to_client
    name-list    compression_algorithms_client_to_server
    name-list    compression_algorithms_server_to_client
    name-list    languages_client_to_server
    name-list    languages_server_to_client
    boolean      first_kex_packet_follows
    uint32       0 (reserved for future extension)
  */
  var init = {
    algorithms: {
      kex: undefined,
      srvHostKey: undefined,
      cs: {
        encrypt: undefined,
        mac: undefined,
        compress: undefined
      },
      sc: {
        encrypt: undefined,
        mac: undefined,
        compress: undefined
      }
    },
    languages: {
      cs: undefined,
      sc: undefined
    }
  };
  var val;

  val = readList(payload, 17, self, callback);
  if (val === false)
    return false;
  init.algorithms.kex = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.srvHostKey = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.cs.encrypt = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.sc.encrypt = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.cs.mac = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.sc.mac = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.cs.compress = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.algorithms.sc.compress = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.languages.cs = val;
  val = readList(payload, payload._pos, self, callback);
  if (val === false)
    return false;
  init.languages.sc = val;

  var firstFollows = (payload._pos < payload.length
                      && payload[payload._pos] === 1);

  instate.kexinit = payload;

  self.emit('KEXINIT', init, firstFollows);
}

function parse_KEX(self, type, callback) {
  var state = self._state;
  var instate = state.incoming;
  var payload = instate.payload;

  if (state.outgoing.status === OUT_READY
      || getPacketType(self, type) !== instate.expectedPacket) {
    self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, expected: '
               + instate.expectedPacket
               + ' but got: '
               + getPacketType(self, type));
    self.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    var err = new Error('Received unexpected packet');
    err.level = 'protocol';
    self.emit('error', err);
    return false;
  }

  if (state.kex.type === 'groupex') {
    // Dynamic group exchange-related

    if (self.server) {
      // TODO: Support group exchange server-side
      self.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
      var err = new Error('DH group exchange not supported by server');
      err.level = 'handshake';
      self.emit('error', err);
      return false;
    } else {
      if (type === MESSAGE.KEXDH_GEX_GROUP) {
        /*
          byte    SSH_MSG_KEX_DH_GEX_GROUP
          mpint   p, safe prime
          mpint   g, generator for subgroup in GF(p)
        */
        var prime = readString(payload, 1, self, callback);
        if (prime === false)
          return false;
        var gen = readString(payload, payload._pos, self, callback);
        if (gen === false)
          return false;
        self.emit('KEXDH_GEX_GROUP', prime, gen);
      } else if (type === MESSAGE.KEXDH_GEX_REPLY)
        return parse_KEXDH_REPLY(self, callback);
    }
  } else {
    // Static group or ECDH-related

    if (type === MESSAGE.KEXDH_INIT) {
      /*
        byte      SSH_MSG_KEXDH_INIT
        mpint     e
      */
      var e = readString(payload, 1, self, callback);
      if (e === false)
        return false;

      self.emit('KEXDH_INIT', e);
    } else if (type === MESSAGE.KEXDH_REPLY)
      return parse_KEXDH_REPLY(self, callback);
  }
}

function parse_KEXDH_REPLY(self, callback) {
  var payload = self._state.incoming.payload;
  /*
    byte      SSH_MSG_KEXDH_REPLY
                / SSH_MSG_KEX_DH_GEX_REPLY
                / SSH_MSG_KEX_ECDH_REPLY
    string    server public host key and certificates (K_S)
    mpint     f
    string    signature of H
  */
  var hostkey = readString(payload, 1, self, callback);
  if (hostkey === false)
    return false;
  var pubkey = readString(payload, payload._pos, self, callback);
  if (pubkey === false)
    return false;
  var sig = readString(payload, payload._pos, self, callback);
  if (sig === false)
    return false;
  var info = {
    hostkey: hostkey,
    hostkey_format: undefined,
    pubkey: pubkey,
    sig: sig,
    sig_format: undefined
  };
  var hostkey_format = readString(hostkey, 0, 'ascii', self, callback);
  if (hostkey_format === false)
    return false;
  info.hostkey_format = hostkey_format;
  var sig_format = readString(sig, 0, 'ascii', self, callback);
  if (sig_format === false)
    return false;
  info.sig_format = sig_format;
  self.emit('KEXDH_REPLY', info);
}

function parse_USERAUTH(self, type, callback) {
  var state = self._state;
  var authMethod = state.authsQueue[0];
  var payload = state.incoming.payload;
  var message;
  var lang;
  var text;

  if (authMethod === 'password') {
    if (type === MESSAGE.USERAUTH_PASSWD_CHANGEREQ) {
      /*
        byte      SSH_MSG_USERAUTH_PASSWD_CHANGEREQ
        string    prompt in ISO-10646 UTF-8 encoding
        string    language tag
      */
      message = readString(payload, 1, 'utf8', self, callback);
      if (message === false)
        return false;
      lang = readString(payload, payload._pos, 'utf8', self, callback);
      if (lang === false)
        return false;
      self.emit('USERAUTH_PASSWD_CHANGEREQ', message, lang);
    }
  } else if (authMethod === 'keyboard-interactive') {
    if (type === MESSAGE.USERAUTH_INFO_REQUEST) {
      /*
        byte      SSH_MSG_USERAUTH_INFO_REQUEST
        string    name (ISO-10646 UTF-8)
        string    instruction (ISO-10646 UTF-8)
        string    language tag -- MAY be empty
        int       num-prompts
        string    prompt[1] (ISO-10646 UTF-8)
        boolean   echo[1]
        ...
        string    prompt[num-prompts] (ISO-10646 UTF-8)
        boolean   echo[num-prompts]
      */
      var name;
      var instr;
      var nprompts;

      name = readString(payload, 1, 'utf8', self, callback);
      if (name === false)
        return false;
      instr = readString(payload, payload._pos, 'utf8', self, callback);
      if (instr === false)
        return false;
      lang = readString(payload, payload._pos, 'utf8', self, callback);
      if (lang === false)
        return false;
      nprompts = readInt(payload, payload._pos, self, callback);
      if (nprompts === false)
        return false;

      payload._pos += 4;

      var prompts = [];
      for (var prompt = 0; prompt < nprompts; ++prompt) {
        text = readString(payload, payload._pos, 'utf8', self, callback);
        if (text === false)
          return false;
        var echo = payload[payload._pos++];
        if (echo === undefined)
          return false;
        echo = (echo !== 0);
        prompts.push({
          prompt: text,
          echo: echo
        });
      }
      self.emit('USERAUTH_INFO_REQUEST', name, instr, lang, prompts);
    } else if (type === MESSAGE.USERAUTH_INFO_RESPONSE) {
      /*
        byte      SSH_MSG_USERAUTH_INFO_RESPONSE
        int       num-responses
        string    response[1] (ISO-10646 UTF-8)
        ...
        string    response[num-responses] (ISO-10646 UTF-8)
      */
      var nresponses = readInt(payload, 1, self, callback);
      if (nresponses === false)
        return false;

      payload._pos = 5;

      var responses = [];
      for (var response = 0; response < nresponses; ++response) {
        text = readString(payload, payload._pos, 'utf8', self, callback);
        if (text === false)
          return false;
        responses.push(text);
      }
      self.emit('USERAUTH_INFO_RESPONSE', responses);
    }
  } else if (authMethod === 'publickey') {
    if (type === MESSAGE.USERAUTH_PK_OK) {
      /*
        byte      SSH_MSG_USERAUTH_PK_OK
        string    public key algorithm name from the request
        string    public key blob from the request
      */
      var authsQueue = self._state.authsQueue;
      if (!authsQueue.length || authsQueue[0] !== 'publickey')
        return;
      authsQueue.shift();
      self.emit('USERAUTH_PK_OK');
      // XXX: Parse public key info? client currently can ignore it because
      // there is only one outstanding auth request at any given time, so it
      // knows which key was OK'd
    }
  } else if (authMethod !== undefined) {
    // Invalid packet for this auth type
    self.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    var err = new Error('Invalid authentication method: ' + authMethod);
    err.level = 'protocol';
    self.emit('error', err);
  }
}

function parse_CHANNEL_REQUEST(self, callback) {
  var payload = self._state.incoming.payload;
  var info;
  var cols;
  var rows;
  var width;
  var height;
  var wantReply;
  var signal;

  var recipient = readInt(payload, 1, self, callback);
  if (recipient === false)
    return false;
  var request = readString(payload, 5, 'ascii', self, callback);
  if (request === false)
    return false;

  if (request === 'exit-status') { // Server->Client
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "exit-status"
      boolean   FALSE
      uint32    exit_status
    */
    var code = readInt(payload, ++payload._pos, self, callback);
    if (code === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: false,
      code: code
    };
  } else if (request === 'exit-signal') { // Server->Client
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "exit-signal"
      boolean   FALSE
      string    signal name (without the "SIG" prefix)
      boolean   core dumped
      string    error message in ISO-10646 UTF-8 encoding
      string    language tag
    */
    var coredump;
    if (!(self.remoteBugs & BUGS.OLD_EXIT)) {
      signal = readString(payload, ++payload._pos, 'ascii', self, callback);
      if (signal === false)
        return false;
      coredump = payload[payload._pos++];
      if (coredump === undefined)
        return false;
      coredump = (coredump !== 0);
    } else {
      /*
        Instead of `signal name` and `core dumped`, we have just:

        uint32  signal number
      */
      signal = readInt(payload, ++payload._pos, self, callback);
      if (signal === false)
        return false;
      switch (signal) {
        case 1:
          signal = 'HUP';
          break;
        case 2:
          signal = 'INT';
          break;
        case 3:
          signal = 'QUIT';
          break;
        case 6:
          signal = 'ABRT';
          break;
        case 9:
          signal = 'KILL';
          break;
        case 14:
          signal = 'ALRM';
          break;
        case 15:
          signal = 'TERM';
          break;
        default:
          // Unknown or OS-specific
          signal = 'UNKNOWN (' + signal + ')';
      }
      coredump = false;
    }
    var description = readString(payload, payload._pos, 'utf8', self,
                                 callback);
    if (description === false)
      return false;
    var lang = readString(payload, payload._pos, 'utf8', self, callback);
    if (lang === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: false,
      signal: signal,
      coredump: coredump,
      description: description,
      lang: lang
    };
  } else if (request === 'pty-req') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "pty-req"
      boolean   want_reply
      string    TERM environment variable value (e.g., vt100)
      uint32    terminal width, characters (e.g., 80)
      uint32    terminal height, rows (e.g., 24)
      uint32    terminal width, pixels (e.g., 640)
      uint32    terminal height, pixels (e.g., 480)
      string    encoded terminal modes
    */
    wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    var term = readString(payload, payload._pos, 'ascii', self, callback);
    if (term === false)
      return false;
    cols = readInt(payload, payload._pos, self, callback);
    if (cols === false)
      return false;
    rows = readInt(payload, payload._pos += 4, self, callback);
    if (rows === false)
      return false;
    width = readInt(payload, payload._pos += 4, self, callback);
    if (width === false)
      return false;
    height = readInt(payload, payload._pos += 4, self, callback);
    if (height === false)
      return false;
    var modes = readString(payload, payload._pos += 4, self, callback);
    if (modes === false)
      return false;
    modes = bytesToModes(modes);
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply,
      term: term,
      cols: cols,
      rows: rows,
      width: width,
      height: height,
      modes: modes
    };
  } else if (request === 'window-change') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "window-change"
      boolean   FALSE
      uint32    terminal width, columns
      uint32    terminal height, rows
      uint32    terminal width, pixels
      uint32    terminal height, pixels
    */
    cols = readInt(payload, ++payload._pos, self, callback);
    if (cols === false)
      return false;
    rows = readInt(payload, payload._pos += 4, self, callback);
    if (rows === false)
      return false;
    width = readInt(payload, payload._pos += 4, self, callback);
    if (width === false)
      return false;
    height = readInt(payload, payload._pos += 4, self, callback);
    if (height === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: false,
      cols: cols,
      rows: rows,
      width: width,
      height: height
    };
  } else if (request === 'x11-req') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "x11-req"
      boolean   want reply
      boolean   single connection
      string    x11 authentication protocol
      string    x11 authentication cookie
      uint32    x11 screen number
    */
    wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    var single = payload[payload._pos++];
    if (single === undefined)
      return false;
    single = (single !== 0);
    var protocol = readString(payload, payload._pos, 'ascii', self, callback);
    if (protocol === false)
      return false;
    var cookie = readString(payload, payload._pos, 'binary', self, callback);
    if (cookie === false)
      return false;
    var screen = readInt(payload, payload._pos, self, callback);
    if (screen === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply,
      single: single,
      protocol: protocol,
      cookie: cookie,
      screen: screen
    };
  } else if (request === 'env') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "env"
      boolean   want reply
      string    variable name
      string    variable value
    */
    wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    var key = readString(payload, payload._pos, 'utf8', self, callback);
    if (key === false)
      return false;
    var val = readString(payload, payload._pos, 'utf8', self, callback);
    if (val === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply,
      key: key,
      val: val
    };
  } else if (request === 'shell') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "shell"
      boolean   want reply
    */
    wantReply = payload[payload._pos];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply
    };
  } else if (request === 'exec') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "exec"
      boolean   want reply
      string    command
    */
    wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    var command = readString(payload, payload._pos, 'utf8', self, callback);
    if (command === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply,
      command: command
    };
  } else if (request === 'subsystem') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "subsystem"
      boolean   want reply
      string    subsystem name
    */
    wantReply = payload[payload._pos++];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    var subsystem = readString(payload, payload._pos, 'utf8', self, callback);
    if (subsystem === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply,
      subsystem: subsystem
    };
  } else if (request === 'signal') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "signal"
      boolean   FALSE
      string    signal name (without the "SIG" prefix)
    */
    signal = readString(payload, ++payload._pos, 'ascii', self, callback);
    if (signal === false)
      return false;
    info = {
      recipient: recipient,
      request: request,
      wantReply: false,
      signal: 'SIG' + signal
    };
  } else if (request === 'xon-xoff') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "xon-xoff"
      boolean   FALSE
      boolean   client can do
    */
    var clientControl = payload[++payload._pos];
    if (clientControl === undefined)
      return false;
    clientControl = (clientControl !== 0);
    info = {
      recipient: recipient,
      request: request,
      wantReply: false,
      clientControl: clientControl
    };
  } else if (request === 'auth-agent-req@openssh.com') { // Client->Server
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "auth-agent-req@openssh.com"
      boolean   want reply
    */
    wantReply = payload[payload._pos];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply
    };
  } else {
    // Unknown request type
    wantReply = payload[payload._pos];
    if (wantReply === undefined)
      return false;
    wantReply = (wantReply !== 0);
    info = {
      recipient: recipient,
      request: request,
      wantReply: wantReply
    };
  }
  self.debug('DEBUG: Parser: IN_PACKETDATAAFTER, packet: CHANNEL_REQUEST ('
             + recipient
             + ', '
             + request
             + ')');
  self.emit('CHANNEL_REQUEST:' + recipient, info);
}

function hmacVerify(self, data) {
  var instate = self._state.incoming;
  var hmac = instate.hmac;

  self.debug('DEBUG: Parser: Verifying MAC');

  if (instate.decrypt.info.authLen > 0) {
    var decrypt = instate.decrypt;
    var instance = decrypt.instance;

    instance.setAuthTag(data);

    var payload = instance.update(instate.packet);
    instate.payload = payload.slice(1, instate.packet.length - payload[0]);
    iv_inc(decrypt.iv);

    decrypt.instance = crypto.createDecipheriv(
                         SSH_TO_OPENSSL[decrypt.type],
                         decrypt.key,
                         decrypt.iv
                       );
    decrypt.instance.setAutoPadding(false);
    return true;
  } else {
    var calcHmac = crypto.createHmac(SSH_TO_OPENSSL[hmac.type], hmac.key);

    writeUInt32BE(HMAC_COMPUTE, instate.seqno, 0);
    writeUInt32BE(HMAC_COMPUTE, instate.pktLen, 4);
    HMAC_COMPUTE[8] = instate.padLen;

    calcHmac.update(HMAC_COMPUTE);
    calcHmac.update(instate.packet);

    var mac = calcHmac.digest();
    if (mac.length > instate.hmac.info.actualLen)
      mac = mac.slice(0, instate.hmac.info.actualLen);
    return timingSafeEqual(mac, data);
  }
}

function decryptData(self, data) {
  var instance = self._state.incoming.decrypt.instance;
  self.debug('DEBUG: Parser: Decrypting');
  return instance.update(data);
}

function expectData(self, type, amount, buffer) {
  var expect = self._state.incoming.expect;
  expect.amount = amount;
  expect.type = type;
  expect.ptr = 0;
  if (buffer)
    expect.buf = buffer;
  else if (amount)
    expect.buf = Buffer.allocUnsafe(amount);
}

function readList(buffer, start, stream, callback) {
  var list = readString(buffer, start, 'ascii', stream, callback);
  return (list !== false ? (list.length ? list.split(',') : []) : false);
}

function bytesToModes(buffer) {
  var modes = {};

  for (var i = 0, len = buffer.length, opcode; i < len; i += 5) {
    opcode = buffer[i];
    if (opcode === TERMINAL_MODE.TTY_OP_END
        || TERMINAL_MODE[opcode] === undefined
        || i + 5 > len)
      break;
    modes[TERMINAL_MODE[opcode]] = readUInt32BE(buffer, i + 1);
  }

  return modes;
}

function modesToBytes(modes) {
  var RE_IS_NUM = /^\d+$/;
  var keys = Object.keys(modes);
  var b = 0;
  var bytes = [];

  for (var i = 0, len = keys.length, key, opcode, val; i < len; ++i) {
    key = keys[i];
    opcode = TERMINAL_MODE[key];
    if (opcode
        && !RE_IS_NUM.test(key)
        && typeof modes[key] === 'number'
        && key !== 'TTY_OP_END') {
      val = modes[key];
      bytes[b++] = opcode;
      bytes[b++] = (val >>> 24) & 0xFF;
      bytes[b++] = (val >>> 16) & 0xFF;
      bytes[b++] = (val >>> 8) & 0xFF;
      bytes[b++] = val & 0xFF;
    }
  }

  bytes[b] = TERMINAL_MODE.TTY_OP_END;

  return bytes;
}

// Shared outgoing functions
function KEXINIT(self, cb) { // Client/Server
  randBytes(16, function(myCookie) {
    /*
      byte         SSH_MSG_KEXINIT
      byte[16]     cookie (random bytes)
      name-list    kex_algorithms
      name-list    server_host_key_algorithms
      name-list    encryption_algorithms_client_to_server
      name-list    encryption_algorithms_server_to_client
      name-list    mac_algorithms_client_to_server
      name-list    mac_algorithms_server_to_client
      name-list    compression_algorithms_client_to_server
      name-list    compression_algorithms_server_to_client
      name-list    languages_client_to_server
      name-list    languages_server_to_client
      boolean      first_kex_packet_follows
      uint32       0 (reserved for future extension)
    */
    var algos = self.config.algorithms;

    var kexBuf = algos.kexBuf;
    if (self.remoteBugs & BUGS.BAD_DHGEX) {
      var copied = false;
      var kexList = algos.kex;
      for (var j = kexList.length - 1; j >= 0; --j) {
        if (kexList[j].indexOf('group-exchange') !== -1) {
          if (!copied) {
            kexList = kexList.slice();
            copied = true;
          }
          kexList.splice(j, 1);
        }
      }
      if (copied)
        kexBuf = Buffer.from(kexList.join(','));
    }

    var hostKeyBuf = algos.serverHostKeyBuf;

    var kexInitSize = 1 + 16
                      + 4 + kexBuf.length
                      + 4 + hostKeyBuf.length
                      + (2 * (4 + algos.cipherBuf.length))
                      + (2 * (4 + algos.hmacBuf.length))
                      + (2 * (4 + algos.compressBuf.length))
                      + (2 * (4 /* languages skipped */))
                      + 1 + 4;
    var buf = Buffer.allocUnsafe(kexInitSize);
    var p = 17;

    buf[0] = MESSAGE.KEXINIT;

    if (myCookie !== false)
      myCookie.copy(buf, 1);

    writeUInt32BE(buf, kexBuf.length, p);
    p += 4;
    kexBuf.copy(buf, p);
    p += kexBuf.length;

    writeUInt32BE(buf, hostKeyBuf.length, p);
    p += 4;
    hostKeyBuf.copy(buf, p);
    p += hostKeyBuf.length;

    writeUInt32BE(buf, algos.cipherBuf.length, p);
    p += 4;
    algos.cipherBuf.copy(buf, p);
    p += algos.cipherBuf.length;

    writeUInt32BE(buf, algos.cipherBuf.length, p);
    p += 4;
    algos.cipherBuf.copy(buf, p);
    p += algos.cipherBuf.length;

    writeUInt32BE(buf, algos.hmacBuf.length, p);
    p += 4;
    algos.hmacBuf.copy(buf, p);
    p += algos.hmacBuf.length;

    writeUInt32BE(buf, algos.hmacBuf.length, p);
    p += 4;
    algos.hmacBuf.copy(buf, p);
    p += algos.hmacBuf.length;

    writeUInt32BE(buf, algos.compressBuf.length, p);
    p += 4;
    algos.compressBuf.copy(buf, p);
    p += algos.compressBuf.length;

    writeUInt32BE(buf, algos.compressBuf.length, p);
    p += 4;
    algos.compressBuf.copy(buf, p);
    p += algos.compressBuf.length;

    // Skip language lists, first_kex_packet_follows, and reserved bytes
    buf.fill(0, buf.length - 13);

    self.debug('DEBUG: Outgoing: Writing KEXINIT');

    self._state.incoming.expectedPacket = 'KEXINIT';

    var outstate = self._state.outgoing;

    outstate.kexinit = buf;

    if (outstate.status === OUT_READY) {
      // We are the one starting the rekeying process ...
      outstate.status = OUT_REKEYING;
    }

    send(self, buf, cb, true);
  });
  return true;
}

function KEXDH_INIT(self) { // Client
  var state = self._state;
  var outstate = state.outgoing;
  var buf = Buffer.allocUnsafe(1 + 4 + outstate.pubkey.length);

  state.incoming.expectedPacket = state.kex.pktReply;
  if (state.kex.type === 'groupex') {
    buf[0] = MESSAGE.KEXDH_GEX_INIT;
    self.debug('DEBUG: Outgoing: Writing KEXDH_GEX_INIT');
  } else {
    buf[0] = MESSAGE.KEXDH_INIT;
    if (state.kex.type === 'group')
      self.debug('DEBUG: Outgoing: Writing KEXDH_INIT');
    else
      self.debug('DEBUG: Outgoing: Writing KEXECDH_INIT');
  }

  writeUInt32BE(buf, outstate.pubkey.length, 1);
  outstate.pubkey.copy(buf, 5);

  return send(self, buf, undefined, true);
}

function KEXDH_REPLY(self, e) { // Server
  var state = self._state;
  var outstate = state.outgoing;
  var instate = state.incoming;
  var curHostKey = self.config.hostKeys[state.hostkeyFormat];
  if (Array.isArray(curHostKey))
    curHostKey = curHostKey[0];
  var hostkey = curHostKey.getPublicSSH();
  var hostkeyAlgo = curHostKey.type;

  // e === client DH public key

  e = state.kex.convertPublicKey(e);

  var secret = state.kex.computeSecret(e);

  if (secret instanceof Error) {
    secret.message = 'Error while computing DH secret ('
                     + state.kex.type + '): '
                     + secret.message;
    secret.level = 'handshake';
    self.emit('error', secret);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  var hash = crypto.createHash(state.kex.hash);

  var len_ident = Buffer.byteLength(instate.identRaw);
  var len_sident = Buffer.byteLength(self.config.ident);
  var len_init = instate.kexinit.length;
  var len_sinit = outstate.kexinit.length;
  var len_hostkey = hostkey.length;
  var len_pubkey = e.length;
  var len_spubkey = outstate.pubkey.length;
  var len_secret = secret.length;

  var exchangeBufLen = len_ident
                       + len_sident
                       + len_init
                       + len_sinit
                       + len_hostkey
                       + len_pubkey
                       + len_spubkey
                       + len_secret
                       + (4 * 8); // Length fields for above values

  // Group exchange-related
  var len_gex_prime;
  var len_gex_gen;
  var gex_prime;
  var gex_gen;
  var dhParams = state.kex.getDHParams();
  if (dhParams) {
    gex_prime = dhParams.prime;
    gex_gen = dhParams.generator;
    len_gex_prime = gex_prime.length;
    len_gex_gen = gex_gen.length;
    exchangeBufLen += (4 * 3); // min, n, max values
    exchangeBufLen += (4 * 2); // prime, generator length fields
    exchangeBufLen += len_gex_prime;
    exchangeBufLen += len_gex_gen;
  }

  var bp = 0;
  var exchangeBuf = Buffer.allocUnsafe(exchangeBufLen);

  writeUInt32BE(exchangeBuf, len_ident, bp);
  bp += 4;
  exchangeBuf.write(instate.identRaw, bp, 'utf8'); // V_C
  bp += len_ident;

  writeUInt32BE(exchangeBuf, len_sident, bp);
  bp += 4;
  exchangeBuf.write(self.config.ident, bp, 'utf8'); // V_S
  bp += len_sident;

  writeUInt32BE(exchangeBuf, len_init, bp);
  bp += 4;
  instate.kexinit.copy(exchangeBuf, bp); // I_C
  bp += len_init;
  instate.kexinit = undefined;

  writeUInt32BE(exchangeBuf, len_sinit, bp);
  bp += 4;
  outstate.kexinit.copy(exchangeBuf, bp); // I_S
  bp += len_sinit;
  outstate.kexinit = undefined;

  writeUInt32BE(exchangeBuf, len_hostkey, bp);
  bp += 4;
  hostkey.copy(exchangeBuf, bp); // K_S
  bp += len_hostkey;

  if (dhParams) {
    KEXDH_GEX_REQ_PACKET.slice(1).copy(exchangeBuf, bp); // min, n, max
    bp += (4 * 3); // Skip over bytes just copied

    writeUInt32BE(exchangeBuf, len_gex_prime, bp);
    bp += 4;
    gex_prime.copy(exchangeBuf, bp); // p
    bp += len_gex_prime;

    writeUInt32BE(exchangeBuf, len_gex_gen, bp);
    bp += 4;
    gex_gen.copy(exchangeBuf, bp); // g
    bp += len_gex_gen;
  }

  writeUInt32BE(exchangeBuf, len_pubkey, bp);
  bp += 4;
  e.copy(exchangeBuf, bp); // e
  bp += len_pubkey;

  writeUInt32BE(exchangeBuf, len_spubkey, bp);
  bp += 4;
  outstate.pubkey.copy(exchangeBuf, bp); // f
  bp += len_spubkey;

  writeUInt32BE(exchangeBuf, len_secret, bp);
  bp += 4;
  secret.copy(exchangeBuf, bp); // K

  outstate.exchangeHash = hash.update(exchangeBuf).digest(); // H

  if (outstate.sessionId === undefined)
    outstate.sessionId = outstate.exchangeHash;
  outstate.kexsecret = secret;

  var signature = curHostKey.sign(outstate.exchangeHash);
  if (signature instanceof Error) {
    signature.message = 'Error while signing data with host key ('
                        + hostkeyAlgo + '): '
                        + signature.message;
    signature.level = 'handshake';
    self.emit('error', signature);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  signature = convertSignature(signature, hostkeyAlgo);
  if (signature === false) {
    signature.message = 'Error while converting handshake signature';
    signature.level = 'handshake';
    self.emit('error', signature);
    self.disconnect(DISCONNECT_REASON.KEY_EXCHANGE_FAILED);
    return false;
  }

  /*
    byte      SSH_MSG_KEXDH_REPLY
    string    server public host key and certificates (K_S)
    mpint     f
    string    signature of H
  */

  var siglen = 4 + hostkeyAlgo.length + 4 + signature.length;
  var buf = Buffer.allocUnsafe(1
                               + 4 + len_hostkey
                               + 4 + len_spubkey
                               + 4 + siglen);

  bp = 0;
  buf[bp] = MESSAGE[state.kex.pktReply];
  ++bp;

  writeUInt32BE(buf, len_hostkey, bp);
  bp += 4;
  hostkey.copy(buf, bp); // K_S
  bp += len_hostkey;

  writeUInt32BE(buf, len_spubkey, bp);
  bp += 4;
  outstate.pubkey.copy(buf, bp); // f
  bp += len_spubkey;

  writeUInt32BE(buf, siglen, bp);
  bp += 4;
  writeUInt32BE(buf, hostkeyAlgo.length, bp);
  bp += 4;
  buf.write(hostkeyAlgo, bp, hostkeyAlgo.length, 'ascii');
  bp += hostkeyAlgo.length;
  writeUInt32BE(buf, signature.length, bp);
  bp += 4;
  signature.copy(buf, bp);

  state.incoming.expectedPacket = 'NEWKEYS';

  self.debug('DEBUG: Outgoing: Writing ' + state.kex.pktReply);
  send(self, buf, undefined, true);

  outstate.sentNEWKEYS = true;
  self.debug('DEBUG: Outgoing: Writing NEWKEYS');
  return send(self, NEWKEYS_PACKET, undefined, true);
}

function KEXDH_GEX_REQ(self) { // Client
  self._state.incoming.expectedPacket = 'KEXDH_GEX_GROUP';

  self.debug('DEBUG: Outgoing: Writing KEXDH_GEX_REQUEST');
  return send(self, KEXDH_GEX_REQ_PACKET, undefined, true);
}

function compressPayload(self, payload, cb) {
  var compress = self._state.outgoing.compress.instance;
  compress.write(payload);
  compress.flush(Z_PARTIAL_FLUSH, compressFlushCb.bind(self, cb));
}

function compressFlushCb(cb) {
  if (this._readableState.ended || this._writableState.ended)
    return;
  send_(this, this._state.outgoing.compress.instance.read(), cb);

  var queue = this._state.outgoing.compress.queue;
  queue.shift();
  if (queue.length > 0)
    compressPayload(this, queue[0][0], queue[0][1]);
}

function send(self, payload, cb, bypass) {
  var state = self._state;

  if (!state)
    return false;

  var outstate = state.outgoing;
  if (outstate.status === OUT_REKEYING && !bypass) {
    if (typeof cb === 'function')
      outstate.rekeyQueue.push([payload, cb]);
    else
      outstate.rekeyQueue.push(payload);
    return false;
  } else if (self._readableState.ended || self._writableState.ended) {
    return false;
  }

  if (outstate.compress.instance) {
    // This queue nonsense only exists because of a change made in node v10.12.0
    // that changed flushing behavior, which now coalesces multiple writes to a
    // single flush, which does not work for us.
    var queue = outstate.compress.queue;
    queue.push([payload, cb]);
    if (queue.length === 1)
      compressPayload(self, queue[0][0], queue[0][1]);
    return true;
  } else {
    return send_(self, payload, cb);
  }
}

function send_(self, payload, cb) {
  // TODO: Implement length checks

  var state = self._state;
  var outstate = state.outgoing;
  var encrypt = outstate.encrypt;
  var hmac = outstate.hmac;
  var pktLen;
  var padLen;
  var buf;
  var mac;
  var ret;

  pktLen = payload.length + 9;

  if (encrypt.instance !== false) {
    if (encrypt.info.authLen > 0) {
      var ptlen = 1 + payload.length + 4/* Must have at least 4 bytes padding*/;
      while ((ptlen % encrypt.info.blockLen) !== 0)
        ++ptlen;
      padLen = ptlen - 1 - payload.length;
      pktLen = 4 + ptlen;
    } else {
      var blockLen = encrypt.info.blockLen;
      pktLen += ((blockLen - 1) * pktLen) % blockLen;
      padLen = pktLen - payload.length - 5;
    }
  } else {
    pktLen += (7 * pktLen) % 8;
    padLen = pktLen - payload.length - 5;
  }

  buf = Buffer.allocUnsafe(pktLen);

  writeUInt32BE(buf, pktLen - 4, 0);
  buf[4] = padLen;
  payload.copy(buf, 5);

  copyRandPadBytes(buf, 5 + payload.length, padLen);

  if (hmac.type !== false && hmac.key) {
    mac = crypto.createHmac(SSH_TO_OPENSSL[hmac.type], hmac.key);
    writeUInt32BE(outstate.bufSeqno, outstate.seqno, 0);
    mac.update(outstate.bufSeqno);
    mac.update(buf);
    mac = mac.digest();
    if (mac.length > hmac.info.actualLen)
      mac = mac.slice(0, hmac.info.actualLen);
  }

  var nb = 0;
  var encData;

  if (encrypt.instance !== false) {
    if (encrypt.info.authLen > 0) {
      var encrypter = crypto.createCipheriv(SSH_TO_OPENSSL[encrypt.type],
                                            encrypt.key,
                                            encrypt.iv);
      encrypter.setAutoPadding(false);

      var lenbuf = buf.slice(0, 4);

      encrypter.setAAD(lenbuf);
      self.push(lenbuf);
      nb += lenbuf;

      encData = encrypter.update(buf.slice(4));
      self.push(encData);
      nb += encData.length;

      var final = encrypter.final();
      if (final.length) {
        self.push(final);
        nb += final.length;
      }

      var authTag = encrypter.getAuthTag();
      ret = self.push(authTag);
      nb += authTag.length;

      iv_inc(encrypt.iv);
    } else {
      encData = encrypt.instance.update(buf);
      self.push(encData);
      nb += encData.length;

      ret = self.push(mac);
      nb += mac.length;
    }
  } else {
    ret = self.push(buf);
    nb = buf.length;
  }

  self.bytesSent += nb;

  if (++outstate.seqno > MAX_SEQNO)
    outstate.seqno = 0;

  cb && cb();

  return ret;
}

var copyRandPadBytes = (function() {
  if (typeof crypto.randomFillSync === 'function') {
    return crypto.randomFillSync;
  } else {
    return function copyRandPadBytes(buf, offset, count) {
      var padBytes = crypto.randomBytes(count);
      padBytes.copy(buf, offset);
    };
  }
})();

function randBytes(n, cb) {
  crypto.randomBytes(n, function retry(err, buf) {
    if (err)
      return crypto.randomBytes(n, retry);
    cb && cb(buf);
  });
}

function convertSignature(signature, keyType) {
  switch (keyType) {
    case 'ssh-dss':
      return DSASigBERToBare(signature);
    case 'ecdsa-sha2-nistp256':
    case 'ecdsa-sha2-nistp384':
    case 'ecdsa-sha2-nistp521':
      return ECDSASigASN1ToSSH(signature);
  }

  return signature;
}

var timingSafeEqual = (function() {
  if (typeof crypto.timingSafeEqual === 'function') {
    return function timingSafeEquals(a, b) {
      if (a.length !== b.length) {
        crypto.timingSafeEqual(a, a);
        return false;
      } else {
        return crypto.timingSafeEqual(a, b);
      }
    };
  } else {
    return function timingSafeEquals(a, b) {
      var val;
      if (a.length === b.length) {
        val = 0;
      } else {
        val = 1;
        b = a;
      }

      for (var i = 0, len = a.length; i < len; ++i)
        val |= (a[i] ^ b[i]);

      return (val === 0);
    }
  }
})();

function KeyExchange(algo, options) {
  switch (algo) {
    case 'curve25519-sha256':
    case 'curve25519-sha256@libssh.org':
      if (!CURVE25519_SUPPORTED)
        break;
      this.type = '25519';
      this.hash = 'sha256';
      this.pktInit = 'KEXECDH_INIT';
      this.pktReply = 'KEXECDH_REPLY';
      return;
    case 'ecdh-sha2-nistp256':
      this.type = 'ecdh';
      this.name = 'prime256v1';
      this.hash = 'sha256';
      this.pktInit = 'KEXECDH_INIT';
      this.pktReply = 'KEXECDH_REPLY';
      return;
    case 'ecdh-sha2-nistp384':
      this.type = 'ecdh';
      this.name = 'secp384r1';
      this.hash = 'sha384';
      this.pktInit = 'KEXECDH_INIT';
      this.pktReply = 'KEXECDH_REPLY';
      return;
    case 'ecdh-sha2-nistp521':
      this.type = 'ecdh';
      this.name = 'secp521r1';
      this.hash = 'sha512';
      this.pktInit = 'KEXECDH_INIT';
      this.pktReply = 'KEXECDH_REPLY';
      return;
    case 'diffie-hellman-group1-sha1':
      this.type = 'group';
      this.name = 'modp2';
      this.hash = 'sha1';
      this.pktInit = 'KEXDH_INIT';
      this.pktReply = 'KEXDH_REPLY';
      return;
    case 'diffie-hellman-group14-sha1':
      this.type = 'group';
      this.name = 'modp14';
      this.hash = 'sha1';
      this.pktInit = 'KEXDH_INIT';
      this.pktReply = 'KEXDH_REPLY';
      return;
    case 'diffie-hellman-group14-sha256':
      this.type = 'group';
      this.name = 'modp14';
      this.hash = 'sha256';
      this.pktInit = 'KEXDH_INIT';
      this.pktReply = 'KEXDH_REPLY';
      return;
    case 'diffie-hellman-group16-sha512':
      this.type = 'group';
      this.name = 'modp16';
      this.hash = 'sha512';
      this.pktInit = 'KEXDH_INIT';
      this.pktReply = 'KEXDH_REPLY';
      return;
    case 'diffie-hellman-group18-sha512':
      this.type = 'group';
      this.name = 'modp18';
      this.hash = 'sha512';
      this.pktInit = 'KEXDH_INIT';
      this.pktReply = 'KEXDH_REPLY';
      return;
    case 'diffie-hellman-group-exchange-sha1':
      this.type = 'groupex';
      this.hash = 'sha1';
      this.pktInit = 'KEXDH_GEX_REQ';
      this.pktReply = 'KEXDH_GEX_REPLY';
      this._prime = null;
      this._generator = null;
      return;
    case 'diffie-hellman-group-exchange-sha256':
      this.type = 'groupex';
      this.hash = 'sha256';
      this.pktInit = 'KEXDH_GEX_REQ';
      this.pktReply = 'KEXDH_GEX_REPLY';
      this._prime = null;
      this._generator = null;
      return;
  }
  throw new Error('Unsupported key exchange algorithm: ' + algo);
}
KeyExchange.prototype.setDHParams = function(prime, generator) {
  if (this.type === 'groupex') {
    if (!Buffer.isBuffer(prime))
      throw new Error('Invalid prime value');
    if (!Buffer.isBuffer(generator))
      throw new Error('Invalid generator value');
    this._prime = prime;
    this._generator = generator;
  }
};
KeyExchange.prototype.getDHParams = function() {
  if (this.type === 'groupex' && this._kex) {
    return {
      prime: convertToMpint(this._kex.getPrime()),
      generator: convertToMpint(this._kex.getGenerator()),
    };
  }
};
KeyExchange.prototype.generateKeys = function() {
  switch (this.type) {
    case '25519':
      if (!this._keys)
        this._keys = crypto.generateKeyPairSync('x25519');
      break;
    case 'ecdh':
      if (!this._kex) {
        this._kex = crypto.createECDH(this.name);
        this._public = this._kex.generateKeys();
      }
      break;
    case 'group':
    case 'groupex':
      if (!this._kex) {
        if (this.name)
          this._kex = crypto.createDiffieHellmanGroup(this.name);
        else if (this._prime && this._generator)
          this._kex = crypto.createDiffieHellman(this._prime, this._generator);
        if (this._kex)
          this._public = this._kex.generateKeys();
      }
      break;
  }
};
KeyExchange.prototype.getPublicKey = function() {
  this.generateKeys();

  var key;
  switch (this.type) {
    case '25519':
      key = this._keys.publicKey.export({ type: 'spki', format: 'der' });
      return key.slice(-32); // HACK: avoids parsing DER/BER header
    case 'ecdh':
    case 'group':
    case 'groupex':
      key = this._public;
      break;
  }
  if (key)
    return this.convertPublicKey(key);
};
KeyExchange.prototype.convertPublicKey = function(key) {
  var newKey;
  var idx = 0;
  var len = key.length;
  while (key[idx] === 0x00) {
    ++idx;
    --len;
  }
  switch (this.type) {
    case '25519':
      if (key.length === 32)
        return key;
      break;
    default:
      if (key[idx] & 0x80) {
        newKey = Buffer.allocUnsafe(1 + len);
        newKey[0] = 0;
        key.copy(newKey, 1, idx);
        return newKey;
      }
  }
  if (len !== key.length) {
    newKey = Buffer.allocUnsafe(len);
    key.copy(newKey, 0, idx);
    key = newKey;
  }
  return key;
};
KeyExchange.prototype.computeSecret = function(otherPublicKey) {
  this.generateKeys();

  switch (this.type) {
    case '25519':
      try {
        var asnWriter = new Ber.Writer();
        asnWriter.startSequence();
          // algorithm
          asnWriter.startSequence();
            asnWriter.writeOID('1.3.101.110'); // id-X25519
          asnWriter.endSequence();

          // PublicKey
          asnWriter.startSequence(Ber.BitString);
            asnWriter.writeByte(0x00);
            // XXX: hack to write a raw buffer without a tag -- yuck
            asnWriter._ensure(otherPublicKey.length);
            otherPublicKey.copy(asnWriter._buf,
                                asnWriter._offset,
                                0,
                                otherPublicKey.length);
            asnWriter._offset += otherPublicKey.length;
          asnWriter.endSequence();
        asnWriter.endSequence();

        return convertToMpint(crypto.diffieHellman({
          privateKey: this._keys.privateKey,
          publicKey: crypto.createPublicKey({
            key: asnWriter.buffer,
            type: 'spki',
            format: 'der',
          }),
        }));
      } catch (ex) {
        return ex;
      }
      break;
    case 'ecdh':
    case 'group':
    case 'groupex':
      try {
        return convertToMpint(this._kex.computeSecret(otherPublicKey));
      } catch (ex) {
        return ex;
      }
  }
};

function convertToMpint(buf) {
  var idx = 0;
  var length = buf.length;
  while (buf[idx] === 0x00) {
    ++idx;
    --length;
  }
  var newBuf;
  if (buf[idx] & 0x80) {
    newBuf = Buffer.allocUnsafe(1 + length);
    newBuf[0] = 0;
    buf.copy(newBuf, 1, idx);
    buf = newBuf;
  } else if (length !== buf.length) {
    newBuf = Buffer.allocUnsafe(length);
    buf.copy(newBuf, 0, idx);
    buf = newBuf;
  }
  return buf;
}

module.exports = SSH2Stream;
module.exports._send = send;


/***/ }),

/***/ 641:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var crypto_hash_sha512 = __webpack_require__(196).lowlevel.crypto_hash;

/*
 * This file is a 1:1 port from the OpenBSD blowfish.c and bcrypt_pbkdf.c. As a
 * result, it retains the original copyright and license. The two files are
 * under slightly different (but compatible) licenses, and are here combined in
 * one file.
 *
 * Credit for the actual porting work goes to:
 *  Devi Mandiri <me@devi.web.id>
 */

/*
 * The Blowfish portions are under the following license:
 *
 * Blowfish block cipher for OpenBSD
 * Copyright 1997 Niels Provos <provos@physnet.uni-hamburg.de>
 * All rights reserved.
 *
 * Implementation advice by David Mazieres <dm@lcs.mit.edu>.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * The bcrypt_pbkdf portions are under the following license:
 *
 * Copyright (c) 2013 Ted Unangst <tedu@openbsd.org>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * Performance improvements (Javascript-specific):
 *
 * Copyright 2016, Joyent Inc
 * Author: Alex Wilson <alex.wilson@joyent.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

// Ported from OpenBSD bcrypt_pbkdf.c v1.9

var BLF_J = 0;

var Blowfish = function() {
  this.S = [
    new Uint32Array([
      0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7,
      0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99,
      0x24a19947, 0xb3916cf7, 0x0801f2e2, 0x858efc16,
      0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e,
      0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee,
      0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013,
      0xc5d1b023, 0x286085f0, 0xca417918, 0xb8db38ef,
      0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e,
      0xd71577c1, 0xbd314b27, 0x78af2fda, 0x55605c60,
      0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440,
      0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce,
      0xa15486af, 0x7c72e993, 0xb3ee1411, 0x636fbc2a,
      0x2ba9c55d, 0x741831f6, 0xce5c3e16, 0x9b87931e,
      0xafd6ba33, 0x6c24cf5c, 0x7a325381, 0x28958677,
      0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193,
      0x61d809cc, 0xfb21a991, 0x487cac60, 0x5dec8032,
      0xef845d5d, 0xe98575b1, 0xdc262302, 0xeb651b88,
      0x23893e81, 0xd396acc5, 0x0f6d6ff3, 0x83f44239,
      0x2e0b4482, 0xa4842004, 0x69c8f04a, 0x9e1f9b5e,
      0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0,
      0x6a51a0d2, 0xd8542f68, 0x960fa728, 0xab5133a3,
      0x6eef0b6c, 0x137a3be4, 0xba3bf050, 0x7efb2a98,
      0xa1f1651d, 0x39af0176, 0x66ca593e, 0x82430e88,
      0x8cee8619, 0x456f9fb4, 0x7d84a5c3, 0x3b8b5ebe,
      0xe06f75d8, 0x85c12073, 0x401a449f, 0x56c16aa6,
      0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d,
      0x37d0d724, 0xd00a1248, 0xdb0fead3, 0x49f1c09b,
      0x075372c9, 0x80991b7b, 0x25d479d8, 0xf6e8def7,
      0xe3fe501a, 0xb6794c3b, 0x976ce0bd, 0x04c006ba,
      0xc1a94fb6, 0x409f60c4, 0x5e5c9ec2, 0x196a2463,
      0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f,
      0x6dfc511f, 0x9b30952c, 0xcc814544, 0xaf5ebd09,
      0xbee3d004, 0xde334afd, 0x660f2807, 0x192e4bb3,
      0xc0cba857, 0x45c8740f, 0xd20b5f39, 0xb9d3fbdb,
      0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279,
      0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8,
      0x3c7516df, 0xfd616b15, 0x2f501ec8, 0xad0552ab,
      0x323db5fa, 0xfd238760, 0x53317b48, 0x3e00df82,
      0x9e5c57bb, 0xca6f8ca0, 0x1a87562e, 0xdf1769db,
      0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573,
      0x695b27b0, 0xbbca58c8, 0xe1ffa35d, 0xb8f011a0,
      0x10fa3d98, 0xfd2183b8, 0x4afcb56c, 0x2dd1d35b,
      0x9a53e479, 0xb6f84565, 0xd28e49bc, 0x4bfb9790,
      0xe1ddf2da, 0xa4cb7e33, 0x62fb1341, 0xcee4c6e8,
      0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4,
      0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0,
      0xd08ed1d0, 0xafc725e0, 0x8e3c5b2f, 0x8e7594b7,
      0x8ff6e2fb, 0xf2122b64, 0x8888b812, 0x900df01c,
      0x4fad5ea0, 0x688fc31c, 0xd1cff191, 0xb3a8c1ad,
      0x2f2f2218, 0xbe0e1777, 0xea752dfe, 0x8b021fa1,
      0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299,
      0xb4a84fe0, 0xfd13e0b7, 0x7cc43b81, 0xd2ada8d9,
      0x165fa266, 0x80957705, 0x93cc7314, 0x211a1477,
      0xe6ad2065, 0x77b5fa86, 0xc75442f5, 0xfb9d35cf,
      0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49,
      0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af,
      0x2464369b, 0xf009b91e, 0x5563911d, 0x59dfa6aa,
      0x78c14389, 0xd95a537f, 0x207d5ba2, 0x02e5b9c5,
      0x83260376, 0x6295cfa9, 0x11c81968, 0x4e734a41,
      0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915,
      0xd60f573f, 0xbc9bc6e4, 0x2b60a476, 0x81e67400,
      0x08ba6fb5, 0x571be91f, 0xf296ec6b, 0x2a0dd915,
      0xb6636521, 0xe7b9f9b6, 0xff34052e, 0xc5855664,
      0x53b02d5d, 0xa99f8fa1, 0x08ba4799, 0x6e85076a]),
    new Uint32Array([
      0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623,
      0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266,
      0xecaa8c71, 0x699a17ff, 0x5664526c, 0xc2b19ee1,
      0x193602a5, 0x75094c29, 0xa0591340, 0xe4183a3e,
      0x3f54989a, 0x5b429d65, 0x6b8fe4d6, 0x99f73fd6,
      0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1,
      0x4cdd2086, 0x8470eb26, 0x6382e9c6, 0x021ecc5e,
      0x09686b3f, 0x3ebaefc9, 0x3c971814, 0x6b6a70a1,
      0x687f3584, 0x52a0e286, 0xb79c5305, 0xaa500737,
      0x3e07841c, 0x7fdeae5c, 0x8e7d44ec, 0x5716f2b8,
      0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff,
      0xae0cf51a, 0x3cb574b2, 0x25837a58, 0xdc0921bd,
      0xd19113f9, 0x7ca92ff6, 0x94324773, 0x22f54701,
      0x3ae5e581, 0x37c2dadc, 0xc8b57634, 0x9af3dda7,
      0xa9446146, 0x0fd0030e, 0xecc8c73e, 0xa4751e41,
      0xe238cd99, 0x3bea0e2f, 0x3280bba1, 0x183eb331,
      0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf,
      0x2cb81290, 0x24977c79, 0x5679b072, 0xbcaf89af,
      0xde9a771f, 0xd9930810, 0xb38bae12, 0xdccf3f2e,
      0x5512721f, 0x2e6b7124, 0x501adde6, 0x9f84cd87,
      0x7a584718, 0x7408da17, 0xbc9f9abc, 0xe94b7d8c,
      0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2,
      0xef1c1847, 0x3215d908, 0xdd433b37, 0x24c2ba16,
      0x12a14d43, 0x2a65c451, 0x50940002, 0x133ae4dd,
      0x71dff89e, 0x10314e55, 0x81ac77d6, 0x5f11199b,
      0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509,
      0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e,
      0x86e34570, 0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3,
      0x771fe71c, 0x4e3d06fa, 0x2965dcb9, 0x99e71d0f,
      0x803e89d6, 0x5266c825, 0x2e4cc978, 0x9c10b36a,
      0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4,
      0xf2f74ea7, 0x361d2b3d, 0x1939260f, 0x19c27960,
      0x5223a708, 0xf71312b6, 0xebadfe6e, 0xeac31f66,
      0xe3bc4595, 0xa67bc883, 0xb17f37d1, 0x018cff28,
      0xc332ddef, 0xbe6c5aa5, 0x65582185, 0x68ab9802,
      0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84,
      0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510,
      0x13cca830, 0xeb61bd96, 0x0334fe1e, 0xaa0363cf,
      0xb5735c90, 0x4c70a239, 0xd59e9e0b, 0xcbaade14,
      0xeecc86bc, 0x60622ca7, 0x9cab5cab, 0xb2f3846e,
      0x648b1eaf, 0x19bdf0ca, 0xa02369b9, 0x655abb50,
      0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7,
      0x9b540b19, 0x875fa099, 0x95f7997e, 0x623d7da8,
      0xf837889a, 0x97e32d77, 0x11ed935f, 0x16681281,
      0x0e358829, 0xc7e61fd6, 0x96dedfa1, 0x7858ba99,
      0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696,
      0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128,
      0x58ebf2ef, 0x34c6ffea, 0xfe28ed61, 0xee7c3c73,
      0x5d4a14d9, 0xe864b7e3, 0x42105d14, 0x203e13e0,
      0x45eee2b6, 0xa3aaabea, 0xdb6c4f15, 0xfacb4fd0,
      0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105,
      0xd81e799e, 0x86854dc7, 0xe44b476a, 0x3d816250,
      0xcf62a1f2, 0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3,
      0x7f1524c3, 0x69cb7492, 0x47848a0b, 0x5692b285,
      0x095bbf00, 0xad19489d, 0x1462b174, 0x23820e00,
      0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061,
      0x3372f092, 0x8d937e41, 0xd65fecf1, 0x6c223bdb,
      0x7cde3759, 0xcbee7460, 0x4085f2a7, 0xce77326e,
      0xa6078084, 0x19f8509e, 0xe8efd855, 0x61d99735,
      0xa969a7aa, 0xc50c06c2, 0x5a04abfc, 0x800bcadc,
      0x9e447a2e, 0xc3453484, 0xfdd56705, 0x0e1e9ec9,
      0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340,
      0xc5c43465, 0x713e38d8, 0x3d28f89e, 0xf16dff20,
      0x153e21e7, 0x8fb03d4a, 0xe6e39f2b, 0xdb83adf7]),
    new Uint32Array([
      0xe93d5a68, 0x948140f7, 0xf64c261c, 0x94692934,
      0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068,
      0xd4082471, 0x3320f46a, 0x43b7d4b7, 0x500061af,
      0x1e39f62e, 0x97244546, 0x14214f74, 0xbf8b8840,
      0x4d95fc1d, 0x96b591af, 0x70f4ddd3, 0x66a02f45,
      0xbfbc09ec, 0x03bd9785, 0x7fac6dd0, 0x31cb8504,
      0x96eb27b3, 0x55fd3941, 0xda2547e6, 0xabca0a9a,
      0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb,
      0x68dc1462, 0xd7486900, 0x680ec0a4, 0x27a18dee,
      0x4f3ffea2, 0xe887ad8c, 0xb58ce006, 0x7af4d6b6,
      0xaace1e7c, 0xd3375fec, 0xce78a399, 0x406b2a42,
      0x20fe9e35, 0xd9f385b9, 0xee39d7ab, 0x3b124e8b,
      0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2,
      0x3a6efa74, 0xdd5b4332, 0x6841e7f7, 0xca7820fb,
      0xfb0af54e, 0xd8feb397, 0x454056ac, 0xba489527,
      0x55533a3a, 0x20838d87, 0xfe6ba9b7, 0xd096954b,
      0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33,
      0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c,
      0xfdf8e802, 0x04272f70, 0x80bb155c, 0x05282ce3,
      0x95c11548, 0xe4c66d22, 0x48c1133f, 0xc70f86dc,
      0x07f9c9ee, 0x41041f0f, 0x404779a4, 0x5d886e17,
      0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564,
      0x257b7834, 0x602a9c60, 0xdff8e8a3, 0x1f636c1b,
      0x0e12b4c2, 0x02e1329e, 0xaf664fd1, 0xcad18115,
      0x6b2395e0, 0x333e92e1, 0x3b240b62, 0xeebeb922,
      0x85b2a20e, 0xe6ba0d99, 0xde720c8c, 0x2da2f728,
      0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0,
      0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e,
      0x0a476341, 0x992eff74, 0x3a6f6eab, 0xf4f8fd37,
      0xa812dc60, 0xa1ebddf8, 0x991be14c, 0xdb6e6b0d,
      0xc67b5510, 0x6d672c37, 0x2765d43b, 0xdcd0e804,
      0xf1290dc7, 0xcc00ffa3, 0xb5390f92, 0x690fed0b,
      0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3,
      0xbb132f88, 0x515bad24, 0x7b9479bf, 0x763bd6eb,
      0x37392eb3, 0xcc115979, 0x8026e297, 0xf42e312d,
      0x6842ada7, 0xc66a2b3b, 0x12754ccc, 0x782ef11c,
      0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350,
      0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9,
      0x44421659, 0x0a121386, 0xd90cec6e, 0xd5abea2a,
      0x64af674e, 0xda86a85f, 0xbebfe988, 0x64e4c3fe,
      0x9dbc8057, 0xf0f7c086, 0x60787bf8, 0x6003604d,
      0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc,
      0x83426b33, 0xf01eab71, 0xb0804187, 0x3c005e5f,
      0x77a057be, 0xbde8ae24, 0x55464299, 0xbf582e61,
      0x4e58f48f, 0xf2ddfda2, 0xf474ef38, 0x8789bdc2,
      0x5366f9c3, 0xc8b38e74, 0xb475f255, 0x46fcd9b9,
      0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2,
      0x466e598e, 0x20b45770, 0x8cd55591, 0xc902de4c,
      0xb90bace1, 0xbb8205d0, 0x11a86248, 0x7574a99e,
      0xb77f19b6, 0xe0a9dc09, 0x662d09a1, 0xc4324633,
      0xe85a1f02, 0x09f0be8c, 0x4a99a025, 0x1d6efe10,
      0x1ab93d1d, 0x0ba5a4df, 0xa186f20f, 0x2868f169,
      0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52,
      0x50115e01, 0xa70683fa, 0xa002b5c4, 0x0de6d027,
      0x9af88c27, 0x773f8641, 0xc3604c06, 0x61a806b5,
      0xf0177a28, 0xc0f586e0, 0x006058aa, 0x30dc7d62,
      0x11e69ed7, 0x2338ea63, 0x53c2dd94, 0xc2c21634,
      0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76,
      0x6f05e409, 0x4b7c0188, 0x39720a3d, 0x7c927c24,
      0x86e3725f, 0x724d9db9, 0x1ac15bb4, 0xd39eb8fc,
      0xed545578, 0x08fca5b5, 0xd83d7cd3, 0x4dad0fc4,
      0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c,
      0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837,
      0xd79a3234, 0x92638212, 0x670efa8e, 0x406000e0]),
    new Uint32Array([
      0x3a39ce37, 0xd3faf5cf, 0xabc27737, 0x5ac52d1b,
      0x5cb0679e, 0x4fa33742, 0xd3822740, 0x99bc9bbe,
      0xd5118e9d, 0xbf0f7315, 0xd62d1c7e, 0xc700c47b,
      0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4,
      0x5748ab2f, 0xbc946e79, 0xc6a376d2, 0x6549c2c8,
      0x530ff8ee, 0x468dde7d, 0xd5730a1d, 0x4cd04dc6,
      0x2939bbdb, 0xa9ba4650, 0xac9526e8, 0xbe5ee304,
      0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22,
      0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4,
      0x83c061ba, 0x9be96a4d, 0x8fe51550, 0xba645bd6,
      0x2826a2f9, 0xa73a3ae1, 0x4ba99586, 0xef5562e9,
      0xc72fefd3, 0xf752f7da, 0x3f046f69, 0x77fa0a59,
      0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593,
      0xe990fd5a, 0x9e34d797, 0x2cf0b7d9, 0x022b8b51,
      0x96d5ac3a, 0x017da67d, 0xd1cf3ed6, 0x7c7d2d28,
      0x1f9f25cf, 0xadf2b89b, 0x5ad6b472, 0x5a88f54c,
      0xe029ac71, 0xe019a5e6, 0x47b0acfd, 0xed93fa9b,
      0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28,
      0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c,
      0x15056dd4, 0x88f46dba, 0x03a16125, 0x0564f0bd,
      0xc3eb9e15, 0x3c9057a2, 0x97271aec, 0xa93a072a,
      0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb, 0x26dcf319,
      0x7533d928, 0xb155fdf5, 0x03563482, 0x8aba3cbb,
      0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f,
      0x4de81751, 0x3830dc8e, 0x379d5862, 0x9320f991,
      0xea7a90c2, 0xfb3e7bce, 0x5121ce64, 0x774fbe32,
      0xa8b6e37e, 0xc3293d46, 0x48de5369, 0x6413e680,
      0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166,
      0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae,
      0x5bbef7dd, 0x1b588d40, 0xccd2017f, 0x6bb4e3bb,
      0xdda26a7e, 0x3a59ff45, 0x3e350a44, 0xbcb4cdd5,
      0x72eacea8, 0xfa6484bb, 0x8d6612ae, 0xbf3c6f47,
      0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370,
      0x740e0d8d, 0xe75b1357, 0xf8721671, 0xaf537d5d,
      0x4040cb08, 0x4eb4e2cc, 0x34d2466a, 0x0115af84,
      0xe1b00428, 0x95983a1d, 0x06b89fb4, 0xce6ea048,
      0x6f3f3b82, 0x3520ab82, 0x011a1d4b, 0x277227f8,
      0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd,
      0xa08839e1, 0x51ce794b, 0x2f32c9b7, 0xa01fbac9,
      0xe01cc87e, 0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7,
      0x1a908749, 0xd44fbd9a, 0xd0dadecb, 0xd50ada38,
      0x0339c32a, 0xc6913667, 0x8df9317c, 0xe0b12b4f,
      0xf79e59b7, 0x43f5bb3a, 0xf2d519ff, 0x27d9459c,
      0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525,
      0xfae59361, 0xceb69ceb, 0xc2a86459, 0x12baa8d1,
      0xb6c1075e, 0xe3056a0c, 0x10d25065, 0xcb03a442,
      0xe0ec6e0e, 0x1698db3b, 0x4c98a0be, 0x3278e964,
      0x9f1f9532, 0xe0d392df, 0xd3a0342b, 0x8971f21e,
      0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8,
      0xdf359f8d, 0x9b992f2e, 0xe60b6f47, 0x0fe3f11d,
      0xe54cda54, 0x1edad891, 0xce6279cf, 0xcd3e7e6f,
      0x1618b166, 0xfd2c1d05, 0x848fd2c5, 0xf6fb2299,
      0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02,
      0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc,
      0xde966292, 0x81b949d0, 0x4c50901b, 0x71c65614,
      0xe6c6c7bd, 0x327a140a, 0x45e1d006, 0xc3f27b9a,
      0xc9aa53fd, 0x62a80f00, 0xbb25bfe2, 0x35bdd2f6,
      0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b,
      0x53113ec0, 0x1640e3d3, 0x38abbd60, 0x2547adf0,
      0xba38209c, 0xf746ce76, 0x77afa1c5, 0x20756060,
      0x85cbfe4e, 0x8ae88dd8, 0x7aaaf9b0, 0x4cf9aa7e,
      0x1948c25c, 0x02fb8a8c, 0x01c36ae4, 0xd6ebe1f9,
      0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f,
      0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6])
    ];
  this.P = new Uint32Array([
    0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344,
    0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89,
    0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c,
    0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917,
    0x9216d5d9, 0x8979fb1b]);
};

function F(S, x8, i) {
  return (((S[0][x8[i+3]] +
            S[1][x8[i+2]]) ^
            S[2][x8[i+1]]) +
            S[3][x8[i]]);
};

Blowfish.prototype.encipher = function(x, x8) {
  if (x8 === undefined) {
    x8 = new Uint8Array(x.buffer);
    if (x.byteOffset !== 0)
      x8 = x8.subarray(x.byteOffset);
  }
  x[0] ^= this.P[0];
  for (var i = 1; i < 16; i += 2) {
    x[1] ^= F(this.S, x8, 0) ^ this.P[i];
    x[0] ^= F(this.S, x8, 4) ^ this.P[i+1];
  }
  var t = x[0];
  x[0] = x[1] ^ this.P[17];
  x[1] = t;
};

Blowfish.prototype.decipher = function(x) {
  var x8 = new Uint8Array(x.buffer);
  if (x.byteOffset !== 0)
    x8 = x8.subarray(x.byteOffset);
  x[0] ^= this.P[17];
  for (var i = 16; i > 0; i -= 2) {
    x[1] ^= F(this.S, x8, 0) ^ this.P[i];
    x[0] ^= F(this.S, x8, 4) ^ this.P[i-1];
  }
  var t = x[0];
  x[0] = x[1] ^ this.P[0];
  x[1] = t;
};

function stream2word(data, databytes){
  var i, temp = 0;
  for (i = 0; i < 4; i++, BLF_J++) {
    if (BLF_J >= databytes) BLF_J = 0;
    temp = (temp << 8) | data[BLF_J];
  }
  return temp;
};

Blowfish.prototype.expand0state = function(key, keybytes) {
  var d = new Uint32Array(2), i, k;
  var d8 = new Uint8Array(d.buffer);

  for (i = 0, BLF_J = 0; i < 18; i++) {
    this.P[i] ^= stream2word(key, keybytes);
  }
  BLF_J = 0;

  for (i = 0; i < 18; i += 2) {
    this.encipher(d, d8);
    this.P[i]   = d[0];
    this.P[i+1] = d[1];
  }

  for (i = 0; i < 4; i++) {
    for (k = 0; k < 256; k += 2) {
      this.encipher(d, d8);
      this.S[i][k]   = d[0];
      this.S[i][k+1] = d[1];
    }
  }
};

Blowfish.prototype.expandstate = function(data, databytes, key, keybytes) {
  var d = new Uint32Array(2), i, k;

  for (i = 0, BLF_J = 0; i < 18; i++) {
    this.P[i] ^= stream2word(key, keybytes);
  }

  for (i = 0, BLF_J = 0; i < 18; i += 2) {
    d[0] ^= stream2word(data, databytes);
    d[1] ^= stream2word(data, databytes);
    this.encipher(d);
    this.P[i]   = d[0];
    this.P[i+1] = d[1];
  }

  for (i = 0; i < 4; i++) {
    for (k = 0; k < 256; k += 2) {
      d[0] ^= stream2word(data, databytes);
      d[1] ^= stream2word(data, databytes);
      this.encipher(d);
      this.S[i][k]   = d[0];
      this.S[i][k+1] = d[1];
    }
  }
  BLF_J = 0;
};

Blowfish.prototype.enc = function(data, blocks) {
  for (var i = 0; i < blocks; i++) {
    this.encipher(data.subarray(i*2));
  }
};

Blowfish.prototype.dec = function(data, blocks) {
  for (var i = 0; i < blocks; i++) {
    this.decipher(data.subarray(i*2));
  }
};

var BCRYPT_BLOCKS = 8,
    BCRYPT_HASHSIZE = 32;

function bcrypt_hash(sha2pass, sha2salt, out) {
  var state = new Blowfish(),
      cdata = new Uint32Array(BCRYPT_BLOCKS), i,
      ciphertext = new Uint8Array([79,120,121,99,104,114,111,109,97,116,105,
            99,66,108,111,119,102,105,115,104,83,119,97,116,68,121,110,97,109,
            105,116,101]); //"OxychromaticBlowfishSwatDynamite"

  state.expandstate(sha2salt, 64, sha2pass, 64);
  for (i = 0; i < 64; i++) {
    state.expand0state(sha2salt, 64);
    state.expand0state(sha2pass, 64);
  }

  for (i = 0; i < BCRYPT_BLOCKS; i++)
    cdata[i] = stream2word(ciphertext, ciphertext.byteLength);
  for (i = 0; i < 64; i++)
    state.enc(cdata, cdata.byteLength / 8);

  for (i = 0; i < BCRYPT_BLOCKS; i++) {
    out[4*i+3] = cdata[i] >>> 24;
    out[4*i+2] = cdata[i] >>> 16;
    out[4*i+1] = cdata[i] >>> 8;
    out[4*i+0] = cdata[i];
  }
};

function bcrypt_pbkdf(pass, passlen, salt, saltlen, key, keylen, rounds) {
  var sha2pass = new Uint8Array(64),
      sha2salt = new Uint8Array(64),
      out = new Uint8Array(BCRYPT_HASHSIZE),
      tmpout = new Uint8Array(BCRYPT_HASHSIZE),
      countsalt = new Uint8Array(saltlen+4),
      i, j, amt, stride, dest, count,
      origkeylen = keylen;

  if (rounds < 1)
    return -1;
  if (passlen === 0 || saltlen === 0 || keylen === 0 ||
      keylen > (out.byteLength * out.byteLength) || saltlen > (1<<20))
    return -1;

  stride = Math.floor((keylen + out.byteLength - 1) / out.byteLength);
  amt = Math.floor((keylen + stride - 1) / stride);

  for (i = 0; i < saltlen; i++)
    countsalt[i] = salt[i];

  crypto_hash_sha512(sha2pass, pass, passlen);

  for (count = 1; keylen > 0; count++) {
    countsalt[saltlen+0] = count >>> 24;
    countsalt[saltlen+1] = count >>> 16;
    countsalt[saltlen+2] = count >>>  8;
    countsalt[saltlen+3] = count;

    crypto_hash_sha512(sha2salt, countsalt, saltlen + 4);
    bcrypt_hash(sha2pass, sha2salt, tmpout);
    for (i = out.byteLength; i--;)
      out[i] = tmpout[i];

    for (i = 1; i < rounds; i++) {
      crypto_hash_sha512(sha2salt, tmpout, tmpout.byteLength);
      bcrypt_hash(sha2pass, sha2salt, tmpout);
      for (j = 0; j < out.byteLength; j++)
        out[j] ^= tmpout[j];
    }

    amt = Math.min(amt, keylen);
    for (i = 0; i < amt; i++) {
      dest = i * stride + (count - 1);
      if (dest >= origkeylen)
        break;
      key[dest] = out[i];
    }
    keylen -= i;
  }

  return 0;
};

module.exports = {
      BLOCKS: BCRYPT_BLOCKS,
      HASHSIZE: BCRYPT_HASHSIZE,
      hash: bcrypt_hash,
      pbkdf: bcrypt_pbkdf
};


/***/ }),

/***/ 652:
/***/ (function(module) {

// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// Set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
BigInteger.prototype.am = am3;
dbits = 28;

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+this.DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);   // normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);  // "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {   // Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;       // y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;   // y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;    // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;       // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2) // pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero
// Version 1.2: square() API, isProbablePrime fix

// (public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

// (public) return value as integer
function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this[0];
  else if(this.t == 0) return 0;
  // assumes 16 < DB < 32
  return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

// (public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

// (public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  else return 1;
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}

// (protected) convert from radix string
function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) alternate constructor
function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))  // force MSB set
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0); // force odd
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    // new BigInteger(int,RNG)
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this[i]&((1<<p)-1))<<(8-p);
        d |= this[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}

// (public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

// (public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

// (public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

// (public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

// (public) ~this
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}

// (public) this << n
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}

// (public) this >> n
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this[i] != 0) return i*this.DB+lbit(this[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
  return r;
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this[j]&(1<<(n%this.DB)))!=0);
}

// (protected) this op (1<<n)
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}

// (public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

// (public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

// (public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

// (protected) r = this + a
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]+a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r[i++] = c;
  else if(c < -1) r[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

// (public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

// (public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

// (public) this^2
function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

// (public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

// (public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while(this[w] >= this.DV) {
    this[w] -= this.DV;
    if(++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
}

// A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0; // assumes a,this >= 0
  r.t = i;
  while(i > 0) r[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
  r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0; // assumes a,this >= 0
  while(--i >= 0) r[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}

function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }

  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e[j]>>(i-k1))&km;
    else {
      w = (e[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
    }

    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) {  // ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }

    while(j >= 0 && (e[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
  return r;
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    //Pick bases at random, instead of starting at 2
    a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// JSBN-specific extension
BigInteger.prototype.square = bnSquare;

// Expose the Barrett function
BigInteger.prototype.Barrett = Barrett

// BigInteger interfaces not implemented in jsbn:

// BigInteger(int signum, byte[] magnitude)
// double doubleValue()
// float floatValue()
// int hashCode()
// long longValue()
// static BigInteger valueOf(long val)

module.exports = BigInteger;



/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 670:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const { Buffer } = __webpack_require__(293)
const symbol = Symbol.for('BufferList')

function BufferList (buf) {
  if (!(this instanceof BufferList)) {
    return new BufferList(buf)
  }

  BufferList._init.call(this, buf)
}

BufferList._init = function _init (buf) {
  Object.defineProperty(this, symbol, { value: true })

  this._bufs = []
  this.length = 0

  if (buf) {
    this.append(buf)
  }
}

BufferList.prototype._new = function _new (buf) {
  return new BufferList(buf)
}

BufferList.prototype._offset = function _offset (offset) {
  if (offset === 0) {
    return [0, 0]
  }

  let tot = 0

  for (let i = 0; i < this._bufs.length; i++) {
    const _t = tot + this._bufs[i].length
    if (offset < _t || i === this._bufs.length - 1) {
      return [i, offset - tot]
    }
    tot = _t
  }
}

BufferList.prototype._reverseOffset = function (blOffset) {
  const bufferId = blOffset[0]
  let offset = blOffset[1]

  for (let i = 0; i < bufferId; i++) {
    offset += this._bufs[i].length
  }

  return offset
}

BufferList.prototype.get = function get (index) {
  if (index > this.length || index < 0) {
    return undefined
  }

  const offset = this._offset(index)

  return this._bufs[offset[0]][offset[1]]
}

BufferList.prototype.slice = function slice (start, end) {
  if (typeof start === 'number' && start < 0) {
    start += this.length
  }

  if (typeof end === 'number' && end < 0) {
    end += this.length
  }

  return this.copy(null, 0, start, end)
}

BufferList.prototype.copy = function copy (dst, dstStart, srcStart, srcEnd) {
  if (typeof srcStart !== 'number' || srcStart < 0) {
    srcStart = 0
  }

  if (typeof srcEnd !== 'number' || srcEnd > this.length) {
    srcEnd = this.length
  }

  if (srcStart >= this.length) {
    return dst || Buffer.alloc(0)
  }

  if (srcEnd <= 0) {
    return dst || Buffer.alloc(0)
  }

  const copy = !!dst
  const off = this._offset(srcStart)
  const len = srcEnd - srcStart
  let bytes = len
  let bufoff = (copy && dstStart) || 0
  let start = off[1]

  // copy/slice everything
  if (srcStart === 0 && srcEnd === this.length) {
    if (!copy) {
      // slice, but full concat if multiple buffers
      return this._bufs.length === 1
        ? this._bufs[0]
        : Buffer.concat(this._bufs, this.length)
    }

    // copy, need to copy individual buffers
    for (let i = 0; i < this._bufs.length; i++) {
      this._bufs[i].copy(dst, bufoff)
      bufoff += this._bufs[i].length
    }

    return dst
  }

  // easy, cheap case where it's a subset of one of the buffers
  if (bytes <= this._bufs[off[0]].length - start) {
    return copy
      ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes)
      : this._bufs[off[0]].slice(start, start + bytes)
  }

  if (!copy) {
    // a slice, we need something to copy in to
    dst = Buffer.allocUnsafe(len)
  }

  for (let i = off[0]; i < this._bufs.length; i++) {
    const l = this._bufs[i].length - start

    if (bytes > l) {
      this._bufs[i].copy(dst, bufoff, start)
      bufoff += l
    } else {
      this._bufs[i].copy(dst, bufoff, start, start + bytes)
      bufoff += l
      break
    }

    bytes -= l

    if (start) {
      start = 0
    }
  }

  // safeguard so that we don't return uninitialized memory
  if (dst.length > bufoff) return dst.slice(0, bufoff)

  return dst
}

BufferList.prototype.shallowSlice = function shallowSlice (start, end) {
  start = start || 0
  end = typeof end !== 'number' ? this.length : end

  if (start < 0) {
    start += this.length
  }

  if (end < 0) {
    end += this.length
  }

  if (start === end) {
    return this._new()
  }

  const startOffset = this._offset(start)
  const endOffset = this._offset(end)
  const buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1)

  if (endOffset[1] === 0) {
    buffers.pop()
  } else {
    buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1])
  }

  if (startOffset[1] !== 0) {
    buffers[0] = buffers[0].slice(startOffset[1])
  }

  return this._new(buffers)
}

BufferList.prototype.toString = function toString (encoding, start, end) {
  return this.slice(start, end).toString(encoding)
}

BufferList.prototype.consume = function consume (bytes) {
  // first, normalize the argument, in accordance with how Buffer does it
  bytes = Math.trunc(bytes)
  // do nothing if not a positive number
  if (Number.isNaN(bytes) || bytes <= 0) return this

  while (this._bufs.length) {
    if (bytes >= this._bufs[0].length) {
      bytes -= this._bufs[0].length
      this.length -= this._bufs[0].length
      this._bufs.shift()
    } else {
      this._bufs[0] = this._bufs[0].slice(bytes)
      this.length -= bytes
      break
    }
  }

  return this
}

BufferList.prototype.duplicate = function duplicate () {
  const copy = this._new()

  for (let i = 0; i < this._bufs.length; i++) {
    copy.append(this._bufs[i])
  }

  return copy
}

BufferList.prototype.append = function append (buf) {
  if (buf == null) {
    return this
  }

  if (buf.buffer) {
    // append a view of the underlying ArrayBuffer
    this._appendBuffer(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))
  } else if (Array.isArray(buf)) {
    for (let i = 0; i < buf.length; i++) {
      this.append(buf[i])
    }
  } else if (this._isBufferList(buf)) {
    // unwrap argument into individual BufferLists
    for (let i = 0; i < buf._bufs.length; i++) {
      this.append(buf._bufs[i])
    }
  } else {
    // coerce number arguments to strings, since Buffer(number) does
    // uninitialized memory allocation
    if (typeof buf === 'number') {
      buf = buf.toString()
    }

    this._appendBuffer(Buffer.from(buf))
  }

  return this
}

BufferList.prototype._appendBuffer = function appendBuffer (buf) {
  this._bufs.push(buf)
  this.length += buf.length
}

BufferList.prototype.indexOf = function (search, offset, encoding) {
  if (encoding === undefined && typeof offset === 'string') {
    encoding = offset
    offset = undefined
  }

  if (typeof search === 'function' || Array.isArray(search)) {
    throw new TypeError('The "value" argument must be one of type string, Buffer, BufferList, or Uint8Array.')
  } else if (typeof search === 'number') {
    search = Buffer.from([search])
  } else if (typeof search === 'string') {
    search = Buffer.from(search, encoding)
  } else if (this._isBufferList(search)) {
    search = search.slice()
  } else if (Array.isArray(search.buffer)) {
    search = Buffer.from(search.buffer, search.byteOffset, search.byteLength)
  } else if (!Buffer.isBuffer(search)) {
    search = Buffer.from(search)
  }

  offset = Number(offset || 0)

  if (isNaN(offset)) {
    offset = 0
  }

  if (offset < 0) {
    offset = this.length + offset
  }

  if (offset < 0) {
    offset = 0
  }

  if (search.length === 0) {
    return offset > this.length ? this.length : offset
  }

  const blOffset = this._offset(offset)
  let blIndex = blOffset[0] // index of which internal buffer we're working on
  let buffOffset = blOffset[1] // offset of the internal buffer we're working on

  // scan over each buffer
  for (; blIndex < this._bufs.length; blIndex++) {
    const buff = this._bufs[blIndex]

    while (buffOffset < buff.length) {
      const availableWindow = buff.length - buffOffset

      if (availableWindow >= search.length) {
        const nativeSearchResult = buff.indexOf(search, buffOffset)

        if (nativeSearchResult !== -1) {
          return this._reverseOffset([blIndex, nativeSearchResult])
        }

        buffOffset = buff.length - search.length + 1 // end of native search window
      } else {
        const revOffset = this._reverseOffset([blIndex, buffOffset])

        if (this._match(revOffset, search)) {
          return revOffset
        }

        buffOffset++
      }
    }

    buffOffset = 0
  }

  return -1
}

BufferList.prototype._match = function (offset, search) {
  if (this.length - offset < search.length) {
    return false
  }

  for (let searchOffset = 0; searchOffset < search.length; searchOffset++) {
    if (this.get(offset + searchOffset) !== search[searchOffset]) {
      return false
    }
  }
  return true
}

;(function () {
  const methods = {
    readDoubleBE: 8,
    readDoubleLE: 8,
    readFloatBE: 4,
    readFloatLE: 4,
    readInt32BE: 4,
    readInt32LE: 4,
    readUInt32BE: 4,
    readUInt32LE: 4,
    readInt16BE: 2,
    readInt16LE: 2,
    readUInt16BE: 2,
    readUInt16LE: 2,
    readInt8: 1,
    readUInt8: 1,
    readIntBE: null,
    readIntLE: null,
    readUIntBE: null,
    readUIntLE: null
  }

  for (const m in methods) {
    (function (m) {
      if (methods[m] === null) {
        BufferList.prototype[m] = function (offset, byteLength) {
          return this.slice(offset, offset + byteLength)[m](0, byteLength)
        }
      } else {
        BufferList.prototype[m] = function (offset) {
          return this.slice(offset, offset + methods[m])[m](0)
        }
      }
    }(m))
  }
}())

// Used internally by the class and also as an indicator of this object being
// a `BufferList`. It's not possible to use `instanceof BufferList` in a browser
// environment because there could be multiple different copies of the
// BufferList class and some `BufferList`s might be `BufferList`s.
BufferList.prototype._isBufferList = function _isBufferList (b) {
  return b instanceof BufferList || BufferList.isBufferList(b)
}

BufferList.isBufferList = function isBufferList (b) {
  return b != null && b[symbol]
}

module.exports = BufferList


/***/ }),

/***/ 674:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";
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



/*<replacement>*/

var Buffer = __webpack_require__(149).Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ 681:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents a secret
 * @param {Object} modem docker-modem
 * @param {String} id  Secret's id
 */
var Secret = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Secret.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Secret.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/secrets/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'secret not found',
      406: 'node is not part of a swarm',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Update a secret.
 *
 * @param {object} opts
 * @param {function} callback
 */
Secret.prototype.update = function(opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
  }

  var optsf = {
    path: '/secrets/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'secret not found',
      500: 'server error'
    },
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Removes the secret
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Secret.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/secrets/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'secret not found',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};



module.exports = Secret;


/***/ }),

/***/ 689:
/***/ (function(module, __unusedexports, __webpack_require__) {

try {
  var util = __webpack_require__(669);
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = __webpack_require__(315);
}


/***/ }),

/***/ 724:
/***/ (function(module) {

module.exports = {"_args":[["ssh2-streams@0.4.10","/home/manley/Projects/run-gut-tests-action"]],"_from":"ssh2-streams@0.4.10","_id":"ssh2-streams@0.4.10","_inBundle":false,"_integrity":"sha512-8pnlMjvnIZJvmTzUIIA5nT4jr2ZWNNVHwyXfMGdRJbug9TpI3kd99ffglgfSWqujVv/0gxwMsDn9j9RVst8yhQ==","_location":"/ssh2-streams","_phantomChildren":{},"_requested":{"type":"version","registry":true,"raw":"ssh2-streams@0.4.10","name":"ssh2-streams","escapedName":"ssh2-streams","rawSpec":"0.4.10","saveSpec":null,"fetchSpec":"0.4.10"},"_requiredBy":["/ssh2"],"_resolved":"https://registry.npmjs.org/ssh2-streams/-/ssh2-streams-0.4.10.tgz","_spec":"0.4.10","_where":"/home/manley/Projects/run-gut-tests-action","author":{"name":"Brian White","email":"mscdex@mscdex.net"},"bugs":{"url":"https://github.com/mscdex/ssh2-streams/issues"},"dependencies":{"asn1":"~0.2.0","bcrypt-pbkdf":"^1.0.2","streamsearch":"~0.1.2"},"description":"SSH2 and SFTP(v3) client/server protocol streams for node.js","engines":{"node":">=5.2.0"},"homepage":"https://github.com/mscdex/ssh2-streams#readme","keywords":["ssh","ssh2","sftp","secure","protocol","streams","client","server"],"licenses":[{"type":"MIT","url":"http://github.com/mscdex/ssh2-streams/raw/master/LICENSE"}],"main":"./index","name":"ssh2-streams","repository":{"type":"git","url":"git+ssh://git@github.com/mscdex/ssh2-streams.git"},"scripts":{"test":"node test/test.js"},"version":"0.4.10"};

/***/ }),

/***/ 733:
/***/ (function(module, __unusedexports, __webpack_require__) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

var assert = __webpack_require__(357);
var Buffer = __webpack_require__(215).Buffer;

var ASN1 = __webpack_require__(362);
var errors = __webpack_require__(584);


// --- Globals

var newInvalidAsn1Error = errors.newInvalidAsn1Error;



// --- API

function Reader(data) {
  if (!data || !Buffer.isBuffer(data))
    throw new TypeError('data must be a node Buffer');

  this._buf = data;
  this._size = data.length;

  // These hold the "current" state
  this._len = 0;
  this._offset = 0;
}

Object.defineProperty(Reader.prototype, 'length', {
  enumerable: true,
  get: function () { return (this._len); }
});

Object.defineProperty(Reader.prototype, 'offset', {
  enumerable: true,
  get: function () { return (this._offset); }
});

Object.defineProperty(Reader.prototype, 'remain', {
  get: function () { return (this._size - this._offset); }
});

Object.defineProperty(Reader.prototype, 'buffer', {
  get: function () { return (this._buf.slice(this._offset)); }
});


/**
 * Reads a single byte and advances offset; you can pass in `true` to make this
 * a "peek" operation (i.e., get the byte, but don't advance the offset).
 *
 * @param {Boolean} peek true means don't move offset.
 * @return {Number} the next byte, null if not enough data.
 */
Reader.prototype.readByte = function (peek) {
  if (this._size - this._offset < 1)
    return null;

  var b = this._buf[this._offset] & 0xff;

  if (!peek)
    this._offset += 1;

  return b;
};


Reader.prototype.peek = function () {
  return this.readByte(true);
};


/**
 * Reads a (potentially) variable length off the BER buffer.  This call is
 * not really meant to be called directly, as callers have to manipulate
 * the internal buffer afterwards.
 *
 * As a result of this call, you can call `Reader.length`, until the
 * next thing called that does a readLength.
 *
 * @return {Number} the amount of offset to advance the buffer.
 * @throws {InvalidAsn1Error} on bad ASN.1
 */
Reader.prototype.readLength = function (offset) {
  if (offset === undefined)
    offset = this._offset;

  if (offset >= this._size)
    return null;

  var lenB = this._buf[offset++] & 0xff;
  if (lenB === null)
    return null;

  if ((lenB & 0x80) === 0x80) {
    lenB &= 0x7f;

    if (lenB === 0)
      throw newInvalidAsn1Error('Indefinite length not supported');

    if (lenB > 4)
      throw newInvalidAsn1Error('encoding too long');

    if (this._size - offset < lenB)
      return null;

    this._len = 0;
    for (var i = 0; i < lenB; i++)
      this._len = (this._len << 8) + (this._buf[offset++] & 0xff);

  } else {
    // Wasn't a variable length
    this._len = lenB;
  }

  return offset;
};


/**
 * Parses the next sequence in this BER buffer.
 *
 * To get the length of the sequence, call `Reader.length`.
 *
 * @return {Number} the sequence's tag.
 */
Reader.prototype.readSequence = function (tag) {
  var seq = this.peek();
  if (seq === null)
    return null;
  if (tag !== undefined && tag !== seq)
    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
                              ': got 0x' + seq.toString(16));

  var o = this.readLength(this._offset + 1); // stored in `length`
  if (o === null)
    return null;

  this._offset = o;
  return seq;
};


Reader.prototype.readInt = function () {
  return this._readTag(ASN1.Integer);
};


Reader.prototype.readBoolean = function () {
  return (this._readTag(ASN1.Boolean) === 0 ? false : true);
};


Reader.prototype.readEnumeration = function () {
  return this._readTag(ASN1.Enumeration);
};


Reader.prototype.readString = function (tag, retbuf) {
  if (!tag)
    tag = ASN1.OctetString;

  var b = this.peek();
  if (b === null)
    return null;

  if (b !== tag)
    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
                              ': got 0x' + b.toString(16));

  var o = this.readLength(this._offset + 1); // stored in `length`

  if (o === null)
    return null;

  if (this.length > this._size - o)
    return null;

  this._offset = o;

  if (this.length === 0)
    return retbuf ? Buffer.alloc(0) : '';

  var str = this._buf.slice(this._offset, this._offset + this.length);
  this._offset += this.length;

  return retbuf ? str : str.toString('utf8');
};

Reader.prototype.readOID = function (tag) {
  if (!tag)
    tag = ASN1.OID;

  var b = this.readString(tag, true);
  if (b === null)
    return null;

  var values = [];
  var value = 0;

  for (var i = 0; i < b.length; i++) {
    var byte = b[i] & 0xff;

    value <<= 7;
    value += byte & 0x7f;
    if ((byte & 0x80) === 0) {
      values.push(value);
      value = 0;
    }
  }

  value = values.shift();
  values.unshift(value % 40);
  values.unshift((value / 40) >> 0);

  return values.join('.');
};


Reader.prototype._readTag = function (tag) {
  assert.ok(tag !== undefined);

  var b = this.peek();

  if (b === null)
    return null;

  if (b !== tag)
    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
                              ': got 0x' + b.toString(16));

  var o = this.readLength(this._offset + 1); // stored in `length`
  if (o === null)
    return null;

  if (this.length > 4)
    throw newInvalidAsn1Error('Integer too long: ' + this.length);

  if (this.length > this._size - o)
    return null;
  this._offset = o;

  var fb = this._buf[this._offset];
  var value = 0;

  for (var i = 0; i < this.length; i++) {
    value <<= 8;
    value |= (this._buf[this._offset++] & 0xff);
  }

  if ((fb & 0x80) === 0x80 && i !== 4)
    value -= (1 << (i * 8));

  return value >> 0;
};



// --- Exported API

module.exports = Reader;


/***/ }),

/***/ 740:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).


var ERR_STREAM_PREMATURE_CLOSE = __webpack_require__(563).codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 757:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an Exec
 * @param {Object} modem docker-modem
 * @param {String} id    Exec's ID
 */
var Exec = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Exec.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Start the exec call that was setup.
 *
 * @param {object} opts
 * @param {function} callback
 */
Exec.prototype.start = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/exec/' + this.id + '/start',
    method: 'POST',
    isStream: true,
    allowEmpty: true,
    hijack: args.opts.hijack,
    openStdin: args.opts.stdin,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such exec',
      409: 'container stopped/paused',
      500: 'container not running'
    },
    options: args.opts
  };


  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, data);
    });
  }
};

/**
 * Resize the exec call that was setup.
 *
 * @param {object} opts
 * @param {function} callback
 */
Exec.prototype.resize = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/exec/' + this.id + '/resize?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such exec',
      500: 'container not running'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, data);
    });
  }
};

/**
 * Get low-level information about the exec call.
 *
 * @param {function} callback
 */
Exec.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/exec/' + this.id + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such exec',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return callback(err, data);
      callback(err, data);
    });
  }
};


module.exports = Exec;


/***/ }),

/***/ 761:
/***/ (function(module) {

module.exports = require("zlib");

/***/ }),

/***/ 780:
/***/ (function(module, __unusedexports, __webpack_require__) {

var Ber = __webpack_require__(62).Ber;

var readUInt32BE = __webpack_require__(523).readUInt32BE;
var writeUInt32BE = __webpack_require__(523).writeUInt32BE;

// XXX the value of 2400 from dropbear is only for certain strings, not all
// strings. for example the list strings used during handshakes
var MAX_STRING_LEN = Infinity;//2400; // taken from dropbear

module.exports = {
  iv_inc: iv_inc,
  readInt: readInt,
  readString: readString,
  parseKey: __webpack_require__(798).parseKey,
  sigSSHToASN1: sigSSHToASN1,
  DSASigBERToBare: DSASigBERToBare,
  ECDSASigASN1ToSSH: ECDSASigASN1ToSSH
};

function iv_inc(iv) {
  var n = 12;
  var c = 0;
  do {
    --n;
    c = iv[n];
    if (c === 255)
      iv[n] = 0;
    else {
      iv[n] = ++c;
      return;
    }
  } while (n > 4);
}

function readInt(buffer, start, stream, cb) {
  var bufferLen = buffer.length;
  if (start < 0 || start >= bufferLen || (bufferLen - start) < 4) {
    stream && stream._cleanup(cb);
    return false;
  }

  return readUInt32BE(buffer, start);
}

function DSASigBERToBare(signature) {
  if (signature.length <= 40)
    return signature;
  // This is a quick and dirty way to get from BER encoded r and s that
  // OpenSSL gives us, to just the bare values back to back (40 bytes
  // total) like OpenSSH (and possibly others) are expecting
  var asnReader = new Ber.Reader(signature);
  asnReader.readSequence();
  var r = asnReader.readString(Ber.Integer, true);
  var s = asnReader.readString(Ber.Integer, true);
  var rOffset = 0;
  var sOffset = 0;
  if (r.length < 20) {
    var rNew = Buffer.allocUnsafe(20);
    r.copy(rNew, 1);
    r = rNew;
    r[0] = 0;
  }
  if (s.length < 20) {
    var sNew = Buffer.allocUnsafe(20);
    s.copy(sNew, 1);
    s = sNew;
    s[0] = 0;
  }
  if (r.length > 20 && r[0] === 0x00)
    rOffset = 1;
  if (s.length > 20 && s[0] === 0x00)
    sOffset = 1;
  var newSig = Buffer.allocUnsafe((r.length - rOffset) + (s.length - sOffset));
  r.copy(newSig, 0, rOffset);
  s.copy(newSig, r.length - rOffset, sOffset);
  return newSig;
}

function ECDSASigASN1ToSSH(signature) {
  if (signature[0] === 0x00)
    return signature;
  // Convert SSH signature parameters to ASN.1 BER values for OpenSSL
  var asnReader = new Ber.Reader(signature);
  asnReader.readSequence();
  var r = asnReader.readString(Ber.Integer, true);
  var s = asnReader.readString(Ber.Integer, true);
  if (r === null || s === null)
    return false;
  var newSig = Buffer.allocUnsafe(4 + r.length + 4 + s.length);
  writeUInt32BE(newSig, r.length, 0);
  r.copy(newSig, 4);
  writeUInt32BE(newSig, s.length, 4 + r.length);
  s.copy(newSig, 4 + 4 + r.length);
  return newSig;
}

function sigSSHToASN1(sig, type, self, callback) {
  var asnWriter;
  switch (type) {
    case 'ssh-dss':
      if (sig.length > 40)
        return sig;
      // Change bare signature r and s values to ASN.1 BER values for OpenSSL
      asnWriter = new Ber.Writer();
      asnWriter.startSequence();
      var r = sig.slice(0, 20);
      var s = sig.slice(20);
      if (r[0] & 0x80) {
        var rNew = Buffer.allocUnsafe(21);
        rNew[0] = 0x00;
        r.copy(rNew, 1);
        r = rNew;
      } else if (r[0] === 0x00 && !(r[1] & 0x80)) {
        r = r.slice(1);
      }
      if (s[0] & 0x80) {
        var sNew = Buffer.allocUnsafe(21);
        sNew[0] = 0x00;
        s.copy(sNew, 1);
        s = sNew;
      } else if (s[0] === 0x00 && !(s[1] & 0x80)) {
        s = s.slice(1);
      }
      asnWriter.writeBuffer(r, Ber.Integer);
      asnWriter.writeBuffer(s, Ber.Integer);
      asnWriter.endSequence();
      return asnWriter.buffer;
    case 'ecdsa-sha2-nistp256':
    case 'ecdsa-sha2-nistp384':
    case 'ecdsa-sha2-nistp521':
      var r = readString(sig, 0, self, callback);
      if (r === false)
        return false;
      var s = readString(sig, sig._pos, self, callback);
      if (s === false)
        return false;

      asnWriter = new Ber.Writer();
      asnWriter.startSequence();
      asnWriter.writeBuffer(r, Ber.Integer);
      asnWriter.writeBuffer(s, Ber.Integer);
      asnWriter.endSequence();
      return asnWriter.buffer;
    default:
      return sig;
  }
}

function readString(buffer, start, encoding, stream, cb, maxLen) {
  if (encoding && !Buffer.isBuffer(encoding) && typeof encoding !== 'string') {
    if (typeof cb === 'number')
      maxLen = cb;
    cb = stream;
    stream = encoding;
    encoding = undefined;
  }

  start || (start = 0);
  var bufferLen = buffer.length;
  var left = (bufferLen - start);
  var len;
  var end;
  if (start < 0 || start >= bufferLen || left < 4) {
    stream && stream._cleanup(cb);
    return false;
  }

  len = readUInt32BE(buffer, start);
  if (len > (maxLen || MAX_STRING_LEN) || left < (4 + len)) {
    stream && stream._cleanup(cb);
    return false;
  }

  start += 4;
  end = start + len;
  buffer._pos = end;

  if (encoding) {
    if (Buffer.isBuffer(encoding)) {
      buffer.copy(encoding, 0, start, end);
      return encoding;
    } else {
      return buffer.toString(encoding, start, end);
    }
  } else {
    return buffer.slice(start, end);
  }
}



/***/ }),

/***/ 784:
/***/ (function(module, __unusedexports, __webpack_require__) {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(794);
} else {
	module.exports = __webpack_require__(81);
}


/***/ }),

/***/ 787:
/***/ (function(module, __unusedexports, __webpack_require__) {

var querystring = __webpack_require__(191),
  http = __webpack_require__(498),
  fs = __webpack_require__(747),
  path = __webpack_require__(622),
  url = __webpack_require__(835),
  ssh = __webpack_require__(885),
  HttpDuplex = __webpack_require__(23),
  debug = __webpack_require__(784)('modem'),
  utils = __webpack_require__(75),
  util = __webpack_require__(669),
  url = __webpack_require__(835),
  splitca = __webpack_require__(895),
  isWin = __webpack_require__(87).type() === 'Windows_NT';

var defaultOpts = function () {
  var host;
  var opts = {};

  if (!process.env.DOCKER_HOST) {
    // Windows socket path: //./pipe/docker_engine ( Windows 10 )
    // Linux & Darwin socket path: /var/run/docker.sock
    opts.socketPath = isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock';
  } else if (process.env.DOCKER_HOST.indexOf('unix://') === 0) {
    // Strip off unix://, fall back to default of /var/run/docker.sock if
    // unix:// was passed without a path
    opts.socketPath = process.env.DOCKER_HOST.substring(7) || '/var/run/docker.sock';
  } else if (process.env.DOCKER_HOST.indexOf('npipe://') === 0) {
    // Strip off npipe://, fall back to default of //./pipe/docker_engine if
    // npipe:// was passed without a path
    opts.socketPath = process.env.DOCKER_HOST.substring(8) || '//./pipe/docker_engine';
  } else {
    var hostStr = process.env.DOCKER_HOST;
    if (hostStr.indexOf('\/\/') < 0) {
      hostStr = 'tcp://' + hostStr;
    }
    try {
      host = new url.URL(hostStr);
    } catch (err) {
      throw new Error('DOCKER_HOST env variable should be something like tcp://localhost:1234');
    }

    opts.port = host.port;

    if (process.env.DOCKER_TLS_VERIFY === '1' || opts.port === '2376') {
      opts.protocol = 'https';
    } else if (host.protocol === 'ssh:') {
      opts.protocol = 'ssh';
      opts.username = host.username;
      opts.sshAuthAgent = process.env.SSH_AUTH_SOCK;
    } else {
      opts.protocol = 'http';
    }

    opts.host = host.hostname;

    if (process.env.DOCKER_CERT_PATH) {
      opts.ca = splitca(path.join(process.env.DOCKER_CERT_PATH, 'ca.pem'));
      opts.cert = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'cert.pem'));
      opts.key = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'key.pem'));
    }

    if (process.env.DOCKER_CLIENT_TIMEOUT) {
      opts.timeout = parseInt(process.env.DOCKER_CLIENT_TIMEOUT, 10);
    }
  }

  return opts;
};


var Modem = function (options) {
  var opts = Object.assign({}, defaultOpts(), options);

  this.host = opts.host;

  if(!this.host) {
    this.socketPath = opts.socketPath;
  }

  this.port = opts.port;
  this.username = opts.username;
  this.password = opts.password;
  this.version = opts.version;
  this.key = opts.key;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.timeout = opts.timeout;
  this.connectionTimeout = opts.connectionTimeout;
  this.checkServerIdentity = opts.checkServerIdentity;
  this.agent = opts.agent;
  this.agentForward = opts.agentForward;
  this.headers = opts.headers || {};
  this.sshAuthAgent = opts.sshAuthAgent;

  if (this.key && this.cert && this.ca) {
    this.protocol = 'https';
  }
  this.protocol = opts.protocol || this.protocol || 'http';
};

Modem.prototype.dial = function (options, callback) {
  var opts, address, data;
  var self = this;

  if (options.options) {
    opts = options.options;
  }

  // Prevent credentials from showing up in URL
  if (opts && opts.authconfig) {
    delete opts.authconfig;
  }

  if (this.version) {
    options.path = '/' + this.version + options.path;
  }

  if (this.host) {
    var parsed = url.parse(self.host);
    address = url.format({
      'protocol': parsed.protocol || self.protocol,
      'hostname': parsed.hostname || self.host,
      'port': self.port
    });
    address = url.resolve(address, options.path);
  } else {
    address = options.path;
  }

  if (options.path.indexOf('?') !== -1) {
    if (opts && Object.keys(opts).length > 0) {
      address += this.buildQuerystring(opts._query || opts);
    } else {
      address = address.substring(0, address.length - 1);
    }
  }

  var optionsf = {
    path: address,
    method: options.method,
    headers: options.headers || Object.assign({}, self.headers),
    key: self.key,
    cert: self.cert,
    ca: self.ca
  };

  if (this.checkServerIdentity) {
    optionsf.checkServerIdentity = this.checkServerIdentity;
  }

  if (this.agent) {
    optionsf.agent = this.agent;
  }

  if (options.authconfig) {
    optionsf.headers['X-Registry-Auth'] = options.authconfig.key || options.authconfig.base64 ||
      Buffer.from(JSON.stringify(options.authconfig)).toString('base64');
  }

  if (options.registryconfig) {
    optionsf.headers['X-Registry-Config'] = options.registryconfig.base64 ||
      Buffer.from(JSON.stringify(options.registryconfig)).toString('base64');
  }

  if (options.file) {
    if (typeof options.file === 'string') {
      data = fs.createReadStream(path.resolve(options.file));
    } else {
      data = options.file;
    }
    optionsf.headers['Content-Type'] = 'application/tar';
  } else if (opts && options.method === 'POST') {
    data = JSON.stringify(opts._body || opts);
    if (options.allowEmpty) {
      optionsf.headers['Content-Type'] = 'application/json';
    } else {
      if (data !== '{}' && data !== '""') {
        optionsf.headers['Content-Type'] = 'application/json';
      } else {
        data = undefined;
      }
    }
  }

  if (typeof data === 'string') {
    optionsf.headers['Content-Length'] = Buffer.byteLength(data);
  } else if (Buffer.isBuffer(data) === true) {
    optionsf.headers['Content-Length'] = data.length;
  } else if (optionsf.method === 'PUT' || options.hijack || options.openStdin) {
    optionsf.headers['Transfer-Encoding'] = 'chunked';
  }

  if (options.hijack) {
    optionsf.headers.Connection = 'Upgrade';
    optionsf.headers.Upgrade = 'tcp';
  }

  if (this.socketPath) {
    optionsf.socketPath = this.socketPath;
  } else {
    var urlp = url.parse(address);
    optionsf.hostname = urlp.hostname;
    optionsf.port = urlp.port;
    optionsf.path = urlp.path;
  }

  this.buildRequest(optionsf, options, data, callback);
};

Modem.prototype.buildRequest = function (options, context, data, callback) {
  var self = this;
  var connectionTimeoutTimer;

  var opts = self.protocol === 'ssh' ? Object.assign(options, {
    agent: ssh({ 'host': self.host, 'port': self.port, 'username': self.username, 'password': self.password, 'agent': self.sshAuthAgent, 'agentForward': self.agentForward }),
    protocol: 'http:'
  }) : options;

  var req = http[self.protocol === 'ssh' ? 'http' : self.protocol].request(opts, function () { });

  debug('Sending: %s', util.inspect(options, {
    showHidden: true,
    depth: null
  }));

  if (self.connectionTimeout) {
    connectionTimeoutTimer = setTimeout(function () {
      debug('Connection Timeout of %s ms exceeded', self.connectionTimeout);
      req.abort();
    }, self.connectionTimeout);
  }

  if (self.timeout) {
    req.on('socket', function (socket) {
      socket.setTimeout(self.timeout);
      socket.on('timeout', function () {
        debug('Timeout of %s ms exceeded', self.timeout);
        req.abort();
      });
    });
  }

  if (context.hijack === true) {
    clearTimeout(connectionTimeoutTimer);
    req.on('upgrade', function (res, sock, head) {
      return callback(null, sock);
    });
  }

  req.on('connect', function () {
    clearTimeout(connectionTimeoutTimer);
  });

  req.on('disconnect', function () {
    clearTimeout(connectionTimeoutTimer);
  });

  req.on('response', function (res) {
    clearTimeout(connectionTimeoutTimer);
    if (context.isStream === true) {
      self.buildPayload(null, context.isStream, context.statusCodes, context.openStdin, req, res, null, callback);
    } else {
      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        var buffer = Buffer.concat(chunks);
        var result = buffer.toString();

        debug('Received: %s', result);

        var json = utils.parseJSON(result) || buffer;
        self.buildPayload(null, context.isStream, context.statusCodes, false, req, res, json, callback);
      });
    }
  });

  req.on('error', function (error) {
    clearTimeout(connectionTimeoutTimer);
    self.buildPayload(error, context.isStream, context.statusCodes, false, {}, {}, null, callback);
  });

  if (typeof data === 'string' || Buffer.isBuffer(data)) {
    req.write(data);
  } else if (data) {
    data.pipe(req);
  }

  if (!context.hijack && !context.openStdin && (typeof data === 'string' || data === undefined || Buffer.isBuffer(data))) {
    req.end();
  }
};

Modem.prototype.buildPayload = function (err, isStream, statusCodes, openStdin, req, res, json, cb) {
  if (err) return cb(err, null);

  if (statusCodes[res.statusCode] !== true) {
    getCause(isStream, res, json, function (err, cause) {
      var msg = new Error(
        '(HTTP code ' + res.statusCode + ') ' +
        (statusCodes[res.statusCode] || 'unexpected') + ' - ' +
        (cause.message || cause) + ' '
      );
      msg.reason = statusCodes[res.statusCode];
      msg.statusCode = res.statusCode;
      msg.json = json;
      cb(msg, null);
    });
  } else {
    if (openStdin) {
      cb(null, new HttpDuplex(req, res));
    } else if (isStream) {
      cb(null, res);
    } else {
      cb(null, json);
    }
  }

  function getCause(isStream, res, json, callback) {
    var chunks = '';
    if (isStream) {
      res.on('data', function (chunk) {
        chunks += chunk;
      });
      res.on('end', function () {
        callback(null, utils.parseJSON(chunks) || chunks);
      });
    } else {
      callback(null, json);
    }
  }
};

Modem.prototype.demuxStream = function (stream, stdout, stderr) {
  var nextDataType = null;
  var nextDataLength = null;
  var buffer = Buffer.from('');
  function processData(data) {
    if (data) {
      buffer = Buffer.concat([buffer, data]);
    }
    if (!nextDataType) {
      if (buffer.length >= 8) {
        var header = bufferSlice(8);
        nextDataType = header.readUInt8(0);
        nextDataLength = header.readUInt32BE(4);
        // It's possible we got a "data" that contains multiple messages
        // Process the next one
        processData();
      }
    } else {
      if (buffer.length >= nextDataLength) {
        var content = bufferSlice(nextDataLength);
        if (nextDataType === 1) {
          stdout.write(content);
        } else {
          stderr.write(content);
        }
        nextDataType = null;
        // It's possible we got a "data" that contains multiple messages
        // Process the next one
        processData();
      }
    }
  }

  function bufferSlice(end) {
    var out = buffer.slice(0, end);
    buffer = Buffer.from(buffer.slice(end, buffer.length));
    return out;
  }

  stream.on('data', processData);
};

Modem.prototype.followProgress = function (stream, onFinished, onProgress) {
  var buf = '';
  var output = [];
  var finished = false;

  stream.on('data', onStreamEvent);
  stream.on('error', onStreamError);
  stream.on('end', onStreamEnd);
  stream.on('close', onStreamEnd);

  function onStreamEvent(data) {
    buf += data.toString();
    pump();

    function pump() {
      var pos;
      while ((pos = buf.indexOf('\n')) >= 0) {
        if (pos == 0) {
          buf = buf.slice(1);
          continue;
        }
        processLine(buf.slice(0, pos));
        buf = buf.slice(pos + 1);
      }
    }

    function processLine(line) {
      if (line[line.length - 1] == '\r') line = line.substr(0, line.length - 1);
      if (line.length > 0) {
        var obj = JSON.parse(line);
        output.push(obj);
        if (onProgress) {
          onProgress(obj);
        }
      }
    }
  };

  function onStreamError(err) {
    finished = true;
    stream.removeListener('data', onStreamEvent);
    stream.removeListener('error', onStreamError);
    stream.removeListener('end', onStreamEnd);
    stream.removeListener('close', onStreamEnd);
    onFinished(err, output);
  }

  function onStreamEnd() {
    if(!finished) onFinished(null, output);
    finished = true;
  }
};

Modem.prototype.buildQuerystring = function (opts) {
  var clone = {};

  // serialize map values as JSON strings, else querystring truncates.
  Object.keys(opts).map(function (key, i) {
    clone[key] = opts[key] && typeof opts[key] === 'object' && key !== 't' ?
      JSON.stringify(opts[key]) : opts[key];
  });

  return querystring.stringify(clone);
};

module.exports = Modem;


/***/ }),

/***/ 794:
/***/ (function(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(486)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 798:
/***/ (function(module, __unusedexports, __webpack_require__) {

// TODO:
//    * utilize `crypto.create(Private|Public)Key()` and `keyObject.export()`
//    * handle multi-line header values (OpenSSH)?
//    * more thorough validation?

var crypto = __webpack_require__(417);
var cryptoSign = crypto.sign;
var cryptoVerify = crypto.verify;
var createSign = crypto.createSign;
var createVerify = crypto.createVerify;
var createDecipheriv = crypto.createDecipheriv;
var createHash = crypto.createHash;
var createHmac = crypto.createHmac;
var supportedOpenSSLCiphers = crypto.getCiphers();

var utils;
var Ber = __webpack_require__(62).Ber;
var bcrypt_pbkdf = __webpack_require__(641).pbkdf;

var bufferHelpers = __webpack_require__(523);
var readUInt32BE = bufferHelpers.readUInt32BE;
var writeUInt32BE = bufferHelpers.writeUInt32BE;
var constants = __webpack_require__(801);
var SUPPORTED_CIPHER = constants.ALGORITHMS.SUPPORTED_CIPHER;
var CIPHER_INFO = constants.CIPHER_INFO;
var SSH_TO_OPENSSL = constants.SSH_TO_OPENSSL;
var EDDSA_SUPPORTED = constants.EDDSA_SUPPORTED;

var SYM_HASH_ALGO = Symbol('Hash Algorithm');
var SYM_PRIV_PEM = Symbol('Private key PEM');
var SYM_PUB_PEM = Symbol('Public key PEM');
var SYM_PUB_SSH = Symbol('Public key SSH');
var SYM_DECRYPTED = Symbol('Decrypted Key');

// Create OpenSSL cipher name -> SSH cipher name conversion table
var CIPHER_INFO_OPENSSL = Object.create(null);
(function() {
  var keys = Object.keys(CIPHER_INFO);
  for (var i = 0; i < keys.length; ++i) {
    var cipherName = SSH_TO_OPENSSL[keys[i]];
    if (!cipherName || CIPHER_INFO_OPENSSL[cipherName])
      continue;
    CIPHER_INFO_OPENSSL[cipherName] = CIPHER_INFO[keys[i]];
  }
})();

var trimStart = (function() {
  if (typeof String.prototype.trimStart === 'function') {
    return function trimStart(str) {
      return str.trimStart();
    };
  }

  return function trimStart(str) {
    var start = 0;
    for (var i = 0; i < str.length; ++i) {
      switch (str.charCodeAt(i)) {
        case 32: // ' '
        case 9: // '\t'
        case 13: // '\r'
        case 10: // '\n'
        case 12: // '\f'
          ++start;
          continue;
      }
      break;
    }
    if (start === 0)
      return str;
    return str.slice(start);
  };
})();

function makePEM(type, data) {
  data = data.toString('base64');
  return '-----BEGIN ' + type + ' KEY-----\n'
         + data.replace(/.{64}/g, '$&\n')
         + (data.length % 64 ? '\n' : '')
         + '-----END ' + type + ' KEY-----';
}

function combineBuffers(buf1, buf2) {
  var result = Buffer.allocUnsafe(buf1.length + buf2.length);
  buf1.copy(result, 0);
  buf2.copy(result, buf1.length);
  return result;
}

function skipFields(buf, nfields) {
  var bufLen = buf.length;
  var pos = (buf._pos || 0);
  for (var i = 0; i < nfields; ++i) {
    var left = (bufLen - pos);
    if (pos >= bufLen || left < 4)
      return false;
    var len = readUInt32BE(buf, pos);
    if (left < 4 + len)
      return false;
    pos += 4 + len;
  }
  buf._pos = pos;
  return true;
}

function genOpenSSLRSAPub(n, e) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // algorithm
    asnWriter.startSequence();
      asnWriter.writeOID('1.2.840.113549.1.1.1'); // rsaEncryption
      // algorithm parameters (RSA has none)
      asnWriter.writeNull();
    asnWriter.endSequence();

    // subjectPublicKey
    asnWriter.startSequence(Ber.BitString);
      asnWriter.writeByte(0x00);
      asnWriter.startSequence();
        asnWriter.writeBuffer(n, Ber.Integer);
        asnWriter.writeBuffer(e, Ber.Integer);
      asnWriter.endSequence();
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('PUBLIC', asnWriter.buffer);
}

function genOpenSSHRSAPub(n, e) {
  var publicKey = Buffer.allocUnsafe(4 + 7 // "ssh-rsa"
                                     + 4 + n.length
                                     + 4 + e.length);

  writeUInt32BE(publicKey, 7, 0);
  publicKey.write('ssh-rsa', 4, 7, 'ascii');

  var i = 4 + 7;
  writeUInt32BE(publicKey, e.length, i);
  e.copy(publicKey, i += 4);

  writeUInt32BE(publicKey, n.length, i += e.length);
  n.copy(publicKey, i + 4);

  return publicKey;
}

var genOpenSSLRSAPriv = (function() {
  function genRSAASN1Buf(n, e, d, p, q, dmp1, dmq1, iqmp) {
    var asnWriter = new Ber.Writer();
    asnWriter.startSequence();
      asnWriter.writeInt(0x00, Ber.Integer);
      asnWriter.writeBuffer(n, Ber.Integer);
      asnWriter.writeBuffer(e, Ber.Integer);
      asnWriter.writeBuffer(d, Ber.Integer);
      asnWriter.writeBuffer(p, Ber.Integer);
      asnWriter.writeBuffer(q, Ber.Integer);
      asnWriter.writeBuffer(dmp1, Ber.Integer);
      asnWriter.writeBuffer(dmq1, Ber.Integer);
      asnWriter.writeBuffer(iqmp, Ber.Integer);
    asnWriter.endSequence();
    return asnWriter.buffer;
  }

  function bigIntFromBuffer(buf) {
    return BigInt('0x' + buf.toString('hex'));
  }

  function bigIntToBuffer(bn) {
    var hex = bn.toString(16);
    if ((hex.length & 1) !== 0) {
      hex = '0' + hex;
    } else {
      var sigbit = hex.charCodeAt(0);
      // BER/DER integers require leading zero byte to denote a positive value
      // when first byte >= 0x80
      if (sigbit === 56 || (sigbit >= 97 && sigbit <= 102))
        hex = '00' + hex;
    }
    return Buffer.from(hex, 'hex');
  }

  // Feature detect native BigInt availability and use it when possible
  try {
    var code = [
      'return function genOpenSSLRSAPriv(n, e, d, iqmp, p, q) {',
      '  var bn_d = bigIntFromBuffer(d);',
      '  var dmp1 = bigIntToBuffer(bn_d % (bigIntFromBuffer(p) - 1n));',
      '  var dmq1 = bigIntToBuffer(bn_d % (bigIntFromBuffer(q) - 1n));',
      '  return makePEM(\'RSA PRIVATE\', '
        + 'genRSAASN1Buf(n, e, d, p, q, dmp1, dmq1, iqmp));',
      '};'
    ].join('\n');
    return new Function(
      'bigIntFromBuffer, bigIntToBuffer, makePEM, genRSAASN1Buf',
      code
    )(bigIntFromBuffer, bigIntToBuffer, makePEM, genRSAASN1Buf);
  } catch (ex) {
    return (function() {
      var BigInteger = __webpack_require__(652);
      return function genOpenSSLRSAPriv(n, e, d, iqmp, p, q) {
        var pbi = new BigInteger(p, 256);
        var qbi = new BigInteger(q, 256);
        var dbi = new BigInteger(d, 256);
        var dmp1bi = dbi.mod(pbi.subtract(BigInteger.ONE));
        var dmq1bi = dbi.mod(qbi.subtract(BigInteger.ONE));
        var dmp1 = Buffer.from(dmp1bi.toByteArray());
        var dmq1 = Buffer.from(dmq1bi.toByteArray());
        return makePEM('RSA PRIVATE',
                       genRSAASN1Buf(n, e, d, p, q, dmp1, dmq1, iqmp));
      };
    })();
  }
})();

function genOpenSSLDSAPub(p, q, g, y) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // algorithm
    asnWriter.startSequence();
      asnWriter.writeOID('1.2.840.10040.4.1'); // id-dsa
      // algorithm parameters
      asnWriter.startSequence();
        asnWriter.writeBuffer(p, Ber.Integer);
        asnWriter.writeBuffer(q, Ber.Integer);
        asnWriter.writeBuffer(g, Ber.Integer);
      asnWriter.endSequence();
    asnWriter.endSequence();

    // subjectPublicKey
    asnWriter.startSequence(Ber.BitString);
      asnWriter.writeByte(0x00);
      asnWriter.writeBuffer(y, Ber.Integer);
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('PUBLIC', asnWriter.buffer);
}

function genOpenSSHDSAPub(p, q, g, y) {
  var publicKey = Buffer.allocUnsafe(4 + 7 // ssh-dss
                                     + 4 + p.length
                                     + 4 + q.length
                                     + 4 + g.length
                                     + 4 + y.length);

  writeUInt32BE(publicKey, 7, 0);
  publicKey.write('ssh-dss', 4, 7, 'ascii');

  var i = 4 + 7;
  writeUInt32BE(publicKey, p.length, i);
  p.copy(publicKey, i += 4);

  writeUInt32BE(publicKey, q.length, i += p.length);
  q.copy(publicKey, i += 4);

  writeUInt32BE(publicKey, g.length, i += q.length);
  g.copy(publicKey, i += 4);

  writeUInt32BE(publicKey, y.length, i += g.length);
  y.copy(publicKey, i + 4);

  return publicKey;
}

function genOpenSSLDSAPriv(p, q, g, y, x) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    asnWriter.writeInt(0x00, Ber.Integer);
    asnWriter.writeBuffer(p, Ber.Integer);
    asnWriter.writeBuffer(q, Ber.Integer);
    asnWriter.writeBuffer(g, Ber.Integer);
    asnWriter.writeBuffer(y, Ber.Integer);
    asnWriter.writeBuffer(x, Ber.Integer);
  asnWriter.endSequence();
  return makePEM('DSA PRIVATE', asnWriter.buffer);
}

function genOpenSSLEdPub(pub) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // algorithm
    asnWriter.startSequence();
      asnWriter.writeOID('1.3.101.112'); // id-Ed25519
    asnWriter.endSequence();

    // PublicKey
    asnWriter.startSequence(Ber.BitString);
      asnWriter.writeByte(0x00);
      // XXX: hack to write a raw buffer without a tag -- yuck
      asnWriter._ensure(pub.length);
      pub.copy(asnWriter._buf, asnWriter._offset, 0, pub.length);
      asnWriter._offset += pub.length;
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('PUBLIC', asnWriter.buffer);
}

function genOpenSSHEdPub(pub) {
  var publicKey = Buffer.allocUnsafe(4 + 11 // ssh-ed25519
                                     + 4 + pub.length);

  writeUInt32BE(publicKey, 11, 0);
  publicKey.write('ssh-ed25519', 4, 11, 'ascii');

  writeUInt32BE(publicKey, pub.length, 15);
  pub.copy(publicKey, 19);

  return publicKey;
}

function genOpenSSLEdPriv(priv) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // version
    asnWriter.writeInt(0x00, Ber.Integer);

    // algorithm
    asnWriter.startSequence();
      asnWriter.writeOID('1.3.101.112'); // id-Ed25519
    asnWriter.endSequence();

    // PrivateKey
    asnWriter.startSequence(Ber.OctetString);
      asnWriter.writeBuffer(priv, Ber.OctetString);
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('PRIVATE', asnWriter.buffer);
}

function genOpenSSLECDSAPub(oid, Q) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // algorithm
    asnWriter.startSequence();
      asnWriter.writeOID('1.2.840.10045.2.1'); // id-ecPublicKey
      // algorithm parameters (namedCurve)
      asnWriter.writeOID(oid);
    asnWriter.endSequence();

    // subjectPublicKey
    asnWriter.startSequence(Ber.BitString);
      asnWriter.writeByte(0x00);
      // XXX: hack to write a raw buffer without a tag -- yuck
      asnWriter._ensure(Q.length);
      Q.copy(asnWriter._buf, asnWriter._offset, 0, Q.length);
      asnWriter._offset += Q.length;
      // end hack
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('PUBLIC', asnWriter.buffer);
}

function genOpenSSHECDSAPub(oid, Q) {
  var curveName;
  switch (oid) {
    case '1.2.840.10045.3.1.7':
      // prime256v1/secp256r1
      curveName = 'nistp256';
      break;
    case '1.3.132.0.34':
      // secp384r1
      curveName = 'nistp384';
      break;
    case '1.3.132.0.35':
      // secp521r1
      curveName = 'nistp521';
      break;
    default:
      return;
  }

  var publicKey = Buffer.allocUnsafe(4 + 19 // ecdsa-sha2-<curve name>
                                     + 4 + 8 // <curve name>
                                     + 4 + Q.length);

  writeUInt32BE(publicKey, 19, 0);
  publicKey.write('ecdsa-sha2-' + curveName, 4, 19, 'ascii');

  writeUInt32BE(publicKey, 8, 23);
  publicKey.write(curveName, 27, 8, 'ascii');

  writeUInt32BE(publicKey, Q.length, 35);
  Q.copy(publicKey, 39);

  return publicKey;
}

function genOpenSSLECDSAPriv(oid, pub, priv) {
  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
    // version
    asnWriter.writeInt(0x01, Ber.Integer);
    // privateKey
    asnWriter.writeBuffer(priv, Ber.OctetString);
    // parameters (optional)
    asnWriter.startSequence(0xA0);
      asnWriter.writeOID(oid);
    asnWriter.endSequence();
    // publicKey (optional)
    asnWriter.startSequence(0xA1);
      asnWriter.startSequence(Ber.BitString);
        asnWriter.writeByte(0x00);
        // XXX: hack to write a raw buffer without a tag -- yuck
        asnWriter._ensure(pub.length);
        pub.copy(asnWriter._buf, asnWriter._offset, 0, pub.length);
        asnWriter._offset += pub.length;
        // end hack
      asnWriter.endSequence();
    asnWriter.endSequence();
  asnWriter.endSequence();
  return makePEM('EC PRIVATE', asnWriter.buffer);
}

function genOpenSSLECDSAPubFromPriv(curveName, priv) {
  var tempECDH = crypto.createECDH(curveName);
  tempECDH.setPrivateKey(priv);
  return tempECDH.getPublicKey();
}

var baseKeySign = (function() {
  if (typeof cryptoSign === 'function') {
    return function sign(data) {
      var pem = this[SYM_PRIV_PEM];
      if (pem === null)
        return new Error('No private key available');
      try {
        return cryptoSign(this[SYM_HASH_ALGO], data, pem);
      } catch (ex) {
        return ex;
      }
    };
  } else {
    function trySign(signature, privKey) {
      try {
        return signature.sign(privKey);
      } catch (ex) {
        return ex;
      }
    }

    return function sign(data) {
      var pem = this[SYM_PRIV_PEM];
      if (pem === null)
        return new Error('No private key available');
      var signature = createSign(this[SYM_HASH_ALGO]);
      signature.update(data);
      return trySign(signature, pem);
    };
  }
})();

var baseKeyVerify = (function() {
  if (typeof cryptoVerify === 'function') {
    return function verify(data, signature) {
      var pem = this[SYM_PUB_PEM];
      if (pem === null)
        return new Error('No public key available');
      try {
        return cryptoVerify(this[SYM_HASH_ALGO], data, pem, signature);
      } catch (ex) {
        return ex;
      }
    };
  } else {
    function tryVerify(verifier, pubKey, signature) {
      try {
        return verifier.verify(pubKey, signature);
      } catch (ex) {
        return ex;
      }
    }

    return function verify(data, signature) {
      var pem = this[SYM_PUB_PEM];
      if (pem === null)
        return new Error('No public key available');
      var verifier = createVerify(this[SYM_HASH_ALGO]);
      verifier.update(data);
      return tryVerify(verifier, pem, signature);
    };
  }
})();

var BaseKey = {
  sign: baseKeySign,
  verify: baseKeyVerify,
  getPrivatePEM: function getPrivatePEM() {
    return this[SYM_PRIV_PEM];
  },
  getPublicPEM: function getPublicPEM() {
    return this[SYM_PUB_PEM];
  },
  getPublicSSH: function getPublicSSH() {
    return this[SYM_PUB_SSH];
  },
};



function OpenSSH_Private(type, comment, privPEM, pubPEM, pubSSH, algo, decrypted) {
  this.type = type;
  this.comment = comment;
  this[SYM_PRIV_PEM] = privPEM;
  this[SYM_PUB_PEM] = pubPEM;
  this[SYM_PUB_SSH] = pubSSH;
  this[SYM_HASH_ALGO] = algo;
  this[SYM_DECRYPTED] = decrypted;
}
OpenSSH_Private.prototype = BaseKey;
(function() {
  var regexp = /^-----BEGIN OPENSSH PRIVATE KEY-----(?:\r\n|\n)([\s\S]+)(?:\r\n|\n)-----END OPENSSH PRIVATE KEY-----$/;
  OpenSSH_Private.parse = function(str, passphrase) {
    var m = regexp.exec(str);
    if (m === null)
      return null;
    var ret;
    var data = Buffer.from(m[1], 'base64');
    if (data.length < 31) // magic (+ magic null term.) + minimum field lengths
      return new Error('Malformed OpenSSH private key');
    var magic = data.toString('ascii', 0, 15);
    if (magic !== 'openssh-key-v1\0')
      return new Error('Unsupported OpenSSH key magic: ' + magic);

    // avoid cyclic require by requiring on first use
    if (!utils)
      utils = __webpack_require__(780);

    var cipherName = utils.readString(data, 15, 'ascii');
    if (cipherName === false)
      return new Error('Malformed OpenSSH private key');
    if (cipherName !== 'none' && SUPPORTED_CIPHER.indexOf(cipherName) === -1)
      return new Error('Unsupported cipher for OpenSSH key: ' + cipherName);

    var kdfName = utils.readString(data, data._pos, 'ascii');
    if (kdfName === false)
      return new Error('Malformed OpenSSH private key');
    if (kdfName !== 'none') {
      if (cipherName === 'none')
        return new Error('Malformed OpenSSH private key');
      if (kdfName !== 'bcrypt')
        return new Error('Unsupported kdf name for OpenSSH key: ' + kdfName);
      if (!passphrase) {
        return new Error(
          'Encrypted private OpenSSH key detected, but no passphrase given'
        );
      }
    } else if (cipherName !== 'none') {
      return new Error('Malformed OpenSSH private key');
    }

    var encInfo;
    var cipherKey;
    var cipherIV;
    if (cipherName !== 'none')
      encInfo = CIPHER_INFO[cipherName];
    var kdfOptions = utils.readString(data, data._pos);
    if (kdfOptions === false)
      return new Error('Malformed OpenSSH private key');
    if (kdfOptions.length) {
      switch (kdfName) {
        case 'none':
          return new Error('Malformed OpenSSH private key');
        case 'bcrypt':
          /*
            string salt
            uint32 rounds
          */
          var salt = utils.readString(kdfOptions, 0);
          if (salt === false || kdfOptions._pos + 4 > kdfOptions.length)
            return new Error('Malformed OpenSSH private key');
          var rounds = readUInt32BE(kdfOptions, kdfOptions._pos);
          var gen = Buffer.allocUnsafe(encInfo.keyLen + encInfo.ivLen);
          var r = bcrypt_pbkdf(passphrase,
                               passphrase.length,
                               salt,
                               salt.length,
                               gen,
                               gen.length,
                               rounds);
          if (r !== 0)
            return new Error('Failed to generate information to decrypt key');
          cipherKey = gen.slice(0, encInfo.keyLen);
          cipherIV = gen.slice(encInfo.keyLen);
          break;
      }
    } else if (kdfName !== 'none') {
      return new Error('Malformed OpenSSH private key');
    }

    var keyCount = utils.readInt(data, data._pos);
    if (keyCount === false)
      return new Error('Malformed OpenSSH private key');
    data._pos += 4;

    if (keyCount > 0) {
      // TODO: place sensible limit on max `keyCount`

      // Read public keys first
      for (var i = 0; i < keyCount; ++i) {
        var pubData = utils.readString(data, data._pos);
        if (pubData === false)
          return new Error('Malformed OpenSSH private key');
        var type = utils.readString(pubData, 0, 'ascii');
        if (type === false)
          return new Error('Malformed OpenSSH private key');
      }

      var privBlob = utils.readString(data, data._pos);
      if (privBlob === false)
        return new Error('Malformed OpenSSH private key');

      if (cipherKey !== undefined) {
        // encrypted private key(s)
        if (privBlob.length < encInfo.blockLen
            || (privBlob.length % encInfo.blockLen) !== 0) {
          return new Error('Malformed OpenSSH private key');
        }
        try {
          var options = { authTagLength: encInfo.authLen };
          var decipher = createDecipheriv(SSH_TO_OPENSSL[cipherName],
                                          cipherKey,
                                          cipherIV,
                                          options);
          if (encInfo.authLen > 0) {
            if (data.length - data._pos < encInfo.authLen)
              return new Error('Malformed OpenSSH private key');
            decipher.setAuthTag(
              data.slice(data._pos, data._pos += encInfo.authLen)
            );
          }
          privBlob = combineBuffers(decipher.update(privBlob),
                                    decipher.final());
        } catch (ex) {
          return ex;
        }
      }
      // Nothing should we follow the private key(s), except a possible
      // authentication tag for relevant ciphers
      if (data._pos !== data.length)
        return new Error('Malformed OpenSSH private key');

      ret = parseOpenSSHPrivKeys(privBlob, keyCount, cipherKey !== undefined);
    } else {
      ret = [];
    }
    return ret;
  };

  function parseOpenSSHPrivKeys(data, nkeys, decrypted) {
    var keys = [];
    /*
      uint32	checkint
      uint32	checkint
      string	privatekey1
      string	comment1
      string	privatekey2
      string	comment2
      ...
      string	privatekeyN
      string	commentN
      char	1
      char	2
      char	3
      ...
      char	padlen % 255
    */
    if (data.length < 8)
      return new Error('Malformed OpenSSH private key');
    var check1 = readUInt32BE(data, 0);
    var check2 = readUInt32BE(data, 4);
    if (check1 !== check2) {
      if (decrypted)
        return new Error('OpenSSH key integrity check failed -- bad passphrase?');
      return new Error('OpenSSH key integrity check failed');
    }
    data._pos = 8;
    var i;
    var oid;
    for (i = 0; i < nkeys; ++i) {
      var algo = undefined;
      var privPEM = undefined;
      var pubPEM = undefined;
      var pubSSH = undefined;
      // The OpenSSH documentation for the key format actually lies, the entirety
      // of the private key content is not contained with a string field, it's
      // actually the literal contents of the private key, so to be able to find
      // the end of the key data you need to know the layout/format of each key
      // type ...
      var type = utils.readString(data, data._pos, 'ascii');
      if (type === false)
        return new Error('Malformed OpenSSH private key');

      switch (type) {
        case 'ssh-rsa':
          /*
            string  n -- public
            string  e -- public
            string  d -- private
            string  iqmp -- private
            string  p -- private
            string  q -- private
          */
          var n = utils.readString(data, data._pos);
          if (n === false)
            return new Error('Malformed OpenSSH private key');
          var e = utils.readString(data, data._pos);
          if (e === false)
            return new Error('Malformed OpenSSH private key');
          var d = utils.readString(data, data._pos);
          if (d === false)
            return new Error('Malformed OpenSSH private key');
          var iqmp = utils.readString(data, data._pos);
          if (iqmp === false)
            return new Error('Malformed OpenSSH private key');
          var p = utils.readString(data, data._pos);
          if (p === false)
            return new Error('Malformed OpenSSH private key');
          var q = utils.readString(data, data._pos);
          if (q === false)
            return new Error('Malformed OpenSSH private key');

          pubPEM = genOpenSSLRSAPub(n, e);
          pubSSH = genOpenSSHRSAPub(n, e);
          privPEM = genOpenSSLRSAPriv(n, e, d, iqmp, p, q);
          algo = 'sha1';
          break;
        case 'ssh-dss':
          /*
            string  p -- public
            string  q -- public
            string  g -- public
            string  y -- public
            string  x -- private
          */
          var p = utils.readString(data, data._pos);
          if (p === false)
            return new Error('Malformed OpenSSH private key');
          var q = utils.readString(data, data._pos);
          if (q === false)
            return new Error('Malformed OpenSSH private key');
          var g = utils.readString(data, data._pos);
          if (g === false)
            return new Error('Malformed OpenSSH private key');
          var y = utils.readString(data, data._pos);
          if (y === false)
            return new Error('Malformed OpenSSH private key');
          var x = utils.readString(data, data._pos);
          if (x === false)
            return new Error('Malformed OpenSSH private key');

          pubPEM = genOpenSSLDSAPub(p, q, g, y);
          pubSSH = genOpenSSHDSAPub(p, q, g, y);
          privPEM = genOpenSSLDSAPriv(p, q, g, y, x);
          algo = 'sha1';
          break;
        case 'ssh-ed25519':
          if (!EDDSA_SUPPORTED)
            return new Error('Unsupported OpenSSH private key type: ' + type);
          /*
            * string  public key
            * string  private key + public key
          */
          var edpub = utils.readString(data, data._pos);
          if (edpub === false || edpub.length !== 32)
            return new Error('Malformed OpenSSH private key');
          var edpriv = utils.readString(data, data._pos);
          if (edpriv === false || edpriv.length !== 64)
            return new Error('Malformed OpenSSH private key');

          pubPEM = genOpenSSLEdPub(edpub);
          pubSSH = genOpenSSHEdPub(edpub);
          privPEM = genOpenSSLEdPriv(edpriv.slice(0, 32));
          algo = null;
          break;
        case 'ecdsa-sha2-nistp256':
          algo = 'sha256';
          oid = '1.2.840.10045.3.1.7';
        case 'ecdsa-sha2-nistp384':
          if (algo === undefined) {
            algo = 'sha384';
            oid = '1.3.132.0.34';
          }
        case 'ecdsa-sha2-nistp521':
          if (algo === undefined) {
            algo = 'sha512';
            oid = '1.3.132.0.35';
          }
          /*
            string  curve name
            string  Q -- public
            string  d -- private
          */
          // TODO: validate curve name against type
          if (!skipFields(data, 1)) // Skip curve name
            return new Error('Malformed OpenSSH private key');
          var ecpub = utils.readString(data, data._pos);
          if (ecpub === false)
            return new Error('Malformed OpenSSH private key');
          var ecpriv = utils.readString(data, data._pos);
          if (ecpriv === false)
            return new Error('Malformed OpenSSH private key');

          pubPEM = genOpenSSLECDSAPub(oid, ecpub);
          pubSSH = genOpenSSHECDSAPub(oid, ecpub);
          privPEM = genOpenSSLECDSAPriv(oid, ecpub, ecpriv);
          break;
        default:
          return new Error('Unsupported OpenSSH private key type: ' + type);
      }

      var privComment = utils.readString(data, data._pos, 'utf8');
      if (privComment === false)
        return new Error('Malformed OpenSSH private key');

      keys.push(
        new OpenSSH_Private(type, privComment, privPEM, pubPEM, pubSSH, algo,
                            decrypted)
      );
    }
    var cnt = 0;
    for (i = data._pos; i < data.length; ++i) {
      if (data[i] !== (++cnt % 255))
        return new Error('Malformed OpenSSH private key');
    }

    return keys;
  }
})();



function OpenSSH_Old_Private(type, comment, privPEM, pubPEM, pubSSH, algo, decrypted) {
  this.type = type;
  this.comment = comment;
  this[SYM_PRIV_PEM] = privPEM;
  this[SYM_PUB_PEM] = pubPEM;
  this[SYM_PUB_SSH] = pubSSH;
  this[SYM_HASH_ALGO] = algo;
  this[SYM_DECRYPTED] = decrypted;
}
OpenSSH_Old_Private.prototype = BaseKey;
(function() {
  var regexp = /^-----BEGIN (RSA|DSA|EC) PRIVATE KEY-----(?:\r\n|\n)((?:[^:]+:\s*[\S].*(?:\r\n|\n))*)([\s\S]+)(?:\r\n|\n)-----END (RSA|DSA|EC) PRIVATE KEY-----$/;
  OpenSSH_Old_Private.parse = function(str, passphrase) {
    var m = regexp.exec(str);
    if (m === null)
      return null;
    var privBlob = Buffer.from(m[3], 'base64');
    var headers = m[2];
    var decrypted = false;
    if (headers !== undefined) {
      // encrypted key
      headers = headers.split(/\r\n|\n/g);
      for (var i = 0; i < headers.length; ++i) {
        var header = headers[i];
        var sepIdx = header.indexOf(':');
        if (header.slice(0, sepIdx) === 'DEK-Info') {
          var val = header.slice(sepIdx + 2);
          sepIdx = val.indexOf(',');
          if (sepIdx === -1)
            continue;
          var cipherName = val.slice(0, sepIdx).toLowerCase();
          if (supportedOpenSSLCiphers.indexOf(cipherName) === -1) {
            return new Error(
              'Cipher ('
              + cipherName
              + ') not supported for encrypted OpenSSH private key'
            );
          }
          var encInfo = CIPHER_INFO_OPENSSL[cipherName];
          if (!encInfo) {
            return new Error(
              'Cipher ('
              + cipherName
              + ') not supported for encrypted OpenSSH private key'
            );
          }
          var cipherIV = Buffer.from(val.slice(sepIdx + 1), 'hex');
          if (cipherIV.length !== encInfo.ivLen)
            return new Error('Malformed encrypted OpenSSH private key');
          if (!passphrase) {
            return new Error(
              'Encrypted OpenSSH private key detected, but no passphrase given'
            );
          }
          var cipherKey = createHash('md5')
                            .update(passphrase)
                            .update(cipherIV.slice(0, 8))
                            .digest();
          while (cipherKey.length < encInfo.keyLen) {
            cipherKey = combineBuffers(
              cipherKey,
              (createHash('md5')
                .update(cipherKey)
                .update(passphrase)
                .update(cipherIV)
                .digest()).slice(0, 8)
            );
          }
          if (cipherKey.length > encInfo.keyLen)
            cipherKey = cipherKey.slice(0, encInfo.keyLen);
          try {
            var decipher = createDecipheriv(cipherName, cipherKey, cipherIV);
            decipher.setAutoPadding(false);
            privBlob = combineBuffers(decipher.update(privBlob),
                                      decipher.final());
            decrypted = true;
          } catch (ex) {
            return ex;
          }
        }
      }
    }

    var type;
    var privPEM;
    var pubPEM;
    var pubSSH;
    var algo;
    var reader;
    var errMsg = 'Malformed OpenSSH private key';
    if (decrypted)
      errMsg += '. Bad passphrase?';
    switch (m[1]) {
      case 'RSA':
        type = 'ssh-rsa';
        privPEM = makePEM('RSA PRIVATE', privBlob);
        try {
          reader = new Ber.Reader(privBlob);
          reader.readSequence();
          reader.readInt(); // skip version
          var n = reader.readString(Ber.Integer, true);
          if (n === null)
            return new Error(errMsg);
          var e = reader.readString(Ber.Integer, true);
          if (e === null)
            return new Error(errMsg);
          pubPEM = genOpenSSLRSAPub(n, e);
          pubSSH = genOpenSSHRSAPub(n, e);
        } catch (ex) {
          return new Error(errMsg);
        }
        algo = 'sha1';
        break;
      case 'DSA':
        type = 'ssh-dss';
        privPEM = makePEM('DSA PRIVATE', privBlob);
        try {
          reader = new Ber.Reader(privBlob);
          reader.readSequence();
          reader.readInt(); // skip version
          var p = reader.readString(Ber.Integer, true);
          if (p === null)
            return new Error(errMsg);
          var q = reader.readString(Ber.Integer, true);
          if (q === null)
            return new Error(errMsg);
          var g = reader.readString(Ber.Integer, true);
          if (g === null)
            return new Error(errMsg);
          var y = reader.readString(Ber.Integer, true);
          if (y === null)
            return new Error(errMsg);
          pubPEM = genOpenSSLDSAPub(p, q, g, y);
          pubSSH = genOpenSSHDSAPub(p, q, g, y);
        } catch (ex) {
          return new Error(errMsg);
        }
        algo = 'sha1';
        break;
      case 'EC':
        var ecSSLName;
        var ecPriv;
        try {
          reader = new Ber.Reader(privBlob);
          reader.readSequence();
          reader.readInt(); // skip version
          ecPriv = reader.readString(Ber.OctetString, true);
          reader.readByte(); // Skip "complex" context type byte
          var offset = reader.readLength(); // Skip context length
          if (offset !== null) {
            reader._offset = offset;
            var oid = reader.readOID();
            if (oid === null)
              return new Error(errMsg);
            switch (oid) {
              case '1.2.840.10045.3.1.7':
                // prime256v1/secp256r1
                ecSSLName = 'prime256v1';
                type = 'ecdsa-sha2-nistp256';
                algo = 'sha256';
                break;
              case '1.3.132.0.34':
                // secp384r1
                ecSSLName = 'secp384r1';
                type = 'ecdsa-sha2-nistp384';
                algo = 'sha384';
                break;
              case '1.3.132.0.35':
                // secp521r1
                ecSSLName = 'secp521r1';
                type = 'ecdsa-sha2-nistp521';
                algo = 'sha512';
                break;
              default:
                return new Error('Unsupported private key EC OID: ' + oid);
            }
          } else {
            return new Error(errMsg);
          }
        } catch (ex) {
          return new Error(errMsg);
        }
        privPEM = makePEM('EC PRIVATE', privBlob);
        var pubBlob = genOpenSSLECDSAPubFromPriv(ecSSLName, ecPriv);
        pubPEM = genOpenSSLECDSAPub(oid, pubBlob);
        pubSSH = genOpenSSHECDSAPub(oid, pubBlob);
        break;
    }

    return new OpenSSH_Old_Private(type, '', privPEM, pubPEM, pubSSH, algo,
                                   decrypted);
  };
})();



function PPK_Private(type, comment, privPEM, pubPEM, pubSSH, algo, decrypted) {
  this.type = type;
  this.comment = comment;
  this[SYM_PRIV_PEM] = privPEM;
  this[SYM_PUB_PEM] = pubPEM;
  this[SYM_PUB_SSH] = pubSSH;
  this[SYM_HASH_ALGO] = algo;
  this[SYM_DECRYPTED] = decrypted;
}
PPK_Private.prototype = BaseKey;
(function() {
  var EMPTY_PASSPHRASE = Buffer.alloc(0);
  var PPK_IV = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var PPK_PP1 = Buffer.from([0, 0, 0, 0]);
  var PPK_PP2 = Buffer.from([0, 0, 0, 1]);
  var regexp = /^PuTTY-User-Key-File-2: (ssh-(?:rsa|dss))\r?\nEncryption: (aes256-cbc|none)\r?\nComment: ([^\r\n]*)\r?\nPublic-Lines: \d+\r?\n([\s\S]+?)\r?\nPrivate-Lines: \d+\r?\n([\s\S]+?)\r?\nPrivate-MAC: ([^\r\n]+)/;
  PPK_Private.parse = function(str, passphrase) {
    var m = regexp.exec(str);
    if (m === null)
      return null;
    // m[1] = key type
    // m[2] = encryption type
    // m[3] = comment
    // m[4] = base64-encoded public key data:
    //         for "ssh-rsa":
    //          string "ssh-rsa"
    //          mpint  e    (public exponent)
    //          mpint  n    (modulus)
    //         for "ssh-dss":
    //          string "ssh-dss"
    //          mpint p     (modulus)
    //          mpint q     (prime)
    //          mpint g     (base number)
    //          mpint y     (public key parameter: g^x mod p)
    // m[5] = base64-encoded private key data:
    //         for "ssh-rsa":
    //          mpint  d    (private exponent)
    //          mpint  p    (prime 1)
    //          mpint  q    (prime 2)
    //          mpint  iqmp ([inverse of q] mod p)
    //         for "ssh-dss":
    //          mpint x     (private key parameter)
    // m[6] = SHA1 HMAC over:
    //          string  name of algorithm ("ssh-dss", "ssh-rsa")
    //          string  encryption type
    //          string  comment
    //          string  public key data
    //          string  private-plaintext (including the final padding)
    var cipherName = m[2];
    var encrypted = (cipherName !== 'none');
    if (encrypted && !passphrase) {
      return new Error(
        'Encrypted PPK private key detected, but no passphrase given'
      );
    }

    var privBlob = Buffer.from(m[5], 'base64');

    if (encrypted) {
      var encInfo = CIPHER_INFO[cipherName];
      var cipherKey = combineBuffers(
        createHash('sha1').update(PPK_PP1).update(passphrase).digest(),
        createHash('sha1').update(PPK_PP2).update(passphrase).digest()
      );
      if (cipherKey.length > encInfo.keyLen)
        cipherKey = cipherKey.slice(0, encInfo.keyLen);
      try {
        var decipher = createDecipheriv(SSH_TO_OPENSSL[cipherName],
                                        cipherKey,
                                        PPK_IV);
        decipher.setAutoPadding(false);
        privBlob = combineBuffers(decipher.update(privBlob),
                                  decipher.final());
        decrypted = true;
      } catch (ex) {
        return ex;
      }
    }

    var type = m[1];
    var comment = m[3];
    var pubBlob = Buffer.from(m[4], 'base64');

    var mac = m[6];
    var typeLen = type.length;
    var cipherNameLen = cipherName.length;
    var commentLen = Buffer.byteLength(comment);
    var pubLen = pubBlob.length;
    var privLen = privBlob.length;
    var macData = Buffer.allocUnsafe(4 + typeLen
                                     + 4 + cipherNameLen
                                     + 4 + commentLen
                                     + 4 + pubLen
                                     + 4 + privLen);
    var p = 0;

    writeUInt32BE(macData, typeLen, p);
    macData.write(type, p += 4, typeLen, 'ascii');
    writeUInt32BE(macData, cipherNameLen, p += typeLen);
    macData.write(cipherName, p += 4, cipherNameLen, 'ascii');
    writeUInt32BE(macData, commentLen, p += cipherNameLen);
    macData.write(comment, p += 4, commentLen, 'utf8');
    writeUInt32BE(macData, pubLen, p += commentLen);
    pubBlob.copy(macData, p += 4);
    writeUInt32BE(macData, privLen, p += pubLen);
    privBlob.copy(macData, p + 4);

    if (!passphrase)
      passphrase = EMPTY_PASSPHRASE;

    var calcMAC = createHmac('sha1',
                             createHash('sha1')
                               .update('putty-private-key-file-mac-key')
                               .update(passphrase)
                               .digest())
                    .update(macData)
                    .digest('hex');

    if (calcMAC !== mac) {
      if (encrypted) {
        return new Error(
          'PPK private key integrity check failed -- bad passphrase?'
        );
      } else {
        return new Error('PPK private key integrity check failed');
      }
    }

    // avoid cyclic require by requiring on first use
    if (!utils)
      utils = __webpack_require__(780);

    var pubPEM;
    var pubSSH;
    var privPEM;
    pubBlob._pos = 0;
    skipFields(pubBlob, 1); // skip (duplicate) key type
    switch (type) {
      case 'ssh-rsa':
        var e = utils.readString(pubBlob, pubBlob._pos);
        if (e === false)
          return new Error('Malformed PPK public key');
        var n = utils.readString(pubBlob, pubBlob._pos);
        if (n === false)
          return new Error('Malformed PPK public key');
        var d = utils.readString(privBlob, 0);
        if (d === false)
          return new Error('Malformed PPK private key');
        var p = utils.readString(privBlob, privBlob._pos);
        if (p === false)
          return new Error('Malformed PPK private key');
        var q = utils.readString(privBlob, privBlob._pos);
        if (q === false)
          return new Error('Malformed PPK private key');
        var iqmp = utils.readString(privBlob, privBlob._pos);
        if (iqmp === false)
          return new Error('Malformed PPK private key');
        pubPEM = genOpenSSLRSAPub(n, e);
        pubSSH = genOpenSSHRSAPub(n, e);
        privPEM = genOpenSSLRSAPriv(n, e, d, iqmp, p, q);
        break;
      case 'ssh-dss':
        var p = utils.readString(pubBlob, pubBlob._pos);
        if (p === false)
          return new Error('Malformed PPK public key');
        var q = utils.readString(pubBlob, pubBlob._pos);
        if (q === false)
          return new Error('Malformed PPK public key');
        var g = utils.readString(pubBlob, pubBlob._pos);
        if (g === false)
          return new Error('Malformed PPK public key');
        var y = utils.readString(pubBlob, pubBlob._pos);
        if (y === false)
          return new Error('Malformed PPK public key');
        var x = utils.readString(privBlob, 0);
        if (x === false)
          return new Error('Malformed PPK private key');

        pubPEM = genOpenSSLDSAPub(p, q, g, y);
        pubSSH = genOpenSSHDSAPub(p, q, g, y);
        privPEM = genOpenSSLDSAPriv(p, q, g, y, x);
        break;
    }

    return new PPK_Private(type, comment, privPEM, pubPEM, pubSSH, 'sha1',
                           encrypted);
  };
})();


function parseDER(data, baseType, comment, fullType) {
  // avoid cyclic require by requiring on first use
  if (!utils)
    utils = __webpack_require__(780);

  var algo;
  var pubPEM = null;
  var pubSSH = null;
  switch (baseType) {
    case 'ssh-rsa':
      var e = utils.readString(data, data._pos);
      if (e === false)
        return new Error('Malformed OpenSSH public key');
      var n = utils.readString(data, data._pos);
      if (n === false)
        return new Error('Malformed OpenSSH public key');
      pubPEM = genOpenSSLRSAPub(n, e);
      pubSSH = genOpenSSHRSAPub(n, e);
      algo = 'sha1';
      break;
    case 'ssh-dss':
      var p = utils.readString(data, data._pos);
      if (p === false)
        return new Error('Malformed OpenSSH public key');
      var q = utils.readString(data, data._pos);
      if (q === false)
        return new Error('Malformed OpenSSH public key');
      var g = utils.readString(data, data._pos);
      if (g === false)
        return new Error('Malformed OpenSSH public key');
      var y = utils.readString(data, data._pos);
      if (y === false)
        return new Error('Malformed OpenSSH public key');
      pubPEM = genOpenSSLDSAPub(p, q, g, y);
      pubSSH = genOpenSSHDSAPub(p, q, g, y);
      algo = 'sha1';
      break;
    case 'ssh-ed25519':
      var edpub = utils.readString(data, data._pos);
      if (edpub === false || edpub.length !== 32)
        return new Error('Malformed OpenSSH public key');
      pubPEM = genOpenSSLEdPub(edpub);
      pubSSH = genOpenSSHEdPub(edpub);
      algo = null;
      break;
    case 'ecdsa-sha2-nistp256':
      algo = 'sha256';
      oid = '1.2.840.10045.3.1.7';
    case 'ecdsa-sha2-nistp384':
      if (algo === undefined) {
        algo = 'sha384';
        oid = '1.3.132.0.34';
      }
    case 'ecdsa-sha2-nistp521':
      if (algo === undefined) {
        algo = 'sha512';
        oid = '1.3.132.0.35';
      }
      // TODO: validate curve name against type
      if (!skipFields(data, 1)) // Skip curve name
        return new Error('Malformed OpenSSH public key');
      var ecpub = utils.readString(data, data._pos);
      if (ecpub === false)
        return new Error('Malformed OpenSSH public key');
      pubPEM = genOpenSSLECDSAPub(oid, ecpub);
      pubSSH = genOpenSSHECDSAPub(oid, ecpub);
      break;
    default:
      return new Error('Unsupported OpenSSH public key type: ' + baseType);
  }

  return new OpenSSH_Public(fullType, comment, pubPEM, pubSSH, algo);
}
function OpenSSH_Public(type, comment, pubPEM, pubSSH, algo) {
  this.type = type;
  this.comment = comment;
  this[SYM_PRIV_PEM] = null;
  this[SYM_PUB_PEM] = pubPEM;
  this[SYM_PUB_SSH] = pubSSH;
  this[SYM_HASH_ALGO] = algo;
  this[SYM_DECRYPTED] = false;
}
OpenSSH_Public.prototype = BaseKey;
(function() {
  var regexp;
  if (EDDSA_SUPPORTED)
    regexp = /^(((?:ssh-(?:rsa|dss|ed25519))|ecdsa-sha2-nistp(?:256|384|521))(?:-cert-v0[01]@openssh.com)?) ([A-Z0-9a-z\/+=]+)(?:$|\s+([\S].*)?)$/;
  else
    regexp = /^(((?:ssh-(?:rsa|dss))|ecdsa-sha2-nistp(?:256|384|521))(?:-cert-v0[01]@openssh.com)?) ([A-Z0-9a-z\/+=]+)(?:$|\s+([\S].*)?)$/;
  OpenSSH_Public.parse = function(str) {
    var m = regexp.exec(str);
    if (m === null)
      return null;
    // m[1] = full type
    // m[2] = base type
    // m[3] = base64-encoded public key
    // m[4] = comment

    // avoid cyclic require by requiring on first use
    if (!utils)
      utils = __webpack_require__(780);

    var fullType = m[1];
    var baseType = m[2];
    var data = Buffer.from(m[3], 'base64');
    var comment = (m[4] || '');

    var type = utils.readString(data, data._pos, 'ascii');
    if (type === false || type.indexOf(baseType) !== 0)
      return new Error('Malformed OpenSSH public key');

    return parseDER(data, baseType, comment, fullType);
  };
})();



function RFC4716_Public(type, comment, pubPEM, pubSSH, algo) {
  this.type = type;
  this.comment = comment;
  this[SYM_PRIV_PEM] = null;
  this[SYM_PUB_PEM] = pubPEM;
  this[SYM_PUB_SSH] = pubSSH;
  this[SYM_HASH_ALGO] = algo;
  this[SYM_DECRYPTED] = false;
}
RFC4716_Public.prototype = BaseKey;
(function() {
  var regexp = /^---- BEGIN SSH2 PUBLIC KEY ----(?:\r\n|\n)((?:(?:[\x21-\x7E]+?):(?:(?:.*?\\\r?\n)*.*)(?:\r\n|\n))*)((?:[A-Z0-9a-z\/+=]+(?:\r\n|\n))+)---- END SSH2 PUBLIC KEY ----$/;
  var RE_HEADER = /^([\x21-\x7E]+?):((?:.*?\\\r?\n)*.*)$/gm;
  var RE_HEADER_ENDS = /\\\r?\n/g;
  RFC4716_Public.parse = function(str) {
    var m = regexp.exec(str);
    if (m === null)
      return null;
    // m[1] = header(s)
    // m[2] = base64-encoded public key

    var headers = m[1];
    var data = Buffer.from(m[2], 'base64');
    var comment = '';

    if (headers !== undefined) {
      while (m = RE_HEADER.exec(headers)) {
        if (m[1].toLowerCase() === 'comment') {
          comment = trimStart(m[2].replace(RE_HEADER_ENDS, ''));
          if (comment.length > 1
              && comment.charCodeAt(0) === 34/*'"'*/
              && comment.charCodeAt(comment.length - 1) === 34/*'"'*/) {
            comment = comment.slice(1, -1);
          }
        }
      }
    }

    // avoid cyclic require by requiring on first use
    if (!utils)
      utils = __webpack_require__(780);

    var type = utils.readString(data, 0, 'ascii');
    if (type === false)
      return new Error('Malformed RFC4716 public key');

    var pubPEM = null;
    var pubSSH = null;
    switch (type) {
      case 'ssh-rsa':
        var e = utils.readString(data, data._pos);
        if (e === false)
          return new Error('Malformed RFC4716 public key');
        var n = utils.readString(data, data._pos);
        if (n === false)
          return new Error('Malformed RFC4716 public key');
        pubPEM = genOpenSSLRSAPub(n, e);
        pubSSH = genOpenSSHRSAPub(n, e);
        break;
      case 'ssh-dss':
        var p = utils.readString(data, data._pos);
        if (p === false)
          return new Error('Malformed RFC4716 public key');
        var q = utils.readString(data, data._pos);
        if (q === false)
          return new Error('Malformed RFC4716 public key');
        var g = utils.readString(data, data._pos);
        if (g === false)
          return new Error('Malformed RFC4716 public key');
        var y = utils.readString(data, data._pos);
        if (y === false)
          return new Error('Malformed RFC4716 public key');
        pubPEM = genOpenSSLDSAPub(p, q, g, y);
        pubSSH = genOpenSSHDSAPub(p, q, g, y);
        break;
      default:
        return new Error('Malformed RFC4716 public key');
    }

    return new RFC4716_Public(type, comment, pubPEM, pubSSH, 'sha1');
  };
})();



module.exports = {
  parseDERKey: function parseDERKey(data, type) {
    return parseDER(data, type, '', type);
  },
  parseKey: function parseKey(data, passphrase) {
    if (Buffer.isBuffer(data))
      data = data.toString('utf8').trim();
    else if (typeof data !== 'string')
      return new Error('Key data must be a Buffer or string');
    else
      data = data.trim();

    // intentional !=
    if (passphrase != undefined) {
      if (typeof passphrase === 'string')
        passphrase = Buffer.from(passphrase);
      else if (!Buffer.isBuffer(passphrase))
        return new Error('Passphrase must be a string or Buffer when supplied');
    }

    var ret;

    // Private keys
    if ((ret = OpenSSH_Private.parse(data, passphrase)) !== null)
      return ret;
    if ((ret = OpenSSH_Old_Private.parse(data, passphrase)) !== null)
      return ret;
    if ((ret = PPK_Private.parse(data, passphrase)) !== null)
      return ret;

    // Public keys
    if ((ret = OpenSSH_Public.parse(data)) !== null)
      return ret;
    if ((ret = RFC4716_Public.parse(data)) !== null)
      return ret;

    return new Error('Unsupported key format');
  }
}


/***/ }),

/***/ 801:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

var i;
var keys;
var len;

var crypto = __webpack_require__(417);
var eddsaSupported = (function() {
  if (typeof crypto.sign === 'function'
      && typeof crypto.verify === 'function') {
    var key = '-----BEGIN PRIVATE KEY-----\r\nMC4CAQAwBQYDK2VwBCIEIHKj+sVa9WcD'
              + '/q2DJUJaf43Kptc8xYuUQA4bOFj9vC8T\r\n-----END PRIVATE KEY-----';
    var data = Buffer.from('a');
    var sig;
    var verified;
    try {
      sig = crypto.sign(null, data, key);
      verified = crypto.verify(null, data, key, sig);
    } catch (ex) {}
    return (Buffer.isBuffer(sig) && sig.length === 64 && verified === true);
  }

  return false;
})();

var curve25519Supported = (typeof crypto.diffieHellman === 'function'
                           && typeof crypto.generateKeyPairSync === 'function'
                           && typeof crypto.createPublicKey === 'function');

var MESSAGE = exports.MESSAGE = {
  // Transport layer protocol -- generic (1-19)
  DISCONNECT: 1,
  IGNORE: 2,
  UNIMPLEMENTED: 3,
  DEBUG: 4,
  SERVICE_REQUEST: 5,
  SERVICE_ACCEPT: 6,

  // Transport layer protocol -- algorithm negotiation (20-29)
  KEXINIT: 20,
  NEWKEYS: 21,

  // Transport layer protocol -- key exchange method-specific (30-49)

  // User auth protocol -- generic (50-59)
  USERAUTH_REQUEST: 50,
  USERAUTH_FAILURE: 51,
  USERAUTH_SUCCESS: 52,
  USERAUTH_BANNER: 53,

  // User auth protocol -- user auth method-specific (60-79)

  // Connection protocol -- generic (80-89)
  GLOBAL_REQUEST: 80,
  REQUEST_SUCCESS: 81,
  REQUEST_FAILURE: 82,

  // Connection protocol -- channel-related (90-127)
  CHANNEL_OPEN: 90,
  CHANNEL_OPEN_CONFIRMATION: 91,
  CHANNEL_OPEN_FAILURE: 92,
  CHANNEL_WINDOW_ADJUST: 93,
  CHANNEL_DATA: 94,
  CHANNEL_EXTENDED_DATA: 95,
  CHANNEL_EOF: 96,
  CHANNEL_CLOSE: 97,
  CHANNEL_REQUEST: 98,
  CHANNEL_SUCCESS: 99,
  CHANNEL_FAILURE: 100

  // Reserved for client protocols (128-191)

  // Local extensions (192-155)
};
for (i = 0, keys = Object.keys(MESSAGE), len = keys.length; i < len; ++i)
  MESSAGE[MESSAGE[keys[i]]] = keys[i];
// context-specific message codes:
MESSAGE.KEXDH_INIT = 30;
MESSAGE.KEXDH_REPLY = 31;
MESSAGE.KEXDH_GEX_REQUEST = 34;
MESSAGE.KEXDH_GEX_GROUP = 31;
MESSAGE.KEXDH_GEX_INIT = 32;
MESSAGE.KEXDH_GEX_REPLY = 33;
MESSAGE.KEXECDH_INIT = 30; // included here for completeness
MESSAGE.KEXECDH_REPLY = 31; // included here for completeness
MESSAGE.USERAUTH_PASSWD_CHANGEREQ = 60;
MESSAGE.USERAUTH_PK_OK = 60;
MESSAGE.USERAUTH_INFO_REQUEST = 60;
MESSAGE.USERAUTH_INFO_RESPONSE = 61;

var DYNAMIC_KEXDH_MESSAGE = exports.DYNAMIC_KEXDH_MESSAGE = {};
DYNAMIC_KEXDH_MESSAGE[MESSAGE.KEXDH_GEX_GROUP] = 'KEXDH_GEX_GROUP';
DYNAMIC_KEXDH_MESSAGE[MESSAGE.KEXDH_GEX_REPLY] = 'KEXDH_GEX_REPLY';

var KEXDH_MESSAGE = exports.KEXDH_MESSAGE = {};
KEXDH_MESSAGE[MESSAGE.KEXDH_INIT] = 'KEXDH_INIT';
KEXDH_MESSAGE[MESSAGE.KEXDH_REPLY] = 'KEXDH_REPLY';

var DISCONNECT_REASON = exports.DISCONNECT_REASON = {
  HOST_NOT_ALLOWED_TO_CONNECT: 1,
  PROTOCOL_ERROR: 2,
  KEY_EXCHANGE_FAILED: 3,
  RESERVED: 4,
  MAC_ERROR: 5,
  COMPRESSION_ERROR: 6,
  SERVICE_NOT_AVAILABLE: 7,
  PROTOCOL_VERSION_NOT_SUPPORTED: 8,
  HOST_KEY_NOT_VERIFIABLE: 9,
  CONNECTION_LOST: 10,
  BY_APPLICATION: 11,
  TOO_MANY_CONNECTIONS: 12,
  AUTH_CANCELED_BY_USER: 13,
  NO_MORE_AUTH_METHODS_AVAILABLE: 14,
  ILLEGAL_USER_NAME: 15
};
for (i = 0, keys = Object.keys(DISCONNECT_REASON), len = keys.length;
     i < len;
     ++i) {
  DISCONNECT_REASON[DISCONNECT_REASON[keys[i]]] = keys[i];
}

var CHANNEL_OPEN_FAILURE = exports.CHANNEL_OPEN_FAILURE = {
  ADMINISTRATIVELY_PROHIBITED: 1,
  CONNECT_FAILED: 2,
  UNKNOWN_CHANNEL_TYPE: 3,
  RESOURCE_SHORTAGE: 4
};
for (i = 0, keys = Object.keys(CHANNEL_OPEN_FAILURE), len = keys.length;
     i < len;
     ++i) {
  CHANNEL_OPEN_FAILURE[CHANNEL_OPEN_FAILURE[keys[i]]] = keys[i];
}

var TERMINAL_MODE = exports.TERMINAL_MODE = {
  TTY_OP_END: 0,        // Indicates end of options.
  VINTR: 1,             // Interrupt character; 255 if none. Similarly for the
                        //  other characters.  Not all of these characters are
                        //  supported on all systems.
  VQUIT: 2,             // The quit character (sends SIGQUIT signal on POSIX
                        //  systems).
  VERASE: 3,            // Erase the character to left of the cursor.
  VKILL: 4,             // Kill the current input line.
  VEOF: 5,              // End-of-file character (sends EOF from the terminal).
  VEOL: 6,              // End-of-line character in addition to carriage return
                        //  and/or linefeed.
  VEOL2: 7,             // Additional end-of-line character.
  VSTART: 8,            // Continues paused output (normally control-Q).
  VSTOP: 9,             // Pauses output (normally control-S).
  VSUSP: 10,            // Suspends the current program.
  VDSUSP: 11,           // Another suspend character.
  VREPRINT: 12,         // Reprints the current input line.
  VWERASE: 13,          // Erases a word left of cursor.
  VLNEXT: 14,           // Enter the next character typed literally, even if it
                        //  is a special character
  VFLUSH: 15,           // Character to flush output.
  VSWTCH: 16,           // Switch to a different shell layer.
  VSTATUS: 17,          // Prints system status line (load, command, pid, etc).
  VDISCARD: 18,         // Toggles the flushing of terminal output.
  IGNPAR: 30,           // The ignore parity flag.  The parameter SHOULD be 0
                        //  if this flag is FALSE, and 1 if it is TRUE.
  PARMRK: 31,           // Mark parity and framing errors.
  INPCK: 32,            // Enable checking of parity errors.
  ISTRIP: 33,           // Strip 8th bit off characters.
  INLCR: 34,            // Map NL into CR on input.
  IGNCR: 35,            // Ignore CR on input.
  ICRNL: 36,            // Map CR to NL on input.
  IUCLC: 37,            // Translate uppercase characters to lowercase.
  IXON: 38,             // Enable output flow control.
  IXANY: 39,            // Any char will restart after stop.
  IXOFF: 40,            // Enable input flow control.
  IMAXBEL: 41,          // Ring bell on input queue full.
  ISIG: 50,             // Enable signals INTR, QUIT, [D]SUSP.
  ICANON: 51,           // Canonicalize input lines.
  XCASE: 52,            // Enable input and output of uppercase characters by
                        //  preceding their lowercase equivalents with "\".
  ECHO: 53,             // Enable echoing.
  ECHOE: 54,            // Visually erase chars.
  ECHOK: 55,            // Kill character discards current line.
  ECHONL: 56,           // Echo NL even if ECHO is off.
  NOFLSH: 57,           // Don't flush after interrupt.
  TOSTOP: 58,           // Stop background jobs from output.
  IEXTEN: 59,           // Enable extensions.
  ECHOCTL: 60,          // Echo control characters as ^(Char).
  ECHOKE: 61,           // Visual erase for line kill.
  PENDIN: 62,           // Retype pending input.
  OPOST: 70,            // Enable output processing.
  OLCUC: 71,            // Convert lowercase to uppercase.
  ONLCR: 72,            // Map NL to CR-NL.
  OCRNL: 73,            // Translate carriage return to newline (output).
  ONOCR: 74,            // Translate newline to carriage return-newline
                        // (output).
  ONLRET: 75,           // Newline performs a carriage return (output).
  CS7: 90,              // 7 bit mode.
  CS8: 91,              // 8 bit mode.
  PARENB: 92,           // Parity enable.
  PARODD: 93,           // Odd parity, else even.
  TTY_OP_ISPEED: 128,   // Specifies the input baud rate in bits per second.
  TTY_OP_OSPEED: 129    // Specifies the output baud rate in bits per second.
};
for (i = 0, keys = Object.keys(TERMINAL_MODE), len = keys.length; i < len; ++i)
  TERMINAL_MODE[TERMINAL_MODE[keys[i]]] = keys[i];

var CHANNEL_EXTENDED_DATATYPE = exports.CHANNEL_EXTENDED_DATATYPE = {
  STDERR: 1
};
for (i = 0, keys = Object.keys(CHANNEL_EXTENDED_DATATYPE), len = keys.length;
     i < len;
     ++i) {
  CHANNEL_EXTENDED_DATATYPE[CHANNEL_EXTENDED_DATATYPE[keys[i]]] = keys[i];
}

exports.SIGNALS = ['ABRT', 'ALRM', 'FPE', 'HUP', 'ILL', 'INT',
                   'QUIT', 'SEGV', 'TERM', 'USR1', 'USR2', 'KILL',
                   'PIPE'];

var DEFAULT_KEX = [
  // https://tools.ietf.org/html/rfc5656#section-10.1
  'ecdh-sha2-nistp256',
  'ecdh-sha2-nistp384',
  'ecdh-sha2-nistp521',

  // https://tools.ietf.org/html/rfc4419#section-4
  'diffie-hellman-group-exchange-sha256',

  'diffie-hellman-group14-sha256',
  'diffie-hellman-group16-sha512',
  'diffie-hellman-group18-sha512',

  'diffie-hellman-group14-sha1', // REQUIRED
];
if (curve25519Supported) {
  DEFAULT_KEX.unshift('curve25519-sha256');
  DEFAULT_KEX.unshift('curve25519-sha256@libssh.org');
}
var SUPPORTED_KEX = [
  // https://tools.ietf.org/html/rfc4419#section-4
  'diffie-hellman-group-exchange-sha1',

  'diffie-hellman-group1-sha1'  // REQUIRED
];
var KEX_BUF = Buffer.from(DEFAULT_KEX.join(','), 'ascii');
SUPPORTED_KEX = DEFAULT_KEX.concat(SUPPORTED_KEX);

var DEFAULT_SERVER_HOST_KEY = [
  'ecdsa-sha2-nistp256',
  'ecdsa-sha2-nistp384',
  'ecdsa-sha2-nistp521',
  'ssh-rsa',
];
if (eddsaSupported)
  DEFAULT_SERVER_HOST_KEY.unshift('ssh-ed25519');
var SUPPORTED_SERVER_HOST_KEY = [
  'ssh-dss'
];
var SERVER_HOST_KEY_BUF = Buffer.from(DEFAULT_SERVER_HOST_KEY.join(','),
                                      'ascii');
SUPPORTED_SERVER_HOST_KEY = DEFAULT_SERVER_HOST_KEY.concat(
  SUPPORTED_SERVER_HOST_KEY
);

var DEFAULT_CIPHER = [
  // http://tools.ietf.org/html/rfc4344#section-4
  'aes128-ctr',
  'aes192-ctr',
  'aes256-ctr',

  // http://tools.ietf.org/html/rfc5647
  'aes128-gcm',
  'aes128-gcm@openssh.com',
  'aes256-gcm',
  'aes256-gcm@openssh.com'
];
var SUPPORTED_CIPHER = [
  'aes256-cbc',
  'aes192-cbc',
  'aes128-cbc',
  'blowfish-cbc',
  '3des-cbc',

  // http://tools.ietf.org/html/rfc4345#section-4:
  'arcfour256',
  'arcfour128',

  'cast128-cbc',
  'arcfour'
];
var CIPHER_BUF = Buffer.from(DEFAULT_CIPHER.join(','), 'ascii');
SUPPORTED_CIPHER = DEFAULT_CIPHER.concat(SUPPORTED_CIPHER);

var DEFAULT_HMAC = [
  'hmac-sha2-256',
  'hmac-sha2-512',
  'hmac-sha1',
];
var SUPPORTED_HMAC = [
  'hmac-md5',
  'hmac-sha2-256-96', // first 96 bits of HMAC-SHA256
  'hmac-sha2-512-96', // first 96 bits of HMAC-SHA512
  'hmac-ripemd160',
  'hmac-sha1-96',     // first 96 bits of HMAC-SHA1
  'hmac-md5-96'       // first 96 bits of HMAC-MD5
];
var HMAC_BUF = Buffer.from(DEFAULT_HMAC.join(','), 'ascii');
SUPPORTED_HMAC = DEFAULT_HMAC.concat(SUPPORTED_HMAC);

var DEFAULT_COMPRESS = [
  'none',
  'zlib@openssh.com', // ZLIB (LZ77) compression, except
                      // compression/decompression does not start until after
                      // successful user authentication
  'zlib'              // ZLIB (LZ77) compression
];
var SUPPORTED_COMPRESS = [];
var COMPRESS_BUF = Buffer.from(DEFAULT_COMPRESS.join(','), 'ascii');
SUPPORTED_COMPRESS = DEFAULT_COMPRESS.concat(SUPPORTED_COMPRESS);

function makeCipherInfo(blockLen, keyLen, ivLen, authLen, discardLen, stream) {
  return {
    blockLen: blockLen,
    keyLen: keyLen,
    ivLen: ivLen === 0 ? blockLen : ivLen,
    authLen: authLen,
    discardLen: discardLen,
    stream: stream,
  };
}
exports.CIPHER_INFO = {
  'aes128-gcm': makeCipherInfo(16, 16, 12, 16, 0, false),
  'aes256-gcm': makeCipherInfo(16, 32, 12, 16, 0, false),
  'aes128-gcm@openssh.com': makeCipherInfo(16, 16, 12, 16, 0, false),
  'aes256-gcm@openssh.com': makeCipherInfo(16, 32, 12, 16, 0, false),

  'aes128-cbc': makeCipherInfo(16, 16, 0, 0, 0, false),
  'aes192-cbc': makeCipherInfo(16, 24, 0, 0, 0, false),
  'aes256-cbc': makeCipherInfo(16, 32, 0, 0, 0, false),
  'rijndael-cbc@lysator.liu.se': makeCipherInfo(16, 32, 0, 0, 0, false),
  '3des-cbc': makeCipherInfo(8, 24, 0, 0, 0, false),
  'blowfish-cbc': makeCipherInfo(8, 16, 0, 0, 0, false),
  'idea-cbc': makeCipherInfo(8, 16, 0, 0, 0, false),
  'cast128-cbc': makeCipherInfo(8, 16, 0, 0, 0, false),
  'camellia128-cbc': makeCipherInfo(16, 16, 0, 0, 0, false),
  'camellia192-cbc': makeCipherInfo(16, 24, 0, 0, 0, false),
  'camellia256-cbc': makeCipherInfo(16, 32, 0, 0, 0, false),
  'camellia128-cbc@openssh.com': makeCipherInfo(16, 16, 0, 0, 0, false),
  'camellia192-cbc@openssh.com': makeCipherInfo(16, 24, 0, 0, 0, false),
  'camellia256-cbc@openssh.com': makeCipherInfo(16, 32, 0, 0, 0, false),

  'aes128-ctr': makeCipherInfo(16, 16, 0, 0, 0, false),
  'aes192-ctr': makeCipherInfo(16, 24, 0, 0, 0, false),
  'aes256-ctr': makeCipherInfo(16, 32, 0, 0, 0, false),
  '3des-ctr': makeCipherInfo(8, 24, 0, 0, 0, false),
  'blowfish-ctr': makeCipherInfo(8, 16, 0, 0, 0, false),
  'cast128-ctr': makeCipherInfo(8, 16, 0, 0, 0, false),
  'camellia128-ctr': makeCipherInfo(16, 16, 0, 0, 0, false),
  'camellia192-ctr': makeCipherInfo(16, 24, 0, 0, 0, false),
  'camellia256-ctr': makeCipherInfo(16, 32, 0, 0, 0, false),
  'camellia128-ctr@openssh.com': makeCipherInfo(16, 16, 0, 0, 0, false),
  'camellia192-ctr@openssh.com': makeCipherInfo(16, 24, 0, 0, 0, false),
  'camellia256-ctr@openssh.com': makeCipherInfo(16, 32, 0, 0, 0, false),

  /* The "arcfour128" algorithm is the RC4 cipher, as described in
     [SCHNEIER], using a 128-bit key.  The first 1536 bytes of keystream
     generated by the cipher MUST be discarded, and the first byte of the
     first encrypted packet MUST be encrypted using the 1537th byte of
     keystream.

     -- http://tools.ietf.org/html/rfc4345#section-4 */
  'arcfour': makeCipherInfo(8, 16, 0, 0, 1536, true),
  'arcfour128': makeCipherInfo(8, 16, 0, 0, 1536, true),
  'arcfour256': makeCipherInfo(8, 32, 0, 0, 1536, true),
  'arcfour512': makeCipherInfo(8, 64, 0, 0, 1536, true),
};

function makeHMACInfo(len, actualLen) {
  return { len: len, actualLen: actualLen };
}
exports.HMAC_INFO = {
  'hmac-md5': makeHMACInfo(16, 16),
  'hmac-md5-96': makeHMACInfo(16, 12),
  'hmac-ripemd160': makeHMACInfo(20, 20),
  'hmac-sha1': makeHMACInfo(20, 20),
  'hmac-sha1-96': makeHMACInfo(20, 12),
  'hmac-sha2-256': makeHMACInfo(32, 32),
  'hmac-sha2-256-96': makeHMACInfo(32, 12),
  'hmac-sha2-512': makeHMACInfo(64, 64),
  'hmac-sha2-512-96': makeHMACInfo(64, 12),
};

exports.ALGORITHMS = {
  KEX: DEFAULT_KEX,
  KEX_BUF: KEX_BUF,
  SUPPORTED_KEX: SUPPORTED_KEX,

  SERVER_HOST_KEY: DEFAULT_SERVER_HOST_KEY,
  SERVER_HOST_KEY_BUF: SERVER_HOST_KEY_BUF,
  SUPPORTED_SERVER_HOST_KEY: SUPPORTED_SERVER_HOST_KEY,

  CIPHER: DEFAULT_CIPHER,
  CIPHER_BUF: CIPHER_BUF,
  SUPPORTED_CIPHER: SUPPORTED_CIPHER,

  HMAC: DEFAULT_HMAC,
  HMAC_BUF: HMAC_BUF,
  SUPPORTED_HMAC: SUPPORTED_HMAC,

  COMPRESS: DEFAULT_COMPRESS,
  COMPRESS_BUF: COMPRESS_BUF,
  SUPPORTED_COMPRESS: SUPPORTED_COMPRESS
};
exports.SSH_TO_OPENSSL = {
  // ECDH key exchange
  'ecdh-sha2-nistp256': 'prime256v1', // OpenSSL's name for 'secp256r1'
  'ecdh-sha2-nistp384': 'secp384r1',
  'ecdh-sha2-nistp521': 'secp521r1',
  // Ciphers
  'aes128-gcm': 'aes-128-gcm',
  'aes256-gcm': 'aes-256-gcm',
  'aes128-gcm@openssh.com': 'aes-128-gcm',
  'aes256-gcm@openssh.com': 'aes-256-gcm',
  '3des-cbc': 'des-ede3-cbc',
  'blowfish-cbc': 'bf-cbc',
  'aes256-cbc': 'aes-256-cbc',
  'aes192-cbc': 'aes-192-cbc',
  'aes128-cbc': 'aes-128-cbc',
  'idea-cbc': 'idea-cbc',
  'cast128-cbc': 'cast-cbc',
  'rijndael-cbc@lysator.liu.se': 'aes-256-cbc',
  'arcfour128': 'rc4',
  'arcfour256': 'rc4',
  'arcfour512': 'rc4',
  'arcfour': 'rc4',
  'camellia128-cbc': 'camellia-128-cbc',
  'camellia192-cbc': 'camellia-192-cbc',
  'camellia256-cbc': 'camellia-256-cbc',
  'camellia128-cbc@openssh.com': 'camellia-128-cbc',
  'camellia192-cbc@openssh.com': 'camellia-192-cbc',
  'camellia256-cbc@openssh.com': 'camellia-256-cbc',
  '3des-ctr': 'des-ede3',
  'blowfish-ctr': 'bf-ecb',
  'aes256-ctr': 'aes-256-ctr',
  'aes192-ctr': 'aes-192-ctr',
  'aes128-ctr': 'aes-128-ctr',
  'cast128-ctr': 'cast5-ecb',
  'camellia128-ctr': 'camellia-128-ecb',
  'camellia192-ctr': 'camellia-192-ecb',
  'camellia256-ctr': 'camellia-256-ecb',
  'camellia128-ctr@openssh.com': 'camellia-128-ecb',
  'camellia192-ctr@openssh.com': 'camellia-192-ecb',
  'camellia256-ctr@openssh.com': 'camellia-256-ecb',
  // HMAC
  'hmac-sha1-96': 'sha1',
  'hmac-sha1': 'sha1',
  'hmac-sha2-256': 'sha256',
  'hmac-sha2-256-96': 'sha256',
  'hmac-sha2-512': 'sha512',
  'hmac-sha2-512-96': 'sha512',
  'hmac-md5-96': 'md5',
  'hmac-md5': 'md5',
  'hmac-ripemd160': 'ripemd160'
};

var BUGS = exports.BUGS = {
  BAD_DHGEX: 1,
  OLD_EXIT: 2,
  DYN_RPORT_BUG: 4
};

exports.BUGGY_IMPLS = [
  [ 'Cisco-1.25', BUGS.BAD_DHGEX ],
  [ /^[0-9.]+$/, BUGS.OLD_EXIT ], // old SSH.com implementations
  [ /^OpenSSH_5\.\d+/, BUGS.DYN_RPORT_BUG ]
];

exports.EDDSA_SUPPORTED = eddsaSupported;
exports.CURVE25519_SUPPORTED = curve25519Supported;


/***/ }),

/***/ 831:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
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
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = __webpack_require__(226);

var Writable = __webpack_require__(241);

__webpack_require__(689)(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

/***/ }),

/***/ 835:
/***/ (function(module) {

module.exports = require("url");

/***/ }),

/***/ 858:
/***/ (function(module) {

module.exports = eval("require")("supports-color");


/***/ }),

/***/ 867:
/***/ (function(module) {

module.exports = require("tty");

/***/ }),

/***/ 881:
/***/ (function(module) {

module.exports = require("dns");

/***/ }),

/***/ 882:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
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
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.


module.exports = PassThrough;

var Transform = __webpack_require__(925);

__webpack_require__(689)(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ 885:
/***/ (function(module, __unusedexports, __webpack_require__) {

var Client = __webpack_require__(597).Client,
  http = __webpack_require__(605);

module.exports = function(opt) {
  var conn = new Client();
  var agent = new http.Agent();

  agent.createConnection = function(options, fn) {
    conn.on('ready', function() {
      conn.exec('docker system dial-stdio', function(err, stream) {
        if (err) {
          conn.end();
          agent.destroy();
          return;
        }

        fn(null, stream);

        stream.on('close', () => {
          conn.end();
          agent.destroy();
        });
      });
    }).connect(opt);

    conn.on('end', () => agent.destroy());
  };

  return agent;
};


/***/ }),

/***/ 895:
/***/ (function(module, __unusedexports, __webpack_require__) {

var fs = __webpack_require__(747);

module.exports = function (filepath, split, encoding) {
  split = typeof split !== 'undefined' ? split : "\n";
  encoding = typeof encoding !== 'undefined' ? encoding : "utf8";

  var ca = [];
  var chain = fs.readFileSync(filepath, encoding);
  if(chain.indexOf("-END CERTIFICATE-") < 0 || chain.indexOf("-BEGIN CERTIFICATE-") < 0){
    throw Error("File does not contain 'BEGIN CERTIFICATE' or 'END CERTIFICATE'");
  }
  chain = chain.split(split);
  var cert = [];
  var _i, _len;
  for (_i = 0, _len = chain.length; _i < _len; _i++) {
    var line = chain[_i];
    if (!(line.length !== 0)) {
      continue;
    }
    cert.push(line);
    if (line.match(/-END CERTIFICATE-/)) {
      ca.push(cert.join(split));
      cert = [];
    }
  }
  return ca;
}


/***/ }),

/***/ 896:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = __webpack_require__(293),
    Buffer = _require.Buffer;

var _require2 = __webpack_require__(669),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();

/***/ }),

/***/ 900:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(255);

/**
 * Represents an network
 * @param {Object} modem docker-modem
 * @param {String} id  Network's id
 */
var Network = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Network.prototype[__webpack_require__(669).inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Id only if callback isn't specified.
 */
Network.prototype.inspect = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var opts = {
    path: '/networks/' + this.id + '?',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such network',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Removes the network
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'no such network',
      409: 'conflict',
      500: 'server error'
    },
    options: args.opts
  };


  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Connects a container to a network
 * @param  {[Object]}   opts     Connect options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.connect = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id + '/connect',
    method: 'POST',
    statusCodes: {
      200: true,
      201: true,
      404: 'network or container is not found',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Disconnects a container from a network
 * @param  {[Object]}   opts     Disconnect options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.disconnect = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id + '/disconnect',
    method: 'POST',
    statusCodes: {
      200: true,
      201: true,
      404: 'network or container is not found',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};




module.exports = Network;


/***/ }),

/***/ 917:
/***/ (function(module, __unusedexports, __webpack_require__) {


/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

module.exports = __webpack_require__(669).deprecate;


/***/ }),

/***/ 925:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
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
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.


module.exports = Transform;

var _require$codes = __webpack_require__(563).codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = __webpack_require__(831);

__webpack_require__(689)(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}

/***/ }),

/***/ 941:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(747)
const path = __webpack_require__(622)

/* istanbul ignore next */
const LCHOWN = fs.lchown ? 'lchown' : 'chown'
/* istanbul ignore next */
const LCHOWNSYNC = fs.lchownSync ? 'lchownSync' : 'chownSync'

/* istanbul ignore next */
const needEISDIRHandled = fs.lchown &&
  !process.version.match(/v1[1-9]+\./) &&
  !process.version.match(/v10\.[6-9]/)

const lchownSync = (path, uid, gid) => {
  try {
    return fs[LCHOWNSYNC](path, uid, gid)
  } catch (er) {
    if (er.code !== 'ENOENT')
      throw er
  }
}

/* istanbul ignore next */
const chownSync = (path, uid, gid) => {
  try {
    return fs.chownSync(path, uid, gid)
  } catch (er) {
    if (er.code !== 'ENOENT')
      throw er
  }
}

/* istanbul ignore next */
const handleEISDIR =
  needEISDIRHandled ? (path, uid, gid, cb) => er => {
    // Node prior to v10 had a very questionable implementation of
    // fs.lchown, which would always try to call fs.open on a directory
    // Fall back to fs.chown in those cases.
    if (!er || er.code !== 'EISDIR')
      cb(er)
    else
      fs.chown(path, uid, gid, cb)
  }
  : (_, __, ___, cb) => cb

/* istanbul ignore next */
const handleEISDirSync =
  needEISDIRHandled ? (path, uid, gid) => {
    try {
      return lchownSync(path, uid, gid)
    } catch (er) {
      if (er.code !== 'EISDIR')
        throw er
      chownSync(path, uid, gid)
    }
  }
  : (path, uid, gid) => lchownSync(path, uid, gid)

// fs.readdir could only accept an options object as of node v6
const nodeVersion = process.version
let readdir = (path, options, cb) => fs.readdir(path, options, cb)
let readdirSync = (path, options) => fs.readdirSync(path, options)
/* istanbul ignore next */
if (/^v4\./.test(nodeVersion))
  readdir = (path, options, cb) => fs.readdir(path, cb)

const chown = (cpath, uid, gid, cb) => {
  fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, er => {
    // Skip ENOENT error
    cb(er && er.code !== 'ENOENT' ? er : null)
  }))
}

const chownrKid = (p, child, uid, gid, cb) => {
  if (typeof child === 'string')
    return fs.lstat(path.resolve(p, child), (er, stats) => {
      // Skip ENOENT error
      if (er)
        return cb(er.code !== 'ENOENT' ? er : null)
      stats.name = child
      chownrKid(p, stats, uid, gid, cb)
    })

  if (child.isDirectory()) {
    chownr(path.resolve(p, child.name), uid, gid, er => {
      if (er)
        return cb(er)
      const cpath = path.resolve(p, child.name)
      chown(cpath, uid, gid, cb)
    })
  } else {
    const cpath = path.resolve(p, child.name)
    chown(cpath, uid, gid, cb)
  }
}


const chownr = (p, uid, gid, cb) => {
  readdir(p, { withFileTypes: true }, (er, children) => {
    // any error other than ENOTDIR or ENOTSUP means it's not readable,
    // or doesn't exist.  give up.
    if (er) {
      if (er.code === 'ENOENT')
        return cb()
      else if (er.code !== 'ENOTDIR' && er.code !== 'ENOTSUP')
        return cb(er)
    }
    if (er || !children.length)
      return chown(p, uid, gid, cb)

    let len = children.length
    let errState = null
    const then = er => {
      if (errState)
        return
      if (er)
        return cb(errState = er)
      if (-- len === 0)
        return chown(p, uid, gid, cb)
    }

    children.forEach(child => chownrKid(p, child, uid, gid, then))
  })
}

const chownrKidSync = (p, child, uid, gid) => {
  if (typeof child === 'string') {
    try {
      const stats = fs.lstatSync(path.resolve(p, child))
      stats.name = child
      child = stats
    } catch (er) {
      if (er.code === 'ENOENT')
        return
      else
        throw er
    }
  }

  if (child.isDirectory())
    chownrSync(path.resolve(p, child.name), uid, gid)

  handleEISDirSync(path.resolve(p, child.name), uid, gid)
}

const chownrSync = (p, uid, gid) => {
  let children
  try {
    children = readdirSync(p, { withFileTypes: true })
  } catch (er) {
    if (er.code === 'ENOENT')
      return
    else if (er.code === 'ENOTDIR' || er.code === 'ENOTSUP')
      return handleEISDirSync(p, uid, gid)
    else
      throw er
  }

  if (children && children.length)
    children.forEach(child => chownrKidSync(p, child, uid, gid))

  return handleEISDirSync(p, uid, gid)
}

module.exports = chownr
chownr.sync = chownrSync


/***/ }),

/***/ 954:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const DuplexStream = __webpack_require__(574).Duplex
const inherits = __webpack_require__(689)
const BufferList = __webpack_require__(670)

function BufferListStream (callback) {
  if (!(this instanceof BufferListStream)) {
    return new BufferListStream(callback)
  }

  if (typeof callback === 'function') {
    this._callback = callback

    const piper = function piper (err) {
      if (this._callback) {
        this._callback(err)
        this._callback = null
      }
    }.bind(this)

    this.on('pipe', function onPipe (src) {
      src.on('error', piper)
    })
    this.on('unpipe', function onUnpipe (src) {
      src.removeListener('error', piper)
    })

    callback = null
  }

  BufferList._init.call(this, callback)
  DuplexStream.call(this)
}

inherits(BufferListStream, DuplexStream)
Object.assign(BufferListStream.prototype, BufferList.prototype)

BufferListStream.prototype._new = function _new (callback) {
  return new BufferListStream(callback)
}

BufferListStream.prototype._write = function _write (buf, encoding, callback) {
  this._appendBuffer(buf)

  if (typeof callback === 'function') {
    callback()
  }
}

BufferListStream.prototype._read = function _read (size) {
  if (!this.length) {
    return this.push(null)
  }

  size = Math.min(size, this.length)
  this.push(this.slice(0, size))
  this.consume(size)
}

BufferListStream.prototype.end = function end (chunk) {
  DuplexStream.prototype.end.call(this, chunk)

  if (this._callback) {
    this._callback(null, this.slice())
    this._callback = null
  }
}

BufferListStream.prototype._destroy = function _destroy (err, cb) {
  this._bufs.length = 0
  this.length = 0
  cb(err)
}

BufferListStream.prototype._isBufferList = function _isBufferList (b) {
  return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b)
}

BufferListStream.isBufferList = BufferList.isBufferList

module.exports = BufferListStream
module.exports.BufferListStream = BufferListStream
module.exports.BufferList = BufferList


/***/ }),

/***/ 965:
/***/ (function(module, __unusedexports, __webpack_require__) {

var EventEmitter = __webpack_require__(614).EventEmitter,
  Modem = __webpack_require__(787),
  tar = __webpack_require__(120),
  zlib = __webpack_require__(761),
  Container = __webpack_require__(360),
  Image = __webpack_require__(588),
  Volume = __webpack_require__(479),
  Network = __webpack_require__(900),
  Service = __webpack_require__(76),
  Plugin = __webpack_require__(546),
  Secret = __webpack_require__(681),
  Config = __webpack_require__(180),
  Task = __webpack_require__(627),
  Node = __webpack_require__(107),
  Exec = __webpack_require__(757),
  util = __webpack_require__(255),
  extend = util.extend;

var Docker = function(opts) {
  if (!(this instanceof Docker)) return new Docker(opts);

  var plibrary = global.Promise;

  if (opts && opts.Promise) {
    plibrary = opts.Promise;

    if (Object.keys(opts).length === 1) {
      opts = undefined;
    }
  }

  this.modem = new Modem(opts);
  this.modem.Promise = plibrary;
};

/**
 * Creates a new container
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createContainer = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/containers/create?',
    method: 'POST',
    options: opts,
    authconfig: opts.authconfig,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
      406: 'impossible to attach',
      500: 'server error'
    }
  };

  delete opts.authconfig;

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getContainer(data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return callback(err, data);
      callback(err, self.getContainer(data.Id));
    });
  }
};

/**
 * Creates a new image
 * @param {Object}   auth     Authentication (optional)
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createImage = function(auth, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  } else if (!callback && !opts) {
    opts = auth;
    auth = opts.authconfig;
  }

  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    authconfig: auth,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Load image
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.loadImage = function(file, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/images/load?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Import image from a tar archive
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.importImage = function(file, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = undefined;
  }
  
  if (!opts)
    opts = {};

  opts.fromSrc = '-';

  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Verifies auth
 * @param {Object}   opts     Options
 * @param {Function} callback Callback
 */
Docker.prototype.checkAuth = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/auth',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true,
      204: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Builds an image
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.buildImage = function(file, opts, callback) {
  var self = this;
  var content;

  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  function build(file) {
    var optsf = {
      path: '/build?',
      method: 'POST',
      file: file,
      options: opts,
      isStream: true,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    };

    if (opts) {
      if (opts.registryconfig) {
        optsf.registryconfig = optsf.options.registryconfig;
        delete optsf.options.registryconfig;
      }

      //undocumented?
      if (opts.authconfig) {
        optsf.authconfig = optsf.options.authconfig;
        delete optsf.options.authconfig;
      }
    }

    if (callback === undefined) {
      return new self.modem.Promise(function(resolve, reject) {
        self.modem.dial(optsf, function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      self.modem.dial(optsf, function(err, data) {
        callback(err, data);
      });
    }
  }

  if (file && file.context) {
    var pack = tar.pack(file.context, {
      entries: file.src
    });
    return build(pack.pipe(zlib.createGzip()));
  } else {
    return build(file);
  }
};

/**
 * Fetches a Container by ID
 * @param {String} id Container's ID
 */
Docker.prototype.getContainer = function(id) {
  return new Container(this.modem, id);
};

/**
 * Fetches an Image by name
 * @param {String} name Image's name
 */
Docker.prototype.getImage = function(name) {
  return new Image(this.modem, name);
};

/**
 * Fetches a Volume by name
 * @param {String} name Volume's name
 */
Docker.prototype.getVolume = function(name) {
  return new Volume(this.modem, name);
};

/**
 * Fetches a Plugin by name
 * @param {String} name Volume's name
 */
Docker.prototype.getPlugin = function(name, remote) {
  return new Plugin(this.modem, name, remote);
};

/**
 * Fetches a Service by id
 * @param {String} id Services's id
 */
Docker.prototype.getService = function(id) {
  return new Service(this.modem, id);
};

/**
 * Fetches a Task by id
 * @param {String} id Task's id
 */
Docker.prototype.getTask = function(id) {
  return new Task(this.modem, id);
};

/**
 * Fetches Node by id
 * @param {String} id Node's id
 */
Docker.prototype.getNode = function(id) {
  return new Node(this.modem, id);
};

/**
 * Fetches a Network by id
 * @param {String} id network's id
 */
Docker.prototype.getNetwork = function(id) {
  return new Network(this.modem, id);
};

/**
 * Fetches a Secret by id
 * @param {String} id network's id
 */
Docker.prototype.getSecret = function(id) {
  return new Secret(this.modem, id);
};

/**
 * Fetches a Config by id
 * @param {String} id network's id
 */
Docker.prototype.getConfig = function(id) {
  return new Config(this.modem, id);
};

/**
 * Fetches an Exec instance by ID
 * @param {String} id Exec instance's ID
 */
Docker.prototype.getExec = function(id) {
  return new Exec(this.modem, id);
};

/**
 * Lists containers
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listContainers = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Lists images
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listImages = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Get images
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.getImages = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/get?',
    method: 'GET',
    options: args.opts,
    isStream: true,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Lists Services
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listServices = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/services?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Lists Nodes
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listNodes = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/nodes?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such node',
      500: 'server error',
      503: 'node is not part of a swarm',
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Lists Tasks
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listTasks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/tasks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Creates a new secret
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createSecret = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;
  var optsf = {
    path: '/secrets/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      406: 'server error or node is not part of a swarm',
      409: 'name conflicts with an existing object',
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getSecret(data.ID));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getSecret(data.ID));
    });
  }
};


/**
 * Creates a new config
 * @param {Object}   opts     Config options
 * @param {Function} callback Callback
 */
Docker.prototype.createConfig = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;
  var optsf = {
    path: '/configs/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      406: 'server error or node is not part of a swarm',
      409: 'name conflicts with an existing object',
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getConfig(data.ID));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getConfig(data.ID));
    });
  }
};


/**
 * Lists secrets
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listSecrets = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/secrets?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Lists configs
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listConfigs = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/configs?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Creates a new plugin
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createPlugin = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/plugins/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getPlugin(args.opts.name));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getPlugin(args.opts.name));
    });
  }
};


/**
 * Lists plugins
 * @param {Object} opts
 * @param {Function} callback Callback
 */
Docker.prototype.listPlugins = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Prune images
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.pruneImages = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Prune builder
 * @param {Function} callback Callback
 */
Docker.prototype.pruneBuilder = function(callback) {
  var self = this;

  var optsf = {
    path: '/build/prune',
    method: 'POST',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Prune containers
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.pruneContainers = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Prune volumes
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.pruneVolumes = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Prune networks
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.pruneNetworks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Creates a new volume
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createVolume = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/volumes/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getVolume(data.Name));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getVolume(data.Name));
    });
  }
};

/**
 * Creates a new service
 * @param {Object}   auth
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createService = function(auth, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  } else if (!opts && !callback) {
    opts = auth;
  }


  var self = this;
  var optsf = {
    path: '/services/create',
    method: 'POST',
    options: opts,
    authconfig: auth,
    statusCodes: {
      200: true,
      201: true,
      500: 'server error'
    }
  };


  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getService(data.ID || data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return callback(err, data);
      callback(err, self.getService(data.ID || data.Id));
    });
  }
};

/**
 * Lists volumes
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listVolumes = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Creates a new network
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createNetwork = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/networks/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'driver not found',
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getNetwork(data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getNetwork(data.Id));
    });
  }
};

/**
 * Lists networks
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listNetworks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Search images
 * @param {Object}   opts     Options
 * @param {Function} callback Callback
 */
Docker.prototype.searchImages = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/images/search?',
    method: 'GET',
    options: opts,
    authconfig: opts.authconfig,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Info
 * @param  {Function} callback Callback with info
 */
Docker.prototype.info = function(callback) {
  var self = this;
  var opts = {
    path: '/info',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };


  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Version
 * @param  {Function} callback Callback
 */
Docker.prototype.version = function(callback) {
  var self = this;
  var opts = {
    path: '/version',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Ping
 * @param  {Function} callback Callback
 */
Docker.prototype.ping = function(callback) {
  var self = this;
  var optsf = {
    path: '/_ping',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * SystemDf 	equivalent to system/df API Engine
 *		get usage data information
 * @param  {Function} callback Callback
 */
Docker.prototype.df = function(callback) {
  var self = this;
  var optsf = {
    path: '/system/df',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

/**
 * Events
 * @param {Object}   opts     Events options, like 'since' (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.getEvents = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/events?',
    method: 'GET',
    options: args.opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Pull is a wrapper around createImage, parsing image's tags.
 * @param  {String}   repoTag  Repository tag
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 * @param  {Object}   auth     Authentication (optional)
 * @return {Object}            Image
 */
Docker.prototype.pull = function(repoTag, opts, callback, auth) {
  var args = util.processArgs(opts, callback);

  var imageSrc = util.parseRepositoryTag(repoTag);
  args.opts.fromImage = imageSrc.repository;
  args.opts.tag = imageSrc.tag || 'latest';

  var argsf = [args.opts, args.callback];
  if (auth) {
    argsf = [auth, args.opts, args.callback];
  }
  return this.createImage.apply(this, argsf);
};

/**
 * Like run command from Docker's CLI
 * @param  {String}   image         Image name to be used.
 * @param  {Array}   cmd           Command to run in array format.
 * @param  {Object}   streamo       Output stream
 * @param  {Object}   createOptions Container create options (optional)
 * @param  {Object}   startOptions  Container start options (optional)
 * @param  {Function} callback      Callback
 * @return {Object}                 EventEmitter
 */
Docker.prototype.run = function(image, cmd, streamo, createOptions, startOptions, callback) {
  if (typeof arguments[arguments.length - 1] === 'function') {
    return this.runCallback(image, cmd, streamo, createOptions, startOptions, callback);
  } else {
    return this.runPromise(image, cmd, streamo, createOptions, startOptions);
  }
};


Docker.prototype.runCallback = function(image, cmd, streamo, createOptions, startOptions, callback) {
  if (!callback && typeof createOptions === 'function') {
    callback = createOptions;
    createOptions = {};
    startOptions = {};
  } else if (!callback && typeof startOptions === 'function') {
    callback = startOptions;
    startOptions = {};
  }

  var hub = new EventEmitter();

  function handler(err, container) {
    if (err) return callback(err, null, container);

    hub.emit('container', container);

    container.attach({
      stream: true,
      stdout: true,
      stderr: true
    }, function handler(err, stream) {
      if (err) return callback(err, null, container);

      hub.emit('stream', stream);

      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function() {
            try {
              streamo[0].end();
            } catch (e) {}
            try {
              streamo[1].end();
            } catch (e) {}
          });
          container.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {
            end: true
          });
        }
      }

      container.start(startOptions, function(err, data) {
        if (err) return callback(err, data, container);
        hub.emit('start', container);

        container.wait(function(err, data) {
          hub.emit('data', data);
          callback(err, data, container);
        });
      });
    });
  }

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': cmd,
    'Image': image,
    'Volumes': {},
    'VolumesFrom': []
  };

  extend(optsc, createOptions);

  this.createContainer(optsc, handler);

  return hub;
};

Docker.prototype.runPromise = function(image, cmd, streamo, createOptions, startOptions) {
  var self = this;

  createOptions = createOptions || {};
  startOptions = startOptions || {};

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': cmd,
    'Image': image,
    'Volumes': {},
    'VolumesFrom': []
  };

  extend(optsc, createOptions);

  var containero;

  return new this.modem.Promise(function(resolve, reject) {
    self.createContainer(optsc).then(function(container) {
      containero = container;
      return container.attach({
        stream: true,
        stdout: true,
        stderr: true
      });
    }).then(function(stream) {
      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function() {
            try {
              streamo[0].end();
            } catch (e) {}
            try {
              streamo[1].end();
            } catch (e) {}
          });
          containero.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {
            end: true
          });
        }
      }
      return containero.start(startOptions);
    }).then(function(data) {
      return containero.wait();
    }).then(function(data) {
      resolve([data, containero]);
    }).catch(function(err) {
      reject(err);
    });
  });
};

/**
 * Init swarm.
 *
 * @param {object} opts
 * @param {function} callback
 */
Docker.prototype.swarmInit = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/init',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Join swarm.
 *
 * @param {object} opts
 * @param {function} callback
 */
Docker.prototype.swarmJoin = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/join',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Leave swarm.
 *
 * @param {object} opts
 * @param {function} callback
 */
Docker.prototype.swarmLeave = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/leave?',
    method: 'POST',
    statusCodes: {
      200: true,
      406: 'node is not part of a Swarm'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Update swarm.
 *
 * @param {object} opts
 * @param {function} callback
 */
Docker.prototype.swarmUpdate = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


/**
 * Inspect a Swarm.
 * Warning: This method is not documented in the API
 *
 * @param  {Function} callback Callback
 */
Docker.prototype.swarmInspect = function(callback) {
  var self = this;
  var optsf = {
    path: '/swarm',
    method: 'GET',
    statusCodes: {
      200: true,
      406: 'This node is not a swarm manager',
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

Docker.Container = Container;
Docker.Image = Image;
Docker.Volume = Volume;
Docker.Network = Network;
Docker.Service = Service;
Docker.Plugin = Plugin;
Docker.Secret = Secret;
Docker.Task = Task;
Docker.Node = Node;
Docker.Exec = Exec;

module.exports = Docker;


/***/ }),

/***/ 998:
/***/ (function(module, __unusedexports, __webpack_require__) {

// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

var assert = __webpack_require__(357);
var Buffer = __webpack_require__(215).Buffer;
var ASN1 = __webpack_require__(362);
var errors = __webpack_require__(584);


// --- Globals

var newInvalidAsn1Error = errors.newInvalidAsn1Error;

var DEFAULT_OPTS = {
  size: 1024,
  growthFactor: 8
};


// --- Helpers

function merge(from, to) {
  assert.ok(from);
  assert.equal(typeof (from), 'object');
  assert.ok(to);
  assert.equal(typeof (to), 'object');

  var keys = Object.getOwnPropertyNames(from);
  keys.forEach(function (key) {
    if (to[key])
      return;

    var value = Object.getOwnPropertyDescriptor(from, key);
    Object.defineProperty(to, key, value);
  });

  return to;
}



// --- API

function Writer(options) {
  options = merge(DEFAULT_OPTS, options || {});

  this._buf = Buffer.alloc(options.size || 1024);
  this._size = this._buf.length;
  this._offset = 0;
  this._options = options;

  // A list of offsets in the buffer where we need to insert
  // sequence tag/len pairs.
  this._seq = [];
}

Object.defineProperty(Writer.prototype, 'buffer', {
  get: function () {
    if (this._seq.length)
      throw newInvalidAsn1Error(this._seq.length + ' unended sequence(s)');

    return (this._buf.slice(0, this._offset));
  }
});

Writer.prototype.writeByte = function (b) {
  if (typeof (b) !== 'number')
    throw new TypeError('argument must be a Number');

  this._ensure(1);
  this._buf[this._offset++] = b;
};


Writer.prototype.writeInt = function (i, tag) {
  if (typeof (i) !== 'number')
    throw new TypeError('argument must be a Number');
  if (typeof (tag) !== 'number')
    tag = ASN1.Integer;

  var sz = 4;

  while ((((i & 0xff800000) === 0) || ((i & 0xff800000) === 0xff800000 >> 0)) &&
        (sz > 1)) {
    sz--;
    i <<= 8;
  }

  if (sz > 4)
    throw newInvalidAsn1Error('BER ints cannot be > 0xffffffff');

  this._ensure(2 + sz);
  this._buf[this._offset++] = tag;
  this._buf[this._offset++] = sz;

  while (sz-- > 0) {
    this._buf[this._offset++] = ((i & 0xff000000) >>> 24);
    i <<= 8;
  }

};


Writer.prototype.writeNull = function () {
  this.writeByte(ASN1.Null);
  this.writeByte(0x00);
};


Writer.prototype.writeEnumeration = function (i, tag) {
  if (typeof (i) !== 'number')
    throw new TypeError('argument must be a Number');
  if (typeof (tag) !== 'number')
    tag = ASN1.Enumeration;

  return this.writeInt(i, tag);
};


Writer.prototype.writeBoolean = function (b, tag) {
  if (typeof (b) !== 'boolean')
    throw new TypeError('argument must be a Boolean');
  if (typeof (tag) !== 'number')
    tag = ASN1.Boolean;

  this._ensure(3);
  this._buf[this._offset++] = tag;
  this._buf[this._offset++] = 0x01;
  this._buf[this._offset++] = b ? 0xff : 0x00;
};


Writer.prototype.writeString = function (s, tag) {
  if (typeof (s) !== 'string')
    throw new TypeError('argument must be a string (was: ' + typeof (s) + ')');
  if (typeof (tag) !== 'number')
    tag = ASN1.OctetString;

  var len = Buffer.byteLength(s);
  this.writeByte(tag);
  this.writeLength(len);
  if (len) {
    this._ensure(len);
    this._buf.write(s, this._offset);
    this._offset += len;
  }
};


Writer.prototype.writeBuffer = function (buf, tag) {
  if (typeof (tag) !== 'number')
    throw new TypeError('tag must be a number');
  if (!Buffer.isBuffer(buf))
    throw new TypeError('argument must be a buffer');

  this.writeByte(tag);
  this.writeLength(buf.length);
  this._ensure(buf.length);
  buf.copy(this._buf, this._offset, 0, buf.length);
  this._offset += buf.length;
};


Writer.prototype.writeStringArray = function (strings) {
  if ((!strings instanceof Array))
    throw new TypeError('argument must be an Array[String]');

  var self = this;
  strings.forEach(function (s) {
    self.writeString(s);
  });
};

// This is really to solve DER cases, but whatever for now
Writer.prototype.writeOID = function (s, tag) {
  if (typeof (s) !== 'string')
    throw new TypeError('argument must be a string');
  if (typeof (tag) !== 'number')
    tag = ASN1.OID;

  if (!/^([0-9]+\.){3,}[0-9]+$/.test(s))
    throw new Error('argument is not a valid OID string');

  function encodeOctet(bytes, octet) {
    if (octet < 128) {
        bytes.push(octet);
    } else if (octet < 16384) {
        bytes.push((octet >>> 7) | 0x80);
        bytes.push(octet & 0x7F);
    } else if (octet < 2097152) {
      bytes.push((octet >>> 14) | 0x80);
      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
      bytes.push(octet & 0x7F);
    } else if (octet < 268435456) {
      bytes.push((octet >>> 21) | 0x80);
      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
      bytes.push(octet & 0x7F);
    } else {
      bytes.push(((octet >>> 28) | 0x80) & 0xFF);
      bytes.push(((octet >>> 21) | 0x80) & 0xFF);
      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
      bytes.push(octet & 0x7F);
    }
  }

  var tmp = s.split('.');
  var bytes = [];
  bytes.push(parseInt(tmp[0], 10) * 40 + parseInt(tmp[1], 10));
  tmp.slice(2).forEach(function (b) {
    encodeOctet(bytes, parseInt(b, 10));
  });

  var self = this;
  this._ensure(2 + bytes.length);
  this.writeByte(tag);
  this.writeLength(bytes.length);
  bytes.forEach(function (b) {
    self.writeByte(b);
  });
};


Writer.prototype.writeLength = function (len) {
  if (typeof (len) !== 'number')
    throw new TypeError('argument must be a Number');

  this._ensure(4);

  if (len <= 0x7f) {
    this._buf[this._offset++] = len;
  } else if (len <= 0xff) {
    this._buf[this._offset++] = 0x81;
    this._buf[this._offset++] = len;
  } else if (len <= 0xffff) {
    this._buf[this._offset++] = 0x82;
    this._buf[this._offset++] = len >> 8;
    this._buf[this._offset++] = len;
  } else if (len <= 0xffffff) {
    this._buf[this._offset++] = 0x83;
    this._buf[this._offset++] = len >> 16;
    this._buf[this._offset++] = len >> 8;
    this._buf[this._offset++] = len;
  } else {
    throw newInvalidAsn1Error('Length too long (> 4 bytes)');
  }
};

Writer.prototype.startSequence = function (tag) {
  if (typeof (tag) !== 'number')
    tag = ASN1.Sequence | ASN1.Constructor;

  this.writeByte(tag);
  this._seq.push(this._offset);
  this._ensure(3);
  this._offset += 3;
};


Writer.prototype.endSequence = function () {
  var seq = this._seq.pop();
  var start = seq + 3;
  var len = this._offset - start;

  if (len <= 0x7f) {
    this._shift(start, len, -2);
    this._buf[seq] = len;
  } else if (len <= 0xff) {
    this._shift(start, len, -1);
    this._buf[seq] = 0x81;
    this._buf[seq + 1] = len;
  } else if (len <= 0xffff) {
    this._buf[seq] = 0x82;
    this._buf[seq + 1] = len >> 8;
    this._buf[seq + 2] = len;
  } else if (len <= 0xffffff) {
    this._shift(start, len, 1);
    this._buf[seq] = 0x83;
    this._buf[seq + 1] = len >> 16;
    this._buf[seq + 2] = len >> 8;
    this._buf[seq + 3] = len;
  } else {
    throw newInvalidAsn1Error('Sequence too long');
  }
};


Writer.prototype._shift = function (start, len, shift) {
  assert.ok(start !== undefined);
  assert.ok(len !== undefined);
  assert.ok(shift);

  this._buf.copy(this._buf, start + shift, start, start + len);
  this._offset += shift;
};

Writer.prototype._ensure = function (len) {
  assert.ok(len);

  if (this._size - this._offset < len) {
    var sz = this._size * this._options.growthFactor;
    if (sz - this._offset < len)
      sz += len;

    var buf = Buffer.alloc(sz);

    this._buf.copy(buf, 0, 0, this._offset);
    this._buf = buf;
    this._size = sz;
  }
};



// --- Exported API

module.exports = Writer;


/***/ })

/******/ });