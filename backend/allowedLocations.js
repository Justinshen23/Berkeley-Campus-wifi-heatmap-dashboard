const campusLocations = require("../src/data/campusLocations.json");

const ALLOWED_LOCATIONS = Object.freeze(campusLocations.map((location) => location.name));

function isAllowedLocation(location) {
  return ALLOWED_LOCATIONS.includes(location);
}

module.exports = {
  ALLOWED_LOCATIONS,
  isAllowedLocation,
};
