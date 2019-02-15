import $ from "jquery";

const el = {
  redirect: "[data-quiz-redirect]",
  purchase: "[data-quiz-purchase]",
};

function quizRedirect() {
  const $link = $(el.redirect);
  if ($link.length > 0) {
    const email = $link.data("customer-email");
    const id = $link.data("customer-id");
    if (email && id) {
      $link.attr(
        "href",
        `https://certification.facerealityskincare.com?shopify_id=${id}&shopify_email=${email}`,
      );
    }
  }
}
function init() {
  quizRedirect();
  if ($(el.redirect).length && $(el.purchase).length) {
    const hasPurchased =
      localStorage.getItem("certification-bought") === "certification-bought"
        ? true
        : false;
    if (hasPurchased) {
      $(el.redirect).removeClass("d-none");
      $(el.purchase).addClass("d-none");
      localStorage.setItem("certification-bought", false);
    }
  }
}

$(document).ready(init);
