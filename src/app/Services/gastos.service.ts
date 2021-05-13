import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private url = `${environment.apiUrl}/gastos`;

  constructor(private http: HttpClient) { }

  getGastos(id, idEmpresa) {
    return this.http.get(
      `${this.url}/findAll/${id}/${idEmpresa}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  getGastosByDate(id, idEmpresa, fecha) {
    const authData = {
      fecha
    };
    return this.http.post(
      `${this.url}/findByFecha/${id}/${idEmpresa}`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  createGasto(idEmpresa, idSucursal, gasto) {
    const authData = {
      idSucursal,
      ...gasto
    };
    console.log(authData);
    return this.http.post(
      `${this.url}/new/${idEmpresa}`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  deleteGasto(idEmpresa, id) {
    return this.http.delete(
      `${this.url}/deleteOne/${idEmpresa}/${id}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
}
