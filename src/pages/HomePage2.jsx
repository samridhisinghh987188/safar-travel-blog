import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AirplaneRoute from "@/components/AirplaneRoute";
// Images in public folder can be referenced directly
const heroImage = '/homepage2.png';
const landingImage = '/landingbg.jpg';
const fallbackImage = '/placeholder.jpg';

// HomePage2: experimental homepage with 2-scroll sections
// Hero image notes:
// - If you place an image at /public/hero.jpg it will be used as the hero background.
// - Otherwise, a placeholder gradient + fallback image will show.
export default function HomePage2() {
  const location = useLocation();
  
  useEffect(() => {
    // Check if we should scroll to hero section (set by Navbar)
    const shouldScroll = sessionStorage.getItem('shouldScrollToHero');
    
    if (shouldScroll === 'true') {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        setTimeout(() => {
          heroSection.scrollIntoView({ behavior: 'smooth' });
          // Clear the flag after scrolling
          sessionStorage.removeItem('shouldScrollToHero');
        }, 100); // Small delay to ensure the page is fully loaded
      }
    }
    
    // Clean up the scroll flag when component unmounts
    return () => {
      sessionStorage.removeItem('shouldScrollToHero');
    };
  }, [location]);
  
  // Image paths
  const heroSrc = heroImage;
  const heroSrcAlt = landingImage;
  const fallbackHero = fallbackImage;

  // Toggle gallery images from public/toggle folder
  const toggleImages = [
    '/toggle/pexels-ankush-rathi-154135-925067.jpg',
    '/toggle/pexels-estudiodelarts-10841375.jpg',
    '/toggle/pexels-navnidh-5458388.jpg',
    '/toggle/pexels-pic-matti-450440252-33314882.jpg',
    '/toggle/pexels-rafaelf1-1060803.jpg',
    '/toggle/pexels-samsilitongajr-837745.jpg',
    '/toggle/pexels-simon73-1070386.jpg',
    '/toggle/pexels-tomas-malik-793526-1998439.jpg',
    '/toggle/pexels-wijs-wise-136435282-34025385.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMonumentIndex, setCurrentMonumentIndex] = useState(0);
  const [currentFact, setCurrentFact] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoadingFact, setIsLoadingFact] = useState(false);

  // Famous monuments and landmarks with images and facts
  const monuments = [
    {
      name: 'Taj Mahal',
      location: 'Agra, India',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'The Taj Mahal was built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
        'It took 22 years (1632-1654) and 20,000 artisans to complete this masterpiece.',
        'The central dome is 115 feet high and is surrounded by four smaller domes.',
        'The building appears to change color depending on the time of day and lighting conditions.'
      ]
    },
    {
      name: 'Great Pyramid of Giza',
      location: 'Giza, Egypt',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'The Great Pyramid was the tallest man-made structure for over 3,800 years.',
        'It was built around 2580-2560 BC and originally stood 146.5 meters tall.',
        'The pyramid contains approximately 2.3 million stone blocks, each weighing 2.5 to 15 tons.',
        'It is the only surviving wonder of the ancient Seven Wonders of the World.'
      ]
    },
    {
      name: 'Machu Picchu',
      location: 'Cusco, Peru',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'Machu Picchu was built around 1450 AD by the Inca emperor Pachacuti.',
        'The site sits at 2,430 meters above sea level in the Andes Mountains.',
        'It was abandoned around 1572 during the Spanish conquest and remained hidden for centuries.',
        'The structures were built without mortar, using a technique called ashlar masonry.'
      ]
    },
    {
      name: 'Colosseum',
      location: 'Rome, Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'The Colosseum could hold between 50,000 and 80,000 spectators.',
        'Construction began under Emperor Vespasian in 72 AD and was completed in 80 AD.',
        'It had a complex system of elevators and pulleys to lift animals and gladiators.',
        'The arena floor was covered with sand to absorb blood during gladiatorial contests.'
      ]
    },
    {
      name: 'Great Wall of China',
      location: 'China',
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'The Great Wall stretches over 13,000 miles across northern China.',
        'Construction began in the 7th century BC and continued for over 2,000 years.',
        'Contrary to popular belief, it is not visible from space with the naked eye.',
        'Over 1 million people died during its construction over the centuries.'
      ]
    },
    {
      name: 'Petra',
      location: 'Jordan',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1600&auto=format&fit=crop',
      facts: [
        'Petra was carved directly into rose-red sandstone cliffs by the Nabataeans.',
        'The city was established around the 4th century BC and flourished as a trading hub.',
        'The Treasury (Al-Khazneh) is 40 meters high and intricately carved from a single rock face.',
        'Petra was lost to the Western world for over 1,000 years until rediscovered in 1812.'
      ]
    }
  ];

  // Get current monument and random fact
  const getCurrentMonument = () => monuments[currentMonumentIndex];
  const getCurrentFact = () => {
    const monument = getCurrentMonument();
    return monument.facts[Math.floor(Math.random() * monument.facts.length)];
  };

  // Update fact when monument changes
  const updateMonumentAndFact = () => {
    setCurrentFact(getCurrentFact());
  };

  // Toggle gallery effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % toggleImages.length);
    }, 1500); // Change image every 1.5 seconds (faster)
    return () => clearInterval(interval);
  }, [toggleImages.length]);

  // Auto-rotating monuments with facts
  useEffect(() => {
    if (isAutoRotating) {
      const interval = setInterval(() => {
        setCurrentMonumentIndex((prev) => (prev + 1) % monuments.length);
        updateMonumentAndFact();
      }, 8000); // Change every 8 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoRotating, monuments.length]);

  // Initial fact load and when monument changes
  useEffect(() => {
    setCurrentFact(getCurrentFact());
  }, [currentMonumentIndex]);

  // Load initial fact on component mount
  useEffect(() => {
    setCurrentFact(getCurrentFact());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SECTION 1: Fullscreen hero */}
      <section
        className="relative h-[100svh] w-full overflow-hidden"
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-black" aria-hidden />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroSrc}), url(${heroSrcAlt}), url(${fallbackHero})`,
          }}
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow">
            Discover Your Next Journey
          </h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Curated guides, inspiring stories, and tools to plan unforgettable trips.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/trip-planning">
              <Button size="lg" className="shadow">
                Start Planning
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="lg" variant="secondary">
                Read Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TOGGLE GALLERY - Between both sections */}
      <section className="relative -mt-48 mb-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-2 bg-black">
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                    style={{
                      backgroundImage: `url(${toggleImages[currentImageIndex]})`,
                    }}
                  />
                  {/* Navigation dots */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {toggleImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-white scale-110'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 2: Iceland-style Travel Journal Layout */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10">
            <AirplaneRoute size={120} />
          </div>
          <div className="absolute bottom-20 right-10">
            <AirplaneRoute size={96} />
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">Featured Journey</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              World Monuments
            </h2>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Global Heritage
              </span>
              <span>—</span>
              <span>Ancient</span>
              <span>—</span>
              <span>Wonders</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Sidebar - Monument Facts */}
            <div className="lg:col-span-3 space-y-6 animate-slide-in-left">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">About {getCurrentMonument().name}</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Discover fascinating historical facts about this magnificent monument and its incredible construction.
                </p>
                
                {/* Monument Fact Display - No Box */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-2">Historical Fact</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {currentFact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Monument Stats - No Boxes */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Monument Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Location</span>
                      <span className="text-white text-xs font-medium">{getCurrentMonument().location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Monument</span>
                      <span className="text-white text-xs font-medium">{currentMonumentIndex + 1} of {monuments.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Status</span>
                      <span className="text-green-400 text-xs font-medium">UNESCO World Heritage</span>
                    </div>
                  </div>
                </div>

                {/* Next Monument Preview */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Next Monument</p>
                  <p className="text-sm text-gray-300">
                    {monuments[(currentMonumentIndex + 1) % monuments.length].name}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Monument Image - Full Coverage */}
            <div className="lg:col-span-6 animate-fade-in-up">
              <div className="relative">
                <div 
                  className="relative h-[350px] overflow-hidden rounded-2xl shadow-2xl cursor-pointer"
                  onClick={() => {
                    setCurrentMonumentIndex((prev) => (prev + 1) % monuments.length);
                    updateMonumentAndFact();
                  }}
                >
                  <img
                    src={getCurrentMonument().image}
                    alt={getCurrentMonument().name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />

                  {/* Monument Counter - Top Center */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded">
                      {currentMonumentIndex + 1} / {monuments.length}
                    </div>
                  </div>

                  {/* Monument Name - Overlaid on Image */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="text-center bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <h3 className="text-white font-bold text-lg">{getCurrentMonument().name}</h3>
                      <p className="text-white/90 text-sm">{getCurrentMonument().location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 space-y-6 animate-slide-in-right">
              {/* CTA Section */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  Embark on an unforgettable journey to discover the spellbinding landscapes and unique cultural treasures of fire and ice!
                </p>
                <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-lg py-3">
                  Get consultation
                </Button>
              </div>

              {/* Secondary Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                <img
                  src={fallbackImage}
                  alt="Dramatic Coastline"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Tour Info */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Tour</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Unlock the mysteries of Iceland's spellbinding landscapes.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">Iceland</span>
                    <div className="w-16 h-px bg-gray-600"></div>
                    <span className="text-sm text-gray-400">via</span>
                  </div>
                  <div className="flex space-x-1">
                    <button className="w-8 h-8 bg-gray-800 text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 bg-gray-800 text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
