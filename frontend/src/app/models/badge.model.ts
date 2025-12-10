// Modèle pour un Badge
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_type: 'performance' | 'streak' | 'completion' | 'mastery';
  criteria: any;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
}

// Modèle pour un Badge Utilisateur
export interface UserBadge {
  id: number;
  user_username: string;
  badge: Badge;
  earned_at: string;
  progress: number;
  metadata: any;
}

// Statistiques des badges
export interface BadgeStatistics {
  total_badges: number;
  earned_badges: number;
  completion_percentage: number;
  points_total: number;
  badges_by_rarity: {
    common?: number;
    rare?: number;
    epic?: number;
    legendary?: number;
  };
}
