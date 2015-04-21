(function(PLUGIN_ID) {
    'use strict';
    //Config key
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    //User Information
    var userInfo = kintone.getLoginUser();
    //Send mail function
    function sendMail(toAddress, code1Val, code2Val, code3Val, code4Val, code5Val) {
        var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json';
        var method = 'POST';
        var headers = {};
        var data = {
            template_content: [{
            }],
            message: {
                to: [],
                global_merge_vars: []
            }
        };
        for (var x = 0; x < toAddress.length; x++) {
            data.message.to.push({email: toAddress[x], type: 'bcc'});
            data.message.global_merge_vars.push({name: config['val1'], content: code1Val[x]});
            data.message.global_merge_vars.push({name: config['val2'], content: code2Val[x]});
            data.message.global_merge_vars.push({name: config['val3'], content: code3Val[x]});
            data.message.global_merge_vars.push({name: config['val4'], content: code4Val[x]});
            data.message.global_merge_vars.push({name: config['val5'], content: code5Val[x]});
        }
        var callback = function(resp, status, obj) {
            if (status === 200) {
                if (userInfo.language === 'ja') {
                    swal({title: 'Complete',
                          text: 'メールのリクエストに成功しました。<br> (メールの送信結果はMandrillの<a href="https://mandrillapp.com/activity" target="_blank">Outbound</a>よりご確認ください。)', 
                          html: true,
                          type: 'success'});
                }else {
                    swal({title: 'Complete', 
                          text: 'A request for mail sending was success.<br>Please confirm a result of mail sending at Mandrill <a href="https://mandrillapp.com/activity" target="_blank">outbaound</a>', 
                          html: true,
                          type: 'success'});
                }
            }else {
                if (userInfo.language === 'ja') {
                    swal('Failed', 'メールのリクエストに失敗しました。Status code:' + status, 'error');
                }else {
                    swal('Failed', 'A request for mail sending was failed. Status code:' + status, 'error');
                }
            }
        };
        var errback = function(e) {
            swal('Failed', 'Mail sending was failed.', 'error');
        };
        kintone.plugin.app.proxy(PLUGIN_ID, url, method, headers, data, callback, errback);
    }
    kintone.events.on('app.record.index.show', function(event) {
        //make buttonEl
        var records = event.records;
        var valMerge1 = [];
        var valMerge2 = [];
        var valMerge3 = [];
        var valMerge4 = [];
        var valMerge5 = [];
        var to = [];
        var buttonEl = document.createElement('button');
        buttonEl.textContent = 'Mail Send';
        buttonEl.id = 'my_index_button';
        buttonEl.className = 'kintoneplugin-button-normal';
        buttonEl.addEventListener('click', function() {
            var swalContent = "";
            if (userInfo.language === 'ja') {
                swalContent = {
                    title: "メールのリクエストを送信しますか？",
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: "キャンセル",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "送信",
                    closeOnConfirm: false
                };
            }else {
                swalContent = {
                    title: "Are you sure?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Send",
                    closeOnConfirm: false
                };
            }
            swal(swalContent, function() {
                if (records.length === 0) {
                    if (userInfo.language === 'ja') {
                        swal('データがありません', '送信するリストが見つかりません.', 'warning');
                    }else {
                        swal('No input data', 'Input data was nothing.', 'warning');
                    }
                    return;
                }else {
                    sendMail(to, valMerge1, valMerge2, valMerge3, valMerge4, valMerge5);
                }
            });
        }, false);
        for (var i = 0; i < records.length; i++) {
            to.push(records[i][config['emailFieldCode']]['value']);
            if (config['code1']) {
                valMerge1.push(records[i][config['code1']]['value']);
            }
            if (config['code2']) {
                valMerge2.push(records[i][config['code2']]['value']);
            }
            if (config['code3']) {
                valMerge3.push(records[i][config['code3']]['value']);
            }
            if (config['code4']) {
                valMerge4.push(records[i][config['code4']]['value']);
            }
            if (config['code5']) {
                valMerge5.push(records[i][config['code5']]['value']);
            }
        }
        if ($('#my_index_button').length > 0) {
            return;
        }
        kintone.app.getHeaderMenuSpaceElement('buttonSpace').appendChild(buttonEl);
    });
    kintone.events.on('app.record.index.edit.submit', function(event) {
        if (userInfo.language === 'ja') {
            swal('メールを送信する前に画面をリロードしてください', 'メールリストの反映にはリロードが必要です', 'warning');
        }else {
            swal('Before mail will be sending, reloading is required.', 'Reloading is required', 'warning');
        }
    });
})(kintone.$PLUGIN_ID);
