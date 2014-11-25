jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    $(document).ready(function() {
        var clearOption = function($select) {
            $select.empty();
            $select.append($('<OPTION>').html('--').val(''));
        };
        
        var setOptions = function() {
            clearOption($('#colorcell-plugin-red'));
            clearOption($('#colorcell-plugin-blue'));
            clearOption($('#colorcell-plugin-green'));
            var prop = props[$('#colorcell-plugin-target-field').val()];
            for (var i = 0; i < prop['options'].length; i++) {
                var option = prop['options'][i];
                $('#colorcell-plugin-red').append($('<OPTION>').html(option).val(option));
                $('#colorcell-plugin-blue').append($('<OPTION>').html(option).val(option));
                $('#colorcell-plugin-green').append($('<OPTION>').html(option).val(option));
            }
            var config = kintone.plugin.app.getConfig(PLUGIN_ID);
            config['red_value'] && ($('#colorcell-plugin-red').val(config['red_value']));
            config['blue_value'] && ($('#colorcell-plugin-blue').val(config['blue_value']));
            config['green_value'] && ($('#colorcell-plugin-green').val(config['green_value']));
        };

        var props = {};
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()}, function(resp) {
            for (var i = 0; i < resp.properties.length; i++) {
                var prop = resp.properties[i];
                if (prop['type'] !== 'DROP_DOWN') {
                    continue;
                }
                props[prop['code']] = prop;
                $('#colorcell-plugin-target-field').append($('<OPTION>').html(prop['code']).val(prop['code']));
            }
            var config = kintone.plugin.app.getConfig(PLUGIN_ID);
            if (config['target_field']) {
                $('#colorcell-plugin-target-field').val(config['target_field']);
                setOptions();
            }
        });

        $('#colorcell-plugin-target-field').change(setOptions);

        $('#colorcell-plugin-submit').click(function() {
            var config = {};
            config['target_field'] = $('#colorcell-plugin-target-field').val();
            config['red_value'] = $('#colorcell-plugin-red').val();
            config['blue_value'] = $('#colorcell-plugin-blue').val();
            config['green_value'] = $('#colorcell-plugin-green').val();
            kintone.plugin.app.setConfig(config);
        });
        $('#colorcell-plugin-cancel').click(function() {
            history.back();
        });


    });
})(jQuery, kintone.$PLUGIN_ID);
