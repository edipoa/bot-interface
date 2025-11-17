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

/*
Vue 3 Implementation:

For Vue 3, install lucide-vue-next:
npm install lucide-vue-next

// BFIcons.ts
import {
  Home,
  Users,
  Trophy,
  DollarSign,
  User,
  Settings,
  LogOut,
  Plus,
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
  Link,
  Share2,
  Copy,
  Save,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Activity,
} from 'lucide-vue-next'

export const BFIcons = {
  Home, Users, Trophy, DollarSign, User, Settings, LogOut,
  Plus, Edit, Trash2, Search, Filter, Download, Upload,
  CheckCircle, XCircle, AlertCircle, Eye, EyeOff,
  Calendar, Clock, TrendingUp, TrendingDown, BarChart3, Activity,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical,
  Menu, X, ArrowLeft, ArrowRight,
  Bell, Mail, Phone, MapPin, Link, Share2, Copy, Save, RefreshCw,
  Play, Pause
}

export type BFIconName = keyof typeof BFIcons

// BFIcon.vue
<script setup lang="ts">
import { BFIcons, type BFIconName } from './BFIcons'
import { computed } from 'vue'

interface Props {
  name: BFIconName
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20
})

const IconComponent = computed(() => BFIcons[props.name])
</script>

<template>
  <component 
    :is="IconComponent" 
    :size="size" 
    :color="color"
  />
</template>
*/
