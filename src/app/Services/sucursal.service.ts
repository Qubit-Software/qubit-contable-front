import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { EmpresaModel } from '../Models/Empresa';
import { SucursalModel } from '../Models/Sucursal';


@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private url = `${environment.apiUrl}/sucursal`;
  empresa: EmpresaModel;
  sucursal: SucursalModel;

  constructor(private http: HttpClient) { }

  getSucursalInfo() {
    let id = localStorage.getItem('sucursalId')
    return this.http.get(
      `${this.url}/getOne/${id}`).pipe(
        map(resp => {
          localStorage.setItem('empresaId', resp['sucursal']['empresa']['id']);
          localStorage.setItem('inventario', resp['sucursal']['inventario']);
          this.sucursal = resp['sucursal'];
          this.empresa = resp['sucursal']['empresa'];
        })
      );
  }
}
