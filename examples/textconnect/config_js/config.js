jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // プラグインIDの設定
    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    var MAX_LINE = 5;//行数指定

    function escapeHtml2(htmlstr) {
        if (conf.copyfield !== undefined) {
            return htmlstr.replace(/&nbsp;/g, " ").replace(/&emsp;/g, "　");
        }
    }

    function setDefault() {
        if (conf) {
            $("#select1").val(conf.select1);
            $("#select2").val(conf.select2);
            $("#select3").val(conf.select3);
            $("#select4").val(conf.select4);
            $("#select5").val(conf.select5);
            $("#copyfield").val(conf.copyfield);
            if (conf.copyfield !== "") {
                $("#between").val(escapeHtml2(conf.between));
            } else {
                $("#between").val(conf.between);
            }
            return;
        }
    }

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function escapeHtml1(htmlstr1) {
        return htmlstr1.replace(/\u0020/g, "&nbsp;").replace(/\u3000/g, "&emsp;");
    }


    function setDropdown() {
        // フォーム設計情報を取得し、選択ボックスに代入する
        var url = kintone.api.url("/k/v1/preview/form", true);
        kintone.api(url, "GET", {"app": kintone.app.getId()}, function(resp) {
            var $option = $("<option>");
            for (var j = 0; j < resp.properties.length; j++) {
                var prop = resp.properties[j];

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
                    //文字列複数行の時も保存フィールドに適用
                    case "MULTI_LINE_TEXT":
                        for (var m = 1; m < MAX_LINE + 1; m++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#select" + m).append($option.clone());
                        }
                        $("#copyfield").append($option.clone());

                        break;
                    //リッチエディタの時も保存フィールドに適用
                    case "RICH_TEXT":
                        for (var l = 1; l < MAX_LINE + 1; l++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                        }
                        $("#copyfield").append($option.clone());
                        break;

                    //このパターンの時は結合フィールドのみに適用
                    case "DATETIME":
                    case "NUMBER":
                    case "RADIO_BUTTON":
                    case "CHECK_BOX":
                    case "MULTI_SELECT":
                    case "DROP_DOWN":
                    case "DATE":
                    case "TIME":
                    case "LINK":
                    case "USER_SELECT":
                    case "ORGANIZATION_SELECT":
                    case "GROUP_SELECT":
                        for (var n = 1; n < MAX_LINE + 1; n++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#select" + n).append($option.clone());
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
        if ($('#copyfield').val() === '') {
            swal("Error!", "「結合された文字列を表示する項目」は必須です。", "error");
            return false;
        }
        return true;
    }

    //「保存する」ボタン押下時に入力情報を設定する
    $("#submit").click(function() {

        var o = 5;
        if ($('#select5').val() === "") {
            if ($('#select4').val() === "") {
                if ($('#select3').val() === "") {
                    if ($('#select2').val() === "") {
                        if ($('#select1').val() === "") {
                            o--;
                        }
                        o--;
                    }
                    o--;
                }
                o--;
            }
            o--;
        }

        var count = [];
        for (var p = 1; p <= o; p++) {
            count.push($('#select' + p).val());
        }

        var config = [];
        config['select1'] = $('#select1').val();
        config['select2'] = $('#select2').val();
        config['select3'] = $('#select3').val();
        config['select4'] = $('#select4').val();
        config['select5'] = $('#select5').val();
        config['copyfield'] = $('#copyfield').val();
        config['between'] = escapeHtml1($('#between').val());
        config['line_number'] = String(count.length);
        if (checkValues()) {
            kintone.plugin.app.setConfig(config);
        }
    });

    //「キャンセル」ボタン押下時の処理
    $("#cancel").click(function() {
        window.history.back();
    });

    setDropdown();
})(jQuery, kintone.$PLUGIN_ID);
