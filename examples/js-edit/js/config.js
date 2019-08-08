/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
/* global ace */
jQuery.noConflict();

(function($, PLUGIN_ID) {
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
            cdn_url: 'https://js.kintone.com/'
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
            cdn_url: 'https://js.cybozu.com/'
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
            cdn_url: 'https://js.cybozu.cn/'
        }
    };
    var lang = kintone.getLoginUser().language;
    if (!localization[lang]) {
        lang = 'en';
    }
    var i18n = localization[lang];

    var CDN_URL = i18n.cdn_url;

    var spinner = {
        template: '<div class="spinner-backdrop"></div>',
        hasInit: false,
        spinner: null,
        $container: null,
        init: function() {
            if (this.hasInit) {
                return;
            }

            this.$container = $(this.template).hide();
            $('body').append(this.$container);
            this.spinner = new Spinner();
            this.hasInit = true;
        },
        spin: function() {
            this.spinner.spin(this.$container.get(0));
            this.$container.show();
        },
        stop: function() {
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
        render: function($container) {
            this[lang].forEach(function(li) {
                $container.append($('<p><a target="_blank" href="' + li.url + '">' + li.label + '</a></p>'));
            });
        }
    };

    var kintoneCompletions = function() {
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

    var service = {
        uploadFile: function(fileName, fileValue) {
            return new kintone.Promise(function(resolve, reject) {
                var blob = new Blob([fileValue], { type: 'text/javascript' });
                var formData = new FormData();
                formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
                formData.append('file', blob, fileName);
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(function(data) {
                    resolve(data);
                }).fail(function(err) {
                    reject(err);
                });
            });
        },
        getFile: function(fileKey) {
            return new kintone.Promise(function(resolve, reject) {
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'GET',
                    dataType: 'text',
                    data: { 'fileKey': fileKey }
                }).done(function(data, status, xhr) {
                    resolve(data);
                }).fail(function(xhr, status, error) {
                    alert(i18n.msg_failed_to_get_file);
                    reject();
                });
            });
        },
        getCustomization: function() {
            var params = { app: kintone.app.getId() };
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', params);
        },
        updateCustomization: function(data) {
            data.app = kintone.app.getId();
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'PUT', data);
        },
        deployApp: function() {
            var params = { apps: [{ app: kintone.app.getId() }] };
            return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', params);
        }
    };

    function renderUIWithLocalization() {
        $('[data-i18n]').each(function(elm) {
            var $elm = $(this);
            var name = $elm.attr('data-i18n');
            $elm.text(i18n[name]);
        });
    }

    function getLibsInfo() {
        var infos = { jsLibs: [], cssLibs: [] };
        Object.keys(cdnLibsDetail).forEach(function(libName) {
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

    function renderLibrariesMultipleChoice() {
        var infos = getLibsInfo();
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
        libs.forEach(function(lib) {
            $('<option></option>').text(lib.name + '(' + lib.version + ')')
                .val(lib.key)
                .data('lib-name', lib.name)
                .appendTo($librariesMultipleChoice);
        });
    }

    function initEditor() {
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
            getCompletions: function(compEditor, session, pos, prefix, callback) {
                callback(null, completions);
            }
        });
        editor.on('change', function() {
            app.modeifiedFile = true;
        });
    }

    function getCustomizationPart(customization) {
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

    function getCustomizationInfo(customization) {
        app.customization.desktop = $.extend(true, {}, customization.desktop);
        app.customization.mobile = $.extend(true, {}, customization.mobile);
    }

    function getCustomizationFiles() {
        var customizationInfo = getCustomizationPart(app.customization);
        return customizationInfo.filter(function(item) {
            return item.type === 'FILE';
        }).map(function(item) {
            return { fileKey: item.file.fileKey, name: item.file.name };
        });
    }

    function getCustomizationLinks() {
        var customizationInfo = getCustomizationPart(app.customization);
        return customizationInfo.filter(function(item) {
            return item.type === 'URL';
        }).map(function(item) {
            return item.url;
        });
    }

    function renderFilesDropdown(defaultValue) {
        $filesDropdown.empty();
        var files = getCustomizationFiles();
        files.forEach(function(file) {
            $('<option></option>').text(file.name)
                .val(file.fileKey)
                .data('file-name', file.name)
                .appendTo($filesDropdown);
        });

        if (typeof defaultValue !== 'undefined') {
            $filesDropdown.val(defaultValue);
        }

        app.currentFileKey = $filesDropdown.val();
    }

    function setEditorContent(value) {
        var editorValue = value ? value : '';
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                editor.getSession().setMode('ace/mode/javascript');
                break;
            case 'css_pc':
                editor.getSession().setMode('ace/mode/css');
                break;
        }

        editor.setValue(editorValue);
        editor.selection.moveCursorToPosition({ row: 1, column: 0 });
        editor.selection.selectLine();
        app.modeifiedFile = false;
    }

    function setUsedLibsMultipleChoice() {
        var libLinks = getCustomizationLinks();
        var usedLibs = libLinks.map(function(link) {
            return link.split('/')[3];
        });

        $librariesMultipleChoice.val(usedLibs);
    }

    function refreshFilesDropdown() {
        return service.getCustomization().then(function(customization) {
            getCustomizationInfo(customization);
            renderFilesDropdown();

            return kintone.Promise.resolve();
        });
    }

    function refresh() {
        return refreshFilesDropdown().then(function() {
            setUsedLibsMultipleChoice();

            if (app.currentFileKey === null) {
                return kintone.Promise.resolve(null);
            }

            return service.getFile(app.currentFileKey);
        }).then(function(fileData) {
            setEditorContent(fileData);
        });
    }

    function createNameForNewFile(name) {
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

    function isDuplicatedFileName(fileName) {
        var checkFiles = getCustomizationFiles();
        var dupplicatedFiles = checkFiles.filter(function(item) {
            return item.name === fileName;
        });

        if (dupplicatedFiles.length > 0) {
            return true;
        }

        return false;
    }

    function addNewTempFile(fileName) {
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

    function getDefaultSourceForNewFile() {
        var defaultSource;
        switch (app.currentType) {
            case 'js_pc':
                defaultSource = '(function() {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})();\n';
                break;
            case 'js_mb':
                defaultSource = '(function($) {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'mobile.app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})();\n';
                break;
            case 'css_pc':
                defaultSource = '@charset "UTF-8";';
                break;
        }

        return defaultSource;
    }

    function createLibLinks(libInfo) {
        return libInfo[2].map(function(urlName) {
            return CDN_URL + libInfo[0] + '/' + libInfo[1] + '/' + urlName;
        });
    }

    function createUpdatingLinks(customizationInfos) {
        var fileTypeRegex = '';
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                fileTypeRegex = /.js$/;
                break;
            case 'css_pc':
                fileTypeRegex = /.css$/;
                break;
        }

        var selectedLibs = $librariesMultipleChoice.find('option:selected')
            .map(function(index, option) {
                var libName = $(option).data('lib-name');
                return createLibLinks(cdnLibsDetail[libName]);
            }).filter(function(index, url) {
                return url.match(fileTypeRegex) !== null;
            }).toArray();

        var removingLibs = $(app.removingLibs).map(function(index, libName) {
            return createLibLinks(cdnLibsDetail[libName]);
        }).toArray();

        customizationInfos.filter(function(item) {
            return item.type === 'URL';
        }).forEach(function(item) {
            if (selectedLibs.indexOf(item.url) === -1 && removingLibs.indexOf(item.url) === -1) {
                selectedLibs.push(item.url);
            }
        });

        var newCustomizationInfo = selectedLibs.map(function(libUrl) {
            return { type: 'URL', url: libUrl };
        });

        newCustomizationInfo = newCustomizationInfo.concat(customizationInfos.filter(function(item) {
            return item.type === 'FILE';
        }));

        return newCustomizationInfo;
    }

    function createUpdatingFiles(customizationInfos, newFileKey) {
        if (app.currentFileKey === NO_FILE_KEY) {
            // Creating new file
            customizationInfos.push({
                file: { fileKey: newFileKey },
                type: 'FILE'
            });
        } else {
            // Updating old file
            customizationInfos.forEach(function(item, index) {
                if (item.type === 'FILE' && item.file.fileKey === app.currentFileKey) {
                    customizationInfos[index].file = { fileKey: newFileKey };
                    return false;
                }
            });
        }

        return customizationInfos;
    }

    function createUpdatingContent(customization, newFileKey) {
        var customizationInfos = getCustomizationPart(customization);
        customizationInfos = createUpdatingFiles(customizationInfos, newFileKey);
        customizationInfos = createUpdatingLinks(customizationInfos);

        return customizationInfos;
    }

    function createUpdatingCustomization(customization, content) {
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

    function selectFile(fileName) {
        var fileKey = $filesDropdown.children().filter(function(index, $option) {
            return $($option).data('file-name') === fileName;
        }).val();

        $filesDropdown.val(fileKey);
        app.currentFileKey = fileKey;
    }

    function disabledEditor() {
        var el = editor.container;
        el.classList.add('disabled');
        editor.setOptions({ readOnly: true });
    }

    function enabledEditor() {
        var el = editor.container;
        el.classList.remove('disabled');
        editor.setOptions({ readOnly: false });
    }

    function disabledSubmitBtn() {
        $submitBtn.removeClass('kintoneplugin-button-dialog-ok')
            .addClass('kintoneplugin-button-disabled')
            .prop('disabled', true);
    }

    function enabledSubmitBtn() {
        $submitBtn.removeClass('kintoneplugin-button-disabled')
            .addClass('kintoneplugin-button-dialog-ok')
            .prop('disabled', false);
    }

    function disabledCancelBtn() {
        $cancelBtn.removeClass('kintoneplugin-button-dialog-cancel')
            .addClass('kintoneplugin-button-disabled')
            .prop('disabled', true);
    }

    function enabledCancelBtn() {
        $cancelBtn.removeClass('kintoneplugin-button-disabled')
            .addClass('kintoneplugin-button-dialog-cancel')
            .prop('disabled', false);
    }

    function makeComponentDisabled() {
        disabledEditor();
        disabledSubmitBtn();
        disabledCancelBtn();
    }

    function makeComponentEnabled() {
        enabledEditor();
        enabledSubmitBtn();
        enabledCancelBtn();
    }

    function confirmDiscard() {
        return (window.confirm(i18n.msg_discard));
    }

    function handelTypeDropdownChange() {
        if (app.modeifiedFile && !confirmDiscard()) {
            $(this).val($.data(this, 'current'));
            return false;
        }

        app.currentType = $typeDropdown.val();
        spinner.spin();
        refresh().then(function() {
            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }

            app.modeifiedFile = false;
            spinner.stop();
        });
    }

    function handelFilesDropdownChange() {
        if (app.modeifiedFile && !confirmDiscard()) {
            $filesDropdown.val(app.currentFileKey);
            return;
        }

        app.currentFileKey = $filesDropdown.val();

        spinner.spin();
        service.getFile(app.currentFileKey).then(function(fileData) {
            setEditorContent(fileData);
            spinner.stop();
        });

        $filesDropdown.find('option[value="' + NO_FILE_KEY + '"]').remove();

        app.modeifiedFile = false;
    }

    function handleNewFileBtnClick() {
        if (app.modeifiedFile && !confirmDiscard()) {
            return;
        }

        refreshFilesDropdown().then(function() {
            var fileName = window.prompt(i18n.msg_input_file_name);
            if (!fileName) {
                return;
            }

            fileName = createNameForNewFile(fileName.trim());
            if (isDuplicatedFileName(fileName)) {
                alert(i18n.msg_file_name_is_duplicated);
                return;
            }

            var newFileInfo = addNewTempFile(fileName);
            renderFilesDropdown(newFileInfo.file.fileKey);

            var defaultSource = getDefaultSourceForNewFile();
            setEditorContent(defaultSource);
            app.modeifiedFile = true;

            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }
        });
    }

    function handleLibsMultipleChoiceMouseDown(e) {
        e.preventDefault();

        e.target.selected = !e.target.selected;
        if (e.target.selected) {
            app.removingLibs = app.removingLibs.filter(function(item) {
                return item !== $(e.target).data('lib-name');
            });
        } else {
            app.removingLibs.push($(e.target).data('lib-name'));
        }

        var scroll = $librariesMultipleChoice.scrollTop();
        setTimeout(function() { $librariesMultipleChoice.scrollTop(scroll); }, 0);
        $librariesMultipleChoice.focus();
    }

    function handleSubmitBtn(e) {
        // submit event
        e.preventDefault();

        spinner.spin();
        var fileName = $filesDropdown.find('option:selected').data('file-name');
        var selectingFileName = $filesDropdown.find('option:selected').data('file-name');
        var newFileKey = '';
        service.uploadFile(fileName, editor.getValue()).then(function(file) {
            newFileKey = file.fileKey;

            return service.getCustomization();
        }).then(function(customization) {
            var content = createUpdatingContent(customization, newFileKey);
            var newCustomization = createUpdatingCustomization(customization, content);

            return service.updateCustomization(newCustomization).catch(function() {
                alert(i18n.msg_failed_to_update);
                spinner.stop();
            });
        }).then(function(resp) {
            if (!$deployConfigCheckbox.prop('checked')) {
                return kintone.Promise.resolve();
            }

            return service.deployApp();
        }).then(function() {
            return refreshFilesDropdown();
        }).then(function() {
            selectFile(selectingFileName);
            app.modeifiedFile = false;
            spinner.stop();
        }).catch(function(err) {
            spinner.stop();
        });
    }

    function handleBackBtn(e) {
        // back event
        e.preventDefault();
        if (app.modeifiedFile && !confirmDiscard()) {
            return;
        }
        history.back();
    }

    function handleCancelBtn(e) {
        // discard event
        e.preventDefault();
        if (!confirmDiscard()) {
            return;
        }
        spinner.spin();
        refresh().then(function() {
            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }
            spinner.stop();
        });
    }

    $(function() {
        spinner.init();
        renderUIWithLocalization();
        initEditor();
        renderLibrariesMultipleChoice();

        spinner.spin();
        refresh().then(function() {
            $typeDropdown.change(handelTypeDropdownChange);
            $filesDropdown.change(handelFilesDropdownChange);
            $newFileBtn.click(handleNewFileBtnClick);
            $librariesMultipleChoice.mousedown(handleLibsMultipleChoiceMouseDown);

            links.render($linksContainer);

            $submitBtn.click(handleSubmitBtn);
            $cancelBtn.click(handleCancelBtn);
            $backBtn.click(handleBackBtn);

            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }

            spinner.stop();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
