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
    
    showRecords: function(records) {
        'use strict';
        var record_index = records.length, 
        jQuery = window.jQuery, 
        this_record,
        hours,
        minutes,
        time_start,
        time_end,
        this_record_data;
        
        while (record_index--) {
            this_record_data = records[record_index];
            hours = Math.floor(this_record_data.age / 60);
            minutes = this_record_data.age - (hours * 60);
            time_start = new Date(this_record_data.time_start);
            time_end = new Date(this_record_data.time_end);
            
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            
            console.log(hours, minutes, time_start, time_end, this_record_data.name);
            this_record = jQuery('<li>' + hours + ':' + minutes + ' - ' + this_record_data.name + '</li>');
            jQuery('#records').append(this_record);
        }
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
        } else if ( response.records.length > 0 ) {
            trackr.showRecords(response.records);
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
    trackr.showRecords([
            {
                age: "1",
                name: "Short",
                time_end: "2013-05-31 18:04:10",
                time_start: "2013-05-31 18:02:51"
            },
            {
                age: "921",
                name: "Long",
                time_end: "2013-06-01 09:37:26",
                time_start: "2013-05-31 18:15:46"
            }
        ]);
});
