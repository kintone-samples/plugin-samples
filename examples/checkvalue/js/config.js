jQuery.noConflict();

(function($,PLUGIN_ID) {
    "use strict";
    
    $(document).ready(function(){
        // プラグインIDの設定
        var KEY = PLUGIN_ID;
        var conf = kintone.plugin.app.getConfig(KEY);

        //既に値が設定されている場合はフィールドに値を設定する
        if (conf){
            $('#check-plugin-post_code').val(conf['zip']);
            $('#check-plugin-phone_code').val(conf['tel']);
            $('#check-plugin-fax_code').val(conf['fax']);
            $('#check-plugin-mail_code').val(conf['mail']);
        }

        //「保存する」ボタン押下時に入力情報を設定する
        $('#check-plugin-submit').click(function() {
            var config = [];
            var post = $('#check-plugin-post_code').val();
            var phone = $('#check-plugin-phone_code').val();
            var fax = $('#check-plugin-fax_code').val();
            var mail = $('#check-plugin-mail_code').val();

            if (post =="" ||  phone=="" || fax=="" || mail==""){
                alert("必須項目が入力されていません");
                return;
            }
            config['zip'] = post;
            config['tel'] = phone;
            config['fax'] = fax;
            config['mail'] = mail;

            kintone.plugin.app.setConfig(config);
        });

        //「キャンセル」ボタン押下時の処理
        $('#check-plugin-cancel').click(function() {
                history.back();
        });
    });
    
})(jQuery,kintone.$PLUGIN_ID);