/**
 * @file MMM-AlarmClock.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/MMM-AlarmClock
 */

/* global Module Log moment config MM */

/**
 * @external Module
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/module.js
 */

/**
 * @external Log
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/logger.js
 */

/**
 * @external moment
 * @see https://www.npmjs.com/package/moment
 */

/**
 * @external config
 * @see https://github.com/MichMich/MagicMirror/blob/master/config/config.js.sample
 */

/**
 * @external MM
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/main.js
 */

/**
 * @module MMM-AlarmClock
 * @description Frontend for the module to display data.
 *
 * @requires external:Module
 * @requires external:Log
 * @requires external:moment
 * @requires external:config
 * @requires external:MM
 */
Module.register('MMM-AlarmClock', {

    /** @member {?Object} next - Contains the next alarm object. */
    next: null,
    /** @member {boolean} alarmFired - Flag that indicates if there is a alarm firing right now. */
    alarmFired: false,

    /** @member {?Timeout} timer - Fires resetAlarmClock */
    timer: null,
    /** @member {?Interval} fadeInterval - Fades in the alarm volume. */
    fadeInterval: null,

    /**
     * @member {Object} defaults - Defines the default config values.
     * @property {string} sound - Alarm sound file.
     * @property {boolean} touch - Flag to enable touch support.
     * @property {number} volume - Alarm sound volume.
     * @property {string} format - Alarm datetime format to display in UI.
     * @property {int} timer - Alarm sound duration.
     * @property {boolean} fade - Flag to fade in alarm sound volume.
     * @property {int} fadeTimer - Fade in duration.
     * @property {number} fadeStep - Fade in volume steps.
     */
    defaults: {
        sound: 'alarm.mp3',
        touch: false,
        volume: 1.0,
        format: 'ddd, h:mmA',
        timer: 60 * 1000, // one minute
        fade: false,
        fadeTimer: 60 * 1000, // 60 seconds
        fadeStep: 0.005 // 0.5%
    },

    /**
     * @function getStyles
     * @description Style dependencies for this module.
     * @override
     *
     * @returns {string[]} List of the style dependency filepaths.
     */
    getStyles() {
        return ['font-awesome.css', 'MMM-AlarmClock.css'];
    },

    /**
     * @function getScripts
     * @description Script dependencies for this module.
     * @override
     *
     * @returns {string[]} List of the script dependency filepaths.
     */
    getScripts() {
        return ['moment.js'];
    },

    /**
     * @function getTranslations
     * @description Translations for this module.
     * @override
     *
     * @returns {Object.<string, string>} Available translations for this module (key: language code, value: filepath).
     */
    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json',
            fr: 'translations/fr.json',
            id: 'translations/id.json'
        };
    },

    /**
     * @function start
     * @description Sets first alarm and creates interval to check the alarm event.
     * @override
     */
    start() {
        Log.info(`Starting module: ${this.name}`);
        this.setNextAlarm();
        setInterval(() => {
            this.checkAlarm();
        }, 1000);
        moment.locale(config.language);
    },

    /**
     * @function checkAlarm
     * @description Checks the alarm event and triggers the alert.
     */
    checkAlarm() {
        if (!this.alarmFired && this.next && moment().diff(this.next.moment) >= 0) {
            const alert = {
                imageFA: 'bell-o',
                title: this.next.sender || this.next.title,
                message: this.next.message
            };
            if (!this.config.touch) {
                alert.timer = this.config.timer;
            }
            this.sendNotification('SHOW_ALERT', alert);
            this.alarmFired = true;
            this.updateDom(300);
            this.timer = setTimeout(() => {
                this.resetAlarmClock();
            }, this.config.timer);
            if (this.config.touch) {
                MM.getModules().enumerate((module) => {
                    if (module.name === 'alert') {
                        module.alerts['MMM-AlarmClock'].ntf.addEventListener('click', () => {
                            clearTimeout(this.timer);
                            clearTimeout(this.fadeInterval);
                            this.resetAlarmClock();
                        });
                    }
                });
            }
        }
    },

    /**
     * @function fadeAlarm
     * @description Fades in the alarm sound step by step.
     */
    fadeAlarm() {
        let volume = 0;
        let counter = 0;
        this.fadeInterval = setInterval(() => {
            const player = document.getElementById('MMM-AlarmClock-Player');
            player.volume = volume;
            volume += this.config.fadeStep;
            counter += 1000;
            if (volume >= this.config.volume || counter >= this.config.fadeTimer) {
                player.volume = this.config.volume;
                clearInterval(this.fadeInterval);
            }
        }, 1000);
    },

    /**
     * @function setNextAlarm
     * @description Sets the next occurring alarm event.
     */
    setNextAlarm() {
        this.next = null;
        for (let i = 0; i < this.config.alarms.length; i += 1) {
            const temp = this.getMoment(this.config.alarms[i]);
            if (!this.next || temp.diff(this.next.moment) < 0) {
                this.next = this.config.alarms[i];
                this.next.moment = temp;
            }
        }
    },

    /**
     * @function resetAlarmClock
     * @description Resets the alarm clock.
     */
    resetAlarmClock() {
        this.alarmFired = false;
        if (this.config.touch) {
            this.sendNotification('HIDE_ALERT');
        }
        this.setNextAlarm();
        this.updateDom(300);
    },

    /**
     * @function getMoment
     * @description Creates a moment object based on alarm event.
     *
     * @param {Object} alarm - Alarm event.
     * @param {string} alarm.time - Alarm event time.
     * @param {int[]} alarm.days - Weekdays the alarm event occurrs.
     *
     * @returns {Object} Moment object for the next occurrence of this alarm event.
     *
     * @example <caption>alarm object</caption>
     * {
     *      time: "18:30",
     *      days: [2,4],
     *      title: "Soccer",
     *      message: "Get ready for soccer training!"
     * }
     */
    getMoment(alarm) {
        const now = moment();
        let difference = Math.min();
        const hour = parseInt(alarm.time.split(':')[0]);
        const minute = parseInt(alarm.time.split(':')[1]);

        for (let i = 0; i < alarm.days.length; i += 1) {
            if (now.day() < alarm.days[i]) {
                difference = Math.min(alarm.days[i] - now.day(), difference);
            } else if (now.day() === alarm.days[i] && (parseInt(now.hour()) < hour ||
                (parseInt(now.hour()) === hour && parseInt(now.minute()) < minute))) {
                difference = Math.min(0, difference);
            } else if (now.day() === alarm.days[i]) {
                difference = Math.min(7, difference);
            } else {
                difference = Math.min((7 - now.day()) + alarm.days[i], difference);
            }
        }

        return moment().add(difference, 'days').set({
            hour,
            minute,
            second: 0,
            millisecond: 0
        });
    },

    /**
     * @function getDom
     * @description Creates the UI as DOM for displaying in MagicMirror application.
     * @override
     *
     * @returns {Element}
     */
    getDom() {
        const wrapper = document.createElement('div');
        const header = document.createElement('header');
        header.classList.add('align-left');

        const logo = document.createElement('i');
        logo.classList.add('fa', 'fa-bell-o', 'logo');
        header.appendChild(logo);

        const name = document.createElement('span');
        name.innerHTML = this.translate('ALARM_CLOCK');
        header.appendChild(name);
        wrapper.appendChild(header);

        if (!this.next) {
            const text = document.createElement('div');
            text.innerHTML = this.translate('LOADING');
            text.classList.add('dimmed', 'light');
            wrapper.appendChild(text);
        } else if (this.alarmFired) {
            const sound = document.createElement('audio');
            sound.setAttribute('id', 'MMM-AlarmClock-Player');
            if (this.config.sound.match(/^https?:\/\//)) {
                sound.src = this.config.sound;
            } else {
                sound.src = this.file(`sounds/${this.config.sound}`);
            }
            sound.volume = this.config.fade ? 0 : this.config.volume;
            sound.setAttribute('autoplay', true);
            sound.setAttribute('loop', true);
            if (this.config.fade === true) {
                this.fadeAlarm();
            }
            wrapper.appendChild(sound);
        } else {
            const alarm = document.createElement('div');
            alarm.classList.add('small');
            alarm.innerHTML = `${this.next.title}: ${this.next.moment.format(this.config.format)}`;
            wrapper.appendChild(alarm);
        }

        return wrapper;
    }
});
