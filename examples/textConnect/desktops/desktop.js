/*
 * textConnect Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';

    // Variable stores pop-up message text to be used based on language.
    var terms = {
        'en': {
            emptyCheck: 'At least one of fields that will be combined has no value. Do you still wish to connect them?',
            cancel: 'Canceled.'
        },
        'ja': {
            emptyCheck: '結合対象のフィールドに空文字が含まれています。登録しますか？',
            cancel: 'キャンセルしました'
        }
    };
    var lang = kintone.getLoginUser().language;
    var i18n = (lang in terms) ? terms[lang] : terms['en'];

    // Load setting values such as target fields to connect, resolve fields, and delimiters.
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONF) {
        return false;
    }

    if (!CONF.copyfield1) {
        return;
    }

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
    }

    function checkTexValue(tex) {
        var tex_changes = '';
        // Get the name from user_selection, organization_selection, or group_selection
        switch (tex['type']) {
            case 'USER_SELECT':
            case 'ORGANIZATION_SELECT':
            case 'GROUP_SELECT':
                if (tex.value.length !== 0) {
                    tex_changes = tex['value'][0]['name'];
                }
                break;

            // Trim only the date of the date / time
            case 'DATETIME':
                if (tex.value !== undefined) {
                    tex_changes = (tex['value']).substr(0, 10);
                }
                break;
            // In case of multiple values, only the element at the index of 0 in the array is reflected
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                tex_changes = tex['value'][0];
                break;
            // All other field types
            default:
                tex_changes = tex['value'];
                break;
        }
        return tex_changes;
    }

    // Calculate joinedText field given selectionArray and record
    function fieldValues(record, selectionArry) {
        var fieldarray = [];

        // For all selection fields for the current group of target fields
        for (var j = 0; j < 5; j++) {
            if (selectionArry[j] !== '') {
                var tex = record[String(selectionArry[j])];

                // If text exists then add it to the fieldarray, other wise add empty string.
                if (tex.value !== undefined) {
                    fieldarray.push(checkTexValue(tex));
                } else {
                    fieldarray.push('');
                }
            }

        }
        return fieldarray;
    }

    function createSelectionArry() {
        // Create selection array for each row
        var selectionArry = [];
        selectionArry[0] = [];
        selectionArry[1] = [];
        selectionArry[2] = [];
        for (var i = 1; i < 16; i++) {
            selectionArry[parseInt((i - 1) / 5, 10)].push(CONF['select' + i]);
        }
        return selectionArry;
    }

    function connectField(record) {
        // Every iteration, one resolve field is calculated based on it's delimiter and selection fields.
        for (var i = 1; i < 4; i++) {
            var cdcopyfield = CONF['copyfield' + i];
            var cdbetween = CONF['between' + i];
            var selectionArry = createSelectionArry();
            var rawTextArray = fieldValues(record, selectionArry[i - 1]); // array of text field values

            if (cdcopyfield === "") {
                break;
            }

            // Filter rawTextArray to only include non empty strings
            var filteredTextArray = rawTextArray.filter(function(text) {
                return text !== "";
            }).filter(function(text) {
                return text !== undefined;
            });

            cdbetween = cdbetween.replace(/&nbsp;/g, ' ').replace(/&emsp;/g, '　');

            // Input back into resolve field in the record
            record[String(cdcopyfield)]['value'] = String(filteredTextArray.join(cdbetween));
        }
    }

    // Events when the value is changed and before saving
    function createEvents() {
        var changeEvent = ['app.record.edit.submit',
            'app.record.create.submit',
            'app.record.index.edit.submit'];
        var edit_change = 'app.record.edit.change.';
        var create_change = 'app.record.create.change.';
        var index_change = 'app.record.index.edit.change.';

        for (var a = 1; a < 16; a++) {
            var target = CONF['select' + a];
            changeEvent.push(edit_change + escapeHtml(target));
            changeEvent.push(create_change + escapeHtml(target));
            changeEvent.push(index_change + escapeHtml(target));
        }
        return changeEvent;
    }

    //Create/edit events
    var events1 = [
        'app.record.edit.show',
        'app.record.create.show',
        'app.record.index.edit.show'
    ];
    // Disable the resolve field (gray out)
    kintone.events.on(events1, function(event) {
        var record = event['record'];
        for (var i = 1; i < 4; i++) {
            if (CONF['copyfield' + i] !== '') {
                record[String(CONF['copyfield' + i])]['disabled'] = true;
            }
        }
        return event;
    });

    // Connect values when the change/submit event is fired
    var valevents = createEvents();
    kintone.events.on(valevents, function connect_texts(event) {
        var record = event.record;
        connectField(record);
        return event;
    });

    // Events relating to submitting
    var submitEvent = [
        'app.record.edit.submit',
        'app.record.create.submit',
        'app.record.index.edit.submit'
    ];

    // Checks if there are any empty fields when saving
    kintone.events.on(submitEvent, function(event) {
        var record = event.record;
        var selectionArry = createSelectionArry();
        var flag = false;

        if (CONF.hasOwnProperty('checkField') && CONF.checkField === 'uncheck') {
            return event;
        }

        for (var m = 0; m < 3; m++) {
            var jointext = fieldValues(record, selectionArry[m]);
            for (var i = 0; i < jointext.length; i++) {
                if (!jointext[i]) {
                    var res = confirm(i18n.emptyCheck);
                    if (res === false) {
                        event.error = i18n.cancel;
                        return event;
                    }
                    flag = true;
                    break;
                }
            }
            if (flag) {
                break;
            }
        }
        return event;
    });


})(kintone.$PLUGIN_ID);
