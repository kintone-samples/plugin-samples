jQuery.noConflict();

(function($, PLUGIN_ID) {
  "use strict";
  var editor;
  var jsFiles = null;
  var libs = null;
  var jsLibs = [], cssLibs = [];
  var spinner;
  var currentIndex = -1;
  var modified = false;
  var PREFIX = 'jsedit-plugin-';

  var terms = {
    en:{
      js_for_pc: 'JavaScript Files for PC',
      js_for_mobile: 'JavaScript Files for Mobile',
      css_for_pc: 'CSS Files for PC',
      new_file: 'New File',
      discard: '   Discard   ',
      back: 'Back to Plug-ins',
      libraries: 'Libraries',
      save_options: 'Save Options',
      apply_to_production: 'Update app when saving the code',
      links: 'Links',
      plugin_submit: '     Save   ',
      plugin_cancel: '     Cancel   ',
      required_field: 'Required field is empty.',
      msg_discard: 'Your changes will be discarded. Are you sure you want to continue?',
      msg_failed_to_get_file: 'Failed to retrieve files!',
      msg_failed_to_update: 'Failed to update!',
      msg_file_name_is_duplicated: 'This file name is duplicated. Please set a unique file name.',
      msg_input_file_name: 'Input file name',
      cdn_url: 'https://js.kintone.com/',
      cdn_url_regex: '^https:\\/\\/js\\.kintone\\.com\\/'
    },
    ja:{
      js_for_pc: 'PC用のJavaScriptファイル',
      js_for_mobile: 'スマートフォン用のJavaScriptファイル',
      css_for_pc: 'PC用のCSSファイル',
      new_file: '新規作成',
      discard: '     破棄   ',
      back: 'プラグインへ戻る',
      libraries: 'ライブラリ',
      save_options: 'オプション',
      apply_to_production: '運用環境に反映する',
      links: 'リンク',
      plugin_submit: '     保存   ',
      plugin_cancel: '  キャンセル   ',
      required_field: '必須項目を入力してください。',
      msg_discard: '変更は破棄されます。よろしいですか？',
      msg_failed_to_get_file: 'ファイルの取得に失敗しました。',
      msg_failed_to_update: '更新に失敗しました。',
      msg_file_name_is_duplicated: 'ファイル名が重複しています。重複のないように設定してください。',
      msg_input_file_name: 'ファイル名を入力してください。',
      cdn_url: 'https://js.cybozu.com/',
      cdn_url_regex: '^https:\\/\\/js\\.cybozu\\.com\\/'
    },
    zh:{
      js_for_pc: 'JavaScript Files for PC',
      js_for_mobile: 'JavaScript Files for Mobile',
      css_for_pc: 'CSS Files for PC',
      new_file: 'New File',
      discard: '   Discard   ',
      back: 'Back to Plug-ins',
      libraries: 'Libraries',
      save_options: 'Save Options',
      apply_to_production: 'Update app when saving the code',
      links: 'Links',
      plugin_submit: '     Save   ',
      plugin_cancel: '     Cancel   ',
      required_field: 'Required field is empty.',
      msg_discard: 'Your changes will be discarded. Are you sure you want to continue?',
      msg_failed_to_get_file: 'Failed to retrieve files!',
      msg_failed_to_update: 'Failed to update!',
      msg_file_name_is_duplicated: 'This file name is duplicated. Please set a unique file name.',
      msg_input_file_name: 'Input file name',
      cdn_url: 'https://js.cybozu.cn/',
      cdn_url_regex: '^https:\\/\\/js\\.cybozu\\.cn\\/'
    }
  };

  var links = {
    en: [
      {url: "https://developer.kintone.io/hc/en-us", label: "kintone developer network"},
      {url: "https://developer.kintone.io/hc/en-us/articles/213149177/", label: "kintone CDN"},
      {url: "https://developer.kintone.io/hc/en-us/articles/212495178", label: "API Docs"}
    ],
    ja: [
      {url: "https://cybozudev.zendesk.com/hc/ja", label: "cybozu.com developer network"},
      {url: "https://cybozudev.zendesk.com/hc/ja/articles/202960194", label: "Cybozu CDN"},
      {url: "https://cybozudev.zendesk.com/hc/ja/articles/202738940", label: "kintone API 一覧"}
    ],
    zh: [
      {url: "https://cybozudev.kf5.com/hc/", label: "cybozu developer network"},
      {url: "https://cybozudev.kf5.com/hc/kb/article/206405/", label: "Cybozu CDN"}
    ]
  };

  var cdnLibs = {
    en: [
      "jQuery",
      "jQuery UI",
      "Moment.js",
      "Ace",
      "AngularJS",
      "Chart.JS",
      "DataTables",
      "DomPurify",
      "FontAwesome",
      "FullCalendar",
      "Handsontable",
      "highlightjs",
      "jqGrid",
      "jQuery.Gantt",
      "JSRender",
      "jsTree",
      "JSZip",
      "Marked.js",
      "OpenLayers",
      "popModal",
      "Spin.js",
      "SweetAlert",
      "Underscore.js",
      "Vue.js"
    ],
    ja: [
      "jQuery",
      "jQuery UI",
      "Moment.js",
      "Ace",
      "AngularJS",
      "Chart.JS",
      "DataTables",
      "DomPurify",
      "FontAwesome",
      "FullCalendar",
      "Handsontable",
      "highlightjs",
      "jqGrid",
      "jQuery.Gantt",
      "JSRender",
      "jsTree",
      "JSZip",
      "Marked.js",
      "OpenLayers",
      "popModal",
      "Spin.js",
      "SweetAlert",
      "UltraDate.js",
      "Underscore.js",
      "Vue.js"
    ],
    zh: [
      "jQuery",
      "jQuery UI",
      "Moment.js",
      "Ace",
      "AngularJS",
      "Chart.JS",
      "DataTables",
      "DomPurify",
      "FontAwesome",
      "FullCalendar",
      "Handsontable",
      "highlightjs",
      "jqGrid",
      "jQuery.Gantt",
      "JSRender",
      "jsTree",
      "JSZip",
      "Marked.js",
      "OpenLayers",
      "popModal",
      "Spin.js",
      "SweetAlert",
      "UltraDate.js",
      "Underscore.js",
      "Vue.js"
    ]
  };

  var _cdnLibs = {
    "jQuery": ["jquery", "2.2.4", "jquery.min.js"],
    "jQuery UI": ["jqueryui", "1.12.0", ["jquery-ui.min.js", "themes/smoothness/jquery-ui.css"]],
    "Moment.js": ["momentjs", "2.15.1", ["moment.min.js", "moment-with-locales.min.js"]],
    "Ace": ["ace", "v1.2.5", "ace.js"],
    "AngularJS": ["angularjs", "v1.5.8", "angular.min.js"],
    "Chart.JS": ["chartjs", "v2.2.2", "Chart.min.js"],
    "DataTables": ["datatables", "v1.10.12", ["js/jquery.dataTables.min.js", "css/jquery.dataTables.min.css"]],
    "DomPurify": ["dompurify", "0.8.3", "purify.min.js"],
    "FontAwesome": ["font-awesome", "v4.6.3", "css/font-awesome.min.css"],
    "FullCalendar": ["fullcalendar", "v3.0.1", ["fullcalendar.min.js", "fullcalendar.min.css", "fullcalendar.print.css"]],
    "Handsontable": ["handsontable", "0.28.3", ["handsontable.full.min.js", "handsontable.full.min.css"]],
    "highlightjs": ["highlightjs", "9.7.0", ["highlight.js", "styles/default.css"]],
    "jqGrid": ["jqgrid", "v5.1.1", ["js/jquery.jqGrid.min.js","js/i18n/grid.locale-ja.js", "js/i18n/grid.locale-en.js", "js/i18n/grid.locale-cn.js", "css/ui.jqgrid.css"]],
    "jQuery.Gantt": ["jquerygantt", "20140623", ["jquery.fn.gantt.min.js", "css/style.css"]],
    "JSRender": ["jsrender", "0.9.80", "jsrender.min.js"],
    "jsTree": ["jstree", "3.3.2", ["jstree.min.js", "themes/default/style.min.css"]],
    "JSZip": ["jszip", "v3.1.2", "jszip.min.js"],
    "Marked.js": ["markedjs", "v0.3.6", "marked.min.js"],
    "OpenLayers": ["openlayers", "v3.18.2", ["ol.js", "ol.css"]],
    "popModal": ["popmodal", "1.23", ["popModal.min.js", "popModal.min.css"]],
    "Spin.js": ["spinjs", "2.3.2", "spin.min.js"],
    "SweetAlert": ["sweetalert", "v1.1.3", ["sweetalert.min.js", "sweetalert.css"]],
    "UltraDate.js": ["ultradatejs", "v2.2.1", ["UltraDate.min.js", "UltraDate.ja.min.js"]],
    "Underscore.js": ["underscore", "1.8.3", "underscore-min.js"],
    "Vue.js": ["vuejs", "v1.0.28", "vue.min.js"]
  };

  var $id = function(name) {
      return $('#' + PREFIX + name);
  };

  var lang = kintone.getLoginUser().language;
  if (!terms[lang]) lang = 'en';
  var i18n = terms[lang];

  var CDN_URL = i18n.cdn_url;
  var CDN_URL_REGEX = i18n.cdn_url_regex;

  var getCurrentType = function() {
    return $id('type').val();
  };

  var maxIndex = function() {
    if (!jsFiles) return -1;
    return jsFiles.length - 1;
  };

  $.fn.spinner = function(){
    var caller = this;
    var component = new app.Spinner(this);
    return component;
  };

  var app = {};
  app.Spinner = function($element) {
    var opts = {};
    if (!$element) {
      $element = $('<div id="spinner-backdrop" class="spinner-backdrop"></div>');
      $('body').append($element);
    }
    this._spinner = new Spinner(opts).spin($element.get(0));
  };

  app.Spinner.prototype = {
    stop: function() {
      this._spinner.stop();
      $('#spinner-backdrop').remove();
    }
  };

  var setDefaultSource = function() {
    var defaultSource;

    if (getCurrentType() == 'js_pc') {
      defaultSource = 'jQuery.noConflict();\n\
(function($) {\n\
    "use strict";\n\
    kintone.events.on("app.record.index.show", function(e) {\n\
    });\n\
})(jQuery);\n';
    } else if (getCurrentType() == 'js_mb') {
      defaultSource = 'jQuery.noConflict();\n\
(function($) {\n\
    "use strict";\n\
    kintone.events.on("mobile.app.record.index.show", function(e) {\n\
    });\n\
})(jQuery);\n';
    } else if (getCurrentType() == 'css_pc') {
      defaultSource = '@charset "UTF-8";';
    }

    setValue(defaultSource);
  };

  var confirmDiscard = function() {
    return (window.confirm(i18n.msg_discard));
  };

  var setValue = function(data) {
    editor.setValue(data);
    editor.selection.moveCursorToPosition({row: 1, column: 0});
    editor.selection.selectLine();
    modified = false;
  };

  var getFile = function() {
    if (!jsFiles) return;
    if (currentIndex < 0) {
      setValue('');
      return;
    }
    var js = jsFiles[currentIndex];
    if (js.type != 'FILE') return;
    if (!js.file.fileKey) {
      setDefaultSource();
    } else {
      if (spinner) return;
      spinner = new app.Spinner();
      $.ajax(kintone.api.url('/k/v1/file', true), {
        type: "GET",
        dataType: "text",
        data: {"fileKey": js.file.fileKey}
      }).done(function(data, status, xhr){
        setValue(data);
        spinner.stop();
        spinner = null;
      }).fail(function(xhr, status, error){
        spinner.stop();
        spinner = null;
        alert(i18n.msg_failed_to_get_file);
      });

    }
  };

  var uploadFile = function(fileName) {
    var d = new $.Deferred();

    var blob = new Blob([editor.getValue()], {type:"text\/javascript"});
    var formData = new FormData();
    formData.append("__REQUEST_TOKEN__", kintone.getRequestToken());
    formData.append("file", blob , fileName);
    $.ajax(kintone.api.url('/k/v1/file', true), {
      type: "POST",
      data: formData,
      processData: false,
      contentType: false
    }).done(function(data){
      d.resolve(data);
    }).fail(function(data){
      d.reject();
    });

    return d.promise();
  };

  var addNewLibs = function(tmpFiles) {
    var i, j;
    for (i = 0; i < libs.length; i++) {
      var lib = libs[i];
      var option = $id('libraries').get(0).options[i];
      if (option.selected) {
        var isNewLib = true;
        for (j = 0; j < jsFiles.length; j++) {
          var jsFile = jsFiles[j];
          if (jsFile.url) {
            if (getLib(jsFile.url) === lib) {
              isNewLib = false;
            }
          }
        }
        if (!isNewLib) continue;
        if ($.isArray(lib.url)) {
          for (j = 0; j < lib.url.length; j++) {
            tmpFiles.push({
              type: 'URL',
              url: lib.url[j]
            });
          }
        } else {
          tmpFiles.push({
            type: 'URL',
            url: lib.url
          });
        }
      }
    }
  };

  var getLib = function(url) {
    var re = new RegExp(CDN_URL_REGEX + "(.*?)\\/");
    var m = url.match(re);
    if (m) {
      var libName = m[1];
      for (var i = 0; i < libs.length; i++) {
        var lib = libs[i];
        if (lib.key == libName) {
          return lib;
        }
      }
    }
    return null;
  };

  var isSelected = function(lib) {
    for (var i = 0; i < libs.length; i++) {
      if (lib === libs[i]) {
        var option = $id('libraries').get(0).options[i];
        return (option.selected);
      }
    }
    return false;
  };

  var save = function() {
    if (spinner) return;
    if (!jsFiles) return;

    if (currentIndex < 0) {
      spinner = new app.Spinner();
      _save();
      return;
    }
    var js = jsFiles[currentIndex];
    if (js.type != 'FILE') return;
    spinner = new app.Spinner();
    uploadFile(js.file.name).done(function(f) {
      js.file.fileKey = f.fileKey;
      // update customize.json
      _save();
    }).fail(function(f) {
    });
  };

  var _save = function() {
    var tmpFiles = [];

    addNewLibs(tmpFiles);

    for (var i = 0; i < jsFiles.length; i++) {
      var jsFile = jsFiles[i];
      if (jsFile.url) {
        var lib = getLib(jsFile.url);
        if (lib) {
          if (isSelected(lib)) tmpFiles.push(jsFile);
        } else {
          tmpFiles.push(jsFile);
        }
      } else if (jsFile.file && jsFile.file.fileKey) {
        tmpFiles.push(jsFile);
      }
    }
    var data = {
      app: kintone.app.getId()
    };
    if (getCurrentType() == 'js_pc') {
      data.desktop = {
        js: tmpFiles
      };
    } else if (getCurrentType() == 'js_mb') {
      data.mobile = {
        js: tmpFiles
      };
    } else if (getCurrentType() == 'css_pc') {
      data.desktop = {
        css: tmpFiles
      };
    }
    kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'PUT', data,
      function(resp) {
        var finalize = function() {
          getFiles(true);
          modified = false;
          spinner.stop();
          spinner = null;
        };
        if ($id('deploy').prop('checked')) {
          // deploy
          kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', {apps:[{app: kintone.app.getId()}]}, function() {
            finalize();
          });
        } else {
          finalize();
        }
      },
      function() {
        alert(i18n.msg_failed_to_update);
        spinner.stop();
        spinner = null;
      }
    );
  };

  var getFiles = function(refresh) {

    //get all files
    var $files = $id('files');

    kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', {app: kintone.app.getId()}, function(resp) {
      if (refresh) {
        currentFileName = jsFiles[currentIndex].file.name;
      } else {
        currentIndex = -1;
      }

      jsFiles = [];
      var currentFileName;
      var records;
      $files.empty();
      if (getCurrentType() == 'js_pc') {
        records = resp.desktop.js;
        libs = $.extend(true, [], jsLibs);
      } else if (getCurrentType() == 'js_mb') {
        records = resp.mobile.js;
        libs = $.extend(true, [], jsLibs);
      } else if (getCurrentType() == 'css_pc') {
        records = resp.desktop.css;
        libs = $.extend(true, [], cssLibs);
      }
      var i, js;
      //duplicate check
      for (i = 0; i < records.length; i++) {
        js = records[i];
        if (js.type == 'FILE') {
          for (var j = i + 1; j < records.length; j++) {
            var js2 = records[j];
            if (js2.type == 'FILE') {
              if (js.file.name == js2.file.name) {
                alert(i18n.msg_file_name_is_duplicated);
                return;
              }
            }
          }
        }
      }
      for (i = 0; i < records.length; i++) {
        js = $.extend(true, {}, records[i]);
        jsFiles.push(js);
        if (js.type == 'FILE') {
          if (currentIndex < 0) currentIndex = i;
          var name = js.file.name;
          if (refresh && name == currentFileName) {
            currentIndex = i;
          }
          $files.append($('<OPTION>').text(name).val(i));
        } else if (js.type == 'URL') {
          var lib = getLib(js.url);
          if (lib) {
            lib.selected = true;
            var re = new RegExp(CDN_URL_REGEX + "(.*?)\\/(.*?)\\/");
            var m = js.url.match(re);
            if (m) {
              lib.currentVersion = m[2];
            }
          }
        }
      }
      $files.val(currentIndex);

      if (!refresh) {
        if (getCurrentType() == 'js_pc') {
          editor.getSession().setMode("ace/mode/javascript");
        } else if (getCurrentType() == 'js_mb') {
          editor.getSession().setMode("ace/mode/javascript");
        } else if (getCurrentType() == 'css_pc') {
          editor.getSession().setMode("ace/mode/css");
        }
        getFile();

        setLibs(libs);
      }
    });

  };

  var setLibs = function(libs) {
    var $container = $id('libraries');
    $container.empty();
    for (var i = 0; i < libs.length; i++) {
      var lib = libs[i];
      var text;
      if (lib.currentVersion && lib.version != lib.currentVersion) {
        text = lib.name + '(' + lib.currentVersion + ' -> ' + lib.version + ')';
      } else {
        text = lib.name + '(' + lib.version + ')';
      }
      var $opt = $('<OPTION>').text(text).val(lib.key);
      if (lib.selected) {
        $opt.prop('selected', true);
      }
      $container.append($opt);
    }
  };

  $(function() {
    $('[data-i18n]').each(function(elm) {
      var $elm = $(this);
      var name = $elm.attr('data-i18n');
      $elm.text(i18n[name]);
    });
    links[lang].forEach(function(li) {
      $id('links').append($('<p><a target="_blank" href="' + li.url + '">' + li.label + '</a></p>'));
    });

    cdnLibs[lang].forEach(function(libName) {
      var lib = _cdnLibs[libName];
      var tmpLib = {
        name: libName,
        key: lib[0],
        version: lib[1],
        url: [],
        selected: false
      };
      var filenames = lib[2];
      if (!$.isArray(filenames)) filenames = [filenames];
      var jsLib, cssLib;
      for (var j = 0; j < filenames.length; j++) {
        var filename = filenames[j];
        var url = CDN_URL + lib[0] + '/' + lib[1] + '/' + filename;
        if (filename.match(/\.js$/)) {
          if (!jsLib) jsLib = $.extend(true, {}, tmpLib);
          jsLib.url.push(url);
        } else if (filename.match(/\.css$/)) {
          if (!cssLib) cssLib = $.extend(true, {}, tmpLib);
          cssLib.url.push(url);
        }
      }
      if (jsLib) jsLibs.push(jsLib);
      if (cssLib) cssLibs.push(cssLib);
    });

    //get all js files
    var $files = $id('files');

    editor = ace.edit("jsedit-editor");
    editor.$blockScrolling = Infinity;
    editor.setTheme("ace/theme/monokai");
    ace.require("ace/ext/language_tools");
    editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
      enableLiveAutocompletion: true
    });
    var completions = kintoneCompletions();
    editor.completers.push({
      getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, completions);
      }
    });
    /*
    editor.commands.on("afterExec", function(e){
      if (e.command.name == "insertstring"&&/^[\w.]$/.test(e.args)) {
        editor.execCommand("startAutocomplete")
      }
    })
    */

    $id('type').val('js_pc');

    editor.on('change', function() {
      modified = true;
    });

    getFiles();

    $id('new-file').click(function(e) {
      e.preventDefault();
      if (modified) {
        if (!confirmDiscard()) return;
      }
      var fileName = window.prompt(i18n.msg_input_file_name);
      if (!fileName) return;

      switch (getCurrentType()) {
        case 'js_pc':
        case 'js_mb':
          if (!fileName.match(/\.js$/)) {
            fileName = fileName + '.js';
          }
          break;
        case 'css_pc':
          if (!fileName.match(/\.css$/)) {
            fileName = fileName + '.css';
          }
          break;
      }

      for (var i = 0; i < jsFiles.length; i++) {
        var js = jsFiles[i];
        if (js.type == 'FILE') {
          if (js.file.name == fileName) {
            alert(i18n.msg_file_name_is_duplicated);
            return;
          }
        }
      }

      var jsFile = {
        type: 'FILE',
        file: {
          name: fileName
        }
      };
      jsFiles.push(jsFile);
      currentIndex = maxIndex();
      $files.append($('<OPTION>').text(fileName).val(currentIndex));
      $files.val(currentIndex);
      setDefaultSource();
      modified = false;
    });

    $id('files').focus(function(e) {
      $.data(this, 'current', $(this).val());
    });

    $id('files').change(function(e) {
      if (modified) {
        if (!confirmDiscard()) {
          $(this).val($.data(this, 'current'));
          return false;
        }
      }
      var val = $(e.target).val();
      currentIndex = Number(val);
      getFile();
      modified = false;
    });

    $id('type').focus(function(e) {
      $.data(this, 'current', $(this).val());
    });

    $id('type').change(function(e) {
      if (modified) {
        if (!confirmDiscard()) {
          $(this).val($.data(this, 'current'));
          return false;
        }
      }
      getFiles();
      modified = false;
    });

    $id('submit').click(function(e) {
      // submit event
      e.preventDefault();
      save();
    });

    $id('cancel').click(function(e) {
      // discard event
      e.preventDefault();
      if (!confirmDiscard()) return;
      getFile();
    });

    $id('back').click(function(e) {
      // back event
      e.preventDefault();
      if (modified) {
        if (!confirmDiscard()) return;
      }
      history.back();
    });

    $id("libraries").mousedown(function(e){
      e.preventDefault();

      var select = this;
      var scroll = select.scrollTop;

      e.target.selected = !e.target.selected;

      setTimeout(function(){select.scrollTop = scroll;}, 0);

      $(select ).focus();
    }).mousemove(function(e){e.preventDefault();});
  });

  var kintoneCompletions = function() {
    var ret = [];
    var keywords = [
      "cybozu","kintone",
      "kintone.events.on",
      "kintone.events.off",
      "app.record.index.show",
      "app.record.index.edit.submit",
      "mobile.app.record.index.show",
      "app.record.index.edit.submit",
      "app.record.index.edit.show",
      "app.record.index.edit.change",
      "app.record.index.delete.submit",
      "app.record.detail.show",
      "mobile.app.record.detail.show",
      "app.record.detail.delete.submit",
      "app.record.detail.process.proceed",
      "kintone.app.record.setFieldShown",
      "app.record.create.submit",
      "mobile.app.record.create.show",
      "app.record.create.show",
      "app.record.create.submit",
      "app.record.create.change",
      "app.record.edit.show",
      "mobile.app.record.edit.show",
      "app.record.edit.submit",
      "app.record.edit.change",
      "app.report.show",
      "kintone.app.getId",
      "kintone.app.getQueryCondition",
      "kintone.app.getQuery",
      "kintone.app.getFieldElements",
      "kintone.app.getHeaderMenuSpaceElement",
      "kintone.app.getHeaderSpaceElement",
      "kintone.app.record.getId",
      "kintone.app.record.get",
      "kintone.mobile.app.record.get",
      "kintone.app.record.getFieldElement",
      "kintone.app.record.set",
      "kintone.mobile.app.record.set",
      "kintone.app.record.get",
      "kintone.mobile.app.record.get",
      "kintone.app.record.getHeaderMenuSpaceElement",
      "kintone.app.record.getSpaceElement",
      "kintone.app.getRelatedRecordsTargetAppId",
      "kintone.app.getLookupTargetAppId",
      "kintone.mobile.app.getHeaderSpaceElement",
      "kintone.getLoginUser",
      "kintone.getUiVersion",
      "kintone.api",
      "kintone.api.url",
      "kintone.api.urlForGet",
      "kintone.getRequestToken",
      "kintone.proxy",
      "v1/record.json",
      "v1/records.json",
      "v1/bulkRequest.json",
      "v1/record/status.json",
      "v1/records/status.json",
      "v1/file.json",
      "v1/preview/app.json",
      "v1/preview/app/deploy.json",
      "v1/app/settings.json",
      "v1/preview/app/settings.json",
      "v1/app/form/fields.json",
      "v1/preview/app/form/fields.json",
      "v1/app/form/layout.json",
      "v1/preview/app/form/layout.json",
      "v1/app/views.json",
      "v1/preview/app/views.json",
      "v1/app/acl.json",
      "v1/preview/app/acl.json",
      "v1/record/acl.json",
      "v1/preview/record/acl.json",
      "v1/field/acl.json",
      "v1/preview/field/acl.json",
      "v1/app/customize.json",
      "v1/preview/app/customize.json",
      "v1/app.json",
      "v1/apps.json",
      "v1/form.json",
      "v1/preview/form.json",
      "v1/apis.json",
      "v1/space.json",
      "v1/template/space.json",
      "v1/space/body.json",
      "v1/space/thread.json",
      "v1/space/members.json",
      "v1/space/guests.json",
      "v1/guests.json",
    ];
    for (var i = 0; i < keywords.length; i++) {
      ret.push({value: keywords[i], score: 1000, meta: "kintone"});
    }
    return ret;
  };
})(jQuery, kintone.$PLUGIN_ID);
