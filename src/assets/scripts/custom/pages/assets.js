import $ from "jquery";

const el = {
  search: "[data-assets-quick-search]",
  item: "[data-asset-item]",
  title: "[data-asset-item-title]",
  download: "[data-download-asset]",
  set: "[data-asset-filter-set]",
};

function quickSearch() {
  setTimeout(() => {
    const value = $(el.search)
      .val()
      .toLowerCase();
    if (value.length > 0) {
      $(el.title).each(function() {
        const $this = $(this);
        if (
          $this
            .text()
            .toLowerCase()
            .includes(value)
        ) {
          $this.closest(el.item).slideDown("fast");
        } else {
          $this.closest(el.item).slideUp("fast");
        }
      });
    } else {
      $(el.item).slideDown("fast");
    }
  }, 200);
}

function forceDownload(link) {
  const url = link.attr("href");
  const fileName = link.attr("download");
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function() {
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(this.response);
    const tag = document.createElement("a");
    tag.href = imageUrl;
    tag.download = fileName;
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
  };
  xhr.send();
}

function toggleFilter(event) {
  const $source = $(event.currentTarget);
  const tag = $source.val();
  const $currentset = $source.closest($(el.set));

  // when clicking an input, change the active tag classes
  if ($source[0].tagName === "INPUT") {
    $currentset.removeClass();
    $currentset.addClass(`product-filter__filter-wrap ${tag}`);
  }

  runFilter();
}

// remove falsy && empty values from array
function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

// do the actual filtering here
function runFilter() {
  const $allSets = $(el.set);
  let allClasses = [];
  let activeTags = "";

  // remove the -all tag and the element class from the query
  $allSets.each(function() {
    let classes = $(this).attr("class");
    if (classes) {
      classes = classes
        .replace(/js-filter-set/, "")
        .replace(/product-filter__filter-wrap/, "")
        .replace(/usecase-all/, "")
        .replace(/skin-all/, "")
        .replace(/type-all/, "")
        .replace(/availability-all/, "")
        .split(/\s+/);
      classes = cleanArray(classes);
      if (classes.length > 0) {
        for (let i = 0; i < classes.length; i++) {
          activeTags += `.${classes[i]}`;
          allClasses.push(classes[i]);
        }
      }
      // push the remaining (actual tags) to the allclasses array
    }
  });

  // depending on the allClasses content show or hide items
  if (allClasses.length > 0) {
    $(`${el.item}${activeTags}`).fadeIn();
    $(`${el.item}:not(${activeTags})`).fadeOut();
  } else {
    $(el.item).fadeIn();
  }
}

function downloadInit(event) {
  event.preventDefault();
  forceDownload($(event.currentTarget));
}

$(document).on("change, keydown", el.search, quickSearch);

$(document).on("click", el.download, downloadInit);

$(document).on("click", `${el.set} input`, toggleFilter);
