import $ from "jquery";

const el = {
  button: "[data-training-smooth-scroll]",
  target: "#training-program-content",
};

function smoothScroll(event) {
  event.preventDefault();
  document.querySelector(el.target).scrollIntoView({
    behavior: "smooth",
  });
}
if (document.getElementById("training-program-content").length > 1) {
  $(document).on("click", el.button, smoothScroll);
}
