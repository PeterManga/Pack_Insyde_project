const express = require('express');
const router = express.Router();
const calendarController = require('../controller/calendar.controller')
const authRequired = require('../middlewares/auth.middleware')

//rutas get
router.get('/calendars',authRequired, calendarController.getAllCalendars);
router.get('/calendarplayer',authRequired, calendarController.findCalendarByPlayer);
router.get('/calendar/:id',authRequired, calendarController.getCalendar)
router.get('/downloadcalendar/',authRequired, calendarController.downloadPlaylist)
router.get('/calendarevent', calendarController.getActiveEvent);

//rutas post
router.post('/calendar',authRequired, calendarController.createCalendar)

//rutas update
router.put('/calendar/:id',authRequired, calendarController.updateCalendar)

//rutas delete
router.delete('/calendar/:id',authRequired, calendarController.deleteCalendar)

//exportamos
module.exports = router