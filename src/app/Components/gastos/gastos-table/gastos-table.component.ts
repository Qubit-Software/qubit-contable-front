import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { GastosModel } from 'src/app/Models/Gastos';
import { GastosService } from 'src/app/Services/gastos.service';
import Swal from 'sweetalert2';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-gastos-table',
  templateUrl: './gastos-table.component.html',
  styleUrls: ['./gastos-table.component.css']
})
export class GastosTableComponent implements OnInit {

  page: number = 1;
  edit: number = -1;
  posAdd = false;
  gastos: GastosModel[] = new Array();
  form: FormGroup;
  faPlus = faPlus;
  editIcon = '../../../../assets/images/iconos/edit-button.png';
  checkIcon = '../../../../assets/images/iconos/checked.png';

  constructor(private gastoService: GastosService, private helpers: HelperFunctionsService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getGastos();
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
    this.gastos.forEach(element => {
      if (element.valor != '') {
        if (typeof element.valor == 'number') {
          element.valor = this.helpers.formatter.format(element.valor);
        }
      }
    });
  }
  getNumber(text) {
    if (typeof text != 'number') {
      return +(text.replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
    } else {
      return text;
    }
  }
  getGastos() {
    if (this.helpers.validateIdEmpresa()) {
      let idSucursal = localStorage.getItem('sucursalId');
      let idEmpresa = localStorage.getItem('empresaId');
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor'
      });
      Swal.showLoading();
      this.gastoService.getGastos(idSucursal, idEmpresa).subscribe(res => {
        this.gastos = res['gastos'];
        this.gastos.unshift(new GastosModel());
        this.gastos[0].fecha = new Date();
        this.transformData();
        Swal.close();
      }, (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Se ha presentado un error inesperado'
        });
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
  disabledEdit(index) {
    this.edit = index;
  }
  createForm(gasto: GastosModel) {
    this.form = this.fb.group({
      descripcion: [gasto.descripcion, [Validators.required]],
      valor: [gasto.valor, [Validators.required]],
    });
  }
  CreateGasto(index) {
    if (!this.posAdd) {
      this.posAdd = !this.posAdd;
      this.edit = index;
    } else {
      this.createForm(this.gastos[index]);
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
            this.gastos[index].descripcion = '';
            this.gastos[index].valor = '';
            this.edit = -1;
            this.posAdd = false;
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
            let idSucursal = localStorage.getItem('sucursalId');
            let idEmpresa = localStorage.getItem('empresaId');
            Swal.fire({
              allowOutsideClick: false,
              icon: 'info',
              text: 'Espere por favor'
            });
            Swal.showLoading();
            const date = new Date();
            let valor = this.getNumber(this.gastos[index].valor)
            let fecha = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            let gasto = {
              'fecha': fecha,
              'descripcion': this.gastos[index].descripcion,
              'valor': valor
            }
            this.gastoService.createGasto(idEmpresa, idSucursal, gasto).subscribe(res => {
              Swal.close();
              Swal.fire('Gasto agregado', '', 'success');
              this.gastos.unshift(new GastosModel());
              this.edit = -1;
              this.posAdd = false;
            }, (err) => {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Se ha presentado un error inesperado'
              });
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
        } else if (result.isDenied) {
          this.gastos[index].descripcion = '';
          this.gastos[index].valor = '';
          this.edit = -1;
          this.posAdd = false;
        }
      });
    }
  }

  deleteGasto(index) {
    Swal.fire({
      title: '¿Desea eliminar el gasto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.helpers.validateIdEmpresa()) {
          let idEmpresa = localStorage.getItem('empresaId');
          Swal.fire({
            allowOutsideClick: false,
            icon: 'info',
            text: 'Espere por favor'
          });
          Swal.showLoading();
          this.gastoService.deleteGasto(idEmpresa, this.gastos[index].id).subscribe(res => {
            Swal.close();
            Swal.fire('Gasto eliminado', '', 'success');
            this.gastos.splice(index, 1);
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
        }
      }
    })
  }
}
