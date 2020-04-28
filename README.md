# MMM-AlarmClock [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/fewieden/MMM-AlarmClock/master/LICENSE) [![Build Status](https://travis-ci.org/fewieden/MMM-AlarmClock.svg?branch=master)](https://travis-ci.org/fewieden/MMM-AlarmClock) [![Code Climate](https://codeclimate.com/github/fewieden/MMM-AlarmClock/badges/gpa.svg?style=flat)](https://codeclimate.com/github/fewieden/MMM-AlarmClock) [![Known Vulnerabilities](https://snyk.io/test/github/fewieden/mmm-alarmclock/badge.svg)](https://snyk.io/test/github/fewieden/mmm-alarmclock)

Alarm Clock Module for MagicMirror<sup>2</sup>

## Example

![Active alarm](.github/example.jpg)   ![Scheduled alarm](.github/example2.jpg)

## Dependencies

* An installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)

## Installation

* Clone this repo into `~/MagicMirror/modules` directory.
* Configure your `~/MagicMirror/config/config.js`:

```js
{
    module: 'MMM-AlarmClock',
    position: 'top_right',
    config: {
        alarms: [
            {time: "18:30", days: [2,4], title: "Soccer", message: "Get ready for soccer training!", sound: "alarm.mp3"},
            ...
        ],
        ...
    }
}
```

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `alarms` | `REQUIRED` | An Array with all your alarms as objects. Those objects need to have the properties -> time: 24h format, days: Array of all days the alarm should be fired (0 = Sunday, 6 = Saturday), title, message, and sound. If sound is not defined, alarm will be fired with module defined/default alarm sound. |
| `sound` | `'alarm.mp3'` | Name and extension of your alarm sound. File needs to be placed in `~/MagicMirror/modules/MMM-AlarmClock/sounds`. Standard files are `alarm.mp3` and `blackforest.mp3`.  Alternatively specify a web stream `http` or `https`. |
| `volume` | `1.0` | The volume of the alarm sound in a range from `0.0` to `1.0` |
| `touch` | `false` | If you are using a touch screen device you need to press a button to disable an alarm.. |
| `format` | `'ddd, h:mmA'` | In which format the alarm in the header should be displayed. [All Options](http://momentjs.com/docs/#/displaying/format/) |
| `timer` | `60000` (1 min) | How long the alarm should ring for non touch screen or without interaction on touch screen devices. |
| `fade` | `false` | Set to enable a gradual fade-in of the alarm sound. |
| `fadeTimer` | `60 * 1000` (1 min) | How long to fade into the alarm before `volume` is set. |
| `fadeStep` | `.005` (.5%) | Increase the volume this percent amount each second until `fadeTimer` is reached. |
| `popup` | `true` | Flag to show alert popup or not. |

## Alarm Options

| **Option**| **Description** |
| --- | --- |
| `time` | Time at which the alarm should sound. |
| `days` | Days of the week. <br/>``0 => Sunday, 1 => Monday, 2 => Tuesday, 3 => Wednesday, 4 => Thursday, 5 => Friday, 6 => Saturday``<br/><br/>**Example :** ``[1, 2, 3, 4, 5], // From Monday to Friday.`` |
| `title` |  Title that will be displayed in the alert. |
| `message` | Message of the alarm |
| `sound` | Name or the url of the mp3 file. By default, the sound of the config will be use if this option is empty. |
| `timer` | Timer when the alarm will end. By default, the timer of the configuration will be used. |

## Alarm Sounds

There are already two alarm sounds:

* [alarm.mp3](http://www.orangefreesounds.com/mp3-alarm-clock/) | From Alexander licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
* [blackforest.mp3](http://www.orangefreesounds.com/coo-coo-clock-sound/) | From Alexander licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

## Developer

* `npm run lint` - Lints JS and CSS files.
* `npm run docs` - Generates documentation.
