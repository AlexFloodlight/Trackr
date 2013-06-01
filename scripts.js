var trackr = {
    SEL_LIST_TASKS: '#list-tasks',
    SEL_THE_BUTTON: '#the-button',
    
    jq_list_tasks: {},
    
    init: function() {
        'use strict';
        var jQuery = window.jQuery, the_button;
        
        trackr.jq_list_tasks = jQuery(trackr.SEL_LIST_TASKS);
        
        the_button = new trackr.TheButton(jQuery(trackr.SEL_THE_BUTTON));
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
        var jQuery = window.jQuery, 
        new_form, 
        time, 
        time_str, 
        hours,
        minutes,
        meridiem,
        field;
        
        time = new Date(response.time * 1000);
        
        hours = time.getHours();
        
        meridiem = 'am';
        if (hours > 12) {
            hours = hours - 12;
            meridiem = 'pm';
        }
        
        minutes = time.getMinutes();
        
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        
        time_str = hours + ':' + minutes + ' ' + meridiem;
        
        new_form = jQuery('<li><form><input type="text" name="' + response.track_id + '" placeholder="At ' + time_str + '" /><div class="okay icon-ok">&nbsp;</div><input type="submit" /></form></li>');
        field = new trackr.NamingField(new_form);
        trackr.jq_list_tasks.append(new_form);
    },
    
    NamingField: function( jq_li ) {
        'use strict';
        var that = this, console = window.console;
        this.jq_li = jq_li;
        this.jq_ok = jq_li.find('.okay');
        this.jq_form = jq_li.find('form');
        this.jq_input = jq_li.find('input[type="text"]');
        this.FADE_TIME = 250;
        
        this.jq_form.submit(function() {
            that.submit();
        });
        this.jq_ok.click(function() {
            that.submit();
        });
        
        trackr.NamingField.prototype.submit = function() {
            if (that.jq_input.val() !== '') {
                trackr.ajax({action: 'name', id: that.jq_input.attr('name'), name: that.jq_input.val()}, function(response) {
                    that.finish();
                });
            }
            return false;
        };
        trackr.NamingField.prototype.finish = function() {
            that.jq_ok.addClass('done');
            setTimeout(that.remove, 250);
        };
        trackr.NamingField.prototype.remove = function() {
            that.jq_li.fadeOut(that.FADE_TIME);
        };
        
        return this;
    },
    
    ajax: function(data, callback) {
        'use strict';
        var jQuery = window.jQuery;
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
    'use strict';
    trackr.init();
});
