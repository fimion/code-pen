!function (e) {
  var t = {}

  function require(n) {
    if (t[n]) return t[n].exports
    var o = t[n] = {i: n, l: !1, exports: {}}
    return e[n].call(o.exports, o, o.exports, require), o.l = !0, o.exports
  }

  require.m = e
  require.c = t
  require.d = function (e, t, n) {
    require.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: n})
  }
  require.defineESM = function (e) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
  }
  require.t = function (e, t) {
    if (1 & t && (e = require(e)), 8 & t) return e
    if (4 & t && "object" == typeof e && e && e.__esModule) return e
    var n = Object.create(null)
    if (require.defineESM(n), Object.defineProperty(n, "default", {
      enumerable: !0,
      value: e,
    }), 2 & t && "string" != typeof e) for (var o in e) require.d(n, o, function (t) {
      return e[t]
    }.bind(null, o))
    return n
  }
  require.n = function (e) {
    var t = e && e.__esModule ? function () {
      return e.default
    } : function () {
      return e
    }
    return require.d(t, "a", t), t
  }
  require.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
  }
  require.p = "https://cpwebassets.codepen.io/assets/packs/"
  require(require.s = 828)
}({
  828: function (e, t, require) {
    "use strict"
    require.defineESM(t)
    const CodePenMagicValues = {
      _HTML_TYPES: ["html", "xml", "haml", "markdown", "slim", "pug", "application/x-slim"],
      _CSS_TYPES: ["css", "less", "scss", "sass", "stylus", "postcss", "text/css", "text/x-sass", "text/x-scss", "text/x-less", "text/x-styl"],
      _JS_TYPES: ["js", "javascript", "coffeescript", "livescript", "typescript", "babel", "text/javascript", "text/x-coffeescript", "text/x-livescript", "text/typescript"],
      _CUSTOM_EDITOR_TYPES: {vue: "js", flutter: "js"},
      cmModeToType(e) {
        var t = this._getSafeInputMode(e)
        return this._getType(t)
      },
      _getSafeInputMode(e) {
        return ("string" == typeof e ? e : e.name).toLowerCase()
      },
      syntaxToType(e) {
        return this._getType(e)
      },
      _getType(e) {
        return this._HTML_TYPES.includes(e) ? "html" : this._CSS_TYPES.includes(e) ? "css" : this._JS_TYPES.includes(e) ? "js" : this._CUSTOM_EDITOR_TYPES[e] ? this._CUSTOM_EDITOR_TYPES[e] : "unknown"
      },
    }

    function startTheProcess(t) {
      "loading" === document.readyState ? setTimeout((function () {
        startTheProcess(t)
      }), 9) : t()
    }

    const s = new Set(["title", "description", "tags", "html_classes", "head", "stylesheets", "scripts"])

    function u(e) {
      for (var t = {}, r = e.attributes, n = 0, o = r.length; n < o; n++) {
        var a = r[n].name
        0 === a.indexOf("data-") && (t[a.replace("data-", "")] = r[n].value)
      }
      return t = f(t), c(t) ? (t.user = l(t, e), t) : null
    }

    function l(e, t) {
      if ("string" == typeof e.user) return e.user
      for (var r = 0, n = t.children.length; r < n; r++) {
        var o = (t.children[r].href || "").match(/codepen\.(io|dev)\/(\w+)\/pen\//i)
        if (o) return o[2]
      }
      return "anon"
    }

    function c(e) {
      return "prefill" in e || e["slug-hash"]
    }

    function f(e) {
      return e.href && (e["slug-hash"] = e.href), e.type && (e["default-tab"] = e.type), e.safe && (e.animations = "true" === e.safe ? "run" : "stop-after-5"), e
    }

    function createUrl(e) {
      var host = getHost(e)
      var r = e.preview && "true" === e.preview ? "embed/preview" : "embed"
      if ("prefill" in e) return [host, r, "prefill"].join("/")
      var n = h(e), o = e.user || "anon", a = e["slug-hash"]
      return void 0 !== e.token && (a += "/" + e.token), [host, o, r, a + "?" + n].join("/").replace(/\/\//g, "//")
    }

    function getHost(e) {
      return e.host ? m(e.host) : "https://codepen.io"
    }

    function m(e) {
      return e.match(/^\/\//) || !e.match(/https?:/) ? document.location.protocol + "//" + e : e
    }

    function h(e) {
      var t = ""
      for (var r in e) "prefill" !== r && ("" !== t && (t += "&"), t += r + "=" + encodeURIComponent(e[r]))
      return t
    }

    function getHeight(e) {
      return e.height || 300
    }

    function v(e, t) {
      var r;
      var n = document.createDocumentFragment()
      n.append(createEmbedIframe(e)), "prefill" in e && (r = createPrefillForm(e, t), n.append(r)), S(t, n), r && r.submit()
    }

    /**
     *
     * @param {string} el
     * @param {Record<string,string>} attrs
     * @returns {HTMLElement}
     */
    function createEl(el, attrs) {
      const r = document.createElement(el)
      for (const key in attrs) attrs.hasOwnProperty(key) && r.setAttribute(key, attrs[key])
      return r
    }

    function createPrefillForm(e, t) {
      var r = createEl("form", {
        class: "cp_embed_form",
        style: "display: none;",
        method: "post",
        action: createUrl(e),
        target: e.name,
      })

      function formatFormData(e) {
        if (Object.hasOwn(e.dataset, "prefill")) {
          const t = {}
          let r = e.dataset.prefill
          for (const a in r = JSON.parse(decodeURI(r) || "{}")){
            if(s.has(a) ){
              (t[a] = r[a])
            }
          }
          try {
            for (const content of e.querySelectorAll("[data-lang]")) {
              var l = content.value, c = l.dataset.lang
              l.dataset.optionsAutoprefixer && (t.css_prefix = "autoprefixer")
              var f = CodePenMagicValues.syntaxToType(c)
              t[f] = l.innerText, c !== f && (t[f + "_pre_processor"] = c)
              var p = l.dataset.langVersion
              p && (t[f + "_version"] = p)
            }
          } catch (e) {
            u.e(e)
          } finally {
            u.f()
          }
          return JSON.stringify(t)
        }
      }(t)

      for (var a in e.data = function (e) {
        if (Object.hasOwn(e.dataset, "prefill")) {
          const t = {}
          let r = e.dataset.prefill
          for (const a in r = JSON.parse(decodeURI(r) || "{}")){
            if(s.has(a) ){
              (t[a] = r[a])
            }
          }
          try {
            for (const content of e.querySelectorAll("[data-lang]")) {
              var l = content.value, c = l.dataset.lang
              l.dataset.optionsAutoprefixer && (t.css_prefix = "autoprefixer")
              var f = CodePenMagicValues.syntaxToType(c)
              t[f] = l.innerText, c !== f && (t[f + "_pre_processor"] = c)
              var p = l.dataset.langVersion
              p && (t[f + "_version"] = p)
            }
          } catch (e) {
            u.e(e)
          } finally {
            u.f()
          }
          return JSON.stringify(t)
        }
      }(t), e){
        if("prefill" !== a) {
          r.append(createEl("input", {type: "hidden", name: a, value: e[a]}))
        }
      }
      return r
    }

    function createEmbedIframe(e) {
      var t;
      var r = createUrl(e)
      t = e["pen-title"] || "CodePen Embed"
      var n = {
        allowfullscreen: "true",
        allowpaymentrequest: "true",
        allowTransparency: "true",
        class: "cp_embed_iframe " + (e.class || ""),
        frameborder: "0",
        height: getHeight(e),
        width: "100%",
        name: e.name || "CodePen Embed",
        scrolling: "no",
        src: r,
        style: "width: 100%; overflow:hidden; display:block;",
        title: t,
      }
      if("prefill" in e == !1){
        n.loading = "lazy"
      }
      if(e["slug-hash"]){
        (n.id = "cp_embed_" + e["slug-hash"].replace("/", "_"))
      }
      return createEl("iframe", n)
    }

    function S(e, t) {
      if (e.parentNode) {
        var r = document.createElement("div")
        return r.className = "cp_embed_wrapper", r.append(t), e.parentNode.replaceChild(r, e), r
      }
      return e.append(t), e
    }

    let T = 1

    function x(e) {
      e = "string" == typeof e ? e : ".codepen"
      for (var t = document.querySelectorAll(e), r = 0, n = t.length; r < n; r++) {
        var o = t[r], a = u(o)
        a && (a.name = "cp_embed_" + T++, v(a, o))
      }
      "function" == typeof __CodePenIFrameAddedToPage && __CodePenIFrameAddedToPage()
    }

    window.__cp_domReady = startTheProcess, window.__CPEmbed = x, startTheProcess(x)
  },
})
