/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
/* global ace */
((PLUGIN_ID) => {
  'use strict';
  const kuc = kintoneUIComponent;
  const ui = {};
  const lang = window.jsEditKintonePlugin.lang;
  const i18n = window.jsEditKintonePlugin.i18n;

  const kintoneCompletions = () => {
    const ret = [];
    const keywords = window.jsEditKintonePlugin.resource.kintoneCompletionsKeywords;
    for (let i = 0; i < keywords.length; i++) {
      ret.push({value: keywords[i], score: 1000, meta: 'kintone'});
    }
    return ret;
  };

  const spinner = new kuc.Spinner();
  document.getElementsByTagName('body')[0].appendChild(spinner.render());

  ui.showSpinner = () => {
    spinner.show();
  };

  ui.hideSpinner = () => {
    spinner.hide();
  };

  ui.getMainContainerEl = () => {
    return document.getElementById('jsedit-config');
  };

  ui.createActionContainerEl = () => {
    return document.createElement('div');
  };

  ui.createSubmitContainerEl = () => {
    return document.createElement('div');
  };

  ui.createLibsLinksContainerEl = () => {
    return document.createElement('div');
  };

  ui.createNewFileButton = () => {
    const btn = new kuc.Button({text: i18n.new_file, type: 'submit'});
    return btn;
  };

  ui.createSubmitButton = () => {
    const btn = new kuc.Button({text: i18n.plugin_submit, type: 'submit'});
    return btn;
  };

  ui.createCancelButton = () => {
    const btn = new kuc.Button({text: i18n.discard, type: 'normal'});
    return btn;
  };

  ui.createBackLinkEl = () => {
    const a = document.createElement('a');
    a.className = 'jsedit-back-link';
    a.href = '#';
    a.textContent = i18n.back;

    return a;
  };

  ui.createFilesDropdown = () => {
    const dropdown = new kuc.Dropdown();
    return dropdown;
  };

  ui.createTypeDropdown = () => {
    const dropdown = new kuc.Dropdown({
      items: [
        {
          label: i18n.js_pc,
          value: 'js_pc',
        },
        {
          label: i18n.js_mb,
          value: 'js_mb',
        },
        {
          label: i18n.css_pc,
          value: 'css_pc',
        }
      ],
      value: 'js_pc'
    });
    return dropdown;
  };

  ui.createMultipleChoice = () => {
    const muiltpleChoice = new kuc.MultipleChoice({isDisabled: false});
    return muiltpleChoice;
  };

  ui.createLibsContainerEl = () => {
    const libsContainerEl = document.createElement('div');
    libsContainerEl.className = 'jsedit-item-flex jsedit-libraries ';

    const libsTitle = new kuc.Label({text: i18n.libraries});
    libsContainerEl.appendChild(libsTitle.render());

    return libsContainerEl;
  };

  ui.createLinksEl = () => {
    const linksContainerEl = document.createElement('div');
    linksContainerEl.className = 'jsedit-item-flex ';

    const linksTitle = new kuc.Label({text: i18n.links});
    linksContainerEl.appendChild(linksTitle.render());

    const links = window.jsEditKintonePlugin.resource.links[lang];
    links.forEach((li) => {
      const a = document.createElement('a');
      a.target = '_blank';
      a.href = li.url;
      a.textContent = li.label;

      const p = document.createElement('p');
      p.appendChild(a);

      linksContainerEl.appendChild(p);
    });

    return linksContainerEl;
  };

  ui.createSaveOptionsEl = () => {
    const containerEl = document.createElement('div');

    const title = new kuc.Label({text: i18n.save_options});
    containerEl.appendChild(title.render());

    return containerEl;
  };

  ui.createDeployConfigCheckbox = () => {
    const checkbox = new kuc.CheckBox({
      items: [{label: i18n.apply_to_production, value: 'yes'}],
      value: ['yes']
    });
    return checkbox;
  };

  ui.createEditor = () => {
    const editorEl = document.createElement('div');
    editorEl.className = 'jsedit-editor';

    const editorWraperEl = document.createElement('div');
    editorWraperEl.className = 'jsedit-editor-wrapper';
    editorWraperEl.appendChild(editorEl);

    const editor = ace.edit(editorEl);
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
    const completions = kintoneCompletions();
    editor.completers.push({
      getCompletions: (compEditor, session, pos, prefix, callback) => {
        callback(null, completions);
      }
    });

    return {
      'editor': editor,
      on: (event, callback) => {
        editor.on(event, callback);
      },
      getContainerEl: () => {
        return editorWraperEl;
      },
      disable: () => {
        const el = editor.container;
        el.classList.add('disabled');
        editor.setOptions({readOnly: true});
      },
      enable: () => {
        const el = editor.container;
        el.classList.remove('disabled');
        editor.setOptions({readOnly: false});
      }
    };
  };

  ui.renderLibsContainerEl = function(multipleChoiceEl) {
    const newLibsContainerEl = this.createLibsContainerEl();
    const mainContainerEl = this.getMainContainerEl();
    const libsContainerEl = mainContainerEl.querySelector('.jsedit-libraries');

    while (libsContainerEl.firstChild) libsContainerEl.removeChild(libsContainerEl.firstChild);

    libsContainerEl.appendChild(newLibsContainerEl.firstChild);
    libsContainerEl.appendChild(multipleChoiceEl);

  };

  window.jsEditKintonePlugin.ui = ui;
})(kintone.$PLUGIN_ID);
