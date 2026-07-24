document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");

  // If map is not present on page, stop
  if (!mapDiv) return;

  // Read data attributes safely
  const coordinates = mapDiv.dataset.coordinates;
  const title = mapDiv.dataset.title || "Location";

  // If coordinates are missing
  if (!coordinates || coordinates === "[]") return;

  let parsedCoords;
  try {
    parsedCoords = JSON.parse(coordinates);
  } catch (err) {
    console.error("Invalid coordinates format:", coordinates);
    return;
  }

  // Destructure [lng, lat]
  const [lng, lat] = parsedCoords;

  // Create map
  const map = L.map("map", {
    scrollWheelZoom: false,
  }).setView([lat, lng], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add marker

  const redIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const marker = L.marker([lat, lng], { icon: redIcon }).addTo(map);

  // Airbnb-style popup
  marker.bindPopup(
    `
      <div style="font-size:14px">
        <strong>${title}</strong><br>
        Exact location provided after booking.
      </div>
    `
  );

  // Open popup by default
  marker.openPopup();

  // Enable scroll zoom only after click
  map.on("click", () => {
    map.scrollWheelZoom.enable();
  });
});
