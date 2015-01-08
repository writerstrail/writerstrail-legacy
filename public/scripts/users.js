(function ($) {
	"use strict";
	
	$("#select_all").click(function () {
		var el = $(this);
		var selection = $('.selection');
    
		if (this.checked) {
			selection.prop('checked', true);
		} else {
			selection.prop('checked', false);
		}

		el.prop('indeterminate', false);
	});

	$(".selection").click(function () {
		var selection = $('.selection:checked');
		var all = $('.selection');
		var el = $('#select_all');

		if (selection.length === 0) {
			el.prop('checked', 0);
			el.prop('indeterminate', false);
		} else if (selection.length < all.length) {
			el.prop('checked', 0);
			el.prop('indeterminate', true);
		} else {
			el.prop('checked', 1);
			el.prop('indeterminate', false);
		}
	});
})(jQuery);