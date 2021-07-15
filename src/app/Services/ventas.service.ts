import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private url = `${environment.apiUrl}/venta`;

  constructor(private http: HttpClient) { }

  getFactura(id, idSucursal) {
    return this.http.get(
      `${this.url}/getFactura/${id}/${idSucursal}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  createVenta(idEmpresa, preciototal, iva, fecha, tipo, comentario, sucursaleId, consumidoreId, productos) {
    const authData = {
      idEmpresa,
      preciototal,
      iva,
      fecha,
      tipo,
      comentario,
      sucursaleId,
      consumidoreId,
      productos
    };
    console.log(authData);
    return this.http.post(
      `${this.url}/new`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  getVentasBySucursal(idEmpresa) {
    let id = localStorage.getItem('sucursalId')
    return this.http.get(
      `${this.url}/getVentasReport/${idEmpresa}/${id}`).pipe(
        map(resp => {
          return resp['ventas'];
        })
      );
  }
  getInventarioVentasByVentas(id, idEmpresa) {
    return this.http.get(
      `${this.url}/getInventarioOne/${id}/${idEmpresa}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  getInfoVentasById(id, idEmpresa) {
    return this.http.get(
      `${this.url}/getinfoventa/${id}/${idEmpresa}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  deleteOne(id, idEmpresa) {
    return this.http.delete(
      `${this.url}/deleteOne/${id}/${idEmpresa}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
}
