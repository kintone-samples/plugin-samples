jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";
    
    kintone.events.on('app.record.index.show', function(event) {
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        
        var code = config['target_field'];
        var red = config['red_value'];
        var blue = config['blue_value'];
        var green = config['green_value'];
        
        var fields = kintone.app.getFieldElements(code);
        
        for (var i = 0; i < event.records.length; i++) {
            var record = event.records[i];
            var $field = $(fields[i]);
            
            $field.removeClass('colorcell-plugin-red');
            $field.removeClass('colorcell-plugin-blue');
            $field.removeClass('colorcell-plugin-green');
            
            if (record[code]['value'] === red) {
                $field.addClass('colorcell-plugin-red');
            } else if (record[code]['value'] === blue) {
                $field.addClass('colorcell-plugin-blue');
            } else if (record[code]['value'] === green) {
                $field.addClass('colorcell-plugin-green');
            }
        }
    });

})(jQuery, kintone.$PLUGIN_ID);
