Module.register('MMM-LINQConnectCalendar', {
  // Default module config.
  defaults: {
    header: 'School Calendar',
    buildingId: null, // Required
    districtId: null, // Required
    noDays: 30,
    maxEntries: 99,
    dateFormat: 'MMM D',
    dateHeader: 'Date',
    eventHeader: 'Event',
    updateInterval: 4 * 60, // 4 hours
  },

  // Define required styles.
  getStyles: function () {
    return ['MMM-LINQConnectCalendar.css']
  },

  // Define required scripts.
  getScripts: function () {
    return ['moment.js']
  },

  // Start the module.
  start: function () {
    Log.info('Starting module: ' + this.name)

    if (this.config.buildingId !== null && this.config.districtId !== null) {
      // Send config to node_helper to start collecting data
      this.sendSocketNotification('CONFIG', { config: this.config, uniqueId: this.identifier })
    }
    else {
      Log.warn('[MMM-LINQConnectCalendar] Unable to display calendar, make sure you have set a buildingId and districtId.  See README for more information.')
    }
  },

  /*   firstLoad: function () {

  },

  notificationReceived: function (notification) {
    if (notification === 'DOM_OBJECTS_CREATED') {
      this.firstLoad()
    }
  }, */

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'LINQConnect_Response' && payload.uniqueId === this.identifier) {
      this.calendarObj = payload.calendarObj
      this.updateDom()
    }
  },

 getHeader: function() {
    if(this.calendarObj !== null && this.calendarObj !== undefined) {
      return this.data.header ? this.data.header : this.config.header;
    } else {
      return null;
    }
	},

  getDom() {
    Log.debug('[MMM-LINQConnectCalendar] Updating DOM')
    const wrapper = document.createElement('div')
    wrapper.className = 'LINQConnectCalendar'

    if (this.calendarObj === undefined) {
      wrapper.innerHTML = 'Loading MMM-LINQConnectCalendar . . .'
      wrapper.classList.add('light', 'small', 'dimmed')
      return wrapper
    }

    if (this.calendarObj !== null) {
      // Create body
      const body = document.createElement('div')

      var calTable = document.createElement('table')
      calTable.classList.add('LINQConnectCalendar-table', 'small')

      // Create header row
      const headerRow = document.createElement('tr')
      headerRow.classList.add('bright')
      const dateTh = document.createElement('th')
      dateTh.innerHTML = this.config.dateHeader
      dateTh.classList.add('dateTh')
      headerRow.appendChild(dateTh)
      const eventTh = document.createElement('th')
      eventTh.innerHTML = this.config.eventHeader
      eventTh.classList.add('eventTh')
      headerRow.appendChild(eventTh)
      calTable.appendChild(headerRow)

      // Create table body
      var self = this
      for (i=0; i < this.calendarObj.length && i < this.config.maxEntries; i++) {
        const tableRow = document.createElement('tr')
        const dateTd = document.createElement('td')
        dateTd.innerHTML = moment(this.calendarObj[i].Date, 'M/D/YYYY').format(self.config.dateFormat)
        dateTd.classList.add('dateTd', 'bright')
        tableRow.appendChild(dateTd)
        const eventTd = document.createElement('td')
        eventTd.innerHTML = this.calendarObj[i].Note
        eventTd.classList.add('eventTd')
        tableRow.appendChild(eventTd)
        if (this.calendarObj[i].Date == moment().format('M/D/YYYY')) {
          dateTd.classList.add('today')
          eventTd.classList.add('today', 'bright')
        }
        calTable.appendChild(tableRow)
      }

      body.appendChild(calTable)
      wrapper.appendChild(body)
    }

    return wrapper
  },
})
