import $ from "jquery";

// load more order items on click - pagination ajax
function loadMore(event) {
  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  const $source = $(event.currentTarget);
  const link = $source.attr("href");
  const $paginationContainer = $("[data-order-pagination]");
  $paginationContainer.html("<div class='linear-loader'></div>");
  $.get(link, (data) => {
    const $content = $("[data-table-pagination-row]", data);
    const $moreLink = $("[data-order-load-more]", data);
    $("[data-table-pagination-row]:last-of-type").after($content);
    if ($moreLink.length > 0) {
      $paginationContainer.html($moreLink);
    } else {
      $paginationContainer.html("");
    }
  });
}

// if a redirect is set up after registration, redirect back to the certification product page
function redirectIfSet() {
  const redirect = localStorage.getItem("registerRedirect");
  if (redirect === "certification") {
    localStorage.setItem("registerRedirect", false);
    window.location.replace("/products/training-course");
  }
}

if (
  document.getElementById("account") ||
  document.getElementById("all") ||
  document.getElementsByClassName("template-index")[0]
) {
  redirectIfSet();
}

if (document.getElementById("account")) {
  $(document).on("click", "[data-order-load-more]", loadMore);
}
