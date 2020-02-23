import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';
import { Chantier } from '../_models';


@Injectable({ providedIn: 'root' })
export class ChantierService {
      constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Chantier[]>(`${environment.apiUrl}/chantiers`);
    }

    getById(id: number) {
        return this.http.get<Chantier>(`${environment.apiUrl}/chantier/${id}`);
    }

}