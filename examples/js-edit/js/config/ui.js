/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
/* global ace */
(function (PLUGIN_ID) {
    'use strict';
    var kuc = kintoneUIComponent;
    var ui = {};
    var lang = window.jsEditKintonePlugin.lang;
    var i18n = window.jsEditKintonePlugin.i18n;

    var kintoneCompletions = function () {
        var ret = [];
        var keywords = window.jsEditKintonePlugin.resource.kintoneCompletionsKeywords;
        for (var i = 0; i < keywords.length; i++) {
            ret.push({ value: keywords[i], score: 1000, meta: 'kintone' });
        }
        return ret;
    };

    var spinner = new kuc.Spinner();
    document.getElementsByTagName('body')[0].appendChild(spinner.render());

    ui.showSpinner = function () {
        spinner.show();
    }

    ui.hideSpinner = function () {
        spinner.hide();
    }

    ui.getMainContainerEl = function () {
        return document.getElementById('jsedit-config');
    }

    ui.createActionContainerEl = function () {
        return document.createElement('div');
    }

    ui.createSubmitContainerEl = function () {
        return document.createElement('div');
    }

    ui.createLibsLinksContainerEl = function () {
        return document.createElement('div');
    }

    ui.createNewFileButton = function () {
        var btn = new kuc.Button({ text: i18n.new_file, type: 'submit' });
        return btn;
    }

    ui.createSubmitButton = function () {
        var btn = new kuc.Button({ text: i18n.plugin_submit, type: 'submit' });
        return btn;
    }

    ui.createCancelButton = function () {
        var btn = new kuc.Button({ text: i18n.discard, type: 'normal' });
        return btn;
    }

    ui.createBackLinkEl = function () {
        var a = document.createElement('a');
        a.className = 'jsedit-back-link';
        a.href = '#';
        a.textContent = i18n.back;

        return a;
    }

    ui.createFilesDropdown =  function () {
        var dropdown = new kuc.Dropdown();
        return dropdown;
    }

    ui.createTypeDropdown = function () {
        var dropdown = new kuc.Dropdown({
            items: [
                {
                    label: i18n.js_for_pc,
                    value: 'js_pc',
                },
                {
                    label: i18n.js_for_mobile,
                    value: 'js_mb',
                },
                {
                    label: i18n.css_for_pc,
                    value: 'css_pc',
                }
            ],
            value: 'js_pc'
        });
        return dropdown;
    }

    ui.createMultipleChoice = function () {
        var muiltpleChoice = new kuc.MultipleChoice({ isDisabled: false });
        return muiltpleChoice;
    }

    ui.createLibsContainerEl = function () {
        var libsContainerEl = document.createElement('div');
        libsContainerEl.className = 'jsedit-item-flex ';

        var libsTitle = new kuc.Label({ text: i18n.libraries });
        libsContainerEl.appendChild(libsTitle.render());

        return libsContainerEl;
    }

    ui.createLinksEl = function () {
        var linksContainerEl = document.createElement('div');
        linksContainerEl.className = 'jsedit-item-flex ';

        var linksTitle = new kuc.Label({ text: i18n.links });
        linksContainerEl.appendChild(linksTitle.render());

        var links = window.jsEditKintonePlugin.resource.links[lang];
        links.forEach(function (li) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = li.url;
            a.textContent = li.label;

            var p = document.createElement('p');
            p.appendChild(a);

            linksContainerEl.appendChild(p);
        });

        return linksContainerEl;
    }

    ui.createSaveOptionsEl = function () {
        var containerEl = document.createElement('div');

        var title = new kuc.Label({ text: i18n.save_options });
        containerEl.appendChild(title.render());

        return containerEl;
    }

    ui.createDeployConfigCheckbox = function () {
        var checkbox = new kuc.CheckBox({
            items: [{ label: i18n.apply_to_production, value: 'yes' }],
            value: ['yes']
        });
        return checkbox;
    }

    ui.createEditor = function () {
        var editorEl = document.createElement('div');
        editorEl.className = 'jsedit-editor';

        var editorWraperEl = document.createElement('div');
        editorWraperEl.className = 'jsedit-editor-wrapper';
        editorWraperEl.appendChild(editorEl);

        var editor = ace.edit(editorEl);
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

        return {
            'editor': editor,
            on: function (event, callback) {
                editor.on(event, callback);
            },
            getContainerEl: function () {
                return editorWraperEl;
            },
            disable: function() {
                var el = editor.container;
                el.classList.add('disabled');
                editor.setOptions({ readOnly: true });
            },
            enable: function() {
                var el = editor.container;
                el.classList.remove('disabled');
                editor.setOptions({ readOnly: false });
            }
        }
    }

    window.jsEditKintonePlugin.ui = ui;
})(kintone.$PLUGIN_ID);
