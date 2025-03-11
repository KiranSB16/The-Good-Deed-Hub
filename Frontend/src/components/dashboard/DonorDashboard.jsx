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
  ChevronDown,
  X
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
import { fetchCauses, setFilters, clearFilters } from '@/slices/causeSlice';
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

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'target-high', label: 'Highest Target' },
  { value: 'target-low', label: 'Lowest Target' },
  { value: 'progress-high', label: 'Most Progress' },
  { value: 'progress-low', label: 'Least Progress' },
  { value: 'urgency-high', label: 'Most Urgent' },
  { value: 'urgency-low', label: 'Least Urgent' },
];

export default function DonorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useSelector((state) => state.user);
  const { 
    causes, 
    loading, 
    pagination, 
    filters 
  } = useSelector((state) => state.causes);
  
  const [showFilters, setShowFilters] = useState(false);

  // Effect to fetch causes with current filters and pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchCauses({
          page: pagination.currentPage,
          ...filters
        })).unwrap();
      } catch (error) {
        toast.error('Failed to load causes');
      }
    };

    fetchData();
  }, [dispatch, pagination.currentPage, filters]);

  // Handler for filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    // Reset to first page when filters change
    dispatch(fetchCauses({ 
      page: 1,
      ...filters,
      [key]: value
    }));
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchCauses({ page: 1 }));
  };

  // Handler for page changes
  const handlePageChange = (newPage) => {
    dispatch(fetchCauses({
      page: newPage,
      ...filters
    }));
  };

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
                    placeholder="Search by title, description, category or organization..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:w-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(filters).some(Boolean) && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.values(filters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
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

                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      className="w-1/2"
                    />
                  </div>
                </div>
              )}

              {/* Active filters and clear button */}
              {Object.values(filters).some(Boolean) && (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                          {key}: {value}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleFilterChange(key, '')}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {causes.length} of {pagination.totalCauses} causes
            </div>

            {/* Causes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {causes.map((cause) => (
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
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Empty State */}
            {causes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {Object.values(filters).some(Boolean) ? (
                    <>No causes found matching your filters.</>
                  ) : (
                    <>No causes available at the moment.</>
                  )}
                </div>
                {Object.values(filters).some(Boolean) && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
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