import { Component, OnInit } from '@angular/core';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { ConsumidorService } from '../../../Services/consumidor.service';
import { ConsumidorModel } from '../../../Models/Consumidor';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrderService } from 'src/app/Services/order.service';
// import { ValidatorsFunctions } from 'src/app/helpers/validators';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  consumidor = new ConsumidorModel;
  newConsumidor = new ConsumidorModel;
  form: FormGroup;
  modal = document.getElementById('exampleModal');
  faPlus = faPlus;
  faSearch = faSearch;
  idEmpresa: string;

  constructor(private consumidorService: ConsumidorService, private fb: FormBuilder, private order: OrderService) {
    order.consumidor$.subscribe((newConsumidor: ConsumidorModel) => {
      this.consumidor = newConsumidor;
    });
  }

  ngOnInit(): void {
    // if (ValidatorsFunctions.validateIdEmpresa()) {
      this.idEmpresa = localStorage.getItem('empresaId');
    // }
    this.createForm();
    this.order.UpdateConsumidor(this.consumidor);
  }
  createForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      cedula: ['', [Validators.required,]],
      direccion: ['', [Validators.required,]],
      ciudad: ['', [Validators.required]],
    });
  }
  search() {
    if (this.consumidor.cedula == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Digita la cedula del cliente'
      });
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    this.consumidorService.findOne(this.consumidor.cedula, this.idEmpresa).subscribe(res => {
      this.consumidor = res['consumidor'];
      this.order.UpdateConsumidor(this.consumidor);
      Swal.close();
    }, (err) => {
      this.consumidor = new ConsumidorModel;
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err['error']['msg']
      });
      console.log(err);
    });
  }
  createCliente() {
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor verifica los datos'
      });
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor'
    });
    Swal.showLoading();
    this.newConsumidor = this.form.value;
    this.consumidorService.createConsumidor(this.newConsumidor, this.idEmpresa).subscribe(res => {
      console.log(res);
      this.consumidor = res['consumidor'];
      this.order.UpdateConsumidor(this.consumidor);
      Swal.close();
      Swal.fire({
        title: 'Registro realizado',
        icon: 'success',
        html: 'El cliente se ha registrado',
      });
      this.closeModal();
    }, (err) => {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La Cedula ya está registrada'
      });
      console.log(err);
    });
  }
  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").className += "show"
  }
  closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
  }

}
