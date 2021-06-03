import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { InventarioService } from 'src/app/Services/inventario.service';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import * as jQuery from 'jquery';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { element } from 'protractor';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  columns: string[] = new Array();
  columnsKey: string[] = new Array();
  orderHeaders: object;
  posAdd = false;
  form: FormGroup;
  faPlus = faPlus;
  searchText: string;
  inventario;
  oldInventory = new Array();
  newInventario: { [k: string]: any } = {};
  page: number = 1;
  edit: number = -1;
  editIcon = '../../../../assets/images/iconos/edit-button.png';
  checkIcon = '../../../../assets/images/iconos/checked.png';
  searchHeader: object[] = new Array()

  constructor(private inventarioService: InventarioService, private fb: FormBuilder, private helpers: HelperFunctionsService) {
    inventarioService.headersInventario$.subscribe((newObject: object) => {
      this.orderHeaders = newObject['headers'];
    });
    inventarioService.inventario$.subscribe((newInventario: object[]) => {
      this.inventario = newInventario;
    });
  }

  ngOnInit(): void {
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
    this.llenaNewInventario(this.columnsKey);
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
  llenaNewInventario(columnsKeys: any[]) {
    columnsKeys.forEach(element => {
      this.newInventario[`${element}`] = '';
    });
  }
  sortBy(colName: string) {
    this.inventario.sort((a, b) => a[colName] > b[colName] ? 1 : a[colName] < b[colName] ? -1 : 0);
  }
  getNumber(text) {
    if (typeof text != 'number') {
      return +(text.replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
    } else {
      return text;
    }
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
        this.sortBy(this.columnsKey[2]);
        this.inventarioService.chargeInventario(this.inventario);
        this.inventario.unshift(this.newInventario);
        Swal.close();
        this.transformData();
        this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
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
  change(i: number) {
    [this.searchHeader[0], this.searchHeader[i]] = [this.searchHeader[i], this.searchHeader[0]];
  }
  disabledEdit(index) {
    this.edit = index;
  }
  CreateInventario(index) {
    if (!this.posAdd) {
      this.posAdd = !this.posAdd;
      this.edit = index;
    } else {
      this.createForm(this.inventario[index]);
      if (this.form.invalid) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor verifica los datos',
          showCancelButton: true,
          confirmButtonText: 'Ok',
          cancelButtonText: 'Cerrar edición',
        }).then((result) => {
          if (result.isConfirmed) {

          } else if (result.dismiss) {
            this.llenaNewInventario(this.columnsKey);
            this.inventario = this.oldInventory;
            this.edit = -1;
            this.posAdd = false;
          }
        })
        return;
      }
      if (this.helpers.validateIdEmpresa()) {
        let inventarioName = localStorage.getItem('inventario');
        Swal.fire({
          title: '¿Desea guardar los cambios?',
          icon: 'warning',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Guardar`,
          denyButtonText: `No guardar`,
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              allowOutsideClick: false,
              icon: 'info',
              text: 'Espere por favor'
            });
            Swal.showLoading();
            this.inventario[index]['precio'] = +(this.inventario[index]['precio'].replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
            this.inventarioService.createInventario(this.columnsKey, inventarioName, this.inventario[index]).subscribe(res => {
              Swal.close();
              Swal.fire('Inventario actualizado', '', 'success');
              this.llenaNewInventario(this.columnsKey);
              this.getInventario();
              this.edit = -1;
              this.posAdd = false;
            }, (err) => {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Se ha presentado un error inesperado'
              });
              this.llenaNewInventario(this.columnsKey);
              this.inventario = this.oldInventory;
              this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
              this.edit = -1;
              console.log(err);
            });
          } else if (result.isDenied) {
            this.inventario = this.oldInventory;
            this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
            this.edit = -1;
          }
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
  updateInventario(id) {
    let index = this.inventario.findIndex(element => element['id'] == id);
    console.log(index);
    this.createForm(this.inventario[index]);
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor verifica los datos',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cerrar edición',
      }).then((result) => {
        if (result.isConfirmed) {

        } else if (result.dismiss) {
          this.inventario = this.oldInventory;
          this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
          this.edit = -1;
        }
      })
      return;
    }
    Swal.fire({
      title: '¿Desea guardar los cambios?',
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Guardar`,
      denyButtonText: `No guardar`,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.helpers.validateIdEmpresa()) {
          let inventarioName = localStorage.getItem('inventario');
          Swal.fire({
            allowOutsideClick: false,
            icon: 'info',
            text: 'Espere por favor'
          });
          Swal.showLoading();
          this.inventario[index]['precio'] = this.getNumber(this.inventario[index]['precio']);
          this.inventarioService.updateInventario(this.inventario[index]['id'], this.columnsKey, inventarioName, this.inventario[index]).subscribe(res => {
            Swal.close();
            Swal.fire('Inventario actualizado', '', 'success');
            this.inventarioService.chargeInventario(this.inventario);
            this.transformData();
            this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
            this.edit = -1;
          }, (err) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Se ha presentado un error inesperado'
            });
            console.log(err);
          });
          this.edit = -1;
        } else {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha presentado un error inesperado'
          });
          this.edit = -1;
          return null
        }
      } else if (result.isDenied) {
        this.inventario = this.oldInventory;
        this.oldInventory = JSON.parse(JSON.stringify(this.inventario));
        this.edit = -1;
      }
    })
  }
  createForm(inventario: Object) {
    this.form = this.fb.group({});
    Object.keys(inventario).map((key) => {
      this.form.addControl(key, new FormControl(inventario[key], Validators.required));
    });
  }
  deleteInventario(id) {
    Swal.fire({
      title: '¿Desea eliminar el inventario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.helpers.validateIdEmpresa()) {
          let inventarioName = localStorage.getItem('inventario');
          Swal.fire({
            allowOutsideClick: false,
            icon: 'info',
            text: 'Espere por favor'
          });
          Swal.showLoading();
          this.inventarioService.deleteOne(inventarioName, id).subscribe(res => {
            Swal.close();
            Swal.fire('Inventario eliminado', '', 'success');
            let index = this.inventario.findIndex(element => element['id'] == id);
            this.inventario.splice(index, 1);
            this.searchText = '';
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
    })
  }
}
