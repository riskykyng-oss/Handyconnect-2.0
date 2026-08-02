import {
  Plus, Search, Users, MapPin,
} from 'lucide-react';

export const quickActions = [
  {
    id: 'post-job',
    label: 'Post Job',
    icon: Plus,
    description: 'Create a new service request.',
    color: 'orange',
    route: '/client/home',
    action: 'postJob',
  },
  {
    id: 'find-pros',
    label: 'Find Pros',
    icon: Search,
    description: 'Browse nearby verified handymen.',
    color: 'blue',
    route: '/client/explore',
  },
  {
    id: 'nearby-map',
    label: 'Nearby Map',
    icon: MapPin,
    description: 'See who is near you right now.',
    color: 'green',
    route: '/client/explore',
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    description: 'Discover projects, stories and tips.',
    color: 'purple',
    route: '/community',
  },
];

export const accentMap = {
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    ring: 'focus:ring-orange-500/30',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    ring: 'focus:ring-blue-500/30',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    ring: 'focus:ring-green-500/30',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    ring: 'focus:ring-purple-500/30',
  },
};
