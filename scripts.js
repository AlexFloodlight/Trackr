var trackr = {
    SEL_LIST_TASKS: '#list-tasks',
    SEL_THE_BUTTON: '#the-button',
    SEL_FINISH: '#button-finish',
    SEL_FINISHED: '#finished',
    
    jq_list_tasks: {},
    
    jq_finish_button: {},
    
    init: function() {
        'use strict';
        var jQuery = window.jQuery, the_button, finish_button;
        
        trackr.jq_list_tasks = jQuery(trackr.SEL_LIST_TASKS);
        trackr.jq_finished = jQuery(trackr.SEL_FINISHED);
        
        the_button = new trackr.TheButton(jQuery(trackr.SEL_THE_BUTTON));
    },
    
    TheButton: function( jq_button ) {
        'use strict';
        var that = this;
        
        this.jq_button = jq_button;
        
        this.jq_button.click(function() {
            trackr.ajax({action: 'button'}, trackr.buttonAjaxResponse);
        });
    },
    
    createFinishButton: function() {
        'use strict';
        var jQuery = window.jQuery, finish_button;
        
        if (jQuery(trackr.SEL_FINISH).length > 0 || trackr.jq_list_tasks.children().length > 0) {
            return;
        }
        
        trackr.jq_finish_button = jQuery('<div id="button-finish">Finish</div>')
            .hide()
            .fadeIn(250)
            .click(trackr.ajaxFinish);
        
        trackr.jq_finished.append(trackr.jq_finish_button);
    },
    
    removeFinishButton: function() {
        'use strict';
        var jQuery = window.jQuery;
        
        if (trackr.jq_finish_button.length > 0) {
            trackr.jq_finish_button.fadeOut(250, function() {
                trackr.jq_finish_button.remove();
            });
        }
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
        trackr.removeFinishButton();
    },
    
    NamingField: function( jq_li ) {
        'use strict';
        var that = this;
        this.jq_li = jq_li;
        this.jq_ok = jq_li.find('.okay');
        this.jq_form = jq_li.find('form');
        this.jq_input = jq_li.find('input[type="text"]');
        this.FADE_TIME = 250;
        
        this.jq_form.submit(function() {
            that.submit();
            return false;
        });
        this.jq_ok.click(function() {
            that.submit();
        });
        
        trackr.NamingField.prototype.submit = function() {
            var that = this;
            if (that.jq_input.val() !== '') {
                trackr.ajax({action: 'name', id: that.jq_input.attr('name'), name: that.jq_input.val()}, function(response) {
                    that.finish();
                });
            }
        };
        trackr.NamingField.prototype.finish = function() {
            var that = this;
            that.jq_ok.addClass('done');
            setTimeout(that.remove(), 250);
        };
        trackr.NamingField.prototype.remove = function() {
            var that = this;
            that.jq_li.fadeOut(that.FADE_TIME, function() {
                that.jq_li.remove();
                trackr.createFinishButton();
            });
        };
        
        return this;
    },
    
    buttonAjaxResponse: function(response) {
        'use strict';
        if ( response.time || response.track_id ) {
            trackr.createNewInput(response);
        }
    },
    
    finish: function(response) {
        'use strict';
        var not_ready;
        
        trackr.removeFinishButton();
        
        if ( response.type_reponse === 'last_record' ) {
            trackr.createNewInput(response);
        } else {
            console.log(response);
        }
    },
    ajaxFinish: function() {
        'use strict';
        trackr.ajax({action: 'finish'}, trackr.finish);
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
