(function(PLUGIN_ID) {
    "use strict";

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
		//設定値読み込み
    if (!CONF) {
        return false;
    }
    var evselect1 = CONF.select1;
    var evselect2 = CONF.select2;
    var evselect3 = CONF.select3;
    var evselect4 = CONF.select4;
    var evselect5 = CONF.select5;
    var lineNumber = CONF.line_number;

	//一覧作成編集画面
    var events1 = ["app.record.edit.show",
                   "app.record.create.show",
                   "app.record.index.edit.show"
                  ];

    function checkTexValue(tex) {
        var tex_changes = "";
        //ユーザー選択、組織選択、グループ選択でnameのみを取得する
        switch (tex['type']) {
            case "USER_SELECT":
            case "ORGANIZATION_SELECT":
            case "GROUP_SELECT":
                if (tex.value.length !== 0) {
                    tex_changes = tex['value'][0]['name'];
                }
                break;

            //日時のうち、日付だけをトリムする
            case "DATETIME":
                if (tex.value !== undefined) {
                    tex_changes = (tex['value']).substr(0, 10);
                }
                break;

            //複数の値の場合は配列の0のみを反映する
            case "CHECK_BOX":
            case "MULTI_SELECT":
                tex_changes = tex['value'][0];
                break;

            //そのほかのすべてのフィールドタイプ
            default :
                tex_changes = tex['value'];
                break;
        }
        return tex_changes;
    }

    //空のフィールドを探す
    function fieldValues(record) {
        var fieldarray = [];
        for (var j = 1; j <= lineNumber; j++) {
            var tex = record[String(CONF["select" + j])];
            if (tex !== undefined) {
                fieldarray.push(checkTexValue(tex));
            } else {
                fieldarray.push("");
            }
        }
        return fieldarray;
    }

    //結合フィールドを入力不可にする
    kintone.events.on(events1, function(event) {
        var record1 = event['record'];
        record1[String(CONF.copyfield)]['disabled'] = true;
        return event;
    });



	//値に変更があった場合と保存前に結合フィールドに反映させる
    var valevents = ['app.record.edit.change.' + evselect1,
                     'app.record.edit.change.' + evselect2,
                     'app.record.edit.change.' + evselect3,
                     'app.record.edit.change.' + evselect4,
                     'app.record.edit.change.' + evselect5,
                     'app.record.edit.submit',

                     'app.record.create.change.' + evselect1,
                     'app.record.create.change.' + evselect2,
                     'app.record.create.change.' + evselect3,
                     'app.record.create.change.' + evselect4,
                     'app.record.create.change.' + evselect5,
                     'app.record.create.submit',

                     'app.record.index.edit.change.' + evselect1,
                     'app.record.index.edit.change.' + evselect2,
                     'app.record.index.edit.change.' + evselect3,
                     'app.record.index.edit.change.' + evselect4,
                     'app.record.index.edit.change.' + evselect5,
                     'app.record.index.edit.submit'
                    ];

    //保存前イベント
    var submitEvent = ["app.record.edit.submit",
                       "app.record.create.submit",
                       "app.record.index.edit.submit"];

    kintone.events.on(valevents, function connect_texts(event) {

        var record = event.record;
        // cdselectにconfigで設定した値を代入する
        var cdcopyfield = CONF.copyfield;
        var cdbetween = CONF.between;
        if (cdbetween === "&nbsp;") {
            cdbetween = "\u0020";
        } else if (cdbetween === "&emsp;") {
            cdbetween = "\u3000";
        }
        var jointext = fieldValues(record);
        record[String(cdcopyfield)]['value'] = String(jointext.join(cdbetween));
        return event;
    });


    //保存ボタンを押下したときに空フィールドが指定されているかを確認
    kintone.events.on(submitEvent, function(event) {
        var record = event.record;
        var jointext = fieldValues(record);
        for (var i = 0; i < jointext.length; i++) {
            if (!jointext[i]) {
                var res = confirm("結合対象のフィールドに空文字が含まれています。登録しますか？");
                if (res === false) {
                    event.error = "キャンセルしました";
                    return event;
                }
                break;
            }
        }
        return event;
    });
})(kintone.$PLUGIN_ID);
