function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
export var SwaggerMcpServer = /*#__PURE__*/function () {
  function SwaggerMcpServer(swaggerUrl, token) {
    _classCallCheck(this, SwaggerMcpServer);
    _defineProperty(this, "swaggerUrl", void 0);
    _defineProperty(this, "token", void 0);
    _defineProperty(this, "swaggerDoc", void 0);
    this.swaggerUrl = swaggerUrl;
    this.token = token;
  }
  _createClass(SwaggerMcpServer, [{
    key: "loadSwagger",
    value: function () {
      var _loadSwagger = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var res, data;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fetch(this.swaggerUrl, {
                headers: this.token ? {
                  Authorization: "".concat(this.token)
                } : {}
              });
            case 2:
              res = _context.sent;
              _context.next = 5;
              return res.json();
            case 5:
              data = _context.sent;
              this.swaggerDoc = data;
              return _context.abrupt("return", this.swaggerDoc);
            case 8:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function loadSwagger() {
        return _loadSwagger.apply(this, arguments);
      }
      return loadSwagger;
    }() /** 1. 获取模块列表 */
  }, {
    key: "getModules",
    value: (function () {
      var _getModules = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var _doc$tags;
        var doc;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.loadSwagger();
            case 2:
              doc = _context2.sent;
              return _context2.abrupt("return", ((_doc$tags = doc.tags) !== null && _doc$tags !== void 0 ? _doc$tags : []).map(function (t) {
                return {
                  name: t.name,
                  description: t.description || ""
                };
              }));
            case 4:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getModules() {
        return _getModules.apply(this, arguments);
      }
      return getModules;
    }()
    /**
     * 递归解析引用类型，获取最底层类型定义
     * @param doc Swagger文档对象
     * @param ref 引用路径，如 '#/definitions/统一响应体«PageWrapper«VideoCreateResponse»»'
     * @param visited 已访问的引用路径，用于防止循环引用
     * @returns 最底层的类型定义
     */
    )
  }, {
    key: "resolveRef",
    value: function resolveRef(doc, ref) {
      var _doc$definitions,
        _this = this;
      var visited = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
      if (!ref) return undefined;

      // 提取定义名称，处理泛型语法如 "统一响应体«PageWrapper«VideoCreateResponse»»"

      // 防止循环引用
      if (visited.has(ref)) return undefined;
      visited.add(ref);

      // 获取定义
      var definition = (_doc$definitions = doc.definitions) === null || _doc$definitions === void 0 ? void 0 : _doc$definitions[ref];
      if (!definition) return undefined;

      // 如果定义是引用类型，继续解析
      if (definition.originalRef) {
        return this.resolveRef(doc, definition.originalRef, visited);
      }

      // 处理泛型类型，如包含items的情况
      if (definition.properties) {
        Object.keys(definition.properties).forEach(function (key) {
          var _definition$propertie, _prop$items;
          var prop = (_definition$propertie = definition.properties) === null || _definition$propertie === void 0 ? void 0 : _definition$propertie[key];
          if (prop !== null && prop !== void 0 && prop.originalRef) {
            var resolvedProp = _this.resolveRef(doc, prop.originalRef, new Set(visited));
            if (resolvedProp && definition.properties) {
              definition.properties[key] = resolvedProp;
            }
          }
          if (prop !== null && prop !== void 0 && (_prop$items = prop.items) !== null && _prop$items !== void 0 && _prop$items.originalRef) {
            var _prop$items2;
            var _resolvedProp = _this.resolveRef(doc, prop === null || prop === void 0 || (_prop$items2 = prop.items) === null || _prop$items2 === void 0 ? void 0 : _prop$items2.originalRef, new Set(visited));
            if (_resolvedProp && definition.properties) {
              definition.properties[key] = _resolvedProp;
            }
          }
        });
      }
      return definition;
    }

    /** 2. 获取某模块下的接口 */
  }, {
    key: "getModuleApis",
    value: (function () {
      var _getModuleApis = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(module) {
        var _this2 = this;
        var doc, apis;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.loadSwagger();
            case 2:
              doc = _context3.sent;
              apis = [];
              Object.keys(doc.paths).forEach(function (path) {
                Object.keys(doc.paths[path]).map(function (method) {
                  var _doc$paths$path$metho;
                  var op = (_doc$paths$path$metho = doc.paths[path][method]) === null || _doc$paths$path$metho === void 0 || (_doc$paths$path$metho = _doc$paths$path$metho.tags) === null || _doc$paths$path$metho === void 0 ? void 0 : _doc$paths$path$metho.includes(module);
                  if (op) {
                    var _doc$paths$path$metho2;
                    var originalRef = (_doc$paths$path$metho2 = doc.paths[path][method].responses) === null || _doc$paths$path$metho2 === void 0 || (_doc$paths$path$metho2 = _doc$paths$path$metho2["200"]) === null || _doc$paths$path$metho2 === void 0 || (_doc$paths$path$metho2 = _doc$paths$path$metho2.schema) === null || _doc$paths$path$metho2 === void 0 ? void 0 : _doc$paths$path$metho2.originalRef;
                    var resolvedDefinition = _this2.resolveRef(doc, originalRef);
                    apis.push(_objectSpread(_objectSpread({
                      path: path,
                      method: method
                    }, doc.paths[path][method]), {}, {
                      definitions: resolvedDefinition
                    }));
                  }
                });
              });
              return _context3.abrupt("return", apis);
            case 6:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function getModuleApis(_x) {
        return _getModuleApis.apply(this, arguments);
      }
      return getModuleApis;
    }() /** 3. 获取某个接口的类型 */)
  }, {
    key: "getApiTypes",
    value: (function () {
      var _getApiTypes = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(path, method) {
        var _doc$paths$path, _doc$paths$path$metho3;
        var doc, op, originalRef, resolvedDefinition;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.loadSwagger();
            case 2:
              doc = _context4.sent;
              op = (_doc$paths$path = doc.paths[path]) === null || _doc$paths$path === void 0 ? void 0 : _doc$paths$path[method.toLowerCase()];
              if (op) {
                _context4.next = 6;
                break;
              }
              throw new Error("接口不存在");
            case 6:
              originalRef = (_doc$paths$path$metho3 = doc.paths[path][method].responses) === null || _doc$paths$path$metho3 === void 0 || (_doc$paths$path$metho3 = _doc$paths$path$metho3["200"]) === null || _doc$paths$path$metho3 === void 0 || (_doc$paths$path$metho3 = _doc$paths$path$metho3.schema) === null || _doc$paths$path$metho3 === void 0 ? void 0 : _doc$paths$path$metho3.originalRef;
              resolvedDefinition = this.resolveRef(doc, originalRef);
              return _context4.abrupt("return", _objectSpread(_objectSpread({
                path: path,
                method: method
              }, doc.paths[path][method]), {}, {
                definitions: resolvedDefinition
              }));
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function getApiTypes(_x2, _x3) {
        return _getApiTypes.apply(this, arguments);
      }
      return getApiTypes;
    }())
  }]);
  return SwaggerMcpServer;
}();

// Map to store transports by session ID
var transports = {};
export default function vitePluginSwaggerMcp(_ref) {
  var swaggerUrl = _ref.swaggerUrl,
    token = _ref.token;
  return {
    name: "vite-plugin-swagger-mcp",
    enforce: "pre",
    configureServer: function configureServer(server) {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
        var transport, swaggerServer, mcpServer;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: function sessionIdGenerator() {
                  return randomUUID();
                },
                onsessioninitialized: function onsessioninitialized(sessionId) {
                  // Store the transport by session ID
                  transports[sessionId] = transport;
                }
              }); // Clean up transport when closed
              transport.onclose = function () {
                if (transport.sessionId) {
                  delete transports[transport.sessionId];
                }
              };
              swaggerServer = new SwaggerMcpServer(swaggerUrl, token); // 实例化 MCP Server
              mcpServer = new McpServer({
                name: "swagger-mcp-server",
                version: "0.1.0"
              }); // 注册工具
              /***
               * 获取模块列表
               */
              mcpServer.tool("getModules", "获取模块列表", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
                var res;
                return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                  while (1) switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return swaggerServer.getModules();
                    case 2:
                      res = _context5.sent;
                      return _context5.abrupt("return", {
                        content: [{
                          type: "text",
                          text: JSON.stringify(res)
                        }]
                      });
                    case 4:
                    case "end":
                      return _context5.stop();
                  }
                }, _callee5);
              })));

              /***
               * 获取特定模块下的所有接口及返回值类型
               */
              mcpServer.tool("getModuleApis", "获取特定模块下的所有接口及返回值类型", {
                module: z.string().describe("模块名称")
              }, /*#__PURE__*/function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(_ref3) {
                  var module, res;
                  return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        module = _ref3.module;
                        if (module) {
                          _context6.next = 3;
                          break;
                        }
                        return _context6.abrupt("return", {
                          content: [{
                            type: "text",
                            text: JSON.stringify({
                              error: "模块名称不能为空"
                            })
                          }]
                        });
                      case 3:
                        _context6.next = 5;
                        return swaggerServer.getModuleApis(module);
                      case 5:
                        res = _context6.sent;
                        return _context6.abrupt("return", {
                          content: [{
                            type: "text",
                            text: JSON.stringify(res)
                          }]
                        });
                      case 7:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6);
                }));
                return function (_x4) {
                  return _ref4.apply(this, arguments);
                };
              }());

              /***
               * 获取特定接口的参数及返回值类型
               */
              mcpServer.tool("getApiTypes", "获取特定接口的参数及返回值类型", {
                path: z.string(),
                method: z.string()
              }, /*#__PURE__*/function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(args) {
                  return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                    while (1) switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.t0 = JSON;
                        _context7.next = 3;
                        return swaggerServer.getApiTypes(args.path, args.method);
                      case 3:
                        _context7.t1 = _context7.sent;
                        _context7.t2 = _context7.t0.stringify.call(_context7.t0, _context7.t1);
                        _context7.t3 = {
                          type: "text",
                          text: _context7.t2
                        };
                        _context7.t4 = [_context7.t3];
                        return _context7.abrupt("return", {
                          content: _context7.t4
                        });
                      case 8:
                      case "end":
                        return _context7.stop();
                    }
                  }, _callee7);
                }));
                return function (_x5) {
                  return _ref5.apply(this, arguments);
                };
              }());

              // Connect to the MCP mcpServer
              _context9.next = 10;
              return mcpServer.connect(transport);
            case 10:
              console.log("MCP server connected");
              server.middlewares.use( /*#__PURE__*/function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res, next) {
                  var _req$url;
                  return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                    while (1) switch (_context8.prev = _context8.next) {
                      case 0:
                        if (!(req.method === "POST" && (_req$url = req.url) !== null && _req$url !== void 0 && _req$url.startsWith("/_mcp/sse/swagger"))) {
                          _context8.next = 6;
                          break;
                        }
                        if (!req.headers["mcp-session-id"] && transport.sessionId) {
                          // 自动补充
                          req.headers["mcp-session-id"] = transport.sessionId;
                        }
                        // Handle the request
                        _context8.next = 4;
                        return transport.handleRequest(req, res);
                      case 4:
                        _context8.next = 7;
                        break;
                      case 6:
                        next();
                      case 7:
                      case "end":
                        return _context8.stop();
                    }
                  }, _callee8);
                }));
                return function (_x6, _x7, _x8) {
                  return _ref6.apply(this, arguments);
                };
              }());
              _context9.next = 17;
              break;
            case 14:
              _context9.prev = 14;
              _context9.t0 = _context9["catch"](0);
              console.log("MCP server error", _context9.t0);
            case 17:
            case "end":
              return _context9.stop();
          }
        }, _callee9, null, [[0, 14]]);
      }))();
    }
  };
}