import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  BookmarkCheck,
  UserCircle,
  Search,
  Filter,
  LogOut,
  Settings,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchCauses } from '@/slices/causeSlice';
import { logout } from '@/slices/userSlice';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const navigation = [
  { name: 'Dashboard', href: '/donor', icon: LayoutDashboard },
  { name: 'My Donations', href: '/donor/donations', icon: Heart },
  { name: 'Saved Causes', href: '/donor/saved', icon: BookmarkCheck },
  { name: 'Profile', href: '/donor/profile', icon: UserCircle },
];

const ITEMS_PER_PAGE = 9;

const categories = [
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'environment', name: 'Environment' },
  { id: 'poverty', name: 'Poverty' },
  { id: 'animals', name: 'Animals' },
  { id: 'disaster', name: 'Disaster Relief' },
  { id: 'community', name: 'Community' },
  { id: 'others', name: 'Others' },
];

export default function DonorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useSelector((state) => state.user);
  const { causes, loading } = useSelector((state) => state.causes);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCauses, setFilteredCauses] = useState([]);

  useEffect(() => {
    const loadCauses = async () => {
      try {
        await dispatch(fetchCauses()).unwrap();
      } catch (error) {
        toast.error('Failed to load causes');
      }
    };

    loadCauses();
  }, [dispatch]);

  useEffect(() => {
    if (causes) {
      let filtered = [...causes].filter(cause => cause.status === 'approved');

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(cause =>
          cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cause.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(cause => cause.category === selectedCategory);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'latest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'target-high':
            return b.targetAmount - a.targetAmount;
          case 'target-low':
            return a.targetAmount - b.targetAmount;
          case 'progress-high':
            return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount);
          case 'progress-low':
            return (a.raisedAmount / a.targetAmount) - (b.raisedAmount / b.targetAmount);
          default:
            return 0;
        }
      });

      setFilteredCauses(filtered);
      // Reset to first page when filters change
      setCurrentPage(1);
    }
  }, [causes, searchTerm, selectedCategory, sortBy]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paginatedCauses = filteredCauses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/logo.png"
              alt="The Good Deed Hub"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                            ${isActive 
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-6 w-6" />
                  Sign out
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-2xl font-semibold text-foreground">Welcome, {user?.name?.split(' ')[0]}!</span>
              <div className="flex-1" />
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/donor/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/donor/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search causes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="target-high">Target Amount (High to Low)</SelectItem>
                    <SelectItem value="target-low">Target Amount (Low to High)</SelectItem>
                    <SelectItem value="progress-high">Progress (High to Low)</SelectItem>
                    <SelectItem value="progress-low">Progress (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Causes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCauses.map((cause) => (
                <Card key={cause._id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{cause.title}</CardTitle>
                        <Badge variant="secondary" className="mb-2">
                          {categories.find(c => c.id === cause.category)?.name || 'Other'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {cause.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {Math.round((cause.currentAmount / cause.targetAmount) * 100)}%
                          </span>
                        </div>
                        <Progress value={(cause.currentAmount / cause.targetAmount) * 100} />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Raised: ₹{cause.currentAmount?.toLocaleString()}</span>
                          <span className="text-muted-foreground">Goal: ₹{cause.targetAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/causes/${cause._id}`)}
                      >
                        Donate Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {filteredCauses.length > ITEMS_PER_PAGE && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredCauses.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            {/* Empty State */}
            {filteredCauses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory ? (
                    <>No causes found matching your filters.</>
                  ) : (
                    <>No causes available at the moment.</>
                  )}
                </div>
                {(searchTerm || selectedCategory) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSortBy('latest');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 