jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    $(document).ready(function() {

        var terms = {
            'en': {
                'ganttchartTitle': 'Title',
                'ganttchartTitle_label': 'Field of title.',
                'ganttchartTitle_description': 'Please specify the fields to be displayed' +
                ' in the first classification of the vertical axis of the Gantt chart.',
                'ganttchartDesc': 'Subtitle',
                'ganttchartDesc_label': 'Field of subtitle',
                'ganttchartDesc_description': 'Please specify the fields to be displayed' +
                ' in the second classification of the vertical axis of the Gantt chart.',
                'ganttchartFrom': 'Start date',
                'ganttchartFrom_label': 'Field of start date',
                'ganttchartFrom_description': '',
                'ganttchartTo': 'End date',
                'ganttchartTo_label': 'Field of End date',
                'ganttchartTo_description': '',
                'ganttchartColor': 'Color of chart',
                'ganttchartColor_label': 'Field of color',
                'ganttchartColor_label_name': 'Color',
                'ganttchartColor_label_setting': 'Settings',
                'ganttchartColor_description': 'Please enter the condition value coloring to.' +
                '(More certain when example of "A, B, C") if the condition value is duplicated, ' +
                'it will be priority from the top.',
                'ganttchartColor_red': 'Red',
                'ganttchartColor_red_name': 'Red',
                'ganttchartColor_orange': 'Orange',
                'ganttchartColor_orange_name': 'Orange',
                'ganttchartColor_green': 'Green',
                'ganttchartColor_green_name': 'Green',
                'ganttchartColor_blue': 'Blue',
                'ganttchartColor_blue_name': 'Blue',
                'ganttchartColor_yellow': 'Yellow',
                'ganttchartColor_yellow_name': 'Yellow',
                'ganttchartColor_gray': 'Gray',
                'ganttchartColor_gray_name': 'Gray',
                'ganttchartScall': 'Scall',
                'ganttchartScall_label': 'Scale to be displayed early (day, month, year).',
                'ganttchartScall_description': '',
                'error': 'Error: ',
                'plugin_submit': '     Save   ',
                'plugin_cancel': '     Cancel   ',
                'required_field': 'Required field is empty.'
            },
            'ja': {
                'ganttchartTitle': 'タイトル',
                'ganttchartTitle_label': 'タイトルにするフィールド',
                'ganttchartTitle_description': 'ガントチャートの縦軸の第一分類に表示するフィールドを指定してください。',
                'ganttchartDesc': 'サブタイトル',
                'ganttchartDesc_label': 'サブタイトルにするフィールド',
                'ganttchartDesc_description': 'ガントチャートの縦軸の第二分類に表示するフィールドを指定してください。',
                'ganttchartFrom': '開始日',
                'ganttchartFrom_label': '開始日のフィールド',
                'ganttchartFrom_description': '',
                'ganttchartTo': '終了日',
                'ganttchartTo_label': '終了日のフィールド',
                'ganttchartTo_description': '',
                'ganttchartColor': 'チャートカラー',
                'ganttchartColor_label': '色付けするフィールド',
                'ganttchartColor_label_name': 'カラー',
                'ganttchartColor_label_setting': '設定値',
                'ganttchartColor_description': '色付けする条件値を入力してください。（複数ある際の例「A,B,C」） 条件値が重複する場合には、上から優先されます。',
                'ganttchartColor_red': '赤',
                'ganttchartColor_red_name': '赤',
                'ganttchartColor_orange': 'オレンジ',
                'ganttchartColor_orange_name': 'オレンジ',
                'ganttchartColor_green': '緑',
                'ganttchartColor_green_name': '緑',
                'ganttchartColor_blue': '青',
                'ganttchartColor_blue_name': '青',
                'ganttchartColor_yellow': '黄',
                'ganttchartColor_yellow_name': '黄',
                'ganttchartColor_gray': 'グレー',
                'ganttchartColor_gray_name': 'グレー',
                'ganttchartScall': 'スケール',
                'ganttchartScall_label': '初期に表示するスケール（日、月、年）',
                'ganttchartScall_description': '',
                'error': 'エラー: ',
                'plugin_submit': '     保存   ',
                'plugin_cancel': '  キャンセル   ',
                'required_field': '必須項目が入力されていません。'
            }
        };

        // To HTML escape
        function escapeHtml(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#ganttchart-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#ganttchart-plugin').html(tmpl.render({'terms': i18n}));

        // Set in the item selection box retrieves the form information design
        var appId = kintone.app.getId();
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': appId}, function(resp) {
            for( var key in resp.properties) {

                if (!resp.properties.hasOwnProperty(key)) { continue; };
                var prop = resp.properties[key];
                switch (prop['type']) {
                    case 'SINGLE_LINE_TEXT':
                    case 'MULTI_LINE_TEXT':
                        $('#ganttchart-plugin-title').append($('<option>')
                            .text(prop['label']).val(escapeHtml(prop['code'])));
                        $('#ganttchart-plugin-desc').append($('<option>')
                            .text(prop['label']).val(escapeHtml(prop['code'])));
                        break;
                    case 'DATE':
                    case 'DATETIME':
                        $('#ganttchart-plugin-from').append($('<option>')
                            .text(prop['label']).val(escapeHtml(prop['code'])));
                        $('#ganttchart-plugin-to').append($('<option>')
                            .text(prop['label']).val(escapeHtml(prop['code'])));
                        break;
                    case 'RADIO_BUTTON':
                    case 'DROP_DOWN':
                        $('#ganttchart-plugin-color').append($('<option>')
                            .text(prop['label']).val(escapeHtml(prop['code'])));
                        break;
                }
            }

            // Get the plug-in information to set the definition data
            var config = kintone.plugin.app.getConfig(PLUGIN_ID);
            config['ganttchartTitle'] =
                $('#ganttchart-plugin-title').val(escapeHtml(config['ganttchartTitle']));
            config['ganttchartDesc'] =
                $('#ganttchart-plugin-desc').val(escapeHtml(config['ganttchartDesc']));
            config['ganttchartFrom'] =
                $('#ganttchart-plugin-from').val(escapeHtml(config['ganttchartFrom']));
            config['ganttchartTo'] =
                $('#ganttchart-plugin-to').val(escapeHtml(config['ganttchartTo']));
            config['ganttchartColor'] =
                $('#ganttchart-plugin-color').val(escapeHtml(config['ganttchartColor']));
            config['ganttchartColor_red'] =
                $('#ganttchart-plugin-color-red').val(escapeHtml(config['ganttchartColor_red']));
            config['ganttchartColor_orange'] =
                $('#ganttchart-plugin-color-orange').val(escapeHtml(config['ganttchartColor_orange']));
            config['ganttchartColor_green'] =
                $('#ganttchart-plugin-color-green').val(escapeHtml(config['ganttchartColor_green']));
            config['ganttchartColor_blue'] =
                $('#ganttchart-plugin-color-blue').val(escapeHtml(config['ganttchartColor_blue']));
            config['ganttchartColor_yellow'] =
                $('#ganttchart-plugin-color-yellow').val(escapeHtml(config['ganttchartColor_yellow']));
            config['ganttchartColor_gray'] =
                $('#ganttchart-plugin-color-gray').val(escapeHtml(config['ganttchartColor_gray']));
            config['ganttchartScall'] =
                $('#ganttchart-plugin-scall').val(escapeHtml(config['ganttchartScall']));
        });

        // Save the value
        $('#plugin_submit').click(function() {

            var ganttchartTitle = $('#ganttchart-plugin-title').val();
            var ganttchartDesc = $('#ganttchart-plugin-desc').val();
            var ganttchartFrom = $('#ganttchart-plugin-from').val();
            var ganttchartTo = $('#ganttchart-plugin-to').val();
            var ganttchartColor = $('#ganttchart-plugin-color').val();
            var ganttchartColor_red = $('#ganttchart-plugin-color-red').val();
            var ganttchartColor_orange = $('#ganttchart-plugin-color-orange').val();
            var ganttchartColor_green = $('#ganttchart-plugin-color-green').val();
            var ganttchartColor_blue = $('#ganttchart-plugin-color-blue').val();
            var ganttchartColor_yellow = $('#ganttchart-plugin-color-yellow').val();
            var ganttchartColor_gray = $('#ganttchart-plugin-color-gray').val();
            var ganttchartScall = $('#ganttchart-plugin-scall').val();

            // Check the required fields
            if (ganttchartTitle === '') {alert(i18n.required_field); return; }
            if (ganttchartFrom === '') {alert(i18n.required_field); return; }
            if (ganttchartTo === '') {alert(i18n.required_field); return; }
            if (ganttchartColor === '') {alert(i18n.required_field); return; }
            if (ganttchartScall === '') {alert(i18n.required_field); return; }

            // Set the definition data
            var config = {};
            config['ganttchartTitle'] = ganttchartTitle;
            config['ganttchartDesc'] = ganttchartDesc;
            config['ganttchartFrom'] = ganttchartFrom;
            config['ganttchartTo'] = ganttchartTo;
            config['ganttchartColor'] = ganttchartColor;
            config['ganttchartColor_red'] = ganttchartColor_red;
            config['ganttchartColor_orange'] = ganttchartColor_orange;
            config['ganttchartColor_green'] = ganttchartColor_green;
            config['ganttchartColor_blue'] = ganttchartColor_blue;
            config['ganttchartColor_yellow'] = ganttchartColor_yellow;
            config['ganttchartColor_gray'] = ganttchartColor_gray;
            config['ganttchartScall'] = ganttchartScall;

            kintone.plugin.app.setConfig(config);

        });

        // Clear the value
        $('#plugin_cancel').click(function() {
            history.back();
        });

    });
})(jQuery, kintone.$PLUGIN_ID);
