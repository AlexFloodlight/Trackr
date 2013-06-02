var trackr = {
    SEL_LIST_TASKS: '#list-tasks',
    SEL_THE_BUTTON: '#the-button',
    SEL_FINISH: '#button-finish',
    SEL_FINISHED: '#finished',
    SEL_RECORDS: '#records',
    
    jq_list_tasks: {},
    jq_naming_label: {},
    jq_finish_button: {},
    jq_records: {},
    
    audio: {},
    
    init: function() {
        'use strict';
        var jQuery = window.jQuery, 
        the_button, 
        finish_button;
        
        trackr.jq_list_tasks = jQuery(trackr.SEL_LIST_TASKS);
        trackr.jq_finished = jQuery(trackr.SEL_FINISHED);
        trackr.jq_naming_label = jQuery('h2');
        trackr.jq_records = jQuery(trackr.SEL_RECORDS);
        
        trackr.audio = document.getElementById('audio-pop');
        
        the_button = new trackr.TheButton(jQuery(trackr.SEL_THE_BUTTON));
    },
    
    playPop: function() {
        'use strict';
        
        trackr.audio.play();
    },
    
    TheButton: function( jq_button ) {
        'use strict';
        var that = this;
        
        this.jq_button = jq_button;
        
        this.jq_button.click(function() {
            trackr.ajax({action: 'button'}, trackr.buttonAjaxResponse);
            trackr.playPop();
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
        
        trackr.jq_naming_label.fadeIn();
        trackr.jq_list_tasks.append(new_form);
        trackr.setFocus();
        
        trackr.removeFinishButton();
    },
    
    setFocus: function() {
        'use strict';
        trackr.jq_list_tasks.children('li:first-child').find('input[type="text"]').focus();
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
                trackr.setFocus();
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
        this_record_data,
        buildTimeString,
        jq_records_output = jQuery('');
        
        buildTimeString = function buildTimeString(date_object) {
            var hours,
            minutes,
            meridiem;
            
            hours = date_object.getHours();
            minutes = date_object.getMinutes();
            meridiem = 'am';
            
            if (hours > 12) {
                hours = hours - 12;
                meridiem = 'pm';
            }
            
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            
            return hours + ':' + minutes + ' ' + meridiem;
        };
        
        jq_records_output = jQuery('<tbody></tbody>');
        while (record_index--) {
            this_record_data = records[record_index];
            hours = Math.floor(this_record_data.age / 60);
            minutes = this_record_data.age - (hours * 60);
            time_start = new Date(this_record_data.time_start);
            time_end = new Date(this_record_data.time_end);
            
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            
            this_record = jQuery('<tr title="From ' + buildTimeString(time_start) + ' to ' + buildTimeString(time_end) + '"><td>' + hours + ':' + minutes + '</td><td>' + this_record_data.name + '</td></tr>');
            jq_records_output.prepend(this_record);
        }
        trackr.jq_records.find('tbody').replaceWith(jq_records_output);
        
        trackr.jq_records.find('tbody tr').removeClass('odd').filter(':odd').addClass('odd');
        
        trackr.jq_records.fadeIn();
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
});
