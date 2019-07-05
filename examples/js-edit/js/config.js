/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
/* global ace */
jQuery.noConflict();

(function ($, PLUGIN_ID) {
    'use strict';
    var NO_FILE_KEY = '-1';
    var editor;
    var app = {
        customization: {
            desktop: { css: [], js: [] },
            mobile: { css: [], js: [] }
        },
        removingLibs: [],
        currentType: 'js_pc',
        currentFileKey: '',
        modeifiedFile: false
    };

    var $newFileBtn = $('#jsedit-plugin-new-file');
    var $typeDropdown = $('#jsedit-plugin-type');
    var $filesDropdown = $('#jsedit-plugin-files');
    var $librariesMultipleChoice = $('#jsedit-plugin-libraries');
    var $submitBtn = $('#jsedit-plugin-submit');
    var $cancelBtn = $('#jsedit-plugin-cancel');
    var $backBtn = $('#jsedit-plugin-back');
    var $linksContainer = $('#jsedit-plugin-links');
    var $deployConfigCheckbox = $('#jsedit-plugin-deploy');

    var localization = {
        en: {
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
        ja: {
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
        zh: {
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
    }
    var lang = kintone.getLoginUser().language;
    if (!localization[lang]) {
        lang = 'en';
    }
    var i18n = localization[lang];

    var CDN_URL = i18n.cdn_url;
    var CDN_URL_REGEX = i18n.cdn_url_regex;

    var spinner = {
        template: '<div class="spinner-backdrop"></div>',
        hasInit: false,
        spinner: null,
        $container: null,
        init: function () {
            if (this.hasInit) {
                return;
            }

            this.$container = $(this.template).hide();
            $('body').append(this.$container);
            this.spinner = new Spinner();
            this.hasInit = true;
        },
        spin: function () {
            this.spinner.spin(this.$container.get(0));
            this.$container.show();
        },
        stop: function () {
            this.spinner.stop();
            this.$container.hide();
        }
    };

    var links = {
        en: [
            { url: 'https://developer.kintone.io/hc/en-us', label: 'kintone developer network' },
            { url: 'https://developer.kintone.io/hc/en-us/articles/213149177/', label: 'kintone CDN' },
            { url: 'https://developer.kintone.io/hc/en-us/articles/212495178', label: 'API Docs' }
        ],
        ja: [
            { url: 'https://developer.cybozu.io/hc/ja', label: 'Cybozu developer network' },
            { url: 'https://developer.cybozu.io/hc/ja/articles/202960194', label: 'Cybozu CDN' },
            { url: 'https://developer.cybozu.io/hc/ja/articles/202738940', label: 'kintone API 一覧' }
        ],
        zh: [
            { url: 'https://cybozudev.kf5.com/hc/', label: 'cybozu developer network' },
            { url: 'https://cybozudev.kf5.com/hc/kb/article/206405/', label: 'Cybozu CDN' }
        ],
        render: function ($container) {
            this[lang].forEach(function (li) {
                $container.append($('<p><a target="_blank" href="' + li.url + '">' + li.label + '</a></p>'));
            });
        }
    };

    var kintoneCompletions = function () {
        var ret = [];
        var keywords = [
            'cybozu', 'kintone',
            'kintone.events.on',
            'kintone.events.off',
            'app.record.index.show',
            'app.record.index.edit.submit',
            'mobile.app.record.index.show',
            'app.record.index.edit.submit',
            'app.record.index.edit.show',
            'app.record.index.edit.change',
            'app.record.index.delete.submit',
            'app.record.detail.show',
            'mobile.app.record.detail.show',
            'app.record.detail.delete.submit',
            'app.record.detail.process.proceed',
            'kintone.app.record.setFieldShown',
            'app.record.create.submit',
            'mobile.app.record.create.show',
            'app.record.create.show',
            'app.record.create.submit',
            'app.record.create.change',
            'app.record.edit.show',
            'mobile.app.record.edit.show',
            'app.record.edit.submit',
            'app.record.edit.change',
            'app.report.show',
            'kintone.app.getId',
            'kintone.app.getQueryCondition',
            'kintone.app.getQuery',
            'kintone.app.getFieldElements',
            'kintone.app.getHeaderMenuSpaceElement',
            'kintone.app.getHeaderSpaceElement',
            'kintone.app.record.getId',
            'kintone.app.record.get',
            'kintone.mobile.app.record.get',
            'kintone.app.record.getFieldElement',
            'kintone.app.record.set',
            'kintone.mobile.app.record.set',
            'kintone.app.record.get',
            'kintone.mobile.app.record.get',
            'kintone.app.record.getHeaderMenuSpaceElement',
            'kintone.app.record.getSpaceElement',
            'kintone.app.getRelatedRecordsTargetAppId',
            'kintone.app.getLookupTargetAppId',
            'kintone.mobile.app.getHeaderSpaceElement',
            'kintone.getLoginUser',
            'kintone.getUiVersion',
            'kintone.api',
            'kintone.api.url',
            'kintone.api.urlForGet',
            'kintone.getRequestToken',
            'kintone.proxy',
            'v1/record.json',
            'v1/records.json',
            'v1/bulkRequest.json',
            'v1/record/status.json',
            'v1/records/status.json',
            'v1/file.json',
            'v1/preview/app.json',
            'v1/preview/app/deploy.json',
            'v1/app/settings.json',
            'v1/preview/app/settings.json',
            'v1/app/form/fields.json',
            'v1/preview/app/form/fields.json',
            'v1/app/form/layout.json',
            'v1/preview/app/form/layout.json',
            'v1/app/views.json',
            'v1/preview/app/views.json',
            'v1/app/acl.json',
            'v1/preview/app/acl.json',
            'v1/record/acl.json',
            'v1/preview/record/acl.json',
            'v1/field/acl.json',
            'v1/preview/field/acl.json',
            'v1/app/customize.json',
            'v1/preview/app/customize.json',
            'v1/app.json',
            'v1/apps.json',
            'v1/form.json',
            'v1/preview/form.json',
            'v1/apis.json',
            'v1/space.json',
            'v1/template/space.json',
            'v1/space/body.json',
            'v1/space/thread.json',
            'v1/space/members.json',
            'v1/space/guests.json',
            'v1/guests.json'
        ];
        for (var i = 0; i < keywords.length; i++) {
            ret.push({ value: keywords[i], score: 1000, meta: 'kintone' });
        }
        return ret;
    };

    var cdnLibsDetail = {
        'jQuery': ['jquery', '2.2.4', ['jquery.min.js']],
        'jQuery UI': ['jqueryui', '1.12.0', ['jquery-ui.min.js', 'themes/smoothness/jquery-ui.css']],
        'Moment.js': ['momentjs', '2.15.1', ['moment.min.js', 'moment-with-locales.min.js']],
        'Ace': ['ace', 'v1.2.5', ['ace.js']],
        'AngularJS': ['angularjs', 'v1.5.8', ['angular.min.js']],
        'Chart.JS': ['chartjs', 'v2.2.2', ['Chart.min.js']],
        'DataTables': ['datatables', 'v1.10.12', ['js/jquery.dataTables.min.js', 'css/jquery.dataTables.min.css']],
        'DomPurify': ['dompurify', '0.8.3', ['purify.min.js']],
        'FontAwesome': ['font-awesome', 'v4.6.3', ['css/font-awesome.min.css']],
        'FullCalendar': ['fullcalendar', 'v3.0.1',
            ['fullcalendar.min.js', 'fullcalendar.min.css', 'fullcalendar.print.css']],
        'Handsontable': ['handsontable', '0.28.3', ['handsontable.full.min.js', 'handsontable.full.min.css']],
        'highlightjs': ['highlightjs', '9.7.0', ['highlight.js', 'styles/default.css']],
        'jqGrid': ['jqgrid', 'v5.1.1',
            ['js/jquery.jqGrid.min.js', 'js/i18n/grid.locale-ja.js', 'js/i18n/grid.locale-en.js',
                'js/i18n/grid.locale-cn.js', 'css/ui.jqgrid.css']],
        'jQuery.Gantt': ['jquerygantt', '20140623', ['jquery.fn.gantt.min.js', 'css/style.css']],
        'JSRender': ['jsrender', '0.9.80', ['jsrender.min.js']],
        'jsTree': ['jstree', '3.3.2', ['jstree.min.js', 'themes/default/style.min.css']],
        'JSZip': ['jszip', 'v3.1.2', ['jszip.min.js']],
        'Marked.js': ['markedjs', 'v0.3.6', ['marked.min.js']],
        'OpenLayers': ['openlayers', 'v3.18.2', ['ol.js', 'ol.css']],
        'popModal': ['popmodal', '1.23', ['popModal.min.js', 'popModal.min.css']],
        'Spin.js': ['spinjs', '2.3.2', ['spin.min.js']],
        'SweetAlert': ['sweetalert', 'v1.1.3', ['sweetalert.min.js', 'sweetalert.css']],
        'UltraDate.js': ['ultradatejs', 'v2.2.1', ['UltraDate.min.js', 'UltraDate.ja.min.js']],
        'Underscore.js': ['underscore', '1.8.3', ['underscore-min.js']],
        'Vue.js': ['vuejs', 'v1.0.28', ['vue.min.js']]
    };

    var getCurrentType = function () {
        return $typeDropdown.val();
    };

    var _confirmDiscard = function () {
        return (window.confirm(i18n.msg_discard));
    };

    var service = {
        uploadFile: function (fileName, fileValue) {
            return new kintone.Promise(function (resolve, reject) {
                var blob = new Blob([fileValue], { type: 'text/javascript' });
                var formData = new FormData();
                formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
                formData.append('file', blob, fileName);
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(function (data) {
                    resolve(data);
                }).fail(function (err) {
                    reject(err);
                });
            });
        },
        getFile: function (fileKey) {
            return new kintone.Promise(function (resolve, reject) {
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'GET',
                    dataType: 'text',
                    data: { 'fileKey': fileKey }
                }).done(function (data, status, xhr) {
                    resolve(data);
                }).fail(function (xhr, status, error) {
                    alert(i18n.msg_failed_to_get_file);
                    reject();
                });
            });
        },
        getCustomization: function () {
            var params = { app: kintone.app.getId() };
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', params);
        },
        updateCustomization: function (data) {
            data.app = kintone.app.getId();
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'PUT', data);
        },
        deployApp: function () {
            var params = { apps: [{ app: kintone.app.getId() }] };
            return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', params);
        }
    }

    var getLib = function (url) {
        var re = new RegExp(CDN_URL_REGEX + '(.*?)\\/');
        var m = url.match(re);
        if (m) {
            var libName = m[1];
            for (var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if (lib.key === libName) {
                    return lib;
                }
            }
        }
        return null;
    };

    function _renderUIWithLocalization() {
        $('[data-i18n]').each(function (elm) {
            var $elm = $(this);
            var name = $elm.attr('data-i18n');
            $elm.text(i18n[name]);
        });
    }

    function _getLibsInfo() {
        var infos = { jsLibs: [], cssLibs: [] };
        Object.keys(cdnLibsDetail).forEach(function (libName) {
            var lib = cdnLibsDetail[libName];
            var tmpLib = {
                name: libName,
                key: lib[0],
                version: lib[1],
                url: [],
                selected: false
            };
            var filenames = lib[2];
            if (!$.isArray(filenames)) {
                filenames = [filenames];
            }
            var jsLib, cssLib;
            for (var j = 0; j < filenames.length; j++) {
                var filename = filenames[j];
                var url = CDN_URL + lib[0] + '/' + lib[1] + '/' + filename;
                if (filename.match(/\.js$/)) {
                    if (!jsLib) {
                        jsLib = $.extend(true, {}, tmpLib);
                    }
                    jsLib.url.push(url);
                } else if (filename.match(/\.css$/)) {
                    if (!cssLib) {
                        cssLib = $.extend(true, {}, tmpLib);
                    }
                    cssLib.url.push(url);
                }
            }
            if (jsLib) {
                infos.jsLibs.push(jsLib);
            }
            if (cssLib) {
                infos.cssLibs.push(cssLib);
            }
        });

        return infos;
    }

    function _renderLibrariesMultipleChoice() {
        var infos = _getLibsInfo();
        var libs;
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                libs = infos.jsLibs;
                break;
            case 'css_pc':
                libs = infos.cssLibs;
                break;
        }

        $librariesMultipleChoice.empty();
        libs.forEach(function (lib) {
            $librariesMultipleChoice.append('<option value=' + lib.key + '>' + lib.name + '</option>');
        })
    }

    function _handleLibsMultipleChoiceMouseDown(e) {
        e.preventDefault();
        var select = this;
        var scroll = select.scrollTop;
        e.target.selected = !e.target.selected;
        if (e.target.selected) {
            app.removingLibs = app.removingLibs.filter(function (item) {
                return item !== e.target.textContent;
            });
        } else {
            app.removingLibs.push(e.target.textContent);
        }

        setTimeout(function () { select.scrollTop = scroll; }, 0);
        $(select).focus();
    }

    function _initEditor() {
        editor = ace.edit('jsedit-editor');
        editor.$blockScrolling = Infinity;
        editor.setTheme('ace/theme/monokai');
        ace.require('ace/ext/language_tools');
        editor.setOptions({
            enableBasicAutocompletion: false,
            enableSnippets: false,
            enableLiveAutocompletion: true,
            tabSize: 2,
            useSoftTabs: true
        });
        var completions = kintoneCompletions();
        editor.completers.push({
            getCompletions: function (compEditor, session, pos, prefix, callback) {
                callback(null, completions);
            }
        });
        editor.on('change', function () {
            app.modeifiedFile = true;
        });
    };

    function _getCustomizationInfo(customization) {
        app.customization.desktop = $.extend(true, {}, customization.desktop);
        app.customization.mobile = $.extend(true, {}, customization.mobile);
    }

    function _getFilesByType(type) {
        var customizationInfo = _getCustomizationPart(app.customization);
        return customizationInfo.filter(function (item) {
            return item.type === 'FILE'
        }).map(function (item) {
            return { fileKey: item.file.fileKey, name: item.file.name }
        });
    }

    function _getLibLinksByType(type) {
        var customizationInfo = _getCustomizationPart(app.customization);
        return customizationInfo.filter(function (item) {
            return item.type === 'URL'
        }).map(function (item) {
            return item.url;
        });
    }

    function _renderFilesDropdown(defaultValue) {
        $filesDropdown.empty();
        var files = _getFilesByType(app.currentType);
        files.forEach(function (file) {
            $filesDropdown.append('<option value=' + file.fileKey + '> ' + file.name + '</option>')
        });

        if (typeof defaultValue !== 'undefined') {
            $filesDropdown.val(defaultValue);
        }

        app.currentFileKey = $filesDropdown.val();
    }

    function _setEditorContent(value) {
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                editor.getSession().setMode('ace/mode/javascript');
                break;
            case 'css_pc':
                editor.getSession().setMode('ace/mode/css');
                break;
        }

        editor.setValue(value);
        editor.selection.moveCursorToPosition({ row: 1, column: 0 });
        editor.selection.selectLine();
        app.modeifiedFile = false;
    }

    function _setUsedLibsMultipleChoice() {
        var libLinks = _getLibLinksByType(app.currentType);
        var usedLibs = libLinks.map(function (link) {
            return link.split('/')[3];
        });

        $librariesMultipleChoice.val(usedLibs);
    }

    function _refreshFilesDropdown() {
        return service.getCustomization().then(function (customization) {
            _getCustomizationInfo(customization);
            _renderFilesDropdown();
        });
    }

    function _refresh() {
        return _refreshFilesDropdown().then(function () {
            _setUsedLibsMultipleChoice();

            if (app.currentFileKey === null) {
                return kintone.Promise.resolve(null);
            }

            return service.getFile(app.currentFileKey);
        }).then(function (fileData) {
            _setEditorContent(fileData);
        });
    }

    function _handelTypeDropdownChange() {
        if (app.modeifiedFile) {
            if (!_confirmDiscard()) {
                $(this).val($.data(this, 'current'));
                return false;
            }
        }

        app.currentType = $typeDropdown.val();
        spinner.spin()
        _refresh().then(function () {
            app.modeifiedFile = false;
            spinner.stop();
        });
    }

    function _handelFilesDropdownChange() {
        if (app.modeifiedFile) {
            if (!_confirmDiscard()) {
                $(this).val($.data(this, 'current'));
                return false;
            }
        }

        app.currentFileKey = $filesDropdown.val();

        spinner.spin();
        service.getFile(app.currentFileKey).then(function (fileData) {
            _setEditorContent(fileData);
            spinner.stop();
        });

        app.modeifiedFile = false;
    }

    function _createNameForNewFile(name) {
        var fileName = name;
        switch (app.currentType) {
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

        return fileName;
    }

    function _isDuplicatedFileName(fileName) {
        var checkFiles = _getFilesByType(app.currentType);
        var dupplicatedFiles = checkFiles.filter(function (item) {
            return item.name === fileName;
        });

        if (dupplicatedFiles.length > 0) {
            return true;
        }

        false;
    }

    function _addNewTempFile(fileName) {
        var newFileInfo = {
            type: 'FILE',
            file: {
                fileKey: NO_FILE_KEY,
                name: fileName
            }
        };

        switch (app.currentType) {
            case 'js_pc':
                app.customization.desktop.js.push(newFileInfo);
                break;
            case 'js_mb':
                app.customization.mobile.js.push(newFileInfo);
                break;
            case 'css_pc':
                app.customization.desktop.css.push(newFileInfo);
                break;
        }

        return newFileInfo;
    }

    function _getDefaultSourceForNewFile() {
        var defaultSource;
        switch (app.currentType) {
            case 'js_pc':
                defaultSource = 'jQuery.noConflict();\n' +
                    '(function($) {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})(jQuery);\n';
                break;
            case 'js_mb':
                defaultSource = 'jQuery.noConflict();\n' +
                    '(function($) {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'mobile.app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})(jQuery);\n';
                break;
            case 'css_pc':
                defaultSource = '@charset "UTF-8";';
                break;
        }

        return defaultSource;
    }

    function _handleNewFileBtnClick() {
        if (app.modeifiedFile) {
            if (!_confirmDiscard()) {
                return;
            }
        }

        var fileName = window.prompt(i18n.msg_input_file_name);
        if (!fileName) {
            return;
        }

        fileName = _createNameForNewFile(fileName.trim());
        if (_isDuplicatedFileName(fileName)) {
            alert(i18n.msg_file_name_is_duplicated);
            return;
        }

        var newFileInfo = _addNewTempFile(fileName);
        _renderFilesDropdown(newFileInfo.file.fileKey);

        var defaultSource = _getDefaultSourceForNewFile();
        _setEditorContent(defaultSource);
        app.modeifiedFile = false;
    };

    function _getCustomizationPart(customization) {
        var customizationPart = [];
        switch (app.currentType) {
            case 'js_pc':
                customizationPart = customization.desktop.js;
                break;
            case 'js_mb':
                customizationPart = customization.mobile.js;
                break;
            case 'css_pc':
                customizationPart = customization.desktop.css;
                break;
        }

        return customizationPart;
    }

    function _createLibLinks(libInfo) {
        return libInfo[2].map(function (urlName) {
            return CDN_URL + libInfo[0] + '/' + libInfo[1] + '/' + urlName;
        });
    }

    function _createUpdatingLinks(customizationInfos) {
        var fileType = '';
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                fileType = '.js';
                break;
            case 'css_pc':
                fileType = '.css';
                break;
        }

        var selectedLibs = $librariesMultipleChoice.find('option:selected')
            .map(function (index, option) {
                var libName = option.textContent;
                return _createLibLinks(cdnLibsDetail[libName]);
            }).filter(function (index, url) {
                return url.indexOf(fileType) !== -1;
            }).toArray();

        var removingLibs = $(app.removingLibs).map(function (index, libName) {
            return _createLibLinks(cdnLibsDetail[libName]);
        }).toArray();

        customizationInfos.filter(function (item) {
            return item.type === 'URL';
        }).forEach(function (item) {
            if (selectedLibs.indexOf(item.url) === -1 && removingLibs.indexOf(item.url) === -1) {
                selectedLibs.push(item.url);
            }
        });

        var newCustomizationInfo = selectedLibs.map(function (libUrl) {
            return { type: 'URL', url: libUrl }
        });

        newCustomizationInfo = newCustomizationInfo.concat(customizationInfos.filter(function (item) {
            return item.type === 'FILE';
        }));

        return newCustomizationInfo;
    }

    function _createUpdatingFiles(customizationInfos, newFileKey) {
        if (app.currentFileKey === NO_FILE_KEY) {
            // Creating new file
            customizationInfos.push({
                file: { fileKey: newFileKey },
                type: 'FILE'
            });
        } else {
            // Updating old file
            customizationInfos.forEach(function (item, index) {
                if (item.type === 'FILE' && item.file.fileKey === app.currentFileKey) {
                    customizationInfos[index].file = { fileKey: newFileKey }
                    return false;
                }
            });
        }

        return customizationInfos;
    }

    function _createUpdatingContent(customization, newFileKey) {
        var customizationInfos = _getCustomizationPart(customization);
        customizationInfos = _createUpdatingFiles(customizationInfos, newFileKey);
        customizationInfos = _createUpdatingLinks(customizationInfos);

        return customizationInfos;
    }

    function _createUpdatingCustomization(customization, content) {
        var newCustomization = customization;
        switch (app.currentType) {
            case 'js_pc':
                newCustomization.desktop.js = content;
                break;
            case 'js_mb':
                newCustomization.mobile.js = content;
                break;
            case 'css_pc':
                newCustomization.desktop.css = content;
                break;
        }

        return newCustomization;
    }

    function _selectFile(fileName) {
        var fileKey = $filesDropdown.children().filter(function(index, $option) {
            return $($option).text().trim() === fileName;
        }).val();

        $filesDropdown.val(fileKey);
        app.currentFileKey = fileKey;
    }

    function _handleSubmitBtn(e) {
        // submit event
        e.preventDefault();

        spinner.spin();
        var fileName = $filesDropdown.find('option:selected').text();
        var selectingFileName = $filesDropdown.find('option:selected').text().trim();
        var newFileKey = '';
        service.uploadFile(fileName, editor.getValue()).then(function (file) {
            newFileKey = file.fileKey;

            return service.getCustomization();
        }).then(function (customization) {
            var content = _createUpdatingContent(customization, newFileKey);
            var newCustomization = _createUpdatingCustomization(customization, content);

            return service.updateCustomization(newCustomization);
        }).then(function (resp) {
            if (!$deployConfigCheckbox.prop('checked')) {
                return kintone.Promise.resolve();
            } else {
                return service.deployApp();
            }
        }).then(function () {
            return _refreshFilesDropdown();
        }).then(function () {
            _selectFile(selectingFileName);
            app.modeifiedFile = false;
            spinner.stop();
        }).catch(function (err) {
            spinner.stop();
        });
    }

    function _handleBackBtn(e) {
        // back event
        e.preventDefault();
        if (app.modeifiedFile) {
            if (!_confirmDiscard()) {
                return;
            }
        }
        history.back();
    };

    function _handleCancelBtn(e) {
        // discard event
        e.preventDefault();
        if (!_confirmDiscard()) {
            return;
        }
        spinner.spin();
        _refresh().then(function () {
            spinner.stop();
        });
    };

    $(function () {
        spinner.init();
        _renderUIWithLocalization();
        _initEditor();
        _renderLibrariesMultipleChoice();

        spinner.spin();
        _refresh().then(function () {
            spinner.stop();
        });

        $typeDropdown.change(_handelTypeDropdownChange);
        $filesDropdown.change(_handelFilesDropdownChange);
        $newFileBtn.click(_handleNewFileBtnClick);
        $librariesMultipleChoice.mousedown(_handleLibsMultipleChoiceMouseDown);

        links.render($linksContainer);

        $submitBtn.click(_handleSubmitBtn);
        $cancelBtn.click(_handleCancelBtn);
        $backBtn.click(_handleBackBtn);
    });

})(jQuery, kintone.$PLUGIN_ID);
