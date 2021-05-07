import { Component, OnInit } from '@angular/core';
import { FacturasModel } from 'src/app/Models/Facturas';
import { PosService } from 'src/app/Services/pos.service';
import { SucursalService } from 'src/app/Services/sucursal.service';
import Swal from 'sweetalert2';
import { VentasService } from 'src/app/Services/ventas.service';
import { HelperFunctions } from 'src/app/helpers/functions';

@Component({
  selector: 'app-factura-table',
  templateUrl: './factura-table.component.html',
  styleUrls: ['./factura-table.component.css']
})
export class FacturaTableComponent implements OnInit {

  pressed = 1;
  period = 'Diario';
  allFacturas: FacturasModel[];
  facturas: FacturasModel[];
  currentDate = new Date();
  efectivo = 0;
  tarjeta = 0;
  otro = 0;
  iva = 0;
  total = 0;

  constructor(private venta: VentasService, private sucursal: SucursalService, private pos: PosService) { }

  ngOnInit(): void {
    this.currentDate.setHours(0, 0, 0, 0)
    if (this.sucursal.empresa == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        this.getVentas();
      });
    } else {
      this.getVentas();
    }

  }
  getVentas() {
    this.allFacturas = new Array();
    this.venta.getVentasBySucursal(this.sucursal.empresa.id).subscribe((res: any[]) => {
      res.forEach(element => {
        let factura = new FacturasModel();
        factura.id = element['id'];
        factura.idFactura = element['factura'];
        factura.fecha = new Date(element['fecha']);
        factura.fecha.setDate(factura.fecha.getDate() + 1);
        factura.fecha.setHours(0, 0, 0, 0)
        factura.metodo = element['tipo'];
        factura.iva = element['iva'];
        factura.total = element['preciototal'];
        this.allFacturas.push(factura);
      });
      this.day()
    })
  }
  print() {
    if (this.sucursal.empresa == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        this.enviaPos();
      });
    } else {
      this.enviaPos();
    }
  }
  enviaPos() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    let fecha = `${this.currentDate.getDate()}/${this.currentDate.getMonth() + 1}/${this.currentDate.getFullYear()}`;
    this.pos.posReport(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion,
      this.sucursal.sucursal.ciudad, this.period, fecha, HelperFunctions.formatter.format(this.efectivo),
      HelperFunctions.formatter.format(this.tarjeta), HelperFunctions.formatter.format(this.otro), HelperFunctions.formatter.format(this.iva), HelperFunctions.formatter.format(this.total)).subscribe(res => {
        Swal.close();
        Swal.fire('Ticket impreso',
          'El ticket se ha dispensado con exito',
          'success');
      }, (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encuentra la impresora conectada'
        });
        console.log(err);
      });
  }
  change(btn): void {
    this.pressed = btn;
    if (btn === 1) {
      this.day();
      this.period = 'Diario';
    } else {
      this.month();
      this.period = 'Mensual';
    }
  }
  day() {
    this.total = 0;
    this.iva = 0;
    this.efectivo = 0;
    this.otro = 0;
    this.tarjeta = 0;
    console.log(this.allFacturas);
    let items = this.allFacturas.filter(item => item.fecha.getTime() === this.currentDate.getTime());
    this.facturas = items;
    this.facturas.forEach(fatura => {
      if (fatura.metodo == "Efectivo") {
        this.efectivo = this.efectivo + (+fatura.total);
      }
      if (fatura.metodo == "Tarjeta") {
        this.tarjeta = this.tarjeta + (+fatura.total);
      }
      if (fatura.metodo == "Otro") {
        this.otro = this.otro + (+fatura.total);
      }
      this.iva = this.iva + (+fatura.iva);
      this.total = this.total + (+fatura.total)
    });

  }
  month() {
    this.total = 0;
    this.iva = 0;
    this.efectivo = 0;
    this.otro = 0;
    this.tarjeta = 0;
    var mes = new Date();
    mes.setHours(0, 0, 0, 0)
    mes.setMonth(mes.getMonth() - 1);
    let items = this.allFacturas.filter(item => item.fecha >= mes);
    this.facturas = items;
    this.facturas.forEach(fatura => {
      if (fatura.metodo == "Efectivo") {
        this.efectivo = this.efectivo + (+fatura.total);
      }
      if (fatura.metodo == "Tarjeta") {
        this.tarjeta = this.tarjeta + (+fatura.total);
      }
      if (fatura.metodo == "Otro") {
        this.otro = this.otro + (+fatura.total);
      }
      this.iva = this.iva + (+fatura.iva);
      this.total = this.total + (+fatura.total)
    });

  }
}
