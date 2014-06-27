/* jshint browser: true */
/* global $, libsb, format */

$(function() {
	var $entry = $(".chat-entry"),
		lastMsg, currMsg, currThread;

	$.fn.resetConv = function() {
		var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

		$("body").attr("class", classes);

		currMsg = null;
		currThread = null;
	};

	$.fn.selectMsg = function() {
		var $container = $(".chat-area");

		$.fn.resetConv();

		currMsg = this.attr("id");
		currThread = this.attr("data-thread");

		if (currThread) {
			$("body").addClass("conv-" + currThread.substr(-1));
		}

		$(".chat-item").not(this).removeClass("current active");

		this.addClass("current");

		if ($.fn.velocity) {
			if ((this.offset().top - $container.offset().top) < 0 || this.offset().top > $container.height()) {
				this.velocity("scroll", { duration: 150, container: $container });
			}
		} else {
			this.get(0).scrollIntoView(true);
		}

		var nick = this.find(".chat-nick").text(),
			msg = format.htmlToText($entry.html()).trim(),
			atStart = false;

		if (msg.match(/^@\S+[\s+{1}]?/, "")) {
			msg = msg.replace(/^@\S+[\s+{1}]?/, "");
			atStart = true;
		} else {
			msg = msg.replace(/@\S+[\s+{1}]?$/, "");
		}

		if (msg.indexOf("@" + nick) < 0 && libsb.user.id !== nick) {
			if (atStart) {
				msg = "@" + nick + (msg ? " " + msg : "");
			} else {
				msg = (msg ? msg + " " : "") + "@" + nick;
			}
		}

		msg = format.textToHtml(msg);

		$entry.html(msg ? msg + "&nbsp;" : "").focus();

		if ($.fn.setCursorEnd) {
			$entry.setCursorEnd();
		}

		return this;
	};

	$(document).on("click", ".chat-item", function() {
		$(this).selectMsg();
	});

	$(document).on("keydown", function(e){
		if (e.keyCode === 38 || e.keyCode === 40) {
			if ($(".chat-item.current").length) {
				var $chat = $(".chat-item.current"),
					$el;

				if (e.keyCode === 38 && $chat.prev().length) {
					e.preventDefault();
					$el = $chat.prev();
				} else if (e.keyCode === 40) {
					e.preventDefault();

					if ($chat.next().length) {
						$el = $chat.next();
					} else {
						$.fn.resetConv();
						$chat.removeClass("current active");
					}
				}

				if ($el) {
					$el.selectMsg();
				}
			} else {
				if (e.target === $entry.get(0) && $(".chat-item").last().length && e.keyCode === 38) {
					e.preventDefault();

					$(".chat-item").last().selectMsg();
				}
			}
		}
	});

	libsb.on("text-up", function(text, next) {
		var $chat = $(".chat-item.current");

		if ($chat.length && currThread) {
			text.threads = [ { id: currThread, score: 1.0 } ];
		}

		lastMsg = text.id;

		next();
	}, 50);

	libsb.on("text-dn", function(text, next) {
		if (text.id === lastMsg || (text.threads && text.threads.length && text.threads[0].id === currThread)) {
			$("#chat-" + text.id).selectMsg();
		}

		next();
	}, 50);

	$(document).on("click", ".chat-item", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat-conv-dot", function() {
		$.fn.resetConv();

		$(".chat-item").removeClass("current active");
	});
});