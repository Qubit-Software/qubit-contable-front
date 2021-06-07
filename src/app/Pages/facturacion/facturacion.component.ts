import { Component, OnInit } from '@angular/core';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { VentasService } from 'src/app/Services/ventas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  templateParent = true;
  typeFacturacion: string[] = new Array();
  factura: number;
  constructor(private helpers: HelperFunctionsService, private ventas: VentasService) {
  }

  ngOnInit(): void {
    if (this.helpers.validateIdEmpresa()) {
      let idSucursal = localStorage.getItem('sucursalId');
      let idEmpresa = localStorage.getItem('empresaId');
      this.ventas.getFactura(idEmpresa, idSucursal).subscribe(res => {
        this.factura = res['factura'] + 1;
        this.getTypes();
      })
    } else {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Se ha presentado un error inesperado'
      });
      return null
    }
  }
  getTypes() {
    this.typeFacturacion[0] = `Factura de venta ${this.factura}`;
    this.typeFacturacion[1] = 'Apartado';
    this.typeFacturacion[2] = 'Credito';
  }
  change(i) {
    [this.typeFacturacion[0], this.typeFacturacion[i]] = [this.typeFacturacion[i], this.typeFacturacion[0]];

  }
}
