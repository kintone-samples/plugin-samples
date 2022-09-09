/*
 * textConnect Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 // */
 jQuery.noConflict();
 (($, PLUGIN_ID) => {
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
       for (let i = 1; i < 16; i++) {
         $('#select' + i).val(CONF['select' + i]);
       }
       // get the previous plugin setting
       if (Object.prototype.hasOwnProperty.call(CONF, 'line_number')) {
         $('#copyfield1').val(CONF.copyfield);
         if (CONF.copyfield !== '') {
           $('#between1').val(decodeSpace(CONF.between));
         } else {
           $('#between1').val(CONF.between);
         }
       } else {
         // get the previous plugin setting
         $('#copyfield1').val(CONF.copyfield1);
         $('#copyfield2').val(CONF.copyfield2);
         $('#copyfield3').val(CONF.copyfield3);
         for (let y = 1; y < 4; y++) {
           if (CONF['copyfield' + y] !== '') {
             $('#between' + y).val(decodeSpace(CONF['between' + y]));
           } else {
             $('#between' + y).val(CONF['between' + y]);
           }
         }
       }
 
       if (Object.prototype.hasOwnProperty.call(CONF, 'checkField') && CONF.checkField === 'uncheck') {
         $('#checkField').prop('checked', false);
       }
     }
   };
 
   const escapeHtml = (htmlstr) => {
     return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
   };
 
   const encodeSpace = (htmlstr1) => {
     return htmlstr1.replace(/\u0020/g, '&nbsp;').replace(/\u3000/g, '&emsp;');
   };
 
 
   const setDropdown = () => {
     // get the form fields info and put them in the selection boxes
     const url = kintone.api.url('/k/v1/preview/app/form/fields', true);
     kintone.api(url, 'GET', {'app': kintone.app.getId()}, (resp) => {
 
       const configHTML = $('#cf-plugin').html();
       const template = $.templates(configHTML);
       $('div#cf-plugin').html(template.render({'terms': i18n}));
 
       appendEvents();
 
       const $option = $('<option>');
 
       for (const key in resp.properties) {
         if (!Object.prototype.hasOwnProperty.call(resp.properties, key)) {
           continue;
         }
         const prop = resp.properties[key];
 
         switch (prop.type) {
           // Display Text and Text Area fields in the "Fields to connect" and "Fields to display the connected result" drop-down lists
           case 'SINGLE_LINE_TEXT':
           case 'MULTI_LINE_TEXT':
             for (let m = 1; m < 16; m++) {
               $option.attr('value', escapeHtml(prop.code));
               $option.text(escapeHtml(prop.label));
               $('#select' + m).append($option.clone());
             }
             $('#copyfield1').append($option.clone());
             $('#copyfield2').append($option.clone());
             $('#copyfield3').append($option.clone());
 
             break;
             // Display the Rich Text fields in the "Fields to display the connected result" drop-down list
           case 'RICH_TEXT':
             for (let l = 1; l < 16; l++) {
               $option.attr('value', escapeHtml(prop.code));
               $option.text(escapeHtml(prop.label));
             }
             $('#copyfield1').append($option.clone());
             $('#copyfield2').append($option.clone());
             $('#copyfield3').append($option.clone());
             break;
 
             // Display these types of fields in the "Fields to connect" drop-down list
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
             for (let n = 1; n < 16; n++) {
               $option.attr('value', escapeHtml(prop.code));
               $option.text(escapeHtml(prop.label));
               $('#select' + n).append($option.clone());
             }
             break;
 
           default:
             break;
         }
       }
       setDefault();
     });
   };
 
   const checkValues = () => {
     // Check the required values
     for (let b = 1; b < 6; b++) {
       if ($('#select' + b).val() !== '' && $('#copyfield1').val() === '') {
         swal('Error!', i18n.errorMessage, 'error');
         return false;
       }
     }
     for (let c = 6; c < 11; c++) {
       if ($('#select' + c).val() !== '' && $('#copyfield2').val() === '') {
         swal('Error!', i18n.errorMessage, 'error');
         return false;
       }
     }
     for (let d = 11; d < 16; d++) {
       if ($('#select' + d).val() !== '' && $('#copyfield3').val() === '') {
         swal('Error!', i18n.errorMessage, 'error');
         return false;
       }
     }
     return true;
   };
 
   const appendEvents = () => {
     // When hitting the save button, save inputs in the Config
     $('#submit').click(() => {
       const config = {};
       for (let i = 1; i < 16; i++) {
         config['select' + i] = $('#select' + i).val();
       }
       config.copyfield1 = $('#copyfield1').val();
       config.copyfield2 = $('#copyfield2').val();
       config.copyfield3 = $('#copyfield3').val();
       config.between1 = encodeSpace($('#between1').val());
       config.between2 = encodeSpace($('#between2').val());
       config.between3 = encodeSpace($('#between3').val());
       config.checkField = $('#checkField').prop('checked') ? 'check' : 'uncheck';
 
       if (checkValues()) {
         kintone.plugin.app.setConfig(config);
       }
     });
 
     // When hitting the cancel button
     $('#cancel').click(() => {
       window.history.back();
     });
   };
 
   setDropdown();
 })(jQuery, kintone.$PLUGIN_ID);
 