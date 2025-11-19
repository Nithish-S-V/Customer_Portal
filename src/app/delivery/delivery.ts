import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/services/api.service';

export interface DeliveriesApiResponse {
  success: boolean;
  deliveries: any[];
  count: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {

  constructor(private apiService: ApiService) { }

  getDeliveryList(): Observable<any[]> {
    return this.apiService.get<DeliveriesApiResponse>('/deliveries').pipe(
      map(response => response.deliveries || [])
    );
  }

  getDeliveryDetails(deliveryId: string): Observable<any> {
    return this.apiService.get<any>(`/deliveries/${deliveryId}`).pipe(
      map(response => response.delivery || response)
    );
  }
}
