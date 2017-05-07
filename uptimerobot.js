/* Magic Mirror
 * Module: MMM-uptimerobot
 *
 * By Simon Crnko
 * MIT Licensed.
 */

Module.register("uptimerobot", {
    defaults: {
        updateInterval: 60000,
        retryDelay: 5000,
        useIcons: false,
        useColors: false,
        maximumEntries: 10,
        statuses: "0-1-2-8-9"
    },

    requiresVersion: "2.1.0", // Required version of MagicMirror

    getStyles: function () {
        return ['uptimerobot.css', 'modules/uptimerobot/css/font-awesome.css'];
    },

    start: function () {
        var self = this;
        var dataRequest = null;

        //Flag for check if module is loaded
        this.loaded = false;
        if (this.config.api_key !== undefined) {
            // Schedule update timer.
            this.getData();
            setInterval(function () {
                self.updateDom();
            }, this.config.updateInterval);
        }
    },

    /*
     * getData
     * function call getData function in node_helper.js
     *
     */
    getData: function () {
        this.sendSocketNotification("uptimerobot-getData", this.config);
    },

    setStatus: function (statusObject, statusForTranslate, statusClass, status) {
        if (!this.config.useIcons) {
            statusObject.innerHTML = this.translate(statusForTranslate);
        } else {
            statusObject.className = statusClass;
        }
        statusObject.className += " " + status;
        if (this.config.useColors) {
            statusObject.className += " colored";
        }
    },

    getStatusTest: function (statusValue) {
        var status = document.createElement('td');
        switch (statusValue) {
            case 0:
                this.setStatus(status, "PAUSED", "fa fa-pause-circle-o", "paused")
                break;
            case 1:
                this.setStatus(status, "NOTCHECKEDYET", "fa fa-retweet", "not-checked-yet");
                break;
            case 2:
                this.setStatus(status, "ONLINE", "fa fa-arrow-circle-up", "online");
                break;
            case 8:
                this.setStatus(status, "SEEMSDOWN", "fa fa-chevron-circle-down", "seems-down");
                break;
            case 9:
                this.setStatus(status, "DOWN", "fa fa-arrow-circle-down", "offline");
                break;
            default:
                return "";
        }
        return status;
    },


    getDom: function () {
        var self = this;

        // create element wrapper for show into the module
        var wrapper = document.createElement("div");
        // If this.dataRequest is not empty
        if (this.dataRequest) {
            var innerTable = document.createElement("table");
            innerTable.className = "small";


            this.dataRequest.monitors.forEach(function (element) {
                // create new row for each item in array
                var tableLine = document.createElement("tr");
                // create a cell in a row for name of server
                var lineCell = document.createElement("td");
                lineCell.className = 'friendlyName';
                lineCell.innerHTML = element.friendly_name;
                tableLine.appendChild(lineCell);
                // add status
                tableLine.appendChild(self.getStatusTest(element.status));

                innerTable.appendChild(tableLine);
            });
            wrapper.appendChild(innerTable);
        } else if (this.config.api_key === undefined) {
            // Missing API KEY
            //var wrapperDataNotification = document.createElement("div");
            // translations  + datanotification
            //wrapperDataNotification.innerHTML = this.translate("MISSING_API_KEY");
            wrapper.appendChild(this.createWrapper("MISSING_API_KEY"));
        } else {
            // Loading
            wrapper.appendChild(this.createWrapper("LOADING"));
        }
        return wrapper;
    },

    createWrapper: function(textToTranslate) {
        var wrapperDataNotification = document.createElement("div");
        // translations  + datanotification
        wrapperDataNotification.innerHTML = this.translate(textToTranslate);
        return wrapperDataNotification;
    },

    getScripts: function () {
        return [];
    },

    // Load translations files
    getTranslations: function () {
        //FIXME: This can be load a one file javascript definition
        return {
            en: "translations/en.json",
            es: "translations/es.json"
        };
    },

    processData: function (data) {
        var self = this;
        this.dataRequest = data;
        if (this.loaded === false) {
            self.updateDom(self.config.animationSpeed);
        }
        this.loaded = true;
    },

    // socketNotificationReceived from helper
    socketNotificationReceived: function (notification, payload) {
        if (notification === "uptimerobot-processData") {
            this.processData(payload);
            this.updateDom();
        }
    }
});
