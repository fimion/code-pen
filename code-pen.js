(function () {
    "use strict"
    const CodePenMagicValues = {
      _HTML_TYPES: ["html", "xml", "haml", "markdown", "slim", "pug", "application/x-slim"],
      _CSS_TYPES: ["css", "less", "scss", "sass", "stylus", "postcss", "text/css", "text/x-sass", "text/x-scss", "text/x-less", "text/x-styl"],
      _JS_TYPES: ["js", "javascript", "coffeescript", "livescript", "typescript", "babel", "text/javascript", "text/x-coffeescript", "text/x-livescript", "text/typescript"],
      _CUSTOM_EDITOR_TYPES: {vue: "js", flutter: "js"},
      syntaxToType(e) {
        return CodePenMagicValues._getType(e)
      },
      _getType(e) {
        return CodePenMagicValues._HTML_TYPES.includes(e) ? "html" : CodePenMagicValues._CSS_TYPES.includes(e) ? "css" : CodePenMagicValues._JS_TYPES.includes(e) ? "js" : CodePenMagicValues._CUSTOM_EDITOR_TYPES[e] ? CodePenMagicValues._CUSTOM_EDITOR_TYPES[e] : "unknown"
      },
    }

    function startTheProcess(callback) {
      "loading" === document.readyState ? setTimeout((function () {
        startTheProcess(callback)
      }), 9) : callback()
    }

    const ALLOWED_PROPERTIES = new Set(["title", "description", "tags", "html_classes", "head", "stylesheets", "scripts"])

    /**
     *
     * @param {HTMLElement} e
     * @returns {*}
     */
    function getConfigFromElement(e) {
      let t = {}

      Object.values(e.attributes).forEach((attr)=>{
        const a = attr.name
        if(a.startsWith("data-")){
          t[a.replace("data-", "")] = attr.value
        }
      })
      t = overrideConfigValues(t)

      return  hasPrefillOrSlugHash(t) ? (t.user = l(t, e), t) : null
    }

    function l(e, t) {
      if ("string" == typeof e.user) return e.user
      for (var r = 0, n = t.children.length; r < n; r++) {
        var o = (t.children[r].href || "").match(/codepen\.(io|dev)\/(\w+)\/pen\//i)
        if (o) return o[2]
      }
      return "anon"
    }

    function hasPrefillOrSlugHash(e) {
      return "prefill" in e || e["slug-hash"]
    }

    function overrideConfigValues(e) {
      if(e.href){
        e["slug-hash"] = e.href
      }
      if(e.type){
        e["default-tab"] = e.type
      }
      if(e.safe){
        e.animations = "true" === e.safe ? "run" : "stop-after-5"
      }
      return e
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

    function createCodepenElement(e, t) {
      let r;
      const n = document.createDocumentFragment();
      n.append(createEmbedIframe(e));
      if("prefill" in e){
        r = createPrefillForm(e, t);
        n.append(r)
      }
      addToDom(t, n);
      r && r.submit()
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


    /**
     *
     * @param {object} config
     * @param {HTMLElement} t
     * @returns {HTMLElement}
     */
    function createPrefillForm(config, t) {
      const r = createEl("form", {
        class: "cp_embed_form",
        style: "display: none;",
        method: "post",
        action: createUrl(config),
        target: config.name,
      })

      /**
       * Test to see if an html element has a `data-prefill` attribute
       * @param {HTMLElement} e
       * @returns {boolean}
       */
      function hasPrefill(e){
        return Object.hasOwn(e.dataset, "prefill")
      }

      /**
       *
       * @param {HTMLElement} e
       * @returns {string}
       */
      function formatFormData(e) {
        if (hasPrefill(e)) {
          const t = {}
          let r = e.dataset.prefill
          for (const a in r = JSON.parse(decodeURI(r) || "{}")){
            if(ALLOWED_PROPERTIES.has(a) ){
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
            getConfigFromElement.e(e)
          } finally {
            getConfigFromElement.f()
          }
          return JSON.stringify(t)
        }
      }

      config.data=formatFormData(t)

      for (let key in config.data){
        if("prefill" !== key) {
          r.append(createEl("input", {type: "hidden", name: key, value: config[key]}))
        }
      }
      return r
    }

    /**
     *
     * @param {object} config
     * @returns {HTMLElement}
     */
    function createEmbedIframe(config) {
      const penTitle= config["pen-title"] || "CodePen Embed";
      const penUrl = createUrl(config)
      const iframeAttrs = {
        allowfullscreen: "true",
        allowpaymentrequest: "true",
        allowTransparency: "true",
        class: "cp_embed_iframe " + (config.class || ""),
        frameborder: "0",
        height: getHeight(config),
        width: "100%",
        name: config.name || "CodePen Embed",
        scrolling: "no",
        src: penUrl,
        style: "width: 100%; overflow:hidden; display:block;",
        title: penTitle,
      }
      if("prefill" in config == !1){
        iframeAttrs.loading = "lazy"
      }
      if(config["slug-hash"]){
        (iframeAttrs.id = "cp_embed_" + config["slug-hash"].replace("/", "_"))
      }
      return createEl("iframe", iframeAttrs)
    }

    /**
     *
     * @param {HTMLElement} e
     * @param {HTMLElement | DocumentFragment} t
     * @returns {HTMLElement}
     */
    function addToDom(e, t) {
      if (e.parentNode) {
        const r = document.createElement("div");
        r.className = "cp_embed_wrapper";
        r.append(t);
        e.parentNode.replaceChild(r, e);
        return  r
      }
      e.append(t)
      return e
    }

    let T = 1

    function cpEmbedElement(el){
      const a = getConfigFromElement(el);
      if(a){
        a.name = "cp_embed_" + T++;
        createCodepenElement(a, el);
      }
    }

    function cpEmbed(e) {
      let selector = "string" == typeof e ? e : ".codepen"
      document.querySelectorAll(selector).forEach(cpEmbedElement)

      "function" == typeof __CodePenIFrameAddedToPage && __CodePenIFrameAddedToPage()
    }

    class CodePenElement extends HTMLElement {
      connectedCallback(){
        cpEmbedElement(this);
      }
    }
    customElements.define('code-pen', CodePenElement);

    window.__cp_domReady = startTheProcess;
    window.__CPEmbed = cpEmbed;
    startTheProcess(cpEmbed);
})()
