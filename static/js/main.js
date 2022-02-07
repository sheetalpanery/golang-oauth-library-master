var isSignedIn = "false";
function launchContent(moduleId) {
	if (isSignedIn == "true" || true) {
		var moduleName = document.getElementById('moduleName' + moduleId).value;
		var moduleDefinedId = document.getElementById('moduledefinedId'
				+ moduleId).value
		var moduleCCSId = document.getElementById('moduleCCS' + moduleId).value;
		var freeContentLaunchAction = "/free-courses/redeem/" + moduleId;
		$.ajax({
			url : freeContentLaunchAction,
			type : "GET",
			success : function(response) {
				try {
					if (response.statusCode == "Ok") {
						window.location = "/content";
					}
				} catch (e) {
					window.location = "/login"
				}
			},
			error : function() {
				console.log(arguments);
			}
		});
	} else {
		window.location = "/login";
	}
}
$(function() {
	$('#benefitsOfRegisteringLink').click(function() {
		$(this).target = "_blank";
		window.open($(this).prop('href'));
		return false;
	});

	$('#dwnld').click(function() {
		window.location.href = '/content?target=windows-app';
		return false;
	});

});
window.onload = function() {
	if (endWith(window.location.href, "download-app")) {
		$("#networkSpace").removeAttr("class");
		$("#downloadAppTab").attr("class", "on");
		$("#download-app").css("display", "block");
		$("#what-is-cisco-ple").css("display", "none");
		$("#free-online-course").css("display", "none");
	}
}
function endWith(str, endStr) {
	var isExp = endStr.constructor.name === "RegExp", val = str;
	if (isExp === false) {
		endStr = escape(endStr);
		val = escape(val);
	} else
		endStr = endStr.toString().replace(/(^\/)|(\/$)/g, "");
	return eval("/" + endStr + "$/.test(val)");
}