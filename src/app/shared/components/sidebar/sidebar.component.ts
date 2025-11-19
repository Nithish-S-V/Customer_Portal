import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule
  ]
})
export class SidebarComponent {
  // Navigation items - Restructured with separate modules
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Finance Sheet', route: '/finance', icon: 'account_balance' },
    { label: 'Invoice', route: '/invoice', icon: 'receipt' },
    { label: 'Credit/Debit Notes', route: '/credit-debit', icon: 'account_balance_wallet' },
    // { label: 'Aging Report', route: '/aging', icon: 'schedule' },
    { label: 'Delivery', route: '/delivery', icon: 'local_shipping' },
    { label: 'Inquiries', route: '/inquiry', icon: 'search' },
    { label: 'Sales Orders', route: '/inquiry/sales-orders', icon: 'shopping_cart' },
    { label: 'Profile', route: '/profile', icon: 'person' }
  ];
}
