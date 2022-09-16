/*
 * colorful-report Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(($, PLUGIN_ID) => {
  'use strict';

  const createErrorMessage = () => {
    let lang = kintone.getLoginUser().language;
    const message = {
      'ja': 'このビューは「開催日」項目を配置する必要があります。',
      'zh': '此列表必须包含[开会日期]字段。'
    };
    if (!message[lang]) {
      lang = 'ja';
    }
    return message[lang];
  }

  // read config.
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const titleField = config.titleField;
  const kaisai = config.kaisaiDate;
  const theDate = config.theDate;
  kintone.events.on('app.record.create.show', (event) => {
    const record = event.record;
    if (record[titleField].value) {
      record[titleField].value = '';
    }
    const myTbl = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat'];
    const myD = new Date();
    const myDay = myD.getDay();
    switch (theDate) {
      case 'monday':
        record[kaisai].value = window.colorfulLib.calcMonday(myTbl, myDay);
        break;
      case 'tuesday':
        record[kaisai].value = window.colorfulLib.calcTuesday(myTbl, myDay);
        break;
      case 'wednesday':
        record[kaisai].value = window.colorfulLib.calcWednesday(myTbl, myDay);
        break;
      case 'thursday':
        record[kaisai].value = window.colorfulLib.calcThursday(myTbl, myDay);
        break;
      case 'friday':
        record[kaisai].value = window.colorfulLib.calcFriday(myTbl, myDay);
        break;
      default:
        break;
    }
    record[titleField].disabled = true;
    return event;
  });
  // edit event.
  const editEvents = ['app.record.edit.show', 'app.record.index.edit.show'];
  kintone.events.on(editEvents, (event) => {
    const record = event.record;
    record[titleField].disabled = true;
    return event;
  });
  // title change.
  const changeEvents = ['app.record.create.submit', 'app.record.edit.change.' +
    kaisai, 'app.record.create.change.' + kaisai, 'app.record.index.edit.change.' + kaisai];
  kintone.events.on(changeEvents, (event) => {
    const record = event.record;
    const user = kintone.getLoginUser();
    record[titleField].value = record[kaisai].value + ' ' + user.name;
    return event;
  });
  // index show event.
  const indexEvents = ['app.record.index.show'];
  const viewNameLength = Object.keys(config).length - 6;
  kintone.events.on(indexEvents, (event) => {
    // Check viewId
    const records = event.records;
    if (event.viewName !== config.viewId) {
      return;
    }
    const elDate = kintone.app.getFieldElements(kaisai);
    if (elDate) {
      // specify color.
      const colorType = ['#CCFFFF', '#FFFFCC', '#CCFFCC', '#F5F5DC', '#FFEEFF',
        '#CCFFFF', '#FFFFCC', '#CCFFCC', '#F5F5DC', '#FFEEFF'];
      for (let i = 0; i < elDate.length; i++) {
        const date2 = records[i][kaisai].value.split('-');
        const today = new Date(date2[0] + '/' + date2[1] + '/' + date2[2]);
        const firstday = new Date(today.getFullYear(), 0, 1);
        const fulldays = Math.floor((today.getTime() - firstday.getTime()) / (1000 * 86400));
        let iWeek = Math.floor((fulldays - today.getDay() + 12) / 7);
        iWeek = ('0' + iWeek).slice(-1);
        elDate[i].previousSibling.style.backgroundColor = colorType[iWeek];
        elDate[i].previousSibling.style.borderTop = 'solid 1px #D8D8D8';
        elDate[i].previousSibling.style.borderRight = 'solid 1px #D8D8D8';
        elDate[i].previousSibling.style.borderLeft = 'solid 1px #D8D8D8';
        elDate[i].style.backgroundColor = colorType[iWeek];
        elDate[i].style.borderTop = 'solid 1px #D8D8D8';
        elDate[i].style.borderRight = 'solid 1px #D8D8D8';
        for (let j = 0; j < viewNameLength - 1; j++) {
          const tempFiled = kintone.app.getFieldElements(config['viewName' + (j + 1)]);
          tempFiled[i].nextSibling.style.backgroundColor = colorType[iWeek];
          tempFiled[i].nextSibling.style.borderTop = 'solid 1px #D8D8D8';
          tempFiled[i].nextSibling.style.borderRight = 'solid 1px #D8D8D8';
          if (i === elDate.length - 1) {
            elDate[i].previousSibling.style.borderBottom = 'solid 1px #D8D8D8';
            elDate[i].style.borderBottom = 'solid 1px #D8D8D8';
            tempFiled[i].style.borderBottom = 'solid 1px #D8D8D8';
            tempFiled[i].nextSibling.style.borderBottom = 'solid 1px #D8D8D8';
          }
        }
      }
    } else {
      alert(createErrorMessage());
    }
    return event;
  });
  const openEvents = ['app.record.detail.show'];
  kintone.events.on(openEvents, (event) => {
    const updateFocus = (el) => {
      const elc = el.childNodes;
      let text;
      let textTrim;
      let key1;
      let key2;
      const hilightSt = config.highlightSt;
      const hilightCo = config.highlightCo;
      for (let i = 0; i < elc.length; i++) {
        text = elc[i].innerHTML;
        textTrim = text.replace(/ /g, '').replace(/{blank}/g, '');
        key1 = textTrim.charAt(0);
        key2 = textTrim.charAt(textTrim.length - 1);
        if (key1 === hilightSt || key2 === hilightSt) {
          elc[i].style.backgroundColor = hilightCo;
        }
      }
    }
    for (let j = 0; j < viewNameLength; j++) {
      const elTemp = kintone.app.record.getFieldElement(config['viewName' + (j + 1)]);
      if (elTemp) {
        updateFocus(elTemp);
      }
    }
  });
})(jQuery, kintone.$PLUGIN_ID);
