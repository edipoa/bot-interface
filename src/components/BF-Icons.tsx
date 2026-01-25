import React from 'react';
import {
  Home,
  Users,
  Trophy,
  DollarSign,
  User,
  Settings,
  LogOut,
  Plus,
  PlusCircle,
  MinusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  EyeOff,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Bell,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Share2,
  Copy,
  Save,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Activity,
  MessageSquare,
  MessageCircle,
  Layers,
  Info,
  Hash,
  CreditCard,
  Archive,
  Lock,
  Moon,
  Sun,
  Target,
  Flame,
  UtensilsCrossed,
  Wallet,
  Slash,
} from 'lucide-react';

export const BFIcons = {
  // Navigation
  Home,
  Users,
  Trophy,
  DollarSign,
  User,
  Settings,
  LogOut,
  Menu,
  ArrowLeft,
  ArrowRight,

  // Actions
  Plus,
  PlusCircle,
  MinusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  RefreshCw,
  Copy,
  Share2,
  Play,
  Pause,
  Archive,

  // Status
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Moon,
  Sun,

  // Data
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,

  // UI
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,

  // Communication
  Bell,
  Mail,
  Phone,
  MapPin,
  LinkIcon,
  MessageSquare,
  MessageCircle,

  // Organization
  Layers,
  Hash,
  Info,
  CreditCard,
  Target,
  Flame,
  UtensilsCrossed,
  Wallet,
  Slash,
};

export type BFIconName = keyof typeof BFIcons;

export interface BFIconProps {
  name: BFIconName;
  size?: number;
  className?: string;
  color?: string;
}

export const BFIcon: React.FC<BFIconProps> = ({ name, size = 20, className = '', color }) => {
  const IconComponent = BFIcons[name];
  return <IconComponent size={size} className={className} color={color} />;
};