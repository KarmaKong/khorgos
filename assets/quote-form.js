/* Builds a mailto: to sales@ with the three quote fields. No server. */
(function () {
  var form = document.querySelector("[data-quote-form]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    function v(name) {
      var x = fd.get(name);
      return (x == null ? "" : String(x)).trim();
    }
    var hub = v("hub");
    var dest = v("dest");
    var hs = v("hs");
    var kg = v("kg");
    var cbm = v("cbm");
    var lithium = fd.get("lithium") ? "yes" : "no";
    var oog = fd.get("oog") ? "yes" : "no";
    var notes = v("notes");
    var contact = v("contact");
    if (!hub || !dest || !kg || !cbm) {
      form.reportValidity();
      return;
    }
    var lines = [
      "China–Iran TIR quote request",
      "",
      "Origin hub: " + hub,
      "Destination customs: " + dest,
      "HS code: " + (hs || "(not given)"),
      "Gross weight kg: " + kg,
      "Volume CBM: " + cbm,
      "Class 9 lithium / chemicals (MSDS to follow): " + lithium,
      "Out-of-gauge (drawing to follow): " + oog,
      "Contact: " + (contact || "(see email From:)"),
      "",
      notes ? "Notes:\n" + notes : ""
    ];
    var body = lines.join("\n").replace(/\n+$/, "");
    var subject = "RFQ " + hub + " → " + dest + " / " + kg + " kg / " + cbm + " CBM";
    location.href =
      "mailto:sales@khorgosirantruck.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });
})();
