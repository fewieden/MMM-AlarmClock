/* global Module Log config moment MM */

/* Magic Mirror
 * Module: MMM-AlarmClock
 *
 * By fewieden https://github.com/fewieden/MMM-AlarmClock
 * MIT Licensed.
 */

Module.register('MMM-AlarmClock', {

    next: null,
    alarmFired: false,

    defaults: {
        sound: 'alarm.mp3',
        touch: false,
        volume: 1.0,
        format: 'ddd, h:mmA',
        timer: 60 * 1000 // one minute
    },

    getStyles() {
        return ['font-awesome.css', 'MMM-AlarmClock.css'];
    },

    getScripts() {
        return ['moment.js'];
    },

    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.setNextAlarm();
        setInterval(() => {
            this.checkAlarm();
        }, 1000);
        moment.locale(config.language);
    },

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
            this.sendNotification('MMM-TTS', 'This is an AlarmClock event. Please stay tuned!'); // MMM-TTS integration
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
                            this.resetAlarmClock();
                        });
                    }
                });
            }
        }
    },

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

    resetAlarmClock() {
        this.alarmFired = false;
        if (this.config.touch) {
            this.sendNotification('HIDE_ALERT');
        }
        this.setNextAlarm();
        this.updateDom(300);
    },

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

    getDom() {
        const wrapper = document.createElement('div');
        const header = document.createElement('header');
        //header.classList.add('align-right');

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
            srcSound = null;
            if (this.next.sound) {
              if (this.next.sound.match(/^https?:\/\//)) {
                  srcSound = this.next.sound;
              } else {
                  srcSound = this.file(`sounds/${this.next.sound}`);
              }
            }
            else {
              if (this.config.sound.match(/^https?:\/\//)) {
                  srcSound = this.config.sound;
              } else {
                  srcSound = this.file(`sounds/${this.config.sound}`);
              }
            }
            sound.src = srcSound;
            sound.volume = this.config.volume;
            sound.setAttribute('autoplay', true);
            sound.setAttribute('loop', true);
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
