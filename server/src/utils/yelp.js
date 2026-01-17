const axios = require('axios');

const YELP_BASE = 'https://api.yelp.com/v3';

async function searchBusinesses({ location, term, categories, price, latitude, longitude, limit = 20 }) {
  const key = process.env.YELP_API_KEY;
  if (!key) throw new Error('YELP_API_KEY not set');

  const params = { limit };
  if (term) params.term = term;
  if (categories) params.categories = categories;
  if (price) params.price = price;
  if (location) params.location = location;
  if (latitude && longitude) {
    params.latitude = latitude;
    params.longitude = longitude;
  }

  const res = await axios.get(`${YELP_BASE}/businesses/search`, {
    headers: { Authorization: `Bearer ${key}` },
    params,
    timeout: 10000,
  });

  const businesses = (res.data && res.data.businesses) || [];
  return businesses.map(b => {
    // Yelp may return image_url or photos array - prefer image_url, fallback to first photo
    let imageUrl = b.image_url || null;
    if (!imageUrl && b.photos && Array.isArray(b.photos) && b.photos.length > 0) {
      imageUrl = b.photos[0];
    }
    
    return {
      id: b.id,
      name: b.name,
      rating: b.rating,
      review_count: b.review_count,
      price: b.price,
      categories: b.categories,
      // Normalize location to the app's expected shape
      location: {
        address: (b.location && (b.location.address1 || b.location.address)) || '',
        city: b.location?.city || '',
        state: b.location?.state || '',
        zip: b.location?.zip_code || '',
        latitude: b.coordinates?.latitude,
        longitude: b.coordinates?.longitude,
      },
      coordinates: b.coordinates,
      phone: b.display_phone,
      url: b.url,
      image_url: imageUrl,
      image: imageUrl,
      photos: b.photos || [],
      source: 'yelp',
    };
  });
}

/**
 * Get business details including photos
 * This endpoint returns more detailed information including photos array
 */
async function getBusinessDetails(businessId) {
  const key = process.env.YELP_API_KEY;
  if (!key) throw new Error('YELP_API_KEY not set');

  try {
    const res = await axios.get(`${YELP_BASE}/businesses/${businessId}`, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 10000,
    });

    const b = res.data;
    // Business details endpoint returns photos array and image_url
    let imageUrl = b.image_url || null;
    if (!imageUrl && b.photos && Array.isArray(b.photos) && b.photos.length > 0) {
      imageUrl = b.photos[0];
    }

    return {
      id: b.id,
      image_url: imageUrl,
      image: imageUrl,
      photos: b.photos || [],
    };
  } catch (error) {
    console.warn(`Failed to fetch business details for ${businessId}:`, error.message || error);
    return null;
  }
}

module.exports = { searchBusinesses, getBusinessDetails };
