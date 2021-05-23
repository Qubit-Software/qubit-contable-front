import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { SaldoModel } from 'src/app/Models/Saldos';
import { InventarioService } from 'src/app/Services/inventario.service';
import { PosService } from 'src/app/Services/pos.service';
import { SaldosApartadosService } from 'src/app/Services/saldos-apartados.service';
import { SucursalService } from 'src/app/Services/sucursal.service';
import { VentasService } from 'src/app/Services/ventas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-saldo-abono',
  templateUrl: './saldo-abono.component.html',
  styleUrls: ['./saldo-abono.component.css']
})
export class SaldoAbonoComponent implements OnInit {

  //Porcentaje del iva
  ivaPercent = 0.19;

  columns: string[] = new Array();
  columnsKey: string[] = new Array();
  orderHeaders: object;
  comentario: string = '';
  recibeInput: string = "0";
  cambioCalcule: number = 0;
  descuento: number = 0;
  iva: number = 0;
  saldo: SaldoModel = new SaldoModel()
  abono: number = 0;
  inventario;
  pago = false;
  seleccionado: string;
  headerPos: string = '';

  constructor(private inventarioService: InventarioService, private sucursal: SucursalService, private helpers: HelperFunctionsService, private pos: PosService,
    private saldos: SaldosApartadosService, private router: Router, private route: ActivatedRoute, private ventas: VentasService) {
    inventarioService.headersInventario$.subscribe((newObject: object) => {
      this.orderHeaders = newObject['headers'];
      this.headerPos = newObject['headerPos'];
    });
  }

  ngOnInit(): void {
    this.getHeaders();
    let idSaldo = 0;
    if (history.state.idSaldo != null) {
      idSaldo = history.state.idSaldo;
    }
    this.getSaldo(idSaldo);
  }
  ngAfterViewChecked() {
    jQuery(".recibeInput").on({
      "focus": function (event) {
        $(event.target).select();
      },
      "keyup": function (event) {
        $(event.target).val(function (index, value) {
          return "$" + value.replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".");
        });
      }
    });
  }
  getSaldo(id) {
    if (this.helpers.validateIdEmpresa()) {
      let idEmpresa = localStorage.getItem('empresaId');
      if (id != 0) {
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor'
        });
        Swal.showLoading();
        this.saldos.getSaldoById(id, idEmpresa).subscribe(res => {
          this.inventario = res['inventario'];
          this.inventario.forEach(element => {
            if (element['precio'] != '') {
              if (typeof element['precio'] == 'number') {
                element['precio'] = this.helpers.formatter.format(element['precio']);
              }
            }
            res['cantidades'].forEach(cantidad => {
              if (element['id'] == cantidad['inventarioId']) {
                element['cantidad'] = cantidad['cantidad'];
                let precio = this.getNumber(element['precio']);
                let iva = precio * this.ivaPercent;
                element['iva'] = this.transformNumber(iva);
                element['pbase'] = this.transformNumber(precio - iva);
              }
            });
          });
          this.saldo.id = res['saldo']['id'];
          this.saldo.tipo = res['saldo']['tipo'];
          this.saldo.cliente = res['saldo']['consumidore']['nombre'];
          this.saldo.clienteId = res['saldo']['consumidoreId'];
          this.comentario = res['saldo']['comentario'];
          this.saldo.abono = (+res['saldo']['total']) - (+res['saldo']['saldo']);
          this.saldo.total = (+res['saldo']['total']);
          this.saldo.saldo = (+res['saldo']['saldo']);;
          this.calculaValores();
          Swal.close();
        }, (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Vuelve a intentarlo'
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
        this.closeModal();
      }
    } else {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Se ha presentado un error inesperado'
      });
    }
  }
  transformData() {
    this.inventario.forEach(element => {
      if (element['precio'] != '') {
        if (typeof element['precio'] == 'number') {
          element['precio'] = this.helpers.formatter.format(element['precio']);
        }
      }
    });
  }
  transformNumber(number) {
    if (typeof number == 'number') {
      return this.helpers.formatter.format(number);
    } else {
      return number;
    }
  }
  getNumber(text) {
    if (typeof text != 'number') {
      return +(text.replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
    } else {
      return text;
    }
  }
  getHeaders() {
    if (this.orderHeaders == null) {
      if (this.helpers.validateIdEmpresa()) {
        let idSucursal = localStorage.getItem('sucursalId');
        this.inventarioService.getHeadersInventario(idSucursal).subscribe((res: any[]) => {
          let responseHeaders = res['headers']['headers'];
          this.headerPos = res['headers']['headerPos'];
          this.orderHeaders = Object.keys(responseHeaders).sort().reduce(
            (obj, key) => {
              obj[key] = responseHeaders[key];
              return obj;
            },
            {}
          );
          let newValue = {
            'headers': this.orderHeaders,
            'headerPos': this.headerPos
          }
          this.inventarioService.getHeaders(newValue);
          this.getColumns();
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
    } else {
      this.getColumns();
    }
  }
  async getColumns() {
    this.columns = Object.keys(this.orderHeaders).map(key => this.orderHeaders[key]);
    this.columnsKey = await Object.keys(this.orderHeaders).map(key => {
      let split = key.split("-");
      return split[1];
    });
  }
  calculaCambio() {
    let numberRecibe: number;
    numberRecibe = this.getNumber(this.recibeInput);
    this.cambioCalcule = numberRecibe - this.getNumber(this.abono);
  }
  calculaValores() {
    if (this.inventario.length != 0) {
      this.iva = 0;
      this.saldo.saldo = this.saldo.total - this.saldo.abono;
      this.inventario.forEach(element => {
        this.iva = this.iva + (this.getNumber(element['iva']) * element['cantidad'])
      });
      this.saldo.saldo = this.saldo.saldo - (this.getNumber(this.abono));
      if (this.saldo.saldo <= 0) {
        this.pago = true;
      } else {
        this.pago = false
      }
    }
  }
  validateInfo() {
    if (this.abono == 0 || this.abono == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese el abono',
        confirmButtonText: 'Ok',
      });
      return
    }
    if (this.seleccionado == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese la forma de pago',
        confirmButtonText: 'Ok',
      });
      return
    }
    if (this.sucursal.empresa == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        if (this.pago) {
          this.payOrder();
        } else {
          this.payApartado();
        }
      });
    } else {
      if (this.pago) {
        this.payOrder();
      } else {
        this.payApartado();
      }
    }
  }
  payOrder() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    this.ventas.getFactura(this.sucursal.empresa.id, this.sucursal.sucursal.id).subscribe(res => {
      let factura = res['factura'];
      factura = factura + 1;
      const date = new Date();
      let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      let fecha1 = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      let productArray: object[] = new Array();
      this.inventario.forEach(element => {
        if ("id" in element || element['id'] != null) {
          let products = {
            "cantidad": element['cantidad'],
            "inventarioId": element['id']
          };
          productArray.push(products);
        }
      });
      let products: object[] = new Array();
      this.inventario.forEach(element => {
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
      let iva = this.getNumber(this.iva);
      let descuento = this.getNumber(this.descuento);
      let recibe = this.getNumber(this.recibeInput);
      let subtotal = this.getNumber(this.saldo.total) - iva;
      this.pos.posVenta(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
        factura, fecha, products, this.helpers.formatter.format(subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(descuento), this.helpers.formatter.format(this.saldo.total),
        this.helpers.formatter.format(recibe), this.helpers.formatter.format(this.cambioCalcule), factura, this.saldo.cliente).subscribe(res => {
          this.ventas.createVenta(this.sucursal.empresa.id, this.saldo.total, this.iva, fecha1, this.seleccionado, this.comentario, this.sucursal.sucursal.id,
            this.saldo.clienteId, productArray).subscribe(res => {
              this.saldos.deleteOne(this.saldo.id).subscribe(res => {
                this.closeModal();
                Swal.close();
                Swal.fire('Ticket impreso',
                  'El ticket se ha dispensado con exito',
                  'success');
              }, (err) => {
                Swal.close();
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Vuelve a intentarlo'
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
        }, (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encuentra la impresora conectada'
          });
          console.log(err);
        });
    })
  }
  payApartado() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    const date = new Date();
    let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    let fecha1 = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    let products: object[] = new Array();
    this.inventario.forEach(element => {
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
    let iva = this.getNumber(this.iva);
    let descuento = this.getNumber(this.descuento);
    let recibe = this.getNumber(this.recibeInput);
    let abono = this.getNumber(this.abono);
    let saldo = this.getNumber(this.saldo.saldo)
    let subtotal = this.getNumber(this.saldo.total) - iva;
    this.pos.posSaldo(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
      this.saldo.tipo, fecha, products, this.helpers.formatter.format(subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(descuento), this.helpers.formatter.format(this.saldo.total),
      this.helpers.formatter.format(abono), this.helpers.formatter.format(saldo), this.helpers.formatter.format(recibe), this.helpers.formatter.format(this.cambioCalcule), this.saldo.cliente).subscribe(res => {
        this.saldos.createAbono(this.saldo.id, fecha1, abono, this.seleccionado, this.saldo.saldo).subscribe(res => {
          this.closeModal();
          Swal.close();
          Swal.fire('Ticket impreso',
            'El ticket se ha dispensado con exito',
            'success');
        }, (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Vuelve a intentarlo'
          });
          console.log(err);
        });
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
  closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("inventarioModal").style.display = "none"
    document.getElementById("inventarioModal").className += document.getElementById("inventarioModal").className.replace("show", "")
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
