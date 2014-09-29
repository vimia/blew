$(function(){
	mixpanel.track("page-load");	
	/** 
	 * Pjax to load only what you need
	 * 	
	 * @see https://github.com/vimia/blew/issues/5
	 */
	var Global = {
		  pjax: {
		  	options: {
		  		timeout: 10000, // Prevent redirects ...
		  		replace: true
		  	},
		  	history: [],
		  	caller: "[pjax]",
				container: "[pjax-container]",
				modalCaller: "[pjax-modal]",
				modalCloser: "[pjax-modal-closer]",
			  modalContainer: "[pjax-modal-container]",
			  $:{
					caller: $("[pjax]"),
					container: $("[pjax-container]"),
					modalCaller: $("[pjax-modal]"),
					modalCloser: $("[pjax-modal-closer]"),
					modalContainer: $("[pjax-modal-container]"),
				},		  	
		  }
	};
	
	var pjax = Global.pjax;
	var $pjax = Global.pjax.$;

	$(document).pjax(pjax.caller, pjax.container, pjax.options);
	$(document).pjax(pjax.modalCaller, pjax.modalContainer, pjax.options);

	$(document).on('pjax:send', function() {
  	// Save history && Clear modal content
  	pjax.history.push(location.href);
  	$pjax.modalContainer.empty();

  	mixpanel.track("pjax:send");
	});
	
	$(document).on('pjax:complete', function(xhr, textStatus, options) {		
  	
  	// Make update pjax content needs after it loads
  	modalLiveUpdate();
  	momentLiveUpdate();
  	highlightLiveUpdate();
  	analyticsLiveUpdate();
  	mixpanel.track("pjax:complete");
  });

	$(document).on('pjax:end', function(xhr, options) {
		//keep
		mixpanel.track("pjax:end");
  });

	$(document).on('pjax:timeout', function(xhr, options){
		//keep
		mixpanel.track("pjax:timeout");
	});

  $(document).on('pjax:error', function(xhr, textStatus, error, options) {
		//keep
		mixpanel.track("pjax:error");
  });
	


	/** 
	 * Highlight.js to make code looks pretty 
	 * 	
	 * @see https://github.com/vimia/blew/issues/29
	 */
	var highlightLiveUpdate = function() {
		$('code[highlight]').each(function(i, block) {
  		hljs.highlightBlock(block);
		});
	};
	highlightLiveUpdate();
	
	/** 
	 * Moment.js to make timestamps looks pretty 
	 * 	
	 * @see https://github.com/vimia/blew/issues/14
	 */
	var momentLiveUpdate = function() {
		$('date, time').each(function(i, e) {
    	var d = moment($(e).attr('source'));
			$(e).html(d.fromNow());
		});
	};
	momentLiveUpdate();
	setInterval(momentLiveUpdate, 60000);


	/** 
	 * Make PJAX work with bootstrap modals
	 * 	
	 * @see https://github.com/vimia/blew/issues/40
	 */
	var modalLiveUpdate = function() {
		var md = $('.modal[show]');
		
		md.modal({keyboard:false, show:true, backdrop:'static'});

		$(pjax.modalCloser).click(function(e){
			var el = $(this);
			var md = $(el.attr(pjax.modalCloser));
			md.modal('hide');
			mixpanel.track("pjax:modal-hide");
		});

		md.on('hidden.bs.modal', function (e) {
			var url = '/';
			if (pjax.history.length > 1) {
				var previous = pjax.history[pjax.history.length-1];
				if (previous != location.href) {
					url = previous;
				}
			}
			window.history.pushState(' ', ' ', previous);
		});
	};
	modalLiveUpdate();


	
	/** 
	 * Make PJAX work with GA.js
	 * 	
	 * @see https://github.com/vimia/blew/issues/35
	 */
	var analyticsLiveUpdate = function() {
		mixpanel.track("analytics-update");
		ga('send', 'pageview', location.pathname + location.search + location.hash);
	};
});