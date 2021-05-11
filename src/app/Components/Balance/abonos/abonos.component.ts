import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbonoModel } from 'src/app/Models/Abonos';
import { SaldosApartadosService } from 'src/app/Services/saldos-apartados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-abonos',
  templateUrl: './abonos.component.html',
  styleUrls: ['./abonos.component.css']
})
export class AbonosComponent implements OnInit {

  abonos: AbonoModel[] = new Array();
  page: number = 1;
  constructor(private router: Router, private route: ActivatedRoute, private saldosService: SaldosApartadosService) { }

  ngOnInit(): void {
    let idSaldo = 0;
    let total = 0;
    if (history.state.idSaldo != null) {
      idSaldo = history.state.idSaldo;
      total = history.state.total;
    }
    this.getAbonos(idSaldo, total);
  }
  getAbonos(id, total) {
    if (id != 0) {
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor'
      });
      this.saldosService.getAbonosById(id).subscribe(res => {
        let saldo = total;
        res['abonos'].forEach(element => {
          let abono = new AbonoModel();
          abono.id = element['id'];
          abono.fecha = element['fecha'];
          abono.total = total;
          abono.abono = element['abono']
          saldo = saldo - (+abono.abono);
          abono.saldo = saldo;
          abono.tipo = element['tipopago'];
          this.abonos.push(abono);
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
      this.closeModal();
    }
  }
  closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("inventarioModal").style.display = "none"
    document.getElementById("inventarioModal").className += document.getElementById("inventarioModal").className.replace("show", "")
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
