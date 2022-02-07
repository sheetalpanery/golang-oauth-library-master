var validateForm = function () {
	$('.errorCls').hide();
	var arr = $('#feedback-form').serializeArray();
	var data = {};
	for (var i = 0; i < arr.length ; i++) {
		data[arr[i].name] = arr[i].value;
	}
	if (data.category === 'select' || data.description === '') {
		if (data.category === 'select') {
			$('#categoryError').show();
		}
		if (data.description === '') {
			$('#commentError').show();
		}
		return false;
	}
	if (data.email !== '') {
		var patt = new RegExp('\\S+@\\w+\\.[A-Za-z]+');
		if (!patt.test(data.email)) {
			$('#emailError').show();
			return false;
		}
	}
	return true;
};