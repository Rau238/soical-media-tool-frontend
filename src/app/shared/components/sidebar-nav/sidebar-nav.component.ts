import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css']
})
export class SidebarNavComponent implements OnInit {
  private router: Router = inject(Router)
  constructor() { }

  ngOnInit() {}

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
