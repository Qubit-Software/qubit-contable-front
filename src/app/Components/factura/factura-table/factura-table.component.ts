import { Component, OnInit } from '@angular/core';
import { FacturasModel } from 'src/app/Models/Facturas';
import { PosService } from 'src/app/Services/pos.service';
import { SucursalService } from 'src/app/Services/sucursal.service';
import Swal from 'sweetalert2';
import { VentasService } from 'src/app/Services/ventas.service';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { InventarioService } from 'src/app/Services/inventario.service';
import { GastosService } from 'src/app/Services/gastos.service';
import { GastosModel } from 'src/app/Models/Gastos';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { ExportToCsv } from 'export-to-csv';
import { ConsumidorModel } from 'src/app/Models/Consumidor';

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
  consumidor: ConsumidorModel[] = new Array()
  faDownload = faDownload;
  currentDate = new Date();
  efectivo = 0;
  tarjeta = 0;
  otro = 0;
  iva = 0;
  total = 0;
  gastos: GastosModel[] = new Array();
  headerPos: string = '';

  constructor(private venta: VentasService, private sucursal: SucursalService, private pos: PosService, private helpers: HelperFunctionsService,
    private inventarioService: InventarioService, private gastosServices: GastosService) {
  }

  ngOnInit(): void {
    this.currentDate.setHours(0, 0, 0, 0)
    if (this.sucursal.empresa == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        this.getVentas();
        this.getGastos();
      });
    } else {
      this.getVentas();
      this.getGastos();
    }
    this.getHeaders();
  }
  getHeaders() {
    if (this.helpers.validateIdEmpresa()) {
      let idSucursal = localStorage.getItem('sucursalId');
      this.inventarioService.getHeadersInventario(idSucursal).subscribe((res: any[]) => {
        this.headerPos = res['headers']['headerPos']
      }, err => {
        console.log(err);
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
  getNumber(text) {
    if (typeof text != 'number') {
      return +(text.replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
    } else {
      return text;
    }
  }
  getGastos() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    let fecha = `${this.currentDate.getMonth() + 1}/${this.currentDate.getDate()}/${this.currentDate.getFullYear()}`;
    this.gastosServices.getGastosByDate(this.sucursal.sucursal.id, this.sucursal.empresa.id, fecha).subscribe(res => {
      this.gastos = res['gastos'];
      Swal.close();
    }, (err) => {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Se ha presentado un error inesperado'
      });
    })
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
        this.consumidor[factura.id] = new ConsumidorModel();
        this.consumidor[factura.id].nombre = element['nombre'];
        this.consumidor[factura.id].correo = element['correo'];
        this.consumidor[factura.id].telefono = element['telefono'];
        this.consumidor[factura.id].cedula = element['cedula'];
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
    let gasto: object[];
    let totalGasto = 0;
    let totalDescuento = 0;
    if (this.period == 'Diario') {
      gasto = new Array()
      this.gastos.forEach(element => {
        totalGasto = totalGasto + (+element.valor);
        let gast = {
          'descripcion': element.descripcion,
          'valor': this.helpers.formatter.format(+element.valor)
        }
        gasto.push(gast);
      });
      totalDescuento = this.total - totalGasto
    } else {
      gasto = null;
    }
    if (gasto.length == 0) {
      gasto = null;
    }
    this.pos.posReport(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion,
      this.sucursal.sucursal.ciudad, this.period, fecha, this.helpers.formatter.format(this.efectivo),
      this.helpers.formatter.format(this.tarjeta), this.helpers.formatter.format(this.otro), this.helpers.formatter.format(this.iva), this.helpers.formatter.format(this.total),
      gasto, this.helpers.formatter.format(totalGasto), this.helpers.formatter.format(totalDescuento)).subscribe(res => {
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
  deleteVenta(index) {
    Swal.fire({
      title: '¿Desea eliminar el factura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor'
        });
        Swal.showLoading();
        if (this.helpers.validateIdEmpresa()) {
          let idEmpresa = localStorage.getItem('empresaId');
          let inventarioName = localStorage.getItem('inventario');
          this.venta.getInventarioVentasByVentas(this.facturas[index].id, idEmpresa).subscribe(res => {
            let data = new Array()
            res['inventario'].forEach(element => {
              let dataItem = {
                'id': element['inventarioId'],
                'newcantidad': element['cantidad']
              }
              data.push(dataItem);
            });
            this.inventarioService.lessInventory(inventarioName, data).subscribe(res => {
              this.venta.deleteOne(this.facturas[index].id, idEmpresa).subscribe(res => {
                Swal.close();
                Swal.fire('Factura eliminado', '', 'success');
                this.facturas.splice(index, 1);
              }, (err) => {
                Swal.close();
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Se ha presentado un error inesperado'
                });
                console.log(err);
              });
            }, (err) => {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Vuelve a intentarlo'
              });
              console.log(err);
            });
          })
        } else {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha presentado un error inesperado'
          });
        }
      }
    })
  }
  printCopy(id) {
    if (this.helpers.validateIdEmpresa()) {
      let empresaId = localStorage.getItem('empresaId');
      this.venta.getInfoVentasById(id, empresaId).subscribe((res) => {
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor'
        });
        Swal.showLoading();
        let factura = res['venta'][0].factura;
        const date = new Date(res['venta'][0].fecha);
        let fecha = `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let products: object[] = new Array();
        res['inventario'].forEach(element => {
          if ("id" in element || element['id'] != null) {
            let splitHeaders = this.headerPos.split(',');
            let tempNom = '';
            splitHeaders.forEach(el => {
              tempNom = tempNom + element[el] + ' ';
              return tempNom
            });
            let prod = {
              'nombre': tempNom,
              'cantidad': String(element['cantidad']),
              'precio': this.helpers.formatter.format((this.getNumber(element['precio'])) * element['cantidad'])
            };
            products.push(prod);
          }
        });
        let iva = res['venta'][0].iva;
        let total = res['venta'][0].preciototal;
        let subtotal = total - iva;
        let consumidor = res['consumidor']['nombre']
        this.pos.posVenta(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
          factura, fecha, products, this.helpers.formatter.format(subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(0), this.helpers.formatter.format(total),
          this.helpers.formatter.format(0), this.helpers.formatter.format(0), factura, consumidor).subscribe(res => {
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
      }, (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Se ha presentado un error inesperado'
        });
        console.log(err);
      });
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
  downloadFile() {
    const date = new Date();
    let fecha = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    var data: Object[] = new Array();
    this.facturas.forEach(factura => {
      let fec = new Date(factura.fecha)
      let fecha = `${fec.getDate()}-${fec.getMonth() + 1}-${fec.getFullYear()}`;
      let obj = {
        'Factura': factura.idFactura,
        'Total venta': factura.total,
        'Iva': factura.iva,
        'Fecha': fecha,
        'Cliente': this.consumidor[factura.id].nombre,
        'Cedula': this.consumidor[factura.id].cedula,
        'Telefono': this.consumidor[factura.id].telefono
      }
      data.push(obj);
    })
    if (data == null || data.length == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No existen ventas para generar reporte'
      });
      return
    }
    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      filename: `Reporte ${fecha}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    };
    console.log(data);
    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(data);
  }
}
