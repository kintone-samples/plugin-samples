/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

(function(PLUGIN_ID) {
    function createNameSpace() {
        var jsEditKintonePlugin = {
            resource: {},
            service: {},
            ui: {},
            defaultSource: {
                js_pc: '(function() {\n' +
                '  \'use strict\';\n' +
                '  kintone.events.on(\'app.record.index.show\', function(event) {\n' +
                '  });\n' +
                '})();\n',
                js_mb: '(function() {\n' +
                '  \'use strict\';\n' +
                '  kintone.events.on(\'mobile.app.record.index.show\', function(event) {\n' +
                '  });\n' +
                '})();\n',
                css_pc: '@charset "UTF-8";'
            },
            lang: null,
            i18n: null
        };

        window.jsEditKintonePlugin = jsEditKintonePlugin;
    }
    createNameSpace();

    jsEditKintonePlugin.resource = {
        localization: {
            en: {
                js_pc: 'JavaScript Files for PC',
                js_mb: 'JavaScript Files for Mobile',
                css_pc: 'CSS Files for PC',
                new_file: 'New File',
                discard: 'Discard',
                back: 'Back to Plug-ins',
                libraries: 'Libraries',
                save_options: 'Save Options',
                apply_to_production: 'Update app when saving the code',
                links: 'Links',
                plugin_submit: 'Save',
                plugin_cancel: 'Cancel',
                required_field: 'Required field is empty.',
                msg_discard: 'Your changes will be discarded. Are you sure you want to continue?',
                msg_failed_to_get_file: 'Failed to retrieve files!',
                msg_failed_to_update: 'Failed to update!',
                msg_max_customizations_limit: 'The file was not saved because no more than <LIMIT_NUMBER> files can be saved for the <CUSTOMIZATION_TYPE> settings.',
                msg_max_file_name_length_limit: 'The max file name length is 255 characters',
                msg_file_name_includ_special_character: 'The file name must not include \/:?*|"<>',
                msg_file_name_is_duplicated: 'This file name is duplicated. Please set a unique file name.',
                msg_input_file_name: 'Input file name',
                cdn_url: 'https://js.kintone.com/'
            },
            ja: {
                js_pc: 'PC用のJavaScriptファイル',
                js_mb: 'スマートフォン用のJavaScriptファイル',
                css_pc: 'PC用のCSSファイル',
                new_file: '新規作成',
                discard: '破棄',
                back: 'プラグインへ戻る',
                libraries: 'ライブラリ',
                save_options: 'オプション',
                apply_to_production: '運用環境に反映する',
                links: 'リンク',
                plugin_submit: '保存',
                plugin_cancel: 'キャンセル',
                required_field: '必須項目を入力してください。',
                msg_discard: '変更は破棄されます。よろしいですか？',
                msg_failed_to_get_file: 'ファイルの取得に失敗しました。',
                msg_failed_to_update: '更新に失敗しました。',
                msg_max_customizations_limit: 'ファイルの保存に失敗しました。<CUSTOMIZATION_TYPE>の設定に保存出来るファイルは<LIMIT_NUMBER>個までです。',
                msg_max_file_name_length_limit: 'ファイル名の入力制限は255文字となります。',
                msg_file_name_includ_special_character: 'ファイル名は必ず \/:?*|"<>のような文字が含まないです。',
                msg_file_name_is_duplicated: 'ファイル名が重複しています。重複のないように設定してください。',
                msg_input_file_name: 'ファイル名を入力してください。',
                cdn_url: 'https://js.cybozu.com/'
            },
            zh: {
                js_pc: 'JavaScript Files for PC',
                js_mb: 'JavaScript Files for Mobile',
                css_pc: 'CSS Files for PC',
                new_file: 'New File',
                discard: '   Discard   ',
                back: 'Back to Plug-ins',
                libraries: 'Libraries',
                save_options: 'Save Options',
                apply_to_production: 'Update app when saving the code',
                links: 'Links',
                plugin_submit: 'Save',
                plugin_cancel: 'Cancel',
                required_field: 'Required field is empty.',
                msg_discard: 'Your changes will be discarded. Are you sure you want to continue?',
                msg_failed_to_get_file: 'Failed to retrieve files!',
                msg_failed_to_update: 'Failed to update!',
                msg_max_customizations_limit: 'The file was not saved because no more than <LIMIT_NUMBER> files can be saved for the <CUSTOMIZATION_TYPE> settings.',
                msg_max_file_name_length_limit: 'The max file name length is 255 characters',
                msg_file_name_includ_special_character: 'The file name must not include \/:?*|"<>',
                msg_file_name_is_duplicated: 'This file name is duplicated. Please set a unique file name.',
                msg_input_file_name: 'Input file name',
                cdn_url: 'https://js.cybozu.cn/'
            }
        },
        links: {
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
            ]
        },
        kintoneCompletionsKeywords: [
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
        ],
        cdnLibsDetail: {
            jquery: ['jQuery', '2.2.4', ['jquery.min.js']],
            jqueryui: ['jQuery UI', '1.12.0', ['jquery-ui.min.js', 'themes/smoothness/jquery-ui.css']],
            momentjs: ['Moment.js', '2.15.1', ['moment.min.js', 'moment-with-locales.min.js']],
            ace: ['Ace', 'v1.2.5', ['ace.js']],
            angularjs: ['AngularJS', 'v1.5.8', ['angular.min.js']],
            chartjs: ['Chart.JS', 'v2.2.2', ['Chart.min.js']],
            datatables: ['DataTables', 'v1.10.12', ['js/jquery.dataTables.min.js', 'css/jquery.dataTables.min.css']],
            dompurify: ['DomPurify', '0.8.3', ['purify.min.js']],
            'font-awesome': ['FontAwesome', 'v4.6.3', ['css/font-awesome.min.css']],
            fullcalendar: ['FullCalendar', 'v3.0.1',
                ['fullcalendar.min.js', 'fullcalendar.min.css', 'fullcalendar.print.css']],
            handsontable: ['Handsontable', '0.28.3', ['handsontable.full.min.js', 'handsontable.full.min.css']],
            highlightjs: ['highlightjs', '9.7.0', ['highlight.js', 'styles/default.css']],
            jqgrid: ['jqGrid', 'v5.1.1',
                ['js/jquery.jqGrid.min.js', 'js/i18n/grid.locale-ja.js', 'js/i18n/grid.locale-en.js',
                    'js/i18n/grid.locale-cn.js', 'css/ui.jqgrid.css']],
            jquerygantt: ['jQuery.Gantt', '20140623', ['jquery.fn.gantt.min.js', 'css/style.css']],
            jsrender: ['JSRender', '0.9.80', ['jsrender.min.js']],
            jstree: ['jsTree', '3.3.2', ['jstree.min.js', 'themes/default/style.min.css']],
            jszip: ['JSZip', 'v3.1.2', ['jszip.min.js']],
            markedjs: ['Marked.js', 'v0.3.6', ['marked.min.js']],
            openlayers: ['OpenLayers', 'v3.18.2', ['ol.js', 'ol.css']],
            popmodal: ['popModal', '1.23', ['popModal.min.js', 'popModal.min.css']],
            spinjs: ['Spin.js', '2.3.2', ['spin.min.js']],
            sweetalert: ['SweetAlert', 'v1.1.3', ['sweetalert.min.js', 'sweetalert.css']],
            ultradatejs: ['UltraDate.js', 'v2.2.1', ['UltraDate.min.js', 'UltraDate.ja.min.js']],
            underscore: ['Underscore.js', '1.8.3', ['underscore-min.js']],
            vuejs: ['Vue.js', 'v1.0.28', ['vue.min.js']]
        }
    }

    function initI18n() {
        var localization = jsEditKintonePlugin.resource.localization;
        jsEditKintonePlugin.lang = kintone.getLoginUser().language;
        jsEditKintonePlugin.i18n = localization[jsEditKintonePlugin.lang] ? localization[jsEditKintonePlugin.lang] : localization['en'];
    }
    initI18n();
    
})(kintone.$PLUGIN_ID);
