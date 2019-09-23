// define zoe configuration file. 
const zoefile = `${__dirname}/zoe.yaml`

// for global access
var zoe = {}

const _systemKeys = {
  siteMetadata: null,
  plugins: {
    type: Object,
    keys: [ "plugins" ]
  },
  pathPrefix: {
    type: String,
    keys: [ "prefix", "pathPrefix" ],
  },
  polyfill: {
    type: Boolean,
    keys: [ "polyfill" ],
  },
  mapping: {
    type: Object,
    keys: [ "mapping" ],
  },
  proxy: {
    type: Object,
    keys: [ "mapping" ],
  },
}

const _sysKeysMap = () => {
  let keys = _systemKeys
  const _keys = {}
  Object.keys(keys).map(key => {
    keys[key] && keys[key].keys.map(k => {
      _keys[k] = key
    })
  })
  return _keys
}

const _genVal = (s) => {
  let typ = typeof s
  switch ( typ ) {
    case 'object':
      if ( s instanceof Array ) {
        return s.map(i => _genVal(i))
      } else {
        let d = {}
        Object.keys(s).map(i => d[i] = _genVal(s[i]))
        return d
      }
    case 'string':
      // check if we have ${} TODO: improve
      return s.indexOf('${') < 0 ? s : eval("`" + s + "`")
    default:
      return s
  }
}

const buildPlugin = (plg) => {
  let typ = typeof plg
  switch ( typ ) {
    case 'string':
      // return string directly
      return plg
    case 'object':
      // build plugin with layout
      let name = Object.keys(plg)[0]
      return {
        resolve: name,
        options: _genVal(plg[name]),
      }
    default:
      return null
  }
}

const buildConfig = (zoefile) => {
  const config = {}

  const siteMetadata = {}

  // load zoe configuration from file
  zoe = require("js-yaml").safeLoad(require("fs").readFileSync(zoefile, 'utf8'))

  // generate system keys
  let syskeys = _sysKeysMap()

  const keys = Object.keys(zoe)

  keys.map(k => {

    // build plugins
    if ( k === 'plugins' && zoe[k] ) {
      config.plugins = zoe[k].map(i => buildPlugin(i)).filter(i => i)
      return
    }
    
    // if key in syskeys, set to config
    if ( syskeys[k] ) {
      config[syskeys[k]] = zoe[k]
    }

    // add all keys to siteMeta
    siteMetadata[k] = zoe[k]
  })

  config.siteMetadata = siteMetadata

  // console.log(JSON.stringify(config, null, 2))
  
  return config
}

module.exports = {
  // add extend config at here like, developMiddleware
  ...buildConfig(zoefile),
}

// module.exports = {
//   siteMetadata: {
//     title: `1小时指南`,
//     description: `每天你应该花3分钟了解自己，1小时了解世界，可能你需要《1小时指南》。`,
//     author: `周筱鲁 <hi@zoe.im>`,
//     lang: 'zh-CN'
//   },
//   plugins: [
//     {
//       resolve: `gatsby-source-filesystem`,
//       options: {
//         name: `images`,
//         path: `${__dirname}/src/images`,
//       },
//     },
//     {
//       resolve: `gatsby-plugin-manifest`,
//       options: {
//         name: `gatsby-starter-default`,
//         short_name: `starter`,
//         start_url: `/`,
//         background_color: `#663399`,
//         theme_color: `#663399`,
//         display: `minimal-ui`,
//         icon: `src/images/gatsby-icon.png`,
//       },
//     },
//     {
//       resolve: 'gatsby-plugin-web-font-loader',
//       options: {
//         google: {
//           families: ['Poppins', 'Recoleta', 'Fredoka One', 'Cabin', 'Open Sans'],
//         },
//       },
//     },
//     {
//       resolve: 'gatsby-plugin-google-analytics',
//       options: {
//         trackingId: '',
//         respectDNT: true
//       }
//     }
//     `gatsby-plugin-react-helmet`,
//     `gatsby-transformer-sharp`,
//     `gatsby-plugin-theme-ui`,
//     `gatsby-plugin-linaria`,
//     `gatsby-plugin-offline`,
//     `gatsby-plugin-emotion`,
//     `gatsby-plugin-sharp`,
//     `gatsby-plugin-less`,
//   ],
// }
