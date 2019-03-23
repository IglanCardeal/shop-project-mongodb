document.addEventListener("DOMContentLoaded", () => {
  let $submit = document.getElementById("submit");
  let $keepConnect = document.getElementById("keepConnect");
  let $keep = document.getElementById("keep");

  $submit.addEventListener("click" || "keypress", event => {
    if ($keepConnect.checked) {
      $keep.setAttribute("value", "yes");
    }
    if (!$keepConnect.checked) {
      $keep.setAttribute("value", "no");
    }
  });
});
