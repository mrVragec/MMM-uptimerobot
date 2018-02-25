/* Magic Mirror
 * Node Helper: uptimerobot
 *
 * By Simon Crnko
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        this.config = null;
    },

    // Override socketNotificationReceived method.

    /* socketNotificationReceived(notification, payload)
     * This method is called when a socket notification arrives.
     *
     * argument notification string - The identifier of the noitication.
     * argument payload mixed - The payload of the notification.
     */
    socketNotificationReceived: function (notification, payload) {
        if (notification === "uptimerobot-getData") {
            this.config = payload;
            this.getData();
        }
    },

    /*
     * getData
     * function example return data and show it in the module wrapper
     * get a URL request
     *
     */
    getData: function (config) {
        var self = this;

        var urlApi = "https://api.uptimerobot.com/v2/getMonitors";
        var retry = true;

        var options = {
            method: 'POST',
            url: 'https://api.uptimerobot.com/v2/getMonitors',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                api_key: this.config.api_key,
                format: 'json',
                logs: '0',
                // Limit the max number of records to return for the response.
                limit: this.config.maximumEntries,
                statuses: this.config.statuses
            }
        };
        request(options, function (error, response, body) {
            if (error) {
                retry = false;
                throw new Error(error);
            }
            self.sendSocketNotification("uptimerobot-processData", JSON.parse(body));
            if (retry) {
                self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
            }
        });
    },

    /* scheduleUpdate()
     * Schedule next update.
     *
     * argument delay number - Milliseconds before next update.
     *  If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function (delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        nextLoad = nextLoad;
        var self = this;
        setTimeout(function () {
            self.getData();
        }, nextLoad);
    }

});
