/**
 * Dependency: jQuery
 * This API will use to fetch My Entitlements and based on the grouping show it on Tabular Format.
 * Search, Sorting Column Header are part of the API
 * @author Abhisek DasGupta <abhdasgu@cisco.com>
 */

(function(window, document, jQuery, undefined) {
	'use strict';

	window.dtArray = []; // Array to store the data required for jQuery Data-Table.
	window.dt; // jQuery Data-Table Instance
	var CLS_DT_DOWN_ARROW = "dt-arrow-down";
	var CLS_DT_RIGHT_ARROW = "dt-arrow-right";
	var CLS_DT_RIGHT_ARROW_DARK = "dt-arrow-right-dark";
	var CLS_DT_DOWN_ARROW_DARK = "dt-arrow-down-dark";

	/**
	 * @namespace MyEntitlements
	 */
	var MyEntitlements = makeClass(

		{

			/**
			 * Group Courses by Acronym
			 * @param {Array} courses - Entitled courses for the instructor
			 * @return {Promise} Courses grouped by acronym
			 */
			_groupingByAcronym: function(courses) {
				var deferred = Q.defer();
				var courses = courses;
				var acronymList = [];
				for (var i = 0; i < courses.length; i++) {
					var val = acronymList.indexOf(courses[i].acronym);
					if (val != -1) {
						var len = this.groupCourse[courses[i].acronym].length;
						this.groupCourse[courses[i].acronym][len] = courses[i];
					} else {
						acronymList.push(courses[i].acronym);
						this.groupCourse[courses[i].acronym] = new Array();
						this.groupCourse[courses[i].acronym][0] = courses[i];

					}
				}

				deferred.resolve(this.groupCourse);
				return deferred.promise;
			},

			/**
			 * Group courses by minior version eg 1.2, 1.3 will be grouped separately.
			 * @param {Array} courses - Courses grouped by acronym
			 * @return {Promise} - Return courses by minor version
			 */
			_groupByMinorVersion: function(courses) {
				var deferred = Q.defer();
				for (var acronym in courses) {
					var acronyModule = courses[acronym];
					for (var prop in acronyModule) {
						var minor_version = acronyModule[prop].version.slice(0, 3);
						if (acronyModule[prop].skuUpdateStatus == 3) {
							if (!_.isEmpty(this.courseModule[acronym])) {
								if (typeof(this.courseModule[acronym][minor_version]) == "undefined") {
									this.courseModule[acronym][minor_version] = new Array(); // create minor version array
									this.courseModule[acronym][minor_version].push(acronyModule[prop]);
								} else
									this.courseModule[acronym][minor_version].push(acronyModule[prop]);
							} else {

								this.courseModule[acronym] = new Object(); // creating acronym object
								this.courseModule[acronym][minor_version] = new Array(); // create minor version array
								this.courseModule[acronym][minor_version].push(acronyModule[prop]);
							}
						}

					}
				}

				deferred.resolve(this.courseModule);
				return deferred.promise;
			},
			/**
			 * Sort version by minor version eg 1.0, 1.1, 1.2 will show in order.
			 * @param {Array} courses - Courses grouped by minor version
			 * @return {Promise} - Return courses sort by minor version
			 */
			_sortMinorVersion: function() {

				var deferred = Q.defer();

				for (var acronym in this.courseModule) {
					var acronyModule = this.courseModule[acronym]
					for (var prop in acronyModule) {
						var md = acronyModule[prop];
						md.sort(function(a, b) {
							var aAr = a.version.split('.');
							var bAr = b.version.split('.');
							if (aAr.length == 3 && bAr.length == 3) {
								var val_a = parseInt(aAr[2]) * 1 +
									parseInt(aAr[1]) * 1000 +
									parseInt(aAr[0]) * 1000 *
									1000;
								var val_b = parseInt(bAr[2]) * 1 +
									parseInt(bAr[1]) * 1000 +
									parseInt(bAr[0]) * 1000 *
									1000;

								return (val_b > val_a) ? 1 : -1;
							}
							return 0;
						});
					}
				}

				deferred.resolve(this.courseModule);
				return deferred.promise;
			},
			/**
			 * Sort Minor Version by lastAccessedDate
			 * @param {Array} courses - Courses grouped by minor version
			 */
			_sortMinorVersionBylastAccessed: function(courses) {
				var deferred = Q.defer();

				for (var acronym in courses) {
					var acronyModule = courses[acronym]
					for (var prop in acronyModule) {
						var md = acronyModule[prop];
						if (md.length > 1) {
							md.sort(function(a, b) {
								var date1 = new Date(a.lastAccessedDate);
								var date2 = new Date(b.lastAccessedDate);
								return date2 - date1;

							});
						}

					}
				}

				deferred.resolve(this.courseModule);
				return deferred.promise;
			},
			/**
			 * Build the data for the jQuery DataTable
			 */
			_buildDataTableData: function(courses) {

				dtArray = [];
				window.dt = [];
				var deferred = Q.defer();

				for (var acronym in courses) {
					var acronyModule = courses[acronym];
					for (var prop in acronyModule) {
						var module = acronyModule[prop];
						dtArray.push(module[0]);
					}
				}

				var sortedDates = dtArray.sort(function(a, b) {

					var date1 = new Date(a.lastAccessedDate);
					var date2 = new Date(b.lastAccessedDate);

					if (date1 > date2) return -1;
					if (date1 < date2) return 1;
					return 0;

				});


				deferred.resolve(sortedDates);
				return deferred.promise;
			},
			/**
			 * Function responsible for grouping by acronym,minor-version & sorting.
			 * @param {Array} contents - Entitled courses for the instructor
			 */
			_displayContents: function(contents) {

				var self = this;
				return self._groupingByAcronym(contents)
					.then(function(courses) {
						//self._log("Group By acronym MyEntitlements ==> ", courses);
						return self._groupByMinorVersion(courses)
					})
					.then(function(courses) {
						//self._log("Group By minor version MyEntitlements ==> ", courses);
						return self._sortMinorVersionBylastAccessed(courses);
					})
					.then(function(courses) {
						//self._log("Sorting lastAccessed under each minor version group MyEntitlements==> ", courses);
						return self._buildDataTableData(courses);
					})
					.fail(function(err) {
						console.log("Error --", err);
					});
			},
			/**
			 * Initialization of DataTable
			 * Date Format Sorting - https://datatables.net/blog/2014-12-18
			 * @param {Array} data - Entitled courses for the instructor
			 */
			_inializeDataTable: function(data) {

				var self = this;
				$.extend($.fn.dataTable.defaults, {
					searching: false,
					ordering: false
				});
				//$.fn.dataTable.ext.errMode = 'none';
				$.fn.dataTable.moment('MM/DD/YYYY');
				dt = $('#myentitlement').DataTable({
					"language": {
						"search": String($("#searchLabel").html())
					},
					"rowCallback": function(row, data, index) {

						var lastColumn = $(row).children()[3];
						$(lastColumn).attr('data-sort', data.lastAccessedDate);

						if (index % 2 == 0) {
							$(row).removeClass('myodd myeven');
							$(row).addClass('myodd');
						} else {
							$(row).removeClass('myodd myeven');
							$(row).addClass('myeven');
						}
					},
					data: data,
					"autoWidth": false,
					fixedColumns: true,
					"columnDefs": self._columnDefsDT(),
					columns: self._columnsDT(),
					"bPaginate": false,
					ordering: true,
					searching: true,
					"order": [
						[3, 'desc']
					]
				});
			},

			/**
			 * OnClick of Supplemental list icon show pop with list of files.
			 */
			_showSupplementalFileList: function() {
				var self = this;

				$('[data-toggle="tooltip"]').tooltip();   
				
				$('#supplementalFilepopupclose').on("click", function(event){
					$("#account").removeClass("bodyOnPopup");
					$('#supplementalFileTable').DataTable().clear().destroy();
					$(".updateOverlay").removeClass("open");
					$("#supplementalFilePopup").hide();	
				});

				$("#myentitlement tbody").off("click", "div.supplemental-text a");

				$("#myentitlement tbody").on("click", "div.supplemental-text a", function(){
					var obj = this;

					self._loadSupplementalFiles(obj).then(function(result){

						window.scrollTo(0, 0);
						self._setSupplementalFileJSON(result, obj);
						$('.updateOverlay').addClass('open');
						$("#account").addClass("bodyOnPopup");
						$("#supplementalFilePopup").show();
					}).fail(function(err){
						window.location = window.location.origin;
					});
				});

			},

			_setSupplementalFileJSON: function(data, obj) {
				
				var self = this;
				var acronym = $(obj).attr("data-acronym");
				var version = $(obj).attr("data-version").slice(0, 3);

				$('#supplementalFileTable').DataTable({
					data: data,
					"autoWidth": true,
					"columnDefs":{"width": "80%"},
					"language": {
						"emptyTable": String($("#supplementalFilesEmptyDiv").html())
					},
					columns : [
						{
							className:'downloadSupplementalFile',
							render: function(data, type, row, meta) {
								var fileName = row.replace(/^downloadsupplementalfile.*?\//g,'');
								var res = fileName.replace(acronym+"-", "");
								var finalRes = res.replace(version.slice(0,3)+"-", "");
								return '<a href="#">' + finalRes + '</a>';
							}
						}
					],
					"drawCallback": function( settings ) {
						$("#supplementalFileTable thead").remove();
					},
					bPaginate: false,
					bInfo : false,
					bSort : false,
					searching : false
				});

				$("#supplementalFileTable tbody").off("click", ".downloadSupplementalFile");

				$('#supplementalFileTable tbody').on( 'click', '.downloadSupplementalFile', function () {

					var fileName = $("#supplementalFileTable").DataTable().row($(this).closest("tr")).data().replace(/^downloadsupplementalfile.*?\//g,'');;

					var token = $("meta[name='_csrf']").attr("content");
					var header = $("meta[name='_csrf_header']").attr("content");

					$.ajax({
						url: "/downloadsupplementalfile",
						type: 'POST',
						datatype: 'json',
						data:{
							fileName: fileName
						},
						beforeSend: function(xhr) {
							xhr.setRequestHeader(header, token);
						},
						success: function(response) {
							response = JSON.parse(response);
							self._getDownloadUrl(response.URL, fileName);
						},
						error: function(){
							window.location = window.location.origin;
						}
					});
				})
			},

			_getDownloadUrl(url, fileName){
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");

				$.ajax({
					url: url,
					type: 'POST',
					datatype: 'json',
					data:{
						fileName: fileName.replace(/\ /g,'+')
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader(header, token);
					},
					success: function(response) {
						window.open(response.url, "_self");
					},
					error: function(){
						window.location = window.location.origin;
					}
				});
			},

			_loadSupplementalFiles: function(obj) {
				var self = this;

				var deferred = Q.defer();
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				$.ajax({
					url: "/api/supplementalfiles",
					type: 'POST',
					datatype: 'json',
					data:{
						acronym: $(obj).attr("data-acronym"),
						version: $(obj).attr("data-version").slice(0,3)
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader(header, token);
						},
					success: function(data) {
						deferred.resolve(data);
					},
					error: function(err){
						deferred.resolve(err);
					}
				});
				return deferred.promise;
			},

			/**
			 * OnClick of Book Title expand the minor version grouping
			 */
			_expandFirstLevelGrouping: function() {
				var self = this;

				$("#myentitlement tbody").off("click", "td.details-control");

				$("#myentitlement tbody").on("click", "td.details-control", function() {

					var tr = $(this).closest("tr");
					var row = dt.row(tr);
					var doHide = row.child.isShown();

					if (doHide) {
						row.child.hide();
					} else {	

						var loader = '<div style="width:100%" class="accordion-section-content-new"><div style="width:32px;height: 32px;"><img src="../images/giphy.gif"></div>';
						row.child(loader);
						row.child.show();

						getSFData(row.data()).then(function(isSF){

								var row_data = row.data();
								var minor_version = row_data.version.slice(0, 3);
								var acronym = row_data.acronym;
								row.child(self._getDetailPane(self.courseModule[acronym][minor_version],isSF));

							row.child.show();
						});

					}
						var tdi = tr.find("i.dt").first();
						tdi.attr("class", "dt " + (doHide ? CLS_DT_RIGHT_ARROW : CLS_DT_DOWN_ARROW_DARK));
					
				});
			},

			/**
			 * OnClick of Book Title expand the modules grouping
			 */
			_expandModuleGrouping: function() {

				$("#myentitlement tbody").off("click", "div.sub-details-control");

				$("#myentitlement tbody").on("click", "div.sub-details-control", function(e) {

					var elm = $(this).html();

					var moduleMasterId = event.target.getAttribute("data-mdlmasterid");
					var isarrowToggle = (event.target.className === "dt dt-arrow-right") ? true : false;

					if (isarrowToggle) {
						$(this).find("i").removeClass(CLS_DT_RIGHT_ARROW).addClass(CLS_DT_DOWN_ARROW_DARK);
						$("#E" + moduleMasterId).show();
					} else {
						$(this).find("i").removeClass(CLS_DT_DOWN_ARROW_DARK).addClass(CLS_DT_RIGHT_ARROW)
						$("#E" + moduleMasterId).hide();
					}

				});
			},
			/**
			 * Expand First three rows by default
			 */
			_expandFirstThreeRows: function() {
				var k = 0;
				var self = this;
				$("#myentitlement").DataTable().rows().every(function() {
					if (k < 3) {
						var tr = $(this.node());
						var data = this.node();
						var row = dt.row(tr);
						var doHide = row.child.isShown();

						var loader = '<div style="width:100%" class="accordion-section-content-new"><div style="width:32px;height: 32px;"><img src="../images/giphy.gif"></div>';
						row.child(loader);
						row.child.show();

						getSFData(row.data()).then(function(isSF) {
							var row_data = row.data();
							var minor_version = row_data.version.slice(0, 3);
							var acronym = row_data.acronym;

							row.child(self._getDetailPane(self.courseModule[acronym][minor_version],isSF));

							row.child.show();
						});	

						var tdi = tr.find("i.dt").first();
						tdi.attr("class", "dt " + (doHide ? CLS_DT_RIGHT_ARROW : CLS_DT_DOWN_ARROW_DARK));
						k++;
					}
				});
			},
			/**
			 * Details Section to show grouping of minor content
			 * @param {Object} modules - Each Modules details information
			 */
			_getDetailPane: function(modules,isSF) {

				//new template call
				var template = String($("#entitlementContainerNew").html());
				template = template.replace(/&amp;/g, '&');
				_.templateSettings = {
					evaluate: /\{\{(.+?)\}\}/g,
					interpolate: /\{\{=(.+?)\}\}/g,
					escape: /\{\{-(.+?)\}\}/g
				};

				EntitlementsModuleList = {
					data : modules,
					isSF : isSF,
					acronym : modules[0].acronym,
					version : modules[0].version
				}
				
				var tblHTML = _.template(template, {
					EntitlementsModuleList: EntitlementsModuleList
				})();

				return tblHTML;
			},
			/**
			 * Datatable Configs
			 */
			_columnDefsDT: function() {

				return [{
					"className": "dt-center rowFontHeading",
					"targets": [0, 2, 3]
				}, {
					"width": "5%",
					"targets": 0
				}, {
					"width": "20%",
					"targets": 2
				}, {
					"width": "15%",
					"targets": 3
				}, ];
			},
			/**
			 * Datatable Configs
			 */
			_columnsDT: function() {

				var self = this;

				var Z_FIRST_COLUMN = '<i class="dt dt-arrow-right" aria-hidden="true"></i>';
				
				return [{
					"className": 'details-control btn btn-primary',
					"orderable": false,
					render: function() {
						return Z_FIRST_COLUMN;
					}
				}, {
					"className": 'rowFontHeading bookTitleDT bookTitleSortingIconPosition',
					render: function render(data, type, row, meta) {

						if(row.skuTitle)
							return truncate(row.acronym +" - "+row.skuTitle);
						else
							return row.acronym;
					}
				}, {
					render: function render(data, type, row, meta) {
						return row.version.slice(0, 3);
					}
				}, {
					render: function render(data, type, row, meta) {
						return self._getFormattedDate(row.lastAccessedDate);
					}
				}];
			},
			/**
			 * Ajax call to the server to fetch entitlements
			 */
			_loadEntitlements: function() {

				var deferred = Q.defer();
				$.ajax({
					url: "/api/entitlements",
					type: 'GET',
					datatype: 'json',
					success: function(data) {
						deferred.resolve(data);
					}
				});
				return deferred.promise;
			},
			/**
			 * Format the date 	
			 * @param {Date} modules - lastAccessed date of the modules 
			 */
			_getFormattedDate: function(d1) {
				var date = new Date(d1);
				//date = date.toLocaleDateString();
				date = moment(date).format('MM/DD/YYYY');
				return date;
			},
			/**
			 * Log function for internal use only.  	
			 */
			_log: function() {
				console.info.apply(console, arguments);
				return this;
			},
			/**
			 * Handle onClick event to lauch course  	
			 */
			_bindClickEntitlements: function() {

				$("#myentitlement").off("click", ".linkClick");

				$("#myentitlement").on('click', '.linkClick', function() {
					blockUI();
					var $this = $(this);
					var moduleId = $this.attr("value");
					var moduleCCSID = $this.attr("id");
					var isLatest = !!$this.data("latest");
					var isInstructor = !!$this.data("instructor");
					var courseName = isLatest ? $this.text() : $this.data("title");
					launchCourse(moduleId, moduleCCSID, courseName, isLatest, isInstructor);
				});
			},
			/**
			 * This is the main function which get invokes from mycontent.js on document ready.	
			 */
			init: function() {

				blockUI();
				var self = this;

				this.groupCourse = {}; // Courses Array to group by Acronym
				this.courseModule = {}; // Courses Array to perform group by minor version, sorting by last accessed date

				self._loadEntitlements()
					.then(function(courses) {

						//self._log(" ======= MYENTITLEMENT ======\n", courses);
						if (courses.length > 0) {

							// If myentitlement courses are there show the tab otherwise don't show it.
							$("#instructorId").show();
							$("#studentId").hide();

							if (onPageLoaded == 1) {

								courseList = null; // reset the courseList array.
								courseList = courses; // assign courses to the courseList array
								$('#noBookContainer').hide(); // hide before refresh the table
								$(".data-table-content").hide(); // hide before refresh the table


								return self._displayContents(courses)
									.then(function(result) {

										window.DTData = result;
										$('#myentitlement').DataTable().clear().destroy();
										self._inializeDataTable(result);
										self._expandFirstLevelGrouping();
										self._expandModuleGrouping();
										self._bindClickEntitlements();
										self._expandFirstThreeRows();
										self._showSupplementalFileList();

										$("#myentitlement_info").hide();

										$("#myentitlement").show();
										$("#myentitlement_wrapper").show();
										jQuery.unblockUI();
									});
							}
							else {
								//self._log(" ----- INITIAL PAGE LOADED ----- ");
							}
						} else {

							$("#instructorId").hide();
							$("#studentId").show();

							// We are checking here whether MyContent have books or not, if Yes, fetch the lastest books for MyContent and show. 

							if (onPageLoaded == 1) {
								if(courseList.length > 0){

									$("#myentitlement").hide();
									$("#myentitlement_wrapper").hide();

									MyContent.init();

								}
							}
							jQuery.unblockUI();

						}
					});
			}

		});

	//exposing to window
	function makeClass(params) {
		window.MyEntitlements = params;
	}

})(window, document, jQuery);