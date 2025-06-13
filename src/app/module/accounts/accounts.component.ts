import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
  imports:[RouterLink]
})
export class AccountsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  loginWithLinkedIn() {
    window.location.href = `${environment.apiUrl}/api/v1/social/linkedin`;
  }
}
