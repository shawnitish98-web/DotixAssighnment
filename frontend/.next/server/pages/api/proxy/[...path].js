"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/proxy/[...path]";
exports.ids = ["pages/api/proxy/[...path]"];
exports.modules = {

/***/ "(api)/./pages/api/proxy/[...path].js":
/*!**************************************!*\
  !*** ./pages/api/proxy/[...path].js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nasync function handler(req, res) {\n    const { path  } = req.query; // array\n    // Rebuild query string excluding the `path` param so we forward any filters\n    const q = new URLSearchParams();\n    for (const [k, v] of Object.entries(req.query)){\n        if (k === \"path\") continue;\n        if (Array.isArray(v)) v.forEach((x)=>q.append(k, x));\n        else if (v !== undefined) q.append(k, v);\n    }\n    const qs = q.toString();\n    const target = `http://127.0.0.1:4000/${path.join(\"/\")}${qs ? \"?\" + qs : \"\"}`;\n    // build a minimal init object to avoid forwarding problematic headers\n    const init = {\n        method: req.method,\n        headers: {\n            \"content-type\": \"application/json\"\n        }\n    };\n    if (req.method !== \"GET\" && req.body) init.body = JSON.stringify(req.body);\n    try {\n        const proxied = await fetch(target, init);\n        const text = await proxied.text();\n        res.status(proxied.status).send(text);\n    } catch (err) {\n        console.error(\"Proxy fetch error:\", err);\n        res.status(500).json({\n            error: err.message,\n            stack: err.stack\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvcHJveHkvWy4uLnBhdGhdLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBZSxlQUFlQSxRQUFRQyxHQUFHLEVBQUVDLEdBQUc7SUFDNUMsTUFBTSxFQUFFQyxLQUFJLEVBQUUsR0FBR0YsSUFBSUcsT0FBTyxRQUFRO0lBQ3BDLDRFQUE0RTtJQUM1RSxNQUFNQyxJQUFJLElBQUlDO0lBQ2QsS0FBSyxNQUFNLENBQUNDLEdBQUdDLEVBQUUsSUFBSUMsT0FBT0MsUUFBUVQsSUFBSUcsT0FBUTtRQUM5QyxJQUFJRyxNQUFNLFFBQVE7UUFDbEIsSUFBSUksTUFBTUMsUUFBUUosSUFBSUEsRUFBRUssUUFBUUMsQ0FBQUEsSUFBS1QsRUFBRVUsT0FBT1IsR0FBR087YUFDNUMsSUFBSU4sTUFBTVEsV0FBV1gsRUFBRVUsT0FBT1IsR0FBR0M7SUFDeEM7SUFDQSxNQUFNUyxLQUFLWixFQUFFYTtJQUNiLE1BQU1DLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRWhCLEtBQUtpQixLQUFLLEtBQUssRUFBRUgsS0FBSyxNQUFNQSxLQUFLLEdBQUcsQ0FBQztJQUU3RSxzRUFBc0U7SUFDdEUsTUFBTUksT0FBTztRQUFFQyxRQUFRckIsSUFBSXFCO1FBQVFDLFNBQVM7WUFBRSxnQkFBZ0I7UUFBbUI7SUFBRTtJQUNuRixJQUFJdEIsSUFBSXFCLFdBQVcsU0FBU3JCLElBQUl1QixNQUFNSCxLQUFLRyxPQUFPQyxLQUFLQyxVQUFVekIsSUFBSXVCO0lBRXJFLElBQUk7UUFDRixNQUFNRyxVQUFVLE1BQU1DLE1BQU1ULFFBQVFFO1FBQ3BDLE1BQU1RLE9BQU8sTUFBTUYsUUFBUUU7UUFDM0IzQixJQUFJNEIsT0FBT0gsUUFBUUcsUUFBUUMsS0FBS0Y7SUFDbEMsRUFBRSxPQUFPRyxLQUFLO1FBQ1pDLFFBQVFDLE1BQU0sc0JBQXNCRjtRQUNwQzlCLElBQUk0QixPQUFPLEtBQUtLLEtBQUs7WUFBRUQsT0FBT0YsSUFBSUk7WUFBU0MsT0FBT0wsSUFBSUs7UUFBTTtJQUM5RDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZG90aXgtam9iLXNjaGVkdWxlci1mcm9udGVuZC8uL3BhZ2VzL2FwaS9wcm94eS9bLi4ucGF0aF0uanM/MTJmMiJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGNvbnN0IHsgcGF0aCB9ID0gcmVxLnF1ZXJ5OyAvLyBhcnJheVxuICAvLyBSZWJ1aWxkIHF1ZXJ5IHN0cmluZyBleGNsdWRpbmcgdGhlIGBwYXRoYCBwYXJhbSBzbyB3ZSBmb3J3YXJkIGFueSBmaWx0ZXJzXG4gIGNvbnN0IHEgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHJlcS5xdWVyeSkpIHtcbiAgICBpZiAoayA9PT0gJ3BhdGgnKSBjb250aW51ZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkgdi5mb3JFYWNoKHggPT4gcS5hcHBlbmQoaywgeCkpO1xuICAgIGVsc2UgaWYgKHYgIT09IHVuZGVmaW5lZCkgcS5hcHBlbmQoaywgdik7XG4gIH1cbiAgY29uc3QgcXMgPSBxLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHRhcmdldCA9IGBodHRwOi8vMTI3LjAuMC4xOjQwMDAvJHtwYXRoLmpvaW4oJy8nKX0ke3FzID8gJz8nICsgcXMgOiAnJ31gO1xuXG4gIC8vIGJ1aWxkIGEgbWluaW1hbCBpbml0IG9iamVjdCB0byBhdm9pZCBmb3J3YXJkaW5nIHByb2JsZW1hdGljIGhlYWRlcnNcbiAgY29uc3QgaW5pdCA9IHsgbWV0aG9kOiByZXEubWV0aG9kLCBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSB9O1xuICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcgJiYgcmVxLmJvZHkpIGluaXQuYm9keSA9IEpTT04uc3RyaW5naWZ5KHJlcS5ib2R5KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHByb3hpZWQgPSBhd2FpdCBmZXRjaCh0YXJnZXQsIGluaXQpO1xuICAgIGNvbnN0IHRleHQgPSBhd2FpdCBwcm94aWVkLnRleHQoKTtcbiAgICByZXMuc3RhdHVzKHByb3hpZWQuc3RhdHVzKS5zZW5kKHRleHQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdQcm94eSBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlLCBzdGFjazogZXJyLnN0YWNrIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiaGFuZGxlciIsInJlcSIsInJlcyIsInBhdGgiLCJxdWVyeSIsInEiLCJVUkxTZWFyY2hQYXJhbXMiLCJrIiwidiIsIk9iamVjdCIsImVudHJpZXMiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwieCIsImFwcGVuZCIsInVuZGVmaW5lZCIsInFzIiwidG9TdHJpbmciLCJ0YXJnZXQiLCJqb2luIiwiaW5pdCIsIm1ldGhvZCIsImhlYWRlcnMiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsInByb3hpZWQiLCJmZXRjaCIsInRleHQiLCJzdGF0dXMiLCJzZW5kIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwianNvbiIsIm1lc3NhZ2UiLCJzdGFjayJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./pages/api/proxy/[...path].js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/proxy/[...path].js"));
module.exports = __webpack_exports__;

})();