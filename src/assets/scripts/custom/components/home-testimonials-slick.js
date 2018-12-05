import $ from "jquery";
import "slick-carousel";

function testimonialSliders() {
  const $textTestimonials = $("[data-testimonials-slider]");
  if ($textTestimonials.length > 0) {
    $textTestimonials.slick({
      swipeToSlide: true,
      arrows: true,
      dots: true,
      slidesToShow: 3,
      nextArrow:
        "<button type='button' class='slick-next slick-arrow icon-arrow-right'></button>",
      prevArrow:
        "<button type='button' class='slick-prev slick-arrow icon-arrow-left'></button>",
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            centerMode: false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            centerMode: false,
            centerPadding: 0,
          },
        },
      ],
    });
  }

  const $videoTestimonials = $("[data-video-testimonials-slider]");
  if ($videoTestimonials.length > 0) {
    $videoTestimonials.slick({
      swipeToSlide: true,
      arrows: true,
      dots: true,
      slidesToShow: 1,
      nextArrow:
        "<button type='button' class='slick-next slick-arrow icon-arrow-right'></button>",
      prevArrow:
        "<button type='button' class='slick-prev slick-arrow icon-arrow-left'></button>",
    });
  }
}

$(document).ready(testimonialSliders);
