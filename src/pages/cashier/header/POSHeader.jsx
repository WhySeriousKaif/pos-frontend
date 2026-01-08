import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlignJustify, LogOut, User, Sun, Moon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/store/slices/authSlice";
import { userAPI } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import babyImage from "../../../assets/newborn-5036843_1920.jpg";

const POSHeader = ({ onMenuClick }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    fetchUserInfo();
    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem('cashierAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem('cashierAvatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const fetchUserInfo = async () => {
    try {
      const profile = await userAPI.getProfile();
      setUserInfo(profile);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/auth/login');
  };

  const getInitials = () => {
    if (userInfo?.fullName) {
      return userInfo.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userInfo?.name) {
      return userInfo.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'CN';
  };

  return (
<div className="h-14 sm:h-16 lg:h-18 bg-card border-b border-border sticky top-0 z-10 
px-2 sm:px-2 lg:px-3 
py-1 sm:py-1.5 lg:py-2 shrink-0">
      <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
        <div className="w-8 sm:w-10 lg:w-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            onClick={onMenuClick}
          >
            <AlignJustify className="size-4" />
          </Button>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">POS Terminal</h1>
          <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-0.5 sm:mt-1">Create a new order</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-8 sm:w-auto">
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 text-[10px] xl:text-xs text-muted-foreground">
            <span>F1: Search</span>
            <span>|</span>
            <span>F2: Discount</span>
            <span>|</span>
            <span>F3: Customer</span>
            <span>|</span>
            <span className="hidden xl:inline">Ctrl+Enter: Payment</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            onClick={toggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="size-7 sm:size-8 lg:size-10">
                  <AvatarImage src={avatarUrl || babyImage} alt={userInfo?.fullName || userInfo?.name || "User"} />
                  <AvatarFallback className="text-xs sm:text-sm">{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={avatarUrl || babyImage} alt={userInfo?.fullName || userInfo?.name || "User"} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {userInfo?.fullName || userInfo?.name || 'Cashier'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userInfo?.email || 'No email'}
                    </p>
                    {userInfo?.phone && (
                      <p className="text-xs text-muted-foreground truncate">
                        {userInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t pt-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default POSHeader;
