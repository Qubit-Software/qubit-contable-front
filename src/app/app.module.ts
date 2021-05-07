import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './Components/nav-menu/nav-menu.component';
import { LogginComponent } from './Pages/login/login.component';
import { HomeComponent } from './Pages/home/home.component';
import { FacturacionComponent } from './Pages/facturacion/facturacion.component';
import { ClientesComponent } from './Components/clientes/clientes/clientes.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FacturaProductoComponent } from './Components/factura/factura-producto/factura-producto.component';
import { ClientsComponent } from './Pages/clients/clients.component';
import { ClientTableComponent } from './Components/clientes/client-table/client-table.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportsComponent } from './Components/Reports/reports/reports.component';
import { ChartsModule } from 'ng2-charts';
import { BalanceComponent } from './Components/Balance/balance/balance.component';
import { FilterPipe } from './Pipes/filter.pipe';
import { UniquePipe } from './Pipes/unique.pipe';
import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { InventarioComponent } from './Components/inventario/inventario-table/inventario.component';
import { InventarioModalComponent } from './Components/inventario/inventario-modal/inventario-modal.component';
import { FacturaTableComponent } from './Components/factura/factura-table/factura-table.component';
import { FacturasComponent } from './Pages/facturas/facturas.component';
import { ReportComponent } from './Pages/report/report.component';
import { InventoryComponent } from './Pages/inventory/inventory.component';
import { ProfileInfoComponent } from './Components/user/profile-info/profile-info.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    LogginComponent,
    HomeComponent,
    FacturacionComponent,
    ClientesComponent,
    FacturaProductoComponent,
    ClientsComponent,
    FilterPipe,
    UniquePipe,
    ClientTableComponent,
    ReportsComponent,
    BalanceComponent,
    FacturasComponent,
    ReportComponent,
    InventoryComponent,
    InventarioComponent,
    InventarioModalComponent,
    FacturaTableComponent,
    ProfileInfoComponent,],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    NgxPaginationModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }