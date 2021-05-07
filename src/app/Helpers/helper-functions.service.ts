import { Injectable } from '@angular/core';
import { SucursalService } from '../Services/sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class HelperFunctionsService {

  constructor() { }

  formatAMPM(date): string {
    const time = date.split(':');
    let hours = time[0];
    let minutes = time[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  formatAMPM1(date): string {
    const time = date.split(':');
    let hours = time[0];
    let minutes = time[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
  validateIdEmpresa(): boolean {
    var sucursal: SucursalService
    if (localStorage.getItem('empresaId') == null) {
      sucursal.getSucursalInfo().subscribe(res => {
        return true;
      });
    } else {
      return true;
    }
    return false;
  }
}
