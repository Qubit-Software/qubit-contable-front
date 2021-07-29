import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private url = `${environment.apiUrl}/inventario`;
  private url2 = `${environment.apiUrl}/headersinventory`;


  headersInventario$: Observable<{ 'headers': object, 'headerPos': string }>;
  inventario$: Observable<object[]>;
  private headersSubject: Subject<{ 'headers': object, 'headerPos': string }>;
  private inventarioSubject: Subject<object[]>;

  constructor(private http: HttpClient) {
    this.headersSubject = new Subject<{ 'headers': object, 'headerPos': string }>();
    this.inventarioSubject = new Subject<object[]>();
    this.headersInventario$ = this.headersSubject.asObservable();
    this.inventario$ = this.inventarioSubject.asObservable();
  }
  getHeaders(value) {
    this.headersSubject.next(value);
  }
  chargeInventario(value) {
    this.inventarioSubject.next(value);
  }
  getHeadersInventario(idSucursal) {
    return this.http.get(
      `${this.url2}/findOne/${idSucursal}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  createInventario(headers, inventario, values: Object) {
    const authData = {
      headers,
      inventario,
      values: { ...values },
    };
    return this.http.post(
      `${this.url}/new`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  getAllInventario(inventarioName) {
    return this.http.get(
      `${this.url}/getAll/${inventarioName}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  updateInventario(id, headers, inventario, data: Object) {
    const authData = {
      id,
      headers,
      data: {
        ...data
      }
    };
    return this.http.put(
      `${this.url}/update/${inventario}`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  lessInventory(inventario,data){
    const authData = {
      data
    };
    return this.http.put(
      `${this.url}/lessinventory/${inventario}`, authData).pipe(
        map(resp => {
          return resp;
        })
      );
  }
  deleteOne(inventario, id) {
    return this.http.delete(
      `${this.url}/delete/${inventario}/${id}`).pipe(
        map(resp => {
          return resp;
        })
      );
  }
}
