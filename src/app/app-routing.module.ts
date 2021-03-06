import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogginComponent } from './Pages/login/login.component';
import { HomeComponent } from './Pages/home/home.component';
import { FacturacionComponent } from './Pages/facturacion/facturacion.component';
import { ClientsComponent } from './Pages/clients/clients.component';
import { FacturasComponent } from './Pages/facturas/facturas.component';
import { ReportComponent } from './Pages/report/report.component';
import { InventoryComponent } from './Pages/inventory/inventory.component';
import { SaldosComponent } from './Pages/saldos/saldos.component';
import { AbonosComponent } from './Components/Balance/abonos/abonos.component';
import { SaldoAbonoComponent } from './Components/Balance/saldo-abono/saldo-abono.component';
import { GastosComponent } from './Pages/gastos/gastos.component';
import { InventarioNewComponent } from './Components/inventario/inventario-new/inventario-new.component';
import { InventarioComponent } from './Components/inventario/inventario-table/inventario.component';
import { OrderComponent } from './Components/templates/order/order.component';

const routes: Routes = [
  { path: '', component: LogginComponent },
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'facturas', component: FacturasComponent },
      { path: 'reports', component: ReportComponent },
      {
        path: 'inventario', component: InventoryComponent, children: [
          { path: '', component: InventarioComponent },
          { path: 'update', component: InventarioNewComponent }
        ]
      },
      {
        path: 'saldos', component: SaldosComponent, children: [
          { path: 'abonos', component: AbonosComponent },
          { path: 'abonar', component: SaldoAbonoComponent },
        ]
      },
      { path: 'gastos', component: GastosComponent },
      { path: 'test', component: OrderComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }





