import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge, UserBadge, BadgeStatistics } from '../models/badge.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private apiUrl = `${environment.apiUrl}/gamification/badges`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les badges disponibles
   */
  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/`);
  }

  /**
   * Récupère les détails d'un badge spécifique
   */
  getBadgeById(id: number): Observable<Badge> {
    return this.http.get<Badge>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Récupère les badges de l'utilisateur connecté
   */
  getMyBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/my_badges/`);
  }

  /**
   * Récupère les badges disponibles (non encore obtenus)
   */
  getAvailableBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/available/`);
  }

  /**
   * Récupère les statistiques des badges de l'utilisateur
   */
  getStatistics(): Observable<BadgeStatistics> {
    return this.http.get<BadgeStatistics>(`${this.apiUrl}/statistics/`);
  }

  /**
   * Récupère le leaderboard
   */
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard/`);
  }

  /**
   * Retourne la classe CSS selon la rareté du badge
   */
  getRarityClass(rarity: string): string {
    const classes: { [key: string]: string } = {
      'common': 'badge-common',
      'rare': 'badge-rare',
      'epic': 'badge-epic',
      'legendary': 'badge-legendary'
    };
    return classes[rarity] || 'badge-common';
  }

  /**
   * Retourne la couleur selon la rareté
   */
  getRarityColor(rarity: string): string {
    const colors: { [key: string]: string } = {
      'common': '#95a5a6',
      'rare': '#3498db',
      'epic': '#9b59b6',
      'legendary': '#f39c12'
    };
    return colors[rarity] || '#95a5a6';
  }

  /**
   * Retourne le label traduit de la rareté
   */
  getRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'common': 'Commun',
      'rare': 'Rare',
      'epic': 'Épique',
      'legendary': 'Légendaire'
    };
    return labels[rarity] || 'Commun';
  }

  /**
   * Retourne le label traduit du type de badge
   */
  getBadgeTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'performance': 'Performance',
      'streak': 'Série',
      'completion': 'Complétion',
      'mastery': 'Maîtrise'
    };
    return labels[type] || type;
  }
}
