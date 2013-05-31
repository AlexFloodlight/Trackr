var trackr = {
    init: function() {
        'use strict';
        
        jQuery('')
    },
    
    ajax: function(data, callback) {
        jQuery.post(
            '/ajax.php', 
            data,
            function( response ) {
                if (jQuery.isFunction(callback)) {
                    callback(response);
                }
            }
        );
    }
};

jQuery(function() {
    jQuery('#the-button').click(function() {
        trackr.ajax({action: 'button'}, function(response) {
            new_form = jQuery('<div><input name="' + response.track_id + '" value="' + response.track_id + '" /><div class="okay">Okay</div></div>');
            jQuery('#the-button').after(new_form);
            console.log(response);
        });
    });
    
    jQuery('body').on("click", '.okay', function() {
        trackr.ajax({action: 'name', name: 'test'}, function(response) {
            console.log(response);
        });
    });
});
