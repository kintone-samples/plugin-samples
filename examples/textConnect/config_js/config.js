/*
 * textConnect Plug-in
 * Copyright (c) 2025 Cybozu
 *
 * Licensed under the MIT License
 // */
((PLUGIN_ID) => {
  'use strict';

  // To switch the language used for instructions based on the user's launguage setting
  const terms = {
    'en': {
      connectTitle: 'Fields to Connect',
      connectDescription: 'Please select the fields to connect. (5 fields max)',
      delimiterTitle: 'Delimiter',
      delimiterDescription: 'Please specify the delimiter used between connected values. If not specified, values will be connected without delimiters.',
      errorMessage: '"Fields to display the connected result" is a required setting. Please select the output fields where the connected results will be inserted.',
      resultTitle: 'Fields to display the connected result',
      resultDescription: 'Please select the fields to display the connected result.',
      saveButton: 'Save',
      cancelButton: 'Cancel',
      checkFieldTitle: 'Field validation when saving a record',
      checkFieldDescription: 'Prompt if one or more combined fields are empty'
    },
    'ja': {
      connectTitle: '結合する項目',
      connectDescription: '結合する項目を選択してください。（最大5つまで）',
      delimiterTitle: '項目間の記号',
      delimiterDescription: '結合される項目の間に表示される記号を入力してください。未選択の場合、各項目が直接結合されます。',
      errorMessage: '「結合された文字列を表示する項目」は必須です。',
      resultTitle: '結合された文字列を表示する項目',
      resultDescription: '結合された文字列を表示する項目を選択してください。',
      saveButton: '保存する',
      cancelButton: 'キャンセル',
      checkFieldTitle: '保存時の入力値チェック',
      checkFieldDescription: '結合するフィールドに値が入っていない場合、アラートで注意を表示する'
    },
    'zh': {
      connectTitle: '要结合的字段',
      connectDescription: '请选择需要结合的字段。（最多5个）',
      delimiterTitle: '连接各字段的符号',
      delimiterDescription: '请输入各字段之间的连接符号。如未输入，各字段直接结合。',
      errorMessage: '“用于显示结合后字符的字段”为必填项。',
      resultTitle: '用于显示结合后字符的字段',
      resultDescription: '请选择一个字段用于显示结合后的字符。',
      saveButton: '保存',
      cancelButton: '取消',
      checkFieldTitle: '保存时输入内容的检查',
      checkFieldDescription: '如要结合的字段中有字段的值为空，提示警告'
    }
  };
  const lang = kintone.getLoginUser().language;
  const i18n = (lang in terms) ? terms[lang] : terms.en;

  // set the pluginID
  const CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

  const decodeSpace = (htmlstr) => {
    return htmlstr.replace(/&nbsp;/g, ' ').replace(/&emsp;/g, '　');
  };

  const setDefault = () => {
    if (Object.keys(CONF).length > 0) {
      for (let i = 1; i <= 15; i++) {
        const sel = document.getElementById(`select${i}`);
        sel.value = CONF[`select${i}`];
      }
      // get the previous plugin setting
      if (Object.prototype.hasOwnProperty.call(CONF, 'line_number')) {
        const cf1 = document.getElementById('copyfield1');
        cf1.value=CONF.copyfield; 
        if (CONF.copyfield !== '') {
          const bw1 = document.getElementById('between1');
          bw1.value = decodeSpace(CONF.between);
        } else {
          const bw1 = document.getElementById('between1');
          bw1.value = CONF.between;
        }
      } else {
        // get the previous plugin setting
        for (let i = 1; i <= 3; i++) {
          const cf = document.getElementById(`copyfield${i}`);
          cf.value = CONF[`copyfield${i}`];
        }
        for (let i = 1; i <= 3; i++) {
          if (CONF[`copyfield${i}`] !== '') {
            const bw = document.getElementById(`between${i}`);
            bw.value = decodeSpace(ConF[`between${i}`])
          
          } else {
            const bw = document.getElementById(`between${i}`);
            bw.value = (ConF[`between${i}`])
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(CONF, 'checkField') && CONF.checkField === 'uncheck') {
        const chkf = document.getElementById('checkField');
        chkf.checked=false;
      }
    }
  };

  const escapeHtml = (htmlstr) => {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  const encodeSpace = (htmlstr1) => {
    return htmlstr1.replace(/\u0020/g, '&nbsp;').replace(/\u3000/g, '&emsp;');
  };

const setDropdown = () => {
  const url = kintone.api.url('/k/v1/preview/app/form/fields', true);
  kintone.api(url, 'GET', { app: kintone.app.getId() }, (resp) => {
    // 1) テンプレ挿入（{{terms.xxx}} を i18n で置換）
    const root = document.getElementById('cf-plugin');
    if (!root) return;

    const tmplEl = document.getElementById('cf-plugin'); // そのまま内側を書き換える前提
    const raw = tmplEl.innerHTML; // もとの HTML をテンプレとして使う
    const html = raw.replace(/\{\{\s*html:terms\.(\w+)\s*\}\}/g, (_, key) => (i18n[key] ?? ''));
    root.innerHTML = html;

    // 2) <option> を追加
    // 共通の append 関数
    const appendOption = (selectEl, code, label) => {
      if (!selectEl) return;
      const opt = document.createElement('option');
      opt.value = escapeHtml(code);
      opt.textContent = escapeHtml(label);
      selectEl.appendChild(opt);
    };

    // 文字列系: select1..15 と copyfield1..3 に追加
    const addToAllTextish = (prop) => {
      for (let i = 1; i <= 15; i++) {
        appendOption(document.getElementById(`select${i}`), prop.code, prop.label);
      }
      for (let i =1; i <=3; i++) {
        appendOption(document.getElementById(`copyfield${i}`), prop.code, prop.label);
      }
    };

    // リッチテキストは copyfield 側のみ
    const addToCopyOnly = (prop) => {
      for (let i =1; i <=3; i++) {
        appendOption(document.getElementById(`copyfield${i}`), prop.code, prop.label);
      }
    };

    // 文字列以外の “結合元” 候補: select1..15 のみ
    const addToSelectOnly = (prop) => {
      for (let i = 1; i <= 15; i++) {
        appendOption(document.getElementById(`select${i}`), prop.code, prop.label);
      }
    };

    // ループ
    for (const key in resp.properties) {
      if (!Object.prototype.hasOwnProperty.call(resp.properties, key)) continue;
      const prop = resp.properties[key];
      switch (prop.type) {
        case 'SINGLE_LINE_TEXT':
        case 'MULTI_LINE_TEXT':
          addToAllTextish(prop);
          break;
        case 'RICH_TEXT':
          addToCopyOnly(prop);
          break;
        case 'DATETIME':
        case 'NUMBER':
        case 'RADIO_BUTTON':
        case 'CHECK_BOX':
        case 'MULTI_SELECT':
        case 'DROP_DOWN':
        case 'DATE':
        case 'TIME':
        case 'LINK':
        case 'USER_SELECT':
        case 'ORGANIZATION_SELECT':
        case 'GROUP_SELECT':
          addToSelectOnly(prop);
          break;
        default:
          break;
      }
    }

    // 3) イベントと既存値の復元
    appendEvents();
    setDefault();
  });
};

  const showError = () => {
    return Swal.fire({
      title: 'Error!',
      text: i18n.errorMessage,
      icon: 'error',
    });
  };

  const checkValues = () => {
    // Check the required values
    for (let i = 1; i < 16; i++) {
      const group = Math.ceil(i / 5);
      const sel = document.getElementById(`select${i}`);
      const out = document.getElementById(`copyfield${group}`);
      if (sel && out && sel.value !== '' && out.value === '') {
        showError();
        return false;
      }
    }
    return true;
  };

  const appendEvents = () => {
    // When hitting the save button, save inputs in the Config
    const btnSubmit = document.getElementById('submit');
    btnSubmit.addEventListener('click',()=>{
      const config = {};
      for (let i = 1; i <= 15; i++) {
        const sel = document.getElementById(`select${i}`);
        config[`select${i}`] = sel.value;
      }
      for (let i = 1; i <= 3; i++) {
        const cf = document.getElementById(`copyfield${i}`);
        config[`copyfield${i}`] = cf.value;
        const bt = document.getElementById(`between${i}`);
        config[`between${i}`] = encodeSpace(bt.value);
      }
      const chkf = document.getElementById('checkField');
      config.checkField = (chkf && chkf.checked) ? 'check' : 'uncheck';

      if (checkValues()) {
        kintone.plugin.app.setConfig(config);
      }
    });
    // When hitting the cancel button
    const btnCancel = document.getElementById('cancel');
    btnCancel.addEventListener('click', ()=>{
      window.history.back();
    });
  };

  setDropdown();
})(kintone.$PLUGIN_ID);
