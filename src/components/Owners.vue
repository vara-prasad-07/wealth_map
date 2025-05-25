<script setup>
import sidebar from '../layout/sidebar.vue'
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase' // <-- import your Firestore instance
import { doc, updateDoc, arrayUnion } from "firebase/firestore"

const searchTerm = ref('')
const showModal = ref(false)
const selectedOwner = ref(null)
const companyId = "9mtW21795c48r09s6nN9"; // TODO: set this dynamically as needed

const owners = ref([
  {
    id: 1,
    rank: 1,
    name: 'Elon Musk',
    netWorth: '406.9B',
    age: 53,
    country: 'United States',
    city: 'Austin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    company: 'Tesla, SpaceX',
    industry: 'Technology, Automotive',
    netWorthHistory: [380, 390, 400, 406.9, 410],
    properties: [
      {
        address: '1234 Tech Boulevard, Austin, TX 78701, USA',
        type: 'Mansion',
        value: '$50M',
        description: 'Luxury mansion with smart home technology',
        lat: 30.2672,
        lng: -97.7431
      },
      {
        address: '5678 Innovation Drive, Palo Alto, CA 94301, USA',
        type: 'Office Complex',
        value: '$200M',
        description: 'Tesla headquarters and manufacturing facility',
        lat: 37.4419,
        lng: -122.1430
      },
      {
        address: '9101 Space Center, Hawthorne, CA 90250, USA',
        type: 'Industrial',
        value: '$150M',
        description: 'SpaceX rocket manufacturing facility',
        lat: 33.9206,
        lng: -118.3528
      }
    ]
  },
  {
    id: 2,
    rank: 2,
    name: 'Jeff Bezos',
    netWorth: '195.4B',
    age: 60,
    country: 'United States',
    city: 'Seattle',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    company: 'Amazon, Blue Origin',
    industry: 'E-commerce, Space',
    netWorthHistory: [180, 185, 190, 195.4, 198],
    properties: [
      {
        address: '2468 Commerce Street, Seattle, WA 98101, USA',
        type: 'Penthouse',
        value: '$80M',
        description: 'Luxury penthouse overlooking the city',
        lat: 47.6062,
        lng: -122.3321
      },
      {
        address: '1357 Warehouse District, Kent, WA 98032, USA',
        type: 'Warehouse',
        value: '$300M',
        description: 'Amazon fulfillment center',
        lat: 47.3809,
        lng: -122.2348
      },
      {
        address: '28100 Old Black Canyon Hwy, Van Horn, TX 79855, USA',
        type: 'Ranch',
        value: '$165M',
        description: 'Blue Origin launch facility and ranch',
        lat: 31.0386,
        lng: -104.8314
      }
    ]
  },
  {
    id: 3,
    rank: 3,
    name: 'Bill Gates',
    netWorth: '134.2B',
    age: 69,
    country: 'United States',
    city: 'Seattle',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face',
    company: 'Microsoft (Former)',
    industry: 'Technology, Philanthropy',
    netWorthHistory: [120, 125, 130, 134.2, 136],
    properties: [
      {
        address: '1835 73rd Ave NE, Medina, WA 98039, USA',
        type: 'Estate',
        value: '$130M',
        description: 'Xanadu 2.0 - High-tech mansion with underground garage',
        lat: 47.6298,
        lng: -122.2429
      },
      {
        address: '13690 Rancho Santa Fe Farms Rd, Rancho Santa Fe, CA 92067, USA',
        type: 'Estate',
        value: '$43M',
        description: 'Del Mar equestrian estate',
        lat: 33.0175,
        lng: -117.2072
      },
      {
        address: '4005 Bellevue Way NE, Bellevue, WA 98004, USA',
        type: 'Commercial',
        value: '$85M',
        description: 'Gates Foundation headquarters',
        lat: 47.6188,
        lng: -122.2015
      }
    ]
  },
  {
    id: 4,
    rank: 4,
    name: 'Warren Buffett',
    netWorth: '133.1B',
    age: 94,
    country: 'United States',
    city: 'Omaha',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face',
    company: 'Berkshire Hathaway',
    industry: 'Investment',
    netWorthHistory: [125, 128, 131, 133.1, 135],
    properties: [
      {
        address: '5505 Farnam Street, Omaha, NE 68132, USA',
        type: 'House',
        value: '$652K',
        description: 'Modest family home purchased in 1958',
        lat: 41.2524,
        lng: -95.9980
      },
      {
        address: '3555 Farnam Street, Omaha, NE 68131, USA',
        type: 'Office',
        value: '$25M',
        description: 'Berkshire Hathaway headquarters',
        lat: 41.2586,
        lng: -95.9378
      },
      {
        address: '1420 Kiewit Plaza, Omaha, NE 68131, USA',
        type: 'Commercial',
        value: '$15M',
        description: 'Investment office building',
        lat: 41.2619,
        lng: -95.9358
      }
    ]
  },
  {
    id: 5,
    rank: 5,
    name: 'Larry Page',
    netWorth: '129.5B',
    age: 51,
    country: 'United States',
    city: 'Palo Alto',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    company: 'Alphabet/Google',
    industry: 'Technology',
    netWorthHistory: [120, 125, 127, 129.5, 132],
    properties: [
      {
        address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
        type: 'Office Complex',
        value: '$1.2B',
        description: 'Google headquarters (Googleplex)',
        lat: 37.4220,
        lng: -122.0841
      },
      {
        address: '430 Bryant Street, Palo Alto, CA 94301, USA',
        type: 'Mansion',
        value: '$72M',
        description: 'Eco-friendly mansion with solar panels',
        lat: 37.4419,
        lng: -122.1430
      },
      {
        address: 'Private Island, Mosquito Island, British Virgin Islands',
        type: 'Island',
        value: '$45M',
        description: 'Private Caribbean island retreat',
        lat: 18.5034,
        lng: -64.3685
      }
    ]
  },
  {
    id: 6,
    rank: 6,
    name: 'Sergey Brin',
    netWorth: '124.3B',
    age: 51,
    country: 'United States',
    city: 'Los Altos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    company: 'Alphabet/Google',
    industry: 'Technology',
    netWorthHistory: [115, 119, 122, 124.3, 127],
    properties: [
      {
        address: '1288 Los Altos Ave, Los Altos, CA 94022, USA',
        type: 'Mansion',
        value: '$65M',
        description: 'Modern mansion with tech integration',
        lat: 37.3688,
        lng: -122.1180
      },
      {
        address: '450 Serra Mall, Stanford, CA 94305, USA',
        type: 'Research Facility',
        value: '$200M',
        description: 'AI research laboratory',
        lat: 37.4275,
        lng: -122.1697
      },
      {
        address: 'Moffett Airfield Hangar, Mountain View, CA 94035, USA',
        type: 'Hangar',
        value: '$82M',
        description: 'Private jet hangar and aviation facility',
        lat: 37.4161,
        lng: -122.0475
      }
    ]
  },
  {
    id: 7,
    rank: 7,
    name: 'Larry Ellison',
    netWorth: '122.7B',
    age: 80,
    country: 'United States',
    city: 'Lanai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
    company: 'Oracle',
    industry: 'Technology',
    netWorthHistory: [112, 117, 120, 122.7, 125],
    properties: [
      {
        address: 'Lanai Island, Hawaii 96763, USA',
        type: 'Island',
        value: '$300M',
        description: 'Owns 98% of Hawaiian island of Lanai',
        lat: 20.8297,
        lng: -156.9317
      },
      {
        address: '1 Hacker Way, Redwood City, CA 94065, USA',
        type: 'Office Complex',
        value: '$500M',
        description: 'Oracle Corporation headquarters',
        lat: 37.5331,
        lng: -122.2613
      },
      {
        address: '1 Woodside Rd, Woodside, CA 94062, USA',
        type: 'Estate',
        value: '$200M',
        description: 'Japanese-style estate with multiple buildings',
        lat: 37.4302,
        lng: -122.2534
      }
    ]
  },
  {
    id: 8,
    rank: 8,
    name: 'Steve Ballmer',
    netWorth: '117.8B',
    age: 68,
    country: 'United States',
    city: 'Hunts Point',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face',
    company: 'Microsoft (Former)',
    industry: 'Technology',
    netWorthHistory: [108, 112, 115, 117.8, 120],
    properties: [
      {
        address: '2200 Hunts Point Circle, Hunts Point, WA 98004, USA',
        type: 'Estate',
        value: '$125M',
        description: 'Waterfront estate on Lake Washington',
        lat: 47.6415,
        lng: -122.2284
      },
      {
        address: '1111 3rd Avenue, Seattle, WA 98101, USA',
        type: 'Sports Arena',
        value: '$2B',
        description: 'Climate Pledge Arena (Seattle Kraken ownership)',
        lat: 47.6220,
        lng: -122.3540
      },
      {
        address: '1000 Elysian Park Ave, Los Angeles, CA 90012, USA',
        type: 'Sports Complex',
        value: '$2.2B',
        description: 'LA Clippers team facilities',
        lat: 34.0739,
        lng: -118.2400
      }
    ]
  },
  {
    id: 9,
    rank: 9,
    name: 'Michael Dell',
    netWorth: '89.1B',
    age: 59,
    country: 'United States',
    city: 'Austin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
    company: 'Dell Technologies',
    industry: 'Technology',
    netWorthHistory: [82, 85, 87, 89.1, 92],
    properties: [
      {
        address: '1 Dell Way, Round Rock, TX 78682, USA',
        type: 'Office Complex',
        value: '$150M',
        description: 'Dell Technologies headquarters',
        lat: 30.5081,
        lng: -97.6720
      },
      {
        address: '4000 Four Points Dr, Austin, TX 78732, USA',
        type: 'Estate',
        value: '$60M',
        description: 'Lakefront estate on Lake Austin',
        lat: 30.3909,
        lng: -97.8701
      },
      {
        address: 'Silver Lake Lodge, Deer Valley, UT 84060, USA',
        type: 'Resort',
        value: '$75M',
        description: 'Luxury ski resort property',
        lat: 40.6369,
        lng: -111.4783
      }
    ]
  },
  {
    id: 10,
    rank: 10,
    name: 'Mark Zuckerberg',
    netWorth: '86.3B',
    age: 40,
    country: 'United States',
    city: 'Palo Alto',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face',
    company: 'Meta (Facebook)',
    industry: 'Technology',
    netWorthHistory: [78, 81, 84, 86.3, 89],
    properties: [
      {
        address: '1 Hacker Way, Menlo Park, CA 94025, USA',
        type: 'Office Complex',
        value: '$1B',
        description: 'Meta headquarters campus',
        lat: 37.4843,
        lng: -122.1483
      },
      {
        address: '1456 Edgewood Dr, Palo Alto, CA 94301, USA',
        type: 'Mansion',
        value: '$100M',
        description: 'Compound with multiple houses',
        lat: 37.4419,
        lng: -122.1430
      },
      {
        address: 'Ko Olina Beach, Oahu, HI 96707, USA',
        type: 'Estate',
        value: '$270M',
        description: '1,400-acre Hawaiian estate',
        lat: 21.3099,
        lng: -158.1425
      }
    ]
  },
  {
    id: 11,
    rank: 11,
    name: 'Rob Walton',
    netWorth: '82.9B',
    age: 80,
    country: 'United States',
    city: 'Bentonville',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    company: 'Walmart',
    industry: 'Retail',
    netWorthHistory: [76, 79, 81, 82.9, 85],
    properties: [
      {
        address: '702 SW 8th St, Bentonville, AR 72712, USA',
        type: 'Office Complex',
        value: '$500M',
        description: 'Walmart headquarters',
        lat: 36.3729,
        lng: -94.2088
      },
      {
        address: '1200 Museum Way, Bentonville, AR 72712, USA',
        type: 'Cultural',
        value: '$120M',
        description: 'Crystal Bridges Museum of American Art',
        lat: 36.3816,
        lng: -94.2067
      },
      {
        address: '5800 Ranch Rd, Paradise Valley, AZ 85253, USA',
        type: 'Ranch',
        value: '$45M',
        description: 'Desert ranch estate',
        lat: 33.5722,
        lng: -111.9581
      }
    ]
  },
  {
    id: 12,
    rank: 12,
    name: 'Jim Walton',
    netWorth: '81.4B',
    age: 76,
    country: 'United States',
    city: 'Bentonville',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
    company: 'Walmart',
    industry: 'Retail',
    netWorthHistory: [74, 77, 79, 81.4, 84],
    properties: [
      {
        address: '1945 N Walton Blvd, Bentonville, AR 72712, USA',
        type: 'Bank Building',
        value: '$75M',
        description: 'Arvest Bank headquarters',
        lat: 36.3947,
        lng: -94.2085
      },
      {
        address: '3500 Central Ave, Bentonville, AR 72712, USA',
        type: 'Estate',
        value: '$35M',
        description: 'Family estate compound',
        lat: 36.3947,
        lng: -94.2085
      },
      {
        address: '100 N Stadium Dr, Fayetteville, AR 72701, USA',
        type: 'Sports Complex',
        value: '$200M',
        description: 'University of Arkansas athletics facilities',
        lat: 36.0697,
        lng: -94.1755
      }
    ]
  },
  {
    id: 13,
    rank: 13,
    name: 'Alice Walton',
    netWorth: '80.2B',
    age: 75,
    country: 'United States',
    city: 'Fort Worth',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face',
    company: 'Walmart',
    industry: 'Retail',
    netWorthHistory: [73, 76, 78, 80.2, 83],
    properties: [
      {
        address: '3200 Camp Bowie Blvd, Fort Worth, TX 76107, USA',
        type: 'Museum',
        value: '$200M',
        description: 'Modern Art Museum of Fort Worth',
        lat: 32.7357,
        lng: -97.3747
      },
      {
        address: '4400 Boat Club Rd, Fort Worth, TX 76107, USA',
        type: 'Estate',
        value: '$55M',
        description: 'Luxury lakefront estate',
        lat: 32.7555,
        lng: -97.4103
      },
      {
        address: '300 Museum Way, Bentonville, AR 72712, USA',
        type: 'Ranch',
        value: '$85M',
        description: 'Working horse ranch and training facility',
        lat: 36.3816,
        lng: -94.2067
      }
    ]
  },
  {
    id: 14,
    rank: 14,
    name: 'Julia Koch',
    netWorth: '75.8B',
    age: 62,
    country: 'United States',
    city: 'New York',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face',
    company: 'Koch Industries',
    industry: 'Conglomerate',
    netWorthHistory: [68, 71, 74, 75.8, 78],
    properties: [
      {
        address: '4 East 66th Street, New York, NY 10065, USA',
        type: 'Townhouse',
        value: '$65M',
        description: 'Upper East Side mansion',
        lat: 40.7691,
        lng: -73.9654
      },
      {
        address: '1320 N Courthouse Rd, Arlington, VA 22201, USA',
        type: 'Office Complex',
        value: '$150M',
        description: 'Koch Industries regional headquarters',
        lat: 38.8848,
        lng: -77.0908
      },
      {
        address: '1000 Ocean Blvd, Palm Beach, FL 33480, USA',
        type: 'Estate',
        value: '$95M',
        description: 'Oceanfront estate compound',
        lat: 26.7153,
        lng: -80.0364
      }
    ]
  },
  {
    id: 15,
    rank: 15,
    name: 'Charles Koch',
    netWorth: '74.2B',
    age: 89,
    country: 'United States',
    city: 'Wichita',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    company: 'Koch Industries',
    industry: 'Conglomerate',
    netWorthHistory: [67, 70, 72, 74.2, 77],
    properties: [
      {
        address: '4111 E 37th St N, Wichita, KS 67220, USA',
        type: 'Office Complex',
        value: '$200M',
        description: 'Koch Industries headquarters',
        lat: 37.7306,
        lng: -97.2614
      },
      {
        address: '2500 N Greenwich Rd, Wichita, KS 67226, USA',
        type: 'Estate',
        value: '$45M',
        description: 'Private family compound',
        lat: 37.7231,
        lng: -97.2370
      },
      {
        address: '1845 Fairmount St, Wichita, KS 67260, USA',
        type: 'Educational',
        value: '$85M',
        description: 'Wichita State University facilities',
        lat: 37.7181,
        lng: -97.2975
      }
    ]
  },
  {
    id: 16,
    rank: 16,
    name: 'Michael Bloomberg',
    netWorth: '70.9B',
    age: 82,
    country: 'United States',
    city: 'New York',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    company: 'Bloomberg LP',
    industry: 'Media, Finance',
    netWorthHistory: [64, 67, 69, 70.9, 73],
    properties: [
      {
        address: '731 Lexington Avenue, New York, NY 10022, USA',
        type: 'Office Complex',
        value: '$3B',
        description: 'Bloomberg Terminal headquarters',
        lat: 40.7589,
        lng: -73.9658
      },
      {
        address: '17 E 79th St, New York, NY 10075, USA',
        type: 'Townhouse',
        value: '$45M',
        description: 'Upper East Side historic townhouse',
        lat: 40.7766,
        lng: -73.9691
      },
      {
        address: '33 Chilmark Rd, Martha\'s Vineyard, MA 02535, USA',
        type: 'Estate',
        value: '$30M',
        description: 'Martha\'s Vineyard summer compound',
        lat: 41.3493,
        lng: -70.7340
      }
    ]
  },
  {
    id: 17,
    rank: 17,
    name: 'Phil Knight',
    netWorth: '68.5B',
    age: 86,
    country: 'United States',
    city: 'Beaverton',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
    company: 'Nike',
    industry: 'Apparel',
    netWorthHistory: [62, 64, 66, 68.5, 71],
    properties: [
      {
        address: '1 Bowerman Dr, Beaverton, OR 97005, USA',
        type: 'Office Complex',
        value: '$500M',
        description: 'Nike World Headquarters',
        lat: 45.5088,
        lng: -122.8352
      },
      {
        address: '6000 SW Hills Rd, Lake Oswego, OR 97035, USA',
        type: 'Estate',
        value: '$25M',
        description: 'Private estate overlooking Portland',
        lat: 45.3673,
        lng: -122.7615
      },
      {
        address: '15800 NW West Union Rd, Portland, OR 97229, USA',
        type: 'Golf Course',
        value: '$45M',
        description: 'Private golf course and club',
        lat: 45.5915,
        lng: -122.8226
      }
    ]
  },
  {
    id: 18,
    rank: 18,
    name: 'Mackenzie Scott',
    netWorth: '64.3B',
    age: 54,
    country: 'United States',
    city: 'Seattle',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face',
    company: 'Amazon (Divorced)',
    industry: 'Philanthropy',
    netWorthHistory: [58, 60, 62, 64.3, 66],
    properties: [
      {
        address: '2901 Eastlake Ave E, Seattle, WA 98102, USA',
        type: 'Mansion',
        value: '$55M',
        description: 'Waterfront mansion on Lake Union',
        lat: 47.6480,
        lng: -122.3238
      },
      {
        address: '375 Bellevue Way NE, Bellevue, WA 98004, USA',
        type: 'Office',
        value: '$35M',
        description: 'Philanthropic foundation headquarters',
        lat: 47.6188,
        lng: -122.2015
      },
      {
        address: '1500 Broadway, New York, NY 10036, USA',
        type: 'Apartment',
        value: '$40M',
        description: 'Manhattan penthouse apartment',
        lat: 40.7555,
        lng: -73.9870
      }
    ]
  },
  {
    id: 19,
    rank: 19,
    name: 'Len Blavatnik',
    netWorth: '32.6B',
    age: 67,
    country: 'United States',
    city: 'New York',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    company: 'Access Industries',
    industry: 'Diversified',
    netWorthHistory: [28, 30, 31, 32.6, 34],
    properties: [
      {
        address: '15 Central Park West, New York, NY 10023, USA',
        type: 'Penthouse',
        value: '$250M',
        description: 'Duplex penthouse overlooking Central Park',
        lat: 40.7730,
        lng: -73.9795
      },
      {
        address: '200 11th St, Miami Beach, FL 33139, USA',
        type: 'Estate',
        value: '$80M',
        description: 'Miami Beach oceanfront mansion',
        lat: 25.7907,
        lng: -80.1435
      },
      {
        address: '9 Kensington Palace Gardens, London W8 4QP, UK',
        type: 'Mansion',
        value: '$200M',
        description: 'London mansion in Billionaire\'s Row',
        lat: 51.5055,
        lng: -0.1901
      }
    ]
  }
])

const filteredOwners = computed(() => {
  if (!searchTerm.value.trim()) {
    return owners.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return owners.value.filter(owner => 
    owner.name.toLowerCase().includes(term) ||
    owner.country.toLowerCase().includes(term)
  )
})
const bookmarkAction = async () => {
  if (!selectedOwner.value) return;

  // Minimal owner details
  const bookmarkData = {
    name: selectedOwner.value.name,
    netWorth: selectedOwner.value.netWorth,
    propertiesCount: selectedOwner.value.properties.length,
    ownerId: selectedOwner.value.id
  };

  try {
    // Reference to the company document (corrected collection name)
    const companyRef = doc(db, "companies", companyId);

    // Add to bookmarks array (creates array if not present)
    await updateDoc(companyRef, {
      bookmarks: arrayUnion(bookmarkData)
    });

    // Optional: UI feedback (toggle icon, toast, etc.)
    let bkbtn = document.getElementById("bookmarkbtn");
    bkbtn.classList.toggle("pi-bookmark-fill");
    alert("Bookmarked!");
  } catch (error) {
    console.error("Error adding bookmark: ", error);
    alert("Failed to bookmark owner.");
  }
};
const clearSearch = () => {
  searchTerm.value = ''
}

const showOwnerDetails = (owner) => {
  selectedOwner.value = owner
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedOwner.value = null
}

// Generate SVG chart path for net worth history
const generateChartPath = (data) => {
  const width = 300
  const height = 100
  const padding = 20
  
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  
  const points = data.map((value, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
    const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}
</script>

<template>
  <sidebar/>
  <div class="owners-container">
    <div class="search-section">
      <div class="search-wrapper">
        <input 
          type="text" 
          placeholder="Search Owners" 
          v-model="searchTerm"
          class="search-input"
        />
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <button v-if="searchTerm" @click="clearSearch" class="clear-btn">×</button>
      </div>
    </div>

    <div class="title-section">
      <h1 class="main-title">REAL TIME RICHEST OWNERS LIST</h1>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="header-cell rank-col">Rank</div>
        <div class="header-cell name-col">Name</div>
        <div class="header-cell networth-col">Net Worth</div>
        <div class="header-cell age-col">Age</div>
        <div class="header-cell country-col">Country</div>
        <div class="header-cell actions-col"></div>
      </div>

      <div class="owners-list">
        <div 
          v-for="owner in filteredOwners" 
          :key="owner.id"
          class="owner-row"
        >
          <div class="owner-content">
            <div class="rank-cell">{{ owner.rank }}</div>
            
            <div class="profile-cell">
              <img 
                :src="owner.avatar" 
                :alt="owner.name"
                class="avatar"
              />
              <span class="name">{{ owner.name }}</span>
            </div>
            
            <div class="networth-cell">${{ owner.netWorth }}</div>
            <div class="age-cell">{{ owner.age }}</div>
            <div class="country-cell">{{ owner.country }}</div>
            
            <div class="actions-cell">
              <button @click="showOwnerDetails(owner)" class="action-btn primary">Know More</button>
              <button class="action-btn secondary">Compare With</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Owner Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          
          <button @click="closeModal" class="close-btn">×</button>
          <h2>Owner Details</h2>
          <button @click="bookmarkAction" id="bookmarkbtn"><i class="pi pi-bookmark" style="font-size: 1.4rem; color:white;"></i></button>
        </div>
        
        <div class="modal-content" v-if="selectedOwner">
          <div class="owner-info-section">
            <div class="owner-basic-info">
              <img :src="selectedOwner.avatar" :alt="selectedOwner.name" class="owner-avatar" />
              <div class="owner-details">
                <div class="detail-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedOwner.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Age:</span>
                  <span class="value">{{ selectedOwner.age }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">City:</span>
                  <span class="value">{{ selectedOwner.city }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Country:</span>
                  <span class="value">{{ selectedOwner.country }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Company:</span>
                  <span class="value">{{ selectedOwner.company }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Industry:</span>
                  <span class="value">{{ selectedOwner.industry }}</span>
                </div>
              </div>
            </div>
            
            <div class="networth-chart-section">
              <h3>Owner Net Worth</h3>
              <div class="chart-container">
                <svg width="300" height="120" class="networth-chart">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:0.8" />
                      <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path 
                    :d="generateChartPath(selectedOwner.netWorthHistory)" 
                    stroke="#4F46E5" 
                    stroke-width="3" 
                    fill="none"
                  />
                  <circle 
                    v-for="(value, index) in selectedOwner.netWorthHistory"
                    :key="index"
                    :cx="20 + (index * 260) / (selectedOwner.netWorthHistory.length - 1)"
                    :cy="100 - 20 - ((value - Math.min(...selectedOwner.netWorthHistory)) / (Math.max(...selectedOwner.netWorthHistory) - Math.min(...selectedOwner.netWorthHistory)) * 60)"
                    r="4"
                    fill="#4F46E5"
                  />
                </svg>
                <div class="chart-labels">
                  <span class="chart-label">Jan</span>
                  <span class="chart-label">Feb</span>
                  <span class="chart-label">Mar</span>
                  <span class="chart-label">Apr</span>
                  <span class="chart-label">May</span>
                </div>
              </div>
            </div>
          </div>

          <div class="properties-section">
            <h3>View Owner Properties</h3>
            <div class="properties-list">
              <div 
                v-for="(property, index) in selectedOwner.properties" 
                :key="index"
                class="property-card"
              >
                <div class="property-details">
                  <div class="property-header">
                    <h4>Property Details:</h4>
                  </div>
                  <div class="property-info">
                    <div class="property-row">
                      <svg class="property-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{{ property.address }}</span>
                    </div>
                    <div class="property-row">
                      <svg class="property-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9,22 9,12 15,12 15,22"></polyline>
                      </svg>
                      <span>Property Type: {{ property.type }}</span>
                    </div>
                    <div class="property-row">
                      <svg class="property-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="m17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span>Estimated Market Value: {{ property.value }}</span>
                    </div>
                    <div class="property-description">
                      <p>{{ property.description }}</p>
                    </div>
                  </div>
                </div>
                <div class="property-actions">
                  <button class="view-map-btn">View On Map</button>
                </div>
              </div>
            </div>
            <div class="view-more-section">
              <button class="view-more-btn">View More +</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.owners-container {
  max-width: 100%;
  margin: 0 auto;
  height:100vh; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden; /* Add this line */
  width: 100%; /* Add this line */
  
}

.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  left:100%;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.clear-btn {
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
  margin: 0;
}

.table-container {
   background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Change from auto to hidden */
  
}

.table-header {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 80px 1fr 2fr;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
  margin-left:1.6rem;
}

.header-cell {
  display: flex;
  align-items: center;
}

.owners-list {
  max-height: 600px;
  overflow-y: auto;
}

.owners-list::-webkit-scrollbar {
  display: none;
}

.owner-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.owner-row:hover {
  background-color: #f9fafb;
}

.owner-content {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 80px 1fr 2fr;
  padding: 16px 20px;
  align-items: center;
}

.rank-cell {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  font-weight: 500;
  color: #1f2937;
  font-size: 15px;
}

.networth-cell {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.age-cell,
.country-cell {
  color: #6b7280;
  font-size: 14px;
}

.actions-cell {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
}

.action-btn.primary:hover {
  background: #374151;
  border-color: #374151;
}

.action-btn.secondary {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.action-btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .actions-cell {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .search-wrapper {
    width: 76%;
    max-width: none;
    right:10%;
  }
  
  .table-container {
    border-radius: 8px;
    box-shadow: none;
    border: 1px solid #e5e7eb;
    overflow-x: hidden;
  }
  
  .table-header {
    display: none;
  }
  
  .owner-content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    position: relative;
  }
  
  .rank-cell {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #f3f4f6;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
  }
  
  .profile-cell {
    margin-bottom: 12px;
    width: 100%;
  }
  
  .networth-cell {
    margin-bottom: 8px;
    font-size: 18px;
  }
  
  .age-cell, .country-cell {
    margin-bottom: 4px;
    display: flex;
  }
  
  .age-cell::before {
    content: "Age: ";
    font-weight: 500;
    margin-right: 4px;
  }
  
  .country-cell::before {
    content: "Country: ";
    font-weight: 500;
    margin-right: 4px;
  }
  
  .actions-cell {
    margin-top: 16px;
    flex-direction: row;
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .main-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  
  
  .search-input {
    font-size: 14px;
  }
  
  .actions-cell {
    flex-direction: column;
  }
  
  .profile-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .avatar {
    width: 50px;
    height: 50px;
  }
  
  .name {
    font-size: 16px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-overlay::-webkit-scrollbar {
  display: none;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-container::-webkit-scrollbar {
  display: none;
}

.modal-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  margin:0px 30px 0px 30px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-content {
  padding: 32px;
}

.owner-info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.owner-basic-info {
  display: flex;
  gap: 24px;
}

.owner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.owner-details {
  flex: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
  margin-right: 8px;
}

.value {
  color: #6b7280;
  font-weight: 500;
}

.networth-chart-section {
  text-align: center;
}

.networth-chart-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.chart-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.networth-chart {
  width: 100%;
  height: 120px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 20px;
}

.chart-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.properties-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.property-details {
  flex: 1;
}

.property-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.property-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.property-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.property-description {
  margin-top: 12px;
}

.property-description p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

.property-actions {
  margin-left: 16px;
}

.view-map-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-map-btn:hover {
  background: #2563eb;
}

.view-more-section {
  text-align: center;
  margin-top: 24px;
}

.view-more-btn {
  background: none;
  border: 2px solid #e2e8f0;
  color: #6b7280;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-more-btn:hover {
  border-color: #4F46E5;
  color: #4F46E5;
}

@media (max-width: 768px) {
  .owner-info-section {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .owner-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .property-card {
    flex-direction: column;
    gap: 16px;
  }
  
  .property-actions {
    margin-left: 0;
    align-self: stretch;
  }
  
  .view-map-btn {
    width: 100%;
  }
  .modal-container {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
}
</style>
