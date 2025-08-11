import { Component, OnInit } from '@angular/core';
import { ConnectedAccountsComponent } from './connected-accounts/connected-accounts.component';
import { CommonModule } from '@angular/common';
import { DialogExampleComponent } from "src/app/shared/components/dialog/dialog-example.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, ConnectedAccountsComponent, DialogExampleComponent]
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
