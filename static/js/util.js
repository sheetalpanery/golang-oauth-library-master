var popupBlockerChecker = {
    check: function(popup_window){
        var _scope = this;
        if (popup_window) {
            if(/chrome/.test(navigator.userAgent.toLowerCase())){
                setTimeout(function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                 },1000);
            }else{
                popup_window.onload = function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                };
            }
        }else{
            _scope._displayError();
        }
    },
    _is_popup_blocked: function(scope, popup_window){
        if ((popup_window.innerHeight > 0)==false){ scope._displayError(); }
    },
    _displayError: function(){
    	jQuery.unblockUI();
    	$('#popupcontainer .popHolder p').hide();
		$('#blockerMsg, #popupcontainer').show();
    }
};

$(function () {
	$('#popupclose').on("click", function(event){
		$("#popupcontainer").hide();
		$('#popupcontainer .popHolder p').hide();	
		jQuery.unblockUI();	
	});
});

function getFormattedDate(d1) {
	var date = new Date(d1);
	date = date.toLocaleDateString();
	return date;
}

function escapeChar(str){
	return str.replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&#39;/g,"'").replace(/&quot;/g,"\"");
}

function escapeCharDetails(str){	
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
