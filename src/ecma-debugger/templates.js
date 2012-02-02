﻿(function()
{
  var self = this;
  this.hello = function(enviroment)
  {
    var ret = ['ul'];
    var prop = '';
    var prop_dict =
    {
      "stpVersion": ui_strings.S_TEXT_ENVIRONMENT_PROTOCOL_VERSION,
      "coreVersion": "Core Version",
      "operatingSystem": ui_strings.S_TEXT_ENVIRONMENT_OPERATING_SYSTEM,
      "platform": ui_strings.S_TEXT_ENVIRONMENT_PLATFORM,
      "userAgent": ui_strings.S_TEXT_ENVIRONMENT_USER_AGENT
    }
    for( prop in prop_dict)
    {
      ret[ret.length] = ['li', prop_dict[prop] + ': ' + enviroment[prop]];
    }
    if( ini.revision_number.indexOf("$") != -1 && ini.mercurial_revision )
    {
      ini.revision_number = ini.mercurial_revision;
    }
    ret[ret.length] = ['li', ui_strings.S_TEXT_ENVIRONMENT_DRAGONFLY_VERSION + ': ' + ini.dragonfly_version];
    ret[ret.length] = ['li', ui_strings.S_TEXT_ENVIRONMENT_REVISION_NUMBER + ': ' + ini.revision_number];
    ret.push('class', 'selectable');
    return ['div', ret, 'class', 'padding'];
  }

  this.runtimes = function(runtimes, type, arg_list)
  {
    var ret = [], rt = null, i = 0;
    for( ; rt = runtimes[i]; i++)
    {
      ret[ret.length] = self['runtime-' + type](rt, arg_list);
    }
    return ret;
  }

  this.runtime_dropdown = function(runtimes)
  {
    return runtimes.map(this.runtime, this);
  }

  this.runtime = function(runtime)
  {
    var option = ['cst-option', runtime.title, 'rt-id', String(runtime.id)];
    if (runtime.title_attr)
      option.push('title', runtime.title_attr);
    var ret = [option];
    if (runtime.extensions && runtime.extensions.length)
      ret.push(['cst-group', runtime.extensions.map(this.runtime, this)]);
    return ret;
  }

  this.script_dropdown = function(runtimes, stopped_script_id, selected_script_id)
  {
    var ret = [["input", "type", "text", "class", "js-dd-filter"]];
    for (var i = 0, rt; rt = runtimes[i]; i++)
    {
      ret.push(this.runtime_script(rt, stopped_script_id, selected_script_id));
    }
    return ret;
  };

  this.runtime_script = function(runtime, stopped_script_id, selected_script_id)
  {
    var ret = [];
    var script_uri_paths = {};
    var inline_and_evals = [];
    var title = ['cst-title', runtime.title];
    var class_name = runtime.type == "extension"
                   ? 'js-dd-ext-runtime'
                   : 'js-dd-runtime';
      
    title.push('class', class_name + (runtime.selected ? " selected-runtime" : ""));

    if (runtime.title != runtime.uri)
      title.push('title', runtime.uri);

    ret.push(title);

    runtime.scripts.forEach(function(script)
    {
      var ret_script = this.script_option(script, 
                                          stopped_script_id, 
                                          selected_script_id);
      if (script.script_type === "linked")
      {
        var root_uri = this._uri_path(runtime, script);
        if (script_uri_paths.hasOwnProperty(root_uri))
          script_uri_paths[root_uri].push(ret_script);
        else
          script_uri_paths[root_uri] = [ret_script];
      }
      else
        inline_and_evals.push(ret_script);

    }, this);

    var script_list = [];
    Object.getOwnPropertyNames(script_uri_paths).sort().forEach(function(uri)
    {
      if (uri != "./")
        ret.push(['cst-title', uri, 'class', 'js-dd-dir-path']);

      ret.extend(script_uri_paths[uri]);
    });

    if (runtime.type != "extension" && inline_and_evals.length)
      script_list.push(['cst-title', 
                          "Inline, Eval, Timeout and Event handler scripts",
                          'class', 'js-dd-dir-path']);

    script_list.extend(inline_and_evals);
    ret.extend(script_list);
    if (runtime.type != "extension")
    {
      if (runtime.browser_js || (runtime.user_js_s && runtime.user_js_s.length))
      {
        ret.push(['cst-title', 'Browser and User JS', 'class', 'js-dd-dir-path']);

        if (runtime.browser_js)
          ret.push(this.script_option(runtime.browser_js))

        if (runtime.user_js_s && runtime.user_js_s.length)
        {
          for (var i = 0, script; script = runtime.user_js_s[i]; i++)
          {
            ret.push(this.script_option(script,
                                        stopped_script_id,
                                        selected_script_id));
          }
        }
      }

      if (runtime.extensions)
      {
        for (var i = 0, rt; rt = runtime.extensions[i]; i++)
        {
          ret.push(this.runtime_script(rt, stopped_script_id, selected_script_id));
        }
      }
    }
    return ret;
  }

  this._uri_path = function(runtime, script)
  {
    var uri_path = script.abs_dir;

    if (script.abs_dir.indexOf(runtime.abs_dir) == 0)
      uri_path = "./" + script.abs_dir.slice(runtime.abs_dir.length);
    else if (script.host == runtime.host && script.protocol == runtime.protocol)
      uri_path = "/" + script.dir_pathname;

    return uri_path;
  };

  // script types in the protocol:
  // "inline", "event", "linked", "timeout",
  // "java", "generated", "unknown"
  // "Greasemonkey JS", "Browser JS", "User JS", "Extension JS"
  this._script_type_map =
  {
    "inline": ui_strings.S_TEXT_ECMA_SCRIPT_TYPE_INLINE,
    "linked": ui_strings.S_TEXT_ECMA_SCRIPT_TYPE_LINKED,
    "unknown": ui_strings.S_TEXT_ECMA_SCRIPT_TYPE_UNKNOWN
  };

  this.script_option = function(script, stopped_script_id, selected_script_id)
  {
    var script_type = this._script_type_map[script.script_type] ||
                      script.script_type;
    var ret = null;

    if (script.script_type == "linked")
    {
      ret = ["cst-option",
              ["span", script.filename], 
              "script-id", script.script_id.toString()];
    }
    else
    {
      var code_snippet = script.script_data.slice(0, 360)
                               .replace(/\s+/g, " ").slice(0, 120);
      ret = ["cst-option",
              ["span", script_type.capitalize(true) + " – ",
                ["code", code_snippet, "class", "code-snippet"]],
              "script-id", script.script_id.toString()];
    }

    var class_name = script.script_id == selected_script_id
                   ? 'selected'
                   : '';

    if (stopped_script_id == script.script_id)
      class_name += ( class_name && ' ' || '' ) + 'stopped';

    if (script.uri)
      ret.push('title', script.uri);
    
    if (class_name)
      ret.push('class', class_name);

    return ret;
  };

  this.runtime_dom = function(runtime)
  {
    var display_uri = runtime['title'] || helpers.shortenURI(runtime.uri).uri;
    return (
    [
      'cst-option',
       runtime['title'] || runtime.uri,
      'runtime-id', runtime.runtime_id.toString()
    ].concat( dom_data.getDataRuntimeId() == runtime.runtime_id ? ['class', 'selected'] : [] ).
      concat( display_uri != runtime.uri ? ['title', runtime.uri] : [] ) )
  }

  this.checkbox = function(settingName, settingValue)
  {
    return ['li',
      ['label',
        ['input',
        'type', 'checkbox',
        'value', settingName,
        'checked', settingValue ?  true : false,
        'handler', 'set-stop-at'
        ],
        settingName
      ]
    ]
  }

  this.frame = function(frame, is_top)
  {
    // Fall back to document URI if it's inline
    var uri = frame.script_id && runtimes.getScript(frame.script_id)
            ? (runtimes.getScript(frame.script_id).uri || runtimes.getRuntime(frame.rt_id).uri)
            : null;
    return ['li',
             ['span', frame.fn_name, 'class', 'scope-name'],
             ['span',
              " " + (uri && frame.line ? helpers.basename(uri) + ':' + frame.line : ""),
              'class', 'file-line'],
      'handler', 'show-frame',
      'ref-id', String(frame.id),
      'title', uri
    ].concat( is_top ? ['class', 'selected'] : [] );
  }

  this.configStopAt = function(config)
  {
    var ret =['ul'];
    var arr = ["script", "exception", "error", "abort"], n='', i=0;
    for( ; n = arr[i]; i++)
    {
      ret[ret.length] = this.checkbox(n, config[n]);
    }
    return ['div'].concat([ret]);
  }

  this.breakpoint = function(line_nr, top)
  {
    return ['li',
          'class', 'breakpoint',
          'line_nr', line_nr,
          'style', 'top:'+ top +'px'
        ]
  }

  this.breadcrumb = function(model, obj_id, parent_node_chain, target_id, show_combinator)
  {
    var setting = window.settings.dom;
    var css_path = model._get_css_path(obj_id, parent_node_chain,
                                       setting.get('force-lowercase'),
                                       setting.get('show-id_and_classes-in-breadcrumb'),
                                       setting.get('show-siblings-in-breadcrumb'));
    var ret = [];
    target_id || (target_id = obj_id)
    if (css_path)
    {
      for (var i = 0; i < css_path.length; i++ )
      {
        ret[ret.length] =
        [
          "breadcrumb", css_path[i].name,
          'ref-id', css_path[i].id.toString(),
          'handler', 'breadcrumb-link',
          'data-menu', 'breadcrumb',
          'class', (css_path[i].is_parent_offset ? 'parent-offset' : '') + 
                   (css_path[i].id == target_id ? ' active' : ''),
        ];
        if (show_combinator)
        {
          ret[ret.length] = " " + css_path[i].combinator + " ";
        }
      }
    }
    return ret;
  }

  this.uiLangOptions = function(lang_dict)
  {
    var dict =
    [
      {
        browserLanguge: "be",
        key: "be",
        name: "Беларуская"
      },
      {
        browserLanguge: "bg",
        key: "bg",
        name: "Български"
      },
      {
        browserLanguge: "cs",
        key: "cs",
        name: "Česky"
      },
      {
        browserLanguge: "da",
        key: "da",
        name: "Dansk"
      },
      {
        browserLanguge: "de",
        key: "de",
        name: "Deutsch"
      },
      {
        browserLanguge: "el",
        key: "el",
        name: "Ελληνικά"
      },
      {
        browserLanguge: "en",
        key: "en",
        name: "U.S. English"
      },
      {
        browserLanguge: "en-GB",
        key: "en-GB",
        name: "British English"
      },
      {
        browserLanguge: "es-ES",
        key: "es-ES",
        name: "Español (España)"
      },
      {
        browserLanguge: "es-LA",
        key: "es-LA",
        name: "Español (Latinoamérica)"
      },
      {
        browserLanguge: "et",
        key: "et",
        name: "Eesti keel"
      },
      {
        browserLanguge: "fi",
        key: "fi",
        name: "Suomen kieli"
      },
      {
        browserLanguge: "fr",
        key: "fr",
        name: "Français"
      },
      {
        browserLanguge: "fr-CA",
        key: "fr-CA",
        name: "Français Canadien"
      },
      {
        browserLanguge: "fy",
        key: "fy",
        name: "Frysk"
      },
      {
        browserLanguge: "hi",
        key: "hi",
        name: "हिन्दी"
      },
      {
        browserLanguge: "hr",
        key: "hr",
        name: "Hrvatski"
      },
      {
        browserLanguge: "hu",
        key: "hu",
        name: "Magyar"
      },
      {
        browserLanguge: "id",
        key: "id",
        name: "Bahasa Indonesia"
      },
      {
        browserLanguge: "it",
        key: "it",
        name: "Italiano"
      },
      {
        browserLanguge: "ja",
        key: "ja",
        name: "日本語"
      },
      {
        browserLanguge: "ka",
        key: "ka",
        name: "ქართული"
      },
      {
        browserLanguge: "ko",
        key: "ko",
        name: "한국어"
      },
      {
        browserLanguge: "lt",
        key: "lt",
        name: "Lietuvių kalba"
      },
      {
        browserLanguge: "mk",
        key: "mk",
        name: "македонски јазик"
      },
      {
        browserLanguge: "nb",
        key: "nb",
        name: "Norsk bokmål"
      },
      {
        browserLanguge: "nl",
        key: "nl",
        name: "Nederlands"
      },
      {
        browserLanguge: "nn",
        key: "nn",
        name: "Norsk nynorsk"
      },
      {
        browserLanguge: "pl",
        key: "pl",
        name: "Polski"
      },
      {
        browserLanguge: "pt",
        key: "pt",
        name: "Português"
      },
      {
        browserLanguge: "pt-BR",
        key: "pt-BR",
        name: "Português (Brasil)"
      },
      {
        browserLanguge: "ro",
        key: "ro",
        name: "Română"
      },
      {
        browserLanguge: "ru",
        key: "ru",
        name: "Русский язык"
      },
      {
        browserLanguge: "sk",
        key: "sk",
        name: "Slovenčina"
      },
      {
        browserLanguge: "sr",
        key: "sr",
        name: "српски"
      },
      {
        browserLanguge: "sv",
        key: "sv",
        name: "Svenska"
      },
      {
        browserLanguge: "ta",
        key: "ta",
        name: "தமிழ்"
      },
      {
        browserLanguge: "te",
        key: "te",
        name: "తెలుగు"
      },
      {
        browserLanguge: "tr",
        key: "tr",
        name: "Türkçe"
      },
      {
        browserLanguge: "uk",
        key: "uk",
        name: "Українська"
      },
      {
        browserLanguge: "zh-cn",
        key: "zh-cn",
        name: "简体中文"
      },
      {
        browserLanguge: "zh-tw",
        key: "zh-tw",
        name: "繁體中文"
      }
    ],
    lang = null,
    i = 0,
    selected_lang = window.ui_strings.lang_code,
    ret = [];

    for( ; lang = dict[i]; i++)
    {
      ret[ret.length] = ['option', lang.name, 'value', lang.key].
        concat( selected_lang == lang.key ? ['selected', 'selected'] : [] );
    }
    return ret;
  }

}).apply(window.templates || (window.templates = {}));
