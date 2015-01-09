(function (PLUGIN_ID) {
     
    'use strict';
 
    // レコードの保存前に TEL, FAX, 郵便番号, メールアドレスの入力値をチェックします
    function checkValue(event){
        
        //設定値読み込み用変数
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        
        //設定値読み込み
        if (!config) return false;
        var record = event.record;
        var zip_value = record[config['zip']]['value'];
        var tel_value = record[config['tel']]['value'];
        var fax_value = record[config['fax']]['value'];
        var mail_value = record[config['mail']]['value'];
 
        // 郵便番号の定義(7桁の半角数字)
        var zip_pattern = /^\d{7}$/;
        // TEL, FAX の定義(10桁または 11桁の半角数字)
        var telfax_pattern = /^\d{10,11}$/; 
        // メールアドレスの定義 (簡易的な定義です。さらに詳細に定義する場合は下記の値を変更して下さい)
        var mail_pattern = /^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/;
 
        // 郵便番号が入力されていたら、入力値を確認します
        if (zip_value){
                // 定義したパターンにマッチするか確認します
                if (!(zip_value.match(zip_pattern))){
                    // マッチしない場合は、郵便番号フィールドにエラーの内容を表示するようにします
                    record[config['zip']]['error'] = '7桁の半角数字で入力して下さい';
                }
        }
 
        // TEL が入力されていたら、入力値を確認します
        if (tel_value){
                // 定義したパターンにマッチするか確認します
                if (!(tel_value.match(telfax_pattern))){
                    // マッチしない場合は、TEL に対してエラーの内容を記載します
                    record[config['tel']]['error'] = '10桁 または 11桁の半角数字で入力して下さい';
                } 
        }
 
        // FAX が入力されていたら、入力値を確認します
        if (fax_value){
                // 定義したパターンにマッチするか確認します
                if (!(fax_value.match(telfax_pattern))){
                    // マッチしない場合は、FAX に対してエラーの内容を記載します
                    record[config['fax']]['error'] = '10桁 または 11桁の半角数字で入力して下さい';
                }
        }
 
        // メールアドレスが入力されていたら、入力値を確認します
        if (mail_value){
                // 定義したパターンにマッチするか確認します
                if (!(mail_value.match(mail_pattern))){
                    // マッチしない場合は、メールアドレスに対してエラーの内容を記載します
                    record[config['mail']]['error'] = 'メールアドレスとして認識されませんでした。値を確認して下さい。';
                }
        }
 
        // event を return します。
        // エラーが有る場合は、保存はキャンセルされ、詳細画面にエラーが表示されます。
        // エラーがない場合は、保存が実行されます。
        return event;
 
    }
 
    // 登録・更新イベント(新規レコード、編集レコード、一覧上の編集レコード)
    kintone.events.on(['app.record.create.submit',
                       'app.record.edit.submit',
                       'app.record.index.edit.submit'], checkValue);
 
})(kintone.$PLUGIN_ID);
