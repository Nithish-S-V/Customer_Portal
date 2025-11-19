import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreditDebitService {
  private readonly MEMOS_ENDPOINT = '/memos';

  constructor(private apiService: ApiService) {}

  /**
   * Get all credit and debit memos
   */
  getMemos(): Observable<any[]> {
    return this.apiService.get<any>(this.MEMOS_ENDPOINT).pipe(
      map((response: any) => response.memos || [])
    );
  }

  /**
   * Get a specific memo by document number
   */
  getMemoById(documentNumber: string): Observable<any> {
    return this.apiService.get<any>(`${this.MEMOS_ENDPOINT}/${documentNumber}`);
  }
}
