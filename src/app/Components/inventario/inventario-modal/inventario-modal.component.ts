import { Component, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { InventarioService } from 'src/app/Services/inventario.service';
import { OrderService } from 'src/app/Services/order.service';

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

  constructor(private inventarioService: InventarioService, private order: OrderService) {
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
      this.inventarioService.getHeadersInventario(1).subscribe((res: any[]) => {
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
  addInventario(index) {
    let object = {
      'items': this.inventario,
      'selectItem': this.inventario[index]
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