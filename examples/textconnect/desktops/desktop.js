(function(PLUGIN_ID) {
    "use strict";

    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
		//設定値読み込み
    if (!conf) {
        return false;
    }
    var evselect1 = conf.select1;
    var evselect2 = conf.select2;
    var evselect3 = conf.select3;
    var evselect4 = conf.select4;
    var evselect5 = conf.select5;
    var lineNumber = conf.line_number;

	//一覧作成編集画面
    var events1 = ["app.record.edit.show",
                   "app.record.create.show",
                   "app.record.index.edit.show"
                  ];

		//結合フィールドを入力不可にする
    kintone.events.on(events1, function(event) {
        var record1 = event['record'];
        record1[String(conf.copyfield)]['disabled'] = true;
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
                     'app.record.index.edit.submit'];

    kintone.events.on(valevents, function connect_texts(event) {

        var cdconf = kintone.plugin.app.getConfig(PLUGIN_ID);
        var record = event.record;

        // cdselectにconfigで設定した値を代入する

        var cdcopyfield = cdconf.copyfield;
        var cdbetween = cdconf.between;

        var jointext = [];
        for (var j = 1; j <= lineNumber; j++) {
            var tex = record[String(conf["select" + j])];
            if (tex !== undefined) {
                var texname = tex['value'];
                if (texname !== "" | texname !== []) {
                //ユーザー選択、組織選択、グループ選択でnameのみを取得する
                    if ((tex['type']) === "USER_SELECT" |
                        (tex['type']) === "ORGANIZATION_SELECT" |
                        (tex['type']) === "GROUP_SELECT") {
                        if (tex.value.length === 0 | tex.value === "undefined") {
                            jointext.push(tex['value']);
                        } else {
                            jointext.push(tex['value'][0]['name']);
                        }
                    //日時のうち、日付だけをトリムする
                    } else if ((tex['type']) === "DATETIME") {
                        if (tex.value !== undefined) {
                            jointext.push((tex['value']).substr(0, 10));
                        } else {
                            jointext.push(tex['value']);
                        }
                    //複数の値の場合は配列の0のみを反映する
                    } else if ((tex['type']) === "CHECK_BOX" |
                        (tex['type']) === "MULTI_SELECT") {
                        if (tex === "" | tex === "undefined") {
                            jointext.push(tex['value']);
                        } else {
                            jointext.push(tex['value'][0]);
                        }
                    //そのほかのすべてのフィールドタイプ
                    } else {
                        jointext.push(tex['value']);
                    }
                } else if (texname === "") {
                    jointext.push(texname);
                }
            }
        }
        record[String(cdcopyfield)]['value'] = String(jointext.join(cdbetween));

		//保存ボタンを押下したときに空フィールドが指定されているかを確認
        if (event.type === "app.record.edit.submit" ||
            event.type === "app.record.create.submit" ||
            event.type === "app.record.index.edit.submit") {

            var cnt = 0;
				// 空フィールドを探す
            for (var i = 0; i < jointext.length; i++) {
                if (cnt === 0) {
                    if (jointext[i] === undefined || jointext[i] === "" || jointext[i].length === 0) {
                        var res = confirm("結合対象のフィールドに空文字が含まれています。登録しますか？");
                            //アラート表示は1回限り
                        cnt = 1;
                        if (res === false) {
                            event.error = "キャンセルしました";
                            return event;
                        }
                    }
                }
            }
        }
        return event;
    });
})(kintone.$PLUGIN_ID);
