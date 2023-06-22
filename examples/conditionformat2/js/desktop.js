/* eslint-disable no-undef */
/*
 * New Condition Format plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) {
    return false;
  }

  let RECORDS = [];

  let TEXT_ROW_NUM;
  let DATE_ROW_NUM;

  const convertOldConfigtoNewConfig = (old_conf) => {
    CONFIG.body_text = JSON.parse(CONFIG.body_text);
    CONFIG.body_date = JSON.parse(CONFIG.body_date);
    TEXT_ROW_NUM = 10;
    DATE_ROW_NUM = 10;

    const new_conf = {};
    new_conf.date_row_number = old_conf.line_number;
    new_conf.text_row_number = old_conf.line_number;

    const convert = {
      abs: (val) => {
        return val < 0 ? -val : val;
      },
      type2: (val) => {
        return val > 0 ? 'after' : 'before';
      }
    };

    for (let i = 1; i < Number(old_conf.line_number) + 1; i++) {
      new_conf['text_row' + i] = {};
      new_conf['date_row' + i] = {};
      new_conf['text_row' + i].field = old_conf.body_text['cfield_text_' + i].value;
      new_conf['text_row' + i].type = old_conf.body_text['ctype_text_' + i].value;
      new_conf['text_row' + i].value = old_conf.body_text['cvalue_text_' + i].value;
      new_conf['text_row' + i].targetfield = old_conf.body_text['tfield_text_' + i].value;
      new_conf['text_row' + i].targetcolor = old_conf.body_text['tcolor_text_' + i].value;
      new_conf['text_row' + i].targetbgcolor = old_conf.body_text['tbgcolor_text_' + i].value;
      new_conf['text_row' + i].targetsize = old_conf.body_text['tsize_text_' + i].value;
      new_conf['text_row' + i].targetfont = '';
      new_conf['date_row' + i].field = old_conf.body_date['cfield_date_' + i].value;
      new_conf['date_row' + i].type = old_conf.body_date['ctype_date_' + i].value;
      new_conf['date_row' + i].value = convert.abs(old_conf.body_date['cvalue_date_' + i].value);
      new_conf['date_row' + i].type2 = convert.type2(Number(old_conf.body_date['cvalue_date_' + i].value));
      new_conf['date_row' + i].targetfield = old_conf.body_date['tfield_date_' + i].value;
      new_conf['date_row' + i].targetcolor = old_conf.body_date['tcolor_date_' + i].value;
      new_conf['date_row' + i].targetbgcolor = old_conf.body_date['tbgcolor_date_' + i].value;
      new_conf['date_row' + i].targetsize = old_conf.body_date['tsize_date_' + i].value;
      new_conf['date_row' + i].targetfont = '';
    }
    return new_conf;
  };

  if (!Object.prototype.hasOwnProperty.call(CONFIG, 'line_number')) {
    TEXT_ROW_NUM = Number(CONFIG.text_row_number);
    DATE_ROW_NUM = Number(CONFIG.date_row_number);
    for (let t = 1; t < TEXT_ROW_NUM + 1; t++) {
      CONFIG['text_row' + t] = JSON.parse(CONFIG['text_row' + t]);
    }
    for (let d = 1; d < DATE_ROW_NUM + 1; d++) {
      CONFIG['date_row' + d] = JSON.parse(CONFIG['date_row' + d]);
    }
  } else {
    CONFIG = convertOldConfigtoNewConfig(CONFIG);
  }

  const convertOldStatustoNewStatus = (record) => {
    let status_code;
    for (const key in record) {
      if (!Object.prototype.hasOwnProperty.call(record, key)) {
        continue;
      }
      const prop = record[key];
      if (prop.type === 'STATUS') {
        status_code = key;
        break;
      }
    }
    const convert = {
      status: (val) => {
        return val === 'status' ? status_code : val;
      }
    };
    for (let i = 1; i < 11; i++) {
      CONFIG['text_row' + i].field = convert.status(CONFIG['text_row' + i].field);
      CONFIG['text_row' + i].targetfield = convert.status(CONFIG['text_row' + i].targetfield);
      CONFIG['date_row' + i].targetfield = convert.status(CONFIG['date_row' + i].targetfield);
    }
  };
  const changeFieldColor = (el, color) => {
    if (color) {
      el.style.color = color;
    }
  };

  const changeFieldBackgroundColor = (el, backgroundcolor, event_type) => {
    if (backgroundcolor) {
      el.style.backgroundColor = backgroundcolor;
    }
    if (event_type === 'index') {
      el.style.borderBottom = 'solid 1px #F5F5F5';
    }
  };

  const changeFieldFontSize = (el, size) => {
    if (size) {
      el.style.fontSize = size;
    } else {
      el.style.fontSize = '14px';
    }
  };

  const changeFieldStyle = (el, font) => {
    switch (font) {
      case 'bold':
        el.style.fontWeight = font;
        el.style.textDecoration = 'none';
        break;
      case 'underline':
        el.style.fontWeight = 'normal';
        el.style.textDecoration = font;
        break;
      case 'line-through':
        el.style.fontWeight = 'normal';
        el.style.textDecoration = font;
        break;
      case '':
        el.style.fontWeight = 'normal';
        el.style.textDecoration = 'none';
        break;
    }
  };

  const changeFieldElement = (el, row_obj, event_type) => {
    changeFieldColor(el, row_obj.targetcolor);
    changeFieldBackgroundColor(el, row_obj.targetbgcolor, event_type);
    changeFieldFontSize(el, row_obj.targetsize);
    changeFieldStyle(el, row_obj.targetfont);
  };

  const checkTextConditionFormat = (field, value, type) => {
    let field_value = '';
    let condition_value = '';
    if (field && field.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
      if (type === 'match' || type === 'unmatch') {
        field_value = field;
      } else {
        field_value = Number(field);
      }
    } else {
      field_value = field;
    }

    // Change condition value format
    if (value && value.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
      if (type === 'match' || type === 'unmatch') {
        condition_value = value;
      } else {
        condition_value = Number(value);
      }
    } else {
      condition_value = value;
    }

    switch (type) {
      case 'match':
        if (field_value.indexOf(condition_value) !== -1) {
          return true;
        }
        break;
      case 'unmatch':
        if (field_value.indexOf(condition_value) === -1) {
          return true;
        }
        break;
      case '==':
        if (field_value === condition_value) {
          return true;
        }
        break;
      case '!=':
        if (field_value !== condition_value) {
          return true;
        }
        break;
      case '<=':
        if (field_value <= condition_value) {
          return true;
        }
        break;
      case '<':
        if (field_value < condition_value) {
          return true;
        }
        break;
      case '>=':
        if (field_value >= condition_value) {
          return true;
        }
        break;
      case '>':
        if (field_value > condition_value) {
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
  };

  const checkDateConditionFormat = (field, value, condition_type, condition_type2) => {

    if (!field) {
      return false;
    }

    // Change values format
    let num = Number(value);
    if (condition_type2 === 'before') {
      num = -num;
    }

    const field_value = luxon.DateTime.fromISO(field);
    const condition_value = luxon.DateTime.now().plus({days: num}).startOf('day');
    const diff = field_value.diff(condition_value, 'days').days;

    switch (condition_type) {
      case '==':
        if (diff === 0) {
          return true;
        }
        break;
      case '!=':
        if (diff !== 0) {
          return true;
        }
        break;
      case '<=':
        if (diff <= 0) {
          return true;
        }
        break;
      case '<':
        if (diff < 0) {
          return true;
        }
        break;
      case '>=':
        if (diff >= 0) {
          return true;
        }
        break;
      case '>':
        if (diff > 0) {
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
  };

  const checkIndexConditionFormat = (records) => {
    let text_obj, date_obj, el_text, el_date, field_obj;

    const conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (Object.prototype.hasOwnProperty.call(conf, 'line_number')) {
      convertOldStatustoNewStatus(records[0]);
    }

    for (let ti = 1; ti <= TEXT_ROW_NUM; ti++) {
      text_obj = CONFIG['text_row' + ti];
      el_text = kintone.app.getFieldElements(text_obj.targetfield);
      if (!el_text) {
        continue;
      }

      for (let tn = 0; tn < el_text.length; tn++) {
        field_obj = records[tn][text_obj.field];
        if (field_obj.type === 'CHECK_BOX' || field_obj.type === 'MULTI_SELECT') {
          if (field_obj.value.length === 0) {
            field_obj.value[0] = '';
          }
          for (let i = 0; i < field_obj.value.length; i++) {
            if (checkTextConditionFormat(field_obj.value[i], text_obj.value, text_obj.type)) {
              changeFieldElement(el_text[tn], text_obj, 'index');
            }
          }
          continue;
        }
        if (checkTextConditionFormat(field_obj.value, text_obj.value, text_obj.type)) {
          changeFieldElement(el_text[tn], text_obj, 'index');
        }
      }
    }

    for (let di = 1; di <= DATE_ROW_NUM; di++) {
      date_obj = CONFIG['date_row' + di];
      el_date = kintone.app.getFieldElements(date_obj.targetfield);
      if (!el_date) {
        continue;
      }

      for (let dn = 0; dn < el_date.length; dn++) {
        field_obj = records[dn][date_obj.field];
        if (checkDateConditionFormat(field_obj.value, date_obj.value, date_obj.type, date_obj.type2)) {
          changeFieldElement(el_date[dn], date_obj, 'index');
        }
      }
    }
  };

  const checkDetailConditionFormat = (record) => {
    let text_obj, date_obj, el_text, el_date, field_obj;

    for (let ti = 1; ti <= TEXT_ROW_NUM; ti++) {
      text_obj = CONFIG['text_row' + ti];
      el_text = kintone.app.record.getFieldElement(text_obj.targetfield);
      if (!el_text) {
        continue;
      }

      field_obj = record[text_obj.field];
      if (field_obj.type === 'CHECK_BOX' || field_obj.type === 'MULTI_SELECT') {
        if (field_obj.value.length === 0) {
          field_obj.value[0] = '';
        }
        for (let i = 0; i < field_obj.value.length; i++) {
          if (checkTextConditionFormat(field_obj.value[i], text_obj.value, text_obj.type)) {
            changeFieldElement(el_text, text_obj, 'detail');
          }
        }
        continue;
      }
      if (checkTextConditionFormat(field_obj.value, text_obj.value, text_obj.type)) {
        changeFieldElement(el_text, text_obj, 'detail');
      }
    }

    for (let di = 1; di <= DATE_ROW_NUM; di++) {
      date_obj = CONFIG['date_row' + di];
      el_date = kintone.app.record.getFieldElement(date_obj.targetfield);
      if (!el_date) {
        continue;
      }

      field_obj = record[date_obj.field];
      if (checkDateConditionFormat(field_obj.value, date_obj.value, date_obj.type, date_obj.type2)) {
        changeFieldElement(el_date, date_obj, 'detail');
      }
    }
  };

  kintone.events.on('app.record.index.show', (event) => {
    if (event.records.length <= 0) {
      return;
    }
    checkIndexConditionFormat(event.records);
    RECORDS = event.records;

  });

  kintone.events.on('app.record.index.delete.submit', (event) => {
    RECORDS = RECORDS.filter((record) => {
      return record.$id.value !== event.recordId;
    });
    return event;
  });

  kintone.events.on('app.record.detail.show', (event) => {
    if (!event.record) {
      return;
    }
    checkDetailConditionFormat(event.record);

  });

  kintone.events.on('app.record.index.edit.submit.success', (event) => {
    if (!event.record) {
      return;
    }
    let index = -1;
    RECORDS.forEach((record, i) => {
      if (record.$id.value === event.record.$id.value) {
        index = i;
      }
    });
    RECORDS[index] = event.record;
    setTimeout(()=> {
      checkIndexConditionFormat(RECORDS);
    }, 10);

    return event;
  });
})(jQuery, kintone.$PLUGIN_ID);
