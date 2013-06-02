var trackr = {
    SEL_LIST_TASKS: '#list-tasks',
    SEL_THE_BUTTON: '#the-button',
    SEL_FINISH: '#button-finish',
    SEL_FINISHED: '#finished',
    SEL_RECORDS: '#records',
    SEL_POPUPS: '#popups',
    SEL_BG_POPUPS: '#bg-popups',
    SEL_MESSAGES: '#messages',

    popups: [],
    
    jq_list_tasks: {},
    jq_naming_label: {},
    jq_finish_button: {},
    jq_records: {},
    jq_popups: {},
    jq_bg_popups: {},
    jq_messages: {},
    
    audio: {},
    
    init: function() {
        'use strict';
        var jQuery = window.jQuery, 
        the_button, 
        finish_button,
        welcome_message;
        
        trackr.jq_list_tasks = jQuery(trackr.SEL_LIST_TASKS);
        trackr.jq_finished = jQuery(trackr.SEL_FINISHED);
        trackr.jq_naming_label = jQuery('h2');
        trackr.jq_records = jQuery(trackr.SEL_RECORDS);
        trackr.jq_popups = jQuery(trackr.SEL_POPUPS);
        trackr.jq_bg_popups = jQuery(trackr.SEL_BG_POPUPS);
        trackr.jq_messages = jQuery(trackr.SEL_MESSAGES);
        
        trackr.jq_bg_popups.click(trackr.closePopups);
        
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
    
    Popup: function( message ) {
        'use strict';
        var that = this,
        jQuery = window.jQuery;
        
        this.message = message;
        this.TIME_FADE = 250;
        
        this.jq_popup = jQuery('<div>' + message + '<div class="close">&times;</div></div>').hide();
        this.jq_close = this.jq_popup.find('.close');
        
        this.jq_close.click(function() {
            that.close();
        });
        
        trackr.Popup.prototype.add = function add() {
            var height;
            trackr.jq_bg_popups.fadeIn(this.TIME_FADE);
            trackr.jq_popups.append(this.jq_popup);
            this.jq_popup.css({
                'margin-top' : -(this.jq_popup.outerHeight(true) / 2)
            });
            this.jq_popup.fadeIn(this.TIME_FADE);
        };
        trackr.Popup.prototype.close = function close() {
            var that = this;
            trackr.jq_bg_popups.fadeOut(this.TIME_FADE);
            this.jq_popup.fadeOut(this.TIME_FADE, function() {
                that.remove();
            });
        };
        trackr.Popup.prototype.remove = function remove() {
            this.jq_popup.remove();
        };
        
        this.add();
        trackr.popups.push(this);
        
        return this;
    },
    
    closePopups: function() {
        'use strict';
        var popup_index = trackr.popups.length;
        
        while (popup_index--) {
            trackr.popups[popup_index].close();
        }
    },
    
    Message: function( message ) {
        'use strict';
        var that = this,
        jQuery = window.jQuery;
        
        this.message = message;
        this.TIME_FADE = 250;
        this.DELAY = 1500;
        
        this.jq_message = jQuery('<div>' + message + '</div>').hide();
        this.jq_message.click(function() {
            that.close();
        });
        
        this.timer = setTimeout(function() {
            that.close();
        }, this.DELAY);
        
        trackr.Message.prototype.add = function add() {
            trackr.jq_messages.append(this.jq_message);
            this.jq_message.fadeIn(this.TIME_FADE);
        };
        trackr.Message.prototype.close = function close() {
            var that = this;
            this.jq_message.fadeOut(this.TIME_FADE, function() {
                that.remove();
            });
        };
        trackr.Message.prototype.remove = function remove() {
            this.jq_message.remove();
        };
        
        this.add();
        
        return this;
    },
    
    buttonAjaxResponse: function(response) {
        'use strict';
        var message;
        
        if ( response.time || response.track_id ) {
            trackr.createNewInput(response);
        } else {
            message = new trackr.Message('Started');
        }
    },
    
    finish: function(response) {
        'use strict';
        var not_ready,
        popup;
        
        trackr.removeFinishButton();
        
        if ( response.type_response === 'last_record' ) {
            trackr.createNewInput(response);
        } else if ( response.type_response ) {
            if ( response.records.length > 0 ) {
                trackr.showRecords(response.records);
            } else {
                popup = new trackr.Popup('<p>All of your tracked times were less than a minute.</p><p>Slow down next time!</p>');
            }
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
    var message;
    
    trackr.init();
});
