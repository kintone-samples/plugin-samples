(function(PLUGIN_ID){
	"use strict"

		var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
		//設定値読み込み
		if(!conf) {
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
					   ]

		//結合フィールドを入力不可にする
		kintone.events.on(events1, function(event){
			var record1 = event['record'];
			record1[String(conf.copyfield)]['disabled'] = true;
			return event;
		});


		//値に変更があった場合と保存前に結合フィールドに反映させる
		var valevents = ['app.record.edit.change.'+ evselect1,
			   			 'app.record.edit.change.'+ evselect2,
				 		 'app.record.edit.change.'+ evselect3,
				 		 'app.record.edit.change.'+ evselect4,
						 'app.record.edit.change.'+ evselect5,
						 'app.record.edit.submit',

						 'app.record.create.change.'+ evselect1,
						 'app.record.create.change.'+ evselect2,
						 'app.record.create.change.'+ evselect3,
						 'app.record.create.change.'+ evselect4,
						 'app.record.create.change.'+ evselect5,
						 'app.record.create.submit',
						 
						 'app.record.index.edit.change.'+ evselect1,
			   			 'app.record.index.edit.change.'+ evselect2,
				 		 'app.record.index.edit.change.'+ evselect3,
				 		 'app.record.index.edit.change.'+ evselect4,
						 'app.record.index.edit.change.'+ evselect5,
						 'app.record.index.edit.submit']

		kintone.events.on(valevents, function connect_texts(event){

			var cdconf = kintone.plugin.app.getConfig(PLUGIN_ID);
			var record = event.record;

			var cdselect1 = cdconf.select1;
			var cdselect2 = cdconf.select2;
			var cdselect3 = cdconf.select3;
			var cdselect4 = cdconf.select4;
			var cdselect5 = cdconf.select5;
			var cdcopyfield = cdconf.copyfield;
			var cdbetween = cdconf.between;
			if(cdbetween == "space"){
				cdbetween = "\u0020";
			}

			var jointext = [];
			for(var j=1; j<=lineNumber; j++){
				if(!(record[String(conf["select"+j])]['value'] == "") | !(record[String(conf["select"+j])]['value'] == "undefined")){
					jointext.push(record[String(conf["select"+j])]['value'])
				}
			}
			record[String(cdcopyfield)]['value'] = String(jointext.join(cdbetween));

			//保存ボタンを押下したときに空フィールドが指定されているかを確認
			if(event.type == "app.record.edit.submit" || event.type == "app.record.create.submit" || event.type == "app.record.index.edit.submit"){
				for(var i = 0; i < jointext.length; i++){
					// 空フィールドを探す
					if(jointext[i] === undefined || jointext[i] === ""){
						var res = confirm("空白のフィールドがありますが保存を実行しますか？");
						if (res === false) {
							event.error = "キャンセルしました";
							// 画面遷移
							window.location.href = window.location.origin + window.location.pathname + "#record=" + event.record.$id.value;
						return event;
						}
					}
				};
			}
			return event;	
		});
			
})(kintone.$PLUGIN_ID);