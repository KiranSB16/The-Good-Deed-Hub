import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop"
            alt="People helping"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90"></div>
        </div>

        {/* Navigation */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-end items-center py-6 md:space-x-10">
              <Button
                onClick={() => navigate('/login')}
                className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                variant="ghost"
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Empowering Change<br/>Through Kindness
          </h1>
          <p className="mt-6 text-xl text-purple-100 max-w-3xl">
            Join our community of changemakers and help create positive impact. Whether you're looking to donate or raise funds for a cause, Good Deed Hub connects you with opportunities to make the world better.
          </p>
          <div className="mt-10 flex gap-4">
            <Button 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-xl"
              size="lg"
            >
              Start Making a Difference
            </Button>
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/50"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to make an impact
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                    alt="Fundraising"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-purple-900/20 group-hover:from-purple-800/90"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">Start Fundraising</h3>
                    <p className="mt-2 text-purple-100">Create and manage fundraising campaigns for causes you care about</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                    alt="Donations"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-indigo-900/20 group-hover:from-indigo-800/90"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">Make Donations</h3>
                    <p className="mt-2 text-indigo-100">Support causes with secure and transparent donations</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop"
                    alt="Community"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 to-violet-900/20 group-hover:from-violet-800/90"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">Join Community</h3>
                    <p className="mt-2 text-violet-100">Connect with like-minded individuals making a difference</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop"
                alt="Background pattern"
                className="w-full h-full object-cover opacity-10"
              />
            </div>
            <div className="relative lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
                <div className="lg:self-center">
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Ready to make a difference?</span>
                    <span className="block mt-1">Start your journey today.</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-purple-100">
                    Join thousands of others who are using Good Deed Hub to create positive change in their communities.
                  </p>
                  <div className="mt-8 flex space-x-4">
                    <Button
                      onClick={() => navigate('/register')}
                      className="bg-white text-purple-600 hover:bg-purple-50"
                      size="lg"
                    >
                      Sign Up Now
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      className="bg-purple-700 text-white hover:bg-purple-800"
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative -mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
                <div className="transform translate-x-6 translate-y-6 rounded-md overflow-hidden lg:translate-y-20">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                    alt="App screenshot"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
