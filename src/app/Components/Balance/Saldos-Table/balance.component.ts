import { Component, OnInit } from '@angular/core';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { HelperFunctionsService } from 'src/app/Helpers/helper-functions.service';
import { SaldoModel } from 'src/app/Models/Saldos';
import { InventarioService } from 'src/app/Services/inventario.service';
import { PosService } from 'src/app/Services/pos.service';
import { SaldosApartadosService } from 'src/app/Services/saldos-apartados.service';
import { SucursalService } from 'src/app/Services/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {

  ivaPercent = 0.19;
  ivaPercent1 = 1.19;

  //*************************** testing only ***********************************
  faPlus = faPlus;
  faSearch = faSearch;
  saldos: SaldoModel[] = new Array();
  totalSaldos: number = 0;
  searchText: string;
  page: number = 1;
  headerPos: string = '';

  constructor(private saldosService: SaldosApartadosService, private helpers: HelperFunctionsService, private pos: PosService,
    private inventarioService: InventarioService, private sucursal: SucursalService) { }

  ngOnInit(): void {
    if (this.sucursal.empresa == null) {
      this.sucursal.getSucursalInfo().subscribe(res => {
        this.getSaldos();
        this.getHeaders();
      });
    } else {
      this.getSaldos();
      this.getHeaders();
    }
  }
  getHeaders() {
    if (this.helpers.validateIdEmpresa()) {
      let idSucursal = localStorage.getItem('sucursalId');
      this.inventarioService.getHeadersInventario(idSucursal).subscribe((res: any[]) => {
        this.headerPos = res['headers']['headerPos']
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
  getNumber(text) {
    if (typeof text != 'number') {
      return +(text.replace("$", "").replace(".", "").replace("$", "").replace(",", ""));
    } else {
      return text;
    }
  }
  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("inventarioModal").style.display = "block"
    document.getElementById("inventarioModal").className += "show"
  }

  printCopy(id) {
    if (this.helpers.validateIdEmpresa()) {
      let empresaId = localStorage.getItem('empresaId');
      this.saldosService.getInfoSaldosById(id, empresaId).subscribe((res) => {
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor'
        });
        Swal.showLoading();
        const date = new Date(res['saldo'].fecha);
        let fecha = `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let products: object[] = new Array();
        res['inventario'].forEach(element => {
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
        let total = res['saldo'].total;
        let iva =(total/this.ivaPercent1) * this.ivaPercent
        let subtotal = total - iva;
        let consumidor = res['saldo']['consumidore'].nombre
        let tipo = res['saldo'].tipo;
        let saldo = res['saldo'].saldo
        let abono = total - saldo
        this.pos.posSaldo(this.sucursal.empresa.nit, this.sucursal.empresa.telefono, this.sucursal.sucursal.direccion, this.sucursal.sucursal.ciudad,
          tipo, fecha, products, this.helpers.formatter.format(subtotal), this.helpers.formatter.format(iva), this.helpers.formatter.format(0), this.helpers.formatter.format(total),
          this.helpers.formatter.format(abono), this.helpers.formatter.format(saldo), this.helpers.formatter.format(0), this.helpers.formatter.format(0), consumidor).subscribe(res => {
            Swal.close();
            Swal.fire('Ticket impreso',
              'El ticket se ha dispensado con exito',
              'success');
          }, (err) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se encuentra la impresora conectada'
            });
            console.log(err);
          });
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
}
