jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";
 
    // プラグインIDの設定
    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    var MAX_LINE = 5;//行数指定

    function setDefault() {
        if (conf){
            $("#select1").val(conf.select1);
            $("#select2").val(conf.select2);
            $("#select3").val(conf.select3);
            $("#select4").val(conf.select4);
            $("#select5").val(conf.select5);
            $("#copyfield").val(conf.copyfield);
            $("#between").val(conf.between);
        }
        return;
    }
 
    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    
    function setDropdown() {
        // フォーム設計情報を取得し、選択ボックスに代入する
        var url = kintone.api.url("/k/v1/preview/form", true);
        kintone.api(url, "GET", {"app": kintone.app.getId()}, function(resp) {
            var $option_status = $("<option>");
            for (var j = 0; j < resp.properties.length; j++) {
                var prop = resp.properties[j];
                var $option = $("<option>");

                switch (prop.type) {
                    //文字列1行の時は保存フィールドにも適用
                    case "SINGLE_LINE_TEXT":
                        for (var k = 1; k < MAX_LINE + 1; k++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#select" + k).append($option.clone());
                        }
                        $("#copyfield").append($option.clone());
                        break;

                    //このパターンの時は結合フィールドのみに適用
                    case "NUMBER":
                    case "RADIO_BUTTON":
                    case "DROP_DOWN":
                    case "RECORD_NUMBER":
                    case "DATE":
                    case "DATETIME":
                    case "CREATED_TIME":
                    case "UPDATED_TIME":
                        for (var k = 1; k < MAX_LINE + 1; k++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#select" + k).append($option.clone());
                        }
                        break;

                    default :
                        break;
                }
            }
            setDefault();
        });
    }

    function checkValues() {
        //必須項目のチェック
        if($('#select1').val() == ''){
            swal("Error!", "「結合する項目」の1列目は必須です。", "error");
            return false;
        }
        //必須項目のチェック
        if($('#copyfield').val() ==''){
            swal("Error!", "「結合された文字列を表示する項目」は必須です。", "error");
            return false;
        }
        //項目の空白チェック(○×○○○)
        if(!($('#select1').val() == '')&$('#select2').val() == ''&!($('#select3').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        //項目の空白チェック(○○×○○)
        if(!($('#select2').val() == '')&$('#select3').val() == ''&!($('#select4').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        //項目の空白チェック(○○○×○)
        if(!($('#select3').val() == '')&$('#select4').val() == ''&!($('#select5').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        //項目の空白チェック(○××○×)
        if(!($('#select1').val() == '')&$('#select2').val() == ''&$('#select3').val() == ''&!($('#select4').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        //項目の空白チェック(○○××○)
        if(!($('#select2').val() == '')&$('#select3').val() == ''&$('#select4').val() == ''&!($('#select5').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        //項目の空白チェック(○×××○)
        if(!($('#select1').val() == '')&$('#select2').val() == ''&$('#select3').val() == ''&$('#select4').val() == ''&!($('#select5').val() == '')){
            swal("Error!", "結合する項目は左に詰めて下さい。", "error");
            return false;
        }
        return true;
    }

    //「保存する」ボタン押下時に入力情報を設定する
    $("#submit").click(function() {
        //結合の数を数える 
        var count = [];
        for(var l = 1; l < MAX_LINE; l++){
            if(!($('#select'+l).val() == '')){
               count.push ($('#select'+l).val());
            }
        }
        console.log(count);
        
        var config = [];
        config['select1'] = $('#select1').val();
        config['select2'] = $('#select2').val();
        config['select3'] = $('#select3').val();
        config['select4'] = $('#select4').val();
        config['select5'] = $('#select5').val();
        config['copyfield'] = $('#copyfield').val();
        config['between'] = $('#between').val();
        config['line_number'] = String(count.length);
        
        if (checkValues()) {
            kintone.plugin.app.setConfig(config);
            console.log(config);
        }
    });

    //「キャンセル」ボタン押下時の処理
    $("#cancel").click(function() {
        window.history.back();
    });

    setDropdown();
})(jQuery, kintone.$PLUGIN_ID);