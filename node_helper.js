/* MagicMirror²
 * Module: MMM-LINQConnectCalendar
 *
 * By dathbe
 *
 */
const Log = require('logger')
const NodeHelper = require('node_helper')
const moment = require('moment-timezone')

module.exports = NodeHelper.create({

  start: function () {
    Log.log('Starting node_helper for: ' + this.name)
  },

  // Schedule
  scheduleUpdate: function (payload) {
    var self = this
    setInterval(() => {
      self.getData(payload)
    }, payload.config.updateInterval * 60 * 1000)
  },

  async getData(payload) {
    try {
      const startDate = moment().format('MM-DD-YYYY')
      const endDate = moment().add(payload.config.noDays, 'days').format('MM-DD-YYYY')
      const url = `https://api.linqconnect.com/api/FamilyMenu?buildingId=${payload.config.buildingId}&districtId=${payload.config.districtId}&startDate=${startDate}&endDate=${endDate}`
      const response = await fetch(url)
      Log.debug(`[MMM-LINQConnectCalendar] ${url} fetched`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      if (json.AcademicCalendars.length > 0) {
        var calendarObj = json.AcademicCalendars[0].Days
      }
      else {
        calendarObj = null
      }
      this.sendSocketNotification('LINQConnect_Response', {
        calendarObj: calendarObj,
        uniqueId: payload.uniqueId,
      })
    }
    catch (error) {
      Log.error(`[MMM-LINQConnectCalendar] Could not load data: ${error}`)
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'CONFIG') {
      this.getData(payload)
      this.scheduleUpdate(payload)
    }
  },
})
