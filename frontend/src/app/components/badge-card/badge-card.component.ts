import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge, UserBadge } from '../../models/badge.model';
import { BadgeService } from '../../services/badge.service';

@Component({
  selector: 'app-badge-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-card.component.html',
  styleUrls: ['./badge-card.component.scss']
})
export class BadgeCardComponent {
  @Input() badge!: Badge;
  @Input() userBadge?: UserBadge;
  @Input() isEarned: boolean = false;
  @Input() showDetails: boolean = false;

  constructor(public badgeService: BadgeService) {}

  get earnedDate(): string {
    if (this.userBadge?.earned_at) {
      return new Date(this.userBadge.earned_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return '';
  }
}
