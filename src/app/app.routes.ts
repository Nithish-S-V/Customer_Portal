import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadChildren: () => import('./dashboard/dashboard-module').then(m => m.DashboardModule)
      },
      { 
        path: 'finance', 
        loadChildren: () => import('./finance/finance.module').then(m => m.FinanceModule)
      },
      { 
        path: 'invoice', 
        loadChildren: () => import('./invoice/invoice-module').then(m => m.InvoiceModule)
      },
      { 
        path: 'credit-debit', 
        loadChildren: () => import('./credit-debit/credit-debit.module').then(m => m.CreditDebitModule)
      },
      { 
        path: 'aging', 
        loadChildren: () => import('./aging/aging.module').then(m => m.AgingModule)
      },
      // Payment features disabled but preserved for future use
      // { 
      //   path: 'payment', 
      //   loadChildren: () => import('./payment/payment-module').then(m => m.PaymentModule)
      // },
      { 
        path: 'delivery', 
        loadChildren: () => import('./delivery/delivery-module').then(m => m.DeliveryModule)
      },
      { 
        path: 'profile', 
        loadChildren: () => import('./profile/profile-module').then(m => m.ProfileModule)
      },
      { 
        path: 'inquiry', 
        loadChildren: () => import('./inquiry/inquiry-module').then(m => m.InquiryModule)
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
