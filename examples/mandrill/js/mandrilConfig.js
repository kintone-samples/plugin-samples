jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    var responseTemp = '';
    var initialFlag = true;
    var selectFlag = false;
    var valArray = [];
    $(document).ready(function() {
        //get appId
        var appId = kintone.app.getId();
        //Localization(Japanese)
        var userInfo = kintone.getLoginUser();
        if (userInfo.language === 'ja') {
            $('#title').text('Mandrill Plugin 設定画面');
            $('#subTitle1').text('一般設定');
            $('#helpText1').text('Mandrill のAPI keyを入力してください。詳細は');
            $('#link1').text('こちら');
            $('#getBtn').text('テンプレートの取得');
            $('#container_label2').text('メールテンプレート名');
            $('#helpResult').text('テンプレート表示欄');
            $('#helpText2').text('メールテンプレートを下のボタンから取得後、選択してください。');
            $('#container_label3').text('Emailの宛先にするフィールド');
            $('#helpText3').text('文字列(1行)フィールドかEmailに設定したリンクフィールドより選択してください。');
            $('#subTitle2').text('Mandrillの変数とkintoneのフィールドのマッピング設定（オプション）');
            $('#container_label4').text('Mandrillテンプレート内に定義した変数 その1');
            $('#container_label5').text('kintoneのフィールドのフィールド その1');
            $('#container_label6').text('Mandrillテンプレート内に定義した変数 その2');
            $('#container_label7').text('kintoneのフィールドのフィールド その2');
            $('#container_label8').text('Mandrillテンプレート内に定義した変数 その3');
            $('#container_label9').text('kintoneのフィールドのフィールド その3');
            $('#container_label10').text('Mandrillテンプレート内に定義した変数 その4');
            $('#container_label11').text('kintoneのフィールドのフィールド その4');
            $('#container_label12').text('Mandrillテンプレート内に定義した変数 その5');
            $('#container_label13').text('kintoneのフィールドのフィールド その5');
            $('#saveBtn').text('保存');
            $('#cancelBtn').text('キャンセル');
        }
        //Set plugin-ID
        var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
        //Get existing data.
        if (Object.keys(conf).length > 0) {
            $('#mandrill_apikey').val(conf['mandrillApiKey']);
            for (var h = 1; h < 6; h++) {
                $('#variable_' + h).val(conf['val' + h]);
                $('#field_select' + h).val(conf['code' + h]);
            }
            //Display the selected template.
            var opTag = document.createElement('option');
            var templateSelect = $('#template_select');
            $('#template_select').empty();
            opTag.value = conf['templateName'];
            opTag.appendChild(document.createTextNode(conf['templateName']));
            opTag.selected = true;
            templateSelect.append(opTag);
            //Get codes in this template
            var getUrl = 'https://mandrillapp.com/api/1.0/templates/info.json';
            var getData = {};
            getData['key'] = conf['mandrillApiKey'];
            getData['name'] = conf['templateName'];
            kintone.proxy(getUrl, 'POST', {}, getData, function(resp) {
                resp = JSON.parse(resp);
                $('#template_result').text(resp['publish_code']);
            });
            //Display existing data.
            kintone.api('/k/v1/form', 'GET', {app: appId}, function(resp) {
                var adArray = [];
                var labelArray = [];
                var selectSpace = $("#email_select");
                for (var i = 0; i < resp.properties.length; i++) {
                    if (resp.properties[i]['type'] === 'SINGLE_LINE_TEXT' || (resp.properties[i]['type'] === 'LINK' && resp.properties[i]['protocol'] === 'MAIL')) {
                        var op = document.createElement("option");
                        op.value = resp.properties[i]['code'];
                        if (conf['emailFieldCode'] === resp.properties[i]['code']) {
                            op.selected = true;
                        }
                        op.appendChild(document.createTextNode(resp.properties[i]['label'] + '(' + resp.properties[i]['code'] + ')'));
                        selectSpace.append(op);
                    }
                    if (resp.properties[i]['type'] === 'SINGLE_LINE_TEXT') {
                        adArray.push(resp.properties[i]['code']);
                        labelArray.push(resp.properties[i]['label']);
                    }
                }
                for (var k = 1; k < 6; k++) {
                    var codeSpace = $("#field_select" + k);
                    for (var l = 0; l < adArray.length; l++) {
                        var op2 = document.createElement("option");
                        op2.value = adArray[l];
                        if (conf['code' + k] === adArray[l]) {
                            op2.selected = true;
                        }
                        op2.appendChild(document.createTextNode(labelArray[l] + '(' + adArray[l] + ')'));
                        codeSpace.append(op2);
                    }
                }
            });
        }else {
            //When the first setting.
            kintone.api('/k/v1/form', 'GET', {app: appId}, function(resp) {
                var adArray = [];
                var labelArray = [];
                var selectSpace = $("#email_select");
                for (var i = 0; i < resp.properties.length; i++) {
                    if (resp.properties[i]['type'] === 'SINGLE_LINE_TEXT' || (resp.properties[i]['type'] === 'LINK' && resp.properties[i]['protocol'] === 'MAIL')) {
                        var op = document.createElement("option");
                        op.value = resp.properties[i]['code'];
                        op.appendChild(document.createTextNode(resp.properties[i]['label'] + '(' + resp.properties[i]['code'] + ')'));
                        selectSpace.append(op);
                    }
                    if (resp.properties[i]['type'] === 'SINGLE_LINE_TEXT') {
                        adArray.push(resp.properties[i]['code']);
                        labelArray.push(resp.properties[i]['label']);
                    }
                }
                for (var k = 1; k < 6; k++) {
                    var codeSpace = $("#field_select" + k);
                    for (var l = 0; l < adArray.length; l++) {
                        var op2 = document.createElement("option");
                        op2.value = adArray[l];
                        op2.appendChild(document.createTextNode(labelArray[l] + '(' + adArray[l] + ')'));
                        codeSpace.append(op2);
                    }
                }
            });
            initialFlag = false;
        }
        //Get templates button function.
        $('#get-template').on('click', function() {
            var url = 'https://mandrillapp.com/api/1.0/templates/list.json';
            var data = {};
            data['key'] = $('#mandrill_apikey').val();
            kintone.proxy(url, 'POST', {}, data, function(resp) {
                responseTemp = resp;
                responseTemp = JSON.parse(responseTemp);
                var templateSpace = $('#template_select');
                if (responseTemp.length && responseTemp['status'] !== 'error') {
                    if (templateSpace[0].childNodes.length > 0) {
                        $('#template_select').empty();
                    }
                    for (var m = 0; m < responseTemp.length; m++) {
                        var op3 = document.createElement("option");
                        op3.value = responseTemp[m]['name'];
                        op3.appendChild(document.createTextNode(responseTemp[m]['name']));
                        templateSpace.append(op3);
                    }
                }else {
                    $('#template_select').empty();
                    var op4 = document.createElement("option");
                    op4.appendChild(document.createTextNode('Couldn\'t get lists'));
                    templateSpace.append(op4);
                }
            });
            if (userInfo.language === 'ja') {
                $('#template_result').text('テンプレートを選択してください。');
            }else {
                $('#template_result').text('Select the tmplate.');
            }
            initialFlag = false;
        });
        //Select tempaltes function.
        $('#template_select').on('click', function() {
            if (selectFlag === false) {
                //First click
                selectFlag = true;
                return;
            }else if (initialFlag === false) {
                //Remove existing data in the fields.
                for (var p = 1; p <= 5; p++) {
                    $('#variable_' + p).val("");
                }

                for (var n = 0; n < responseTemp.length; n++) {
                    if (responseTemp[n]['name'] === $('#template_select').val()) {
                        $('#template_result').text(responseTemp[n]['publish_code']);
                        valArray = responseTemp[n]['publish_code'].match(/\*\|(.+?)\|\*/g);
                    }
                }
                //Parse a valArray
                if (valArray) {
                    for (var o = 0; o < valArray.length; o++) {
                        valArray[o] = valArray[o].replace(/\*\|/, '');
                        valArray[o] = valArray[o].replace(/\|\*/, '');
                        $('#variable_' + (o + 1)).val(valArray[o]);
                    }
                    valArray = valArray.filter(function (x, i, self) {
                            return self.indexOf(x) === i;
                        });
                    if (valArray.length > 5) {
                        if (userInfo.language === 'ja') {
                            swal('Error', 'このテンプレートは変数が6個以上あるため利用できません。', 'error');
                            $('#template_result').text('テンプレートを選択してください。');
                            selectFlag = false;
                        }else {
                            swal('Error', 'This template has too much variables to select.\n(Variabes are restricted to five or under.)', 'error');
                            $('#template_result').text('Selct the tmplate.');
                            selectFlag = false;
                        }
                        for (var q = 0; q < valArray.length; q++) {
                            $('#variable_' + (q + 1)).val("");
                        }
                    }
                }
            }else {
                return;
            }
        });
        //The save button function.
        $('#submit').on('click', function() {
            var config = {};
            config['mandrillApiKey'] = $('#mandrill_apikey').val();
            config['templateName'] = $('#template_select').val();
            config['emailFieldCode'] = $('#email_select').val();
            //Required field check
            if (!$('#mandrill_apikey').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 Mandrill API key が選択されていません。', 'error');
                return;
            }else if (!$('#mandrill_apikey').val() && (userInfo.language === 'en')) {
                swal('Error', 'Mandrill API key is required.', 'error');
                return;
            }
            if (!$('#template_select').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 メールテンプレート名 が選択されていません。', 'error');
                return;
            }else if (!$('#template_select').val()) {
                swal('Error', 'Mail Template is required.', 'error');
                return;
            }
            if (!$('#email_select').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 Emailの宛先にするフィールドのフィールドコード が選択されていません。', 'error');
                return;
            }else if (!$('#email_select').val()) {
                swal('Error', 'Email recipient field code is required.', 'error');
                return;
            }
            for (var q = 1; q < 6; q++) {
                if ($('#variable_' + q).val() && $('#field_select' + q).val()) {
                    config['val' + q] = $('#variable_' + q).val();
                    config['code' + q] = $('#field_select' + q).val();
                }else if ($('#variable_' + q).val() && (!$('#field_select' + q).val())) {
                    if (userInfo.language === 'ja') {
                        swal('Error', 'kintoneのフィールドのフィールドコード その' + q + 'が選択されていません。', 'error');
                    }else {
                        swal('Error', 'Error occurred.\n' + q + ' kintone Field Code is required.', 'error');
                    }
                    return;
                }
            }
            //Set data through setProxyConfig.
            var data = {};
            data['key'] = config['mandrillApiKey'];
            data['template_name'] = config['templateName'];
            kintone.plugin.app.setProxyConfig('https://mandrillapp.com/api/1.0/messages/send-template.json', 'POST', {}, data, function() {
                kintone.plugin.app.setConfig(config);
            });
        });
        //The cancel button function.
        $('#cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
