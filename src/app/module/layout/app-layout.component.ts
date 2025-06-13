import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { SidebarNavComponent } from "../../shared/components/sidebar-nav/sidebar-nav.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, HeaderComponent, SidebarNavComponent],
  templateUrl: 'app-layout.component.html'
})
export class AppLayoutComponent {}
