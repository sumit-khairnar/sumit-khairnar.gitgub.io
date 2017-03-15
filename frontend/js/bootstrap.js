(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
///#source 1 1 /src/1.0.0/core.js
/*! head.core - v1.0.2 */
/*
 * HeadJS     The only script in your <HEAD>
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 * WebSite    http://headjs.com
 */
(function(win, undefined) {
    "use strict";

    // gt, gte, lt, lte, eq breakpoints would have been more simple to write as ['gt','gte','lt','lte','eq']
    // but then we would have had to loop over the collection on each resize() event,
    // a simple object with a direct access to true/false is therefore much more efficient
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            screens   : [240, 320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            screensCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                            { ie: { min: 6, max: 11 } }
                           //,{ chrome : { min: 8, max: 33 } }
                           //,{ ff     : { min: 3, max: 26 } }
                           //,{ ios    : { min: 3, max:  7 } }
                           //,{ android: { min: 2, max:  4 } }
                           //,{ webkit : { min: 9, max: 12 } }
                           //,{ opera  : { min: 9, max: 12 } }
            ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            html5     : true,
            page      : "-page",
            section   : "-section",
            head      : "head"
        };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        // need to test for both space and no space
        // https://github.com/headjs/headjs/issues/270
        // https://github.com/headjs/headjs/issues/226
        var re = new RegExp(" ?\\b" + name + "\\b");
        html.className = html.className.replace(re, "");
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += " " + klass.join(" ");
            klass = [];

            return api;
        }

        if (Object.prototype.toString.call(enabled) === "[object Function]") {
            enabled = enabled.call();
        }

        pushClass((enabled ? "" : "no-") + key);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass("no-" + key);
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|android|kindle|silk|midp|phone|(windows .+arm|touch)/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);

    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
        /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
        /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
        /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
        /(msie) ([\w.]+)/.exec(ua) ||
        /(trident).+rv:(\w.)+/.exec(ua) || [];

    var browser = ua[1],
        version = parseFloat(ua[2]);

    switch (browser) {
    case "msie":
    case "trident":
        browser = "ie";
        version = doc.documentMode || version;
        break;
        
    case "firefox":
        browser = "ff";
        break;
        
    case "ipod":
    case "ipad":
    case "iphone":
        browser = "ios";
        break;
        
    case "webkit":
        browser = "safari";
        break;
    }

    // Browser vendor and version
    api.browser = {
        name: browser,
        version: version
    };
    api.browser[browser] = true;

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {
            if (browser === key) {
                pushClass(key);

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss.gt) {
                            pushClass("gt-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    } else if (version < v) {
                        if (conf.browserCss.lt) {
                            pushClass("lt-" + key + v);
                        }

                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }
                    } else if (version === v) {
                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }

                        if (conf.browserCss.eq) {
                            pushClass("eq-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    }
                }
            } else {
                pushClass("no-" + key);
            }
        }
    }

    pushClass(browser);
    pushClass(browser + parseInt(version, 10));

    // IE lt9 specific
    if (conf.html5 && browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(this.slice(i, i + 1).join("-").toLowerCase() + conf.section);
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }

            html.id = id.toLowerCase() + conf.page;

            // on root?
            if (!i) {
                pushClass("root" + conf.section);
            }
        }
    });

    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-|eq-|gt-|gte-|lt-|lte-|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen.innerWidth = iw;
        api.screen.outerWidth = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.screens, function(width) {
            if (iw > width) {
                if (conf.screensCss.gt) {
                    pushClass("gt-" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            } else if (iw < width) {
                if (conf.screensCss.lt) {
                    pushClass("lt-" + width);
                }

                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }
            } else if (iw === width) {
                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }

                if (conf.screensCss.eq) {
                    pushClass("e-q" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            }
        });

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen.innerHeight = ih;
        api.screen.outerHeight = oh;

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }

    screenSize();

    // Throttle navigators from triggering too many resize events
    var resizeId = 0;

    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 50);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        // IE8 and less
        win.attachEvent("onresize", onResize);
    }
}(window));

},{}],2:[function(require,module,exports){
///#source 1 1 /src/1.0.0/load.js
/*! head.load - v1.0.3 */
/*
 * HeadJS     The only script in your <HEAD>
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 * WebSite    http://headjs.com
 */
(function (win, undefined) {
    "use strict";

    //#region variables
    var doc        = win.document,
        domWaiters = [],
        handlers   = {}, // user functions waiting for events
        assets     = {}, // loadable items in various states
        isAsync    = "async" in doc.createElement("script") || "MozAppearance" in doc.documentElement.style || win.opera,
        isDomReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function () { api.ready.apply(null, arguments); }),

        // states
        PRELOADING = 1,
        PRELOADED  = 2,
        LOADING    = 3,
        LOADED     = 4;
    //#endregion

    //#region PRIVATE functions

    //#region Helper functions
    function noop() {
        // does nothing
    }

    function each(arr, callback) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === "object") {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(arr, arr[i], i);
        }
    }

    /* A must read: http://bonsaiden.github.com/JavaScript-Garden
     ************************************************************/
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(item) {
        return is("Function", item);
    }

    function isArray(item) {
        return is("Array", item);
    }

    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var items = url.split("/"),
             name = items[items.length - 1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }

    // INFO: this look like a "im triggering callbacks all over the place, but only wanna run it one time function" ..should try to make everything work without it if possible
    // INFO: Even better. Look into promises/defered's like jQuery is doing
    function one(callback) {
        ///<summary>Execute a callback only once</summary>
        callback = callback || noop;

        if (callback._done) {
            return;
        }

        callback();
        callback._done = 1;
    }
    //#endregion

    function conditional(test, success, failure, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.test(condition, null       , "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", null       , callback);
        ///    head.test(condition, "fileOk.js", "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", ["file.NOk", "file.NOk"], callback);
        ///    head.test({
        ///               test    : condition,
        ///               success : [{ label1: "file1Ok.js"  }, { label2: "file2Ok.js" }],
        ///               failure : [{ label1: "file1NOk.js" }, { label2: "file2NOk.js" }],
        ///               callback: callback
        ///    );
        ///    head.test({
        ///               test    : condition,
        ///               success : ["file1Ok.js" , "file2Ok.js"],
        ///               failure : ["file1NOk.js", "file2NOk.js"],
        ///               callback: callback
        ///    );
        ///</summary>
        var obj = (typeof test === "object") ? test : {
            test: test,
            success: !!success ? isArray(success) ? success : [success] : false,
            failure: !!failure ? isArray(failure) ? failure : [failure] : false,
            callback: callback || noop
        };

        // Test Passed ?
        var passed = !!obj.test;

        // Do we have a success case
        if (passed && !!obj.success) {
            obj.success.push(obj.callback);
            api.load.apply(null, obj.success);
        }
        // Do we have a fail case
        else if (!passed && !!obj.failure) {
            obj.failure.push(obj.callback);
            api.load.apply(null, obj.failure);
        }
        else {
            callback();
        }

        return api;
    }

    function getAsset(item) {
        ///<summary>
        /// Assets are in the form of
        /// {
        ///     name : label,
        ///     url  : url,
        ///     state: state
        /// }
        ///</summary>
        var asset = {};

        if (typeof item === "object") {
            for (var label in item) {
                if (!!item[label]) {
                    asset = {
                        name: label,
                        url : item[label]
                    };
                }
            }
        }
        else {
            asset = {
                name: toLabel(item),
                url : item
            };
        }

        // is the item already existant
        var existing = assets[asset.name];
        if (existing && existing.url === asset.url) {
            return existing;
        }

        assets[asset.name] = asset;
        return asset;
    }

    function allLoaded(items) {
        items = items || assets;

        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
        }

        return true;
    }

    function onPreload(asset) {
        asset.state = PRELOADED;

        each(asset.onpreload, function (afterPreload) {
            afterPreload.call();
        });
    }

    function preLoad(asset, callback) {
        if (asset.state === undefined) {

            asset.state     = PRELOADING;
            asset.onpreload = [];

            loadAsset({ url: asset.url, type: "cache" }, function () {
                onPreload(asset);
            });
        }
    }

    function apiLoadHack() {
        /// <summary>preload with text/cache hack
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        /// </summary>
        var args     = arguments,
            callback = args[args.length - 1],
            rest     = [].slice.call(args, 1),
            next     = rest[0];

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // multiple arguments
        if (!!next) {
            /* Preload with text/cache hack (not good!)
             * http://blog.getify.com/on-script-loaders/
             * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
             * If caching is not configured correctly on the server, then items could load twice !
             *************************************************************************************/
            each(rest, function (item) {
                // item is not a callback or empty string
                if (!isFunction(item) && !!item) {
                    preLoad(getAsset(item));
                }
            });

            // execute
            load(getAsset(args[0]), isFunction(next) ? next : function () {
                api.load.apply(null, rest);
            });
        }
        else {
            // single item
            load(getAsset(args[0]));
        }

        return api;
    }

    function apiLoadAsync() {
        ///<summary>
        /// simply load and let browser take care of ordering
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        ///</summary>
        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // JRH 262#issuecomment-26288601
        // First populate the items array.
        // When allLoaded is called, all items will be populated.
        // Issue when lazy loaded, the callback can execute early.
        each(args, function (item, i) {
            if (item !== callback) {
                item             = getAsset(item);
                items[item.name] = item;
            }
        });

        each(args, function (item, i) {
            if (item !== callback) {
                item = getAsset(item);

                load(item, function () {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            }
        });

        return api;
    }

    function load(asset, callback) {
        ///<summary>Used with normal loading logic</summary>
        callback = callback || noop;

        if (asset.state === LOADED) {
            callback();
            return;
        }

        // INFO: why would we trigger a ready event when its not really loaded yet ?
        if (asset.state === LOADING) {
            api.ready(asset.name, callback);
            return;
        }

        if (asset.state === PRELOADING) {
            asset.onpreload.push(function () {
                load(asset, callback);
            });
            return;
        }

        asset.state = LOADING;

        loadAsset(asset, function () {
            asset.state = LOADED;

            callback();

            // handlers for this asset
            each(handlers[asset.name], function (fn) {
                one(fn);
            });

            // dom is ready & no assets are queued for loading
            // INFO: shouldn't we be doing the same test above ?
            if (isDomReady && allLoaded()) {
                each(handlers.ALL, function (fn) {
                    one(fn);
                });
            }
        });
    }

    function getExtension(url) {
        url = url || "";

        var items = url.split("?")[0].split(".");
        return items[items.length-1].toLowerCase();
    }

    /* Parts inspired from: https://github.com/cujojs/curl
    ******************************************************/
    function loadAsset(asset, callback) {
        callback = callback || noop;

        function error(event) {
            event = event || win.event;

            // release event listeners
            ele.onload = ele.onreadystatechange = ele.onerror = null;

            // do callback
            callback();

            // need some more detailed error handling here
        }

        function process(event) {
            event = event || win.event;

            // IE 7/8 (2 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded

            // IE 7/8 (1 event on reload)
            // 1) event.type = readystatechange, s.readyState = complete

            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 9 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded
            // 3) event.type = load            , s.readyState = loaded

            // IE 9 (2 events on reload)
            // 1) event.type = readystatechange, s.readyState = complete
            // 2) event.type = load            , s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 10 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = loaded

            // IE 10 (3 events on reload)
            // 1) event.type = readystatechange, s.readyState = loaded
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /complete/.test(s.readyState)

            // Other Browsers (1 event on 1st load)
            // 1) event.type = load, s.readyState = undefined

            // Other Browsers (1 event on reload)
            // 1) event.type = load, s.readyState = undefined

            // event.type == 'load' && s.readyState = undefined

            // !doc.documentMode is for IE6/7, IE8+ have documentMode
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9))) {
                // remove timeouts
                win.clearTimeout(asset.errorTimeout);
                win.clearTimeout(asset.cssTimeout);

                // release event listeners
                ele.onload = ele.onreadystatechange = ele.onerror = null;

                // do callback   
                callback();
            }
        }

        function isCssLoaded() {
            // should we test again ? 20 retries = 5secs ..after that, the callback will be triggered by the error handler at 7secs
            if (asset.state !== LOADED && asset.cssRetries <= 20) {

                // loop through stylesheets
                for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                    // do we have a match ?
                    // we need to tests agains ele.href and not asset.url, because a local file will be assigned the full http path on a link element
                    if (doc.styleSheets[i].href === ele.href) {
                        process({ "type": "load" });
                        return;
                    }
                }

                // increment & try again
                asset.cssRetries++;
                asset.cssTimeout = win.setTimeout(isCssLoaded, 250);
            }
        }

        var ele;
        var ext = getExtension(asset.url);

        if (ext === "css") {
            ele      = doc.createElement("link");
            ele.type = "text/" + (asset.type || "css");
            ele.rel  = "stylesheet";
            ele.href = asset.url;

            /* onload supported for CSS on unsupported browsers
             * Safari windows 5.1.7, FF < 10
             */

            // Set counter to zero
            asset.cssRetries = 0;
            asset.cssTimeout = win.setTimeout(isCssLoaded, 500);         
        }
        else {
            ele      = doc.createElement("script");
            ele.type = "text/" + (asset.type || "javascript");
            ele.src = asset.url;
        }

        ele.onload  = ele.onreadystatechange = process;
        ele.onerror = error;

        /* Good read, but doesn't give much hope !
         * http://blog.getify.com/on-script-loaders/
         * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
         * https://hacks.mozilla.org/2009/06/defer/
         */

        // ASYNC: load in parallel and execute as soon as possible
        ele.async = false;
        // DEFER: load in parallel but maintain execution order
        ele.defer = false;

        // timout for asset loading
        asset.errorTimeout = win.setTimeout(function () {
            error({ type: "timeout" });
        }, 7e3);

        // use insertBefore to keep IE from throwing Operation Aborted (thx Bryan Forbes!)
        var head = doc.head || doc.getElementsByTagName("head")[0];

        // but insert at end of head, because otherwise if it is a stylesheet, it will not override values      
        head.insertBefore(ele, head.lastChild);
    }

    /* Parts inspired from: https://github.com/jrburke/requirejs
    ************************************************************/
    function init() {
        var items = doc.getElementsByTagName("script");

        // look for a script with a data-head-init attribute
        for (var i = 0, l = items.length; i < l; i++) {
            var dataMain = items[i].getAttribute("data-headjs-load");
            if (!!dataMain) {
                api.load(dataMain);
                return;
            }
        }
    }

    function ready(key, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.ready(callBack);
        ///    head.ready(document , callBack);
        ///    head.ready("file.js", callBack);
        ///    head.ready("label"  , callBack);
        ///    head.ready(["label1", "label2"], callback);
        ///</summary>

        // DOM ready check: head.ready(document, function() { });
        if (key === doc) {
            if (isDomReady) {
                one(callback);
            }
            else {
                domWaiters.push(callback);
            }

            return api;
        }

        // shift arguments
        if (isFunction(key)) {
            callback = key;
            key      = "ALL"; // holds all callbacks that where added without labels: ready(callBack)
        }

        // queue all items from key and return. The callback will be executed if all items from key are already loaded.
        if (isArray(key)) {
            var items = {};

            each(key, function (item) {
                items[item] = assets[item];

                api.ready(item, function() {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            });

            return api;
        }

        // make sure arguments are sane
        if (typeof key !== "string" || !isFunction(callback)) {
            return api;
        }

        // this can also be called when we trigger events based on filenames & labels
        var asset = assets[key];

        // item already loaded --> execute and return
        if (asset && asset.state === LOADED || key === "ALL" && allLoaded() && isDomReady) {
            one(callback);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [callback];
        }
        else {
            arr.push(callback);
        }

        return api;
    }

    /* Mix of stuff from jQuery & IEContentLoaded
     * http://dev.w3.org/html5/spec/the-end.html#the-end
     ***************************************************/
    function domReady() {
        // Make sure body exists, at least, in case IE gets a little overzealous (jQuery ticket #5443).
        if (!doc.body) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
            win.clearTimeout(api.readyTimeout);
            api.readyTimeout = win.setTimeout(domReady, 50);
            return;
        }

        if (!isDomReady) {
            isDomReady = true;

            init();
            each(domWaiters, function (fn) {
                one(fn);
            });
        }
    }

    function domContentLoaded() {
        // W3C
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        }

        // IE
        else if (doc.readyState === "complete") {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    }

    // Catch cases where ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if (doc.readyState === "complete") {
        domReady();
    }

    // W3C
    else if (doc.addEventListener) {
        doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

        // A fallback to window.onload, that will always work
        win.addEventListener("load", domReady, false);
    }

    // IE
    else {
        // Ensure firing before onload, maybe late but safe also for iframes
        doc.attachEvent("onreadystatechange", domContentLoaded);

        // A fallback to window.onload, that will always work
        win.attachEvent("onload", domReady);

        // If IE and not a frame
        // continually check to see if the document is ready
        var top = false;

        try {
            top = !win.frameElement && doc.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
            (function doScrollCheck() {
                if (!isDomReady) {
                    try {
                        // Use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        top.doScroll("left");
                    } catch (error) {
                        // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
                        win.clearTimeout(api.readyTimeout);
                        api.readyTimeout = win.setTimeout(doScrollCheck, 50);
                        return;
                    }

                    // and execute any waiting functions
                    domReady();
                }
            }());
        }
    }
    //#endregion

    //#region Public Exports
    // INFO: determine which method to use for loading
    api.load  = api.js = isAsync ? apiLoadAsync : apiLoadHack;
    api.test  = conditional;
    api.ready = ready;
    //#endregion

    //#region INIT
    // perform this when DOM is ready
    api.ready(doc, function () {
        if (allLoaded()) {
            each(handlers.ALL, function (callback) {
                one(callback);
            });
        }

        if (api.feature) {
            api.feature("domloaded", true);
        }
    });
    //#endregion
}(window));

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Using headjs to asynchronously load javascript based on logic 
 */

var HeadCore = require('../../node_modules/headjs/dist/1.0.0/head.core.js');
var HeadLode = require('../../node_modules/headjs/dist/1.0.0/head.load.js');

/**
 * Check for existance of localStorage
 */
if (window.localStorage) {
    head.ready(document, initIt);
}

/**
 * Bootstrap the frontend javascript application if the user is signed-in
 */
function initIt() {
    var token = window.localStorage.getItem('tpw.rToken');

    if (token) {
        head.load(["https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.js"], config);
    } else {
        console.info('No TPW Token Found');
    }
};

/**
 * Load final dependencies and angular application
 */
function config() {
    console.info('Config Loaded');
    head.load(["/config.js"], tpw);
}

function tpw() {
    console.info('TPW App Loaded');
    head.load(["/frontend/js/tpw.app.js"]);
}

},{"../../node_modules/headjs/dist/1.0.0/head.core.js":1,"../../node_modules/headjs/dist/1.0.0/head.load.js":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGVhZGpzL2Rpc3QvMS4wLjAvaGVhZC5jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2hlYWRqcy9kaXN0LzEuMC4wL2hlYWQubG9hZC5qcyIsInNyYy9jbGllbnQvYm9vdHN0cmFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuc0JBOztBQUVBOzs7O0FBR0EsSUFBTSxXQUFXLFFBQVEsbURBQVIsQ0FBakI7QUFDQSxJQUFNLFdBQVcsUUFBUSxtREFBUixDQUFqQjs7QUFFQTs7O0FBR0EsSUFBSSxPQUFPLFlBQVgsRUFBeUI7QUFDckIsU0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixNQUFyQjtBQUNIOztBQUVEOzs7QUFHQSxTQUFTLE1BQVQsR0FBa0I7QUFDZCxRQUFJLFFBQVEsT0FBTyxZQUFQLENBQW9CLE9BQXBCLENBQTRCLFlBQTVCLENBQVo7O0FBRUEsUUFBSSxLQUFKLEVBQVc7QUFDUCxhQUFLLElBQUwsQ0FBVSxDQUNOLGtFQURNLENBQVYsRUFHSSxNQUhKO0FBS0gsS0FORCxNQU1PO0FBQ0gsZ0JBQVEsSUFBUixDQUFhLG9CQUFiO0FBQ0g7QUFDSjs7QUFFRDs7O0FBR0EsU0FBUyxNQUFULEdBQWtCO0FBQ2QsWUFBUSxJQUFSLENBQWEsZUFBYjtBQUNBLFNBQUssSUFBTCxDQUFVLENBQ04sWUFETSxDQUFWLEVBRUcsR0FGSDtBQUdIOztBQUdELFNBQVMsR0FBVCxHQUFlO0FBQ1gsWUFBUSxJQUFSLENBQWEsZ0JBQWI7QUFDQSxTQUFLLElBQUwsQ0FBVSxDQUNOLHlCQURNLENBQVY7QUFHSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy8jc291cmNlIDEgMSAvc3JjLzEuMC4wL2NvcmUuanNcbi8qISBoZWFkLmNvcmUgLSB2MS4wLjIgKi9cbi8qXG4gKiBIZWFkSlMgICAgIFRoZSBvbmx5IHNjcmlwdCBpbiB5b3VyIDxIRUFEPlxuICogQXV0aG9yICAgICBUZXJvIFBpaXJhaW5lbiAgKHRpcGlpcmFpKVxuICogTWFpbnRhaW5lciBSb2JlcnQgSG9mZm1hbm4gKGl0ZWNobm9sb2d5KVxuICogTGljZW5zZSAgICBNSVQgLyBodHRwOi8vYml0Lmx5L21pdC1saWNlbnNlXG4gKiBXZWJTaXRlICAgIGh0dHA6Ly9oZWFkanMuY29tXG4gKi9cbihmdW5jdGlvbih3aW4sIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gZ3QsIGd0ZSwgbHQsIGx0ZSwgZXEgYnJlYWtwb2ludHMgd291bGQgaGF2ZSBiZWVuIG1vcmUgc2ltcGxlIHRvIHdyaXRlIGFzIFsnZ3QnLCdndGUnLCdsdCcsJ2x0ZScsJ2VxJ11cbiAgICAvLyBidXQgdGhlbiB3ZSB3b3VsZCBoYXZlIGhhZCB0byBsb29wIG92ZXIgdGhlIGNvbGxlY3Rpb24gb24gZWFjaCByZXNpemUoKSBldmVudCxcbiAgICAvLyBhIHNpbXBsZSBvYmplY3Qgd2l0aCBhIGRpcmVjdCBhY2Nlc3MgdG8gdHJ1ZS9mYWxzZSBpcyB0aGVyZWZvcmUgbXVjaCBtb3JlIGVmZmljaWVudFxuICAgIHZhciBkb2MgICA9IHdpbi5kb2N1bWVudCxcbiAgICAgICAgbmF2ICAgPSB3aW4ubmF2aWdhdG9yLFxuICAgICAgICBsb2MgICA9IHdpbi5sb2NhdGlvbixcbiAgICAgICAgaHRtbCAgPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICBrbGFzcyA9IFtdLFxuICAgICAgICBjb25mICA9IHtcbiAgICAgICAgICAgIHNjcmVlbnMgICA6IFsyNDAsIDMyMCwgNDgwLCA2NDAsIDc2OCwgODAwLCAxMDI0LCAxMjgwLCAxNDQwLCAxNjgwLCAxOTIwXSxcbiAgICAgICAgICAgIHNjcmVlbnNDc3M6IHsgXCJndFwiOiB0cnVlLCBcImd0ZVwiOiBmYWxzZSwgXCJsdFwiOiB0cnVlLCBcImx0ZVwiOiBmYWxzZSwgXCJlcVwiOiBmYWxzZSB9LFxuICAgICAgICAgICAgYnJvd3NlcnMgIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgaWU6IHsgbWluOiA2LCBtYXg6IDExIH0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8seyBjaHJvbWUgOiB7IG1pbjogOCwgbWF4OiAzMyB9IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vLHsgZmYgICAgIDogeyBtaW46IDMsIG1heDogMjYgfSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyx7IGlvcyAgICA6IHsgbWluOiAzLCBtYXg6ICA3IH0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8seyBhbmRyb2lkOiB7IG1pbjogMiwgbWF4OiAgNCB9IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vLHsgd2Via2l0IDogeyBtaW46IDksIG1heDogMTIgfSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyx7IG9wZXJhICA6IHsgbWluOiA5LCBtYXg6IDEyIH0gfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGJyb3dzZXJDc3M6IHsgXCJndFwiOiB0cnVlLCBcImd0ZVwiOiBmYWxzZSwgXCJsdFwiOiB0cnVlLCBcImx0ZVwiOiBmYWxzZSwgXCJlcVwiOiB0cnVlIH0sXG4gICAgICAgICAgICBodG1sNSAgICAgOiB0cnVlLFxuICAgICAgICAgICAgcGFnZSAgICAgIDogXCItcGFnZVwiLFxuICAgICAgICAgICAgc2VjdGlvbiAgIDogXCItc2VjdGlvblwiLFxuICAgICAgICAgICAgaGVhZCAgICAgIDogXCJoZWFkXCJcbiAgICAgICAgfTtcblxuICAgIGlmICh3aW4uaGVhZF9jb25mKSB7XG4gICAgICAgIGZvciAodmFyIGl0ZW0gaW4gd2luLmhlYWRfY29uZikge1xuICAgICAgICAgICAgaWYgKHdpbi5oZWFkX2NvbmZbaXRlbV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbmZbaXRlbV0gPSB3aW4uaGVhZF9jb25mW2l0ZW1dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHVzaENsYXNzKG5hbWUpIHtcbiAgICAgICAga2xhc3Nba2xhc3MubGVuZ3RoXSA9IG5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MobmFtZSkge1xuICAgICAgICAvLyBuZWVkIHRvIHRlc3QgZm9yIGJvdGggc3BhY2UgYW5kIG5vIHNwYWNlXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oZWFkanMvaGVhZGpzL2lzc3Vlcy8yNzBcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2hlYWRqcy9oZWFkanMvaXNzdWVzLzIyNlxuICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiID9cXFxcYlwiICsgbmFtZSArIFwiXFxcXGJcIik7XG4gICAgICAgIGh0bWwuY2xhc3NOYW1lID0gaHRtbC5jbGFzc05hbWUucmVwbGFjZShyZSwgXCJcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZWFjaChhcnIsIGZuKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgZm4uY2FsbChhcnIsIGFycltpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBUElcbiAgICB2YXIgYXBpID0gd2luW2NvbmYuaGVhZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBpLnJlYWR5LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGFwaS5mZWF0dXJlID0gZnVuY3Rpb24oa2V5LCBlbmFibGVkLCBxdWV1ZSkge1xuXG4gICAgICAgIC8vIGludGVybmFsOiBhcHBseSBhbGwgY2xhc3Nlc1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgaHRtbC5jbGFzc05hbWUgKz0gXCIgXCIgKyBrbGFzcy5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgIGtsYXNzID0gW107XG5cbiAgICAgICAgICAgIHJldHVybiBhcGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVuYWJsZWQpID09PSBcIltvYmplY3QgRnVuY3Rpb25dXCIpIHtcbiAgICAgICAgICAgIGVuYWJsZWQgPSBlbmFibGVkLmNhbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1c2hDbGFzcygoZW5hYmxlZCA/IFwiXCIgOiBcIm5vLVwiKSArIGtleSk7XG4gICAgICAgIGFwaVtrZXldID0gISFlbmFibGVkO1xuXG4gICAgICAgIC8vIGFwcGx5IGNsYXNzIHRvIEhUTUwgZWxlbWVudFxuICAgICAgICBpZiAoIXF1ZXVlKSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhcIm5vLVwiICsga2V5KTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGtleSk7XG4gICAgICAgICAgICBhcGkuZmVhdHVyZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgLy8gbm8gcXVldWUgaGVyZSwgc28gd2UgY2FuIHJlbW92ZSBhbnkgZXZlbnR1YWwgcHJlLWV4aXN0aW5nIG5vLWpzIGNsYXNzXG4gICAgYXBpLmZlYXR1cmUoXCJqc1wiLCB0cnVlKTtcblxuICAgIC8vIGJyb3dzZXIgdHlwZSAmIHZlcnNpb25cbiAgICB2YXIgdWEgICAgID0gbmF2LnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBtb2JpbGUgPSAvbW9iaWxlfGFuZHJvaWR8a2luZGxlfHNpbGt8bWlkcHxwaG9uZXwod2luZG93cyAuK2FybXx0b3VjaCkvLnRlc3QodWEpO1xuXG4gICAgLy8gdXNlZnVsIGZvciBlbmFibGluZy9kaXNhYmxpbmcgZmVhdHVyZSAod2UgY2FuIGNvbnNpZGVyIGEgZGVza3RvcCBuYXZpZ2F0b3IgdG8gaGF2ZSBtb3JlIGNwdS9ncHUgcG93ZXIpXG4gICAgYXBpLmZlYXR1cmUoXCJtb2JpbGVcIiAsIG1vYmlsZSAsIHRydWUpO1xuICAgIGFwaS5mZWF0dXJlKFwiZGVza3RvcFwiLCAhbW9iaWxlLCB0cnVlKTtcblxuICAgIC8vIGh0dHA6Ly93d3cuenl0cmF4LmNvbS90ZWNoL3dlYi9icm93c2VyX2lkcy5odG1cbiAgICAvLyBodHRwOi8vd3d3Lnp5dHJheC5jb20vdGVjaC93ZWIvbW9iaWxlX2lkcy5odG1sXG4gICAgdWEgPSAvKGNocm9tZXxmaXJlZm94KVsgXFwvXShbXFx3Ll0rKS8uZXhlYyh1YSkgfHwgLy8gQ2hyb21lICYgRmlyZWZveFxuICAgICAgICAvKGlwaG9uZXxpcGFkfGlwb2QpKD86Lip2ZXJzaW9uKT9bIFxcL10oW1xcdy5dKykvLmV4ZWModWEpIHx8IC8vIE1vYmlsZSBJT1NcbiAgICAgICAgLyhhbmRyb2lkKSg/Oi4qdmVyc2lvbik/WyBcXC9dKFtcXHcuXSspLy5leGVjKHVhKSB8fCAvLyBNb2JpbGUgV2Via2l0XG4gICAgICAgIC8od2Via2l0fG9wZXJhKSg/Oi4qdmVyc2lvbik/WyBcXC9dKFtcXHcuXSspLy5leGVjKHVhKSB8fCAvLyBTYWZhcmkgJiBPcGVyYVxuICAgICAgICAvKG1zaWUpIChbXFx3Ll0rKS8uZXhlYyh1YSkgfHxcbiAgICAgICAgLyh0cmlkZW50KS4rcnY6KFxcdy4pKy8uZXhlYyh1YSkgfHwgW107XG5cbiAgICB2YXIgYnJvd3NlciA9IHVhWzFdLFxuICAgICAgICB2ZXJzaW9uID0gcGFyc2VGbG9hdCh1YVsyXSk7XG5cbiAgICBzd2l0Y2ggKGJyb3dzZXIpIHtcbiAgICBjYXNlIFwibXNpZVwiOlxuICAgIGNhc2UgXCJ0cmlkZW50XCI6XG4gICAgICAgIGJyb3dzZXIgPSBcImllXCI7XG4gICAgICAgIHZlcnNpb24gPSBkb2MuZG9jdW1lbnRNb2RlIHx8IHZlcnNpb247XG4gICAgICAgIGJyZWFrO1xuICAgICAgICBcbiAgICBjYXNlIFwiZmlyZWZveFwiOlxuICAgICAgICBicm93c2VyID0gXCJmZlwiO1xuICAgICAgICBicmVhaztcbiAgICAgICAgXG4gICAgY2FzZSBcImlwb2RcIjpcbiAgICBjYXNlIFwiaXBhZFwiOlxuICAgIGNhc2UgXCJpcGhvbmVcIjpcbiAgICAgICAgYnJvd3NlciA9IFwiaW9zXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICBcbiAgICBjYXNlIFwid2Via2l0XCI6XG4gICAgICAgIGJyb3dzZXIgPSBcInNhZmFyaVwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBCcm93c2VyIHZlbmRvciBhbmQgdmVyc2lvblxuICAgIGFwaS5icm93c2VyID0ge1xuICAgICAgICBuYW1lOiBicm93c2VyLFxuICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uXG4gICAgfTtcbiAgICBhcGkuYnJvd3Nlclticm93c2VyXSA9IHRydWU7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbmYuYnJvd3NlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjb25mLmJyb3dzZXJzW2ldKSB7XG4gICAgICAgICAgICBpZiAoYnJvd3NlciA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgcHVzaENsYXNzKGtleSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWluID0gY29uZi5icm93c2Vyc1tpXVtrZXldLm1pbjtcbiAgICAgICAgICAgICAgICB2YXIgbWF4ID0gY29uZi5icm93c2Vyc1tpXVtrZXldLm1heDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIHYgPSBtaW47IHYgPD0gbWF4OyB2KyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZlcnNpb24gPiB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZi5icm93c2VyQ3NzLmd0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaENsYXNzKFwiZ3QtXCIgKyBrZXkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmYuYnJvd3NlckNzcy5ndGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJndGUtXCIgKyBrZXkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uIDwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmYuYnJvd3NlckNzcy5sdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hDbGFzcyhcImx0LVwiICsga2V5ICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25mLmJyb3dzZXJDc3MubHRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaENsYXNzKFwibHRlLVwiICsga2V5ICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmVyc2lvbiA9PT0gdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmYuYnJvd3NlckNzcy5sdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJsdGUtXCIgKyBrZXkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmYuYnJvd3NlckNzcy5lcSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hDbGFzcyhcImVxLVwiICsga2V5ICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25mLmJyb3dzZXJDc3MuZ3RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaENsYXNzKFwiZ3RlLVwiICsga2V5ICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHB1c2hDbGFzcyhcIm5vLVwiICsga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1c2hDbGFzcyhicm93c2VyKTtcbiAgICBwdXNoQ2xhc3MoYnJvd3NlciArIHBhcnNlSW50KHZlcnNpb24sIDEwKSk7XG5cbiAgICAvLyBJRSBsdDkgc3BlY2lmaWNcbiAgICBpZiAoY29uZi5odG1sNSAmJiBicm93c2VyID09PSBcImllXCIgJiYgdmVyc2lvbiA8IDkpIHtcbiAgICAgICAgLy8gSFRNTDUgc3VwcG9ydCA6IHlvdSBzdGlsbCBuZWVkIHRvIGFkZCBodG1sNSBjc3MgaW5pdGlhbGl6YXRpb24gc3R5bGVzIHRvIHlvdXIgc2l0ZVxuICAgICAgICAvLyBTZWU6IGFzc2V0cy9odG1sNS5jc3NcbiAgICAgICAgZWFjaChcImFiYnJ8YXJ0aWNsZXxhc2lkZXxhdWRpb3xjYW52YXN8ZGV0YWlsc3xmaWdjYXB0aW9ufGZpZ3VyZXxmb290ZXJ8aGVhZGVyfGhncm91cHxtYWlufG1hcmt8bWV0ZXJ8bmF2fG91dHB1dHxwcm9ncmVzc3xzZWN0aW9ufHN1bW1hcnl8dGltZXx2aWRlb1wiLnNwbGl0KFwifFwiKSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGRvYy5jcmVhdGVFbGVtZW50KGVsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ1NTIFwicm91dGVyXCJcbiAgICBlYWNoKGxvYy5wYXRobmFtZS5zcGxpdChcIi9cIiksIGZ1bmN0aW9uKGVsLCBpKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA+IDIgJiYgdGhpc1tpICsgMV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGkpIHtcbiAgICAgICAgICAgICAgICBwdXNoQ2xhc3ModGhpcy5zbGljZShpLCBpICsgMSkuam9pbihcIi1cIikudG9Mb3dlckNhc2UoKSArIGNvbmYuc2VjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBwYWdlSWRcbiAgICAgICAgICAgIHZhciBpZCA9IGVsIHx8IFwiaW5kZXhcIiwgaW5kZXggPSBpZC5pbmRleE9mKFwiLlwiKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZCA9IGlkLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGh0bWwuaWQgPSBpZC50b0xvd2VyQ2FzZSgpICsgY29uZi5wYWdlO1xuXG4gICAgICAgICAgICAvLyBvbiByb290P1xuICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgcHVzaENsYXNzKFwicm9vdFwiICsgY29uZi5zZWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYmFzaWMgc2NyZWVuIGluZm9cbiAgICBhcGkuc2NyZWVuID0ge1xuICAgICAgICBoZWlnaHQ6IHdpbi5zY3JlZW4uaGVpZ2h0LFxuICAgICAgICB3aWR0aCA6IHdpbi5zY3JlZW4ud2lkdGhcbiAgICB9O1xuXG4gICAgLy8gdmlld3BvcnQgcmVzb2x1dGlvbnM6IHctMTAwLCBsdC00ODAsIGx0LTEwMjQgLi4uXG4gICAgZnVuY3Rpb24gc2NyZWVuU2l6ZSgpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGVhcmxpZXIgc2l6ZXNcbiAgICAgICAgaHRtbC5jbGFzc05hbWUgPSBodG1sLmNsYXNzTmFtZS5yZXBsYWNlKC8gKHctfGVxLXxndC18Z3RlLXxsdC18bHRlLXxwb3J0cmFpdHxuby1wb3J0cmFpdHxsYW5kc2NhcGV8bm8tbGFuZHNjYXBlKVxcZCsvZywgXCJcIik7XG5cbiAgICAgICAgLy8gVmlld3BvcnQgd2lkdGhcbiAgICAgICAgdmFyIGl3ID0gd2luLmlubmVyV2lkdGggfHwgaHRtbC5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgIG93ID0gd2luLm91dGVyV2lkdGggfHwgd2luLnNjcmVlbi53aWR0aDtcblxuICAgICAgICBhcGkuc2NyZWVuLmlubmVyV2lkdGggPSBpdztcbiAgICAgICAgYXBpLnNjcmVlbi5vdXRlcldpZHRoID0gb3c7XG5cbiAgICAgICAgLy8gZm9yIGRlYnVnZ2luZyBwdXJwb3Nlcywgbm90IHJlYWxseSB1c2VmdWwgZm9yIGFueXRoaW5nIGVsc2VcbiAgICAgICAgcHVzaENsYXNzKFwidy1cIiArIGl3KTtcblxuICAgICAgICBlYWNoKGNvbmYuc2NyZWVucywgZnVuY3Rpb24od2lkdGgpIHtcbiAgICAgICAgICAgIGlmIChpdyA+IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmYuc2NyZWVuc0Nzcy5ndCkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJndC1cIiArIHdpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29uZi5zY3JlZW5zQ3NzLmd0ZSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJndGUtXCIgKyB3aWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpdyA8IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmYuc2NyZWVuc0Nzcy5sdCkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJsdC1cIiArIHdpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29uZi5zY3JlZW5zQ3NzLmx0ZSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJsdGUtXCIgKyB3aWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpdyA9PT0gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZi5zY3JlZW5zQ3NzLmx0ZSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJsdGUtXCIgKyB3aWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbmYuc2NyZWVuc0Nzcy5lcSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJlLXFcIiArIHdpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29uZi5zY3JlZW5zQ3NzLmd0ZSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoQ2xhc3MoXCJndGUtXCIgKyB3aWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBWaWV3cG9ydCBoZWlnaHRcbiAgICAgICAgdmFyIGloID0gd2luLmlubmVySGVpZ2h0IHx8IGh0bWwuY2xpZW50SGVpZ2h0LFxuICAgICAgICAgICAgb2ggPSB3aW4ub3V0ZXJIZWlnaHQgfHwgd2luLnNjcmVlbi5oZWlnaHQ7XG5cbiAgICAgICAgYXBpLnNjcmVlbi5pbm5lckhlaWdodCA9IGloO1xuICAgICAgICBhcGkuc2NyZWVuLm91dGVySGVpZ2h0ID0gb2g7XG5cbiAgICAgICAgLy8gbm8gbmVlZCBmb3Igb25DaGFuZ2UgZXZlbnQgdG8gZGV0ZWN0IHRoaXNcbiAgICAgICAgYXBpLmZlYXR1cmUoXCJwb3J0cmFpdFwiICwgKGloID4gaXcpKTtcbiAgICAgICAgYXBpLmZlYXR1cmUoXCJsYW5kc2NhcGVcIiwgKGloIDwgaXcpKTtcbiAgICB9XG5cbiAgICBzY3JlZW5TaXplKCk7XG5cbiAgICAvLyBUaHJvdHRsZSBuYXZpZ2F0b3JzIGZyb20gdHJpZ2dlcmluZyB0b28gbWFueSByZXNpemUgZXZlbnRzXG4gICAgdmFyIHJlc2l6ZUlkID0gMDtcblxuICAgIGZ1bmN0aW9uIG9uUmVzaXplKCkge1xuICAgICAgICB3aW4uY2xlYXJUaW1lb3V0KHJlc2l6ZUlkKTtcbiAgICAgICAgcmVzaXplSWQgPSB3aW4uc2V0VGltZW91dChzY3JlZW5TaXplLCA1MCk7XG4gICAgfVxuXG4gICAgLy8gTWFudWFsbHkgYXR0YWNoLCBhcyB0byBub3Qgb3ZlcndyaXRlIGV4aXN0aW5nIGhhbmRsZXJcbiAgICBpZiAod2luLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgb25SZXNpemUsIGZhbHNlKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElFOCBhbmQgbGVzc1xuICAgICAgICB3aW4uYXR0YWNoRXZlbnQoXCJvbnJlc2l6ZVwiLCBvblJlc2l6ZSk7XG4gICAgfVxufSh3aW5kb3cpKTtcbiIsIi8vLyNzb3VyY2UgMSAxIC9zcmMvMS4wLjAvbG9hZC5qc1xuLyohIGhlYWQubG9hZCAtIHYxLjAuMyAqL1xuLypcbiAqIEhlYWRKUyAgICAgVGhlIG9ubHkgc2NyaXB0IGluIHlvdXIgPEhFQUQ+XG4gKiBBdXRob3IgICAgIFRlcm8gUGlpcmFpbmVuICAodGlwaWlyYWkpXG4gKiBNYWludGFpbmVyIFJvYmVydCBIb2ZmbWFubiAoaXRlY2hub2xvZ3kpXG4gKiBMaWNlbnNlICAgIE1JVCAvIGh0dHA6Ly9iaXQubHkvbWl0LWxpY2Vuc2VcbiAqIFdlYlNpdGUgICAgaHR0cDovL2hlYWRqcy5jb21cbiAqL1xuKGZ1bmN0aW9uICh3aW4sIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8jcmVnaW9uIHZhcmlhYmxlc1xuICAgIHZhciBkb2MgICAgICAgID0gd2luLmRvY3VtZW50LFxuICAgICAgICBkb21XYWl0ZXJzID0gW10sXG4gICAgICAgIGhhbmRsZXJzICAgPSB7fSwgLy8gdXNlciBmdW5jdGlvbnMgd2FpdGluZyBmb3IgZXZlbnRzXG4gICAgICAgIGFzc2V0cyAgICAgPSB7fSwgLy8gbG9hZGFibGUgaXRlbXMgaW4gdmFyaW91cyBzdGF0ZXNcbiAgICAgICAgaXNBc3luYyAgICA9IFwiYXN5bmNcIiBpbiBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSB8fCBcIk1vekFwcGVhcmFuY2VcIiBpbiBkb2MuZG9jdW1lbnRFbGVtZW50LnN0eWxlIHx8IHdpbi5vcGVyYSxcbiAgICAgICAgaXNEb21SZWFkeSxcblxuICAgICAgICAvKioqIHB1YmxpYyBBUEkgKioqL1xuICAgICAgICBoZWFkVmFyID0gd2luLmhlYWRfY29uZiAmJiB3aW4uaGVhZF9jb25mLmhlYWQgfHwgXCJoZWFkXCIsXG4gICAgICAgIGFwaSAgICAgPSB3aW5baGVhZFZhcl0gPSAod2luW2hlYWRWYXJdIHx8IGZ1bmN0aW9uICgpIHsgYXBpLnJlYWR5LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH0pLFxuXG4gICAgICAgIC8vIHN0YXRlc1xuICAgICAgICBQUkVMT0FESU5HID0gMSxcbiAgICAgICAgUFJFTE9BREVEICA9IDIsXG4gICAgICAgIExPQURJTkcgICAgPSAzLFxuICAgICAgICBMT0FERUQgICAgID0gNDtcbiAgICAvLyNlbmRyZWdpb25cblxuICAgIC8vI3JlZ2lvbiBQUklWQVRFIGZ1bmN0aW9uc1xuXG4gICAgLy8jcmVnaW9uIEhlbHBlciBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBub29wKCkge1xuICAgICAgICAvLyBkb2VzIG5vdGhpbmdcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlYWNoKGFyciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFhcnIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFyZ3VtZW50cyBzcGVjaWFsIHR5cGVcbiAgICAgICAgaWYgKHR5cGVvZiBhcnIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGFyciA9IFtdLnNsaWNlLmNhbGwoYXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvIHRoZSBqb2JcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGFyciwgYXJyW2ldLCBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIEEgbXVzdCByZWFkOiBodHRwOi8vYm9uc2FpZGVuLmdpdGh1Yi5jb20vSmF2YVNjcmlwdC1HYXJkZW5cbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGZ1bmN0aW9uIGlzKHR5cGUsIG9iaikge1xuICAgICAgICB2YXIgY2xhcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopLnNsaWNlKDgsIC0xKTtcbiAgICAgICAgcmV0dXJuIG9iaiAhPT0gdW5kZWZpbmVkICYmIG9iaiAhPT0gbnVsbCAmJiBjbGFzID09PSB0eXBlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXMoXCJGdW5jdGlvblwiLCBpdGVtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0FycmF5KGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGlzKFwiQXJyYXlcIiwgaXRlbSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9MYWJlbCh1cmwpIHtcbiAgICAgICAgLy8vPHN1bW1hcnk+Q29udmVydHMgYSB1cmwgdG8gYSBmaWxlIGxhYmVsPC9zdW1tYXJ5PlxuICAgICAgICB2YXIgaXRlbXMgPSB1cmwuc3BsaXQoXCIvXCIpLFxuICAgICAgICAgICAgIG5hbWUgPSBpdGVtc1tpdGVtcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICBpICAgID0gbmFtZS5pbmRleE9mKFwiP1wiKTtcblxuICAgICAgICByZXR1cm4gaSAhPT0gLTEgPyBuYW1lLnN1YnN0cmluZygwLCBpKSA6IG5hbWU7XG4gICAgfVxuXG4gICAgLy8gSU5GTzogdGhpcyBsb29rIGxpa2UgYSBcImltIHRyaWdnZXJpbmcgY2FsbGJhY2tzIGFsbCBvdmVyIHRoZSBwbGFjZSwgYnV0IG9ubHkgd2FubmEgcnVuIGl0IG9uZSB0aW1lIGZ1bmN0aW9uXCIgLi5zaG91bGQgdHJ5IHRvIG1ha2UgZXZlcnl0aGluZyB3b3JrIHdpdGhvdXQgaXQgaWYgcG9zc2libGVcbiAgICAvLyBJTkZPOiBFdmVuIGJldHRlci4gTG9vayBpbnRvIHByb21pc2VzL2RlZmVyZWQncyBsaWtlIGpRdWVyeSBpcyBkb2luZ1xuICAgIGZ1bmN0aW9uIG9uZShjYWxsYmFjaykge1xuICAgICAgICAvLy88c3VtbWFyeT5FeGVjdXRlIGEgY2FsbGJhY2sgb25seSBvbmNlPC9zdW1tYXJ5PlxuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrLl9kb25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICBjYWxsYmFjay5fZG9uZSA9IDE7XG4gICAgfVxuICAgIC8vI2VuZHJlZ2lvblxuXG4gICAgZnVuY3Rpb24gY29uZGl0aW9uYWwodGVzdCwgc3VjY2VzcywgZmFpbHVyZSwgY2FsbGJhY2spIHtcbiAgICAgICAgLy8vPHN1bW1hcnk+XG4gICAgICAgIC8vLyBJTkZPOiB1c2UgY2FzZXM6XG4gICAgICAgIC8vLyAgICBoZWFkLnRlc3QoY29uZGl0aW9uLCBudWxsICAgICAgICwgXCJmaWxlLk5Pa1wiICwgY2FsbGJhY2spO1xuICAgICAgICAvLy8gICAgaGVhZC50ZXN0KGNvbmRpdGlvbiwgXCJmaWxlT2suanNcIiwgbnVsbCAgICAgICAsIGNhbGxiYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQudGVzdChjb25kaXRpb24sIFwiZmlsZU9rLmpzXCIsIFwiZmlsZS5OT2tcIiAsIGNhbGxiYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQudGVzdChjb25kaXRpb24sIFwiZmlsZU9rLmpzXCIsIFtcImZpbGUuTk9rXCIsIFwiZmlsZS5OT2tcIl0sIGNhbGxiYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQudGVzdCh7XG4gICAgICAgIC8vLyAgICAgICAgICAgICAgIHRlc3QgICAgOiBjb25kaXRpb24sXG4gICAgICAgIC8vLyAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiBbeyBsYWJlbDE6IFwiZmlsZTFPay5qc1wiICB9LCB7IGxhYmVsMjogXCJmaWxlMk9rLmpzXCIgfV0sXG4gICAgICAgIC8vLyAgICAgICAgICAgICAgIGZhaWx1cmUgOiBbeyBsYWJlbDE6IFwiZmlsZTFOT2suanNcIiB9LCB7IGxhYmVsMjogXCJmaWxlMk5Pay5qc1wiIH1dLFxuICAgICAgICAvLy8gICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgLy8vICAgICk7XG4gICAgICAgIC8vLyAgICBoZWFkLnRlc3Qoe1xuICAgICAgICAvLy8gICAgICAgICAgICAgICB0ZXN0ICAgIDogY29uZGl0aW9uLFxuICAgICAgICAvLy8gICAgICAgICAgICAgICBzdWNjZXNzIDogW1wiZmlsZTFPay5qc1wiICwgXCJmaWxlMk9rLmpzXCJdLFxuICAgICAgICAvLy8gICAgICAgICAgICAgICBmYWlsdXJlIDogW1wiZmlsZTFOT2suanNcIiwgXCJmaWxlMk5Pay5qc1wiXSxcbiAgICAgICAgLy8vICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgIC8vLyAgICApO1xuICAgICAgICAvLy88L3N1bW1hcnk+XG4gICAgICAgIHZhciBvYmogPSAodHlwZW9mIHRlc3QgPT09IFwib2JqZWN0XCIpID8gdGVzdCA6IHtcbiAgICAgICAgICAgIHRlc3Q6IHRlc3QsXG4gICAgICAgICAgICBzdWNjZXNzOiAhIXN1Y2Nlc3MgPyBpc0FycmF5KHN1Y2Nlc3MpID8gc3VjY2VzcyA6IFtzdWNjZXNzXSA6IGZhbHNlLFxuICAgICAgICAgICAgZmFpbHVyZTogISFmYWlsdXJlID8gaXNBcnJheShmYWlsdXJlKSA/IGZhaWx1cmUgOiBbZmFpbHVyZV0gOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGVzdCBQYXNzZWQgP1xuICAgICAgICB2YXIgcGFzc2VkID0gISFvYmoudGVzdDtcblxuICAgICAgICAvLyBEbyB3ZSBoYXZlIGEgc3VjY2VzcyBjYXNlXG4gICAgICAgIGlmIChwYXNzZWQgJiYgISFvYmouc3VjY2Vzcykge1xuICAgICAgICAgICAgb2JqLnN1Y2Nlc3MucHVzaChvYmouY2FsbGJhY2spO1xuICAgICAgICAgICAgYXBpLmxvYWQuYXBwbHkobnVsbCwgb2JqLnN1Y2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIC8vIERvIHdlIGhhdmUgYSBmYWlsIGNhc2VcbiAgICAgICAgZWxzZSBpZiAoIXBhc3NlZCAmJiAhIW9iai5mYWlsdXJlKSB7XG4gICAgICAgICAgICBvYmouZmFpbHVyZS5wdXNoKG9iai5jYWxsYmFjayk7XG4gICAgICAgICAgICBhcGkubG9hZC5hcHBseShudWxsLCBvYmouZmFpbHVyZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwaTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBc3NldChpdGVtKSB7XG4gICAgICAgIC8vLzxzdW1tYXJ5PlxuICAgICAgICAvLy8gQXNzZXRzIGFyZSBpbiB0aGUgZm9ybSBvZlxuICAgICAgICAvLy8ge1xuICAgICAgICAvLy8gICAgIG5hbWUgOiBsYWJlbCxcbiAgICAgICAgLy8vICAgICB1cmwgIDogdXJsLFxuICAgICAgICAvLy8gICAgIHN0YXRlOiBzdGF0ZVxuICAgICAgICAvLy8gfVxuICAgICAgICAvLy88L3N1bW1hcnk+XG4gICAgICAgIHZhciBhc3NldCA9IHt9O1xuXG4gICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgZm9yICh2YXIgbGFiZWwgaW4gaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICghIWl0ZW1bbGFiZWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgOiBpdGVtW2xhYmVsXVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzc2V0ID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IHRvTGFiZWwoaXRlbSksXG4gICAgICAgICAgICAgICAgdXJsIDogaXRlbVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlzIHRoZSBpdGVtIGFscmVhZHkgZXhpc3RhbnRcbiAgICAgICAgdmFyIGV4aXN0aW5nID0gYXNzZXRzW2Fzc2V0Lm5hbWVdO1xuICAgICAgICBpZiAoZXhpc3RpbmcgJiYgZXhpc3RpbmcudXJsID09PSBhc3NldC51cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2V0c1thc3NldC5uYW1lXSA9IGFzc2V0O1xuICAgICAgICByZXR1cm4gYXNzZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWxsTG9hZGVkKGl0ZW1zKSB7XG4gICAgICAgIGl0ZW1zID0gaXRlbXMgfHwgYXNzZXRzO1xuXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpdGVtcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiBpdGVtc1tuYW1lXS5zdGF0ZSAhPT0gTE9BREVEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25QcmVsb2FkKGFzc2V0KSB7XG4gICAgICAgIGFzc2V0LnN0YXRlID0gUFJFTE9BREVEO1xuXG4gICAgICAgIGVhY2goYXNzZXQub25wcmVsb2FkLCBmdW5jdGlvbiAoYWZ0ZXJQcmVsb2FkKSB7XG4gICAgICAgICAgICBhZnRlclByZWxvYWQuY2FsbCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVMb2FkKGFzc2V0LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYXNzZXQuc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICBhc3NldC5zdGF0ZSAgICAgPSBQUkVMT0FESU5HO1xuICAgICAgICAgICAgYXNzZXQub25wcmVsb2FkID0gW107XG5cbiAgICAgICAgICAgIGxvYWRBc3NldCh7IHVybDogYXNzZXQudXJsLCB0eXBlOiBcImNhY2hlXCIgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG9uUHJlbG9hZChhc3NldCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFwaUxvYWRIYWNrKCkge1xuICAgICAgICAvLy8gPHN1bW1hcnk+cHJlbG9hZCB3aXRoIHRleHQvY2FjaGUgaGFja1xuICAgICAgICAvLy9cbiAgICAgICAgLy8vIGhlYWQubG9hZChcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIixcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIiwgY2FsbEJhY2spXG4gICAgICAgIC8vLyBoZWFkLmxvYWQoW1wiaHR0cDovL2RvbWFpbi5jb20vZmlsZS5qc1wiLFwiaHR0cDovL2RvbWFpbi5jb20vZmlsZS5qc1wiXSwgY2FsbEJhY2spXG4gICAgICAgIC8vLyBoZWFkLmxvYWQoeyBsYWJlbDE6IFwiaHR0cDovL2RvbWFpbi5jb20vZmlsZS5qc1wiIH0sIHsgbGFiZWwyOiBcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIiB9LCBjYWxsQmFjaylcbiAgICAgICAgLy8vIGhlYWQubG9hZChbeyBsYWJlbDE6IFwiaHR0cDovL2RvbWFpbi5jb20vZmlsZS5qc1wiIH0sIHsgbGFiZWwyOiBcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIiB9XSwgY2FsbEJhY2spXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHZhciBhcmdzICAgICA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgcmVzdCAgICAgPSBbXS5zbGljZS5jYWxsKGFyZ3MsIDEpLFxuICAgICAgICAgICAgbmV4dCAgICAgPSByZXN0WzBdO1xuXG4gICAgICAgIGlmICghaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGFycmF5LCByZXB1c2ggYXMgYXJnc1xuICAgICAgICBpZiAoaXNBcnJheShhcmdzWzBdKSkge1xuICAgICAgICAgICAgYXJnc1swXS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGFwaS5sb2FkLmFwcGx5KG51bGwsIGFyZ3NbMF0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGlwbGUgYXJndW1lbnRzXG4gICAgICAgIGlmICghIW5leHQpIHtcbiAgICAgICAgICAgIC8qIFByZWxvYWQgd2l0aCB0ZXh0L2NhY2hlIGhhY2sgKG5vdCBnb29kISlcbiAgICAgICAgICAgICAqIGh0dHA6Ly9ibG9nLmdldGlmeS5jb20vb24tc2NyaXB0LWxvYWRlcnMvXG4gICAgICAgICAgICAgKiBodHRwOi8vd3d3Lm5jem9ubGluZS5uZXQvYmxvZy8yMDEwLzEyLzIxL3Rob3VnaHRzLW9uLXNjcmlwdC1sb2FkZXJzL1xuICAgICAgICAgICAgICogSWYgY2FjaGluZyBpcyBub3QgY29uZmlndXJlZCBjb3JyZWN0bHkgb24gdGhlIHNlcnZlciwgdGhlbiBpdGVtcyBjb3VsZCBsb2FkIHR3aWNlICFcbiAgICAgICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgICAgICAgICAgZWFjaChyZXN0LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIGl0ZW0gaXMgbm90IGEgY2FsbGJhY2sgb3IgZW1wdHkgc3RyaW5nXG4gICAgICAgICAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZW0pICYmICEhaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBwcmVMb2FkKGdldEFzc2V0KGl0ZW0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZXhlY3V0ZVxuICAgICAgICAgICAgbG9hZChnZXRBc3NldChhcmdzWzBdKSwgaXNGdW5jdGlvbihuZXh0KSA/IG5leHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYXBpLmxvYWQuYXBwbHkobnVsbCwgcmVzdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNpbmdsZSBpdGVtXG4gICAgICAgICAgICBsb2FkKGdldEFzc2V0KGFyZ3NbMF0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcGk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBpTG9hZEFzeW5jKCkge1xuICAgICAgICAvLy88c3VtbWFyeT5cbiAgICAgICAgLy8vIHNpbXBseSBsb2FkIGFuZCBsZXQgYnJvd3NlciB0YWtlIGNhcmUgb2Ygb3JkZXJpbmdcbiAgICAgICAgLy8vXG4gICAgICAgIC8vLyBoZWFkLmxvYWQoXCJodHRwOi8vZG9tYWluLmNvbS9maWxlLmpzXCIsXCJodHRwOi8vZG9tYWluLmNvbS9maWxlLmpzXCIsIGNhbGxCYWNrKVxuICAgICAgICAvLy8gaGVhZC5sb2FkKFtcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIixcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIl0sIGNhbGxCYWNrKVxuICAgICAgICAvLy8gaGVhZC5sb2FkKHsgbGFiZWwxOiBcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIiB9LCB7IGxhYmVsMjogXCJodHRwOi8vZG9tYWluLmNvbS9maWxlLmpzXCIgfSwgY2FsbEJhY2spXG4gICAgICAgIC8vLyBoZWFkLmxvYWQoW3sgbGFiZWwxOiBcImh0dHA6Ly9kb21haW4uY29tL2ZpbGUuanNcIiB9LCB7IGxhYmVsMjogXCJodHRwOi8vZG9tYWluLmNvbS9maWxlLmpzXCIgfV0sIGNhbGxCYWNrKVxuICAgICAgICAvLy88L3N1bW1hcnk+XG4gICAgICAgIHZhciBhcmdzICAgICA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgaXRlbXMgICAgPSB7fTtcblxuICAgICAgICBpZiAoIWlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhcnJheSwgcmVwdXNoIGFzIGFyZ3NcbiAgICAgICAgaWYgKGlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgICAgICAgIGFyZ3NbMF0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBhcGkubG9hZC5hcHBseShudWxsLCBhcmdzWzBdKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEpSSCAyNjIjaXNzdWVjb21tZW50LTI2Mjg4NjAxXG4gICAgICAgIC8vIEZpcnN0IHBvcHVsYXRlIHRoZSBpdGVtcyBhcnJheS5cbiAgICAgICAgLy8gV2hlbiBhbGxMb2FkZWQgaXMgY2FsbGVkLCBhbGwgaXRlbXMgd2lsbCBiZSBwb3B1bGF0ZWQuXG4gICAgICAgIC8vIElzc3VlIHdoZW4gbGF6eSBsb2FkZWQsIHRoZSBjYWxsYmFjayBjYW4gZXhlY3V0ZSBlYXJseS5cbiAgICAgICAgZWFjaChhcmdzLCBmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0gIT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaXRlbSAgICAgICAgICAgICA9IGdldEFzc2V0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIGl0ZW1zW2l0ZW0ubmFtZV0gPSBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBlYWNoKGFyZ3MsIGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgICAgICBpZiAoaXRlbSAhPT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpdGVtID0gZ2V0QXNzZXQoaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBsb2FkKGl0ZW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbExvYWRlZChpdGVtcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZShjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGFwaTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkKGFzc2V0LCBjYWxsYmFjaykge1xuICAgICAgICAvLy88c3VtbWFyeT5Vc2VkIHdpdGggbm9ybWFsIGxvYWRpbmcgbG9naWM8L3N1bW1hcnk+XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICBpZiAoYXNzZXQuc3RhdGUgPT09IExPQURFRCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElORk86IHdoeSB3b3VsZCB3ZSB0cmlnZ2VyIGEgcmVhZHkgZXZlbnQgd2hlbiBpdHMgbm90IHJlYWxseSBsb2FkZWQgeWV0ID9cbiAgICAgICAgaWYgKGFzc2V0LnN0YXRlID09PSBMT0FESU5HKSB7XG4gICAgICAgICAgICBhcGkucmVhZHkoYXNzZXQubmFtZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFzc2V0LnN0YXRlID09PSBQUkVMT0FESU5HKSB7XG4gICAgICAgICAgICBhc3NldC5vbnByZWxvYWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbG9hZChhc3NldCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhc3NldC5zdGF0ZSA9IExPQURJTkc7XG5cbiAgICAgICAgbG9hZEFzc2V0KGFzc2V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhc3NldC5zdGF0ZSA9IExPQURFRDtcblxuICAgICAgICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgLy8gaGFuZGxlcnMgZm9yIHRoaXMgYXNzZXRcbiAgICAgICAgICAgIGVhY2goaGFuZGxlcnNbYXNzZXQubmFtZV0sIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIG9uZShmbik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZG9tIGlzIHJlYWR5ICYgbm8gYXNzZXRzIGFyZSBxdWV1ZWQgZm9yIGxvYWRpbmdcbiAgICAgICAgICAgIC8vIElORk86IHNob3VsZG4ndCB3ZSBiZSBkb2luZyB0aGUgc2FtZSB0ZXN0IGFib3ZlID9cbiAgICAgICAgICAgIGlmIChpc0RvbVJlYWR5ICYmIGFsbExvYWRlZCgpKSB7XG4gICAgICAgICAgICAgICAgZWFjaChoYW5kbGVycy5BTEwsIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgICAgICBvbmUoZm4pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFeHRlbnNpb24odXJsKSB7XG4gICAgICAgIHVybCA9IHVybCB8fCBcIlwiO1xuXG4gICAgICAgIHZhciBpdGVtcyA9IHVybC5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCIuXCIpO1xuICAgICAgICByZXR1cm4gaXRlbXNbaXRlbXMubGVuZ3RoLTFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgLyogUGFydHMgaW5zcGlyZWQgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy9jdXJsXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGZ1bmN0aW9uIGxvYWRBc3NldChhc3NldCwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudCA9IGV2ZW50IHx8IHdpbi5ldmVudDtcblxuICAgICAgICAgICAgLy8gcmVsZWFzZSBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIGVsZS5vbmxvYWQgPSBlbGUub25yZWFkeXN0YXRlY2hhbmdlID0gZWxlLm9uZXJyb3IgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBkbyBjYWxsYmFja1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgLy8gbmVlZCBzb21lIG1vcmUgZGV0YWlsZWQgZXJyb3IgaGFuZGxpbmcgaGVyZVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcHJvY2VzcyhldmVudCkge1xuICAgICAgICAgICAgZXZlbnQgPSBldmVudCB8fCB3aW4uZXZlbnQ7XG5cbiAgICAgICAgICAgIC8vIElFIDcvOCAoMiBldmVudHMgb24gMXN0IGxvYWQpXG4gICAgICAgICAgICAvLyAxKSBldmVudC50eXBlID0gcmVhZHlzdGF0ZWNoYW5nZSwgcy5yZWFkeVN0YXRlID0gbG9hZGluZ1xuICAgICAgICAgICAgLy8gMikgZXZlbnQudHlwZSA9IHJlYWR5c3RhdGVjaGFuZ2UsIHMucmVhZHlTdGF0ZSA9IGxvYWRlZFxuXG4gICAgICAgICAgICAvLyBJRSA3LzggKDEgZXZlbnQgb24gcmVsb2FkKVxuICAgICAgICAgICAgLy8gMSkgZXZlbnQudHlwZSA9IHJlYWR5c3RhdGVjaGFuZ2UsIHMucmVhZHlTdGF0ZSA9IGNvbXBsZXRlXG5cbiAgICAgICAgICAgIC8vIGV2ZW50LnR5cGUgPT09ICdyZWFkeXN0YXRlY2hhbmdlJyAmJiAvbG9hZGVkfGNvbXBsZXRlLy50ZXN0KHMucmVhZHlTdGF0ZSlcblxuICAgICAgICAgICAgLy8gSUUgOSAoMyBldmVudHMgb24gMXN0IGxvYWQpXG4gICAgICAgICAgICAvLyAxKSBldmVudC50eXBlID0gcmVhZHlzdGF0ZWNoYW5nZSwgcy5yZWFkeVN0YXRlID0gbG9hZGluZ1xuICAgICAgICAgICAgLy8gMikgZXZlbnQudHlwZSA9IHJlYWR5c3RhdGVjaGFuZ2UsIHMucmVhZHlTdGF0ZSA9IGxvYWRlZFxuICAgICAgICAgICAgLy8gMykgZXZlbnQudHlwZSA9IGxvYWQgICAgICAgICAgICAsIHMucmVhZHlTdGF0ZSA9IGxvYWRlZFxuXG4gICAgICAgICAgICAvLyBJRSA5ICgyIGV2ZW50cyBvbiByZWxvYWQpXG4gICAgICAgICAgICAvLyAxKSBldmVudC50eXBlID0gcmVhZHlzdGF0ZWNoYW5nZSwgcy5yZWFkeVN0YXRlID0gY29tcGxldGVcbiAgICAgICAgICAgIC8vIDIpIGV2ZW50LnR5cGUgPSBsb2FkICAgICAgICAgICAgLCBzLnJlYWR5U3RhdGUgPSBjb21wbGV0ZVxuXG4gICAgICAgICAgICAvLyBldmVudC50eXBlID09PSAnbG9hZCcgICAgICAgICAgICAgJiYgL2xvYWRlZHxjb21wbGV0ZS8udGVzdChzLnJlYWR5U3RhdGUpXG4gICAgICAgICAgICAvLyBldmVudC50eXBlID09PSAncmVhZHlzdGF0ZWNoYW5nZScgJiYgL2xvYWRlZHxjb21wbGV0ZS8udGVzdChzLnJlYWR5U3RhdGUpXG5cbiAgICAgICAgICAgIC8vIElFIDEwICgzIGV2ZW50cyBvbiAxc3QgbG9hZClcbiAgICAgICAgICAgIC8vIDEpIGV2ZW50LnR5cGUgPSByZWFkeXN0YXRlY2hhbmdlLCBzLnJlYWR5U3RhdGUgPSBsb2FkaW5nXG4gICAgICAgICAgICAvLyAyKSBldmVudC50eXBlID0gbG9hZCAgICAgICAgICAgICwgcy5yZWFkeVN0YXRlID0gY29tcGxldGVcbiAgICAgICAgICAgIC8vIDMpIGV2ZW50LnR5cGUgPSByZWFkeXN0YXRlY2hhbmdlLCBzLnJlYWR5U3RhdGUgPSBsb2FkZWRcblxuICAgICAgICAgICAgLy8gSUUgMTAgKDMgZXZlbnRzIG9uIHJlbG9hZClcbiAgICAgICAgICAgIC8vIDEpIGV2ZW50LnR5cGUgPSByZWFkeXN0YXRlY2hhbmdlLCBzLnJlYWR5U3RhdGUgPSBsb2FkZWRcbiAgICAgICAgICAgIC8vIDIpIGV2ZW50LnR5cGUgPSBsb2FkICAgICAgICAgICAgLCBzLnJlYWR5U3RhdGUgPSBjb21wbGV0ZVxuICAgICAgICAgICAgLy8gMykgZXZlbnQudHlwZSA9IHJlYWR5c3RhdGVjaGFuZ2UsIHMucmVhZHlTdGF0ZSA9IGNvbXBsZXRlXG5cbiAgICAgICAgICAgIC8vIGV2ZW50LnR5cGUgPT09ICdsb2FkJyAgICAgICAgICAgICAmJiAvbG9hZGVkfGNvbXBsZXRlLy50ZXN0KHMucmVhZHlTdGF0ZSlcbiAgICAgICAgICAgIC8vIGV2ZW50LnR5cGUgPT09ICdyZWFkeXN0YXRlY2hhbmdlJyAmJiAvY29tcGxldGUvLnRlc3Qocy5yZWFkeVN0YXRlKVxuXG4gICAgICAgICAgICAvLyBPdGhlciBCcm93c2VycyAoMSBldmVudCBvbiAxc3QgbG9hZClcbiAgICAgICAgICAgIC8vIDEpIGV2ZW50LnR5cGUgPSBsb2FkLCBzLnJlYWR5U3RhdGUgPSB1bmRlZmluZWRcblxuICAgICAgICAgICAgLy8gT3RoZXIgQnJvd3NlcnMgKDEgZXZlbnQgb24gcmVsb2FkKVxuICAgICAgICAgICAgLy8gMSkgZXZlbnQudHlwZSA9IGxvYWQsIHMucmVhZHlTdGF0ZSA9IHVuZGVmaW5lZFxuXG4gICAgICAgICAgICAvLyBldmVudC50eXBlID09ICdsb2FkJyAmJiBzLnJlYWR5U3RhdGUgPSB1bmRlZmluZWRcblxuICAgICAgICAgICAgLy8gIWRvYy5kb2N1bWVudE1vZGUgaXMgZm9yIElFNi83LCBJRTgrIGhhdmUgZG9jdW1lbnRNb2RlXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJsb2FkXCIgfHwgKC9sb2FkZWR8Y29tcGxldGUvLnRlc3QoZWxlLnJlYWR5U3RhdGUpICYmICghZG9jLmRvY3VtZW50TW9kZSB8fCBkb2MuZG9jdW1lbnRNb2RlIDwgOSkpKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRpbWVvdXRzXG4gICAgICAgICAgICAgICAgd2luLmNsZWFyVGltZW91dChhc3NldC5lcnJvclRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHdpbi5jbGVhclRpbWVvdXQoYXNzZXQuY3NzVGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZWxlYXNlIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgICAgICAgIGVsZS5vbmxvYWQgPSBlbGUub25yZWFkeXN0YXRlY2hhbmdlID0gZWxlLm9uZXJyb3IgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gZG8gY2FsbGJhY2sgICBcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaXNDc3NMb2FkZWQoKSB7XG4gICAgICAgICAgICAvLyBzaG91bGQgd2UgdGVzdCBhZ2FpbiA/IDIwIHJldHJpZXMgPSA1c2VjcyAuLmFmdGVyIHRoYXQsIHRoZSBjYWxsYmFjayB3aWxsIGJlIHRyaWdnZXJlZCBieSB0aGUgZXJyb3IgaGFuZGxlciBhdCA3c2Vjc1xuICAgICAgICAgICAgaWYgKGFzc2V0LnN0YXRlICE9PSBMT0FERUQgJiYgYXNzZXQuY3NzUmV0cmllcyA8PSAyMCkge1xuXG4gICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHN0eWxlc2hlZXRzXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkb2Muc3R5bGVTaGVldHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvIHdlIGhhdmUgYSBtYXRjaCA/XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gdGVzdHMgYWdhaW5zIGVsZS5ocmVmIGFuZCBub3QgYXNzZXQudXJsLCBiZWNhdXNlIGEgbG9jYWwgZmlsZSB3aWxsIGJlIGFzc2lnbmVkIHRoZSBmdWxsIGh0dHAgcGF0aCBvbiBhIGxpbmsgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jLnN0eWxlU2hlZXRzW2ldLmhyZWYgPT09IGVsZS5ocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzKHsgXCJ0eXBlXCI6IFwibG9hZFwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50ICYgdHJ5IGFnYWluXG4gICAgICAgICAgICAgICAgYXNzZXQuY3NzUmV0cmllcysrO1xuICAgICAgICAgICAgICAgIGFzc2V0LmNzc1RpbWVvdXQgPSB3aW4uc2V0VGltZW91dChpc0Nzc0xvYWRlZCwgMjUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbGU7XG4gICAgICAgIHZhciBleHQgPSBnZXRFeHRlbnNpb24oYXNzZXQudXJsKTtcblxuICAgICAgICBpZiAoZXh0ID09PSBcImNzc1wiKSB7XG4gICAgICAgICAgICBlbGUgICAgICA9IGRvYy5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcbiAgICAgICAgICAgIGVsZS50eXBlID0gXCJ0ZXh0L1wiICsgKGFzc2V0LnR5cGUgfHwgXCJjc3NcIik7XG4gICAgICAgICAgICBlbGUucmVsICA9IFwic3R5bGVzaGVldFwiO1xuICAgICAgICAgICAgZWxlLmhyZWYgPSBhc3NldC51cmw7XG5cbiAgICAgICAgICAgIC8qIG9ubG9hZCBzdXBwb3J0ZWQgZm9yIENTUyBvbiB1bnN1cHBvcnRlZCBicm93c2Vyc1xuICAgICAgICAgICAgICogU2FmYXJpIHdpbmRvd3MgNS4xLjcsIEZGIDwgMTBcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBTZXQgY291bnRlciB0byB6ZXJvXG4gICAgICAgICAgICBhc3NldC5jc3NSZXRyaWVzID0gMDtcbiAgICAgICAgICAgIGFzc2V0LmNzc1RpbWVvdXQgPSB3aW4uc2V0VGltZW91dChpc0Nzc0xvYWRlZCwgNTAwKTsgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZSAgICAgID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBlbGUudHlwZSA9IFwidGV4dC9cIiArIChhc3NldC50eXBlIHx8IFwiamF2YXNjcmlwdFwiKTtcbiAgICAgICAgICAgIGVsZS5zcmMgPSBhc3NldC51cmw7XG4gICAgICAgIH1cblxuICAgICAgICBlbGUub25sb2FkICA9IGVsZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBwcm9jZXNzO1xuICAgICAgICBlbGUub25lcnJvciA9IGVycm9yO1xuXG4gICAgICAgIC8qIEdvb2QgcmVhZCwgYnV0IGRvZXNuJ3QgZ2l2ZSBtdWNoIGhvcGUgIVxuICAgICAgICAgKiBodHRwOi8vYmxvZy5nZXRpZnkuY29tL29uLXNjcmlwdC1sb2FkZXJzL1xuICAgICAgICAgKiBodHRwOi8vd3d3Lm5jem9ubGluZS5uZXQvYmxvZy8yMDEwLzEyLzIxL3Rob3VnaHRzLW9uLXNjcmlwdC1sb2FkZXJzL1xuICAgICAgICAgKiBodHRwczovL2hhY2tzLm1vemlsbGEub3JnLzIwMDkvMDYvZGVmZXIvXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vIEFTWU5DOiBsb2FkIGluIHBhcmFsbGVsIGFuZCBleGVjdXRlIGFzIHNvb24gYXMgcG9zc2libGVcbiAgICAgICAgZWxlLmFzeW5jID0gZmFsc2U7XG4gICAgICAgIC8vIERFRkVSOiBsb2FkIGluIHBhcmFsbGVsIGJ1dCBtYWludGFpbiBleGVjdXRpb24gb3JkZXJcbiAgICAgICAgZWxlLmRlZmVyID0gZmFsc2U7XG5cbiAgICAgICAgLy8gdGltb3V0IGZvciBhc3NldCBsb2FkaW5nXG4gICAgICAgIGFzc2V0LmVycm9yVGltZW91dCA9IHdpbi5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVycm9yKHsgdHlwZTogXCJ0aW1lb3V0XCIgfSk7XG4gICAgICAgIH0sIDdlMyk7XG5cbiAgICAgICAgLy8gdXNlIGluc2VydEJlZm9yZSB0byBrZWVwIElFIGZyb20gdGhyb3dpbmcgT3BlcmF0aW9uIEFib3J0ZWQgKHRoeCBCcnlhbiBGb3JiZXMhKVxuICAgICAgICB2YXIgaGVhZCA9IGRvYy5oZWFkIHx8IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07XG5cbiAgICAgICAgLy8gYnV0IGluc2VydCBhdCBlbmQgb2YgaGVhZCwgYmVjYXVzZSBvdGhlcndpc2UgaWYgaXQgaXMgYSBzdHlsZXNoZWV0LCBpdCB3aWxsIG5vdCBvdmVycmlkZSB2YWx1ZXMgICAgICBcbiAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoZWxlLCBoZWFkLmxhc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLyogUGFydHMgaW5zcGlyZWQgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2pyYnVya2UvcmVxdWlyZWpzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblxuICAgICAgICAvLyBsb29rIGZvciBhIHNjcmlwdCB3aXRoIGEgZGF0YS1oZWFkLWluaXQgYXR0cmlidXRlXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaXRlbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGF0YU1haW4gPSBpdGVtc1tpXS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWhlYWRqcy1sb2FkXCIpO1xuICAgICAgICAgICAgaWYgKCEhZGF0YU1haW4pIHtcbiAgICAgICAgICAgICAgICBhcGkubG9hZChkYXRhTWFpbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZHkoa2V5LCBjYWxsYmFjaykge1xuICAgICAgICAvLy88c3VtbWFyeT5cbiAgICAgICAgLy8vIElORk86IHVzZSBjYXNlczpcbiAgICAgICAgLy8vICAgIGhlYWQucmVhZHkoY2FsbEJhY2spO1xuICAgICAgICAvLy8gICAgaGVhZC5yZWFkeShkb2N1bWVudCAsIGNhbGxCYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQucmVhZHkoXCJmaWxlLmpzXCIsIGNhbGxCYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQucmVhZHkoXCJsYWJlbFwiICAsIGNhbGxCYWNrKTtcbiAgICAgICAgLy8vICAgIGhlYWQucmVhZHkoW1wibGFiZWwxXCIsIFwibGFiZWwyXCJdLCBjYWxsYmFjayk7XG4gICAgICAgIC8vLzwvc3VtbWFyeT5cblxuICAgICAgICAvLyBET00gcmVhZHkgY2hlY2s6IGhlYWQucmVhZHkoZG9jdW1lbnQsIGZ1bmN0aW9uKCkgeyB9KTtcbiAgICAgICAgaWYgKGtleSA9PT0gZG9jKSB7XG4gICAgICAgICAgICBpZiAoaXNEb21SZWFkeSkge1xuICAgICAgICAgICAgICAgIG9uZShjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21XYWl0ZXJzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hpZnQgYXJndW1lbnRzXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGtleSkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0ga2V5O1xuICAgICAgICAgICAga2V5ICAgICAgPSBcIkFMTFwiOyAvLyBob2xkcyBhbGwgY2FsbGJhY2tzIHRoYXQgd2hlcmUgYWRkZWQgd2l0aG91dCBsYWJlbHM6IHJlYWR5KGNhbGxCYWNrKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcXVldWUgYWxsIGl0ZW1zIGZyb20ga2V5IGFuZCByZXR1cm4uIFRoZSBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkIGlmIGFsbCBpdGVtcyBmcm9tIGtleSBhcmUgYWxyZWFkeSBsb2FkZWQuXG4gICAgICAgIGlmIChpc0FycmF5KGtleSkpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHt9O1xuXG4gICAgICAgICAgICBlYWNoKGtleSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tpdGVtXSA9IGFzc2V0c1tpdGVtXTtcblxuICAgICAgICAgICAgICAgIGFwaS5yZWFkeShpdGVtLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbExvYWRlZChpdGVtcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZShjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIGFyZ3VtZW50cyBhcmUgc2FuZVxuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIiB8fCAhaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIHJldHVybiBhcGk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIGNhbiBhbHNvIGJlIGNhbGxlZCB3aGVuIHdlIHRyaWdnZXIgZXZlbnRzIGJhc2VkIG9uIGZpbGVuYW1lcyAmIGxhYmVsc1xuICAgICAgICB2YXIgYXNzZXQgPSBhc3NldHNba2V5XTtcblxuICAgICAgICAvLyBpdGVtIGFscmVhZHkgbG9hZGVkIC0tPiBleGVjdXRlIGFuZCByZXR1cm5cbiAgICAgICAgaWYgKGFzc2V0ICYmIGFzc2V0LnN0YXRlID09PSBMT0FERUQgfHwga2V5ID09PSBcIkFMTFwiICYmIGFsbExvYWRlZCgpICYmIGlzRG9tUmVhZHkpIHtcbiAgICAgICAgICAgIG9uZShjYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm4gYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFyciA9IGhhbmRsZXJzW2tleV07XG4gICAgICAgIGlmICghYXJyKSB7XG4gICAgICAgICAgICBhcnIgPSBoYW5kbGVyc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcGk7XG4gICAgfVxuXG4gICAgLyogTWl4IG9mIHN0dWZmIGZyb20galF1ZXJ5ICYgSUVDb250ZW50TG9hZGVkXG4gICAgICogaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy90aGUtZW5kLmh0bWwjdGhlLWVuZFxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgZnVuY3Rpb24gZG9tUmVhZHkoKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSBib2R5IGV4aXN0cywgYXQgbGVhc3QsIGluIGNhc2UgSUUgZ2V0cyBhIGxpdHRsZSBvdmVyemVhbG91cyAoalF1ZXJ5IHRpY2tldCAjNTQ0MykuXG4gICAgICAgIGlmICghZG9jLmJvZHkpIHtcbiAgICAgICAgICAgIC8vIGxldCdzIG5vdCBnZXQgbmFzdHkgYnkgc2V0dGluZyBhIHRpbWVvdXQgdG9vIHNtYWxsLi4gKGxvb3AgbWFuaWEgZ3VhcmFudGVlZCBpZiBhc3NldHMgYXJlIHF1ZXVlZClcbiAgICAgICAgICAgIHdpbi5jbGVhclRpbWVvdXQoYXBpLnJlYWR5VGltZW91dCk7XG4gICAgICAgICAgICBhcGkucmVhZHlUaW1lb3V0ID0gd2luLnNldFRpbWVvdXQoZG9tUmVhZHksIDUwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNEb21SZWFkeSkge1xuICAgICAgICAgICAgaXNEb21SZWFkeSA9IHRydWU7XG5cbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIGVhY2goZG9tV2FpdGVycywgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgb25lKGZuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9tQ29udGVudExvYWRlZCgpIHtcbiAgICAgICAgLy8gVzNDXG4gICAgICAgIGlmIChkb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGRvbUNvbnRlbnRMb2FkZWQsIGZhbHNlKTtcbiAgICAgICAgICAgIGRvbVJlYWR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJRVxuICAgICAgICBlbHNlIGlmIChkb2MucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAvLyB3ZSdyZSBoZXJlIGJlY2F1c2UgcmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIGluIG9sZElFXG4gICAgICAgICAgICAvLyB3aGljaCBpcyBnb29kIGVub3VnaCBmb3IgdXMgdG8gY2FsbCB0aGUgZG9tIHJlYWR5IVxuICAgICAgICAgICAgZG9jLmRldGFjaEV2ZW50KFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIGRvbUNvbnRlbnRMb2FkZWQpO1xuICAgICAgICAgICAgZG9tUmVhZHkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENhdGNoIGNhc2VzIHdoZXJlIHJlYWR5KCkgaXMgY2FsbGVkIGFmdGVyIHRoZSBicm93c2VyIGV2ZW50IGhhcyBhbHJlYWR5IG9jY3VycmVkLlxuICAgIC8vIHdlIG9uY2UgdHJpZWQgdG8gdXNlIHJlYWR5U3RhdGUgXCJpbnRlcmFjdGl2ZVwiIGhlcmUsIGJ1dCBpdCBjYXVzZWQgaXNzdWVzIGxpa2UgdGhlIG9uZVxuICAgIC8vIGRpc2NvdmVyZWQgYnkgQ2hyaXNTIGhlcmU6IGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzEyMjgyI2NvbW1lbnQ6MTVcbiAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICBkb21SZWFkeSgpO1xuICAgIH1cblxuICAgIC8vIFczQ1xuICAgIGVsc2UgaWYgKGRvYy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBkb21Db250ZW50TG9hZGVkLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gQSBmYWxsYmFjayB0byB3aW5kb3cub25sb2FkLCB0aGF0IHdpbGwgYWx3YXlzIHdvcmtcbiAgICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGRvbVJlYWR5LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLy8gSUVcbiAgICBlbHNlIHtcbiAgICAgICAgLy8gRW5zdXJlIGZpcmluZyBiZWZvcmUgb25sb2FkLCBtYXliZSBsYXRlIGJ1dCBzYWZlIGFsc28gZm9yIGlmcmFtZXNcbiAgICAgICAgZG9jLmF0dGFjaEV2ZW50KFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIGRvbUNvbnRlbnRMb2FkZWQpO1xuXG4gICAgICAgIC8vIEEgZmFsbGJhY2sgdG8gd2luZG93Lm9ubG9hZCwgdGhhdCB3aWxsIGFsd2F5cyB3b3JrXG4gICAgICAgIHdpbi5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBkb21SZWFkeSk7XG5cbiAgICAgICAgLy8gSWYgSUUgYW5kIG5vdCBhIGZyYW1lXG4gICAgICAgIC8vIGNvbnRpbnVhbGx5IGNoZWNrIHRvIHNlZSBpZiB0aGUgZG9jdW1lbnQgaXMgcmVhZHlcbiAgICAgICAgdmFyIHRvcCA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0b3AgPSAhd2luLmZyYW1lRWxlbWVudCAmJiBkb2MuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgICAgICBpZiAodG9wICYmIHRvcC5kb1Njcm9sbCkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGRvU2Nyb2xsQ2hlY2soKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0RvbVJlYWR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIHRyaWNrIGJ5IERpZWdvIFBlcmluaVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHR0cDovL2phdmFzY3JpcHQubndib3guY29tL0lFQ29udGVudExvYWRlZC9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5kb1Njcm9sbChcImxlZnRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQncyBub3QgZ2V0IG5hc3R5IGJ5IHNldHRpbmcgYSB0aW1lb3V0IHRvbyBzbWFsbC4uIChsb29wIG1hbmlhIGd1YXJhbnRlZWQgaWYgYXNzZXRzIGFyZSBxdWV1ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW4uY2xlYXJUaW1lb3V0KGFwaS5yZWFkeVRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLnJlYWR5VGltZW91dCA9IHdpbi5zZXRUaW1lb3V0KGRvU2Nyb2xsQ2hlY2ssIDUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCBleGVjdXRlIGFueSB3YWl0aW5nIGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgICAgICBkb21SZWFkeSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8jZW5kcmVnaW9uXG5cbiAgICAvLyNyZWdpb24gUHVibGljIEV4cG9ydHNcbiAgICAvLyBJTkZPOiBkZXRlcm1pbmUgd2hpY2ggbWV0aG9kIHRvIHVzZSBmb3IgbG9hZGluZ1xuICAgIGFwaS5sb2FkICA9IGFwaS5qcyA9IGlzQXN5bmMgPyBhcGlMb2FkQXN5bmMgOiBhcGlMb2FkSGFjaztcbiAgICBhcGkudGVzdCAgPSBjb25kaXRpb25hbDtcbiAgICBhcGkucmVhZHkgPSByZWFkeTtcbiAgICAvLyNlbmRyZWdpb25cblxuICAgIC8vI3JlZ2lvbiBJTklUXG4gICAgLy8gcGVyZm9ybSB0aGlzIHdoZW4gRE9NIGlzIHJlYWR5XG4gICAgYXBpLnJlYWR5KGRvYywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoYWxsTG9hZGVkKCkpIHtcbiAgICAgICAgICAgIGVhY2goaGFuZGxlcnMuQUxMLCBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBvbmUoY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXBpLmZlYXR1cmUpIHtcbiAgICAgICAgICAgIGFwaS5mZWF0dXJlKFwiZG9tbG9hZGVkXCIsIHRydWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8jZW5kcmVnaW9uXG59KHdpbmRvdykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVzaW5nIGhlYWRqcyB0byBhc3luY2hyb25vdXNseSBsb2FkIGphdmFzY3JpcHQgYmFzZWQgb24gbG9naWMgXG4gKi9cbmNvbnN0IEhlYWRDb3JlID0gcmVxdWlyZSgnLi4vLi4vbm9kZV9tb2R1bGVzL2hlYWRqcy9kaXN0LzEuMC4wL2hlYWQuY29yZS5qcycpO1xuY29uc3QgSGVhZExvZGUgPSByZXF1aXJlKCcuLi8uLi9ub2RlX21vZHVsZXMvaGVhZGpzL2Rpc3QvMS4wLjAvaGVhZC5sb2FkLmpzJyk7XG5cbi8qKlxuICogQ2hlY2sgZm9yIGV4aXN0YW5jZSBvZiBsb2NhbFN0b3JhZ2VcbiAqL1xuaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICBoZWFkLnJlYWR5KGRvY3VtZW50LCBpbml0SXQpO1xufVxuXG4vKipcbiAqIEJvb3RzdHJhcCB0aGUgZnJvbnRlbmQgamF2YXNjcmlwdCBhcHBsaWNhdGlvbiBpZiB0aGUgdXNlciBpcyBzaWduZWQtaW5cbiAqL1xuZnVuY3Rpb24gaW5pdEl0KCkge1xuICAgIHZhciB0b2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndHB3LnJUb2tlbicpO1xuXG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGhlYWQubG9hZChbXG4gICAgICAgICAgICBcImh0dHBzOi8vYWpheC5nb29nbGVhcGlzLmNvbS9hamF4L2xpYnMvYW5ndWxhcmpzLzEuNS43L2FuZ3VsYXIuanNcIlxuICAgICAgICBdLFxuICAgICAgICAgICAgY29uZmlnXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdObyBUUFcgVG9rZW4gRm91bmQnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIExvYWQgZmluYWwgZGVwZW5kZW5jaWVzIGFuZCBhbmd1bGFyIGFwcGxpY2F0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZygpIHtcbiAgICBjb25zb2xlLmluZm8oJ0NvbmZpZyBMb2FkZWQnKTtcbiAgICBoZWFkLmxvYWQoW1xuICAgICAgICBcIi9jb25maWcuanNcIixcbiAgICBdLCB0cHcpO1xufVxuXG5cbmZ1bmN0aW9uIHRwdygpIHtcbiAgICBjb25zb2xlLmluZm8oJ1RQVyBBcHAgTG9hZGVkJyk7XG4gICAgaGVhZC5sb2FkKFtcbiAgICAgICAgXCIvZnJvbnRlbmQvanMvdHB3LmFwcC5qc1wiXG4gICAgXSlcbn1cbiJdfQ==
