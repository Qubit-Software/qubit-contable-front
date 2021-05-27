import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { FilterPipe } from 'src/app/Pipes/filter.pipe';
import { ConsumidorService } from 'src/app/Services/consumidor.service';
import Swal from 'sweetalert2';
import { ConsumidorModel } from '../../../Models/Consumidor';

@Component({
  selector: 'app-client-table',
  templateUrl: './client-table.component.html',
  styleUrls: ['./client-table.component.css']
})
export class ClientTableComponent implements OnInit {


  //*************************** testing only ***********************************

  consumidores: ConsumidorModel[];
  searchText: string;
  form: FormGroup;
  page: number = 1;
  edit: number = -1;
  editIcon = '../../../../assets/images/iconos/edit-button.png';
  checkIcon = '../../../../assets/images/iconos/checked.png';
  constructor(private consumidorService: ConsumidorService, private fb: FormBuilder, private helpers: HelperFunctionsService) { }

  ngOnInit(): void {
    this.getConsumidores();
  }

  getConsumidores() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    if (this.helpers.validateIdEmpresa()) {
      let idEmpresa = localStorage.getItem('empresaId');
      this.consumidorService.getAll(idEmpresa).subscribe(res => {
        this.consumidores = res['consumidores'];
        Swal.close();
      }, (err) => {
        this.consumidores = new Array();
        Swal.close();
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


  disabledEdit(index) {
    this.edit = index;
  }

  updateConsumidor(index) {
    this.createForm(this.consumidores[index]);
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
          this.getConsumidores();
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
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor'
        });
        Swal.showLoading();
        this.consumidorService.updateCliente(this.consumidores[index]).subscribe(res => {
          Swal.close();
          Swal.fire('Cliente actualizado', '', 'success')
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
      } else if (result.isDenied) {
        this.getConsumidores();
        this.edit = -1;
      }
    })
  }
  createForm(consumidor: ConsumidorModel) {
    this.form = this.fb.group({
      nombre: [consumidor.nombre, [Validators.required]],
      correo: [consumidor.correo, [Validators.required, Validators.email]],
      telefono: [consumidor.telefono, [Validators.required]],
      cedula: [consumidor.cedula, [Validators.required,]],
      direccion: [consumidor.direccion, [Validators.required,]],
      ciudad: [consumidor.ciudad, [Validators.required]],
    });
  }
  deleteConsumidor(index) {
    Swal.fire({
      title: '¿Desea eliminar el cliente?',
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
        this.consumidorService.deleteOne(this.consumidores[index].id).subscribe(res => {
          Swal.close();
          Swal.fire('Cliente eliminado', '', 'success');
          this.consumidores.splice(index, 1);
        }, (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha presentado un error inesperado'
          });
          console.log(err);
        });
      }
    })
  }
}
