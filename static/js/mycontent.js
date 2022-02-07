var updatingBooks = [];
var onPageLoaded = 0;


var groupId;

function popclose() {
	$('.open').removeClass('open');
	$('.updateOverlay').removeClass('open');
}

$(document).ready(function() {
	$.ajaxSetup({
		cache: false
	});
	courseList = null;
	newCourse = null;
	CourseModuleList = null;
	EntitlementsModuleList = null;

	$(".table-content").hide();
	$(".data-table-content").hide();
	$("#instructorId").hide();
	$("#myentitlement_wrapper").hide();
	$("#studentId").show();
	
	handleBookUpdate();
	handleUpdateConfirmation();

	MyContent.init();
	MyEntitlements.init();	

	$('.popup-close,.overlay,.thanks').on('click', function(e) {
		popclose();
	});

	// jQuery(document).ajaxStop(jQuery.unblockUI);
	$("#continueKillActiveSession").on("click", function(event) {
		if (!coursesSelected()) {
			return showErrorMsg();
		} else {
			$("#continueKillActiveSession").attr("disabled", "disabled");
			var selectedCourses = getSelectedCourses();
			var reqJSON = JSON.stringify({
				accessIds: selectedCourses
			});
			var reader_opt = jQuery("#reader_url").attr("value");
			blockUI();
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			jQuery.ajax({
				url: "/api/kill-learning-session",
				type: "POST",
				beforeSend: function(xhr) {
					xhr.setRequestHeader(header, token);
				},
				data: {
					killSessionInfo: reqJSON,
					reader_opt: reader_opt
				},
				success: function(data) {
					closeAllPopus();
					showKillSessionsStatus(data);
					$("#continueKillActiveSession").removeAttr("disabled");
					$('#activeList').html("");
				},
				error: function() {
					closeAllPopus();
				}
			});
		}
	});

	$("#continueActiveExceed").on("click", function(event) {
		$("#activeexceed").hide();
		$("#account").addClass("bodyOnPopup");
		$("#popups").addClass("overlay");
		$("#popups").show();
		$("#activesession").show();
	});

	$('.close-popup').on("click", function(event) {
		closeAllPopus();
	});

	$("#code-redemption").on("submit", function(e) {
		var err = $("#errmessage");
		err.slideUp('fast');
		e.preventDefault();
		document.getElementById("userSpecifiedAccessCode").innerText = $("#accessCode").val();
		$('.updateOverlay').addClass('open');

		// Reset the checkbox and redeem button on submit
		$('#acceptTerms').prop('checked', false);
		$('#redeemConfirmation .update').addClass('disabled');

		$('#redeemConfirmation').addClass('open');
	});

	$('#entitlements').on('click', function() {

		onPageLoaded = 1;

		$('#courseGet').removeClass('selected');
		$('#entitlements').addClass('selected');
		$('#instructor-page').addClass('selected');
		$('#student-page').removeClass('selected');
		//loadEntitlements();

		$('.table-content').hide();
		$("#example_info").hide();
		$("#bookList").hide();

		/* Hide MyContent Stuff */
		$("#mycontent_wrapper").hide(); 
		$("#mycontent").hide(); 
		$("#mycontent_info").hide(); 

		MyEntitlements.init();
	});

	$('#courseGet').on('click', function() {

		$(".data-table-content").hide();
		$("#noBookContainer").hide();

		$('#courseGet').addClass('selected');
		$('#entitlements').removeClass('selected');
		$('#instructor-page').removeClass('selected');
		$('#student-page').addClass('selected');

		$('.table-content').hide();
		//$("#bookList").show();
		$("#myentitlement").hide();
		$("#myentitlement_wrapper").hide();
		
		MyContent.init();

	});
	redeemCode();
});

function redeemCode() {
	$('#acceptTerms').on('click', function() {
		if (this.checked) {
			$('#redeemConfirmation .update').removeClass('disabled');
		} else {
			$('#redeemConfirmation .update').addClass('disabled');
		}
	});

	$('#redeemConfirmation .update').on('click', function() {
		if ($(this).hasClass('disabled')) {
			return;
		}
		var data = {
			"accessCode": $("#accessCode").val()
		};
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");

		$.ajax({
			url: "/api/redeem",
			type: 'POST',
			data: data,
			beforeSend: function(xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: function(data) {
				popclose();
				$('#redeemConfirmation .update').addClass('disabled');
				$('#acceptTerms').removeAttr('checked');
				$("#errmessage font").text("");
				if (data.statusCode == "Error") {
					$("#errmessage .error").text(data.details);
				} else {
					$("#errmessage .success").text(data.details);

					$('#entitlements').removeClass('selected');
					$('#courseGet').addClass('selected');
					
					MyContent.init();

					$("#accessCode").val("");
				}
				$("#errmessage").slideDown('slow');
				setTimeout(function() {
					$("#errmessage").fadeOut('slow');
					$("#errmessage font").text("");
				}, 10000);
			},
			error: function(jqxhr) {
				if (jqxhr.status == 401)
					window.location.href = "/";
			}
		});
	});
}


function handleBookUpdate() {
	var skuUpdateStatus;
	$('#myContentList').on('click', '.update', function() {
		var courseModuleMasterId = $(this).attr("value");
		var updatableCourse = _.filter(courseList, function(course) {
			return course.moduleMasterId == courseModuleMasterId;
		});

		if (updatableCourse.length > 1) {
			updatableCourse.sort(function(a, b) {
				var aAr = a.version.split('.');
				var bAr = b.version.split('.');
				if (aAr.length == 3 && bAr.length == 3) {
					var val_a = parseInt(aAr[2]) * 1 +
						parseInt(aAr[1]) * 1000 +
						parseInt(aAr[0]) * 1000 * 1000;
					var val_b = parseInt(bAr[2]) * 1 +
						parseInt(bAr[1]) * 1000 +
						parseInt(bAr[0]) * 1000 * 1000;
					return val_b > val_a
				}
				return false;
			});
		}
		groupId = updatableCourse[0].groupId;
		skuUpdateStatus = updatableCourse[0].skuUpdateStatus;
		if (skuUpdateStatus == 1) {
			$('#bookUpdatePopup .book-version').html(updatableCourse[0].version);
			$('#bookUpdatePopup .update').attr('value', updatableCourse[0].moduleCCSId);
			$('.updateOverlay').addClass('open');
			$('#bookUpdatePopup').addClass('open');
		} else if (skuUpdateStatus == 6) {
			$('#bookSyncWarning .book-version').html(updatableCourse[0].version);
			$('#bookSyncWarning .update').attr('value', updatableCourse[0].moduleCCSId);
			$('.updateOverlay').addClass('open');
			$('#bookSyncWarning').addClass('open');
		}
	});
}

function handleUpdateConfirmation() {
	$('.book-popup .update').on('click', function() {
		popclose();
		var isUpdateRequired;
		var newBookModuleCCSId = $(this).attr("value");
		var newBook = _.filter(courseList, function(course) {
			return course.moduleCCSId == newBookModuleCCSId;
		});

		var newDkitMasterId = newBook[0].dkitMasterId;
		if (newBook[0].skuUpdateStatus == 1) {
			isUpdateRequired = "true";
		} else if (newBook[0].skuUpdateStatus == 6) {
			isUpdateRequired = "false";
		}
		var oldBook = _.filter(courseList, function(course) {
			return course.groupId == groupId && course.isLatest == true;
		});
		var value = oldBook[0].moduleTitle;
		var commonId = oldBook[0].groupId;

		$('.accordion-section-content-new .update[data-groupid="' + commonId + '"]').hide();
		$('.accordion-section-content-new .updating[data-groupid="' + commonId + '"]').show();

		$('.updating').unbind("click");
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		var data = {
				oldBookModuleCCSId: oldBook[0].moduleCCSId,
				newBookModuleCCSId: newBookModuleCCSId,
				isUpdateRequired: isUpdateRequired,
				dkitMasterId: newDkitMasterId
		};

		$.ajax({
			url: "/api/migrate",
			type: 'POST',
			datatype: 'json',
			beforeSend: function(xhr) {
				xhr.setRequestHeader(header, token);
			},
			data: {
				oldBookModuleCCSId: oldBook[0].moduleCCSId,
				newBookModuleCCSId: newBookModuleCCSId,
				isUpdateRequired: isUpdateRequired,
				dkitMasterId: newDkitMasterId
			},
			success: function() {
				updatingBooks.push(newBook[0].moduleMasterId);
				if ($(".update-overlay-popup").hasClass("open")) {
					$(".update-overlay-popup").removeClass('open');
				}
				if ($(".updateOverlay").hasClass("open")) {
					$(".updateOverlay").removeClass("open");
				}
				//onloadContentList();
				MyContent.init();
			},
			error: function(error) {
				console.log(error);
			}
		});
	});
}



function launchCourse(moduleId, moduleCCSID, courseName, isLatestVersion, isInstructorRole) {
	var launchURl = isInstructorRole ? "/api/entitlementlaunch" : "/api/launch";
	var data = {
		moduleMasterId: moduleId,
		moduleCCSId: moduleCCSID
	};
	var jqXhr = $.getJSON(launchURl, data, function(resJSON) {
		$.unblockUI();

		isInstructorRole ? MyEntitlements.init() : MyContent.init();

		if (resJSON.STATUS == "ok") {
			openReader(courseName, resJSON.URL + '&isLatest=' + isLatestVersion);
		} else if (resJSON.STATUS == "killSession") {
			setActiveSessionJSON(resJSON);
			showMaxActivePopUp();
		} else {
			jQuery.unblockUI();
			$('#customMsg').html(resJSON.DETAILS);
			$('#popupcontainer .popHolder p').hide();
			$('#customMsg, #popupcontainer').show();
		}
	}).fail(function(jqXhr) {
		if (jqXhr.status == 401) {
			jQuery.unblockUI();
			$('#popupcontainer .popHolder p').hide();
			$('#expireMsg, #popupcontainer').show();
		}
	});
}



var checkNewVersion = function(groupId) {
	var newVersions = _.filter(courseList, function(course) {
		return course.groupId == groupId && (course.skuUpdateStatus == 1 || course.skuUpdateStatus == 6);
	});
	if (newVersions.length > 0) {
		return true;
	}
	return false;
};

var getLatestVersion = function(groupId) {
	var newVersions = _.filter(courseList, function(course) {
		return course.groupId == groupId && (course.skuUpdateStatus == 1 || course.skuUpdateStatus == 6);
	});
	var sortedVersions = _.sortBy(newVersions, function(course) {
		return course.version
	});
	return sortedVersions[sortedVersions.length - 1];
};

var checkProcessingVersion = function(groupId) {
	var updatingVersions = _.filter(courseList, function(course) {
		return course.groupId == groupId && course.skuUpdateStatus == 4;
	});
	if (updatingVersions.length > 0) {
		return true;
	}
	return false;
};

var checkFailedVersion = function(groupId) {
	var failedVersions = _.filter(courseList, function(course) {
		return course.groupId == groupId && course.skuUpdateStatus == 5;
	});
	if (failedVersions.length > 0) {
		return true;
	}
	return false;
};

var checkMultipleVersions = function(groupId) {
	var olderVersions = _.filter(courseList, function(course) {
		return course.groupId == groupId && (course.skuUpdateStatus == 3 && course.isLatest == false);
	});
	if (olderVersions.length > 0) {
		return true;
	}
	return false;
};


function setActiveSessionJSON(json) {
	var jsonArray = json.activeSessions;
	var innerHTML = "";
	for (var i = 0; i < jsonArray.length; i++) {
		innerHTML += "<tr>";
		innerHTML += "<td class='overlay-acth1'><input value='";
		innerHTML += jsonArray[i].accessId;
		innerHTML += "' type='checkbox'  class='styled'/ ></td>";
		innerHTML += "<td class='overlay-acth2'><a href='javascript:void(0);'><span class='overlay-id'>";
		innerHTML += jsonArray[i].moduleStrId;
		innerHTML += "</span><span class='overlay-subtitle'>";
		innerHTML += jsonArray[i].moduleTitle;
		innerHTML += "</span></a></td><td class='overlay-acth3'>";
		innerHTML += jsonArray[i].sessionCreationTime;
		innerHTML += "</td>";
		innerHTML += "</tr>";
	}
	$('#activeList').html(innerHTML);

}

function blockUI() {
	jQuery.blockUI({
		overlayCSS: {
			opacity: '0.1'
		},
		css: {
			top: '48%',
			left: '40%',
			width: 'none',
			border: 'none',
			backgroundColor: 'none',
			opacity: '0.4'
		},
		message: ""
	});
}

function openReader(courseName, readerURL) {
	var windowName = "EKit Reader - " + courseName + " - Dated:" + new Date();
	var params = 'width=' + screen.width;
	params += ', height=' + screen.height;
	params += ', top=0, left=0';
	params += ', resizable=1';
	var popUp = window.open(readerURL, windowName, params);
	popupBlockerChecker.check(popUp);
}

function showMaxActivePopUp() {
	$("#account").addClass("bodyOnPopup");
	$("#popups").addClass("overlay");
	$("#popups").show();
	$("#activeexceed").show();
}

function closeAllPopus() {
	$("#account").removeClass("bodyOnPopup");
	$("#popups").removeClass("overlay");
	$("#popups").hide();
	$("#activeexceed").hide();
	$("#activesession").hide();
}

function showErrorMsg() {
	$("#popupErrormsg").show();
}

function coursesSelected() {
	return $("#activeList input:checked").length > 0;
}

function getSelectedCourses() {
	var selectedCourses = new Array();
	$("#activeList input:checked").each(function() {
		selectedCourses.push($(this).attr("value"));
	});
	return selectedCourses;
}

function showKillSessionsStatus(data) {
	var object = data;
	jQuery.unblockUI();
	$('#popupcontainer .popHolder p').hide();
	if (object.status == "success") {
		$('#sessionMsg, #popupcontainer').show();
	} else {
		$('#customMsg').html(object.statusmsg);
		$('#customMsg, #popupcontainer').show();
	}
}



function getFormattedDate(d1) {
	var date = new Date(d1);
	date = moment(date).format('MM/DD/YYYY');
	return date;
}


function truncate(input) {
   if (input.length > 44)
      return input.substring(0,44) + '...';
   else
      return input;
}


function getSFData(item) {

		var deferred = Q.defer();
		var isSF = false;
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");

		$.ajax({
			url: "/api/supplementalfiles",
			type: 'POST',
			datatype: 'json',
			data:{
				acronym: item.acronym,
				version: item.version.slice(0,3)
			},
			beforeSend: function(xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: function(data) {
				
				// check the response is a Array and SF count is greater than zero then isSF == true
				if(Array.isArray(data) && data.length > 0)
					isSF = true;
				
				deferred.resolve(isSF);

			},
			error: function(){	
				
				deferred.resolve(isSF);
			}
		});
		return deferred.promise;		
}
