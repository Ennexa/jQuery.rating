/**
 * jQuery.rating - 5 star rating plugin
 * Copyright (c) Ennexa Technologies (P) Ltd | http://www.ennexa.com/
 * Dual licensed under MIT and GPL.
 * @version 2.0.0
 *
 */
/*! http://git.io/rating | © Ennexa Technologies | http://www.ennexa.com/ */
(function ($, undefined) {
	'use strict';
	
	var NS = 'com.ennexa.rating',
	CLASS = 'icon icon-star';
	
	var Rating = function(elem, options) {
		this.init(elem, options);
	};
	
	function onchange (e, data) {
		var opts = data.options, id = opts.id, value = opts.value;
		if (opts.xhr) opts.xhr.abort();
		// Add a delay to prevent the event from firing multiple times
		setTimeout(function () {
			var match = id.match(/(.*)-(\d+)/);
			opts.xhr = $.post(opts.url, {item_section: match[1], item_id: match[2], rating_value: value}, function (res) {
				if (res.status === "OK") {
					$.cookie('rating.' + id, value, $.extend({path : null, expires : 30}, opts.cookie));
					data.options.rated = true;
					$(e.target).rating('refresh');
				} else {
					$.error(res.message);;
				}
			});
		}, 500);
	}
	
	function oninit(e, data) {
		var opts = data.options;
		var cookie = $.cookie('rating.' + opts.id);
		if (cookie) {
			opts.value = parseInt(cookie, 10);
			opts.rated = true;
		}
	}
	
	$.extend(Rating, {
		defaults: {
			id: null,
			rated: false,
			value: null,
			url: '/api/rating.json',
			change: onchange,
			init: oninit,
			emptyClass: 'icon icon-star-o',
			fillClass: 'icon icon-star',
			hoverClass: 'icon icon-star',
			activeClass: 'icon icon-star'
		},
		ns: function () {
			return NS;
		},
		prototype: {
			init: function (elem, opts) {
				var rating = this, $elem;
				this.$elem = $elem = $(elem).prop('type', 'hidden');
				
				opts.id = opts.id || elem.id || '';
				opts.value = parseInt(opts.value, 10) || parseInt($elem.val(), 10);
			
				if (!opts.id || isNaN(opts.value)) return;
				
				this.options = opts;
				this.$wrapper = $('<span class="star-rating"><a/><a/><a/><a/><a/></span>').insertBefore($elem);
				this.$wrapper.children().prop('href', '#').addClass('star-rating-star').append('★');

		        $elem.on('change.' + NS, function () {
		        	rating.update(rating.$elem.val());
		        });
				
		        this.$wrapper
					.on('click touchstart', '.star-rating-star', function (e) {
						e.stopPropagation();
						e.preventDefault();
		            	// Set input to the current value and 'trigger' the change handler.
						$elem.val($(this).index() + 1).trigger('change.' + NS);
					})
					.on('mouseenter', '.star-rating-star', function () {
						// Emphasize on hover in.
						rating.fill($(this).index() + 1, true);
					})
					.on('mouseleave', function () {
						// Restore on hover out.
						rating.fill(rating.$elem.val(), false);
					});
				
				$elem.on('ratinginit.' + NS, opts.init)
					.on('ratingchange.' + NS, opts.change)
					.trigger('ratinginit.' + NS, {options: opts});
					
				this.fill(opts.value);
			},
			// option: function (opts) {
			// 	$.extend(this.options, opts);
			// 	this.fill(this.options.value, false);
			// },
			refresh: function (value) {
				this.fill(this.options.value = this.$elem.val());
			},
			update: function (value) {
				var oldVal = this.options.value;
				this.fill(value, false);
				this.options.value = value;
				this.$elem.trigger('ratingchange.' + NS, {oldValue: oldVal, options: this.options});
				// this.options.rated = true;
			},
			fill: function (value, hover) {
				var opts = this.options, 
					index = Math.round(value) - 1,
					state = hover ? 'hover' : (opts.rated ? 'active' : 'fill'),
					$stars = this.$wrapper.removeClass('rating-hover rating-active rating-fill').addClass('rating-' + state).children();
					
				// Remove all classes
				$stars.removeClass([opts.hoverClass, opts.fillClass, opts.activeClass].join(' '))
					// Add empty class
					.addClass(opts.emptyClass)
				
				// Select stars
		        $stars.eq(index).prevAll('.star-rating-star').addBack()
					// Remove empty class and add required class
					.removeClass(opts.emptyClass).addClass(opts[state + 'Class']);
			}
		}
	});
	
	var Plugin = function (option) {
		return this.each(function () {
			var $this = $(this);
	        var data    = $this.data(NS)
	        var options = $.extend({}, Rating.defaults, $this.data(), typeof option == 'object' && option)
	        if (!data) $this.data(NS, (data = new Rating(this, options)))
	        if (typeof option == 'string') data[option].call(data, Array.prototype.slice.call(arguments, 1))
			
		});
	}
	
	// var old = $.fn.rating;
	
	$.fn.rating = Plugin;
	// $.fn.rating.Constructor = Rating;
	//
	//     $.fn.rating.noConflict = function () {
	//       $.fn.rating = old
	//       return this
	//     }
	
	$(function () {
		$('input.star-rating').rating();
	});
}(jQuery));
