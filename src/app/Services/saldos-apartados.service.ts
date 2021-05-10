import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SaldosApartadosService {

  private url = `${environment.apiUrl}/saldosapartados`;

  constructor(private http: HttpClient) { }

  createSaldoApartado(idEmpresa, tipo, total, saldo, pago, fecha, comentario, sucursaleId, consumidoreId, abono, tipopago, productos) {
    const authData = {
      idEmpresa,
      tipo,
      total,
      saldo,
      pago,
      fecha,
      comentario,
      sucursaleId,
      consumidoreId,
      abono,
      tipopago,
      productos
    };
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
      `${this.url}/getVentas/${idEmpresa}/${id}`).pipe(
        map(resp => {
          return resp['venta'];
        })
      );
  }
}
