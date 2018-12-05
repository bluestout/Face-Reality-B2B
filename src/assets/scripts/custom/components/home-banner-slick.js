import $ from "jquery";
import "slick-carousel";

function homeBanner() {
  const $testimonials = $("[data-home-banner-slick]");
  if ($testimonials.length > 0) {
    $testimonials.slick({
      swipeToSlide: true,
      arrows: false,
      dots: true,
      slidesToShow: 1,
    });
  }
}

$(document).ready(homeBanner);
