const fetch = global.fetch || require("node-fetch");

async function geocodeAddress(address) {
  if (!address || !String(address).trim()) return null;
  const mapboxToken = process.env.MAPBOX_TOKEN;
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    if (mapboxToken) {
      const q = encodeURIComponent(String(address));
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${mapboxToken}&limit=1`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const feat = json.features && json.features[0];
      if (!feat || !feat.center) return null;
      const [lng, lat] = feat.center;
      return { latitude: Number(lat), longitude: Number(lng) };
    }

    if (googleKey) {
      const q = encodeURIComponent(String(address));
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${googleKey}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const result = json.results && json.results[0];
      if (!result || !result.geometry || !result.geometry.location) return null;
      return {
        latitude: Number(result.geometry.location.lat),
        longitude: Number(result.geometry.location.lng),
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

module.exports = { geocodeAddress };
