(function(window, document, $) {
  //'use strict';

  var appended = false;
  $(document).on("gform_post_render", function() {
    if ($("#gform_wrapper_17").length > 0) {
      var disclaimer =
        '<i>Services vary based on estate size. Clients must have a minimum of $50,000 in investable assets to be eligible.</i><br><br><small>*Rankings and/or recognition by unaffiliated rating services and/or publications should not be construed by a client or prospective client as a guarantee that he/she will experience a certain level of results if Company is engaged, or continues to be engaged, to provide investment advisory services, nor should it be construed as a current or past endorsement of Company by any of its clients. Rankings published by magazines, and others, generally base their selections exclusively on information prepared and/or submitted by the recognized adviser. Rankings are generally limited to participating advisers. The Company never pays a fee to be considered for any ranking or recognition, but may purchase plaques or reprints to publicize rankings.</small><br><br>For additional important disclosures, please visit: <a href="https://www.creativeplanning.com/important-disclosure-information/">https://www.creativeplanning.com/important-disclosure-information/</a>';
      if (!appended) {
        $("#gform_page_17_2 .gform_page_footer").after(
          "<div class='disclaimer'>" + disclaimer + "</div>",
        );
      }
      appended = true;
    }
  });

  function showDisclaimer() {
    $("#gform_page_17_2 .disclaimer").slideDown();
  }
  function hideDisclaimer() {
    $("#gform_page_17_2 .disclaimer").slideUp();
  }

  $(document).on("click", "#label_17_10_0", hideDisclaimer);
  $(document).on("click", "#choice_17_10_1", hideDisclaimer);
})(window, document, jQuery);
