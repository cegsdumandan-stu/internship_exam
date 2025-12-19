import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { User, GeoData } from './types';
import { fetchGeoLocation } from './services/geoService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  
  // State to hold the logged-in user's original location to revert to
  const [originalGeoData, setOriginalGeoData] = useState<GeoData | null>(null);
  
  const [searchIp, setSearchIp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  // Initialize user from LocalStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('app_user');
      }
    }
    
    // Load history from local storage
    const storedHistory = localStorage.getItem('search_history');
    if (storedHistory) {
        try {
            setSearchHistory(JSON.parse(storedHistory));
        } catch (e) {
            setSearchHistory([]);
        }
    }
  }, []);

  // Fetch initial location when user logs in
  useEffect(() => {
    if (user) {
      fetchGeoLocation().then((data) => {
        if (data) {
          setGeoData(data);
          setOriginalGeoData(data);
        }
      });
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('app_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setGeoData(null);
    setOriginalGeoData(null);
    setSearchIp('');
    setError(null);
    localStorage.removeItem('app_user');
  };

  const validateIp = (ip: string) => {
    // Simple IPv4 validation regex
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Basic IPv6 check
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setError(null);
    const ipToSearch = searchIp.trim();

    if (!ipToSearch) {
        return;
    }

    if (!validateIp(ipToSearch)) {
      setError("Please enter a valid IP address (IPv4 or IPv6).");
      return;
    }

    setIsSearching(true);
    try {
      const data = await fetchGeoLocation(ipToSearch);
      if (data) {
        setGeoData(data);
        addToHistory(ipToSearch);
      } else {
        setError("Could not retrieve data for this IP.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setIsSearching(false);
    }
  };

  const addToHistory = (ip: string) => {
      setSearchHistory(prev => {
          const newHistory = [ip, ...prev.filter(item => item !== ip)];
          localStorage.setItem('search_history', JSON.stringify(newHistory));
          return newHistory;
      });
  };

  const handleClear = () => {
    setSearchIp('');
    setError(null);
    if (originalGeoData) {
      setGeoData(originalGeoData);
    }
  };

  const handleHistoryClick = (ip: string) => {
      setSearchIp(ip);
      setError(null);
      setIsSearching(true);
      fetchGeoLocation(ip).then(data => {
          setIsSearching(false);
          if (data) setGeoData(data);
          else setError("Could not fetch history item.");
      });
  };

  // --- History Selection Logic ---

  const handleCheckboxChange = (ip: string) => {
    const newSelected = new Set(selectedHistory);
    if (newSelected.has(ip)) {
      newSelected.delete(ip);
    } else {
      newSelected.add(ip);
    }
    setSelectedHistory(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedHistory(new Set(searchHistory));
    } else {
      setSelectedHistory(new Set());
    }
  };

  const handleDeleteSelected = () => {
    const newHistory = searchHistory.filter(ip => !selectedHistory.has(ip));
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
    setSelectedHistory(new Set());
  };

  // --- Map Helper ---
  
  const getMapUrl = (loc: string) => {
    if (!loc) return '';
    try {
      const [latStr, lonStr] = loc.split(',');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      
      // Calculate bounding box for OpenStreetMap
      const offset = 0.05; // Zoom level approximation
      const bbox = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;
      
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {user ? (
        <div className="flex flex-col items-center min-h-screen p-4 pt-10">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl text-center">
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Logged in as <span className="font-semibold text-indigo-600">{user.email}</span></p>
                </div>
                <button
                onClick={handleLogout}
                className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                Sign Out
                </button>
            </div>

            {/* Geo Data Card */}
            {geoData ? (
              <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-xl border border-indigo-100 mb-8 text-left shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center text-lg">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  {geoData.ip === originalGeoData?.ip ? "Your Current Location" : `Location for ${geoData.ip}`}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-slate-700 relative z-10">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider mb-1">IP Address</span>
                    <span className="font-mono text-slate-800">{geoData.ip}</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider mb-1">City</span>
                    {geoData.city}
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider mb-1">Region</span>
                    {geoData.region}
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider mb-1">Country</span>
                    {geoData.country}
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg md:col-span-2">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider mb-1">Coordinates & Org</span>
                    <div className="flex justify-between">
                        <span>{geoData.loc}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{geoData.org}</span>
                    </div>
                  </div>
                </div>

                {/* MAP SECTION */}
                <div className="mt-6 h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative z-10 bg-slate-200">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={getMapUrl(geoData.loc)}
                    title="Location Map"
                  ></iframe>
                </div>
              </div>
            ) : (
               <div className="mb-8 p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm flex flex-col items-center">
                   <svg className="animate-spin h-8 w-8 mb-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   Loading geolocation data...
               </div>
            )}

            {/* Search Section */}
            <div className="bg-white rounded-xl mb-8">
                <h4 className="text-left text-sm font-semibold text-slate-700 mb-3">IP Lookup</h4>
                <form onSubmit={handleSearch} className="relative mb-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchIp}
                            onChange={(e) => setSearchIp(e.target.value)}
                            placeholder="Enter valid IP address (e.g. 8.8.8.8)"
                            className={`flex-1 px-4 py-3 bg-slate-50 border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'} rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-slate-900 placeholder-slate-400`}
                        />
                        <button 
                            type="submit"
                            disabled={isSearching}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                        >
                            {isSearching ? '...' : 'Search'}
                        </button>
                    </div>
                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-xs text-left mt-2 ml-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </p>
                    )}
                </form>

                {/* Clear Button */}
                {geoData && originalGeoData && geoData.ip !== originalGeoData.ip && (
                    <div className="text-left">
                        <button 
                            onClick={handleClear}
                            className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Reset to my location
                        </button>
                    </div>
                )}
            </div>

            {/* History Section */}
            {searchHistory.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</h4>
                      {selectedHistory.size > 0 && (
                        <button 
                          onClick={handleDeleteSelected}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md font-medium transition-colors border border-red-200"
                        >
                          Delete Selected ({selectedHistory.size})
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      {/* List Header */}
                      <div className="grid grid-cols-12 gap-4 p-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-500">
                        <div className="col-span-1 flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedHistory.size === searchHistory.length && searchHistory.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="col-span-8 text-left">IP Address</div>
                        <div className="col-span-3 text-right">Action</div>
                      </div>

                      {/* List Items */}
                      <div className="max-h-60 overflow-y-auto">
                        {searchHistory.map((ip, idx) => (
                            <div 
                              key={ip} 
                              className={`grid grid-cols-12 gap-4 p-3 items-center hover:bg-white transition-colors border-b last:border-b-0 border-slate-100 ${selectedHistory.has(ip) ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className="col-span-1 flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedHistory.has(ip)}
                                    onChange={() => handleCheckboxChange(ip)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="col-span-8 text-left">
                                  <button 
                                    onClick={() => handleHistoryClick(ip)}
                                    className="text-sm text-slate-700 hover:text-indigo-600 font-mono font-medium truncate w-full text-left"
                                  >
                                    {ip}
                                  </button>
                                </div>
                                <div className="col-span-3 text-right">
                                  <button
                                    onClick={() => handleHistoryClick(ip)}
                                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                                  >
                                    View Map
                                  </button>
                                </div>
                            </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}

          </div>
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;