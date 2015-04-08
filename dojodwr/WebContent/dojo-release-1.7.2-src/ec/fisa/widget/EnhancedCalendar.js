/**
 * Calendar customized to provide extended functionality to the dojo calendar.
 * Disables dates by range, day of week, and specific days.
 */
define(
		[ "dojo/_base/declare", "ec/fisa/format/Utils", "dijit/Calendar",
				"dojo/date", "dojo/_base/array", "./_base",
				"ec/fisa/format/Utils" ],
		function(declare, formatUtils, Calendar, dojoDate, array) {

			return declare(
					"ec.fisa.widget.EnhancedCalendar",
					[ Calendar ],
					{
						minDate : "",
						maxDate : "",
						_destroyOnRemove: true,
						/* Dates to disable calendar. ejm: festive days. */
						datesToDisable : [],
						/*
						 * Days of the week to be disabled in the calendar. 0
						 * sunday, 1 monday 2 tuesday 3 wednesday 4 thursday 5
						 * friday 6 saturday
						 */
						daysOfWeekDisable : [],

						minDateD : null,
						maxDateD : null,
						datesToDisableTrans : null,

						constructor : function(args) {
							this.inherited("constructor", arguments);
							this.datesToDisable = args.constraints.datesToDisable;
							this.minDate = args.constraints.minDate;
							this.maxDate = args.constraints.maxDate;
							this.daysOfWeekDisable = args.constraints.daysOfWeekDisable;
							if (this.minDate) {
								this.minDateD = this
										.makeDateResetHour(this.minDate);
							}
							if (this.maxDate) {
								this.maxDateD = this
										.makeDateResetHour(this.maxDate);
							}
							this.datesToDisableTrans = [];
							if (this.datesToDisable) {
								array.forEach(this.datesToDisable, dojo.hitch(
										this, function(entry, i) {
											var d =[];
											
											d.push(this
													.makeDateResetHour(entry[0]));
											d.push(entry[1]);
											this.datesToDisableTrans.push(d);
										}));
							}

						},
						/*
						 * Indicates if a date should be disabled returns a
						 * boolean. This is an override from calendar.
						 */
						isDisabledDate : function(/* Date */date, /* String? */
						locale) {
							var isDisabled = false;

							isDisabled = this.disableRangeDates(date);
							if (isDisabled == false) {
								isDisabled = this.disableByWeekDays(date);
							}
							isDisabled = this.disableEnableByDate(date,
									isDisabled, this.makeDateResetHour);
							return isDisabled;

							// return array.some(this.datesToDisable,
							// function(item) {
							// return dojo.compare(item, date, "date") === 0;
							// });
						},
						/** Make a date from a string. */
						makeDateResetHour : function(/* String */date) {
							var d = ec.fisa.format.utils.parseLongDate(date
									.concat(" 00:00:00.0"));
							d.setHours(0, 0, 0, 0);
							return d;
						},
						/** Disable range of dates. */
						disableRangeDates : function(
						/* Date to be evaluated */date) {
							var isDisabled = false;
							// var date.
							if (this.minDateD) {
								if (dojoDate.compare(date, this.minDateD,
										"date") < 0) {
									isDisabled = true;
								}
							}
							if (this.maxDateD) {
								if (dojoDate.compare(date, this.maxDateD,
										"date") > 0) {
									isDisabled = true;
								}
							}
							return isDisabled;

						},
						/** Disable by the week days. */
						disableByWeekDays : function(
						/* Date to be evaluated */date) {
							var isDisabled = false;
							isDisabled = array.some(this.daysOfWeekDisable,
									function(/* number */entry, i) {
										if (parseInt(entry) == date.getDay()) {
											return true;
										}
										return false;
									});
							return isDisabled;
						},

						/**
						 * Disable by the date. or enabled if it is disabled. by the parameter
						 * this overrides all the others.
						 * (case especial to add work day on non labor days
						 */
						disableEnableByDate : function(
						/* Date to be evaluated */date,/* boolean */
						isDisabled,/* function */makeDateResetHour) {
							if (this.datesToDisableTrans) {
							for(var i=0;i<this.datesToDisableTrans.length;i++){
								var d =	this.datesToDisableTrans[i];
								if (dojoDate.compare(d[0], date,"date") == 0) {
									if(d[1] == "1"){
									return false;
									}
									else{
										return true;
									}
								}
							}
//								isDisabled = array.some(
//										this.datesToDisableTrans, function(
//												/* number */entry, i) {
//											if (dojoDate.compare(entry, date,
//													"date") == 0) {
//												return !isDisabled;
//											}
//											return isDisabled;
//										});
							}
							return isDisabled;
						}
					});
		});
