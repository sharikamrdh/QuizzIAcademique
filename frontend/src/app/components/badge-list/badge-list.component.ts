import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeService } from '../../services/badge.service';
import { Badge, UserBadge } from '../../models/badge.model';
import { BadgeCardComponent } from '../badge-card/badge-card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-badge-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeCardComponent],
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.scss']
})
export class BadgeListComponent implements OnInit {
  allBadges: Badge[] = [];
  myBadges: UserBadge[] = [];
  loading = true;
  error = '';
  
  // Filtres
  selectedRarity: string = 'all';
  selectedType: string = 'all';
  showOnlyEarned: boolean = false;

  constructor(private badgeService: BadgeService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    forkJoin({
      all: this.badgeService.getAllBadges(),
      my: this.badgeService.getMyBadges()
    }).subscribe({
      next: (result) => {
        this.allBadges = result.all;
        this.myBadges = result.my;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des badges';
        this.loading = false;
        console.error(err);
      }
    });
  }

  isEarned(badge: Badge): boolean {
    return this.myBadges.some(ub => ub.badge.id === badge.id);
  }

  getUserBadge(badge: Badge): UserBadge | undefined {
    return this.myBadges.find(ub => ub.badge.id === badge.id);
  }

  get filteredBadges(): Badge[] {
    return this.allBadges.filter(badge => {
      // Filtre par rareté
      if (this.selectedRarity !== 'all' && badge.rarity !== this.selectedRarity) {
        return false;
      }

      // Filtre par type
      if (this.selectedType !== 'all' && badge.badge_type !== this.selectedType) {
        return false;
      }

      // Filtre "seulement obtenus"
      if (this.showOnlyEarned && !this.isEarned(badge)) {
        return false;
      }

      return true;
    });
  }

  get earnedCount(): number {
    return this.myBadges.length;
  }

  get totalCount(): number {
    return this.allBadges.length;
  }

  resetFilters(): void {
    this.selectedRarity = 'all';
    this.selectedType = 'all';
    this.showOnlyEarned = false;
  }
}
