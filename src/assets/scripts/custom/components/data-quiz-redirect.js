import $ from "jquery";

const el = {
  redirect: "[data-quiz-redirect]",
};

function quizRedirect() {
  const $link = $(el.redirect);
  if ($link.length > 0) {
    const email = $link.data("customer-email");
    const id = $link.data("customer-id");
    if (email && id) {
      $link.attr(
        "href",
        `https://facereality-quiz.herokuapp.com?shopify_id=${id}&shopify_email=${email}`,
      );
    }
  }
}

$(document).ready(quizRedirect);
