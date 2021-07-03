import { Component, OnInit, Input } from '@angular/core';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { InventarioService } from 'src/app/Services/inventario.service';
import Swal from 'sweetalert2';
import * as jQuery from 'jquery';
import { OrderService } from 'src/app/Services/order.service';
import { ConsumidorModel } from 'src/app/Models/Consumidor';
import { SucursalService } from 'src/app/Services/sucursal.service';
import { VentasService } from 'src/app/Services/ventas.service';
import { PosService } from 'src/app/Services/pos.service';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { SaldosApartadosService } from 'src/app/Services/saldos-apartados.service';

@Component({
  selector: 'app-factura-producto',
  templateUrl: './factura-producto.component.html',
  styleUrls: ['./factura-producto.component.css']
})
export class FacturaProductoComponent implements OnInit {
  @Input() typeFacturacion: string = '';

  //Porcentaje del iva
  ivaPercent = 0.19;
  ivaPercent1 = 1.19;

  columns: string[] = new Array();
  columnsKey: string[] = new Array();
  orderHeaders: object;
  inventario;
  inventarioItemsSearch;
  seleccionado: string;
  seleccionado2: string;
  methodSecond: boolean = false;
  faPlus = faPlus;
  faSearch = faSearch;
  productsCompra = new Array();
  tempStock: Map<number, object[]> = new Map();
  selectedItem: string = '';
  editIcon = '../../../assets/images/iconos/edit-button.png';
  checkIcon = '../../../assets/images/iconos/checked.png';
  edit = -1;
  consumidor: ConsumidorModel;
  comentario: string = '';
  recibeInput: string = "0";
  cambioCalcule: number = 0;
  subtotal: number = 0;
  totalVenta: number = 0;
  descuento: number = 0;
  iva: number = 0;
  total: number = 0;
  saldo: number = 0;
  abono: number = 0;
  pago1: number = 0;
  pago2: number = 0;

  headerPos: string = '';

  constructor(private inventarioService: InventarioService, private order: OrderService, private sucursal: SucursalService,
    private ventas: VentasService, private pos: PosService, private helpers: HelperFunctionsService, private saldos: SaldosApartadosService) {
    inventarioService.headersInventario$.subscribe((newObject: object) => {
      this.orderHeaders = newObject['headers'];
      this.headerPos = newObject['headerPos'];
    });
    order.inventarioItems$.subscribe((newObject: object) => {
      this.inventarioItemsSearch = newObject['items'];
      if (newObject['selectItem'] != null) {
        let validate = this.validateStock(newObject['selectItem']['cantidad'], 0);
        if (validate) {
          this.tempStock[newObject['selectItem']['id']] = newObject['selectItem']['cantidad'];
          let index = this.productsCompra.length - 1;
          this.productsCompra[index] = JSON.parse(JSON.stringify(newObject['selectItem'][0]));
          this.productsCompra[index]['cantidad'] = 1;
          this.edit = index;
          this.calculaVal(index);
          this.calculaValores();
        }
      }
    });
    order.consumidor$.subscribe((newConsumidor: ConsumidorModel) => {
      this.consumidor = newConsumidor;
    });
  }

  ngOnInit(): void {
    this.productsCompra;
    this.getHeaders();
    if (this.inventario == null) {
      this.inventario = new Array();
      this.getInventario();
    }
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
    this.newitemCompra();
  }
  newitemCompra() {
    let itemNew = {};
    this.columnsKey.forEach(element => {
      itemNew[`${element}`] = '';
    });
    itemNew['pbase'] = '0';
    itemNew['iva'] = '0';
    this.productsCompra.push(itemNew);
  }
  getInventario() {
    if (this.helpers.validateIdEmpresa()) {
      let inventarioName = localStorage.getItem('inventario');
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor'
      });
      Swal.showLoading();
      this.inventarioService.getAllInventario(inventarioName).subscribe((res: any[]) => {
        this.inventario = res['inventario'];
        Swal.close();
        this.transformData();
      }, err => {
        this.inventario = new Array();
        Swal.close();
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
  selectProduct(text, col) {
    jQuery('input').blur();
    if (col != 'cantidad' || col != 'precio') {
      let value = text.target.value;
      const items = this.inventario.filter(item => item[col] == value);
      if (items.length == 1) {
        let validate = this.validateStock(items[0]['cantidad'], 0);
        if (validate) {
          this.tempStock[items[0]['id']] = items[0]['cantidad'];
          let index = this.productsCompra.length - 1;
          this.productsCompra[index] = JSON.parse(JSON.stringify(items[0]));
          this.productsCompra[index]['cantidad'] = 1;
          this.edit = index;
          this.calculaVal(index);
          this.calculaValores();
        }
      } else {
        this.openModal();
        this.inventarioItemsSearch = items;
        let object = {
          'items': items,
          'selectItem': null
        }
        this.order.chargeItemsInventario(object);
      }
    }
  }
  validateStock(stock, less): boolean {
    let diferencia = stock - less;
    if (diferencia < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay inventario disponible',
        confirmButtonText: 'Ok',
      });
      return false
    } else {
      return true
    }
  }
  calculaVal(index) {
    let cantidad = this.productsCompra[index]['cantidad'];
    let precio = cantidad * this.getNumber(this.productsCompra[index]['precio']);
    let iva = (precio/this.ivaPercent1) * this.ivaPercent;
    this.productsCompra[index]['iva'] = this.transformNumber(iva);
    this.productsCompra[index]['pbase'] = this.transformNumber(precio - iva);
  }
  calculaCambio() {
    let numberRecibe: number;
    numberRecibe = this.getNumber(this.recibeInput);
    if (this.getType()) {
      this.cambioCalcule = numberRecibe - this.total;
    } else {
      this.cambioCalcule = numberRecibe - this.getNumber(this.abono);
    }
  }
  calculaValores() {
    if (this.productsCompra.length != 0) {
      this.subtotal = 0;
      this.iva = 0;
      this.total = 0;
      this.saldo = 0;
      this.productsCompra.forEach(element => {
        let validate = this.validateStock(this.tempStock[element['id']], element['cantidad'] - 1)
        if (validate) {
          this.iva = this.iva + (this.getNumber(element['iva']) * element['cantidad'])
          this.subtotal = this.subtotal + (this.getNumber(element['pbase']) * element['cantidad']);
          this.total = this.total + (this.getNumber(element['precio']) * element['cantidad']);
          this.saldo = this.saldo + (this.getNumber(element['precio']) * element['cantidad']);
        }
        else {
          element['cantidad'] = 1;
          this.iva = this.iva + (this.getNumber(element['iva']) * element['cantidad'])
          this.subtotal = this.subtotal + (this.getNumber(element['pbase']) * element['cantidad']);
          this.total = this.total + (this.getNumber(element['precio']) * element['cantidad']);
          this.saldo = this.saldo + (this.getNumber(element['precio']) * element['cantidad']);
        }
      });
      this.totalVenta = this.subtotal - (this.getNumber(this.descuento));
      this.saldo = this.saldo - (this.getNumber(this.descuento)) - (this.getNumber(this.abono));
      this.total = this.total - (this.getNumber(this.descuento));
      this.saldo = this.total - (this.getNumber(this.abono));
      this.cambioCalcule = this.total;
    }
  }
  searchInventario() {
    if (this.inventarioItemsSearch == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay caracteristica de busqueda',
        confirmButtonText: 'Ok',
      });
      return
    }
    if (this.inventarioItemsSearch.length != 0) {
      this.openModal();
      let object = {
        'items': this.inventarioItemsSearch,
        'selectItem': null
      }
      this.order.chargeItemsInventario(object);
    }
  }
  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("inventarioModal").style.display = "block"
    document.getElementById("inventarioModal").className += "show"
  }
  addProduct(index) {
    let bool = true;
    for (var [key, value] of Object.entries(this.productsCompra[index])) {
      if (value == '' || value == null) {
        bool = false;
      }
    }
    if (bool) {
      this.edit = -1;
      this.newitemCompra();
      this.calculaValores();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay inventario registrado',
        confirmButtonText: 'Ok',
      });
      return
    }
  }
  editCompra(index) {
    if (this.edit == -1) {
      this.edit = index;
    } else {
      this.edit = -1;
    }
  }
  clearProduct(index) {
    let itemNew = {};
    this.columnsKey.forEach(element => {
      itemNew[`${element}`] = '';
    });
    itemNew['pbase'] = '0';
    itemNew['iva'] = '0';
    this.productsCompra[index] = itemNew;
    this.calculaValores();
  }
  deleteProduct(element) {
    Swal.fire({
      title: '¿Desea eliminar el producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsCompra.splice(element, 1);
        this.calculaValores();
      }
    });
  }
  validateInfo() {
    if (this.consumidor.id == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese el cliente',
        confirmButtonText: 'Ok',
      });
      return
    }
    if (this.productsCompra.length == 1 || this.productsCompra == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese una orden',
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
        if (this.getType()) {
          this.payOrder();
        } else {
          this.payApartado();
        }
      });
    } else {
      if (this.getType()) {
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
      this.productsCompra.forEach(element => {
        if ("id" in element || element['id'] != null) {
          let products = {
            "cantidad": element['cantidad'],
            "inventarioId": element['id']
          };
          productArray.push(products);
        }
      });
      let products: object[] = new Array();
      this.productsCompra.forEach(element => {
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
      this.pos.posVenta(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
        factura, fecha, products, this.helpers.formatter.format(this.subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(descuento), this.helpers.formatter.format(this.total),
        this.helpers.formatter.format(recibe), this.helpers.formatter.format(this.cambioCalcule), factura, this.consumidor.nombre).subscribe(res => {
          this.ventas.createVenta(this.sucursal.empresa.id, this.total, this.iva, fecha1, this.seleccionado, this.comentario, this.sucursal.sucursal.id,
            this.consumidor.id, productArray).subscribe(res => {
              let tempOrder = JSON.parse(JSON.stringify(this.productsCompra));
              this.order.UpdateConsumidor(new ConsumidorModel());
              this.productsCompra = new Array();
              this.newitemCompra();
              this.order.chargeItemsInventario(new Array())
              this.recibeInput = '';
              this.cambioCalcule = 0;
              this.descuento = 0;
              this.comentario = '';
              this.calculaValores();
              Swal.close();
              Swal.fire('Ticket impreso',
                'El ticket se ha dispensado con exito',
                'success');
              this.lessInventory(tempOrder);
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
    let productArray: object[] = new Array();
    this.productsCompra.forEach(element => {
      if ("id" in element || element['id'] != null) {
        let products = {
          "cantidad": element['cantidad'],
          "inventarioId": element['id']
        };
        productArray.push(products);
      }
    });
    let products: object[] = new Array();
    this.productsCompra.forEach(element => {
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
    let saldo = this.getNumber(this.saldo)
    this.pos.posSaldo(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
      this.typeFacturacion, fecha, products, this.helpers.formatter.format(this.subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(descuento), this.helpers.formatter.format(this.total),
      this.helpers.formatter.format(abono), this.helpers.formatter.format(saldo), this.helpers.formatter.format(recibe), this.helpers.formatter.format(this.cambioCalcule), this.consumidor.nombre).subscribe(res => {
        this.saldos.createSaldoApartado(this.sucursal.empresa.id, this.typeFacturacion, this.total, this.saldo, false, fecha1, this.comentario, this.sucursal.sucursal.id,
          this.consumidor.id, abono, this.seleccionado, productArray).subscribe(res => {
            let tempOrder = JSON.parse(JSON.stringify(this.productsCompra));
            this.order.UpdateConsumidor(new ConsumidorModel());
            this.productsCompra = new Array();
            this.newitemCompra();
            this.order.chargeItemsInventario(new Array())
            this.recibeInput = '';
            this.cambioCalcule = 0;
            this.descuento = 0;
            this.comentario = '';
            this.calculaValores();
            Swal.close();
            Swal.fire('Ticket impreso',
              'El ticket se ha dispensado con exito',
              'success');
            this.lessInventory(tempOrder);
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
  lessInventory(order) {
    let data = new Array()
    order.forEach(element => {
      if ("id" in element || element['id'] != null) {
        let newcantida = -element['cantidad'];
        let dataItem = {
          'id': element['id'],
          'newcantidad': newcantida
        }
        data.push(dataItem);
      }
    });
    if (this.helpers.validateIdEmpresa()) {
      let inventarioName = localStorage.getItem('inventario');
      this.inventarioService.lessInventory(inventarioName, data).subscribe(res => {

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

  getType() {
    if (this.typeFacturacion != null) {
      if (this.typeFacturacion.includes('Factura')) {
        return true;
      } else {
        return false;
      }
    }
  }
}
