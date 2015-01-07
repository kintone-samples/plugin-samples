jQuery.noConflict();

(function(pluginId, $) {
    "use strict";

    $(document).ready(function() {
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {
            'app': kintone.app.getId()
        }, function(resp) {
            $.each(resp['properties'], function(index, property) {
                if (property['type'] === 'NUMBER') {
                    $('#vote-plugin-count-field').append($('<OPTION>').html(property['label']).val(property['code']));
                } else if (property['type'] === 'USER_SELECT') {
                    $('#vote-plugin-vote-field').append($('<OPTION>').html(property['label']).val(property['code']));
                }
            });
            var config = kintone.plugin.app.getConfig(pluginId);
            if (config['vote_field'] && config['vote_count_field']) {
                $('#vote-plugin-vote-field').val(config['vote_field']);
                $('#vote-plugin-count-field').val(config['vote_count_field']);
            }
        });

        $('#setting_submit').click(function() {
            var config = {};
            config['vote_field'] = $('#vote-plugin-vote-field').val();
            config['vote_count_field'] = $('#vote-plugin-count-field').val();
            kintone.plugin.app.setConfig(config);
        });
    });
})(kintone.$PLUGIN_ID, jQuery);
