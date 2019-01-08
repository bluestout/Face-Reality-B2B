import $ from "jquery";

const el = {
  searchToggle: "[data-header-search-toggle]",
  searchform: "[data-header-search-form]",
  searchResults: "[data-header-search-results]",
  searchInputId: "Search",
};

function searchToggle() {
  $(el.searchform).slideToggle("fast");
  document.getElementById(el.searchInputId).focus();
}

$("body").on("click", () => {
  $(el.searchResults).fadeOut(100);
});

$(document).on("click", el.searchToggle, searchToggle);
