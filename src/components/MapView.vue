<script setup>

import { onMounted, nextTick, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sidebar from '../layout/sidebar.vue'
import axios from "axios"
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import Chart from 'chart.js/auto'
import { db } from '../firebase'
import { doc, updateDoc, arrayUnion }  from "firebase/firestore"
import { useRoute } from 'vue-router'

const route = useRoute()

const companyId = "9mtW21795c48r09s6nN9"; // Use your actual company id
let map = null
let marker = null // Reference for the marker
let markerClusterGroup = null // Reference for the cluster group
const results = ref([]) // Reactive array to store results
const name = ref('') // Reactive variable for address input
let autocomplete = null // For Google Places Autocomplete
let addressCard = ref(false) // To control address suggestions visibility
const showMobileDetail = ref(false)
let propertyMarkers = [] // Store references to clear old markers
const googlePinSvg = (color = "#4285F4") => `
  <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#shadow)">
      <path d="M16 47C16 47 30 29.5 30 19C30 9.61116 23.2843 2 16 2C8.71573 2 2 9.61116 2 19C2 29.5 16 47 16 47Z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="19" r="6" fill="#fff"/>
      <circle cx="16" cy="19" r="4" fill="${color}"/>
    </g>
    <defs>
      <filter id="shadow" x="0" y="0" width="32" height="48" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.2"/>
      </filter>
    </defs>
  </svg>
`;

// Watch for changes in the search input to show/hide address card
watch(name, (newValue) => {
  if (newValue && newValue.length > 0) {
    addressCard.value = true
  } else {
    addressCard.value = false
  }
})
// Add these to your script setup section
const isExpanded = ref(false)

const expandPanel = () => {
  const resultsPanel = document.querySelector('.mobile-results')
  resultsPanel.style.height = '100vh'
  isExpanded.value = true
}

const collapsePanel = () => {
  const resultsPanel = document.querySelector('.mobile-results')
  resultsPanel.style.height = '30vh'
  isExpanded.value = false
}

// Remove or comment out the initDraggablePanel function since we're not using drag anymore

const initMap = () => {
  // Initialize map with US center view
  map = L.map('map', {
    center: [39.8283, -98.5795], // Center of the US
    zoom: 4, // Zoom level to show most of the US
    zoomControl: false, // Disable default zoom control
    minZoom: 3
  })

  // Add zoom control to the bottom-right
  L.control.zoom({
    position: 'topright' // Change position to bottom-right
  }).addTo(map)

  // Normal tile layer
  const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  })

  // Satellite layer (ESRI)
  const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    }
  )
  
  // ATTOM parcel layer
  const attomLayer = L.tileLayer(
    'https://api.gateway.attomdata.com/parceltiles/{z}/{x}/{y}.png?apiKey=89f309df343222593a758fb5ec41e39a'
  )

  // Add base layers toggle
  const baseMaps = {
    'Normal': normalLayer,
    'Satellite': satelliteLayer
  }
  
  // Add overlay layers
  const overlayMaps = {
    'Property Parcels': attomLayer
  }

  L.control.layers(baseMaps, overlayMaps).addTo(map)
  normalLayer.addTo(map)
  attomLayer.addTo(map)

  // Initialize property data across the US
  loadPropertiesData()
  
  // Click handler for lat/lon
  map.on('click', async function (e) {
  const lat = e.latlng.lat
  const lng = e.latlng.lng

  console.log('Clicked coordinates:', lat, lng)

  document.getElementById('loadingelemnet').style.display = "block"
  document.getElementById("searchresults").textContent = ""

  // Add or move the marker for the clicked location
  if (marker) {
    marker.setLatLng([lat, lng]) // Move the marker to the new location
  } else {
    marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-selected-marker',
        html: '<div style="background-color: #FF5733; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map) // Add a new marker with custom styling
  }

  // Animate zoom to the clicked location
  map.setView([lat, lng], 19, { animate: true, duration: 1.5 }) // Zoom in with animation

  // Add result to the results container
  results.value.push(`Lat: ${lat}, Lng: ${lng}`)

  // Reverse geocode the clicked location
  reverseGeocode(lat, lng)

  // Fetch property data from ATTOM API
  await fetchPropertyData(lat, lng)
})
const reverseGeocode = (lat, lng) => {
  const geocoder = new google.maps.Geocoder()

  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const address = results[0].formatted_address
      console.log('Reverse Geocoded Address:', address)

      // Update the search input and reactive variable
      name.value = address
      document.getElementById('search_address').value = address
    } else {
      console.error('Reverse Geocoding failed:', status)
    }
  })
}
  // Hide address card on map double-click
 

  // Initialize Google Maps Places Autocomplete
  initGooglePlacesAutocomplete()
}

// Function to load property data across the US
const loadPropertiesData = () => {
  // Create a new marker cluster group with custom options
  markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16, // Show individual markers at zoom level 16+
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      // Different sizes/colors based on number of points
      let size, color;
      
      if (count < 10) {
        size = 30;
        color = '#4CAF50'; // Green for small clusters
      } else if (count < 100) {
        size = 40;
        color = '#2196F3'; // Blue for medium clusters
      } else {
        size = 50;
        color = '#FF9800'; // Orange for large clusters
      }
      
      return L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white;">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(size, size)
      });
    }
  });

  // Comprehensive US properties dataset
  const properties = [
    { lat: 36.182120, lng: -115.123456, address: "916 N 28TH ST, Las Vegas, NV", type: "Residential" },
  { lat: 34.052235, lng: -118.243683, address: "123 Main St, Los Angeles, CA", type: "Commercial" },
  { lat: 37.774929, lng: -122.419416, address: "456 Market St, San Francisco, CA", type: "Commercial" },
  { lat: 32.715738, lng: -117.161084, address: "789 Broadway, San Diego, CA", type: "Residential" },
  { lat: 45.523064, lng: -122.676483, address: "321 Pine St, Portland, OR", type: "Mixed Use" },
  { lat: 47.606209, lng: -122.332071, address: "555 Pike St, Seattle, WA", type: "Commercial" },
  
  // Central US
  { lat: 39.739235, lng: -104.990250, address: "100 Denver Ave, Denver, CO", type: "Residential" },
  { lat: 29.760427, lng: -95.369803, address: "200 Houston Rd, Houston, TX", type: "Commercial" },
  { lat: 32.776664, lng: -96.796988, address: "300 Dallas Blvd, Dallas, TX", type: "Commercial" },
  { lat: 39.099724, lng: -94.578331, address: "400 Kansas City Way, Kansas City, MO", type: "Residential" },
  { lat: 35.468087, lng: -97.517493, address: "500 Oklahoma Ave, Oklahoma City, OK", type: "Residential" },
  { lat: 44.977753, lng: -93.265011, address: "600 Minneapolis St, Minneapolis, MN", type: "Commercial" },
  { lat: 41.878113, lng: -87.629799, address: "700 Chicago Ave, Chicago, IL", type: "Mixed Use" },
  
  // East Coast
  { lat: 40.712775, lng: -74.005973, address: "800 Broadway, New York, NY", type: "Commercial" },
  { lat: 38.907192, lng: -77.036871, address: "900 Constitution Ave, Washington, DC", type: "Government" },
  { lat: 39.952584, lng: -75.165222, address: "1000 Philly St, Philadelphia, PA", type: "Residential" },
  { lat: 42.360082, lng: -71.058880, address: "1100 Boston Rd, Boston, MA", type: "Commercial" },
  { lat: 25.761680, lng: -80.191790, address: "1200 Miami Beach, Miami, FL", type: "Resort" },
  { lat: 33.748995, lng: -84.387982, address: "1300 Atlanta Hwy, Atlanta, GA", type: "Commercial" },
  { lat: 36.162664, lng: -86.781602, address: "1400 Nashville Rd, Nashville, TN", type: "Commercial" },
  
  // Additional clusters
  { lat: 39.961176, lng: -82.998794, address: "1500 Columbus Ave, Columbus, OH", type: "Residential" },
  { lat: 39.768403, lng: -86.158068, address: "1600 Indianapolis Blvd, Indianapolis, IN", type: "Commercial" },
  { lat: 35.227087, lng: -80.843127, address: "1700 Charlotte St, Charlotte, NC", type: "Commercial" },
  { lat: 36.153982, lng: -95.992775, address: "1800 Tulsa Ave, Tulsa, OK", type: "Residential" },
  { lat: 43.038902, lng: -87.906471, address: "1900 Milwaukee St, Milwaukee, WI", type: "Commercial" },
  { lat: 38.627003, lng: -90.199404, address: "2000 St Louis Ave, St. Louis, MO", type: "Mixed Use" },
  { lat: 30.267153, lng: -97.743061, address: "2100 Austin Hwy, Austin, TX", type: "Commercial" },
  
  // Additional properties for Las Vegas area to show density when zoomed in
  { lat: 36.181241, lng: -115.134567, address: "2200 E Sahara Ave, Las Vegas, NV", type: "Commercial" },
  { lat: 36.184523, lng: -115.143234, address: "2300 Paradise Rd, Las Vegas, NV", type: "Resort" },
  { lat: 36.173456, lng: -115.156789, address: "2400 Las Vegas Blvd, Las Vegas, NV", type: "Resort" },
  { lat: 36.178901, lng: -115.162345, address: "2500 Spring Mountain Rd, Las Vegas, NV", type: "Commercial" },
  { lat: 36.167890, lng: -115.149012, address: "2600 Tropicana Ave, Las Vegas, NV", type: "Resort" },
  
  // Additional West Coast properties
  { lat: 34.092809, lng: -118.328661, address: "2700 Hollywood Blvd, Los Angeles, CA", type: "Entertainment" },
  { lat: 34.105554, lng: -118.340159, address: "2800 Universal Studios Blvd, Universal City, CA", type: "Entertainment" },
  { lat: 34.118536, lng: -118.300392, address: "2900 Los Feliz Blvd, Los Angeles, CA", type: "Mixed Use" },
  { lat: 34.061112, lng: -118.447617, address: "3000 Wilshire Blvd, Beverly Hills, CA", type: "Luxury Residential" },
  { lat: 37.786371, lng: -122.405757, address: "3100 Mission St, San Francisco, CA", type: "Mixed Use" },
  { lat: 37.793155, lng: -122.394198, address: "3200 Embarcadero, San Francisco, CA", type: "Commercial" },
  { lat: 47.622151, lng: -122.354090, address: "3300 Queen Anne Ave, Seattle, WA", type: "Residential" },
  { lat: 47.608203, lng: -122.340576, address: "3400 1st Ave, Seattle, WA", type: "Commercial" },
  { lat: 45.512230, lng: -122.658722, address: "3500 Hawthorne Blvd, Portland, OR", type: "Commercial" },
  { lat: 45.530060, lng: -122.684565, address: "3600 NW 23rd Ave, Portland, OR", type: "Mixed Use" },
  
  // Mountain West
  { lat: 40.758701, lng: -111.876183, address: "3700 South Temple, Salt Lake City, UT", type: "Religious" },
  { lat: 40.767091, lng: -111.891047, address: "3800 State St, Salt Lake City, UT", type: "Commercial" },
  { lat: 35.084492, lng: -106.651138, address: "3900 Central Ave, Albuquerque, NM", type: "Commercial" },
  { lat: 35.151280, lng: -106.581409, address: "4000 Sandia Peak, Albuquerque, NM", type: "Recreation" },
  { lat: 33.448376, lng: -112.074036, address: "4100 Van Buren St, Phoenix, AZ", type: "Commercial" },
  { lat: 33.494170, lng: -112.075191, address: "4200 Camelback Rd, Phoenix, AZ", type: "Luxury Residential" },
  { lat: 39.709755, lng: -104.823898, address: "4300 Havana St, Denver, CO", type: "Industrial" },
  { lat: 39.678348, lng: -104.962309, address: "4400 University Blvd, Denver, CO", type: "Educational" },
  
  // Southwest
  { lat: 32.715329, lng: -117.157255, address: "4500 1st Ave, San Diego, CA", type: "Commercial" },
  { lat: 32.731629, lng: -117.195686, address: "4600 Mission Bay Dr, San Diego, CA", type: "Resort" },
  { lat: 29.424122, lng: -98.493628, address: "4700 Riverwalk, San Antonio, TX", type: "Entertainment" },
  { lat: 29.427793, lng: -98.438510, address: "4800 East Houston St, San Antonio, TX", type: "Residential" },
  { lat: 31.755781, lng: -106.488590, address: "4900 Montana Ave, El Paso, TX", type: "Commercial" },
  { lat: 31.775310, lng: -106.440231, address: "5000 Airport Rd, El Paso, TX", type: "Industrial" },
  { lat: 32.221743, lng: -110.926479, address: "5100 Speedway Blvd, Tucson, AZ", type: "Educational" },
  { lat: 32.236191, lng: -110.948555, address: "5200 Grant Rd, Tucson, AZ", type: "Commercial" },
  
  // Great Lakes
  { lat: 41.894417, lng: -87.622795, address: "5300 Michigan Ave, Chicago, IL", type: "Commercial" },
  { lat: 41.921101, lng: -87.633076, address: "5400 Lincoln Park, Chicago, IL", type: "Residential" },
  { lat: 42.331429, lng: -83.045753, address: "5500 Woodward Ave, Detroit, MI", type: "Cultural" },
  { lat: 42.358431, lng: -83.059647, address: "5600 Grand River Ave, Detroit, MI", type: "Industrial" },
  { lat: 41.499320, lng: -81.694361, address: "5700 Euclid Ave, Cleveland, OH", type: "Mixed Use" },
  { lat: 41.486325, lng: -81.678917, address: "5800 Carnegie Ave, Cleveland, OH", type: "Medical" },
  { lat: 43.041809, lng: -87.908669, address: "5900 Brady St, Milwaukee, WI", type: "Commercial" },
  { lat: 43.060673, lng: -87.967566, address: "6000 State St, Milwaukee, WI", type: "Educational" },
  
  // Midwest
  { lat: 39.103119, lng: -94.581078, address: "6100 Main St, Kansas City, MO", type: "Commercial" },
  { lat: 39.046204, lng: -94.593084, address: "6200 Country Club Plaza, Kansas City, MO", type: "Retail" },
  { lat: 38.632950, lng: -90.200508, address: "6300 Market St, St. Louis, MO", type: "Commercial" },
  { lat: 38.581406, lng: -89.939865, address: "6400 Illinois St, East St. Louis, IL", type: "Industrial" },
  { lat: 41.584454, lng: -93.624550, address: "6500 Grand Ave, Des Moines, IA", type: "Government" },
  { lat: 41.600545, lng: -93.609106, address: "6600 University Ave, Des Moines, IA", type: "Educational" },
  { lat: 44.952316, lng: -93.086779, address: "6700 University Ave, St. Paul, MN", type: "Educational" },
  { lat: 44.979031, lng: -93.264931, address: "6800 Nicollet Mall, Minneapolis, MN", type: "Commercial" },
  
  // South
  { lat: 29.954597, lng: -90.075419, address: "6900 Canal St, New Orleans, LA", type: "Commercial" },
  { lat: 29.960671, lng: -90.065251, address: "7000 Bourbon St, New Orleans, LA", type: "Entertainment" },
  { lat: 30.458283, lng: -91.140320, address: "7100 Government St, Baton Rouge, LA", type: "Government" },
  { lat: 30.451468, lng: -91.187324, address: "7200 Highland Rd, Baton Rouge, LA", type: "Educational" },
  { lat: 33.524521, lng: -86.810457, address: "7300 1st Ave N, Birmingham, AL", type: "Commercial" },
  { lat: 33.543682, lng: -86.779160, address: "7400 University Blvd, Birmingham, AL", type: "Educational" },
  { lat: 36.166410, lng: -86.778432, address: "7500 Broadway, Nashville, TN", type: "Entertainment" },
  { lat: 36.146790, lng: -86.803380, address: "7600 West End Ave, Nashville, TN", type: "Residential" },
  
  // Southeast
  { lat: 33.762909, lng: -84.422675, address: "7700 Peachtree St, Atlanta, GA", type: "Commercial" },
  { lat: 33.802189, lng: -84.469887, address: "7800 Howell Mill Rd, Atlanta, GA", type: "Retail" },
  { lat: 35.224159, lng: -80.839233, address: "7900 Trade St, Charlotte, NC", type: "Commercial" },
  { lat: 35.208395, lng: -80.825447, address: "8000 Independence Blvd, Charlotte, NC", type: "Mixed Use" },
  { lat: 27.950575, lng: -82.457176, address: "8100 Tampa St, Tampa, FL", type: "Commercial" },
  { lat: 27.970850, lng: -82.445154, address: "8200 Ybor City, Tampa, FL", type: "Entertainment" },
  { lat: 30.332184, lng: -81.655647, address: "8300 Bay St, Jacksonville, FL", type: "Commercial" },
  { lat: 30.316736, lng: -81.661167, address: "8400 Riverside Ave, Jacksonville, FL", type: "Residential" },
  
  // Northeast
  { lat: 40.758895, lng: -73.985131, address: "8500 5th Ave, New York, NY", type: "Luxury Retail" },
  { lat: 40.730610, lng: -73.935242, address: "8600 Bedford Ave, Brooklyn, NY", type: "Mixed Use" },
  { lat: 42.352271, lng: -71.073283, address: "8700 Newbury St, Boston, MA", type: "Retail" },
  { lat: 42.365863, lng: -71.104812, address: "8800 Mass Ave, Cambridge, MA", type: "Educational" },
  { lat: 39.947731, lng: -75.172257, address: "8900 Market St, Philadelphia, PA", type: "Commercial" },
  { lat: 39.951061, lng: -75.145935, address: "9000 Old City, Philadelphia, PA", type: "Historic" },
  { lat: 40.440625, lng: -79.995886, address: "9100 Forbes Ave, Pittsburgh, PA", type: "Commercial" },
  { lat: 40.444322, lng: -79.950923, address: "9200 Fifth Ave, Pittsburgh, PA", type: "Industrial" },
  
  // Additional Northeast
  { lat: 43.161030, lng: -77.610924, address: "9300 Main St, Rochester, NY", type: "Commercial" },
  { lat: 43.154785, lng: -77.581028, address: "9400 East Ave, Rochester, NY", type: "Educational" },
  { lat: 42.886448, lng: -78.878372, address: "9500 Delaware Ave, Buffalo, NY", type: "Commercial" },
  { lat: 42.908648, lng: -78.869861, address: "9600 Main St, Buffalo, NY", type: "Mixed Use" },
  { lat: 41.763710, lng: -72.685097, address: "9700 Farmington Ave, Hartford, CT", type: "Commercial" },
  { lat: 41.765944, lng: -72.673416, address: "9800 Asylum St, Hartford, CT", type: "Government" },
  { lat: 41.308274, lng: -72.927887, address: "9900 Chapel St, New Haven, CT", type: "Educational" },
  { lat: 41.311262, lng: -72.932152, address: "10000 Whitney Ave, New Haven, CT", type: "Residential" },
  
  // Mid-Atlantic
  { lat: 38.897957, lng: -77.036560, address: "10100 K Street NW, Washington, DC", type: "Commercial" },
  { lat: 38.921669, lng: -77.047285, address: "10200 Connecticut Ave, Washington, DC", type: "Residential" },
  { lat: 39.290386, lng: -76.612190, address: "10300 Pratt St, Baltimore, MD", type: "Commercial" },
  { lat: 39.328220, lng: -76.620270, address: "10400 Johns Hopkins, Baltimore, MD", type: "Medical" },
  { lat: 38.802610, lng: -77.046921, address: "10500 King St, Alexandria, VA", type: "Historic" },
  { lat: 38.889912, lng: -77.087133, address: "10600 Wilson Blvd, Arlington, VA", type: "Commercial" },
  { lat: 37.540725, lng: -77.436048, address: "10700 Broad St, Richmond, VA", type: "Government" },
  { lat: 37.551380, lng: -77.458229, address: "10800 Monument Ave, Richmond, VA", type: "Historic" },
  
  // Pacific Northwest
  { lat: 47.610377, lng: -122.200760, address: "10900 NE 8th St, Bellevue, WA", type: "Commercial" },
  { lat: 47.668663, lng: -122.299195, address: "11000 NE 65th St, Seattle, WA", type: "Residential" },
  { lat: 45.548060, lng: -122.630951, address: "11100 NE Alberta St, Portland, OR", type: "Mixed Use" },
  { lat: 45.460361, lng: -122.636710, address: "11200 SW Scholls Ferry Rd, Tigard, OR", type: "Retail" },
  { lat: 47.252877, lng: -122.441406, address: "11300 Pacific Ave, Tacoma, WA", type: "Commercial" },
  { lat: 47.609722, lng: -122.333084, address: "11400 Pike Place, Seattle, WA", type: "Market" },
  { lat: 46.272758, lng: -119.273029, address: "11500 Columbia Center Blvd, Kennewick, WA", type: "Commercial" },
  { lat: 47.497303, lng: -122.296615, address: "11600 International Blvd, SeaTac, WA", type: "Travel" },
  
  // Hawaii and Alaska
  { lat: 21.300259, lng: -157.851105, address: "11700 Kalakaua Ave, Honolulu, HI", type: "Resort" },
  { lat: 21.281624, lng: -157.831406, address: "11800 Diamond Head Rd, Honolulu, HI", type: "Residential" },
  { lat: 21.314188, lng: -157.862123, address: "11900 Ala Moana Blvd, Honolulu, HI", type: "Commercial" },
  { lat: 20.798363, lng: -156.331924, address: "12000 Haleakala Hwy, Kula, HI", type: "Agricultural" },
  { lat: 61.217381, lng: -149.863129, address: "12100 Northern Lights Blvd, Anchorage, AK", type: "Commercial" },
  { lat: 61.166591, lng: -149.832089, address: "12200 Old Seward Hwy, Anchorage, AK", type: "Industrial" },
  { lat: 58.301944, lng: -134.419720, address: "12300 Glacier Hwy, Juneau, AK", type: "Commercial" },
  { lat: 64.843611, lng: -147.723056, address: "12400 University Ave, Fairbanks, AK", type: "Educational" },
  
  // Additional Las Vegas area properties
  { lat: 36.114865, lng: -115.172897, address: "12500 S Las Vegas Blvd, Las Vegas, NV", type: "Resort" },
  { lat: 36.145303, lng: -115.161233, address: "12600 Fremont St, Las Vegas, NV", type: "Entertainment" },
  { lat: 36.171909, lng: -115.139832, address: "12700 E Flamingo Rd, Las Vegas, NV", type: "Residential" },
  { lat: 36.208034, lng: -115.220108, address: "12800 Summerlin Pkwy, Las Vegas, NV", type: "Residential" },
  { lat: 36.072742, lng: -115.108092, address: "12900 Eastern Ave, Henderson, NV", type: "Commercial" },
  { lat: 36.030881, lng: -115.076408, address: "13000 Horizon Ridge Pkwy, Henderson, NV", type: "Residential" },
  { lat: 36.272881, lng: -115.047791, address: "13100 Nellis Blvd, North Las Vegas, NV", type: "Industrial" },
  { lat: 36.239822, lng: -115.136116, address: "13200 Craig Rd, North Las Vegas, NV", type: "Commercial" },
  
  // More NYC area properties
  { lat: 40.748440, lng: -73.985664, address: "13300 34th St, New York, NY", type: "Commercial" },
  { lat: 40.689249, lng: -74.044500, address: "13400 Liberty St, Jersey City, NJ", type: "Commercial" },
  { lat: 40.750580, lng: -73.993584, address: "13500 Times Square, New York, NY", type: "Entertainment" },
  { lat: 40.782865, lng: -73.958261, address: "13600 5th Ave, New York, NY", type: "Luxury Residential" },
  { lat: 40.756684, lng: -73.986122, address: "13700 7th Ave, New York, NY", type: "Commercial" },
  { lat: 40.650002, lng: -73.949997, address: "13800 Ocean Ave, Brooklyn, NY", type: "Residential" },
  { lat: 40.678178, lng: -73.944158, address: "13900 Atlantic Ave, Brooklyn, NY", type: "Mixed Use" },
  { lat: 40.837048, lng: -73.865433, address: "14000 Fordham Rd, Bronx, NY", type: "Commercial" },
  
  // Florida properties
  { lat: 25.773899, lng: -80.134247, address: "14100 Collins Ave, Miami Beach, FL", type: "Resort" },
  { lat: 25.790654, lng: -80.130048, address: "14200 Bal Harbour Blvd, Bal Harbour, FL", type: "Luxury Retail" },
  { lat: 26.119965, lng: -80.139199, address: "14300 Las Olas Blvd, Fort Lauderdale, FL", type: "Commercial" },
  { lat: 26.459979, lng: -80.068665, address: "14400 Atlantic Ave, Delray Beach, FL", type: "Commercial" },
  { lat: 26.715858, lng: -80.053156, address: "14500 Worth Ave, Palm Beach, FL", type: "Luxury Retail" },
  { lat: 27.294474, lng: -82.537521, address: "14600 Main St, Sarasota, FL", type: "Commercial" },
  { lat: 28.032745, lng: -81.729584, address: "14700 Disney Way, Orlando, FL", type: "Entertainment" },
  { lat: 26.011202, lng: -80.139084, address: "14800 Hollywood Blvd, Hollywood, FL", type: "Commercial" },
  
  // Texas properties
  { lat: 29.974543, lng: -95.695782, address: "14900 Katy Freeway, Katy, TX", type: "Commercial" },
  { lat: 29.716612, lng: -95.410133, address: "15000 Rice Blvd, Houston, TX", type: "Educational" },
  { lat: 30.505499, lng: -97.820259, address: "15100 RR 620, Austin, TX", type: "Commercial" },
  { lat: 30.266666, lng: -97.738335, address: "15200 6th St, Austin, TX", type: "Entertainment" },
  { lat: 32.794975, lng: -96.765747, address: "15300 McKinney Ave, Dallas, TX", type: "Commercial" },
  { lat: 32.912994, lng: -96.950005, address: "15400 Belt Line Rd, Irving, TX", type: "Commercial" },
  { lat: 29.432928, lng: -98.618622, address: "15500 Culebra Rd, San Antonio, TX", type: "Residential" },
  { lat: 26.213965, lng: -98.325104, address: "15600 10th St, McAllen, TX", type: "Commercial" },
  
  // California properties
  { lat: 37.445578, lng: -122.161230, address: "15700 University Ave, Palo Alto, CA", type: "Educational" },
  { lat: 37.487846, lng: -122.236115, address: "15800 Sand Hill Rd, Menlo Park, CA", type: "Commercial" },
  { lat: 37.368830, lng: -121.929324, address: "15900 Santana Row, San Jose, CA", type: "Retail" },
  { lat: 38.575764, lng: -121.480755, address: "16000 Capitol Mall, Sacramento, CA", type: "Government" },
  { lat: 34.019325, lng: -118.493165, address: "16100 Santa Monica Blvd, Santa Monica, CA", type: "Commercial" },
  { lat: 34.101665, lng: -118.326401, address: "16200 Vine St, Hollywood, CA", type: "Entertainment" },
  { lat: 33.663300, lng: -117.698189, address: "16300 Crown Valley Pkwy, Mission Viejo, CA", type: "Residential" },
  { lat: 37.873965, lng: -122.270622, address: "16400 Telegraph Ave, Berkeley, CA", type: "Educational" },

  // extra
  {
    "lat": 29.974543,
    "lng": -95.695782,
    "address": "14900 Katy Freeway, Katy, TX 77094",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 42000,
    "year_built": 2005
  },
  {
    "lat": 32.786594,
    "lng": -96.802989,
    "address": "1500 Marilla St, Dallas, TX 75201",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 85000,
    "year_built": 1978
  },
  {
    "lat": 37.789030,
    "lng": -122.401373,
    "address": "101 Market St, San Francisco, CA 94105",
    "type": "Commercial",
    "subtype": "Financial",
    "sqft": 154000,
    "year_built": 1993
  },
  {
    "lat": 40.712742,
    "lng": -74.013382,
    "address": "200 Liberty St, New York, NY 10281",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 125000,
    "year_built": 1986
  },
  {
    "lat": 33.748955,
    "lng": -84.387605,
    "address": "121 Baker St NW, Atlanta, GA 30313",
    "type": "Retail",
    "subtype": "Shopping Center",
    "sqft": 67000,
    "year_built": 2001
  },
  {
    "lat": 34.052187,
    "lng": -118.243425,
    "address": "350 S Grand Ave, Los Angeles, CA 90071",
    "type": "Commercial",
    "subtype": "Mixed Use",
    "sqft": 87500,
    "year_built": 1999
  },
  {
    "lat": 41.878156,
    "lng": -87.629309,
    "address": "233 S Wacker Dr, Chicago, IL 60606",
    "type": "Commercial",
    "subtype": "Skyscraper",
    "sqft": 418000,
    "year_built": 1973
  },
  {
    "lat": 38.897466,
    "lng": -77.036583,
    "address": "1600 Pennsylvania Ave NW, Washington, DC 20500",
    "type": "Government",
    "subtype": "Federal",
    "sqft": 55000,
    "year_built": 1800
  },
  {
    "lat": 36.169845,
    "lng": -115.140261,
    "address": "3600 Las Vegas Blvd S, Las Vegas, NV 89109",
    "type": "Commercial",
    "subtype": "Hotel",
    "sqft": 320000,
    "year_built": 1998
  },
  {
    "lat": 33.448204,
    "lng": -112.073866,
    "address": "401 E Jefferson St, Phoenix, AZ 85004",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 112000,
    "year_built": 1998
  },
  {
    "lat": 39.749847,
    "lng": -104.996366,
    "address": "1701 Wynkoop St, Denver, CO 80202",
    "type": "Commercial",
    "subtype": "Transportation",
    "sqft": 54000,
    "year_built": 1914
  },
  {
    "lat": 47.608994,
    "lng": -122.339587,
    "address": "400 Broad St, Seattle, WA 98109",
    "type": "Commercial",
    "subtype": "Tourist",
    "sqft": 74400,
    "year_built": 1962
  },
  {
    "lat": 42.361254,
    "lng": -71.057349,
    "address": "4 South Market St, Boston, MA 02109",
    "type": "Retail",
    "subtype": "Market",
    "sqft": 43200,
    "year_built": 1824
  },
  {
    "lat": 30.267153,
    "lng": -97.743057,
    "address": "1100 Congress Ave, Austin, TX 78701",
    "type": "Government",
    "subtype": "State",
    "sqft": 88000,
    "year_built": 1888
  },
  {
    "lat": 45.523064,
    "lng": -122.676483,
    "address": "1120 SW 5th Ave, Portland, OR 97204",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 67800,
    "year_built": 1982
  },
  {
    "lat": 39.953346,
    "lng": -75.163577,
    "address": "1500 Market St, Philadelphia, PA 19102",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 130000,
    "year_built": 1974
  },
  {
    "lat": 29.760950,
    "lng": -95.369784,
    "address": "1001 Fannin St, Houston, TX 77002",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 98500,
    "year_built": 1985
  },
  {
    "lat": 35.776445,
    "lng": -78.638475,
    "address": "120 Fayetteville St, Raleigh, NC 27601",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 45600,
    "year_built": 2008
  },
  {
    "lat": 36.167777,
    "lng": -86.778432,
    "address": "150 3rd Ave S, Nashville, TN 37201",
    "type": "Commercial",
    "subtype": "Entertainment",
    "sqft": 34500,
    "year_built": 1997
  },
  {
    "lat": 39.099724,
    "lng": -94.578331,
    "address": "1 Arrowhead Dr, Kansas City, MO 64129",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 76416,
    "year_built": 1972
  },
  {
    "lat": 41.260655,
    "lng": -95.940649,
    "address": "1299 Farnam St, Omaha, NE 68102",
    "type": "Retail",
    "subtype": "Mall",
    "sqft": 87200,
    "year_built": 1990
  },
  {
    "lat": 32.080586,
    "lng": -81.088272,
    "address": "2 E Bay St, Savannah, GA 31401",
    "type": "Commercial",
    "subtype": "Historic",
    "sqft": 25000,
    "year_built": 1889
  },
  {
    "lat": 25.774173,
    "lng": -80.187132,
    "address": "1100 Biscayne Blvd, Miami, FL 33132",
    "type": "Commercial",
    "subtype": "Arts",
    "sqft": 78500,
    "year_built": 2006
  },
  {
    "lat": 32.366805,
    "lng": -86.299969,
    "address": "600 Dexter Ave, Montgomery, AL 36104",
    "type": "Government",
    "subtype": "State",
    "sqft": 59000,
    "year_built": 1851
  },
  {
    "lat": 28.538641,
    "lng": -81.379308,
    "address": "400 S Orange Ave, Orlando, FL 32801",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 65400,
    "year_built": 1983
  },
  {
    "lat": 40.440624,
    "lng": -79.995888,
    "address": "115 Federal St, Pittsburgh, PA 15212",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 42000,
    "year_built": 2001
  },
  {
    "lat": 44.986656,
    "lng": -93.258133,
    "address": "100 Washington Ave S, Minneapolis, MN 55401",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 88700,
    "year_built": 1992
  },
  {
    "lat": 43.038902,
    "lng": -87.906471,
    "address": "777 N Water St, Milwaukee, WI 53202",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 54300,
    "year_built": 1988
  },
  {
    "lat": 38.626418,
    "lng": -90.192739,
    "address": "1 S Memorial Dr, St. Louis, MO 63102",
    "type": "Commercial",
    "subtype": "Monument",
    "sqft": 43000,
    "year_built": 1965
  },
  {
    "lat": 34.744357,
    "lng": -92.267376,
    "address": "500 Woodlane St, Little Rock, AR 72201",
    "type": "Government",
    "subtype": "State",
    "sqft": 63000,
    "year_built": 1915
  },
  {
    "lat": 33.763382,
    "lng": -118.191597,
    "address": "555 E Ocean Blvd, Long Beach, CA 90802",
    "type": "Residential",
    "subtype": "Condominium",
    "sqft": 450000,
    "year_built": 2003
  },
  {
    "lat": 37.334915,
    "lng": -121.888239,
    "address": "55 S Market St, San Jose, CA 95113",
    "type": "Commercial",
    "subtype": "Tech",
    "sqft": 78000,
    "year_built": 2001
  },
  {
    "lat": 33.524521,
    "lng": -112.185089,
    "address": "9495 W Coyotes Blvd, Glendale, AZ 85305",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 63000,
    "year_built": 2003
  },
  {
    "lat": 36.731654,
    "lng": -119.785736,
    "address": "700 M St, Fresno, CA 93721",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 48500,
    "year_built": 1992
  },
  {
    "lat": 32.728725,
    "lng": -117.161087,
    "address": "1050 Island Ave, San Diego, CA 92101",
    "type": "Residential",
    "subtype": "Loft",
    "sqft": 120000,
    "year_built": 1998
  },
  {
    "lat": 35.468494,
    "lng": -97.521217,
    "address": "100 N Broadway Ave, Oklahoma City, OK 73102",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 67000,
    "year_built": 1977
  },
  {
    "lat": 36.153982,
    "lng": -95.992775,
    "address": "201 S Boston Ave, Tulsa, OK 74103", 
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 54000,
    "year_built": 1975
  },
  {
    "lat": 39.768379,
    "lng": -86.158043,
    "address": "1 Monument Cir, Indianapolis, IN 46204",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 49000,
    "year_built": 1962
  },
  {
    "lat": 40.116450,
    "lng": -88.243385,
    "address": "301 N Neil St, Champaign, IL 61820",
    "type": "Retail",
    "subtype": "Shopping Center",
    "sqft": 35000,
    "year_built": 1987
  },
  {
    "lat": 43.074761,
    "lng": -89.384163,
    "address": "2 E Main St, Madison, WI 53703",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 42000,
    "year_built": 1938
  },
  {
    "lat": 39.103118,
    "lng": -84.512020,
    "address": "100 W 5th St, Cincinnati, OH 45202",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 58000,
    "year_built": 1984
  },
  {
    "lat": 41.499320,
    "lng": -81.694361,
    "address": "1100 Superior Ave, Cleveland, OH 44114",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 67000,
    "year_built": 1983
  },
  {
    "lat": 42.331429,
    "lng": -83.045753,
    "address": "400 Monroe St, Detroit, MI 48226",
    "type": "Commercial",
    "subtype": "Historic",
    "sqft": 34000,
    "year_built": 1929
  },
  {
    "lat": 40.761439,
    "lng": -73.977622,
    "address": "1271 Avenue of the Americas, New York, NY 10020",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 210000,
    "year_built": 1959
  },
  {
    "lat": 38.889484,
    "lng": -77.022203,
    "address": "600 Pennsylvania Ave NW, Washington, DC 20580",
    "type": "Government",
    "subtype": "Federal",
    "sqft": 83000,
    "year_built": 1937
  },
  {
    "lat": 42.257476,
    "lng": -71.123029,
    "address": "1200 Beacon St, Brookline, MA 02446",
    "type": "Residential",
    "subtype": "Apartment",
    "sqft": 85000,
    "year_built": 1965
  },
  {
    "lat": 37.423156,
    "lng": -122.084917,
    "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
    "type": "Commercial",
    "subtype": "Tech Campus",
    "sqft": 325000,
    "year_built": 2004
  },
  {
    "lat": 47.622513,
    "lng": -122.336880,
    "address": "410 Terry Ave N, Seattle, WA 98109",
    "type": "Commercial",
    "subtype": "Tech",
    "sqft": 178000,
    "year_built": 2012
  },
  {
    "lat": 34.095310,
    "lng": -118.375192,
    "address": "10000 Santa Monica Blvd, Los Angeles, CA 90067",
    "type": "Residential",
    "subtype": "Luxury",
    "sqft": 210000,
    "year_built": 2010
  },
  {
    "lat": 37.783421,
    "lng": -122.408226,
    "address": "525 Market St, San Francisco, CA 94105",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 156000,
    "year_built": 1973
  },
  {
    "lat": 32.866642,
    "lng": -96.939399,
    "address": "7800 Alpha Rd, Dallas, TX 75240",
    "type": "Land",
    "subtype": "Undeveloped",
    "sqft": 435600,
    "year_built": null
  },
  {
    "lat": 35.216679,
    "lng": -80.843127,
    "address": "800 S Mint St, Charlotte, NC 28202",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 87500,
    "year_built": 1996
  },
  {
    "lat": 37.871666,
    "lng": -122.272781,
    "address": "2300 Shattuck Ave, Berkeley, CA 94704",
    "type": "Commercial",
    "subtype": "Educational",
    "sqft": 67000,
    "year_built": 1982
  },
  {
    "lat": 37.548271,
    "lng": -121.988571,
    "address": "5000 Paseo Padre Pkwy, Fremont, CA 94555",
    "type": "Residential",
    "subtype": "Single Family",
    "sqft": 320000,
    "year_built": 1996
  },
  {
    "lat": 33.835293,
    "lng": -117.914505,
    "address": "1313 Disneyland Dr, Anaheim, CA 92802",
    "type": "Commercial",
    "subtype": "Entertainment",
    "sqft": 510000,
    "year_built": 1955
  },
  {
    "lat": 30.267605,
    "lng": -97.750023,
    "address": "2201 Barton Springs Rd, Austin, TX 78704",
    "type": "Land",
    "subtype": "Park",
    "sqft": 871200,
    "year_built": null
  },
  {
    "lat": 41.882244,
    "lng": -87.623192,
    "address": "201 E Randolph St, Chicago, IL 60602",
    "type": "Land",
    "subtype": "Park",
    "sqft": 1090000,
    "year_built": 2004
  },
  {
    "lat": 39.749825,
    "lng": -105.000160,
    "address": "2001 Elitch Cir, Denver, CO 80204",
    "type": "Commercial",
    "subtype": "Entertainment",
    "sqft": 562000,
    "year_built": 1995
  },
  {
    "lat": 32.929553,
    "lng": -96.821123,
    "address": "8000 Forest Ln, Dallas, TX 75243",
    "type": "Residential",
    "subtype": "Apartment",
    "sqft": 156000,
    "year_built": 1988
  },
  {
    "lat": 33.588738,
    "lng": -112.183022,
    "address": "10000 N 31st Ave, Phoenix, AZ 85051",
    "type": "Retail",
    "subtype": "Mall",
    "sqft": 210000,
    "year_built": 1973
  },
  {
    "lat": 42.339904,
    "lng": -71.094166,
    "address": "4 Yawkey Way, Boston, MA 02215",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 45000,
    "year_built": 1912
  },
  {
    "lat": 42.108424,
    "lng": -80.106627,
    "address": "8800 Peach St, Erie, PA 16509",
    "type": "Retail",
    "subtype": "Mall",
    "sqft": 178000,
    "year_built": 1975
  },
  {
    "lat": 36.114647,
    "lng": -115.172813,
    "address": "3570 Las Vegas Blvd S, Las Vegas, NV 89109",
    "type": "Commercial",
    "subtype": "Hotel",
    "sqft": 345000,
    "year_built": 1998
  },
  {
    "lat": 34.056253,
    "lng": -118.238863,
    "address": "221 S Grand Ave, Los Angeles, CA 90012",
    "type": "Commercial",
    "subtype": "Arts",
    "sqft": 120000,
    "year_built": 2015
  },
  {
    "lat": 40.779447,
    "lng": -73.963244,
    "address": "1071 5th Ave, New York, NY 10128",
    "type": "Commercial",
    "subtype": "Museum",
    "sqft": 89000,
    "year_built": 1959
  },
  {
    "lat": 38.889939,
    "lng": -77.009051,
    "address": "100 Maryland Ave NE, Washington, DC 20002",
    "type": "Government",
    "subtype": "Federal",
    "sqft": 128000,
    "year_built": 1935
  },
  {
    "lat": 25.782324,
    "lng": -80.131900,
    "address": "1001 Ocean Dr, Miami Beach, FL 33139",
    "type": "Commercial",
    "subtype": "Hotel",
    "sqft": 45000,
    "year_built": 1938
  },
  {
    "lat": 29.951065,
    "lng": -90.071533,
    "address": "700 Decatur St, New Orleans, LA 70116",
    "type": "Commercial",
    "subtype": "Restaurant",
    "sqft": 15000,
    "year_built": 1862
  },
  {
    "lat": 37.804436,
    "lng": -122.271100,
    "address": "1111 Broadway, Oakland, CA 94607",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 67000,
    "year_built": 1990
  },
  {
    "lat": 34.055500,
    "lng": -118.247626,
    "address": "350 S Grand Ave, Los Angeles, CA 90071",
    "type": "Government",
    "subtype": "Courthouse",
    "sqft": 98000,
    "year_built": 1958
  },
  {
    "lat": 39.952583,
    "lng": -75.165222,
    "address": "1900 Benjamin Franklin Pkwy, Philadelphia, PA 19103",
    "type": "Commercial",
    "subtype": "Museum",
    "sqft": 125000,
    "year_built": 1928
  },
  {
    "lat": 42.358162,
    "lng": -71.063698,
    "address": "100 Federal St, Boston, MA 02110",
    "type": "Commercial",
    "subtype": "Financial",
    "sqft": 158000,
    "year_built": 1971
  },
  {
    "lat": 28.384450,
    "lng": -81.563874,
    "address": "1375 E Buena Vista Dr, Orlando, FL 32830",
    "type": "Commercial",
    "subtype": "Entertainment",
    "sqft": 620000,
    "year_built": 1971
  },
  {
    "lat": 30.263325,
    "lng": -97.742398,
    "address": "1100 Congress Ave, Austin, TX 78701",
    "type": "Land",
    "subtype": "Development",
    "sqft": 217800,
    "year_built": null
  },
  {
    "lat": 40.743977,
    "lng": -73.988170,
    "address": "2 Pennsylvania Plaza, New York, NY 10121",
    "type": "Commercial",
    "subtype": "Sports",
    "sqft": 820000,
    "year_built": 1968
  },
  {
    "lat": 37.569475,
    "lng": -77.473686,
    "address": "6700 Three Chopt Rd, Richmond, VA 23226",
    "type": "Residential",
    "subtype": "Single Family",
    "sqft": 435000,
    "year_built": 1991
  },
  {
    "lat": 31.762127,
    "lng": -106.485022,
    "address": "1 Civic Center Plaza, El Paso, TX 79901",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 56000,
    "year_built": 1979
  },
  {
    "lat": 45.516022,
    "lng": -122.679138,
    "address": "1000 SW Broadway, Portland, OR 97205",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 78000,
    "year_built": 1982
  },
  {
    "lat": 47.606098,
    "lng": -122.332336,
    "address": "1201 3rd Ave, Seattle, WA 98101",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 189000,
    "year_built": 1988
  },
  {
    "lat": 44.943829,
    "lng": -93.094538,
    "address": "345 Kellogg Blvd W, St Paul, MN 55102",
    "type": "Government",
    "subtype": "Museum",
    "sqft": 427000,
    "year_built": 1917
  },
  {
    "lat": 33.447207,
    "lng": -86.809259,
    "address": "2100 16th Ave S, Birmingham, AL 35205",
    "type": "Residential",
    "subtype": "Apartment",
    "sqft": 89000,
    "year_built": 2002
  },
  {
    "lat": 36.850769,
    "lng": -75.977974,
    "address": "2101 Parks Ave, Virginia Beach, VA 23451",
    "type": "Commercial",
    "subtype": "Hotel",
    "sqft": 132000,
    "year_built": 1985
  },
  {
    "lat": 35.294400,
    "lng": -80.744210,
    "address": "10850 Mallard Creek Rd, Charlotte, NC 28262",
    "type": "Commercial",
    "subtype": "Office Park",
    "sqft": 324000,
    "year_built": 1995
  },
  {
    "lat": 42.465607,
    "lng": -83.376576,
    "address": "27600 Northwestern Hwy, Southfield, MI 48034",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 180000,
    "year_built": 1972
  },
  {
    "lat": 42.650661,
    "lng": -73.757278,
    "address": "89 State St, Albany, NY 12207",
    "type": "Government",
    "subtype": "State",
    "sqft": 78000,
    "year_built": 1842
  },
  {
    "lat": 33.757714,
    "lng": -84.391185,
    "address": "101 Marietta St NW, Atlanta, GA 30303",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 134000,
    "year_built": 1975
  },
  {
    "lat": 35.768036,
    "lng": -78.634090,
    "address": "227 Fayetteville St, Raleigh, NC 27601",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 89000,
    "year_built": 2005
  },
  {
    "lat": 27.950575,
    "lng": -82.457176,
    "address": "401 E Jackson St, Tampa, FL 33602",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 156000,
    "year_built": 1986
  },
  {
    "lat": 30.332184,
    "lng": -81.655647,
    "address": "1 Independent Dr, Jacksonville, FL 32202",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 115000,
    "year_built": 1974
  },
  {
    "lat": 41.659248,
    "lng": -91.533276,
    "address": "10 S Clinton St, Iowa City, IA 52240",
    "type": "Commercial",
    "subtype": "Retail",
    "sqft": 34000,
    "year_built": 1962
  },
  {
    "lat": 28.538336,
    "lng": -81.379234,
    "address": "400 S Orange Ave, Orlando, FL 32801",
    "type": "Government",
    "subtype": "Municipal",
    "sqft": 54000,
    "year_built": 1991
  },
  {
    "lat": 39.738453,
    "lng": -104.984853,
    "address": "1144 15th St, Denver, CO 80202",
    "type": "Commercial",
    "subtype": "Office",
    "sqft": 134000,
    "year_built": 2010
  }
  ];

  // Create markers for each property with custom icons based on property type
  properties.forEach(prop => {
    // Define marker icon based on property type
    let iconHtml, iconColor;
    
    switch(prop.type) {
      case "Commercial":
        iconColor = "#2196F3"; // Blue
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #2196F3; border-radius: 50%; border: 2px solid white;"></div>';
        break;
      case "Residential":
        iconColor = "#4CAF50"; // Green
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #4CAF50; border-radius: 50%; border: 2px solid white;"></div>';
        break;
      case "Mixed Use":
        iconColor = "#9C27B0"; // Purple
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #9C27B0; border-radius: 50%; border: 2px solid white;"></div>';
        break;
      case "Resort":
        iconColor = "#FF9800"; // Orange
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #FF9800; border-radius: 50%; border: 2px solid white;"></div>';
        break;
      case "Government":
        iconColor = "#F44336"; // Red
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #F44336; border-radius: 50%; border: 2px solid white;"></div>';
        break;
      default:
        iconColor = "#607D8B"; // Gray
        iconHtml = '<div style="width: 12px; height: 12px; background-color: #607D8B; border-radius: 50%; border: 2px solid white;"></div>';
    }
    
    const customIcon = L.divIcon({
      className: 'custom-property-marker',
      html: iconHtml,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    // Create marker with custom icon and popup
    const propertyMarker = L.marker([prop.lat, prop.lng], { icon: customIcon })
      .bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: ${iconColor};">${prop.type} Property</h4>
          <p style="margin: 0 0 5px 0;"><strong>Address:</strong> ${prop.address}</p>
          <button 
            onclick="window.fetchPropertyDetails(${prop.lat}, ${prop.lng})" 
            style="background-color: ${iconColor}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 8px;"
          >View Details</button>
        </div>
      `, { 
        closeButton: true,
        autoPan: true,
        autoClose: false
      });
    
    // Add marker to cluster group
    markerClusterGroup.addLayer(propertyMarker);
  });

  // Add the cluster group to the map
  map.addLayer(markerClusterGroup);
  
  // Add global function to window for accessing from popup button
  window.fetchPropertyDetails = (lat, lng) => {
    // Close the popup
    map.closePopup();
    
    // Center on the property
    map.setView([lat, lng], 19, { animate: true, duration: 1.5 });
    
    // Add or move the marker
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-selected-marker',
          html: '<div style="background-color: #FF5733; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
    }
    
    // Show loading
    document.getElementById('loadingelemnet').style.display = "block";
    document.getElementById("searchresults").textContent = "";
    
    // Fetch property data
    fetchPropertyData(lat, lng);
  };
}

// Function to initialize Google Maps Places Autocomplete
const initGooglePlacesAutocomplete = () => {
  // Mobile input
  const mobileInput = document.getElementById('search_address');
  if (mobileInput) {
    const mobileAutocomplete = new google.maps.places.Autocomplete(mobileInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    mobileAutocomplete.addListener('place_changed', () => {
      const place = mobileAutocomplete.getPlace();
      if (!place.geometry) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      map.setView([lat, lng], 19, { animate: true, duration: 1.5 });
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng]).addTo(map);
      document.getElementById('loadingelemnet').style.display = "block";
      document.getElementById("searchresults").textContent = "";
      fetchPropertyData(lat, lng);
      name.value = place.formatted_address;
    });
  }

  // Desktop input
  const desktopInput = document.getElementById('search_address_desktop');
  if (desktopInput) {
    const desktopAutocomplete = new google.maps.places.Autocomplete(desktopInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    desktopAutocomplete.addListener('place_changed', () => {
      const place = desktopAutocomplete.getPlace();
      if (!place.geometry) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      map.setView([lat, lng], 19, { animate: true, duration: 1.5 });
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng]).addTo(map);
      document.getElementById('loadingelemnet').style.display = "block";
      document.getElementById("searchresults_desktop").textContent = "";
      fetchPropertyData(lat, lng);
      name.value = place.formatted_address;
    });
  }
};

// Function to geocode an address manually when search icon is clicked
const geocodeAddress = () => {
  if (!name.value) return
  
  const geocoder = new google.maps.Geocoder()
  
  geocoder.geocode({ address: name.value }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const lat = results[0].geometry.location.lat()
      const lng = results[0].geometry.location.lng()
      
      // Update map
      map.setView([lat, lng], 19, { animate: true, duration: 1.5 })
      
      // Add or move marker
      if (marker) {
        marker.setLatLng([lat, lng])
      } else {
        marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-selected-marker',
            html: '<div style="background-color: #FF5733; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map)
      }
      
      // Hide address card and show loading
    
      document.getElementById('loadingelemnet').style.display = "block"
      document.getElementById("searchresults").textContent = ""
      
      // Fetch property data
      fetchPropertyData(lat, lng)
    } else {
      console.error('Geocode was not successful for the following reason: ' + status)
    }
  })
}

// Function to fetch property data from ATTOM API
const fetchPropertyData = async (lat, lng) => {
  const API_HOST = "https://api.gateway.attomdata.com"
  const API_KEY = "89f309df343222593a758fb5ec41e39a"
  const endpoint = `${API_HOST}/propertyapi/v1.0.0/assessment/snapshot`

  const params = {
    latitude: lat,
    longitude: lng,
    radius: 0.1,
    orderby: "distance ASC"
  }

  try {
    const response = await axios.get(endpoint, {
      headers: {
        accept: "application/json",
        apikey: API_KEY
      },
      params
    })
    document.getElementById('loadingelemnet').style.display = "none"
    
    console.log("Response from Attom API:", response.data)
    // Save response for back button functionality
    window.lastResponse = response.data
    displayPropertyList(response.data)
    console.log(response.data.property)
    showAttomPropertiesOnMap(response.data.property);
  } catch (error) {
    console.error("Error fetching data from Attom API:", error)
    document.getElementById('loadingelemnet').style.display = "none"
    document.getElementById("searchresults").textContent = "Failed to fetch property data."
  }
}
const calculateHistoricalValues = (currentValue) => {
  // If it's a string, clean it; if it's a number, use as is
  let baseValue = 0;
  if (typeof currentValue === 'string') {
    baseValue = parseFloat(currentValue.replace(/[^0-9.]/g, ''));
  } else if (typeof currentValue === 'number') {
    baseValue = currentValue;
  } else {
    return { years: [], values: [] };
  }

  const years = [];
  const values = [];

  for (let i = 4; i >= 0; i--) {
    const year = new Date().getFullYear() - i;
    years.push(year.toString());
    values.push(Math.round(baseValue * Math.pow(0.9, i)));
  }

  return { years, values };
}

const initializeChart = (assessedValue) => {
  if (!assessedValue) return
  
  const chartElement = document.getElementById('assessedValueChart')
  if (!chartElement) return
  
  const { years, values } = calculateHistoricalValues(assessedValue)
  
  new Chart(chartElement, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Assessed Value Trend',
        data: values,
        borderColor: '#1A73E8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: value => `$${value.toLocaleString()}`
          }
        }
      }
    }
  })
}


const showPropertyDetail = (property) => {
  // Extract property details
  const address = property.address?.oneLine || 'N/A'
  const shortAddress = property.address?.line1 || 'N/A'
  const cityStateZip = `${property.address?.locality || ''}, ${property.address?.countrySubd || ''} ${property.address?.postal1 || ''}`
  const lotSize = property.lot?.lotSize1 ? `${property.lot.lotSize1.toFixed(2)} acres` : 'N/A'
  const propertyClass = property.summary?.propclass || 'N/A'
  const propertyType = property.summary?.propertyType || 'N/A'
  const yearBuilt = property.summary?.yearbuilt || 'N/A'
  const sqft = property.building?.size?.universalsize ? `${property.building.size.universalsize.toLocaleString()} sq ft` : 'N/A'
  const assessedValue = property.assessment?.assessed?.assdttlvalue ? `$${property.assessment.assessed.assdttlvalue.toLocaleString()}` : 'N/A'
  const marketValue = property.assessment?.market?.mktttlvalue ? `$${property.assessment.market.mktttlvalue.toLocaleString()}` : 'N/A'
  const taxAmount = property.assessment?.tax?.taxamt ? `$${property.assessment.tax.taxamt.toLocaleString()}` : 'N/A'
  const taxYear = property.assessment?.tax?.taxyear || 'N/A'
  
  // Get property image based on type
  const propertyImages = {
    "SINGLE FAMILY RESIDENCE": "https://cdn2.yieldstreet.com/wp-content/uploads/2020/02/23163436/family-home-single-family-rental1.jpg",
    "COMMERCIAL": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToiF6q73UTkneItvO27fdNkEjkHUEXjxthhg&s",
    "WAREHOUSE": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAKWBZkbAomWlXkY40FIj106Uceel2ZR0M7g&s",
    "INDUSTRIAL": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAKWBZkbAomWlXkY40FIj106Uceel2ZR0M7g&s",
    "VACANT LAND": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIK0Ghi1Y1f9nFOgjFk85Ww8QWT4JopNJ0EA&s",
    "DEFAULT": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIK0Ghi1Y1f9nFOgjFk85Ww8QWT4JopNJ0EA&s"
  }
  const propertyImage = propertyImages[propertyType] || propertyImages["DEFAULT"]
  
  // Create detailed view HTML
  const detailHTML = `
    <div class="property-detail">
      <div class="detail-header">
        <button class="back-button" onclick="showPropertyList()">
          <i class="pi pi-arrow-left"></i>
        </button>
        <h2 style="color:black;">${shortAddress}</h2>
      </div>
      
      <div class="detail-image">
        <img src="${propertyImage}" alt="${propertyType}">
      </div>
      
      <div class="detail-content">
        <h3 style="color:black;">${cityStateZip}</h3>
        <div class="property-tag" style="color:black;">${propertyClass}</div>
        
        <div class="detail-section">
          <div class="detail-row">
            <div class="detail-item">
              <i class="pi pi-home"></i>
              <div>
                <span class="label">Property Type</span>
                <span class="value" style="color:black;">${propertyType}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <div>
                <span class="label">Year Built</span>
                <span class="value" style="color:black;">${yearBuilt}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-item">
              <i class="pi pi-th-large"></i>
              <div>
                <span class="label">Lot Size</span>
                <span class="value" style="color:black;">${lotSize}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="pi pi-building"></i>
              <div>
                <span class="label">Building Size</span>
                <span class="value" style="color:black;">${sqft}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-item">
              <i class="pi pi-money-bill"></i>
              <div>
                <span class="label">Market Value</span>
                <span class="value" style="color:black;">${marketValue}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <i class="pi pi-dollar"></i>
              <div>
                <span class="label" style="color:black;">Tax (${taxYear})</span>
                <span class="value" style="color:black;">${taxAmount}</span>
              </div>
            </div>
          
          </div>

          <div>
              <i class="pi pi-chart-bar"></i>
              <div>
                <span class="label">Assessed Value</span>
                
                <div class="chart-container" style="margin-top: 10px; height: 200px;">
                  <canvas id="assessedValueChart"></canvas>
                </div>
              </div>
              </div>
        </div>
        
        <div class="detail-actions">
          <button class="action-button">
            <i class="pi pi-bookmark"></i>
            <span class="save-bookmark-btn">Save</span>
          </button>
          <button class="action-button">
            <i class="pi pi-share-alt"></i>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  `
  
  // Replace content with detailed view
 
  if (window.innerWidth <= 768) {
    // Show mobile full screen view
    showMobileDetail.value = true
     // Extract HTML creation to separate function
      nextTick(() => {
      // Wait for the element to be created
      document.getElementById('mobile-detail-content').innerHTML = detailHTML
      initializeChart(property.assessment?.assessed?.assdttlvalue)
       const saveBtn = document.querySelector('.save-bookmark-btn');
  if (saveBtn) {
    saveBtn.onclick = () => bookmarkProperty(property);
  }
    })
    
  } else {
    // Desktop view remains the same
    
   
    nextTick(() => {
    const maincontainer = document.getElementById('searchresults')
    const desktopcontainer = document.getElementById('searchresults_desktop')
    maincontainer.innerHTML = detailHTML
    desktopcontainer.innerHTML = detailHTML
    initializeChart(property.assessment?.assessed?.assdttlvalue)
     const saveBtn = document.querySelector('.save-bookmark-btn');
  if (saveBtn) {
    saveBtn.onclick = () => bookmarkProperty(property);
  }
  })
  }
}

  function showAttomPropertiesOnMap(properties) {
  // Remove old markers
  propertyMarkers.forEach(marker => map.removeLayer(marker));
  propertyMarkers = [];

  properties.forEach(property => {
    // Use location.latitude/longitude (may be string, so parseFloat)
    const lat = parseFloat(property.location?.latitude);
    const lng = parseFloat(property.location?.longitude);
    if (!lat || !lng) return;

    // Color by property type
    let color = "#607D8B";
    const type = (property.summary?.propertyType || property.summary?.propclass || '').toUpperCase();
    if (type.includes("SINGLE FAMILY")) color = "#4CAF50";
    else if (type.includes("COMMERCIAL")) color = "#2196F3";
    else if (type.includes("CONDOMINIUM")) color = "#9C27B0";
    else if (type.includes("ROW HOUSE")) color = "#FF9800";
    else if (type.includes("PARKING")) color = "#FFC107";
    else if (type.includes("GOVERNMENT")) color = "#F44336";

    // Custom marker icon
    const icon = L.divIcon({
  className: 'google-pin-marker',
  html: googlePinSvg(color),
  iconSize: [32, 48],
  iconAnchor: [16, 47], // bottom center
  popupAnchor: [0, -48]
});

    // Popup content
    const address = property.address?.oneLine || property.address?.line1 || 'N/A';
    const value = property.assessment?.market?.mktttlvalue
      ? `$${property.assessment.market.mktttlvalue.toLocaleString()}`
      : (property.assessment?.assessed?.assdttlvalue
        ? `$${property.assessment.assessed.assdttlvalue.toLocaleString()}`
        : 'N/A');

    const popupHtml = `
      <div style="min-width:180px;">
        <strong>${address}</strong><br>
        <span style="color:#1A73E8;">Value: ${value}</span>
        <button onclick="showPropertyDetail(property)" style="display:block;">View Details</button>
      </div>
    `;

    // Create marker
    const marker = L.marker([lat, lng], { icon });
    marker.bindPopup(popupHtml);

    // Optional: On marker click, show property detail (if you want)
    marker.on('click', () => {
      showPropertyDetail(property);
    });
    
    marker.addTo(map);
    propertyMarkers.push(marker);
  });
}


// Add close function
const closeMobileDetail = () => {
  showMobileDetail.value = false
  if (window.lastResponse) {
    displayPropertyList(window.lastResponse)
  }
}
// Helper function to create property list content
const createPropertyListContent = (response) => {
  if (!response.property || response.property.length === 0) {
    return `
      <div class="no-results">
        <p>No property data available for this location.</p>
        <p>Try selecting a different location on the map.</p>
      </div>
    `;
  }
  
  let html = '';
  
  response.property.forEach(property => {
    html += `
      <div class="property-card" data-id="${property.identifier.attomId}">
        <h3>${property.address?.line1 || 'N/A'}</h3>
        <p>${property.address?.locality || ''}, ${property.address?.countrySubd || ''}</p>
        <div class="property-tag">${property.summary?.propclass || 'N/A'}</div>
        <div class="property-details">
          <div>
            <span class="label">Type:</span>
            <span>${property.summary?.propertyType || 'N/A'}</span>
          </div>
          <div>
            <span class="label">Value:</span>
            <span>${property.assessment?.market?.mktttlvalue 
              ? `$${property.assessment.market.mktttlvalue.toLocaleString()}` 
              : 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  return html;
}
// Update your displayPropertyList function to show results in both containers
const displayPropertyList = (response) => {
  const mobileContainer = document.getElementById('searchresults');
  const desktopContainer = document.getElementById('searchresults_desktop');
  
  // Clear previous results
  mobileContainer.innerHTML = '';
  desktopContainer.innerHTML = '';
  
  // Create content
  const content = createPropertyListContent(response);
  
  // Set content to both containers
  mobileContainer.innerHTML = content;
  desktopContainer.innerHTML = content;


  // Add click events to both containers
  document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => {
      const propertyId = card.getAttribute('data-id');
      const property = response.property.find(p => p.identifier.attomId == propertyId);
      showPropertyDetail(property);
    });
  });
}
const bookmarkProperty = async (property) => {
  const bookmarkData = {
    type: 'property',
    address: property.address,
    value: property.value,
    lat: property.lat,
    lng: property.lng,
    timestamp: Date.now()
  }
  try {
    const companyRef = doc(db, "companies", companyId)
    await updateDoc(companyRef, {
      bookmarks: arrayUnion(bookmarkData)
    })
    alert("Property bookmarked!")
  } catch (e) {
    alert("Failed to bookmark property.")
  }
}
// Function to go back to property list
window.showPropertyList = () => {
  // Re-display the property list with the last response
  if (window.lastResponse) {
    displayPropertyList(window.lastResponse)
  }
}

const renderGraph = (assessedValue, marketValue) => {
  const ctx = document.getElementById('valueChart').getContext('2d')

  // Destroy existing chart instance if it exists
  if (window.valueChartInstance) {
    window.valueChartInstance.destroy()
  }

  // Create a new chart instance
  window.valueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Assessed Value', 'Market Value'], // Labels for the bars
      datasets: [
        {
          label: 'Property Values',
          data: [assessedValue, marketValue], // Data for the bars
          backgroundColor: ['#4CAF50', '#2196F3'], // Colors for the bars
          borderColor: ['#388E3C', '#1976D2'], // Border colors
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false // Hide the legend
        }
      },
      scales: {
        y: {
          beginAtZero: true // Start the y-axis at 0
        }
      }
    }
  })
}
function disablesearch(){
  document.getElementById("searchresults").textContent=""
  document.getElementById("search_address").value=""
}

// Function to display results in the DOM


// Setup input focus event to show address card
const setupInputEvents = () => {
  document.getElementById('search_address').addEventListener('focus', function () {
    // Show the adresscard1 container when the search input is focused
    
  })
}

// Main initialization
onMounted(() => {
  nextTick(() => {
    // Check if Google Maps API is loaded

    if (route.query.lat && route.query.lng) {
    const lat = parseFloat(route.query.lat)
    const lng = parseFloat(route.query.lng)
    // Wait for map to be initialized
    setTimeout(() => {
      if (map) {
        map.setView([lat, lng], 17, { animate: true })
        fetchPropertyData(lat,lng)
        // Remove previous marker if needed
        if (marker) map.removeLayer(marker)
        marker = L.marker([lat, lng]).addTo(map)
        marker.bindPopup(`
          <strong>${route.query.address || ''}</strong><br>
          ${route.query.type || ''} - ${route.query.value || ''}<br>
          ${route.query.description || ''}
        `).openPopup()
      }
    }, 500)
  }
    
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      // If not loaded, load it dynamically
      const script = document.createElement('script')
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY&libraries=places'
      script.async = true
      script.defer = true
      script.onload = () => {
        initMap()
        setupInputEvents()
        
      }
      document.head.appendChild(script)
    } else {
      // If already loaded, initialize map directly
      initMap()
      setupInputEvents()
      
    }
    
  })
})

</script>

<template>
  <sidebar/>
  <div class="map-container">
    <div id="map"></div>
  </div>
  
  <div v-if="showMobileDetail" class="mobile-detail-view">
    <div class="mobile-detail-header">
      <button class="back-button_1" @click="closeMobileDetail">
        <i class="pi pi-arrow-left"></i>
      </button>
      
    </div>
    <div id="mobile-detail-content"></div>
  </div>
  
  <!-- Separate search filter row for mobile -->
  <div class="search_filter_row mobile-search">
    <input type="text" v-model="name" id="search_address" class="search_address" 
           placeholder="Address,city,county,state,zip code" @keyup.enter="geocodeAddress"/>
    
    <select class="filter_select">
      <option value="">Property Type</option>
      <option value="Residential">Residential</option>
      <option value="Commercial">Commercial</option>
      <option value="Mixed Use">Mixed Use</option>
    </select>
    <select class="filter_select">
        <option value="">Price Range</option>
        <option value="0-250000">$0 - $250k</option>
        <option value="250000-500000">$250k - $500k</option>
        <option value="500000+">$500k+</option>
      </select>
    
    
  </div>
  
  <!-- Separate results panel for mobile -->
  <!-- Replace the drag handle with arrow buttons -->
<div class="results-panel mobile-results" :class="{ 'expanded': isExpanded }">
  <div class="panel-controls">
    <button v-if="!isExpanded" class="arrow-button up-arrow" @click="expandPanel">
      <i class="pi pi-chevron-up"></i>
    </button>
    <button v-else class="arrow-button down-arrow" @click="collapsePanel">
      <i class="pi pi-chevron-down"></i>
    </button>
  </div>
  <div id="loadingelemnet" style="display:none; color: black;">
    <p>Loading.....</p>
  </div>
  <div id="searchresults"></div>
</div>

  
  <!-- Desktop left panel (hidden on mobile) -->
  <div class="left-panel desktop-only">
    <div class="search_filter_row">
      <input type="text" v-model="name" id="search_address_desktop" class="search_address" 
             placeholder="Address,city,county,state,zip code" @keyup.enter="geocodeAddress"/>
      
      <select class="filter_select">
        <option value="">Property Type</option>
        <option value="Residential">Residential</option>
        <option value="Commercial">Commercial</option>
        <option value="Mixed Use">Mixed Use</option>
      </select>
      
      <select class="filter_select">
        <option value="">Price Range</option>
        <option value="0-250000">$0 - $250k</option>
        <option value="250000-500000">$250k - $500k</option>
        <option value="500000+">$500k+</option>
      </select>
      
    </div>
    
    <div class="results-panel">
      
      <div id="searchresults_desktop"></div>
    </div>
  </div>
</template>




<style scoped>
.address_search_icon{
  position: absolute;
  top: 26px;
  left: 336px;
  z-index: 1;
  
}
.example_box_1{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  margin-right:46px;
}
i{
  color: black;

}
.adress_examples{
  display:flex;
  flex-direction:row;
  justify-content: space-around;
  align-items: center;
  margin-top:16px;
cursor: pointer;

}
.adress_examples:hover{
  background-color: #f0f0f0;
  border-radius: 4px;
}
.search_address{
  width:30%;
  padding: 10px;                                      
  border-radius:8px;
  border:0.8px solid rgb(229, 231, 235);
  flex-grow: 1;
  background-color:rgb(249, 250, 251);
  color:black;
  margin:5px 20px 16px 0px;
  padding:8px ;
}
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  display: flex; /* Use flexbox to align the results container and map side by side */
  padding-top:70px;
}

.results-container {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-top: 30px;
  font-size: 14px;
  color: #333;
  
}

.results-container h3 {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #2196F3;
}

.results-container p {
  margin: 4px 0;
  line-height: 1.5;
  color: #666;
}

.results-container img {
  border-radius: 8px;
  object-fit: cover;
}

#map {
  flex: 1; /* Take up the remaining space */
  height: 100%;
}
.searchup_container {
  width: 100vw; /* Adjust width as needed */
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 16px;
  overflow-y: auto; /* Enable vertical scrolling */
  border-radius: 14px;
  height: 100%; /* Set a fixed height or use a percentage */
  max-height: 90vh; /* Optional: Limit the height to 80% of the viewport */
  overflow-x: hidden;
}

/* Hide scrollbar for WebKit-based browsers */
.searchup_container::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for other browsers */
.searchup_container {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.combined_container {
  z-index: 1;
  width: 100vw;
  left: 0;
  top: 0;
  margin: 0px 0px 0px 120px;
  position: absolute;
  height: auto; /* Let the height adjust dynamically */
  overflow: hidden; /* Enable scrolling for the entire container */

}
.combined_container_1 {
  z-index: 1;
  width: auto;
  left: 0;
  top: 0;
  margin: 60px 0px 0px 100px;
  position: absolute;
  height:auto; /* Let the height adjust dynamically */
  overflow: hidden; /* Enable scrolling for the entire container */
  padding: 24px;
  border-radius: 20px;
}
.history_address p{
  text-align: left;
  color:black;
  font-size:0.9;
  margin:0;
}
@media (max-width: 768px) {
  

  .results-container {
    width: 100%; /* Full width on small screens */
    border-right: none; /* Remove right border */
    border-bottom: 1px solid #ddd; /* Add bottom border */
  }

  #map {
    height: 100%; /* Adjust map height for smaller screens */
  }
}
#searchresults {
  overflow-y: auto;
  max-height: calc(100vh - 120px); /* Adjust height based on your needs */
  padding-right: 4px; /* Add some padding to prevent content from touching the right edge */
  background-color: white;
  /* Hide scrollbar for WebKit browsers (Chrome, Safari, newer Edge) */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  
  /* Hide scrollbar for IE and Edge */
  -ms-overflow-style: none;
}
.search_filter_row {
  display: flex;
  align-items: center;
  gap: 3rem;
  width: 1390px;
  background-color: white;
  height: auto;
  padding: 16px;
}

.search_address {
  
  width: 20%;
  margin: 0;
}

.filter_select {
  padding: 10px;
  border-radius: 16px;
  border: none;
  background-color: rgb(249, 250, 251);
  color: rgb(107, 114, 128);
  min-width: 120px;
  border-radius: 8px;
  border:0.8px solid rgb(229, 231, 235);

}
option{
  font-size: 14px;
  color: rgb(107, 114, 128);
}
.save_search_btn {
  padding: 10px 16px;
  border-radius: 16px;
  border: none;
  background-color: #1A73E8;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.save_search_btn i {
  color: white;
}
/* Custom styles */
.left-panel {
  position: absolute;
  top: 0;
  left: 110px;
  width: 400px;
  height: 100vh;
  z-index: 1;
  background-color: #f8f9fa;

  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.save_search_btn {
  padding: 10px 16px;
  border-radius: 16px;
  border: none;
  background-color: #1A73E8;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.save_search_btn i {
  color: white;
}



#searchresults {
  overflow-y: auto;
  max-height: 100%;
  padding-right: 4px;
  color:black;
  /* Hide scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  
  /* Hide scrollbar for IE and Edge */
  -ms-overflow-style: none;
}



.left-panel {
  position: absolute;
  top: 0;
  left: 110px;
  width: 400px;
  height: 100vh;
  z-index: 1;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search_filter_row {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: white;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.results-panel {
   flex: 1;
  overflow-y: auto; /* This is already here but needs to be enforced */
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  position: relative;
  
  max-height: calc(100vh - 120px); /* Set a max height */

  /* Hide scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  
  /* Hide scrollbar for IE and Edge */
  -ms-overflow-style: none;
}

/* Mobile styles */
@media (max-width: 768px) {
  .left-panel {
    width: 100%;
    left: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    
  }
  
  .search_filter_row {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding: 10px;
  }
  
  .filter_select, .search_address {
    min-width: 120px;
    margin-right: 1rem;
  }
  
  .results-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10vh;
    z-index: 3;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    transition: transform 0.3s ease;
    
  }
  
  .results-panel::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 5px;
    background-color: #ccc;
    border-radius: 10px;
    cursor: grab;
   
  }
}
/* Property card styles */
.property-card {
  background-color:rgb(107, 114, 128);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.property-card h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #202124;
}

.property-card p {
  margin: 0 0 8px 0;
  color: #5f6368;
  font-size: 14px;
}

.property-tag {
  background-color: #E8F0FE;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #1A73E8;
  font-size: 12px;
}

.property-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.label {
  color: #5f6368;
  margin-right: 4px;
}

/* Property detail view */
.property-detail {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #DADCE0;
}

.back-button {
  background: none;
  border: none;
  color: #1A73E8;
  cursor: pointer;
  margin-right: 12px;
  padding: 8px;
  border-radius: 50%;
}

.back-button:hover {
  background-color: #f1f3f4;
}

.detail-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.detail-content {
  padding: 16px;
}

.detail-section {
  margin: 16px 0;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: flex-start;
}

.detail-item i {
  margin-right: 8px;
  color: #5f6368;
  margin-top: 2px;
}

.detail-item .label {
  display: block;
  font-size: 12px;
}

.detail-item .value {
  display: block;
  font-weight: bold;
  font-size: 14px;
}

.detail-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #DADCE0;
}

.action-button {
  background: none;
  border: none;
  color: #1A73E8;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
}

.action-button i {
  font-size: 20px;
  margin-bottom: 4px;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #5f6368;
}
.search_filter_container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Add these styles */
.mobile-search {
  display: none;
}

.mobile-results {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .mobile-search {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.95);
   
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    flex-wrap: wrap;
  }
  
  .mobile-results {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 94%;
    height: 30vh;
    background-color: white;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    z-index: 10;
    transition: height 0.3s ease;
    overflow: hidden;
  }
  
  .desktop-only {
    display: none;
  }
  
  .drag-handle {
    width: 50px;
    height: 5px;
    background-color: #ccc;
    border-radius: 10px;
    margin: 10px auto;
    cursor: grab;
  }
  
  /* Make map visible between search and results */
  .map-container {
    z-index: 1;
    padding-top: 116px;
    position:fixed;
    
  }
}
/* Add these styles */
.panel-controls {
  display: flex;
  justify-content: center;
  padding: 5px 0;
}

.arrow-button {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1A73E8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
}

.arrow-button i {
  color: white;
  font-size: 18px;
}

.mobile-results {
  transition: height 0.3s ease;
}

.mobile-results.expanded {
  height: 70vh !important;
}

/* Add these styles */
.mobile-detail-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: white;
  z-index: 1000;
  overflow-y: auto;
}

.mobile-detail-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1;
}

.mobile-detail-header .back-button_1 {
  background: none;
  border: none;
  padding: 8px;
  margin-right: 16px;
  cursor: pointer;
}

.mobile-detail-header h2 {
  margin: 0;
  font-size: 18px;
}

#mobile-detail-content {
  padding: 16px;
}

/* Hide scrollbar */
.mobile-detail-view {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile-detail-view::-webkit-scrollbar {
  display: none;
}
</style>
