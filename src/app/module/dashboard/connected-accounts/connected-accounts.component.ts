import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialAccountsService } from '../../../core/services/social-accounts.service';
import { SocialAccount, SocialPlatform } from '../../../core/models/social-account.model';
import { ToasterService } from '../../../shared/services/toaster.service';

@Component({
  selector: 'app-connected-accounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connected-accounts.component.html',
  styleUrl: './connected-accounts.component.scss'
})
export class ConnectedAccountsComponent {




  // Reactive state from service

}
