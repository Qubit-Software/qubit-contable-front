import { Component, OnInit } from '@angular/core';
import { SucursalService } from 'src/app/Services/sucursal.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent implements OnInit {

  nameSucursal: string;
  constructor(private sucursal: SucursalService) { }

  ngOnInit(): void {
    this.getInfo()
  }
  getInfo() {
    if (this.sucursal.sucursal == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        this.nameSucursal = this.sucursal.sucursal.nombre;
      });
    } else {
      this.nameSucursal = this.sucursal.sucursal.nombre;
    }
  }

}
