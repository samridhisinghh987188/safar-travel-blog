
import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from 'three';
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import AuthModal from "../components/AuthModal";
import AirplaneRoute from "../components/AirplaneRoute";
import { Button } from "../components/ui/button";



// Earth component using GLTF model
function Earth() {
  const group = useRef();
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'earth.gltf');
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002;
    }
  });

  // Scale and position the model
  useEffect(() => {
    if (scene) {
      scene.scale.set(0.8, 0.8, 0.8); // Reduced from 1.5 to 0.8 for a smaller Earth
      scene.position.set(0, 0, 0);
      scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return <primitive ref={group} object={scene} />;
}

// Preload the model
useGLTF.preload(import.meta.env.BASE_URL + 'earth.gltf');

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const navigate = useNavigate();
  
  // Title toggle effect (same as navbar)
  const [currentTitle, setCurrentTitle] = useState('SAFAR');
  
  // Monument showcase state
  const [currentMonumentIndex, setCurrentMonumentIndex] = useState(0);
  const [currentFact, setCurrentFact] = useState('');
  
  // Monument data
  const monuments = [
    {
      name: "Taj Mahal",
      location: "Agra, India",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "The Taj Mahal was built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal, who died during childbirth in 1631.",
        "It took over 20,000 artisans and craftsmen from across the empire and Central Asia about 22 years to complete this masterpiece.",
        "The main dome is 115 feet in diameter and rises to a height of 213 feet, creating perfect acoustics inside the main chamber.",
        "The entire structure changes color throughout the day - pinkish hue at dawn, milky white during the day, and golden at sunset."
      ]
    },
    {
      name: "Great Pyramid of Giza",
      location: "Giza, Egypt",
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "Originally standing at 146.5 meters tall, it was the world's tallest man-made structure for over 3,800 years.",
        "Built around 2580-2510 BCE, it consists of an estimated 2.3 million stone blocks, each weighing 2.5 to 15 tons.",
        "The pyramid's base covers 13 acres and its sides are oriented precisely with the cardinal directions.",
        "It's the only surviving wonder of the ancient world and was built as a tomb for Pharaoh Khufu."
      ]
    },
    {
      name: "Machu Picchu",
      location: "Cusco, Peru",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "Built around 1450 CE by the Inca Empire, it sits 2,430 meters above sea level on the eastern slopes of Huayna Picchu.",
        "The site contains over 150 buildings ranging from baths and houses to temples and sanctuaries.",
        "Abandoned during the Spanish conquest in the 16th century, it remained hidden from the outside world until 1911.",
        "The precision of Inca stonework is so exact that not even a knife blade can fit between the stones."
      ]
    },
    {
      name: "Colosseum",
      location: "Rome, Italy",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "Completed in 80 CE, it could hold between 50,000 and 80,000 spectators, making it the largest amphitheater ever built.",
        "The arena floor was covered with sand to absorb blood and had a complex system of underground passages called the hypogeum.",
        "It featured a retractable awning system called the velarium to protect spectators from sun and rain.",
        "Gladiatorial contests and public spectacles continued here for approximately 400 years."
      ]
    },
    {
      name: "Great Wall of China",
      location: "Northern China",
      image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "Stretching over 13,000 miles, it's not a single continuous wall but a series of walls built by different dynasties.",
        "Construction began in the 7th century BCE, with the most famous sections built during the Ming Dynasty (1368-1644).",
        "Contrary to popular belief, it's not visible from space with the naked eye.",
        "It's estimated that over 1 million workers died during its construction over the centuries."
      ]
    },
    {
      name: "Petra",
      location: "Ma'an, Jordan",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      facts: [
        "Established around the 4th century BCE by the Nabataeans, it served as a major trading hub for spices and silk.",
        "The Treasury (Al-Khazneh) stands 40 meters high and is carved directly into the pink sandstone cliff face.",
        "The city features an elaborate water management system with dams, cisterns, and water channels.",
        "Lost to the Western world for centuries, it was rediscovered in 1812 by Swiss explorer Johann Ludwig Burckhardt."
      ]
    }
  ];
  
  // Get current monument
  const getCurrentMonument = () => monuments[currentMonumentIndex];
  
  // Update monument and fact
  const updateMonumentAndFact = () => {
    const currentMonument = getCurrentMonument();
    const randomFactIndex = Math.floor(Math.random() * currentMonument.facts.length);
    setCurrentFact(currentMonument.facts[randomFactIndex]);
  };
  
  // Toggle between SAFAR and सफर every second (same as navbar)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle(prev => prev === 'SAFAR' ? 'सफर' : 'SAFAR');
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Initialize with first monument's fact
  useEffect(() => {
    updateMonumentAndFact();
  }, [currentMonumentIndex]);
  
  // Auto-rotation every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMonumentIndex((prev) => (prev + 1) % monuments.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [monuments.length]);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/home');
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="relative w-full">
      {/* SECTION 1: Landing Page with Earth */}
      <section className="relative w-full h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ 
          backgroundImage: `url(${import.meta.env.BASE_URL}landingbg.jpg)`,
          zIndex: 0
        }}>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Auth Buttons */}
        <div className="absolute top-6 right-8 z-50 flex gap-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleAuthClick('signin');
            }}
            className="px-6 py-2.5 rounded-full border border-white text-white font-medium text-sm hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Sign In
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleAuthClick('signup');
            }}
            className="px-6 py-2.5 rounded-full bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            Sign Up
          </button>
        </div>

        <div className="absolute inset-0 h-full w-full z-10">
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Suspense fallback={
              <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#4A90E2" wireframe />
              </mesh>
            }>
              <Earth />
              <OrbitControls 
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                panSpeed={0.5}
                rotateSpeed={0.4}
                autoRotate={false}
                mouseButtons={{
                  LEFT: THREE.MOUSE.ROTATE,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.ROTATE
                }}
              />
            </Suspense>
          </Canvas>
        </div>

            {/* SAFAR Title - Top Left (same as navbar) */}
            <div className="absolute top-4 left-8 z-50">
              <Link to="/home" className="flex items-center">
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    key={currentTitle}
                    className="font-['Pacifico'] text-3xl text-white block min-w-[120px] text-center text-shadow"
                  >
                    {currentTitle}
                  </motion.span>
                </motion.div>
              </Link>
            </div>

            {/* Content overlay - Center */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
              <div className="text-center max-w-4xl mx-auto px-4">
                <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
                  Embark on extraordinary journeys across the globe. Discover hidden gems, 
                  create unforgettable memories, and let wanderlust guide your soul.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    to="/home" 
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  >
                    Start Your Journey
                  </Link>
                  <button 
                    onClick={() => {
                      const nextSection = document.getElementById('monuments-section');
                      if (nextSection) {
                        nextSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/50"
                  >
                    Explore Destinations
                  </button>
                </div>
              </div>
            </div>
            
            {/* Auth Modal */}
            <AuthModal 
              isOpen={showAuthModal}
              onClose={handleCloseModal}
              mode={authMode}
              onSuccess={handleAuthSuccess}
            />
        </section>
      {/* SECTION 2: Monuments Showcase */}
      <section id="monuments-section" className="relative py-16 md:py-24 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
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
                              src="/dramatic-coastline-ocean-cliffs-sunset.jpg"
                              alt="Dramatic Coastline Sunset"
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
