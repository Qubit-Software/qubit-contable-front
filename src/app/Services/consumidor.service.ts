import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConsumidorModel } from '../Models/Consumidor';

@Injectable({
  providedIn: 'root'
})
export class ConsumidorService {
  private url = `${environment.apiUrl}/consumidor`;
  constructor(private http: HttpClient) { }

  createConsumidor(consumidor: ConsumidorModel, empresaId) {
    const authData = {
      ...consumidor,
      empresaId
    };
    console.log(authData);
    return this.http.post(
      `${this.url}/new`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  getAll(id) {
    return this.http.get(
      `${this.url}/getAll/${id}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  findOne(cedula,id) {
    return this.http.get(
      `${this.url}/findOne/${cedula}/${id}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  updateCliente(consumidor: ConsumidorModel) {
    const authData = {
      ...consumidor
    };
    console.log(authData);
    return this.http.put(
      `${this.url}/update/${consumidor.id}`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  deleteOne(id) {
    return this.http.delete(
      `${this.url}/delete/${id}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
}
