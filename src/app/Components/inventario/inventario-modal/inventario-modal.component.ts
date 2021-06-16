import { Component, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { InventarioService } from 'src/app/Services/inventario.service';
import { OrderService } from 'src/app/Services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario-modal',
  templateUrl: './inventario-modal.component.html',
  styleUrls: ['./inventario-modal.component.css']
})
export class InventarioModalComponent implements OnInit {

  columns: string[] = new Array();
  columnsKey: string[] = new Array();
  orderHeaders: object;
  inventario;
  faPlus = faPlus;
  page: number = 1;
  searchText: string;
  searchHeader: object[] = new Array();

  constructor(private inventarioService: InventarioService, private order: OrderService,private helpers: HelperFunctionsService) {
    order.inventarioItems$.subscribe((newObject: object) => {
      this.inventario = newObject['items'];
    });
    inventarioService.headersInventario$.subscribe((newObject: object) => {
      this.orderHeaders = newObject['headers'];
    });
  }

  ngOnInit(): void {
    this.getHeaders();
  }
  getHeaders() {
    if (this.orderHeaders == null) {
      if (this.helpers.validateIdEmpresa()) {
        let idSucursal = localStorage.getItem('sucursalId');
        this.inventarioService.getHeadersInventario(idSucursal).subscribe((res: any[]) => {
          let responseHeaders = res['headers']['headers']
          this.orderHeaders = Object.keys(responseHeaders).sort().reduce(
            (obj, key) => {
              obj[key] = responseHeaders[key];
              return obj;
            },
            {}
          );
          let newValue = {
            'headers': this.orderHeaders,
            'headerPos': res['headers']['headerPos']
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
    this.getSearchHeaders();
  }
  async getSearchHeaders() {
    await Object.keys(this.orderHeaders).map(key => {
      let split = key.split("-");
      if (split[1] !== 'precio' && split[1] !== 'cantidad') {
        let search = {
          'id': split[1],
          'nombre': this.orderHeaders[key]
        }
        this.searchHeader.push(search);
      }
    });
  }
  change(i: number) {
    [this.searchHeader[0], this.searchHeader[i]] = [this.searchHeader[i], this.searchHeader[0]];
  }
  addInventario(id) {
    let object = {
      'items': this.inventario,
      'selectItem': this.inventario.filter(item => item['id'] == id)
    }
    this.searchText = '';
    this.order.chargeItemsInventario(object);
    this.closeModal();
  }
  closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("inventarioModal").style.display = "none"
    document.getElementById("inventarioModal").className += document.getElementById("inventarioModal").className.replace("show", "")
  }

}
