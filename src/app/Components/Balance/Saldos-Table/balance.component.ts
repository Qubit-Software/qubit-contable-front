import { Component, OnInit } from '@angular/core';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { SaldoModel } from 'src/app/Models/Saldos';
import { SaldosApartadosService } from 'src/app/Services/saldos-apartados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {


  //*************************** testing only ***********************************
  faPlus = faPlus;
  faSearch = faSearch;
  saldos: SaldoModel[] = new Array();
  totalSaldos: number = 0;
  searchText: string;
  page: number = 1;

  constructor(private saldosService: SaldosApartadosService, private helpers: HelperFunctionsService) { }

  ngOnInit(): void {
    this.getSaldos();
  }
  getSaldos() {
    if (this.helpers.validateIdEmpresa()) {
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor'
      });
      Swal.showLoading();
      let idSucursal = localStorage.getItem('sucursalId');
      this.saldosService.getSaldosBySucursal(idSucursal).subscribe(res => {
        res['saldosApartados'].forEach(element => {
          let saldo = new SaldoModel();
          saldo.id = element['id'];
          saldo.fecha = element['fecha'];
          saldo.cliente = element['consumidore']['nombre'];
          saldo.total = element['total'];
          saldo.abono = element['abonosCount'];
          saldo.saldo = element['saldo'];
          saldo.tipo = element['tipo'];
          this.totalSaldos = (+saldo.saldo) + this.totalSaldos;
          this.saldos.push(saldo);
        });
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
    }
  }
  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("inventarioModal").style.display = "block"
    document.getElementById("inventarioModal").className += "show"
  }
}
