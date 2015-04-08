define(
		[
		"./Link",
		"dojo/_base/declare",
		"dojo/text!ec/fisa/widget/templates/VerticalMenuLink.html",
		"./_base"
		],
		function(Link, declare, template) {

			return declare("ec.fisa.widget.VerticalMenuLink", [ Link ], {
				templateString : template
			});
		});
