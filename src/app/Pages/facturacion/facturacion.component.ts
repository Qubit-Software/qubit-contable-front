import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  templateParent = true;
  typeFacturacion: string[] = new Array();
  constructor() {
  }

  ngOnInit(): void {
    this.getTypes();
  }
  getTypes(){
    this.typeFacturacion[0]='Facturacion';
    this.typeFacturacion[1]='Apartado';
    this.typeFacturacion[2]='Credito';
  }
  change(i) {
    [this.typeFacturacion[0], this.typeFacturacion[i]] = [this.typeFacturacion[i], this.typeFacturacion[0]];
    
  }
}
