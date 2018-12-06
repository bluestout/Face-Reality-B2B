import $ from "jquery";

const el = {
  button: "[data-qty-change]",
};

function QuantityChange(event) {
  if (typeof event !== "undefined") {
    event.preventDefault();
  }
  const $source = $(event.currentTarget);
  const $input = $($source.data("qty-change"));
  const max = $input.attr("max");
  const direction = $source.data("direction");
  if (direction === "down") {
    if ($input.val() > 1) {
      $input.val(parseInt($input.val(), 10) - 1);
    }
  } else if (direction === "up") {
    if ($input.val() < max) {
      $input.val(parseInt($input.val(), 10) + 1);
    }
  }
  $input.change();
}

$(document).on("click", el.button, QuantityChange);
