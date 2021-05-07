import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '../Models/User';
import { map } from 'rxjs/operators';
import { SucursalService } from './sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = `${environment.apiUrl}/user`;

  userToken: string;
  expiresAt: string;
  constructor(private http: HttpClient, private sucursal: SucursalService) {
    this.readToken();
  }
  login(usuario: UserModel) {
    const authData = {
      ...usuario
    };
    return this.http.post(
      `${this.url}/login`, authData).pipe(
        map(resp => {
          localStorage.setItem('sucursalId', resp['usuario']['sucursaleId']);
          this.sucursal.getSucursalInfo().subscribe(res => { });
          this.saveToken(resp['token'], 'date');
          return resp;
        })
      );
  }
  // LOGOUT*************************************
  logout() {
    localStorage.removeItem('token');
  }
  // SAVETOKEN*************************************
  private saveToken(idToken: string, expiresAt: string): void {
    this.userToken = idToken;
    localStorage.setItem('token', idToken);
    const today = new Date(expiresAt);
    localStorage.setItem('expires', today.getTime().toString());
  }
  // READTOKEN*************************************
  readToken() {
    if (localStorage.getItem('token')) {
      this.userToken = localStorage.getItem('token');
      return this.userToken;
    } else {
      this.userToken = '';
      return false;
    }
  }

}
