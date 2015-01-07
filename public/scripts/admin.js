(function ($) {
	"use strict";
	
	function randString(length) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		
		for (var i = 0; i < length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		
		return text;
	}

	$('#gen_code').click(function () { 
		$('#invitation_code').val(randString(40));
	});

	$('#invitation_code').click(function () {
		$('#invitation_code').select();
	});

})(jQuery);