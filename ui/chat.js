/* jshint browser: true */
/* global $, format */

var chatEl = {},
	timeBefore;

$(function () {
	var $template = $(".chat-item").eq(0);

	chatEl.render = function ($el, text) {
		$el = $el || $template.clone(false);

		$el.find(".chat-nick").text(text.from);
		$el.find(".chat-message").html(format.linkify(format.textToHtml(text.text || "")));
		$el.find(".chat-timestamp").text(format.friendlyTime(text.time, new Date().getTime()));
		$el.attr("data-index", text.time);
		$el.attr("id", "chat-" + text.id);

		if (text.threads && text.threads.length && text.threads[0].id) {
			$el.attr("data-thread", text.threads[0].id);
		}

		if (text.labels) {
			for (var label in text.labels) {
				if (text.labels[label] === 1) {
					$el.addClass("chat-label-" + label);
				}
			}
		}

		if (timeBefore) {
			if ((text.time - timeBefore) > 180000) {
				$el.addClass("chat-mark-timestamp-shown");
			}
		}

		timeBefore = text.time;

		if (text.text.length >= 400) {
			$el.addClass("chat-mark-long");
		}

		if (text.threads && text.threads.length) {
			$el.addClass("conv-" + text.threads[0].id.substr(-1));
		}

		return $el;
	};
});

module.exports = chatEl;