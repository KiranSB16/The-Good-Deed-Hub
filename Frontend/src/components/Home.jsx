import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Heart, Users, IndianRupee, Shield, Clock, TrendingUp, ArrowRight, Sparkles, Target, Globe, Network, Star, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Impact stories
  const impactStories = [
    {
      title: "Education for All",
      description: "Supporting underprivileged children's education through scholarships and learning resources",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "Education"
    },
    {
      title: "Healthcare Access",
      description: "Providing medical support to families in need of critical healthcare",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      category: "Healthcare"
    },
    {
      title: "Community Development",
      description: "Building sustainable communities through clean water and sanitation projects",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "Community"
    }
  ];

  // Platform features
  const features = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Your donations are handled with the highest security standards",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Immediate support when it matters most",
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      icon: CheckCircle2,
      title: "Verified Causes",
      description: "Every cause is thoroughly verified by our team",
      color: "bg-violet-50 text-violet-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 text-sm bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Star className="w-4 h-4 mr-2" />
              India's Trusted Crowdfunding Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Good Deed Hub
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              Empowering communities through collective giving and meaningful impact
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Make a Difference in <span className="text-blue-600">Someone's Life</span>
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Join thousands of donors who are creating lasting impact in communities across India.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg transition-colors duration-200"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-6 transition-colors duration-200"
                  onClick={() => navigate('/login', { state: { from: location } })}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50"></div>
              <img 
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
                alt="Community support"
                className="rounded-2xl shadow-2xl relative"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact Stories</h2>
            <p className="text-gray-700">Real stories of change and transformation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {impactStories.map((story, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="relative p-6 text-white">
                  <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
                    {story.category}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-white/90">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-700">We ensure your support reaches those who need it most</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${feature.color} mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-gray-700">Join our community of donors and fundraisers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-slate-50 p-8 rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-700">Secure Payments</p>
            </div>
            <div className="text-center bg-slate-50 p-8 rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-700">Support Available</p>
            </div>
            <div className="text-center bg-slate-50 p-8 rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-700">Transparency</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}