(function () {

  /**
   * @typedef {object} CodePenEmbedConfig
   * @property {string} [href] - the url of the pen you want to embed
   * @property {string} [slug-hash] - the hash or the url of the codepen you want to embed
   * @property {string} [type] - The default type to display
   * @property {string} [default-tab] - the default type to display
   * @property {"true"|"false"} [safe] - whether to run things in safe mode
   * @property {"run"|"stop-after-5"} [animations] - whether to run animations fully or stop after 5 seconds
   * @property {string} [prefill] - if the codepen is a prefill embed
   * @property {string} [name] - the name for the codepen embed
   * @property {string} [class] - the classes for the embed iframe
   * @property {string} [host] - The host name of the codepen
   * @property {"true"|"false"} [preview] - whether to preview or not
   * @property {string} [user] - user for the pen
   * @property {string} [token] - no idea
   * @property {string} [height] - embed height
   */

  /**
   * @typedef {object} CodePenPrefillConfig
   * @property {string} [title]
   * @property {string} [description]
   * @property {string} [tags]
   * @property {string} [html_classes]
   * @property {string} [head]
   * @property {string[]} [stylesheets]
   * @property {string[]} [scripts]
   * @property {string} [css_prefix]
   * @property {string} [html]
   * @property {string} [html_pre_processor]
   * @property {string} [html_version]
   * @property {string} [js]
   * @property {string} [js_pre_processor]
   * @property {string} [js_version]
   * @property {string} [css]
   * @property {string} [css_pre_processor]
   * @property {string} [css_version]
   */

  /**
   * Magic lookup table for language strings
   * @type {{css: string[], js: string[], html: string[]}}
   */
  const codepenMagicLookup = {
    "html": ["html", "xml", "haml", "markdown", "slim", "pug", "application/x-slim"],
    "css": ["css", "less", "scss", "sass", "stylus", "postcss", "text/css", "text/x-sass", "text/x-scss", "text/x-less", "text/x-styl"],
    "js": ["js", "javascript", "coffeescript", "livescript", "typescript", "babel", "text/javascript", "text/x-coffeescript", "text/x-livescript", "text/typescript"],
  }
  const penLangs = {
    custom: {vue: "js", flutter: "js"},
    /**
     * Gets the type of language being looked up
     * @param {string} e
     * @returns {string}
     */
    syntaxToType(e) {
      for(const name in codepenMagicLookup){
        if(codepenMagicLookup[name].includes(e)) return name;
      }
      if (e in penLangs.custom) return penLangs.custom[e]
      return "unknown"
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
   * @param {HTMLElement} el
   * @returns {CodePenEmbedConfig}
   */
  function getConfigFromElement(el) {
    /**
     * @type {CodePenEmbedConfig}
     */
    let config = {}

    Object.values(el.attributes).forEach((attr) => {
      const a = attr.name
      if (a.startsWith("data-")) {
        config[a.replace("data-", "")] = attr.value
      }
    })
    config = overrideConfigValues(config)

    return hasPrefillOrSlugHash(config) ? (config.user = getUserName(config, el), config) : null
  }

  function getUserName(e, t) {
    if ("string" == typeof e.user) return e.user
    for (var r = 0, n = t.children.length; r < n; r++) {
      var o = (t.children[r].href || "").match(/codepen\.(io|dev)\/(\w+)\/pen\//i)
      if (o) return o[2]
    }
    return "anon"
  }

  /**
   *
   * @param {CodePenEmbedConfig} config
   * @returns {boolean}
   */
  function hasPrefillOrSlugHash(config) {
    return "prefill" in config || !!config["slug-hash"]
  }

  /**
   * override certain attributes with others if available
   * @param {CodePenEmbedConfig} e
   * @returns {CodePenEmbedConfig}
   */
  function overrideConfigValues(e) {
    if (e.href) {
      e["slug-hash"] = e.href
    }
    if (e.type) {
      e["default-tab"] = e.type
    }
    if (e.safe) {
      e.animations = "true" === e.safe ? "run" : "stop-after-5"
    }
    return e
  }

  /**
   *
   * @param {CodePenEmbedConfig} config
   * @returns {string}
   */
  function createUrl(config) {
    const host = getHost(config)
    const display = config.preview && "true" === config.preview ? "embed/preview" : "embed"
    if ("prefill" in config){
      return [host, display, "prefill"].join("/")
    }
    const queryParams = makeQueryParams(config)
    const userName = config.user || "anon"
    let slugHash = config["slug-hash"]
    if(typeof config.token == "string"){
      slugHash += "/" + config.token
    }
    return [host, userName, display, slugHash + "?" + queryParams].join("/").replace(/\/\//g, "//")
  }

  /**
   *
   * @param {CodePenEmbedConfig} e
   * @returns {string|string}
   */
  function getHost(e) {
    return typeof e.host === "string" ? setProtocol(e.host) : "https://codepen.io"
  }

  /**
   *
   * @param {string} e
   * @returns {string}
   */
  function setProtocol(e) {
    return e.match(/^\/\//) || !e.match(/https?:/) ? document.location.protocol + "//" + e : e
  }

  /**
   *
   * @param {CodePenEmbedConfig} config
   * @returns {string}
   */
  function makeQueryParams(config) {
    const searchParams = new URLSearchParams();
    for (const key in config) {
      if( "prefill" !== key){
        searchParams.append(key, config[key]);
      }
    }
    return searchParams.toString()
  }

  /**
   *
   * @param {CodePenEmbedConfig} e
   * @returns {string|number}
   */
  function getHeight(e) {
    return e.height || 300
  }

  /**
   *
   * @param {CodePenEmbedConfig} config
   * @param {HTMLElement} el
   */
  function createCodepenElement(config, el) {
    let prefillForm
    const fragment = document.createDocumentFragment()
    fragment.append(createEmbedIframe(config))
    if ("prefill" in config) {
      prefillForm = createPrefillForm(config, el)
      fragment.append(prefillForm)
    }
    addToDom(el, fragment)
    prefillForm && prefillForm.submit()
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
   * @param {HTMLElement} element
   * @returns {HTMLElement}
   */
  function createPrefillForm(config, element) {
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
    function elementIsPrefill(e) {
      return Object.hasOwn(e.dataset, "prefill")
    }

    /**
     *
     * @param {HTMLElement} el
     * @returns {string}
     */
    function formatFormData(el) {
      if (elementIsPrefill(el)) {
        /**  @type {CodePenPrefillConfig} */
        const prefillConfig = {}
        let r = JSON.parse(decodeURI(el.dataset.prefill) || "{}");
        for (const a in r)  {
          if (ALLOWED_PROPERTIES.has(a)) {
            (prefillConfig[a] = r[a])
          }
        }
        for (const content of el.querySelectorAll("[data-lang]")) {
          const langName = content.dataset.lang
          content.dataset.optionsAutoprefixer && (prefillConfig.css_prefix = "autoprefixer")
          const penTypeLang = penLangs.syntaxToType(langName)
          prefillConfig[penTypeLang] = content.innerText
          if(langName !== penTypeLang){
            prefillConfig[penTypeLang + "_pre_processor"] = langName
          }
          const p = content.dataset.langVersion
          if(p){
            prefillConfig[penTypeLang + "_version"] = p
          }
        }
        return JSON.stringify(prefillConfig)
      }
    }

    config.data = formatFormData(element)

    for (let key in config.data) {
      if ("prefill" !== key) {
        r.append(createEl("input", {type: "hidden", name: key, value: config[key]}))
      }
    }
    return r
  }

  /**
   *
   * @param {CodePenEmbedConfig} config
   * @returns {HTMLElement}
   */
  function createEmbedIframe(config) {
    const penTitle = config["pen-title"] || "CodePen Embed"
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
    if ("prefill" in config == !1) {
      iframeAttrs.loading = "lazy"
    }
    if (config["slug-hash"]) {
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
    if (e.shadowRoot) {
      e.shadowRoot.append(t)
    } else {
      e.append(t)
    }

    return e
  }

  let T = 1

  /**
   *
   * @param {HTMLElement} el
   */
  function cpEmbedElement(el) {
    const config = getConfigFromElement(el)
    if (config) {
      config.name = "cp_embed_" + T++
      createCodepenElement(config, el)
    }
  }

  /**
   * @callback __CodePenIFrameAddedToPage
   * @param {CodePenElement} element
   */


  class CodePenElement extends HTMLElement {

    constructor() {
      super()
      this.attachShadow({mode: "open"})
    }
    connectedCallback() {
      cpEmbedElement(this)
      if(window?.__CodePenIFrameAddedToPage && "function" == typeof window?.__CodePenIFrameAddedToPage){
        window.__CodePenIFrameAddedToPage(this)
      }
    }
  }

  customElements.define('code-pen', CodePenElement)

})()
