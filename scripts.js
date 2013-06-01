var trackr = {
    init: function() {
        'use strict';
        var jQuery = window.jQuery, the_button;
        
        the_button = new trackr.TheButton(jQuery('#the-button'));
    },
    
    TheButton: function( jq_button ) {
        'use strict';
        var that = this;
        
        this.jq_button = jq_button;
        
        this.jq_button.click(function() {
            trackr.ajax({action: 'button'}, trackr.createNewInput);
        });
    },
    
    createNewInput: function(response) {
        'use strict';
        var jQuery = window.jQuery, new_form;
        new_form = jQuery('<div><input type="text" name="' + response.track_id + '" value="' + response.track_id + '" placeholder="At " /><div class="okay icon-ok">&nbsp;</div></div>');
        jQuery('#list-tasks').append(new_form);
    },
    
    ajax: function(data, callback) {
        'use strict';
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
    trackr.init();
    
    jQuery('body').on("click", '.okay', function() {
        var button =  jQuery(this);
        trackr.ajax({action: 'name', name: 'test'}, function(response) {
            button.addClass('done');
            console.log(response);
        });
    });
});
