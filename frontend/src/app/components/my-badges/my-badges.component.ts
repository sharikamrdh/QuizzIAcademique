import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../services/badge.service';
import { UserBadge, BadgeStatistics } from '../../models/badge.model';
import { BadgeCardComponent } from '../badge-card/badge-card.component';

@Component({
  selector: 'app-my-badges',
  standalone: true,
  imports: [CommonModule, BadgeCardComponent],
  templateUrl: './my-badges.component.html',
  styleUrls: ['./my-badges.component.scss']
})
export class MyBadgesComponent implements OnInit {
  myBadges: UserBadge[] = [];
  statistics?: BadgeStatistics;
  loading = true;
  error = '';

  constructor(private badgeService: BadgeService) {}

  ngOnInit(): void {
    this.loadMyBadges();
    this.loadStatistics();
  }

  loadMyBadges(): void {
    this.badgeService.getMyBadges().subscribe({
      next: (badges) => {
        this.myBadges = badges;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des badges';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadStatistics(): void {
    this.badgeService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => {
        console.error('Erreur stats:', err);
      }
    });
  }

  getBadgesByRarity(rarity: string): UserBadge[] {
    return this.myBadges.filter(ub => ub.badge.rarity === rarity);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)';
    if (percentage >= 50) return 'linear-gradient(90deg, #f39c12 0%, #f1c40f 100%)';
    if (percentage >= 25) return 'linear-gradient(90deg, #e67e22 0%, #f39c12 100%)';
    return 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
  }
}
