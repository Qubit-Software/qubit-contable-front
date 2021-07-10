import { Component, OnInit } from '@angular/core';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { InventarioService } from 'src/app/Services/inventario.service';
import { OrderService } from 'src/app/Services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario-new',
  templateUrl: './inventario-new.component.html',
  styleUrls: ['./inventario-new.component.css']
})
export class InventarioNewComponent implements OnInit {

  faPlus = faPlus;
  faSearch = faSearch;
  orderHeaders: object;
  columns: string[] = new Array();
  columnsKey: string[] = new Array();
  inventario;
  productsInventario = new Array();
  edit = -1;
  type = true;
  inventarioItemsSearch;
  editIcon = '../../../assets/images/iconos/edit-button.png';
  checkIcon = '../../../assets/images/iconos/checked.png';

  constructor(private inventarioService: InventarioService, private helpers: HelperFunctionsService, private order: OrderService) {
    inventarioService.headersInventario$.subscribe((newObject: object) => {
      this.orderHeaders = newObject['headers'];
    });
    order.inventarioItems$.subscribe((newObject: object) => {
      this.inventarioItemsSearch = newObject['items'];
      if (newObject['selectItem'] != null) {
        let index = this.productsInventario.length - 1;
        this.productsInventario[index] = JSON.parse(JSON.stringify(newObject['selectItem'][0]));
        this.productsInventario[index]['cantidad'] = 1;
        this.edit = index;
      }
    });
  }

  ngOnInit(): void {
    this.getHeaders();
    if (this.inventario == null) {
      this.inventario = new Array();
      this.getInventario();
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
  getHeaders() {
    if (this.orderHeaders == null) {
      if (this.helpers.validateIdEmpresa()) {
        let idSucursal = localStorage.getItem('sucursalId');
        this.inventarioService.getHeadersInventario(idSucursal).subscribe((res: any[]) => {
          let responseHeaders = res['headers']['headers'];
          this.orderHeaders = Object.keys(responseHeaders).sort().reduce(
            (obj, key) => {
              obj[key] = responseHeaders[key];
              return obj;
            },
            {}
          );
          let newValue = {
            'headers': this.orderHeaders,
            'headerPos': null
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
    this.productsInventario.push(itemNew);
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
        let index = this.productsInventario.length - 1;
        this.productsInventario[index] = JSON.parse(JSON.stringify(items[0]));
        this.productsInventario[index]['cantidad'] = 1;
        this.edit = index;
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
  addProduct(index) {
    let bool = true;
    for (var [key, value] of Object.entries(this.productsInventario[index])) {
      if (value == '' || value == null) {
        bool = false;
      }
    }
    if (bool) {
      this.edit = -1;
      this.newitemCompra();
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
  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("inventarioModal").style.display = "block"
    document.getElementById("inventarioModal").className += "show"
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
    this.productsInventario[index] = itemNew;
  }
  acept() {
    if (this.productsInventario.length == 1 || this.productsInventario == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese una orden',
        confirmButtonText: 'Ok',
      });
      return
    }
    let sum = 1;
    if (this.type) {
      sum = 1;
    } else {
      sum = -1
    }
    this.sumInventory(this.productsInventario, sum);
  }

  sumInventory(order, type) {
    let data = new Array()
    order.forEach(element => {
      if ("id" in element || element['id'] != null) {
        let newcantida = element['cantidad'] * type;
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
        this.productsInventario = new Array();
        this.newitemCompra();
        this.order.chargeItemsInventario(new Array())
        Swal.close();
        Swal.fire('Inventario actualizado',
          'El inventario se ha actualizado con exito',
          'success');
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
}
