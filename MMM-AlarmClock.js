/* Magic Mirror
 * Module: MMM-AlarmClock
 *
 * By fewieden https://github.com/fewieden/MMM-AlarmClock
 * MIT Licensed.
 */

Module.register("MMM-AlarmClock", {

    next: null,
    alarmFired: false,

    defaults: {
        sound: 'alarm.mp3',
        touch: false,
        volume: 1.0,
        format: "ddd, h:mmA",
        timer: 60 * 1000 // one minute
    },

    getStyles: function () {
        return ["font-awesome.css", "MMM-AlarmClock.css"];
    },

    getScripts: function() {
        return ["moment.js"];
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.setNextAlarm();
        setInterval(() => {
            this.checkAlarm();
        }, 1000);
        moment.locale(config.language);
    },

    checkAlarm: function(){
        if(!this.alarmFired && this.next && moment().diff(this.next.moment) >= 0){
            var alert = {
                imageFA: 'bell-o',
                title: this.next.sender || this.next.title,
                message: this.next.message
            };
            if(!this.config.touch){
                alert.timer = this.config.timer;
            }
            this.sendNotification("SHOW_ALERT", alert);
            this.alarmFired = true;
            this.updateDom(300);
            this.timer = setTimeout(() => {
                this.resetAlarmClock();
            }, this.config.timer);
            if(this.config.touch){
                MM.getModules().enumerate((module) => {
                    if(module.name === "alert"){
                        module.alerts["MMM-AlarmClock"].ntf.addEventListener("click", () => {
                            clearTimeout(this.timer);
                            this.resetAlarmClock();
                        });
                    }
                });
            }
        }
    },

    setNextAlarm: function(){
        this.next = null;
        for(var i = 0; i < this.config.alarms.length; i++){
            var temp = this.getMoment(this.config.alarms[i]);
            if(!this.next || temp.diff(this.next.moment) < 0){
                this.next = this.config.alarms[i];
                this.next.moment = temp;
            }
        }
    },

    resetAlarmClock: function(){
        this.alarmFired = false;
        if(this.config.touch){
            this.sendNotification("HIDE_ALERT");
        }
        this.setNextAlarm();
        this.updateDom(300);
    },

    getMoment: function(alarm){
        var now = moment();
        var difference = Math.min();
        var hour = parseInt(alarm.time.split(":")[0]);
        var minute = parseInt(alarm.time.split(":")[1]);

        for(var i = 0; i < alarm.days.length; i++){
            if(now.day() < alarm.days[i]){
                difference = Math.min(alarm.days[i] - now.day(), difference);
            } else if(now.day() === alarm.days[i] && (parseInt(now.hour()) < hour || parseInt(now.hour()) === hour && parseInt(now.minute()) < minute)){
                difference = Math.min(0, difference);
            } else if(now.day() === alarm.days[i]){
                difference = Math.min(7, difference);
            } else {
                difference = Math.min(7 - now.day() + alarm.days[i], difference);
            }
        }

        return moment().add(difference, 'days').set({
            hour: hour,
            minute: minute,
            second: 0,
            millisecond: 0
        });
    },



    getDom: function () {

        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.classList.add("align-left");

        var logo = document.createElement("i");
        logo.classList.add("fa", "fa-bell-o", "logo");
        header.appendChild(logo);

        var name = document.createElement("span");
        name.innerHTML = this.translate("ALARM_CLOCK");
        header.appendChild(name);
        wrapper.appendChild(header);

        if (!this.next) {
            var text = document.createElement("div");
            text.innerHTML = this.translate("LOADING");
            text.classList.add("dimmed", "light");
            wrapper.appendChild(text);
        } else if(this.alarmFired) {
            var sound = document.createElement("audio");
            if (this.config.sound.match(/^http/)) {
                sound.src = this.config.sound;
            }else{
                sound.src = this.file("sounds/" + this.config.sound);
            }
            sound.volume = this.config.volume;
            sound.setAttribute("autoplay", true);
            sound.setAttribute("loop", true);
            wrapper.appendChild(sound);
        } else {
            var alarm = document.createElement("div");
            alarm.classList.add("small");
            alarm.innerHTML = this.next.title  + ": " + this.next.moment.format(this.config.format);
            wrapper.appendChild(alarm);
        }

        return wrapper;
    }
});
